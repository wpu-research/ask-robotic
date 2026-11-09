// Sınav oturumu ve öğrenci girişleri: veri erişimi + kurallar. Rotalar yalnız bunu çağırır (Db parametreli, testte PGlite).
import { createHash, randomBytes, randomInt } from 'node:crypto'
import { and, asc, eq, examAttempts, examSessions, inArray, sql, type Db } from '@ask/db'
import type { Circuit } from '@/lib/lab/contract'
import { isCircuit, normalizeCircuit } from '@/lib/lab/ops'
import { examProject, EXAM_PROJECTS } from './projects'
import { DEFINITION_BANK, MCQ_BANK } from './questions'

export type ExamSession = typeof examSessions.$inferSelect
export type ExamAttempt = typeof examAttempts.$inferSelect
export type ExamConfig = ExamSession['config']

export const DEFAULT_CONFIG: ExamConfig = { mcqCount: 10, mcqPoints: 3, definitionPoints: 10, projectPoints: 60 }
export const LIMITS = { code: 40_000, circuit: 200_000, definition: 6_000, graceMs: 90_000 }
export const EXAM_COOKIE = 'ask_exam'

const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
const hash = (t: string) => createHash('sha256').update(t).digest('hex')
const shuffle = <T>(a: T[]) => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = randomInt(i + 1); [r[i], r[j]] = [r[j], r[i]] } return r }

export class ExamError extends Error {
  constructor(public status: number, message: string) { super(message) }
}

// ---------------------------------------------------------------- öğretmen
export async function createSession(db: Db, input: { title: string; durationMin: number; config?: Partial<ExamConfig>; createdBy?: string }) {
  const config = { ...DEFAULT_CONFIG, ...input.config }
  config.mcqCount = Math.max(0, Math.min(MCQ_BANK.length, Math.round(config.mcqCount)))
  for (let i = 0; i < 5; i++) {
    const code = Array.from({ length: 6 }, () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]).join('')
    const rows = await db.insert(examSessions).values({ code, title: input.title, durationMin: input.durationMin, config, createdBy: input.createdBy })
      .onConflictDoNothing().returning()
    if (rows[0]) return rows[0]
  }
  throw new ExamError(500, 'Could not create a unique exam code')
}

export async function listSessions(db: Db) {
  return db.select().from(examSessions).orderBy(sql`${examSessions.createdAt} desc`)
}

export async function getSession(db: Db, id: string) {
  return (await db.select().from(examSessions).where(eq(examSessions.id, id)))[0] ?? null
}

export async function setSessionStatus(db: Db, id: string, status: 'draft' | 'open' | 'closed') {
  await db.update(examSessions).set({ status }).where(eq(examSessions.id, id))
  if (status === 'closed') {
    // Açık kalan tüm girişleri teslim et
    const open = await db.select({ id: examAttempts.id }).from(examAttempts)
      .where(and(eq(examAttempts.sessionId, id), sql`${examAttempts.submittedAt} is null`))
    for (const a of open) await finalize(db, a.id)
  }
}

export async function listAttempts(db: Db, sessionId: string) {
  return db.select().from(examAttempts).where(eq(examAttempts.sessionId, sessionId)).orderBy(asc(examAttempts.studentNo))
}

export async function getAttempt(db: Db, id: string) {
  return (await db.select().from(examAttempts).where(eq(examAttempts.id, id)))[0] ?? null
}

export async function allowRelogin(db: Db, attemptId: string) {
  await db.update(examAttempts).set({ allowRelogin: true, updatedAt: new Date() }).where(eq(examAttempts.id, attemptId))
}

/** Süre uzatma (dakika). Teslim edilmişse teslimi geri alır (öğrenci devam edebilsin). */
export async function extendAttempt(db: Db, attemptId: string, minutes: number) {
  const a = await getAttempt(db, attemptId)
  if (!a) throw new ExamError(404, 'Attempt not found')
  const base = Math.max(a.deadlineAt.getTime(), Date.now())
  await db.update(examAttempts).set({ deadlineAt: new Date(base + minutes * 60_000), submittedAt: null, gradeStatus: 'pending', updatedAt: new Date() })
    .where(eq(examAttempts.id, attemptId))
}

export async function setManual(db: Db, attemptId: string, input: { definitionScore?: number | null; teacherNote?: string | null; projectScore?: number | null }) {
  const set: Partial<ExamAttempt> = { updatedAt: new Date() }
  if (input.definitionScore !== undefined) set.definitionScore = input.definitionScore
  if (input.teacherNote !== undefined) set.teacherNote = input.teacherNote
  if (input.projectScore !== undefined) set.projectScore = input.projectScore
  await db.update(examAttempts).set(set).where(eq(examAttempts.id, attemptId))
}

export async function deleteAttempt(db: Db, attemptId: string) {
  await db.delete(examAttempts).where(eq(examAttempts.id, attemptId))
}

// ---------------------------------------------------------------- öğrenci
export interface StartInput { code: string; studentNo: string; studentName: string }

/** Girişi başlatır ya da sürdürür. Dönen `token` öğrenci çerezine yazılır. */
export async function startAttempt(db: Db, input: StartInput, cookieToken?: string | null) {
  const code = input.code.trim().toUpperCase()
  const session = (await db.select().from(examSessions).where(eq(examSessions.code, code)))[0]
  if (!session) throw new ExamError(404, 'Exam code not found')
  if (session.status !== 'open') throw new ExamError(403, session.status === 'closed' ? 'This exam is closed' : 'This exam has not started yet')

  const studentNo = input.studentNo.trim()
  const existing = (await db.select().from(examAttempts).where(and(eq(examAttempts.sessionId, session.id), eq(examAttempts.studentNo, studentNo))))[0]
  if (existing) {
    if (cookieToken && hash(cookieToken) === existing.tokenHash) return { attemptId: existing.id, token: cookieToken }
    if (existing.allowRelogin) {
      const token = randomBytes(24).toString('base64url')
      await db.update(examAttempts).set({ tokenHash: hash(token), allowRelogin: false, updatedAt: new Date() }).where(eq(examAttempts.id, existing.id))
      return { attemptId: existing.id, token }
    }
    if (existing.submittedAt) throw new ExamError(409, 'You have already submitted this exam')
    throw new ExamError(409, 'This student number already started the exam on another device. Ask the instructor to allow re-login.')
  }

  // Dengeli proje ataması: oturumda en az kullanılan projelerden rastgele biri
  const counts = new Map(EXAM_PROJECTS.map((p) => [p.id, 0]))
  const used = await db.select({ p: examAttempts.projectId, n: sql<number>`count(*)::int` }).from(examAttempts)
    .where(eq(examAttempts.sessionId, session.id)).groupBy(examAttempts.projectId)
  for (const u of used) if (counts.has(u.p)) counts.set(u.p, u.n)
  const min = Math.min(...counts.values())
  const pool = [...counts].filter(([, n]) => n === min).map(([id]) => id)
  if (!pool.length) throw new ExamError(500, 'No exam projects are configured')
  const projectId = pool[randomInt(pool.length)]

  // Çoktan seçmeli: haftalara dengeli dağıt (her haftadan sırayla), seçenek sırasını karıştır
  const byWeek = new Map<number, typeof MCQ_BANK>()
  for (const q of shuffle(MCQ_BANK)) byWeek.set(q.week, [...(byWeek.get(q.week) ?? []), q])
  const picked: string[] = []
  const weeks = shuffle([...byWeek.keys()])
  while (picked.length < session.config.mcqCount && weeks.some((w) => byWeek.get(w)!.length)) {
    for (const w of weeks) { const q = byWeek.get(w)!.shift(); if (q && picked.length < session.config.mcqCount) picked.push(q.id) }
  }
  const mcq = shuffle(picked).map((id) => ({ id, order: shuffle([0, 1, 2, 3].slice(0, MCQ_BANK.find((q) => q.id === id)!.options.length)) }))
  const definitionId = DEFINITION_BANK[randomInt(DEFINITION_BANK.length)].id

  const project = examProject(projectId)!
  const start = project.starter()
  const token = randomBytes(24).toString('base64url')
  const rows = await db.insert(examAttempts).values({
    sessionId: session.id, studentNo, studentName: input.studentName.trim(), tokenHash: hash(token),
    projectId, mcq, definitionId, answers: { mcq: {}, definition: '' },
    circuit: start.circuit, code: start.code,
    deadlineAt: new Date(Date.now() + session.durationMin * 60_000),
    flags: { blur: 0, pastes: 0 },
  }).onConflictDoNothing().returning({ id: examAttempts.id })
  if (!rows[0]) throw new ExamError(409, 'This student number already started the exam')
  return { attemptId: rows[0].id, token }
}

export async function attemptByToken(db: Db, token: string | null | undefined) {
  if (!token) return null
  return (await db.select().from(examAttempts).where(eq(examAttempts.tokenHash, hash(token))))[0] ?? null
}

/** Öğrencinin gördüğü hâl: doğru cevaplar ve puanlama ayrıntıları YOK. */
export function studentView(a: ExamAttempt, session: ExamSession) {
  const project = examProject(a.projectId)!
  const def = DEFINITION_BANK.find((d) => d.id === a.definitionId)!
  return {
    attemptId: a.id,
    session: { title: session.title, config: session.config },
    student: { no: a.studentNo, name: a.studentName },
    deadlineAt: a.deadlineAt.toISOString(),
    submitted: !!a.submittedAt,
    mcq: a.mcq.map(({ id, order }) => {
      const q = MCQ_BANK.find((x) => x.id === id)!
      return { id, q: q.q, options: order.map((o) => ({ value: o, text: q.options[o] })) }
    }),
    definition: { id: def.id, term: def.term, prompt: def.prompt, points: session.config.definitionPoints },
    project: {
      id: project.id, title: project.title, story: project.story, brief: project.brief, allowedParts: project.allowedParts,
      requirements: project.goals.map((g) => ({ id: g.id, text: g.text, kind: g.kind, points: g.points })),
    },
    answers: a.answers,
    circuit: (a.circuit as Circuit | null) ?? project.starter().circuit,
    code: a.code ?? project.starter().code,
  }
}
export type StudentView = ReturnType<typeof studentView>

export interface SaveInput {
  mcq?: Record<string, number>
  definition?: string
  circuit?: unknown
  code?: string
  /** İstemcinin son kayıttan beri saydığı olaylar (eklenir). */
  blur?: number
  pastes?: number
}

const isOver = (a: ExamAttempt) => Date.now() > a.deadlineAt.getTime() + LIMITS.graceMs

export async function saveAttempt(db: Db, a: ExamAttempt, input: SaveInput) {
  if (a.submittedAt) throw new ExamError(409, 'Already submitted')
  if (isOver(a)) { await finalize(db, a.id); throw new ExamError(409, 'Time is up. Your last saved answers were submitted.') }
  const set: Partial<ExamAttempt> = { savedAt: new Date(), updatedAt: new Date() }
  const answers = { ...a.answers }
  if (input.mcq) {
    const allowed = new Set(a.mcq.map((m) => m.id))
    const mcq: Record<string, number> = { ...answers.mcq }
    for (const [k, v] of Object.entries(input.mcq)) if (allowed.has(k) && Number.isInteger(v) && v >= 0 && v < 4) mcq[k] = v
    answers.mcq = mcq
  }
  if (typeof input.definition === 'string') answers.definition = input.definition.slice(0, LIMITS.definition)
  set.answers = answers
  if (input.circuit !== undefined) {
    if (JSON.stringify(input.circuit).length > LIMITS.circuit || !isCircuit(input.circuit)) throw new ExamError(400, 'Invalid circuit')
    set.circuit = normalizeCircuit(input.circuit)
  }
  if (typeof input.code === 'string') {
    if (input.code.length > LIMITS.code) throw new ExamError(413, 'Code is too long')
    set.code = input.code
  }
  const add = (n: unknown) => (typeof n === 'number' && Number.isFinite(n) ? Math.max(0, Math.min(1000, Math.floor(n))) : 0)
  if (input.blur || input.pastes) set.flags = { blur: a.flags.blur + add(input.blur), pastes: a.flags.pastes + add(input.pastes) }
  await db.update(examAttempts).set(set).where(and(eq(examAttempts.id, a.id), sql`${examAttempts.submittedAt} is null`))
}

export async function submitAttempt(db: Db, a: ExamAttempt, input: SaveInput) {
  if (a.submittedAt) return
  if (!isOver(a)) await saveAttempt(db, a, input)
  await finalize(db, a.id)
}

/** Teslim: çoktan seçmeli puanı hemen hesaplanır, proje puanlaması kuyruğa girer. */
export async function finalize(db: Db, attemptId: string) {
  const a = await getAttempt(db, attemptId)
  if (!a || a.submittedAt) return
  const s = await getSession(db, a.sessionId)
  const pts = s?.config.mcqPoints ?? DEFAULT_CONFIG.mcqPoints
  let correct = 0
  for (const m of a.mcq) if (a.answers.mcq[m.id] === MCQ_BANK.find((q) => q.id === m.id)?.answer) correct++
  await db.update(examAttempts).set({ submittedAt: new Date(), mcqScore: correct * pts, gradeStatus: 'pending', updatedAt: new Date() })
    .where(and(eq(examAttempts.id, a.id), sql`${examAttempts.submittedAt} is null`))
  enqueueGrade(db, a.id)
}

// ---------------------------------------------------------------- proje puanlama kuyruğu (tek örnek, sıralı)
let chain: Promise<void> = Promise.resolve()
const queued = new Set<string>()
type Grader = (db: Db, attemptId: string) => Promise<void>
let grader: Grader | null = null
/** Puanlayıcı ayrı modülde (derleyici + benzetim); rotalar başlarken bağlar. Testler kendi puanlayıcısını verir. */
export const setGrader = (g: Grader | null) => { grader = g }

export function enqueueGrade(db: Db, attemptId: string) {
  if (!grader || queued.has(attemptId)) return
  queued.add(attemptId)
  const g = grader
  chain = chain.then(() => g(db, attemptId)).catch(() => {}).finally(() => { queued.delete(attemptId) })
}
export const gradingIdle = () => chain

/** Teslim edilmiş ama puanlanmamış girişleri (ör. sunucu yeniden başladıysa) kuyruğa alır. */
export async function enqueuePending(db: Db, sessionId: string) {
  const rows = await db.select({ id: examAttempts.id }).from(examAttempts).where(and(
    eq(examAttempts.sessionId, sessionId), sql`${examAttempts.submittedAt} is not null`, inArray(examAttempts.gradeStatus, ['pending', 'grading']),
  ))
  for (const r of rows) enqueueGrade(db, r.id)
}

export function totalScore(a: ExamAttempt, cfg: ExamConfig) {
  const project = a.projectScore == null ? null : Math.round((a.projectScore * cfg.projectPoints) / 100)
  const total = (a.mcqScore ?? 0) + (a.definitionScore ?? 0) + (project ?? 0)
  return { project, total, max: cfg.mcqCount * cfg.mcqPoints + cfg.definitionPoints + cfg.projectPoints }
}
