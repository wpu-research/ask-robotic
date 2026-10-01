import { describe, expect, it } from 'vitest'
import { parseActivity, trim } from './activity-store'
import { timeAgo } from './format'

describe('etkinlik günlüğü', () => {
  it('bozuk veriyi boş günlüğe çevirir', () => {
    expect(parseActivity('{bozuk')).toEqual({ opened: {}, goals: {}, finished: {} })
    expect(parseActivity('null')).toEqual({ opened: {}, goals: {}, finished: {} })
  })
  it('yalnız sayısal anahtar ve sayı değerlerini alır', () => {
    const a = parseActivity(JSON.stringify({ opened: { '1': 5, x: 6, '2': 'a' }, goals: { '3': 7 } }))
    expect(a.opened).toEqual({ '1': 5 })
    expect(a.goals).toEqual({ '3': 7 })
  })
  it('trim en yeni kayıtları tutar', () => {
    expect(trim({ '1': 1, '2': 3, '3': 2 }, 2)).toEqual({ '2': 3, '3': 2 })
  })
  it('timeAgo', () => {
    const now = 1_000_000_000
    expect(timeAgo(now - 5_000, now)).toBe('az önce')
    expect(timeAgo(now - 5 * 60_000, now)).toBe('5 dk önce')
    expect(timeAgo(now - 3 * 3600_000, now)).toBe('3 sa önce')
    expect(timeAgo(now - 86400_000, now)).toBe('dün')
  })
})
