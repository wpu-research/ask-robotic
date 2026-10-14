import { getDb } from '@/lib/db'
import { clientKey, isJson, setSessionCookie } from '@/lib/auth/http'
import { rateLimited } from '@/lib/auth/rate-limit'
import { loginUser } from '@/lib/auth/service'

export async function POST(req: Request) {
  if (!isJson(req)) return Response.json({ error: 'JSON bekleniyor' }, { status: 415 })
  const body = await req.json().catch(() => null)
  if (rateLimited(clientKey(req, String(body?.login ?? body?.email ?? '')))) {
    return Response.json({ error: 'Çok fazla deneme, sonra tekrar dene' }, { status: 429 })
  }
  const result = await loginUser(getDb(), body)
  if (!result.ok) return Response.json({ error: result.message }, { status: 401 })
  await setSessionCookie(result.token, result.expiresAt)
  return Response.json({ user: result.user })
}
