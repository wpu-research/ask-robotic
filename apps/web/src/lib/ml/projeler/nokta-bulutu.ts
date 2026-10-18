// Proje: 3B nokta bulutu kümeleme. Depoda duran robotun döner LiDAR'ı çevresini 360° tarar: zemindeki halkalar, beş nesne
// (koli yığını, varil, insan, palet, dolap) ve havada birkaç sahte yansıma (aykırı nokta). Önce zemin bir yükseklik eşiğiyle atılır,
// istenirse PCA ile 3 boyut 2'ye indirilir, sonra k-ortalamalar ya da DBSCAN noktaları nesnelere ayırır. Gerçek etiketler yalnız
// ölçüm içindir; algoritmalar onları hiç görmez. Koordinatlar robot çerçevesinde metre: x ileri, y sol, z yukarı.
import { cap, fmt, gauss, rng, type Bi, type Cap } from '../core'
import type { Curve, Metric, ProjectDef, ProjectRun, Table } from './core'
import { B, gecmisGrafik, type EgitimRaporu, type Grafik } from '../egitim/rapor'
import { silhouette } from '../egitim/metrics'

/** Yükseklik eşiği: bunun altındaki noktalar zemin sayılır ve atılır. */
export const FLOOR_Z = 0.08
/** LiDAR'ın yerden yüksekliği: nesnelerin bundan yüksek üst yüzleri görünmez. */
export const SENSOR_Z = 0.5
export const MIN_PTS = 6

export const OBJECTS: Array<{ name: Cap; kind: 'box' | 'cyl'; at: [number, number]; size: [number, number, number] }> = [
  { name: ['koli yığını', 'stack of boxes'], kind: 'box', at: [3, 2], size: [1.2, 0.8, 1.0] },
  { name: ['varil', 'barrel'], kind: 'cyl', at: [4.5, -1.8], size: [0.3, 0.3, 0.9] },
  { name: ['insan', 'person'], kind: 'cyl', at: [1.8, -3], size: [0.22, 0.22, 1.75] },
  { name: ['palet', 'pallet'], kind: 'box', at: [-2.6, 3], size: [1.2, 1.0, 0.15] },
  { name: ['dolap', 'cabinet'], kind: 'box', at: [-3.2, -2.4], size: [0.6, 2.0, 1.8] },
]
export const N_OBJ = OBJECTS.length

export interface Cloud {
  /** N × 3 konum (x, y, z), tarama açısına göre sıralı: ışın döndükçe sırayla görünür. */
  pos: Float32Array
  /** Gerçek etiket: −2 zemin, −1 aykırı (sahte yansıma), 0.. nesne. */
  truth: Int8Array
  n: number
}

/**
 * LiDAR benzeri tarama. Zemin: 1–6,5 m arası 12 halka. Nesneler: yalnız robota bakan yüzeyler örneklenir; yoğunluk uzaklıkla
 * düşer (3 m'de 90 nokta/m²). Her noktaya 1,5 cm gürültü. Havada 25 aykırı nokta.
 */
export function lidarCloud(seed = 7, outliers = 25): Cloud {
  const r = rng(seed)
  const P: Array<[number, number, number, number]> = []
  const noise = () => 0.015 * gauss(r)
  for (let i = 0; i < 12; i++) {
    const R = 1 + i * 0.5, n = 72
    for (let j = 0; j < n; j++) { const a = ((j + r()) / n) * 2 * Math.PI; P.push([R * Math.cos(a), R * Math.sin(a), 0.02 * gauss(r), -2]) }
  }
  const density = (x: number, y: number) => 90 * (3 / Math.max(1, Math.hypot(x, y)))
  OBJECTS.forEach((o, id) => {
    const [cx, cy] = o.at, [sx, sy, sz] = o.size
    if (o.kind === 'box') {
      // dört yan yüz: normal yönü ve yüz merkezi
      const faces: Array<{ n: [number, number]; c: [number, number]; w: number; along: [number, number] }> = [
        { n: [1, 0], c: [cx + sx / 2, cy], w: sy, along: [0, 1] }, { n: [-1, 0], c: [cx - sx / 2, cy], w: sy, along: [0, 1] },
        { n: [0, 1], c: [cx, cy + sy / 2], w: sx, along: [1, 0] }, { n: [0, -1], c: [cx, cy - sy / 2], w: sx, along: [1, 0] },
      ]
      for (const f of faces) {
        if (f.n[0] * f.c[0] + f.n[1] * f.c[1] >= 0) continue // robota bakmıyor
        const k = Math.round(f.w * sz * density(f.c[0], f.c[1]))
        for (let i = 0; i < k; i++) { const u = (r() - 0.5) * f.w, z = r() * sz; P.push([f.c[0] + f.along[0] * u + noise(), f.c[1] + f.along[1] * u + noise(), z + noise(), id]) }
      }
      if (sz < SENSOR_Z) {
        const k = Math.round(sx * sy * density(cx, cy))
        for (let i = 0; i < k; i++) P.push([cx + (r() - 0.5) * sx + noise(), cy + (r() - 0.5) * sy + noise(), sz + noise(), id])
      }
    } else {
      const R = sx, toward = Math.atan2(-cy, -cx)
      const k = Math.round(Math.PI * R * sz * density(cx, cy))
      for (let i = 0; i < k; i++) { const a = toward + (r() - 0.5) * Math.PI, z = r() * sz; P.push([cx + R * Math.cos(a) + noise(), cy + R * Math.sin(a) + noise(), z + noise(), id]) }
    }
  })
  for (let i = 0; i < outliers; i++) { const a = r() * 2 * Math.PI, R = 1.5 + 5 * r(); P.push([R * Math.cos(a), R * Math.sin(a), 0.3 + 2.2 * r(), -1]) }
  P.sort((a, b) => Math.atan2(a[1], a[0]) - Math.atan2(b[1], b[0]))
  const n = P.length, pos = new Float32Array(n * 3), truth = new Int8Array(n)
  P.forEach((p, i) => { pos[i * 3] = p[0]; pos[i * 3 + 1] = p[1]; pos[i * 3 + 2] = p[2]; truth[i] = p[3] })
  return { pos, truth, n }
}

/** Zemin eşiğinin üstündeki noktaların dizinleri. */
export const aboveFloor = (c: Cloud): number[] => Array.from({ length: c.n }, (_, i) => i).filter((i) => c.pos[i * 3 + 2] > FLOOR_Z)

/** 3×3 simetrik matrisin özdeğer ve özvektörleri (Jacobi dönmeleri); büyükten küçüğe sıralı, vecs[k] k. özvektör. */
export function eig3(S: number[][]): { vals: number[]; vecs: number[][] } {
  const A = S.map((r) => [...r]), V = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
  for (let sweep = 0; sweep < 50; sweep++) {
    const off = A[0][1] ** 2 + A[0][2] ** 2 + A[1][2] ** 2
    if (off < 1e-20) break
    for (const [p, q] of [[0, 1], [0, 2], [1, 2]]) {
      if (Math.abs(A[p][q]) < 1e-15) continue
      const th = (A[q][q] - A[p][p]) / (2 * A[p][q])
      const t = Math.sign(th || 1) / (Math.abs(th) + Math.sqrt(th * th + 1)), c = 1 / Math.sqrt(t * t + 1), s = t * c
      for (let k = 0; k < 3; k++) { const akp = A[k][p], akq = A[k][q]; A[k][p] = c * akp - s * akq; A[k][q] = s * akp + c * akq }
      for (let k = 0; k < 3; k++) { const apk = A[p][k], aqk = A[q][k]; A[p][k] = c * apk - s * aqk; A[q][k] = s * apk + c * aqk }
      for (let k = 0; k < 3; k++) { const vkp = V[k][p], vkq = V[k][q]; V[k][p] = c * vkp - s * vkq; V[k][q] = s * vkp + c * vkq }
    }
  }
  const idx = [0, 1, 2].sort((a, b) => A[b][b] - A[a][a])
  return { vals: idx.map((i) => Math.max(0, A[i][i])), vecs: idx.map((i) => [V[0][i], V[1][i], V[2][i]]) }
}

export interface Pca3 { mu: number[]; vals: number[]; vecs: number[][]; explained: number[] }
/** Seçilen noktaların PCA'sı: ortalama, kovaryans, özvektörler; explained[k] = k. bileşenin varyans payı. */
export function pca3(pos: Float32Array, idx: number[]): Pca3 {
  const mu = [0, 1, 2].map((d) => idx.reduce((s, i) => s + pos[i * 3 + d], 0) / idx.length)
  const S = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]
  for (const i of idx) for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) S[a][b] += (pos[i * 3 + a] - mu[a]) * (pos[i * 3 + b] - mu[b])
  for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) S[a][b] /= idx.length
  const { vals, vecs } = eig3(S)
  const tot = vals.reduce((s, v) => s + v, 0) || 1
  return { mu, vals, vecs, explained: vals.map((v) => v / tot) }
}

/** Kümeleme koordinatları: ham 3B ya da ilk iki temel bileşen (D = 3 ya da 2), m × D düz dizi. */
export function features(pos: Float32Array, idx: number[], p: Pca3 | null): { X: Float64Array; D: number } {
  const D = p ? 2 : 3, X = new Float64Array(idx.length * D)
  idx.forEach((i, m) => {
    if (!p) for (let d = 0; d < 3; d++) X[m * 3 + d] = pos[i * 3 + d]
    else for (let k = 0; k < 2; k++) X[m * 2 + k] = [0, 1, 2].reduce((s, d) => s + (pos[i * 3 + d] - p.mu[d]) * p.vecs[k][d], 0)
  })
  return { X, D }
}

const dist2 = (X: Float64Array, D: number, a: number, B: ArrayLike<number>, b: number) => { let s = 0; for (let d = 0; d < D; d++) s += (X[a * D + d] - B[b * D + d]) ** 2; return s }

/** k-ortalamalar++ başlangıcı: ilk merkez rastgele, sonrakiler uzaklığın karesiyle orantılı olasılıkla. */
export function kmeansPP(X: Float64Array, D: number, k: number, r: () => number): Float64Array {
  const m = X.length / D, C = new Float64Array(k * D)
  const pick = (j: number, i: number) => { for (let d = 0; d < D; d++) C[j * D + d] = X[i * D + d] }
  pick(0, Math.floor(r() * m))
  const best = new Float64Array(m).fill(Infinity)
  for (let j = 1; j < k; j++) {
    let tot = 0
    for (let i = 0; i < m; i++) { best[i] = Math.min(best[i], dist2(X, D, i, C, j - 1)); tot += best[i] }
    let u = r() * tot, i = 0
    while (i < m - 1 && (u -= best[i]) > 0) i++
    pick(j, i)
  }
  return C
}

/**
 * Kötü bir başlangıç yerel bir tuzağa düşebilir (k-ortalamalar dersindeki gibi). `tries` başlangıç sessizce sonuna kadar denenir,
 * toplam kare uzaklığı en küçük çıkanın başlangıç merkezleri döner; sahnede o başlangıç oynatılır.
 */
export function bestStart(X: Float64Array, D: number, k: number, r: () => number, tries = 10): Float64Array {
  let best: Float64Array | null = null, bestS = Infinity
  for (let t = 0; t < tries; t++) {
    const C0 = kmeansPP(X, D, k, r), C = new Float64Array(C0), g = new Int16Array(X.length / D).fill(-1)
    let s = 0
    for (let i = 0; i < 100; i++) { const o = lloydRound(X, D, C, g); s = o.s; if (!o.changed) break }
    if (s < bestS) { bestS = s; best = C0 }
  }
  return best!
}

/** Tek Lloyd turu: her nokta en yakın merkeze, her merkez kendi noktalarının ortalamasına. Dönüş: değişen atama sayısı ve toplam kare uzaklık. */
export function lloydRound(X: Float64Array, D: number, C: Float64Array, g: Int16Array) {
  const m = X.length / D, k = C.length / D
  let changed = 0, s = 0
  for (let i = 0; i < m; i++) {
    let bj = 0, bd = Infinity
    for (let j = 0; j < k; j++) { const dd = dist2(X, D, i, C, j); if (dd < bd) { bd = dd; bj = j } }
    if (g[i] !== bj) { changed++; g[i] = bj }
    s += bd
  }
  const sum = new Float64Array(k * D), cnt = new Array<number>(k).fill(0)
  for (let i = 0; i < m; i++) { cnt[g[i]]++; for (let d = 0; d < D; d++) sum[g[i] * D + d] += X[i * D + d] }
  for (let j = 0; j < k; j++) if (cnt[j]) for (let d = 0; d < D; d++) C[j * D + d] = sum[j * D + d] / cnt[j]
  return { changed, s }
}

/** eps komşulukları (kendisi dahil); ızgara hücreleriyle hızlandırılmış. */
export function neighbours3(X: Float64Array, D: number, eps: number): number[][] {
  const m = X.length / D, e2 = eps * eps
  const key = (i: number) => { let s = ''; for (let d = 0; d < D; d++) s += Math.floor(X[i * D + d] / eps) + ','; return s }
  const grid = new Map<string, number[]>()
  for (let i = 0; i < m; i++) { const kk = key(i); const a = grid.get(kk); if (a) a.push(i); else grid.set(kk, [i]) }
  const offs: number[][] = D === 3 ? [-1, 0, 1].flatMap((a) => [-1, 0, 1].flatMap((b) => [-1, 0, 1].map((c) => [a, b, c]))) : [-1, 0, 1].flatMap((a) => [-1, 0, 1].map((b) => [a, b]))
  return Array.from({ length: m }, (_, i) => {
    const base = Array.from({ length: D }, (_, d) => Math.floor(X[i * D + d] / eps))
    const out: number[] = []
    for (const o of offs) {
      const cell = grid.get(base.map((b, d) => b + o[d]).join(',') + ',')
      if (cell) for (const j of cell) if (dist2(X, D, i, X, j) <= e2) out.push(j)
    }
    return out
  })
}

/** Toplu DBSCAN (testler ve hızlı hesap için). label: −1 gürültü, 0.. küme. */
export function dbscan3(X: Float64Array, D: number, eps: number, minPts = MIN_PTS): Int16Array {
  const N = neighbours3(X, D, eps), m = N.length, label = new Int16Array(m).fill(-1)
  let k = 0
  for (let i = 0; i < m; i++) {
    if (label[i] !== -1 || N[i].length < minPts) continue
    label[i] = k
    const q = [i]
    while (q.length) { const j = q.pop()!; if (N[j].length < minPts) continue; for (const t of N[j]) if (label[t] === -1) { label[t] = k; q.push(t) } }
    k++
  }
  return label
}

/**
 * Değerlendirme: nesne başına en çok örtüşen küme. Nesne "bulundu" sayılır: o kümede nesnenin noktalarının en az %90'ı var ve
 * kümenin en az %90'ı o nesne. Saflık: her kümenin çoğunluk nesnesine ait nokta payı (gürültü etiketliler dışarıda).
 */
export function evaluate(truth: ArrayLike<number>, label: ArrayLike<number>) {
  const K = Math.max(-1, ...Array.from(label)) + 1
  const M = Array.from({ length: N_OBJ + 1 }, () => new Array<number>(K + 1).fill(0)) // satır: nesneler + aykırı; sütun: kümeler + gürültü
  for (let i = 0; i < truth.length; i++) { const r = truth[i] < 0 ? N_OBJ : truth[i]; const c = label[i] < 0 ? K : label[i]; M[r][c]++ }
  const objN = M.map((row) => row.reduce((s, v) => s + v, 0)), cluN = Array.from({ length: K + 1 }, (_, c) => M.reduce((s, row) => s + row[c], 0))
  const match = OBJECTS.map((_, j) => { let bc = -1, bv = 0; for (let c = 0; c < K; c++) if (M[j][c] > bv) { bv = M[j][c]; bc = c } return bc })
  const found = match.map((c, j) => c >= 0 && M[j][c] >= 0.9 * objN[j] && M[j][c] >= 0.9 * cluN[c])
  let pure = 0, inClusters = 0
  for (let c = 0; c < K; c++) { inClusters += cluN[c]; pure += Math.max(...M.map((row) => row[c])) }
  return { M, K, match, found, recovered: found.filter(Boolean).length, purity: inClusters ? pure / inClusters : 0, noise: cluN[K] }
}

export type Phase = 'scan' | 'floor' | 'pca' | 'cluster' | 'done'
export interface View {
  cloud: Cloud
  /** Düzleştirilmiş konumlar (PCA düzlemine izdüşüm, robot çerçevesinde) — pca kapalıysa pos ile aynı. */
  flatPos: Float32Array
  /** Görünen nokta sayısı (tarama sırasıyla). */
  revealed: number
  /** Işının açısı (radyan, robot çerçevesi). */
  beam: number
  /** Zeminin sönme oranı 0–1 ve düzleşme oranı 0–1. */
  floorFade: number
  flat: number
  phase: Phase
  algo: 0 | 1
  /** Her noktanın küme etiketi: −2 zemin / henüz yok, −1 gürültü ya da etiketsiz, 0.. küme. */
  label: Int16Array
  /** Merkezler robot çerçevesinde (k-ortalamalar), yoksa null. */
  centroids: Float32Array | null
  /** Bu DBSCAN adımında genişleyen nokta (vurgu), yoksa −1. */
  probe: number
  pca: Pca3 | null
  /** Etiketler her değiştiğinde artar: sahne yalnız o zaman yeniden boyar. */
  version: number
}

const LABEL_NAMES: Cap = ['gürültü', 'noise']

export const NOKTA_BULUTU: ProjectDef<View> = {
  slug: 'nokta-bulutu',
  title: { tr: '3B nokta bulutunu kümeleme', en: 'Clustering a 3D point cloud' },
  sub: { tr: 'Robotun LiDAR taramasında nesneleri etiket görmeden ayırmak: k-ortalamalar, DBSCAN ve PCA', en: 'Separating the objects in a robot’s LiDAR scan without labels: k-means, DBSCAN and PCA' },
  story: {
    tr: 'Depoda duran bir robotun döner LiDAR’ı çevresini 360° tarar ve bir nokta bulutu üretir: zemindeki halkalar, bir koli yığını, bir varil, bir insan, bir palet ve bir dolap; havada da birkaç sahte yansıma. Robot hangi noktanın hangi nesneye ait olduğunu bilmez. Çarpmadan dolaşmak için önce bu noktaları nesnelere ayırması gerekir.',
    en: 'A robot standing in a warehouse spins its LiDAR through 360° and gets a point cloud: rings on the floor, a stack of boxes, a barrel, a person, a pallet and a cabinet, plus a few false reflections in the air. The robot does not know which point belongs to which object. To move around without hitting anything it first has to split the points into objects.',
  },
  goal: {
    tr: 'Beş nesnenin beşini de ayrı birer küme olarak bulmak: her nesnenin noktalarının en az %90’ı tek bir kümede, o kümenin de en az %90’ı o nesne olmalı. Sahte yansımalar hiçbir nesneye katılmamalı.',
    en: 'Find all five objects as separate clusters: at least 90% of each object’s points in a single cluster, and at least 90% of that cluster from the object. The false reflections should not join any object.',
  },
  model: {
    tr: 'Yükseklik eşiğiyle zemin ayıklama, sonra iki kümeleme algoritmasından biri: k-ortalamalar (k-ortalamalar++ başlangıcı, Lloyd turları) ya da DBSCAN (yoğunluk tabanlı, eps yarıçapı, en az 6 komşu). İkisi de kursun 2B derslerinin 3B genellemesidir. PCA açıkken kovaryans matrisinin özvektörleri bulunur ve nokta bulutu en çok değişen iki yöne izdüşürülür; kümeleme bu iki sayı üzerinde yapılır.',
    en: 'Floor removal with a height threshold, then one of two clustering algorithms: k-means (k-means++ start, Lloyd rounds) or DBSCAN (density based, radius eps, at least 6 neighbours). Both are the 3D generalisation of the course’s 2D lessons. With PCA on, the eigenvectors of the covariance matrix are found and the cloud is projected onto the two directions with the most spread; clustering then runs on those two numbers.',
  },
  lessons: ['k-means', 'dbscan', 'pca'],
  steps: [
    { tr: 'Tarama: ışın döndükçe noktalar açı sırasıyla gelir. Her nokta yalnız üç sayıdır (x, y, z); renk, etiket ya da nesne adı yok.', en: 'Scan: as the beam turns, points arrive in order of angle. Each point is just three numbers (x, y, z); no colour, label or object name.' },
    { tr: `Zemin ayıklama: ${fmt(FLOOR_Z, 2, 'tr')} m’nin altındaki her nokta zemin sayılır ve atılır. Bulutun yarısından fazlası zemindir; atılmazsa bütün nesneleri birbirine bağlayan dev bir küme olur.`, en: `Floor removal: every point below ${FLOOR_Z.toFixed(2)} m counts as floor and is dropped. More than half the cloud is floor; left in, it would be one giant cluster tying every object together.` },
    { tr: 'PCA (isteğe bağlı): kalan noktaların kovaryans matrisi çıkarılır, özvektörleri en çok yayılan yönlerdir. Bu sahnede ilk iki yön yatay düzleme yakındır; yükseklik en az bilgiyi taşır ve atılır. Bulut gözünün önünde iki boyuta yassılır.', en: 'PCA (optional): the covariance matrix of the remaining points is computed; its eigenvectors are the directions of greatest spread. In this scene the first two lie close to the floor plane; height carries the least information and is dropped. The cloud flattens to two dimensions in front of you.' },
    { tr: 'k-ortalamalar: k merkez seçilir, her nokta en yakın merkeze katılır, merkez kendi noktalarının ortalamasına taşınır; hiçbir atama değişmeyene kadar. Kötü bir başlangıç iki nesneyi tek kümede birleştirebilir; bu yüzden 10 başlangıç denenir ve en sıkısı oynatılır. Her nokta bir kümeye girmek zorundadır, sahte yansımalar da.', en: 'k-means: k centres are chosen, every point joins its nearest centre, each centre moves to the mean of its points; until no assignment changes. A bad start can merge two objects into one cluster, so 10 starts are tried and the tightest one is played. Every point must join a cluster, false reflections included.' },
    { tr: 'DBSCAN: eps yarıçaplı kürede en az 6 komşusu olan nokta çekirdektir. Küme bir çekirdekten başlar ve çekirdekten çekirdeğe genişler. Hiçbir kümeye ulaşmayan nokta gürültüdür; küme sayısını kimse söylemez.', en: 'DBSCAN: a point with at least 6 neighbours inside a sphere of radius eps is a core point. A cluster starts at a core point and spreads from core to core. Points no cluster reaches are noise; nobody tells it how many clusters there are.' },
    { tr: 'Ölçüm: her nesne en çok örtüştüğü kümeyle eşleşir. Tablo satırlarda gerçek nesneleri, sütunlarda bulunan kümeleri sayar; köşegen ne kadar doluysa ayırma o kadar iyidir.', en: 'Measurement: every object is matched with the cluster it overlaps most. The table counts true objects in rows and found clusters in columns; the fuller the diagonal, the better the split.' },
  ],
  task: [
    { tr: 'Algoritmayı DBSCAN bırak, eps’i 0,35’ten 0,15’e indir. Komşu kürelerin içi boşalır: her nesne parçalara bölünür, 20’den fazla küçük küme ve 160’tan fazla gürültü noktası çıkar, bulunan nesne sayısı 0’a düşer. Sonra eps’i 1’e çıkar: nesneler yine ayrı kalır çünkü aralarında metrelerce boşluk var, ama sahte yansımaların bir kısmı nesnelere yapışır.', en: 'Keep DBSCAN and lower eps from 0.35 to 0.15. The neighbour spheres empty out: every object breaks into pieces, more than 20 small clusters and over 160 noise points appear, and the number of objects found drops to 0. Then raise eps to 1: the objects still stay apart because metres of space separate them, but some of the false reflections stick to the objects.' },
    { tr: 'Algoritmayı k-ortalamalar yap (algo 0) ve k = 5 ile beş nesnenin beşini de bul. Sonra k’yı 3 yap: komşu nesneler aynı kümede birleşir ve en fazla 2 nesne bulunur. k-ortalamalar gürültü bilmez; her sahte yansıma bir nesneye eklenir.', en: 'Switch to k-means (algo 0) and find all five objects with k = 5. Then set k to 3: neighbouring objects merge into the same cluster and at most 2 objects are found. k-means knows no noise; every false reflection is added to some object.' },
    { tr: 'PCA’yı aç (pca 1). İlk iki bileşen varyansın %98’inden fazlasını taşır; bulut yassılır ve DBSCAN aynı eps ile yine beş nesneyi de bulur. Üç sayı yerine iki sayı yetti, çünkü bu depoda nesneler üst üste değil yan yana duruyor.', en: 'Turn PCA on (pca 1). The first two components carry more than 98% of the variance; the cloud flattens and DBSCAN with the same eps still finds all five objects. Two numbers were enough instead of three, because in this warehouse objects stand side by side, not stacked.' },
  ],
  file: 'nokta_bulutu.py',
  code: [
    ['import numpy as np'],
    ['tarama = np.genfromtxt(\'lidar-3b.csv\', delimiter=\',\', skip_header=1)[:, :3]', '(N, 3) nokta, metre: x ileri, y sol, z yukarı', '(N, 3) points, metres: x forward, y left, z up'],
    ['P = tarama[tarama[:, 2] > 0.08]', 'zemini at', 'drop the floor'],
    ['mu = P.mean(0)'],
    ['val, vec = np.linalg.eigh(np.cov((P - mu).T))', 'kovaryansın özvektörleri', 'eigenvectors of the covariance'],
    ['val, vec = val[::-1], vec[:, ::-1]', 'büyükten küçüğe', 'largest first'],
    ['print("açıklanan varyans", val / val.sum())'],
    ['Z = (P - mu) @ vec[:, :2]', 'PCA: 3 sayıdan 2 sayıya', 'PCA: from 3 numbers to 2'],
    ['def kmeans(X, k, rng):'],
    ['    C = X[rng.choice(len(X), k, replace=False)]', 'rastgele merkezler', 'random centres'],
    ['    while True:'],
    ['        g = ((X[:, None] - C) ** 2).sum(2).argmin(1)', 'en yakın merkez', 'nearest centre'],
    ['        C2 = np.array([X[g == j].mean(0) for j in range(k)])', 'grubun ortalaması', 'mean of the group'],
    ['        if np.allclose(C, C2): return g'],
    ['        C = C2'],
    ['def dbscan(X, eps=0.35, min_pts=6):'],
    ['    D = ((X[:, None] - X) ** 2).sum(2) <= eps ** 2', 'eps küresindeki komşular', 'neighbours inside the eps sphere'],
    ['    core = D.sum(1) >= min_pts', 'çekirdek noktalar', 'core points'],
    ['    g, k = np.full(len(X), -1), 0', '-1: gürültü', '-1: noise'],
    ['    for i in np.flatnonzero(core):'],
    ['        if g[i] != -1: continue'],
    ['        g[i], kuyruk = k, [i]', 'yeni küme', 'new cluster'],
    ['        while kuyruk:'],
    ['            j = kuyruk.pop()'],
    ['            if not core[j]: continue', 'sınır noktası genişlemez', 'border points do not spread'],
    ['            for t in np.flatnonzero(D[j] & (g == -1)):'],
    ['                g[t] = k; kuyruk.append(t)'],
    ['        k += 1'],
    ['    return g'],
    ['etiket = dbscan(P)', 'ya da kmeans(Z, 5, np.random.default_rng(0))', 'or kmeans(Z, 5, np.random.default_rng(0))'],
    ['def siluet(X, g):', 'ortalama siluet skoru (gürültü hariç)', 'mean silhouette score (noise excluded)'],
    ['    X, g = X[g >= 0], g[g >= 0]'],
    ['    L = np.unique(g)'],
    ['    if len(L) < 2: return 0.0'],
    ['    D = np.sqrt(((X[:, None] - X) ** 2).sum(2))'],
    ['    ort = np.stack([D[:, g == l].sum(1) / np.maximum(1, (g == l).sum() - (g == l)) for l in L], 1)', 'her kümeye ortalama uzaklık', 'mean distance to every cluster'],
    ['    a = ort[np.arange(len(g)), np.searchsorted(L, g)]', 'kendi kümesi', 'own cluster'],
    ['    b = np.where(L[None] == g[:, None], np.inf, ort).min(1)', 'en yakın diğer küme', 'nearest other cluster'],
    ['    return float(np.mean((b - a) / np.maximum(a, b)))'],
    ['history = {\'eps\': [], \'clusters\': [], \'noise_share\': [], \'silhouette\': []}', 'geçmiş: eps taraması', 'history: eps sweep'],
    ['for e in (0.2, 0.3, 0.35, 0.4, 0.5, 0.6):'],
    ['    g = dbscan(P, eps=e)'],
    ['    history[\'eps\'].append(e); history[\'clusters\'].append(int(g.max() + 1))'],
    ['    history[\'noise_share\'].append(float((g < 0).mean())); history[\'silhouette\'].append(siluet(P, g))'],
    ['for row in zip(*history.values()): print(\'  \'.join(f\'{k}={v:.3f}\' for k, v in zip(history, row)))', 'tablo', 'table'],
    ['import csv'],
    ['with open(\'egitim_gecmisi.csv\', \'w\', newline=\'\') as f:', 'geçmişi CSV\'ye yaz', 'write the history to CSV'],
    ['    csv.writer(f).writerows([list(history), *zip(*history.values())])'],
    ['try:'],
    ['    import matplotlib.pyplot as plt', 'varsa grafik çiz', 'plot if available'],
    ['    fig, (a1, a2) = plt.subplots(1, 2, figsize=(9, 3.5))'],
    ['    a1.plot(history[\'eps\'], history[\'clusters\'], \'o-\'); a1.set_xlabel(\'eps\'); a1.set_ylabel(\'clusters\')'],
    ['    a2.scatter(P[:, 0], P[:, 1], c=etiket, s=4, cmap=\'tab10\'); a2.set_aspect(\'equal\')', 'kümeler (üstten görünüş)', 'clusters (top view)'],
    ['    plt.show()'],
    ['except ImportError:'],
    ['    print(\'matplotlib yok: grafik atlandı\')'],
  ],
  params: [
    { key: 'algo', label: { tr: 'Algoritma: 0 k-ortalamalar, 1 DBSCAN', en: 'Algorithm: 0 k-means, 1 DBSCAN' }, min: 0, max: 1, step: 1, value: 1 },
    { key: 'eps', label: { tr: 'DBSCAN yarıçapı eps (m)', en: 'DBSCAN radius eps (m)' }, min: 0.1, max: 1, step: 0.05, value: 0.35 },
    { key: 'k', label: { tr: 'k-ortalamalar küme sayısı k', en: 'k-means number of clusters k' }, min: 2, max: 8, step: 1, value: 5 },
    { key: 'pca', label: { tr: 'PCA: 0 kapalı (3B), 1 açık (2B)', en: 'PCA: 0 off (3D), 1 on (2D)' }, min: 0, max: 1, step: 1, value: 0 },
    { key: 'seed', label: { tr: 'Tohum', en: 'Seed' }, min: 1, max: 20, step: 1, value: 7 },
  ],
  perFrame: 2,
  create(p) { return createRun(p) },
}

/** Bir koşu: tarama → zemin → (PCA) → kümeleme; her iş birimi küçük bir parça. */
export function createRun(p: Record<string, number>): ProjectRun<View> {
  const seed = Math.round(p.seed ?? 7), algo = (p.algo ?? 1) >= 0.5 ? 1 : 0, k = Math.round(p.k ?? 5), eps = p.eps ?? 0.35, usePca = (p.pca ?? 0) >= 0.5
  const cloud = lidarCloud(seed)
  const idx = aboveFloor(cloud)
  const pc = pca3(cloud.pos, idx)
  const flatPos = new Float32Array(cloud.pos)
  for (let i = 0; i < cloud.n; i++) {
    const d = [0, 1, 2].map((a) => cloud.pos[i * 3 + a] - pc.mu[a])
    const c0 = d[0] * pc.vecs[0][0] + d[1] * pc.vecs[0][1] + d[2] * pc.vecs[0][2], c1 = d[0] * pc.vecs[1][0] + d[1] * pc.vecs[1][1] + d[2] * pc.vecs[1][2]
    for (let a = 0; a < 3; a++) flatPos[i * 3 + a] = pc.mu[a] + c0 * pc.vecs[0][a] + c1 * pc.vecs[1][a]
  }
  const label = new Int16Array(cloud.n).fill(-2)
  const view: View = { cloud, flatPos, revealed: 0, beam: -Math.PI, floorFade: 0, flat: 0, phase: 'scan', algo, label, centroids: null, probe: -1, pca: usePca ? pc : null, version: 0 }
  const { X, D } = features(cloud.pos, idx, usePca ? pc : null)
  const m = idx.length
  const truthSub = Int8Array.from(idx.map((i) => cloud.truth[i]))
  const g = new Int16Array(m).fill(-1)
  const r = rng(seed * 101 + 3)
  let C: Float64Array | null = null
  let rounds = 0, wait = 0
  const inertia: number[] = [], changedHist: number[] = []
  const dbSteps: number[] = [], dbClusters: number[] = []
  // DBSCAN durumu
  let N: number[][] | null = null, cur = 0, kk = 0, queue: number[] = [], processed = 0
  const progress: number[] = []
  const perReveal = Math.ceil(cloud.n / 120)
  const sync = () => {
    idx.forEach((i, s) => { label[i] = g[s] })
    if (C) {
      const cen = new Float32Array(k * 3)
      for (let j = 0; j < k; j++) for (let a = 0; a < 3; a++) cen[j * 3 + a] = usePca ? pc.mu[a] + C[j * 2] * pc.vecs[0][a] + C[j * 2 + 1] * pc.vecs[1][a] : C[j * 3 + a]
      view.centroids = cen
    }
    view.version++
  }
  const unit = () => {
    if (view.phase === 'scan') {
      view.revealed = Math.min(cloud.n, view.revealed + perReveal)
      const j = view.revealed - 1
      view.beam = Math.atan2(cloud.pos[j * 3 + 1], cloud.pos[j * 3])
      if (view.revealed >= cloud.n) view.phase = 'floor'
    } else if (view.phase === 'floor') {
      view.floorFade = Math.min(1, view.floorFade + 1 / 30)
      if (view.floorFade >= 1) { idx.forEach((i) => { label[i] = -1 }); view.version++; view.phase = usePca ? 'pca' : 'cluster' }
    } else if (view.phase === 'pca') {
      view.flat = Math.min(1, view.flat + 1 / 40)
      if (view.flat >= 1) view.phase = 'cluster'
    } else if (view.phase === 'cluster') {
      if (algo === 0) {
        if (!C) { C = bestStart(X, D, k, r, 10); sync(); return }
        if (++wait < 8) return
        wait = 0
        const { changed, s } = lloydRound(X, D, C, g)
        rounds++; inertia.push(s); changedHist.push(changed); sync()
        if (changed === 0 || rounds >= 60) view.phase = 'done'
      } else {
        if (!N) { N = neighbours3(X, D, eps); return }
        for (let t = 0; t < 3; t++) {
          if (!queue.length) {
            while (cur < m && (g[cur] !== -1 || N[cur].length < MIN_PTS)) cur++
            if (cur >= m) { view.probe = -1; view.phase = 'done'; sync(); return }
            g[cur] = kk++; queue = [cur]
          }
          const j = queue.pop()!
          processed++
          view.probe = idx[j]
          if (N[j].length >= MIN_PTS) for (const q of N[j]) if (g[q] === -1) { g[q] = g[j]; queue.push(q) }
        }
        progress.push(g.reduce((s, v) => s + (v >= 0 ? 1 : 0), 0) / m)
        dbSteps.push(processed); dbClusters.push(kk)
        sync()
      }
    }
  }
  const ev = () => evaluate(truthSub, g)
  // eğitim paneli: sürüme göre önbellek; siluet ve tarama (k / eps) yalnız bitince bir kez hesaplanır
  let rep: { v: string; r: EgitimRaporu } | null = null
  let sil = NaN, sweep: Grafik[] | null = null
  const sub = Array.from({ length: m }, (_, i) => i).filter((i) => i % Math.max(1, Math.ceil(m / 400)) === 0)
  const subX = sub.map((i) => Array.from(X.subarray(i * D, i * D + D)))
  const silOf = (lab: ArrayLike<number>) => silhouette(subX, sub.map((i) => lab[i]))
  const makeSweep = (): Grafik[] => {
    if (algo === 0) {
      const ks = [2, 3, 4, 5, 6, 7, 8], ine: number[] = [], sl: number[] = []
      const rr = rng(seed * 101 + 77)
      for (const kq of ks) {
        const Cq = bestStart(X, D, kq, rr, 3), gq = new Int16Array(m).fill(-1)
        let sq = 0
        for (let i = 0; i < 100; i++) { const o = lloydRound(X, D, Cq, gq); sq = o.s; if (!o.changed) break }
        ine.push(sq); sl.push(silOf(gq))
      }
      return [
        { kind: 'line', id: 'elbow', title: B('Dirsek eğrisi: k’ya göre toplam kare uzaklık', 'Elbow curve: total squared distance by k'), x: ks, xLabel: B('k', 'k'), yLabel: B('kare uzaklık', 'squared distance'), series: [{ key: 'inertia', label: B('toplam kare uzaklık', 'inertia'), values: ine, tone: 1 }], marker: { x: k, label: B(`seçilen k = ${k}`, `chosen k = ${k}`) } },
        { kind: 'line', id: 'silhouette-k', title: B('Siluet skoru (k’ya göre)', 'Silhouette score by k'), x: ks, xLabel: B('k', 'k'), yMin: -0.2, yMax: 1, series: [{ key: 'silhouette', label: B('siluet', 'silhouette'), values: sl, tone: 3 }], marker: { x: k, label: B(`k = ${k}`, `k = ${k}`) } },
      ]
    }
    const es = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0], cl: number[] = [], nz: number[] = [], rc: number[] = []
    for (const e of es) {
      const lab = dbscan3(X, D, e)
      const q = evaluate(truthSub, lab)
      cl.push(q.K); nz.push(q.noise / m); rc.push(q.recovered)
    }
    return [
      { kind: 'line', id: 'eps-sweep', title: B('eps taraması: küme sayısı ve bulunan nesne', 'eps sweep: clusters and objects found'), x: es, xLabel: B('eps (m)', 'eps (m)'), series: [{ key: 'clusters', label: B('küme', 'clusters'), values: cl, tone: 1 }, { key: 'found', label: B('bulunan nesne', 'objects found'), values: rc, tone: 3 }], marker: { x: eps, label: B(`eps = ${eps}`, `eps = ${eps}`) } },
      { kind: 'line', id: 'eps-noise', title: B('eps taraması: gürültü payı', 'eps sweep: noise share'), x: es, xLabel: B('eps (m)', 'eps (m)'), yMin: 0, yMax: 1, series: [{ key: 'noise', label: B('gürültü', 'noise'), values: nz, tone: 0 }] },
    ]
  }
  const report = (): EgitimRaporu => {
    const key = `${view.phase}:${view.version}`
    if (rep && rep.v === key) return rep.r
    const clustering = view.phase === 'cluster' || view.phase === 'done'
    const e = clustering ? ev() : null
    if (view.phase === 'done') { if (Number.isNaN(sil)) sil = silOf(g); sweep ??= makeSweep() }
    const history: EgitimRaporu['history'] = algo === 0
      ? { x: 'round', cols: { round: inertia.map((_, i) => i + 1), inertia: inertia.slice(), changed: changedHist.slice() } }
      : { x: 'step', cols: { step: dbSteps.slice(), clustered_share: progress.slice(), clusters: dbClusters.slice() } }
    const sizes = e ? Array.from({ length: e.K }, (_, c) => g.reduce((a, v) => a + (v === c ? 1 : 0), 0)).sort((a, b) => b - a) : []
    const r: EgitimRaporu = {
      kind: 'kumeleme', model: `${algo === 0 ? `k-ortalamalar++ (k = ${k})` : `DBSCAN (eps = ${eps} m, min ${MIN_PTS})`}${usePca ? ' · PCA 3→2' : ' · 3B'}`, seed,
      hyper: algo === 0 ? { algo: 'kmeans', k, starts: 10, pca: usePca ? 1 : 0, floor_z: FLOOR_Z } : { algo: 'dbscan', eps, min_pts: MIN_PTS, pca: usePca ? 1 : 0, floor_z: FLOOR_Z },
      history, final: [], charts: [],
    }
    r.final = [
      { key: 'points', label: B('zemin dışı nokta', 'off-floor points'), value: m, fmt: 'int' },
      { key: 'clusters', label: B('küme sayısı', 'clusters'), value: e ? e.K : NaN, fmt: 'int' },
      { key: 'objects_found', label: B('bulunan nesne (/5)', 'objects found (/5)'), value: e ? e.recovered : NaN, fmt: 'int' },
      { key: 'purity', label: B('saflık', 'purity'), value: e ? e.purity : NaN, fmt: 'pct' },
      { key: 'noise_share', label: B('gürültü payı', 'noise share'), value: e ? e.noise / m : NaN, fmt: 'pct' },
      { key: 'silhouette', label: B('siluet skoru', 'silhouette score'), value: sil, fmt: 3 },
      { key: 'pca_var_2', label: B('PC1 + PC2 varyansı', 'PC1 + PC2 variance'), value: pc.explained[0] + pc.explained[1], fmt: 'pct' },
    ]
    if (algo === 0 && inertia.length) r.final.push({ key: 'inertia', label: B('toplam kare uzaklık', 'inertia'), value: inertia[inertia.length - 1], fmt: 2 })
    r.charts = algo === 0
      ? [gecmisGrafik(r, 'inertia', B('Lloyd turu başına toplam kare uzaklık', 'Total squared distance per Lloyd round'), [['inertia', B('toplam kare uzaklık', 'inertia'), 1]], { xLabel: B('tur', 'round'), live: false }),
        gecmisGrafik(r, 'changed', B('Grubu değişen nokta sayısı', 'Points that changed group'), [['changed', B('değişen', 'changed'), 5]], { xLabel: B('tur', 'round'), yMin: 0, live: false })]
      : [gecmisGrafik(r, 'grow', B('DBSCAN: kümeye katılan nokta payı', 'DBSCAN: share of points in a cluster'), [['clustered_share', B('kümede', 'clustered'), 1]], { xLabel: B('işlenen nokta', 'points processed'), yMin: 0, yMax: 1, live: false }),
        gecmisGrafik(r, 'nclusters', B('DBSCAN: küme sayısı', 'DBSCAN: number of clusters'), [['clusters', B('küme', 'clusters'), 3]], { xLabel: B('işlenen nokta', 'points processed'), yMin: 0, live: false })]
    r.charts.push({ kind: 'bar', id: 'scree', title: B('PCA: açıklanan varyans (scree)', 'PCA: explained variance (scree)'), labels: ['PC1', 'PC2', 'PC3'], yMin: 0, yMax: 1, series: [{ key: 'explained', label: B('varyans payı', 'variance share'), values: pc.explained.slice(), tone: 4 }] })
    if (e) {
      r.charts.push({ kind: 'bar', id: 'sizes', title: B('Küme büyüklükleri (nokta)', 'Cluster sizes (points)'), labels: sizes.map((_, i) => `#${i + 1}`), series: [{ key: 'size', label: B('nokta', 'points'), values: sizes, tone: 1 }] })
      const order: number[] = []
      e.match.forEach((c) => { if (c >= 0 && !order.includes(c)) order.push(c) })
      for (let c = 0; c < e.K && order.length < 8; c++) if (!order.includes(c)) order.push(c)
      const rest = Array.from({ length: e.K }, (_, c) => c).filter((c) => !order.includes(c))
      const rowOf = (row: number[]) => [...order.map((c) => row[c]), ...(rest.length ? [rest.reduce((a, c) => a + row[c], 0)] : []), row[e.K]]
      r.charts.push({
        kind: 'heat', id: 'object-cluster', title: B('Gerçek nesne × bulunan küme', 'True object × found cluster'),
        rows: [...OBJECTS.map((o) => o.name[0]), 'sahte yansıma'], cols: [...order.map((c) => `K${c + 1}`), ...(rest.length ? ['diğer'] : []), 'gürültü'],
        values: e.M.map(rowOf), rowLabel: B('nesne', 'object'), colLabel: B('küme', 'cluster'), showValues: true,
      })
    }
    if (sweep) r.charts.push(...sweep)
    rep = { v: key, r }
    return r
  }
  return {
    report,
    view,
    step(n) { for (let i = 0; i < n && view.phase !== 'done'; i++) unit() },
    done: () => view.phase === 'done',
    status() {
      switch (view.phase) {
        case 'scan': return cap(`tarama: ${view.revealed} / ${cloud.n} nokta`, `scan: ${view.revealed} / ${cloud.n} points`)
        case 'floor': return cap(`zemin ayıklanıyor: ${cloud.n - m} nokta ${fmt(FLOOR_Z, 2, 'tr')} m altında`, `removing the floor: ${cloud.n - m} points below ${FLOOR_Z.toFixed(2)} m`)
        case 'pca': return cap(`PCA: bulut ilk iki bileşene yassılıyor (%${Math.round((pc.explained[0] + pc.explained[1]) * 100)} varyans)`, `PCA: the cloud flattens onto the first two components (${Math.round((pc.explained[0] + pc.explained[1]) * 100)}% variance)`)
        case 'cluster': return algo === 0 ? cap(`k-ortalamalar · tur ${rounds}`, `k-means · round ${rounds}`) : cap(`DBSCAN · küme ${kk} genişliyor · ${processed} / ${m} nokta`, `DBSCAN · growing cluster ${kk} · ${processed} / ${m} points`)
        default: { const e = ev(); return cap(`bitti: ${e.recovered} / ${N_OBJ} nesne bulundu · ${e.K} küme`, `done: ${e.recovered} / ${N_OBJ} objects found · ${e.K} clusters`) }
      }
    },
    metrics() {
      const clustering = view.phase === 'cluster' || view.phase === 'done'
      const e = clustering ? ev() : null
      const out: Metric[] = [
        { label: { tr: 'Nokta', en: 'Points' }, value: cap(`${view.revealed} · zemin dışı ${m}`, `${view.revealed} · off floor ${m}`) },
        { label: { tr: 'Bulunan nesne', en: 'Objects found' }, value: e ? cap(`${e.recovered} / ${N_OBJ}`, `${e.recovered} / ${N_OBJ}`) : cap('—', '—'), tone: e && view.phase === 'done' ? (e.recovered === N_OBJ ? 'good' : 'bad') : undefined },
        { label: { tr: 'Küme sayısı', en: 'Clusters' }, value: e ? cap(String(e.K), String(e.K)) : cap('—', '—') },
        { label: { tr: 'Saflık', en: 'Purity' }, value: e ? cap(`%${fmt(e.purity * 100, 1, 'tr')}`, `${(e.purity * 100).toFixed(1)}%`) : cap('—', '—') },
      ]
      if (algo === 1) out.push({ label: { tr: 'Gürültü noktası', en: 'Noise points' }, value: e ? cap(String(e.noise), String(e.noise)) : cap('—', '—') })
      else out.push({ label: { tr: 'Lloyd turu', en: 'Lloyd rounds' }, value: cap(String(rounds), String(rounds)) })
      if (usePca) out.push({ label: { tr: 'PC1 + PC2 varyansı', en: 'PC1 + PC2 variance' }, value: cap(`%${fmt((pc.explained[0] + pc.explained[1]) * 100, 1, 'tr')}`, `${((pc.explained[0] + pc.explained[1]) * 100).toFixed(1)}%`) })
      return out
    },
    curves(): Curve[] {
      return algo === 0
        ? [{ label: { tr: 'Toplam kare uzaklık (tur başına)', en: 'Total squared distance (per round)' }, values: inertia }]
        : [{ label: { tr: 'Kümeye katılan nokta payı', en: 'Share of points in a cluster' }, values: progress }]
    },
    table(): Table | null {
      if (view.phase !== 'cluster' && view.phase !== 'done') return null
      const e = ev()
      // sütunlar: nesnelerle eşleşen kümeler nesne sırasıyla, sonra diğer kümeler (en fazla 8 sütun), en sonda gürültü
      const order: number[] = []
      e.match.forEach((c) => { if (c >= 0 && !order.includes(c)) order.push(c) })
      for (let c = 0; c < e.K && order.length < 8; c++) if (!order.includes(c)) order.push(c)
      const rest = Array.from({ length: e.K }, (_, c) => c).filter((c) => !order.includes(c))
      const cols: Cap[] = order.map((c) => [`K${c + 1}`, `C${c + 1}`])
      if (rest.length) cols.push(['diğer', 'other'])
      cols.push(LABEL_NAMES)
      const rowOf = (row: number[]) => [...order.map((c) => row[c]), ...(rest.length ? [rest.reduce((s, c) => s + row[c], 0)] : []), row[e.K]]
      const rows = [...OBJECTS.map((o, j) => ({ label: o.name, cells: rowOf(e.M[j]) })), { label: ['sahte yansıma', 'false reflection'] as Cap, cells: rowOf(e.M[N_OBJ]) }]
      return { title: { tr: 'Gerçek nesne (satır) × bulunan küme (sütun)', en: 'True object (row) × found cluster (column)' }, cols, rows, diag: true }
    },
  }
}

/** Testler ve "Kendin dene" doğrulaması için: koşuyu sonuna kadar çalıştırıp değerlendirmeyi döndürür. */
export function runToEnd(p: Record<string, number>) {
  const run = createRun(p)
  for (let i = 0; i < 100000 && !run.done(); i++) run.step(50)
  const v = run.view
  const idx = aboveFloor(v.cloud)
  return { run, ev: evaluate(idx.map((i) => v.cloud.truth[i]), idx.map((i) => v.label[i])) }
}

export const OBJECT_NAMES: Bi[] = OBJECTS.map((o) => ({ tr: o.name[0], en: o.name[1] }))
