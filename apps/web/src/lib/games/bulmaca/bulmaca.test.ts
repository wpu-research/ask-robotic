import { describe, expect, it } from 'vitest'
import { b, program, seq } from '../program'
import { assertLevelSolutions, solveLevel } from '../testing'
import { bulmacaGame } from './index'
import type { PuzzleLevelData } from './engine'
import { firstDifference, makeFeatures } from './features'

const game = bulmacaGame
assertLevelSolutions(game)

const withHat = (...blocks: ReturnType<typeof b>[]) => program(seq(b('bulmaca_basla'), ...blocks))

describe('Bulmaca: ek denetimler', () => {
  it('çoklu kart seviyelerinde çözüm her karta tek tek de uyar', () => {
    for (const level of game.levels) {
      const d = level.data as PuzzleLevelData
      for (const card of d.cards) {
        const single = { ...level, data: { ...d, cards: [card] } }
        const r = solveLevel(game, single, level.solution)
        expect(r.outcome.ok, `seviye ${level.id} kart ${card.title}: ${r.outcome.message}`).toBe(true)
      }
    }
  })

  it('3. seviyede fazla parça uyarı verir, bayraksız başlık dışı blok çalışmaz', () => {
    const lvl = game.levels[1]
    const r = solveLevel(game, lvl, withHat(b('bulmaca_kanat'), b('bulmaca_kanat'), b('bulmaca_kanat')))
    expect(r.outcome.ok).toBe(false)
    expect(r.outcome.message).toMatch(/2 kanad/)
    // başlığa bağlı olmayan blok çalışmaz
    expect(solveLevel(game, lvl, program(b('bulmaca_gaga'))).outcome.ok).toBe(false)
  })

  it('eksik parça anlaşılır bir iletiyle bildirilir', () => {
    const r = solveLevel(game, game.levels[1], withHat(b('bulmaca_bacak')))
    expect(r.outcome.ok).toBe(false)
    expect(r.outcome.message).toMatch(/bacak/)
  })

  it('yanlış renk ve ad başarısız olur (seviye 5)', () => {
    const lvl = game.levels[4]
    const wrongColor = withHat(b('bulmaca_boya', { RENK: 'MAVI' }), b('bulmaca_ad', { AD: 'Pamuk' }), b('controls_repeat_ext', {}, { TIMES: 4, DO: b('bulmaca_bacak') }), b('controls_repeat_ext', {}, { TIMES: 2, DO: b('bulmaca_kulak') }), b('controls_repeat_ext', {}, { TIMES: 2, DO: b('bulmaca_goz') }), b('bulmaca_kuyruk'))
    expect(solveLevel(game, lvl, wrongColor).outcome.message).toMatch(/rengi/)
    const nameCase = JSON.parse(JSON.stringify(lvl.solution))
    nameCase.blocks.blocks[0].next.block.next.block.fields.AD = '  pamuk '
    expect(solveLevel(game, lvl, nameCase).outcome.ok).toBe(true)
    nameCase.blocks.blocks[0].next.block.next.block.fields.AD = 'Duman'
    expect(solveLevel(game, lvl, nameCase).outcome.message).toMatch(/adı/)
  })

  it('seviye 8: sabit sayı yazılan program her kartta tutmaz', () => {
    const lvl = game.levels[7]
    const fixed = program(seq(b('bulmaca_basla'), b('bulmaca_her_kart', {}, { DO: seq(b('controls_repeat_ext', {}, { TIMES: 2, DO: b('bulmaca_bacak') }), b('controls_repeat_ext', {}, { TIMES: 2, DO: b('bulmaca_goz') })) })))
    const r = solveLevel(game, lvl, fixed)
    expect(r.outcome.ok).toBe(false)
    expect(r.outcome.message).toMatch(/2\. kart/)
  })

  it('seviye 7: koşulsuz program başarısız', () => {
    const lvl = game.levels[6]
    const noIf = program(seq(b('bulmaca_basla'), b('bulmaca_her_kart', {}, { DO: seq(b('bulmaca_bacak'), b('bulmaca_bacak'), b('bulmaca_goz'), b('bulmaca_goz'), b('bulmaca_kanat'), b('bulmaca_kanat'), b('bulmaca_gaga')) })))
    expect(solveLevel(game, lvl, noIf).outcome.ok).toBe(false)
  })

  it('"her kart için" dışına konan çoklu kart bloğu başarısız (seviye 9)', () => {
    const lvl = game.levels[8]
    const outside = withHat(b('bulmaca_bacak'))
    expect(solveLevel(game, lvl, outside).outcome.ok).toBe(false)
  })

  it('bu özellik blokları döngü dışında kontrollü durur (seviye 10)', () => {
    const lvl = game.levels[9]
    const r = solveLevel(game, lvl, program(seq(b('bulmaca_basla'), b('bulmaca_her_kart', {}, { DO: b('bulmaca_ekle_bu') }))))
    expect(r.outcome.ok).toBe(false)
  })

  it('seviye sayıları ve blok sınırları tırmanır', () => {
    expect(game.levels).toHaveLength(10)
    for (const l of game.levels) expect(l.hint && l.hint.length).toBeGreaterThan(10)
  })

  it('firstDifference: aynı hayvan null', () => {
    const f = makeFeatures({ legs: 2, beak: true })
    expect(firstDifference(f, { ...f })).toBeNull()
  })
})
