import { execFileSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'
import { allModules } from '@ask/db'
import { allLabActivities, getLabActivity } from './activity'
import { evaluateLabGoals } from './goals'
import { StatsTracker, emptyStats } from './stats'
import { analyze, createRuntime } from './runtime'
import { compileSketch } from '@/lib/compile/compile'
import { isCircuit } from './ops'

const hasCli = (() => { try { execFileSync(process.env.ARDUINO_CLI ?? 'arduino-cli', ['version'], { stdio: 'ignore' }); return true } catch { return false } })()
const key = (slug: string, w: number, l: number) => `${slug}:${w}:${l}`

describe('laboratuvar etkinlikleri', () => {
  const entries = allLabActivities()

  it('en az bir etkinlik var', () => expect(entries.length).toBeGreaterThan(0))

  it('her anahtar gerçek bir hafta/ders konumuna karşılık gelir', () => {
    for (const [k] of entries) {
      const [slug, w, l] = k.split(':')
      const m = allModules.find((x) => x.slug === slug)
      expect(m, k).toBeTruthy()
      expect(m!.weeks[Number(w) - 1]?.lessons[Number(l) - 1], k).toBeTruthy()
    }
  })

  for (const [k, act] of entries) {
    describe(k, () => {
      it('başlangıç devresi geçerlidir ve Uno içerir', () => {
        const s = act.starter()
        expect(isCircuit(s.circuit)).toBe(true)
        expect(s.circuit.parts.some((p) => p.type === 'uno')).toBe(true)
      })
      it('iki starter çağrısı bağımsız nesne üretir', () => {
        const a = act.starter(), b = act.starter()
        a.circuit.parts.push({ id: 'x', type: 'led', x: 0, y: 0, rotation: 0, props: {} })
        expect(b.circuit.parts.some((p) => p.id === 'x')).toBe(false)
      })
      it('başlangıçta tüm hedefler sağlanmaz', () => {
        const s = act.starter()
        const res = evaluateLabGoals(act.goals, { circuit: s.circuit, analysis: analyze(s.circuit), lab: null, code: s.code, stats: emptyStats() })
        expect(res.every((r) => r.done)).toBe(false)
      })
      it('çözümün bağlantı/parça hedefleri sağlanır', () => {
        const sol = act.solution!()
        const res = evaluateLabGoals(act.goals.filter((g) => !g.behavior), { circuit: sol.circuit, analysis: analyze(sol.circuit), lab: null, code: sol.code, stats: emptyStats() })
        expect(res.filter((r) => !r.done).map((r) => r.id)).toEqual([])
      })
      it('çözüm yalnız izin verilen parçaları kullanır', () => {
        const sol = act.solution!()
        const allowed = new Set([...(act.allowedParts ?? []), 'uno'])
        if (act.allowedParts) for (const p of sol.circuit.parts) expect(allowed.has(p.type), p.type).toBe(true)
      })
      it.skipIf(!hasCli)('çözümü derleyip çalıştırınca davranış hedefleri de sağlanır', async () => {
        const sol = act.solution!()
        const r = await compileSketch(sol.code)
        if (!r.ok) throw new Error('derleme hatası: ' + JSON.stringify(r))
        const lab = createRuntime(sol.circuit, r.hex)
        const tr = new StatsTracker()
        for (let t = 0; t < 3000; t += 5) { lab.advance(5); tr.observe(lab.state) }
        const res = evaluateLabGoals(act.goals, { circuit: sol.circuit, analysis: analyze(sol.circuit), lab: lab.state, code: sol.code, stats: tr.get() })
        lab.dispose()
        expect(res.filter((x) => !x.done).map((x) => x.id)).toEqual([])
      }, 60_000)
    })
  }

  it('getLabActivity bilinmeyen anahtarda null döner', () => {
    expect(getLabActivity('yok:1:1')).toBeNull()
    expect(getLabActivity(null)).toBeNull()
    expect(getLabActivity(key('arduino-temelleri', 1, 3))).not.toBeNull()
  })
})
