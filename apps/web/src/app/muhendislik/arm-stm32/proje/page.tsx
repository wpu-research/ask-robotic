import type { Metadata } from 'next'
import { ProjectView } from '@/components/gomulu/pages'
import { getLocale } from '@/i18n/server'
import { STM32_COURSE } from '@/lib/stm32/course'

export const metadata: Metadata = { title: `${STM32_COURSE.text.tr.title} · bitirme projesi`, description: STM32_COURSE.capstone.tr.summary }

export default async function Page() {
  return <ProjectView c={STM32_COURSE} lang={await getLocale()} />
}
