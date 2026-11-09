import { getDb } from '@/lib/db'
import { body, handle, ok, fail, requireAdmin } from '@/lib/sinav/http'
import { DEFINITION_BANK, MCQ_BANK } from '@/lib/sinav/questions'
import { examProject } from '@/lib/sinav/projects'
import { allowRelogin, deleteAttempt, enqueueGrade, extendAttempt, finalize, getAttempt, getSession, setManual, totalScore } from '@/lib/sinav/service'
import { examAttempts, eq } from '@ask/db'

export const dynamic = 'force-dynamic'
type Ctx = { params: Promise<{ id: string }> }

/** Bir girişin tüm ayrıntısı (doğru cevaplar ve puanlama dahil). */
export async function GET(_req: Request, { params }: Ctx) {
  return handle(async () => {
    await requireAdmin()
    const { id } = await params
    const db = getDb()
    const a = await getAttempt(db, id)
    if (!a) return fail(404, 'Not found')
    const s = (await getSession(db, a.sessionId))!
    const p = examProject(a.projectId)
    const { tokenHash: _t, ...rest } = a
    return ok({
      attempt: rest, session: s, ...totalScore(a, s.config),
      mcq: a.mcq.map(({ id: qid }) => {
        const q = MCQ_BANK.find((x) => x.id === qid)!
        return { id: qid, week: q.week, q: q.q, options: q.options, answer: q.answer, why: q.why, given: a.answers.mcq[qid] ?? null }
      }),
      definition: DEFINITION_BANK.find((d) => d.id === a.definitionId) ?? null,
      projectInfo: p ? { id: p.id, title: p.title, story: p.story, brief: p.brief, allowedParts: p.allowedParts, goals: p.goals.map(({ check: _c, ...g }) => g) } : null,
    })
  })
}

/** Elle puan: tanım sorusu, not, gerekirse proje puanını düzeltme (0-100). */
export async function PATCH(req: Request, { params }: Ctx) {
  return handle(async () => {
    await requireAdmin()
    const { id } = await params
    const b = await body(req)
    const db = getDb()
    const a = await getAttempt(db, id)
    if (!a) return fail(404, 'Not found')
    const s = (await getSession(db, a.sessionId))!
    const score = (v: unknown, max: number) => (v === null ? null : typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= max ? v : undefined)
    const definitionScore = 'definitionScore' in b ? score(b.definitionScore, s.config.definitionPoints) : undefined
    const projectScore = 'projectScore' in b ? score(b.projectScore, 100) : undefined
    if ('definitionScore' in b && definitionScore === undefined) return fail(400, `Definition score must be 0-${s.config.definitionPoints}`)
    if ('projectScore' in b && projectScore === undefined) return fail(400, 'Project score must be 0-100')
    const teacherNote = typeof b.teacherNote === 'string' ? b.teacherNote.slice(0, 2000) : undefined
    await setManual(db, id, { definitionScore, projectScore, teacherNote })
    return ok({ ok: true })
  })
}

/** İşlemler: relogin | extend (dakika) | submit | regrade */
export async function POST(req: Request, { params }: Ctx) {
  return handle(async () => {
    await requireAdmin()
    const { id } = await params
    const b = await body(req)
    const db = getDb()
    if (!(await getAttempt(db, id))) return fail(404, 'Not found')
    switch (b.action) {
      case 'relogin': await allowRelogin(db, id); break
      case 'extend': {
        const m = Number(b.minutes)
        if (!Number.isInteger(m) || m < 1 || m > 120) return fail(400, 'Minutes must be 1-120')
        await extendAttempt(db, id, m); break
      }
      case 'submit': await finalize(db, id); break
      case 'regrade':
        await db.update(examAttempts).set({ gradeStatus: 'pending' }).where(eq(examAttempts.id, id))
        enqueueGrade(db, id); break
      default: return fail(400, 'Unknown action')
    }
    return ok({ ok: true })
  })
}

export async function DELETE(_req: Request, { params }: Ctx) {
  return handle(async () => {
    await requireAdmin()
    const { id } = await params
    await deleteAttempt(getDb(), id)
    return ok({ ok: true })
  })
}
