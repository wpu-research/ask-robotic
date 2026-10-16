// Testlerim / İlerlemem için mini testli ders listesi; ders başlığı ve hafta etiketi dile göre
// (modül ve hafta adı lib/catalog-en.ts, ders başlığı lib/lesson-titles-en.ts).
import type { Db } from '@ask/db'
import type { QuizLessonInfo } from '@/components/learn/progress-view'
import { getLocale, getT } from '@/i18n/server'
import { moduleTitle, weekTitle } from './catalog-en'
import { lessonTitle, lessonTitleByKey } from './lesson-titles-en'
import { listQuizLessons, resolveLessonKeys } from './content'

export async function listLocalizedQuizLessons(db: Db): Promise<QuizLessonInfo[]> {
  const rows = await listQuizLessons(db)
  const locale = await getLocale()
  const t = await getT()
  return rows.map((r) => ({
    id: r.id,
    title: lessonTitle(r.moduleSlug, r.weekPos, r.lessonPos, r.title, locale),
    total: r.total,
    weekLabel: t('content.tests.weekLabel', { module: moduleTitle(r.moduleSlug, r.moduleTitle, locale), n: r.weekPos, week: weekTitle(r.moduleSlug, r.weekPos, r.weekTitle, locale) }),
  }))
}

/** Parça sayfasındaki ilgili dersler: resolveLessonKeys + dile göre ders başlığı ve hafta adı. */
export async function resolveLocalizedLessonKeys(db: Db, keys: string[]) {
  const rows = await resolveLessonKeys(db, keys)
  const locale = await getLocale()
  return rows.map((r) => ({
    ...r,
    title: lessonTitleByKey(r.key, r.title, locale),
    moduleTitle: moduleTitle(r.moduleSlug, r.moduleTitle, locale),
    weekName: weekTitle(r.moduleSlug, r.weekPos, r.weekName, locale),
  }))
}
