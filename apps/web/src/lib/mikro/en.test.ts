import { describe, expect, it } from 'vitest'
import { BLOCK_JSON, SPECS, blockJsonFor, toolboxCategories } from './blocks'
import { BLOCK_EN, errorText, ICON_EN, MELODY_EN } from './en'
import { ICONS } from './icons'
import { MELODIES } from './music'
import { ROBOT_MISSIONS } from './robot-missions'
import { SKILL_CHALLENGES } from './beceri'
import { EXAMPLES } from './examples'

const ph = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort()

describe('İngilizce görünüm metinleri', () => {
  it('her özel bloğun İngilizce etiketi var ve aynı yer tutucuları kullanır', () => {
    for (const s of SPECS) {
      const en = BLOCK_EN[s.type]
      expect(en, s.type).toBeDefined()
      expect(ph(en.label), s.type).toEqual(ph(s.label))
    }
  })
  it('İngilizce Blockly JSON: tür, alan adları ve değerler Türkçeyle aynı; yalnız yazılar farklı', () => {
    const en = blockJsonFor('en')
    expect(blockJsonFor('tr')).toBe(BLOCK_JSON)
    expect(en.map((j) => j.type)).toEqual(BLOCK_JSON.map((j) => j.type))
    en.forEach((j, i) => {
      const tr = BLOCK_JSON[i]
      expect(j.message0).not.toMatch(/\{\w+\}|[ğşıçöüİ]/)
      expect((j.message0.match(/%\d+/g) ?? []).sort()).toEqual((tr.message0.match(/%\d+/g) ?? []).sort())
      expect(j.args0.map((a) => [a.type, a.name])).toEqual(tr.args0.map((a) => [a.type, a.name]))
      j.args0.forEach((a, k) => {
        if (a.type !== 'field_dropdown') return
        const vals = (a.options as [string, string][]).map((o) => o[1])
        expect(vals).toEqual((tr.args0[k].options as [string, string][]).map((o) => o[1]))
        for (const [label] of a.options as [string, string][]) expect(label, `${j.type} ${label}`).not.toMatch(/[ğşıçöüİ]/)
      })
    })
  })
  it('araç kutusu kategori adları dile göre', () => {
    expect(toolboxCategories(null, null, 'en').map((c) => c.label)).toContain('Variables')
    expect(toolboxCategories(null, null).map((c) => c.label)).toContain('Değişken')
  })
  it('simge ve ezgi adlarının hepsi çevrili', () => {
    for (const i of ICONS) expect(ICON_EN[i.id], i.id).toBeTruthy()
    for (const m of MELODIES) expect(MELODY_EN[m.id], m.id).toBeTruthy()
  })
  it('görev, beceri ve örneklerin İngilizcesi tam (hedef kimlikleri eşleşir)', () => {
    for (const m of ROBOT_MISSIONS) {
      expect(m.en.title && m.en.intro, m.id).toBeTruthy()
      expect(Object.keys(m.en.goals ?? {}).sort(), m.id).toEqual(m.goals.map((g) => g.id).sort())
      for (const g of m.goals) expect(!!m.en.goals![g.id].hint, `${m.id}/${g.id}`).toBe(!!g.hint)
    }
    for (const c of SKILL_CHALLENGES) expect(c.en.rules.length).toBe(c.rules.length)
    for (const e of EXAMPLES) expect(e.en.title && e.en.description && e.en.tryIt, e.id).toBeTruthy()
  })
  it('çalışma hataları İngilizceye çevrilir, Türkçede aynı kalır', () => {
    const tr = "Program durdu döngüde"
    expect(errorText(tr, 'tr')).toBe(tr)
    expect(errorText('Bilinmeyen blok: x', 'en')).toBe('Unknown block: x')
    expect(errorText('Mini Gezgin gövdesinde renk sensörü yok.', 'en')).toBe('The Mini Rover has no color sensor.')
    expect(errorText("Listede 5 numaralı öğe yok (liste 3 öğeli, numaralar 0'dan başlar).", 'en')).toMatch(/^There is no item 5/)
  })
})
