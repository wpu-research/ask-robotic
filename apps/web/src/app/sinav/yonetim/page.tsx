import type { Metadata } from 'next'
import { ExamSessions } from '@/components/sinav/exam-admin'
import { adminOrLogin } from './guard'
import '../sinav.css'

export const metadata: Metadata = { title: 'Exam management', robots: { index: false } }
export const dynamic = 'force-dynamic'

export default async function SinavYonetim() {
  return (await adminOrLogin('/sinav/yonetim')) ?? <ExamSessions />
}
