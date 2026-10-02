import { describe, expect, it } from 'vitest'
import { b, program, seq } from '../program'
import { assertLevelSolutions, solveLevel } from '../testing'
import { muzikGame } from './index'
import { compareMelodies, eventsOf, midiOf, notesOnly, parseTokens, solfegeOf } from './notes'
import { createRun } from './engine'
import { runProgramSync } from '../interpreter'

const game = muzikGame
assertLevelSolutions(game)

const L = (n: number) => game.levels[n - 1]
const hat = b('muzik_basla')

describe('nota yazımı', () => {
  it('belirteçleri ayrıştırır', () => {
    expect(parseTokens("Do Re,:2 Sol' -:4")).toEqual([
      { name: 'Do', oct: 4, dur: 1 }, { name: 'Re', oct: 3, dur: 2 }, { name: 'Sol', oct: 5, dur: 1 }, { name: '-', oct: 4, dur: 4 },
    ])
    expect(() => parseTokens('Xo')).toThrow()
  })
  it('MIDI numaraları doğru (Do orta = 60, La orta = 69)', () => {
    expect(eventsOf('Do La').map((e) => e.p)).toEqual([60, 69])
    expect(midiOf(0, 4)).toBe(60)
    expect(solfegeOf(67)).toMatchObject({ name: 'Sol', oct: 4 })
    expect(solfegeOf(61)).toBeNull()
  })
  it('sus başlangıçları kaydırır', () => {
    expect(eventsOf('Do -:2 Re').map((e) => e.t)).toEqual([0, 3])
  })
})

describe('müzik motoru', () => {
  it('1. seviye elle yazılmış beklenen olaylar', () => {
    const run = createRun(L(1))
    runProgramSync(L(1).solution, run.api)
    expect(run.snapshot().events).toEqual([
      { t: 0, d: 1, p: 60, i: 'piyano', ch: 0 },
      { t: 1, d: 1, p: 62, i: 'piyano', ch: 0 },
      { t: 2, d: 1, p: 64, i: 'piyano', ch: 0 },
    ])
    expect(run.snapshot().total).toBe(3)
  })
  it('yanlış, eksik ve fazla nota başarısız olur', () => {
    const mk = (...t: string[]) => program(seq(hat, ...t.map((x) => b(`muzik_${x}`, { OCT: '4', DUR: '1' }))))
    expect(solveLevel(game, L(1), mk('do', 're', 'fa')).outcome.message).toMatch(/3\. nota/)
    expect(solveLevel(game, L(1), mk('do', 're')).outcome.message).toMatch(/eksik/)
    expect(solveLevel(game, L(1), mk('do', 're', 'mi', 'fa')).outcome.message).toMatch(/Fazla/)
    expect(solveLevel(game, L(1), mk('do', 're', 'mi')).outcome.ok).toBe(true)
  })
  it('başlık bloğu olmadan çalmaz', () => {
    expect(solveLevel(game, L(1), program(seq(b('muzik_do'), b('muzik_re'), b('muzik_mi')))).outcome.ok).toBe(false)
  })
  it('süre ve oktav alanları denetlenir (3. seviye)', () => {
    const wrongDur = song3('1')
    expect(solveLevel(game, L(3), wrongDur).outcome.message).toMatch(/süre|zaman/)
  })
  it('yanlış enstrümanla 5. seviye başarısız olur', () => {
    const sol = L(5).solution
    const alt = JSON.parse(JSON.stringify(sol))
    const inst = alt.blocks.blocks[0].next.block
    expect(inst.type).toBe('muzik_enstruman')
    inst.fields.INST = 'keman'
    expect(solveLevel(game, L(5), alt).outcome.ok).toBe(false)
    expect(solveLevel(game, L(5), sol).outcome.ok).toBe(true)
  })
  it('paralel kanallar aynı anda başlar ve toplam süre uzun olanla belirlenir', () => {
    const run = createRun(L(8))
    runProgramSync(L(8).solution, run.api)
    const { events, total } = run.snapshot()
    expect(total).toBe(8)
    expect(events.filter((e) => e.ch === 1).map((e) => e.t)).toEqual([0, 4])
    expect(events.filter((e) => e.ch === 0)).toHaveLength(8)
  })
  it('paralel sonrası enstrüman eski haline döner', () => {
    const p = program(seq(hat,
      b('muzik_es_zamanli', {}, { A: seq(b('muzik_enstruman', { INST: 'keman' }), b('muzik_do', { OCT: '4', DUR: '1' })), B: b('muzik_re', { OCT: '4', DUR: '1' }) }),
      b('muzik_mi', { OCT: '4', DUR: '1' })))
    const run = createRun(L(8))
    runProgramSync(p, run.api)
    expect(run.snapshot().events.map((e) => [e.p, e.i, e.t])).toEqual([[60, 'keman', 0], [62, 'piyano', 0], [64, 'piyano', 1]])
  })
  it('işlev çözümü 7. seviyede 13 blokla sınırlı; işlevsiz çözüm sınırı aşar', () => {
    const noFn = program(seq(hat, ...flat(['Do', 'Re', 'Mi', 'Fa', 'Mi', 'Re', 'Sol', 'Do', 'Re', 'Mi', 'Fa', 'Mi', 'Re', 'La', 'Do', 'Re', 'Mi', 'Fa', 'Mi', 'Re'])))
    expect(solveLevel(game, L(7), noFn).blocks).toBeGreaterThan(13)
  })
  it('sonsuz döngü sınırlanır (çok nota / adım sınırı)', () => {
    const p = program(seq(hat, b('controls_whileUntil', { MODE: 'WHILE' }, { BOOL: true, DO: b('muzik_do', { OCT: '4', DUR: '1' }) })))
    const r = solveLevel(game, L(2), p)
    expect(r.outcome.ok).toBe(false)
    expect(r.result.reason).toBe('halted')
    expect(r.outcome.message).toMatch(/Çok fazla/)
  })
  it('serbest besteleme (10): ölçütler tek tek denetlenir', () => {
    const n = (t: string, d = '1') => b(`muzik_${t}`, { OCT: '4', DUR: d })
    const oneChannel = program(seq(hat, b('muzik_enstruman', { INST: 'keman' }), ...['do', 're', 'mi', 'fa', 'sol', 'la', 'si', 'do', 're', 'mi', 'fa', 'sol'].map((x) => n(x))))
    expect(solveLevel(game, L(10), oneChannel).outcome.message).toMatch(/kanal/)
    const fewNotes = program(seq(hat, b('muzik_es_zamanli', {}, { A: n('do'), B: n('re') })))
    expect(solveLevel(game, L(10), fewNotes).outcome.message).toMatch(/12 nota/)
    expect(solveLevel(game, L(10), L(10).solution).outcome.ok).toBe(true)
  })
  it('karşılaştırma: kanal numarası önemsiz, sıra önemli', () => {
    const t = [...eventsOf('Do Re'), ...eventsOf('Sol', { ch: 1 })]
    const sw = [...eventsOf('Do Re', { ch: 1 }), ...eventsOf('Sol')]
    expect(compareMelodies(sw, t, false)).toBeNull()
    expect(compareMelodies(eventsOf('Re Do'), eventsOf('Do Re'), false)).not.toBeNull()
    expect(notesOnly(eventsOf('Do -:1 Re'))).toHaveLength(2)
  })
  it('adım gecikmesi: sıralı notalar süre kadar bekler, paralel gövde 0, sonunda toplam', () => {
    const run = createRun(L(8))
    const delays: number[] = []
    const info = { blockId: null, type: 'x', wait: true, step: 0 }
    const api = run.api
    let n = 0
    runProgramSync(L(8).solution, api, { onStep: () => { n++; delays.push(run.stepDelay!(info) ?? -1) } })
    expect(delays.slice(0, -1).every((d) => d === 0)).toBe(true)
    expect(delays[delays.length - 1]).toBe(8 * 500)
    expect(n).toBeGreaterThan(10)
  })
})

function flat(names: string[]) {
  return names.map((x) => b(`muzik_${x.toLowerCase()}`, { OCT: '4', DUR: '1' }))
}
function song3(sol: string) {
  const n = (t: string, d: string) => b(`muzik_${t}`, { OCT: '4', DUR: d })
  return program(seq(hat, n('do', '1'), n('do', '1'), n('sol', sol), b('muzik_sus', { DUR: '1' }), n('la', '1'), n('la', '1'), n('sol', '4')))
}
