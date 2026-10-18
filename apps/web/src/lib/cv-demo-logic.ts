// "Gerçek Hayat Demoları" (büyükler için görüntü işleme) saf mantığı: özellik çıkarma, kural/karar ve sinyal işleme.
// DOM ve kamera yok; bileşenler (components/cv-demo) bu fonksiyonları hem kamera hem örnek sahne modunda aynen çağırır.
// Koordinatlar piksel cinsindendir (x sağa, y aşağı); açılar derece, süreler saniyedir.

export interface Pt { x: number; y: number; visibility?: number }
export const isVis = (p: Pt | undefined, th = 0.5): p is Pt => !!p && (p.visibility ?? 1) >= th
export const mid = (a: Pt, b: Pt): Pt => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 })
export const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y)
const DEG = 180 / Math.PI

// ---------------------------------------------------------------- genel: kare sayılı kararlılık (titremeyi önler)
export interface Deb<T> { value: T; cand: T; n: number }
export const deb = <T>(v: T): Deb<T> => ({ value: v, cand: v, n: 0 })
/** Yeni değer `need` kare üst üste görülürse kabul edilir; `need` geçişe göre (from → to) farklı olabilir. */
export function debounce<T>(s: Deb<T>, next: T, need: number | ((from: T, to: T) => number)): Deb<T> {
  if (next === s.value) return { value: s.value, cand: next, n: 0 }
  const n = next === s.cand ? s.n + 1 : 1
  const k = typeof need === 'number' ? need : need(s.value, next)
  return n >= k ? { value: next, cand: next, n: 0 } : { value: s.value, cand: next, n }
}

/** Görünür noktaların çevreleyen kutusu (nokta yoksa null). */
export function bbox(pts: Pt[], visTh = 0.5): { x0: number; y0: number; x1: number; y1: number } | null {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity
  for (const p of pts) { if (!isVis(p, visTh)) continue; x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y) }
  return x0 === Infinity ? null : { x0, y0, x1, y1 }
}

// ---------------------------------------------------------------- 1. düşme tespiti (Pose: 11/12 omuz, 23/24 kalça)
export const FALL_DEFAULTS = { speed: 1.2, angle: 55, frames: 6, window: 1.5 }
export type FallParams = typeof FALL_DEFAULTS
export type FallPhase = 'ok' | 'drop' | 'fall' | 'lying'
export interface FallState { phase: FallPhase; prevY: number | null; prevT: number; v: number; angle: number; frames: number; dropT: number; since: number }
export const fallInit = (): FallState => ({ phase: 'ok', prevY: null, prevT: 0, v: 0, angle: 0, frames: 0, dropT: 0, since: 0 })
/** Gövde açısı: omuz ortası → kalça ortası doğrusunun dikeyle açısı. 0° dik, 90° yatay. */
export const torsoAngle = (sh: Pt, hip: Pt) => Math.atan2(Math.abs(hip.x - sh.x), hip.y - sh.y) * DEG
export function fallObs(lm: Pt[], t: number): { t: number; sh: Pt; hip: Pt } | null {
  if (!lm || lm.length < 25) return null
  const [ls, rs, lh, rh] = [lm[11], lm[12], lm[23], lm[24]]
  if (!isVis(ls) || !isVis(rs) || !isVis(lh, 0.3) || !isVis(rh, 0.3)) return null
  return { t, sh: mid(ls, rs), hip: mid(lh, rh) }
}
/**
 * Durum makinesi. Hız: kalça ortasının aşağı hızı, gövde boyu/sn (kameraya uzaklıktan bağımsız olsun diye).
 * ok → (hız > speed) → drop → (window sn içinde gövde açısı > angle, `frames` kare üst üste) → fall.
 * Yavaşça uzanma (hızsız, 3×frames kare yatay) → lying: alarm yok. Dik duruş (açı < 30°) 2×frames kare → ok.
 */
export function fallStep(s: FallState, o: { t: number; sh: Pt; hip: Pt } | null, p: FallParams = FALL_DEFAULTS): FallState {
  if (!o) return { ...s, prevY: null }
  const torso = Math.max(1e-6, dist(o.sh, o.hip))
  const angle = torsoAngle(o.sh, o.hip)
  const dt = o.t - s.prevT
  const vNow = s.prevY === null || dt <= 0 ? 0 : (o.hip.y - s.prevY) / torso / dt
  const v = s.prevY === null ? 0 : 0.5 * vNow + 0.5 * s.v
  const n: FallState = { ...s, prevY: o.hip.y, prevT: o.t, v, angle }
  const go = (phase: FallPhase): FallState => ({ ...n, phase, frames: 0, since: o.t, dropT: phase === 'drop' ? o.t : n.dropT })
  switch (s.phase) {
    case 'ok':
      if (v > p.speed) return go('drop')
      n.frames = angle > p.angle ? s.frames + 1 : 0
      return n.frames >= p.frames * 3 ? go('lying') : n
    case 'drop':
      n.frames = angle > p.angle ? s.frames + 1 : 0
      if (n.frames >= p.frames) return go('fall')
      return o.t - s.dropT > p.window ? go('ok') : n
    default:
      n.frames = angle < 30 ? s.frames + 1 : 0
      return n.frames >= p.frames * 2 ? go('ok') : n
  }
}

// ---------------------------------------------------------------- 2. bölge ihlali
/** Işın atma (ray casting): yatay ışın çokgen kenarlarını tek sayıda keserse nokta içeridedir. */
export function pointInPolygon(p: Pt, poly: Pt[]): boolean {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i], b = poly[j]
    if ((a.y > p.y) !== (b.y > p.y) && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) inside = !inside
  }
  return inside
}
/** Ayak noktası: iki bilek (27/28) görünüyorsa ortası, yoksa vücut kutusunun alt ortası. */
export function footPoint(lm: Pt[]): Pt | null {
  if (!lm?.length) return null
  if (isVis(lm[27]) && isVis(lm[28])) return mid(lm[27], lm[28])
  const b = bbox(lm)
  return b ? { x: (b.x0 + b.x1) / 2, y: b.y1 } : null
}
export const ZONE_DEFAULTS = { enter: 3, exit: 8 }
/** Gece modu: gri ton + kazanç + gama, yerinde (RGBA). Önceki/sonraki ortalama parlaklığı döner. */
export function nightVision(d: Uint8ClampedArray, gain: number, gamma = 1.6): { before: number; after: number } {
  const lut = new Uint8ClampedArray(256)
  for (let i = 0; i < 256; i++) lut[i] = 255 * Math.min(1, (i * gain) / 255) ** (1 / gamma)
  let sb = 0, sa = 0
  for (let i = 0; i < d.length; i += 4) {
    const y = (d[i] * 77 + d[i + 1] * 150 + d[i + 2] * 29) >> 8
    const v = lut[y]; sb += y; sa += v
    d[i] = v * 0.82; d[i + 1] = v; d[i + 2] = v * 0.82
  }
  const n = Math.max(1, d.length / 4)
  return { before: sb / n, after: sa / n }
}

// ---------------------------------------------------------------- 3. el yasak bölgede
export interface Rect { x: number; y: number; w: number; h: number }
export function distToRect(p: Pt, r: Rect): number {
  const dx = Math.max(r.x - p.x, 0, p.x - (r.x + r.w)), dy = Math.max(r.y - p.y, 0, p.y - (r.y + r.h))
  return Math.hypot(dx, dy)
}
export type Hazard = 'safe' | 'warn' | 'danger'
/** En yakın el noktasının bölgeye uzaklığı: içerideyse danger, `margin` pikselden yakınsa warn. */
export function handHazard(pts: Pt[], r: Rect, margin: number): { level: Hazard; d: number; idx: number } {
  let d = Infinity, idx = -1
  pts.forEach((p, i) => { const k = distToRect(p, r); if (k < d) { d = k; idx = i } })
  return { level: d === 0 ? 'danger' : d < margin ? 'warn' : 'safe', d, idx }
}
const HZ_RANK: Record<Hazard, number> = { safe: 0, warn: 1, danger: 2 }
/** Tehlike artarken 2 kare yeter, azalırken 6 kare beklenir (alarm erken çalsın, geç sussun). */
export const hazardNeed = (from: Hazard, to: Hazard) => (HZ_RANK[to] > HZ_RANK[from] ? 2 : 6)

// ---------------------------------------------------------------- 4. duruş analizi (0 burun, 7/8 kulak, 11/12 omuz)
export const POSTURE_DEFAULTS = { tilt: 8, neck: 18, drop: 0.8, hold: 3 }
export type PostureParams = typeof POSTURE_DEFAULTS
export interface PostureF { tilt: number; neck: number; ratio: number }
export function postureFeatures(lm: Pt[]): PostureF | null {
  if (!lm || lm.length < 13) return null
  const nose = lm[0], ls = lm[11], rs = lm[12]
  if (!isVis(nose) || !isVis(ls) || !isVis(rs)) return null
  const sw = Math.max(1e-6, dist(ls, rs)), sm = mid(ls, rs)
  const head = isVis(lm[7]) && isVis(lm[8]) ? mid(lm[7], lm[8]) : nose
  return {
    tilt: Math.atan2(Math.abs(rs.y - ls.y), Math.abs(rs.x - ls.x)) * DEG,
    neck: Math.atan2(Math.abs(head.x - sm.x), Math.max(1e-6, sm.y - head.y)) * DEG,
    ratio: (sm.y - nose.y) / sw,
  }
}
export type PostureWhy = 'tilt' | 'neck' | 'drop'
/** `base`: kalibrasyonda ölçülen dik duruş oranı (yoksa 0,55 varsayılır). */
export function postureVerdict(f: PostureF, base: number | null, p: PostureParams = POSTURE_DEFAULTS): PostureWhy[] {
  const why: PostureWhy[] = []
  if (f.tilt > p.tilt) why.push('tilt')
  if (f.neck > p.neck) why.push('neck')
  if (f.ratio < (base ?? 0.55) * p.drop) why.push('drop')
  return why
}
/** Kötü duruş `hold` sn sürerse hatırlatma. */
export function postureStep(s: { badSince: number | null; alert: boolean }, bad: boolean, t: number, hold: number) {
  if (!bad) return { badSince: null, alert: false }
  const since = s.badSince ?? t
  return { badSince: since, alert: t - since >= hold }
}

// ---------------------------------------------------------------- 5. nabız (rPPG)
/** Düzensiz zamanlı örnekleri `fs` Hz'e doğrusal aradeğerlemeyle eşit aralıklı yapar. */
export function resample(ts: number[], vs: number[], fs: number): number[] {
  if (ts.length < 2) return vs.slice()
  const out: number[] = []
  let j = 0
  for (let t = ts[0]; t <= ts[ts.length - 1]; t += 1 / fs) {
    while (j < ts.length - 2 && ts[j + 1] < t) j++
    const a = ts[j], b = ts[j + 1], k = b > a ? (t - a) / (b - a) : 0
    out.push(vs[j] + (vs[j + 1] - vs[j]) * Math.min(1, Math.max(0, k)))
  }
  return out
}
/** RBJ biquad (2. derece Butterworth, Q = 0,707) alçak/yüksek geçiren. */
export function biquad(kind: 'lp' | 'hp', f0: number, fs: number, q = Math.SQRT1_2) {
  const w = (2 * Math.PI * f0) / fs, cs = Math.cos(w), al = Math.sin(w) / (2 * q)
  const b = kind === 'lp' ? [(1 - cs) / 2, 1 - cs, (1 - cs) / 2] : [(1 + cs) / 2, -(1 + cs), (1 + cs) / 2]
  const a0 = 1 + al
  return { b: b.map((v) => v / a0), a: [-2 * cs / a0, (1 - al) / a0] }
}
function runBiquad(x: number[], c: ReturnType<typeof biquad>): number[] {
  const y = new Array<number>(x.length)
  let x1 = x[0] ?? 0, x2 = x1, y1 = 0, y2 = 0
  if (c.b[0] + c.b[1] + c.b[2] > 0.5) { y1 = x1; y2 = x1 } // alçak geçiren: kararlı başlangıç
  for (let i = 0; i < x.length; i++) {
    const v = c.b[0] * x[i] + c.b[1] * x1 + c.b[2] * x2 - c.a[0] * y1 - c.a[1] * y2
    x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v
  }
  return y
}
/** Bant geçiren (lo…hi Hz): yüksek + alçak geçiren, ileri ve geri (faz kaymasız, filtfilt gibi). */
export function bandpass(x: number[], fs: number, lo = 0.7, hi = 3.0): number[] {
  const m = x.reduce((a, b) => a + b, 0) / Math.max(1, x.length)
  let y = x.map((v) => v - m)
  const hp = biquad('hp', lo, fs), lp = biquad('lp', hi, fs)
  y = runBiquad(runBiquad(y, hp), lp)
  y = runBiquad(runBiquad(y.reverse(), hp), lp).reverse()
  return y
}
/** Hann pencereli ayrık Fourier gücü, fMin…fMax arasında `step` Hz adımla. */
export function spectrum(x: number[], fs: number, fMin: number, fMax: number, step: number) {
  const N = x.length, w = x.map((v, i) => v * (0.5 - 0.5 * Math.cos((2 * Math.PI * i) / Math.max(1, N - 1))))
  const f: number[] = [], p: number[] = []
  for (let fr = fMin; fr <= fMax + 1e-9; fr += step) {
    let re = 0, im = 0
    const k = (2 * Math.PI * fr) / fs
    for (let i = 0; i < N; i++) { re += w[i] * Math.cos(k * i); im -= w[i] * Math.sin(k * i) }
    f.push(fr); p.push(re * re + im * im)
  }
  return { f, p }
}
export const RPPG_DEFAULTS = { minBpm: 42, maxBpm: 180, window: 10 }
/**
 * Yeşil kanal ortalamalarından nabız: normalize (g/ort − 1) → bant geçiren 0,7–3 Hz → güç spektrumu → tepe.
 * Tepe parabolik aradeğerlemeyle inceltilir. SNR: tepe ±0,1 Hz gücü / bandın geri kalanı.
 */
export function estimateBpm(x: number[], fs: number, o: { minBpm?: number; maxBpm?: number } = {}) {
  const minB = o.minBpm ?? RPPG_DEFAULTS.minBpm, maxB = o.maxBpm ?? RPPG_DEFAULTS.maxBpm
  if (x.length < fs * 4) return null
  const m = x.reduce((a, b) => a + b, 0) / x.length || 1
  const y = bandpass(x.map((v) => v / m - 1), fs, minB / 60, maxB / 60)
  const step = 0.5 / 60
  const { f, p } = spectrum(y, fs, minB / 60, maxB / 60, step)
  let k = 0
  for (let i = 1; i < p.length; i++) if (p[i] > p[k]) k = i
  let fk = f[k]
  if (k > 0 && k < p.length - 1) { const den = p[k - 1] - 2 * p[k] + p[k + 1]; if (den !== 0) fk += (0.5 * (p[k - 1] - p[k + 1]) / den) * step }
  let sig = 0, tot = 0
  for (let i = 0; i < p.length; i++) { tot += p[i]; if (Math.abs(f[i] - f[k]) <= 0.1) sig += p[i] }
  return { bpm: fk * 60, snr: sig / Math.max(1e-12, tot - sig), f, p, filtered: y }
}

// ---------------------------------------------------------------- 6. trafik: arka plan çıkarma, lekeler, izleme, çizgi sayacı
export function toGray(rgba: Uint8ClampedArray, out: Float32Array): Float32Array {
  for (let i = 0, j = 0; j < out.length; i += 4, j++) out[j] = 0.299 * rgba[i] + 0.587 * rgba[i + 1] + 0.114 * rgba[i + 2]
  return out
}
/** Ön plan maskesi: |gri − arka plan| > th. Ön plan piksel sayısını döner. */
export function fgMask(gray: Float32Array, bg: Float32Array, th: number, out: Uint8Array): number {
  let n = 0
  for (let i = 0; i < gray.length; i++) { const f = Math.abs(gray[i] - bg[i]) > th ? 1 : 0; out[i] = f; n += f }
  return n
}
/** Seçici koşan ortalama: arka planda α, ön planda (araç üstünde) çok küçük αFg ile güncellenir. */
export function bgUpdate(bg: Float32Array, gray: Float32Array, mask: Uint8Array | null, a = 0.05, aFg = 0.002) {
  for (let i = 0; i < bg.length; i++) { const k = mask && mask[i] ? aFg : a; bg[i] += k * (gray[i] - bg[i]) }
}
export interface Blob { id: number; x0: number; y0: number; x1: number; y1: number; cx: number; cy: number; area: number }
/** 4-komşulu bağlı bileşenler; `minArea` pikselden küçükler gürültü sayılır. labels[i] = leke id + 1 (0: yok). */
export function blobs(mask: Uint8Array, w: number, h: number, minArea: number): { blobs: Blob[]; labels: Int32Array } {
  const labels = new Int32Array(w * h), stack = new Int32Array(w * h), out: Blob[] = []
  let raw = 0
  for (let s = 0; s < mask.length; s++) {
    if (!mask[s] || labels[s]) continue
    raw++
    let sp = 0, area = 0, sx = 0, sy = 0, x0 = w, y0 = h, x1 = 0, y1 = 0
    stack[sp++] = s; labels[s] = -raw
    while (sp) {
      const i = stack[--sp], x = i % w, y = (i - x) / w
      area++; sx += x; sy += y
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y
      const nb = [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, y > 0 ? i - w : -1, y < h - 1 ? i + w : -1]
      for (const j of nb) if (j >= 0 && mask[j] && !labels[j]) { labels[j] = -raw; stack[sp++] = j }
    }
    if (area >= minArea) out.push({ id: raw, x0, y0, x1, y1, cx: sx / area, cy: sy / area, area })
  }
  // geçici negatif etiketleri, kalan lekeler için pozitife çevir
  const keep = new Set(out.map((b) => b.id))
  for (let i = 0; i < labels.length; i++) { const l = -labels[i]; labels[i] = l > 0 && keep.has(l) ? l : 0 }
  return { blobs: out, labels }
}
export interface Track { id: number; cx: number; cy: number; box: Blob; hist: Array<{ t: number; x: number; y: number }>; miss: number; counted: boolean; speed: number | null }
/** En yakın komşu eşleme: her iz, `maxDist` içindeki en yakın lekeyi alır; `maxMiss` kare görünmeyen iz silinir. */
export function trackStep(tracks: Track[], bs: Blob[], t: number, maxDist: number, maxMiss: number, nextId: number): { tracks: Track[]; nextId: number } {
  const used = new Set<number>(), out: Track[] = []
  const pairs: Array<[number, number, number]> = []
  tracks.forEach((tr, i) => bs.forEach((b, j) => { const d = Math.hypot(tr.cx - b.cx, tr.cy - b.cy); if (d <= maxDist) pairs.push([d, i, j]) }))
  pairs.sort((a, b) => a[0] - b[0])
  const got = new Map<number, number>()
  for (const [, i, j] of pairs) if (!got.has(i) && !used.has(j)) { got.set(i, j); used.add(j) }
  tracks.forEach((tr, i) => {
    const j = got.get(i)
    if (j === undefined) { if (tr.miss + 1 <= maxMiss) out.push({ ...tr, miss: tr.miss + 1 }); return }
    const b = bs[j]
    out.push({ ...tr, cx: b.cx, cy: b.cy, box: b, miss: 0, hist: [...tr.hist, { t, x: b.cx, y: b.cy }].filter((h) => t - h.t <= 1.5) })
  })
  bs.forEach((b, j) => { if (!used.has(j)) out.push({ id: nextId++, cx: b.cx, cy: b.cy, box: b, hist: [{ t, x: b.cx, y: b.cy }], miss: 0, counted: false, speed: null }) })
  return { tracks: out, nextId }
}
/** Çizgi geçişi: önceki konum çizginin bir yanında, şimdiki öbür yanındaysa +1 (artan yönde) ya da −1. */
export const lineCross = (prev: number, now: number, line: number): 0 | 1 | -1 => (prev < line && now >= line ? 1 : prev >= line && now < line ? -1 : 0)
/** Hız (km/sa): izin son ~1 sn'deki yer değiştirmesi × metre/piksel ÷ süre. En az `minDt` sn veri gerekir. */
export function speedKmh(hist: Track['hist'], mPerPx: number, axis: 'x' | 'y' = 'y', minDt = 0.3): number | null {
  if (hist.length < 2) return null
  const b = hist[hist.length - 1], a = hist.find((h) => b.t - h.t <= 1) ?? hist[0]
  const dt = b.t - a.t
  if (dt < minDt) return null
  return (Math.abs(b[axis] - a[axis]) * mPerPx / dt) * 3.6
}
/** Sayaç adımı: çizgiyi ilk kez geçen izler sayılır. Olay listesi döner (yön ve hız). */
export function countStep(tracks: Track[], line: number, mPerPx: number, axis: 'x' | 'y' = 'y'): Array<{ id: number; dir: 1 | -1; kmh: number | null }> {
  const ev: Array<{ id: number; dir: 1 | -1; kmh: number | null }> = []
  for (const tr of tracks) {
    if (tr.counted || tr.hist.length < 2 || tr.miss) continue
    const h = tr.hist
    const dir = lineCross(h[h.length - 2][axis], h[h.length - 1][axis], line)
    if (dir) { tr.counted = true; tr.speed = speedKmh(h, mPerPx, axis); ev.push({ id: tr.id, dir, kmh: tr.speed }) }
  }
  return ev
}

// ---------------------------------------------------------------- 7. meyve olgunluğu (HSV)
export function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn
  let h = 0
  if (d) h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4
  h *= 60; if (h < 0) h += 360
  return [h, mx ? d / mx : 0, mx / 255]
}
export const RIPE_DEFAULTS = { sMin: 0.35, vMin: 0.2, redMax: 20, yellowMax: 65, greenMax: 170, ripe: 0.6, half: 0.25 }
export type RipeParams = typeof RIPE_DEFAULTS
/** 0 yok (arka plan: düşük doygunluk/parlaklık), 1 kırmızı, 2 sarı-turuncu, 3 yeşil. */
export function hueClass(h: number, s: number, v: number, p: RipeParams = RIPE_DEFAULTS): 0 | 1 | 2 | 3 {
  if (s < p.sMin || v < p.vMin) return 0
  if (h < p.redMax || h >= 340) return 1
  if (h < p.yellowMax) return 2
  if (h < p.greenMax) return 3
  return 0
}
export function segmentFruit(rgba: Uint8ClampedArray, w: number, h: number, p: RipeParams = RIPE_DEFAULTS) {
  const cls = new Uint8Array(w * h), mask = new Uint8Array(w * h)
  for (let i = 0, j = 0; j < w * h; i += 4, j++) { const [H, S, V] = rgbToHsv(rgba[i], rgba[i + 1], rgba[i + 2]); const c = hueClass(H, S, V, p); cls[j] = c; mask[j] = c ? 1 : 0 }
  return { cls, mask }
}
export type Ripe = 'ripe' | 'half' | 'unripe'
/** Olgunluk oranı = kırmızı / (kırmızı + sarı + yeşil); ≥ ripe → olgun, ≥ half → yarı olgun, değilse ham. */
export function ripeness(c: { red: number; yellow: number; green: number }, p: RipeParams = RIPE_DEFAULTS): { ratio: number; label: Ripe } {
  const tot = c.red + c.yellow + c.green
  const ratio = tot ? c.red / tot : 0
  return { ratio, label: ratio >= p.ripe ? 'ripe' : ratio >= p.half ? 'half' : 'unripe' }
}
/** Etiket haritasından her leke için renk sayımları. */
export function blobHueCounts(cls: Uint8Array, labels: Int32Array): Map<number, { red: number; yellow: number; green: number }> {
  const m = new Map<number, { red: number; yellow: number; green: number }>()
  for (let i = 0; i < labels.length; i++) {
    const l = labels[i]; if (!l) continue
    let c = m.get(l); if (!c) { c = { red: 0, yellow: 0, green: 0 }; m.set(l, c) }
    if (cls[i] === 1) c.red++; else if (cls[i] === 2) c.yellow++; else if (cls[i] === 3) c.green++
  }
  return m
}

// ---------------------------------------------------------------- 8. yorgunluk / esneme (FaceLandmarker, 478 nokta)
export const LEFT_EYE = [362, 385, 387, 263, 373, 380]
export const RIGHT_EYE = [33, 160, 158, 133, 153, 144]
export const MOUTH = { left: 61, right: 291, pairs: [[13, 14], [81, 178], [311, 402]] as Array<[number, number]> }
/** Göz en-boy oranı (Soukupová & Čech 2016): (|p2−p6| + |p3−p5|) / (2·|p1−p4|). Açık göz ≈ 0,25–0,35, kapalı < 0,2. */
export function ear(p: Pt[]): number {
  return (dist(p[1], p[5]) + dist(p[2], p[4])) / (2 * Math.max(1e-6, dist(p[0], p[3])))
}
export function faceEar(lm: Pt[]): number { return (ear(LEFT_EYE.map((i) => lm[i])) + ear(RIGHT_EYE.map((i) => lm[i]))) / 2 }
/** Ağız açıklık oranı: üç dikey iç dudak aralığının ortalaması / ağız genişliği. */
export function faceMar(lm: Pt[]): number {
  const v = MOUTH.pairs.reduce((s, [a, b]) => s + dist(lm[a], lm[b]), 0) / 3
  return v / Math.max(1e-6, dist(lm[MOUTH.left], lm[MOUTH.right]))
}
export const FATIGUE_DEFAULTS = { ear: 0.21, closedSec: 0.8, mar: 0.6, yawnSec: 1.2 }
export type FatigueParams = typeof FATIGUE_DEFAULTS
export interface FatigueState { closedSince: number | null; yawnSince: number | null; blinks: number[]; yawns: number; yawnCounted: boolean; hist: Array<{ t: number; c: boolean }>; alert: 'none' | 'drowsy' | 'yawn' }
export const fatigueInit = (): FatigueState => ({ closedSince: null, yawnSince: null, blinks: [], yawns: 0, yawnCounted: false, hist: [], alert: 'none' })
/**
 * EAR < ear → göz kapalı. Kapanma closedSec'ten kısa sürerse göz kırpma sayılır, uzun sürerse "uyuklama" alarmı.
 * MAR > mar, yawnSec boyunca → esneme. PERCLOS: son 30 sn'de gözün kapalı olduğu zaman oranı.
 */
export function fatigueStep(s: FatigueState, o: { t: number; ear: number; mar: number } | null, p: FatigueParams = FATIGUE_DEFAULTS): FatigueState {
  if (!o) return s
  const closed = o.ear < p.ear, open = o.mar > p.mar
  const n: FatigueState = { ...s, hist: [...s.hist, { t: o.t, c: closed }].filter((h) => o.t - h.t <= 30), blinks: s.blinks.filter((b) => o.t - b <= 60) }
  if (closed) n.closedSince = s.closedSince ?? o.t
  else { if (s.closedSince !== null && o.t - s.closedSince < p.closedSec && o.t - s.closedSince > 0.04) n.blinks = [...n.blinks, o.t]; n.closedSince = null }
  if (open) n.yawnSince = s.yawnSince ?? o.t
  else n.yawnSince = null
  const yawning = n.yawnSince !== null && o.t - n.yawnSince >= p.yawnSec
  const wasYawning = s.yawnSince !== null && n.yawnSince === s.yawnSince && s.yawnCounted
  n.yawnCounted = yawning
  if (yawning && !wasYawning) n.yawns = s.yawns + 1
  n.alert = n.closedSince !== null && o.t - n.closedSince >= p.closedSec ? 'drowsy' : yawning ? 'yawn' : 'none'
  return n
}
export const perclos = (s: FatigueState) => (s.hist.length ? s.hist.filter((h) => h.c).length / s.hist.length : 0)

// ---------------------------------------------------------------- Python kod parçaları: "# Türkçe || English" yorumları
/** Kod parçasındaki `# tr || en` yorumlarından seçilen dili bırakır. */
export function pyFor(src: string, lang: 'tr' | 'en'): string {
  return src.replace(/#([^\n]*?)\s*\|\|\s*([^\n]*)/g, (_m, a: string, b: string) => `#${lang === 'en' ? ` ${b.trim()}` : a.trimEnd()}`)
}
