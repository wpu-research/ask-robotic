// Gradyan inişi: öğrenme oranı 0,05 dibe oturur, 0,1 patlar, 0,0002 sürünür (sayılar sahnedekiyle aynı kaynaktan).
import { describe, expect, it } from 'vitest'
import { GRADYAN_INISI, STARTS, descend, driftData, gradAt, lossAt } from './gradyan-inisi'

describe('gradyan inişi', () => {
  it('kareler geçerli: sayı > 3, her satır kod içinde', () => {
    for (const lr of [0.0002, 0.05, 0.1]) for (let start = 0; start < 4; start++) {
      const f = GRADYAN_INISI.run({ lr, start })
      expect(f.length).toBeGreaterThan(3)
      for (const q of f) expect(q.line).toBeLessThan(GRADYAN_INISI.code.length)
    }
  })
  it('türev, sayısal eğimle aynı', () => {
    const { x, y } = driftData()
    const [gw, gb] = gradAt(x, y, -1, 6), e = 1e-6
    expect(gw).toBeCloseTo((lossAt(x, y, -1 + e, 6) - lossAt(x, y, -1 - e, 6)) / (2 * e), 5)
    expect(gb).toBeCloseTo((lossAt(x, y, -1, 6 + e) - lossAt(x, y, -1, 6 - e)) / (2 * e), 5)
  })
  it('0,05: her başlangıçtan kayıp ilk değerin %1’inin altına iner, gerçek doğruya (1,5 · x + 1) yaklaşır', () => {
    const { x, y } = driftData()
    for (const s of STARTS) {
      const g = descend(x, y, 0.05, s, 300)
      console.log('lr 0.05', s, g.losses[0].toFixed(2), '→', g.losses.at(-1)!.toFixed(4), g.path.at(-1)!.map((v) => v.toFixed(2)))
      expect(g.blown).toBe(false)
      expect(g.losses.at(-1)!).toBeLessThan(0.01 * g.losses[0])
      expect(Math.abs(g.path.at(-1)![0] - 1.5)).toBeLessThan(0.3)
    }
  })
  it('0,1: vadinin üstünden atlar ve ıraksar', () => {
    const { x, y } = driftData()
    const g = descend(x, y, 0.1, STARTS[0], 300)
    console.log('lr 0.1 patladı, adım', g.path.length, 'son kayıp', g.losses.at(-1)!.toExponential(2))
    expect(g.blown).toBe(true)
    expect(g.losses.at(-1)!).toBeGreaterThan(1e6)
    expect(GRADYAN_INISI.run({ lr: 0.1, start: 0 }).at(-1)!.blown).toBe(true)
  })
  it('0,0002: 300 adımda hâlâ yüksek (0,05’in sonucunun 10 katından fazla)', () => {
    const { x, y } = driftData()
    const slow = descend(x, y, 0.0002, STARTS[0], 300), good = descend(x, y, 0.05, STARTS[0], 300)
    console.log('lr 0.0002 son kayıp', slow.losses.at(-1)!.toFixed(3), 'lr 0.05', good.losses.at(-1)!.toFixed(4))
    expect(slow.blown).toBe(false)
    expect(slow.losses.at(-1)!).toBeGreaterThan(10 * good.losses.at(-1)!)
    expect(slow.losses.at(-1)!).toBeGreaterThan(1)
  })
})
