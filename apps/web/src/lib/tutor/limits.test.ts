import { beforeEach, describe, expect, it } from 'vitest'
import { dayStart, GUEST_DAILY, refundDaily, resetDailyCounts, takeDaily, USER_DAILY } from './limits'

beforeEach(() => resetDailyCounts())

describe('günlük kota', () => {
  it('misafir 15, kullanıcı 60', () => {
    expect(GUEST_DAILY).toBe(15)
    expect(USER_DAILY).toBe(60)
    const now = new Date('2026-10-14T10:00:00Z')
    for (let i = 0; i < 15; i++) expect(takeDaily('d|x', GUEST_DAILY, now).ok).toBe(true)
    const r = takeDaily('d|x', GUEST_DAILY, now)
    expect(r).toEqual({ ok: false, used: 15, remaining: 0 })
    expect(takeDaily('d|y', GUEST_DAILY, now).ok).toBe(true) // anahtarlar bağımsız
  })

  it('Türkiye günü değişince sıfırlanır (UTC+3)', () => {
    const late = new Date('2026-10-14T20:59:00Z') // 23:59 İstanbul
    for (let i = 0; i < 15; i++) takeDaily('d|x', 15, late)
    expect(takeDaily('d|x', 15, late).ok).toBe(false)
    expect(takeDaily('d|x', 15, new Date('2026-10-14T21:00:00Z')).ok).toBe(true) // 00:00 İstanbul
    expect(dayStart(new Date('2026-10-14T21:30:00Z')).toISOString()).toBe('2026-10-14T21:00:00.000Z')
  })

  it('DB sayımı taban olur (yeniden başlatmaya dayanıklı)', () => {
    const now = new Date('2026-10-14T10:00:00Z')
    expect(takeDaily('u|1', 60, now, 59)).toEqual({ ok: true, used: 60, remaining: 0 })
    expect(takeDaily('u|1', 60, now, 59).ok).toBe(false)
    expect(takeDaily('u|2', 60, now, 60).ok).toBe(false)
  })

  it('iade', () => {
    const now = new Date('2026-10-14T10:00:00Z')
    for (let i = 0; i < 15; i++) takeDaily('d|x', 15, now)
    refundDaily('d|x', now)
    expect(takeDaily('d|x', 15, now).ok).toBe(true)
  })
})
