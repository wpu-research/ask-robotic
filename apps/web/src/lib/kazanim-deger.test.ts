import { describe, expect, it } from 'vitest'
import { allModules } from '@ask/db'
import { DEGERLER, KAZANIM_DEGER, kazanimFor } from './kazanim-deger'

describe('kazanım–değer matrisi', () => {
  it('her yayımlı modülün her haftası için tam bir satır var', () => {
    for (const m of allModules) {
      expect(KAZANIM_DEGER[m.slug], m.slug).toBeDefined()
      expect(KAZANIM_DEGER[m.slug].length, m.slug).toBe(m.weeks.length)
    }
    expect(Object.keys(KAZANIM_DEGER).sort()).toEqual(allModules.map((m) => m.slug).sort())
  })

  it('değerler listede, metinler dolu', () => {
    for (const rows of Object.values(KAZANIM_DEGER)) {
      for (const row of rows) {
        expect(DEGERLER[row.deger]).toBeTruthy()
        expect(row.eylem.trim().length).toBeGreaterThan(10)
        expect(row.cikti.trim().length).toBeGreaterThan(10)
      }
    }
  })

  it('hafta konumuyla bulunur', () => {
    expect(kazanimFor('robotik', 1)?.deger).toBe('saygi')
    expect(kazanimFor('robotik', 99)).toBeNull()
    expect(kazanimFor('yok', 1)).toBeNull()
  })
})
