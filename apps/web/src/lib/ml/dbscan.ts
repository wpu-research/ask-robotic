// Ders: DBSCAN, yoğunluk tabanlı kümeleme. Depo zeminindeki LiDAR taraması: iki kıvrık raf sırası, yuvarlak bir raf ve seyrek
// gürültü. eps yarıçapında en az minPts komşusu olan nokta çekirdektir; kümeler çekirdekten çekirdeğe genişleyerek (BFS) büyür.
import { cap, fmt, gauss, rng, type Frame, type Lesson, type Pt } from './core'
import { B, type EgitimRaporu } from './egitim/rapor'

export interface DbFrame extends Frame {
  /** LiDAR noktaları (metre; c: gerçek nesne 0, 1, 2, gürültü 3). Paylaşılan referans. */
  X: Pt[]
  eps: number
  minPts: number
  /** Çekirdek mi (paylaşılan). null: henüz hesaplanmadı. */
  core: boolean[] | null
  /** Küme etiketi: −1 etiketsiz (sonda gürültü), 0.. küme. */
  label: number[]
  /** Bu karede kuyruktan çıkan (eps çemberi çizilir) ve yeni etiketlenen noktalar. */
  popped?: number[]
  added?: number[]
  /** Tanıtım: eps çemberi ve komşu sayısı gösterilen noktalar. */
  probes?: number[]
  k: number
  /** Son kare: etiketsizler gürültü olarak çizilir. */
  done?: boolean
}

export const NOISE_N = 35

/** Depo zemini 15 m × 8 m: iki hilal raf sırası (110'ar nokta), yuvarlak raf (110 nokta), 35 gürültü noktası. */
export function warehouseScan(seed = 3): Pt[] {
  const r = rng(seed)
  const X: Pt[] = []
  const arc = (cx: number, cy: number, R: number, a0: number, a1: number, n: number, c: number) => {
    for (let i = 0; i < n; i++) {
      const a = a0 + (a1 - a0) * r()
      X.push({ x: cx + R * Math.cos(a) + 0.1 * gauss(r), y: cy + R * Math.sin(a) + 0.1 * gauss(r), c })
    }
  }
  arc(4, 2.8, 3, 0.3, 2.8, 110, 0)
  arc(7, 5.2, 3, 3.4, 6.0, 110, 1)
  arc(12.5, 4, 1.2, 0, 6.3, 110, 2)
  for (let i = 0; i < NOISE_N; i++) X.push({ x: 15 * r(), y: 8 * r(), c: 3 })
  return X
}

export function neighbours(X: Pt[], eps: number): number[][] {
  const e2 = eps * eps
  return X.map((p) => {
    const out: number[] = []
    X.forEach((q, j) => { if ((p.x - q.x) ** 2 + (p.y - q.y) ** 2 <= e2) out.push(j) })
    return out
  })
}

/** DBSCAN; her kuyruk çıkışını sırasıyla kaydeder (çizim için). */
export function dbscan(X: Pt[], eps: number, minPts: number) {
  const N = neighbours(X, eps)
  const core = N.map((nb) => nb.length >= minPts)
  const label = new Array<number>(X.length).fill(-1)
  const steps: Array<{ j: number; k: number; added: number[]; seed?: boolean }> = []
  let k = 0
  for (let i = 0; i < X.length; i++) {
    if (!core[i] || label[i] !== -1) continue
    label[i] = k
    steps.push({ j: i, k, added: [i], seed: true })
    const queue = [i]
    for (let h = 0; h < queue.length; h++) {
      const j = queue[h]
      if (!core[j]) { steps.push({ j, k, added: [] }); continue }
      const added = N[j].filter((q) => label[q] === -1)
      added.forEach((q) => { label[q] = k; queue.push(q) })
      steps.push({ j, k, added })
    }
    k++
  }
  return { N, core, label, k, steps }
}

const LAB = (k: number) => k + 1

/**
 * Uzaklık matrisinden ortalama siluet: lib/ml/egitim/metrics.ts'teki `silhouette` ile aynı tanım (gürültü −1 sayılmaz, tek
 * elemanlı kümedeki nokta 0), ama eps taramasında matris bir kez hesaplandığı için çok daha hızlı.
 */
export function silhouetteD(D: Float64Array, n: number, g: number[]): number {
  const K = Math.max(-1, ...g) + 1
  if (new Set(g.filter((v) => v >= 0)).size < 2) return 0
  const cnt = new Array<number>(K).fill(0)
  for (const v of g) if (v >= 0) cnt[v]++
  let tot = 0, m = 0
  const sum = new Float64Array(K)
  for (let i = 0; i < n; i++) {
    if (g[i] < 0) continue
    m++
    if (cnt[g[i]] < 2) continue
    sum.fill(0)
    for (let j = 0; j < n; j++) if (g[j] >= 0 && j !== i) sum[g[j]] += D[i * n + j]
    const a = sum[g[i]] / (cnt[g[i]] - 1)
    let b = Infinity
    for (let c = 0; c < K; c++) if (c !== g[i] && cnt[c] > 0) b = Math.min(b, sum[c] / cnt[c])
    tot += (b - a) / Math.max(a, b)
  }
  return m ? tot / m : 0
}

/** eps taraması: 0,10 … 1,50 m (adım 0,05). */
export const EPS_SWEEP = Array.from({ length: 29 }, (_, k) => Math.round((0.1 + 0.05 * k) * 100) / 100)

/**
 * Eğitim paneli (kümelemenin değerlendirmesi): seçili minPts ile eps taraması (küme sayısı, gürültü payı, siluet), seçili eps'te
 * küme büyüklükleri, gerçek nesnelerle saflık, gerçek gürültünün yakalanma oranı ve k-uzaklık eğrisi (eps seçmek için).
 */
export function dbscanReport({ eps = 0.5, minPts = 5 }: Record<string, number>): EgitimRaporu {
  const X = warehouseScan()
  const n = X.length
  const D = new Float64Array(n * n)
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) D[i * n + j] = Math.hypot(X[i].x - X[j].x, X[i].y - X[j].y)
  const h = { eps: [] as number[], clusters: [] as number[], noise_share: [] as number[], silhouette: [] as number[] }
  for (const e of EPS_SWEEP) {
    const r = dbscan(X, e, minPts)
    h.eps.push(e); h.clusters.push(r.k); h.noise_share.push(r.label.filter((v) => v < 0).length / n); h.silhouette.push(silhouetteD(D, n, r.label))
  }
  const res = dbscan(X, eps, minPts)
  const sizes = Array.from({ length: res.k }, (_, c) => res.label.filter((v) => v === c).length)
  // saflık: her kümede çoğunluk gerçek nesnenin payı (kümelenmiş noktalar üzerinden)
  let pure = 0, clustered = 0
  for (let c = 0; c < res.k; c++) {
    const cs = [0, 0, 0, 0]
    res.label.forEach((v, i) => { if (v === c) cs[X[i].c]++ })
    pure += Math.max(...cs); clustered += sizes[c]
  }
  const trueNoise = X.map((p, i) => [p.c, res.label[i]]).filter(([c]) => c === 3)
  const kd = X.map((_, i) => { const row = Array.from(D.subarray(i * n, i * n + n)).sort((a, b) => a - b); return row[Math.min(n - 1, minPts - 1)] }).sort((a, b) => b - a)
  const rank = kd.map((_, i) => i + 1)
  return {
    kind: 'kumeleme', model: `DBSCAN (eps ${eps}, minPts ${minPts})`, seed: 3, hyper: { eps, minPts, points: n },
    history: { x: 'eps', cols: h },
    final: [
      { key: 'clusters', label: B('küme sayısı', 'clusters'), value: res.k, fmt: 'int' },
      { key: 'noise_share', label: B('gürültü payı', 'noise share'), value: res.label.filter((v) => v < 0).length / n, fmt: 'pct' },
      { key: 'silhouette', label: B('siluet (gürültü hariç)', 'silhouette (no noise)'), value: silhouetteD(D, n, res.label), fmt: 3 },
      { key: 'purity', label: B('saflık (gerçek nesneye göre)', 'purity (vs true objects)'), value: clustered ? pure / clustered : 0, fmt: 'pct' },
      { key: 'noise_caught', label: B('gerçek gürültü yakalandı', 'true noise caught'), value: trueNoise.filter(([, l]) => l < 0).length / trueNoise.length, fmt: 'pct' },
      { key: 'core_share', label: B('çekirdek nokta payı', 'core point share'), value: res.core.filter(Boolean).length / n, fmt: 'pct' },
    ],
    charts: [
      { kind: 'line', id: 'eps-clusters', title: B(`eps'e göre küme sayısı (minPts ${minPts})`, `Clusters by eps (minPts ${minPts})`), x: h.eps, xLabel: B('eps (m)', 'eps (m)'), series: [{ key: 'clusters', label: B('küme', 'clusters'), values: h.clusters, tone: 1 }], marker: { x: eps, label: B('seçili', 'selected') } },
      { kind: 'line', id: 'eps-quality', title: B("eps'e göre siluet ve gürültü payı", 'Silhouette and noise share by eps'), x: h.eps, xLabel: B('eps (m)', 'eps (m)'), yMin: -0.2, yMax: 1, series: [{ key: 'silhouette', label: B('siluet', 'silhouette'), values: h.silhouette, tone: 3 }, { key: 'noise_share', label: B('gürültü payı', 'noise share'), values: h.noise_share, tone: 0, dash: true }], marker: { x: eps, label: B('seçili', 'selected') } },
      { kind: 'bar', id: 'sizes', title: B('Küme büyüklükleri (−1: gürültü)', 'Cluster sizes (−1: noise)'), labels: [...sizes.map((_, c) => String(c + 1)), '−1'], series: [{ key: 'size', label: B('nokta', 'points'), values: [...sizes, n - clustered], tone: 1 }], yMin: 0 },
      { kind: 'line', id: 'k-distance', title: B(`k-uzaklık eğrisi (k = ${minPts})`, `k-distance curve (k = ${minPts})`), x: rank, xLabel: B('nokta (sıralı)', 'point (sorted)'), yLabel: B('uzaklık (m)', 'distance (m)'), series: [{ key: 'kdist', label: B('k. komşu uzaklığı', 'distance to k-th neighbour'), values: kd, tone: 4 }, { key: 'eps', label: B('eps', 'eps'), values: rank.map(() => eps), tone: 0, dash: true }], note: B('Eğrinin dirsek yaptığı yükseklik iyi bir eps adayıdır: üstündekiler gürültü.', 'The height where the curve bends is a good eps candidate: points above it are noise.') },
    ],
  }
}

export const DBSCAN: Lesson<DbFrame> = {
  slug: 'dbscan',
  n: 0,
  title: { tr: 'DBSCAN: yoğunluğa göre kümeler', en: 'DBSCAN: clusters by density' },
  sub: { tr: 'Kıvrık raf sıralarını LiDAR noktalarından bulmak, gürültüyü ayıklayarak', en: 'Finding curved shelf rows in LiDAR points while weeding out the noise' },
  story: {
    tr: 'Depoda gezen bir otonom forklift zemin seviyesindeki LiDAR’ıyla 365 nokta topladı: iki kıvrık raf sırası ile yuvarlak bir raf (110’ar nokta), bir de tozdan ve yansımadan gelen 35 seyrek gürültü noktası. Kaç nesne olduğunu bilmiyoruz. k-means burada işe yaramaz: hilalleri ortadan böler ve gürültüyü de bir kümeye zorla katar.',
    en: 'An autonomous forklift driving through a warehouse collected 365 points with its floor-level LiDAR: two curved shelf rows and a round rack (110 points each), plus 35 sparse noise points from dust and reflections. We do not know how many objects there are. k-means fails here: it cuts the crescents in half and forces the noise into a cluster too.',
  },
  how: [
    { tr: 'Her noktanın çevresine eps yarıçaplı bir çember çizilir; içinde (kendisi dahil) en az minPts nokta varsa o nokta çekirdektir.', en: 'Draw a circle of radius eps around every point; if it holds at least minPts points (itself included), the point is a core point.' },
    { tr: 'Etiketsiz bir çekirdekten yeni küme başlar. Kuyruktan çıkan her çekirdek, çemberindeki etiketsiz noktaları kümeye katar (genişlik öncelikli arama).', en: 'A new cluster starts from an unlabeled core point. Every core point taken from the queue adds the unlabeled points in its circle to the cluster (breadth-first search).' },
    { tr: 'Çekirdek olmayan ama bir çekirdeğin çemberine düşen nokta sınır noktasıdır: kümeye girer ama küme ondan genişlemez.', en: 'A point that is not a core point but falls inside a core point’s circle is a border point: it joins the cluster, but the cluster does not grow from it.' },
    { tr: 'Hiçbir kümeye ulaşılamayan noktalar gürültüdür. Küme sayısını kimse söylemez; yoğunluk belirler.', en: 'Points that no cluster reaches are noise. Nobody gives the number of clusters; density decides.' },
    { tr: 'Şunu dene: eps’i 0,15 yap; çember çok küçülür, noktaların yarıdan fazlası gürültü olur. 0,8 yaparsan iki hilal birbirine bağlanıp tek küme olur.', en: 'Try this: set eps to 0.15; the circle gets too small and more than half of the points become noise. At 0.8 the two crescents link up into a single cluster.' },
  ],
  why: {
    tr: 'DBSCAN, LiDAR ve derinlik kamerası nokta bulutlarını engellere ayırmanın en yaygın yollarından biridir: küme sayısını bilmek gerekmez, biçim serbesttir ve tek tük yansımalar gürültü olarak atılır. Otonom araçlarda ve depo robotlarında engel çıkarma, harita temizleme ve GPS izlerinden durak bulma gibi işlerde kullanılır.',
    en: 'DBSCAN is one of the most common ways to split LiDAR and depth-camera point clouds into obstacles: you do not need the number of clusters, shapes are free and stray reflections are thrown out as noise. Autonomous cars and warehouse robots use it for obstacle extraction, map cleaning and finding stops in GPS tracks.',
  },
  file: 'dbscan.py',
  code: [
    ['import numpy as np'],
    ['rng = np.random.default_rng(3)'],
    ['def yay(cx, cy, r, a0, a1, n):', 'kıvrık raf sırası', 'a curved shelf row'],
    ['    a = rng.uniform(a0, a1, n)'],
    ['    p = np.c_[cx + r * np.cos(a), cy + r * np.sin(a)]'],
    ['    return p + rng.normal(0, 0.1, (n, 2))', '10 cm ölçüm gürültüsü', '10 cm measurement noise'],
    ['X = np.vstack([yay(4, 2.8, 3, 0.3, 2.8, 110),', 'hilal 1', 'crescent 1'],
    ['               yay(7, 5.2, 3, 3.4, 6.0, 110),', 'hilal 2', 'crescent 2'],
    ['               yay(12.5, 4, 1.2, 0, 6.3, 110),', 'yuvarlak raf', 'round rack'],
    ['               rng.uniform(0, [15, 8], (35, 2))])', 'gürültü', 'noise'],
    ['eps, min_pts = 0.5, 5', 'metre, nokta', 'metres, points'],
    ['D = np.linalg.norm(X[:, None] - X, axis=2)', 'bütün uzaklıklar', 'all distances'],
    ['N = D <= eps; cekirdek = N.sum(1) >= min_pts', 'çekirdek noktalar', 'core points'],
    ['etiket = np.full(len(X), -1); k = 0', '−1: etiketsiz', '−1: unlabeled'],
    ['for i in np.flatnonzero(cekirdek):'],
    ['    if etiket[i] != -1: continue', 'zaten bir kümede', 'already in a cluster'],
    ['    etiket[i] = k; kuyruk = [i]', 'yeni küme', 'new cluster'],
    ['    while kuyruk:'],
    ['        j = kuyruk.pop(0)', 'sıradaki nokta', 'next point'],
    ['        if not cekirdek[j]: continue', 'sınır: genişlemez', 'border: does not grow'],
    ['        yeni = np.flatnonzero(N[j] & (etiket == -1))', 'çemberdeki etiketsizler', 'unlabeled in the circle'],
    ['        etiket[yeni] = k; kuyruk += list(yeni)'],
    ['    k += 1'],
    ["print(k, 'küme ·', (etiket == -1).sum(), 'gürültü')"],
    ['def kume(eps):', 'aynı algoritma, fonksiyon olarak', 'the same algorithm as a function'],
    ['    N, c = D <= eps, (D <= eps).sum(1) >= min_pts'],
    ['    e, k = np.full(len(X), -1), 0'],
    ['    for i in np.flatnonzero(c):'],
    ['        if e[i] != -1: continue'],
    ['        e[i] = k; q = [i]'],
    ['        while q:'],
    ['            j = q.pop(0)'],
    ['            if not c[j]: continue'],
    ['            y = np.flatnonzero(N[j] & (e == -1))'],
    ['            e[y] = k; q += list(y)'],
    ['        k += 1'],
    ['    return e, k'],
    ['def siluet(e):', 'ortalama siluet, gürültü hariç', 'mean silhouette, without noise'],
    ['    m = e >= 0; L = np.unique(e[m])'],
    ['    if len(L) < 2: return 0.0'],
    ['    Dm, em = D[np.ix_(m, m)], e[m]'],
    ['    own = em[:, None] == L; cnt = own.sum(0)'],
    ['    S = np.stack([Dm[:, em == l].sum(1) for l in L], 1)', 'kümelere uzaklık toplamı', 'distance sums to each cluster'],
    ['    n = own @ cnt', 'kendi kümesinin boyu', 'size of own cluster'],
    ['    a = (S * own).sum(1) / np.maximum(n - 1, 1)', 'kendi kümesine ort.', 'mean to own cluster'],
    ['    b = np.where(own, np.inf, S / cnt).min(1)', 'en yakın diğer küme', 'nearest other cluster'],
    ['    s = np.where(n > 1, (b - a) / np.maximum(a, b), 0)'],
    ['    return float(s.mean())'],
    ["history = {'eps': [], 'clusters': [],", 'eps taraması', 'eps sweep'],
    ["           'noise_share': [], 'silhouette': []}"],
    ['for e_ in np.round(np.arange(0.1, 1.501, 0.05), 2):'],
    ['    lab, kk = kume(e_)'],
    ['    r = [e_, kk, (lab == -1).mean(), siluet(lab)]'],
    ['    for c_, v in zip(history, r): history[c_] += [float(v)]'],
    ["fin = [('clusters', k),", 'son ölçümler', 'final metrics'],
    ["       ('noise_share', (etiket == -1).mean()),"],
    ["       ('silhouette', siluet(etiket))]"],
    ["for c_, v in fin: print(f'{c_:<12}{v:>8.3f}')"],
    ['import csv'],
    ["with open('egitim_gecmisi.csv', 'w', newline='') as f:", 'satır başına bir eps', 'one row per eps'],
    ['    csv.writer(f).writerows([list(history),'],
    ['                             *zip(*history.values())])'],
    ['try:'],
    ['    import matplotlib.pyplot as plt', 'varsa grafik çiz', 'plot if available'],
    ["    for c_ in ('silhouette', 'noise_share'):"],
    ["        plt.plot(history['eps'], history[c_], label=c_)"],
    ["    plt.xlabel('eps (m)'); plt.legend(); plt.show()"],
    ['except ImportError:'],
    ["    print('matplotlib yok: grafik atlandı')"],
  ],
  params: [
    { key: 'eps', label: { tr: 'eps (m)', en: 'eps (m)' }, min: 0.1, max: 1.5, step: 0.05, value: 0.5 },
    { key: 'minPts', label: { tr: 'minPts', en: 'minPts' }, min: 2, max: 15, step: 1, value: 5 },
  ],
  report: dbscanReport,
  run({ eps = 0.5, minPts = 5 }) {
    const X = warehouseScan()
    const mp = Math.round(minPts)
    const res = dbscan(X, eps, mp)
    const { N, core, steps } = res
    const base = { X, eps, minPts: mp }
    const F: DbFrame[] = []
    const n = X.length
    const empty = new Array<number>(n).fill(-1)
    const et = fmt(eps, 2, 'tr'), ee = eps.toFixed(2)
    const stat = cap(`${n} nokta · eps = ${et} m · minPts = ${mp}`, `${n} points · eps = ${ee} m · minPts = ${mp}`)
    F.push({ ...base, core: null, label: empty, k: 0, line: 9, cap: cap(`LiDAR taraması: ${n} nokta, etiket yok`, `LiDAR scan: ${n} points, no labels`), stat, hold: 2 })
    // örnek: en kalabalık çekirdek ve gürültü noktalarından biri
    let dense = 0
    N.forEach((nb, i) => { if (nb.length > N[dense].length) dense = i })
    const lonely = n - NOISE_N + N.slice(n - NOISE_N).findIndex((nb) => nb.length < mp)
    const probes = lonely >= n - NOISE_N ? [dense, lonely] : [dense]
    F.push({
      ...base, core: null, label: empty, k: 0, probes, line: 10,
      cap: cap(`eps = ${et} m çember, en az ${mp} nokta`, `circle of eps = ${ee} m, at least ${mp} points`),
      stat: cap(`örnek: ${N[dense].length} komşu${probes[1] !== undefined ? ` ve ${N[probes[1]].length} komşu` : ''}`, `example: ${N[dense].length} neighbours${probes[1] !== undefined ? ` and ${N[probes[1]].length}` : ''}`), hold: 2,
    })
    const nCore = core.filter(Boolean).length
    F.push({ ...base, core, label: empty, k: 0, line: 12, cap: cap(`${nCore} çekirdek nokta`, `${nCore} core points`), stat: cap(`${n - nCore} nokta çekirdek değil`, `${n - nCore} points are not core`), hold: 1.6 })
    // BFS adımları: ilk kümenin ilk birkaç adımı tek tek, sonra gruplar halinde
    const label = empty.slice()
    const batch = Math.max(1, Math.ceil(steps.length / 55))
    let s = 0
    while (s < steps.length) {
      const st = steps[s]
      const detail = st.k === 0 && s < 4
      let end = s + 1
      while (end < steps.length && !steps[end].seed) end++
      const take = detail || st.seed ? 1 : Math.min(batch, end - s)
      const grp = steps.slice(s, s + take)
      const popped: number[] = [], added: number[] = []
      grp.forEach((g) => { if (!g.seed) popped.push(g.j); g.added.forEach((q) => { label[q] = g.k; added.push(q) }) })
      const K = st.k
      const size = label.filter((l) => l === K).length
      const c = cap(`küme ${LAB(K)} · ${size} nokta`, `cluster ${LAB(K)} · ${size} points`)
      if (st.seed) {
        F.push({ ...base, core, label: label.slice(), added, k: K + 1, line: 16, cap: cap(`küme ${LAB(K)} başlıyor: etiketsiz bir çekirdek`, `cluster ${LAB(K)} starts: an unlabeled core point`), stat, hold: K < 2 ? 1.5 : 1 })
      } else if (detail) {
        const j = st.j
        F.push({ ...base, core, label: label.slice(), popped, added: [], k: K + 1, line: 18, cap: c, stat: cap('kuyruktan bir nokta çıktı', 'a point leaves the queue'), hold: 1 })
        F.push({ ...base, core, label: label.slice(), popped, added, k: K + 1, line: core[j] ? 21 : 19, cap: c, stat: core[j] ? cap(`çekirdek: çemberindeki ${added.length} etiketsiz nokta katıldı`, `core: ${added.length} unlabeled points in its circle joined`) : cap('sınır noktası: genişlemez', 'border point: does not grow'), hold: 1.3 })
      } else {
        F.push({ ...base, core, label: label.slice(), popped, added, k: K + 1, line: 20, cap: c, stat: cap(`+${added.length} nokta`, `+${added.length} points`), hold: 0.4 })
      }
      s += take
    }
    const noise = res.label.filter((l) => l === -1).length
    const caught = res.label.slice(n - NOISE_N).filter((l) => l === -1).length
    F.push({
      ...base, core, label: res.label, k: res.k, done: true, line: 23,
      cap: cap(`${res.k} küme · ${noise} gürültü noktası`, `${res.k} clusters · ${noise} noise points`),
      stat: cap(`gerçek ${NOISE_N} gürültü noktasının ${caught} tanesi ayıklandı`, `${caught} of the ${NOISE_N} real noise points weeded out`), hold: 3,
    })
    return F
  },
}
