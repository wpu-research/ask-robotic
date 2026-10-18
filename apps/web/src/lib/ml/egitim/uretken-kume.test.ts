// Eğitim paneli: üretken / dil / öneri / doğrulama / kümeleme derslerinin raporları. Geçmiş uzunlukları, ölçü aralıkları,
// beklenen eğilimler (kayıp düşer, doğrulama ayrışır) ve aynı parametrelerle aynı sonuç (tohum).
import { describe, expect, it } from 'vitest'
import type { Lesson } from '../core'
import { silhouette } from './metrics'
import { raporCSV, type EgitimRaporu } from './rapor'
import { MINI_DIL_MODELI, N as VOCAB_N, lmReport, splitSequences } from '../mini-dil-modeli'
import { GORUNTU_URETECI, generatorReport } from '../goruntu-ureteci'
import { ONERI_SISTEMI, recReport } from '../oneri-sistemi'
import { KELIME_VEKTORLERI, symEig, wvReport } from '../kelime-vektorleri'
import { YUZ_DOGRULAMA, faceReport } from '../yuz-dogrulama'
import { DUSME_TESPITI, fallReport } from '../dusme-tespiti'
import { DBSCAN, EPS_SWEEP, dbscanReport, silhouetteD, warehouseScan } from '../dbscan'
import { PCA, pcaReport } from '../pca'

const LESSONS = [MINI_DIL_MODELI, GORUNTU_URETECI, ONERI_SISTEMI, KELIME_VEKTORLERI, YUZ_DOGRULAMA, DUSME_TESPITI, DBSCAN, PCA] as unknown as Lesson[]
const defs = (l: Lesson) => Object.fromEntries(l.params.map((p) => [p.key, p.value]))
const fin = (r: EgitimRaporu, k: string) => r.final.find((f) => f.key === k)!.value
const col = (r: EgitimRaporu, k: string) => r.history.cols[k]

describe('eğitim paneli: üretken, dil, öneri, doğrulama ve kümeleme dersleri', () => {
  it('her dersin raporu var, geçmiş sütunları eşit uzunlukta, sayılar sonlu, CSV geçmişle başlar', () => {
    for (const l of LESSONS) {
      expect(l.report, l.slug).toBeTypeOf('function')
      const r = l.report!(defs(l))
      const n = r.history.cols[r.history.x].length
      expect(n, l.slug).toBeGreaterThan(1)
      for (const [k, v] of Object.entries(r.history.cols)) {
        expect(v.length, `${l.slug}.${k}`).toBe(n)
        expect(v.every(Number.isFinite), `${l.slug}.${k}`).toBe(true)
      }
      expect(r.charts.length, l.slug).toBeGreaterThan(1)
      expect(raporCSV(r).split('\n')[0], l.slug).toBe([r.history.x, ...Object.keys(r.history.cols).filter((k) => k !== r.history.x)].join(','))
      // Python kodu aynı sütunları yazar
      const src = l.code.map(([c]) => c).join('\n')
      expect(src, l.slug).toContain('egitim_gecmisi.csv')
      expect(src, l.slug).toMatch(/except ImportError/)
    }
  })

  it('raporlar hızlı ve tohumla tekrarlanabilir', () => {
    for (const l of LESSONS) {
      const t0 = performance.now()
      const a = l.report!(defs(l))
      expect(performance.now() - t0, l.slug).toBeLessThan(1500)
      expect(JSON.stringify(l.report!(defs(l)).history), l.slug).toBe(JSON.stringify(a.history))
    }
  })

  it('mini dil modeli: 500 tur, eğitim kaybı düşer, doğrulama ezberle ayrışır, şaşkınlık = e^kayıp', () => {
    const { nTrain, nVal } = splitSequences()
    expect([nTrain, nVal]).toEqual([12, 4])
    const r = lmReport()
    const loss = col(r, 'loss'), val = col(r, 'val_loss')
    expect(loss).toHaveLength(500)
    for (let i = 1; i < loss.length; i++) expect(loss[i]).toBeLessThanOrEqual(loss[i - 1] + 1e-9)
    expect(loss[0]).toBeLessThan(Math.log(VOCAB_N))
    expect(val.at(-1)!).toBeGreaterThan(Math.min(...val) + 0.3) // aşırı öğrenme
    expect(fin(r, 'best_val_tour')).toBeLessThan(100)
    col(r, 'perplexity').forEach((p, i) => expect(p).toBeCloseTo(Math.exp(loss[i]), 9))
  })

  it('görüntü üreteci: her 10 adımda kayıt, hata en az üçte birine iner, doğrulama eğitime yakın', () => {
    const r = generatorReport({ steps: 300, seed: 13 })
    expect(col(r, 'step')).toEqual(Array.from({ length: 31 }, (_, i) => i * 10))
    const loss = col(r, 'loss')
    expect(loss.at(-1)!).toBeLessThan(loss[0] / 3)
    expect(Math.abs(fin(r, 'gap'))).toBeLessThan(0.01)
    expect(fin(r, 'own_share')).toBeGreaterThan(0.8)
    expect(r.charts.filter((c) => c.kind === 'hist').length).toBe(5) // kod dağılımı + 4 katman
    expect(generatorReport({ steps: 100, seed: 13 }).history.cols.step).toHaveLength(11)
  })

  it('öneri sistemi: tur başına kayıp/doğruluk, eğitim kaybı düşer, test doğruluğu mümkün en iyiyi geçmez', () => {
    const r = recReport({ rounds: 100, k: 2 })
    expect(col(r, 'epoch')).toHaveLength(100)
    expect(col(r, 'loss').at(-1)!).toBeLessThan(col(r, 'loss')[0])
    expect(col(r, 'val_acc').at(-1)!).toBeGreaterThan(0.75)
    expect(fin(r, 'test_accuracy')).toBeLessThanOrEqual(fin(r, 'bayes') + 0.03)
    expect(fin(r, 'test_auc')).toBeGreaterThan(0.8)
    expect(r.confusion!.m.flat().reduce((a, b) => a + b, 0)).toBe(600)
  })

  it('kelime vektörleri: Jacobi özdeğerleri, açıklanan varyans toplamı 1 ve birikimli artan, konular ayrışır', () => {
    expect(symEig([[2, 1], [1, 2]]).map((v) => Number(v.toFixed(9)))).toEqual([3, 1])
    const r = wvReport({ win: 2 })
    const ev = col(r, 'explained'), cum = col(r, 'cumulative')
    expect(ev).toHaveLength(19)
    expect(cum.at(-1)!).toBeCloseTo(1, 9)
    for (let i = 1; i < ev.length; i++) expect(ev[i]).toBeLessThanOrEqual(ev[i - 1] + 1e-12)
    expect(fin(r, 'cos_same')).toBeGreaterThan(fin(r, 'cos_other') + 0.3)
    expect(fin(r, 'nn_topic')).toBe(1)
  })

  it('yüz doğrulama: 101 eşik, FAR azalır FRR artar, AUC yüksek, karışıklık matrisi tüm çiftler', () => {
    const r = faceReport({ th: 0.42 })
    const far = col(r, 'far'), frr = col(r, 'frr')
    expect(far).toHaveLength(101)
    for (let i = 1; i < 101; i++) { expect(far[i]).toBeLessThanOrEqual(far[i - 1]); expect(frr[i]).toBeGreaterThanOrEqual(frr[i - 1]) }
    expect(fin(r, 'auc')).toBeGreaterThan(0.95)
    expect(r.confusion!.m.flat().reduce((a, b) => a + b, 0)).toBe((90 * 89) / 2)
    expect(r.scores!.t).toBe(0.42)
  })

  it('düşme tespiti: 260 kare, yanlış alarm yok, kesinlik 1, gecikme pencere kadar', () => {
    const r = fallReport({ ang: 60, win: 2 })
    expect(col(r, 't')).toHaveLength(260)
    expect(fin(r, 'false_alarms')).toBe(0)
    expect(fin(r, 'precision')).toBe(1)
    expect(fin(r, 'delay_s')).toBeGreaterThan(1.5)
    expect(fin(r, 'angle_only_fp')).toBeGreaterThan(0) // eğilme açıyla tek başına alarm verirdi
    // pencere uzarsa duyarlılık düşer
    expect(fin(fallReport({ ang: 60, win: 4 }), 'recall')).toBeLessThan(fin(r, 'recall'))
  })

  it('DBSCAN: 29 eps, küçük eps çoğu noktayı gürültü yapar, büyük eps tek küme; hızlı siluet metrics ile aynı', () => {
    const r = dbscanReport({ eps: 0.5, minPts: 5 })
    expect(col(r, 'eps')).toEqual(EPS_SWEEP)
    expect(col(r, 'noise_share')[0]).toBeGreaterThan(0.5)
    expect(col(r, 'clusters').at(-1)).toBe(1)
    expect(fin(r, 'clusters')).toBe(3)
    expect(fin(r, 'purity')).toBeGreaterThan(0.95)
    const X = warehouseScan(), n = X.length
    const D = new Float64Array(n * n)
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) D[i * n + j] = Math.hypot(X[i].x - X[j].x, X[i].y - X[j].y)
    const g = X.map((p) => (p.c === 3 ? -1 : p.c))
    expect(silhouetteD(D, n, g)).toBeCloseTo(silhouette(X.map((p) => [p.x, p.y]), g), 10)
  })

  it('PCA: açı taraması 37 satır, varyans + hata = toplam, en iyi açı ana eksen, korunan varyans %96', () => {
    const r = pcaReport()
    const v = col(r, 'variance'), e = col(r, 'recon_error')
    expect(v).toHaveLength(37)
    const tot = v[0] + e[0]
    v.forEach((x, i) => expect(x + e[i]).toBeCloseTo(tot, 10))
    expect(Math.abs(col(r, 'angle')[v.indexOf(Math.max(...v))] - fin(r, 'angle'))).toBeLessThanOrEqual(2.5)
    expect(fin(r, 'kept')).toBeGreaterThan(0.95)
    expect(fin(r, 'recon_mse')).toBeCloseTo(Math.min(...e), 1)
  })
})
