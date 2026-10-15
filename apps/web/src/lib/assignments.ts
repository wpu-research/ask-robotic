// Ödev hedefi: ders, hafta ya da modülden TAM OLARAK biri. DB'de de CHECK (assignments_tek_hedef) var;
// burada kullanıcıya anlamlı hata vermek için önceden doğrulanır.
export type AssignmentTarget = { lessonId: number } | { weekId: number } | { moduleId: number }

export interface AssignmentTargetInput {
  lessonId?: number | null
  weekId?: number | null
  moduleId?: number | null
}

export function assignmentTarget(input: AssignmentTargetInput): AssignmentTarget | null {
  const set = (['lessonId', 'weekId', 'moduleId'] as const).filter((k) => input[k] != null)
  if (set.length !== 1) return null
  const k = set[0]
  const v = input[k]!
  if (!Number.isInteger(v) || v <= 0) return null
  return { [k]: v } as AssignmentTarget
}

export const PLAN_MAX_EVERY_WEEKS = 4
const WEEK_MS = 7 * 24 * 60 * 60 * 1000

/**
 * Haftalık ödev planı: haftalar sırayla, ilk teslimden başlayıp `everyWeeks` haftada bir teslim edilir.
 * `skip` içindeki (zaten ödevlendirilmiş) haftalar takvimde yer tutmadan atlanır.
 */
export function weeklyPlan(weekIds: readonly number[], firstDue: Date, everyWeeks: number, skip: ReadonlySet<number> = new Set()) {
  return weekIds
    .filter((id) => !skip.has(id))
    .map((weekId, i) => ({ weekId, dueAt: new Date(firstDue.getTime() + i * everyWeeks * WEEK_MS) }))
}

/** Satıra yazılacak kolonlar (diğer ikisi null). */
export const assignmentColumns = (t: AssignmentTarget) => ({
  lessonId: 'lessonId' in t ? t.lessonId : null,
  weekId: 'weekId' in t ? t.weekId : null,
  moduleId: 'moduleId' in t ? t.moduleId : null,
})
