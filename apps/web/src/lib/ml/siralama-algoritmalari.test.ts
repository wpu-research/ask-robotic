// Sıralama: üç algoritma da doğru sıralar; ekleme ~n²/4, birleştirme ~n log2 n karşılaştırma yapar, taban hiç karşılaştırmaz.
import { describe, expect, it } from 'vitest'
import { SIRALAMA, insertionTrace, mergeTrace, naturalRuns, radixTrace, sonar } from './siralama-algoritmalari'

const sorted = (a: number[]) => a.slice().sort((x, y) => x - y)

describe('sıralama algoritmaları', () => {
  it('kareler: sayı > 3, her satır kodda var, kare sayısı makul', () => {
    for (const algo of [0, 1, 2]) for (const n of [8, 24, 48]) {
      const F = SIRALAMA.run({ algo, n })
      expect(F.length).toBeGreaterThan(3)
      expect(F.length).toBeLessThanOrEqual(400)
      for (const f of F) expect(f.line).toBeLessThan(SIRALAMA.code.length)
      expect(F.at(-1)!.arr).toEqual(sorted(sonar(n)))
    }
  })
  it('her algoritma her boyutta doğru sıralar', () => {
    for (let n = 2; n <= 48; n++) {
      const a = sonar(n), want = sorted(a)
      expect(insertionTrace(a).a).toEqual(want)
      expect(mergeTrace(a).a).toEqual(want)
      expect(radixTrace(a).a).toEqual(want)
    }
  })
  it('ekleme ~n²/4, birleştirme ~n log2 n, taban 0 karşılaştırma', () => {
    for (const n of [24, 48]) {
      const a = sonar(n)
      const ins = insertionTrace(a).comps, mer = mergeTrace(a).comps
      const q = (n * n) / 4, nl = n * Math.log2(n)
      console.log(`n=${n}: ekleme ${ins} (n²/4=${q}), birleştirme ${mer} (n log2 n=${nl.toFixed(0)})`)
      expect(ins).toBeGreaterThan(0.6 * q)
      expect(ins).toBeLessThan(1.5 * q)
      expect(mer).toBeGreaterThan(0.5 * nl)
      expect(mer).toBeLessThanOrEqual(nl)
      expect(radixTrace(a).comps).toBe(0)
      expect(radixTrace(a).writes).toBe(6 * n)
    }
    // n 12 → 48: ekleme ~16 kat, birleştirme ~7 kat (n log n)
    const r1 = insertionTrace(sonar(48)).comps / insertionTrace(sonar(12)).comps
    const r2 = mergeTrace(sonar(48)).comps / mergeTrace(sonar(12)).comps
    expect(r1).toBeGreaterThan(9)
    expect(r2).toBeLessThan(9)
    expect(r1).toBeGreaterThan(r2)
  })
  it('sıralı dizide ekleme n−1 karşılaştırma ve tek doğal parça (Timsort fikri)', () => {
    const s = sorted(sonar(30))
    expect(insertionTrace(s).comps).toBe(29)
    expect(naturalRuns(s)).toBe(1)
    expect(naturalRuns(sonar(30))).toBeGreaterThan(5)
  })
})
