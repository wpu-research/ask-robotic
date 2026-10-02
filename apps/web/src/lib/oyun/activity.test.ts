import { describe, expect, it } from 'vitest'
import { ACTIVITIES } from './activities'
import { disallowedBlocks, evaluateGoals, runScenario } from './activity'
import { validateProject } from './project'
import { toolboxJson } from './blocks'
import { b, program } from './dsl'

describe('ders etkinlikleri (genel sözleşme)', () => {
  it('en az 5 etkinlik tanımlı ve kimlikleri benzersiz', () => {
    expect(ACTIVITIES.length).toBeGreaterThanOrEqual(5)
    expect(new Set(ACTIVITIES.map((a) => a.id)).size).toBe(ACTIVITIES.length)
  })

  for (const a of ACTIVITIES) {
    describe(a.id, () => {
      it('başlangıç projesi geçerli ve her çağrıda yenidir', () => {
        const s1 = a.starter(), s2 = a.starter()
        expect(s1).not.toBe(s2)
        expect(validateProject(JSON.parse(JSON.stringify(s1)))).not.toBeNull()
        expect(a.goals.length).toBeGreaterThan(0)
        expect(new Set(a.goals.map((g) => g.id)).size).toBe(a.goals.length)
      })

      it('başlangıç hedefleri sağlamaz (en az biri eksik, tamamı değil)', () => {
        const ev = evaluateGoals(a, a.starter())
        expect(ev.error).toBeNull()
        expect(ev.allPassed).toBe(false)
      })

      it('çözüm tüm hedefleri sağlar', () => {
        const ev = evaluateGoals(a, a.solution())
        expect(ev.error).toBeNull()
        expect(ev.results.filter((r) => !r.ok).map((r) => r.id)).toEqual([])
        expect(ev.allPassed).toBe(true)
      })

      it('çözüm yalnız izinli blokları kullanır; araç kutusu açılır', () => {
        expect(disallowedBlocks(a.solution(), a.allowedBlocks)).toEqual([])
        const tb = toolboxJson(a.allowedBlocks)
        expect(tb.contents.length).toBeGreaterThan(0)
      })

      it('çözüm başsız çalıştırmada aynı sonucu verir (belirlenimci)', () => {
        const r1 = runScenario(a.solution(), a.scenario, a.seed ?? 1), r2 = runScenario(a.solution(), a.scenario, a.seed ?? 1)
        expect(r1.engine.snapshot()).toEqual(r2.engine.snapshot())
      })
    })
  }

  it('hatalı program hedefleri geçirmez ve hata mesajı verir', () => {
    const a = ACTIVITIES[0]
    const bad = { ...a.solution(), blocks: program([b('oyun_baslangic', {}, b('sprite_konum', { S: 'yok', X: 1, Y: 1 }))]) }
    const ev = evaluateGoals(a, bad)
    expect(ev.error).not.toBeNull()
    expect(ev.allPassed).toBe(false)
    expect(ev.results.every((r) => !r.ok)).toBe(true)
  })
})
