import { getDb } from '@/lib/db'
import { ADMIN_ROLES, guardResponse, requireOrgStaff } from '@/lib/class-access'
import { createClass, validateClassInput } from '@/lib/classroom'
import { updateOrgSettings } from '@/lib/org-settings'
import { bad, currentUserId, readJson } from '@/lib/teacher-page'

export const dynamic = 'force-dynamic'
type Ctx = { params: Promise<{ orgId: string }> }

// Okul ayarları (yalnız sahip/yönetici): { aiTutor?, leagues? }
export async function PATCH(req: Request, { params }: Ctx) {
  const { orgId } = await params
  const db = getDb()
  const g = await requireOrgStaff(db, await currentUserId(), orgId, ADMIN_ROLES)
  if (!g.ok) return guardResponse(g)
  const body = await readJson(req)
  if (!body) return bad('JSON bekleniyor', 415)
  const patch: { aiTutor?: boolean; leagues?: boolean } = {}
  if (typeof body.aiTutor === 'boolean') patch.aiTutor = body.aiTutor
  if (typeof body.leagues === 'boolean') patch.leagues = body.leagues
  return Response.json({ ok: true, settings: await updateOrgSettings(db, orgId, patch) })
}

// Yeni sınıf (okulun öğretmeni/yöneticisi/sahibi)
export async function POST(req: Request, { params }: Ctx) {
  const { orgId } = await params
  const db = getDb()
  const userId = await currentUserId()
  const g = await requireOrgStaff(db, userId, orgId)
  if (!g.ok) return guardResponse(g)
  const input = validateClassInput(await readJson(req))
  if (!input) return bad('Sınıf adı (1-40 karakter) ve düzeyi (0-12) geçersiz')
  const cls = await createClass(db, orgId, userId!, input)
  return Response.json({ ok: true, classId: cls.id })
}
