import { describe, expect, it } from 'vitest'
import { ANALOG3_HEX, BLINK_HEX, BUTTON_SERIAL_HEX, PWM9_HEX, TONE8_HEX } from '../../../../../packages/sim/src/circuit/lab-fixtures'
import type { Circuit } from './contract'
import { addPart, addWire } from './ops'
import { StatsTracker } from './stats'
import { RUNTIME_KIND, analyze, createRuntime } from './runtime'

const uno = (): Circuit => ({ parts: [{ id: 'uno', type: 'uno', x: 0, y: 0, rotation: 0, props: {} }], wires: [] })
const wire = (c: Circuit, a: [string, string], b: [string, string]) => addWire(c, { part: a[0], pin: a[1] }, { part: b[0], pin: b[1] })!.circuit

function ledCircuit(pin: string, withR: boolean, reversed = false): Circuit {
  let c = addPart(addPart(uno(), 'led', 500, 0).circuit, 'resistor', 400, 0).circuit
  const [hi, lo] = reversed ? ['K', 'A'] : ['A', 'K']
  if (withR) { c = wire(c, ['uno', pin], ['resistor1', '1']); c = wire(c, ['resistor1', '2'], ['led1', hi]) } else c = wire(c, ['uno', pin], ['led1', hi])
  return wire(c, ['led1', lo], ['uno', 'GND'])
}

describe('gerçek çekirdek', () => {
  it('gerçek uygulama kullanılıyor', () => expect(RUNTIME_KIND).toBe('real'))
  it('Blink: LED ~1 Hz', () => {
    const lab = createRuntime(ledCircuit('D13', true), BLINK_HEX)
    let edges = 0, prev: boolean | null = null
    for (let i = 0; i < 40; i++) { lab.advance(50); const on = lab.state.parts.led1.led!.on; if (prev !== null && on !== prev) edges++; prev = on }
    expect(edges).toBeGreaterThanOrEqual(3); expect(edges).toBeLessThanOrEqual(5)
  })
  it('stats: Blink 2,5 sn → ledToggles ≥ 3, pinEdges D13, runMs', () => {
    const lab = createRuntime(ledCircuit('D13', true), BLINK_HEX)
    const t = new StatsTracker()
    for (let i = 0; i < 500; i++) { lab.advance(5); t.observe(lab.state) }
    const s = t.get()
    expect(s.ledToggles.led1).toBeGreaterThanOrEqual(3)
    expect(s.pinEdges.D13).toBeGreaterThanOrEqual(4); expect(s.pinEdges.D13).toBeLessThanOrEqual(6)
    expect(s.runMs).toBeGreaterThan(2400)
    t.reset(); expect(t.get()).toEqual({ pinEdges: {}, ledToggles: {}, runMs: 0 })
  })
  it('dirençsiz LED yanar', () => {
    const lab = createRuntime(ledCircuit('D13', false), BLINK_HEX)
    for (let i = 0; i < 4; i++) lab.advance(50)
    expect(lab.state.parts.led1.led!.burnt).toBe(true)
    expect(lab.state.warnings.some((w) => w.kind === 'led-burnt' || w.kind === 'led-no-resistor')).toBe(true)
  })
  it('ters LED yanmaz', () => {
    const lab = createRuntime(ledCircuit('D13', true, true), BLINK_HEX)
    for (let i = 0; i < 22; i++) lab.advance(50)
    expect(lab.state.parts.led1.led!.burnt).toBe(false); expect(lab.state.parts.led1.led!.on).toBe(false)
    expect(lab.state.warnings.some((w) => w.kind === 'reversed-polarity')).toBe(true)
  })
  it('PWM parlaklığı ve pasif buzzer', () => {
    const l = createRuntime(ledCircuit('D9', true), PWM9_HEX)
    for (let i = 0; i < 10; i++) l.advance(50)
    const b = l.state.parts.led1.led!.brightness
    expect(b).toBeGreaterThan(0.2); expect(b).toBeLessThan(0.7)
    let c = addPart(uno(), 'buzzer', 400, 0).circuit
    c = wire(c, ['uno', 'D8'], ['buzzer1', '+']); c = wire(c, ['buzzer1', '-'], ['uno', 'GND'])
    const z = createRuntime(c, TONE8_HEX)
    for (let i = 0; i < 10; i++) z.advance(50)
    expect(z.state.parts.buzzer1.buzzer!.on).toBe(true); expect(z.state.parts.buzzer1.buzzer!.freqHz).toBeGreaterThan(400); expect(z.state.parts.buzzer1.buzzer!.freqHz).toBeLessThan(480)
  })
  it('buton seri çıktısı', () => {
    let c = addPart(uno(), 'button', 400, 0).circuit
    c = wire(c, ['uno', 'D2'], ['button1', 'A']); c = wire(c, ['button1', 'B'], ['uno', 'GND'])
    const lab = createRuntime(c, BUTTON_SERIAL_HEX)
    lab.advance(100); lab.setProp('button1', 'pressed', true); lab.advance(100)
    expect(lab.state.serial).toContain('PRESSED')
  })
  it('potansiyometre → analogRead', () => {
    let c = addPart(uno(), 'pot', 400, 0).circuit
    c = wire(c, ['uno', '5V'], ['pot1', 'VCC']); c = wire(c, ['uno', 'GND'], ['pot1', 'GND']); c = wire(c, ['uno', 'A0'], ['pot1', 'SIG'])
    const lab = createRuntime(c, ANALOG3_HEX)
    const read = () => { lab.advance(300); const l = lab.state.serial.trim().split('\n').filter((x) => x.split(' ').length === 3).pop()!; return +l.split(' ')[0] }
    const a = read(); lab.setProp('pot1', 'position', 0.9); const b = read()
    expect(b).toBeGreaterThan(a + 200)
  })
  it('LDR ve NTC bölücüsü → analogRead', () => {
    let c = addPart(addPart(addPart(addPart(uno(), 'ldr', 400, 0).circuit, 'ntc', 400, 80).circuit, 'resistor', 400, 160).circuit, 'resistor', 400, 240).circuit
    c = wire(c, ['uno', '5V'], ['ldr1', '1']); c = wire(c, ['ldr1', '2'], ['uno', 'A0']); c = wire(c, ['uno', 'A0'], ['resistor1', '1']); c = wire(c, ['resistor1', '2'], ['uno', 'GND'])
    c = wire(c, ['uno', '5V'], ['ntc1', '1']); c = wire(c, ['ntc1', '2'], ['uno', 'A1']); c = wire(c, ['uno', 'A1'], ['resistor2', '1']); c = wire(c, ['resistor2', '2'], ['uno', 'GND'])
    const lab = createRuntime(c, ANALOG3_HEX)
    const read = (i: number) => { lab.advance(300); const l = lab.state.serial.trim().split('\n').filter((x) => x.split(' ').length === 3).pop()!; return +l.split(' ')[i] }
    lab.setProp('ldr1', 'light', 0.1); const dark = read(0)
    lab.setProp('ldr1', 'light', 0.9); const bright = read(0)
    expect(bright).toBeGreaterThan(dark + 100)
    lab.setProp('ntc1', 'tempC', 0); const cold = read(1)
    lab.setProp('ntc1', 'tempC', 80); const hot = read(1)
    expect(hot).toBeGreaterThan(cold + 100)
  })
  it('analiz yönlü bağlantı', () => {
    const a = analyze(ledCircuit('D13', true))
    expect(a.connected({ part: 'uno', pin: 'D13' }, { part: 'led1', pin: 'A' }, ['resistor'])).toBe(true)
  })
})
