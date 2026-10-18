// Ders: yığın ve öbek. Yığın derinliği çağrı sayısına eşit; sınır aşılınca taşma karesi; closure sayacı değerini korur.
import { describe, expect, it } from 'vitest'
import { pathLength, SINIR, YIGIN_VE_OBEK } from './yigin-ve-obek'

describe('yigin-ve-obek', () => {
  it('kareler: sayı > 3, satırlar kod içinde', () => {
    for (const depth of [2, 10, 16, 17, 24]) {
      const F = YIGIN_VE_OBEK.run({ depth })
      expect(F.length).toBeGreaterThan(3)
      for (const f of F) expect(f.line).toBeLessThan(YIGIN_VE_OBEK.code.length)
    }
    expect(YIGIN_VE_OBEK.run({ depth: 10 }).length).toBeGreaterThanOrEqual(60)
  })
  it('yığın derinliği çağrı sayısıyla eşleşir (taşma yokken)', () => {
    for (const depth of [2, 5, 10, 16]) {
      const F = YIGIN_VE_OBEK.run({ depth })
      const deepest = Math.max(...F.filter((f) => f.mode === 'rec').map((f) => f.stack.filter((s) => s.fn.startsWith('uzunluk')).length))
      expect(deepest).toBe(depth)
      expect(F.some((f) => f.overflow)).toBe(false)
      const res = F.find((f) => f.result !== undefined)!.result!
      expect(res).toBeCloseTo(pathLength(depth), 9)
    }
    // Python çıktısıyla aynı: N = 10 → 22,9 m; N = 8 → 17,5 m
    expect(pathLength(10)).toBeCloseTo(22.9, 1)
    expect(pathLength(8)).toBeCloseTo(17.5, 1)
  })
  it(`sınır (${SINIR}) aşılınca taşma karesi üretilir`, () => {
    const F = YIGIN_VE_OBEK.run({ depth: SINIR + 1 })
    const ov = F.filter((f) => f.overflow)
    expect(ov.length).toBeGreaterThan(0)
    expect(ov[0].stack.filter((s) => s.fn.startsWith('uzunluk')).length).toBe(SINIR + 1)
    expect(ov[0].maxDepth).toBe(SINIR)
    expect(F.some((f) => f.result !== undefined)).toBe(false)
    expect(ov.at(-1)!.cap[0]).toMatch(/yığın taşması/)
  })
  it('closure: sayaç çağrılar arasında değeri korur, hücre çerçeveden uzun yaşar', () => {
    const F = YIGIN_VE_OBEK.run({ depth: 10 }).filter((f) => f.mode === 'clo')
    const last = F.at(-1)!
    expect(last.counts).toEqual([1, 2, 3])
    expect(last.heap.find((o) => o.kind === 'cell')!.label).toBe('cell: n = 3')
    const afterReturn = F.find((f) => f.line === 20)!
    expect(afterReturn.stack.some((s) => s.fn.startsWith('sayac_yap'))).toBe(false)
    expect(afterReturn.heap.some((o) => o.kind === 'cell')).toBe(true)
  })
})
