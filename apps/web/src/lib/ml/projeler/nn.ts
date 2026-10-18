// Projeler için küçük, genel çok katmanlı ağ: sinir ağı ve geri yayılım derslerindeki ağın genellemesi. Katman boyları serbest,
// gizli katmanlar tanh, çıkış doğrusal ya da tanh. Bütün ağırlıklar tek bir Float64Array'de: nöroevrimde kopyalamak ve bozmak kolay.
// Yerleşim: her katman için önce girdi × çıktı ağırlık (satır satır, w[i·çıktı + j]), sonra çıktı kadar sapma.
import { gauss } from '../core'

export interface NN { sizes: number[]; w: Float64Array; out: 'linear' | 'tanh' }

export const nnParamCount = (sizes: number[]): number => sizes.slice(1).reduce((s, b, l) => s + sizes[l] * b + b, 0)

/** Xavier benzeri başlangıç: gauss × √(1 / girdi sayısı), sapmalar sıfır. */
export function nnCreate(sizes: number[], r: () => number, out: NN['out'] = 'linear'): NN {
  const w = new Float64Array(nnParamCount(sizes))
  let o = 0
  for (let l = 1; l < sizes.length; l++) {
    const a = sizes[l - 1], b = sizes[l], s = Math.sqrt(1 / a)
    for (let k = 0; k < a * b; k++) w[o++] = gauss(r) * s
    o += b
  }
  return { sizes: [...sizes], w, out }
}

export const nnClone = (n: NN): NN => ({ sizes: [...n.sizes], w: new Float64Array(n.w), out: n.out })

/** İleri hesap; `acts` verilirse her katmanın çıktısı oraya yazılır (geri yayılım için). */
export function nnForward(n: NN, x: ArrayLike<number>, acts?: Float64Array[]): Float64Array {
  let a = Float64Array.from(x as ArrayLike<number>)
  if (acts) acts[0] = a
  let o = 0
  const L = n.sizes.length - 1
  for (let l = 1; l <= L; l++) {
    const ni = n.sizes[l - 1], no = n.sizes[l]
    const z = new Float64Array(no)
    for (let j = 0; j < no; j++) z[j] = n.w[o + ni * no + j]
    for (let i = 0; i < ni; i++) { const ai = a[i]; if (ai === 0) continue; const row = o + i * no; for (let j = 0; j < no; j++) z[j] += ai * n.w[row + j] }
    o += ni * no + no
    if (l < L || n.out === 'tanh') for (let j = 0; j < no; j++) z[j] = Math.tanh(z[j])
    a = z
    if (acts) acts[l] = a
  }
  return a
}

export interface Adam { m: Float64Array; v: Float64Array; t: number }
export const adamState = (n: NN): Adam => ({ m: new Float64Array(n.w.length), v: new Float64Array(n.w.length), t: 0 })

/**
 * Bir mini grup üzerinde ortalama kare hata, geri yayılım ve tek Adam adımı. Dönüş: adımdan önceki kayıp.
 * Kayıp = gruptaki bütün çıktıların (tahmin − hedef)² ortalaması.
 */
export function nnTrainBatch(n: NN, opt: Adam, X: ArrayLike<number>[], Y: ArrayLike<number>[], lr: number): number {
  const g = new Float64Array(n.w.length)
  const L = n.sizes.length - 1, K = n.sizes[L], B = X.length
  let loss = 0
  const acts: Float64Array[] = []
  const offs: number[] = []
  for (let l = 1, o = 0; l <= L; l++) { offs[l] = o; o += n.sizes[l - 1] * n.sizes[l] + n.sizes[l] }
  for (let b = 0; b < B; b++) {
    const out = nnForward(n, X[b], acts)
    let d = new Float64Array(K)
    for (let k = 0; k < K; k++) {
      const e = out[k] - Y[b][k]
      loss += e * e
      d[k] = (2 * e) / (B * K) * (n.out === 'tanh' ? 1 - out[k] * out[k] : 1)
    }
    for (let l = L; l >= 1; l--) {
      const ni = n.sizes[l - 1], no = n.sizes[l], o = offs[l], a = acts[l - 1]
      for (let j = 0; j < no; j++) g[o + ni * no + j] += d[j]
      const prev = new Float64Array(ni)
      for (let i = 0; i < ni; i++) {
        const row = o + i * no
        let s = 0
        for (let j = 0; j < no; j++) { g[row + j] += a[i] * d[j]; s += n.w[row + j] * d[j] }
        prev[i] = l > 1 ? s * (1 - a[i] * a[i]) : s
      }
      d = prev
    }
  }
  opt.t++
  const c1 = 1 - 0.9 ** opt.t, c2 = 1 - 0.999 ** opt.t
  for (let i = 0; i < n.w.length; i++) {
    opt.m[i] = 0.9 * opt.m[i] + 0.1 * g[i]
    opt.v[i] = 0.999 * opt.v[i] + 0.001 * g[i] * g[i]
    n.w[i] -= (lr * (opt.m[i] / c1)) / (Math.sqrt(opt.v[i] / c2) + 1e-8)
  }
  return loss / (B * K)
}

/** Nöroevrim: kopyanın her ağırlığı `rate` olasılıkla gauss × sigma kadar bozulur. */
export function nnMutate(n: NN, r: () => number, sigma: number, rate = 1): NN {
  const c = nnClone(n)
  for (let i = 0; i < c.w.length; i++) if (r() < rate) c.w[i] += gauss(r) * sigma
  return c
}
