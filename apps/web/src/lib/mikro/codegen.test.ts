import { describe, expect, it } from 'vitest'
import { toJavaScript, toPython, ident } from './codegen'
import { EXAMPLE_BY_ID } from './examples'
import { arith, b, callFunc, changeVar, cmp, forEach, forRange, forever, funcDef, getVar, hatBlock, ifThen, listOf, logicOp, onButton, onStart, project, repeat, setVar, whileLoop } from './program'

const rich = () => project('x', [
  funcDef('topla', ['a', 'b'], [changeVar('toplam', getVar('a'))], arith('ADD', getVar('a'), getVar('b'))),
  onStart(
    setVar('sayi', arith('MULTIPLY', arith('ADD', 1, 2), 3)),
    setVar('fark', arith('MINUS', 10, arith('MINUS', 4, 1))),
    ifThen(logicOp('AND', cmp('GT', getVar('sayi'), 5), b('logic_negate', { i: { BOOL: b('mk_button_is', { f: { BTN: 'A' } }) } })), [b('mk_show_text', { i: { TEXT: 'Çok "iyi"' } })], [b('mk_clear')]),
    repeat(3, [repeat(2, [b('mk_plot', { i: { X: 1, Y: 2 } })])]),
    forRange('i', 1, 5, 2, [changeVar('s', getVar('i'))]),
    forRange('j', 5, 1, 1, [changeVar('s', getVar('j'))]),
    forEach('x', listOf(1, 2, 3), []),
    whileLoop(true, [b('mk_pause', { i: { MS: 100 } })]),
    setVar('r', callFunc('topla', [1, 2], true)),
    b('mk_list_add', { i: { LIST: getVar('liste'), ITEM: arith('ADD', 1, 2) } }),
    b('mk_show_leds', { f: { LEDS: '1000000000001000000000001' } }),
    b('mk_play_note', { f: { NOTE: 'Do', BEATS: '0.5' } }),
  ),
  onButton('A', [b('mk_radio_send_value', { i: { NAME: 'x', VALUE: 1 } })], 'long'),
  forever(),
])

describe('kod üretimi', () => {
  it('JavaScript', () => {
    const js = toJavaScript(rich().workspace)
    expect(js).toContain('let toplam = 0, sayi = 0')
    expect(js).toContain('function topla(a, b) {')
    expect(js).toContain('  return a + b;')
    expect(js).toContain('card.onStart(() => {')
    expect(js).toContain('sayi = (1 + 2) * 3;')
    expect(js).toContain('fark = 10 - (4 - 1);')
    expect(js).toContain('if (sayi > 5 && !input.buttonPressed("A")) {')
    expect(js).toContain('screen.showText("Çok \\"iyi\\"");')
    expect(js).toContain('for (let _i = 0; _i < 3; _i++) {')
    expect(js).toContain('for (let _j = 0; _j < 2; _j++) {')
    expect(js).toContain('for (i = 1; i <= 5; i += 2) {')
    expect(js).toContain('for (j = 5; j >= 1; j -= 1) {')
    expect(js).toContain('for (x of [1, 2, 3]) {')
    expect(js).toContain('while (true) {')
    expect(js).toContain('wait(100);')
    expect(js).toContain('liste.push(1 + 2);')
    expect(js).toContain('screen.showLeds(["10000", "00000", "00100", "00000", "00001"]);')
    expect(js).toContain('music.playNote("Do", 0.5);')
    expect(js).toContain('card.onButton("A", "long", () => {')
    expect(js).toContain('radio.sendValue("x", 1);')
    expect(js).toContain('card.forever(() => {')
  })
  it('Python', () => {
    const py = toPython(rich().workspace)
    expect(py).toContain('from mikrokart import *')
    expect(py).toContain('sayi = 0')
    expect(py).toContain('def topla(a, b):')
    expect(py).toContain('    global toplam')
    expect(py).toContain('    return a + b')
    expect(py).toContain('def on_start():')
    expect(py).toContain('card.on_start(on_start)')
    expect(py).toContain('if sayi > 5 and not input.button_pressed("A"):')
    expect(py).toContain('for _ in range(int(3)):')
    expect(py).toContain('for i in range(1, 6, 2):')
    expect(py).toContain('for j in range(5, 0, -1):')
    expect(py).toContain('for x in [1, 2, 3]:')
    expect(py).toContain('        pass')
    expect(py).toContain('while True:')
    expect(py).toContain('liste.append(1 + 2)')
    expect(py).toContain('music.play_note("Do", 0.5)')
    expect(py).toContain('card.on_button("A", "long", on_button_a_long)')
    expect(py).toContain('radio.send_value("x", 1)')
    expect(py).toMatch(/global (\w+, )*sayi/)
    expect(py).not.toContain('{')
  })
  it('Türkçe değişken adları güvenli kimliğe dönüşür', () => {
    expect(ident('sıcaklık değeri', 'js')).toBe('sicaklik_degeri')
    expect(ident('1x', 'py')).toBe('_1x')
    expect(ident('card', 'js')).toBe('card_')
  })
  it('başlıksız yığın yorum olarak çıkar', () => {
    const p = project('x', [b('mk_clear')])
    expect(toJavaScript(p.workspace)).toContain('// Başlıksız blok yığını')
  })
  it('örnekler: JS ve Python süreklilik (parantez dengesi)', () => {
    for (const ex of Object.values(EXAMPLE_BY_ID)) {
      const js = toJavaScript(ex.build().workspace)
      expect((js.match(/\{/g) ?? []).length).toBe((js.match(/\}/g) ?? []).length)
      expect((js.match(/\(/g) ?? []).length).toBe((js.match(/\)/g) ?? []).length)
      void hatBlock
    }
  })
})
