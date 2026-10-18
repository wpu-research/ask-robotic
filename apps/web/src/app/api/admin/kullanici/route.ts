import { getDb } from '@/lib/db'
import { isJson } from '@/lib/auth/http'
import { getAdminUser } from '@/lib/auth/admin'
import { createUserByAdmin } from '@/lib/membership'

export const dynamic = 'force-dynamic'

/** Admin hesap açar; parola boşsa üretilir ve yanıtta bir kez döner. */
export async function POST(req: Request) {
  if (!isJson(req)) return Response.json({ error: 'JSON bekleniyor' }, { status: 415 })
  if (!(await getAdminUser())) return Response.json({ error: 'Yetki yok' }, { status: 403 })
  const r = await createUserByAdmin(getDb(), await req.json().catch(() => null))
  if (!r.ok) return Response.json({ error: r.message, code: r.code }, { status: r.code === 'taken' ? 409 : 400 })
  return Response.json({ ok: true, user: r.user, password: r.password }, { status: 201 })
}
