// Ders: DBSCAN, yoğunluk tabanlı kümeleme. Depo zeminindeki LiDAR taraması: iki kıvrık raf sırası, yuvarlak bir raf ve seyrek
// gürültü. eps yarıçapında en az minPts komşusu olan nokta çekirdektir; kümeler çekirdekten çekirdeğe genişleyerek (BFS) büyür.
import { cap, fmt, gauss, rng, type Frame, type Lesson, type Pt } from './core'

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
  ],
  params: [
    { key: 'eps', label: { tr: 'eps (m)', en: 'eps (m)' }, min: 0.1, max: 1.5, step: 0.05, value: 0.5 },
    { key: 'minPts', label: { tr: 'minPts', en: 'minPts' }, min: 2, max: 15, step: 1, value: 5 },
  ],
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
