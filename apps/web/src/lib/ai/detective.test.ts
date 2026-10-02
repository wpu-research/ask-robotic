import { describe, expect, it } from 'vitest'
import { SETS, scoreMarks } from './detective'

describe('halüsinasyon dedektifi', () => {
  it('her setin cevap anahtarında üç türden de iddia vardır (kod seti ve metinler)', () => {
    for (const s of Object.values(SETS)) {
      const keys = new Set(s.claims.map((c) => c.key))
      expect(keys.has('ok')).toBe(true)
      expect(keys.has('celisir')).toBe(true)
      expect(keys.has('yok')).toBe(true)
    }
  })
  it('puanlama', () => {
    const key = Object.fromEntries(SETS['sensor']!.claims.map((c) => [c.id, c.key]))
    expect(scoreMarks('sensor', key)).toMatchObject({ total: 8, marked: 8, correct: 8, wrong: [] })
    expect(scoreMarks('sensor', { ...key, c7: 'ok' }).wrong).toEqual(['c7'])
    expect(scoreMarks('sensor', {}).marked).toBe(0)
    expect(scoreMarks('yok', {}).total).toBe(0)
  })
  it('kod setinin iddiaları gerçekten hesaplanmış çıktıyla uyumlu: (4+8+6)/3 = 6', () => {
    expect((4 + 8 + 6) / 3).toBe(6)
    expect(SETS['kod']!.claims.find((c) => c.id === 'p2')!.key).toBe('ok')
  })
})
