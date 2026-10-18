import { getDb } from '@/lib/db'
import { isJson } from '@/lib/auth/http'
import { getAdminUser } from '@/lib/auth/admin'
import { resetPasswordByAdmin } from '@/lib/membership'

export const dynamic = 'force-dynamic'

const STATUS = { invalid_input: 400, no_password_login: 400, not_found: 404 } as const

/** Admin parola sıfırlar: yeni parola üretilir, tüm oturumlar kapanır; parola yanıtta bir kez döner. */
export async function POST(req: Request) {
  if (!isJson(req)) return Response.json({ error: 'JSON bekleniyor' }, { status: 415 })
  if (!(await getAdminUser())) return Response.json({ error: 'Yetki yok' }, { status: 403 })
  const r = await resetPasswordByAdmin(getDb(), await req.json().catch(() => null))
  if (!r.ok) return Response.json({ error: r.message, code: r.code }, { status: STATUS[r.code] })
  return Response.json({ ok: true, password: r.password, sessionsEnded: r.sessionsEnded })
}
