import type { ExamProject } from '../types'
import { PROJECTS_A } from './a'
import { PROJECTS_B } from './b'
import { PROJECTS_C } from './c'

export const EXAM_PROJECTS: ExamProject[] = [...PROJECTS_A, ...PROJECTS_B, ...PROJECTS_C]
export const examProject = (id: string) => EXAM_PROJECTS.find((p) => p.id === id) ?? null
