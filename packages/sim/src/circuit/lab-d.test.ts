// Aşama D (Hyvex elektronik serisi, büyükler için): MQ ailesi, Sharp IR, köprü sürücüler (L298N, TB6612, DRV8833, BTS7960, MD10C),
// TMC2209 step sürücü, ESC + BLDC ve HC-SR04 ailesi modelleri. Hex'ler web'deki başlangıç sketch'lerinin derlenmiş halidir (lab-fixtures-d.ts).
import { describe, expect, it, vi } from 'vitest'
import { analyzeCircuit, createLab } from '../index.js'
import type { Circuit, LabApi, PartInstance, PartType, PropValue, Wire } from '../index.js'
import { PINS, PROPS } from './contract.js'
import {
  ESC_BLDC_HEX, GAZ_MQ_HEX, KOPRU_EN_IN_HEX, KOPRU_IKI_PWM_HEX, KOPRU_PWM_DIR_HEX, MESAFE_CM_HEX, SERVO_TARAMA_HEX, SHARP_IR_HEX, STEP_MOTOR_HEX,
} from './lab-fixtures-d.js'

vi.setConfig({ testTimeout: 180_000 })

const part = (id: string, type: PartType, props: Record<string, PropValue> = {}): PartInstance => ({ id, type, x: 0, y: 0, rotation: 0, props })
const ref = (s: string): { part: string; pin: string } => { const i = s.indexOf('.'); return { part: s.slice(0, i), pin: s.slice(i + 1) } }
const wire = (a: string, b: string): Wire => ({ id: `${a}~${b}`, a: ref(a), b: ref(b) })
const circuit = (parts: PartInstance[], wires: Array<[string, string]>): Circuit => ({ parts: [part('uno', 'uno'), ...parts], wires: wires.map(([a, b]) => wire(a, b)) })
const rt = (lab: LabApi, id: string) => lab.state.parts[id]
const lines = (s: string): string[] => s.trim().split(/\r?\n/).filter(Boolean)
const last = (lab: LabApi): string => lines(lab.state.serial).at(-1) ?? ''
const without = (c: Circuit, s: string): Circuit => ({ ...c, wires: c.wires.filter((w) => `${w.a.part}.${w.a.pin}` !== s && `${w.b.part}.${w.b.pin}` !== s) })
const numAfter = (line: string, key: string): number => Number(new RegExp(`${key}=(-?[\\d.]+)`).exec(line)?.[1] ?? NaN)

describe('sözleşme: Aşama D parçaları', () => {
  const D: PartType[] = ['mq3', 'mq4', 'mq7', 'mq135', 'sharpir', 'l298n', 'tb6612', 'drv8833', 'bts7960', 'md10c', 'stepper', 'esc']
  it('pinler benzersiz, özellik anahtarları benzersiz; aile model seçimleri var', () => {
    for (const t of D) {
      expect(PINS[t].length).toBeGreaterThan(1)
      expect(new Set(PINS[t]).size).toBe(PINS[t].length)
      const keys = PROPS[t].map((p) => p.key)
      expect(new Set(keys).size).toBe(keys.length)
    }
    for (const t of ['hcsr04', 'servo', 'dcmotor'] as const) expect(PROPS[t].some((p) => p.key === 'model' && p.kind === 'select')).toBe(true)
  })
})

// ---------------------------------------------------------------------------------------------------------------------
// MQ ailesi: AO = 5 · (0,1 + 0,9 · gaz); DO gaz ≥ eşikte LOW.
// ---------------------------------------------------------------------------------------------------------------------
describe('MQ-3 / MQ-4 / MQ-7 / MQ-135', () => {
  const mq = (type: PartType, gas: number): Circuit => circuit([part('g', type, { gas, threshold: 0.5 })],
    [['g.VCC', 'uno.5V'], ['g.GND', 'uno.GND'], ['g.AO', 'uno.A0'], ['g.DO', 'uno.D2']])
  it.each(['mq3', 'mq4', 'mq7', 'mq135'] as PartType[])('%s: gaz 0,5 → AO ≈ 2,75 V ve ALARM; gaz 0,2 → 1,40 V normal', (t) => {
    const lab = createLab(mq(t, 0.5), GAZ_MQ_HEX)
    lab.advance(400)
    expect(numAfter(last(lab), 'V')).toBeCloseTo(2.75, 1)
    expect(last(lab)).toContain('ALARM')
    expect(rt(lab, 'g').analogModule).toMatchObject({ powered: true, level: 0.5, doHigh: false })
    lab.setProp('g', 'gas', 0.2)
    lab.advance(400)
    expect(numAfter(last(lab), 'V')).toBeCloseTo(1.4, 1)
    expect(last(lab)).toContain('normal')
  })
  it('ısıtıcı 3,3 V ile beslenmez (MQ 5 V ister)', () => {
    const c = mq('mq135', 0.8)
    c.wires = c.wires.map((w) => (w.b.pin === '5V' ? { ...w, b: { part: 'uno', pin: '3V3' } } : w))
    const lab = createLab(c, GAZ_MQ_HEX)
    lab.advance(200)
    expect(rt(lab, 'g').analogModule!.powered).toBe(false)
  })
})

// ---------------------------------------------------------------------------------------------------------------------
// Sharp IR: VO = 26 / cm (0,3-3,1 V).
// ---------------------------------------------------------------------------------------------------------------------
describe('Sharp IR', () => {
  const sharp = (cm: number): Circuit => circuit([part('s', 'sharpir', { distanceCm: cm })], [['s.VCC', 'uno.5V'], ['s.GND', 'uno.GND'], ['s.VO', 'uno.A0']])
  it('40 cm → VO 0,65 V, sketch ≈ 40 cm; 15 cm → ≈ 15 cm', () => {
    const lab = createLab(sharp(40), SHARP_IR_HEX)
    lab.advance(300)
    expect(rt(lab, 's').sharpir!.voVolts).toBeCloseTo(0.65, 2)
    expect(numAfter(last(lab), 'cm')).toBeGreaterThan(38)
    expect(numAfter(last(lab), 'cm')).toBeLessThan(42)
    lab.setProp('s', 'distanceCm', 15)
    lab.advance(300)
    expect(numAfter(last(lab), 'cm')).toBeCloseTo(15, 0)
  })
  it('beslenmezse VO 0 V', () => {
    const lab = createLab(without(sharp(40), 's.VCC'), SHARP_IR_HEX)
    lab.advance(300)
    expect(rt(lab, 's').sharpir).toMatchObject({ powered: false, voVolts: 0 })
  })
})

// ---------------------------------------------------------------------------------------------------------------------
// Köprü sürücüler. Sketch dört evre (1 s): ileri tam (255), ileri yarım (128), geri (-200), dur. Evre ortalarında ölçülür.
// Motor 6 V anmalı: hız = (V(OUT1) − V(OUT2)) / 6. L298N 5 V'tan beslenince 1,8 V kaybeder: 3,2 V → hız 0,53, kanal çıkışı 0,64.
// ---------------------------------------------------------------------------------------------------------------------
const phases = (lab: LabApi, id: string, motor: string): Array<{ out: number; brake: boolean; speed: number }> => {
  const r: Array<{ out: number; brake: boolean; speed: number }> = []
  lab.advance(500)
  for (let i = 0; i < 4; i++) {
    const s = rt(lab, id)
    r.push({ out: s.driver!.channels[0].out, brake: s.driver!.channels[0].brake, speed: rt(lab, motor).dcmotor!.speed })
    lab.advance(1000)
  }
  return r
}

describe('L298N', () => {
  const c = (): Circuit => circuit([part('d', 'l298n'), part('m', 'dcmotor')], [
    ['d.12V', 'uno.5V'], ['d.GND', 'uno.GND'], ['d.ENA', 'uno.D5'], ['d.IN1', 'uno.D7'], ['d.IN2', 'uno.D8'], ['d.OUT1', 'm.M1'], ['d.OUT2', 'm.M2'],
  ])
  it('ileri tam / yarım / geri / dur; 1,8 V düşüm', () => {
    const lab = createLab(c(), KOPRU_EN_IN_HEX)
    const [full, half, back, stop] = phases(lab, 'd', 'm')
    expect(full.out).toBeCloseTo(0.63, 1)
    expect(full.speed).toBeCloseTo(3.15 / 6, 1)
    expect(half.out).toBeGreaterThan(0.28)
    expect(half.out).toBeLessThan(0.36)
    expect(back.out).toBeLessThan(-0.45)
    expect(back.out).toBeGreaterThan(-0.56)
    expect(stop).toMatchObject({ out: 0, brake: false })
    expect(rt(lab, 'd').driver!.channels).toHaveLength(2)
  })
  it('ENA bağlı değilse jumper takılı sayılır (tam hız)', () => {
    const lab = createLab(without(c(), 'd.ENA'), KOPRU_EN_IN_HEX)
    lab.advance(1500) // ileri yarım evresi: PWM ENA'ya gidemez, kanal tam açık
    expect(rt(lab, 'd').driver!.channels[0].out).toBeCloseTo(0.63, 1)
  })
  it('besleme yoksa çıkış yok ve uyarı', () => {
    const cc = without(c(), 'd.12V')
    expect(analyzeCircuit(cc).warnings.some((w) => w.kind === 'unpowered' && w.partId === 'd')).toBe(true)
    const lab = createLab(cc, KOPRU_EN_IN_HEX)
    lab.advance(500)
    expect(rt(lab, 'd').driver).toMatchObject({ powered: false })
    expect(rt(lab, 'm').dcmotor!.speed).toBe(0)
  })
})

describe('TB6612FNG', () => {
  const c = (): Circuit => circuit([part('d', 'tb6612'), part('m', 'dcmotor')], [
    ['d.VM', 'uno.5V'], ['d.VCC', 'uno.5V'], ['d.GND', 'uno.GND'], ['d.PWMA', 'uno.D5'], ['d.AIN1', 'uno.D7'], ['d.AIN2', 'uno.D8'], ['d.STBY', 'uno.D9'],
    ['d.AO1', 'm.M1'], ['d.AO2', 'm.M2'],
  ])
  it('MOSFET köprü: neredeyse tam gerilim; PWM LOW anlarında fren', () => {
    const lab = createLab(c(), KOPRU_EN_IN_HEX)
    const [full, half, back, stop] = phases(lab, 'd', 'm')
    expect(full.out).toBeCloseTo(0.95, 1)
    expect(half.out).toBeGreaterThan(0.44)
    expect(half.out).toBeLessThan(0.54)
    expect(back.out).toBeCloseTo(-0.97 * 200 / 255, 1)
    expect(stop).toMatchObject({ out: 0, brake: false }) // IN1 = IN2 = LOW: serbest
  })
  it('STBY bağlı değilse bekleme modunda kalır', () => {
    const lab = createLab(without(c(), 'd.STBY'), KOPRU_EN_IN_HEX)
    lab.advance(500)
    expect(rt(lab, 'd').driver).toMatchObject({ powered: true, enabled: false })
    expect(rt(lab, 'm').dcmotor!.speed).toBe(0)
  })
})

describe('DRV8833 ve BTS7960 (iki PWM girişi)', () => {
  it('DRV8833: IN1 PWM / IN2 LOW ileri, ters geri; SLP bağlı değilse etkin', () => {
    const lab = createLab(circuit([part('d', 'drv8833'), part('m', 'dcmotor')], [
      ['d.VCC', 'uno.5V'], ['d.GND', 'uno.GND'], ['d.AIN1', 'uno.D5'], ['d.AIN2', 'uno.D6'], ['d.AOUT1', 'm.M1'], ['d.AOUT2', 'm.M2'],
    ]), KOPRU_IKI_PWM_HEX)
    const [full, half, back, stop] = phases(lab, 'd', 'm')
    expect(full.out).toBeCloseTo(0.95, 1)
    expect(half.out).toBeGreaterThan(0.4)
    expect(half.out).toBeLessThan(0.56)
    expect(back.out).toBeCloseTo(-0.97 * 200 / 255, 1)
    expect(stop.out).toBe(0)
  })
  it('BTS7960: R_EN/L_EN HIGH iken çalışır, LOW iken çıkış boşta', () => {
    const wires: Array<[string, string]> = [
      ['d.VCC', 'uno.5V'], ['d.GND', 'uno.GND'], ['d.RPWM', 'uno.D5'], ['d.LPWM', 'uno.D6'], ['d.R_EN', 'uno.D9'], ['d.L_EN', 'uno.D9'], ['d.M+', 'm.M1'], ['d.M-', 'm.M2'],
    ]
    const lab = createLab(circuit([part('d', 'bts7960'), part('m', 'dcmotor')], wires), KOPRU_IKI_PWM_HEX)
    const [full, , back] = phases(lab, 'd', 'm')
    expect(full.out).toBeCloseTo(0.95, 1)
    expect(back.out).toBeLessThan(-0.7)
    const off = createLab(without(without(circuit([part('d', 'bts7960'), part('m', 'dcmotor')], wires), 'd.R_EN'), 'd.L_EN'), KOPRU_IKI_PWM_HEX)
    off.advance(500)
    expect(rt(off, 'd').driver).toMatchObject({ powered: true, enabled: false })
    expect(rt(off, 'm').dcmotor!.speed).toBe(0)
  })
})

describe('MD10C (PWM + DIR)', () => {
  it('DIR LOW ileri, HIGH geri; PWM 0 → fren', () => {
    const lab = createLab(circuit([part('d', 'md10c'), part('m', 'dcmotor')], [
      ['d.VCC', 'uno.5V'], ['d.GND', 'uno.GND'], ['d.PWM', 'uno.D5'], ['d.DIR', 'uno.D7'], ['d.MA', 'm.M1'], ['d.MB', 'm.M2'],
    ]), KOPRU_PWM_DIR_HEX)
    const [full, half, back, stop] = phases(lab, 'd', 'm')
    expect(full.out).toBeCloseTo(0.95, 1)
    expect(half.out).toBeGreaterThan(0.44)
    expect(back.out).toBeCloseTo(-0.97 * 200 / 255, 1)
    expect(stop).toMatchObject({ out: 0, brake: true })
  })
})

// ---------------------------------------------------------------------------------------------------------------------
// TMC2209 + NEMA17: 1/8 mikro adım; sketch 800 darbe ileri (180°), sonra 400 geri (90°).
// ---------------------------------------------------------------------------------------------------------------------
describe('Step motor (TMC2209 + NEMA17)', () => {
  const c = (): Circuit => circuit([part('st', 'stepper', { microsteps: '8' })], [
    ['st.VCC', 'uno.5V'], ['st.GND', 'uno.GND'], ['st.STEP', 'uno.D3'], ['st.DIR', 'uno.D4'], ['st.EN', 'uno.D8'],
  ])
  it('800 darbe = 180°, sonra 400 geri = 90°', () => {
    const lab = createLab(c(), STEP_MOTOR_HEX)
    lab.advance(800)
    expect(rt(lab, 'st').stepper).toMatchObject({ powered: true, enabled: true, steps: 800, angleDeg: 180 })
    lab.advance(700)
    expect(rt(lab, 'st').stepper).toMatchObject({ steps: 400, angleDeg: 90 })
  })
  it('mikro adım 16 iken aynı darbe 90°', () => {
    const cc = c(); cc.parts[1].props.microsteps = '16'
    const lab = createLab(cc, STEP_MOTOR_HEX)
    lab.advance(800)
    expect(rt(lab, 'st').stepper!.angleDeg).toBe(90)
  })
  it('EN 5V\'a bağlıysa (devre dışı) ya da besleme yoksa adım atmaz', () => {
    const dis = without(c(), 'st.EN'); dis.wires.push(wire('st.EN', 'uno.5V'))
    const lab = createLab(dis, STEP_MOTOR_HEX)
    lab.advance(800)
    expect(rt(lab, 'st').stepper).toMatchObject({ enabled: false, steps: 0 })
    const np = createLab(without(c(), 'st.VCC'), STEP_MOTOR_HEX)
    np.advance(800)
    expect(rt(np, 'st').stepper!.steps).toBe(0)
  })
})

// ---------------------------------------------------------------------------------------------------------------------
// ESC: 1000 µs ile kurulur (≥ 1 s), sonra gaz 1400 µs → %40; rpm = 2300 · 3 · 3,7 · 0,4 ≈ 10 212.
// ---------------------------------------------------------------------------------------------------------------------
describe('ESC + BLDC', () => {
  const c = (): Circuit => circuit([part('e', 'esc', { kv: 2300, cells: '3' })], [['e.SIG', 'uno.D9'], ['e.GND', 'uno.GND']])
  it('düşük gazla kurulur, gaz açılınca devir artar', () => {
    const lab = createLab(c(), ESC_BLDC_HEX)
    lab.advance(500)
    expect(rt(lab, 'e').esc).toMatchObject({ armed: false, throttle: 0 })
    lab.advance(1000)
    expect(rt(lab, 'e').esc).toMatchObject({ armed: true, throttle: 0, rpm: 0 })
    lab.advance(2000) // t = 3500: ramp bitti, gaz 1400
    const e = rt(lab, 'e').esc!
    expect(e.pulseUs).toBeGreaterThan(1390)
    expect(e.pulseUs).toBeLessThan(1410)
    expect(e.throttle).toBeCloseTo(0.4, 1)
    expect(e.rpm).toBeGreaterThan(9700)
    expect(e.rpm).toBeLessThan(10_700)
  })
  it('ortak toprak yoksa sinyal görülmez ve kurulmaz', () => {
    const cc = without(c(), 'e.GND')
    const lab = createLab(cc, ESC_BLDC_HEX)
    lab.advance(3500)
    expect(rt(lab, 'e').esc).toMatchObject({ armed: false, throttle: 0 })
  })
})

// ---------------------------------------------------------------------------------------------------------------------
// HC-SR04 ailesi: model ölçüm aralığını belirler.
// ---------------------------------------------------------------------------------------------------------------------
describe('HC-SR04 ailesi', () => {
  const c = (model: string, cm: number): Circuit => circuit([part('h', 'hcsr04', { model, distanceCm: cm })],
    [['h.VCC', 'uno.5V'], ['h.GND', 'uno.GND'], ['h.TRIG', 'uno.D9'], ['h.ECHO', 'uno.D10']])
  it('HC-SR04 500 cm menzil dışı; JSN-SR04T 500 cm ölçer ama 10 cm kör bölgede', () => {
    const a = createLab(c('hcsr04', 500), MESAFE_CM_HEX)
    a.advance(300)
    expect(last(a)).toBe('menzil disi')
    expect(rt(a, 'h').hcsr04!.inRange).toBe(false)
    const b = createLab(c('jsnsr04t', 500), MESAFE_CM_HEX)
    b.advance(300)
    expect(numAfter(last(b), 'cm')).toBeGreaterThan(490)
    expect(numAfter(last(b), 'cm')).toBeLessThan(505)
    b.setProp('h', 'distanceCm', 10)
    b.advance(300)
    expect(last(b)).toBe('menzil disi')
  })
  it('servo modeli yalnız etiket: davranış aynı', () => {
    const lab = createLab(circuit([part('s', 'servo', { model: 'mg996r' })], [['s.SIG', 'uno.D9'], ['s.VCC', 'uno.5V'], ['s.GND', 'uno.GND']]), SERVO_TARAMA_HEX)
    lab.advance(1500) // 0°, 45°, 90° (her biri 600 ms)
    expect(rt(lab, 's').servo!.angleDeg).toBeCloseTo(90, -1)
  })
})
