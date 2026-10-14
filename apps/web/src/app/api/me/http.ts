import { getCurrentUser } from '@/lib/auth/current'
import { isJson } from '@/lib/auth/http'
import type { Result } from '@/lib/me'

const MAX_BODY = 64_000

/** /api/me/* yazma uçları için ortak kapı: JSON, oturum, gövde boyutu. */
export async function guard(req: Request) {
  if (!isJson(req)) return { error: Response.json({ error: 'JSON bekleniyor' }, { status: 415 }) }
  const user = await getCurrentUser()
  if (!user) return { error: Response.json({ error: 'Giriş yapılmamış' }, { status: 401 }) }
  const text = await req.text().catch(() => '')
  if (text.length > MAX_BODY) return { error: Response.json({ error: 'İstek çok büyük' }, { status: 413 }) }
  let body: unknown = null
  try { body = JSON.parse(text) } catch { /* null: doğrulama reddeder */ }
  return { user, body }
}

export const reply = <T>(r: Result<T>, key: string) => (r.ok ? Response.json({ [key]: r.data }) : Response.json({ error: r.error }, { status: r.status }))
