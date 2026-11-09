import type { Metadata } from 'next'
import { ExamLive } from '@/components/sinav/exam-admin'
import { EXAM_PROJECTS } from '@/lib/sinav/projects'
import { adminOrLogin } from '../guard'
import '../../sinav.css'

export const metadata: Metadata = { title: 'Exam · live', robots: { index: false } }
export const dynamic = 'force-dynamic'

export default async function SinavCanli({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const titles = Object.fromEntries(EXAM_PROJECTS.map((p) => [p.id, p.title]))
  return (await adminOrLogin(`/sinav/yonetim/${id}`)) ?? <ExamLive id={id} projectTitles={titles} />
}
