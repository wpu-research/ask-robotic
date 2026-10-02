import { LINE_ROW } from './scenes'
import type { ArenaGoal, ArenaGoalCtx, ArenaGoalResult, ArenaScene, ArenaSnapshot, ArmSnapshot, RoverSnapshot } from './types'

/** Çalışmadan önceki başlangıç görüntüsü (hedefler "başlamadı" durumunu görür). */
export function idleSnapshot(scene: ArenaScene): ArenaSnapshot {
  if (scene.kind === 'balancer') {
    return { kind: 'balancer', timeS: 0, thetaDeg: scene.theta0Deg, rateDps: 0, x: 0, v: 0, fell: false, fellAtS: null, uprightS: 0, maxAbsDeg: Math.abs(scene.theta0Deg), pushCount: 0, push: null, serial: '', serialAgeS: 0 }
  }
  if (scene.kind === 'arm') {
    const s: ArmSnapshot = {
      kind: 'arm', timeS: 0, q1: 90, q2: 0, grip: 90, cmd: { q1: 90, q2: 0, grip: 90 }, tipX: 0, tipY: scene.l1 + scene.l2, gripClosed: false,
      held: null, objects: scene.objects.map((o) => ({ id: o.id, x: o.x, y: o.y })), placed: {}, maxJumpDeg: 0, maxJointJumpDeg: 0, serial: '', serialAgeS: 0, inZone: new Set(),
    }
    return s
  }
  const s: RoverSnapshot = {
    kind: 'rover', timeS: 0, x: scene.pose.x, y: scene.pose.y, theta: scene.pose.theta, thetaDeg: (scene.pose.theta * 180) / Math.PI,
    v: 0, omega: 0, distanceM: 0, coverCells: 0, turnedDeg: 0, headingChangeDeg: 0, ticksL: 0, ticksR: 0, wL: 0, wR: 0, frontCm: 400, frontTrueCm: 400, minFrontTrueCm: 400, collided: false, collisions: 0,
    line: scene.sensors.line ? LINE_ROW.map((l) => ({ ...l, on: false, adc: 164 })) : [], onLine: false, lineExits: 0, offLineMs: 0, totalOffLineMs: 0, longestOffLineMs: 0, bumperL: false, bumperR: false,
    minClearanceM: Infinity, visited: new Set(), inZone: new Set(), finishedAtS: null, serial: '', serialAgeS: 0, movers: (scene.movers ?? []).map((m) => ({ id: m.id, wall: m.wall })),
    odo: { x: scene.pose.x, y: scene.pose.y, theta: scene.pose.theta, distanceM: 0 },
  }
  return s
}

/**
 * Hedefleri değerlendirir. `behavior` hedefleri çalışma başlamadan sağlanmış sayılmaz;
 * kalıcılık (bir kez sağlanınca kod değişene kadar "tamam") arayüzde tutulur.
 */
export function evaluateArenaGoals(goals: ArenaGoal[], ctx: ArenaGoalCtx): ArenaGoalResult[] {
  return goals.map((g) => {
    let done = false
    try { done = !(g.behavior && !ctx.started) && !!g.check(ctx) } catch { done = false }
    return { id: g.id, text: g.text, done, hint: g.hint }
  })
}

// ---------------------------------------------------------------- etkinliklerde ortak yardımcılar
export const noComments = (code: string): string => code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')

type R = ArenaGoalCtx<RoverSnapshot>
/** Kod (yorumlar hariç) bu desene uyuyor mu. */
export const codeHas = (re: RegExp) => ({ code }: { code: string }): boolean => re.test(noComments(code))
/** Seri çıktı bu desene uyuyor mu. */
export const serialHas = (re: RegExp) => ({ snap }: { snap: ArenaSnapshot }): boolean => re.test(snap.serial)
/** Seri çıktıda deseni sayar. */
export const serialCount = (re: RegExp, n: number) => ({ snap }: { snap: ArenaSnapshot }): boolean => (snap.serial.match(new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g')) ?? []).length >= n

export const reached = (zoneId: string) => ({ snap }: R): boolean => snap.visited.has(zoneId)
export const finished = ({ snap }: R): boolean => snap.finishedAtS !== null
export const stopped = (snap: RoverSnapshot, tol = 0.02): boolean => Math.abs(snap.v) < tol && Math.abs(snap.omega) < 0.15
/** Robot verilen bölgede mi (şu an). */
export const inZone = (zoneId: string) => ({ snap }: R): boolean => snap.inZone.has(zoneId)
/** Robot verilen noktaya r metre yakın mı. */
export const near = (x: number, y: number, r: number) => ({ snap }: R): boolean => Math.hypot(snap.x - x, snap.y - y) <= r
export const angleDiffDeg = (a: number, b: number): number => { let d = (a - b) % 360; if (d > 180) d -= 360; if (d < -180) d += 360; return d }

/** Davranış hedeflerini kalıcılaştıran değerlendirici (kod ya da sahne değişince `reset`). */
export class GoalTracker {
  private latched = new Set<string>()
  constructor(public goals: ArenaGoal[]) {}
  reset(): void { this.latched.clear() }
  evaluate(ctx: ArenaGoalCtx): ArenaGoalResult[] {
    const res = evaluateArenaGoals(this.goals, ctx)
    return res.map((r, i) => {
      if (this.goals[i].behavior) { if (r.done) this.latched.add(r.id); return { ...r, done: r.done || this.latched.has(r.id) } }
      return r
    })
  }
}

/** Seri çıktının son dolu satırı. */
export const lastLine = (serial: string): string => serial.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).at(-1) ?? ''
