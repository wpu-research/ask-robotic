import { describe, expect, it } from 'vitest'
import { BLOCK_JSON, TEXT_LIMIT, blockJson, blockName, blockStyles, shapeOf, toolboxCategories, toolboxJson, typeOfName } from './blockly-blocks'
import { ALL_BLOCK_TYPES, BLOCKS, CATEGORIES } from './blocks'

describe('blockly-blocks tanımları', () => {
  it('her BlockType için bir jr_<tür> tanımı var ve adlar benzersiz', () => {
    const names = BLOCK_JSON.map((j) => j.type)
    expect(new Set(names).size).toBe(names.length)
    for (const t of ALL_BLOCK_TYPES) expect(names).toContain(`jr_${t}`)
    expect(names.length).toBe(BLOCKS.length)
    for (const t of ALL_BLOCK_TYPES) expect(typeOfName(blockName(t))).toBe(t)
    expect(typeOfName('jr_bogus')).toBeNull()
  })

  it('şekil kuralları: trigger önceki yok; terminal sonraki yok; container DO girişi', () => {
    for (const def of BLOCKS) {
      const j = blockJson(def)
      expect('previousStatement' in j).toBe(!def.trigger)
      expect('nextStatement' in j).toBe(!def.terminal)
      expect(j.args1?.[0]).toEqual(def.container ? { type: 'input_statement', name: 'DO' } : undefined)
      expect(!!def.container).toBe(j.message1 !== undefined)
    }
    expect(shapeOf(BLOCKS.find((b) => b.type === 'flag')!)).toBe('hat')
    expect(shapeOf(BLOCKS.find((b) => b.type === 'forward')!)).toBe('stack')
    expect(shapeOf(BLOCKS.find((b) => b.type === 'stop')!)).toBe('cap')
    expect(shapeOf(BLOCKS.find((b) => b.type === 'repeat')!)).toBe('c')
    expect(shapeOf(BLOCKS.find((b) => b.type === 'forever')!)).toBe('c-cap')
  })

  it('sayısal alanlar blocks.ts sınırlarını taşır; metin alanı say için', () => {
    for (const def of BLOCKS) {
      const j = blockJson(def)
      const num = j.args0.find((a) => a.type === 'field_number')
      if (def.param?.kind === 'number') {
        const unit = def.param.unit
        expect(num).toMatchObject({ name: 'VALUE', value: def.param.default, min: def.param.min, max: def.param.max, precision: def.param.step })
        expect(j.args0.some((a) => a.text === unit) || j.message0.includes(unit)).toBe(true)
      } else expect(num).toBeUndefined()
      expect(j.args0[0]).toMatchObject({ type: 'field_label', text: def.icon })
      if (def.param?.kind === 'text') expect(j.args0.find((a) => a.name === 'TEXT')).toBeTruthy()
    }
    expect(TEXT_LIMIT).toBe(24)
  })

  it('her mesaj yer tutucusu args0 ile uyumlu', () => {
    for (const j of BLOCK_JSON) {
      const refs = [...j.message0.matchAll(/%(\d+)/g)].map((m) => Number(m[1])).sort()
      expect(refs).toEqual(j.args0.map((_, i) => i + 1))
    }
  })

  it('kategori stilleri ve araç kutusu', () => {
    const st = blockStyles()
    for (const c of CATEGORIES) expect(st[`jr_${c.key}`].colourPrimary).toBe(c.color)
    expect(st.jr_start.hat).toBe('cap')
    expect(toolboxCategories(ALL_BLOCK_TYPES).map((c) => c.key)).toEqual(CATEGORIES.map((c) => c.key))
    const some = toolboxCategories(['flag', 'forward'])
    expect(some.map((c) => c.key)).toEqual(['start', 'motion'])
    expect(toolboxCategories([])).toEqual([])
    const tb = toolboxJson(['flag', 'forward', 'repeat'])
    expect(tb.contents.map((c) => c.contents.length)).toEqual([1, 1, 1])
  })
})
