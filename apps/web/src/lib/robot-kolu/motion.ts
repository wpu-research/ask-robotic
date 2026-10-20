// Hareket: yamuk hız profili, eklem uzayı hareketi (PTP) ve kartezyen doğrusal hareket (LIN). Sayılar ders modelinin sınırlarıdır.
import { DEG, fk, ik, jointDist, mul, rotFromVec, rotVec, transpose, type Joints, type Pose, type V3 } from './kinematics'

/** Eklem başına en büyük hız (rad/s) ve ivme (rad/s²) ve kartezyen sınırlar, %100 hızda. */
export const JOINT_VMAX: readonly number[] = [2.0, 2.0, 2.5, 3.5, 3.5, 5.0]
export const JOINT_AMAX = 6
export const LIN_VMAX = 0.5
export const LIN_AMAX = 2
export const ROT_VMAX = 2
export const ROT_AMAX = 8
/** LIN örneklerinde ardışık iki örnek arasında izin verilen en büyük eklem sıçraması (yapılandırma değişimi göstergesi). */
export const MAX_JUMP = 20 * DEG
export const DT = 0.04

export interface Profile { T: number; s(t: number): number }
/** Yamuk (gerekirse üçgen) hız profili: mesafe `d`, en büyük hız v, ivme a. s(t) ∈ [0,1] kat edilen oran. */
export function trapezoid(d: number, v: number, a: number): Profile {
  if (!(d > 1e-12)) return { T: 0, s: () => 1 }
  let ta: number, tc: number
  if (d <= (v * v) / a) { ta = Math.sqrt(d / a); tc = 0 } else { ta = v / a; tc = (d - (v * v) / a) / v }
  const T = 2 * ta + tc, vp = a * ta
  const s = (t: number) => {
    if (t <= 0) return 0
    if (t >= T) return 1
    let x: number
    if (t < ta) x = 0.5 * a * t * t
    else if (t < ta + tc) x = 0.5 * a * ta * ta + vp * (t - ta)
    else { const u = T - t; x = d - 0.5 * a * u * u }
    return x / d
  }
  return { T, s }
}

export interface Motion<T> { duration: number; at(t: number): T }
const clampPct = (pct: number) => Math.min(100, Math.max(1, pct)) / 100

/** Eşzamanlı PTP: en yavaş eklem süreyi belirler, bütün eklemler aynı oranla ilerleyip aynı anda varır. Eklemler doğrudan farkla gider (sınırlar içinde kalır). */
export function planPtp(q0: Joints, q1: Joints, pct = 100): Motion<Joints> {
  const goal = q1
  const k = clampPct(pct)
  let lead: Profile = { T: 0, s: () => 1 }
  for (let i = 0; i < 6; i++) {
    const p = trapezoid(Math.abs(goal[i] - q0[i]), JOINT_VMAX[i] * k, JOINT_AMAX * k)
    if (p.T > lead.T) lead = p
  }
  return { duration: lead.T, at: (t) => q0.map((v, i) => v + (goal[i] - v) * lead.s(t)) as Joints }
}

/** Bir duruş çiftinin göreli dönmesi (eksen-açı) ve Kartezyen uzaklığı. */
export function poseDelta(a: Pose, b: Pose): { dist: number; angle: number; w: V3 } {
  const w = rotVec(mul(transpose(a.R), b.R))
  return { dist: Math.hypot(b.p[0] - a.p[0], b.p[1] - a.p[1], b.p[2] - a.p[2]), angle: Math.hypot(...w), w }
}
export function lerpPose(a: Pose, b: Pose, s: number, w: V3): Pose {
  return { p: [a.p[0] + (b.p[0] - a.p[0]) * s, a.p[1] + (b.p[1] - a.p[1]) * s, a.p[2] + (b.p[2] - a.p[2]) * s], R: mul(a.R, rotFromVec([w[0] * s, w[1] * s, w[2] * s])) }
}
/** Kartezyen doğru: TCP düz çizgide, yönelim düzgün döner; süre uzaklık ve dönmeden büyüğüne göre. */
export function planLin(a: Pose, b: Pose, pct = 100): Motion<Pose> {
  const d = poseDelta(a, b), k = clampPct(pct)
  const pl = trapezoid(d.dist, LIN_VMAX * k, LIN_AMAX * k), pr = trapezoid(d.angle, ROT_VMAX * k, ROT_AMAX * k)
  const lead = pl.T >= pr.T ? pl : pr
  return { duration: lead.T, at: (t) => lerpPose(a, b, lead.s(t), d.w) }
}

export type LinFail = { kind: 'unreachable' | 'flip'; index: number; t: number }
/** LIN'i DT aralıklı eklem örneklerine çevirir; her örnekte ters kinematik, bir önceki çözüme en yakın olanı seçilir. */
export function sampleLin(a: Pose, b: Pose, q0: Joints, pct = 100): { ok: true; duration: number; qs: Joints[] } | { ok: false; fail: LinFail } {
  const m = planLin(a, b, pct)
  const n = Math.max(1, Math.ceil(m.duration / DT))
  const qs: Joints[] = [q0]
  let prev = q0
  for (let i = 1; i <= n; i++) {
    const t = Math.min(m.duration, i * DT)
    const sols = ik(m.at(t), prev)
    if (!sols.length) return { ok: false, fail: { kind: 'unreachable', index: i, t } }
    const q = sols[0]
    if (jointDist(q, prev) > MAX_JUMP) return { ok: false, fail: { kind: 'flip', index: i, t } }
    qs.push(q); prev = q
  }
  return { ok: true, duration: m.duration, qs }
}

/** Örnek dizisini zamanla okur (doğrusal ara değer). */
export function sampledAt(qs: readonly Joints[], duration: number, t: number): Joints {
  if (qs.length === 1 || duration <= 0) return qs[qs.length - 1]
  const x = Math.min(1, Math.max(0, t / duration)) * (qs.length - 1)
  const i = Math.min(qs.length - 2, Math.floor(x)), f = x - i
  return qs[i].map((v, j) => v + (qs[i + 1][j] - v) * f) as Joints
}

/** Çok noktalı eklem yolunu (planlayıcı çıktısı) tek bir yamuk profille, eklem uzayı yay uzunluğuna göre kateder. */
export function planPath(path: readonly Joints[], pct = 100): Motion<Joints> {
  const segs: number[] = []
  let total = 0
  for (let i = 1; i < path.length; i++) { const d = jointDist(path[i - 1], path[i]); segs.push(d); total += d }
  const k = clampPct(pct)
  const prof = trapezoid(total, 2.0 * k, JOINT_AMAX * k)
  return {
    duration: prof.T,
    at(t) {
      if (path.length === 1 || total <= 0) return path[path.length - 1]
      let x = prof.s(t) * total, i = 0
      while (i < segs.length - 1 && x > segs[i]) { x -= segs[i]; i++ }
      const f = segs[i] > 0 ? Math.min(1, x / segs[i]) : 1
      return path[i].map((v, j) => v + (path[i + 1][j] - v) * f) as Joints
    },
  }
}

/** TCP yolu: bir hareketi örnekleyip uç noktası konumlarını verir. */
export function tcpTrace(m: Motion<Joints>, n = 60): V3[] {
  return Array.from({ length: n + 1 }, (_, i) => fk(m.at((i / n) * m.duration)).p)
}
/** Bir noktalar dizisinin A–B doğrusundan en büyük sapması (m) ve yol uzunluğu. */
export function lineDeviation(pts: readonly V3[]): { maxDev: number; length: number } {
  const A = pts[0], B = pts[pts.length - 1]
  const ab: V3 = [B[0] - A[0], B[1] - A[1], B[2] - A[2]]
  const L = Math.hypot(...ab) || 1
  let maxDev = 0, length = 0
  for (let i = 0; i < pts.length; i++) {
    const ap: V3 = [pts[i][0] - A[0], pts[i][1] - A[1], pts[i][2] - A[2]]
    const cr: V3 = [ap[1] * ab[2] - ap[2] * ab[1], ap[2] * ab[0] - ap[0] * ab[2], ap[0] * ab[1] - ap[1] * ab[0]]
    maxDev = Math.max(maxDev, Math.hypot(...cr) / L)
    if (i) length += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1], pts[i][2] - pts[i - 1][2])
  }
  return { maxDev, length }
}
