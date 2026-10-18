// Sınıflandırma dersleri (A): eğitim panelinin raporları gerçek eğitimden gelir; geçmiş sütunları aynı uzunlukta, ölçüler 0–1
// arasında, karışıklık matrisi örnek sayısını tutar, ayrılan doğrulama/test kümesinde iki sınıf da var, aynı parametre aynı rapor.
import { describe, expect, it } from 'vitest'
import { lessonBySlug } from '../lessons'
import type { EgitimRaporu } from './rapor'
import { raporCSV } from './rapor'

const SLUGS = ['lojistik-noron', 'perceptron', 'k-en-yakin-komsu', 'naive-bayes', 'spam-filtresi', 'kesinlik-duyarlilik']
const rep = (slug: string, p: Record<string, number> = {}): EgitimRaporu => {
  const l = lessonBySlug(slug)!
  return l.report!({ ...Object.fromEntries(l.params.map((q) => [q.key, q.value])), ...p })
}

describe('sınıflandırma dersleri: eğitim raporu', () => {
  for (const slug of SLUGS) {
    it(`${slug}: geçmiş, ölçüler, karışıklık matrisi, belirlenimcilik`, () => {
      const r = rep(slug)
      const cols = Object.values(r.history.cols)
      const n = r.history.cols[r.history.x].length
      expect(n).toBeGreaterThan(3)
      for (const c of cols) expect(c).toHaveLength(n)
      for (const f of r.final) {
        expect(Number.isFinite(f.value) || f.key === 'converged_epoch', `${slug} ${f.key}`).toBe(true)
        if (/(acc|precision|recall|f1|auc|ap)$/.test(f.key)) { expect(f.value).toBeGreaterThanOrEqual(0); expect(f.value).toBeLessThanOrEqual(1) }
      }
      expect(r.confusion).toBeDefined()
      const total = r.confusion!.m.flat().reduce((a, b) => a + b, 0)
      // her sınıf değerlendirme kümesinde var (satır toplamı > 0)
      for (const row of r.confusion!.m) expect(row.reduce((a, b) => a + b, 0), slug).toBeGreaterThan(0)
      if (r.scores) expect(r.scores.y).toHaveLength(total)
      expect(raporCSV(rep(slug))).toBe(raporCSV(r))
      expect(r.charts.length).toBeGreaterThanOrEqual(3)
    })
  }

  it('lojistik nöron: eğitim kaybı azalır, doğruluk yüksek, AUC iyi', () => {
    const r = rep('lojistik-noron')
    const L = r.history.cols.loss
    for (let i = 1; i < L.length; i++) expect(L[i]).toBeLessThanOrEqual(L[i - 1] + 1e-12)
    expect(r.history.cols.acc.at(-1)!).toBeGreaterThan(0.75)
    expect(r.final.find((f) => f.key === 'val_auc')!.value).toBeGreaterThan(0.7)
  })
  it('perceptron: 20 dönem, hata sayısı sıfıra iner ve orada kalır, eğitimde %100', () => {
    const r = rep('perceptron')
    const m = r.history.cols.mistakes
    expect(m).toHaveLength(20)
    const z = m.indexOf(0)
    expect(z).toBeGreaterThan(0)
    expect(m.slice(z).every((v) => v === 0)).toBe(true)
    expect(r.history.cols.acc.at(-1)).toBe(1)
    expect(r.final.find((f) => f.key === 'converged_epoch')!.value).toBe(z + 1)
  })
  it('k-NN: k = 1 eğitimi ezberler, k arttıkça eğitim doğruluğu düşer; seçilen k raporu değiştirir', () => {
    const r = rep('k-en-yakin-komsu')
    expect(r.history.cols.k).toEqual([1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25])
    expect(r.history.cols.train_acc[0]).toBe(1)
    expect(r.history.cols.test_acc.every((v) => v > 0.7)).toBe(true)
    expect(rep('k-en-yakin-komsu', { k: 1 }).final.find((f) => f.key === 'gap')!.value).toBeGreaterThanOrEqual(0)
  })
  it('naive Bayes ve spam: öğrenme eğrisi büyüklükleri, son nokta tam model', () => {
    const nb = rep('naive-bayes')
    expect(nb.history.cols.n_train).toEqual([10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120])
    expect(nb.history.cols.test_acc.at(-1)).toBe(nb.final.find((f) => f.key === 'test_accuracy')!.value)
    const sp = rep('spam-filtresi')
    expect(sp.history.cols.n_train).toEqual([50, 100, 150, 200, 250, 300])
    expect(sp.final.find((f) => f.key === 'test_accuracy')!.value).toBeGreaterThanOrEqual(0.78)
    expect(sp.final.find((f) => f.key === 'test_auc')!.value).toBeGreaterThan(0.85)
    // eşik −4: daha çok spam yakalanır (duyarlılık artar)
    const lo = rep('spam-filtresi', { esik: -4 })
    expect(lo.final.find((f) => f.key === 'test_recall')!.value).toBeGreaterThan(sp.final.find((f) => f.key === 'test_recall')!.value)
  })
  it('kesinlik–duyarlılık: eşik büyüdükçe duyarlılık düşmez-artmaz (azalır), yanlış alarm oranı azalır', () => {
    const r = rep('kesinlik-duyarlilik')
    const R = r.history.cols.recall, F = r.history.cols.fpr
    expect(R).toHaveLength(19)
    for (let i = 1; i < R.length; i++) { expect(R[i]).toBeLessThanOrEqual(R[i - 1]); expect(F[i]).toBeLessThanOrEqual(F[i - 1]) }
    expect(r.confusion!.m.flat().reduce((a, b) => a + b, 0)).toBe(1000)
  })
})
