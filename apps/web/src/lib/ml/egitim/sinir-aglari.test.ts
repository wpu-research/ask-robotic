// Eğitim paneli: sinir ağı / optimizasyon dersleri (geri yayılım, gradyan inişi, aşırı öğrenme, rakam tanıma, model damıtma).
// Geçmiş sütunları aynı uzunlukta, kayıplar beklendiği yerde düşüyor, histogram sayıları ağırlık sayısına eşit, rapor deterministik.
import { describe, expect, it } from 'vitest'
import type { EgitimRaporu } from './rapor'
import { geriYayilimReport } from '../geri-yayilim'
import { gradyanInisiReport } from '../gradyan-inisi'
import { overfitReport } from '../overfit'
import { rakamReport, PIX } from '../rakam-tanima'
import { damitmaReport } from '../model-damitma'
import { lessonBySlug } from '../lessons'

const sameLengths = (r: EgitimRaporu) => {
  const n = r.history.cols[r.history.x].length
  for (const [k, v] of Object.entries(r.history.cols)) expect(v.length, k).toBe(n)
  return n
}
const fin = (r: EgitimRaporu, k: string) => r.final.find((f) => f.key === k)!.value

describe('eğitim paneli: sinir ağı dersleri', () => {
  it('derslere bağlı', () => {
    for (const s of ['geri-yayilim', 'gradyan-inisi', 'asiri-ogrenme', 'rakam-tanima', 'model-damitma']) expect(typeof lessonBySlug(s)?.report, s).toBe('function')
    expect(lessonBySlug('aktivasyon-fonksiyonlari')?.report).toBeUndefined()
  })

  it('geri yayılım: 61 adım, kayıp düşer, gradyan kontrolü tutar', () => {
    const r = geriYayilimReport({ lr: 3 })
    expect(sameLengths(r)).toBe(61)
    const L = r.history.cols.loss
    for (let i = 1; i < L.length; i++) expect(L[i]).toBeLessThan(L[i - 1])
    expect(r.history.cols.output.at(-1)!).toBeCloseTo(0.968, 3)
    expect(fin(r, 'grad_check')).toBeLessThan(1e-8)
    expect(r.history.cols.grad_norm_W1.every((v) => v > 0)).toBe(true)
  })

  it('gradyan inişi: 300 adım, kayıp düşer; büyük lr patlar ve geçmiş kısalır', () => {
    const r = gradyanInisiReport({ lr: 0.05, start: 0 })
    expect(sameLengths(r)).toBe(300)
    const L = r.history.cols.loss
    expect(L.at(-1)!).toBeLessThan(0.01 * L[0])
    expect(fin(r, 'diverged')).toBe(0)
    expect(fin(r, 'r2')).toBeGreaterThan(0.9)
    const b = gradyanInisiReport({ lr: 0.1, start: 0 })
    expect(fin(b, 'diverged')).toBe(1)
    expect(sameLengths(b)).toBeLessThan(300)
  })

  it('aşırı öğrenme: eğitim hatası dereceyle düşer, doğrulama U çizer, erken durdurma 20.000’den önce', () => {
    const r = overfitReport()
    expect(sameLengths(r)).toBe(12)
    const tr = r.history.cols.train_mse, va = r.history.cols.val_mse
    for (let i = 1; i < tr.length; i++) expect(tr[i]).toBeLessThanOrEqual(tr[i - 1] + 1e-9)
    const best = fin(r, 'best_degree')
    expect(best).toBeGreaterThan(1); expect(best).toBeLessThan(12)
    expect(va[11]).toBeGreaterThan(va[best - 1])
    expect(fin(r, 'gap_deg12')).toBeGreaterThan(0)
    expect(fin(r, 'early_stop_pass')).toBeLessThan(20000)
  })

  it('rakam tanıma: her 10 grupta bir satır, kayıp düşer, 10×10 karışıklık, histogram = ağırlık sayısı', () => {
    const r = rakamReport({ rounds: 3, noise: 0.35 })
    expect(sameLengths(r)).toBe(30)
    const L = r.history.cols.loss, V = r.history.cols.val_acc
    expect(L.at(-1)!).toBeLessThan(L[0])
    expect(V.at(-1)!).toBeGreaterThan(0.8)
    expect(r.confusion!.m.length).toBe(10)
    expect(r.confusion!.m.flat().reduce((a, v) => a + v, 0)).toBe(500)
    // son doğrulama doğruluğu = karışıklık matrisinin köşegeni / 500
    expect(fin(r, 'val_accuracy')).toBeCloseTo(V.at(-1)!, 10)
    const h = r.charts.find((g) => g.kind === 'hist')
    expect(h && h.kind === 'hist').toBe(true)
    if (h?.kind === 'hist') for (const f of h.frames) expect(f.counts.reduce((a, v) => a + v, 0)).toBe(PIX * 10)
  })

  it('model damıtma: 51 anlık görüntü, damıtılmış öğrenci sertten iyi, KL düşer', () => {
    const r = damitmaReport({ T: 4, n: 24 })
    expect(sameLengths(r)).toBe(51)
    expect(fin(r, 'soft_acc')).toBeGreaterThan(fin(r, 'hard_acc'))
    const K = r.history.cols.soft_kl
    expect(K.at(-1)!).toBeLessThan(K[0])
    expect(r.history.cols.hard_loss.at(-1)!).toBeLessThan(r.history.cols.hard_loss[0])
    expect(fin(r, 'hard_gap')).toBeGreaterThan(0)
  })

  it('deterministik', () => {
    expect(JSON.stringify(geriYayilimReport({ lr: 2 }))).toBe(JSON.stringify(geriYayilimReport({ lr: 2 })))
    expect(JSON.stringify(rakamReport({ rounds: 1, noise: 0.35 }).history)).toBe(JSON.stringify(rakamReport({ rounds: 1, noise: 0.35 }).history))
    expect(JSON.stringify(damitmaReport({ T: 2, n: 24 }).history)).toBe(JSON.stringify(damitmaReport({ T: 2, n: 24 }).history))
  })
})
