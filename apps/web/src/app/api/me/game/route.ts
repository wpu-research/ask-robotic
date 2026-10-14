import { rateLimited } from '@/lib/auth/rate-limit'
import { getDb } from '@/lib/db'
import { syncGame } from '@/lib/me'
import { guard, reply } from '../http'

// Gövde: { game: GameState } → birleşik durum { game } (kural: gamification-core.ts mergeGame)
export async function POST(req: Request) {
  const g = await guard(req)
  if (g.error) return g.error
  if (rateLimited(`me-game|${g.user.id}`, 30, 60_000)) return Response.json({ error: 'Çok sık istek' }, { status: 429 })
  return reply(await syncGame(getDb(), g.user.id, g.body), 'game')
}
