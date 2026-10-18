// Kesinlik–duyarlılık: eşik yükselince duyarlılık hiç artmaz (monoton azalır), F1 = 2PR/(P+R), sayılar sahneyle aynı.
import { describe, expect, it } from 'vitest'
import { KESINLIK_DUYARLILIK, inspection, metrics } from './kesinlik-duyarlilik'

describe('kesinlik–duyarlılık', () => {
  it('kareler geçerli ve hızlı', () => {
    for (const bad of [5, 20, 50]) {
      const t0 = performance.now()
      const F = KESINLIK_DUYARLILIK.run({ bad, thr: 0.5 })
      expect(performance.now() - t0).toBeLessThan(300)
      expect(F.length).toBeGreaterThan(3)
      for (const f of F) expect(f.line).toBeLessThan(KESINLIK_DUYARLILIK.code.length)
    }
  })
  it('eşik artınca duyarlılık monoton azalır, kesinlik genel olarak artar', () => {
    const d = inspection(20)
    expect(d.nBad).toBe(200)
    const c = d.curve
    for (let i = 1; i < c.length; i++) if (Number.isFinite(c[i].R)) expect(c[i].R).toBeLessThanOrEqual(c[i - 1].R)
    expect(c[10].R).toBeGreaterThan(c[90].R)
    expect(c[90].P).toBeGreaterThan(c[10].P)
    const m5 = metrics(d.score, d.y, 0.5)
    console.log('eşik 0,5', m5, 'eşik 0,1 R', c[10].R.toFixed(2), 'eşik 0,9 R', c[90].R.toFixed(2))
    expect(m5.tp + m5.fn).toBe(200)
    expect(m5.tp + m5.fp + m5.fn + m5.tn).toBe(1000)
  })
  it('F1 = 2PR / (P + R) her karede; sahne aynı sayıyı gösterir', () => {
    const F = KESINLIK_DUYARLILIK.run({ bad: 20, thr: 0.5 })
    for (const f of F) if (f.m && Number.isFinite(f.m.P)) {
      const { P, R, F1, tp, fp, fn } = f.m
      expect(P).toBeCloseTo(tp / (tp + fp), 12)
      expect(R).toBeCloseTo(tp / (tp + fn), 12)
      expect(F1).toBeCloseTo((2 * P * R) / (P + R), 12)
    }
    const last = F.at(-1)!
    expect(last.cap[1]).toContain(`F1 ${last.m!.F1.toFixed(2)}`)
  })
  it('az görülen sınıfta (%5) doğruluk yüksek ama kesinlik düşük', () => {
    const d = inspection(5)
    const m = metrics(d.score, d.y, 0.5)
    expect((m.tp + m.tn) / 1000).toBeGreaterThan(0.85)
    expect(m.P).toBeLessThan(0.4)
  })
})
