import { describe, expect, it } from 'vitest'
import { createLab } from '../index.js'
import type { Circuit, LabApi, PartInstance, PartType, PropValue, Wire } from '../index.js'
import {
  ANALOG3_HEX, BLINK_HEX, BUTTON_SERIAL_HEX, PWM9_HEX, RGB_HEX, SERVO9_0_HEX, SERVO9_HEX, TONE8_HEX,
} from './lab-fixtures.js'
import { MODEL, ldrOhms, ntcOhms } from './model.js'

const part = (id: string, type: PartType, props: Record<string, PropValue> = {}): PartInstance => ({ id, type, x: 0, y: 0, rotation: 0, props })
const ref = (s: string): { part: string; pin: string } => { const i = s.indexOf('.'); return { part: s.slice(0, i), pin: s.slice(i + 1) } }
const wire = (a: string, b: string): Wire => ({ id: `${a}~${b}`, a: ref(a), b: ref(b) })
const uno = (): PartInstance => part('uno', 'uno')
const circuit = (parts: PartInstance[], wires: Array<[string, string]>): Circuit => ({ parts: [uno(), ...parts], wires: wires.map(([a, b]) => wire(a, b)) })

const lines = (s: string): string[] => s.trim().split(/\r?\n/)
const ledAt = (lab: LabApi, id = 'led1') => lab.state.parts[id].led!
const kinds = (lab: LabApi): string[] => lab.state.warnings.map((w) => w.kind)

/** D13 -> 330 -> LED -> GND. */
const blinkCircuit = (ohms = 330): Circuit => circuit(
  [part('r1', 'resistor', { ohms }), part('led1', 'led', { color: 'red' })],
  [['uno.D13', 'r1.1'], ['r1.2', 'led1.A'], ['led1.K', 'uno.GND']],
)

const FULL_MA = ((5 - 1.9) / (330 + 25 + 5)) * 1000

function sample(lab: LabApi, totalMs: number, stepMs: number, f: () => number): number[] {
  const out: number[] = []
  for (let t = 0; t < totalMs; t += stepMs) { lab.advance(stepMs); out.push(f()) }
  return out
}

describe('lab: Blink', () => {
  it('(a) 330 ohm: akım ~8,6 mA, ~1 Hz, uyarı yok', () => {
    const lab = createLab(blinkCircuit(), BLINK_HEX)
    const br = sample(lab, 4000, 10, () => ledAt(lab).brightness)
    const cur = sample(createLab(blinkCircuit(), BLINK_HEX), 100, 10, () => 0) // kurulum denemesi
    expect(cur.length).toBe(10)
    const on = br.filter((b) => b > 0.4)
    expect(on.length).toBeGreaterThan(0)
    // tam açıkken akım = (5-1,9)/(330+25+5)
    const lab2 = createLab(blinkCircuit(), BLINK_HEX)
    lab2.advance(250)
    const s = ledAt(lab2)
    expect(s.on).toBe(true)
    expect(s.currentMa).toBeCloseTo(FULL_MA, 2)
    expect(s.brightness).toBeCloseTo(Math.min(1, FULL_MA / 1000 / MODEL.ledRefA), 2)
    expect(s.burnt).toBe(false)
    // yanıp sönme: ~%50 doluluk ve ~1 Hz (4 s'de 2 yükselen kenar + başlangıçtaki yanma)
    expect(on.length / br.length).toBeGreaterThan(0.45)
    expect(on.length / br.length).toBeLessThan(0.55)
    let rises = 0
    for (let i = 1; i < br.length; i++) if (br[i] > 0.4 && br[i - 1] <= 0.4) rises++
    expect(rises).toBeGreaterThanOrEqual(3)
    expect(rises).toBeLessThanOrEqual(4)
    expect(Math.min(...br)).toBe(0)
    expect(lab.state.warnings).toEqual([])
    expect(lab.state.pins.D13.mode).toBe('out')
  })

  it('(b) dirençsiz LED yanar ve uyarı verir', () => {
    const c = circuit([part('led1', 'led')], [['uno.D13', 'led1.A'], ['led1.K', 'uno.GND']])
    const lab = createLab(c, BLINK_HEX)
    lab.advance(100)
    expect(ledAt(lab).burnt).toBe(true)
    expect(ledAt(lab).on).toBe(false)
    expect(kinds(lab)).toEqual(expect.arrayContaining(['led-burnt', 'led-no-resistor']))
    // kalıcı: LOW fazında da yanık kalır
    lab.advance(800)
    expect(ledAt(lab).burnt).toBe(true)
    expect(ledAt(lab).brightness).toBe(0)
  })

  it('(c) ters bağlı LED yanmaz ve uyarı verir', () => {
    const c = circuit(
      [part('r1', 'resistor', { ohms: 330 }), part('led1', 'led')],
      [['uno.D13', 'r1.1'], ['r1.2', 'led1.K'], ['led1.A', 'uno.GND']],
    )
    const lab = createLab(c, BLINK_HEX)
    const br = sample(lab, 1500, 10, () => ledAt(lab).brightness)
    expect(Math.max(...br)).toBe(0)
    expect(ledAt(lab).burnt).toBe(false)
    expect(kinds(lab)).toContain('reversed-polarity')
  })

  it('(h) PWM: parlaklık ~ doluluk x tam akım parlaklığı', () => {
    const c = circuit(
      [part('r1', 'resistor', { ohms: 330 }), part('led1', 'led')],
      [['uno.D9', 'r1.1'], ['r1.2', 'led1.A'], ['led1.K', 'uno.GND']],
    )
    const lab = createLab(c, PWM9_HEX)
    lab.advance(100)
    const br = sample(lab, 200, 1, () => ledAt(lab).brightness)
    const mean = br.reduce((a, b) => a + b, 0) / br.length
    const full = Math.min(1, FULL_MA / 1000 / MODEL.ledRefA)
    expect(mean).toBeGreaterThan(0.5 * full - 0.04)
    expect(mean).toBeLessThan(0.5 * full + 0.04)
  })

  it('(l) kısa devre uyarısı (pin doğrudan GND, 5V-GND)', () => {
    const c1 = circuit([], [['uno.D13', 'uno.GND2']])
    const lab = createLab(c1, BLINK_HEX)
    lab.advance(50)
    expect(kinds(lab)).toContain('short-circuit')
    const c2 = circuit([], [['uno.5V', 'uno.GND3']])
    const lab2 = createLab(c2, BLINK_HEX)
    expect(kinds(lab2)).toContain('short-circuit')
    // sağlıklı devrede kısa devre yok
    const lab3 = createLab(blinkCircuit(), BLINK_HEX)
    lab3.advance(1200)
    expect(kinds(lab3)).not.toContain('short-circuit')
  })

  it('aşırı akım: LED dirençsiz Uno pinini 40 mA üstüne çıkarır', () => {
    const c = circuit([part('led1', 'led')], [['uno.D13', 'led1.A'], ['led1.K', 'uno.GND']])
    const lab = createLab(c, BLINK_HEX)
    lab.advance(10)
    expect(kinds(lab)).toContain('pin-overcurrent')
  })

  it('(o) reset() yanık LED\'i temizler', () => {
    const c = circuit([part('led1', 'led')], [['uno.D13', 'led1.A'], ['led1.K', 'uno.GND']])
    const lab = createLab(c, BLINK_HEX)
    lab.advance(50)
    expect(ledAt(lab).burnt).toBe(true)
    lab.reset()
    expect(lab.state.timeMs).toBe(0)
    expect(ledAt(lab).burnt).toBe(false)
    expect(kinds(lab)).not.toContain('led-burnt')
    lab.advance(50) // devre hâlâ dirençsiz: yeniden yanar
    expect(ledAt(lab).burnt).toBe(true)
  })

  it('aktif buzzer D13 HIGH iken öter', () => {
    const c = circuit([part('bz', 'buzzer', { kind: 'active' })], [['uno.D13', 'bz.+'], ['bz.-', 'uno.GND']])
    const lab = createLab(c, BLINK_HEX)
    lab.advance(250)
    expect(lab.state.parts.bz.buzzer!.on).toBe(true)
    lab.advance(500)
    expect(lab.state.parts.bz.buzzer!.on).toBe(false)
  })
})

describe('lab: girişler', () => {
  it('(d) INPUT_PULLUP butonu: serbest HIGH, basılı LOW ve seriye yazılır', () => {
    const c = circuit([part('btn', 'button', { pressed: false })], [['uno.D2', 'btn.A'], ['btn.B', 'uno.GND']])
    const lab = createLab(c, BUTTON_SERIAL_HEX)
    lab.advance(100)
    expect(lab.state.pins.D2.mode).toBe('pullup')
    expect(lab.state.pins.D2.high).toBe(true)
    expect(lab.state.pins.D2.volts).toBeCloseTo(5, 1)
    expect(lines(lab.state.serial).at(-1)).toBe('RELEASED')
    lab.setProp('btn', 'pressed', true)
    lab.advance(100)
    expect(lab.state.pins.D2.high).toBe(false)
    expect(lab.state.pins.D2.volts).toBeLessThan(0.1)
    expect(lines(lab.state.serial).at(-1)).toBe('PRESSED')
    lab.setProp('btn', 'pressed', false)
    lab.advance(100)
    expect(lines(lab.state.serial).at(-1)).toBe('RELEASED')
    expect(lab.state.warnings).toEqual([])
  })

  const readAdc = (lab: LabApi): number[] => {
    lab.advance(300)
    return lines(lab.state.serial).at(-1)!.split(' ').map(Number)
  }

  it('(e) 10k potansiyometre: 0,5 -> ~512, 0,25 -> ~256', () => {
    const c = circuit([part('pot', 'pot', { position: 0.5, ohms: 10_000 })], [['pot.VCC', 'uno.5V'], ['pot.GND', 'uno.GND'], ['pot.SIG', 'uno.A0']])
    const lab = createLab(c, ANALOG3_HEX)
    expect(Math.abs(readAdc(lab)[0] - 512)).toBeLessThanOrEqual(2)
    lab.setProp('pot', 'position', 0.25)
    expect(Math.abs(readAdc(lab)[0] - 256)).toBeLessThanOrEqual(2)
    lab.setProp('pot', 'position', 1)
    expect(readAdc(lab)[0]).toBeGreaterThanOrEqual(1022)
    lab.setProp('pot', 'position', 0)
    expect(readAdc(lab)[0]).toBeLessThanOrEqual(1)
  })

  it('(f) LDR + 10k bölücü (5V-LDR-A1-10k-GND)', () => {
    const c = circuit(
      [part('ldr', 'ldr', { light: 0 }), part('r1', 'resistor', { ohms: 10_000 })],
      [['uno.5V', 'ldr.1'], ['ldr.2', 'uno.A1'], ['uno.A1', 'r1.1'], ['r1.2', 'uno.GND']],
    )
    const lab = createLab(c, ANALOG3_HEX)
    const expected = (light: number): number => Math.floor((5 * 10_000) / (10_000 + ldrOhms(light)) / 5 * 1024)
    // karanlık: 1 MOhm -> 0,0495 V -> ~10 ; aydınlık: 200 Ohm -> 4,902 V -> 1003
    expect(expected(0)).toBe(10)
    expect(expected(1)).toBe(1003)
    expect(Math.abs(readAdc(lab)[1] - 10)).toBeLessThanOrEqual(1)
    lab.setProp('ldr', 'light', 1)
    expect(Math.abs(readAdc(lab)[1] - 1003)).toBeLessThanOrEqual(1)
    lab.setProp('ldr', 'light', 0.5)
    expect(Math.abs(readAdc(lab)[1] - expected(0.5))).toBeLessThanOrEqual(1)
  })

  it('(g) NTC + 10k bölücü (5V-10k-A2-NTC-GND)', () => {
    const c = circuit(
      [part('r1', 'resistor', { ohms: 10_000 }), part('ntc', 'ntc', { tempC: 25 })],
      [['uno.5V', 'r1.1'], ['r1.2', 'uno.A2'], ['uno.A2', 'ntc.1'], ['ntc.2', 'uno.GND']],
    )
    const lab = createLab(c, ANALOG3_HEX)
    expect(ntcOhms(25)).toBeCloseTo(10_000, 6)
    expect(Math.abs(readAdc(lab)[2] - 512)).toBeLessThanOrEqual(2)
    lab.setProp('ntc', 'tempC', 45)
    const r = 10_000 * Math.exp(3950 * (1 / 318.15 - 1 / 298.15))
    expect(r).toBeCloseTo(4346, -1)
    const expected = (5 * r) / (10_000 + r) / 5 * 1024
    expect(Math.abs(readAdc(lab)[2] - expected)).toBeLessThanOrEqual(2)
  })
})

describe('lab: çıkış aygıtları', () => {
  it('(i) pasif buzzer tone(8,440) ~ 440 Hz', () => {
    const c = circuit([part('bz', 'buzzer', { kind: 'passive' })], [['uno.D8', 'bz.+'], ['bz.-', 'uno.GND']])
    const lab = createLab(c, TONE8_HEX)
    lab.advance(200)
    const b = lab.state.parts.bz.buzzer!
    expect(b.on).toBe(true)
    expect(Math.abs(b.freqHz - 440)).toBeLessThanOrEqual(8)
    expect(kinds(lab)).not.toContain('pin-overcurrent')
  })

  const servoCircuit = (powered: boolean): Circuit => circuit(
    [part('sv', 'servo')],
    [['sv.SIG', 'uno.D9'], ['sv.GND', 'uno.GND'], ...(powered ? [['sv.VCC', 'uno.5V'] as [string, string]] : [])],
  )

  it('(j) servo write(90) ~ 90 derece, write(0) ~ 0 derece', () => {
    const lab = createLab(servoCircuit(true), SERVO9_HEX)
    lab.advance(300)
    const s = lab.state.parts.sv.servo!
    expect(s.attached).toBe(true)
    expect(Math.abs(s.angleDeg - 90)).toBeLessThanOrEqual(3)
    const lab0 = createLab(servoCircuit(true), SERVO9_0_HEX)
    lab0.advance(300)
    expect(Math.abs(lab0.state.parts.sv.servo!.angleDeg)).toBeLessThanOrEqual(3)
  })

  it('servo gücü yoksa açı güncellenmez', () => {
    const lab = createLab(servoCircuit(false), SERVO9_0_HEX)
    lab.advance(300)
    const s = lab.state.parts.sv.servo!
    expect(s.attached).toBe(true)
    expect(s.angleDeg).toBe(90)
  })

  const rgb = (common: 'cathode' | 'anode'): Circuit => circuit(
    [part('rgb', 'rgbled', { common }), part('r1', 'resistor', { ohms: 330 }), part('r2', 'resistor', { ohms: 330 }), part('r3', 'resistor', { ohms: 330 })],
    [['uno.D9', 'r1.1'], ['r1.2', 'rgb.R'], ['uno.D10', 'r2.1'], ['r2.2', 'rgb.G'], ['uno.D11', 'r3.1'], ['r3.2', 'rgb.B'], ['rgb.COM', common === 'cathode' ? 'uno.GND' : 'uno.5V']],
  )

  it('(k) RGB LED ortak katot: sürülen kanal yanar', () => {
    const lab = createLab(rgb('cathode'), RGB_HEX)
    lab.advance(30)
    expect(lab.state.parts.rgb.rgbled).toEqual({ r: 0, g: 0, b: 0 })
    for (const [ch, vf] of [['r', 1.9], ['g', 2.2], ['b', 3.0]] as const) {
      lab.sendSerial(ch)
      lab.advance(30)
      const v = lab.state.parts.rgb.rgbled!
      const expected = Math.min(1, (5 - vf) / (330 + 25 + 5) / MODEL.ledRefA)
      expect(v[ch]).toBeCloseTo(expected, 2)
      for (const o of ['r', 'g', 'b'] as const) if (o !== ch) expect(v[o]).toBe(0)
    }
    expect(lab.state.warnings).toEqual([])
  })

  it('RGB LED ortak anot: LOW olan kanallar yanar', () => {
    const lab = createLab(rgb('anode'), RGB_HEX)
    lab.advance(30) // tümü LOW -> hepsi yanar
    const v0 = lab.state.parts.rgb.rgbled!
    expect(v0.r).toBeGreaterThan(0.2); expect(v0.g).toBeGreaterThan(0.2); expect(v0.b).toBeGreaterThan(0.1)
    lab.sendSerial('r') // D9 HIGH -> kırmızı söner
    lab.advance(30)
    const v = lab.state.parts.rgb.rgbled!
    expect(v.r).toBe(0)
    expect(v.g).toBeGreaterThan(0.2)
  })
})

describe('lab: LED parlaklık tablosu', () => {
  it('direnç değerine göre parlaklık = min(1, I / ledRefA)', () => {
    const rows: string[] = []
    for (const ohms of [220, 330, 1000, 4700]) {
      const lab = createLab(blinkCircuit(ohms), BLINK_HEX)
      lab.advance(250)
      const amps = (5 - 1.9) / (ohms + 25 + 5)
      const expected = Math.min(1, amps / MODEL.ledRefA)
      expect(ledAt(lab).brightness).toBeCloseTo(expected, 3)
      rows.push(`${ohms} ohm: ${(amps * 1000).toFixed(2)} mA -> ${ledAt(lab).brightness.toFixed(3)}`)
    }
    console.log(rows.join('\n'))
  })
})

describe('lab: genel', () => {
  it('(n) determinizm: aynı devre iki kez aynı durum', () => {
    const run = (): string => {
      const lab = createLab(blinkCircuit(), BLINK_HEX)
      const trace: number[] = []
      for (let i = 0; i < 130; i++) { lab.advance(10); trace.push(ledAt(lab).brightness) }
      lab.advance(3.5)
      return JSON.stringify([lab.state, trace])
    }
    expect(run()).toBe(run())
  })

  it('state tutarlı anlık görüntü: tüm pinler ve parça çalışma zamanı', () => {
    const lab = createLab(blinkCircuit(), BLINK_HEX)
    lab.advance(10)
    const s = lab.state
    expect(Object.keys(s.pins)).toHaveLength(20)
    expect(s.pins.D13.high).toBe(true)
    expect(s.pins.D13.volts).toBeGreaterThan(1.9)
    expect(s.running).toBe(true)
    expect(s.timeMs).toBeCloseTo(10, 3)
    lab.dispose()
    expect(lab.state.running).toBe(false)
  })

  it('sendSerial seri girişe iletilir', () => {
    const c = circuit([part('r1', 'resistor')], [])
    const lab = createLab(c, RGB_HEX)
    lab.advance(5) // Serial.begin çalışsın
    lab.sendSerial('g')
    lab.advance(30)
    expect(lab.state.pins.D10.high).toBe(true)
  })
})
