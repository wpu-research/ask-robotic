import { cookies } from 'next/headers'
import { rateLimited } from '@/lib/auth/rate-limit'
import { getDb } from '@/lib/db'
import { saveUserLocale } from '@/lib/me'
import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE } from '@/i18n'
import { guard, reply } from '../http'

// Arayüz dili: users.locale'i yazar ve ask-locale çerezini eşitler (çerez öncelikli; bkz. i18n/server.ts).
export async function PUT(req: Request) {
  const g = await guard(req)
  if (g.error) return g.error
  if (rateLimited(`me-locale|${g.user.id}`, 20, 60_000)) return Response.json({ error: 'Çok sık istek' }, { status: 429 })
  const r = await saveUserLocale(getDb(), g.user.id, g.body)
  if (r.ok) (await cookies()).set(LOCALE_COOKIE, r.data, { path: '/', sameSite: 'lax', maxAge: LOCALE_COOKIE_MAX_AGE })
  return reply(r, 'locale')
}
