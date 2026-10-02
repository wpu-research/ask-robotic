import type { Concept, ModuleContent, QuizQuestion } from './types'

/** Bir dersin platform katmanı içeriği (anlatım, kavram kartları, mini test). */
export interface LessonExtras { explainerMd?: string; concepts?: Concept[]; quiz?: QuizQuestion[] }
/** Bir haftanın ek içeriği: haftalık rehber ve ders sırasıyla dersler. */
export interface WeekExtras { guideMd?: string; lessons: LessonExtras[] }

/**
 * Elle yazılmış (TypeScript) modüllere platform katmanını ekler. `extras[hafta].lessons[ders]` sırası
 * modüldeki sırayla birebir aynı olmalıdır; sayılar uyuşmazsa hata fırlatılır (sessiz kayma olmasın).
 */
export function withExtras(m: ModuleContent, extras: WeekExtras[]): ModuleContent {
  if (extras.length !== m.weeks.length) throw new Error(`${m.slug}: ${m.weeks.length} hafta var, ${extras.length} ek hafta verildi`)
  return {
    ...m,
    weeks: m.weeks.map((w, wi) => {
      const e = extras[wi]
      if (e.lessons.length !== w.lessons.length) throw new Error(`${m.slug} hafta ${wi + 1}: ${w.lessons.length} ders var, ${e.lessons.length} ek ders verildi`)
      return {
        ...w,
        ...(e.guideMd ? { guideMd: e.guideMd } : {}),
        lessons: w.lessons.map((l, li) => ({ ...l, ...e.lessons[li] })),
      }
    }),
  }
}
