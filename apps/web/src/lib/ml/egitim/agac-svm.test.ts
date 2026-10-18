// Eğitim paneli: karar ağacı, rastgele orman, gradyan artırma, SVM ve Boruta raporları gerçek eğitimden gelir; geçmiş
// uzunlukları, ölçü aralıkları, karışıklık matrisi toplamları, beklenen eğilimler ve aynı parametreyle aynı sonuç denetlenir.
import { describe, expect, it } from 'vitest'
import type { EgitimRaporu } from './rapor'
import { treeReport, lineData, grow, treePredict, creditData } from '../tree'
import { forestReport, buildForest } from '../rastgele-orman'
import { boostReport } from '../gradyan-artirma'
import { svmReport } from '../destek-vektor-makinesi'
import { borutaReport, REAL } from '../boruta'

function ortak(r: EgitimRaporu) {
  const cols = Object.values(r.history.cols)
  const n = r.history.cols[r.history.x].length
  expect(n).toBeGreaterThan(2)
  for (const c of cols) expect(c.length).toBe(n)
  for (const f of r.final) if (f.fmt === 'pct') { expect(f.value).toBeGreaterThanOrEqual(0); expect(f.value).toBeLessThanOrEqual(1) }
  expect(new Set(r.charts.map((c) => c.id)).size).toBe(r.charts.length)
  return n
}
const fin = (r: EgitimRaporu, k: string) => r.final.find((f) => f.key === k)!.value
const sum = (m: number[][]) => m.flat().reduce((a, b) => a + b, 0)

describe('eğitim paneli: ağaçlar, SVM, Boruta', () => {
  it('karar ağacı: derinlik 1…10, eğitim doğruluğu artar, kırpılmış ağaç grow ile aynı', () => {
    const r = treeReport({ depth: 3, veri: 0 })
    expect(ortak(r)).toBe(10)
    const tr = r.history.cols.train_acc
    for (let i = 1; i < tr.length; i++) expect(tr[i]).toBeGreaterThanOrEqual(tr[i - 1] - 1e-12)
    expect(sum(r.confusion!.m)).toBe(80)
    // derinlik 3'teki test doğruluğu, doğrudan grow(X, 3) ağacınınkiyle aynı
    const X = lineData(), T = lineData(57, 80)
    const t3 = grow(X, 3, { x0: 0, x1: 1, y0: 0, y1: 1 }, () => {})
    expect(fin(r, 'test_accuracy')).toBeCloseTo(T.filter((p) => treePredict(t3, p.x, p.y) === p.c).length / 80, 12)
    expect(r.history.cols.test_acc[2]).toBeCloseTo(fin(r, 'test_accuracy'), 12)
  })
  it('karar ağacı (kredi): yaprak olasılığıyla ROC AUC anlamlı, derin ağaçta eğitim–test farkı büyür', () => {
    const r = treeReport({ depth: 3, veri: 1 })
    ortak(r)
    expect(sum(r.confusion!.m)).toBe(creditData().length - 400)
    expect(fin(r, 'test_auc')).toBeGreaterThan(0.75)
    const d = treeReport({ depth: 10, veri: 1 })
    expect(fin(d, 'gap')).toBeGreaterThan(fin(r, 'gap'))
  })
  it('rastgele orman: 25 satır, test doğruluğu buildForest ile aynı, OOB makul, orman tek ağaçtan iyi', () => {
    const r = forestReport({ trees: 25 })
    expect(ortak(r)).toBe(25)
    expect(r.history.cols.test_acc).toEqual(buildForest(25).acc)
    expect(fin(r, 'test_accuracy')).toBeCloseTo(r.history.cols.test_acc[24], 12)
    const oob = fin(r, 'oob_accuracy')
    expect(Math.abs(oob - fin(r, 'test_accuracy'))).toBeLessThan(0.08)
    expect(fin(r, 'test_accuracy')).toBeGreaterThan(fin(r, 'single_tree_mean'))
    expect(sum(r.confusion!.m)).toBe(1000)
    expect(fin(r, 'test_auc')).toBeGreaterThan(0.8)
  })
  it('gradyan artırma: tur 0…R, eğitim kaybı monoton azalır, doğrulama R² yüksek', () => {
    const r = boostReport({ rounds: 100, lr: 0.1 })
    expect(ortak(r)).toBe(101)
    const L = r.history.cols.loss
    for (let i = 1; i < L.length; i++) expect(L[i]).toBeLessThanOrEqual(L[i - 1] + 1e-9)
    expect(L[100]).toBeLessThan(L[0] * 0.15)
    expect(fin(r, 'val_r2')).toBeGreaterThan(0.8)
    expect(r.hyper.train).toBe(60)
  })
  it('SVM: 50 dönem, ayrılabilir veride doğrulama doğruluğu yüksek, ROC AUC ~1, iki sınıf da doğrulamada', () => {
    const r = svmReport({ C: 1 })
    expect(ortak(r)).toBe(50)
    expect(sum(r.confusion!.m)).toBe(20)
    expect(r.confusion!.m[0].reduce((a, b) => a + b, 0)).toBe(10)
    expect(fin(r, 'train_accuracy')).toBe(1)
    expect(fin(r, 'val_accuracy')).toBeGreaterThanOrEqual(0.9)
    expect(fin(r, 'val_auc')).toBeGreaterThan(0.95)
    const L = r.history.cols.loss
    expect(L[49]).toBeLessThanOrEqual(L[0] + 1e-9)
    // C küçülünce marj genişler
    expect(fin(svmReport({ C: 0.05 }), 'margin')).toBeGreaterThan(fin(r, 'margin'))
  })
  it('Boruta: tur başına 8 önem + gölge; 3 gerçek sensör kabul, seçimle doğrulama doğruluğu 8 sensörden geri kalmaz', () => {
    const r = borutaReport({ rounds: 20 })
    expect(ortak(r)).toBe(20)
    expect(Object.keys(r.history.cols)).toEqual(['round', ...Array.from({ length: 8 }, (_, j) => `imp_${j}`), 'shadow_max', 'n_hits'])
    expect(fin(r, 'accepted')).toBe(REAL.length)
    expect(fin(r, 'selection_precision')).toBe(1)
    expect(fin(r, 'val_accuracy')).toBeGreaterThanOrEqual(fin(r, 'val_accuracy_all8') - 0.03)
    expect(sum(r.confusion!.m)).toBe(75)
  })
  it('aynı parametre aynı rapor (tohum sabit)', () => {
    for (const f of [() => treeReport({ depth: 4, veri: 0 }), () => forestReport({ trees: 7 }), () => boostReport({ rounds: 30, lr: 0.2 }), () => svmReport({ C: 0.5 }), () => borutaReport({ rounds: 6 })]) {
      expect(JSON.stringify(f().history)).toBe(JSON.stringify(f().history))
    }
  })
})
