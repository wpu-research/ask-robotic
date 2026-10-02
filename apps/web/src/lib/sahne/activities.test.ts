// Her etkinlik: başlangıç hedefleri sağlamaz, çözüm sağlar; çözüm yalnız izinli blokları kullanır.
import * as Blockly from 'blockly'
import { beforeAll, describe, expect, it } from 'vitest'
import { evaluateGoals } from './activity'
import { BLOCK_BY_TYPE, PROC_CALL_PREFIX, PROC_DEF_PREFIX, typesUsed, VAR_GET, ARG_BLOCK } from './blocks'
import { defineProcBlocks, defineSahneBlocks, setOptionProviders } from './blockly-defs'
import { SAHNE_ACTIVITIES } from './activities'
import { allMessages, cloneProject, exportProject, parseProject, targetsOf } from './project'
import type { SahneProject } from './types'

const keys = Object.keys(SAHNE_ACTIVITIES)

describe('Modül 2 etkinlik kaydı', () => {
  it('16 etkinlik, anahtar scratch:<hafta>:<ders>', () => {
    expect(keys).toHaveLength(16)
    for (let w = 1; w <= 8; w++) for (let l = 1; l <= 2; l++) expect(SAHNE_ACTIVITIES[`scratch:${w}:${l}`], `scratch:${w}:${l}`).toBeTruthy()
    for (const [k, a] of Object.entries(SAHNE_ACTIVITIES)) expect(a.id).toBe(k)
  })
})

beforeAll(() => {
  defineSahneBlocks(Blockly)
})

const allowedOf = (a: (typeof SAHNE_ACTIVITIES)[string]) => new Set(a.allowedBlocks)

describe.each(keys)('%s', (key) => {
  const a = SAHNE_ACTIVITIES[key]

  it('başlangıç projesi hedefleri sağlamaz', () => {
    const ev = evaluateGoals(a, a.starter())
    expect(ev.allPassed, ev.results.filter((r) => !r.optional && r.ok).map((r) => r.id).join(',')).toBe(false)
  })

  it('çözüm tüm (zorunlu) hedefleri sağlar', () => {
    const ev = evaluateGoals(a, a.solution())
    const failed = ev.results.filter((r) => !r.optional && !r.ok).map((r) => `${r.id}${r.detail ? ` (${r.detail})` : ''}`)
    expect(failed).toEqual([])
    expect(ev.error).toBeNull()
  })

  it('çözüm isteğe bağlı hedefleri de sağlar (yapılabilirlik)', () => {
    const ev = evaluateGoals(a, a.solution())
    const failed = ev.results.filter((r) => r.optional && !r.ok).map((r) => r.id)
    expect(failed).toEqual([])
  })

  it('çözüm yalnız izinli blokları kullanır', () => {
    const ok = allowedOf(a)
    const sol = a.solution()
    const bad: string[] = []
    for (const t of targetsOf(sol)) for (const ty of typesUsed(t.def.blocks)) {
      if (ty === 'math_number' || ty === 'text') continue
      if (ty.startsWith(PROC_DEF_PREFIX) || ty.startsWith(PROC_CALL_PREFIX) || ty === ARG_BLOCK) { if (!ok.has('sh_proc')) bad.push(ty); continue }
      if (!BLOCK_BY_TYPE[ty] && ty !== VAR_GET) bad.push(`?${ty}`)
      else if (!ok.has(ty)) bad.push(ty)
    }
    expect(bad).toEqual([])
  })

  it('başlangıç ve çözüm Blockly\'de yüklenir ve JSON içe/dışa aktarma korunur', () => {
    for (const make of [a.starter, a.solution]) {
      const p: SahneProject = make()
      setOptionProviders({ costumes: () => p.sprites.flatMap((s) => s.costumes.map((c) => c.name)), backdrops: () => p.stage.backdrops.map((c) => c.name), sounds: () => p.sprites.flatMap((s) => s.sounds.map((x) => x.name)), sprites: () => p.sprites.map((s) => ({ id: s.id, name: s.name })), messages: () => allMessages(p) })
      defineProcBlocks(Blockly, [...p.sprites.flatMap((s) => s.procs), ...p.stage.procs])
      for (const t of targetsOf(p)) {
        const ws = new Blockly.Workspace()
        Blockly.serialization.workspaces.load({ ...t.def.blocks, variables: p.variables.map((v) => ({ name: v.name, id: v.id, type: v.type })) } as never, ws)
        const saved = JSON.stringify(Blockly.serialization.workspaces.save(ws))
        // yüklenen blok sayısı kaynakla aynı
        const count = (s: string) => (s.match(/"type":"sh_/g) ?? []).length
        expect(count(saved), `${t.id}`).toBe(count(JSON.stringify(t.def.blocks)))
        ws.dispose()
      }
      const back = parseProject(exportProject(cloneProject(p)))
      expect(back).not.toBeNull()
      expect(back!.sprites.length).toBe(p.sprites.length)
      expect(back!.sprites.map((s) => s.blocks)).toEqual(p.sprites.map((s) => s.blocks))
    }
  })
})
