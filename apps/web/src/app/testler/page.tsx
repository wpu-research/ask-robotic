import type { Metadata } from 'next'
import { TestsView } from '@/components/learn/tests-view'
import { listQuizLessons } from '@/lib/content'
import { getDb } from '@/lib/db'

export const metadata: Metadata = { title: 'Testlerim' }
export const dynamic = 'force-dynamic'

export default async function Testler() {
  const quizLessons = await listQuizLessons(getDb()).catch(() => [])
  return <TestsView quizLessons={quizLessons} />
}
