import type { Metadata } from 'next'
import { TestsView } from '@/components/learn/tests-view'
import { listLocalizedQuizLessons } from '@/lib/content-i18n'
import { getDb } from '@/lib/db'
import { getT } from '@/i18n/server'

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())('content.tests.metaTitle') }
}
export const dynamic = 'force-dynamic'

export default async function Testler() {
  const quizLessons = await listLocalizedQuizLessons(getDb()).catch(() => [])
  return <TestsView quizLessons={quizLessons} />
}
