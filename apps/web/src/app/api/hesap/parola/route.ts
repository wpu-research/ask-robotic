import { getDb } from '@/lib/db'
import { isJson, readSessionToken } from '@/lib/auth/http'
import { getCurrentUser } from '@/lib/auth/current'
import { rateLimited } from '@/lib/auth/rate-limit'
import { changePassword } from '@/lib/auth/service'

export const dynamic = 'force-dynamic'

const STATUS = { invalid_input: 400, same_password: 400, bad_current: 403, no_password: 409, not_found: 404 } as const

/** Parola değiştir: mevcut parola doğrulanır; bu oturum kalır, diğer cihazlardaki oturumlar kapanır. */
export async function POST(req: Request) {
  if (!isJson(req)) return Response.json({ error: 'JSON bekleniyor' }, { status: 415 })
  const user = await getCurrentUser()
  if (!user) return Response.json({ error: 'Giriş yapılmamış' }, { status: 401 })
  // Mevcut parolayı tahmin etmeye karşı kullanıcı başına sınır
  if (rateLimited(`hesap-parola|${user.id}`, 5)) return Response.json({ error: 'Çok fazla deneme, sonra tekrar dene' }, { status: 429 })
  const r = await changePassword(getDb(), user.id, await req.json().catch(() => null), await readSessionToken())
  if (!r.ok) return Response.json({ error: r.message, code: r.code }, { status: STATUS[r.code] })
  return Response.json({ ok: true, signedOut: r.signedOut })
}
