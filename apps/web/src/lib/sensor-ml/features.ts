// Özellik mühendisliği: zaman serisinden tablo. Gecikmeler (t−k), kayan ortalama/standart sapma, günün saati (sin/cos ile
// döngüsel), hedef olarak h adım sonraki değer. Yalnız geçmişe bakan özellikler: gelecekten sızıntı yoktur (test eder).
const ok = (v: number) => Number.isFinite(v)

/** k adım gecikme: out[i] = x[i − k]. */
export const lag = (x: readonly number[], k: number): number[] => x.map((_, i) => (i - k >= 0 ? x[i - k] : NaN))
/** Son w örneğin ortalaması (i dahil). Pencerede eksik varsa NaN (dürüst: veri yoksa özellik yok). */
export function rollMean(x: readonly number[], w: number): number[] {
  return x.map((_, i) => { if (i < w - 1) return NaN; const s = x.slice(i - w + 1, i + 1); return s.every(ok) ? s.reduce((a, b) => a + b, 0) / w : NaN })
}
export function rollStd(x: readonly number[], w: number): number[] {
  const m = rollMean(x, w)
  return x.map((_, i) => { if (!ok(m[i])) return NaN; const s = x.slice(i - w + 1, i + 1); return Math.sqrt(s.reduce((a, b) => a + (b - m[i]) ** 2, 0) / w) })
}
/** Saat döngüseldir: 23:50 ile 00:10 yakındır. sin/cos çifti bunu doğrusal modele anlatır. */
export const hourSin = (h: readonly number[]) => h.map((v) => Math.sin((2 * Math.PI * v) / 24))
export const hourCos = (h: readonly number[]) => h.map((v) => Math.cos((2 * Math.PI * v) / 24))
/** Merkezli ortalama (i − k .. i + k): grafik çizerken güzeldir, özellik olarak gelecekten bilgi sızdırır. */
export function centered(x: readonly number[], k: number): number[] {
  return x.map((_, i) => { if (i < k || i + k >= x.length) return NaN; const s = x.slice(i - k, i + k + 1); return s.every(ok) ? s.reduce((a, b) => a + b, 0) / s.length : NaN })
}
/** h adım sonraki değer (hedef). */
export const lead = (x: readonly number[], h: number): number[] => x.map((_, i) => (i + h < x.length ? x[i + h] : NaN))

export interface FeatOpts {
  lags: number[]; roll: number; hour: boolean; light: boolean; horizon: number
  /** BİLEREK HATALI: merkezli ortalama (±horizon) geleceği görür. Sızıntının sahte başarısını göstermek için. */
  leak?: boolean
}
export const FEAT_DEFAULTS: FeatOpts = { lags: [1, 2, 3, 6], roll: 6, hour: true, light: true, horizon: 6 }

export interface Table { names: string[]; X: number[][]; y: number[]; /** Satırın serideki indeksi (t). */ idx: number[]; /** Hedefin şimdiki değeri (persistence tabanı için). */ now: number[] }

/** temp (temiz), hour, light → özellik tablosu. Herhangi bir hücresi NaN olan satır atılır. */
export function buildTable(temp: readonly number[], hour: readonly number[], light: readonly number[], o: FeatOpts = FEAT_DEFAULTS): Table {
  const cols: Array<[string, number[]]> = [['temp', [...temp]]]
  for (const k of o.lags) cols.push([`temp_lag${k}`, lag(temp, k)])
  if (o.roll > 1) { cols.push([`temp_mean${o.roll}`, rollMean(temp, o.roll)]); cols.push([`temp_std${o.roll}`, rollStd(temp, o.roll)]) }
  if (o.hour) { cols.push(['hour_sin', hourSin(hour)]); cols.push(['hour_cos', hourCos(hour)]) }
  if (o.light) cols.push(['light', light.map((v) => v / 1023)])
  if (o.leak) cols.push(['temp_center', centered(temp, o.horizon)])
  const target = lead(temp, o.horizon)
  const t: Table = { names: cols.map((c) => c[0]), X: [], y: [], idx: [], now: [] }
  for (let i = 0; i < temp.length; i++) {
    const row = cols.map((c) => c[1][i])
    if (!row.every(ok) || !ok(target[i])) continue
    t.X.push(row); t.y.push(target[i]); t.idx.push(i); t.now.push(temp[i])
  }
  return t
}
