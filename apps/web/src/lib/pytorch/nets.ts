// PyTorch dersi: katman şekilleri ve parametre sayıları (torchinfo özeti gibi), optimize ediciler (SGD, Momentum, RMSprop,
// Adam; torch.optim'in güncelleme kurallarıyla), tarayıcıda gerçekten eğitilen küçük çok katmanlı ağ (Adam + ikili çapraz
// entropi, eğitim/doğrulama ayrımı, dropout, ağırlık sönümü, erken durdurma). Saf ve testli; aynı tohum aynı eğriyi verir.
import { moons } from '@/lib/ml/mlp'
import { convOut, convParams } from './tensor'

// ---------------------------------------------------------------- katmanlar
export type Layer =
  | { kind: 'Linear'; in: number; out: number }
  | { kind: 'Conv2d'; in: number; out: number; k: number; s: number; p: number }
  | { kind: 'MaxPool2d'; k: number; s: number }
  | { kind: 'ReLU' } | { kind: 'Flatten' } | { kind: 'Dropout'; p: number } | { kind: 'BatchNorm2d'; c: number }

export const layerText = (l: Layer): string => {
  switch (l.kind) {
    case 'Linear': return `nn.Linear(${l.in}, ${l.out})`
    case 'Conv2d': return `nn.Conv2d(${l.in}, ${l.out}, ${l.k}${l.s !== 1 ? `, stride=${l.s}` : ''}${l.p ? `, padding=${l.p}` : ''})`
    case 'MaxPool2d': return `nn.MaxPool2d(${l.k}${l.s !== l.k ? `, stride=${l.s}` : ''})`
    case 'Dropout': return `nn.Dropout(${l.p})`
    case 'BatchNorm2d': return `nn.BatchNorm2d(${l.c})`
    default: return `nn.${l.kind}()`
  }
}
export interface LayerRow { layer: Layer; out: number[] | null; params: number; error?: string }
/** Girdi şekli (yığın boyutu hariç, ör. [1, 28, 28]) üstünden katman katman çıkış şekli ve parametre sayısı. */
export function summary(input: number[], layers: Layer[]): { rows: LayerRow[]; total: number; ok: boolean } {
  let s: number[] | null = input
  const rows: LayerRow[] = []
  for (const l of layers) {
    if (!s) { rows.push({ layer: l, out: null, params: 0 }); continue }
    let out: number[] | null = null, params = 0, error: string | undefined
    switch (l.kind) {
      case 'Linear':
        params = l.in * l.out + l.out
        if (s[s.length - 1] !== l.in) error = `RuntimeError: mat1 and mat2 shapes cannot be multiplied (N×${s[s.length - 1]} and ${l.in}×${l.out})`
        else out = [...s.slice(0, -1), l.out]
        break
      case 'Conv2d': {
        params = convParams(l.in, l.out, l.k)
        if (s.length !== 3) { error = `RuntimeError: Expected 3D (unbatched) or 4D (batched) input to conv2d, but got input of size: [N, ${s.join(', ')}]`; break }
        if (s[0] !== l.in) { error = `RuntimeError: expected input to have ${l.in} channels, but got ${s[0]} channels instead`; break }
        const h = convOut(s[1], l.k, l.s, l.p), w = convOut(s[2], l.k, l.s, l.p)
        if (h <= 0 || w <= 0) error = 'RuntimeError: Kernel size can\'t be greater than actual input size'
        else out = [l.out, h, w]
        break
      }
      case 'MaxPool2d': {
        if (s.length !== 3) { error = 'RuntimeError: MaxPool2d expects a 3D or 4D input'; break }
        const h = convOut(s[1], l.k, l.s), w = convOut(s[2], l.k, l.s)
        if (h <= 0 || w <= 0) error = 'RuntimeError: Output size is too small'
        else out = [s[0], h, w]
        break
      }
      case 'BatchNorm2d':
        params = 2 * l.c
        if (s.length !== 3 || s[0] !== l.c) error = `RuntimeError: running_mean should contain ${s[0]} elements not ${l.c}`
        else out = s
        break
      case 'Flatten': out = [s.reduce((a, b) => a * b, 1)]; break
      default: out = s
    }
    rows.push({ layer: l, out, params, error })
    s = out
  }
  return { rows, total: rows.reduce((a, r) => a + r.params, 0), ok: rows.every((r) => !r.error) }
}

// ---------------------------------------------------------------- optimize ediciler (2B yüzeyde)
export type OptK = 'sgd' | 'momentum' | 'rmsprop' | 'adam'
export const OPTS: OptK[] = ['sgd', 'momentum', 'rmsprop', 'adam']
export type Surface = 'valley' | 'rosenbrock' | 'saddle'
/** f ve ∇f. Vadi: x yönünde sığ, y yönünde dik (koşul sayısı 25). */
export function surf(k: Surface, x: number, y: number): { f: number; gx: number; gy: number } {
  if (k === 'valley') return { f: 0.04 * x * x + y * y, gx: 0.08 * x, gy: 2 * y }
  if (k === 'saddle') return { f: 0.5 * x * x - 0.25 * y * y + 0.02 * y ** 4, gx: x, gy: -0.5 * y + 0.08 * y ** 3 }
  const a = 1, b = 10
  return { f: (a - x) ** 2 + b * (y - x * x) ** 2, gx: -2 * (a - x) - 4 * b * x * (y - x * x), gy: 2 * b * (y - x * x) }
}
export const SURF_START: Record<Surface, [number, number]> = { valley: [-8, 1.6], rosenbrock: [-1.5, 2], saddle: [-3, 0.05] }
export const SURF_MIN: Record<Surface, [number, number]> = { valley: [0, 0], rosenbrock: [1, 1], saddle: [0, 2.5] }

/** torch.optim güncellemeleri (varsayılan β'larla). Her optimize edici için yörünge [x, y, f]. */
export function optimize(k: OptK, s: Surface, lr: number, steps: number, start = SURF_START[s]): Array<[number, number, number]> {
  let [x, y] = start
  let vx = 0, vy = 0, mx = 0, my = 0, sx = 0, sy = 0
  const mom = 0.9, b1 = 0.9, b2 = 0.999, alpha = 0.99, eps = 1e-8
  const out: Array<[number, number, number]> = [[x, y, surf(s, x, y).f]]
  for (let t = 1; t <= steps; t++) {
    const { gx, gy } = surf(s, x, y)
    if (k === 'sgd') { x -= lr * gx; y -= lr * gy }
    else if (k === 'momentum') { vx = mom * vx + gx; vy = mom * vy + gy; x -= lr * vx; y -= lr * vy }
    else if (k === 'rmsprop') { sx = alpha * sx + (1 - alpha) * gx * gx; sy = alpha * sy + (1 - alpha) * gy * gy; x -= (lr * gx) / (Math.sqrt(sx) + eps); y -= (lr * gy) / (Math.sqrt(sy) + eps) }
    else {
      mx = b1 * mx + (1 - b1) * gx; my = b1 * my + (1 - b1) * gy; sx = b2 * sx + (1 - b2) * gx * gx; sy = b2 * sy + (1 - b2) * gy * gy
      const mh = 1 - b1 ** t, vh = 1 - b2 ** t
      x -= (lr * (mx / mh)) / (Math.sqrt(sx / vh) + eps); y -= (lr * (my / mh)) / (Math.sqrt(sy / vh) + eps)
    }
    if (!Number.isFinite(x) || !Number.isFinite(y) || Math.abs(x) > 1e6 || Math.abs(y) > 1e6) { out.push([NaN, NaN, NaN]); break }
    out.push([x, y, surf(s, x, y).f])
  }
  return out
}

// ---------------------------------------------------------------- küçük ağ, gerçek eğitim
function lcg(seed: number) { let s = seed >>> 0; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 2 ** 32) }
function gauss(r: () => number) { let u = 0; while (!u) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r()) }

export interface Pt { x: number; y: number; c: number }
export interface TrainOpts { hidden: number[]; lr: number; epochs: number; batch: number; seed: number; dropout?: number; weightDecay?: number; earlyStop?: number; noise?: number; nTrain?: number; nVal?: number }
export interface Epoch { epoch: number; trainLoss: number; valLoss: number; trainAcc: number; valAcc: number }
export interface Mlp { W: number[][][]; b: number[][] }
export interface TrainResult { history: Epoch[]; net: Mlp; best: Mlp; bestEpoch: number; stoppedAt: number | null; train: Pt[]; val: Pt[] }

/** İki ay verisi, gürültü eklenmiş; eğitim ve doğrulama ayrı tohumla (sızıntı yok). */
export function splitMoons(nTrain: number, nVal: number, noise: number, seed: number): { train: Pt[]; val: Pt[] } {
  const r = lcg(seed * 31 + 7)
  const jitter = (p: Pt): Pt => ({ x: p.x + noise * gauss(r), y: p.y + noise * gauss(r), c: p.c })
  return { train: moons(seed + 1, nTrain).map(jitter), val: moons(seed + 1000, nVal).map(jitter) }
}
/** Kaiming-uniform benzeri başlatma (nn.Linear varsayılanına yakın): U(−1/√in, 1/√in). */
export function initMlp(sizes: number[], seed: number): Mlp {
  const r = lcg(seed), W: number[][][] = [], b: number[][] = []
  for (let l = 0; l + 1 < sizes.length; l++) {
    const k = 1 / Math.sqrt(sizes[l])
    W.push(Array.from({ length: sizes[l + 1] }, () => Array.from({ length: sizes[l] }, () => (r() * 2 - 1) * k)))
    b.push(Array.from({ length: sizes[l + 1] }, () => (r() * 2 - 1) * k))
  }
  return { W, b }
}
const sigmoid = (z: number) => 1 / (1 + Math.exp(-z))
/** İleri geçiş; `mask` verilirse dropout (eğitim kipi, ters ölçekli: model.train()). Çıkış: logit ve ara aktivasyonlar. */
export function mlpForward(net: Mlp, x: number[], mask?: number[][]): { acts: number[][]; logit: number } {
  const acts = [x]
  let a = x
  for (let l = 0; l < net.W.length; l++) {
    const z = net.W[l].map((row, j) => row.reduce((s, w, i) => s + w * a[i], net.b[l][j]))
    if (l === net.W.length - 1) return { acts, logit: z[0] }
    a = z.map((v, j) => Math.max(0, v) * (mask ? mask[l][j] : 1))
    acts.push(a)
  }
  return { acts, logit: 0 }
}
export const predict = (net: Mlp, x: number, y: number) => sigmoid(mlpForward(net, [x, y]).logit)
const bce = (p: number, c: number) => -(c * Math.log(Math.max(p, 1e-7)) + (1 - c) * Math.log(Math.max(1 - p, 1e-7)))
export function evaluate(net: Mlp, pts: Pt[]): { loss: number; acc: number } {
  let loss = 0, ok = 0
  for (const p of pts) { const q = predict(net, p.x, p.y); loss += bce(q, p.c); if ((q > 0.5 ? 1 : 0) === p.c) ok++ }
  return { loss: loss / pts.length, acc: ok / pts.length }
}
const clone = (n: Mlp): Mlp => ({ W: n.W.map((m) => m.map((r) => [...r])), b: n.b.map((r) => [...r]) })

/** Gerçek eğitim döngüsü: her tur karıştır, yığınlar, ileri/geri, AdamW benzeri güncelleme (weight_decay ayrık), doğrula. */
export function trainMlp(o: TrainOpts): TrainResult {
  const { train, val } = splitMoons(o.nTrain ?? 200, o.nVal ?? 200, o.noise ?? 0.1, o.seed)
  const sizes = [2, ...o.hidden, 1], net = initMlp(sizes, o.seed + 3), r = lcg(o.seed + 5)
  const m = net.W.map((L) => L.map((row) => row.map(() => 0))), v = net.W.map((L) => L.map((row) => row.map(() => 0)))
  const mb = net.b.map((row) => row.map(() => 0)), vb = net.b.map((row) => row.map(() => 0))
  const b1 = 0.9, b2 = 0.999, eps = 1e-8, wd = o.weightDecay ?? 0, pDrop = o.dropout ?? 0
  const history: Epoch[] = []
  let t = 0, best = clone(net), bestVal = Infinity, bestEpoch = 0, since = 0, stoppedAt: number | null = null
  for (let ep = 1; ep <= o.epochs; ep++) {
    const order = train.map((_, i) => i)
    for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [order[i], order[j]] = [order[j], order[i]] }
    for (let s0 = 0; s0 < order.length; s0 += o.batch) {
      const idx = order.slice(s0, s0 + o.batch)
      const gW = net.W.map((L) => L.map((row) => row.map(() => 0))), gb = net.b.map((row) => row.map(() => 0))
      for (const k of idx) {
        const p = train[k]
        const mask = pDrop > 0 ? o.hidden.map((h) => Array.from({ length: h }, () => (r() < pDrop ? 0 : 1 / (1 - pDrop)))) : undefined
        const { acts, logit } = mlpForward(net, [p.x, p.y], mask)
        let delta = [sigmoid(logit) - p.c] // ∂L/∂logit (BCEWithLogits)
        for (let l = net.W.length - 1; l >= 0; l--) {
          const a = acts[l]
          for (let j = 0; j < delta.length; j++) { gb[l][j] += delta[j]; for (let i = 0; i < a.length; i++) gW[l][j][i] += delta[j] * a[i] }
          if (l > 0) {
            const prev = new Array<number>(a.length).fill(0)
            for (let j = 0; j < delta.length; j++) for (let i = 0; i < a.length; i++) prev[i] += net.W[l][j][i] * delta[j]
            // ReLU türevi (ve dropout maskesi): aktivasyon 0 ise geçmez
            delta = prev.map((g, i) => (a[i] > 0 ? g * (mask ? mask[l - 1][i] : 1) : 0))
          }
        }
      }
      t++
      const nb = idx.length, mh = 1 - b1 ** t, vh = 1 - b2 ** t
      for (let l = 0; l < net.W.length; l++) {
        for (let j = 0; j < net.W[l].length; j++) {
          for (let i = 0; i < net.W[l][j].length; i++) {
            const g = gW[l][j][i] / nb
            m[l][j][i] = b1 * m[l][j][i] + (1 - b1) * g; v[l][j][i] = b2 * v[l][j][i] + (1 - b2) * g * g
            net.W[l][j][i] -= o.lr * ((m[l][j][i] / mh) / (Math.sqrt(v[l][j][i] / vh) + eps) + wd * net.W[l][j][i])
          }
          const g = gb[l][j] / nb
          mb[l][j] = b1 * mb[l][j] + (1 - b1) * g; vb[l][j] = b2 * vb[l][j] + (1 - b2) * g * g
          net.b[l][j] -= o.lr * ((mb[l][j] / mh) / (Math.sqrt(vb[l][j] / vh) + eps))
        }
      }
    }
    const tr = evaluate(net, train), va = evaluate(net, val)
    history.push({ epoch: ep, trainLoss: tr.loss, valLoss: va.loss, trainAcc: tr.acc, valAcc: va.acc })
    if (va.loss < bestVal - 1e-4) { bestVal = va.loss; best = clone(net); bestEpoch = ep; since = 0 } else since++
    if (o.earlyStop && since >= o.earlyStop) { stoppedAt = ep; break }
  }
  return { history, net, best, bestEpoch, stoppedAt, train, val }
}
