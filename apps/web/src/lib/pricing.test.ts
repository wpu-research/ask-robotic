import { describe, expect, it } from 'vitest'
import {
  FAMILY_MAX_MEMBERS, FAMILY_SIZE, PAID_PLANS, PRICES_KURUS, addMonths, extendPeriod, formatTRY, monthlyEquivalent,
  needsRenewalReminder, periodFromSlug, priceOf, toDecimalString, trialTimeline, yearlySavingsPercent,
} from './pricing'

const d = (s: string) => new Date(s)

describe('fiyat hesapları', () => {
  it('yıllık planın aylık karşılığı 12\'ye bölünüp kuruşa yuvarlanır', () => {
    for (const p of PAID_PLANS) {
      expect(monthlyEquivalent(p, 'monthly')).toBe(PRICES_KURUS[p].monthly)
      expect(monthlyEquivalent(p, 'yearly')).toBe(Math.round(PRICES_KURUS[p].yearly / 12))
      // Yıllık, 12 aylıktan ucuz olmalı (yer tutucu fiyatlar değişse de korunacak kural)
      expect(priceOf(p, 'yearly')).toBeLessThan(priceOf(p, 'monthly') * 12)
      expect(yearlySavingsPercent(p)).toBeGreaterThan(0)
    }
    // Örnek: 1.990 TL / 12 = 165,83 TL
    expect(Math.round(199000 / 12)).toBe(16583)
  })
  it('TL biçimi', () => {
    expect(formatTRY(199000)).toBe('1.990 TL')
    expect(formatTRY(16583)).toBe('165,83 TL')
    expect(formatTRY(24900)).toBe('249 TL')
    expect(toDecimalString(199000)).toBe('1990.00')
    expect(toDecimalString(16583)).toBe('165.83')
  })
  it('aile 6 kişi = sahip + 5 üye', () => {
    expect(FAMILY_SIZE).toBe(6)
    expect(FAMILY_MAX_MEMBERS).toBe(5)
  })
  it('dönem slug\'ı', () => {
    expect(periodFromSlug('yillik')).toBe('yearly')
    expect(periodFromSlug('aylik')).toBe('monthly')
    expect(periodFromSlug('x')).toBeNull()
  })
})

describe('dönem uzatma (ön ödemeli)', () => {
  const now = d('2026-10-14T10:00:00Z')
  it('takvim ayı ekler, ay sonunu sabitler', () => {
    expect(addMonths(d('2026-01-31T00:00:00Z'), 1).toISOString()).toBe('2026-02-28T00:00:00.000Z')
    expect(addMonths(d('2028-01-31T00:00:00Z'), 1).toISOString()).toBe('2028-02-29T00:00:00.000Z')
    expect(addMonths(d('2026-10-14T10:00:00Z'), 12).toISOString()).toBe('2027-10-14T10:00:00.000Z')
  })
  it('bitiş yoksa ya da geçmişteyse bugünden başlar', () => {
    expect(extendPeriod(null, 'monthly', now).toISOString()).toBe('2026-11-14T10:00:00.000Z')
    expect(extendPeriod(d('2026-01-01T00:00:00Z'), 'yearly', now).toISOString()).toBe('2027-10-14T10:00:00.000Z')
  })
  it('bitiş gelecekteyse üstüne eklenir (gün yanmaz)', () => {
    expect(extendPeriod(d('2026-10-20T00:00:00Z'), 'monthly', now).toISOString()).toBe('2026-11-20T00:00:00.000Z')
  })
  it('yenileme hatırlatması: bitişe 7 gün ve daha az', () => {
    expect(needsRenewalReminder(d('2026-10-30T00:00:00Z'), now)).toBe(false)
    expect(needsRenewalReminder(d('2026-10-20T00:00:00Z'), now)).toBe(true)
    expect(needsRenewalReminder(d('2026-10-01T00:00:00Z'), now)).toBe(false) // bitmiş
    expect(needsRenewalReminder(null, now)).toBe(false)
  })
  it('deneme zaman çizelgesi: bugün / 5. gün / 7. gün', () => {
    const t = trialTimeline(now)
    expect(t.reminder.toISOString()).toBe('2026-10-19T10:00:00.000Z')
    expect(t.end.toISOString()).toBe('2026-10-21T10:00:00.000Z')
  })
})
