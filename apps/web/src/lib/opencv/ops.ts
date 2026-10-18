// OpenCV dersi: temel görüntü işlemleri, saf TypeScript (DOM yok, testli). Formüller OpenCV'nin belgelenmiş davranışını izler:
// gri = 0,299R + 0,587G + 0,114B; HSV'de H 0–179, S ve V 0–255; kenarlar BORDER_REFLECT_101; Gauss çekirdeği getGaussianKernel.
// Görüntüler satır öncelikli: Rgba 4 kanal (tuvalin ImageData'sı gibi), Gray tek kanal 0–255, Field tek kanal kayan nokta.

export interface Rgba { w: number; h: number; data: Uint8ClampedArray }
export interface Gray { w: number; h: number; data: Uint8ClampedArray }
export interface Field { w: number; h: number; data: Float32Array }

export const rgba = (w: number, h: number): Rgba => ({ w, h, data: new Uint8ClampedArray(w * h * 4) })
export const gray = (w: number, h: number): Gray => ({ w, h, data: new Uint8ClampedArray(w * h) })
export const field = (w: number, h: number): Field => ({ w, h, data: new Float32Array(w * h) })
export const cloneGray = (g: Gray): Gray => ({ w: g.w, h: g.h, data: new Uint8ClampedArray(g.data) })

/** BORDER_REFLECT_101: ...2 1 | 0 1 2 ... n−1 | n−2 ... */
export function reflect101(i: number, n: number): number {
  if (n === 1) return 0
  while (i < 0 || i >= n) i = i < 0 ? -i : 2 * n - 2 - i
  return i
}

// ---------------------------------------------------------------- renk ve kanallar
export function toGray(src: Rgba): Gray {
  const g = gray(src.w, src.h), d = src.data
  for (let i = 0, j = 0; j < g.data.length; i += 4, j++) g.data[j] = Math.round(0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2])
  return g
}
export function grayToRgba(g: Gray | Field, lo = 0, hi = 255): Rgba {
  const o = rgba(g.w, g.h), s = 255 / Math.max(1e-9, hi - lo)
  for (let j = 0, i = 0; j < g.data.length; j++, i += 4) { const v = (g.data[j] - lo) * s; o.data[i] = o.data[i + 1] = o.data[i + 2] = v; o.data[i + 3] = 255 }
  return o
}
/** |değer| alanını 0–255'e ölçekler (Sobel büyüklüğü gibi); en büyük değer 255 olur. */
export function fieldToGray(f: Field, abs = true): Gray {
  let m = 1e-9
  for (const v of f.data) m = Math.max(m, abs ? Math.abs(v) : v)
  const g = gray(f.w, f.h)
  for (let i = 0; i < f.data.length; i++) g.data[i] = (abs ? Math.abs(f.data[i]) : f.data[i]) / m * 255
  return g
}
export type ChannelK = 'b' | 'g' | 'r'
export function channel(src: Rgba, k: ChannelK): Gray {
  const off = k === 'r' ? 0 : k === 'g' ? 1 : 2, g = gray(src.w, src.h)
  for (let j = 0; j < g.data.length; j++) g.data[j] = src.data[j * 4 + off]
  return g
}
/** Tek pikselin OpenCV HSV'si: H 0–179 (derece/2), S ve V 0–255. */
export function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  const v = Math.max(r, g, b), mn = Math.min(r, g, b), d = v - mn
  const s = v === 0 ? 0 : (255 * d) / v
  let h = 0
  if (d > 0) {
    if (v === r) h = (60 * (g - b)) / d
    else if (v === g) h = 120 + (60 * (b - r)) / d
    else h = 240 + (60 * (r - g)) / d
    if (h < 0) h += 360
  }
  return [Math.round(h / 2) % 180, Math.round(s), v]
}
export function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const H = (h * 2) % 360, S = s / 255, V = v
  const c = V * S, x = c * (1 - Math.abs(((H / 60) % 2) - 1)), m = V - c
  const [r, g, b] = H < 60 ? [c, x, 0] : H < 120 ? [x, c, 0] : H < 180 ? [0, c, x] : H < 240 ? [0, x, c] : H < 300 ? [x, 0, c] : [c, 0, x]
  return [Math.round(r + m), Math.round(g + m), Math.round(b + m)]
}
export function hsvPlanes(src: Rgba): { h: Gray; s: Gray; v: Gray } {
  const h = gray(src.w, src.h), s = gray(src.w, src.h), v = gray(src.w, src.h), d = src.data
  for (let j = 0, i = 0; j < h.data.length; j++, i += 4) { const p = rgbToHsv(d[i], d[i + 1], d[i + 2]); h.data[j] = p[0]; s.data[j] = p[1]; v.data[j] = p[2] }
  return { h, s, v }
}
/** cv2.inRange (HSV): alt ≤ piksel ≤ üst ise 255. hLo > hHi ise kırmızı gibi sarmalı aralık (hLo..179 ∪ 0..hHi). */
export function inRangeHsv(src: Rgba, lo: [number, number, number], hi: [number, number, number]): Gray {
  const m = gray(src.w, src.h), d = src.data
  for (let j = 0, i = 0; j < m.data.length; j++, i += 4) {
    const [H, S, V] = rgbToHsv(d[i], d[i + 1], d[i + 2])
    const hok = lo[0] <= hi[0] ? H >= lo[0] && H <= hi[0] : H >= lo[0] || H <= hi[0]
    m.data[j] = hok && S >= lo[1] && S <= hi[1] && V >= lo[2] && V <= hi[2] ? 255 : 0
  }
  return m
}
/** Gri işlemi RGBA'nın her renk kanalına uygular (filtreler renkli görüntüde). */
export function perChannel(src: Rgba, fn: (g: Gray) => Gray): Rgba {
  const o = rgba(src.w, src.h)
  ;(['r', 'g', 'b'] as const).forEach((k, off) => { const r = fn(channel(src, k)); for (let j = 0; j < r.data.length; j++) o.data[j * 4 + off] = r.data[j] })
  for (let j = 3; j < o.data.length; j += 4) o.data[j] = 255
  return o
}

// ---------------------------------------------------------------- nokta işlemleri ve histogram
/** g = doyur(α·f + β), sonra gama: 255·(g/255)^(1/γ). γ > 1 koyu tonları açar. Bakış tablosu (LUT) olarak döner. */
export function pointLut(alpha: number, beta: number, gamma = 1): Uint8ClampedArray {
  const lut = new Uint8ClampedArray(256)
  for (let v = 0; v < 256; v++) {
    const a = Math.min(255, Math.max(0, Math.round(alpha * v + beta)))
    lut[v] = Math.round(255 * Math.pow(a / 255, 1 / gamma))
  }
  return lut
}
export function applyLut(src: Rgba, lut: Uint8ClampedArray): Rgba {
  const o = rgba(src.w, src.h)
  for (let i = 0; i < src.data.length; i += 4) { o.data[i] = lut[src.data[i]]; o.data[i + 1] = lut[src.data[i + 1]]; o.data[i + 2] = lut[src.data[i + 2]]; o.data[i + 3] = 255 }
  return o
}
export function histogram(g: Gray): number[] {
  const h = new Array<number>(256).fill(0)
  for (const v of g.data) h[v]++
  return h
}
/** cv2.equalizeHist: birikimli dağılımla eşleme, lut[v] = round((cdf(v) − cdfMin)/(N − cdfMin)·255). */
export function equalizeLut(g: Gray): Uint8ClampedArray {
  const h = histogram(g), lut = new Uint8ClampedArray(256), n = g.data.length
  let cdf = 0, cmin = -1
  for (let v = 0; v < 256; v++) { cdf += h[v]; if (cmin < 0 && cdf > 0) cmin = cdf; lut[v] = n === cmin ? v : Math.round(((cdf - cmin) / (n - cmin)) * 255) }
  return lut
}
export function equalize(g: Gray): Gray {
  const lut = equalizeLut(g), o = gray(g.w, g.h)
  for (let i = 0; i < g.data.length; i++) o.data[i] = lut[g.data[i]]
  return o
}
/** Renkli eşitleme: parlaklık (gri) eşitlenir, renkler aynı oranda ölçeklenir (YCrCb'de Y eşitlemeye yakın). */
export function equalizeRgba(src: Rgba): Rgba {
  const g = toGray(src), lut = equalizeLut(g), o = rgba(src.w, src.h)
  for (let j = 0, i = 0; j < g.data.length; j++, i += 4) {
    const y = g.data[j], k = y > 0 ? lut[y] / y : 0
    if (y === 0) { o.data[i] = o.data[i + 1] = o.data[i + 2] = lut[0] } else { o.data[i] = src.data[i] * k; o.data[i + 1] = src.data[i + 1] * k; o.data[i + 2] = src.data[i + 2] * k }
    o.data[i + 3] = 255
  }
  return o
}
export const meanStd = (g: Gray): { mean: number; std: number } => {
  let s = 0, s2 = 0
  for (const v of g.data) { s += v; s2 += v * v }
  const n = g.data.length, m = s / n
  return { mean: m, std: Math.sqrt(Math.max(0, s2 / n - m * m)) }
}

// ---------------------------------------------------------------- eşikleme
export function threshold(g: Gray, t: number, inv = false): Gray {
  const o = gray(g.w, g.h)
  for (let i = 0; i < g.data.length; i++) o.data[i] = (g.data[i] > t) !== inv ? 255 : 0
  return o
}
/** Otsu: sınıflar arası varyansı (ω₀ω₁(μ₀−μ₁)²) en büyük yapan eşik. cv2.THRESH_OTSU gibi "> t" beyaz. */
export function otsu(g: Gray): { t: number; sigmaB: number[] } {
  const h = histogram(g), n = g.data.length
  let sumAll = 0
  for (let v = 0; v < 256; v++) sumAll += v * h[v]
  let w0 = 0, sum0 = 0, best = 0, bt = 0
  const sigmaB = new Array<number>(256).fill(0)
  for (let t = 0; t < 256; t++) {
    w0 += h[t]; sum0 += t * h[t]
    const w1 = n - w0
    if (w0 === 0 || w1 === 0) continue
    const m0 = sum0 / w0, m1 = (sumAll - sum0) / w1
    const sb = (w0 / n) * (w1 / n) * (m0 - m1) ** 2
    sigmaB[t] = sb
    if (sb > best) { best = sb; bt = t }
  }
  return { t: bt, sigmaB }
}
/** Integral görüntü: I[(y)(w+1)+x] = sol üst dikdörtgenin toplamı; (w+1)×(h+1). */
export function integral(g: Gray | Field): Float64Array {
  const W = g.w + 1, I = new Float64Array(W * (g.h + 1))
  for (let y = 0; y < g.h; y++) {
    let row = 0
    for (let x = 0; x < g.w; x++) { row += g.data[y * g.w + x]; I[(y + 1) * W + x + 1] = I[y * W + x + 1] + row }
  }
  return I
}
/** [x0,x1) × [y0,y1) dikdörtgeninin toplamı: dört okuma. */
export const rectSum = (I: Float64Array, w: number, x0: number, y0: number, x1: number, y1: number) => {
  const W = w + 1
  return I[y1 * W + x1] - I[y0 * W + x1] - I[y1 * W + x0] + I[y0 * W + x0]
}
/** cv2.adaptiveThreshold: piksel > (komşuluk ortalaması − C) ise 255. 'gaussian' ağırlıklı ortalama kullanır. */
export function adaptiveThreshold(g: Gray, block: number, C: number, method: 'mean' | 'gaussian' = 'mean', inv = false): Gray {
  const o = gray(g.w, g.h)
  // ortalama: kenarda yansıtmalı kutu ya da Gauss süzgeci (ayrılabilir, iki geçiş)
  const mean = method === 'gaussian' ? gaussianBlurF(g, block, 0).data : boxFilterF(g, block).data
  for (let i = 0; i < g.data.length; i++) o.data[i] = (g.data[i] > mean[i] - C) !== inv ? 255 : 0
  return o
}

// ---------------------------------------------------------------- evrişim ve süzgeçler
/** cv2.filter2D (korelasyon; OpenCV çekirdeği çevirmez), BORDER_REFLECT_101. Kayan nokta sonuç. */
export function filter2D(g: Gray | Field, k: number[], kw: number, kh: number): Field {
  const o = field(g.w, g.h), ax = Math.floor(kw / 2), ay = Math.floor(kh / 2), { w, h } = g
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let s = 0
    for (let j = 0; j < kh; j++) {
      const yy = reflect101(y + j - ay, h) * w
      for (let i = 0; i < kw; i++) { const kv = k[j * kw + i]; if (kv) s += kv * g.data[yy + reflect101(x + i - ax, w)] }
    }
    o.data[y * w + x] = s
  }
  return o
}
/** Ayrılabilir süzgeç: önce satırlar (kx), sonra sütunlar (ky). */
export function sepFilter(g: Gray | Field, kx: number[], ky: number[]): Field {
  const { w, h } = g, t = new Float32Array(w * h), o = field(w, h), ax = Math.floor(kx.length / 2), ay = Math.floor(ky.length / 2)
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let s = 0
    for (let i = 0; i < kx.length; i++) s += kx[i] * g.data[y * w + reflect101(x + i - ax, w)]
    t[y * w + x] = s
  }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let s = 0
    for (let j = 0; j < ky.length; j++) s += ky[j] * t[reflect101(y + j - ay, h) * w + x]
    o.data[y * w + x] = s
  }
  return o
}
export function fieldToU8(f: Field): Gray {
  const g = gray(f.w, f.h)
  for (let i = 0; i < f.data.length; i++) g.data[i] = Math.round(f.data[i])
  return g
}
/** cv2.getGaussianKernel: σ ≤ 0 ise σ = 0,3·((k−1)·0,5 − 1) + 0,8. Toplamı 1. */
export function gaussianKernel(ksize: number, sigma: number): number[] {
  const s = sigma > 0 ? sigma : 0.3 * ((ksize - 1) * 0.5 - 1) + 0.8, c = (ksize - 1) / 2
  const k = Array.from({ length: ksize }, (_, i) => Math.exp(-((i - c) ** 2) / (2 * s * s)))
  const sum = k.reduce((a, b) => a + b, 0)
  return k.map((v) => v / sum)
}
export const gaussianBlurF = (g: Gray | Field, ksize: number, sigma: number): Field => { const k = gaussianKernel(ksize, sigma); return sepFilter(g, k, k) }
export const gaussianBlur = (g: Gray, ksize: number, sigma: number): Gray => fieldToU8(gaussianBlurF(g, ksize, sigma))
export const boxFilterF = (g: Gray | Field, ksize: number): Field => { const k = new Array<number>(ksize).fill(1 / ksize); return sepFilter(g, k, k) }
export const boxBlur = (g: Gray, ksize: number): Gray => fieldToU8(boxFilterF(g, ksize))
/** cv2.medianBlur: k×k komşuluğun ortancası (kenarda yansıtmalı). Sütun histogramıyla değil, küçük k için sıralamayla. */
export function medianBlur(g: Gray, ksize: number): Gray {
  const o = gray(g.w, g.h), r = Math.floor(ksize / 2), { w, h } = g, buf = new Uint8Array(ksize * ksize), hist = new Uint16Array(256)
  const half = (ksize * ksize) >> 1
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    hist.fill(0)
    let n = 0
    for (let j = -r; j <= r; j++) { const yy = reflect101(y + j, h) * w; for (let i = -r; i <= r; i++) { const v = g.data[yy + reflect101(x + i, w)]; hist[v]++; buf[n++] = v } }
    let c = 0, v = 0
    for (; v < 256; v++) { c += hist[v]; if (c > half) break }
    o.data[y * w + x] = v
  }
  return o
}
export const SHARPEN = [0, -1, 0, -1, 5, -1, 0, -1, 0]
export const LAPLACE = [0, 1, 0, 1, -4, 1, 0, 1, 0]
export const EMBOSS = [-2, -1, 0, -1, 1, 1, 0, 1, 2]
/** Tuz-biber (oran) ya da Gauss (σ) gürültüsü; tohumlu, tekrarlanabilir. */
export function addNoise(src: Rgba, kind: 'none' | 'saltpepper' | 'gauss', amount: number, rnd: () => number): Rgba {
  const o = { w: src.w, h: src.h, data: new Uint8ClampedArray(src.data) }
  if (kind === 'none' || amount <= 0) return o
  for (let i = 0; i < o.data.length; i += 4) {
    if (kind === 'saltpepper') { if (rnd() < amount) { const v = rnd() < 0.5 ? 0 : 255; o.data[i] = o.data[i + 1] = o.data[i + 2] = v } }
    else {
      for (let c = 0; c < 3; c++) {
        let u = 0; while (u === 0) u = rnd()
        o.data[i + c] = o.data[i + c] + amount * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rnd())
      }
    }
  }
  return o
}
/** Tepe sinyal/gürültü oranı (dB): iki görüntü ne kadar benzer? Aynıysa ∞. */
export function psnr(a: Rgba | Gray, b: Rgba | Gray): number {
  let se = 0, n = 0
  const step = a.data.length === a.w * a.h ? 1 : 4
  for (let i = 0; i < a.data.length; i += step) for (let c = 0; c < (step === 4 ? 3 : 1); c++) { se += (a.data[i + c] - b.data[i + c]) ** 2; n++ }
  return se === 0 ? Infinity : 10 * Math.log10((255 * 255) / (se / n))
}

// ---------------------------------------------------------------- kenarlar
export function sobel(g: Gray | Field): { gx: Field; gy: Field; mag: Field } {
  const gx = sepFilter(g, [-1, 0, 1], [1, 2, 1]), gy = sepFilter(g, [1, 2, 1], [-1, 0, 1]), mag = field(g.w, g.h)
  for (let i = 0; i < mag.data.length; i++) mag.data[i] = Math.hypot(gx.data[i], gy.data[i])
  return { gx, gy, mag }
}
export interface CannySteps { blur: Gray; mag: Field; nms: Field; strong: number; weak: number; edges: Gray }
/** Canny: Gauss → Sobel → yöne göre maksimum olmayanı bastırma → çift eşik → histerezis (8-komşulu bağlantı). */
export function canny(g: Gray, lo: number, hi: number, blurK = 5, sigma = 1.4): CannySteps {
  const blur = blurK > 1 ? gaussianBlur(g, blurK, sigma) : cloneGray(g)
  const { gx, gy, mag } = sobel(blur), { w, h } = g, nms = field(w, h)
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = y * w + x, m = mag.data[i]
    if (m === 0) continue
    let a = Math.atan2(gy.data[i], gx.data[i]) * 180 / Math.PI
    if (a < 0) a += 180
    let n1: number, n2: number
    if (a < 22.5 || a >= 157.5) { n1 = mag.data[i - 1]; n2 = mag.data[i + 1] }
    else if (a < 67.5) { n1 = mag.data[i - w + 1]; n2 = mag.data[i + w - 1] }
    else if (a < 112.5) { n1 = mag.data[i - w]; n2 = mag.data[i + w] }
    else { n1 = mag.data[i - w - 1]; n2 = mag.data[i + w + 1] }
    if (m >= n1 && m > n2) nms.data[i] = m
  }
  const edges = gray(w, h), stack: number[] = []
  let strong = 0, weak = 0
  for (let i = 0; i < nms.data.length; i++) { if (nms.data[i] >= hi) { edges.data[i] = 255; stack.push(i); strong++ } else if (nms.data[i] >= lo) weak++ }
  while (stack.length) {
    const i = stack.pop()!, x = i % w, y = (i - x) / w
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const xx = x + dx, yy = y + dy
      if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue
      const j = yy * w + xx
      if (!edges.data[j] && nms.data[j] >= lo) { edges.data[j] = 255; stack.push(j) }
    }
  }
  return { blur, mag, nms, strong, weak, edges }
}
export const countNonZero = (g: Gray): number => { let n = 0; for (const v of g.data) if (v) n++; return n }

// ---------------------------------------------------------------- morfoloji
export type SeShape = 'rect' | 'ellipse' | 'cross'
/** cv2.getStructuringElement benzeri: k×k ikili maske (1 = eleman). */
export function structuring(shape: SeShape, k: number): Uint8Array {
  const m = new Uint8Array(k * k), c = (k - 1) / 2
  for (let y = 0; y < k; y++) for (let x = 0; x < k; x++) {
    m[y * k + x] = shape === 'rect' ? 1 : shape === 'cross' ? (x === Math.floor(c) || y === Math.floor(c) ? 1 : 0)
      : ((x - c) / (c + 0.5)) ** 2 + ((y - c) / (c + 0.5)) ** 2 <= 1 ? 1 : 0
  }
  return m
}
/** Aşındırma (min) ya da genişletme (max), yapı elemanı üstünde. Görüntü dışı aşındırmada 255, genişletmede 0 sayılır (OpenCV gibi). */
export function morph1(g: Gray, se: Uint8Array, k: number, op: 'erode' | 'dilate'): Gray {
  const o = gray(g.w, g.h), r = Math.floor(k / 2), { w, h } = g, er = op === 'erode'
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let v = er ? 255 : 0
    for (let j = 0; j < k; j++) {
      const yy = y + j - r
      if (yy < 0 || yy >= h) continue
      for (let i = 0; i < k; i++) {
        if (!se[j * k + i]) continue
        const xx = x + i - r
        if (xx < 0 || xx >= w) continue
        const p = g.data[yy * w + xx]
        v = er ? Math.min(v, p) : Math.max(v, p)
      }
    }
    o.data[y * w + x] = v
  }
  return o
}
export type MorphOp = 'erode' | 'dilate' | 'open' | 'close' | 'gradient' | 'tophat' | 'blackhat'
export function morphology(g: Gray, op: MorphOp, shape: SeShape, k: number, iterations = 1): Gray {
  const se = structuring(shape, k)
  const rep = (x: Gray, o: 'erode' | 'dilate') => { let r = x; for (let i = 0; i < iterations; i++) r = morph1(r, se, k, o); return r }
  const sub = (a: Gray, b: Gray) => { const o = gray(a.w, a.h); for (let i = 0; i < a.data.length; i++) o.data[i] = a.data[i] - b.data[i]; return o }
  switch (op) {
    case 'erode': return rep(g, 'erode')
    case 'dilate': return rep(g, 'dilate')
    case 'open': return rep(rep(g, 'erode'), 'dilate')
    case 'close': return rep(rep(g, 'dilate'), 'erode')
    case 'gradient': return sub(rep(g, 'dilate'), rep(g, 'erode'))
    case 'tophat': return sub(g, rep(rep(g, 'erode'), 'dilate'))
    case 'blackhat': return sub(rep(rep(g, 'dilate'), 'erode'), g)
  }
}
