import { describe, expect, it } from 'vitest'
import { blinkMetrics, checkFill, checkNumeric, checkOrder, goalMet, ohmMetrics, seededShuffle, splitBlanks } from './steps'

describe('adım kontrolleri', () => {
  it('sayısal tolerans', () => {
    const s = { kind: 'numeric' as const, prompt: 'p', why: 'w', answer: 15, tolerance: 1 }
    expect(checkNumeric(s, 15.9)).toBe(true)
    expect(checkNumeric(s, 16.2)).toBe(false)
  })
  it('boşluk doldurma ve sıralama', () => {
    const f = { kind: 'fill' as const, prompt: 'p', why: 'w', code: 'digitalWrite(___, ___);', tokens: ['13', 'HIGH', 'LOW'], answer: ['13', 'HIGH'] }
    expect(splitBlanks(f.code)).toHaveLength(3)
    expect(checkFill(f, ['13', 'HIGH'])).toBe(true)
    expect(checkFill(f, ['13', null])).toBe(false)
    const o = { kind: 'order' as const, prompt: 'p', why: 'w', lines: ['a', 'b', 'c'] }
    expect(checkOrder(o, ['a', 'b', 'c'])).toBe(true)
    expect(checkOrder(o, ['b', 'a', 'c'])).toBe(false)
  })
})

describe('widget metrikleri', () => {
  it('Ohm: 5 V, 150 Ω, LED → 20 mA', () => {
    expect(ohmMetrics(5, 150, true)).toMatchObject({ I_mA: 20, ledOn: 1 })
    expect(ohmMetrics(5, 1000, false).I_mA).toBe(5)
    expect(ohmMetrics(1.5, 100, true)).toMatchObject({ I_mA: 0, ledOn: 0 })
  })
  it('blink: 500/500 → 1 Hz, %50', () => {
    expect(blinkMetrics(500, 500)).toEqual({ onMs: 500, offMs: 500, periodMs: 1000, hz: 1, duty: 50 })
  })
  it('hedef aralığı uçları dahil', () => {
    expect(goalMet({ label: 'x', metric: 'I_mA', min: 10, max: 20 }, { I_mA: 20 })).toBe(true)
    expect(goalMet({ label: 'x', metric: 'I_mA', max: 20 }, { I_mA: 20.1 })).toBe(false)
    expect(goalMet({ label: 'x', metric: 'yok', min: 0 }, {})).toBe(false)
  })
})

describe('karıştırma', () => {
  it('tohumlu, kararlı ve hiçbir zaman doğru sıra değil', () => {
    for (let seed = 0; seed < 50; seed++) {
      const a = seededShuffle(['1', '2', '3'], seed)
      expect(a).toEqual(seededShuffle(['1', '2', '3'], seed))
      expect(a).not.toEqual(['1', '2', '3'])
      expect([...a].sort()).toEqual(['1', '2', '3'])
    }
  })
})
