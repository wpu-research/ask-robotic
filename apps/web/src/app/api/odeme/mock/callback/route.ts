import { z } from 'zod'
import { getDb } from '@/lib/db'
import { isJson } from '@/lib/auth/http'
import { getCurrentUser } from '@/lib/auth/current'
import { completeCheckout, failPayment, loadPaymentByRef } from '@/lib/billing'
import { activeProviderId, mockProvider } from '@/lib/payments'

export const dynamic = 'force-dynamic'

const body = z.object({ ref: z.string().min(1).max(200), outcome: z.enum(['succeeded', 'failed', 'canceled']) })

/** Sahte ödeme sayfasının dönüşü. Yalnız PAYMENTS_PROVIDER=mock iken ve ödemenin sahibi için çalışır. */
export async function POST(req: Request) {
  if (activeProviderId() !== 'mock') return Response.json({ error: 'Sahte ödeme kapalı' }, { status: 404 })
  if (!isJson(req)) return Response.json({ error: 'JSON bekleniyor' }, { status: 415 })
  const user = await getCurrentUser()
  if (!user) return Response.json({ error: 'Giriş yapılmamış' }, { status: 401 })
  const parsed = body.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return Response.json({ error: 'Geçersiz istek' }, { status: 400 })
  const db = getDb()
  const p = await loadPaymentByRef(db, 'mock', parsed.data.ref)
  if (!p || p.userId !== user.id) return Response.json({ error: 'Ödeme bulunamadı' }, { status: 404 })

  if (parsed.data.outcome === 'canceled') {
    await failPayment(db, p.id, 'canceled')
    return Response.json({ redirect: '/fiyatlar?odeme=iptal' })
  }
  mockProvider.settle(parsed.data.ref, parsed.data.outcome)
  const r = await completeCheckout(db, 'mock', parsed.data.ref, await mockProvider.retrieve(parsed.data.ref))
  return Response.json({ redirect: `/hesap?odeme=${r.ok ? 'basarili' : 'hata'}` })
}
