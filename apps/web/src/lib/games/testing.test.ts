import { describe, expect, it } from 'vitest'
import { denemeGame } from './__fixtures__/deneme'
import { b, program } from './program'
import { assertLevelSolutions, solveLevel } from './testing'

// Çerçevenin kendi sınaması: örnek oyunun çözümleri doğrulanır; yanlış programlar reddedilir.
assertLevelSolutions(denemeGame)

describe('solveLevel', () => {
  const l1 = denemeGame.levels[0]
  it('eksik ve fazla çözüm başarısız sayılır', () => {
    expect(solveLevel(denemeGame, l1, program(b('controls_repeat_ext', {}, { TIMES: 2, DO: b('deneme_ileri') }))).outcome.ok).toBe(false)
    const over = solveLevel(denemeGame, l1, program(b('controls_repeat_ext', {}, { TIMES: 50, DO: b('deneme_ileri') })))
    expect(over.result.reason).toBe('halted')
    expect(over.outcome).toMatchObject({ ok: false, message: 'Yolun dışına çıktın!' })
  })
  it('blok sayısı raporlanır', () => {
    expect(solveLevel(denemeGame, l1, l1.solution).blocks).toBe(2)
  })
  it('sonsuz döngü limit olarak biter, hedef sağlanmaz', () => {
    const r = solveLevel(denemeGame, denemeGame.levels[1], program(b('controls_whileUntil', { MODE: 'WHILE' }, { BOOL: true })))
    expect(r.result.reason).toBe('limit')
    expect(r.outcome.ok).toBe(false)
  })
})
