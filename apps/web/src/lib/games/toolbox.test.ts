import { describe, expect, it } from 'vitest'
import { b, program, seq } from './program'
import { allowedTypes, blockCount, buildToolbox, toolboxCategories } from './toolbox'
import type { GameBlockDef, LevelDef } from './types'

const blocks: GameBlockDef[] = [
  { type: 'g_ileri', category: 'Hareket', colour: '#4c97ff', json: {} },
  { type: 'g_don', category: 'Hareket', colour: '#4c97ff', json: {} },
  { type: 'g_basla', category: 'Hareket', hat: true, json: {} },
]
const game = { blocks }
const level: LevelDef = { id: 1, intro: 'Deneme seviyesi', toolbox: ['g_ileri', 'g_don', 'controls_repeat_ext', 'variables_set', 'logic_compare'], solution: program(b('g_ileri')) }

describe('araç kutusu', () => {
  it('seviye bloklarını kategorilere böler; dinamik kategoriler custom olur', () => {
    const cats = toolboxCategories(game, level)
    expect(cats.map((c) => c.name)).toEqual(['Hareket', 'Döngüler', 'Değişkenler', 'Mantık'])
    expect(cats[2].custom).toBe('VARIABLE')
    const tb = buildToolbox(game, level)
    expect(tb.kind).toBe('categoryToolbox')
    const rep = tb.contents[1] as { contents: { type: string; inputs?: unknown }[] }
    expect(rep.contents[0].type).toBe('controls_repeat_ext')
    expect(rep.contents[0].inputs).toBeTruthy()
  })
  it('bilinmeyen tür hata verir; başlık bloğu araç kutusuna girmez', () => {
    expect(() => buildToolbox(game, { ...level, toolbox: ['yok_tur'] })).toThrow(/yok_tur/)
    expect(toolboxCategories(game, { ...level, toolbox: ['g_basla', 'g_ileri'] }).flatMap((c) => c.types)).toEqual(['g_ileri'])
  })
  it('blok sayısı başlığı saymaz; izinli türler başlığı içerir', () => {
    expect(blockCount(game, program(seq(b('g_basla'), b('g_ileri'), b('g_don'))))).toBe(2)
    expect(allowedTypes(game, level).has('g_basla')).toBe(true)
    expect(allowedTypes(game, level).has('g_yok')).toBe(false)
  })
})
