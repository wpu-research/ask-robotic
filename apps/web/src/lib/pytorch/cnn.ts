// PyTorch dersi: bitirme projesinin küçük CNN'i tarayıcıda (saf TypeScript, testli). Ağırlıklar PyTorch'ta eğitilip JSON'a
// yazıldı (scripts/pytorch/mnist-agirlik.py; bitirme defteriyle aynı mimari): Conv2d(1,8,3,p=1) → ReLU → MaxPool2d(2) →
// Conv2d(8,16,3,p=1) → ReLU → MaxPool2d(2) → Flatten → Linear(784,10). Bellek düzeni PyTorch'unki: [C, H, W], ağırlık
// [out, in, kh, kw], Linear [out, in]. Ayrıca MNIST tarzı ön işleme ve int8 nicemleme (dağıtım ünitesi) burada.

export interface CnnWeights { mean: number; std: number; testAcc?: number; conv1: { w: number[]; b: number[] }; conv2: { w: number[]; b: number[] }; fc: { w: number[]; b: number[] } }
export interface Fm { c: number; h: number; w: number; data: Float32Array }

/** nn.Conv2d (çapraz korelasyon, sıfır dolgu p, adım 1). */
export function conv2d(x: Fm, w: ArrayLike<number>, b: ArrayLike<number>, cout: number, k = 3, p = 1): Fm {
  const h = x.h + 2 * p - k + 1, wd = x.w + 2 * p - k + 1, o = new Float32Array(cout * h * wd)
  for (let co = 0; co < cout; co++) for (let y = 0; y < h; y++) for (let xx = 0; xx < wd; xx++) {
    let s = b[co]
    for (let ci = 0; ci < x.c; ci++) for (let ky = 0; ky < k; ky++) {
      const iy = y + ky - p
      if (iy < 0 || iy >= x.h) continue
      for (let kx = 0; kx < k; kx++) {
        const ix = xx + kx - p
        if (ix < 0 || ix >= x.w) continue
        s += w[((co * x.c + ci) * k + ky) * k + kx] * x.data[(ci * x.h + iy) * x.w + ix]
      }
    }
    o[(co * h + y) * wd + xx] = s
  }
  return { c: cout, h, w: wd, data: o }
}
export const relu = (x: Fm): Fm => ({ ...x, data: x.data.map((v) => (v > 0 ? v : 0)) })
export function maxpool2(x: Fm): Fm {
  const h = Math.floor(x.h / 2), w = Math.floor(x.w / 2), o = new Float32Array(x.c * h * w)
  for (let c = 0; c < x.c; c++) for (let y = 0; y < h; y++) for (let xx = 0; xx < w; xx++) {
    const i = (c * x.h + 2 * y) * x.w + 2 * xx
    o[(c * h + y) * w + xx] = Math.max(x.data[i], x.data[i + 1], x.data[i + x.w], x.data[i + x.w + 1])
  }
  return { c: x.c, h, w, data: o }
}
export function linear(x: ArrayLike<number>, w: ArrayLike<number>, b: ArrayLike<number>): number[] {
  const out = b.length, n = x.length, o: number[] = []
  for (let j = 0; j < out; j++) { let s = b[j]; for (let i = 0; i < n; i++) s += w[j * n + i] * x[i]; o.push(s) }
  return o
}
export function softmax(z: number[]): number[] { const m = Math.max(...z), e = z.map((v) => Math.exp(v - m)), s = e.reduce((a, b) => a + b, 0); return e.map((v) => v / s) }

export interface CnnTrace { input: Fm; c1: Fm; p1: Fm; c2: Fm; p2: Fm; logits: number[]; probs: number[]; pred: number }
/** 28×28 gri (0–255, siyah zemin beyaz rakam, MNIST gibi) → olasılıklar ve tüm ara öznitelik haritaları. */
export function runCnn(W: CnnWeights, px: ArrayLike<number>): CnnTrace {
  const d = new Float32Array(784)
  for (let i = 0; i < 784; i++) d[i] = (px[i] / 255 - W.mean) / W.std
  const input: Fm = { c: 1, h: 28, w: 28, data: d }
  const c1 = relu(conv2d(input, W.conv1.w, W.conv1.b, 8)), p1 = maxpool2(c1)
  const c2 = relu(conv2d(p1, W.conv2.w, W.conv2.b, 16)), p2 = maxpool2(c2)
  const logits = linear(p2.data, W.fc.w, W.fc.b), probs = softmax(logits)
  return { input, c1, p1, c2, p2, logits, probs, pred: probs.indexOf(Math.max(...probs)) }
}
export const paramCount = (W: CnnWeights) => W.conv1.w.length + W.conv1.b.length + W.conv2.w.length + W.conv2.b.length + W.fc.w.length + W.fc.b.length

// ---------------------------------------------------------------- MNIST tarzı ön işleme
/** Çizim (n×n, 0–255, beyaz rakam siyah zemin) → 28×28: kutuya kırp, uzun kenarı 20 piksele sığdır, kütle merkezini ortala. */
export function toMnist(src: ArrayLike<number>, n: number): Uint8ClampedArray {
  let x0 = n, y0 = n, x1 = -1, y1 = -1
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (src[y * n + x] > 20) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y }
  const out = new Uint8ClampedArray(784)
  if (x1 < 0) return out
  const bw = x1 - x0 + 1, bh = y1 - y0 + 1, sc = 20 / Math.max(bw, bh), tw = Math.max(1, Math.round(bw * sc)), th = Math.max(1, Math.round(bh * sc))
  // alan ortalamasıyla küçült (kutu filtresi): her hedef piksel kaynağın kapladığı bölgenin ortalaması
  const small = new Float32Array(tw * th)
  for (let y = 0; y < th; y++) for (let x = 0; x < tw; x++) {
    const sx0 = x0 + x / sc, sy0 = y0 + y / sc, sx1 = x0 + (x + 1) / sc, sy1 = y0 + (y + 1) / sc
    let s = 0, c = 0
    for (let yy = Math.floor(sy0); yy < Math.ceil(sy1); yy++) for (let xx = Math.floor(sx0); xx < Math.ceil(sx1); xx++) { if (xx >= 0 && yy >= 0 && xx < n && yy < n) { s += src[yy * n + xx]; c++ } }
    small[y * tw + x] = c ? s / c : 0
  }
  let mx = 0, my = 0, m = 0
  for (let y = 0; y < th; y++) for (let x = 0; x < tw; x++) { const v = small[y * tw + x]; mx += v * x; my += v * y; m += v }
  const ox = Math.round(14 - (m ? mx / m : tw / 2)), oy = Math.round(14 - (m ? my / m : th / 2))
  for (let y = 0; y < th; y++) for (let x = 0; x < tw; x++) { const X = x + ox, Y = y + oy; if (X >= 0 && Y >= 0 && X < 28 && Y < 28) out[Y * 28 + X] = Math.min(255, small[y * tw + x]) }
  return out
}

// ---------------------------------------------------------------- int8 nicemleme (dağıtım)
/** Tensör başına simetrik int8: ölçek = max|w|/127, q = round(w/ölçek). Geri çevrilmiş (dequantize) ağırlıklarla çalışılır. */
export function quantize(w: number[]): { q: Int8Array; scale: number; deq: number[] } {
  const mx = Math.max(1e-12, ...w.map(Math.abs)), scale = mx / 127
  const q = Int8Array.from(w.map((v) => Math.max(-127, Math.min(127, Math.round(v / scale)))))
  return { q, scale, deq: Array.from(q, (v) => v * scale) }
}
export function quantizeWeights(W: CnnWeights): { W: CnnWeights; bytesFp32: number; bytesInt8: number; maxErr: number } {
  let maxErr = 0
  const qq = (ws: number[]) => { const r = quantize(ws); ws.forEach((v, i) => { maxErr = Math.max(maxErr, Math.abs(v - r.deq[i])) }); return r.deq }
  const out: CnnWeights = { ...W, conv1: { w: qq(W.conv1.w), b: W.conv1.b }, conv2: { w: qq(W.conv2.w), b: W.conv2.b }, fc: { w: qq(W.fc.w), b: W.fc.b } }
  const nw = W.conv1.w.length + W.conv2.w.length + W.fc.w.length, nb = W.conv1.b.length + W.conv2.b.length + W.fc.b.length
  // int8: ağırlık başına 1 bayt + tensör başına 4 baytlık ölçek; bias fp32 kalır
  return { W: out, bytesFp32: 4 * (nw + nb), bytesInt8: nw + 3 * 4 + 4 * nb, maxErr }
}

/** mnist-test-200.bin: ilk N bayt etiket, sonra N × 784 piksel. */
export function parseTestBin(buf: ArrayBuffer | Uint8Array, n = 200): Array<{ label: number; px: Uint8Array }> {
  const u = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  return Array.from({ length: n }, (_, i) => ({ label: u[i], px: u.subarray(n + i * 784, n + (i + 1) * 784) }))
}
export function accuracy(W: CnnWeights, set: Array<{ label: number; px: ArrayLike<number> }>): number {
  let ok = 0
  for (const s of set) if (runCnn(W, s.px).pred === s.label) ok++
  return ok / set.length
}
