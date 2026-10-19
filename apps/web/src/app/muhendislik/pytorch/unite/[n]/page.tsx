import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { KursUnitPage } from '@/components/kurs/kurs-pages'
import { PT_CONFIG } from '@/components/pytorch/pt-course'
import { getLocale } from '@/i18n/server'
import { PT_COURSE, PT_UNITS, ptUnitOf } from '@/lib/pytorch/course'

export const dynamicParams = false
export const generateStaticParams = () => PT_UNITS.map((u) => ({ n: String(u.n) }))

export async function generateMetadata({ params }: { params: Promise<{ n: string }> }): Promise<Metadata> {
  const u = ptUnitOf(Number((await params).n))
  const lang = await getLocale()
  return { title: u ? `${PT_COURSE[lang].title} · ${u[lang].title}` : PT_COURSE[lang].title, description: u?.[lang].summary }
}

export default async function PytorchUnite({ params }: { params: Promise<{ n: string }> }) {
  const u = ptUnitOf(Number((await params).n))
  if (!u) notFound()
  return <KursUnitPage c={PT_CONFIG} u={u} lang={await getLocale()} />
}
