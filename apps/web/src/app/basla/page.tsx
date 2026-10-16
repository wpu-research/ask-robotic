import type { Metadata } from 'next'
import { getLocale, getT } from '@/i18n/server'
import { moduleTitle } from '@/lib/catalog-en'
import { Onboarding, type CourseInfo } from '@/components/onboarding/onboarding'
import { getCatalog } from '@/lib/catalog'
import { getDb } from '@/lib/db'

export const dynamic = 'force-dynamic'
export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())('onboarding.metaTitle') }
}

export default async function Basla() {
  const catalog = await getCatalog(getDb()).catch(() => [])
  const locale = await getLocale()
  const courses: CourseInfo[] = catalog.map((m) => {
    const lessons = m.weeks.flatMap((w) => w.lessons)
    return { slug: m.slug, title: moduleTitle(m.slug, m.title, locale), firstLessonId: lessons[0]?.id ?? null, lessons: lessons.length }
  })
  return <Onboarding courses={courses} />
}
