import { describe, expect, it } from 'vitest'
import { b, program, seq } from '../program'
import { assertLevelSolutions, solveLevel } from '../testing'
import { createRun } from './engine'
import { filmGame } from './index'
import { BAD_FRAME_LIMIT, FRAME_COUNT, badFrames, hslHex, rasterize } from './model'

const game = filmGame
assertLevelSolutions(game)

const L = (n: number) => game.levels[n - 1]
const wrap = (...body: ReturnType<typeof b>[]) => program(b('film_kare', undefined, { DO: seq(...body) }))

describe('Film: motor', () => {
  it('çözüm programı 100 kare üretir', () => {
    const run = createRun(L(3))
    const snapBefore = run.snapshot()
    expect(snapBefore.frames).toHaveLength(0)
    expect(snapBefore.target).toHaveLength(FRAME_COUNT)
  })

  it('hedef animasyon gerçekten hareket eder (seviye 3: top sağa gider)', () => {
    const t = createRun(L(3)).snapshot().target
    const x = (i: number) => (t[i].shapes[0] as { x: number }).x
    expect(x(0)).toBe(0)
    expect(x(99)).toBe(99)
  })

  it('her seviyenin ilk ve son karesi boş değil; çoğu kare zemin dışı içerik taşır', () => {
    for (const lv of game.levels) {
      const t = createRun(lv).snapshot().target
      expect(t, `seviye ${lv.id}`).toHaveLength(FRAME_COUNT)
      expect(t[50].shapes.length, `seviye ${lv.id}`).toBeGreaterThan(0)
    }
  })

  it('farklı programla hedef sağlanmaz: yanlış renk, yanlış hız, eksik şekil', () => {
    const wrongColor = wrap(b('film_renk', { RENK: 'MAVI' }), b('film_daire', undefined, { X: 50, Y: 50, R: 25 }))
    expect(solveLevel(game, L(1), wrongColor).outcome.ok).toBe(false)
    const wrongSize = wrap(b('film_renk', { RENK: 'SARI' }), b('film_daire', undefined, { X: 50, Y: 50, R: 20 }))
    expect(solveLevel(game, L(1), wrongSize).outcome.ok).toBe(false)
    // seviye 3: zaman yerine sabit konum
    const still = wrap(b('film_renk', { RENK: 'KIRMIZI' }), b('film_daire', undefined, { X: 50, Y: 50, R: 8 }))
    expect(solveLevel(game, L(3), still).outcome.ok).toBe(false)
    // seviye 3: yarı hızda
    const slow = wrap(b('film_renk', { RENK: 'KIRMIZI' }), b('film_daire', undefined, { X: b('math_arithmetic', { OP: 'MULTIPLY' }, { A: b('film_zaman'), B: 0.5 }), Y: 50, R: 8 }))
    expect(solveLevel(game, L(3), slow).outcome.ok).toBe(false)
  })

  it('aynı şeyi başka yoldan çizen program da kabul edilir (seviye 4: y = −zaman + 100)', () => {
    const alt = wrap(
      b('film_renk', { RENK: 'MAVI' }),
      b('film_daire', undefined, { X: b('film_zaman'), Y: b('math_arithmetic', { OP: 'ADD' }, { A: b('math_single', { OP: 'NEG' }, { NUM: b('film_zaman') }), B: 100 }), R: 8 }),
    )
    expect(solveLevel(game, L(4), alt).outcome.ok).toBe(true)
  })

  it('çizim blokları "her karede" dışındaysa kontrollü durur', () => {
    const r = solveLevel(game, L(1), program(b('film_daire', undefined, { X: 50, Y: 50, R: 25 })))
    expect(r.result.reason).toBe('halted')
    expect(r.outcome.ok).toBe(false)
    expect(r.outcome.message).toMatch(/her karede/)
  })

  it('"her karede" bloğu iç içe konamaz', () => {
    const nested = program(b('film_kare', undefined, { DO: b('film_kare') }))
    expect(solveLevel(game, L(1), nested).outcome.ok).toBe(false)
  })

  it('şekil sayısı sınırı: sonsuza yakın çizim kontrollü durur', () => {
    const many = wrap(b('controls_repeat_ext', {}, { TIMES: 1000, DO: b('film_daire', undefined, { X: 5, Y: 5, R: 1 }) }))
    const r = solveLevel(game, L(1), many)
    expect(r.result.reason).toBe('halted')
    expect(r.outcome.ok).toBe(false)
  })

  it('sonsuz döngü adım sınırıyla biter', () => {
    const inf = wrap(b('controls_whileUntil', { MODE: 'WHILE' }, { BOOL: true, DO: b('film_renk', { RENK: 'MAVI' }) }))
    const r = solveLevel(game, L(1), inf)
    expect(r.result.reason).toBe('limit')
    expect(r.outcome.ok).toBe(false)
  })

  it('değişken ve for döngüsü ile seviye 8 (beş top) çalışır, döngüsüz tek top yetmez', () => {
    const one = wrap(b('film_renk_ton', undefined, { HUE: 60 }), b('film_daire', undefined, { X: 18, Y: b('film_zaman'), R: 7 }))
    expect(solveLevel(game, L(8), one).outcome.ok).toBe(false)
  })

  it('seviye 6: koşul zamana göre rengi değiştirir', () => {
    const t = createRun(L(6)).snapshot().target
    const light = (i: number) => (t[i].shapes[1] as { fill: string }).fill
    expect(light(10)).not.toBe(light(90))
  })
})

describe('Film: model', () => {
  it('hslHex temel renkler', () => {
    expect(hslHex(0, 100, 50)).toBe('#ff0000')
    expect(hslHex(120, 100, 50)).toBe('#00ff00')
    expect(hslHex(240, 100, 50)).toBe('#0000ff')
  })
  it('rasterize: merkezdeki daire hücreleri boyar', () => {
    const r = rasterize({ bg: '#ffffff', shapes: [{ k: 'c', x: 50, y: 50, r: 20, fill: '#000000' }] })
    const mid = (25 * 50 + 25) * 3
    expect(r[mid]).toBe(0)
    expect(r[0]).toBe(255)
  })
  it('badFrames: boş kareler hedeften farklı sayılır', () => {
    const t = createRun(L(1)).snapshot().target
    expect(badFrames([], t).length).toBeGreaterThan(BAD_FRAME_LIMIT)
    expect(badFrames(t, t)).toEqual([])
  })
})
