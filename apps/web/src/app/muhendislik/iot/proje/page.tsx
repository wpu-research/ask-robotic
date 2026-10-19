import type { Metadata } from 'next'
import { CourseProject } from '@/components/kurs/course-pages'
import { getLocale } from '@/i18n/server'
import { IOT_CAPSTONE, IOT_META } from '@/lib/iot/course'
import { IOT_VIEW } from '../view'

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLocale()
  return { title: `${IOT_META[lang].title} · ${IOT_CAPSTONE[lang].title}` }
}

export default async function IotProje() {
  return <CourseProject v={IOT_VIEW} lang={await getLocale()} sims={['sera3b', 'kurallar']} />
}
