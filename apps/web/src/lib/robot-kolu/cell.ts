// Sanal hücre: masa, engeller, yasak bölgeler, parçalar, tutucu kuralı, çarpışma denetimi ve basit hücre güvenliği.
// Çarpışma modeli kasıtlı olarak basit: her uzuv bir kapsül (doğru parçası + yarıçap), engeller eksen hizalı kutular.
// Kapsül–kutu testi, kutuyu yarıçap kadar şişirip doğru parçasını kesiştirir (köşeleri yuvarlamaz, hafif tutucudur).
import { fkFrames, fk, inLimits, toolTilt, type Joints, type V3 } from './kinematics'

export interface Box { name: string; min: V3; max: V3 }
export interface Item { id: string; size: number; pos: V3 }

/** Uzuv kapsül yarıçapları (m): taban-omuz, üst kol, ön kol, bilek-TCP (ince tutucu; masaya inip parça alabilsin). */
export const LINK_RADII: readonly number[] = [0.08, 0.065, 0.055, 0.025]
/** Tutucu: en çok açıklık, tutma yarıçapı ve araç ekseninin dikeyden izin verilen sapması. */
export const GRIPPER = { maxOpening: 0.08, graspRadius: 0.03, maxTilt: 25 } as const
/** Hücre güvenliği ders değerleri (gerçek bir hücrede risk değerlendirmesinden çıkar; burada öğretim amaçlı sabitler). */
export const SAFETY = { slowDist: 0.8, stopDist: 0.4, slowScale: 0.25, humanHeight: 1.8, manualCap: 0.25 } as const

export const TABLE: Box = { name: 'table', min: [-1, -1, -0.1], max: [1, 1, 0] }

export interface Cell {
  /** Engeller (masa ayrıca denetlenir). */
  obstacles: Box[]
  /** Kolun girmesi yasak bölgeler (TCP ve uzuvlar). */
  zones: Box[]
  items: Item[]
}
export const cloneCell = (c: Cell): Cell => ({ obstacles: c.obstacles.map((b) => ({ ...b })), zones: c.zones.map((b) => ({ ...b })), items: c.items.map((i) => ({ ...i, pos: [...i.pos] as V3 })) })

/** Ders hücresi: alma bölgesi A (y < 0), yerleştirme bölgesi B (y > 0), aralarında engel duvar. */
export const WALL: Box = { name: 'wall', min: [0.42, -0.03, 0], max: [0.7, 0.03, 0.42] }
export const PICK_A: V3 = [0.55, -0.32, 0], PLACE_B: V3 = [0.55, 0.32, 0]
export function defaultCell(withWall = false): Cell {
  return {
    obstacles: withWall ? [{ ...WALL }] : [],
    zones: [],
    items: [
      { id: 'k1', size: 0.06, pos: [PICK_A[0], PICK_A[1], 0.03] },
      { id: 'k2', size: 0.06, pos: [PICK_A[0] - 0.12, PICK_A[1], 0.03] },
      { id: 'k3', size: 0.06, pos: [PICK_A[0] + 0.1, PICK_A[1] + 0.08, 0.03] },
    ],
  }
}

/* ---------- geometri ---------- */
/** Doğru parçası [a, b] ile şişirilmiş kutunun kesişimi (slab yöntemi). */
export function segHitsBox(a: V3, b: V3, box: Box, pad: number): boolean {
  let t0 = 0, t1 = 1
  for (let i = 0; i < 3; i++) {
    const lo = box.min[i] - pad, hi = box.max[i] + pad, d = b[i] - a[i]
    if (Math.abs(d) < 1e-12) { if (a[i] < lo || a[i] > hi) return false; continue }
    let u = (lo - a[i]) / d, v = (hi - a[i]) / d
    if (u > v) [u, v] = [v, u]
    t0 = Math.max(t0, u); t1 = Math.min(t1, v)
    if (t0 > t1) return false
  }
  return true
}
/** Doğru parçasına noktanın uzaklığı. */
export function pointSegDist(p: V3, a: V3, b: V3): number {
  const ab: V3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]]
  const L2 = ab[0] * ab[0] + ab[1] * ab[1] + ab[2] * ab[2]
  const t = L2 < 1e-12 ? 0 : Math.max(0, Math.min(1, ((p[0] - a[0]) * ab[0] + (p[1] - a[1]) * ab[1] + (p[2] - a[2]) * ab[2]) / L2))
  return Math.hypot(a[0] + ab[0] * t - p[0], a[1] + ab[1] * t - p[1], a[2] + ab[2] * t - p[2])
}
export const insideBox = (p: V3, box: Box) => p.every((v, i) => v >= box.min[i] && v <= box.max[i])

/** Kolun dört kapsülü: [omuz taban], [omuz-dirsek], [dirsek-bilek], [bilek-TCP]. */
export function capsules(q: Joints): Array<[V3, V3]> {
  const { pts } = fkFrames(q)
  return [[pts[0], pts[1]], [pts[1], pts[2]], [pts[2], pts[3]], [pts[3], pts[5]]]
}

export type Violation =
  | { kind: 'limit' }
  | { kind: 'collision'; link: number; with: string }
  | { kind: 'zone'; name: string }

/** Bir duruşun ilk ihlali: eklem sınırı, masa/engel çarpışması, yasak bölge; yoksa null. Parçalar (tutulan dahil) çarpışma modeline katılmaz. */
export function violation(q: Joints, cell: Cell): Violation | null {
  if (!inLimits(q)) return { kind: 'limit' }
  const caps = capsules(q)
  for (let i = 0; i < caps.length; i++) {
    const [a, b] = caps[i], r = LINK_RADII[i]
    if (i > 0 && segHitsBox(a, b, TABLE, r)) return { kind: 'collision', link: i, with: 'table' }
    for (const o of cell.obstacles) if (segHitsBox(a, b, o, r)) return { kind: 'collision', link: i, with: o.name }
    for (const z of cell.zones) if (segHitsBox(a, b, z, 0)) return { kind: 'zone', name: z.name }
  }
  return null
}
/** İki eklem duruşu arasındaki doğrusal eklem hareketinin en çok `step` rad aralıklı denetimi; ilk ihlali ve konumunu verir. */
export function edgeViolation(q0: Joints, q1: Joints, cell: Cell, step = 0.04): { at: number; v: Violation } | null {
  const n = Math.max(1, Math.ceil(Math.max(...q0.map((v, i) => Math.abs(q1[i] - v))) / step))
  for (let i = 0; i <= n; i++) {
    const f = i / n
    const v = violation(q0.map((x, j) => x + (q1[j] - x) * f) as Joints, cell)
    if (v) return { at: f, v }
  }
  return null
}

/* ---------- tutucu ---------- */
/** Bir parçanın (xy) altında durabileceği en alçak merkez yüksekliği: masa ya da altındaki parçanın üstü. */
export function restZ(item: Item, others: readonly Item[]): number {
  let top = 0
  for (const o of others) {
    if (o.id === item.id) continue
    if (Math.abs(o.pos[0] - item.pos[0]) < (o.size + item.size) / 2 && Math.abs(o.pos[1] - item.pos[1]) < (o.size + item.size) / 2) top = Math.max(top, o.pos[2] + o.size / 2)
  }
  return top + item.size / 2
}
/** Tutucu kapanırken tutulabilecek parça: TCP'ye graspRadius içinde, aralığa sığan, araç aşağıya yakın bakıyor. */
export function graspable(q: Joints, items: readonly Item[]): Item | null {
  const { p, R } = fk(q)
  if (toolTilt(R) > GRIPPER.maxTilt) return null
  let best: Item | null = null, bd = Infinity
  for (const it of items) {
    if (it.size > GRIPPER.maxOpening) continue
    const d = Math.hypot(it.pos[0] - p[0], it.pos[1] - p[1], it.pos[2] - p[2])
    if (d <= GRIPPER.graspRadius && d < bd) { best = it; bd = d }
  }
  return best
}

/* ---------- hücre güvenliği ---------- */
export type SafetyReason = 'estop' | 'human-stop' | 'human-slow' | 'zone' | 'manual'
export interface SafetyInput {
  q: Joints
  /** Yere izdüşümü (x, y); yoksa hücrede insan yok. */
  human: [number, number] | null
  eStop: boolean
  /** Elle kipi: hız tavanı. */
  manual: boolean
  zones: readonly Box[]
}
export interface SafetyResult { state: 'ok' | 'slow' | 'stop'; speedScale: number; reasons: SafetyReason[]; humanDist: number | null }
/** İnsanın dikey eksenle (0 – humanHeight) kolun en yakın kapsülüne uzaklığı (m). */
export function humanDistance(q: Joints, human: [number, number]): number {
  let m = Infinity
  for (const [a, b] of capsules(q)) for (let k = 0; k <= 6; k++) {
    const p: V3 = [human[0], human[1], (SAFETY.humanHeight * k) / 6]
    m = Math.min(m, pointSegDist(p, a, b))
  }
  return m
}
/** Hız-ve-mesafe izleme (basitleştirilmiş): insan stopDist içinde → dur, slowDist içinde → hız ölçeği; acil durdurma, yasak bölge ve elle kipi. */
export function evaluateSafety(s: SafetyInput): SafetyResult {
  const reasons: SafetyReason[] = []
  let scale = 1, state: SafetyResult['state'] = 'ok'
  const hd = s.human ? humanDistance(s.q, s.human) : null
  if (s.eStop) { reasons.push('estop'); state = 'stop'; scale = 0 }
  if (s.zones.some((z) => capsules(s.q).some(([a, b]) => segHitsBox(a, b, z, 0)))) { reasons.push('zone'); state = 'stop'; scale = 0 }
  if (hd !== null) {
    if (hd <= SAFETY.stopDist) { reasons.push('human-stop'); state = 'stop'; scale = 0 }
    else if (hd <= SAFETY.slowDist) { reasons.push('human-slow'); if (state === 'ok') state = 'slow'; scale = Math.min(scale, SAFETY.slowScale) }
  }
  if (s.manual) { reasons.push('manual'); if (state === 'ok') state = 'slow'; scale = Math.min(scale, SAFETY.manualCap) }
  return { state, speedScale: scale, reasons, humanDist: hd }
}
/** Acil durdurma mandallıdır: basılınca kalır. Yalnız bilinçli sıfırlamayla ve başka durdurma nedeni (yasak bölge, insan) yokken açılabilir. */
export function canResetEStop(s: Omit<SafetyInput, 'eStop'>): boolean {
  return evaluateSafety({ ...s, eStop: false }).state !== 'stop'
}
