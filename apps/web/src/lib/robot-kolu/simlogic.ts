// Simülasyon mantığı (saf, testli): çalışma alanı bilgisi, IK çözüm etiketleri, PTP–LIN karşılaştırması, planlama demosu,
// güvenlik mekiği. components/robot-kolu/sims.ts yalnız girdi toplar ve bu işlevlerin sonucunu çizer.
import { PICK_A, PLACE_B, WALL, defaultCell, edgeViolation, evaluateSafety, segHitsBox, capsules, type Box, type Cell, type SafetyInput, type SafetyResult } from './cell'
import { HOME, downReach, fk, ik, poseDown, singularities, toDeg, type Joints, type Pose, type V3 } from './kinematics'
import { lineDeviation, planPath, planPtp, sampleLin, sampledAt, tcpTrace, type LinFail, type Motion } from './motion'
import { planJoints, type PlanResult } from './planner'

/* ---------- çalışma alanı ---------- */
export function workspaceInfo(z: number, r: number) {
  const reach = downReach(z)
  const sols = ik(poseDown(r, 0, z), HOME)
  return { reach, reachable: sols.length > 0, solutions: sols.length, q: sols[0] ?? null }
}

/* ---------- IK çözümleri ---------- */
/** Bir çözümün adı: omuz (önde/arkada), dirsek (yukarı/aşağı), bilek (normal/ters). */
export function solutionLabel(q: Joints, target: Pose, lang: 'tr' | 'en'): string {
  const R = target.R, wc: V3 = [target.p[0] - R[2] * 0.22, target.p[1] - R[5] * 0.22, target.p[2] - R[8] * 0.22]
  const toward = Math.atan2(wc[1], wc[0])
  const front = Math.abs(Math.atan2(Math.sin(q[0] - toward), Math.cos(q[0] - toward))) < Math.PI / 2
  const tr = `${front ? 'omuz önde' : 'omuz arkada'}, ${q[2] > 0 ? 'dirsek yukarı' : 'dirsek aşağı'}, ${q[4] >= 0 ? 'bilek normal' : 'bilek ters'}`
  const en = `${front ? 'shoulder front' : 'shoulder behind'}, ${q[2] > 0 ? 'elbow up' : 'elbow down'}, ${q[4] >= 0 ? 'wrist normal' : 'wrist flipped'}`
  return lang === 'en' ? en : tr
}
export function ikReport(target: Pose, q: Joints) {
  const f = fk(q)
  const err = Math.max(...f.p.map((v, i) => Math.abs(v - target.p[i])), ...f.R.map((v, i) => Math.abs(v - target.R[i])))
  return { err, deg: toDeg(q), singular: singularities(q) }
}

/* ---------- PTP ve LIN ---------- */
export type MotionPairId = 'a-b' | 'a-b-yaw' | 'across'
export const MOTION_PAIRS: Record<MotionPairId, { from: Pose; to: Pose; tr: string; en: string }> = {
  'a-b': { from: poseDown(PICK_A[0], PICK_A[1], 0.25), to: poseDown(PLACE_B[0], PLACE_B[1], 0.25), tr: 'A\'nın üstü → B\'nin üstü', en: 'above A → above B' },
  'a-b-yaw': { from: poseDown(PICK_A[0], PICK_A[1], 0.25), to: poseDown(PLACE_B[0], PLACE_B[1], 0.25, 60), tr: 'A\'nın üstü → B\'nin üstü, tutucu 60° dönük', en: 'above A → above B, gripper turned 60°' },
  'across': { from: poseDown(0.25, 0, 0.5), to: poseDown(-0.25, 0, 0.5), tr: 'Tabanın iki yanı (bilek merkezi ekseni geçer)', en: 'Either side of the base (wrist centre crosses the axis)' },
}
export interface MotionCompare {
  ptp: { duration: number; length: number; maxDev: number; trace: V3[]; motion: Motion<Joints> }
  lin: { ok: true; duration: number; length: number; maxDev: number; trace: V3[]; at(t: number): Joints } | { ok: false; fail: LinFail }
}
export function compareMotion(id: MotionPairId, pct: number): MotionCompare {
  const { from, to } = MOTION_PAIRS[id]
  const q0 = ik(from, HOME)[0], q1 = ik(to, q0)[0]
  const m = planPtp(q0, q1, pct)
  const trace = tcpTrace(m, 120)
  const dev = lineDeviation(trace)
  const r = sampleLin(from, to, q0, pct)
  if (!r.ok) return { ptp: { duration: m.duration, length: dev.length, maxDev: dev.maxDev, trace, motion: m }, lin: { ok: false, fail: r.fail } }
  const lt = r.qs.map((q) => fk(q).p)
  const ld = lineDeviation(lt)
  return { ptp: { duration: m.duration, length: dev.length, maxDev: dev.maxDev, trace, motion: m }, lin: { ok: true, duration: r.duration, length: ld.length, maxDev: ld.maxDev, trace: lt, at: (t) => sampledAt(r.qs, r.duration, t) } }
}

/* ---------- planlama demosu ---------- */
export const wallCell = (height: number): Cell => { const c = defaultCell(true); c.obstacles = [{ ...WALL, max: [WALL.max[0], WALL.max[1], height] }]; return c }
export function planDemo(height: number, seed: number, budget: number) {
  const cell = wallCell(height)
  const a = ik(poseDown(PICK_A[0], PICK_A[1], 0.25), HOME)[0], b = ik(poseDown(PLACE_B[0], PLACE_B[1], 0.25), HOME)[0]
  const direct = edgeViolation(a, b, cell)
  const plan: PlanResult = planJoints(a, b, cell, { seed, maxIter: budget })
  const motion = plan.ok ? planPath(plan.path) : null
  return { cell, a, b, direct, plan, motion, directMotion: planPtp(a, b), trace: motion ? tcpTrace(motion, 160) : [] }
}

/* ---------- güvenlik mekiği ---------- */
export const ZONE_DEMO: Box = { name: 'zone', min: [0.4, -0.1, 0], max: [0.7, 0.1, 0.8] }
export interface Shuttle { t: number; dir: 1 | -1 }
export function shuttleMotion(): Motion<Joints> {
  const a = ik(poseDown(PICK_A[0], PICK_A[1], 0.25), HOME)[0], b = ik(poseDown(PLACE_B[0], PLACE_B[1], 0.25), HOME)[0]
  return planPtp(a, b)
}
export interface ShuttleEnv { human: [number, number] | null; eStop: boolean; manual: boolean; zones: readonly Box[] }
const LOOKAHEAD = 0.12
/** Bir adım: güvenlik sonucuna göre ilerler; yasak bölgeye girmeden önce durur (kısa ileri bakış). */
export function shuttleStep(s: Shuttle, dt: number, env: ShuttleEnv, m: Motion<Joints>): { s: Shuttle; q: Joints; safety: SafetyResult } {
  const q = m.at(s.t)
  const input: SafetyInput = { q, ...env }
  let safety = evaluateSafety(input)
  const ahead = m.at(Math.min(m.duration, Math.max(0, s.t + s.dir * LOOKAHEAD)))
  if (env.zones.some((z) => capsules(ahead).some(([p, r]) => segHitsBox(p, r, z, 0))) && !safety.reasons.includes('zone')) {
    safety = { ...safety, state: 'stop', speedScale: 0, reasons: [...safety.reasons, 'zone'] }
  }
  let t = s.t + s.dir * dt * safety.speedScale, dir = s.dir
  if (t >= m.duration) { t = m.duration; dir = -1 } else if (t <= 0) { t = 0; dir = 1 }
  return { s: { t, dir }, q, safety }
}
