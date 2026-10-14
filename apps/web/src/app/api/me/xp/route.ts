import { rateLimited } from '@/lib/auth/rate-limit'
import { getDb } from '@/lib/db'
import { recordXp, XP_RATE } from '@/lib/me'
import { guard, reply } from '../http'

// Gövde: { items: [{ source: 'step'|'lesson', amount, lessonId? }] } → xp_events (sınıf ligleri)
export async function POST(req: Request) {
  const g = await guard(req)
  if (g.error) return g.error
  if (rateLimited(`me-xp|${g.user.id}`, XP_RATE.max, XP_RATE.windowMs)) {
    return Response.json({ error: 'Çok sık istek' }, { status: 429, headers: { 'retry-after': '30' } })
  }
  return reply(await recordXp(getDb(), g.user.id, g.body), 'result')
}
