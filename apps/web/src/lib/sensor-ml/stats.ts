// Veri analizi ve görselleştirme hesapları: histogram, Pearson korelasyonu ve matrisi, Welford'un çevrimiçi ortalama/varyansı
// (mikrodenetleyicide diziyi saklamadan istatistik), günlük profil. NaN değerler atlanır.

const ok = (v: number) => Number.isFinite(v)

export interface Hist { edges: number[]; counts: number[] }
export function histogram(x: readonly number[], bins: number, lo?: number, hi?: number): Hist {
  const f = x.filter(ok)
  const a = lo ?? Math.min(...f), b = hi ?? Math.max(...f)
  const w = (b - a) / bins || 1
  const counts = Array(bins).fill(0)
  for (const v of f) { if (v < a || v > b) continue; counts[Math.min(bins - 1, Math.floor((v - a) / w))]++ }
  return { edges: Array.from({ length: bins + 1 }, (_, i) => a + i * w), counts }
}

/** Pearson r: iki seride de geçerli olan noktalardan. Sabit seride NaN. */
export function pearson(a: readonly number[], b: readonly number[]): number {
  const xs: number[] = [], ys: number[] = []
  a.forEach((v, i) => { if (ok(v) && ok(b[i])) { xs.push(v); ys.push(b[i]) } })
  const n = xs.length
  if (n < 2) return NaN
  const mx = xs.reduce((s, v) => s + v, 0) / n, my = ys.reduce((s, v) => s + v, 0) / n
  let sxy = 0, sxx = 0, syy = 0
  for (let i = 0; i < n; i++) { const dx = xs[i] - mx, dy = ys[i] - my; sxy += dx * dy; sxx += dx * dx; syy += dy * dy }
  return sxx > 0 && syy > 0 ? sxy / Math.sqrt(sxx * syy) : NaN
}
export const corrMatrix = (cols: ReadonlyArray<readonly number[]>): number[][] => cols.map((a) => cols.map((b) => pearson(a, b)))

/** Welford: tek geçişte, sabit bellekle ortalama ve varyans. Sayısal olarak toplam-kare yönteminden kararlıdır. */
export interface Welford { n: number; mean: number; m2: number; min: number; max: number }
export const welfordInit = (): Welford => ({ n: 0, mean: 0, m2: 0, min: Infinity, max: -Infinity })
export function welfordPush(s: Welford, x: number): Welford {
  if (!ok(x)) return s
  const n = s.n + 1, d = x - s.mean, mean = s.mean + d / n
  return { n, mean, m2: s.m2 + d * (x - mean), min: Math.min(s.min, x), max: Math.max(s.max, x) }
}
/** Örneklem varyansı (n − 1). */
export const welfordVar = (s: Welford): number => (s.n > 1 ? s.m2 / (s.n - 1) : 0)
export const welfordOf = (x: readonly number[]): Welford => x.reduce(welfordPush, welfordInit())

/** Saate göre ortalama profil (24 kutu): "tipik bir gün". */
export function dailyProfile(hour: readonly number[], x: readonly number[]): number[] {
  const s = Array(24).fill(0), n = Array(24).fill(0)
  x.forEach((v, i) => { if (ok(v)) { const h = Math.floor(hour[i]) % 24; s[h] += v; n[h]++ } })
  return s.map((v, i) => (n[i] ? v / n[i] : NaN))
}
