import { rateLimited } from '@/lib/auth/rate-limit'
import { getDb } from '@/lib/db'
import { importProgress } from '@/lib/me'
import { guard, reply } from '../http'

// Gövde: { lessonIds: number[] } (tarayıcıda tamamlananlar) → sunucudaki tüm tamamlananlar { doneLessonIds }
export async function POST(req: Request) {
  const g = await guard(req)
  if (g.error) return g.error
  if (rateLimited(`me-progress|${g.user.id}`, 30, 60_000)) return Response.json({ error: 'Çok sık istek' }, { status: 429 })
  return reply(await importProgress(getDb(), g.user.id, g.body), 'doneLessonIds')
}
