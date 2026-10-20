// Çarpışmasız yol planlama: eklem uzayında RRT (rastgele ağaç) + kısayol düzleştirme. Tohumlu: aynı tohum aynı yolu verir.
import { edgeViolation, violation, type Cell } from './cell'
import { ik, jointDist, LIMITS, type Joints, type Pose } from './kinematics'
import { rng } from './rand'

export interface PlanOptions { seed?: number; maxIter?: number; step?: number; goalBias?: number; smooth?: number }
export interface PlanResult {
  ok: boolean
  path: Joints[]
  /** Ağaçtaki düğüm sayısı ve yinelemeler (ders göstergesi). */
  nodes: number
  iterations: number
  /** Düzleştirme öncesi ham yolun düğüm sayısı. */
  rawLength: number
  reason?: 'start-invalid' | 'goal-invalid' | 'no-path'
}
export const PLAN_DEFAULTS = { seed: 1, maxIter: 4000, step: 0.35, goalBias: 0.15, smooth: 120 } as const

const randomQ = (r: () => number): Joints => LIMITS.map(([lo, hi]) => lo + r() * (hi - lo)) as Joints
const toward = (a: Joints, b: Joints, step: number): Joints => {
  const d = jointDist(a, b)
  if (d <= step) return b
  return a.map((v, i) => v + ((b[i] - v) * step) / d) as Joints
}

export function pathLength(path: readonly Joints[]): number {
  let L = 0
  for (let i = 1; i < path.length; i++) L += jointDist(path[i - 1], path[i])
  return L
}

export function planJoints(start: Joints, goal: Joints, cell: Cell, opt: PlanOptions = {}): PlanResult {
  const o = { ...PLAN_DEFAULTS, ...opt }
  if (violation(start, cell)) return { ok: false, path: [], nodes: 0, iterations: 0, rawLength: 0, reason: 'start-invalid' }
  if (violation(goal, cell)) return { ok: false, path: [], nodes: 0, iterations: 0, rawLength: 0, reason: 'goal-invalid' }
  if (!edgeViolation(start, goal, cell)) return { ok: true, path: [start, goal], nodes: 2, iterations: 0, rawLength: 2 }
  const r = rng(o.seed)
  // RRT-Connect: biri başlangıçtan, biri hedeften iki ağaç; her yinelemede biri rastgele yöne uzar, öbürü onu yeni düğüme bağlamaya çalışır.
  interface Tree { q: Joints[]; parent: number[] }
  const A: Tree = { q: [start], parent: [-1] }, B: Tree = { q: [goal], parent: [-1] }
  const nearest = (t: Tree, q: Joints) => { let bi = 0, bd = Infinity; for (let i = 0; i < t.q.length; i++) { const d = jointDist(t.q[i], q); if (d < bd) { bd = d; bi = i } } return bi }
  const extend = (t: Tree, target: Joints): number => {
    const ni = nearest(t, target), q = toward(t.q[ni], target, o.step)
    if (edgeViolation(t.q[ni], q, cell)) return -1
    t.q.push(q); t.parent.push(ni)
    return t.q.length - 1
  }
  const chain = (t: Tree, i: number): Joints[] => { const p: Joints[] = []; for (; i >= 0; i = t.parent[i]) p.push(t.q[i]); return p }
  let path: Joints[] = [], it = 0
  let ta = A, tb = B
  for (; it < o.maxIter; it++) {
    const target = r() < o.goalBias ? tb.q[0] : randomQ(r)
    const na = extend(ta, target)
    if (na >= 0) {
      const qn = ta.q[na]
      for (;;) {
        const nb = extend(tb, qn)
        if (nb < 0) break
        if (jointDist(tb.q[nb], qn) < 1e-12) {
          // ta, tb hangisi olursa olsun: başlangıç ağacından düğüme, düğümden hedef ağacına
          const [ia, ib] = ta === A ? [na, nb] : [nb, na]
          path = [...chain(A, ia).reverse(), ...chain(B, ib).slice(1)]
          break
        }
      }
      if (path.length) break
    }
    ;[ta, tb] = [tb, ta]
  }
  if (!path.length) return { ok: false, path: [], nodes: A.q.length + B.q.length, iterations: it, rawLength: 0, reason: 'no-path' }
  const rawLength = path.length
  // kısayol: rastgele iki düğüm arasındaki doğrudan kenar boşsa arayı at
  for (let k = 0; k < o.smooth && path.length > 2; k++) {
    const i = Math.floor(r() * (path.length - 1)), j = i + 2 + Math.floor(r() * (path.length - i - 2))
    if (j >= path.length) continue
    if (!edgeViolation(path[i], path[j], cell)) path = [...path.slice(0, i + 1), ...path.slice(j)]
  }
  return { ok: true, path, nodes: A.q.length + B.q.length, iterations: it, rawLength }
}

/** Duruş hedefi için: çarpışmasız bir ters kinematik çözümü, başlangıca en yakından başlayarak dene; ilk başarılı planı döndür. */
export function planToPose(start: Joints, goal: Pose, cell: Cell, opt: PlanOptions = {}): PlanResult & { goalQ?: Joints } {
  const sols = ik(goal, start)
  if (!sols.length) return { ok: false, path: [], nodes: 0, iterations: 0, rawLength: 0, reason: 'goal-invalid' }
  let last: PlanResult = { ok: false, path: [], nodes: 0, iterations: 0, rawLength: 0, reason: 'goal-invalid' }
  for (const g of sols) {
    if (violation(g, cell)) continue
    const res = planJoints(start, g, cell, opt)
    if (res.ok) return { ...res, goalQ: g }
    last = res
  }
  return last
}
