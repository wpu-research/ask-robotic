import { describe, expect, it } from 'vitest'
import { allModules } from '@ask/db'
import { MODULE_META } from './module-meta'
import { localizedAgeLabel, localizeModule, MODULES_EN, moduleTitle, weekTitle } from './catalog-en'
import { parcalarEn } from './parca-rehberi.en.generated'
import { localizeGuide, localizedGuides } from './parca-rehberi-i18n'
import { PART_GUIDES } from './parca-rehberi'
import type { CatalogModule } from './catalog'

describe('modül kataloğu İngilizcesi', () => {
  it('her modülün İngilizcesi var; hafta sayısı Türkçeyle aynı', () => {
    for (const m of allModules) {
      const en = MODULES_EN[m.slug]
      expect(en, m.slug).toBeDefined()
      expect(en.weeks.length, m.slug).toBe(m.weeks.length)
      for (const [t, p] of en.weeks) { expect(t.trim()).not.toBe(''); expect(p.trim()).not.toBe('') }
      if (MODULE_META[m.slug]?.callout) expect(en.callout, m.slug).toBeTruthy()
    }
  })
  it('Türkçede metinler olduğu gibi kalır', () => {
    const m = allModules.find((x) => x.slug === 'arduino-temelleri')!
    expect(moduleTitle(m.slug, m.title, 'tr')).toBe('Arduino Temelleri')
    expect(weekTitle(m.slug, 1, 'Temeller', 'tr')).toBe('Temeller')
    expect(localizedAgeLabel('mikro-kart', 8, 'tr')).toBe('8+ yaş')
    expect(localizedAgeLabel('arduino-temelleri', 12, 'tr')).toBe('12+ yaş')
    const cm = { slug: m.slug, title: m.title, tagline: 'x', audience: 'y', weeks: [{ position: 1, title: 'Temeller', project: 'Trafik ışığı', lessons: [] }] } as unknown as CatalogModule
    expect(localizeModule(cm, 'tr')).toBe(cm)
  })
  it('İngilizcede modül ve hafta adı çevrilir', () => {
    const cm = { slug: 'arduino-temelleri', title: 'Arduino Temelleri', tagline: 'x', audience: 'y', weeks: [{ position: 1, title: 'Temeller', project: 'Trafik ışığı', lessons: [] }] } as unknown as CatalogModule
    const en = localizeModule(cm, 'en')
    expect(en.title).toBe('Arduino Basics')
    expect(en.weeks[0].title).toBe('Basics')
    expect(en.weeks[0].project).toBe('Traffic light')
    expect(localizedAgeLabel('arduino-temelleri', 12, 'en')).toBe('Ages 12+')
  })
})

describe('parça ansiklopedisi İngilizcesi', () => {
  it('her parçanın İngilizcesi var; pin adları ve tipik değer sayısı aynı', () => {
    for (const g of PART_GUIDES) {
      const en = parcalarEn[g.slug]
      expect(en, g.slug).toBeDefined()
      expect(en.pins.map((p) => p.name)).toEqual(g.pins.map((p) => p.name))
      expect(en.typicalValues.length).toBe(g.typicalValues.length)
    }
  })
  it('Türkçede kayıt değişmez; İngilizcede metin değişir, partType ve ilgili dersler kalır', () => {
    const led = PART_GUIDES.find((g) => g.slug === 'led')!
    expect(localizeGuide(led, 'tr')).toBe(led)
    const en = localizeGuide(led, 'en')
    expect(en.category).toBe('Output')
    expect(en.howItWorksMd).toContain('light-emitting diode')
    expect(en.partType).toBe(led.partType)
    expect(en.relatedLessons).toEqual(led.relatedLessons)
    expect(localizedGuides('en')).toHaveLength(PART_GUIDES.length)
  })
})
