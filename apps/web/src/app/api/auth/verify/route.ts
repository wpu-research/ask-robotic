import { getDb } from '@/lib/db'
import { ipOf, isJson } from '@/lib/auth/http'
import { rateLimited } from '@/lib/auth/rate-limit'
import { verifyEmail } from '@/lib/auth/email-tokens'
import { mailEnabled } from '@/lib/mail/config'

export const dynamic = 'force-dynamic'

/** Doğrulama bağlantısı sayfadan POST ile tüketilir (e-posta tarayıcıları GET ile bağlantıyı harcamasın). */
export async function POST(req: Request) {
  if (!mailEnabled()) return Response.json({ error: 'Bulunamadı' }, { status: 404 })
  if (!isJson(req)) return Response.json({ error: 'JSON bekleniyor' }, { status: 415 })
  if (rateLimited(`verify-ip|${ipOf(req)}`, 20)) return Response.json({ error: 'Çok fazla deneme, sonra tekrar dene' }, { status: 429 })
  const body = await req.json().catch(() => null)
  const r = await verifyEmail(getDb(), body?.token)
  if (!r.ok) return Response.json({ error: r.message, code: r.code }, { status: 400 })
  return Response.json({ ok: true })
}
