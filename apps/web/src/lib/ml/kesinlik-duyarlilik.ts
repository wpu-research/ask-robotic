// Ders: kesinlik, duyarlılık ve F1. Kalite kontrol kamerası 1000 parçanın her birine "hatalı olma" puanı verir; eşiğin üstü
// işaretlenir. Eşik kaydıkça yanlış alarm ile kaçan hatalı parça yer değiştirir: kesinlik artarken duyarlılık düşer.
import { cap, fmt, gauss, rng, type Frame, type Lesson } from './core'

export interface PRData {
  score: Float64Array
  /** 1: hatalı, 0: sağlam. */
  y: Uint8Array
  nBad: number
  /** Eşik 0,00…1,00 (0,01 adım) için eğri noktaları. */
  curve: Array<{ t: number; P: number; R: number; F1: number }>
}

export interface PRFrame extends Frame {
  data: PRData
  /** Eşik (yoksa henüz konmadı). */
  t?: number
  m?: Metrics
  /** Hangi ölçünün vurgulandığı (satır satır gösterimde). */
  focus?: 'cm' | 'P' | 'R' | 'F1'
  /** En iyi F1 eşiği (sonuç). */
  best?: { t: number; F1: number }
}

export interface Metrics { tp: number; fp: number; fn: number; tn: number; P: number; R: number; F1: number }

/** Eşik t: puanı ≥ t olan parça "hatalı" diye işaretlenir. Hiç işaret yoksa kesinlik tanımsızdır (NaN). */
export function metrics(score: ArrayLike<number>, y: ArrayLike<number>, t: number): Metrics {
  let tp = 0, fp = 0, fn = 0, tn = 0
  for (let i = 0; i < y.length; i++) {
    const flag = score[i] >= t
    if (flag) { if (y[i]) tp++; else fp++ } else if (y[i]) fn++; else tn++
  }
  const P = tp + fp ? tp / (tp + fp) : NaN
  const R = tp + fn ? tp / (tp + fn) : NaN
  const F1 = P + R > 0 ? (2 * P * R) / (P + R) : 0
  return { tp, fp, fn, tn, P, R, F1 }
}

/** 1000 parça; hatalı payı `badPct` (%). Puan = sigmoid(normal gürültü + sınıf kayması). */
export function inspection(badPct = 20, seed = 3): PRData {
  const r = rng(seed)
  const N = 1000, nBad = Math.round((N * badPct) / 100)
  const score = new Float64Array(N), y = new Uint8Array(N)
  for (let i = 0; i < N; i++) {
    y[i] = i < nBad ? 1 : 0
    const z = 1.1 * gauss(r) + (y[i] ? 1.0 : -1.4)
    score[i] = 1 / (1 + Math.exp(-z))
  }
  const curve = Array.from({ length: 101 }, (_, k) => { const t = k / 100; const m = metrics(score, y, t); return { t, P: m.P, R: m.R, F1: m.F1 } })
  return { score, y, nBad, curve }
}

const f2 = (x: number, l: 'tr' | 'en') => (Number.isFinite(x) ? fmt(x, 2, l) : '—')

export const KESINLIK_DUYARLILIK: Lesson<PRFrame> = {
  slug: 'kesinlik-duyarlilik',
  n: 0,
  title: { tr: 'Kesinlik, duyarlılık ve F1', en: 'Precision, recall and F1' },
  sub: { tr: 'Kalite kontrol kamerasında eşiği kaydırmak', en: 'Sliding the threshold of a quality-control camera' },
  story: {
    tr: 'Üretim bandındaki bir kalite kontrol kamerası 1000 parçaya bakıyor; varsayılan ayarda 200\'ü gerçekten hatalı. Model her parçaya 0 ile 1 arasında bir "hatalı olma" puanı veriyor. Puanı eşiğin üstünde olan parça banttan atılıyor. Soru şu: eşik nerede olmalı?',
    en: 'A quality-control camera on a production line looks at 1000 parts; by default 200 of them are really defective. The model gives every part a "defective" score between 0 and 1, and any part above the threshold is pushed off the belt. The question: where should the threshold be?',
  },
  how: [
    { tr: 'Dört kutu (karışıklık matrisi): doğru alarm (TP), yanlış alarm (FP), kaçan hatalı (FN), doğru geçen sağlam (TN).', en: 'Four boxes (the confusion matrix): true alarm (TP), false alarm (FP), missed defect (FN), good part passed (TN).' },
    { tr: 'Kesinlik P = TP / (TP + FP): attığımız parçaların ne kadarı gerçekten hatalı?', en: 'Precision P = TP / (TP + FP): of the parts we rejected, how many were really defective?' },
    { tr: 'Duyarlılık R = TP / (TP + FN): gerçekten hatalı parçaların ne kadarını yakaladık? F1 = 2PR / (P + R), ikisinin dengesi.', en: 'Recall R = TP / (TP + FN): of the really defective parts, how many did we catch? F1 = 2PR / (P + R) balances the two.' },
    { tr: 'Eşik yükseldikçe daha az parça işaretlenir: duyarlılık hiç artmaz, kesinlik çoğunlukla artar. Eğri bu takası gösterir.', en: 'As the threshold rises, fewer parts are flagged: recall never goes up, precision mostly does. The curve shows this trade-off.' },
    { tr: 'Şunu dene: hatalı payını %5 yap. Doğruluk yine yüksek görünür ama kesinlik çöker; az görülen sınıfta doğruluk yanıltır.', en: 'Try this: set the defect share to 5%. Accuracy still looks high but precision collapses; with a rare class, accuracy misleads.' },
  ],
  why: {
    tr: 'Hatalı parça kaçırmak pahalıysa (fren balatası, uçak cıvatası) duyarlılık öne çıkar; her yanlış alarm bandı durduruyorsa kesinlik. Engel algılayan bir robot da aynı takası yaşar: duyarlılık düşükse çarpar, kesinlik düşükse boşuna fren yapar. F1, tek sayıyla karşılaştırma yapmak için kullanılır.',
    en: 'If a missed defect is costly (a brake pad, an aircraft bolt), recall comes first; if every false alarm stops the line, precision does. An obstacle-detecting robot faces the same trade-off: low recall means it crashes, low precision means it brakes for nothing. F1 gives a single number for comparisons.',
  },
  file: 'kesinlik_duyarlilik.py',
  code: [
    ['import numpy as np'],
    ['rng = np.random.default_rng(3)'],
    ['n_bad = 200', '1000 parçanın 200\'ü hatalı', '200 of 1000 parts defective'],
    ['y = np.r_[np.ones(n_bad), np.zeros(1000 - n_bad)]'],
    ['z = rng.normal(0, 1.1, 1000) + np.where(y == 1, 1.0, -1.4)'],
    ['score = 1 / (1 + np.exp(-z))', '"hatalı olma" puanı', '"defective" score'],
    ['for t in np.arange(0.1, 0.95, 0.1):', 'eşiği kaydır', 'slide the threshold'],
    ['    flag = score >= t', 'işaretlenen parçalar', 'flagged parts'],
    ['    tp = np.sum(flag & (y == 1))', 'doğru alarm', 'true alarm'],
    ['    fp = np.sum(flag & (y == 0))', 'yanlış alarm', 'false alarm'],
    ['    fn = np.sum(~flag & (y == 1))', 'kaçan hatalı', 'missed defect'],
    ['    P = tp / max(tp + fp, 1)', 'kesinlik', 'precision'],
    ['    R = tp / (tp + fn)', 'duyarlılık', 'recall'],
    ['    F1 = 2 * P * R / max(P + R, 1e-12)', 'ikisinin dengesi', 'their balance'],
    ['    print(f"t={t:.1f} P={P:.2f} R={R:.2f} F1={F1:.2f}")'],
  ],
  params: [
    { key: 'bad', label: { tr: 'Hatalı parça payı (%)', en: 'Defective share (%)' }, min: 5, max: 50, step: 5, value: 20 },
    { key: 'thr', label: { tr: 'Son eşik', en: 'Final threshold' }, min: 0.1, max: 0.9, step: 0.05, value: 0.5 },
  ],
  run({ bad = 20, thr = 0.5 }) {
    const data = inspection(bad)
    const F: PRFrame[] = []
    const T = Math.round(thr * 100) / 100
    const st = (m: Metrics): [string, string] => cap(`P ${f2(m.P, 'tr')} · R ${f2(m.R, 'tr')} · F1 ${f2(m.F1, 'tr')}`, `P ${f2(m.P, 'en')} · R ${f2(m.R, 'en')} · F1 ${f2(m.F1, 'en')}`)
    const n = data.y.length
    F.push({ data, line: 5, cap: cap(`1000 parça (${data.nBad} hatalı): modelin puanları`, `1000 parts, ${data.nBad} defective: the model's scores`), stat: cap('kırmızı: hatalı (yukarı) · mavi: sağlam (aşağı)', 'red: defective (up) · blue: good (down)'), hold: 2 })
    const m5 = metrics(data.score, data.y, 0.5)
    const acc5 = (m5.tp + m5.tn) / n
    F.push({ data, t: 0.5, m: m5, focus: 'cm', line: 7, cap: cap(`eşik 0,50: ${m5.tp + m5.fp} parça işaretlendi`, `threshold 0.50: ${m5.tp + m5.fp} parts flagged`), stat: cap(`TP ${m5.tp} · FP ${m5.fp} · FN ${m5.fn} · TN ${m5.tn}`, `TP ${m5.tp} · FP ${m5.fp} · FN ${m5.fn} · TN ${m5.tn}`), hold: 2 })
    F.push({ data, t: 0.5, m: m5, focus: 'P', line: 11, cap: cap(`kesinlik = ${m5.tp} / (${m5.tp} + ${m5.fp}) = ${f2(m5.P, 'tr')}`, `precision = ${m5.tp} / (${m5.tp} + ${m5.fp}) = ${f2(m5.P, 'en')}`), stat: cap('atılan parçaların ne kadarı gerçekten hatalı', 'how many rejected parts were really defective'), hold: 1.8 })
    F.push({ data, t: 0.5, m: m5, focus: 'R', line: 12, cap: cap(`duyarlılık = ${m5.tp} / (${m5.tp} + ${m5.fn}) = ${f2(m5.R, 'tr')}`, `recall = ${m5.tp} / (${m5.tp} + ${m5.fn}) = ${f2(m5.R, 'en')}`), stat: cap('hatalı parçaların ne kadarı yakalandı', 'how many defective parts were caught'), hold: 1.8 })
    F.push({ data, t: 0.5, m: m5, focus: 'F1', line: 13, cap: cap(`F1 = 2PR / (P + R) = ${f2(m5.F1, 'tr')}`, `F1 = 2PR / (P + R) = ${f2(m5.F1, 'en')}`), stat: cap(`doğruluk ${f2(acc5, 'tr')}: tek başına yanıltabilir`, `accuracy ${f2(acc5, 'en')}: misleading on its own`), hold: 1.8 })
    // eşiği yavaşça süpür: 0,05 → 0,95, sonra seçilen eşiğe dön
    for (let k = 5; k <= 95; k++) {
      const t = k / 100, m = metrics(data.score, data.y, t)
      F.push({ data, t, m, line: 6, cap: cap(`eşik ${fmt(t, 2, 'tr')} · ${m.tp + m.fp} parça işaretli`, `threshold ${t.toFixed(2)} · ${m.tp + m.fp} parts flagged`), stat: st(m), hold: k === 5 ? 1.2 : 0.3 })
    }
    let best = data.curve[1]
    for (const c of data.curve) if (c.F1 > best.F1) best = c
    const m = metrics(data.score, data.y, T)
    F.push({ data, t: T, m, best: { t: best.t, F1: best.F1 }, line: 14,
      cap: cap(`eşik ${fmt(T, 2, 'tr')}: kesinlik ${f2(m.P, 'tr')}, duyarlılık ${f2(m.R, 'tr')}, F1 ${f2(m.F1, 'tr')}`, `threshold ${T.toFixed(2)}: precision ${f2(m.P, 'en')}, recall ${f2(m.R, 'en')}, F1 ${f2(m.F1, 'en')}`),
      stat: cap(`en iyi F1 ${f2(best.F1, 'tr')} (eşik ${fmt(best.t, 2, 'tr')})`, `best F1 ${f2(best.F1, 'en')} (threshold ${best.t.toFixed(2)})`), hold: 3 })
    return F
  },
}
