// Ders: Git dalları. Özetler Python'la aynı; ortak ata doğru; çakışmasız birleşme iki değişikliği de içerir, çakışmalı bildirir.
import { describe, expect, it } from 'vitest'
import { BASE_FILE, GIT_DALLARI, gitScenario, ozet, pyList } from './git-dallari'

describe('git-dallari', () => {
  it('kareler: sayı > 3, satırlar kod içinde', () => {
    for (const scenario of [0, 1]) {
      const F = GIT_DALLARI.run({ scenario })
      expect(F.length).toBeGreaterThan(3)
      for (const f of F) expect(f.line).toBeLessThan(GIT_DALLARI.code.length)
    }
  })
  it("özet Python'daki ozet() ile aynı (3530ff0 → 9947fc3)", () => {
    expect(ozet(pyList([]) + pyList(BASE_FILE))).toBe('3530ff0')
    expect(gitScenario(false).ids.c2).toBe('9947fc3')
  })
  it('ortak ata: iki dalın ayrıldığı commit (hız 0,6)', () => {
    for (const c of [false, true]) {
      const S = gitScenario(c)
      expect(S.base).toBe(S.ids.c2)
      expect(S.common.sort()).toEqual([S.ids.c1, S.ids.c2].sort())
    }
  })
  it('çakışmasız: sonuç iki tarafın değişikliklerini de içerir', () => {
    const S = gitScenario(false)
    expect(S.conflicts).toEqual([])
    expect(S.R).toEqual(['HIZ = 0.6', 'ESIK = 0.25', 'PIL_MIN = 11.1', 'def adim(r):', '  r.oku()', '  if r.lidar < ESIK: r.dur()', '  r.git(HIZ, PIL_MIN)'])
    expect(S.merged).not.toBeNull()
    expect(GIT_DALLARI.run({ scenario: 0 }).at(-1)!.shown).toBe(7)
  })
  it('çakışmalı: satır 1 çakışma olarak bildirilir, birleştirme commit’i yok', () => {
    const S = gitScenario(true)
    expect(S.conflicts).toEqual([1])
    expect(S.merged).toBeNull()
    const last = GIT_DALLARI.run({ scenario: 1 }).at(-1)!
    expect(last.conflict!.text).toContain('ESIK = 0.40')
    expect(last.conflict!.text).toContain('ESIK = 0.25')
    expect(last.cap[0]).toMatch(/çakışma: satır 1/)
  })
})
