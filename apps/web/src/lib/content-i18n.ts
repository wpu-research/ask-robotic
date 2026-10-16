// Testlerim / İlerlemem için mini testli ders listesi, hafta etiketi dile göre (modül ve hafta adı lib/catalog-en.ts).
// Ders başlıkları Türkçe kalır: derslerin ayrı bir İngilizce başlık alanı yok.
import type { Db } from '@ask/db'
import type { QuizLessonInfo } from '@/components/learn/progress-view'
import { getLocale, getT } from '@/i18n/server'
import { moduleTitle, weekTitle } from './catalog-en'
import { listQuizLessons } from './content'

export async function listLocalizedQuizLessons(db: Db): Promise<QuizLessonInfo[]> {
  const rows = await listQuizLessons(db)
  const locale = await getLocale()
  const t = await getT()
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    total: r.total,
    weekLabel: t('content.tests.weekLabel', { module: moduleTitle(r.moduleSlug, r.moduleTitle, locale), n: r.weekPos, week: weekTitle(r.moduleSlug, r.weekPos, r.weekTitle, locale) }),
  }))
}
