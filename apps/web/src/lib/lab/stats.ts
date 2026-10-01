import type { LabState } from './contract'

export interface LabStats { pinEdges: Record<string, number>; ledToggles: Record<string, number>; runMs: number }
export const emptyStats = (): LabStats => ({ pinEdges: {}, ledToggles: {}, runMs: 0 })

/** Çalışma boyunca pin geçişlerini ve LED açık/kapalı değişimlerini sayar. Her ince adımdan sonra `observe` çağrılır. */
export class StatsTracker {
  private stats = emptyStats()
  private pins = new Map<string, boolean>()
  private leds = new Map<string, boolean>()
  reset() { this.stats = emptyStats(); this.pins.clear(); this.leds.clear() }
  get(): LabStats { return this.stats }
  observe(s: LabState) {
    for (const [name, p] of Object.entries(s.pins)) {
      const prev = this.pins.get(name)
      if (prev !== undefined && prev !== p.high) this.stats.pinEdges[name] = (this.stats.pinEdges[name] ?? 0) + 1
      this.pins.set(name, p.high)
    }
    for (const [id, r] of Object.entries(s.parts)) {
      if (!r.led) continue
      const prev = this.leds.get(id)
      if (prev !== undefined && prev !== r.led.on) this.stats.ledToggles[id] = (this.stats.ledToggles[id] ?? 0) + 1
      this.leds.set(id, r.led.on)
    }
    this.stats.runMs = s.timeMs
  }
}
