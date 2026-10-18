import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { UnitView } from '@/components/gomulu/pages'
import { getLocale } from '@/i18n/server'
import { RPI_COURSE } from '@/lib/rpi/course'

export const dynamicParams = false
export const generateStaticParams = () => RPI_COURSE.units.map((u) => ({ n: String(u.n) }))

export async function generateMetadata({ params }: { params: Promise<{ n: string }> }): Promise<Metadata> {
  const u = RPI_COURSE.units.find((x) => x.n === Number((await params).n))
  const lang = await getLocale()
  return { title: u ? `${RPI_COURSE.text[lang].title} · ${u[lang].title}` : RPI_COURSE.text[lang].title, description: u?.[lang].summary }
}

export default async function Page({ params }: { params: Promise<{ n: string }> }) {
  const n = Number((await params).n)
  if (!RPI_COURSE.units.some((u) => u.n === n)) notFound()
  return <UnitView c={RPI_COURSE} n={n} lang={await getLocale()} />
}
