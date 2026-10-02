import { describe, expect, it } from 'vitest'
import { b, program, seq } from '../program'
import { assertLevelSolutions, solveLevel } from '../testing'
import { dataOf, findCell, isOpen } from './engine'
import { labirentGame } from './index'

const game = labirentGame!
assertLevelSolutions(game)

const hat = (...blocks: ReturnType<typeof b>[]) => program(seq(b('labirent_basla'), ...blocks))
const level = (n: number) => game.levels[n - 1]

describe('Labirent: ek denetimler', () => {
  it('her haritada tek başlangıç ve hedef var, satırlar eşit uzunlukta, hedefe yol var', () => {
    for (const lv of game.levels) {
      const { grid } = dataOf(lv)
      expect(new Set(grid.map((r) => r.length)).size, `seviye ${lv.id}: satır uzunlukları`).toBe(1)
      expect(grid.join('').split('S').length - 1).toBe(1)
      expect(grid.join('').split('G').length - 1).toBe(1)
      // sınır kareleri duvar
      const w = grid[0].length
      for (let x = 0; x < w; x++) { expect(isOpen(grid, x, 0)).toBe(false); expect(isOpen(grid, x, grid.length - 1)).toBe(false) }
      const [sx, sy] = findCell(grid, 'S'), [gx, gy] = findCell(grid, 'G')
      const seen = new Set([`${sx},${sy}`]); const q: Array<[number, number]> = [[sx, sy]]
      while (q.length) { const [x, y] = q.pop()!; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = `${x + dx},${y + dy}`; if (isOpen(grid, x + dx, y + dy) && !seen.has(k)) { seen.add(k); q.push([x + dx, y + dy]) } } }
      expect(seen.has(`${gx},${gy}`), `seviye ${lv.id}: hedefe ulaşılamıyor`).toBe(true)
    }
  })

  it('duvara çarpmak başarısızlık sayılır', () => {
    const r = solveLevel(game, level(1), hat(b('labirent_sol'), b('labirent_ileri')))
    expect(r.outcome.ok).toBe(false)
    expect(r.outcome.message).toMatch(/Duvara/)
  })

  it('hedefe tam varmadan durmak başarısızlık sayılır', () => {
    const r = solveLevel(game, level(1), hat(b('labirent_ileri'), b('labirent_ileri')))
    expect(r.outcome.ok).toBe(false)
  })

  it('başlık bloğu olmayan serseri bloklar çalışmaz', () => {
    const stray = program(seq(b('labirent_ileri'), b('labirent_ileri'), b('labirent_ileri'), b('labirent_ileri')))
    expect(solveLevel(game, level(1), stray).outcome.ok).toBe(false)
  })

  it('dönmeden sonsuz dönüş "limit" ile durur ve başarısız olur', () => {
    const r = solveLevel(game, level(4), hat(b('labirent_hedefe_kadar', {}, { DO: b('labirent_sol') })))
    expect(r.outcome.ok).toBe(false)
  })

  it('boş gövdeli döngü kilitlenmez', () => {
    const r = solveLevel(game, level(4), hat(b('labirent_hedefe_kadar')))
    expect(r.outcome.ok).toBe(false)
  })

  it('yanlış sıra: 3. seviyede basamak tekrarı eksikse başarısız', () => {
    const wrong = hat(b('controls_repeat_ext', {}, { TIMES: 3, DO: seq(b('labirent_ileri'), b('labirent_sag'), b('labirent_ileri'), b('labirent_sol')) }))
    expect(solveLevel(game, level(3), wrong).outcome.ok).toBe(false)
  })

  it('koşullar: "eğer solda yol varsa" yalnız yol varsa çalışır', () => {
    // seviye 5'te başlangıçta solda duvar var: sola dönmek yok sayılmalı, ileri gidilmeli
    const p = hat(b('labirent_eger', { DIR: 'LEFT' }, { DO: b('labirent_ileri') }))
    const r = solveLevel(game, level(5), p)
    expect(r.outcome.ok).toBe(false)
    expect(r.outcome.message).not.toMatch(/Duvara/)
  })

  it('"değilse" kolu çalışır', () => {
    const p = hat(b('labirent_eger_degilse', { DIR: 'AHEAD' }, { DO: b('labirent_sag'), ELSE: b('labirent_sag') }), b('labirent_ileri'))
    expect(solveLevel(game, level(6), p).outcome.ok).toBe(false)
  })

  it('sol el kuralı çözümü 7-10. seviyelerin hepsinde çalışır ve blok sınırı içinde kalır', () => {
    for (let n = 7; n <= 10; n++) {
      const r = solveLevel(game, level(n), level(n).solution)
      expect(r.outcome.ok, `seviye ${n}`).toBe(true)
      expect(r.blocks).toBeLessThanOrEqual(level(n).maxBlocks!)
    }
  })

  it('düşük blok sınırı ile kısa çözümler: 3-4. seviyelerde döngüsüz çözüm sınırı aşar', () => {
    const long = hat(...Array.from({ length: 4 }, () => [b('labirent_ileri'), b('labirent_sag'), b('labirent_ileri'), b('labirent_sol')]).flat())
    const r = solveLevel(game, level(3), long)
    expect(r.outcome.ok).toBe(true) // hedefi sağlar
    expect(r.blocks).toBeGreaterThan(level(3).maxBlocks!) // ama çerçeve blok sınırıyla engeller
  })

  it('ilk seviyelerin blok sınırları öğretim sırasını korur', () => {
    expect(level(5).maxBlocks!).toBeLessThanOrEqual(level(7).maxBlocks!)
    expect(level(1).toolbox).toEqual(['labirent_ileri'])
  })

  it('10. seviye çözümü varsayılan hızda 60 sn altında oynar', async () => {
    const { runProgram } = await import('../interpreter')
    const lv = level(10)
    const gr = game.engine.createRun(lv, { seed: 1 })
    let ms = 0
    await runProgram(lv.solution, gr.api, {
      seed: 1,
      maxSteps: 20000,
      onStep: (i) => { if (i.wait) ms += (gr.stepDelay?.(i) ?? game.stepDelay ?? 450) / (game.speed?.default ?? 1) },
    })
    expect(ms).toBeLessThan(60000)
  })
})
