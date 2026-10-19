import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CourseUnitPage } from '@/components/kurs/course-pages'
import { getLocale } from '@/i18n/server'
import { IOT_META, IOT_UNITS, iotUnitOf } from '@/lib/iot/course'
import { IOT_VIEW } from '../../view'

export const dynamicParams = false
export const generateStaticParams = () => IOT_UNITS.map((u) => ({ n: String(u.n) }))

export async function generateMetadata({ params }: { params: Promise<{ n: string }> }): Promise<Metadata> {
  const u = iotUnitOf(Number((await params).n))
  const lang = await getLocale()
  return { title: u ? `${IOT_META[lang].title} · ${u[lang].title}` : IOT_META[lang].title, description: u?.[lang].summary }
}

export default async function IotUnite({ params }: { params: Promise<{ n: string }> }) {
  const u = iotUnitOf(Number((await params).n))
  if (!u) notFound()
  return <CourseUnitPage v={IOT_VIEW} u={u} lang={await getLocale()} />
}
