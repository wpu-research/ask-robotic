// Ders 6: k-means kümeleme. Robot süpürgenin LiDAR'ı odada 600 nokta görür (250 duvar, 200 kanepe, 150 masa); hangi noktanın
// hangi nesneye ait olduğunu bilmez. Kod satır satır NumPy sürümüyle aynı adımları izler; on rastgele başlangıçtan en sıkısı kalır.
import { cap, choice, d2, gauss, rng, type Frame, type Lesson, type Pt } from './core'

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
    ['from lidar import X', '600 nokta (x, y), metre', '600 points (x, y), metres'],
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
  ],
  params: [
    { key: 'k', label: { tr: 'Grup sayısı k', en: 'Number of groups k' }, min: 2, max: 6, step: 1, value: 3 },
    { key: 'seed', label: { tr: 'Tohum', en: 'Seed' }, min: 1, max: 99, step: 1, value: 17 },
  ],
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
