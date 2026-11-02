import { isCircuit } from '@/lib/lab/ops'
import type { Circuit } from '@/lib/lab/contract'
import type { WiringPlan } from './wiring'
import { importDesign, type RobotDesign } from '@/lib/mikro/tasarim'
import { normalizeGovde } from '@/lib/mikro/govde'
import { designScene } from './design-scene'

export const WORKBENCH_PROJECT_KEY = 'ask:muroko:electronics:v1'
export interface WorkbenchProject { circuit: Circuit; plan: WiringPlan; arduino: string }
export interface WorkbenchFile extends WorkbenchProject { design: RobotDesign }

function isPlan(value: unknown): value is WiringPlan {
  if (!value || typeof value !== 'object') return false
  const plan = value as WiringPlan
  if (!Array.isArray(plan.motors) || !Array.isArray(plan.sensors) || plan.motors.length > 200 || plan.sensors.length > 200) return false
  return plan.motors.every((link) => link && typeof link.actuator === 'string' && typeof link.partId === 'string' && ['servo', 'dcmotor'].includes(link.kind)
    && (link.invert === undefined || typeof link.invert === 'boolean') && [link.degMin, link.degMax].every((number) => number === undefined || Number.isFinite(number)))
    && plan.sensors.every((link) => link && [link.channel, link.partId, link.prop].every((text) => typeof text === 'string') && [link.scale, link.offset, link.min, link.max].every((number) => number === undefined || Number.isFinite(number)))
}

export function loadWorkbenchProject(): WorkbenchProject | null {
  try {
    const raw = localStorage.getItem(WORKBENCH_PROJECT_KEY)
    if (!raw || raw.length > 2_000_000) return null
    const project = JSON.parse(raw)
    if (project?.v !== 1 || !isCircuit(project.circuit) || !isPlan(project.plan) || typeof project.arduino !== 'string' || project.arduino.length > 100_000) return null
    return { circuit: project.circuit, plan: project.plan, arduino: project.arduino }
  } catch { return null }
}

export function saveWorkbenchProject(project: WorkbenchProject): boolean {
  try {
    localStorage.setItem(WORKBENCH_PROJECT_KEY, JSON.stringify({ v: 1, ...project }))
    return true
  } catch { return false }
}

export function exportWorkbenchFile(project: WorkbenchFile): string {
  return JSON.stringify({ format: 'macademia.muroko.project', v: 1, ...project }, null, 2)
}

export function importWorkbenchFile(raw: string): WorkbenchFile | null {
  try {
    if (raw.length > 4_000_000) return null
    const file = JSON.parse(raw)
    if (file?.format !== 'macademia.muroko.project' || file.v !== 1 || !isCircuit(file.circuit) || !isPlan(file.plan) || typeof file.arduino !== 'string' || file.arduino.length > 100_000) return null
    const parsed = importDesign(file.design)
    if (!parsed.ok) return null
    const govde = file.design.govde ? normalizeGovde(file.design.govde) : null
    if (file.design.govde && (!govde || govde.blocks.length > 256)) return null
    const design = { ...parsed.design, ...(govde ? { govde } : {}) }
    if (!designScene(design)) return null
    return { design, circuit: file.circuit, plan: file.plan, arduino: file.arduino }
  } catch { return null }
}
