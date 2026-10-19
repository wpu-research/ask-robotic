import type { Metadata } from 'next'
import { ProjectView } from '@/components/gomulu/pages'
import { getLocale } from '@/i18n/server'
import { RPI_COURSE } from '@/lib/rpi/course'

export const metadata: Metadata = { title: `${RPI_COURSE.text.tr.title} · bitirme projesi`, description: RPI_COURSE.capstone.tr.summary }

export default async function Page() {
  return <ProjectView c={RPI_COURSE} lang={await getLocale()} />
}
