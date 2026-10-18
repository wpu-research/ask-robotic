// Eğitim paneli raporları: doğrusal regresyon, küçük sinir ağı, Q-öğrenme ve k-means. Geçmiş uzunlukları, beklenen eğilimler
// (kaybın düşmesi, getirinin artması, inertia'nın k ile azalması) ve tekrarlanabilirlik.
import { describe, expect, it } from 'vitest'
import type { Lesson } from '../core'
import { REGRESSION } from '../regression'
import { MLP } from '../mlp'
import { Q_OGRENME } from '../q-ogrenme'
import { KMEANS } from '../kmeans'
import type { EgitimRaporu } from './rapor'

const BY: Record<string, Lesson> = Object.fromEntries([REGRESSION, MLP, Q_OGRENME, KMEANS].map((l) => [l.slug, l as unknown as Lesson]))
const rep = (slug: string, p: Record<string, number> = {}): EgitimRaporu => {
  const l = BY[slug]
  return l.report!({ ...Object.fromEntries(l.params.map((q) => [q.key, q.value])), ...p })
}
const fin = (r: EgitimRaporu, k: string) => r.final.find((f) => f.key === k)!.value
const lengthsEqual = (r: EgitimRaporu) => { const n = r.history.cols[r.history.x].length; for (const [k, v] of Object.entries(r.history.cols)) expect(v.length, k).toBe(n); return n }

describe('doğrusal regresyon raporu', () => {
  it('60 dönem; eğitim ve doğrulama kaybı düşer; doğrulamada R² yüksek; 30/10 ayrım', () => {
    const r = rep('dogrusal-regresyon')
    expect(lengthsEqual(r)).toBe(60)
    const { loss, val_loss, grad_norm } = r.history.cols
    for (let i = 1; i < 60; i++) expect(loss[i]).toBeLessThanOrEqual(loss[i - 1] + 1e-12)
    expect(val_loss[59]).toBeLessThan(val_loss[0] / 10)
    expect(grad_norm[59]).toBeLessThan(grad_norm[0])
    expect(fin(r, 'val_r2')).toBeGreaterThan(0.9)
    expect(r.hyper).toMatchObject({ train: 30, val: 10 })
    expect(fin(r, 'slope')).toBeCloseTo(0.21, 1)
  })
  it('öğrenme oranı > 1: kayıp patlar (ıraksama panelde de görünür)', () => {
    const r = rep('dogrusal-regresyon', { lr: 1.1 })
    expect(r.history.cols.loss[59]).toBeGreaterThan(r.history.cols.loss[0] * 100)
  })
})

describe('sinir ağı raporu', () => {
  it('41 kayıt; kayıp düşer, doğruluk yükselir; gradyan normları, ağırlık ve etkinleşme histogramları tutarlı', () => {
    const r = rep('sinir-agi')
    expect(lengthsEqual(r)).toBe(41)
    const { loss, val_loss, acc, val_acc } = r.history.cols
    expect(loss.at(-1)!).toBeLessThan(loss[0] / 3)
    expect(val_loss.at(-1)!).toBeLessThan(val_loss[0])
    expect(acc.at(-1)!).toBeGreaterThan(0.95); expect(val_acc.at(-1)!).toBeGreaterThan(0.9)
    expect(r.hyper).toMatchObject({ train: 160, val: 40 })
    const hists = r.charts.filter((c) => c.kind === 'hist')
    const w1 = hists.find((c) => c.id === 'w-hist-0')!, w2 = hists.find((c) => c.id === 'w-hist-1')!
    if (w1.kind !== 'hist' || w2.kind !== 'hist') throw new Error()
    expect(w1.frames.length).toBe(4)
    for (const f of w1.frames) expect(f.counts.reduce((a, v) => a + v, 0)).toBe(16)
    for (const f of w2.frames) expect(f.counts.reduce((a, v) => a + v, 0)).toBe(8)
    const act = hists.find((c) => c.id === 'act-hist')!
    if (act.kind !== 'hist') throw new Error()
    for (const f of act.frames) expect(f.counts.reduce((a, v) => a + v, 0)).toBe(200 * 8)
    expect(r.confusion!.m.flat().reduce((a, v) => a + v, 0)).toBe(40)
    expect(fin(r, 'val_auc')).toBeGreaterThan(0.9)
  })
  it('XOR: 4 nokta bölünmez (doğrulama = eğitim)', () => {
    const r = rep('sinir-agi', { veri: 1, H: 3 })
    expect(r.history.cols.loss).toEqual(r.history.cols.val_loss)
    expect(r.hyper.val).toBe(0)
  })
  it('aynı parametreler, aynı rapor', () => {
    expect(JSON.stringify(rep('sinir-agi'))).toBe(JSON.stringify(rep('sinir-agi')))
  })
})

describe('Q-öğrenme raporu', () => {
  it('oyun başına bir satır; getiri ortalaması artar; sonunda en kısa yol ve tahmin 18', () => {
    const r = rep('q-ogrenme')
    expect(lengthsEqual(r)).toBe(60)
    const { return: ret, return_ma, q_start, untried, shortest } = r.history.cols
    expect(ret.every((v, i) => v === -r.history.cols.steps[i])).toBe(true)
    expect(return_ma.at(-1)!).toBeGreaterThan(return_ma[0])
    expect(q_start.at(-1)).toBe(18)
    expect(shortest.at(-1)).toBe(1)
    for (let i = 1; i < untried.length; i++) expect(untried[i]).toBeLessThanOrEqual(untried[i - 1])
    const heat = r.charts.find((c) => c.id === 'q-heat')!
    if (heat.kind !== 'heat') throw new Error()
    expect(heat.values[0][0]).toBe(-18)
    expect(Number.isNaN(heat.values[0][3])).toBe(true) // raf
  })
})

describe('k-means raporu', () => {
  it('dirsek: k = 1…8, inertia k ile azalır; siluet k = 3’te en iyi; k = 3 gerçek nesnelerle birebir', () => {
    const r = rep('k-means')
    expect(lengthsEqual(r)).toBe(8)
    const { inertia, silhouette } = r.history.cols
    for (let i = 1; i < 8; i++) expect(inertia[i]).toBeLessThan(inertia[i - 1])
    expect(fin(r, 'best_k_silhouette')).toBe(3)
    expect(fin(r, 'purity')).toBe(1)
    expect(silhouette[2]).toBeCloseTo(fin(r, 'silhouette'), 9)
    // dirsekteki k = 3 değeri dersteki en iyi denemeyle aynı
    expect(inertia[2]).toBeCloseTo(fin(r, 'inertia'), 9)
  })
})
