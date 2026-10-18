// Proje: depoda nesne sınıflandırma. Konveyör bandı kameranın ve lazer ölçerin altından nesne getirir; her nesne için üç sayı
// okunur: yuvarlaklık (kamera silüeti, küp ~0,1, küre ~0,95), renk tonu (0–1) ve boy (cm). Dört varış kutusu vardır: oyuncak,
// elektronik, gıda, büyük koli. Model etiketli örneklerden öğrenir (k-NN, karar ağacı ya da Gauss naive Bayes: derslerdeki iki
// özellikli sürümlerin çok özellikli hâli), sonra bantta gelen her yeni nesneyi tarayıcı kapısında sınıflar ve tahmin ettiği
// kutuya iter. Gerçek etiket bilindiği için doğruluk ve karışıklık matrisi canlı tutulur. Aynı tohum hep aynı bandı verir.
import { cap, fmt, gauss, rng, type Lang } from '../core'
import type { Curve, Metric, ProjectDef, ProjectRun, Table } from './core'
import { B, gecmisGrafik, ogrenmeEgrisi, siniflandirmaBlok, type EgitimRaporu } from '../egitim/rapor'

/** Nesne biçimleri: 0 küp, 1 koni, 2 silindir, 3 küre. */
export type Shape = 0 | 1 | 2 | 3
export const SHAPE_ROUND = [0.1, 0.45, 0.7, 0.95]
export const BINS: Array<[string, string]> = [['oyuncak', 'toys'], ['elektronik', 'electronics'], ['gıda', 'food'], ['büyük koli', 'large parcel']]
export const MODELS: Array<[string, string]> = [['k-NN', 'k-NN'], ['karar ağacı', 'decision tree'], ['naive Bayes', 'naive Bayes']]

/** Sınıf başına: biçim olasılıkları [küp, koni, silindir, küre], ton ortalaması ve sapması, boy ortalaması ve sapması (cm). */
const CLASSES: Array<{ shape: number[]; hue: [number, number]; size: [number, number] }> = [
  { shape: [0.1, 0.4, 0, 0.5], hue: [0.07, 0.05], size: [12, 3] }, // oyuncak: küre ve koni, sıcak renk, küçük
  { shape: [0.8, 0, 0.2, 0], hue: [0.6, 0.06], size: [20, 4] }, // elektronik: kutu, mavi-gri, orta
  { shape: [0.15, 0, 0.75, 0.1], hue: [0.3, 0.1], size: [16, 3] }, // gıda: konserve silindir, yeşil ağırlıklı
  { shape: [0.9, 0, 0.1, 0], hue: [0.09, 0.04], size: [32, 5] }, // büyük koli: karton rengi, büyük
]

/** Banttaki gerçek nesne ve sensörün okuduğu üç sayı. */
export interface Item { shape: Shape; hue: number; size: number; c: number; f: [number, number, number] }

/**
 * `n` nesne üretir. Sınıflar eşit olasılıklı. Ölçülen özellikler gerçek değerlerin üstüne sensör gürültüsü alır:
 * `noise` 0 iken bile kamera silüeti biraz oynar; 1'de yuvarlaklık ±0,15, ton ±0,08, boy ±5 cm sapar.
 */
export function makeItems(r: () => number, n: number, noise: number): Item[] {
  const out: Item[] = []
  for (let i = 0; i < n; i++) {
    const c = Math.floor(r() * 4), K = CLASSES[c]
    let u = r(), shape = 0
    while (shape < 3 && u >= K.shape[shape]) { u -= K.shape[shape]; shape++ }
    const hue = Math.min(0.95, Math.max(0.01, K.hue[0] + K.hue[1] * gauss(r)))
    const size = Math.max(5, K.size[0] + K.size[1] * gauss(r))
    const f: [number, number, number] = [
      SHAPE_ROUND[shape] + 0.05 * gauss(r) + noise * 0.15 * gauss(r),
      hue + noise * 0.08 * gauss(r),
      size + noise * 5 * gauss(r),
    ]
    out.push({ shape: shape as Shape, hue, size, c, f })
  }
  return out
}

type Vec = [number, number, number]
export interface Classifier { predict(x: Vec): number }

/** k-NN: özellikler eğitim kümesine göre ölçeklenir (ortalama 0, sapma 1), en yakın k örneğin oyu; eşitlikte küçük numara. */
export function fitKnn(X: Item[], k: number): Classifier {
  const mu = [0, 1, 2].map((j) => X.reduce((s, p) => s + p.f[j], 0) / X.length)
  const sd = [0, 1, 2].map((j) => Math.sqrt(X.reduce((s, p) => s + (p.f[j] - mu[j]) ** 2, 0) / X.length) || 1)
  const Z = X.map((p) => p.f.map((v, j) => (v - mu[j]) / sd[j]))
  return {
    predict(x) {
      const z = x.map((v, j) => (v - mu[j]) / sd[j])
      const near = Z.map((q, i) => [(q[0] - z[0]) ** 2 + (q[1] - z[1]) ** 2 + (q[2] - z[2]) ** 2, i] as const).sort((a, b) => a[0] - b[0]).slice(0, k)
      const votes = [0, 0, 0, 0]
      near.forEach(([, i]) => votes[X[i].c]++)
      return votes.indexOf(Math.max(...votes))
    },
  }
}

/** Dört sınıflı Gini safsızlığı (karar ağacı dersindekinin aynısı). */
export function gini4(c: number[]): number {
  if (!c.length) return 0
  const k = [0, 0, 0, 0]; c.forEach((x) => k[x]++)
  return 1 - k.reduce((s, x) => s + (x / c.length) ** 2, 0)
}
const majority4 = (c: number[]) => { const k = [0, 0, 0, 0]; c.forEach((x) => k[x]++); return k.indexOf(Math.max(...k)) }
export type TNode = { leaf: true; c: number } | { leaf: false; f: number; t: number; L: TNode; R: TNode }

/** Karar ağacı: her düğümde üç özelliğin bütün ara eşikleri denenir, Gini'yi en çok azaltan soru seçilir; derinlik sınırına kadar. */
export function growTree(X: Item[], depth: number): TNode {
  const cs = X.map((p) => p.c)
  let best = { g: gini4(cs), f: -1, t: 0 }
  if (depth > 0) for (let f = 0; f < 3; f++) {
    const s = [...X].sort((a, b) => a.f[f] - b.f[f])
    const L = [0, 0, 0, 0], R = [0, 0, 0, 0]
    s.forEach((p) => R[p.c]++)
    const imp = (k: number[], n: number) => (n ? 1 - k.reduce((q, x) => q + (x / n) ** 2, 0) : 0)
    for (let i = 0; i < s.length - 1; i++) {
      L[s[i].c]++; R[s[i].c]--
      if (s[i].f[f] === s[i + 1].f[f]) continue
      const nl = i + 1, nr = s.length - nl
      const g = (nl * imp(L, nl) + nr * imp(R, nr)) / s.length
      if (g < best.g - 1e-12) best = { g, f, t: (s[i].f[f] + s[i + 1].f[f]) / 2 }
    }
  }
  if (best.f < 0) return { leaf: true, c: majority4(cs) }
  const f = best.f, t = best.t
  return { leaf: false, f, t, L: growTree(X.filter((p) => p.f[f] <= t), depth - 1), R: growTree(X.filter((p) => p.f[f] > t), depth - 1) }
}
export function fitTree(X: Item[], depth: number): Classifier & { root: TNode } {
  const root = growTree(X, depth)
  return { root, predict(x) { let n = root; while (!n.leaf) n = x[n.f] <= n.t ? n.L : n.R; return n.c } }
}

/** Gauss naive Bayes: her sınıf ve özellik için ortalama ve varyans, sınıf oranı; log olasılıkların toplamı en büyük sınıf. */
export function fitNB(X: Item[]): Classifier {
  const M = [0, 1, 2, 3].map((c) => {
    const S = X.filter((p) => p.c === c)
    const m = [0, 1, 2].map((j) => (S.length ? S.reduce((s, p) => s + p.f[j], 0) / S.length : 0))
    const v = [0, 1, 2].map((j) => Math.max(1e-4, S.length ? S.reduce((s, p) => s + (p.f[j] - m[j]) ** 2, 0) / S.length : 1))
    return { m, v, prior: Math.max(1e-9, S.length / X.length), n: S.length }
  })
  return {
    predict(x) {
      let bc = 0, bs = -Infinity
      M.forEach((K, c) => {
        if (!K.n) return
        let s = Math.log(K.prior)
        for (let j = 0; j < 3; j++) s += -0.5 * (Math.log(2 * Math.PI * K.v[j]) + (x[j] - K.m[j]) ** 2 / K.v[j])
        if (s > bs) { bs = s; bc = c }
      })
      return bc
    },
  }
}

export function fitModel(model: number, X: Item[], k: number, depth: number): Classifier {
  return model === 1 ? fitTree(X, depth) : model === 2 ? fitNB(X) : fitKnn(X, k)
}

/** Saklı küme üzerinde doğruluk (testler ve "Kendin dene" iddiaları için). */
export function heldOutAccuracy(p: Record<string, number>, n = 1000): number {
  const s = settings(p)
  const r = rng(s.seed)
  const train = makeItems(r, s.nTrain, s.noise)
  const M = fitModel(s.model, train, s.k, s.depth)
  const test = makeItems(rng(s.seed + 1000), n, s.noise)
  return test.filter((q) => M.predict(q.f) === q.c).length / n
}

// Bant geometrisi (metre, bant ekseni x): nesne doğar, tarayıcıdan geçer, kendi kutusunun hizasında yana itilir.
export const BELT = { spawn: -4.2, scan: -1.6, end: 4.3, binX: [-0.2, 1.1, 2.4, 3.7], speed: 0.025, gap: 28 }
export const TOTAL = 200

export interface BeltObj {
  id: number; shape: Shape; hue: number; size: number; c: number
  /** Bant üzerindeki konum (m). */
  x: number
  /** Tarayıcıda verilen tahmin (henüz taranmadıysa yok). */
  pred?: number
  /** Kutuya itilme ilerlemesi 0–1 (itilmeye başlamadıysa yok). */
  push?: number
}
export interface DepoView {
  objs: BeltObj[]
  /** Son taramanın tiki (sahne kapıdaki ışığı yakıp söndürür). */
  scanTick: number
  tick: number
  /** Kutu başına içine düşmüş nesneler: doğru ve yanlış sayısı. */
  binOk: number[]
  binBad: number[]
  /** Seçilen model: 0 k-NN, 1 karar ağacı, 2 naive Bayes. */
  model: number
}

function settings(p: Record<string, number>) {
  return {
    seed: Math.round(p.seed ?? 7), model: Math.round(p.model ?? 0), k: Math.round(p.k ?? 5), depth: Math.round(p.depth ?? 4),
    noise: p.noise ?? 0.3, nTrain: Math.round(p.nTrain ?? 120),
  }
}

const pct = (x: number, lang: Lang) => `%${fmt(x * 100, 0, lang)}`
const pctEn = (x: number) => `${(x * 100).toFixed(0)}%`

export function createDepo(p: Record<string, number>): ProjectRun<DepoView> {
  const s = settings(p)
  const r = rng(s.seed)
  const train = makeItems(r, s.nTrain, s.noise)
  const M = fitModel(s.model, train, s.k, s.depth)
  const stream = makeItems(rng(s.seed + 1000), TOTAL, s.noise)
  const conf = Array.from({ length: 4 }, () => [0, 0, 0, 0])
  const accHist: number[] = []
  const H = { n: [] as number[], true: [] as number[], pred: [] as number[], correct: [] as number[], accuracy: [] as number[] }
  let rep: { n: number; r: EgitimRaporu } | null = null
  let lc: { sizes: number[]; train: number[]; test: number[] } | null = null
  /** Öğrenme eğrisi: etiketli örneklerin ilk 20, 40, … tanesiyle aynı model; eğitim doğruluğu ve banttaki 200 nesnede doğruluk. */
  const learningCurve = () => {
    if (lc) return lc
    const sizes: number[] = [], tr: number[] = [], te: number[] = []
    for (let n = Math.min(20, s.nTrain); n <= s.nTrain; n += 20) {
      const sub = train.slice(0, n), m = fitModel(s.model, sub, Math.min(s.k, n), s.depth)
      sizes.push(n)
      tr.push(sub.filter((q) => m.predict(q.f) === q.c).length / n)
      te.push(stream.filter((q) => m.predict(q.f) === q.c).length / stream.length)
    }
    return (lc = { sizes, train: tr, test: te })
  }
  let trainAcc = NaN
  let spawned = 0, scanned = 0, correct = 0, landed = 0
  const view: DepoView = { objs: [], scanTick: -999, tick: 0, binOk: [0, 0, 0, 0], binBad: [0, 0, 0, 0], model: s.model }

  const one = () => {
    view.tick++
    if (spawned < TOTAL && (view.tick - 1) % BELT.gap === 0) {
      const it = stream[spawned]
      view.objs.push({ id: spawned, shape: it.shape, hue: it.hue, size: it.size, c: it.c, x: BELT.spawn })
      spawned++
    }
    for (const o of view.objs) {
      if (o.push !== undefined) { o.push = Math.min(1, o.push + 0.06); continue }
      const before = o.x
      o.x += BELT.speed
      if (o.pred === undefined && before < BELT.scan && o.x >= BELT.scan) {
        const it = stream[o.id]
        o.pred = M.predict(it.f)
        conf[o.c][o.pred]++
        scanned++
        if (o.pred === o.c) correct++
        accHist.push(correct / scanned)
        H.n.push(scanned); H.true.push(o.c); H.pred.push(o.pred); H.correct.push(o.pred === o.c ? 1 : 0); H.accuracy.push(correct / scanned)
        view.scanTick = view.tick
      }
      if (o.pred !== undefined && o.x >= BELT.binX[o.pred]) { o.x = BELT.binX[o.pred]; o.push = 0 }
    }
    const keep: BeltObj[] = []
    for (const o of view.objs) {
      if (o.push !== undefined && o.push >= 1) { landed++; if (o.pred === o.c) view.binOk[o.pred!]++; else view.binBad[o.pred!]++ }
      else keep.push(o)
    }
    view.objs = keep
  }

  return {
    view,
    step(n) { for (let i = 0; i < n && landed < TOTAL; i++) one() },
    done: () => landed >= TOTAL,
    status() {
      const m = MODELS[s.model]
      const par = s.model === 0 ? [`k = ${s.k}`, `k = ${s.k}`] : s.model === 1 ? [`derinlik ${s.depth}`, `depth ${s.depth}`] : ['', '']
      const acc = scanned ? correct / scanned : 0
      return cap(
        `${m[0]}${par[0] ? ` (${par[0]})` : ''} · ${scanned} / ${TOTAL} nesne tarandı${scanned ? ` · doğruluk ${pct(acc, 'tr')}` : ''}`,
        `${m[1]}${par[1] ? ` (${par[1]})` : ''} · ${scanned} / ${TOTAL} objects scanned${scanned ? ` · accuracy ${pctEn(acc)}` : ''}`,
      )
    },
    metrics(): Metric[] {
      const acc = scanned ? correct / scanned : 0
      // kutu başına duyarlılık (o kutuya ait olanların ne kadarı oraya gitti) ve kesinlik (kutuya gidenlerin ne kadarı ona ait)
      const rec = conf.map((row, c) => { const n = row.reduce((a, b) => a + b, 0); return n ? row[c] / n : NaN })
      const prec = [0, 1, 2, 3].map((c) => { const n = conf.reduce((a, row) => a + row[c], 0); return n ? conf[c][c] / n : NaN })
      const fin = (a: number[]) => a.map((v, i) => [v, i] as const).filter(([v]) => Number.isFinite(v))
      const worstR = fin(rec).sort((a, b) => a[0] - b[0])[0], worstP = fin(prec).sort((a, b) => a[0] - b[0])[0]
      const w = (x: readonly [number, number] | undefined, tr: boolean) => (x ? `${tr ? pct(x[0], 'tr') : pctEn(x[0])} · ${BINS[x[1]][tr ? 0 : 1]}` : '—')
      return [
        { label: { tr: 'Taranan nesne', en: 'Objects scanned' }, value: cap(`${scanned} / ${TOTAL}`, `${scanned} / ${TOTAL}`) },
        { label: { tr: 'Doğruluk', en: 'Accuracy' }, value: scanned ? cap(pct(acc, 'tr'), pctEn(acc)) : cap('—', '—'), tone: scanned >= 20 ? (acc >= 0.85 ? 'good' : acc < 0.7 ? 'bad' : undefined) : undefined },
        { label: { tr: 'Yanlış kutu', en: 'Wrong bin' }, value: cap(String(scanned - correct), String(scanned - correct)) },
        { label: { tr: 'En düşük duyarlılık', en: 'Lowest recall' }, value: cap(w(worstR, true), w(worstR, false)) },
        { label: { tr: 'En düşük kesinlik', en: 'Lowest precision' }, value: cap(w(worstP, true), w(worstP, false)) },
        { label: { tr: 'Etiketli örnek', en: 'Labelled examples' }, value: cap(String(s.nTrain), String(s.nTrain)) },
      ]
    },
    report(): EgitimRaporu {
      if (rep && rep.n === scanned) return rep.r
      if (Number.isNaN(trainAcc)) trainAcc = train.filter((q) => M.predict(q.f) === q.c).length / train.length
      const labels = BINS.map(([tr]) => tr)
      const r: EgitimRaporu = {
        kind: 'siniflandirma', model: MODELS[s.model][0] + (s.model === 0 ? ` (k = ${s.k})` : s.model === 1 ? ` (derinlik ${s.depth})` : ''), seed: s.seed,
        hyper: { model: MODELS[s.model][1], k: s.k, depth: s.depth, noise: s.noise, train: s.nTrain, belt: TOTAL },
        history: { x: 'n', cols: Object.fromEntries(Object.entries(H).map(([k, v]) => [k, v.slice()])) },
        final: [], charts: [],
      }
      const blk = siniflandirmaBlok({ y: H.true, pred: H.pred, labels })
      const L = learningCurve()
      r.final = [
        { key: 'scanned', label: B('taranan nesne', 'objects scanned'), value: scanned, fmt: 'int' },
        ...blk.final,
        { key: 'train_accuracy', label: B('eğitim doğruluğu', 'training accuracy'), value: trainAcc, fmt: 'pct' },
      ]
      r.confusion = blk.confusion
      r.charts = [
        gecmisGrafik(r, 'acc', B('Doğruluk (taranan nesneye göre, birikimli)', 'Accuracy (cumulative, by objects scanned)'), [['accuracy', B('doğruluk', 'accuracy'), 1]], { xLabel: B('taranan nesne', 'objects scanned'), yMin: 0, yMax: 1, live: false }),
        ...blk.charts,
        ogrenmeEgrisi(L.sizes, L.train, L.test, B('doğruluk', 'accuracy'), { yMin: 0, yMax: 1 }),
      ]
      rep = { n: scanned, r }
      return r
    },
    curves(): Curve[] {
      return [{ label: { tr: 'Doğruluk (taranan nesneye göre)', en: 'Accuracy (by objects scanned)' }, values: accHist }]
    },
    table(): Table {
      return {
        title: { tr: 'Karışıklık matrisi: satır gerçek kutu, sütun tahmin', en: 'Confusion matrix: row true bin, column predicted' },
        cols: BINS.map(([tr, en]) => cap(tr.split(' ')[0], en.split(' ')[0])),
        rows: conf.map((row, c) => ({ label: cap(BINS[c][0], BINS[c][1]), cells: [...row] })),
        diag: true,
      }
    },
  }
}

export const DEPO_SINIFLANDIRMA: ProjectDef<DepoView> = {
  slug: 'depo-siniflandirma',
  title: { tr: 'Depoda nesne sınıflandırma', en: 'Sorting objects in a warehouse' },
  sub: { tr: 'Konveyör bandındaki nesneleri biçim, renk ve boydan tanıyıp doğru kutuya iten model', en: 'A model that recognises objects on a conveyor by shape, colour and size and pushes them into the right bin' },
  story: {
    tr: 'Bir e-ticaret deposunda konveyör bandı karışık ürün getiriyor. Bandın üstündeki kapıda bir kamera nesnenin silüetinden yuvarlaklığını ve rengini, bir lazer ölçer boyunu okur. Kapıdan sonra dört itici var: oyuncak, elektronik, gıda ve büyük koli kutuları. Depo görevlisi daha önce bir grup ürünü elle etiketledi; robot gerisini kendisi ayıracak.',
    en: 'In an e-commerce warehouse a conveyor belt brings mixed products. At a gate above the belt a camera reads how round the object is and its colour from the silhouette, and a laser gauge reads its size. After the gate there are four pushers: toys, electronics, food and large parcels. A worker labelled a batch of products by hand earlier; the robot sorts the rest on its own.',
  },
  goal: {
    tr: 'Banttan geçen 200 yeni nesneyi doğru kutuya ayırmak: doğruluk %85’in üstünde, hiçbir kutunun duyarlılığı çok düşük olmasın.',
    en: 'Sort the 200 new objects coming down the belt into the right bins: accuracy above 85%, with no bin’s recall far behind.',
  },
  model: {
    tr: 'Üç klasik sınıflandırıcıdan biri, tarayıcıda etiketli örneklerle eğitilir: k en yakın komşu (ölçeklenmiş üç özellikte en yakın k örneğin oyu), karar ağacı (Gini ile seçilen eşik soruları) ve Gauss naive Bayes (sınıf başına ortalama ve varyans). Derslerdeki iki özellikli sürümlerin üç özellikli hâlidir; sonuç kesinlik ve duyarlılık dersindeki gibi karışıklık matrisiyle okunur.',
    en: 'One of three classic classifiers, trained in the browser on the labelled examples: k-nearest neighbours (vote of the k nearest examples on three scaled features), a decision tree (threshold questions chosen with Gini) and Gaussian naive Bayes (mean and variance per class). They are the three-feature versions of the two-feature ones in the lessons; the result is read with a confusion matrix as in the precision and recall lesson.',
  },
  lessons: ['k-en-yakin-komsu', 'karar-agaci', 'naive-bayes', 'kesinlik-duyarlilik'],
  steps: [
    { tr: 'Kapıdaki sensörler her nesneden üç sayı okur: yuvarlaklık (küp 0,1 civarı, küre 0,95 civarı), renk tonu (0–1) ve boy (cm). Sensör gürültüsü bu sayıları biraz oynatır.', en: 'The sensors at the gate read three numbers from every object: roundness (about 0.1 for a cube, about 0.95 for a sphere), hue (0–1) and size (cm). Sensor noise shakes these numbers a little.' },
    { tr: 'Model, görevlinin etiketlediği örneklerle eğitilir. k-NN yalnız örnekleri saklar; ağaç eşik soruları seçer; naive Bayes her kutu için ortalama ve varyans hesaplar.', en: 'The model is trained on the examples the worker labelled. k-NN just stores them; the tree picks threshold questions; naive Bayes computes a mean and variance for each bin.' },
    { tr: 'Her yeni nesne kapıdan geçerken sınıflanır ve tahmin edilen kutunun hizasında yana itilir. Yanlış kutuya düşen nesnenin üstünde kırmızı bir işaret yanar.', en: 'Every new object is classified as it passes the gate and pushed sideways at the bin it was assigned to. An object that lands in the wrong bin gets a red marker.' },
    { tr: 'Gerçek kutu bilindiği için her tarama karışıklık matrisine bir sayı ekler: satır gerçek kutu, sütun tahmin. Köşegen doğrular, geri kalan her hücre belirli bir karışıklıktır (ör. büyük koli sanılan elektronik).', en: 'Because the true bin is known, every scan adds one count to the confusion matrix: row is the true bin, column the prediction. The diagonal is correct; every other cell is a particular mix-up (for example electronics taken for a large parcel).' },
    { tr: 'Kutu başına duyarlılık (o kutuya ait olanların ne kadarı oraya gitti) ve kesinlik (kutuya gidenlerin ne kadarı ona ait) ayrı ayrı izlenir: ortalama doğruluk tek bir zayıf kutuyu gizleyebilir.', en: 'Recall per bin (how many of the objects that belong there went there) and precision (how many of the objects that went there belong there) are tracked separately: overall accuracy can hide a single weak bin.' },
  ],
  task: [
    { tr: 'Modeli 1 (karar ağacı) yap ve derinliği 1’e indir. Tek soru bandı yalnız ikiye bölebilir: dört kutudan ikisi hiç kullanılmaz ve saklı nesnelerde doğruluk %48’e düşer. Derinlik 3’te ağaç yeniden %92’ye çıkar; daha derin ağaç bir şey kazandırmaz.', en: 'Set the model to 1 (decision tree) and lower the depth to 1. A single question can only split the belt in two: two of the four bins are never used and accuracy on unseen objects drops to 48%. At depth 3 the tree climbs back to 92%; a deeper tree gains nothing.' },
    { tr: 'Sensör gürültüsünü 0,3’ten 1’e çıkar. Saklı nesnelerde k-NN %92’den %85’e, ağaç %91’den %81’e, naive Bayes %92’den %87’ye düşer. Karışıklık matrisine bak: hataların çoğu oyuncak, gıda ve büyük koli arasında toplanır; elektronik mavi rengi sayesinde az karışır.', en: 'Raise the sensor noise from 0.3 to 1. On unseen objects k-NN drops from 92% to 85%, the tree from 91% to 81% and naive Bayes from 92% to 87%. Look at the confusion matrix: most errors pile up among toys, food and large parcels; electronics, thanks to their blue colour, are rarely mixed up.' },
    { tr: 'Etiketli örneği 20’ye indir. k-NN %92’den %74’e düşer, naive Bayes ise %86’da kalır: k-NN birkaç komşuya güvenmek zorundadır, naive Bayes her kutu için yalnız birkaç ortalama ve varyans öğrenir. Tohumu değiştir: bu kadar az örnekte sonuç tohuma göre çok oynar.', en: 'Lower the labelled examples to 20. k-NN drops from 92% to 74%, while naive Bayes stays at 86%: k-NN has to rely on a handful of neighbours, naive Bayes only learns a few means and variances per bin. Change the seed: with so few examples the result swings a lot from seed to seed.' },
  ],
  file: 'depo_siniflandirma.py',
  code: [
    ['import numpy as np'],
    ['D = np.genfromtxt(\'depo-nesneleri.csv\', delimiter=\',\', names=True)', '120 etiketli, 200 yeni nesne', '120 labelled, 200 new objects'],
    ['F, k, et = np.c_[D[\'yuvarlaklik\'], D[\'ton\'], D[\'boy\']], D[\'kutu\'].astype(int), D[\'grup\'] == 0', 'özellikler: yuvarlaklık, ton, boy (cm)', 'features: roundness, hue, size (cm)'],
    ['X, y, X_yeni, y_yeni = F[et], k[et], F[~et], k[~et]'],
    ['mu, sd = X.mean(0), X.std(0)'],
    ['Z, Z_yeni = (X - mu) / sd, (X_yeni - mu) / sd', 'ölçekle: boy (cm) tonu ezmesin', 'scale: size (cm) must not swamp hue'],
    ['def knn(z, k=5):'],
    ['    d = ((Z - z) ** 2).sum(1)', 'her etiketli örneğe uzaklık', 'distance to every labelled example'],
    ['    oy = np.bincount(y[np.argsort(d)[:k]], minlength=4)', 'en yakın k örneğin oyu', 'vote of the k nearest'],
    ['    return oy.argmax()'],
    ['m = np.array([X[y == c].mean(0) for c in range(4)])', 'naive Bayes: kutu başına ortalama', 'naive Bayes: mean per bin'],
    ['v = np.array([X[y == c].var(0) for c in range(4)])', 've varyans', 'and variance'],
    ['p = np.bincount(y, minlength=4) / len(y)', 'kutuların oranı (önsel)', 'share of each bin (prior)'],
    ['def nb(x):'],
    ['    lp = np.log(p) - 0.5 * (np.log(2 * np.pi * v) + (x - m) ** 2 / v).sum(1)'],
    ['    return lp.argmax()', 'log olasılığı en büyük kutu', 'bin with the largest log probability'],
    ['M = np.zeros((4, 4), int)', 'karışıklık matrisi', 'confusion matrix'],
    ['history = {\'n\': [], \'true\': [], \'pred\': [], \'correct\': [], \'accuracy\': []}', 'geçmiş: taranan her nesne bir satır', 'history: one row per scanned object'],
    ['for z, x, c in zip(Z_yeni, X_yeni, y_yeni):', 'banttan gelen her yeni nesne', 'every new object on the belt'],
    ['    tahmin = knn(z)', 'ya da nb(x)', 'or nb(x)'],
    ['    M[c, tahmin] += 1', 'satır gerçek, sütun tahmin', 'row true, column predicted'],
    ['    for k, v in zip(history, (M.sum(), c, tahmin, c == tahmin, np.trace(M) / M.sum())): history[k].append(float(v) if k == \'accuracy\' else int(v))'],
    ['print(M)'],
    ['print("doğruluk", np.trace(M) / M.sum())', 'köşegen / toplam', 'diagonal / total'],
    ['print("duyarlılık", np.diag(M) / M.sum(1))', 'kutu başına', 'per bin'],
    ['print("kesinlik", np.diag(M) / M.sum(0))'],
    ['P, R = np.diag(M) / np.maximum(1, M.sum(0)), np.diag(M) / np.maximum(1, M.sum(1))'],
    ['F1 = 2 * P * R / np.maximum(1e-12, P + R)', 'kutu başına F1', 'F1 per bin'],
    ['for ad, p_, r_, f_ in zip([\'oyuncak\', \'elektronik\', \'gida\', \'buyuk koli\'], P, R, F1):', 'son ölçümler tablosu', 'final metrics table'],
    ['    print(f\'{ad:<12}kesinlik {p_:.2f}  duyarlılık {r_:.2f}  F1 {f_:.2f}\')'],
    ['import csv'],
    ['with open(\'egitim_gecmisi.csv\', \'w\', newline=\'\') as f:', 'geçmişi CSV\'ye yaz', 'write the history to CSV'],
    ['    csv.writer(f).writerows([list(history), *zip(*history.values())])'],
    ['try:'],
    ['    import matplotlib.pyplot as plt', 'varsa grafik çiz', 'plot if available'],
    ['    fig, (a1, a2) = plt.subplots(1, 2, figsize=(9, 3.5))'],
    ['    a1.plot(history[\'n\'], history[\'accuracy\']); a1.set_xlabel(\'n\'); a1.set_ylabel(\'accuracy\')'],
    ['    a2.imshow(M, cmap=\'Greens\'); a2.set_xlabel(\'tahmin\'); a2.set_ylabel(\'gerçek\')', 'karışıklık matrisi', 'confusion matrix'],
    ['    plt.show()'],
    ['except ImportError:'],
    ['    print(\'matplotlib yok: grafik atlandı\')'],
  ],
  params: [
    { key: 'model', label: { tr: 'Model: 0 k-NN, 1 ağaç, 2 naive Bayes', en: 'Model: 0 k-NN, 1 tree, 2 naive Bayes' }, min: 0, max: 2, step: 1, value: 0 },
    { key: 'k', label: { tr: 'k (k-NN komşu sayısı)', en: 'k (k-NN neighbours)' }, min: 1, max: 15, step: 1, value: 5 },
    { key: 'depth', label: { tr: 'Ağaç derinliği', en: 'Tree depth' }, min: 1, max: 8, step: 1, value: 4 },
    { key: 'noise', label: { tr: 'Sensör gürültüsü', en: 'Sensor noise' }, min: 0, max: 1, step: 0.1, value: 0.3 },
    { key: 'nTrain', label: { tr: 'Etiketli örnek', en: 'Labelled examples' }, min: 20, max: 200, step: 20, value: 120 },
    { key: 'seed', label: { tr: 'Tohum', en: 'Seed' }, min: 1, max: 50, step: 1, value: 7 },
  ],
  perFrame: 1,
  create: createDepo,
}
