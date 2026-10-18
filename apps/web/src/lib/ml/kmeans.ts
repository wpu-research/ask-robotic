// Ders 6: k-means kümeleme. Robot süpürgenin LiDAR'ı odada 600 nokta görür (250 duvar, 200 kanepe, 150 masa); hangi noktanın
// hangi nesneye ait olduğunu bilmez. Kod satır satır NumPy sürümüyle aynı adımları izler; on rastgele başlangıçtan en sıkısı kalır.
import { cap, choice, d2, gauss, rng, type Frame, type Lesson, type Pt } from './core'
import { B, type EgitimRaporu } from './egitim/rapor'
import { bestIndex, silhouette } from './egitim/metrics'

export interface KMeansFrame extends Frame {
  pts: Pt[]
  k: number
  /** Merkezler (yoksa henüz seçilmedi). */
  C: Array<[number, number]>
  /** Her noktanın grubu (null: henüz atanmadı). */
  g: number[] | null
  /** Bu denemede merkezlerin izlediği yol. */
  paths: Array<Array<[number, number]>>
  tryN: number
  round: number
  /** Bu denemenin toplam kare uzaklığı ve şimdiye kadarki en iyisi. */
  s?: number
  best?: number
  bestTry?: number
  /** Uzaklık çizgileri gösterilecek örnek nokta. */
  probe?: number
  /** Grup büyüklükleri (sonuç). */
  sizes?: number[]
  /** Denemeler özeti: [toplam kare uzaklık, grup büyüklükleri]. */
  tries?: Array<{ s: number; sizes: number[]; ok: boolean }>
}

/** 600 noktalık LiDAR taraması (metre): duvar (uzun şerit), kanepe (yuvarlak öbek), masa ayakları (küçük öbek). */
export function lidarScan(seed = 7): Pt[] {
  const r = rng(seed)
  const pts: Pt[] = []
  for (let i = 0; i < 250; i++) { const t = r(); pts.push({ x: 3.0 + 4.2 * t + 0.08 * gauss(r), y: 5.2 - 0.2 * t + 0.1 * gauss(r), c: 0 }) } // duvar
  for (let i = 0; i < 200; i++) pts.push({ x: 1.9 + 0.55 * gauss(r), y: 1.7 + 0.4 * gauss(r), c: 1 }) // kanepe
  for (let i = 0; i < 150; i++) pts.push({ x: 8.0 + 0.42 * gauss(r), y: 1.9 + 0.42 * gauss(r), c: 2 }) // masa
  return pts
}

const close = (a: Array<[number, number]>, b: Array<[number, number]>): boolean => a.every((p, j) => Math.abs(p[0] - b[j][0]) < 1e-9 && Math.abs(p[1] - b[j][1]) < 1e-9)

/** Tek deneme: Lloyd yinelemesi. Her turda [atama, merkezler] kaydı. */
export function lloyd(pts: Pt[], C0: Array<[number, number]>, maxRounds = 50) {
  let C = C0.map((c) => [...c] as [number, number])
  const rounds: Array<{ g: number[]; C: Array<[number, number]> }> = []
  let g: number[] = []
  for (let it = 0; it < maxRounds; it++) {
    const old = C
    g = pts.map((p) => { let bj = 0, bd = Infinity; C.forEach((c, j) => { const d = d2(p.x, p.y, c[0], c[1]); if (d < bd) { bd = d; bj = j } }); return bj })
    C = C.map((c, j) => {
      let sx = 0, sy = 0, n = 0
      pts.forEach((p, i) => { if (g[i] === j) { sx += p.x; sy += p.y; n++ } })
      return n ? [sx / n, sy / n] as [number, number] : c // boş grup: merkez yerinde kalır
    })
    rounds.push({ g, C })
    if (close(C, old)) break
  }
  const s = pts.reduce((acc, p, i) => acc + d2(p.x, p.y, C[g[i]][0], C[g[i]][1]), 0)
  return { rounds, C, g, s }
}

export const sizesOf = (g: number[], k: number): number[] => Array.from({ length: k }, (_, j) => g.filter((x) => x === j).length)

/** k grupla dersteki on deneme (aynı tohum, aynı sıra): en iyi deneme ve hepsinin turları. */
export function tenTries(pts: Pt[], k: number, seed: number) {
  const r = rng(seed)
  return Array.from({ length: 10 }, () => {
    const C0 = choice(r, pts.length, k).map((i) => [pts[i].x, pts[i].y] as [number, number])
    return { C0, ...lloyd(pts, C0) }
  })
}

/**
 * Eğitim paneli: dirsek (k = 1…8, her k için dersteki on deneme, en iyi inertia) ve siluet; seçilen k için denemelerin tur tur
 * inertia'sı, grup büyüklükleri ve gerçek nesnelerle karşılaştırma (veride nesne etiketi var, algoritma görmez).
 */
export function kmeansReport({ k = 3, seed = 17 }: Record<string, number>): EgitimRaporu {
  const pts = lidarScan()
  const X = pts.map((p) => [p.x, p.y])
  const h = { k: [] as number[], inertia: [] as number[], silhouette: [] as number[] }
  let runs: ReturnType<typeof tenTries> = []
  for (let kk = 1; kk <= 8; kk++) {
    const rs = tenTries(pts, kk, seed)
    const best = rs.reduce((a, b) => (b.s < a.s ? b : a))
    h.k.push(kk); h.inertia.push(best.s); h.silhouette.push(kk > 1 ? silhouette(X, best.g) : 0)
    if (kk === k) runs = rs
  }
  if (!runs.length) runs = tenTries(pts, k, seed)
  const best = runs.reduce((a, b) => (b.s < a.s ? b : a))
  const bi = runs.indexOf(best)
  const sizes = sizesOf(best.g, k)
  const names = ['duvar', 'kanepe', 'masa']
  const cont = Array.from({ length: k }, (_, j) => [0, 1, 2].map((c) => pts.filter((p, i) => best.g[i] === j && p.c === c).length))
  const purity = cont.reduce((a, row) => a + Math.max(...row), 0) / pts.length
  const sil = silhouette(X, best.g)
  const conv = runs.map((rn, t) => ({
    key: `try${t + 1}`, label: B(`deneme ${t + 1}`, `try ${t + 1}`), tone: t === bi ? 3 : t % 6 === 3 ? 4 : t % 6,
    x: rn.rounds.map((_, i) => i + 1), values: rn.rounds.map((rd) => pts.reduce((a, p, i) => a + d2(p.x, p.y, rd.C[rd.g[i]][0], rd.C[rd.g[i]][1]), 0)),
  }))
  const r: EgitimRaporu = {
    kind: 'kumeleme', model: B(`k-means (k = ${k}, 10 başlangıç)`, `k-means (k = ${k}, 10 starts)`), seed, hyper: { k, starts: 10, points: pts.length },
    history: { x: 'k', cols: h }, final: [], charts: [],
  }
  r.final = [
    { key: 'inertia', label: B('inertia (Σ d²)', 'inertia (Σ d²)'), value: best.s, fmt: 1 },
    { key: 'silhouette', label: B('siluet skoru', 'silhouette score'), value: sil, fmt: 3 },
    { key: 'rounds', label: B('en iyi denemenin turu', 'rounds of the best try'), value: best.rounds.length, fmt: 'int' },
    { key: 'best_try', label: B('en iyi deneme', 'best try'), value: bi + 1, fmt: 'int' },
    { key: 'purity', label: B('saflık (gerçek nesnelerle)', 'purity (vs true objects)'), value: purity, fmt: 'pct' },
    { key: 'best_k_silhouette', label: B('siluete göre en iyi k', 'best k by silhouette'), value: h.k[bestIndex(h.silhouette, 'max')], fmt: 'int' },
  ]
  r.charts = [
    { kind: 'line', id: 'elbow', title: B('Dirsek eğrisi: inertia – k', 'Elbow curve: inertia vs k'), x: h.k, xLabel: B('k (grup sayısı)', 'k (number of groups)'), yLabel: B('inertia', 'inertia'), series: [{ key: 'inertia', label: B('inertia', 'inertia'), values: h.inertia, tone: 1 }], marker: { x: k, label: B(`seçilen k = ${k}`, `chosen k = ${k}`) }, note: B('Eğrinin büküldüğü (dirsek) yerden sonra k artırmak az kazandırır.', 'Past the bend (the elbow), raising k gains little.') },
    { kind: 'line', id: 'silhouette', title: B('Siluet skoru – k', 'Silhouette score vs k'), x: h.k.slice(1), xLabel: B('k', 'k'), yLabel: B('siluet', 'silhouette'), series: [{ key: 'silhouette', label: B('siluet', 'silhouette'), values: h.silhouette.slice(1), tone: 3 }], marker: { x: k, label: B(`k = ${k}`, `k = ${k}`) } },
    { kind: 'line', id: 'convergence', title: B(`Yakınsama: on denemenin tur tur inertia'sı (k = ${k})`, `Convergence: inertia per round for the ten tries (k = ${k})`), x: [], xLabel: B('tur', 'round'), yLabel: B('inertia', 'inertia'), series: conv, note: B(`Yeşil: en iyi deneme (${bi + 1}). Yüksekte kalanlar kötü başlangıca takıldı.`, `Green: the best try (${bi + 1}). Those staying high got stuck after a bad start.`) },
    { kind: 'bar', id: 'tries', title: B('Denemelerin son inertia\'sı', 'Final inertia per try'), labels: runs.map((_, t) => String(t + 1)), series: [{ key: 'inertia', label: B('inertia', 'inertia'), values: runs.map((x) => x.s), tone: 1 }] },
    { kind: 'bar', id: 'sizes', title: B('Grup büyüklükleri', 'Cluster sizes'), labels: sizes.map((_, j) => `${j + 1}`), series: [{ key: 'n', label: B('nokta', 'points'), values: sizes, tone: 2 }] },
    { kind: 'heat', id: 'contingency', title: B('Gruplar – gerçek nesneler', 'Clusters vs true objects'), rows: sizes.map((_, j) => `grup ${j + 1}`), cols: names, values: cont, showValues: true, rowLabel: B('grup', 'cluster'), colLabel: B('nesne', 'object'), note: B('Algoritma etiketleri görmez; bu tablo yalnız sonucu denetler.', 'The algorithm never sees the labels; this table only checks the result.') },
  ]
  return r
}

const TR_TRY = (t: number, r: number) => r ? `deneme ${t} · tur ${r}` : `deneme ${t}`
const EN_TRY = (t: number, r: number) => r ? `try ${t} · round ${r}` : `try ${t}`

export const KMEANS: Lesson<KMeansFrame> = {
  slug: 'k-means',
  n: 6,
  title: { tr: 'k-means: etiketsiz gruplar', en: 'k-means: groups without labels' },
  sub: { tr: 'LiDAR noktalarını nesnelere ayırmak, tek bir cevap verilmeden', en: 'Splitting LiDAR points into objects without a single answer' },
  story: {
    tr: "Robot süpürgenin LiDAR'ı odayı taradı ve 600 nokta gördü: 250'si duvarda, 200'ü kanepede, 150'si masa ayaklarında. Program hangi noktanın hangi nesneye ait olduğunu hiç görmez; yalnız kaç grup arayacağını bilir: k = 3.",
    en: "The robot vacuum's LiDAR scanned the room and saw 600 points: 250 on the wall, 200 on the sofa, 150 on the table legs. The program never sees which point belongs to which object; it only knows how many groups to look for: k = 3.",
  },
  how: [
    { tr: 'Her deneme rastgele üç noktayı merkez seçerek başlar.', en: 'Each try starts by picking three random points as centers.' },
    { tr: 'Her nokta en yakın merkeze katılır.', en: 'Every point joins its nearest center.' },
    { tr: 'Her merkez, kendi noktalarının ortalamasına taşınır. Hiçbir merkez kıpırdamayana kadar tekrar.', en: 'Every center moves to the mean of its points. Repeat until no center moves.' },
    { tr: 'Bazı denemeler kötü bir başlangıçta takılır. Bu yüzden on deneme yapılır, toplam kare uzaklığı en küçük olan kalır.', en: 'Some tries get stuck after a bad start, so the program makes ten tries and keeps the one with the smallest total squared distance.' },
    { tr: 'Şunu dene: k’yı 2 yap. İki grup tek gruba birleşir (200 · 400 nokta). Sonra 5 yap: büyük gruplar ikiye bölünür. k-ortalamalar grup sayısını kendisi bulamaz, onu sen verirsin; doğru k’yı seçmek için grafiğe bakmak ya da farklı k’ları karşılaştırmak gerekir.', en: 'Try this: set k to 2. Two groups merge into one (200 · 400 points). Then set it to 5: the big groups split in two. k-means cannot find the number of groups by itself, you give it; choosing the right k means looking at the plot or comparing different values of k.' },
  ],
  why: {
    tr: "Cevap gerektirmez: kimsenin etiketlemediği verideki grupları bulur. Robotikte LiDAR ve derinlik kamerası noktalarını engellere ayırmakta, renk kümelemede ve harita sıkıştırmada kullanılır. Vektör arama kütüphanesi FAISS da devasa koleksiyonları k-means ile gruplara böler; arama yalnız en yakın birkaç gruba bakar.",
    en: 'It needs no answers, so it finds groups in data nobody has labeled. In robotics it splits LiDAR and depth-camera points into obstacles, clusters colors and compresses maps. The vector search library FAISS also uses k-means to split huge collections into groups, so a search only checks the nearest few.',
  },
  file: 'kmeans.py',
  code: [
    ['import numpy as np'],
    ['X = np.genfromtxt(\'lidar-2b.csv\', delimiter=\',\', skip_header=1)', '600 nokta (x, y), metre', '600 points (x, y), metres'],
    ['k = 3', 'bulunacak grup sayısı', 'number of groups'],
    ['rng = np.random.default_rng(17)'],
    ['best = np.inf', 'henüz deneme yok', 'no try yet'],
    ['for start in range(10):', 'on rastgele başlangıç', 'ten random starts'],
    ['    C = X[rng.choice(len(X), k, replace=False)]', 'üç nokta merkez olur', 'three points become centers'],
    ['    while True:'],
    ['        old = C.copy()', 'merkezleri hatırla', 'remember centers'],
    ['        d = ((X[:, None] - C) ** 2).sum(2)', 'her merkeze uzaklık²', 'squared distance to each center'],
    ['        g = d.argmin(1)', 'en yakın merkez kazanır', 'nearest center wins'],
    ['        C = np.array([X[g == j].mean(0) for j in range(k)])', 'ortalamaya taşı', 'move to the mean'],
    ['        if np.allclose(C, old): break', 'kimse kıpırdamadı', 'nobody moved'],
    ['    s = d.min(1).sum()', 'toplam kare uzaklık', 'total squared distance'],
    ['    if s < best: best, keep = s, g', 'en sıkısını sakla', 'keep the tightest'],
    ['print(np.bincount(keep))', 'grup başına nokta', 'points per group'],
    ['history = {\'k\': [], \'inertia\': [], \'silhouette\': []}', 'dirsek: k = 1…8 için aynı on deneme', 'elbow: the same ten tries for k = 1…8'],
    ['D = np.sqrt(((X[:, None] - X) ** 2).sum(2))', '600 × 600 uzaklık (siluet için)', '600 × 600 distances (for silhouette)'],
    ['for kk in range(1, 9):'],
    ['    rng, bs = np.random.default_rng(17), np.inf'],
    ['    for start in range(10):'],
    ['        C = X[rng.choice(len(X), kk, replace=False)]'],
    ['        while True:'],
    ['            old, g = C.copy(), ((X[:, None] - C) ** 2).sum(2).argmin(1)'],
    ['            C = np.array([X[g == j].mean(0) if (g == j).any() else C[j] for j in range(kk)])', 'boş grup yerinde kalır', 'an empty group stays put'],
    ['            if np.allclose(C, old): break'],
    ['        s = ((X - C[g]) ** 2).sum()', 'inertia: grup içi kare uzaklık', 'inertia: within-group squared distance'],
    ['        if s < bs: bs, bg = s, g'],
    ['    M = np.eye(kk)[bg]; n = M.sum(0); S = D @ M', 'her noktadan her gruba toplam uzaklık', 'total distance from each point to each group'],
    ['    a = (S * M).sum(1) / np.maximum(n[bg] - 1, 1)', 'kendi grubuna ortalama uzaklık', 'mean distance to its own group'],
    ['    b = np.where((M > 0) | (n == 0), np.inf, S / np.maximum(n, 1)).min(1)', 'en yakın diğer gruba', 'to the nearest other group'],
    ['    sil = ((b - a) / np.maximum(a, b))[n[bg] > 1].sum() / len(X) if kk > 1 else 0.0', 'siluet skoru (−1…1)', 'silhouette score (−1…1)'],
    ['    for key, v in zip(history, (kk, bs, sil)): history[key].append(float(v))'],
    ['    print(f\'k={kk}  inertia={bs:9.1f}  siluet={sil:.3f}\')', 'son ölçümler tablosu', 'final metrics table'],
    ['import csv'],
    ['with open(\'egitim_gecmisi.csv\', \'w\', newline=\'\') as f:', 'geçmişi CSV\'ye yaz', 'write the history to CSV'],
    ['    csv.writer(f).writerows([list(history), *zip(*history.values())])', 'satır başına bir k', 'one row per k'],
    ['try:'],
    ['    import matplotlib.pyplot as plt', 'varsa grafik çiz', 'plot if available'],
    ['    fig, (a1, a2) = plt.subplots(1, 2, figsize=(9, 3.5))'],
    ['    a1.plot(history[\'k\'], history[\'inertia\'], \'o-\'); a1.set_title(\'elbow\'); a2.plot(history[\'k\'], history[\'silhouette\'], \'o-\')'],
    ['    a2.set_title(\'silhouette\'); plt.show()'],
    ['except ImportError:'],
    ['    print(\'matplotlib yok: grafik atlandı\')'],
  ],
  params: [
    { key: 'k', label: { tr: 'Grup sayısı k', en: 'Number of groups k' }, min: 2, max: 6, step: 1, value: 3 },
    { key: 'seed', label: { tr: 'Tohum', en: 'Seed' }, min: 1, max: 99, step: 1, value: 17 },
  ],
  report: kmeansReport,
  run({ k = 3, seed = 17 }) {
    const pts = lidarScan()
    const r = rng(seed)
    const F: KMeansFrame[] = []
    const base = { pts, k, paths: [] as Array<Array<[number, number]>>, tryN: 0, round: 0 }
    const stat = cap(`${pts.length} nokta · k = ${k}`, `${pts.length} points · k = ${k}`)
    F.push({ ...base, C: [], g: null, line: 1, cap: cap('cevap verilmedi', 'no answers given'), stat, hold: 2 })
    F.push({ ...base, C: [], g: null, line: 2, cap: cap(`k = ${k} grup`, `k = ${k} groups`), stat: cap('söylediğimiz tek şey', 'the only thing we say'), hold: 1.5 })
    // önce tüm denemeleri çalıştır: hangilerini ayrıntılı göstereceğimizi seçmek için
    const runs = Array.from({ length: 10 }, () => {
      const C0 = choice(r, pts.length, k).map((i) => [pts[i].x, pts[i].y] as [number, number])
      return { C0, ...lloyd(pts, C0) }
    })
    const bestS = Math.min(...runs.map((x) => x.s))
    const stuck = runs.findIndex((x) => x.s > bestS * 1.3)
    const detailed = new Set([0, stuck, runs.findIndex((x) => x.s === bestS)].filter((i) => i >= 0))
    let best = Infinity, bestTry = 0
    const tries: Array<{ s: number; sizes: number[]; ok: boolean }> = []
    runs.forEach((run, t) => {
      const T = t + 1
      const paths = run.C0.map((c) => [c])
      const st = { ...base, tryN: T, best: Number.isFinite(best) ? best : undefined, bestTry, tries: [...tries] }
      F.push({ ...st, paths: paths.map((p) => [...p]), C: run.C0, g: null, line: 6, cap: cap(`${TR_TRY(T, 0)} · rastgele başlangıç`, `${EN_TRY(T, 0)} · random start`), stat: cap(`${k} rastgele nokta`, `${k} random points`), hold: detailed.has(t) ? 1.6 : 0.6 })
      if (detailed.has(t)) {
        let prevC = run.C0
        run.rounds.forEach((rd, i) => {
          const R = i + 1
          const sizes = sizesOf(rd.g, k)
          F.push({ ...st, paths: paths.map((p) => [...p]), C: prevC, g: rd.g, round: R, probe: R === 1 ? 37 : undefined, line: 10, cap: cap(`${TR_TRY(T, R)} · gruplandı`, `${EN_TRY(T, R)} · grouped`), stat: cap(sizes.join(' · ') + ' nokta', sizes.join(' · ') + ' points'), hold: R <= 2 ? 1.4 : 0.7 })
          rd.C.forEach((c, j) => paths[j].push(c))
          F.push({ ...st, paths: paths.map((p) => [...p]), C: rd.C, g: rd.g, round: R, line: 11, cap: cap(`${TR_TRY(T, R)} · ortalamaya taşındı`, `${EN_TRY(T, R)} · moved to the mean`), stat: cap('her merkez aynı anda', 'every center at once'), hold: R <= 2 ? 1.2 : 0.6 })
          prevC = rd.C
        })
      }
      const sizes = sizesOf(run.g, k)
      const improved = run.s < best
      if (improved) { best = run.s; bestTry = T }
      const ok = sizes.slice().sort((a, b) => b - a).join() === [250, 200, 150].slice(0, k).join() && k === 3
      tries.push({ s: run.s, sizes, ok })
      F.push({
        ...base, tryN: T, round: run.rounds.length, paths: run.C0.map((c, j) => [c, ...run.rounds.map((rd) => rd.C[j])]), C: run.C, g: run.g, s: run.s, best, bestTry, tries: [...tries], sizes,
        line: improved ? 14 : 13,
        cap: cap(`${TR_TRY(T, 0)} · ${run.rounds.length} turda durdu`, `${EN_TRY(T, 0)} · settled in ${run.rounds.length} rounds`),
        stat: cap(`${sizes.join(' + ')} · Σd² = ${run.s.toFixed(0)}${improved ? ' · en iyi' : ''}`, `${sizes.join(' + ')} · Σd² = ${run.s.toFixed(0)}${improved ? ' · best' : ''}`),
        hold: detailed.has(t) ? 2.2 : 0.9,
      })
    })
    const keep = runs[bestTry - 1]
    const sizes = sizesOf(keep.g, k)
    F.push({
      ...base, tryN: bestTry, round: keep.rounds.length, paths: [], C: keep.C, g: keep.g, s: keep.s, best, bestTry, tries, sizes, line: 15,
      cap: cap(`sonuç: deneme ${bestTry}`, `result: try ${bestTry}`),
      stat: cap(`${sizes.join(' · ')} nokta · ${tries.filter((x) => x.ok).length}/10 doğru`, `${sizes.join(' · ')} points · ${tries.filter((x) => x.ok).length}/10 correct`), hold: 3,
    })
    return F
  },
}
