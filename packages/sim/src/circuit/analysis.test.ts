import { describe, expect, it } from 'vitest'
import { PINS, PROPS, analyzeCircuit } from '../index.js'
import type { Circuit, PartInstance, PartType, PropValue } from '../index.js'
import { buildNetlist } from './netlist.js'
import { solve } from './solver.js'

const part = (id: string, type: PartType, props: Record<string, PropValue> = {}): PartInstance => ({ id, type, x: 0, y: 0, rotation: 0, props })
const ref = (s: string): { part: string; pin: string } => { const i = s.indexOf('.'); return { part: s.slice(0, i), pin: s.slice(i + 1) } }
const circuit = (parts: PartInstance[], wires: Array<[string, string]>): Circuit => ({
  parts: [part('uno', 'uno'), ...parts],
  wires: wires.map(([a, b]) => ({ id: `${a}~${b}`, a: ref(a), b: ref(b) })),
})

const blink = circuit(
  [part('r1', 'resistor', { ohms: 330 }), part('led1', 'led')],
  [['uno.D13', 'r1.1'], ['r1.2', 'led1.A'], ['led1.K', 'uno.GND2']],
)

describe('analyzeCircuit', () => {
  it('(m) sameNet: doğrudan kablo; GND uçları ve 5V/VIN tek düğüm', () => {
    const a = analyzeCircuit(blink)
    expect(a.sameNet(ref('uno.D13'), ref('r1.1'))).toBe(true)
    expect(a.sameNet(ref('r1.2'), ref('led1.A'))).toBe(true)
    expect(a.sameNet(ref('uno.D13'), ref('led1.A'))).toBe(false)
    expect(a.sameNet(ref('uno.GND'), ref('led1.K'))).toBe(true)
    expect(a.sameNet(ref('uno.GND3'), ref('uno.GND'))).toBe(true)
    expect(a.sameNet(ref('uno.5V'), ref('uno.VIN'))).toBe(true)
    expect(a.sameNet(ref('uno.5V'), ref('uno.3V3'))).toBe(false)
    expect(a.sameNet(ref('nope.1'), ref('r1.1'))).toBe(false)
  })

  it('(m) connected: via direnç, LED yönü, bağlantısız parça', () => {
    const a = analyzeCircuit(circuit(
      [part('r1', 'resistor'), part('led1', 'led'), part('r2', 'resistor'), part('btn', 'button')],
      [['uno.D13', 'r1.1'], ['r1.2', 'led1.A'], ['led1.K', 'uno.GND']],
    ))
    expect(a.connected(ref('uno.D13'), ref('led1.A'))).toBe(false) // via yok: yalnız düğüm
    expect(a.connected(ref('uno.D13'), ref('led1.A'), ['resistor'])).toBe(true)
    expect(a.connected(ref('led1.A'), ref('uno.D13'), ['resistor'])).toBe(true)
    expect(a.connected(ref('uno.D13'), ref('uno.GND'), ['resistor'])).toBe(false) // LED geçilemez
    expect(a.connected(ref('uno.D13'), ref('uno.GND'), ['resistor', 'led'])).toBe(true)
    expect(a.connected(ref('uno.GND'), ref('uno.D13'), ['resistor', 'led'])).toBe(false) // LED A->K tek yön
    expect(a.connected(ref('uno.D13'), ref('r1.1'))).toBe(true)
    // bağlantısız parça
    expect(a.connected(ref('uno.D13'), ref('r2.1'), ['resistor'])).toBe(false)
    expect(a.sameNet(ref('r2.1'), ref('r2.2'))).toBe(false)
    expect(a.connected(ref('r2.1'), ref('r2.2'), ['resistor'])).toBe(true) // direncin kendi iç yolu
    expect(a.connected(ref('uno.D2'), ref('btn.A'), ['button'])).toBe(false)
  })

  it('pot VCC-SIG-GND ve düğme A-B iç yolları', () => {
    const a = analyzeCircuit(circuit(
      [part('pot', 'pot'), part('btn', 'button')],
      [['pot.SIG', 'uno.A0'], ['btn.A', 'uno.D2'], ['btn.B', 'uno.GND']],
    ))
    expect(a.connected(ref('uno.A0'), ref('pot.VCC'), ['pot'])).toBe(true)
    expect(a.connected(ref('uno.A0'), ref('pot.GND'), ['pot'])).toBe(true)
    expect(a.connected(ref('uno.D2'), ref('uno.GND'), ['button'])).toBe(true)
    expect(a.connected(ref('uno.GND'), ref('uno.D2'), ['button'])).toBe(true)
  })

  it('statik uyarılar: sağlıklı Blink devresinde uyarı yok', () => {
    expect(analyzeCircuit(blink).warnings).toEqual([])
  })

  it('statik uyarılar: dirençsiz LED, ters LED, kısa devre', () => {
    const noRes = analyzeCircuit(circuit([part('led1', 'led')], [['uno.D13', 'led1.A'], ['led1.K', 'uno.GND']]))
    expect(noRes.warnings.map((w) => w.kind)).toEqual(['led-no-resistor'])
    expect(noRes.warnings[0].partId).toBe('led1')
    const rev = analyzeCircuit(circuit(
      [part('r1', 'resistor'), part('led1', 'led')],
      [['uno.D13', 'r1.1'], ['r1.2', 'led1.K'], ['led1.A', 'uno.GND']],
    ))
    expect(rev.warnings.map((w) => w.kind)).toEqual(['reversed-polarity'])
    const revDirect = analyzeCircuit(circuit([part('led1', 'led')], [['uno.5V', 'led1.K'], ['led1.A', 'uno.GND']]))
    expect(revDirect.warnings.map((w) => w.kind)).toEqual(['reversed-polarity'])
    const short = analyzeCircuit(circuit([], [['uno.5V', 'uno.GND2']]))
    expect(short.warnings.map((w) => w.kind)).toEqual(['short-circuit'])
    // direnç LED'in katot tarafında da seri direnç sayılır
    const cathodeRes = analyzeCircuit(circuit(
      [part('r1', 'resistor'), part('led1', 'led')],
      [['uno.5V', 'led1.A'], ['led1.K', 'r1.1'], ['r1.2', 'uno.GND']],
    ))
    expect(cathodeRes.warnings).toEqual([])
  })

  it('statik uyarı: yüzen giriş', () => {
    const w = analyzeCircuit(circuit([part('r1', 'resistor')], [['uno.D2', 'r1.1']])).warnings
    expect(w.map((x) => x.kind)).toEqual(['floating-input'])
    // butonla toprağa bağlı pin yüzen değil; servo sinyal hattı da değil
    const ok = analyzeCircuit(circuit([part('btn', 'button'), part('sv', 'servo')], [['uno.D2', 'btn.A'], ['btn.B', 'uno.GND'], ['uno.D9', 'sv.SIG']]))
    expect(ok.warnings).toEqual([])
  })
})

describe('sözleşme ve çözücü', () => {
  it('PINS ve PROPS dışa açık', () => {
    expect(PINS.uno).toContain('GND3')
    expect(PROPS.pot.map((p) => p.key)).toEqual(['position', 'ohms'])
  })

  it('netlist: bilinmeyen parça/pin kabloları yok sayılır', () => {
    const nl = buildNetlist(circuit([part('r1', 'resistor')], [['uno.D2', 'r1.1'], ['ghost.1', 'r1.2'], ['r1.9', 'r1.2']]))
    expect(nl.netOf(ref('uno.D2'))).toBe(nl.netOf(ref('r1.1')))
    expect(nl.netOf(ref('r1.2'))).not.toBe(nl.netOf(ref('r1.1')))
    expect(nl.isWired(ref('r1.2'))).toBe(false)
  })

  it('solver: bölücü ve LED yinelemesi', () => {
    // 5V -(1k)- n1 -(1k)- gnd: 2,5 V
    const r = solve({ nodes: 2, resistors: [{ a: 1, b: 0, ohms: 1000 }], sources: [{ node: 1, volts: 5, ohms: 1000 }], leds: [] })
    expect(r.volts[1]).toBeCloseTo(2.5, 4)
    // 5V -330- LED(1,9V,5 ohm) -gnd
    const l = solve({ nodes: 3, resistors: [{ a: 1, b: 2, ohms: 330 }], sources: [{ node: 1, volts: 5, ohms: 0.01 }], leds: [{ a: 2, k: 0, vf: 1.9, rs: 5 }] })
    expect(l.ledOn[0]).toBe(true)
    expect(l.ledAmps[0]).toBeCloseTo(3.1 / 335, 4)
    // yetersiz gerilim: LED kapalı
    const off = solve({ nodes: 3, resistors: [{ a: 1, b: 2, ohms: 330 }], sources: [{ node: 1, volts: 1.5, ohms: 0.01 }], leds: [{ a: 2, k: 0, vf: 1.9, rs: 5 }] })
    expect(off.ledOn[0]).toBe(false)
    expect(off.ledAmps[0]).toBe(0)
  })
})
