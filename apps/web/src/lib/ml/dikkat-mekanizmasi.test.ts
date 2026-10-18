// Dikkat mekanizması: softmax satırları 1'e toplanır; "o" zamiri cümlenin sonuna göre doğru öncüle bakar.
import { describe, expect, it } from 'vitest'
import { DIKKAT, attention } from './dikkat-mekanizmasi'

describe('dikkat mekanizması', () => {
  it('kareler ve kod satırları tutarlı', () => {
    for (const q of [1, 5, 6]) for (const tau of [0.25, 1, 3]) for (const variant of [0, 1]) {
      const F = DIKKAT.run({ q, tau, variant })
      expect(F.length).toBeGreaterThanOrEqual(60)
      for (const f of F) expect(f.line).toBeLessThan(DIKKAT.code.length)
    }
  })
  it('her satırın toplamı 1 ve her ağırlık 0 ile 1 arasında (her τ için)', () => {
    for (const tau of [0.25, 0.5, 1, 2, 3]) for (const v of [0, 1]) {
      const { A } = attention(v, tau)
      for (const row of A) {
        expect(row.reduce((s, x) => s + x, 0)).toBeCloseTo(1, 12)
        for (const x of row) { expect(x).toBeGreaterThan(0); expect(x).toBeLessThan(1) }
      }
    }
  })
  it('"o hafifti": "o" en çok "kutuyu"ya bakar (%59, Python ile aynı); "o güçlüydü": robota', () => {
    const a = attention(0, 1).A[4]
    console.log('o (hafifti):', a.map((x) => x.toFixed(2)).join(' '))
    expect(a.indexOf(Math.max(...a))).toBe(1)
    expect(a[1]).toBeCloseTo(0.59, 2)
    const b = attention(1, 1).A[4]
    expect(b.indexOf(Math.max(...b))).toBe(0)
    expect(b[0]).toBeGreaterThan(2 * Math.max(...b.slice(1)))
    // yeni vektör: "hafifti"de nesne bileşeni baskın, "güçlüydü"de ajan
    const o0 = attention(0, 1).out[4], o1 = attention(1, 1).out[4]
    expect(o0[1]).toBeCloseTo(0.66, 2)
    expect(o1[0]).toBeGreaterThan(o1[1])
  })
  it('sıcaklık: küçük τ keskinleştirir, büyük τ düzleştirir (öncüle verilen ağırlık τ ile azalır)', () => {
    const w = [0.25, 0.5, 1, 2, 3].map((t) => attention(0, t).A[4][1])
    for (let i = 1; i < w.length; i++) expect(w[i]).toBeLessThan(w[i - 1])
    expect(w[0]).toBeGreaterThan(0.95)
    expect(w[4]).toBeLessThan(0.35)
  })
})
