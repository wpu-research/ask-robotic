import type { Circuit, CircuitAnalysis, LabState } from './contract'
import type { LabStats } from './stats'

export interface LabGoalCtx {
  circuit: Circuit
  analysis: CircuitAnalysis
  /** Benzetim çalışmıyorsa null. */
  lab: LabState | null
  code: string
  /** Bu çalıştırmadaki sayaçlar (çalışma yokken 0/boş; Dur'da donar). */
  stats: LabStats
}

export interface LabGoal {
  id: string
  text: string
  hint?: string
  /** true: davranış hedefi — bir kez sağlanınca, devre ya da kod değişene kadar "tamam" kalır (Dur'a basınca düşmez). */
  behavior?: boolean
  check: (ctx: LabGoalCtx) => boolean
}

export interface LabGoalResult { id: string; text: string; done: boolean; hint: string | undefined }

export function evaluateLabGoals(goals: LabGoal[], ctx: LabGoalCtx): LabGoalResult[] {
  return goals.map((g) => {
    let done = false
    try { done = !!g.check(ctx) } catch { done = false }
    return { id: g.id, text: g.text, done, hint: g.hint }
  })
}
