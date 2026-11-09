import { execFileSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'
import { compileSketch } from '@/lib/compile/compile'
import { isCircuit } from '@/lib/lab/ops'
import { gradeProject, type HexCompiler } from './grade'
import { EXAM_PROJECTS } from './projects'

const hasCli = (() => { try { execFileSync(process.env.ARDUINO_CLI ?? 'arduino-cli', ['version'], { stdio: 'ignore' }); return true } catch { return false } })()
const compile: HexCompiler = async (code) => {
  const r = await compileSketch(code, { timeoutMs: 120_000 })
  return r.ok ? { ok: true, hex: r.hex } : { ok: false, error: JSON.stringify(r.errors ?? r.reason) }
}

describe('sınav projeleri', () => {
  it('kimlikler benzersiz ve p01 biçiminde', () => {
    const ids = EXAM_PROJECTS.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id).toMatch(/^p\d{2}$/)
  })

  for (const p of EXAM_PROJECTS) {
    describe(`${p.id} ${p.title}`, () => {
      it('hedef puanları toplam 100, her türden hedef var', () => {
        expect(p.goals.reduce((a, g) => a + g.points, 0)).toBe(100)
        for (const k of ['circuit', 'code', 'behavior'] as const) expect(p.goals.some((g) => g.kind === k), k).toBe(true)
        expect(new Set(p.goals.map((g) => g.id)).size).toBe(p.goals.length)
      })
      it('başlangıç geçerli, Uno içerir, bağımsız nesne üretir', () => {
        const a = p.starter(), b = p.starter()
        expect(isCircuit(a.circuit)).toBe(true)
        expect(a.circuit.parts.some((x) => x.type === 'uno')).toBe(true)
        a.circuit.parts.push({ id: 'x', type: 'led', x: 0, y: 0, rotation: 0, props: {} })
        expect(b.circuit.parts.some((x) => x.id === 'x')).toBe(false)
      })
      it('çözüm yalnız izinli parçaları kullanır', () => {
        const allowed = new Set([...p.allowedParts, 'uno'])
        for (const x of p.solution().circuit.parts) expect(allowed.has(x.type), x.type).toBe(true)
      })
      it.skipIf(!hasCli)('çözüm 100 alır', async () => {
        const s = p.solution()
        const g = await gradeProject(p, s.circuit, s.code, compile)
        expect(g.compileError).toBeUndefined()
        expect(g.goals.filter((x) => x.earned === 0).map((x) => x.id)).toEqual([])
      }, 180_000)
      it.skipIf(!hasCli)('boş başlangıç 30 puanın altında kalır', async () => {
        const s = p.starter()
        const g = await gradeProject(p, s.circuit, s.code, compile)
        expect(g.score).toBeLessThan(30)
      }, 180_000)
    })
  }
})
