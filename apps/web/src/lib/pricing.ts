// Planlar, fiyatlar, deneme ve dönem hesabı. Saf modül (DB yok): hem sunucu hem istemci kullanır.
//
// ⚠ FİYATLAR YER TUTUCU — İŞ KARARI. Aşağıdaki TL tutarları yalnız arayüzü ve ödeme akışını çalıştırmak için.
//   Gerçek fiyat, KDV dahil/haric gösterim ve kampanya kararı verilince yalnız PRICES_KURUS değişir.
//   (Referans: Brilliant TR yıllık bireysel 300 TL/ay = 3.600 TL/yıl, aile 600 TL/ay; docs/analiz-brilliant.md §11.2)
//
// Model: ön ödemeli. Her başarılı ödeme aboneliğin bitişini dönem kadar uzatır; karttan otomatik çekim YOK.
// Bitişe RENEWAL_REMINDER_DAYS kala hesap sayfası (ileride e-posta) yenileme hatırlatır.

export type BillingPeriod = 'monthly' | 'yearly'
export type PaidPlanId = 'premium' | 'family'

export const PAID_PLANS: readonly PaidPlanId[] = ['premium', 'family']
export const PERIODS: readonly BillingPeriod[] = ['monthly', 'yearly']

/** Kuruş cinsinden, KDV dahil. YER TUTUCU — iş kararı. */
export const PRICES_KURUS: Record<PaidPlanId, Record<BillingPeriod, number>> = {
  premium: { monthly: 249_00, yearly: 1_990_00 },
  family: { monthly: 399_00, yearly: 2_990_00 },
}

/** Aile planında toplam kişi (sahip dahil). plans.seat_limit (family = 5) sahip hariç ek üye olarak okunur. */
export const FAMILY_SIZE = 6
export const FAMILY_MAX_MEMBERS = FAMILY_SIZE - 1

export const TRIAL_DAYS = 7
/** Deneme zaman çizelgesindeki hatırlatma günü */
export const TRIAL_REMINDER_DAY = 5
/** Ön ödemeli dönemin bitişine bu kadar gün kala yenileme hatırlatması */
export const RENEWAL_REMINDER_DAYS = 7

export const PLAN_INFO: Record<PaidPlanId, { title: string; tagline: string; seats: number }> = {
  premium: { title: 'Bireysel', tagline: 'Tek öğrenci için tüm Premium', seats: 1 },
  family: { title: 'Aile', tagline: `${FAMILY_SIZE} kişiye kadar, her biri kendi hesabıyla`, seats: FAMILY_SIZE },
}

export const PERIOD_LABEL: Record<BillingPeriod, string> = { monthly: 'Aylık', yearly: 'Yıllık' }
/** URL'deki Türkçe karşılık (?donem=yillik) */
export const PERIOD_SLUG: Record<BillingPeriod, string> = { monthly: 'aylik', yearly: 'yillik' }
export const periodFromSlug = (s: string | undefined | null): BillingPeriod | null =>
  s === 'aylik' || s === 'monthly' ? 'monthly' : s === 'yillik' || s === 'yearly' ? 'yearly' : null
export const isPaidPlan = (p: unknown): p is PaidPlanId => p === 'premium' || p === 'family'
export const isPeriod = (p: unknown): p is BillingPeriod => p === 'monthly' || p === 'yearly'

export const priceOf = (plan: PaidPlanId, period: BillingPeriod) => PRICES_KURUS[plan][period]
export const monthsOf = (period: BillingPeriod) => (period === 'yearly' ? 12 : 1)

/** Ayda düşen tutar (kuruş, en yakın kuruşa yuvarlı). Yıllık planda 12'ye bölünür. */
export const monthlyEquivalent = (plan: PaidPlanId, period: BillingPeriod) => Math.round(priceOf(plan, period) / monthsOf(period))

/** Yıllık planın 12 aylık ödemeye göre tasarrufu (tam yüzde, aşağı yuvarlı). */
export function yearlySavingsPercent(plan: PaidPlanId) {
  const twelve = priceOf(plan, 'monthly') * 12
  return Math.floor(((twelve - priceOf(plan, 'yearly')) / twelve) * 100)
}

/** 199000 → "1.990 TL", 16583 → "165,83 TL" */
export function formatTRY(kurus: number) {
  const whole = kurus % 100 === 0
  const n = new Intl.NumberFormat('tr-TR', { minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: 2 }).format(kurus / 100)
  return `${n} TL`
}

/** Arayüz diline göre tutar: tr "1.990 TL" (formatTRY ile aynı), en "1,990 TL". */
export function formatPrice(kurus: number, locale: 'tr' | 'en' = 'tr') {
  if (locale === 'tr') return formatTRY(kurus)
  const whole = kurus % 100 === 0
  const n = new Intl.NumberFormat('en-US', { minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: 2 }).format(kurus / 100)
  return `${n} TL`
}

/** iyzico gibi sağlayıcılara giden tutar: 199000 → "1990.00" */
export const toDecimalString = (kurus: number) => (kurus / 100).toFixed(2)

/** Takvim ayı ekler (UTC); ay sonu taşarsa ayın son gününe sabitlenir (31 Oca + 1 ay = 28/29 Şub). */
export function addMonths(d: Date, months: number): Date {
  const y = d.getUTCFullYear()
  const m = d.getUTCMonth() + months
  const last = new Date(Date.UTC(y, m + 1, 0)).getUTCDate()
  const out = new Date(d)
  out.setUTCFullYear(y, m, Math.min(d.getUTCDate(), last))
  return out
}

export const addDays = (d: Date, days: number) => new Date(d.getTime() + days * 86_400_000)

/**
 * Ön ödemeli uzatma: dönem, şimdiki bitiş gelecekteyse onun üstüne, geçmişteyse/yoksa bugünden başlar.
 * Böylece erken yenileme gün kaybettirmez, süresi dolmuş abonelik bugünden yeniden başlar.
 */
export function extendPeriod(currentEnd: Date | null | undefined, period: BillingPeriod, now: Date): Date {
  const base = currentEnd && currentEnd > now ? currentEnd : now
  return addMonths(base, monthsOf(period))
}

/** Bitişe RENEWAL_REMINDER_DAYS ya da daha az kaldıysa (ve bitmediyse) hatırlat. */
export function needsRenewalReminder(end: Date | null | undefined, now: Date, days = RENEWAL_REMINDER_DAYS) {
  if (!end || end <= now) return false
  return end.getTime() - now.getTime() <= days * 86_400_000
}

/** Deneme zaman çizelgesi (Bugün / 5. gün hatırlatma / 7. gün bitiş). */
export function trialTimeline(now: Date) {
  return {
    start: now,
    reminder: addDays(now, TRIAL_REMINDER_DAY),
    end: addDays(now, TRIAL_DAYS),
  }
}

export const formatDateTR = (d: Date) =>
  new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Istanbul' }).format(d)

// ---- Karşılaştırma tablosu ----
export type Cell = boolean | string
export interface FeatureRow { label: string; free: Cell; premium: Cell; family: Cell }

export const FEATURE_TABLE: FeatureRow[] = [
  { label: 'Her modülün ilk haftası', free: true, premium: true, family: true },
  { label: 'Yeni ders', free: 'Günde 1', premium: 'Sınırsız', family: 'Sınırsız' },
  { label: 'Simülatörler ve atölyeler', free: true, premium: true, family: true },
  { label: 'Robi AI öğretmen', free: false, premium: true, family: true },
  { label: 'Kişisel pratik ve tekrar', free: false, premium: true, family: true },
  { label: 'İleri atlama', free: false, premium: true, family: true },
  { label: 'Reklamsız', free: false, premium: true, family: true },
  { label: 'Hesap sayısı', free: '1', premium: '1', family: `${FAMILY_SIZE} kişiye kadar` },
]

export const PREMIUM_BENEFITS = [
  'Sınırsız ders: istediğin kadar, istediğin sırayla',
  'Robi AI öğretmen: takıldığında ipucu ve açıklama',
  'Kişisel pratik: zorlandığın konulara göre tekrar',
  'Reklamsız öğrenme',
]
