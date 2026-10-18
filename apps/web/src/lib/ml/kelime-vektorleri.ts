// Ders: kelime vektörleri. Robotun bakım kayıtlarından 20 kısa cümle; kelimelerin yan yana geçme sayıları (eş-bulunma), PPMI ile
// "beklenenden sık" birlikteliklere çevrilir, ortalaması çıkarılıp altuzay (güç) yöntemiyle 2B haritaya indirgenir. Komşu = kosinüs.
import { cap, fmt, rng, type Bi, type Frame, type Lesson } from './core'
import { explainedRatio, silhouette } from './egitim/metrics'
import { B, type EgitimRaporu } from './egitim/rapor'

/** Kelimeler: id (Python kodundaki İngilizce yazım), iki dilli etiket ve konu (0 algı, 1 hareket, 2 enerji, −1 robot). */
export const WORDS: Array<{ id: string; label: Bi; topic: number }> = [
  { id: 'robot', label: { tr: 'robot', en: 'robot' }, topic: -1 },
  { id: 'lidar', label: { tr: 'LiDAR', en: 'lidar' }, topic: 0 },
  { id: 'camera', label: { tr: 'kamera', en: 'camera' }, topic: 0 },
  { id: 'sonar', label: { tr: 'sonar', en: 'sonar' }, topic: 0 },
  { id: 'distance', label: { tr: 'mesafe', en: 'distance' }, topic: 0 },
  { id: 'obstacle', label: { tr: 'engel', en: 'obstacle' }, topic: 0 },
  { id: 'scan', label: { tr: 'tarama', en: 'scan' }, topic: 0 },
  { id: 'motor', label: { tr: 'motor', en: 'motor' }, topic: 1 },
  { id: 'wheel', label: { tr: 'tekerlek', en: 'wheel' }, topic: 1 },
  { id: 'track', label: { tr: 'palet', en: 'track' }, topic: 1 },
  { id: 'speed', label: { tr: 'hız', en: 'speed' }, topic: 1 },
  { id: 'turn', label: { tr: 'dönüş', en: 'turn' }, topic: 1 },
  { id: 'torque', label: { tr: 'tork', en: 'torque' }, topic: 1 },
  { id: 'battery', label: { tr: 'batarya', en: 'battery' }, topic: 2 },
  { id: 'charger', label: { tr: 'şarj', en: 'charger' }, topic: 2 },
  { id: 'cell', label: { tr: 'hücre', en: 'cell' }, topic: 2 },
  { id: 'voltage', label: { tr: 'gerilim', en: 'voltage' }, topic: 2 },
  { id: 'current', label: { tr: 'akım', en: 'current' }, topic: 2 },
  { id: 'power', label: { tr: 'güç', en: 'power' }, topic: 2 },
]
const IX: Record<string, number> = Object.fromEntries(WORDS.map((w, i) => [w.id, i]))
export const wordIndex = (id: string): number => IX[id]

/** Korpus: her konu için 3 nesne × 2 bağlam çifti = 18 cümle, artı konular arası 2 köprü cümle (Python kodundaki sırayla). */
export function corpus(): number[][] {
  const T = [['lidar', 'camera', 'sonar'], ['distance', 'obstacle', 'scan'], ['motor', 'wheel', 'track'], ['speed', 'turn', 'torque'], ['battery', 'charger', 'cell'], ['voltage', 'current', 'power']]
  const S: string[][] = []
  for (let t = 0; t < 3; t++) {
    const N = T[2 * t], C = T[2 * t + 1]
    N.forEach((n, j) => { for (let i = 0; i < 3; i++) if (i !== j) S.push(['robot', n, C[i], C[(i + 1) % 3]]) })
  }
  S.push(['robot', 'motor', 'current', 'speed'], ['robot', 'camera', 'power', 'scan'])
  return S.map((s) => s.map((w) => IX[w]))
}

/** Pencere içindeki her (a, b) çifti için simetrik sayım; upTo: ilk kaç cümle sayılsın. */
export function cooc(S: number[][], win: number, upTo = S.length): number[][] {
  const n = WORDS.length
  const M = Array.from({ length: n }, () => new Array(n).fill(0))
  for (const s of S.slice(0, upTo)) for (let a = 0; a < s.length; a++) for (let b = a + 1; b < s.length; b++) if (b - a <= win) { M[s[a]][s[b]]++; M[s[b]][s[a]]++ }
  return M
}

/** PPMI: max(0, log P(a,b) / (P(a) P(b))). */
export function ppmi(M: number[][]): number[][] {
  const tot = M.flat().reduce((s, x) => s + x, 0)
  const r = M.map((row) => row.reduce((s, x) => s + x, 0) / tot)
  return M.map((row, i) => row.map((x, j) => (x > 0 ? Math.max(0, Math.log(x / tot / (r[i] * r[j]))) : 0)))
}

const norm = (v: number[]) => Math.sqrt(v.reduce((s, x) => s + x * x, 0))
export const unitRows = (X: number[][]): number[][] => X.map((row) => { const L = norm(row) || 1; return row.map((x) => x / L) })
export const cosine = (U: number[][], a: number, b: number): number => U[a].reduce((s, x, k) => s + x * U[b][k], 0)

/** En yakın k komşu (kendisi hariç), kosinüse göre. */
export function neighbours(U: number[][], a: number, k = 3): Array<[number, number]> {
  return U.map((_, b) => [b, cosine(U, a, b)] as [number, number]).filter(([b]) => b !== a).sort((x, y) => y[1] - x[1]).slice(0, k)
}

/** Ortalaması çıkarılmış satırlar Z için 2 boyutlu altuzay yinelemesi (C = ZᵀZ). Her adımın izdüşümü kaydedilir. */
export function subspace(Z: number[][], iters: number, seed = 4) {
  const d = Z[0].length
  const C = Array.from({ length: d }, (_, i) => Array.from({ length: d }, (_, j) => Z.reduce((s, z) => s + z[i] * z[j], 0)))
  const r = rng(seed)
  let V = [0, 1].map(() => Array.from({ length: d }, () => r() - 0.5))
  const orth = (A: number[][]) => {
    const a = A[0].map((x) => x / norm(A[0]))
    const dp = A[1].reduce((s, x, k) => s + x * a[k], 0)
    const b0 = A[1].map((x, k) => x - dp * a[k])
    return [a, b0.map((x) => x / norm(b0))]
  }
  V = orth(V)
  const proj = (V: number[][]) => Z.map((z) => [0, 1].map((c) => z.reduce((s, x, k) => s + x * V[c][k], 0)) as [number, number])
  const steps: Array<[number, number][]> = [proj(V)]
  for (let t = 0; t < iters; t++) {
    V = orth(V.map((v) => C.map((row) => row.reduce((s, x, k) => s + x * v[k], 0))))
    steps.push(proj(V))
  }
  // açıklanan varyans payı (2B haritanın ne kadarını tuttuğu)
  const total = Z.reduce((s, z) => s + z.reduce((q, x) => q + x * x, 0), 0)
  const kept = steps.at(-1)!.reduce((s, [x, y]) => s + x * x + y * y, 0)
  return { steps, kept: kept / total }
}

/** Simetrik matrisin özdeğerleri (Jacobi dönüşleri), büyükten küçüğe. Küçük matrisler (19×19) için yeterince hızlı. */
export function symEig(A0: number[][]): number[] {
  const n = A0.length
  const A = A0.map((r) => [...r])
  for (let sweep = 0; sweep < 60; sweep++) {
    let off = 0
    for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) off += A[p][q] ** 2
    if (off < 1e-22) break
    for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) {
      if (Math.abs(A[p][q]) < 1e-300) continue
      const th = (A[q][q] - A[p][p]) / (2 * A[p][q])
      const t = Math.sign(th || 1) / (Math.abs(th) + Math.sqrt(th * th + 1))
      const c = 1 / Math.sqrt(t * t + 1), sn = t * c
      for (let k = 0; k < n; k++) { const akp = A[k][p], akq = A[k][q]; A[k][p] = c * akp - sn * akq; A[k][q] = sn * akp + c * akq }
      for (let k = 0; k < n; k++) { const apk = A[p][k], aqk = A[q][k]; A[p][k] = c * apk - sn * aqk; A[q][k] = sn * apk + c * aqk }
    }
  }
  return A.map((r, i) => r[i]).sort((a, b) => b - a)
}

/**
 * Eğitim paneli (öğrenme değil, gömmenin değerlendirmesi): ortalaması çıkarılmış birim PPMI vektörlerinin bileşen başına açıklanan
 * varyansı (Python'daki SVD'nin s² / Σs²), 2B haritanın tuttuğu pay, konu siluet skoru, en yakın komşunun aynı konudan olma oranı
 * ve konular arası ortalama kosinüs.
 */
export function wvReport({ win = 2 }: Record<string, number>): EgitimRaporu {
  const w = Math.max(1, Math.min(3, Math.round(win)))
  const U = unitRows(ppmi(cooc(corpus(), w)))
  const n = WORDS.length
  const mu = U[0].map((_, k) => U.reduce((s, u) => s + u[k], 0) / n)
  const Z = U.map((u) => u.map((x, k) => x - mu[k]))
  const C = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => Z.reduce((s, z) => s + z[i] * z[j], 0)))
  const ev = explainedRatio(symEig(C))
  const cum: number[] = []
  ev.forEach((v, i) => cum.push((cum[i - 1] ?? 0) + v))
  const topic = WORDS.map((x) => x.topic)
  let same = 0, ns = 0, other = 0, no = 0, nnOk = 0, nnN = 0
  for (let a = 0; a < n; a++) {
    if (topic[a] < 0) continue
    for (let b = a + 1; b < n; b++) { if (topic[b] < 0) continue; const c = cosine(U, a, b); if (topic[a] === topic[b]) { same += c; ns++ } else { other += c; no++ } }
    nnN++; if (topic[neighbours(U, a, 1)[0][0]] === topic[a]) nnOk++
  }
  const T = [-1, 0, 1, 2], TN = ['robot', 'algı', 'hareket', 'enerji']
  const tm = T.map((ta) => T.map((tb) => {
    let s = 0, m = 0
    for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) if (a !== b && topic[a] === ta && topic[b] === tb) { s += cosine(U, a, b); m++ }
    return m ? s / m : 1
  }))
  const comp = ev.map((_, i) => i + 1)
  return {
    kind: 'kumeleme', model: `PPMI + SVD, pencere ${w}`, seed: 0, hyper: { window: w, words: n, sentences: corpus().length },
    history: { x: 'component', cols: { component: comp, explained: ev, cumulative: cum } },
    final: [
      { key: 'kept_2d', label: B('2B haritanın tuttuğu varyans', 'variance kept by the 2D map'), value: cum[1], fmt: 'pct' },
      { key: 'silhouette', label: B('konu siluet skoru', 'topic silhouette'), value: silhouette(U, topic), fmt: 3 },
      { key: 'nn_topic', label: B('en yakın komşu aynı konuda', 'nearest neighbour in same topic'), value: nnOk / nnN, fmt: 'pct' },
      { key: 'cos_same', label: B('ort. kosinüs: aynı konu', 'mean cosine: same topic'), value: same / ns, fmt: 3 },
      { key: 'cos_other', label: B('ort. kosinüs: farklı konu', 'mean cosine: other topic'), value: other / no, fmt: 3 },
    ],
    charts: [
      { kind: 'bar', id: 'scree', title: B('Bileşen başına açıklanan varyans', 'Explained variance per component'), labels: comp.map(String), series: [{ key: 'explained', label: B('pay', 'share'), values: ev, tone: 1 }], yMin: 0 },
      { kind: 'line', id: 'cumulative', title: B('Birikimli açıklanan varyans', 'Cumulative explained variance'), x: comp, xLabel: B('bileşen sayısı', 'components'), series: [{ key: 'cumulative', label: B('birikimli', 'cumulative'), values: cum, tone: 3 }], yMin: 0, yMax: 1, marker: { x: 2, label: B('2B harita', '2D map') } },
      { kind: 'heat', id: 'topic-cos', title: B('Konular arası ortalama kosinüs', 'Mean cosine between topics'), rows: TN, cols: TN, values: tm, showValues: true, digits: 2 },
    ],
  }
}

export interface WvFrame extends Frame {
  S: number[][]
  /** Eş-bulunma ya da PPMI matrisi (sahnedeki ısı haritası). */
  M: number[][]
  kind: 'count' | 'ppmi'
  /** Vurgulanan cümle. */
  sent?: number
  /** 2B konumlar (yoksa harita henüz yok) ve haritanın sabit sınırları. */
  Y: [number, number][] | null
  ext: number
  iter?: number
  sel?: number
  nn?: Array<[number, number]>
  win: number
}

export const KELIME_VEKTORLERI: Lesson<WvFrame> = {
  slug: 'kelime-vektorleri',
  n: 0,
  title: { tr: 'Kelime vektörleri', en: 'Word vectors' },
  sub: { tr: 'Birlikte geçen kelimeler, haritada yan yana düşer', en: 'Words that appear together land next to each other on the map' },
  story: {
    tr: 'Bir depo robotunun bakım kayıtlarından 20 kısa cümle aldık; içlerinde 19 farklı kelime var: algılayıcılar (LiDAR, kamera, sonar), hareket (motor, tekerlek, palet) ve enerji (batarya, şarj, hücre) ile bunların yanında geçen kelimeler. Kimse modele "LiDAR ile sonar benzer" demiyor. Yalnızca hangi kelimenin hangisinin yanında geçtiğini sayarak her kelimeye 19 sayılık bir vektör veriyoruz ve bunu 2B bir haritaya indiriyoruz.',
    en: "We took 20 short sentences from a warehouse robot's maintenance log, with 19 different words: sensors (lidar, camera, sonar), motion (motor, wheel, track) and energy (battery, charger, cell), plus the words that appear next to them. Nobody tells the model that lidar and sonar are alike. We only count which word appears next to which, give every word a vector of 19 numbers and squeeze it onto a 2D map.",
  },
  how: [
    { tr: 'Eş-bulunma: her cümlede, aralarında en fazla "pencere" kadar kelime olan her çift için matristeki iki hücre 1 artar.', en: 'Co-occurrence: in every sentence, each pair of words at most "window" positions apart adds 1 to two cells of the matrix.' },
    { tr: 'PPMI: "robot" her cümlede geçtiği için her şeyle sık görünür. Sayıyı, iki kelime bağımsız olsaydı beklenecek sayıya böleriz ve logaritmasını alırız; beklenenden seyrekse 0 yazarız.', en: "PPMI: 'robot' appears in every sentence, so it co-occurs with everything. We divide each count by what we would expect if the words were independent and take the log; anything rarer than expected becomes 0." },
    { tr: 'Her satır bir kelime vektörüdür. İki vektör arasındaki açının kosinüsü benzerliği verir: 1 aynı yön, 0 ilgisiz.', en: 'Each row is a word vector. The cosine of the angle between two vectors gives their similarity: 1 means the same direction, 0 unrelated.' },
    { tr: '19 boyutu görebilmek için ortalamayı çıkarıp en çok değişen iki yönü güç (altuzay) yöntemiyle buluruz: bir vektörü matrisle tekrar tekrar çarpınca en büyük yöne döner.', en: 'To see 19 dimensions we subtract the mean and find the two directions with the most variation by the power (subspace) method: multiplying a vector by the matrix again and again turns it towards the largest direction.' },
    { tr: 'Şunu dene: pencereyi 1 yap. Kelime yalnız hemen yanındakini görür; kümeler gevşer ve LiDAR–sonar benzerliği düşer.', en: 'Try this: set the window to 1. A word only sees its direct neighbour; the clusters loosen and the lidar-sonar similarity drops.' },
  ],
  why: {
    tr: 'Dil modelleri her kelimeyi (aslında her parçayı) böyle bir vektöre çevirerek başlar; bugün bu vektörler sayımla değil eğitimle öğrenilir ama fikir aynıdır: "bir kelimeyi yanındakilerden tanırsın". Robotikte sesli komutları, arıza raporlarını ve kılavuzları anlamada, benzer kayıtları bulmada aynı vektörler kullanılır.',
    en: 'Language models start by turning every word (really every token) into a vector like this; today the vectors are learned by training rather than counting, but the idea is the same: you know a word by the company it keeps. In robotics the same vectors help understand voice commands, fault reports and manuals and find similar records.',
  },
  file: 'kelime_vektorleri.py',
  code: [
    ['import numpy as np'],
    ['T = [g.split() for g in ["lidar camera sonar",', 'konu başına 3 nesne', '3 objects per topic'],
    ['     "distance obstacle scan", "motor wheel track",', 've 3 bağlam kelimesi', 'and 3 context words'],
    ['     "speed turn torque", "battery charger cell",'],
    ['     "voltage current power"]]'],
    ['S = [["robot", n, C[i], C[(i + 1) % 3]]', '18 cümle', '18 sentences'],
    ['     for N, C in zip(T[::2], T[1::2])'],
    ['     for j, n in enumerate(N) for i in range(3) if i != j]'],
    ['S += [b.split() for b in ["robot motor current speed",', '2 köprü cümle', '2 bridge sentences'],
    ['                          "robot camera power scan"]]'],
    ['V = sorted({w for s in S for w in s}); win = 2', '19 kelime · pencere', '19 words · window'],
    ['ix = {w: i for i, w in enumerate(V)}; M = np.zeros((19, 19))'],
    ['for s in S:', 'eş-bulunma sayımı', 'co-occurrence counts'],
    ['    for a in range(4):'],
    ['        for b in range(a + 1, min(a + win + 1, 4)):'],
    ['            M[ix[s[a]], ix[s[b]]] += 1', 'aradaki uzaklık ≤ pencere', 'distance ≤ window'],
    ['M = M + M.T; P = M / M.sum(); r = P.sum(1)', 'simetrik, olasılık', 'symmetric, probabilities'],
    ['X = np.log(P / np.outer(r, r) + 1e-12).clip(0)', 'PPMI'],
    ['U = X / np.linalg.norm(X, axis=1, keepdims=True)', 'birim vektörler', 'unit vectors'],
    ['u, s, _ = np.linalg.svd(U - U.mean(0))', 'ortalamayı çıkar, SVD', 'subtract the mean, SVD'],
    ['Y, cos = u[:, :2] * s[:2], U @ U.T', '2B konumlar, kosinüs', '2D positions, cosine'],
    ['a, b, c = ix["lidar"], ix["sonar"], ix["battery"]'],
    ['print(cos[a, b].round(2), cos[a, c].round(2), Y[a].round(2))'],
    ['ev = s ** 2 / (s ** 2).sum()', 'bileşen başına açıklanan varyans', 'explained variance per component'],
    ['history = {"component": list(range(1, 20)),', 'değerlendirme geçmişi', 'evaluation history'],
    ['           "explained": list(ev), "cumulative": list(ev.cumsum())}'],
    ['top = {w: i // 2 for i, g in enumerate(T) for w in g}', 'kelimenin konusu', 'topic of each word'],
    ['tw = [ix[w] for w in V if w in top]'],
    ['same = [cos[i, j] for i in tw for j in tw if i < j and top[V[i]] == top[V[j]]]'],
    ['other = [cos[i, j] for i in tw for j in tw if i < j and top[V[i]] != top[V[j]]]'],
    ['for k, v in [("kept_2d", ev[:2].sum()), ("cos_same", np.mean(same)),', 'son ölçümler', 'final metrics'],
    ['             ("cos_other", np.mean(other))]: print(f"{k:<10}{v:>8.3f}")'],
    ['import csv'],
    ['with open("egitim_gecmisi.csv", "w", newline="") as f:', 'satır başına bir bileşen', 'one row per component'],
    ['    csv.writer(f).writerows([list(history), *zip(*history.values())])'],
    ['try:'],
    ['    import matplotlib.pyplot as plt', 'varsa grafik çiz', 'plot if available'],
    ['    plt.bar(history["component"], history["explained"])'],
    ['    plt.plot(history["component"], history["cumulative"], "o-")'],
    ['    plt.xlabel("component"); plt.show()'],
    ['except ImportError:'],
    ['    print("matplotlib yok: grafik atlandı")'],
  ],
  params: [
    { key: 'word', label: { tr: 'Seçili kelime (1 robot, 2 LiDAR … 19 güç)', en: 'Selected word (1 robot, 2 lidar … 19 power)' }, min: 1, max: 19, step: 1, value: 2 },
    { key: 'win', label: { tr: 'Pencere boyu', en: 'Window size' }, min: 1, max: 3, step: 1, value: 2 },
  ],
  report: wvReport,
  run({ word = 2, win = 2 }) {
    const S = corpus()
    const sel = Math.max(0, Math.min(WORDS.length - 1, Math.round(word) - 1))
    const w = Math.max(1, Math.min(3, Math.round(win)))
    const Mfull = cooc(S, w)
    const X = ppmi(Mfull)
    const U = unitRows(X)
    const mu = U[0].map((_, k) => U.reduce((s, u) => s + u[k], 0) / U.length)
    const Z = U.map((u) => u.map((x, k) => x - mu[k]))
    const IT = 14
    const { steps, kept } = subspace(Z, IT)
    const ext = Math.max(...steps[IT].map(([x, y]) => Math.max(Math.abs(x), Math.abs(y))))
    const F: WvFrame[] = []
    const base = { S, win: w, ext }
    const L = WORDS[sel].label
    const nS = S.length
    const st = cap(`${nS} cümle · ${WORDS.length} kelime · pencere ${w}`, `${nS} sentences · ${WORDS.length} words · window ${w}`)
    const zero = cooc(S, w, 0)
    F.push({ ...base, M: zero, kind: 'count', Y: null, line: 5, cap: cap('bakım kayıtlarından 20 cümle', '20 sentences from the maintenance log'), stat: st, hold: 2 })
    F.push({ ...base, M: zero, kind: 'count', Y: null, line: 10, cap: cap(`sözlük: ${WORDS.length} kelime, matris ${WORDS.length} × ${WORDS.length}`, `vocabulary: ${WORDS.length} words, a ${WORDS.length} × ${WORDS.length} matrix`), stat: st, hold: 1.5 })
    for (let i = 0; i < nS; i++) {
      const M = cooc(S, w, i + 1)
      const s = S[i].map((k) => WORDS[k].label)
      const c = cap(`cümle ${i + 1}: ${s.map((q) => q.tr).join(' ')}`, `sentence ${i + 1}: ${s.map((q) => q.en).join(' ')}`)
      if (i < 2) {
        F.push({ ...base, M: cooc(S, w, i), kind: 'count', sent: i, Y: null, line: 12, cap: c, stat: st, hold: 1.2 })
        F.push({ ...base, M, kind: 'count', sent: i, Y: null, line: 15, cap: c, stat: st, hold: 1.4 })
      } else F.push({ ...base, M, kind: 'count', sent: i, Y: null, line: 15, cap: c, stat: st, hold: 0.45 })
    }
    const rr = WORDS.map((_, i) => Mfull[i].reduce((s, x) => s + x, 0))
    F.push({ ...base, M: Mfull, kind: 'count', Y: null, line: 16, cap: cap(`"robot" ${rr[0]} kez sayıldı: her şeyle birlikte`, `"robot" was counted ${rr[0]} times: it is next to everything`), stat: st, hold: 1.8 })
    F.push({ ...base, M: X, kind: 'ppmi', Y: null, line: 17, cap: cap('PPMI: beklenenden sık olan birliktelikler kalır', 'PPMI: only pairs more frequent than expected remain'), stat: cap(`robot–LiDAR ${fmt(X[0][1], 2, 'tr')} · LiDAR–mesafe ${fmt(X[1][4], 2, 'tr')}`, `robot–lidar ${X[0][1].toFixed(2)} · lidar–distance ${X[1][4].toFixed(2)}`), hold: 2.2 })
    F.push({ ...base, M: X, kind: 'ppmi', Y: null, line: 18, cap: cap('her satır bir kelime vektörü; boyu 1 yapılır', 'each row is a word vector, scaled to length 1'), stat: st, hold: 1.4 })
    steps.forEach((Y, t) => {
      const c = t === 0 ? cap('rastgele iki yön: harita karmakarışık', 'two random directions: the map is a mess') : cap(`güç yöntemi · adım ${t}`, `power method · step ${t}`)
      F.push({ ...base, M: X, kind: 'ppmi', Y, iter: t, line: 19, cap: c, stat: st, hold: t === 0 ? 1.6 : t < 4 ? 0.9 : 0.4 })
    })
    const Y = steps.at(-1)!
    F.push({ ...base, M: X, kind: 'ppmi', Y, iter: IT, line: 20, cap: cap('2B kelime haritası: üç konu üç köşede', '2D word map: three topics in three corners'), stat: cap(`harita bilginin %${Math.round(kept * 100)}'ini tutuyor`, `the map keeps ${Math.round(kept * 100)}% of the variation`), hold: 2 })
    const nm = (k: number, l: 'tr' | 'en') => WORDS[k].label[l]
    let shown = 0
    WORDS.forEach((_, b) => {
      if (b === sel) return
      const c = cosine(U, sel, b)
      F.push({
        ...base, M: X, kind: 'ppmi', Y, iter: IT, sel, nn: [[b, c]], line: 20,
        cap: cap(`cos(${L.tr}, ${nm(b, 'tr')}) = ${fmt(c, 2, 'tr')}`, `cos(${L.en}, ${nm(b, 'en')}) = ${c.toFixed(2)}`), stat: st,
        hold: shown++ < 2 ? 1.1 : 0.35,
      })
    })
    const nn = neighbours(U, sel, 3)
    F.push({
      ...base, M: X, kind: 'ppmi', Y, iter: IT, sel, nn, line: 22,
      cap: cap(`${L.tr}: en yakınlar ${nn.map(([k, c]) => `${nm(k, 'tr')} ${fmt(c, 2, 'tr')}`).join(', ')}`, `${L.en}: nearest ${nn.map(([k, c]) => `${nm(k, 'en')} ${c.toFixed(2)}`).join(', ')}`),
      stat: cap(`cos(LiDAR, sonar) ${fmt(cosine(U, 1, 3), 2, 'tr')} · cos(LiDAR, batarya) ${fmt(cosine(U, 1, 13), 2, 'tr')}`, `cos(lidar, sonar) ${cosine(U, 1, 3).toFixed(2)} · cos(lidar, battery) ${cosine(U, 1, 13).toFixed(2)}`),
      hold: 3,
    })
    return F
  },
}
