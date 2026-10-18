// İkili arama: her hedef bulunur, adım sayısı ⌈log2(n+1)⌉'i geçmez; doğrusal arama ile karşılaştırma sahnedekiyle aynı.
import { describe, expect, it } from 'vitest'
import { IKILI_ARAMA, TABLE, bisect, bound, linearComps } from './ikili-arama'

describe('ikili arama', () => {
  it('kareler: sayı > 3, her satır kodda var', () => {
    for (const n of [4, 32, 64]) {
      const F = IKILI_ARAMA.run({ x: TABLE[21], n })
      expect(F.length).toBeGreaterThan(3)
      for (const f of F) expect(f.line).toBeLessThan(IKILI_ARAMA.code.length)
    }
  })
  it('tablo kesin artan', () => {
    for (let i = 1; i < 64; i++) expect(TABLE[i]).toBeGreaterThan(TABLE[i - 1])
  })
  it('her n için tablodaki her değeri bulur, adım ≤ ⌈log2(n+1)⌉', () => {
    for (let n = 1; n <= 64; n++) {
      for (let i = 0; i < n; i++) {
        const b = bisect(TABLE, n, TABLE[i])
        expect(b.found).toBe(true)
        expect(b.lo).toBe(i)
        expect(b.steps.length).toBeLessThanOrEqual(bound(n))
      }
    }
  })
  it('tabloda olmayan değer için doğru ekleme noktası', () => {
    for (let x = 0; x <= 1000; x += 7) {
      const b = bisect(TABLE, 64, x)
      const want = TABLE.findIndex((v) => v >= x)
      expect(b.lo).toBe(want < 0 ? 64 : want)
      expect(b.steps.length).toBeLessThanOrEqual(7)
    }
  })
  it('64 satırda ikili en çok 7, doğrusal ortalama ~32 karşılaştırma; son kare aynı sayıları gösterir', () => {
    const avg = TABLE.reduce((s, v) => s + linearComps(TABLE, 64, v), 0) / 64
    expect(avg).toBeCloseTo(32.5, 5)
    const last = IKILI_ARAMA.run({ x: TABLE[21], n: 32 }).at(-1)!
    expect(last.found).toBe(true)
    expect(last.res).toBe(21)
    expect(last.ls).toBe(22)
    expect(last.bs).toBe(bisect(TABLE, 32, TABLE[21]).steps.length)
    expect(last.bs).toBeLessThanOrEqual(bound(32))
  })
})
