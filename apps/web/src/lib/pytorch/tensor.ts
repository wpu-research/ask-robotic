// PyTorch dersi: tensör şekil kuralları (yayınlama, matmul, view/reshape), DataLoader yığınlama ve evrişim aritmetiği.
// Saf ve testli; hata iletileri PyTorch'un gerçek iletilerinin özünü taşır (sürümden sürüme küçük farklar olabilir).

export type Shape = number[]
export type ShapeResult = { ok: true; shape: Shape; note?: string } | { ok: false; error: string }

/** "2, 3, 4" ya da "(2,3,4)" ya da "[2 3 4]" → [2, 3, 4]. Boş → [] (skaler). -1 yalnız view için anlamlı. */
export function parseShape(s: string): Shape | null {
  const t = s.replace(/[()[\]]/g, ' ').trim()
  if (!t) return []
  const parts = t.split(/[\s,×x*]+/).filter(Boolean)
  const out = parts.map(Number)
  return out.every((v) => Number.isInteger(v) && v >= -1) ? out : null
}
export const fmtShape = (s: Shape) => `torch.Size([${s.join(', ')}])`
export const numel = (s: Shape) => s.reduce((a, b) => a * b, 1)

/** Yayınlama: boyutlar sağdan hizalanır; her çift ya eşit ya biri 1 olmalı. */
export function broadcast(a: Shape, b: Shape): ShapeResult {
  const n = Math.max(a.length, b.length), out: Shape = []
  for (let i = 1; i <= n; i++) {
    const x = a[a.length - i] ?? 1, y = b[b.length - i] ?? 1
    if (x !== y && x !== 1 && y !== 1) {
      return { ok: false, error: `RuntimeError: The size of tensor a (${x}) must match the size of tensor b (${y}) at non-singleton dimension ${n - i}` }
    }
    out.unshift(Math.max(x, y))
  }
  return { ok: true, shape: out }
}

/** torch.matmul kuralları: 1B·1B skaler; 2B·2B (n×m)(m×p); daha yüksek boyutta son iki boyut matris, öncekiler yayınlanır. */
export function matmul(a: Shape, b: Shape): ShapeResult {
  if (!a.length || !b.length) return { ok: false, error: 'RuntimeError: both arguments to matmul need to be at least 1D' }
  const A = a.length === 1 ? [1, a[0]] : a, B = b.length === 1 ? [b[0], 1] : b
  const k1 = A[A.length - 1], k2 = B[B.length - 2]
  if (k1 !== k2) {
    const r1 = A.slice(-2).join('x'), r2 = B.slice(-2).join('x')
    return { ok: false, error: `RuntimeError: mat1 and mat2 shapes cannot be multiplied (${r1} and ${r2})` }
  }
  const batch = broadcast(A.slice(0, -2), B.slice(0, -2))
  if (!batch.ok) return batch
  const out = [...batch.shape, A[A.length - 2], B[B.length - 1]]
  // 1B girdilerin eklenen boyutu çıkarılır
  if (a.length === 1) out.splice(out.length - 2, 1)
  if (b.length === 1) out.splice(out.length - 1, 1)
  return { ok: true, shape: out }
}

/** view/reshape: en fazla bir -1; eleman sayısı korunmalı. `contiguous` false ise view hata verir, reshape kopyalar. */
export function view(src: Shape, target: Shape, contiguous = true, kind: 'view' | 'reshape' = 'view'): ShapeResult {
  const neg = target.filter((v) => v === -1).length
  if (neg > 1) return { ok: false, error: 'RuntimeError: only one dimension can be inferred' }
  const n = numel(src), known = numel(target.filter((v) => v !== -1))
  let out = target
  if (neg) {
    if (known === 0 || n % known) return { ok: false, error: `RuntimeError: shape '[${target.join(', ')}]' is invalid for input of size ${n}` }
    out = target.map((v) => (v === -1 ? n / known : v))
  }
  if (numel(out) !== n) return { ok: false, error: `RuntimeError: shape '[${target.join(', ')}]' is invalid for input of size ${n}` }
  if (kind === 'view' && !contiguous) return { ok: false, error: 'RuntimeError: view size is not compatible with input tensor\'s size and stride (at least one dimension spans across two contiguous subspaces). Use .reshape(...) instead.' }
  return { ok: true, shape: out, note: kind === 'reshape' && !contiguous ? 'reshape: bellek bitişik değil, kopya oluşturuldu / not contiguous, a copy was made' : undefined }
}

// ---------------------------------------------------------------- DataLoader
/** Tohumlu permütasyon (Fisher–Yates, LCG). torch.randperm ile aynı sıra değil; aynı tohum hep aynı sırayı verir. */
export function permutation(n: number, seed: number): number[] {
  let s = seed >>> 0
  const r = () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 2 ** 32)
  const p = Array.from({ length: n }, (_, i) => i)
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [p[i], p[j]] = [p[j], p[i]] }
  return p
}
/** Bir turun (epoch) yığınları: shuffle açıksa her tur farklı tohumla karıştırılır (tohum + tur). */
export function batches(n: number, batchSize: number, o: { shuffle?: boolean; dropLast?: boolean; seed?: number; epoch?: number } = {}): number[][] {
  const idx = o.shuffle ? permutation(n, (o.seed ?? 0) * 7919 + (o.epoch ?? 0) + 1) : Array.from({ length: n }, (_, i) => i)
  const out: number[][] = []
  for (let i = 0; i < n; i += batchSize) out.push(idx.slice(i, i + batchSize))
  if (o.dropLast && out.length && out[out.length - 1].length < batchSize) out.pop()
  return out
}
/** len(DataLoader): drop_last'e göre ⌈N/B⌉ ya da ⌊N/B⌋. */
export const stepsPerEpoch = (n: number, b: number, dropLast = false) => (dropLast ? Math.floor(n / b) : Math.ceil(n / b))

// ---------------------------------------------------------------- evrişim aritmetiği
/** nn.Conv2d / MaxPool2d çıkış boyu: ⌊(n + 2p − d(k − 1) − 1) / s⌋ + 1. Geçersizse 0 ya da negatif çıkar. */
export const convOut = (n: number, k: number, s = 1, p = 0, d = 1) => Math.floor((n + 2 * p - d * (k - 1) - 1) / s) + 1
/** Çıkış hücresi (i) için girdideki çekirdek konumları (dolgu dahil koordinatlarda, 0 tabanlı: −p … n+p−1). */
export const receptive = (i: number, k: number, s = 1, p = 0, d = 1) => Array.from({ length: k }, (_, j) => i * s - p + j * d)
/** Conv2d parametre sayısı: out·(in·k·k) + out (bias). */
export const convParams = (cin: number, cout: number, k: number, bias = true) => cout * cin * k * k + (bias ? cout : 0)
