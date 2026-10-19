import type { Metadata } from 'next'
import { CourseSims } from '@/components/kurs/course-pages'
import { getLocale } from '@/i18n/server'
import { IOT_META } from '@/lib/iot/course'
import { IOT_VIEW } from '../view'

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLocale()
  return { title: `${IOT_META[lang].title} · ${lang === 'en' ? 'Simulations' : 'Simülasyonlar'}` }
}

export default async function IotSimulasyonlar() {
  return <CourseSims v={IOT_VIEW} lang={await getLocale()} />
}
