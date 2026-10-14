import { getDb } from '@/lib/db'
import { guardResponse, isUuid, requireClassStaff } from '@/lib/class-access'
import { createAssignment, deleteAssignment } from '@/lib/classroom'
import { bad, currentUserId, readJson } from '@/lib/teacher-page'

export const dynamic = 'force-dynamic'
type Ctx = { params: Promise<{ id: string }> }

const num = (v: unknown) => (v == null || v === '' ? null : Number(v))

// Ödev: { lessonId | weekId | moduleId (tam olarak biri), dueAt? }
export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params
  const db = getDb()
  const userId = await currentUserId()
  const g = await requireClassStaff(db, userId, id)
  if (!g.ok) return guardResponse(g)
  const body = await readJson(req)
  if (!body) return bad('JSON bekleniyor', 415)
  const r = await createAssignment(db, id, userId!, {
    lessonId: num(body.lessonId), weekId: num(body.weekId), moduleId: num(body.moduleId),
    dueAt: typeof body.dueAt === 'string' && body.dueAt ? body.dueAt : null,
  })
  return r.ok ? Response.json(r) : bad(r.error)
}

export async function DELETE(req: Request, { params }: Ctx) {
  const { id } = await params
  const db = getDb()
  const g = await requireClassStaff(db, await currentUserId(), id)
  if (!g.ok) return guardResponse(g)
  const body = await readJson(req)
  const aid = typeof body?.assignmentId === 'string' ? body.assignmentId : ''
  if (!isUuid(aid)) return bad('Ödev bulunamadı', 404)
  return (await deleteAssignment(db, id, aid)) ? Response.json({ ok: true }) : bad('Ödev bulunamadı', 404)
}
