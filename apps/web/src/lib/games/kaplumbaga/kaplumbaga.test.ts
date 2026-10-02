import { describe, expect, it } from 'vitest'
import { solveLevel, assertLevelSolutions } from '../testing'
import { b, program, seq } from '../program'
import { buildToolbox } from '../toolbox'
import { kaplumbagaGame } from './index'
import { createTurtleRun, strokesOf, type TurtleLevelData } from './engine'
import { MATCH_THRESHOLD, SIZE, hueToHex, ngonPoints, similarity } from './geometry'
import { runProgramSync } from '../interpreter'

assertLevelSolutions(kaplumbagaGame)

const game = kaplumbagaGame
const lv = (n: number) => game.levels[n - 1]
const ileri = (n: number) => b('kaplumbaga_ileri', {}, { DIST: n })
const saga = (n: number) => b('kaplumbaga_saga', {}, { ANGLE: n })

describe('Kaplumbağa: ek denetimler', () => {
  it('her seviyenin hedefi tuval içinde ve boş değil', () => {
    for (const l of game.levels) {
      const d = l.data as TurtleLevelData
      expect(d.target.length, `seviye ${l.id}`).toBeGreaterThan(0)
      for (const s of d.target) for (const v of [s.x1, s.y1, s.x2, s.y2]) {
        expect(v, `seviye ${l.id}`).toBeGreaterThanOrEqual(8)
        expect(v, `seviye ${l.id}`).toBeLessThanOrEqual(SIZE - 8)
      }
    }
  })

  it('çözümün çizimi hedefle örtüşür (her seviyede)', () => {
    for (const l of game.levels) {
      const run = createTurtleRun(l)
      runProgramSync(l.solution, run.api)
      const d = l.data as TurtleLevelData
      const s = similarity(d.target, strokesOf(run.snapshot().ops), !!d.colours)
      expect(s.recall, `seviye ${l.id} recall`).toBeGreaterThanOrEqual(MATCH_THRESHOLD)
      expect(s.precision, `seviye ${l.id} precision`).toBeGreaterThanOrEqual(MATCH_THRESHOLD)
    }
  })

  it('yanlış programlar başarısız olur', () => {
    const rep = (n: number, ...x: ReturnType<typeof ileri>[]) => b('controls_repeat_ext', {}, { TIMES: n, DO: seq(...x) })
    // 1: yalnız üç kenar
    expect(solveLevel(game, lv(1), program(rep(3, ileri(100), saga(90)))).outcome.ok).toBe(false)
    // 1: kenar çok kısa
    expect(solveLevel(game, lv(1), program(rep(4, ileri(60), saga(90)))).outcome.ok).toBe(false)
    // 2: sola dönen (ayna) üçgen farklı yerde
    expect(solveLevel(game, lv(2), program(rep(3, ileri(120), b('kaplumbaga_sola', {}, { ANGLE: 120 })))).outcome.ok).toBe(false)
    // 3: düz beşgen yıldız değil
    expect(solveLevel(game, lv(3), program(rep(5, ileri(120), saga(72)))).outcome.ok).toBe(false)
    // 4: kalem hiç kalkmaz (düz çizgi)
    expect(solveLevel(game, lv(4), program(rep(7, ileri(20), ileri(20)))).outcome.ok).toBe(false)
  })

  it('doğru şekil ama yanlış renk ya da kalınlık kabul edilmez', () => {
    // 5: renksiz kare
    expect(solveLevel(game, lv(5), program(seq(ileri(100), saga(90), ileri(100), saga(90), ileri(100), saga(90), ileri(100), saga(90)))).outcome.ok).toBe(false)
    // 6: ince ve tek renk ev
    const thin = program(seq(
      b('controls_repeat_ext', {}, { TIMES: 4, DO: seq(ileri(100), saga(90)) }),
      b('kaplumbaga_kalem_kaldir'), ileri(100), b('kaplumbaga_kalem_indir'), saga(30), ileri(100), saga(120), ileri(100),
    ))
    expect(solveLevel(game, lv(6), thin).outcome.ok).toBe(false)
  })

  it('sonsuz döngü sınırda durur ve başarısız olur', () => {
    const inf = program(b('controls_whileUntil', { MODE: 'WHILE' }, { BOOL: true, DO: seq(ileri(10), saga(10)) }))
    const r = solveLevel(game, lv(1), inf)
    expect(['limit', 'halted']).toContain(r.result.reason)
    expect(r.outcome.ok).toBe(false)
  })

  it('çok fazla hareket kontrollü durur', () => {
    const many = program(b('controls_repeat_ext', {}, { TIMES: 9000, DO: seq(ileri(1)) }))
    const r = solveLevel(game, lv(1), many)
    expect(r.result.reason).toBe('halted')
    expect(r.outcome.ok).toBe(false)
  })

  it('stepDelay hareket sürelerini toplar ve sıfırlar', () => {
    const run = createTurtleRun(lv(1))
    run.api.blocks.kaplumbaga_ileri({ num: () => 100 } as never)
    expect(run.stepDelay!({} as never)).toBeCloseTo(160)
    expect(run.stepDelay!({} as never)).toBe(0)
  })

  it('geometri yardımcıları', () => {
    const sq = ngonPoints([150, 250], 0, 100, 4)
    expect(sq[1][0]).toBeCloseTo(150); expect(sq[1][1]).toBeCloseTo(150)
    expect(sq[2][0]).toBeCloseTo(250); expect(sq[2][1]).toBeCloseTo(150)
    expect(hueToHex(0)).toMatch(/^#[0-9a-f]{6}$/)
    expect(hueToHex(120)).not.toBe(hueToHex(240))
  })

  it('araç kutusu özel girişlere gölge ekler', () => {
    const tb = game.toolboxFor!(lv(5)) as { contents: { contents: { type: string; inputs?: Record<string, unknown> }[] }[] }
    const ileriEntry = tb.contents.flatMap((c) => c.contents).find((e) => e.type === 'kaplumbaga_ileri')!
    expect(ileriEntry.inputs).toBeTruthy()
    expect(buildToolbox(game, lv(5)).contents.length).toBe(tb.contents.length)
  })
})
