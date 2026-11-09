import type { Metadata } from 'next'
import { ExamAttemptDetail } from '@/components/sinav/exam-admin'
import { adminOrLogin } from '../../guard'
import '../../../sinav.css'

export const metadata: Metadata = { title: 'Exam · student', robots: { index: false } }
export const dynamic = 'force-dynamic'

export default async function SinavGirisDetay({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (await adminOrLogin(`/sinav/yonetim/giris/${id}`)) ?? <ExamAttemptDetail id={id} />
}
