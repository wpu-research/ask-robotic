// Sunucu tarafı proje puanlayıcısı: öğrencinin kodunu derler, kendi devresinde senaryoyu çalıştırır, sonucu yazar.
// Bu modülü içe aktarmak puanlayıcıyı service.ts kuyruğuna bağlar (yan etki).
import { eq, examAttempts, type Db } from '@ask/db'
import { compileSketch } from '@/lib/compile/compile'
import type { Circuit } from '@/lib/lab/contract'
import { isCircuit, normalizeCircuit } from '@/lib/lab/ops'
import { gradeProject, type HexCompiler } from './grade'
import { examProject } from './projects'
import { getAttempt, setGrader } from './service'

const compile: HexCompiler = async (code) => {
  // Kuyruk doluysa ('busy') birkaç kez bekleyip yeniden dener: sınav sonunda derlemeler yığılır
  for (let i = 0; i < 12; i++) {
    const r = await compileSketch(code, { timeoutMs: 90_000 })
    if (r.ok) return { ok: true, hex: r.hex }
    if (r.reason !== 'busy') {
      const msg = r.errors?.length ? r.errors.slice(0, 5).map((e) => `line ${e.line}: ${e.message}`).join('\n') : r.reason
      return { ok: false, error: `Compile failed: ${msg}` }
    }
    await new Promise((res) => setTimeout(res, 5_000))
  }
  return { ok: false, error: 'Compile service busy' }
}

export async function gradeAttempt(db: Db, attemptId: string) {
  const a = await getAttempt(db, attemptId)
  if (!a) return
  const project = examProject(a.projectId)
  if (!project) {
    await db.update(examAttempts).set({ gradeStatus: 'error', updatedAt: new Date() }).where(eq(examAttempts.id, a.id))
    return
  }
  await db.update(examAttempts).set({ gradeStatus: 'grading' }).where(eq(examAttempts.id, a.id))
  try {
    const circuit: Circuit = isCircuit(a.circuit) ? normalizeCircuit(a.circuit) : project.starter().circuit
    const g = await gradeProject(project, circuit, a.code ?? '', compile)
    await db.update(examAttempts).set({ projectScore: g.score, projectGrade: g, gradeStatus: 'done', updatedAt: new Date() }).where(eq(examAttempts.id, a.id))
  } catch (e) {
    await db.update(examAttempts).set({ gradeStatus: 'error', projectGrade: { error: (e as Error).message }, updatedAt: new Date() }).where(eq(examAttempts.id, a.id))
  }
}

setGrader(gradeAttempt)
