import type { Metadata } from 'next'
import { SimsView } from '@/components/gomulu/pages'
import { getLocale } from '@/i18n/server'
import { RPI_COURSE } from '@/lib/rpi/course'

export const metadata: Metadata = { title: `${RPI_COURSE.text.tr.title} · simülasyonlar`, description: RPI_COURSE.text.tr.lede }

export default async function Page() {
  return <SimsView c={RPI_COURSE} lang={await getLocale()} />
}
