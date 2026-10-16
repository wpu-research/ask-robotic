import type { LessonTextEn, ModuleContent } from './types'

/** Elle yazılmış (TypeScript) bir modülün İngilizcesi: hafta ve ders sırası Türkçe modülle birebir aynı. */
export interface ModuleEn { weeks: Array<{ guideMd?: string; lessons: LessonTextEn[] }> }

/**
 * İngilizce metinleri modüle `contentEn` / `guideMdEn` olarak ekler. Sayılar uyuşmazsa hata (sessiz kayma olmasın).
 * Ayna kuralları (kod blokları, test cevapları, Türkçe harf kalmaması) apps/web/src/lib/content-en.test.ts'te sınanır.
 */
export function withEnglish(m: ModuleContent, en: ModuleEn): ModuleContent {
  if (en.weeks.length !== m.weeks.length) throw new Error(`${m.slug}: ${m.weeks.length} hafta var, ${en.weeks.length} İngilizce hafta verildi`)
  return {
    ...m,
    weeks: m.weeks.map((w, wi) => {
      const e = en.weeks[wi]
      if (e.lessons.length !== w.lessons.length) throw new Error(`${m.slug} hafta ${wi + 1}: ${w.lessons.length} ders var, ${e.lessons.length} İngilizce ders verildi`)
      return { ...w, ...(e.guideMd ? { guideMdEn: e.guideMd } : {}), lessons: w.lessons.map((l, li) => ({ ...l, contentEn: e.lessons[li] })) }
    }),
  }
}
