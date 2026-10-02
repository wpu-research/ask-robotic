import { runProgramSync } from '../interpreter'
import { describe, expect, it } from 'vitest'
import { assertLevelSolutions, solveLevel } from '../testing'
import { b, program, seq, varField } from '../program'
import { pondtutorGame } from './index'

assertLevelSolutions(pondtutorGame)

const L = (n: number) => pondtutorGame.levels[n - 1]
const swim = (dir: number, speed = 100) => b('pt_swim', { DIR: dir, SPEED: speed })
const wait = (n: number) => b('pt_wait', { N: n })
const cannon = (deg: number, range: number) => b('pt_cannon', { DEG: deg, RANGE: range })
const iv = () => b('variables_get', { VAR: varField('i') })
const scan = () => b('pt_scan', {}, { DEG: iv() })
const sweepShoot = (from: number, to: number, withMove: boolean) => program(b('controls_whileUntil', { MODE: 'WHILE' }, { BOOL: true, DO:
  b('controls_for', { VAR: varField('i') }, { FROM: from, TO: to, BY: 10, DO: seq(
    ...(withMove ? [b('pt_swim_e', {}, { DIR: b('math_arithmetic', { OP: 'MULTIPLY' }, { A: iv(), B: 9 }), SPEED: 60 })] : []),
    b('controls_if', {}, { IF0: b('logic_compare', { OP: 'LT' }, { A: scan(), B: 100 }), DO0: b('pt_cannon_e', {}, { DEG: iv(), RANGE: scan() }) }),
    ...(withMove ? [] : [wait(1)]),
  ) }) }))

const ok = (n: number, p: ReturnType<typeof program>) => solveLevel(pondtutorGame, L(n), p).outcome.ok

describe('Gölet Eğitmeni: yanlış programlar başarısız', () => {
  it('seviye 1: kısa bekleme yetmez, yanlış yön yetmez', () => {
    expect(ok(1, program(seq(swim(0), wait(15))))).toBe(false)
    expect(ok(1, program(seq(swim(90), wait(30))))).toBe(false)
    expect(ok(1, program(seq(swim(0), wait(40))))).toBe(true) // fazla yüzmek de sorun değil (yaprağın içinden geçer)
  })
  it('seviye 3: kayaya doğru düz gitmek hedefe ulaştırmaz ve can götürür', () => {
    const r = solveLevel(pondtutorGame, L(3), program(seq(swim(0), wait(60))))
    expect(r.outcome.ok).toBe(false)
  })
  it('seviye 4: yanlış menzil iskalar', () => {
    expect(ok(4, program(seq(cannon(0, 30), wait(8))))).toBe(false)
    expect(ok(4, program(seq(cannon(10, 50), wait(8))))).toBe(false)
    expect(ok(4, program(cannon(0, 50)))).toBe(false) // top düşmeden program biter
  })
  it('seviye 5: tek atış yetmez', () => {
    expect(ok(5, program(seq(cannon(53, 50), wait(8))))).toBe(false)
  })
  it('seviye 8: yalnız ateş eden ama rakibi bulamayan program kaybeder', () => {
    expect(ok(8, sweepShoot(100, 180, false))).toBe(false)
  })
  it('seviye 10: rakibi hiç bulamayan tarama kaybeder; çözüm kazanır', () => {
    expect(ok(10, sweepShoot(100, 180, false))).toBe(false)
    expect(ok(10, sweepShoot(-30, 30, false))).toBe(true)
  })
  it('seviye 7: hareketli rakibe karşı tek tarama (döngüsüz) yetmez', () => {
    expect(ok(7, program(seq(
      b('controls_for', { VAR: varField('i') }, { FROM: -40, TO: 40, BY: 10, DO: b('controls_if', {}, { IF0: b('logic_compare', { OP: 'LT' }, { A: scan(), B: 100 }), DO0: b('pt_cannon_e', {}, { DEG: iv(), RANGE: scan() }) }) }),
      wait(10),
    )))).toBe(false)
  })
  it('çıktı deterministik', () => {
    const a = solveLevel(pondtutorGame, L(10), L(10).solution, { seed: 1 })
    const c = solveLevel(pondtutorGame, L(10), L(10).solution, { seed: 1 })
    expect(a.result.steps).toBe(c.result.steps)
  })
})
