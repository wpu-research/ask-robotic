// Başsız (headless) arena koşusu: testler ve araçlar içindir; arayüz bunu kullanmaz.
import { createArenaRuntime, type ArenaRuntime } from './runtime'
import { GoalTracker } from './goals'
import type { ArenaActivity, ArenaGoalResult, ArenaScenario, ArenaSnapshot } from './types'

export interface HeadlessResult { rt: ArenaRuntime; snapshot: ArenaSnapshot; results: ArenaGoalResult[] }

/** Hex'i etkinliğin sahnesinde çalıştırır; hedefleri her 100 ms'de değerlendirir (davranış hedefleri kalıcılaşır). */
export function runHeadless(act: ArenaActivity, hex: string, code: string): HeadlessResult {
  const rt = createArenaRuntime(hex, act.scene)
  const tracker = new GoalTracker(act.goals)
  let results: ArenaGoalResult[] = []
  const evalNow = () => { results = tracker.evaluate({ snap: rt.snapshot(), started: true, code, scene: act.scene }) }
  const advance = (ms: number) => { for (let t = 0; t < ms; t += 100) { rt.advance(Math.min(100, ms - t)); evalNow() } }
  const scenario: ArenaScenario = {
    advance,
    press: (pin, down) => rt.press(pin, down),
    place: (pose) => rt.place(pose),
    push: (dps) => rt.push(dps),
    sendSerial: (t) => rt.sendSerial(t),
    until: (pred, maxMs) => {
      for (let t = 0; t < maxMs; t += 20) { if (pred(rt.snapshot())) return true; advance(20) }
      return pred(rt.snapshot())
    },
    get snapshot() { return rt.snapshot() },
    get serial() { return rt.sim.serial },
  }
  if (act.scenario) act.scenario(scenario)
  else advance((act.runSeconds ?? act.scene.timeLimitS ?? 20) * 1000)
  evalNow()
  return { rt, snapshot: rt.snapshot(), results }
}
