// PyTorch dersi: autograd'ın yaptığını küçük bir hesaplama grafiğinde adım adım yapar (saf, testli). Tek nöron:
// z = w1·x1 + w2·x2 + b, y = tanh(z), L = (y − t)². İleri geçiş düğüm değerlerini, geri geçiş zincir kuralıyla her düğümün
// ∂L/∂düğüm değerini (PyTorch'taki .grad) topolojik sıranın tersinde doldurur. Sonuç merkezî farkla (sayısal türev) doğrulanır.

export type NodeId = 'x1' | 'w1' | 'x2' | 'w2' | 'b' | 't' | 'm1' | 'm2' | 's' | 'z' | 'y' | 'd' | 'L'
export interface GNode { id: NodeId; op: 'leaf' | 'mul' | 'add' | 'tanh' | 'sub' | 'sq'; inputs: NodeId[]; label: string; leaf?: boolean; requiresGrad?: boolean }

/** Topolojik sırada düğümler. Yapraklar: girdiler (x), parametreler (w, b) ve hedef (t). */
export const GRAPH: GNode[] = [
  { id: 'x1', op: 'leaf', inputs: [], label: 'x₁', leaf: true },
  { id: 'w1', op: 'leaf', inputs: [], label: 'w₁', leaf: true, requiresGrad: true },
  { id: 'x2', op: 'leaf', inputs: [], label: 'x₂', leaf: true },
  { id: 'w2', op: 'leaf', inputs: [], label: 'w₂', leaf: true, requiresGrad: true },
  { id: 'b', op: 'leaf', inputs: [], label: 'b', leaf: true, requiresGrad: true },
  { id: 't', op: 'leaf', inputs: [], label: 't', leaf: true },
  { id: 'm1', op: 'mul', inputs: ['w1', 'x1'], label: 'w₁·x₁' },
  { id: 'm2', op: 'mul', inputs: ['w2', 'x2'], label: 'w₂·x₂' },
  { id: 's', op: 'add', inputs: ['m1', 'm2'], label: '+' },
  { id: 'z', op: 'add', inputs: ['s', 'b'], label: 'z = + b' },
  { id: 'y', op: 'tanh', inputs: ['z'], label: 'y = tanh(z)' },
  { id: 'd', op: 'sub', inputs: ['y', 't'], label: 'y − t' },
  { id: 'L', op: 'sq', inputs: ['d'], label: 'L = (·)²' },
]
export type Leaves = Record<'x1' | 'w1' | 'x2' | 'w2' | 'b' | 't', number>
export const DEFAULT_LEAVES: Leaves = { x1: 2, w1: -0.5, x2: 0.5, w2: 1.2, b: 0.3, t: 0.8 }

export function forward(v0: Leaves): Record<NodeId, number> {
  const v = { ...v0 } as Record<NodeId, number>
  for (const n of GRAPH) {
    if (n.op === 'leaf') continue
    const [a, b] = n.inputs.map((i) => v[i])
    v[n.id] = n.op === 'mul' ? a * b : n.op === 'add' ? a + b : n.op === 'sub' ? a - b : n.op === 'tanh' ? Math.tanh(a) : a * a
  }
  return v
}

export interface BackStep { node: NodeId; grad: number; /** bu adımda girdilere aktarılan yerel türev × gelen gradyan */ pass: Array<{ to: NodeId; local: number; contrib: number }> }
/** Geri geçiş: L'den başlar (∂L/∂L = 1), ters topolojik sırada her düğüm gradyanını girdilerine dağıtır. */
export function backward(v: Record<NodeId, number>): { grads: Record<NodeId, number>; steps: BackStep[] } {
  const g = Object.fromEntries(GRAPH.map((n) => [n.id, 0])) as Record<NodeId, number>
  g.L = 1
  const steps: BackStep[] = []
  for (const n of [...GRAPH].reverse()) {
    if (n.op === 'leaf') continue
    const up = g[n.id], [a, b] = n.inputs
    const locals: number[] =
      n.op === 'mul' ? [v[b], v[a]] : n.op === 'add' ? [1, 1] : n.op === 'sub' ? [1, -1] : n.op === 'tanh' ? [1 - Math.tanh(v[a]) ** 2] : [2 * v[a]]
    const pass = n.inputs.map((to, k) => ({ to, local: locals[k], contrib: locals[k] * up }))
    for (const p of pass) g[p.to] += p.contrib
    steps.push({ node: n.id, grad: up, pass })
  }
  return { grads: g, steps }
}

/** Merkezî fark: (L(θ + h) − L(θ − h)) / 2h. */
export function numericGrad(v0: Leaves, k: keyof Leaves, h = 1e-5): number {
  const p = { ...v0, [k]: v0[k] + h }, m = { ...v0, [k]: v0[k] - h }
  return (forward(p).L - forward(m).L) / (2 * h)
}

/** Bir SGD adımı: θ ← θ − lr·∂L/∂θ (yalnız requires_grad yapraklar). */
export function sgdStep(v0: Leaves, lr: number): Leaves {
  const { grads } = backward(forward(v0))
  return { ...v0, w1: v0.w1 - lr * grads.w1, w2: v0.w2 - lr * grads.w2, b: v0.b - lr * grads.b }
}
