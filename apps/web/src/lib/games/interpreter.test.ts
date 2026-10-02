import { describe, expect, it } from 'vitest'
import { HaltProgram, runProgram, runProgramSync, type RunApi } from './interpreter'
import { b, countBlocks, program, seq, varField } from './program'

/** Deneme API'si: 'say' işleyicisi sayıyı kaydeder, 'dur' kontrollü durdurur, 'basinda' bir koşul değeridir. */
function makeApi() {
  const log: number[] = []
  const api: RunApi = {
    blocks: {
      say: (c) => { log.push(c.num('N', 1)) },
      dur: () => { throw new HaltProgram('dur') },
      hep_dogru: () => true,
      rastgele: (c) => c.randomInt(1, 6),
    },
  }
  return { log, api }
}

describe('yorumlayıcı', () => {
  it('sıralı blokları çalıştırır', () => {
    const { log, api } = makeApi()
    const r = runProgramSync(program(seq(b('say', {}, { N: 1 }), b('say', {}, { N: 2 }))), api)
    expect(r.reason).toBe('finished')
    expect(log).toEqual([1, 2])
  })
  it('tekrar, iç içe tekrar ve değişken', () => {
    const { log, api } = makeApi()
    const p = program(seq(
      b('variables_set', { VAR: varField('t') }, { VALUE: 0 }),
      b('controls_repeat_ext', {}, { TIMES: 3, DO: seq(
        b('math_change', { VAR: varField('t') }, { DELTA: 2 }),
        b('say', {}, { N: b('variables_get', { VAR: varField('t') }) }),
      ) }),
    ))
    expect(runProgramSync(p, api).reason).toBe('finished')
    expect(log).toEqual([2, 4, 6])
  })
  it('if / else if / else', () => {
    const { log, api } = makeApi()
    const mk = (x: number) => b('controls_if', {}, {
      IF0: b('logic_compare', { OP: 'LT' }, { A: x, B: 5 }), DO0: b('say', {}, { N: 1 }),
      IF1: b('logic_compare', { OP: 'EQ' }, { A: x, B: 5 }), DO1: b('say', {}, { N: 2 }),
      ELSE: b('say', {}, { N: 3 }),
    })
    runProgramSync(program(seq(mk(1), mk(5), mk(9))), api)
    expect(log).toEqual([1, 2, 3])
  })
  it('while / until, break ve continue', () => {
    const { log, api } = makeApi()
    const p = program(seq(
      b('variables_set', { VAR: varField('i') }, { VALUE: 0 }),
      b('controls_whileUntil', { MODE: 'WHILE' }, { BOOL: b('logic_compare', { OP: 'LT' }, { A: b('variables_get', { VAR: varField('i') }), B: 10 }), DO: seq(
        b('math_change', { VAR: varField('i') }, { DELTA: 1 }),
        b('controls_if', {}, { IF0: b('logic_compare', { OP: 'EQ' }, { A: b('variables_get', { VAR: varField('i') }), B: 2 }), DO0: b('controls_flow_statements', { FLOW: 'CONTINUE' }) }),
        b('controls_if', {}, { IF0: b('logic_compare', { OP: 'GT' }, { A: b('variables_get', { VAR: varField('i') }), B: 4 }), DO0: b('controls_flow_statements', { FLOW: 'BREAK' }) }),
        b('say', {}, { N: b('variables_get', { VAR: varField('i') }) }),
      ) }),
    ))
    runProgramSync(p, api)
    expect(log).toEqual([1, 3, 4])
  })
  it('for döngüsü', () => {
    const { log, api } = makeApi()
    runProgramSync(program(b('controls_for', { VAR: varField('k') }, { FROM: 1, TO: 7, BY: 3, DO: b('say', {}, { N: b('variables_get', { VAR: varField('k') }) }) })), api)
    expect(log).toEqual([1, 4, 7])
  })
  it('aritmetik ve karşılaştırma', () => {
    const { log, api } = makeApi()
    const e = b('math_arithmetic', { OP: 'ADD' }, { A: b('math_arithmetic', { OP: 'MULTIPLY' }, { A: 3, B: 4 }), B: 1 })
    runProgramSync(program(b('say', {}, { N: e })), api)
    expect(log).toEqual([13])
  })
  it('sonsuz döngü adım sınırına takılır', () => {
    const { api } = makeApi()
    const r = runProgramSync(program(b('controls_whileUntil', { MODE: 'WHILE' }, { BOOL: true })), api, { maxSteps: 500 })
    expect(r.reason).toBe('limit')
    const r2 = runProgramSync(program(b('controls_whileUntil', { MODE: 'WHILE' }, { BOOL: b('hep_dogru'), DO: b('say') })), api, { maxSteps: 500 })
    expect(r2.reason).toBe('limit')
  })
  it('HaltProgram kontrollü durdurur; bilinmeyen blok hata verir', () => {
    const { log, api } = makeApi()
    const r = runProgramSync(program(seq(b('say'), b('dur'), b('say'))), api)
    expect(r).toMatchObject({ reason: 'halted', message: 'dur' })
    expect(log).toHaveLength(1)
    const e = runProgramSync(program(b('yok_boyle_blok')), api)
    expect(e.reason).toBe('error')
    expect(e.message).toContain('yok_boyle_blok')
  })
  it('tohumlu rastgelelik tekrarlanabilir', () => {
    const run = (seed: number) => {
      const { log, api } = makeApi()
      runProgramSync(program(b('controls_repeat_ext', {}, { TIMES: 5, DO: b('say', {}, { N: b('rastgele') }) })), api, { seed })
      return log
    }
    expect(run(7)).toEqual(run(7))
    expect(run(7).every((n) => n >= 1 && n <= 6)).toBe(true)
  })
  it('başlık verilirse yalnız başlıklı yığınlar çalışır; devre dışı ve gölge bloklar atlanır', () => {
    const { log, api } = makeApi()
    api.hats = ['basla']
    const p = program(
      seq(b('basla'), b('say', {}, { N: 1 }), { ...b('say', {}, { N: 99 }), enabled: false }, b('say', {}, { N: 2 })),
      b('say', {}, { N: 50 }),
    )
    runProgramSync(p, api)
    expect(log).toEqual([1, 2])
  })
  it('işlev tanımı ve çağrısı', () => {
    const { log, api } = makeApi()
    const def = b('procedures_defnoreturn', { NAME: 'iki' }, { STACK: seq(b('say', {}, { N: 7 }), b('say', {}, { N: 8 })) })
    const p = program(def, seq(b('procedures_callnoreturn', { NAME: 'iki' }), b('procedures_callnoreturn', { NAME: 'iki' })))
    runProgramSync(p, api)
    expect(log).toEqual([7, 8, 7, 8])
  })
  it('sonsuz özyineleme sınırlanır', () => {
    const { api } = makeApi()
    const def = b('procedures_defnoreturn', { NAME: 'f' }, { STACK: b('procedures_callnoreturn', { NAME: 'f' }) })
    const r = runProgramSync(program(def, b('procedures_callnoreturn', { NAME: 'f' })), api, { maxSteps: 5000 })
    expect(r.reason).toBe('limit')
  })
  it('countBlocks gölge ve ücretsiz blokları saymaz', () => {
    const p = program(seq(b('basla'), b('say', {}, { N: 3 }), b('say', {}, { N: 4 })))
    expect(countBlocks(p)).toBe(3) // sayı girişleri gölge bloktur, sayılmaz
    expect(countBlocks(p, ['basla'])).toBe(2)
    expect(countBlocks(program(b('say', {}, { N: b('math_number', { NUM: 3 }) })))).toBe(2) // gerçek (gölge olmayan) blok sayılır
  })
})

describe('animasyonlu çalıştırıcı', () => {
  it('vurgular, her eylemde onStep çağırır ve durdurulabilir', async () => {
    const { api } = makeApi()
    const hl: (string | null)[] = []
    const steps: string[] = []
    const ac = new AbortController()
    const p = program(b('controls_repeat_ext', {}, { TIMES: 100, DO: b('say', {}, { N: 1 }, { id: 'a' }) }, { id: 'rep' }))
    const r = await runProgram(p, api, {
      signal: ac.signal,
      onHighlight: (id) => hl.push(id),
      onStep: (i) => { if (i.type === 'say' && steps.push(i.type) === 3) ac.abort() },
    })
    expect(r.reason).toBe('stopped')
    expect(steps.length).toBe(3)
    expect(hl).toContain('a')
    expect(hl[hl.length - 1]).toBeNull()
  })
  it('bitince finished döner', async () => {
    const { log, api } = makeApi()
    const r = await runProgram(program(seq(b('say'), b('say'))), api, { stepDelay: 1 })
    expect(r.reason).toBe('finished')
    expect(log).toHaveLength(2)
  })
})
