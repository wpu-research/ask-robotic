// Genel etkinlik testi: starter hedefleri sağlamaz, solution hepsini sağlar, çözüm yalnız izinli blokları kullanır.
import { describe, expect, it } from 'vitest'
import { disallowedTypes, evaluateActivity } from './activity'
import { allMikroActivities } from './activities'
import { toJavaScript, toPython } from './codegen'
import { EXAMPLES } from './examples'
import { runScenario } from './scenario'
import { parseProject, exportProject } from './storage'

describe.each(allMikroActivities())('etkinlik %s', (_key, act) => {
  it('metinler ve hedefler dolu, kimlikler benzersiz', () => {
    expect(act.goals.length).toBeGreaterThan(0)
    expect(new Set(act.goals.map((g) => g.id)).size).toBe(act.goals.length)
    for (const g of act.goals) expect(g.text.trim().length).toBeGreaterThan(5)
  })
  it('starter() her çağrıda taze nesne verir', () => {
    const a = act.starter(), c = act.starter()
    expect(a).not.toBe(c)
    expect(a.workspace).not.toBe(c.workspace)
  })
  it('starter hedefleri sağlamaz', () => {
    const r = evaluateActivity(act, act.starter())
    expect(r.done).toBe(false)
    // davranış hedeflerinin hiçbiri boş başlangıçla sağlanmamalı
    for (const s of r.status) {
      const goal = act.goals.find((g) => g.id === s.id)!
      if (goal.sticky !== false) expect(s.done, `starter ${s.id} hedefini sağlıyor`).toBe(false)
    }
  })
  it('solution tüm hedefleri sağlar, hata vermez', () => {
    const r = evaluateActivity(act, act.solution())
    expect(r.error).toBeNull()
    expect(r.status.filter((s) => !s.done).map((s) => s.id)).toEqual([])
    expect(r.done).toBe(true)
  })
  it('çözüm yalnız izinli blokları kullanır; starter de', () => {
    expect(disallowedTypes(act, act.solution())).toEqual([])
    expect(disallowedTypes(act, act.starter())).toEqual([])
  })
  it('çözümün JavaScript ve Python karşılığı üretilir', () => {
    expect(toJavaScript(act.solution().workspace)).toMatch(/card\.(on|forever|every)/)
    expect(toPython(act.solution().workspace)).toMatch(/card\.(on_|forever|every)/)
  })
})

describe('örnek galerisi', () => {
  it('en az 8 örnek, kimlikler benzersiz', () => {
    expect(EXAMPLES.length).toBeGreaterThanOrEqual(8)
    expect(new Set(EXAMPLES.map((e) => e.id)).size).toBe(EXAMPLES.length)
  })
  describe.each(EXAMPLES)('örnek $id', (ex) => {
    it('dışa/içe aktarma gidiş-dönüş, kod üretimi, hatasız çalışma', () => {
      const p = ex.build()
      const back = parseProject(exportProject(p))
      expect(back.ok).toBe(true)
      expect(toJavaScript(p.workspace).length).toBeGreaterThan(40)
      expect(toPython(p.workspace).length).toBeGreaterThan(40)
      const sim = runScenario(p, (s) => {
        s.advance(1500)
        s.press('A'); s.advance(800)
        s.press('B'); s.advance(800)
        s.shake(); s.advance(800)
        s.touchLogo(); s.setSensor('temperature', 30); s.setSensor('light', 10); s.setCompass(120); s.setPinInput('P1', 700)
        s.touchPin('P2')
        s.advance(1500)
      }, { cards: ex.cards ?? 1 })
      expect(sim.error?.message ?? null).toBeNull()
    })
  })
})
