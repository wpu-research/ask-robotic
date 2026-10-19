// SHAP: tam Shapley değerleri (16 koalisyon); katkılar tahmin − tabana tam eşit, doğrusal modelde katkı = w·(x − ortalama).
import { describe, expect, it } from 'vitest'
import { LIN_W, SHAP, battery, missions, shapley } from './shap-degerleri'

describe('SHAP değerleri', () => {
  it('kareler geçerli ve hızlı', () => {
    for (const model of [0, 1]) for (const sample of [0, 9, 11]) {
      const t0 = performance.now()
      const F = SHAP.run({ sample, model })
      expect(performance.now() - t0).toBeLessThan(600)
      expect(F.length).toBeGreaterThan(3)
      for (const f of F) expect(f.line).toBeLessThan(SHAP.code.length)
    }
  })
  it('katkıların toplamı = tahmin − taban (1e-9), her örnek ve iki model', () => {
    const { mu, samples } = missions()
    for (const model of [0, 1]) for (const x of samples) {
      const s = shapley((z) => battery(z, model), x, mu)
      expect(s.vals).toHaveLength(16)
      expect(Math.abs(s.phi.reduce((a, b) => a + b, 0) - (s.pred - s.base))).toBeLessThan(1e-9)
      expect(s.base).toBeCloseTo(battery(mu, model), 12)
    }
  })
  it('doğrusal modelde katkı = w·(x − ortalama)', () => {
    const { mu, samples } = missions()
    for (const x of samples) {
      const s = shapley((z) => battery(z, 1), x, mu)
      s.phi.forEach((p, j) => expect(Math.abs(p - LIN_W[j] * (x[j] - mu[j]))).toBeLessThan(1e-9))
    }
  })
  it('eğri modelde yük–eğim etkileşimi: katkı tek başına eklemeden farklı; sahne aynı sayıları gösterir', () => {
    const { mu, samples } = missions()
    const x = samples[9]
    const s = shapley((z) => battery(z, 0), x, mu)
    console.log('görev 9', x, 'taban', s.base.toFixed(2), 'tahmin', s.pred.toFixed(2), 'katkılar', s.phi.map((v) => v.toFixed(2)))
    expect(Math.abs(s.phi[0] - (s.vals[1] - s.vals[0]))).toBeGreaterThan(0.1)
    const fin = SHAP.run({ sample: 9, model: 0 }).find((f) => f.line === 22)!
    expect(fin.cap[1]).toContain(`prediction ${s.pred.toFixed(1)}`)
    expect(s.pred.toFixed(1)).toBe('65.6')
  })
})
