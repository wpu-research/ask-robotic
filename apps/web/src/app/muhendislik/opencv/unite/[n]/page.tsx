import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { KursUnitPage } from '@/components/kurs/kurs-pages'
import { CV_CONFIG } from '@/components/opencv/cv-course'
import { getLocale } from '@/i18n/server'
import { CV_COURSE, CV_UNITS, cvUnitOf } from '@/lib/opencv/course'

export const dynamicParams = false
export const generateStaticParams = () => CV_UNITS.map((u) => ({ n: String(u.n) }))

export async function generateMetadata({ params }: { params: Promise<{ n: string }> }): Promise<Metadata> {
  const u = cvUnitOf(Number((await params).n))
  const lang = await getLocale()
  return { title: u ? `${CV_COURSE[lang].title} · ${u[lang].title}` : CV_COURSE[lang].title, description: u?.[lang].summary }
}

export default async function OpencvUnite({ params }: { params: Promise<{ n: string }> }) {
  const u = cvUnitOf(Number((await params).n))
  if (!u) notFound()
  return <KursUnitPage c={CV_CONFIG} u={u} lang={await getLocale()} />
}
