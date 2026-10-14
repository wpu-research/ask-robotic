// Sahte ödeme sağlayıcısı (geliştirme/test). "Barındırılan sayfa" /odeme/mock; orada Başarılı/Başarısız seçilir,
// sayfa /api/odeme/mock/callback'e döner. Sonuç süreç belleğinde tutulur (tek süreç, yalnız geliştirme).
import type { CheckoutInit, CheckoutSession, PaymentProvider, VerifiedPayment } from './provider'

const outcomes = new Map<string, { outcome: 'succeeded' | 'failed'; paymentId: string; amountKurus?: number }>()
const pending = new Map<string, { paymentId: string; amountKurus: number }>()

export const mockProvider: PaymentProvider & {
  settle(ref: string, outcome: 'succeeded' | 'failed'): boolean
  reset(): void
} = {
  id: 'mock',
  async initialize(init: CheckoutInit): Promise<CheckoutSession> {
    const providerRef = `mock_${init.paymentId}`
    pending.set(providerRef, { paymentId: init.paymentId, amountKurus: init.amountKurus })
    return { providerRef, redirectUrl: `/odeme/mock?ref=${encodeURIComponent(providerRef)}`, raw: { mock: true } }
  },
  async retrieve(ref: string): Promise<VerifiedPayment> {
    const o = outcomes.get(ref)
    if (!o) return { status: 'pending', raw: { mock: true, ref } }
    return { status: o.outcome, paymentId: o.paymentId, paidKurus: o.outcome === 'succeeded' ? o.amountKurus : undefined, raw: { mock: true, ref, outcome: o.outcome } }
  },
  /** Sahte sayfadaki düğme. Ref bu süreçte başlatılmadıysa (ör. sunucu yeniden başladı) ödeme kimliği ref'ten çıkarılır, tutar denetlenmez. */
  settle(ref, outcome) {
    const p = pending.get(ref) ?? (ref.startsWith('mock_') ? { paymentId: ref.slice(5) } : null)
    if (!p) return false
    outcomes.set(ref, { outcome, ...p })
    return true
  },
  reset() {
    outcomes.clear()
    pending.clear()
  },
}
