import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { UnitView } from '@/components/gomulu/pages'
import { getLocale } from '@/i18n/server'
import { STM32_COURSE } from '@/lib/stm32/course'

export const dynamicParams = false
export const generateStaticParams = () => STM32_COURSE.units.map((u) => ({ n: String(u.n) }))

export async function generateMetadata({ params }: { params: Promise<{ n: string }> }): Promise<Metadata> {
  const n = Number((await params).n)
  const u = STM32_COURSE.units.find((x) => x.n === n)
  const lang = await getLocale()
  return { title: u ? `${STM32_COURSE.text[lang].title} · ${u[lang].title}` : STM32_COURSE.text[lang].title, description: u?.[lang].summary }
}

export default async function Page({ params }: { params: Promise<{ n: string }> }) {
  const n = Number((await params).n)
  if (!STM32_COURSE.units.some((u) => u.n === n)) notFound()
  return <UnitView c={STM32_COURSE} n={n} lang={await getLocale()} />
}
