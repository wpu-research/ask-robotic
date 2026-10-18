// Zincir kuralı: halkaların çarpımı sayısal türevle aynı; 100 adımda kayıp çöker ve ağırlıklar gerçek değerlere (2, 3) yaklaşır.
import { describe, expect, it } from 'vitest'
import { START, ZINCIR_KURALI, servoData, zkGrad, zkLoss, zkTrain } from './zincir-kurali'

describe('zincir kuralı', () => {
  it('kareler geçerli: sayı > 3, her satır kod içinde', () => {
    for (const lr of [0.1, 0.5, 1.5]) {
      const f = ZINCIR_KURALI.run({ lr })
      expect(f.length).toBeGreaterThan(3)
      for (const q of f) expect(q.line).toBeLessThan(ZINCIR_KURALI.code.length)
    }
  })
  it('analitik gradyan = sayısal türev (1e-5 içinde), başta ve yol boyunca', () => {
    const { u, y } = servoData()
    const { path } = zkTrain(u, y, 0.5, 100)
    for (const [w1, w2] of [START, path[10], path[50], path[100]]) {
      const [g1, g2] = zkGrad(u, y, w1, w2), e = 1e-6
      const n1 = (zkLoss(u, y, w1 + e, w2) - zkLoss(u, y, w1 - e, w2)) / (2 * e)
      const n2 = (zkLoss(u, y, w1, w2 + e) - zkLoss(u, y, w1, w2 - e)) / (2 * e)
      expect(Math.abs(g1 - n1)).toBeLessThan(1e-5)
      expect(Math.abs(g2 - n2)).toBeLessThan(1e-5)
    }
    // sahnedeki ileri fark (dürtme) da 1e-5 içinde
    const f = ZINCIR_KURALI.run({ lr: 0.5 }).find((q) => q.phase === 'check')!
    console.log('dürtme', f.nudge!.toFixed(7), 'geri yayılım', f.g![0].toFixed(7))
    expect(Math.abs(f.nudge! - f.g![0])).toBeLessThan(1e-5)
  })
  it('zincirin halkalarının çarpımı, o noktanın katkısıdır', () => {
    const f = ZINCIR_KURALI.run({ lr: 0.5 }).find((q) => q.phase === 'g1')!
    const c = f.chain!
    expect(c.dPred * c.w2 * c.dh * c.u).toBeCloseTo(c.part, 12)
  })
  it('lr 0,5, 100 adım: kayıp başlangıcın %5’inin altına iner, ağırlıklar (2, 3) ± 0,5', () => {
    const { u, y } = servoData()
    const { path, losses } = zkTrain(u, y, 0.5, 100)
    console.log('kayıp', losses[0].toFixed(3), '→', losses[100].toFixed(4), 'w', path[100].map((v) => v.toFixed(3)))
    expect(losses[100]).toBeLessThan(0.05 * losses[0])
    expect(Math.abs(path[100][0] - 2)).toBeLessThan(0.5)
    expect(Math.abs(path[100][1] - 3)).toBeLessThan(0.5)
    // küçük öğrenme oranı 100 adımda oraya varamaz
    expect(zkTrain(u, y, 0.1, 100).losses[100]).toBeGreaterThan(losses[100])
  })
})
