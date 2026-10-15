import { getDb } from '@/lib/db'
import { guardResponse, requireClassStaff } from '@/lib/class-access'
import { createWeeklyPlan } from '@/lib/classroom'
import { bad, currentUserId, readJson } from '@/lib/teacher-page'

export const dynamic = 'force-dynamic'
type Ctx = { params: Promise<{ id: string }> }

// Haftalık plan: { moduleId, firstDue (ISO), everyWeeks (1-4) }
export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params
  const db = getDb()
  const userId = await currentUserId()
  const g = await requireClassStaff(db, userId, id)
  if (!g.ok) return guardResponse(g)
  const body = await readJson(req)
  if (!body) return bad('JSON bekleniyor', 415)
  const r = await createWeeklyPlan(db, id, userId!, {
    moduleId: Number(body.moduleId),
    firstDue: typeof body.firstDue === 'string' ? body.firstDue : '',
    everyWeeks: Number(body.everyWeeks),
  })
  return r.ok ? Response.json(r) : bad(r.error)
}
