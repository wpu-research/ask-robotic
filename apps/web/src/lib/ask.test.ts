import { describe, expect, it } from 'vitest'
import type { CatalogModule } from './catalog'
import { askSearch, askWords } from './ask'

const cat: CatalogModule[] = [{
  id: 1, slug: 'arduino-temelleri', title: 'Arduino Temelleri', position: 3, track: 'maker', kind: 'devre', minAge: 12, tagline: "LED'den termostata", audience: '',
  weeks: [{ id: 1, position: 1, title: 'İlk adımlar', project: null, lessons: [
    { id: 10, title: 'Elektrik: V, I, R ve Ohm yasası', durationMin: 20, kind: 'devre', position: 2, steps: 14 },
    { id: 11, title: 'İlk program: Blink', durationMin: 20, kind: 'devre', position: 3 },
  ] }],
}]

describe('niyet arama', () => {
  it('soru kalıplarını atar, ekleri kökle eşler', () => {
    expect(askWords('Ohm yasası nedir?')).toEqual(['ohm', 'yasa'])
    expect(askSearch(cat, 'ohm yasasını nasıl hesaplarım')[0]).toMatchObject({ href: '/ders/10' })
  })
  it('kurs adını da bulur; boş sorgu sonuç vermez', () => {
    expect(askSearch(cat, 'arduino öğrenmek istiyorum').some((h) => h.href === '/moduller/arduino-temelleri')).toBe(true)
    expect(askSearch(cat, 'nasıl')).toEqual([])
  })
})
