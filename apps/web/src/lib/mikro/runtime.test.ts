import { describe, expect, it } from 'vitest'
import { arith, b, callFunc, changeVar, cmp, forEach, forRange, forever, funcDef, getVar, ifThen, listOf, logicOp, onButton, onStart, project, repeat, setVar, whileLoop, hatBlock } from './program'
import { Simulation } from './sim'
import { ICON_BY_ID, rowsToCells } from './icons'

const run = (stacks: ReturnType<typeof onStart>[], ms = 2000, cards: 1 | 2 = 1) => {
  const sim = new Simulation(project('t', stacks), { cards })
  sim.start()
  sim.advance(ms)
  return sim
}
const v = (sim: Simulation, n: string) => sim.card.runtime.vars.get(n)

describe('yorumlayıcı: temel', () => {
  it('değişken, aritmetik, if', () => {
    const sim = run([onStart(setVar('x', 2), setVar('y', arith('MULTIPLY', getVar('x'), 21)), ifThen(cmp('GT', getVar('y'), 40), [setVar('z', 'evet')], [setVar('z', 'hayır')]))])
    expect(v(sim, 'y')).toBe(42)
    expect(v(sim, 'z')).toBe('evet')
  })
  it('döngüler: repeat, for (artan/azalan), while, forEach, break/continue', () => {
    const sim = run([onStart(
      setVar('s', 0), repeat(5, [changeVar('s', 2)]),
      setVar('f', 0), forRange('i', 1, 4, 1, [changeVar('f', getVar('i'))]),
      setVar('g', 0), forRange('j', 3, 1, 1, [changeVar('g', getVar('j'))]),
      setVar('w', 0), whileLoop(cmp('LT', getVar('w'), 7), [changeVar('w', 3)]),
      setVar('e', 0), forEach('it', listOf(1, 2, 3, 4), [ifThen(cmp('EQ', getVar('it'), 2), [b('controls_flow_statements', { f: { FLOW: 'CONTINUE' } })]), ifThen(cmp('EQ', getVar('it'), 4), [b('controls_flow_statements', { f: { FLOW: 'BREAK' } })]), changeVar('e', getVar('it'))]),
    )])
    expect(v(sim, 's')).toBe(10)
    expect(v(sim, 'f')).toBe(10)
    expect(v(sim, 'g')).toBe(6)
    expect(v(sim, 'w')).toBe(9)
    expect(v(sim, 'e')).toBe(4) // 1 + 3 (2 atlanır, 4'te kırılır)
  })
  it('fonksiyon: parametre, değer döndürme, özyineleme', () => {
    const fact = funcDef('fakt', ['n'], [b('procedures_ifreturn', { i: { CONDITION: cmp('LTE', getVar('n'), 1), VALUE: 1 } })], arith('MULTIPLY', getVar('n'), callFunc('fakt', [arith('MINUS', getVar('n'), 1)], true)))
    const dbl = funcDef('say', ['a'], [changeVar('total', getVar('a')), b('mk_pause', { i: { MS: 10 } })])
    const sim = run([fact, dbl, onStart(setVar('total', 0), setVar('r', callFunc('fakt', [5], true)), callFunc('say', [3]), callFunc('say', [4]))])
    expect(v(sim, 'r')).toBe(120)
    expect(v(sim, 'total')).toBe(7)
  })
  it('listeler: oluştur, ekle, sil, ata, uzunluk, indeks', () => {
    const L = getVar('L')
    const sim = run([onStart(
      setVar('L', listOf(5, 6, 7)),
      b('mk_list_add', { i: { LIST: L, ITEM: 8 } }),
      b('mk_list_set', { i: { LIST: L, INDEX: 0, VALUE: 50 } }),
      b('mk_list_remove', { i: { LIST: L, INDEX: 1 } }),
      setVar('n', b('mk_list_length', { i: { LIST: L } })),
      setVar('k', b('mk_list_index', { i: { LIST: L, ITEM: 8 } })),
      setVar('first', b('mk_list_get', { i: { LIST: L, INDEX: 0 } })),
    )])
    expect(v(sim, 'L')).toEqual([50, 7, 8])
    expect(v(sim, 'n')).toBe(3)
    expect(v(sim, 'k')).toBe(2)
    expect(v(sim, 'first')).toBe(50)
  })
  it('liste dışı indeks: anlaşılır hata + blok kimliği', () => {
    const bad = b('mk_list_get', { i: { LIST: listOf(1), INDEX: 5 } })
    bad.id = 'bad1'
    const sim = run([onStart(setVar('x', bad))])
    expect(sim.error?.message).toMatch(/numaralı öğe yok/)
    expect(sim.error?.blockId).toBe('bad1')
  })
  it('mantık kısa devre ve rastgele tohumlu', () => {
    const sim = run([onStart(setVar('a', logicOp('OR', true, b('mk_list_get', { i: { LIST: 0, INDEX: 0 } }))), setVar('r', b('math_random_int', { i: { FROM: 1, TO: 6 } })))])
    expect(v(sim, 'a')).toBe(true)
    const r = v(sim, 'r') as number
    expect(r).toBeGreaterThanOrEqual(1); expect(r).toBeLessThanOrEqual(6)
    const sim2 = run([onStart(setVar('r', b('math_random_int', { i: { FROM: 1, TO: 6 } })))])
    expect(v(sim2, 'r')).toBe(r) // aynı tohum -> aynı sayı
  })
})

describe('yorumlayıcı: zaman ve eşzamanlılık', () => {
  it('bekle sanal zamanı kullanır', () => {
    const sim = run([onStart(setVar('a', 1), b('mk_pause', { i: { MS: 1000 } }), setVar('a', 2))], 500)
    expect(v(sim, 'a')).toBe(1)
    sim.advance(600)
    expect(v(sim, 'a')).toBe(2)
  })
  it('sonsuza kadar ve düğme olayı birlikte çalışır', () => {
    const sim = run([forever(changeVar('t', 1), b('mk_pause', { i: { MS: 100 } })), onButton('A', [changeVar('c', 1)])], 1000)
    sim.device.press('A'); sim.device.release('A')
    sim.advance(50)
    sim.device.press('A'); sim.device.release('A')
    sim.advance(1000)
    expect(v(sim, 'c')).toBe(2)
    expect(v(sim, 't') as number).toBeGreaterThan(15)
  })
  it('her N ms zamanlayıcı', () => {
    const sim = run([hatBlock('mk_every', [changeVar('n', 1)], { MS: 250 })], 1000)
    expect(v(sim, 'n')).toBe(4)
  })
  it('bekleyen işleyici varken yeni olay kuyruğa girer (en çok 3)', () => {
    const sim = run([onButton('A', [changeVar('c', 1), b('mk_pause', { i: { MS: 1000 } })])], 100)
    for (let i = 0; i < 10; i++) { sim.device.press('A'); sim.device.release('A') }
    sim.advance(10000)
    expect(v(sim, 'c')).toBe(4) // 1 çalışan + 3 kuyruk
  })
  it('boş gövdeli sonsuz döngü dondurmaz, hata verir', () => {
    const sim = new Simulation(project('t', [onStart(whileLoop(true, []))]), { burstLimit: 50_000 })
    sim.start()
    const t = Date.now()
    sim.advance(5000)
    expect(Date.now() - t).toBeLessThan(5000)
    expect(sim.error?.message).toMatch(/bekle/)
  })
  it('bekle içeren sonsuz döngü hata vermez', () => {
    const sim = run([onStart(whileLoop(true, [changeVar('n', 1), b('mk_pause', { i: { MS: 10 } })]))], 1000)
    expect(sim.error).toBeNull()
    expect(v(sim, 'n') as number).toBeGreaterThan(50)
  })
  it('çalışma süresi', () => {
    const sim = run([onStart(b('mk_pause', { i: { MS: 300 } }), setVar('t', b('mk_runtime')))], 1000)
    expect(v(sim, 't') as number).toBeGreaterThanOrEqual(300)
    expect(v(sim, 't') as number).toBeLessThan(330)
  })
})

describe('aygıt: ekran, ses, radyo, pin', () => {
  it('simge ve LED işlemleri', () => {
    const sim = run([onStart(b('mk_show_icon', { f: { ICON: 'heart' } }))], 100)
    expect(sim.device.pattern()).toBe(rowsToCells(ICON_BY_ID.heart.rows))
    const s2 = run([onStart(b('mk_plot', { i: { X: 1, Y: 2 } }), b('mk_toggle', { i: { X: 1, Y: 2 } }), b('mk_plot_brightness', { i: { X: 4, Y: 4, B: 100 } }))], 100)
    expect(s2.device.led(1, 2)).toBe(0)
    expect(s2.device.led(4, 4)).toBe(100)
  })
  it('kaydırmalı yazı süre alır ve sonra temizlenir', () => {
    const sim = run([onStart(b('mk_show_text', { i: { TEXT: 'Hi' } }), setVar('done', 1))], 300)
    expect(v(sim, 'done')).toBeUndefined()
    expect(sim.device.isScrolling).toBe(true)
    sim.advance(2000)
    expect(v(sim, 'done')).toBe(1)
    expect(sim.device.pattern()).toBe('0'.repeat(25))
    expect(sim.device.log.some((e) => e.kind === 'text' && e.text === 'Hi')).toBe(true)
  })
  it('nota çalar ve tempoya göre bekler', () => {
    const sim = run([onStart(b('mk_set_tempo', { i: { BPM: 60 } }), b('mk_play_note', { f: { NOTE: 'La', BEATS: '1' } }), setVar('x', 1))], 900)
    expect(v(sim, 'x')).toBeUndefined()
    sim.advance(200)
    expect(v(sim, 'x')).toBe(1)
    expect(sim.device.log.find((e) => e.kind === 'tone')).toMatchObject({ freq: 440, ms: 1000 })
  })
  it('radyo: iki kart, grup eşleşmesi, alınan değer', () => {
    const sim = run([
      onStart(b('mk_radio_group', { i: { G: 7 } })),
      onButton('A', [b('mk_radio_send_number', { i: { VALUE: 42 } })]),
      hatBlock('mk_on_radio', [setVar('got', b('mk_radio_recv', { f: { KIND: 'number' } }))]),
    ], 100, 2)
    sim.cards[0].device.press('A'); sim.cards[0].device.release('A')
    sim.advance(100)
    expect(sim.cards[1].runtime.vars.get('got')).toBe(42)
    expect(sim.cards[0].runtime.vars.get('got')).toBeUndefined()
    // farklı grup duymaz
    sim.cards[1].device.radioGroup = 9
    sim.cards[0].device.press('A'); sim.cards[0].device.release('A')
    sim.cards[1].runtime.vars.set('got', 0)
    sim.advance(100)
    expect(sim.cards[1].runtime.vars.get('got')).toBe(0)
  })
  it('hareket, logo ve pin olayları', () => {
    const sim = run([
      hatBlock('mk_on_gesture', [changeVar('sh', 1)], { G: 'shake' }),
      hatBlock('mk_on_gesture', [changeVar('tl', 1)], { G: 'tiltLeft' }),
      hatBlock('mk_on_logo', [changeVar('lg', 1)], { EV: 'touch' }),
      hatBlock('mk_on_pin', [changeVar('p0', 1)], { PIN: 'P0', EV: 'touch' }),
    ], 100)
    const d = sim.device
    d.perform('shake'); d.perform('tiltLeft'); d.setLogo(true); d.setLogo(false); d.setPinTouch('P0', true)
    sim.advance(700)
    expect([v(sim, 'sh'), v(sim, 'tl'), v(sim, 'lg'), v(sim, 'p0')]).toEqual([1, 1, 1, 1])
    expect(d.pitch()).toBe(0)
    expect(d.roll()).toBe(-90)
  })
  it('A+B ve uzun basış', () => {
    const sim = run([
      onButton('AB', [changeVar('ab', 1)]),
      onButton('A', [changeVar('a', 1)], 'long'),
      onButton('A', [changeVar('a1', 1)]),
    ], 100)
    sim.device.press('AB'); sim.device.release('AB')
    sim.device.press('A')
    sim.advance(1200)
    sim.device.release('A')
    sim.advance(50)
    expect([v(sim, 'ab'), v(sim, 'a'), v(sim, 'a1')]).toEqual([1, 1, 1])
  })
  it('pin çıkışları günlüğe düşer', () => {
    const sim = run([onStart(b('mk_pin_servo', { f: { PIN: 'P1' }, i: { ANGLE: 120 } }), b('mk_pin_dwrite', { f: { PIN: 'P0' }, i: { VALUE: 1 } }))], 100)
    expect(sim.device.pins.P1.out).toEqual({ mode: 'servo', value: 120 })
    expect(sim.device.pins.P0.out).toEqual({ mode: 'digital', value: 1 })
  })
})
