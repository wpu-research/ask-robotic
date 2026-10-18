// Ders: SHAP (Shapley) değerleri. Robotun pil ömrü tahmini 4 özellikten gelir: yük, hız, sıcaklık, eğim. Tahmini özelliklere
// adil paylaştırmak için 16 koalisyonun hepsi denenir; eksik özellik arka plan ortalamasıyla doldurulur. Katkılar tam toplanır.
import { cap, fmt, rng, type Frame, type Lesson } from './core'

export const FEATS: Array<{ tr: string; en: string; unit: string; lo: number; hi: number; d: number }> = [
  { tr: 'yük', en: 'load', unit: 'kg', lo: 0, hi: 10, d: 1 },
  { tr: 'hız', en: 'speed', unit: 'm/s', lo: 0.2, hi: 2, d: 1 },
  { tr: 'sıcaklık', en: 'temperature', unit: '°C', lo: -5, hi: 40, d: 0 },
  { tr: 'eğim', en: 'slope', unit: '%', lo: 0, hi: 15, d: 0 },
]
/** Doğrusal modelin ağırlıkları (dakika / birim) ve sabiti. */
export const LIN_W = [-4, -22, -0.5, -2.2]
export const LIN_B = 175

/** Pil ömrü (dakika). model 0: doğrusal olmayan (sıcaklıkta tepe, yük × eğim etkileşimi), 1: doğrusal. */
export function battery(x: readonly number[], model: number): number {
  const [load, speed, temp, slope] = x
  if (model === 1) return LIN_B + LIN_W[0] * load + LIN_W[1] * speed + LIN_W[2] * temp + LIN_W[3] * slope
  return 160 - 3 * load - 20 * speed - 0.08 * (temp - 20) ** 2 - 1.5 * slope - 0.25 * load * slope
}

/** 200 eski görev (arka plan) ve 12 yeni görev (açıklanacak örnekler). */
export function missions(seed = 6) {
  const r = rng(seed)
  const draw = () => FEATS.map((f) => f.lo + (f.hi - f.lo) * r())
  const bg = Array.from({ length: 200 }, draw)
  const mu = FEATS.map((_, j) => bg.reduce((s, x) => s + x[j], 0) / bg.length)
  const samples = Array.from({ length: 12 }, () => draw().map((v, j) => Number(v.toFixed(FEATS[j].d))))
  return { bg, mu, samples }
}

const fact = (n: number): number => (n <= 1 ? 1 : n * fact(n - 1))
const bits = (S: number) => [0, 1, 2, 3].filter((j) => (S >> j) & 1).length

/** Tam Shapley değerleri: 2^n koalisyonun hepsi; eksik özellik = arka plan ortalaması. */
export function shapley(f: (x: number[]) => number, x: readonly number[], mu: readonly number[]) {
  const n = x.length
  const v = (S: number) => f(x.map((xi, j) => ((S >> j) & 1 ? xi : mu[j])))
  const vals = Array.from({ length: 1 << n }, (_, S) => v(S))
  const phi = new Array(n).fill(0)
  for (let S = 0; S < 1 << n; S++) {
    const k = bits(S)
    for (let i = 0; i < n; i++) if (!((S >> i) & 1)) phi[i] += ((fact(k) * fact(n - k - 1)) / fact(n)) * (vals[S | (1 << i)] - vals[S])
  }
  return { phi, vals, base: vals[0], pred: vals[(1 << n) - 1] }
}

export interface ShapFrame extends Frame {
  x: number[]
  mu: number[]
  base: number
  pred: number
  /** Hesaplanan katkılar (henüz hesaplanmamışsa null). */
  phi: Array<number | null>
  /** Koalisyon değerleri v(S) (S: bit maskesi); gösterilmeyenler null. */
  vals: Array<number | null>
  /** Vurgulanan koalisyon ve özellik. */
  S?: number
  feat?: number
  sample: number
  model: number
  /** Şelale grafiğinin y aralığı (tüm örneklerde sabit). */
  yr: [number, number]
}

const ORDER = Array.from({ length: 16 }, (_, S) => S).sort((a, b) => bits(a) - bits(b) || a - b)

export const SHAP: Lesson<ShapFrame> = {
  slug: 'shap-degerleri',
  n: 0,
  title: { tr: 'SHAP: tahmini özelliklere paylaştırmak', en: 'SHAP: sharing a prediction among the features' },
  sub: { tr: 'Pil ömrü tahmininde her özelliğin adil payı', en: "Each feature's fair share of a battery-life prediction" },
  story: {
    tr: 'Bir teslimat robotunun modeli, görevden önce pil ömrünü dakika olarak tahmin ediyor. Dört girdi var: yük (0–10 kg), hız (0,2–2 m/s), ortam sıcaklığı (−5–40 °C) ve yol eğimi (%0–15). 200 eski görev arka planı oluşturuyor. 9 numaralı görevde (8,1 kg yük, 1,6 m/s, 4 °C, %5 eğim) model "pil 65,6 dakika dayanır" diyor; ortalama bir görevden yarım saat kısa. Operatör bunun nedenini görmek istiyor.',
    en: 'A delivery robot\'s model predicts battery life in minutes before each mission. It has four inputs: load (0–10 kg), speed (0.2–2 m/s), ambient temperature (−5–40 °C) and road slope (0–15%). 200 past missions form the background. For mission 9 (8.1 kg load, 1.6 m/s, 4 °C, 5% slope) the model says "the battery lasts 65.6 minutes", half an hour less than an average mission. The operator wants to see why.',
  },
  how: [
    { tr: 'Taban değer: hiçbir özellik bilinmiyorken tahmin, yani dört özelliğin de arka plan ortalamasında olduğu durum.', en: 'Base value: the prediction when no feature is known, i.e. all four features at their background average.' },
    { tr: 'Bir koalisyon, bilinen özelliklerin kümesidir; eksikler ortalamayla doldurulur. 4 özellik için 2⁴ = 16 koalisyon var.', en: 'A coalition is a set of known features; the missing ones are filled with the average. With 4 features there are 2⁴ = 16 coalitions.' },
    { tr: 'Bir özelliğin SHAP değeri, onu her koalisyona eklemenin getirdiği değişimin ağırlıklı ortalamasıdır; ağırlık |S|!(n−|S|−1)!/n!.', en: "A feature's SHAP value is the weighted average of the change from adding it to every coalition; the weight is |S|!(n−|S|−1)!/n!." },
    { tr: 'Katkılar tam toplanır: taban + katkılar = tahmin. Doğrusal modelde katkı tam olarak w·(x − ortalama).', en: 'The contributions add up exactly: base + contributions = prediction. In a linear model each contribution is exactly w·(x − average).' },
    { tr: 'Şunu dene: örnek numarasını değiştir; şelale yeniden kurulur. Modeli 1 (doğrusal) yap: yük–eğim etkileşimi kalkar.', en: 'Try this: change the sample number and the waterfall rebuilds. Set the model to 1 (linear): the load–slope interaction disappears.' },
  ],
  why: {
    tr: 'SHAP, kara kutu modelleri açıklamanın en yaygın yoludur: kredi kararlarından tıbbi tahminlere, arıza tahmininden otonom araç kayıtlarına kadar. Robotikte bir modelin neden "pil yetmez" ya da "motor arızalanacak" dediğini mühendise gösterir. Gerçek kütüphaneler çok özellikte tüm koalisyonları denemez; yaklaşık hesaplar.',
    en: 'SHAP is the most common way to explain black-box models: from credit decisions and medical predictions to failure prediction and autonomous-vehicle logs. In robotics it shows the engineer why a model said "the battery will not last" or "the motor will fail". Real libraries do not try every coalition when there are many features; they approximate.',
  },
  file: 'shap.py',
  code: [
    ['import numpy as np'],
    ['from math import factorial as fact'],
    ['rng = np.random.default_rng(6)'],
    ['lo, hi = [0, 0.2, -5, 0], [10, 2.0, 40, 15]', 'yük, hız, sıcaklık, eğim', 'load, speed, temp, slope'],
    ['bg = rng.uniform(lo, hi, (200, 4))', '200 eski görev', '200 past missions'],
    ['def f(z):', 'pil ömrü (dakika)', 'battery life (minutes)'],
    ['    load, speed, temp, slope = z'],
    ['    return (160 - 3 * load - 20 * speed'],
    ['            - .08 * (temp - 20) ** 2 - 1.5 * slope'],
    ['            - .25 * load * slope)', 'etkileşim', 'interaction'],
    ['x, mu = np.array([8.1, 1.6, 4, 5]), bg.mean(0)', 'görev 9', 'mission 9'],
    ['def v(S):', 'koalisyon değeri', 'coalition value'],
    ['    keep = [S >> j & 1 for j in range(4)]'],
    ['    return f(np.where(keep, x, mu))', 'eksik = ortalama', 'missing = average'],
    ['phi = np.zeros(4)'],
    ['for S in range(16):', '16 koalisyon', '16 coalitions'],
    ['    k = bin(S).count("1")'],
    ['    for i in range(4):'],
    ['        if not S >> i & 1:'],
    ['            w = fact(k) * fact(3 - k) / fact(4)'],
    ['            phi[i] += w * (v(S | 1 << i) - v(S))', 'eklemenin getirisi', 'gain from adding i'],
    ['print("taban", v(0), "katkılar", phi.round(1))', 'base, contributions', 'base, contributions'],
    ['print(v(0) + phi.sum(), "=", f(x))', 'toplam = tahmin', 'sum = prediction'],
  ],
  params: [
    { key: 'sample', label: { tr: 'Örnek görev no', en: 'Sample mission no' }, min: 0, max: 11, step: 1, value: 9 },
    { key: 'model', label: { tr: 'Model (0 eğri / 1 doğrusal)', en: 'Model (0 curved / 1 linear)' }, min: 0, max: 1, step: 1, value: 0 },
  ],
  run({ sample = 9, model = 0 }) {
    const M = model ? 1 : 0
    const { mu, samples } = missions()
    const si = Math.max(0, Math.min(samples.length - 1, Math.round(sample)))
    const f = (z: number[]) => battery(z, M)
    const all = samples.map((x) => ({ x, ...shapley(f, x, mu) }))
    // ortak y aralığı: tüm örneklerin şelale basamakları
    let lo = Infinity, hi = -Infinity
    for (const s of all) { let c = s.base; lo = Math.min(lo, c); hi = Math.max(hi, c); for (const p of s.phi) { c += p; lo = Math.min(lo, c); hi = Math.max(hi, c) } }
    const pad = (hi - lo) * 0.08
    const yr: [number, number] = [Math.floor((lo - pad) / 10) * 10, Math.ceil((hi + pad) / 10) * 10]
    const s = all[si]
    const F: ShapFrame[] = []
    const n1 = (x: number) => fmt(x, 1, 'tr'), e1 = (x: number) => x.toFixed(1)
    const nm = (j: number): [string, string] => [FEATS[j].tr, FEATS[j].en]
    const base = { x: s.x, mu, base: s.base, pred: s.pred, sample: si, model: M, yr }
    const vals: Array<number | null> = new Array(16).fill(null)
    F.push({ ...base, phi: [null, null, null, null], vals: vals.slice(), line: 10, cap: cap(`görev ${si}: model ${n1(s.pred)} dakika diyor`, `mission ${si}: the model says ${e1(s.pred)} minutes`), stat: cap('neden? tahmini dört özelliğe paylaştıralım', "why? let's share the prediction among the four features"), hold: 2 })
    F.push({ ...base, phi: [null, null, null, null], vals: vals.slice(), line: 13, cap: cap(`taban: hepsi ortalamada → ${n1(s.base)} dk`, `base: all at the average → ${e1(s.base)} min`), stat: cap('eksik özellik = 200 görevin ortalaması', 'missing feature = average of 200 missions'), hold: 1.8 })
    ORDER.forEach((S, k) => {
      vals[S] = s.vals[S]
      const names = [0, 1, 2, 3].filter((j) => (S >> j) & 1)
      F.push({ ...base, phi: [null, null, null, null], vals: vals.slice(), S, line: k < 6 ? 13 : 15,
        cap: cap(`koalisyon {${names.map((j) => FEATS[j].tr).join(', ') || '∅'}}: v = ${n1(s.vals[S])} dk`, `coalition {${names.map((j) => FEATS[j].en).join(', ') || '∅'}}: v = ${e1(s.vals[S])} min`),
        stat: cap(`${k + 1} / 16 koalisyon`, `${k + 1} / 16 coalitions`), hold: k < 5 ? 1.2 : 0.5 })
    })
    const phi: Array<number | null> = [null, null, null, null]
    for (let i = 0; i < 4; i++) {
      phi[i] = s.phi[i]
      F.push({ ...base, phi: phi.slice(), vals: s.vals, feat: i, line: 20,
        cap: cap(`${nm(i)[0]} = ${fmt(s.x[i], FEATS[i].d, 'tr')} ${FEATS[i].unit} → katkı ${s.phi[i] >= 0 ? '+' : '−'}${n1(Math.abs(s.phi[i]))} dk`, `${nm(i)[1]} = ${s.x[i].toFixed(FEATS[i].d)} ${FEATS[i].unit} → contribution ${s.phi[i] >= 0 ? '+' : '−'}${e1(Math.abs(s.phi[i]))} min`),
        stat: cap(`8 koalisyona eklemenin ağırlıklı ortalaması (ortalama ${fmt(mu[i], FEATS[i].d + 1, 'tr')} ${FEATS[i].unit})`, `weighted average over 8 coalitions (average ${mu[i].toFixed(FEATS[i].d + 1)} ${FEATS[i].unit})`), hold: 1.6 })
    }
    const sum = s.base + s.phi.reduce((a, b) => a + b, 0)
    F.push({ ...base, phi: s.phi, vals: s.vals, line: 22, cap: cap(`taban ${n1(s.base)} + katkılar = ${n1(sum)} = tahmin ${n1(s.pred)}`, `base ${e1(s.base)} + contributions = ${e1(sum)} = prediction ${e1(s.pred)}`), stat: cap('katkılar tam toplanır', 'the contributions add up exactly'), hold: 3 })
    // diğer görevler: her biri bir kare
    for (let k = 1; k < all.length; k++) {
      const j = (si + k) % all.length, o = all[j]
      let big = 0
      o.phi.forEach((p, i) => { if (Math.abs(p) > Math.abs(o.phi[big])) big = i })
      F.push({ x: o.x, mu, base: o.base, pred: o.pred, sample: j, model: M, yr, phi: o.phi, vals: o.vals, line: 21,
        cap: cap(`görev ${j}: ${n1(o.pred)} dk`, `mission ${j}: ${e1(o.pred)} min`),
        stat: cap(`en büyük katkı: ${nm(big)[0]} (${o.phi[big] >= 0 ? '+' : '−'}${n1(Math.abs(o.phi[big]))} dk)`, `largest contribution: ${nm(big)[1]} (${o.phi[big] >= 0 ? '+' : '−'}${e1(Math.abs(o.phi[big]))} min)`), hold: 1.2 })
    }
    return F
  },
}
