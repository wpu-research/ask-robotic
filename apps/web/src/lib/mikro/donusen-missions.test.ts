import { describe, expect, it } from 'vitest'
import { disallowedTypes } from './activity'
import { toolboxCategories } from './blocks'
import { generate } from './codegen'
import { DONUSEN_IDS, DONUSEN_MODELS, PART_IDS } from './donusen'
import { DONUSEN_MISSIONS, evaluateDonusen, missionsOf, runDonusen, say, strum, walk } from './donusen-missions'
import { errorText } from './en'
import { onStart, project } from './program'
import { Simulation } from './sim'

describe('Dönüşen Robot görevleri', () => {
  for (const m of DONUSEN_MISSIONS) {
    describe(`${m.model}/${m.title}`, () => {
      it('örnek çözüm bütün hedefleri sağlar, hata vermez; yalnız izinli blokları kullanır', () => {
        const r = evaluateDonusen(m, m.solution())
        expect(r.error).toBeNull()
        expect(r.status.filter((s) => !s.done).map((s) => s.id)).toEqual([])
        expect(disallowedTypes(m, m.solution())).toEqual([])
      })
      it('başlangıç projesi hedefleri sağlamaz', () => {
        expect(evaluateDonusen(m, m.starter()).done).toBe(false)
      })
      it('İngilizcesi tam; en az bir ipucu var', () => {
        expect(m.en.title && m.en.intro).toBeTruthy()
        expect(Object.keys(m.en.goals ?? {}).sort()).toEqual(m.goals.map((g) => g.id).sort())
        for (const g of m.goals) expect(!!m.en.goals![g.id].hint, g.id).toBe(!!g.hint)
        expect(m.goals.some((g) => g.hint)).toBe(true)
      })
    })
  }

  it('her modelin 2-3 görevi var; kimlikler tekil', () => {
    for (const id of DONUSEN_IDS) expect(missionsOf(id).length, id).toBeGreaterThanOrEqual(2)
    for (const id of DONUSEN_IDS) expect(missionsOf(id).length, id).toBeLessThanOrEqual(3)
    expect(new Set(DONUSEN_MISSIONS.map((m) => m.id)).size).toBe(DONUSEN_MISSIONS.length)
  })

  it('belirlenimci: aynı program aynı sonucu verir', () => {
    for (const m of DONUSEN_MISSIONS) {
      const snap = () => { const b = runDonusen(m, m.solution()).donusen!; return { x: b.x, said: b.said, strums: b.strums, loads: b.loads, pose: b.poseLog } }
      expect(snap(), m.id).toEqual(snap())
    }
  })

  it('yanlış davranış yakalanır: el uzakken miyavlayan kedi, duvara çarpan robot', () => {
    const kedi = DONUSEN_MISSIONS.find((m) => m.id === 'sev-beni')!
    const always = evaluateDonusen(kedi, project('x', [{ ...onStart(), type: 'mk_forever', inputs: { DO: { block: say('Miyav') } } }]))
    expect(always.status.find((s) => s.id === 'sessiz')!.done).toBe(false)
    const yuru = DONUSEN_MISSIONS.find((m) => m.id === 'duvara-yuru')!
    const r = runDonusen(yuru, project('x', [onStart(walk(20))])).donusen!
    expect(r.bumped).toBe(true)
    expect(evaluateDonusen(yuru, project('x', [onStart(walk(20))])).status.find((s) => s.id === 'dur')!.done).toBe(false)
  })
})

describe('Dönüşen Robot motoru ve blokları', () => {
  it('her model aynı 11 parçadan kurulur; kurulum adımları her parçayı bir kez takar', () => {
    for (const id of DONUSEN_IDS) {
      const m = DONUSEN_MODELS[id]
      expect(Object.keys(m.poses).sort(), id).toEqual([...PART_IDS].sort())
      const placed = m.build.flatMap((s) => s.parts)
      expect([...placed].sort(), id).toEqual([...PART_IDS].sort())
      expect(m.build.length).toBeGreaterThanOrEqual(3)
      for (const s of m.build) expect(s.text && s.en, id).toBeTruthy()
      expect(m.en.title && m.en.summary).toBeTruthy()
    }
  })

  it('araç kutusu yalnız seçili modelin bloklarını gösterir', () => {
    const types = (id: (typeof DONUSEN_IDS)[number]) => toolboxCategories(null, null, 'tr', id).find((c) => c.key === 'donusen')!.entries.map((e) => e.type)
    expect(types('insansi')).toEqual(expect.arrayContaining(['dn_walk', 'dn_wave', 'dn_say', 'dn_distance']))
    expect(types('insansi')).not.toContain('dn_boom')
    expect(types('vinc')).toEqual(expect.arrayContaining(['dn_boom', 'dn_hook', 'dn_grab']))
    expect(types('vinc')).not.toContain('dn_distance')
    expect(types('kedi')).toEqual(expect.arrayContaining(['dn_tail', 'dn_pose']))
    expect(toolboxCategories(null, null).some((c) => c.key === 'donusen')).toBe(false)
  })

  it('başka modelin bloğu anlaşılır hata verir (TR/EN); Dönüşen Robot yokken çalışmaz', () => {
    const sim = new Simulation(project('x', [onStart(strum())]), { donusen: { model: 'insansi' } })
    sim.start(); sim.advance(500)
    expect(sim.error?.message).toBe('İnsansı Robot modelinde bu blok yok; Müzik Aleti modelinde çalışır.')
    expect(errorText(sim.error!.message, 'en')).toBe('The Humanoid Robot model has no such block; it works on: Music Instrument.')
    const plain = new Simulation(project('x', [onStart(walk(1))]))
    plain.start(); plain.advance(500)
    expect(errorText(plain.error!.message, 'en')).toMatch(/^Transforming Robot blocks only work/)
  })

  it('müzik: el yaklaştıkça nota incelir; ses günlüğe yazılır', () => {
    const sim = new Simulation(project('x', [onStart(strum(), strum())]), { donusen: { model: 'muzik', handScript: (t) => (t < 300 ? 30 : 3) } })
    sim.start(); sim.advance(1500)
    const s = sim.donusen!.strums
    expect(s.length).toBe(2)
    expect(s[1].freq).toBeGreaterThan(s[0].freq)
    expect(sim.allEvents().filter((e) => e.e.kind === 'tone').length).toBe(2)
  })

  it('JavaScript ve Python görünümü bot çağrılarını üretir', () => {
    const ws = DONUSEN_MISSIONS.find((m) => m.id === 'yuk-tasi')!.solution().workspace
    expect(generate(ws, 'js')).toContain('bot.turnArm(0)')
    expect(generate(ws, 'py')).toContain('bot.turn_arm(0)')
  })
})
