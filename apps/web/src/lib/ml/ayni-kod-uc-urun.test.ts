// Aynı kod, üç ürün: tek learn() fonksiyonu üç işte de gizli veride iyi sonuç verir; bölge işinde ağ tek nörondan belirgin iyi.
import { describe, expect, it } from 'vitest'
import { AYNI_KOD, currentJob, obstacleJob, runJob, zoneJob } from './ayni-kod-uc-urun'

describe('ayni-kod-uc-urun', () => {
  it('kare sayısı > 3, her satır kodun içinde, üç iş de sahnede', () => {
    const f = AYNI_KOD.run({ H: 6, lr: 1 })
    expect(f.length).toBeGreaterThan(3)
    for (const x of f) expect(x.line).toBeLessThan(AYNI_KOD.code.length)
    expect(new Set(f.map((x) => x.job))).toEqual(new Set([0, 1, 2]))
    expect(f.at(-1)!.results.every(Boolean)).toBe(true)
  })
  it('iş 1 (regresyon): gizli 6 ölçümde ortalama akım hatası < 0,1 A', () => {
    const { result, model } = runJob(currentJob(), 1)
    console.log('akım hatası (A)', result.score.toFixed(4), 'eğim A/kg', (model.w[0] / model.s[0]).toFixed(3))
    expect(result.score).toBeLessThan(0.1)
    expect(model.w[0] / model.s[0]).toBeCloseTo(0.42, 1)
  })
  it('iş 2 (tek nöron): gizli 15 anda engel doğruluğu ≥ %85', () => {
    const { result } = runJob(obstacleJob(), 1)
    console.log('engel', result.right, '/', result.n)
    expect(result.score).toBeGreaterThanOrEqual(0.85)
  })
  it('iş 3 (bölge): 6 gizli nöronlu ağ ≥ %90, tek nöron belirgin kötü (en az 15 puan)', () => {
    const net = runJob(zoneJob(6), 1).result, one = runJob(zoneJob(0), 1).result
    console.log('bölge ağ', net.score, 'tek nöron', one.score)
    expect(net.score).toBeGreaterThanOrEqual(0.9)
    expect(one.score).toBeLessThanOrEqual(0.85)
    expect(net.score - one.score).toBeGreaterThanOrEqual(0.15)
  })
  it('sahnedeki son yazı testteki sonuçlarla aynı kaynaktan', () => {
    const r = runJob(zoneJob(6), 1).result
    expect(AYNI_KOD.run({ H: 6, lr: 1 }).at(-1)!.stat![1]).toContain(`${r.right}/${r.n} right`)
  })
})
