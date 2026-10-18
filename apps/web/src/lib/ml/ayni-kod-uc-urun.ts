// Ders: aynı kod, üç ürün. Tek bir learn() fonksiyonu (tahmin, hata, küçük adım; gerekirse gizli katman) üç robot işine verilir:
// yükten motor akımı (sayı), iki sensörden "engel var mı" (evet/hayır), arenada güvenli bölge (çitleme). Yalnız veri değişir.
import { cap, fmt, gauss, mean, rng, std, type Frame, type Lesson } from './core'

export interface Job {
  /** Girdiler (satır başına bir örnek) ve cevaplar; ilk k örnek eğitim, kalanı gizli sınama verisi. */
  X: number[][]
  y: number[]
  k: number
  /** Sigmoid (evet/hayır) mı, düz sayı mı? */
  sig: boolean
  H: number
}
export interface Model { m: number[]; s: number[]; W1: number[][]; b1: number[]; w: number[]; b: number; H: number; sig: boolean }
export interface Result { score: number; n: number; right?: number }
export interface AyniFrame extends Frame {
  job: 0 | 1 | 2
  data: Job
  model: Model | null
  loss: number[]
  step: number
  /** Her işin gizli veri sonucu (bitince dolar). */
  results: Array<Result | null>
  /** Gizli veri gösterilsin (sınama). */
  graded?: boolean
}

export const STEPS = 2000

/** İş 1: 24 ölçüm, yük 0–5 kg → motor akımı ≈ 0,3 + 0,42·kg A (±0,05 A). 18 eğitim, 6 gizli. */
export function currentJob(seed = 7): Job {
  const r = rng(seed)
  const X: number[][] = [], y: number[] = []
  for (let i = 0; i < 24; i++) { const kg = 5 * r(); X.push([kg]); y.push(0.3 + 0.42 * kg + 0.05 * gauss(r)) }
  return { X, y, k: 18, sig: false, H: 0 }
}
/** İş 2: 60 an, IR yansıması ve sonar yankısı (0–10) → engel var mı. 45 eğitim, 15 gizli. */
export function obstacleJob(seed = 8): Job {
  const r = rng(seed)
  const X: number[][] = [], y: number[] = []
  for (let i = 0; i < 60; i++) { const a = 10 * r(), b = 10 * r(); X.push([a, b]); y.push(0.6 * a + 0.4 * b + 0.5 * gauss(r) > 5 ? 1 : 0) }
  return { X, y, k: 45, sig: true, H: 0 }
}
/** İş 3: arenada 160 konum (−2…2 m); merkeze ~1,1 m'den (r² < 1,2) yakınsa güvenli. 120 eğitim, 40 gizli. */
export function zoneJob(H: number, seed = 9): Job {
  const r = rng(seed)
  const X: number[][] = [], y: number[] = []
  for (let i = 0; i < 160; i++) { const a = 4 * r() - 2, b = 4 * r() - 2; X.push([a, b]); y.push(a * a + b * b < 1.2 ? 1 : 0) }
  return { X, y, k: 120, sig: true, H }
}

const sigm = (z: number) => 1 / (1 + Math.exp(-z))

/** İleri hesap: ölçekle, (gizli katman,) toplam, (sigmoid). */
export function forward(M: Model, x: number[]) {
  const z = x.map((v, j) => (v - M.m[j]) / M.s[j])
  const h = M.H ? M.b1.map((bj, j) => Math.tanh(z.reduce((a, zi, i) => a + zi * M.W1[i][j], bj))) : z
  const o = h.reduce((a, hj, j) => a + hj * M.w[j], M.b)
  return { z, h, p: M.sig ? sigm(o) : o }
}
export const predict = (M: Model, x: number[]) => forward(M, x).p

const clone = (M: Model): Model => ({ ...M, W1: M.W1.map((r) => [...r]), b1: [...M.b1], w: [...M.w] })

/** Aynı öğrenme döngüsü her iş için: tahmin, hata, küçük adım (gizli katman varsa geri yayılım). */
export function learn(X: number[][], y: number[], H = 0, sig = true, lr = 1, steps = STEPS, snapAt: Set<number> = new Set(), seed = 1) {
  const d = X[0].length, n = X.length
  const m = Array.from({ length: d }, (_, j) => mean(X.map((x) => x[j])))
  const s = Array.from({ length: d }, (_, j) => std(X.map((x) => x[j])) || 1)
  const r = rng(seed)
  const M: Model = { m, s, W1: Array.from({ length: d }, () => Array.from({ length: H }, () => gauss(r))), b1: new Array(H).fill(0), w: new Array(H || d).fill(0.1), b: 0, H, sig }
  const snaps: Array<{ step: number; model: Model; loss: number }> = []
  const nh = H || d
  // ölçekli girdiler bir kez; döngü içinde dizi ayırmadan (tarayıcıda hızlı)
  const Z = X.map((x) => x.map((v, j) => (v - m[j]) / s[j]))
  const h = new Float64Array(nh), gw = new Float64Array(nh), gb1 = new Float64Array(H), gW1 = new Float64Array(d * H)
  const W = new Float64Array(d * H), B1 = new Float64Array(H), w = Float64Array.from(M.w)
  for (let a = 0; a < d; a++) for (let j = 0; j < H; j++) W[a * H + j] = M.W1[a][j]
  const sync = () => { for (let a = 0; a < d; a++) for (let j = 0; j < H; j++) M.W1[a][j] = W[a * H + j]; for (let j = 0; j < H; j++) M.b1[j] = B1[j]; for (let j = 0; j < nh; j++) M.w[j] = w[j] }
  for (let t = 0; t <= steps; t++) {
    gw.fill(0); gb1.fill(0); gW1.fill(0)
    let gb = 0, loss = 0
    for (let i = 0; i < n; i++) {
      const z = Z[i]
      let o = M.b
      for (let j = 0; j < nh; j++) {
        if (H) { let u = B1[j]; for (let a = 0; a < d; a++) u += z[a] * W[a * H + j]; h[j] = 1 - 2 / (Math.exp(2 * u) + 1) } else h[j] = z[j]
        o += h[j] * w[j]
      }
      const p = sig ? 1 / (1 + Math.exp(-o)) : o
      loss += sig ? -(y[i] ? Math.log(p + 1e-12) : Math.log(1 - p + 1e-12)) : 0.5 * (p - y[i]) ** 2
      const g = (p - y[i]) / n
      gb += g
      for (let j = 0; j < nh; j++) {
        gw[j] += h[j] * g
        if (H) { const gh = g * w[j] * (1 - h[j] * h[j]); for (let a = 0; a < d; a++) gW1[a * H + j] += z[a] * gh; gb1[j] += gh }
      }
    }
    if (snapAt.has(t) || t === steps) sync(), snaps.push({ step: t, model: clone(M), loss: loss / n })
    if (t === steps) break
    for (let j = 0; j < nh; j++) w[j] -= lr * gw[j]
    M.b -= lr * gb
    for (let j = 0; j < H; j++) { for (let a = 0; a < d; a++) W[a * H + j] -= lr * gW1[a * H + j]; B1[j] -= lr * gb1[j] }
  }
  return { model: M, snaps }
}

/** Gizli veriyle sınama: regresyonda ortalama mutlak hata, sınıflandırmada doğruluk. */
export function grade(job: Job, M: Model): Result {
  const idx = job.y.map((_, i) => i).slice(job.k)
  if (!job.sig) return { score: mean(idx.map((i) => Math.abs(predict(M, job.X[i]) - job.y[i]))), n: idx.length }
  const right = idx.filter((i) => (predict(M, job.X[i]) > 0.5 ? 1 : 0) === job.y[i]).length
  return { score: right / idx.length, n: idx.length, right }
}
export function trainAcc(job: Job, M: Model) {
  return mean(job.y.slice(0, job.k).map((t, i) => ((predict(M, job.X[i]) > 0.5 ? 1 : 0) === t ? 1 : 0)))
}

/** Bir işi baştan sona çalıştır (testler ve sahne aynı yolu kullanır). */
export function runJob(job: Job, lr: number, snapAt: Set<number> = new Set()) {
  const { model, snaps } = learn(job.X.slice(0, job.k), job.y.slice(0, job.k), job.H, job.sig, lr, STEPS, snapAt)
  return { model, snaps, result: grade(job, model) }
}

const SNAPS = new Set(Array.from({ length: 31 }, (_, i) => Math.round(Math.pow(STEPS + 1, i / 30)) - 1))
/** Bir işte kaç ara görüntü (kayıp grafiğinin x ekseni). */
export const SNAP_COUNT = SNAPS.size + (SNAPS.has(STEPS) ? 0 : 1)

const NAMES: Array<[string, string]> = [['motor akımı', 'motor current'], ['engel', 'obstacle'], ['güvenli bölge', 'safe zone']]
export const resultText = (job: 0 | 1 | 2, R: Result): [string, string] =>
  job === 0 ? [`ort. hata ${fmt(R.score, 3, 'tr')} A`, `mean error ${R.score.toFixed(3)} A`]
    : [`${R.right}/${R.n} doğru (%${Math.round(R.score * 100)})`, `${R.right}/${R.n} right (${Math.round(R.score * 100)}%)`]

export const AYNI_KOD: Lesson<AyniFrame> = {
  slug: 'ayni-kod-uc-urun',
  n: 0,
  title: { tr: 'Aynı kod, üç ürün', en: 'Same code, three products' },
  sub: { tr: 'Tek bir learn() fonksiyonu: sayı tahmini, evet/hayır, bölge çitleme', en: 'One learn() function: a number, a yes/no, a fenced zone' },
  story: {
    tr: "Bir depo robotunda üç ayrı soru var. (1) Taşıdığı yük (0–5 kg) motorun kaç amper çekeceğini söyler mi? 24 ölçüm. (2) Kızılötesi yansıma ve sonar yankısı (ikisi de 0–10) birlikte \"önde engel var\" der mi? 60 an. (3) Arenadaki 160 konumdan hangileri ortadaki güvenli bölgede? Üçünü de aynı learn() fonksiyonu öğreniyor; her işte örneklerin dörtte biri saklanır ve model en sonda bu hiç görmediği örneklerle sınanır.",
    en: 'A warehouse robot has three separate questions. (1) Does the load it carries (0–5 kg) tell how many amps the motor will draw? 24 measurements. (2) Do the infrared reflection and the sonar echo (both 0–10) together say "obstacle ahead"? 60 moments. (3) Which of 160 arena positions lie in the safe zone in the middle? The same learn() function learns all three; in each job a quarter of the examples is held back and the model is graded on them at the end.',
  },
  how: [
    { tr: 'learn() hep aynı döngüdür: örnekleri al, tahmin et, hatayı bul, ağırlıkları hataya karşı küçük bir adım oynat, tekrar et.', en: 'learn() is always the same loop: take the examples, guess, find the error, move the weights a small step against it, again and again.' },
    { tr: 'Sayı tahmininde çıktı düz toplamdır (doğru). Evet/hayır işinde üstüne sigmoid eğrisi gelir: çıktı 0–1 arası güven olur.', en: 'For a number the output is the plain sum (a line). For yes/no the sigmoid curve goes on top, and the output becomes a 0–1 confidence.' },
    { tr: 'Bölge işinde tek bir doğru yetmez: gizli nöronların her biri bir doğru çizer, hata geriye doğru onlara dağıtılır (geri yayılım) ve birlikte bölgeyi çitlerler.', en: 'For the zone a single line is not enough: each hidden neuron draws a line, the error flows back to them (backpropagation) and together they fence the zone in.' },
    { tr: 'Her model, canlıya çıkmadan önce hiç görmediği örneklerle notlanır: ezber değil, genelleme ölçülür.', en: 'Before going live every model is graded on examples it never saw: we measure generalisation, not memory.' },
    { tr: 'Şunu dene: gizli nöron sayısını 0 yap; üçüncü iş tek nörona kalır ve bölgeyi çitleyemez, doğruluk belirgin düşer.', en: 'Try this: set the hidden neurons to 0; the third job is left with a single neuron, cannot fence the zone and its accuracy drops clearly.' },
  ],
  why: {
    tr: 'Gerçek ürünlerin çoğu bu üç kalıptan birine oturur: bir sayı tahmin et (akım, sıcaklık, varış süresi), evet/hayır de (engel, arıza, spam), bir bölgeyi tanı (güvenli çalışma alanı, beğenilen içerik). Robotikte de aynı öğrenme kodu, yalnız veri değiştirilerek motor modeline, sensör füzyonuna ve güvenli bölge sınırına dönüşür.',
    en: 'Most real products fit one of these three patterns: predict a number (current, temperature, arrival time), say yes or no (obstacle, fault, spam), recognise a zone (a safe workspace, content you like). In robotics too, the same learning code becomes a motor model, a sensor fusion rule or a safe-zone border just by changing the data.',
  },
  file: 'ayni_kod.py',
  code: [
    ['import numpy as np'],
    ['rng = np.random.default_rng(7)'],
    ['def learn(X, y, H=0, lr=1.0, steps=2000):', 'tek öğrenme fonksiyonu', 'one learning function'],
    ['    m, s = X.mean(0), X.std(0); S = (X - m) / s', 'ölçekle', 'scale'],
    ['    W1, b1 = rng.normal(size=(len(m), H)), np.zeros(H)', 'gizli katman (H nöron)', 'hidden layer (H neurons)'],
    ['    w, b, sig = np.full(H or len(m), .1), 0, y.dtype == bool', 'cevap evet/hayır mı?', 'yes/no answers?'],
    ['    def f(Z):'],
    ['        h = np.tanh(Z @ W1 + b1) if H else Z; o = h @ w + b', 'ağırlıklı toplam', 'weighted sum'],
    ['        return h, 1 / (1 + np.exp(-o)) if sig else o', 'evet/hayır ise sigmoid', 'sigmoid for yes/no'],
    ['    for _ in range(steps):'],
    ['        h, p = f(S); g = (p - y) / len(y)', 'tahmin ve hata', 'guess and error'],
    ['        if H: gh = np.outer(g, w) * (1 - h ** 2)', 'hata geriye akar', 'error flows back'],
    ['        w -= lr * h.T @ g; b -= lr * g.sum()', 'küçük adım', 'small step'],
    ['        if H: W1 -= lr * S.T @ gh; b1 -= lr * gh.sum(0)'],
    ['    return lambda Z: f((Z - m) / s)[1]', 'eğitilmiş model', 'the trained model'],
    ['kg = rng.uniform(0, 5, (24, 1))', '1) yük (kg)', '1) load (kg)'],
    ['amp = .3 + .42 * kg[:, 0] + rng.normal(0, .05, 24)', 'motor akımı (A)', 'motor current (A)'],
    ['ir = rng.uniform(0, 10, (60, 2))', '2) IR ve sonar', '2) IR and sonar'],
    ['see = ir @ [.6, .4] + rng.normal(0, .5, 60) > 5', 'engel var mı', 'obstacle?'],
    ['xy = rng.uniform(-2, 2, (160, 2))', '3) arena konumu (m)', '3) arena position (m)'],
    ['ok = (xy ** 2).sum(1) < 1.2', 'ortadaki güvenli bölge', 'the safe zone in the middle'],
    ['for X, y, H in (kg, amp, 0), (ir, see, 0), (xy, ok, 6):', 'aynı kod, üç iş', 'same code, three jobs'],
    ['    k = len(y) * 3 // 4; p = learn(X[:k], y[:k], H)(X[k:])', 'dörtte biri gizli', 'a quarter held back'],
    ['    e = abs(p - y[k:]); print(e.mean(), (e < .5).mean())', 'gizli: ort. hata, isabet', 'hidden: mean error, hit rate'],
  ],
  params: [
    { key: 'H', label: { tr: 'Bölge işinde gizli nöron', en: 'Hidden neurons (zone job)' }, min: 0, max: 12, step: 1, value: 6 },
    { key: 'lr', label: { tr: 'Öğrenme oranı', en: 'Learning rate' }, min: 0.05, max: 3, step: 0.05, value: 1 },
  ],
  run({ H = 6, lr = 1 }) {
    const jobs: Job[] = [currentJob(), obstacleJob(), zoneJob(H)]
    const results: Array<Result | null> = [null, null, null]
    const F: AyniFrame[] = []
    const dataLine = [15, 17, 19]
    const intro: Array<[string, string]> = [
      ['iş 1 · 24 ölçüm: yük → motor akımı', 'job 1 · 24 measurements: load → motor current'],
      ['iş 2 · 60 an: IR + sonar → engel var mı', 'job 2 · 60 moments: IR + sonar → obstacle?'],
      ['iş 3 · 160 konum: güvenli bölgede mi', 'job 3 · 160 positions: inside the safe zone?'],
    ]
    jobs.forEach((data, j) => {
      const job = j as 0 | 1 | 2
      const { snaps, model, result } = runJob(data, lr, SNAPS)
      const R = () => [...results]
      const kind = data.sig ? (data.H ? cap(`learn(): ${data.H} gizli nöron + sigmoid`, `learn(): ${data.H} hidden neurons + sigmoid`) : cap('learn(): tek nöron, sigmoid', 'learn(): one neuron, sigmoid')) : cap('learn(): doğru, sigmoid yok', 'learn(): a line, no sigmoid')
      const sumStat = cap(`${data.k} eğitim · ${data.y.length - data.k} gizli`, `${data.k} training · ${data.y.length - data.k} hidden`)
      F.push({ job, data, model: null, loss: [], step: 0, results: R(), line: dataLine[j], cap: intro[j], stat: sumStat, hold: 2 })
      F.push({ job, data, model: null, loss: [], step: 0, results: R(), line: 22, cap: cap(`aynı learn() çağrılır · ${NAMES[j][0]}`, `the same learn() is called · ${NAMES[j][1]}`), stat: kind, hold: 1.5 })
      const s0 = snaps[0]
      const st = (s: typeof s0) => {
        if (!data.sig) return cap(`kayıp ${fmt(s.loss, 4, 'tr')}`, `loss ${s.loss.toFixed(4)}`)
        const a = Math.round(trainAcc(data, s.model) * 100)
        return cap(`kayıp ${fmt(s.loss, 3, 'tr')} · eğitim doğruluğu %${a}`, `loss ${s.loss.toFixed(3)} · training accuracy ${a}%`)
      }
      if (j === 0) {
        for (const l of [3, 4, 5]) F.push({ job, data, model: null, loss: [], step: 0, results: R(), line: l, cap: l === 3 ? cap('girdileri ölçekle', 'scale the inputs') : cap('ağırlıklar başlar', 'weights start'), stat: kind, hold: 1 })
        for (const l of [10, 12]) F.push({ job, data, model: s0.model, loss: [s0.loss], step: 0, results: R(), line: l, cap: l === 10 ? cap('tahmin et, hatayı bul', 'guess, find the error') : cap('hataya karşı küçük adım', 'a small step against the error'), stat: st(s0), hold: 1.1 })
      }
      if (j === 2 && data.H) for (const l of [10, 11, 12, 13]) F.push({ job, data, model: s0.model, loss: [s0.loss], step: 0, results: R(), line: l, cap: l === 11 || l === 13 ? cap('hata gizli nöronlara geri akar', 'the error flows back to the hidden neurons') : cap('aynı döngü', 'the same loop'), stat: st(s0), hold: 1 })
      snaps.forEach((s, i) => {
        if (i === 0) return
        F.push({ job, data, model: s.model, loss: snaps.slice(0, i + 1).map((q) => q.loss), step: s.step, results: R(), line: 12, cap: cap(`${NAMES[j][0]} · adım ${s.step}`, `${NAMES[j][1]} · step ${s.step}`), stat: st(s), hold: i < 6 ? 0.5 : 0.3 })
      })
      const loss = snaps.map((q) => q.loss)
      F.push({ job, data, model, loss, step: STEPS, results: R(), line: 14, cap: cap('eğitilmiş model döner', 'the trained model comes back'), stat: st(snaps.at(-1)!), hold: 1 })
      results[j] = result
      const t = resultText(job, result)
      F.push({ job, data, model, loss, step: STEPS, results: R(), graded: true, line: 23, cap: cap(`gizli veri: ${t[0]}`, `hidden data: ${t[1]}`), stat: sumStat, hold: 2.5 })
    })
    const last = F.at(-1)!
    const t = results.map((r, j) => resultText(j as 0 | 1 | 2, r!))
    F.push({ ...last, line: 21, cap: cap('aynı kod, üç ürün: yalnız veri değişti', 'same code, three products: only the data changed'), stat: cap(`${t[0][0]} · ${t[1][0]} · ${t[2][0]}`, `${t[0][1]} · ${t[1][1]} · ${t[2][1]}`), hold: 3 })
    return F
  },
}
