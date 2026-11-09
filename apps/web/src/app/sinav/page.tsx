import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { ExamJoin } from '@/components/sinav/exam-join'
import { getDb } from '@/lib/db'
import { attemptByToken, EXAM_COOKIE, getSession } from '@/lib/sinav/service'
import './sinav.css'

export const metadata: Metadata = { title: 'ESOF 323 Online Exam', robots: { index: false } }
export const dynamic = 'force-dynamic'

export default async function SinavGiris() {
  let resume: { title: string; student: string } | null = null
  try {
    const db = getDb()
    const a = await attemptByToken(db, (await cookies()).get(EXAM_COOKIE)?.value)
    if (a && !a.submittedAt) {
      const s = await getSession(db, a.sessionId)
      if (s && s.status === 'open') resume = { title: s.title, student: `${a.studentNo} · ${a.studentName}` }
    }
  } catch { /* veritabanı yoksa yalnız form */ }
  return <ExamJoin resume={resume} />
}
