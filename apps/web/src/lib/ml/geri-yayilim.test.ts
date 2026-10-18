// Geri yayılım: analitik gradyan, ağırlığı oynatıp ölçülen eğimle aynı; 60 adımda çıktı hedefe (1,0) yaklaşır.
import { describe, expect, it } from 'vitest'
import { GERI_YAYILIM, backprop, numericGrads, trainBp, W1_0, W2_0 } from './geri-yayilim'

describe('geri yayılım', () => {
  it('kareler geçerli: sayı > 3, her satır kod içinde', () => {
    for (const lr of [0.5, 3, 6]) {
      const f = GERI_YAYILIM.run({ lr })
      expect(f.length).toBeGreaterThan(3)
      for (const q of f) expect(q.line).toBeLessThan(GERI_YAYILIM.code.length)
    }
  })
  it('ilk çıktı ≈ 0,70, kayıp ≈ 0,09; altı gradyan da negatif', () => {
    const g = backprop(W1_0, W2_0)
    console.log('çıktı', g.o.toFixed(4), 'kayıp', g.loss.toFixed(4), 'gW1', g.gW1.flat().map((v) => v.toFixed(6)), 'gW2', g.gW2.map((v) => v.toFixed(6)))
    expect(g.o).toBeCloseTo(0.70, 2)
    expect(g.loss).toBeCloseTo(0.09, 2)
    for (const v of [...g.gW1.flat(), ...g.gW2]) expect(v).toBeLessThan(0)
  })
  it('analitik gradyan = sayısal türev (1e-6 içinde), başta ve eğitim boyunca', () => {
    for (const h of trainBp(3, 60).filter((_, i) => i % 15 === 0)) {
      const g = backprop(h.W1, h.W2), num = numericGrads(h.W1, h.W2)
      const ana = [...g.gW1.flat(), ...g.gW2]
      const gap = Math.max(...ana.map((a, i) => Math.abs(a - num[i])))
      console.log('en büyük fark', gap.toExponential(2))
      expect(gap).toBeLessThan(1e-6)
    }
  })
  it('lr 3: 1 adımda ≈ 0,769, 60 adımda > 0,95', () => {
    const h = trainBp(3, 60)
    console.log('adım 1', h[1].g.o.toFixed(4), 'adım 60', h[60].g.o.toFixed(4), 'kayıp', h[60].g.loss.toFixed(5))
    expect(h[1].g.o).toBeCloseTo(0.769, 2)
    expect(h[60].g.o).toBeGreaterThan(0.95)
    expect(h[60].g.loss).toBeLessThan(0.01 * 0.3)
    expect(GERI_YAYILIM.run({ lr: 3 }).at(-1)!.g.o).toBeGreaterThan(0.95)
    // küçük öğrenme oranı 60 adımda hedefe varamaz
    expect(trainBp(0.5, 60)[60].g.o).toBeLessThan(0.95)
  })
})
