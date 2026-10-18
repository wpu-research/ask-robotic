// Sensör-ML dersinin saf mantığı: deterministik sera verisi (CSV ile aynı), temizleme ve Kalman, istatistik, özellik
// tablosunda sızıntı olmaması, ridge/kütük/metrikler ve bölmeler, sabit noktalı C kodunun doğruluğu, anomali uyarısı.
import { describe, expect, it } from 'vitest'
import { DATASETS, csvOf } from '@/lib/ml/veri'
import { ALARM_DEFAULTS, alarm, evaluate, pipeline } from './anomaly'
import { dropMask, ema, ffill, hampel, interpLinear, iqrOutliers, kalman1d, median, medianFilter, movingAvg, quantile, rmseValid, steadyGain, zscoreOutliers } from './clean'
import { fitsInt32, linearC, linearFixedC, predictFixed, quantize, stumpC } from './codegen'
import { FEAT_DEFAULTS, buildTable, centered, lag, lead, rollMean } from './features'
import { clsScore, fitLinear, fitStump, mae, pick, predictLinear, predictStump, r2, randomSplit, rmse, timeSplit, walkForward } from './model'
import { FAULT_WINDOW, datasetRows, seriesCsv, simulate } from './sensors'
import { corrMatrix, dailyProfile, histogram, pearson, welfordOf, welfordVar } from './stats'

const S = simulate()
const spike = (v: number) => v > 60 || v < -20
const clean = interpLinear(dropMask(S.temp, hampel(S.temp, 3, 4)))

describe('sera verisi', () => {
  it('deterministik; ML veri setiyle (sera-sensorleri.csv) aynı üreteç', () => {
    expect(simulate()).toEqual(S)
    expect(S.t).toHaveLength(1008)
    const ds = DATASETS.find((d) => d.id === 'sera-sensorleri')!
    expect(ds.rows()).toEqual(datasetRows())
    expect(csvOf(ds)).toBe(seriesCsv(S).replace(/NaN/g, 'NaN'))
  })
  it('kusurlar: NaN, sıçrama, arıza penceresi; nem %100 üstüne çıkmaz', () => {
    expect(S.temp.filter(Number.isNaN).length).toBeGreaterThan(5)
    expect(S.temp.filter(spike).length).toBeGreaterThan(3)
    const f = S.fault.map((v, i) => (v ? S.t[i] : -1)).filter((t) => t >= 0)
    expect(f[0]).toBe(FAULT_WINDOW.day * 1440 + FAULT_WINDOW.from * 60)
    expect(Math.max(...S.hum.filter(Number.isFinite))).toBeLessThanOrEqual(100)
    expect(simulate({ fault: false }).fault.every((v) => v === 0)).toBe(true)
    expect(simulate({ stepMin: 30, days: 2 }).t).toHaveLength(96)
  })
})

describe('temizleme', () => {
  it('Hampel tüm sıçramaları yakalar; temiz seri gerçeğe 0,3 °C\'den yakın', () => {
    const h = hampel(S.temp, 3, 4)
    expect(S.temp.every((v, i) => !spike(v) || h[i])).toBe(true)
    expect(clean.every(Number.isFinite)).toBe(true)
    expect(rmseValid(clean, S.trueTemp)).toBeLessThan(0.3)
  })
  it('z-skoru ve IQR uç değerleri bulur; z-skoru maskelenmeye açıktır', () => {
    expect(zscoreOutliers([1, 1, 1, 1, 1, 1, 1, 1, 1, 50], 2)[9]).toBe(true)
    expect(zscoreOutliers([1, 1, 1, 50, 50], 3).some(Boolean)).toBe(false) // iki uç değer σ'yı şişirir
    expect(iqrOutliers([1, 2, 3, 4, 5, 6, 7, 8, 100])[8]).toBe(true)
    expect(median([3, NaN, 1, 2])).toBe(2)
    expect(quantile([1, 2, 3, 4, 5], 0.25)).toBe(2)
  })
  it('doldurma ve nedensel yumuşatıcılar', () => {
    expect(ffill([NaN, 1, NaN, 3])).toEqual([1, 1, 1, 3])
    expect(interpLinear([1, NaN, NaN, 4, NaN])).toEqual([1, 2, 3, 4, 4])
    expect(movingAvg([1, 2, 3, 4], 2)).toEqual([1, 1.5, 2.5, 3.5])
    expect(medianFilter([1, 1, 50, 1, 1], 3)[2]).toBe(1) // tek sıçrama silinir
    expect(ema([0, 10, 10], 0.5)).toEqual([0, 5, 7.5])
    // nedensellik: gelecekteki değeri değiştirmek geçmiş çıktıyı değiştirmez
    const a = movingAvg([1, 2, 3, 4, 5], 3), b = movingAvg([1, 2, 3, 4, 99], 3)
    expect(a.slice(0, 4)).toEqual(b.slice(0, 4))
  })
  it('Kalman: kazanç durağan değere oturur, bu değer aynı EMA α\'sıdır; gürültüyü azaltır', () => {
    const z = simulate({ noise: 3, spikes: 0, missing: 0 }).temp
    const k = kalman1d(z, 0.1, 0.5625) // R = σ² (σ = 0,75 °C)
    expect(k.gain[k.gain.length - 1]).toBeCloseTo(steadyGain(0.1, 0.5625), 6)
    const s = simulate({ noise: 3, spikes: 0, missing: 0 })
    expect(rmseValid(k.est, s.trueTemp)).toBeLessThan(rmseValid(s.temp, s.trueTemp))
    expect(kalman1d([1, NaN, 1], 0.1, 1).gain[1]).toBe(0) // eksik ölçüm: yalnız tahmin
  })
})

describe('istatistik', () => {
  it('Welford toplu hesapla aynı; Pearson ve korelasyon matrisi', () => {
    const x = clean
    const w = welfordOf(x)
    const m = x.reduce((a, b) => a + b, 0) / x.length
    const v = x.reduce((a, b) => a + (b - m) ** 2, 0) / (x.length - 1)
    expect(w.mean).toBeCloseTo(m, 9)
    expect(welfordVar(w)).toBeCloseTo(v, 9)
    expect(pearson([1, 2, 3], [2, 4, 6])).toBeCloseTo(1)
    expect(pearson([1, 2, 3], [3, 2, 1])).toBeCloseTo(-1)
    expect(pearson(clean, interpLinear(S.hum))).toBeLessThan(-0.8) // sıcak saatte nem düşer
    const C = corrMatrix([clean, S.light])
    expect(C[0][0]).toBeCloseTo(1)
    expect(C[0][1]).toBeCloseTo(C[1][0])
  })
  it('histogram ve günlük profil', () => {
    const h = histogram([0, 1, 2, 3, 4, NaN], 2, 0, 4)
    expect(h.counts).toEqual([2, 3])
    const p = dailyProfile(S.hour, clean)
    expect(p).toHaveLength(24)
    expect(p.indexOf(Math.max(...p))).toBeGreaterThanOrEqual(12)
    expect(p.indexOf(Math.max(...p))).toBeLessThanOrEqual(16)
  })
})

describe('özellikler', () => {
  it('gecikme, kayan ortalama, hedef', () => {
    expect(lag([1, 2, 3], 1)).toEqual([NaN, 1, 2])
    expect(lead([1, 2, 3], 1)).toEqual([2, 3, NaN])
    expect(rollMean([1, 2, 3, 4], 2)).toEqual([NaN, 1.5, 2.5, 3.5])
    expect(centered([1, 2, 3, 4, 5], 1)).toEqual([NaN, 2, 3, 4, NaN])
  })
  it('sızıntı yok: hedefin geleceğini değiştirmek hiçbir özelliği değiştirmez; merkezli ortalama değiştirir', () => {
    const t1 = buildTable(clean, S.hour, S.light, FEAT_DEFAULTS)
    const k = 400, bent = [...clean]
    for (let i = k + 1; i < bent.length; i++) bent[i] += 5
    const t2 = buildTable(bent, S.hour, S.light, FEAT_DEFAULTS)
    const row = t1.idx.indexOf(k)
    expect(t2.X[row]).toEqual(t1.X[row])
    expect(t2.y[row]).not.toBe(t1.y[row])
    const l1 = buildTable(clean, S.hour, S.light, { ...FEAT_DEFAULTS, leak: true })
    const l2 = buildTable(bent, S.hour, S.light, { ...FEAT_DEFAULTS, leak: true })
    expect(l2.X[l2.idx.indexOf(k)]).not.toEqual(l1.X[l1.idx.indexOf(k)])
  })
})

describe('model ve değerlendirme', () => {
  it('ridge λ = 0 bilinen doğrusal ilişkiyi geri bulur; ağırlıklar ham ölçekte', () => {
    const X = Array.from({ length: 50 }, (_, i) => [i, (i * 7) % 11])
    const y = X.map(([a, b]) => 3 + 2 * a - 0.5 * b)
    const m = fitLinear(X, y, 0)
    expect(m.w[0]).toBeCloseTo(3, 6)
    expect(m.w[1]).toBeCloseTo(2, 6)
    expect(m.w[2]).toBeCloseTo(-0.5, 6)
    expect(predictLinear(m, [10, 4])).toBeCloseTo(21, 6)
  })
  it('metrikler ve bölmeler', () => {
    expect(mae([1, 2], [2, 4])).toBe(1.5)
    expect(rmse([0, 0], [3, 4])).toBeCloseTo(Math.sqrt(12.5))
    expect(r2([1, 2, 3], [1, 2, 3])).toBe(1)
    expect(clsScore([1, 0, 1, 0], [1, 1, 0, 0])).toMatchObject({ tp: 1, fp: 1, fn: 1, tn: 1, acc: 0.5 })
    const t = timeSplit(100, 0.25, 6)
    expect(t.test[0]).toBe(75)
    expect(t.train[t.train.length - 1]).toBe(68)
    const r = randomSplit(100, 0.25)
    expect(r.test).toHaveLength(25)
    expect(new Set([...r.train, ...r.test]).size).toBe(100)
    const wf = walkForward(100, 4, 40, 2)
    expect(wf).toHaveLength(4)
    for (const f of wf) expect(Math.max(...f.train)).toBeLessThan(Math.min(...f.test))
  })
  it('sera: 1 saat sonrası için model "değişmez" tabanını açıkça geçer', () => {
    const tab = buildTable(clean, S.hour, S.light, FEAT_DEFAULTS)
    const sp = timeSplit(tab.X.length, 0.25, 6)
    const m = fitLinear(pick(tab.X, sp.train), pick(tab.y, sp.train), 1)
    const y = pick(tab.y, sp.test), p = pick(tab.X, sp.test).map((x) => predictLinear(m, x))
    expect(rmse(y, p)).toBeLessThan(0.7 * rmse(y, pick(tab.now, sp.test)))
  })
  it('karar kütüğü: "26 °C üstü" görevinde yüksek doğruluk', () => {
    const tab = buildTable(clean, S.hour, S.light, FEAT_DEFAULTS)
    const c = tab.y.map((v) => (v > 26 ? 1 : 0))
    const st = fitStump(tab.X, c)
    expect(clsScore(c, tab.X.map((x) => predictStump(st, x))).acc).toBeGreaterThan(0.9)
  })
})

describe('mikrodenetleyiciye taşıma', () => {
  const tab = buildTable(clean, S.hour, S.light, FEAT_DEFAULTS)
  const m = fitLinear(tab.X, tab.y, 1)
  it('Q12 sabit nokta float\'a 0,05 °C içinde; int32\'ye sığar', () => {
    const f = quantize(m, 12)
    const err = Math.max(...tab.X.slice(0, 300).map((x) => Math.abs(predictFixed(f, x) - predictLinear(m, x))))
    expect(err).toBeLessThan(0.05)
    expect(fitsInt32(f, tab.names.map((_, j) => Math.max(...tab.X.map((r) => Math.abs(r[j])))))).toBe(true)
    // Q küçüldükçe hata büyür
    const e4 = Math.max(...tab.X.slice(0, 300).map((x) => Math.abs(predictFixed(quantize(m, 4), x) - predictLinear(m, x))))
    expect(e4).toBeGreaterThan(err)
  })
  it('üretilen C kodu: her özellik bir argüman, ağırlık dizisi doğru boyda', () => {
    const c = linearC(tab.names, m, 'test')
    for (const n of tab.names) expect(c).toContain(`float ${n}`)
    const fx = linearFixedC(tab.names, quantize(m, 12), 'test')
    expect(fx).toContain(`static const int32_t W[${tab.names.length}]`)
    expect(fx).toContain('#define Q 12')
    expect(stumpC(tab.names, { f: 0, t: 25.5, left: 0, right: 1, gini: 0 }, 'k')).toContain('x[0] <= 25.50000f ? 0 : 1')
  })
})

describe('anomali uyarısı', () => {
  it('histerezis, ardışık örnek ve bekleme süresi', () => {
    const z = [0, 4, 4, 2, 4, 1, 0, 4, 4]
    const a = alarm(z, { on: 3, off: 1.5, minRun: 2, cooldown: 0 })
    expect(a.state).toEqual([false, false, true, true, true, false, false, false, true])
    expect(a.alerts).toEqual([2, 8])
    expect(alarm(z, { on: 3, off: 1.5, minRun: 2, cooldown: 10 }).alerts).toEqual([2])
    expect(evaluate([5, 20], [0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])).toMatchObject({ caught: true, delay: 1, falseAlerts: 1 })
  })
  it('bitirme hattı: 5. gündeki ısıtıcı arızası 60 dk içinde, en çok 2 yanlış alarmla yakalanır', () => {
    const P = pipeline(S, { ...FEAT_DEFAULTS, horizon: 3 })
    const ev = evaluate(alarm(P.z, ALARM_DEFAULTS).alerts, P.idx.map((i) => S.fault[i] ?? 0))
    expect(ev.caught).toBe(true)
    expect(ev.delay * 10).toBeLessThanOrEqual(60)
    expect(ev.falseAlerts).toBeLessThanOrEqual(2)
  })
})
