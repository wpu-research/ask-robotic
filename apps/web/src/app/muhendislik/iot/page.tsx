import type { Metadata } from 'next'
import { CourseOverview } from '@/components/kurs/course-pages'
import { getLocale } from '@/i18n/server'
import { IOT_META } from '@/lib/iot/course'
import { IOT_VIEW } from './view'

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLocale()
  return { title: IOT_META[lang].title, description: IOT_META[lang].lede }
}

export default async function IotDersi() {
  return <CourseOverview v={IOT_VIEW} lang={await getLocale()} />
}
