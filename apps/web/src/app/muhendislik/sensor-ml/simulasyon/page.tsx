import type { Metadata } from 'next'
import { CourseSims } from '@/components/kurs/course-pages'
import { getLocale } from '@/i18n/server'
import { SML_META } from '@/lib/sensor-ml/course'
import { SML_VIEW } from '../view'

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLocale()
  return { title: `${SML_META[lang].title} · ${lang === 'en' ? 'Simulations' : 'Simülasyonlar'}` }
}

export default async function SensorMlSimulasyonlar() {
  return <CourseSims v={SML_VIEW} lang={await getLocale()} />
}
