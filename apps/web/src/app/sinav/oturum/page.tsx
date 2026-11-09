import type { Metadata } from 'next'
import { ExamRoom } from '@/components/sinav/exam-room'
import '../sinav.css'

export const metadata: Metadata = { title: 'ESOF 323 Online Exam', robots: { index: false } }

export default function SinavOturum() {
  return <ExamRoom />
}
