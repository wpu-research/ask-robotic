// Aşama B (Modül 3, H5-H7) parçaları: transistör/MOSFET/motor, L293D, röle, 7-segment, 74HC595, LCD'ler ve sanal ölçüm.
// Hex'ler ders sketch'lerinin derlenmiş halidir (lab-fixtures-b.ts). Sayısal beklentiler elle hesaplanmıştır (yorumlarda).
import { describe, expect, it, vi } from 'vitest'
import { analyzeCircuit, createLab } from '../index.js'
import type { Circuit, LabApi, PartInstance, PartType, PropValue, Wire } from '../index.js'
import { BLINK_HEX } from './lab-fixtures.js'
import {
  FAN_POT_HEX, FAN_RAMPA_HEX, I2C_LCD_HEX, I2C_TARAMA_HEX, LCD_DERECE_HEX, LCD_MERHABA_HEX, LED_SERIDI_HEX, MOTOR_BUTON_HEX, MOTOR_YON_HEX,
  ROLE_BUTON_HEX, ROLE_ESIK_HEX, SR_LSB01_HEX, SR_MSB01_HEX, SR_NOLATCH_HEX, TERMOSTAT_HEX, YEDI_SEGMENT_SAYAC_HEX,
} from './lab-fixtures-b.js'
import { MODEL } from './model.js'

vi.setConfig({ testTimeout: 120_000 }) // gerçek hex'li benzetimler saniyeler sürer

const part = (id: string, type: PartType, props: Record<string, PropValue> = {}): PartInstance => ({ id, type, x: 0, y: 0, rotation: 0, props })
const ref = (s: string): { part: string; pin: string } => { const i = s.indexOf('.'); return { part: s.slice(0, i), pin: s.slice(i + 1) } }
const wire = (a: string, b: string): Wire => ({ id: `${a}~${b}`, a: ref(a), b: ref(b) })
const circuit = (parts: PartInstance[], wires: Array<[string, string]>): Circuit => ({ parts: [part('uno', 'uno'), ...parts], wires: wires.map(([a, b]) => wire(a, b)) })
const kinds = (lab: LabApi): string[] => lab.state.warnings.map((w) => w.kind)
const rt = (lab: LabApi, id: string) => lab.state.parts[id]
const lines = (s: string): string[] => s.trim().split(/\r?\n/)
const without = <T>(c: Circuit, pred: (w: Wire) => boolean): Circuit => ({ ...c, wires: c.wires.filter((w) => !pred(w)) })
const touches = (w: Wire, s: string): boolean => `${w.a.part}.${w.a.pin}` === s || `${w.b.part}.${w.b.pin}` === s

// ---------------------------------------------------------------------------------------------------------------------
// (a) NPN ile DC motor / LED (ders 22): D6 -1k- B, E=GND, motor 5V ile C arasında, flyback diyot C(A)–5V(K).
// ---------------------------------------------------------------------------------------------------------------------
const npnMotor = (opts: { diode?: 'ok' | 'reversed' | 'none'; baseR?: boolean; pot?: number } = {}): Circuit => {
  const { diode = 'ok', baseR = true, pot = 1 } = opts
  const parts = [
    part('q1', 'npn'), part('m1', 'dcmotor'), part('pot', 'pot', { position: pot }),
    ...(baseR ? [part('r1', 'resistor', { ohms: 1000 })] : []),
    ...(diode !== 'none' ? [part('d1', 'diode')] : []),
  ]
  const w: Array<[string, string]> = [
    ['uno.D6', baseR ? 'r1.1' : 'q1.B'], ['q1.E', 'uno.GND'], ['m1.M1', 'uno.5V'], ['m1.M2', 'q1.C'],
    ['pot.VCC', 'uno.5V'], ['pot.GND', 'uno.GND2'], ['pot.SIG', 'uno.A0'],
  ]
  if (baseR) w.push(['r1.2', 'q1.B'])
  if (diode === 'ok') w.push(['d1.A', 'q1.C'], ['d1.K', 'uno.5V'])
  if (diode === 'reversed') w.push(['d1.K', 'q1.C'], ['d1.A', 'uno.5V'])
  return circuit(parts, w)
}

describe('NPN + DC motor (ders 22)', () => {
  // Tam açık: Ib = (5 − 0,7)/(25 + 1000 + 1) = 4,191 mA, Ic = β·Ib = 419,1 mA (aktif bölge: VCE = 5 − 4,19 ≈ 0,8 V > 0,2 V),
  // motor gerilimi ≈ 4,19 V → hız = 4,19/6 = 0,70.
  it('fan_pot: tam gaz hız ≈ 0,70, pot 0 -> durur, pot 0,5 -> ≈ yarısı; yön pozitif', () => {
    const lab = createLab(npnMotor({ pot: 1 }), FAN_POT_HEX)
    lab.advance(300)
    const full = rt(lab, 'm1').dcmotor!.speed
    const ib = (5 - 0.7) / (25 + 1000 + 1)
    expect(ib * MODEL.npnBeta * 1000).toBeCloseTo(419.1, 0)
    expect(full).toBeGreaterThan(0.69)
    expect(full).toBeLessThan(0.71)
    expect(rt(lab, 'm1').meas!.currentMa).toBeCloseTo(419, -1)
    expect(rt(lab, 'm1').meas!.vAcross).toBeCloseTo(4.19, 1)
    expect(kinds(lab)).toEqual([])
    lab.setProp('pot', 'position', 0)
    lab.advance(300)
    expect(rt(lab, 'm1').dcmotor!.speed).toBe(0)
    lab.setProp('pot', 'position', 0.5)
    lab.advance(400)
    const half = rt(lab, 'm1').dcmotor!.speed
    expect(half).toBeGreaterThan(full * 0.5 - 0.04)
    expect(half).toBeLessThan(full * 0.5 + 0.04)
    expect(lab.state.pins.D6.mode).toBe('out')
  })

  it('fan_rampa: hız zamanla artar sonra düşer', () => {
    const lab = createLab(npnMotor(), FAN_RAMPA_HEX)
    const speeds: number[] = []
    for (let t = 0; t < 4500; t += 100) { lab.advance(100); speeds.push(rt(lab, 'm1').dcmotor!.speed) }
    // 0..255 adım 5, adım 40 ms: 51 adım ≈ 2,04 s tepe; sonra 1 s bekleme
    expect(speeds[2]).toBeLessThan(0.3)
    expect(Math.max(...speeds)).toBeGreaterThan(0.65)
    expect(speeds[10]).toBeGreaterThan(speeds[4])
    expect(speeds.at(-1)!).toBeLessThan(Math.max(...speeds) - 0.1) // tepe sonrası yavaşlama başladı
  })

  // Doyum: motor yerine 330 Ω + LED. Ic isteği ≈ 8,6 mA << β·Ib = 419 mA -> VCE = 0,2 + Ic·0,5 ≈ 0,204 V.
  it('transistörle LED sürme: doyum, VCE ≈ 0,2 V, LED ≈ 8,6 mA', () => {
    const c = circuit(
      [part('q1', 'npn'), part('r1', 'resistor', { ohms: 1000 }), part('r2', 'resistor', { ohms: 330 }), part('led1', 'led')],
      [['uno.D6', 'r1.1'], ['r1.2', 'q1.B'], ['q1.E', 'uno.GND'], ['uno.5V', 'r2.1'], ['r2.2', 'led1.A'], ['led1.K', 'q1.C'], ['uno.A0', 'uno.GND2']],
    )
    // A0 doğrudan GND: ADC 0 → fan_pot D6'yı LOW tutar; bu yüzden pot yerine sabit 5 V ile deneriz
    const c2 = { ...c, wires: c.wires.filter((w) => !touches(w, 'uno.A0')).concat([wire('uno.A0', 'uno.5V')]) }
    const lab = createLab(c2, FAN_POT_HEX)
    lab.advance(300)
    const expected = (5 - 1.9 - 0.2) / (330 + 5 + 0.5 + 0.01) * 1000 // ≈ 8,65 mA
    expect(rt(lab, 'led1').led!.currentMa).toBeGreaterThan(expected - 0.15)
    expect(rt(lab, 'led1').led!.currentMa).toBeLessThan(expected + 0.05)
    expect(rt(lab, 'led1').led!.on).toBe(true)
    expect(kinds(lab)).toEqual([])
    // taban LOW (A0 = GND): LED söner
    const lab0 = createLab(c, FAN_POT_HEX)
    lab0.advance(300)
    expect(rt(lab0, 'led1').led!.on).toBe(false)
  })

  it('taban direnci yoksa aşırı taban akımı uyarısı (statik + dinamik)', () => {
    const c = npnMotor({ baseR: false })
    expect(analyzeCircuit(c).warnings.map((w) => w.kind)).toContain('base-overcurrent')
    const lab = createLab(c, FAN_POT_HEX)
    lab.advance(300)
    expect(kinds(lab)).toEqual(expect.arrayContaining(['base-overcurrent', 'pin-overcurrent']))
    expect(analyzeCircuit(npnMotor()).warnings.map((w) => w.kind)).not.toContain('base-overcurrent')
  })
})

// ---------------------------------------------------------------------------------------------------------------------
// (b) flyback diyot uyarısı
// ---------------------------------------------------------------------------------------------------------------------
describe('flyback diyot uyarısı', () => {
  it('diyot yok -> uyarı; diyot var -> yok; ters diyot -> uyarı', () => {
    expect(analyzeCircuit(npnMotor({ diode: 'none' })).warnings.map((w) => w.kind)).toEqual(['flyback-missing'])
    expect(analyzeCircuit(npnMotor({ diode: 'ok' })).warnings).toEqual([])
    const rev = analyzeCircuit(npnMotor({ diode: 'reversed' })).warnings
    expect(rev.map((w) => w.kind)).toEqual(['flyback-missing'])
    expect(rev[0].message).toMatch(/ters/)
    const lab = createLab(npnMotor({ diode: 'none' }), FAN_POT_HEX)
    lab.advance(50)
    expect(kinds(lab)).toContain('flyback-missing')
    expect(lab.state.warnings.find((w) => w.kind === 'flyback-missing')!.partId).toBe('m1')
  })

  it('diyot yönü doğruyken motor gerilimini bozmaz; ters diyot motoru kısa devre eder (hız 0)', () => {
    const lab = createLab(npnMotor({ diode: 'reversed' }), FAN_POT_HEX)
    lab.advance(300)
    // ters diyot: 5V -> A, K -> C: C 0,7 V'a çekilir, motor üzerinde ≈ 0,7 V + ... (hız ≈ 0,12 altı)
    expect(rt(lab, 'm1').dcmotor!.speed).toBeLessThan(0.2)
    expect(rt(lab, 'd1').meas!.currentMa).toBeGreaterThan(100)
  })
})

// ---------------------------------------------------------------------------------------------------------------------
// (c) MOSFET anahtarlama (ders 22): kapı 100 Ω ile D6'da, kapı–GND 10 kΩ, S=GND, D=motor eksisi.
// ---------------------------------------------------------------------------------------------------------------------
describe('MOSFET (ders 22)', () => {
  const mos = (pot = 1): Circuit => circuit(
    [part('q1', 'mosfet'), part('m1', 'dcmotor'), part('rg', 'resistor', { ohms: 100 }), part('rp', 'resistor', { ohms: 10_000 }), part('d1', 'diode'), part('pot', 'pot', { position: pot })],
    [['uno.D6', 'rg.1'], ['rg.2', 'q1.G'], ['q1.G', 'rp.1'], ['rp.2', 'uno.GND'], ['q1.S', 'uno.GND2'], ['q1.D', 'm1.M2'], ['m1.M1', 'uno.5V'],
      ['d1.A', 'q1.D'], ['d1.K', 'uno.5V'], ['pot.VCC', 'uno.5V'], ['pot.GND', 'uno.GND3'], ['pot.SIG', 'uno.A0']],
  )

  // Kapı gerilimi = 5·10k/(25+100+10k) = 4,94 V > 2 V -> Rds(on) 0,05 Ω: I = 5/(10 + 0,05 + 0,01) = 0,497 A, hız = 4,97/6 = 0,83.
  it('fan_pot: kapı yüksek -> motor ≈ 0,83 hızla döner (≈ 497 mA, kısa devre uyarısı yok); düşükse durur', () => {
    const lab = createLab(mos(1), FAN_POT_HEX)
    lab.advance(300)
    expect(rt(lab, 'm1').dcmotor!.speed).toBeGreaterThan(0.82)
    expect(rt(lab, 'm1').dcmotor!.speed).toBeLessThan(0.84)
    expect(rt(lab, 'm1').meas!.currentMa).toBeCloseTo(497, -1)
    expect(kinds(lab)).toEqual([])
    lab.setProp('pot', 'position', 0)
    lab.advance(300)
    expect(rt(lab, 'm1').dcmotor!.speed).toBe(0)
  })

  it('eşik: kapı 1,5 V (kapalı) / 2,5 V (açık) ; kapı DC akım çekmez', () => {
    // Kapı doğrudan potansiyometre ucundan sürülür (BLINK hex: pinleri kullanmaz).
    const c = circuit(
      [part('q1', 'mosfet'), part('m1', 'dcmotor'), part('pot', 'pot', { position: 0.3 })],
      [['pot.SIG', 'q1.G'], ['pot.VCC', 'uno.5V'], ['pot.GND', 'uno.GND'], ['q1.S', 'uno.GND2'], ['q1.D', 'm1.M2'], ['m1.M1', 'uno.5V']],
    )
    const lab = createLab(c, BLINK_HEX)
    lab.advance(5)
    expect(rt(lab, 'm1').dcmotor!.speed).toBe(0)
    expect(rt(lab, 'pot').meas!.currentMa).toBeCloseTo(0.5, 2) // 5 V / 10 kΩ: kapı akım çekmez
    lab.setProp('pot', 'position', 0.5) // 2,5 V
    lab.advance(5)
    expect(rt(lab, 'm1').dcmotor!.speed).toBeGreaterThan(0.8)
    lab.setProp('pot', 'position', 0.39) // 1,95 V
    lab.advance(5)
    expect(rt(lab, 'm1').dcmotor!.speed).toBe(0)
    lab.setProp('pot', 'position', 0.41) // 2,05 V
    lab.advance(5)
    expect(rt(lab, 'm1').dcmotor!.speed).toBeGreaterThan(0.8)
  })
})

// ---------------------------------------------------------------------------------------------------------------------
// (d) L293D (ders 23): EN12=D6, IN1=D7, IN2=D5, motor OUT1–OUT2, VCC1=VCC2=5V.
// ---------------------------------------------------------------------------------------------------------------------
const l293 = (opts: { enGnd?: boolean; noVcc2?: boolean; noVcc1?: boolean; pot?: number } = {}): Circuit => circuit(
  [part('u1', 'l293d'), part('m1', 'dcmotor'), part('b1', 'button'), part('b2', 'button'), part('pot', 'pot', { position: opts.pot ?? 1 })],
  [
    [opts.enGnd ? 'uno.GND2' : 'uno.D6', 'u1.EN12'], ['uno.D7', 'u1.IN1'], ['uno.D5', 'u1.IN2'], ['u1.OUT1', 'm1.M1'], ['u1.OUT2', 'm1.M2'],
    ['u1.GND', 'uno.GND'], ...(opts.noVcc1 ? [] : [['u1.VCC1', 'uno.5V'] as [string, string]]), ...(opts.noVcc2 ? [] : [['u1.VCC2', 'uno.5V'] as [string, string]]),
    ['uno.D2', 'b1.A'], ['b1.B', 'uno.GND3'], ['uno.D3', 'b2.A'], ['b2.B', 'uno.GND3'],
    ['pot.VCC', 'uno.5V'], ['pot.GND', 'uno.GND3'], ['pot.SIG', 'uno.A0'],
  ],
)

describe('L293D (ders 23)', () => {
  // OUT yüksek = VCC2 − 1,4 ≈ 3,597 V (5V hattı 0,01 Ω), OUT düşük = 0,2 V (her biri 0,1 Ω).
  // Motor akımı = (3,597 − 0,2)/(10 + 0,2) = 0,333 A; V(M1)−V(M2) = 3,33 V -> tam hız = 3,33/6 = 0,555.
  // motor_yon: ileri(200): doluluk 200/255 = 0,784 -> ortalama hız 0,435.
  it('motor_yon: ileri 2 s (+), dur 1 s, geri 2 s (−), dur 1 s', () => {
    const lab = createLab(l293(), MOTOR_YON_HEX)
    lab.advance(1000)
    const fwd = rt(lab, 'm1').dcmotor!.speed
    expect(fwd).toBeGreaterThan(0.40)
    expect(fwd).toBeLessThan(0.47)
    lab.advance(1500) // t = 2500: dur
    expect(rt(lab, 'm1').dcmotor!.speed).toBe(0)
    lab.advance(1500) // t = 4000: geri
    const back = rt(lab, 'm1').dcmotor!.speed
    expect(back).toBeLessThan(-0.40)
    expect(back).toBeGreaterThan(-0.47)
    expect(Math.abs(back + fwd)).toBeLessThan(0.03) // simetrik
    lab.advance(2000) // t = 6000: dur
    expect(rt(lab, 'm1').dcmotor!.speed).toBe(0)
    expect(kinds(lab)).toEqual([])
  })

  it('motor_buton: butonlar yön, pot hız; iki buton birlikte -> durur', () => {
    const lab = createLab(l293({ pot: 1 }), MOTOR_BUTON_HEX)
    lab.advance(200)
    expect(rt(lab, 'm1').dcmotor!.speed).toBe(0)
    lab.setProp('b1', 'pressed', true)
    lab.advance(200)
    const full = rt(lab, 'm1').dcmotor!.speed
    expect(full).toBeGreaterThan(0.54)
    expect(full).toBeLessThan(0.57)
    expect(rt(lab, 'm1').meas!.vAcross).toBeCloseTo(3.33, 1)
    expect(rt(lab, 'm1').meas!.currentMa).toBeCloseTo(333, -1)
    lab.setProp('b2', 'pressed', true)
    lab.advance(100)
    expect(rt(lab, 'm1').dcmotor!.speed).toBe(0)
    lab.setProp('b1', 'pressed', false)
    lab.advance(200)
    expect(rt(lab, 'm1').dcmotor!.speed).toBeCloseTo(-full, 2)
    lab.setProp('pot', 'position', 0.5)
    lab.advance(300)
    expect(Math.abs(rt(lab, 'm1').dcmotor!.speed)).toBeGreaterThan(full * 0.5 - 0.04)
    expect(Math.abs(rt(lab, 'm1').dcmotor!.speed)).toBeLessThan(full * 0.5 + 0.04)
  })

  it('EN=LOW -> çıkış yüksek empedans, motor durur', () => {
    const lab = createLab(l293({ enGnd: true }), MOTOR_YON_HEX)
    for (let i = 0; i < 6; i++) { lab.advance(500); expect(rt(lab, 'm1').dcmotor!.speed).toBe(0) }
  })

  it('VCC2 (motor beslemesi) ya da VCC1 yoksa: uyarı + motor durur', () => {
    for (const o of [{ noVcc2: true }, { noVcc1: true }]) {
      const c = l293(o)
      expect(analyzeCircuit(c).warnings.map((w) => w.kind)).toContain('unpowered')
      const lab = createLab(c, MOTOR_YON_HEX)
      lab.advance(1000)
      expect(rt(lab, 'm1').dcmotor!.speed).toBe(0)
      expect(kinds(lab)).toContain('unpowered')
    }
  })
})

// ---------------------------------------------------------------------------------------------------------------------
// (e) Röle modülü (ders 24)
// ---------------------------------------------------------------------------------------------------------------------
describe('Röle (ders 24)', () => {
  const relayCircuit = (o: { trigger?: 'high' | 'low'; load?: 'NO' | 'NC'; noVcc?: boolean } = {}): Circuit => circuit(
    [part('k1', 'relay', { trigger: o.trigger ?? 'low' }), part('r1', 'resistor', { ohms: 330 }), part('led1', 'led'), part('b1', 'button'), part('pot', 'pot', { position: 0.7 })],
    [
      ...(o.noVcc ? [] : [['k1.VCC', 'uno.5V'] as [string, string]]), ['k1.GND', 'uno.GND'], ['k1.IN', 'uno.D7'],
      ['k1.COM', 'uno.5V'], [`k1.${o.load ?? 'NO'}`, 'r1.1'], ['r1.2', 'led1.A'], ['led1.K', 'uno.GND2'],
      ['uno.D2', 'b1.A'], ['b1.B', 'uno.GND3'],
      ['pot.VCC', 'uno.5V'], ['pot.GND', 'uno.GND3'], ['pot.SIG', 'uno.A0'],
    ],
  )
  // LED akımı = (5 − 1,9)/(330 + 5 + 0,1 + 0,01) = 9,25 mA
  const LED_MA = 3.1 / (330 + 5 + 0.1 + 0.01) * 1000
  const press = (lab: LabApi): void => { lab.setProp('b1', 'pressed', true); lab.advance(150); lab.setProp('b1', 'pressed', false); lab.advance(150) }

  it('aktif-LOW modül: açılışta bırakık (LED söner), basış LOW verir -> COM–NO kapanır, LED ≈ 9,25 mA', () => {
    const lab = createLab(relayCircuit(), ROLE_BUTON_HEX)
    lab.advance(100)
    expect(rt(lab, 'k1').relay!.energized).toBe(false)
    expect(rt(lab, 'led1').led!.on).toBe(false)
    press(lab)
    expect(rt(lab, 'k1').relay!.energized).toBe(true)
    expect(rt(lab, 'led1').led!.currentMa).toBeCloseTo(LED_MA, 1)
    expect(kinds(lab)).toEqual([])
    press(lab)
    expect(rt(lab, 'k1').relay!.energized).toBe(false)
    expect(rt(lab, 'led1').led!.on).toBe(false)
  })

  it('aktif-HIGH modül aynı sketch ile: açılışta çekili (HIGH), basınca bırakır', () => {
    const lab = createLab(relayCircuit({ trigger: 'high' }), ROLE_BUTON_HEX)
    lab.advance(100)
    expect(rt(lab, 'k1').relay!.energized).toBe(true)
    expect(rt(lab, 'led1').led!.on).toBe(true)
    press(lab)
    expect(rt(lab, 'k1').relay!.energized).toBe(false)
    expect(rt(lab, 'led1').led!.on).toBe(false)
  })

  it('NC ucundaki yük röle bırakıkken yanar, çekince söner', () => {
    const lab = createLab(relayCircuit({ load: 'NC' }), ROLE_BUTON_HEX)
    lab.advance(100)
    expect(rt(lab, 'led1').led!.currentMa).toBeCloseTo(LED_MA, 1)
    press(lab)
    expect(rt(lab, 'k1').relay!.energized).toBe(true)
    expect(rt(lab, 'led1').led!.on).toBe(false)
  })

  it('beslenmemiş röle: unpowered uyarısı, hiçbir zaman çekmez', () => {
    const c = relayCircuit({ noVcc: true })
    expect(analyzeCircuit(c).warnings.map((w) => w.kind)).toContain('unpowered')
    const lab = createLab(c, ROLE_BUTON_HEX)
    lab.advance(100)
    press(lab)
    expect(rt(lab, 'k1').relay!.energized).toBe(false)
    expect(rt(lab, 'led1').led!.on).toBe(false)
    expect(kinds(lab)).toContain('unpowered')
  })

  it('role_esik: histerezis (açma > 600, kapama < 500)', () => {
    const lab = createLab(relayCircuit(), ROLE_ESIK_HEX)
    const at = (pos: number): boolean => { lab.setProp('pot', 'position', pos); lab.advance(200); return rt(lab, 'k1').relay!.energized }
    expect(at(0.5)).toBe(false) // 512
    expect(at(0.7)).toBe(true) // 716 > 600
    expect(at(0.55)).toBe(true) // 563: 500-600 arası olduğu gibi kalır
    expect(at(0.4)).toBe(false) // 409 < 500
    expect(at(0.55)).toBe(false) // 563: hâlâ bırakık
  })
})

// ---------------------------------------------------------------------------------------------------------------------
// (f)(g) 74HC595 + 7-segment (ders 31): D4 = DS, D5 = ST_CP (mandal), D6 = SH_CP (saat)
// ---------------------------------------------------------------------------------------------------------------------
const QS = ['QA', 'QB', 'QC', 'QD', 'QE', 'QF', 'QG', 'QH'] as const
const SEGS = ['a', 'b', 'c', 'd', 'e', 'f', 'g'] as const
const RAKAM = [0x3F, 0x06, 0x5B, 0x4F, 0x66, 0x6D, 0x7D, 0x07, 0x7F, 0x6F]
const bitsOf = (b: number): boolean[] => Array.from({ length: 8 }, (_, i) => !!(b & (1 << i)))

const segCircuit = (o: { common?: 'cathode' | 'anode'; oe?: 'GND' | '5V' | 'none'; srclr?: '5V' | 'GND' | 'none'; noVcc?: boolean; resistors?: boolean } = {}): Circuit => {
  const { common = 'cathode', oe = 'GND', srclr = '5V', noVcc = false, resistors = true } = o
  const parts = [part('u1', 'sr595'), part('seg', 'sevenseg', { common }), ...(resistors ? SEGS.map((s) => part(`r${s}`, 'resistor', { ohms: 330 })) : [])]
  const w: Array<[string, string]> = [
    ['u1.GND', 'uno.GND'], ['u1.SER', 'uno.D4'], ['u1.RCLK', 'uno.D5'], ['u1.SRCLK', 'uno.D6'],
    ['seg.COM', common === 'cathode' ? 'uno.GND2' : 'uno.5V'],
  ]
  if (!noVcc) w.push(['u1.VCC', 'uno.5V'])
  if (oe !== 'none') w.push(['u1.OE', oe === 'GND' ? 'uno.GND3' : 'uno.5V'])
  if (srclr !== 'none') w.push(['u1.SRCLR', srclr === '5V' ? 'uno.5V' : 'uno.GND3'])
  SEGS.forEach((s, i) => {
    if (resistors) w.push([`u1.${QS[i]}`, `r${s}.1`], [`r${s}.2`, `seg.${s}`])
    else w.push([`u1.${QS[i]}`, `seg.${s}`])
  })
  return circuit(parts, w)
}
const segs = (lab: LabApi): number[] => SEGS.map((s) => rt(lab, 'seg').sevenseg!.segments[s])

describe('74HC595 + 7-segment (ders 31)', () => {
  // Segment akımı = (VCC − 1,9)/(50 + 330 + 5) = (4,99 − 1,9)/385 = 8,0 mA -> parlaklık 0,80
  it('yedi_segment_sayac: 0..9 rakamları için beklenen segmentler yanar', () => {
    const lab = createLab(segCircuit(), YEDI_SEGMENT_SAYAC_HEX)
    for (let d = 0; d < 10; d++) {
      lab.advance(d === 0 ? 500 : 1000) // her rakam 1 s; örnek her saniyenin ortası
      const b = segs(lab)
      SEGS.forEach((_, i) => {
        if (RAKAM[d] & (1 << i)) { expect(b[i], `rakam ${d} segment ${SEGS[i]}`).toBeGreaterThan(0.75); expect(b[i]).toBeLessThan(0.85) } else expect(b[i], `rakam ${d} segment ${SEGS[i]}`).toBe(0)
      })
      expect(rt(lab, 'seg').sevenseg!.segments.dp).toBe(0)
      expect(rt(lab, 'u1').sr595!.outputs).toEqual(bitsOf(RAKAM[d]))
    }
    expect(kinds(lab)).toEqual([])
  })

  it('ortak anot: aynı sketch ile desenler tersine görünür', () => {
    const lab = createLab(segCircuit({ common: 'anode' }), YEDI_SEGMENT_SAYAC_HEX)
    lab.advance(1500) // rakam 1: yalnız b, c "yanık değil" -> diğerleri yanık
    const b = segs(lab)
    SEGS.forEach((_, i) => { if (RAKAM[1] & (1 << i)) expect(b[i]).toBe(0); else expect(b[i]).toBeGreaterThan(0.7) })
  })

  it('led_seridi: tek LED soldan sağa kayar (QA→QH)', () => {
    const lab = createLab(segCircuit(), LED_SERIDI_HEX)
    for (let i = 0; i < 8; i++) {
      lab.advance(i === 0 ? 100 : 200)
      expect(rt(lab, 'u1').sr595!.outputs, `adım ${i}`).toEqual(bitsOf(1 << i))
    }
  })

  it('bit sırası: MSBFIRST 0x01 -> QA, LSBFIRST 0x01 -> QH; mandal olmadan çıkış değişmez', () => {
    const run = (hex: string): boolean[] => { const lab = createLab(segCircuit(), hex); lab.advance(20); return rt(lab, 'u1').sr595!.outputs }
    expect(run(SR_MSB01_HEX)).toEqual([true, false, false, false, false, false, false, false])
    expect(run(SR_LSB01_HEX)).toEqual([false, false, false, false, false, false, false, true])
    expect(run(SR_NOLATCH_HEX)).toEqual(new Array(8).fill(false))
  })

  it('OE: 5 V ya da bağlantısız -> çıkışlar kapalı (yüksek empedans); bağlantısız OE uyarı verir', () => {
    for (const oe of ['5V', 'none'] as const) {
      const lab = createLab(segCircuit({ oe }), YEDI_SEGMENT_SAYAC_HEX)
      lab.advance(1500)
      expect(segs(lab).every((x) => x === 0)).toBe(true)
      expect(rt(lab, 'u1').sr595!.outputs.every((x) => !x)).toBe(true)
    }
    const c = segCircuit({ oe: 'none' })
    const w = analyzeCircuit(c).warnings.filter((x) => x.kind === 'floating-input')
    expect(w.map((x) => x.partId)).toEqual(['u1'])
    expect(w[0].message).toMatch(/OE/)
    const lab = createLab(c, YEDI_SEGMENT_SAYAC_HEX)
    lab.advance(100)
    expect(kinds(lab)).toContain('floating-input')
  })

  it('SRCLR: GND ya da bağlantısız -> kaydırma yazmacı temizlenir, çıkış hep 0; bağlantısız olan uyarı verir', () => {
    for (const srclr of ['GND', 'none'] as const) {
      const lab = createLab(segCircuit({ srclr }), YEDI_SEGMENT_SAYAC_HEX)
      lab.advance(1500)
      expect(rt(lab, 'u1').sr595!.outputs.every((x) => !x)).toBe(true)
      expect(segs(lab).every((x) => x === 0)).toBe(true)
    }
    const lab = createLab(segCircuit({ srclr: 'none' }), YEDI_SEGMENT_SAYAC_HEX)
    lab.advance(50)
    expect(lab.state.warnings.some((x) => x.kind === 'floating-input' && /SRCLR/.test(x.message))).toBe(true)
  })

  it('beslenmemiş 74HC595: unpowered uyarısı, çıkış yok', () => {
    const c = segCircuit({ noVcc: true })
    expect(analyzeCircuit(c).warnings.map((w) => w.kind)).toContain('unpowered')
    const lab = createLab(c, YEDI_SEGMENT_SAYAC_HEX)
    lab.advance(1500)
    expect(rt(lab, 'u1').sr595!.outputs.every((x) => !x)).toBe(true)
    expect(kinds(lab)).toContain('unpowered')
  })

  it('dirençsiz segment: led-no-resistor uyarısı, segment yanar (595 çıkışı 50 Ω)', () => {
    const c = segCircuit({ resistors: false })
    expect(analyzeCircuit(c).warnings.map((w) => w.kind)).not.toContain('floating-input')
    const lab = createLab(c, YEDI_SEGMENT_SAYAC_HEX)
    lab.advance(500)
    expect(kinds(lab)).toEqual(expect.arrayContaining(['led-no-resistor', 'led-burnt']))
  })

  it('zincir: ikinci 595 SER = ilkinin QH_ ucu; önceki bayt ikinci çipe taşınır', () => {
    const c = segCircuit()
    c.parts.push(part('u2', 'sr595'))
    c.wires.push(wire('u2.VCC', 'uno.5V'), wire('u2.GND', 'uno.GND'), wire('u2.OE', 'uno.GND3'), wire('u2.SRCLR', 'uno.5V'),
      wire('u2.SRCLK', 'uno.D6'), wire('u2.RCLK', 'uno.D5'), wire('u2.SER', 'u1.QH_'))
    const lab = createLab(c, YEDI_SEGMENT_SAYAC_HEX)
    lab.advance(1500) // ikinci rakam: u1 = 0x06, u2 = 0x3F
    expect(rt(lab, 'u1').sr595!.outputs).toEqual(bitsOf(0x06))
    expect(rt(lab, 'u2').sr595!.outputs).toEqual(bitsOf(0x3F))
    lab.advance(1000)
    expect(rt(lab, 'u1').sr595!.outputs).toEqual(bitsOf(0x5B))
    expect(rt(lab, 'u2').sr595!.outputs).toEqual(bitsOf(0x06))
  })
})

// ---------------------------------------------------------------------------------------------------------------------
// (h) LCD paralel (ders 32): RS=D12, E=D11, D4..D7 = D5, D4, D3, D2
// ---------------------------------------------------------------------------------------------------------------------
const lcdCircuit = (o: { v0?: number | 'none'; noVdd?: boolean; noRw?: boolean; swap?: boolean; noBl?: boolean } = {}): Circuit => {
  const pins: Array<[string, string]> = [['RS', 'uno.D12'], ['E', 'uno.D11'], ['D4', o.swap ? 'uno.D4' : 'uno.D5'], ['D5', o.swap ? 'uno.D5' : 'uno.D4'], ['D6', 'uno.D3'], ['D7', 'uno.D2']]
  const v0 = o.v0 ?? 0.2
  return circuit(
    [part('lcd', 'lcd1602'), part('pot', 'pot', { position: v0 === 'none' ? 0 : v0 }), part('rbl', 'resistor', { ohms: 220 })],
    [
      ['lcd.VSS', 'uno.GND'], ...(o.noVdd ? [] : [['lcd.VDD', 'uno.5V'] as [string, string]]), ...(o.noRw ? [] : [['lcd.RW', 'uno.GND2'] as [string, string]]),
      ['lcd.K', 'uno.GND3'], ...(o.noBl ? [] : [['lcd.A', 'rbl.1'], ['rbl.2', 'uno.5V']] as Array<[string, string]>),
      ...(v0 === 'none' ? [] : [['lcd.V0', 'pot.SIG'] as [string, string]]), ['pot.VCC', 'uno.5V'], ['pot.GND', 'uno.GND2'],
      ...pins.map(([p, u]) => [`lcd.${p}`, u] as [string, string]),
    ],
  )
}
const pad = (s: string): string => s.padEnd(16, ' ')

describe('LCD 16x2 paralel (ders 32)', () => {
  it('lcd_merhaba: metin görünür, saniye sayacı güncellenir, arka ışık yanar', () => {
    const lab = createLab(lcdCircuit(), LCD_MERHABA_HEX)
    lab.advance(3200)
    const l = rt(lab, 'lcd').lcd!
    expect(l.lines[0]).toBe(pad('Merhaba!'))
    expect(l.lines[1]).toBe(pad('Saniye: 3'))
    expect(l.backlight).toBe(true)
    expect(l.poweredOn).toBe(true)
    lab.advance(7000)
    expect(rt(lab, 'lcd').lcd!.lines[1]).toBe(pad('Saniye: 10'))
    expect(kinds(lab)).toEqual([])
  })

  // DERS HATASI (içerik): lcd_derece, createChar'dan sonra setCursor/clear çağırmadan print eder. HD44780'de createChar
  // CGRAM adresini kurar; sonraki veri yazmaları DDRAM'e değil CGRAM'e gider, yani gerçek ekranda da yazı görünmez.
  it('lcd_derece: createChar sonrası adres DDRAM\'e dönmediği için ekran boş (gerçek HD44780 davranışı)', () => {
    const lab = createLab(lcdCircuit(), LCD_DERECE_HEX)
    lab.advance(300)
    expect(rt(lab, 'lcd').lcd!.lines).toEqual([pad(''), pad('')])
  })

  it('V0 yüksek (> 1,6 V) -> ekran boş; V0 bağlı değil -> görünür', () => {
    // pot SIG konumu = V0 gerilimi/5: 0,3 -> 1,5 V (görünür), 0,34 -> 1,7 V (boş)
    const lab = createLab(lcdCircuit({ v0: 0.3 }), LCD_MERHABA_HEX)
    lab.advance(300)
    expect(rt(lab, 'lcd').lcd!.lines[0]).toBe(pad('Merhaba!'))
    lab.setProp('pot', 'position', 0.34)
    lab.advance(5)
    expect(rt(lab, 'lcd').lcd!.lines).toEqual([pad(''), pad('')])
    expect(rt(lab, 'lcd').lcd!.backlight).toBe(true)
    expect(rt(lab, 'lcd').lcd!.poweredOn).toBe(true)
    lab.setProp('pot', 'position', 0.1)
    lab.advance(300) // sayaç yeniden yazılır; ilk satır sabit kaldığı için hâlâ okunur
    expect(rt(lab, 'lcd').lcd!.lines[0]).toBe(pad('Merhaba!'))
    const nov0 = createLab(lcdCircuit({ v0: 'none' }), LCD_MERHABA_HEX)
    nov0.advance(300)
    expect(rt(nov0, 'lcd').lcd!.lines[0]).toBe(pad('Merhaba!'))
  })

  it('VDD yok / RW toprakta değil -> boş; VDD yoksa unpowered uyarısı', () => {
    const nv = lcdCircuit({ noVdd: true })
    expect(analyzeCircuit(nv).warnings.map((w) => w.kind)).toContain('unpowered')
    const lab = createLab(nv, LCD_MERHABA_HEX)
    lab.advance(300)
    expect(rt(lab, 'lcd').lcd!.lines).toEqual([pad(''), pad('')])
    expect(rt(lab, 'lcd').lcd!.poweredOn).toBe(false)
    const nrw = createLab(lcdCircuit({ noRw: true }), LCD_MERHABA_HEX)
    nrw.advance(300)
    expect(rt(nrw, 'lcd').lcd!.lines).toEqual([pad(''), pad('')])
    expect(rt(nrw, 'lcd').lcd!.poweredOn).toBe(true)
  })

  it('arka ışık: A bağlı değilse kapalı; D4/D5 ters bağlıysa metin bozuk', () => {
    const lab = createLab(lcdCircuit({ noBl: true }), LCD_MERHABA_HEX)
    lab.advance(300)
    expect(rt(lab, 'lcd').lcd!.backlight).toBe(false)
    expect(rt(lab, 'lcd').lcd!.lines[0]).toBe(pad('Merhaba!'))
    const sw = createLab(lcdCircuit({ swap: true }), LCD_MERHABA_HEX)
    sw.advance(300)
    expect(rt(sw, 'lcd').lcd!.lines[0]).not.toBe(pad('Merhaba!'))
  })
})

// ---------------------------------------------------------------------------------------------------------------------
// (i) I2C LCD (ders 33): SDA=A4, SCL=A5
// ---------------------------------------------------------------------------------------------------------------------
const i2cCircuit = (o: { address?: string; noSda?: boolean; noScl?: boolean; noVcc?: boolean; swap?: boolean } = {}): Circuit => circuit(
  [part('lcd', 'lcdI2c', { address: o.address ?? '0x27' })],
  [
    ['lcd.GND', 'uno.GND'], ...(o.noVcc ? [] : [['lcd.VCC', 'uno.5V'] as [string, string]]),
    ...(o.noSda ? [] : [['lcd.SDA', o.swap ? 'uno.A5' : 'uno.A4'] as [string, string]]), ...(o.noScl ? [] : [['lcd.SCL', o.swap ? 'uno.A4' : 'uno.A5'] as [string, string]]),
  ],
)

describe('I2C LCD (ders 33)', () => {
  it('i2c_lcd: 0x27 adresinde metin görünür', () => {
    const lab = createLab(i2cCircuit(), I2C_LCD_HEX)
    lab.advance(2500) // LiquidCrystal_I2C::init() içinde delay(1000) vardır
    const l = rt(lab, 'lcd').lcd!
    expect(l.lines).toEqual([pad('I2C ile merhaba'), pad('Adres: 0x27')])
    expect(l.backlight).toBe(true)
    expect(l.poweredOn).toBe(true)
    expect(kinds(lab)).toEqual([])
  })

  it('SDA/SCL bağlı değil, ters, VCC yok ya da adres uyuşmuyor -> görünmez', () => {
    for (const [name, o] of [['sda yok', { noSda: true }], ['scl yok', { noScl: true }], ['ters', { swap: true }], ['vcc yok', { noVcc: true }], ['adres 0x3F', { address: '0x3F' }]] as const) {
      const lab = createLab(i2cCircuit(o), I2C_LCD_HEX)
      lab.advance(2500)
      expect(rt(lab, 'lcd').lcd!.lines, name).toEqual([pad(''), pad('')])
    }
    expect(analyzeCircuit(i2cCircuit({ noVcc: true })).warnings.map((w) => w.kind)).toContain('unpowered')
  })

  it('i2c_tarama: bağlıyken adresi bulur; bağlı değilken bulamaz', () => {
    const scan = (c: Circuit): string[] => { const lab = createLab(c, I2C_TARAMA_HEX); lab.advance(1500); return lines(lab.state.serial) }
    expect(scan(i2cCircuit())).toEqual(['I2C taraniyor...', 'Cihaz bulundu: 0x27', 'Toplam: 1'])
    expect(scan(i2cCircuit({ address: '0x3F' }))).toEqual(['I2C taraniyor...', 'Cihaz bulundu: 0x3F', 'Toplam: 1'])
    expect(scan(i2cCircuit({ noSda: true }))).toEqual(['I2C taraniyor...', 'Toplam: 0'])
    expect(scan(i2cCircuit({ noVcc: true }))).toEqual(['I2C taraniyor...', 'Toplam: 0'])
    expect(scan(circuit([], []))).toEqual(['I2C taraniyor...', 'Toplam: 0'])
  })
})

// ---------------------------------------------------------------------------------------------------------------------
// Bitirme projesi (ders 35): röle + LED + I2C LCD + NTC birlikte çalışır
// ---------------------------------------------------------------------------------------------------------------------
describe('termostat (ders 35)', () => {
  it('soğukken ısıtır (röle çeker, LED yanar), sıcakken keser; LCD durum gösterir', () => {
    const c = circuit(
      [part('k1', 'relay', { trigger: 'high' }), part('rl', 'resistor', { ohms: 330 }), part('led1', 'led'), part('lcd', 'lcdI2c'),
        part('r10', 'resistor', { ohms: 10_000 }), part('ntc', 'ntc', { tempC: 15 }), part('b1', 'button'), part('b2', 'button')],
      [
        ['k1.VCC', 'uno.5V'], ['k1.GND', 'uno.GND'], ['k1.IN', 'uno.D7'], ['k1.COM', 'uno.5V'], ['k1.NO', 'rl.1'], ['rl.2', 'led1.A'], ['led1.K', 'uno.GND2'],
        ['lcd.GND', 'uno.GND'], ['lcd.VCC', 'uno.5V'], ['lcd.SDA', 'uno.A4'], ['lcd.SCL', 'uno.A5'],
        ['uno.5V', 'r10.1'], ['r10.2', 'uno.A2'], ['uno.A2', 'ntc.1'], ['ntc.2', 'uno.GND3'],
        ['uno.D2', 'b1.A'], ['b1.B', 'uno.GND'], ['uno.D3', 'b2.A'], ['b2.B', 'uno.GND'],
      ],
    )
    const lab = createLab(c, TERMOSTAT_HEX)
    lab.advance(1500) // 15 °C < hedef 22 − 0,5
    expect(rt(lab, 'k1').relay!.energized).toBe(true)
    expect(rt(lab, 'led1').led!.on).toBe(true)
    expect(rt(lab, 'lcd').lcd!.lines[1]).toBe(pad('Hedef:22C ISIT'))
    lab.setProp('ntc', 'tempC', 30)
    lab.advance(1500)
    expect(rt(lab, 'k1').relay!.energized).toBe(false)
    expect(rt(lab, 'led1').led!.on).toBe(false)
    expect(rt(lab, 'lcd').lcd!.lines[1].startsWith('Hedef:22C KAPALI')).toBe(true)
    expect(rt(lab, 'lcd').lcd!.lines[0].startsWith('Su an: 30.')).toBe(true)
    expect(kinds(lab)).toEqual([])
  })
})

// ---------------------------------------------------------------------------------------------------------------------
// (j) Sanal ölçüm tablosu: vAcross = V(pin1) − V(pin2) (V), currentMa = pin1 → pin2 (mA)
// ---------------------------------------------------------------------------------------------------------------------
describe('sanal ölçüm (meas)', () => {
  const near = (x: number, y: number, tol: number, what: string): void => { expect(Math.abs(x - y), `${what}: ${x} ≠ ${y}`).toBeLessThanOrEqual(tol) }

  it('330 Ω + LED (D13 HIGH): I = (5 − 1,9)/(25 + 330 + 5) = 8,61 mA; direnç 2,84 V; LED 1,94 V; led.currentMa ile tutarlı', () => {
    const c = circuit([part('r1', 'resistor', { ohms: 330 }), part('led1', 'led')], [['uno.D13', 'r1.1'], ['r1.2', 'led1.A'], ['led1.K', 'uno.GND']])
    const lab = createLab(c, BLINK_HEX)
    lab.advance(250) // D13 HIGH
    const i = 3.1 / 360 * 1000
    near(rt(lab, 'r1').meas!.currentMa, i, 0.01, 'direnç akımı')
    near(rt(lab, 'r1').meas!.vAcross, (i / 1000) * 330, 0.01, 'direnç gerilimi')
    near(rt(lab, 'r1').meas!.vAcross, 3.1, 0.3, 'direnç ≈ 3,1 V civarı')
    near(rt(lab, 'led1').meas!.currentMa, i, 0.01, 'LED akımı')
    near(rt(lab, 'led1').meas!.vAcross, 1.9 + (i / 1000) * 5, 0.01, 'LED gerilimi')
    expect(rt(lab, 'led1').meas!.currentMa).toBe(rt(lab, 'led1').led!.currentMa)
    lab.advance(500) // D13 LOW: hepsi 0
    expect(rt(lab, 'r1').meas!.currentMa).toBeCloseTo(0, 6)
    expect(rt(lab, 'led1').meas!.currentMa).toBe(0)
  })

  it('PWM: ölçüm ortalamadır (doluluk × tam değer)', () => {
    // fan_pot, pot 0,5: D6 %50 -> LED akımı ortalama ≈ yarısı
    const c = circuit([part('r1', 'resistor', { ohms: 330 }), part('led1', 'led'), part('pot', 'pot', { position: 0.5 })],
      [['uno.D6', 'r1.1'], ['r1.2', 'led1.A'], ['led1.K', 'uno.GND'], ['pot.VCC', 'uno.5V'], ['pot.GND', 'uno.GND2'], ['pot.SIG', 'uno.A0']])
    const lab = createLab(c, FAN_POT_HEX)
    lab.advance(400)
    near(rt(lab, 'r1').meas!.currentMa, 8.611 * 0.502, 0.4, 'PWM ortalama akım')
    expect(rt(lab, 'led1').meas!.currentMa).toBe(rt(lab, 'led1').led!.currentMa)
  })

  it('diyot: ileri 0,7 V + 1 Ω; ters yönde açık devre (akım 0, gerilim −5 V)', () => {
    const fwd = circuit([part('r1', 'resistor'), part('d1', 'diode')], [['uno.D13', 'r1.1'], ['r1.2', 'd1.A'], ['d1.K', 'uno.GND']])
    const lab = createLab(fwd, BLINK_HEX)
    lab.advance(250)
    const i = (5 - 0.7) / (25 + 330 + 1)
    near(rt(lab, 'd1').meas!.currentMa, i * 1000, 0.01, 'diyot akımı')
    near(rt(lab, 'd1').meas!.vAcross, 0.7 + i * 1, 0.005, 'diyot gerilimi')
    const rev = circuit([part('r1', 'resistor'), part('d1', 'diode')], [['uno.D13', 'r1.1'], ['r1.2', 'd1.K'], ['d1.A', 'uno.GND']])
    const lr = createLab(rev, BLINK_HEX)
    lr.advance(250)
    near(rt(lr, 'd1').meas!.currentMa, 0, 1e-6, 'ters akım')
    near(rt(lr, 'd1').meas!.vAcross, -5, 0.01, 'ters gerilim (A−K)')
  })

  it('buton (INPUT_PULLUP): açıkken 5 V / 0 mA, basılıyken ≈ 0 V / 0,143 mA', () => {
    const c = circuit([part('b1', 'button')], [['uno.D2', 'b1.A'], ['b1.B', 'uno.GND']])
    const lab = createLab(c, BLINK_HEX) // D2 giriş: INPUT (pull-up yok) -> yüzen; pull-up için ders sketch'i
    void lab
    const lab2 = createLab(c, ROLE_BUTON_HEX) // role_buton D2'yi INPUT_PULLUP yapar
    lab2.advance(50)
    near(rt(lab2, 'b1').meas!.vAcross, 5, 0.01, 'açık buton')
    near(rt(lab2, 'b1').meas!.currentMa, 0, 1e-6, 'açık buton akımı')
    lab2.setProp('b1', 'pressed', true)
    lab2.advance(10)
    near(rt(lab2, 'b1').meas!.currentMa, 5 / 35_000 * 1000, 0.002, 'basılı buton akımı')
    near(rt(lab2, 'b1').meas!.vAcross, 0, 0.001, 'basılı buton gerilimi')
  })

  it('potansiyometre (VCC–SIG kolu), NTC ve LDR: bölücü değerleri', () => {
    const c = circuit(
      [part('pot', 'pot', { position: 0.25, ohms: 10_000 }), part('r1', 'resistor', { ohms: 10_000 }), part('ntc', 'ntc', { tempC: 25 }), part('ldr', 'ldr', { light: 0 }), part('r2', 'resistor', { ohms: 10_000 })],
      [['pot.VCC', 'uno.5V'], ['pot.GND', 'uno.GND'], ['pot.SIG', 'uno.A0'],
        ['uno.5V', 'r1.1'], ['r1.2', 'ntc.1'], ['ntc.1', 'uno.A2'], ['ntc.2', 'uno.GND2'],
        ['uno.5V', 'ldr.1'], ['ldr.2', 'r2.1'], ['r2.1', 'uno.A1'], ['r2.2', 'uno.GND3']],
    )
    const lab = createLab(c, BLINK_HEX)
    lab.advance(5)
    // pot: VCC–SIG kolu = 0,75 × 10 kΩ = 7,5 kΩ; SIG–GND 2,5 kΩ: akım 5/10k = 0,5 mA, V(VCC−SIG) = 3,75 V
    near(rt(lab, 'pot').meas!.currentMa, 0.5, 0.001, 'pot akımı')
    near(rt(lab, 'pot').meas!.vAcross, 3.75, 0.01, 'pot VCC–SIG')
    // NTC 25 °C = 10 kΩ, üstte 10 kΩ: yarı yarıya, akım 0,25 mA, NTC (pin1 = A2 tarafı) 2,5 V
    near(rt(lab, 'ntc').meas!.vAcross, 2.5, 0.01, 'NTC gerilimi')
    near(rt(lab, 'ntc').meas!.currentMa, 0.25, 0.001, 'NTC akımı')
    near(rt(lab, 'r1').meas!.vAcross, 2.5, 0.01, 'üst direnç gerilimi')
    // LDR karanlık 1 MΩ + 10 kΩ: I = 5/1,01 MΩ = 4,95 µA; LDR üstünde 4,95 V
    near(rt(lab, 'ldr').meas!.currentMa, 5 / 1_010_000 * 1000, 0.0005, 'LDR akımı')
    near(rt(lab, 'ldr').meas!.vAcross, 5 * 1e6 / 1_010_000, 0.01, 'LDR gerilimi')
  })

  it('buzzer (+→−) ve DC motor (M1→M2)', () => {
    const c = circuit([part('bz', 'buzzer', { kind: 'active' }), part('r1', 'resistor', { ohms: 330 })], [['uno.D13', 'r1.1'], ['r1.2', 'bz.+'], ['bz.-', 'uno.GND']])
    const lab = createLab(c, BLINK_HEX)
    lab.advance(250)
    const i = 5 / (25 + 330 + 100)
    near(rt(lab, 'bz').meas!.currentMa, i * 1000, 0.01, 'buzzer akımı')
    near(rt(lab, 'bz').meas!.vAcross, i * 100, 0.005, 'buzzer gerilimi')
    // motor yönü: M1 yüksek -> pozitif, ters bağlanınca negatif
    const m = (rev: boolean): LabApi => {
      const cc = circuit([part('m1', 'dcmotor'), part('r1', 'resistor', { ohms: 100 })], [['uno.D13', 'r1.1'], ['r1.2', rev ? 'm1.M2' : 'm1.M1'], [rev ? 'm1.M1' : 'm1.M2', 'uno.GND']])
      const l = createLab(cc, BLINK_HEX); l.advance(250); return l
    }
    const fi = 5 / (25 + 100 + MODEL.motorOhms)
    near(rt(m(false), 'm1').meas!.currentMa, fi * 1000, 0.01, 'motor akımı')
    near(rt(m(false), 'm1').meas!.vAcross, fi * MODEL.motorOhms, 0.01, 'motor gerilimi')
    expect(rt(m(true), 'm1').meas!.currentMa).toBeLessThan(0)
    expect(rt(m(true), 'm1').meas!.vAcross).toBeLessThan(0)
    expect(rt(m(true), 'm1').dcmotor!.speed).toBeLessThan(0)
  })
})
