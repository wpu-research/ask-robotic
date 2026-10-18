// Destek vektör makinesi: ayrılabilir veride hatasız; destek vektörleri kenarda (|f| = 1); C küçülünce marj genişler.
import { describe, expect, it } from 'vitest'
import { SVM, partsData, svmSummary, trainSvm } from './destek-vektor-makinesi'

describe('destek vektör makinesi', () => {
  it('kare sayısı ve kod satırları', () => {
    const f = SVM.run({ C: 1 })
    expect(f.length).toBeGreaterThan(3)
    for (const x of f) expect(x.line).toBeLessThan(SVM.code.length)
    for (const [c] of SVM.code) expect(c.length).toBeLessThanOrEqual(60)
  })
  it('ayrılabilir veride eğitim hatası 0; sahnedeki sonuç aynı', () => {
    const fit = trainSvm(partsData(), 1)
    const S = svmSummary(fit, 1)
    expect(S.errors).toBe(0)
    const last = SVM.run({ C: 1 }).at(-1)!
    expect(last.errors).toBe(0)
    expect(last.margin).toBeCloseTo(S.margin, 10)
  })
  it('destek vektörleri marjda: serbest olanlar |w·x + b| = 1 (1e-3 içinde), diğer noktalar y·f ≥ 1', () => {
    for (const C of [1, 2]) {
      const fit = trainSvm(partsData(), C)
      const S = svmSummary(fit, C)
      expect(S.free.length).toBeGreaterThanOrEqual(2)
      for (const i of S.free) expect(Math.abs(Math.abs(S.f[i]) - 1)).toBeLessThan(1e-3)
      // destek vektörü olmayanlar kenarın dışında
      fit.alpha.forEach((a, i) => { if (a <= 1e-6) expect(fit.y[i] * S.f[i]).toBeGreaterThan(1 - 1e-3) })
      // sınırdaki (α = C) destek vektörleri kenarın içinde ya da üstünde
      S.sv.filter((i) => !S.free.includes(i)).forEach((i) => expect(fit.y[i] * S.f[i]).toBeLessThan(1 + 1e-3))
    }
  })
  it('C küçükken marj geniş ve destek vektörü çok', () => {
    const m = (C: number) => svmSummary(trainSvm(partsData(), C), C)
    const small = m(0.05), big = m(1)
    console.log('svm marj', small.margin.toFixed(3), big.margin.toFixed(3), 'sv', small.sv.length, big.sv.length)
    expect(small.margin).toBeGreaterThan(big.margin * 1.4)
    expect(small.sv.length).toBeGreaterThan(big.sv.length * 2)
  })
})
