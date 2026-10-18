// Depoda nesne sınıflandırma projesi: veri tekrarlanabilir, üç model saklı nesnelerde yüksek doğrulukta, karışıklık matrisi
// tutarlı, "Kendin dene" iddiaları sayılarla doğru, metinler iki dilde dolu.
import { describe, expect, it } from 'vitest'
import { rng } from '../core'
import { BINS, DEPO_SINIFLANDIRMA, TOTAL, createDepo, fitTree, heldOutAccuracy, makeItems } from './depo-siniflandirma'
import { defaults } from './core'
import { LESSONS } from '../lessons'

const acc = (p: Record<string, number>) => Math.round(heldOutAccuracy(p) * 100)

describe('depo-siniflandirma', () => {
  it('aynı tohum aynı nesneler; dört kutu da var', () => {
    const a = makeItems(rng(7), 120, 0.3), b = makeItems(rng(7), 120, 0.3)
    expect(a).toEqual(b)
    expect(new Set(a.map((x) => x.c)).size).toBe(4)
    expect(new Set(a.map((x) => x.shape)).size).toBe(4)
  })
  it('varsayılan ayarlarda üç model de saklı nesnelerde %88’in üstünde', () => {
    for (const model of [0, 1, 2]) expect(heldOutAccuracy({ model }), `model ${model}`).toBeGreaterThan(0.88)
  })
  it('bant: 200 nesne ayrılır, karışıklık matrisi toplamı 200, köşegen = doğrular, doğruluk ≥ %85', () => {
    for (const model of [0, 1, 2]) {
      const r = createDepo({ ...defaults(DEPO_SINIFLANDIRMA), model })
      let guard = 0
      while (!r.done() && guard++ < 10000) r.step(8)
      expect(r.done()).toBe(true)
      const M = r.table!()!.rows.map((x) => x.cells)
      const sum = M.flat().reduce((a, b) => a + b, 0), diag = M.reduce((a, row, i) => a + row[i], 0)
      expect(sum).toBe(TOTAL)
      expect(r.view.binOk.reduce((a, b) => a + b, 0)).toBe(diag)
      expect(r.view.binBad.reduce((a, b) => a + b, 0)).toBe(TOTAL - diag)
      expect(diag / TOTAL).toBeGreaterThanOrEqual(0.85)
      expect(r.curves!()[0].values).toHaveLength(TOTAL)
    }
  })
  it('kendin dene 1: derinlik 1 → %48 ve iki kutu kullanılmaz; derinlik 3 → %92', () => {
    expect(acc({ model: 1, depth: 1 })).toBe(48)
    expect(acc({ model: 1, depth: 3 })).toBe(92)
    const root = fitTree(makeItems(rng(7), 120, 0.3), 1).root
    expect(root.leaf).toBe(false)
    expect(DEPO_SINIFLANDIRMA.task[0].tr).toMatch(/%48.*%92/)
  })
  it('kendin dene 2: gürültü 1 her modeli düşürür; hatalar çoğunlukla oyuncak/gıda/büyük koli arasında', () => {
    expect([0, 1, 2].map((model) => acc({ model }))).toEqual([92, 91, 92])
    expect([0, 1, 2].map((model) => acc({ model, noise: 1 }))).toEqual([85, 81, 87])
    const r = createDepo({ ...defaults(DEPO_SINIFLANDIRMA), noise: 1 })
    while (!r.done()) r.step(8)
    const M = r.table!()!.rows.map((x) => x.cells)
    const off = M.flat().reduce((a, b) => a + b, 0) - M.reduce((a, row, i) => a + row[i], 0)
    const among = [0, 2, 3].flatMap((i) => [0, 2, 3].filter((j) => j !== i).map((j) => M[i][j])).reduce((a, b) => a + b, 0)
    expect(among / off).toBeGreaterThan(0.6)
  })
  it('kendin dene 3: 20 etiketli örnekte k-NN %74, naive Bayes %86', () => {
    expect(acc({ model: 0, nTrain: 20 })).toBe(74)
    expect(acc({ model: 2, nTrain: 20 })).toBe(86)
  })
  it('metinler iki dilde dolu, dersler gerçek, kod satırları yorumlu, parametreler tutarlı', () => {
    const d = DEPO_SINIFLANDIRMA
    for (const b of [d.title, d.sub, d.story, d.goal, d.model, ...d.steps, ...d.task]) { expect(b.tr.length).toBeGreaterThan(5); expect(b.en.length).toBeGreaterThan(5) }
    for (const s of d.lessons) expect(LESSONS.some((l) => l.slug === s), s).toBe(true)
    expect(d.code.length).toBeGreaterThanOrEqual(15)
    for (const p of d.params) expect(p.value).toBeGreaterThanOrEqual(p.min)
    expect(BINS).toHaveLength(4)
    const r = d.create(defaults(d))
    r.step(400)
    for (const m of r.metrics()) { expect(m.value[0].length).toBeGreaterThan(0); expect(m.value[1].length).toBeGreaterThan(0) }
    expect(r.status()[1]).toMatch(/objects scanned/)
  })
})
