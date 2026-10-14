import { rateLimited } from '@/lib/auth/rate-limit'
import { getDb } from '@/lib/db'
import { saveUserProfile } from '@/lib/me'
import { guard, reply } from '../http'

export async function PUT(req: Request) {
  const g = await guard(req)
  if (g.error) return g.error
  if (rateLimited(`me-profile|${g.user.id}`, 20, 60_000)) return Response.json({ error: 'Çok sık istek' }, { status: 429 })
  return reply(await saveUserProfile(getDb(), g.user.id, g.body), 'profile')
}
