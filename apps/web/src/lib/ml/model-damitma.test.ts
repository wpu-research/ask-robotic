// Model damıtma: aynı küçük veriyle, öğretmenin yumuşak çıktılarıyla eğitilen küçük öğrenci sert etiketle eğitilenden iyi.
import { describe, expect, it } from 'vitest'
import { MODEL_DAMITMA, distill, paramCount, softmax, teacher } from './model-damitma'

describe('model damıtma', () => {
  it('kareler ve kod satırları tutarlı', () => {
    for (const T of [1, 4, 8]) for (const n of [12, 24, 120]) {
      const F = MODEL_DAMITMA.run({ T, n })
      expect(F.length).toBeGreaterThanOrEqual(60)
      for (const f of F) expect(f.line).toBeLessThan(MODEL_DAMITMA.code.length)
    }
  })
  it('öğretmen büyük ve iyi; öğrenci 14 kat küçük', () => {
    const t = teacher()
    expect(paramCount(t.net)).toBe(387)
    expect(paramCount(distill(4, 24).hard)).toBe(27)
    expect(t.acc).toBeGreaterThan(0.8)
  })
  it('sıcaklık yumuşatır: T büyüdükçe en büyük olasılık küçülür', () => {
    const z = [2, 0.5, -1]
    expect(softmax(z, 1)[0]).toBeGreaterThan(softmax(z, 4)[0])
    expect(softmax(z, 4)[0]).toBeGreaterThan(softmax(z, 8)[0])
  })
  it('varsayılan (T = 4, 24 örnek): damıtılmış öğrenci sert etiketliden en az 10 puan iyi', () => {
    const d = distill(4, 24)
    const h = d.hardAcc.at(-1)!, s = d.softAcc.at(-1)!
    console.log('hard', h.toFixed(3), 'distilled', s.toFixed(3), 'teacher', d.t.acc.toFixed(3))
    expect(s).toBeGreaterThan(h + 0.1)
    expect(s).toBeGreaterThan(d.t.acc - 0.03) // öğretmene yaklaşır
  })
  it('her T ve her örnek sayısında damıtılmış ≥ sert etiketli; veri çoğaldıkça fark küçülür', () => {
    const gap = (n: number) => { const d = distill(4, n); return d.softAcc.at(-1)! - d.hardAcc.at(-1)! }
    for (const T of [1, 2, 4, 8]) for (const n of [12, 24, 48, 120]) {
      const d = distill(T, n)
      expect(d.softAcc.at(-1)!, `T=${T} n=${n}`).toBeGreaterThanOrEqual(d.hardAcc.at(-1)!)
    }
    expect(gap(120)).toBeLessThan(gap(24))
  })
})
