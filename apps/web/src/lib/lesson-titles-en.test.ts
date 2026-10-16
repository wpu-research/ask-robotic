import { describe, expect, it } from 'vitest'
import { allModules } from '@ask/db'
import { LESSON_TITLES_EN, lessonKey, lessonTitle, lessonTitleByKey } from './lesson-titles-en'
import { localizeCatalog, localizeModule } from './catalog-en'
import type { CatalogModule } from './catalog'

const TURKISH = /[ğşıİçöüĞŞÇÖÜ]/

/** Kaynaktaki her ders, seed ile aynı sırayla (position = dizin + 1). */
const sourceLessons = allModules.flatMap((m) =>
  m.weeks.flatMap((w, wi) => w.lessons.map((l, li) => ({ slug: m.slug, week: wi + 1, pos: li + 1, title: l.title }))),
)

describe('ders başlıklarının İngilizcesi', () => {
  it('kaynaktaki her dersin İngilizce başlığı var; fazladan anahtar yok', () => {
    const keys = sourceLessons.map((l) => lessonKey(l.slug, l.week, l.pos))
    for (const k of keys) expect(LESSON_TITLES_EN[k]?.trim(), k).toBeTruthy()
    expect(Object.keys(LESSON_TITLES_EN).sort()).toEqual([...keys].sort())
  })

  it('İngilizce başlıklarda Türkçeye özgü harf ve uzun tire yok', () => {
    for (const [k, v] of Object.entries(LESSON_TITLES_EN)) {
      expect(TURKISH.test(v), `${k}: ${v}`).toBe(false)
      expect(v.includes('—'), `${k}: ${v}`).toBe(false)
    }
  })

  it('proje dersleri İngilizcede de proje olarak tanınır', () => {
    const tr = /^(Proje|Bitirme)/, en = /^(Project:|Final (project|robot):)/
    for (const l of sourceLessons) expect(en.test(LESSON_TITLES_EN[lessonKey(l.slug, l.week, l.pos)]), l.title).toBe(tr.test(l.title))
  })

  it('Türkçede başlık değişmez; İngilizcede çevrilir', () => {
    for (const l of sourceLessons) expect(lessonTitle(l.slug, l.week, l.pos, l.title, 'tr')).toBe(l.title)
    expect(lessonTitle('arduino-temelleri', 1, 3, 'İlk program: Blink', 'en')).toBe('First program: Blink')
    expect(lessonTitleByKey('arduino-temelleri:1:5', 'Proje: Trafik ışığı', 'en')).toBe('Project: Traffic light')
    // Bilinmeyen ders Türkçe kalır
    expect(lessonTitle('yok', 9, 9, 'Bilinmeyen', 'en')).toBe('Bilinmeyen')
  })

  it('katalog: Türkçede aynı nesne, İngilizcede modül ve ders başlıkları çevrilir', () => {
    const m = allModules.find((x) => x.slug === 'arduino-temelleri')!
    const cm = {
      id: 1, slug: m.slug, title: m.title, tagline: 'x', audience: 'y', position: 3, track: 'maker', kind: 'devre', minAge: 12,
      weeks: [{ id: 1, position: 1, title: 'Temeller', project: 'Trafik ışığı', lessons: m.weeks[0].lessons.map((l, i) => ({ id: i + 1, title: l.title, durationMin: l.durationMin, kind: 'metin', position: i + 1 })) }],
    } as unknown as CatalogModule
    expect(localizeModule(cm, 'tr')).toBe(cm)
    const list = [cm]
    expect(localizeCatalog(list, 'tr')).toBe(list)
    const en = localizeCatalog(list, 'en')[0]
    expect(en.title).toBe('Arduino Basics')
    expect(en.weeks[0].lessons.map((l) => l.title)).toEqual(m.weeks[0].lessons.map((_, i) => LESSON_TITLES_EN[`arduino-temelleri:1:${i + 1}`]))
    expect(cm.weeks[0].lessons[0].title).toBe(m.weeks[0].lessons[0].title)
  })
})
