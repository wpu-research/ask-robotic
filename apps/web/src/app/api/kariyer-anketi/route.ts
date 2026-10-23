import { getDb } from '@/lib/db'
import { clientKey, ipOf, isJson } from '@/lib/auth/http'
import { rateLimited } from '@/lib/auth/rate-limit'
import { getCurrentUser } from '@/lib/auth/current'
import { surveySchema } from '@/lib/kariyer-anket'
import { storeSurvey } from '@/lib/kariyer-anket-server'

// Kariyer anketi: ad, e-posta ve cevapları kaydeder, en uygun üç hedefi döndürür. Oran sınırı: IP başına saatte 10,
// IP+e-posta başına saatte 3 (bellek içi, tek örnek).
export async function POST(req: Request) {
  if (!isJson(req)) return Response.json({ error: 'JSON bekleniyor' }, { status: 415 })
  const body = await req.json().catch(() => null)
  const parsed = surveySchema.safeParse(body)
  if (!parsed.success) return Response.json({ error: 'Eksik ya da geçersiz bilgi' }, { status: 400 })
  if (rateLimited(`anket-ip|${ipOf(req)}`, 10, 3_600_000) || rateLimited(`anket|${clientKey(req, parsed.data.email)}`, 3, 3_600_000)) {
    return Response.json({ error: 'Çok sık istek, biraz sonra dene' }, { status: 429 })
  }
  try {
    const user = await getCurrentUser().catch(() => null)
    const result = await storeSurvey(getDb(), parsed.data, user?.id ?? null)
    return Response.json({ ok: true, result }, { status: 201 })
  } catch {
    return Response.json({ error: 'Kaydedilemedi, biraz sonra tekrar dene' }, { status: 503 })
  }
}
