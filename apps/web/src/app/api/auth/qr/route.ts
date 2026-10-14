import { getDb } from '@/lib/db'
import { ipOf, isJson, setSessionCookie } from '@/lib/auth/http'
import { loginWithQr } from '@/lib/auth/qr'

// QR kartla giriş: /giris/qr sayfası adresteki u/k'yı buraya POST eder (GET ile oturum açılmaz: önizleme/CSRF)
export async function POST(req: Request) {
  if (!isJson(req)) return Response.json({ error: 'JSON bekleniyor' }, { status: 415 })
  const body = await req.json().catch(() => null)
  const result = await loginWithQr(getDb(), body, ipOf(req))
  if (!result.ok) {
    const status = result.code === 'rate_limited' ? 429 : result.code === 'invalid_input' ? 400 : 401
    return Response.json({ error: result.message }, { status })
  }
  await setSessionCookie(result.token, result.expiresAt)
  return Response.json({ user: result.user })
}
