// Dile göre sayı/tarih biçimleri (Intl). İstemcide useFormat() (i18n/client.tsx) bunları dile bağlar.
import { intlTag, type Locale } from './index'

export function formatNumber(locale: Locale, n: number, opts?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(intlTag(locale), opts).format(n)
}

/** Para: TL tutarı (kuruş değil). Türkçede "₺1.234", İngilizcede "TRY 1,234" yerine "₺1,234". */
export function formatMoney(locale: Locale, amount: number, opts?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(intlTag(locale), { style: 'currency', currency: 'TRY', currencyDisplay: 'narrowSymbol', maximumFractionDigits: 0, ...opts }).format(amount)
}

export function formatDate(locale: Locale, d: Date | number | string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }): string {
  return new Intl.DateTimeFormat(intlTag(locale), { timeZone: 'Europe/Istanbul', ...opts }).format(new Date(d))
}

export function formatDateTime(locale: Locale, d: Date | number | string): string {
  return formatDate(locale, d, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

/** Göreli zaman: tr "az önce / 5 dk önce / dün / 3 gün önce" (lib/format.ts timeAgo ile aynı), en "just now / 5 min ago …". */
export function formatTimeAgo(locale: Locale, at: number, now: number = Date.now()): string {
  const s = Math.max(0, Math.round((now - at) / 1000))
  const en = locale === 'en'
  if (s < 60) return en ? 'just now' : 'az önce'
  const m = Math.floor(s / 60)
  if (m < 60) return en ? `${m} min ago` : `${m} dk önce`
  const h = Math.floor(m / 60)
  if (h < 24) return en ? `${h} h ago` : `${h} sa önce`
  const d = Math.floor(h / 24)
  if (d === 1) return en ? 'yesterday' : 'dün'
  if (d < 30) return en ? `${d} days ago` : `${d} gün önce`
  return new Date(at).toLocaleDateString(intlTag(locale))
}

/** Süre: tr "45 dk / 12 saat" (lib/format.ts hoursLabel ile aynı), en "45 min / 12 h". */
export function formatDuration(locale: Locale, min: number): string {
  if (locale === 'en') return min >= 60 ? `${Math.round(min / 60)} h` : `${min} min`
  return min >= 60 ? `${Math.round(min / 60)} saat` : `${min} dk`
}
