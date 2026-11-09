import { getDb } from '@/lib/db'
import { body, handle, ok, fail, requireAdmin } from '@/lib/sinav/http'
import { enqueuePending, getSession, listAttempts, setSessionStatus, totalScore } from '@/lib/sinav/service'

export const dynamic = 'force-dynamic'
type Ctx = { params: Promise<{ id: string }> }

/** Oturum + girişlerin özeti (canlı izleme). */
export async function GET(_req: Request, { params }: Ctx) {
  return handle(async () => {
    await requireAdmin()
    const { id } = await params
    const db = getDb()
    const s = await getSession(db, id)
    if (!s) return fail(404, 'Not found')
    await enqueuePending(db, id)
    const attempts = (await listAttempts(db, id)).map((a) => ({
      id: a.id, studentNo: a.studentNo, studentName: a.studentName, projectId: a.projectId,
      startedAt: a.startedAt, savedAt: a.savedAt, submittedAt: a.submittedAt, deadlineAt: a.deadlineAt,
      flags: a.flags, gradeStatus: a.gradeStatus, mcqScore: a.mcqScore, definitionScore: a.definitionScore,
      projectScore: a.projectScore, allowRelogin: a.allowRelogin,
      answered: Object.keys(a.answers.mcq).length, definitionChars: a.answers.definition.length,
      ...totalScore(a, s.config),
    }))
    return ok({ session: s, attempts, now: new Date() })
  })
}

/** Durum: draft | open | closed (kapatınca açık girişler teslim edilir). */
export async function PATCH(req: Request, { params }: Ctx) {
  return handle(async () => {
    await requireAdmin()
    const { id } = await params
    const b = await body(req)
    if (b.status !== 'draft' && b.status !== 'open' && b.status !== 'closed') return fail(400, 'Invalid status')
    await setSessionStatus(getDb(), id, b.status)
    return ok({ ok: true })
  })
}
