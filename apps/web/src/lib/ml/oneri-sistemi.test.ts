// Öneri sistemi: matris ayrıştırma gizli beğenileri rastgeleden belirgin iyi, mümkün en iyinin altında tahmin eder.
import { describe, expect, it } from 'vitest'
import { ONERI_SISTEMI, factorize, workshopData } from './oneri-sistemi'

describe('öneri sistemi', () => {
  it('kareler geçerli ve hızlı', () => {
    for (const k of [1, 2, 4]) {
      const t0 = performance.now()
      const F = ONERI_SISTEMI.run({ rounds: 200, k })
      expect(performance.now() - t0).toBeLessThan(1600)
      expect(F.length).toBeGreaterThan(3)
      expect(F.length).toBeLessThanOrEqual(400)
      for (const f of F) expect(f.line).toBeLessThan(ONERI_SISTEMI.code.length)
    }
  })
  it('veri: 300 öğrenci × 12 proje = 3600 deneme (3000 eğitim, 600 gizli)', () => {
    const d = workshopData()
    expect(d.train.length).toBe(3000)
    expect(d.test.length).toBe(600)
    expect(d.seen.every((s) => s.size === 12)).toBe(true)
  })
  it('gizli beğenilerde doğruluk ≥ %75, rastgeleden yüksek, mümkün en iyinin altında; ilk 3 öneri rastgeleden çok iyi', () => {
    const d = workshopData()
    const r = factorize(d, 2, 100)
    const acc = r.acc.at(-1)!
    console.log('öneri', { acc, bayes: d.bayes, top3: r.top3, rand: r.rand, k1: factorize(d, 1, 100).acc.at(-1) })
    expect(acc).toBeGreaterThanOrEqual(0.75)
    expect(acc).toBeLessThan(d.bayes)
    expect(r.rand).toBeGreaterThan(0.4)
    expect(r.rand).toBeLessThan(0.6)
    expect(r.top3).toBeGreaterThan(0.9)
    // tek gizli boyut iki boyutlu zevki yakalayamaz
    expect(factorize(d, 1, 100).acc.at(-1)!).toBeLessThan(acc)
    // sahnedeki son kare aynı sayıyı söyler
    expect(ONERI_SISTEMI.run({ rounds: 100, k: 2 }).at(-1)!.cap[1]).toContain(`${(100 * acc).toFixed(1)}%`)
  })
})
