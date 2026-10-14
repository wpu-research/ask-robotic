import { z } from 'zod'
import { getDb } from '@/lib/db'
import { isJson } from '@/lib/auth/http'
import { getCurrentUser } from '@/lib/auth/current'
import { startCheckout } from '@/lib/billing'
import { clientIp, getProvider, publicOrigin } from '@/lib/payments'

export const dynamic = 'force-dynamic'

// Mesafeli satış + ön bilgilendirme onayı zorunlu (taslak metinler: /yasal/*)
const body = z.object({ planId: z.enum(['premium', 'family']), period: z.enum(['monthly', 'yearly']), accepted: z.literal(true) })

/** Ödeme başlat: giriş gerekir; payments 'pending' açılır, sağlayıcının ödeme sayfası adresi döner. */
export async function POST(req: Request) {
  if (!isJson(req)) return Response.json({ error: 'JSON bekleniyor' }, { status: 415 })
  const user = await getCurrentUser()
  if (!user) return Response.json({ error: 'Satın almak için giriş yap' }, { status: 401 })
  const parsed = body.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return Response.json({ error: 'Plan seç ve sözleşmeleri onayla' }, { status: 400 })
  const provider = getProvider()
  if (!provider) return Response.json({ error: 'Ödeme şu an kapalı' }, { status: 503 })

  const origin = publicOrigin(req)
  const r = await startCheckout(getDb(), provider, {
    userId: user.id, planId: parsed.data.planId, period: parsed.data.period,
    callbackUrl: `${origin}/api/odeme/${provider.id}/callback`, ip: clientIp(req),
  })
  if (!r.ok) return Response.json({ error: r.message }, { status: r.code === 'provider_error' ? 502 : 400 })
  return Response.json({ paymentId: r.paymentId, redirectUrl: r.redirectUrl })
}
