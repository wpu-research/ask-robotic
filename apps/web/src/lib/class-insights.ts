// Öğretmen paneli görünümleri: ilerleme matrisi, "Kim takıldı?", beceri ısı haritası, AI sohbet kayıtları.
// Saf hesaplar (stuckStudents, skillHeatmap) ayrı; yükleyiciler DB'den toplar. Yetki: class-access.ts.
import { and, events, eq, inArray, lessons, progress, sql, tutorMessages, users, xpEvents, type Db } from '@ask/db'
import { classStudents, listAssignments, type AssignmentView, type ClassStudent } from './classroom'
import { answerRecords } from './quiz'
import { computeMastery, type SkillMastery } from './skills'
import type { AppEvent } from './events-core'
import { tsz } from './sql-time'

// ---- İlerleme matrisi ----

export interface ProgressMatrix {
  students: ClassStudent[]
  assignments: AssignmentView[]
  /** cells[studentId][assignmentId] = tamamlanan / toplam ders */
  cells: Record<string, Record<string, { done: number; total: number }>>
  lastActivity: Record<string, Date | null>
}

export async function loadProgressMatrix(db: Db, classId: string): Promise<ProgressMatrix> {
  const [students, asg] = await Promise.all([classStudents(db, classId), listAssignments(db, classId)])
  const sids = students.map((s) => s.id)
  const allLessons = [...new Set(asg.flatMap((a) => a.lessonIds))]
  const done = sids.length && allLessons.length
    ? await db.select({ u: progress.userId, l: progress.lessonId }).from(progress)
      .where(and(inArray(progress.userId, sids), inArray(progress.lessonId, allLessons), eq(progress.status, 'completed')))
    : []
  const doneSet = new Set(done.map((d) => `${d.u}:${d.l}`))
  const cells: ProgressMatrix['cells'] = {}
  for (const s of students) {
    cells[s.id] = {}
    for (const a of asg) cells[s.id][a.id] = { done: a.lessonIds.filter((l) => doneSet.has(`${s.id}:${l}`)).length, total: a.lessonIds.length }
  }
  return { students, assignments: asg, cells, lastActivity: await lastActivity(db, sids) }
}

/** Kullanıcı başına son etkinlik: ilerleme, olay ya da XP kaydının en yenisi. */
export async function lastActivity(db: Db, userIds: string[]): Promise<Record<string, Date | null>> {
  const out: Record<string, Date | null> = Object.fromEntries(userIds.map((u) => [u, null]))
  if (!userIds.length) return out
  const [p, e, x] = await Promise.all([
    db.select({ u: progress.userId, t: sql<string>`max(greatest(${progress.startedAt}, coalesce(${progress.completedAt}, ${progress.startedAt})))` })
      .from(progress).where(inArray(progress.userId, userIds)).groupBy(progress.userId),
    db.select({ u: events.userId, t: sql<string>`max(${events.ts})` }).from(events).where(inArray(events.userId, userIds)).groupBy(events.userId),
    db.select({ u: xpEvents.userId, t: sql<string>`max(${xpEvents.at})` }).from(xpEvents).where(inArray(xpEvents.userId, userIds)).groupBy(xpEvents.userId),
  ])
  for (const r of [...p, ...e, ...x]) {
    if (!r.u || !r.t) continue
    const t = new Date(r.t)
    const cur = out[r.u]
    if (!cur || t > cur) out[r.u] = t
  }
  return out
}

// ---- Kim takıldı? ----

/** Yanlış cevap sayımı için pencere ve eşik; "durdu" için süre. */
export const STUCK_WINDOW_MS = 60 * 60_000
export const STUCK_WRONG_MIN = 3
export const STUCK_IDLE_MS = 15 * 60_000

export interface StuckInput {
  now: Date
  students: { id: string; name: string }[]
  /** Pencere içindeki yanlış cevaplar (quiz_answer, ok=false) */
  wrongAnswers: { userId: string; lessonId: number | null; ts: Date }[]
  /** Güncel ödev (yoksa yalnız yanlış cevap kuralı çalışır) */
  current: { lessonIds: number[] } | null
  /** Güncel ödevin derslerinde son etkinlik (olay ya da ilerleme), öğrenci başına */
  lastOnCurrent: Record<string, Date | null>
  /** Güncel ödevi bitirenler */
  completedCurrent: Set<string>
}

export interface StuckStudent { id: string; name: string; reasons: ('wrong' | 'idle')[]; wrong: number; lastOnCurrent: Date | null }

/**
 * "Kim takıldı?":
 * - wrong: son 60 dk'da ≥ 3 yanlış cevap;
 * - idle: güncel ödevi bitirmemiş ve son 15 dk'da o ödevde hiçbir ilerlemesi yok. Yalnız sınıf o ödev üzerinde
 *   çalışırken (son 15 dk'da en az bir öğrenci etkin) hesaplanır; ders dışı saatlerde herkesi işaretlemesin diye.
 */
export function stuckStudents(input: StuckInput): StuckStudent[] {
  const { now } = input
  const from = now.getTime() - STUCK_WINDOW_MS
  const wrong = new Map<string, number>()
  for (const w of input.wrongAnswers) {
    if (w.ts.getTime() < from || w.ts > now) continue
    wrong.set(w.userId, (wrong.get(w.userId) ?? 0) + 1)
  }
  const idleCut = now.getTime() - STUCK_IDLE_MS
  const recent = (d: Date | null | undefined) => !!d && d.getTime() >= idleCut && d <= now
  const classWorking = !!input.current && input.students.some((s) => recent(input.lastOnCurrent[s.id]))
  const out: StuckStudent[] = []
  for (const s of input.students) {
    const reasons: StuckStudent['reasons'] = []
    const n = wrong.get(s.id) ?? 0
    if (n >= STUCK_WRONG_MIN) reasons.push('wrong')
    const last = input.lastOnCurrent[s.id] ?? null
    if (classWorking && !input.completedCurrent.has(s.id) && !recent(last)) reasons.push('idle')
    if (reasons.length) out.push({ id: s.id, name: s.name, reasons, wrong: n, lastOnCurrent: last })
  }
  return out.sort((a, b) => b.wrong - a.wrong || a.name.localeCompare(b.name, 'tr'))
}

/** Güncel ödev: teslimi geçmemiş (ya da teslim tarihsiz) en yeni ödev. */
export function currentAssignment(asg: AssignmentView[], now: Date): AssignmentView | null {
  return asg.find((a) => !a.dueAt || a.dueAt >= now) ?? null
}

export async function loadStuck(db: Db, classId: string, now = new Date()) {
  const [students, asg] = await Promise.all([classStudents(db, classId), listAssignments(db, classId)])
  const sids = students.map((s) => s.id)
  const cur = currentAssignment(asg, now)
  if (!sids.length) return { current: cur, stuck: [] as StuckStudent[] }
  const from = new Date(now.getTime() - STUCK_WINDOW_MS)
  const wrongRows = await db.select({ userId: events.userId, lessonId: events.lessonId, ts: events.ts }).from(events)
    .where(and(inArray(events.userId, sids), eq(events.type, 'quiz_answer'), sql`${events.ts} >= ${tsz(from)}`, sql`(${events.payload}->>'ok') = 'false'`))
  const lastOnCurrent: Record<string, Date | null> = {}
  const completedCurrent = new Set<string>()
  if (cur?.lessonIds.length) {
    const [ev, pr] = await Promise.all([
      db.select({ u: events.userId, t: sql<string>`max(${events.ts})` }).from(events)
        .where(and(inArray(events.userId, sids), inArray(events.lessonId, cur.lessonIds))).groupBy(events.userId),
      db.select({ u: progress.userId, l: progress.lessonId, s: progress.status, t: sql<string>`greatest(${progress.startedAt}, coalesce(${progress.completedAt}, ${progress.startedAt}))` })
        .from(progress).where(and(inArray(progress.userId, sids), inArray(progress.lessonId, cur.lessonIds))),
    ])
    const bump = (u: string | null, t: string | null) => {
      if (!u || !t) return
      const d = new Date(t)
      if (!lastOnCurrent[u] || d > lastOnCurrent[u]!) lastOnCurrent[u] = d
    }
    for (const r of ev) bump(r.u, r.t)
    const doneCount = new Map<string, number>()
    for (const r of pr) {
      bump(r.u, r.t)
      if (r.s === 'completed') doneCount.set(r.u, (doneCount.get(r.u) ?? 0) + 1)
    }
    for (const [u, n] of doneCount) if (n >= cur.lessonIds.length) completedCurrent.add(u)
  }
  const stuck = stuckStudents({
    now, students, current: cur, lastOnCurrent, completedCurrent,
    wrongAnswers: wrongRows.filter((r) => r.userId).map((r) => ({ userId: r.userId!, lessonId: r.lessonId, ts: r.ts })),
  })
  return { current: cur, stuck }
}

// ---- Beceri ısı haritası ----

export interface AnswerEventRow { userId: string; lessonId: number | null; ts: Date; payload: Record<string, unknown> | null }

export interface SkillHeatmap {
  /** En az bir cevabı olan beceriler (sınıf ortalaması düşükten yükseğe) */
  skills: string[]
  /** byUser[userId][skill] — cevabı olmayan beceri yok */
  byUser: Record<string, Record<string, SkillMastery>>
  /** Beceri başına: cevabı olan öğrencilerin ortalama puanı, toplam cevap, öğrenci sayısı */
  classAvg: Record<string, { score: number; attempts: number; students: number }>
}

/** quiz_answer olaylarından öğrenci × beceri ustalığı (computeMastery; öğrenci başına ayrı). */
export function skillHeatmap(rows: readonly AnswerEventRow[]): SkillHeatmap {
  const perUser = new Map<string, AppEvent[]>()
  for (const r of rows) {
    const p = r.payload ?? {}
    const ev: AppEvent = {
      t: r.ts.getTime(), type: 'quiz_answer', lessonId: r.lessonId ?? undefined,
      p: { q: String(p.q ?? ''), ok: p.ok === true, sk: String(p.sk ?? '') },
    }
    if (!perUser.has(r.userId)) perUser.set(r.userId, [])
    perUser.get(r.userId)!.push(ev)
  }
  const byUser: SkillHeatmap['byUser'] = {}
  const agg = new Map<string, { sum: number; attempts: number; students: number }>()
  for (const [u, evs] of perUser) {
    const recs = answerRecords(evs)
    const skills = [...new Set(recs.flatMap((r) => r.skills))]
    byUser[u] = {}
    for (const m of computeMastery(recs, skills)) {
      if (!m.attempts) continue
      byUser[u][m.skill] = m
      const a = agg.get(m.skill) ?? { sum: 0, attempts: 0, students: 0 }
      a.sum += m.score; a.attempts += m.attempts; a.students += 1
      agg.set(m.skill, a)
    }
  }
  const classAvg: SkillHeatmap['classAvg'] = {}
  for (const [k, a] of agg) classAvg[k] = { score: a.sum / a.students, attempts: a.attempts, students: a.students }
  const skills = [...agg.keys()].sort((a, b) => classAvg[a].score - classAvg[b].score || a.localeCompare(b))
  return { skills, byUser, classAvg }
}

export async function loadSkillHeatmap(db: Db, classId: string) {
  const students = await classStudents(db, classId)
  if (!students.length) return { students, map: skillHeatmap([]) }
  const rows = await db.select({ userId: events.userId, lessonId: events.lessonId, ts: events.ts, payload: events.payload }).from(events)
    .where(and(inArray(events.userId, students.map((s) => s.id)), eq(events.type, 'quiz_answer')))
  return { students, map: skillHeatmap(rows.filter((r) => r.userId).map((r) => ({ ...r, userId: r.userId! }))) }
}

// ---- AI sohbetleri (salt okunur) ----

export interface TutorMessageView { id: number; userId: string; studentName: string; lessonId: number | null; lessonTitle: string | null; role: string; content: string; flag: string | null; createdAt: Date }

/** Sınıf öğrencilerinin AI öğretmen mesajları, yeni önce. `studentId` verilirse yalnız o öğrenci (sınıfta değilse boş). */
export async function loadTutorMessages(db: Db, classId: string, opts: { studentId?: string; limit?: number } = {}): Promise<TutorMessageView[]> {
  const students = await classStudents(db, classId)
  let ids = students.map((s) => s.id)
  if (opts.studentId) ids = ids.filter((i) => i === opts.studentId)
  if (!ids.length) return []
  const rows = await db
    .select({
      id: tutorMessages.id, userId: tutorMessages.userId, studentName: users.name, lessonId: tutorMessages.lessonId, lessonTitle: lessons.title,
      role: tutorMessages.role, content: tutorMessages.content, flag: tutorMessages.flag, createdAt: tutorMessages.createdAt,
    })
    .from(tutorMessages)
    .innerJoin(users, eq(users.id, tutorMessages.userId))
    .leftJoin(lessons, eq(lessons.id, tutorMessages.lessonId))
    .where(inArray(tutorMessages.userId, ids))
    .orderBy(sql`${tutorMessages.createdAt} desc, ${tutorMessages.id} desc`)
    .limit(Math.min(opts.limit ?? 200, 500))
  return rows.map((r) => ({ ...r, userId: r.userId! }))
}
