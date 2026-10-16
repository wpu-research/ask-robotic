import type { Metadata } from 'next'
import { ProgressView } from '@/components/learn/progress-view'
import { listLocalizedQuizLessons } from '@/lib/content-i18n'
import { getDb } from '@/lib/db'
import { getT } from '@/i18n/server'

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())('content.progress.metaTitle') }
}
export const dynamic = 'force-dynamic'

export default async function Ilerleme() {
  const quizLessons = await listLocalizedQuizLessons(getDb()).catch(() => [])
  return <ProgressView quizLessons={quizLessons} />
}
