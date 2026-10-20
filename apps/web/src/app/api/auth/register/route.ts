import { getDb } from '@/lib/db'
import { clientKey, isJson, setSessionCookie } from '@/lib/auth/http'
import { rateLimited } from '@/lib/auth/rate-limit'
import { registerUser } from '@/lib/auth/service'
import { sendVerificationEmail } from '@/lib/auth/email-tokens'
import { mailDeps } from '@/lib/auth/mail-deps'

export async function POST(req: Request) {
  if (!isJson(req)) return Response.json({ error: 'JSON bekleniyor' }, { status: 415 })
  const body = await req.json().catch(() => null)
  if (rateLimited(clientKey(req, String(body?.email ?? '')), 10)) {
    return Response.json({ error: 'Çok fazla deneme, sonra tekrar dene' }, { status: 429 })
  }
  const result = await registerUser(getDb(), body)
  if (!result.ok) {
    return Response.json({ error: result.message }, { status: result.code === 'email_taken' ? 409 : 400 })
  }
  // SMTP ayarlıysa doğrulama bağlantısı gider; beklenmez, hata kaydı engellemez, zorunlu değildir
  void mailDeps().then((d) => sendVerificationEmail(getDb(), result.user.id, d)).catch(() => {})
  await setSessionCookie(result.token, result.expiresAt)
  return Response.json({ user: result.user }, { status: 201 })
}
