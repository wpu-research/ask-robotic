import { getDb } from '@/lib/db'
import { isJson } from '@/lib/auth/http'
import { getCurrentUser } from '@/lib/auth/current'
import { startTrial } from '@/lib/billing'

export const dynamic = 'force-dynamic'

const MESSAGES = {
  trial_used: 'Ücretsiz denemeni daha önce kullandın',
  already_premium: 'Zaten Premium erişimin var',
  no_user: 'Giriş yapılmamış',
} as const

/** 7 gün ücretsiz Premium (kart yok, kullanıcı başına bir kez). */
export async function POST(req: Request) {
  if (!isJson(req)) return Response.json({ error: 'JSON bekleniyor' }, { status: 415 })
  const user = await getCurrentUser()
  if (!user) return Response.json({ error: 'Denemeyi başlatmak için hesap aç' }, { status: 401 })
  const r = await startTrial(getDb(), user.id)
  if (!r.ok) return Response.json({ error: MESSAGES[r.code], code: r.code }, { status: r.code === 'no_user' ? 401 : 409 })
  return Response.json({ ok: true, endsAt: r.endsAt.toISOString() })
}
