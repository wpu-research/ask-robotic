// Sensör verisini temizleme: aykırı değer bulma (z-skoru, IQR, Hampel), eksik değer doldurma (ileri doldurma, doğrusal
// ara değer), yumuşatma (hareketli ortalama, medyan süzgeci, üstel ortalama) ve tek boyutlu Kalman süzgeci. Hepsi saf
// fonksiyon; NaN "eksik" demektir. Yumuşatıcılar nedenseldir (yalnız geçmişe bakar): mikrodenetleyicide de aynı çalışır.

const ok = (v: number) => Number.isFinite(v)
const finite = (x: readonly number[]) => x.filter(ok)

export function median(a: readonly number[]): number {
  const s = finite(a).sort((p, q) => p - q)
  if (!s.length) return NaN
  const m = s.length >> 1
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}
export function quantile(a: readonly number[], q: number): number {
  const s = finite(a).sort((p, r) => p - r)
  if (!s.length) return NaN
  const pos = (s.length - 1) * q, lo = Math.floor(pos), hi = Math.ceil(pos)
  return s[lo] + (s[hi] - s[lo]) * (pos - lo)
}

/** |x − ortalama| > k·σ olanlar. Uç değerler ortalamayı ve σ'yı kendileri büyüttüğü için büyük sıçramaları kaçırabilir. */
export function zscoreOutliers(x: readonly number[], k = 3): boolean[] {
  const f = finite(x)
  const m = f.reduce((s, v) => s + v, 0) / (f.length || 1)
  const sd = Math.sqrt(f.reduce((s, v) => s + (v - m) ** 2, 0) / (f.length || 1))
  return x.map((v) => ok(v) && sd > 0 && Math.abs(v - m) > k * sd)
}

/** Q1 − k·IQR altı ya da Q3 + k·IQR üstü (Tukey çitleri). Sıralamaya dayandığı için uç değere dayanıklıdır. */
export function iqrOutliers(x: readonly number[], k = 1.5): boolean[] {
  const q1 = quantile(x, 0.25), q3 = quantile(x, 0.75), iqr = q3 - q1
  return x.map((v) => ok(v) && (v < q1 - k * iqr || v > q3 + k * iqr))
}

/** Hampel süzgeci: her noktayı ±half komşuluğunun medyanı ve MAD'ı ile karşılaştırır. Yerel olduğu için günlük döngüde
 *  "öğlen sıcak" ile "sıçrama"yı ayırır. 1,4826 · MAD normal dağılımda σ'ya eşittir. */
export function hampel(x: readonly number[], half = 3, k = 3): boolean[] {
  return x.map((v, i) => {
    if (!ok(v)) return false
    const win = x.slice(Math.max(0, i - half), i + half + 1)
    const m = median(win)
    const mad = 1.4826 * median(win.map((w) => Math.abs(w - m)))
    return Math.abs(v - m) > k * Math.max(mad, 1e-6)
  })
}

/** İşaretli noktaları eksik (NaN) yap. */
export const dropMask = (x: readonly number[], mask: readonly boolean[]): number[] => x.map((v, i) => (mask[i] ? NaN : v))

/** İleri doldurma: eksik değer son geçerli değerle doldurulur (baştaki eksikler ilk geçerli değerle). */
export function ffill(x: readonly number[]): number[] {
  const first = x.find(ok) ?? NaN
  let last = first
  return x.map((v) => (ok(v) ? (last = v) : last))
}

/** Doğrusal ara değer: iki geçerli komşu arasında düz çizgi; kenarlarda en yakın geçerli değer. */
export function interpLinear(x: readonly number[]): number[] {
  const out = [...x]
  let prev = -1
  for (let i = 0; i <= x.length; i++) {
    if (i < x.length && !ok(x[i])) continue
    if (i - prev > 1) {
      for (let j = prev + 1; j < i; j++) {
        if (prev < 0) out[j] = i < x.length ? x[i] : NaN
        else if (i >= x.length) out[j] = x[prev]
        else out[j] = x[prev] + (x[i] - x[prev]) * (j - prev) / (i - prev)
      }
    }
    prev = i
  }
  return out
}

/** Nedensel hareketli ortalama: son w geçerli örneğin ortalaması. */
export function movingAvg(x: readonly number[], w: number): number[] {
  return x.map((_, i) => { const win = finite(x.slice(Math.max(0, i - w + 1), i + 1)); return win.length ? win.reduce((s, v) => s + v, 0) / win.length : NaN })
}
/** Nedensel medyan süzgeci: son w örneğin medyanı. Tek sıçramayı tamamen siler, basamağı bozmadan geçirir. */
export const medianFilter = (x: readonly number[], w: number): number[] => x.map((_, i) => median(x.slice(Math.max(0, i - w + 1), i + 1)))
/** Üstel hareketli ortalama: y ← y + α(x − y). Tek değişken, tek çarpma: en ucuz yumuşatıcı. */
export function ema(x: readonly number[], alpha: number): number[] {
  let y = NaN
  return x.map((v) => { if (ok(v)) y = ok(y) ? y + alpha * (v - y) : v; return y })
}

export interface KalmanOut { est: number[]; gain: number[]; p: number[] }
/**
 * Tek boyutlu Kalman süzgeci, "sabit + rastgele yürüyüş" modeli: x_k = x_{k−1} + w (Var w = q), z_k = x_k + v (Var v = r).
 * Tahmin: P ← P + q. Güncelleme: K = P/(P + r), x ← x + K(z − x), P ← (1 − K)P. Eksik ölçümde yalnız tahmin adımı yapılır.
 */
export function kalman1d(z: readonly number[], q: number, r: number, x0?: number, p0 = 1): KalmanOut {
  let x = x0 ?? (z.find(ok) ?? 0), P = p0
  const est: number[] = [], gain: number[] = [], p: number[] = []
  for (const v of z) {
    P += q
    let K = 0
    if (ok(v)) { K = P / (P + r); x += K * (v - x); P *= 1 - K }
    est.push(x); gain.push(K); p.push(P)
  }
  return { est, gain, p }
}
/** Durağan Kalman kazancı: P∞ = (q + √(q² + 4qr))/2 tahmin öncesi varyans; K∞ = P∞/(P∞ + r). EMA'nın α'sına eşdeğerdir. */
export function steadyGain(q: number, r: number): number {
  const P = (q + Math.sqrt(q * q + 4 * q * r)) / 2
  return P / (P + r)
}

/** İki seri arasında RMSE (iki tarafta da geçerli olan noktalarda). */
export function rmseValid(a: readonly number[], b: readonly number[]): number {
  let s = 0, n = 0
  a.forEach((v, i) => { if (ok(v) && ok(b[i])) { s += (v - b[i]) ** 2; n++ } })
  return n ? Math.sqrt(s / n) : NaN
}
