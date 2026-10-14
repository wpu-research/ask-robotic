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

/** Satıra yazılacak kolonlar (diğer ikisi null). */
export const assignmentColumns = (t: AssignmentTarget) => ({
  lessonId: 'lessonId' in t ? t.lessonId : null,
  weekId: 'weekId' in t ? t.weekId : null,
  moduleId: 'moduleId' in t ? t.moduleId : null,
})
