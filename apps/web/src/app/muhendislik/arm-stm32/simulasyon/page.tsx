import type { Metadata } from 'next'
import { SimsView } from '@/components/gomulu/pages'
import { getLocale } from '@/i18n/server'
import { STM32_COURSE } from '@/lib/stm32/course'

export const metadata: Metadata = { title: `${STM32_COURSE.text.tr.title} · simülasyonlar`, description: STM32_COURSE.text.tr.lede }

export default async function Page() {
  return <SimsView c={STM32_COURSE} lang={await getLocale()} />
}
