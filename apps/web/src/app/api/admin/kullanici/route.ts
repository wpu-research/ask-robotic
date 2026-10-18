import { getDb } from '@/lib/db'
import { isJson } from '@/lib/auth/http'
import { getAdminUser } from '@/lib/auth/admin'
import { createUserByAdmin, editUserByAdmin } from '@/lib/membership'

export const dynamic = 'force-dynamic'

/** Admin hesap açar; parola boşsa üretilir ve yanıtta bir kez döner. */
export async function POST(req: Request) {
  if (!isJson(req)) return Response.json({ error: 'JSON bekleniyor' }, { status: 415 })
  if (!(await getAdminUser())) return Response.json({ error: 'Yetki yok' }, { status: 403 })
  const r = await createUserByAdmin(getDb(), await req.json().catch(() => null))
  if (!r.ok) return Response.json({ error: r.message, code: r.code }, { status: r.code === 'taken' ? 409 : 400 })
  return Response.json({ ok: true, user: r.user, password: r.password }, { status: 201 })
}

const EDIT_STATUS = { invalid_input: 400, self_demote: 400, not_found: 404, taken: 409 } as const

/** Admin ad, e-posta, kullanıcı adı ve rolü değiştirir; kendi admin rolünü kaldıramaz. */
export async function PATCH(req: Request) {
  if (!isJson(req)) return Response.json({ error: 'JSON bekleniyor' }, { status: 415 })
  const admin = await getAdminUser()
  if (!admin) return Response.json({ error: 'Yetki yok' }, { status: 403 })
  const r = await editUserByAdmin(getDb(), admin.id, await req.json().catch(() => null))
  if (!r.ok) return Response.json({ error: r.message, code: r.code }, { status: EDIT_STATUS[r.code] })
  return Response.json({ ok: true, user: r.user })
}
