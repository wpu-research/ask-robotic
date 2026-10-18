import type { Metadata } from 'next'
import { CourseProject } from '@/components/kurs/course-pages'
import { getLocale } from '@/i18n/server'
import { SML_CAPSTONE, SML_META } from '@/lib/sensor-ml/course'
import { SML_VIEW } from '../view'

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLocale()
  return { title: `${SML_META[lang].title} · ${SML_CAPSTONE[lang].title}` }
}

export default async function SensorMlProje() {
  return <CourseProject v={SML_VIEW} lang={await getLocale()} sims={['anomali', 'yerlestirme']} />
}
