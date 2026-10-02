// Ders etkinliği altyapısı. Ders oynatıcıya sonradan bağlanır; yazım kılavuzu: README.md ("Etkinlik yazımı").
import { evaluateGoals, type GoalStatus, type MikroGoal } from './goals'
import { usedTypes } from './program'
import { runScenario, type MikroScenario } from './scenario'
import type { MikroProject } from './types'
import { ALWAYS_ALLOWED } from './blocks'

export interface MikroActivity {
  /** Kısa yönerge (editörün üstünde gösterilir). */
  intro?: string
  /** Her çağrıda taze (paylaşılmayan) başlangıç projesi üretir. */
  starter(): MikroProject
  /** Yalnız bu blok türleri paletle sunulur; verilmezse hepsi. (Değişken/fonksiyon için `variables_get`, `procedures_defnoreturn` vb. ver.) */
  allowedBlocks?: string[]
  goals: MikroGoal[]
  /** YALNIZ TEST: tüm hedefleri sağlayan örnek çözüm. */
  solution(): MikroProject
  /** YALNIZ TEST: çözüm çalışırken yapılacak etkileşimler. Verilmezse çözüm 3 sn çalıştırılır. */
  scenario?: (s: MikroScenario) => void
  /** Benzetimdeki kart sayısı (varsayılan 1). Radyo etkinlikleri için 2. */
  cards?: 1 | 2
}

/** Bir projeyi etkinliğin senaryosuyla başsız çalıştırıp hedefleri değerlendirir (testler ve "kontrol et" için). */
export function evaluateActivity(activity: MikroActivity, project: MikroProject): { status: GoalStatus[]; done: boolean; error: string | null } {
  const sim = runScenario(project, activity.scenario, { cards: activity.cards ?? 1 })
  const { status } = evaluateGoals(activity.goals, { sim, ws: project.workspace })
  return { status, done: status.every((s) => s.done), error: sim.error?.message ?? null }
}

/** Projede izinli listede olmayan blok türleri (etkinlik doğrulaması). */
export function disallowedTypes(activity: MikroActivity, project: MikroProject): string[] {
  if (!activity.allowedBlocks) return []
  const ok = new Set([...activity.allowedBlocks, ...ALWAYS_ALLOWED])
  // işlev tanımı/çağrısı birlikte izinlidir
  if (activity.allowedBlocks.some((t) => t.startsWith('procedures_'))) for (const t of ['procedures_defnoreturn', 'procedures_defreturn', 'procedures_callnoreturn', 'procedures_callreturn', 'procedures_ifreturn']) ok.add(t)
  if (activity.allowedBlocks.some((t) => t === 'variables_get' || t === 'variables_set')) for (const t of ['variables_get', 'variables_set', 'math_change']) ok.add(t)
  return [...usedTypes(project.workspace)].filter((t) => !ok.has(t))
}
