// Yüz doğrulama: eşik arttıkça FAR azalır, FRR artar (monoton); varsayılan eşikte ikisi de %10'un altında.
import { describe, expect, it } from 'vitest'
import { YUZ_DOGRULAMA, embeddings, pairScores, rate, sweep } from './yuz-dogrulama'

describe('yüz doğrulama', () => {
  it('kareler ve kod satırları tutarlı', () => {
    const f = YUZ_DOGRULAMA.run({ th: 0.42 })
    expect(f.length).toBeGreaterThan(3)
    for (const x of f) expect(x.line).toBeLessThan(YUZ_DOGRULAMA.code.length)
  })
  it('630 aynı kişi, 3375 farklı kişi çifti; vektörler birim uzunlukta', () => {
    const { X, lab } = embeddings()
    const { gen, imp } = pairScores(X, lab)
    expect(gen).toHaveLength(630)
    expect(imp).toHaveLength(3375)
    for (const x of X) expect(Math.hypot(...x)).toBeCloseTo(1, 9)
    const m = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length
    expect(m(gen)).toBeGreaterThan(m(imp) + 0.25)
  })
  it('eşik süpürme: FAR azalır, FRR artar; varsayılan eşikte ikisi de < %10', () => {
    const { X, lab } = embeddings()
    const { gen, imp } = pairScores(X, lab)
    const sw = sweep(gen, imp)
    for (let k = 1; k < sw.th.length; k++) {
      expect(sw.far[k]).toBeLessThanOrEqual(sw.far[k - 1])
      expect(sw.frr[k]).toBeGreaterThanOrEqual(sw.frr[k - 1])
    }
    expect(sw.far[0]).toBeGreaterThan(0.5)
    expect(sw.frr[100]).toBe(1)
    const q = rate(gen, imp, 0.42)
    console.log('th 0.42', q, 'eer', sw.eer, 'th 0.3', rate(gen, imp, 0.3), 'th 0.55', rate(gen, imp, 0.55))
    expect(q.far).toBeLessThan(0.1)
    expect(q.frr).toBeLessThan(0.1)
    expect(rate(gen, imp, 0.3).far).toBeGreaterThan(q.far)
    expect(rate(gen, imp, 0.55).frr).toBeGreaterThan(q.frr)
  })
  it('kapıda: kişi 3 kabul, kişi 5 ret', () => {
    const f = YUZ_DOGRULAMA.run({ th: 0.42 }).filter((x) => x.attempt)
    console.log(f.map((x) => `${x.attempt!.who}:${x.attempt!.cos.toFixed(3)}:${x.attempt!.ok}`))
    expect(f[0].attempt!.ok).toBe(true)
    expect(f[1].attempt!.ok).toBe(false)
  })
})
