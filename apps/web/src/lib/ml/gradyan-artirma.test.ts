// Gradyan artırma: kayıp turlarla hiç artmaz; 100 turda başlangıcın %10'unun altına iner; kütük kalıntıya en iyi tek eşik.
import { describe, expect, it } from 'vitest'
import { GRADYAN_ARTIRMA, batteryData, boost, fitStump, gbPredict } from './gradyan-artirma'
import { mean } from './core'

describe('gradyan artırma', () => {
  it('kare sayısı ve kod satırları', () => {
    for (const p of [{ rounds: 100, lr: 0.1 }, { rounds: 1, lr: 0.1 }, { rounds: 200, lr: 1 }]) {
      const f = GRADYAN_ARTIRMA.run(p)
      expect(f.length).toBeGreaterThan(3)
      for (const x of f) expect(x.line).toBeLessThan(GRADYAN_ARTIRMA.code.length)
    }
    for (const [c] of GRADYAN_ARTIRMA.code) expect(c.length).toBeLessThanOrEqual(60)
  })
  it('kayıp her turda azalır (monoton) ve 100 turda başlangıcın %10’unun altında', () => {
    for (const lr of [0.1, 0.3, 1]) {
      const { loss } = boost(100, lr)
      for (let k = 1; k < loss.length; k++) expect(loss[k]).toBeLessThanOrEqual(loss[k - 1] + 1e-12)
      if (lr === 0.1) console.log('gb kayıp', loss[0].toFixed(2), '→', loss[100].toFixed(2), (loss[100] / loss[0]).toFixed(4))
      expect(loss[100]).toBeLessThan(0.1 * loss[0])
    }
  })
  it('model tahmini kayıp dizisiyle tutarlı ve sahnedeki son yazı aynı sayıyı verir', () => {
    const g = boost(100, 0.1)
    const mse = mean(g.T.map((x, i) => (g.y[i] - gbPredict(g.F0, 0.1, g.stumps, 100, x)) ** 2))
    expect(mse).toBeCloseTo(g.loss[100], 9)
    expect(GRADYAN_ARTIRMA.run({ rounds: 100, lr: 0.1 }).at(-1)!.cap[0]).toContain(g.loss[100].toFixed(2).replace('.', ','))
  })
  it('kütük: kaba kuvvetle bulunan en iyi eşikle aynı kare hata', () => {
    const { T, y } = batteryData()
    const r = y.map((v) => v - mean(y))
    const s = fitStump(T, r)
    const sse = (t: number) => { const L = r.filter((_, i) => T[i] <= t), R = r.filter((_, i) => T[i] > t); const a = mean(L), b = mean(R); return L.reduce((q, v) => q + (v - a) ** 2, 0) + R.reduce((q, v) => q + (v - b) ** 2, 0) }
    let best = Infinity
    for (let k = 0; k < T.length - 1; k++) best = Math.min(best, sse((T[k] + T[k + 1]) / 2))
    expect(sse(s.t)).toBeCloseTo(best, 8)
  })
})
