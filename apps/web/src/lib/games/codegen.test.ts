import { describe, expect, it } from 'vitest'
import { toJavaScript } from './codegen'
import { b, program, seq, varField } from './program'
import type { GameBlockDef } from './types'

const defs: GameBlockDef[] = [
  { type: 'g_ileri', category: 'Hareket', json: {}, js: 'ileri({N});' },
  { type: 'g_don', category: 'Hareket', json: {}, js: (c) => `don('${c.field('DIR')}');` },
  { type: 'g_yol_var', category: 'Koşul', json: {}, js: 'yolVar()' },
  { type: 'g_surekli', category: 'Hareket', json: { message0: 'sürekli %1', args0: [{ type: 'input_statement', name: 'DO' }] }, js: 'while (true) {\n{DO}}' },
  { type: 'g_basla', category: 'Hareket', json: {}, hat: true, js: '// başla' },
]

describe('JavaScript üretici', () => {
  it('şablondaki deyim girişi girintili yığın olarak yazılır', () => {
    const p = program(seq(b('g_surekli', {}, { DO: seq(b('g_ileri', {}, { N: 1 }), b('g_ileri', {}, { N: 2 })) })))
    expect(toJavaScript(p, defs)).toBe('while (true) {\n  ileri(1);\n  ileri(2);\n}\n')
  })

  it('döngü, koşul ve özel bloklar', () => {
    const p = program(seq(
      b('g_basla'),
      b('controls_repeat_ext', {}, { TIMES: 4, DO: seq(b('g_ileri', {}, { N: 2 }), b('g_don', { DIR: 'sol' })) }),
      b('controls_if', {}, { IF0: b('g_yol_var'), DO0: b('g_ileri', {}, { N: 1 }), ELSE: b('g_don', { DIR: 'sag' }) }),
    ))
    const js = toJavaScript(p, defs)
    expect(js).toBe([
      '// başla',
      'for (let i = 0; i < 4; i++) {',
      '  ileri(2);',
      "  don('sol');",
      '}',
      'if (yolVar()) {',
      '  ileri(1);',
      "} else {",
      "  don('sag');",
      '}',
      '',
    ].join('\n'))
  })
  it('değişken, aritmetik ve işlev', () => {
    const p = program(
      b('procedures_defnoreturn', { NAME: 'kare çiz' }, { STACK: b('g_ileri', {}, { N: 5 }) }),
      seq(
        b('variables_set', { VAR: varField('x') }, { VALUE: b('math_arithmetic', { OP: 'ADD' }, { A: 1, B: b('math_arithmetic', { OP: 'MULTIPLY' }, { A: 2, B: 3 }) }) }),
        b('procedures_callnoreturn', { NAME: 'kare çiz' }),
      ),
    )
    const js = toJavaScript(p, defs)
    expect(js).toContain('let x;')
    expect(js).toContain('function kare_ciz() {\n  ileri(5);\n}')
    expect(js).toContain('x = 1 + (2 * 3);')
    expect(js).toContain('kare_ciz();')
  })
  it('until döngüsü ve boş program', () => {
    expect(toJavaScript(program(b('controls_whileUntil', { MODE: 'UNTIL' }, { BOOL: b('g_yol_var'), DO: b('g_ileri', {}, { N: 1 }) })), defs)).toContain('while (!(yolVar())) {')
    expect(toJavaScript({ blocks: { blocks: [] } }).trim()).toBe('')
  })
})
