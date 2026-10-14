import { getDb } from '@/lib/db'
import { rateLimited } from '@/lib/auth/rate-limit'
import { joinClassByCode } from '@/lib/classroom'
import { bad, currentUserId, readJson } from '@/lib/teacher-page'

export const dynamic = 'force-dynamic'

// Öğrenci sınıf koduyla katılır: { code }
export async function POST(req: Request) {
  const userId = await currentUserId()
  if (!userId) return bad('Giriş yapmalısın', 401)
  // Kod tahminini zorlaştır: kullanıcı başına dakikada 10 deneme
  if (rateLimited(`join|${userId}`, 10, 60_000)) return bad('Çok fazla deneme; biraz bekle', 429)
  const body = await readJson(req)
  if (!body || typeof body.code !== 'string') return bad('Sınıf kodu bekleniyor')
  const r = await joinClassByCode(getDb(), userId, body.code)
  return r.ok ? Response.json({ ok: true, className: r.cls.name, already: r.already }) : bad(r.error, 404)
}
