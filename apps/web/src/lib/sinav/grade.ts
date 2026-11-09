// Sınav projesi puanlaması (sunucu ve testler). Hiç fırlatmaz: her hata 0 puanlı hedefe dönüşür.
import type { Circuit, LabApi, PartType } from '@/lib/lab/contract'
import { StatsTracker, emptyStats } from '@/lib/lab/stats'
import { analyze, createRuntime } from '@/lib/lab/runtime'
import type { ExamGoalCtx, ExamProject, ExamScenario, ProjectGrade } from './types'

export type HexCompiler = (code: string) => Promise<{ ok: true; hex: string } | { ok: false; error: string }>

/** Senaryonun toplam benzetim süresi sınırı (sonsuz senaryo/aşırı yük koruması). */
const MAX_SIM_MS = 30_000

export function runScenario(project: ExamProject, circuit: Circuit, hex: string) {
  const lab: LabApi = createRuntime(circuit, hex)
  const tr = new StatsTracker()
  const marks: Record<string, boolean> = {}
  let simMs = 0
  const ids = (type: PartType) => circuit.parts.filter((p) => p.type === type).map((p) => p.id)
  const s: ExamScenario = {
    advance(ms) {
      const end = Math.min(ms, Math.max(0, MAX_SIM_MS - simMs))
      for (let t = 0; t < end; t += 5) { lab.advance(Math.min(5, end - t)); tr.observe(lab.state) }
      simMs += end
    },
    idsOf: ids,
    setAll(type, key, value) { for (const id of ids(type)) lab.setProp(id, key, value) },
    setProp: (id, k, v) => lab.setProp(id, k, v),
    sendSerial: (t) => lab.sendSerial(t),
    get state() { return lab.state },
    get serial() { return lab.state.serial },
    mark(name, ok) { marks[name] = (marks[name] ?? true) && !!ok },
  }
  try {
    if (project.scenario) project.scenario(s)
    else s.advance(3000)
    return { state: lab.state, stats: tr.get(), marks }
  } finally {
    lab.dispose()
  }
}

export async function gradeProject(project: ExamProject, circuit: Circuit, code: string, compile: HexCompiler): Promise<ProjectGrade> {
  let analysis: ExamGoalCtx['analysis']
  try { analysis = analyze(circuit) } catch { return zero(project, 'Circuit could not be analysed') }

  let compiled = false
  let compileError: string | undefined
  let run: ReturnType<typeof runScenario> | null = null
  try {
    const r = await compile(code)
    if (r.ok) {
      compiled = true
      try { run = runScenario(project, circuit, r.hex) } catch (e) { compileError = `Simulation error: ${(e as Error).message}` }
    } else compileError = r.error
  } catch (e) { compileError = (e as Error).message }

  const ctx: ExamGoalCtx = {
    circuit, analysis, code,
    lab: run?.state ?? null,
    stats: run?.stats ?? emptyStats(),
    marks: run?.marks ?? {},
    serial: run?.state.serial ?? '',
  }
  const goals = project.goals.map((g) => {
    let ok = false
    try { ok = !!g.check(ctx) } catch { ok = false }
    return { id: g.id, text: g.text, kind: g.kind, points: g.points, earned: ok ? g.points : 0 }
  })
  const score = goals.reduce((a, g) => a + g.earned, 0)
  return { score, compiled, compileError, goals, serialTail: ctx.serial.slice(-2000) }
}

function zero(project: ExamProject, why: string): ProjectGrade {
  return {
    score: 0, compiled: false, compileError: why, serialTail: '',
    goals: project.goals.map((g) => ({ id: g.id, text: g.text, kind: g.kind, points: g.points, earned: 0 })),
  }
}
