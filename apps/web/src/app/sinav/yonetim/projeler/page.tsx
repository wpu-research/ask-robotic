import type { Metadata } from 'next'
import { ExamProjectsPreview, type ProjectPreview } from '@/components/sinav/exam-admin'
import { EXAM_PROJECTS } from '@/lib/sinav/projects'
import { adminOrLogin } from '../guard'
import '../../sinav.css'

export const metadata: Metadata = { title: 'Exam projects', robots: { index: false } }
export const dynamic = 'force-dynamic'

export default async function SinavProjeler() {
  const gate = await adminOrLogin('/sinav/yonetim/projeler')
  if (gate) return gate
  const projects: ProjectPreview[] = EXAM_PROJECTS.map((p) => ({
    id: p.id, title: p.title, story: p.story, brief: p.brief, weeks: p.weeks, allowedParts: p.allowedParts,
    goals: p.goals.map((g) => ({ id: g.id, text: g.text, kind: g.kind, points: g.points })),
    solution: p.solution(), starter: p.starter(),
  }))
  return <ExamProjectsPreview projects={projects} />
}
