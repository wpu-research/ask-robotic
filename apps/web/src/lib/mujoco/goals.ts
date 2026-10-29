// MuRoKo hedefleri: bir sensör kanalı koşulu en az `hold` saniye boyunca sağlanınca hedef tamamdır. Saf modül.

export type Cmp = 'ge' | 'le' | 'abs_ge' | 'abs_le' | 'between'
export interface Goal {
  id: string
  tr: string
  en: string
  /** Sensör kanalı (lib/mujoco/sensors.ts). */
  ch: string
  cmp: Cmp
  a: number
  /** `between` için üst sınır. */
  b?: number
  /** Koşulun kesintisiz sürmesi gereken süre (sn); 0 = bir an yeter. */
  hold: number
}
export interface GoalState { id: string; held: number; done: boolean }

export function holds(g: Goal, v: number): boolean {
  if (!Number.isFinite(v)) return false
  switch (g.cmp) {
    case 'ge': return v >= g.a
    case 'le': return v <= g.a
    case 'abs_ge': return Math.abs(v) >= g.a
    case 'abs_le': return Math.abs(v) <= g.a
    case 'between': return v >= g.a && v <= (g.b ?? g.a)
  }
}

export class GoalTracker {
  state: GoalState[]
  constructor(public goals: Goal[]) { this.state = goals.map((g) => ({ id: g.id, held: 0, done: false })) }

  /** `dt` benzetim saniyesi, `sensors` kanal → değer. Koşul bozulunca sayaç sıfırlanır; tamamlanan hedef kalıcıdır. */
  update(dt: number, sensors: Record<string, number>): boolean {
    let changed = false
    this.goals.forEach((g, i) => {
      const s = this.state[i]
      if (s.done) return
      if (holds(g, sensors[g.ch])) {
        s.held += dt
        if (s.held >= g.hold) { s.done = true; changed = true }
      } else s.held = 0
    })
    return changed
  }
  progress(i: number): number { const g = this.goals[i], s = this.state[i]; return s.done ? 1 : g.hold > 0 ? Math.min(1, s.held / g.hold) : 0 }
  get allDone() { return this.state.length > 0 && this.state.every((s) => s.done) }
  reset() { this.state = this.goals.map((g) => ({ id: g.id, held: 0, done: false })) }
}
