import type { Metadata } from 'next'
import { ProgressView } from '@/components/learn/progress-view'
import { listQuizLessons } from '@/lib/content'
import { getDb } from '@/lib/db'

export const metadata: Metadata = { title: 'İlerlemem' }
export const dynamic = 'force-dynamic'

export default async function Ilerleme() {
  const quizLessons = await listQuizLessons(getDb()).catch(() => [])
  return <ProgressView quizLessons={quizLessons} />
}
