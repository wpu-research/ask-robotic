import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CourseUnitPage } from '@/components/kurs/course-pages'
import { getLocale } from '@/i18n/server'
import { SML_META, SML_UNITS, smlUnitOf } from '@/lib/sensor-ml/course'
import { SML_VIEW } from '../../view'

export const dynamicParams = false
export const generateStaticParams = () => SML_UNITS.map((u) => ({ n: String(u.n) }))

export async function generateMetadata({ params }: { params: Promise<{ n: string }> }): Promise<Metadata> {
  const u = smlUnitOf(Number((await params).n))
  const lang = await getLocale()
  return { title: u ? `${SML_META[lang].title} · ${u[lang].title}` : SML_META[lang].title, description: u?.[lang].summary }
}

export default async function SensorMlUnite({ params }: { params: Promise<{ n: string }> }) {
  const u = smlUnitOf(Number((await params).n))
  if (!u) notFound()
  return <CourseUnitPage v={SML_VIEW} u={u} lang={await getLocale()} />
}
