// Aşama F (güç): pil kimyaları, LM7805, buck modülleri, MAX17048. Başlangıç sketch'leri lab-fixtures-d.ts'ten.
import { describe, expect, it, vi } from 'vitest'
import { analyzeCircuit, createLab } from '../index.js'
import type { Circuit, LabApi, PartInstance, PartType, PropValue, Wire } from '../index.js'
import { cellOcv, lipoSoc } from './power.js'
import { MAX17048_OKU_HEX, PIL_OLCUM_HEX, REGULATOR_OLCUM_HEX } from './lab-fixtures-d.js'

vi.setConfig({ testTimeout: 180_000 })

const part = (id: string, type: PartType, props: Record<string, PropValue> = {}): PartInstance => ({ id, type, x: 0, y: 0, rotation: 0, props })
const ref = (s: string): { part: string; pin: string } => { const i = s.indexOf('.'); return { part: s.slice(0, i), pin: s.slice(i + 1) } }
const wire = (a: string, b: string): Wire => ({ id: `${a}~${b}`, a: ref(a), b: ref(b) })
const circuit = (parts: PartInstance[], wires: Array<[string, string]>): Circuit => ({ parts: [part('uno', 'uno'), ...parts], wires: wires.map(([a, b]) => wire(a, b)) })
const lines = (lab: LabApi) => lab.state.serial.trim().split(/\r?\n/).filter(Boolean)
const numAfter = (line: string, key: string): number => Number(new RegExp(`${key}=(-?[\\d.]+)`).exec(line)?.[1] ?? NaN)

/** Pil + 10k/3,3k bölücü (A0) + 470 Ω + LED yükü. */
const batteryCircuit = (props: Record<string, PropValue>) => circuit(
  [part('b', 'battery', props), part('r1', 'resistor', { ohms: 10000 }), part('r2', 'resistor', { ohms: 3300 }), part('rl', 'resistor', { ohms: 470 }), part('l', 'led', { color: 'red' })],
  [['b.-', 'uno.GND'], ['b.+', 'r1.1'], ['r1.2', 'uno.A0'], ['uno.A0', 'r2.1'], ['r2.2', 'uno.GND2'], ['b.+', 'rl.1'], ['rl.2', 'l.A'], ['l.K', 'uno.GND3']],
)

describe('kimya eğrileri', () => {
  it('açık devre gerilimi şarjla artar; LiPo %100 = 4,2 V, %0 = 3,0 V', () => {
    expect(cellOcv('lipo', 100)).toBeCloseTo(4.2, 5)
    expect(cellOcv('lipo', 0)).toBeCloseTo(3.0, 5)
    expect(cellOcv('lifepo4', 50)).toBeGreaterThan(3.2)
    expect(lipoSoc(cellOcv('lipo', 37))).toBeCloseTo(37, 0)
  })
})

describe('pil', () => {
  it('2S LiPo %80: bölücüyle ölçülen gerilim ≈ 2 × 4,0 V, LED yanar', () => {
    const lab = createLab(batteryCircuit({ chemistry: 'lipo', cells: 2, charge: 80 }), PIL_OLCUM_HEX)
    lab.advance(700)
    const b = lab.state.parts.b.battery!
    expect(b.active).toBe(true)
    expect(b.ocv).toBeCloseTo(8.0, 2)
    expect(numAfter(lines(lab).at(-1)!, 'pil')).toBeCloseTo(8.0, 0)
    expect(lab.state.parts.l.led!.on).toBe(true)
    expect(b.currentMa).toBeGreaterThan(10)
  })
  it('şarj canlı değişir: %20 iken ölçülen gerilim düşer', () => {
    const lab = createLab(batteryCircuit({ chemistry: 'lipo', cells: 2, charge: 80 }), PIL_OLCUM_HEX)
    lab.advance(600)
    lab.setProp('b', 'charge', 20)
    lab.advance(600)
    expect(numAfter(lines(lab).at(-1)!, 'pil')).toBeCloseTo(7.3, 0)
  })
  it('CR2032 iç direnci büyük: yük altında gerilim çöker ve akım sınırı uyarısı', () => {
    const c = circuit([part('b', 'battery', { chemistry: 'cr2032', cells: 1, charge: 90 }), part('rl', 'resistor', { ohms: 33 })], [['b.-', 'uno.GND'], ['b.+', 'rl.1'], ['rl.2', 'uno.GND2']])
    const lab = createLab(c, PIL_OLCUM_HEX)
    lab.advance(50)
    const b = lab.state.parts.b.battery!
    expect(b.volts).toBeLessThan(b.ocv * 0.75)
    expect(lab.state.warnings.some((w) => w.kind === 'power' && w.partId === 'b')).toBe(true)
  })
  it('− ucu topraksız ya da + ucu VIN: uyarı, pil devre dışı', () => {
    const a = analyzeCircuit(circuit([part('b', 'battery')], [['b.+', 'uno.VIN']])).warnings.filter((w) => w.partId === 'b').map((w) => w.message)
    expect(a.some((m) => /GND'sine bağlı değil/.test(m))).toBe(true)
    expect(a.some((m) => /5V\/VIN/.test(m))).toBe(true)
    const lab = createLab(circuit([part('b', 'battery')], [['b.+', 'uno.VIN'], ['b.-', 'uno.GND']]), PIL_OLCUM_HEX)
    lab.advance(20)
    expect(lab.state.parts.b.battery!.active).toBe(false)
  })
  it('kısa devre uyarısı', () => {
    const w = analyzeCircuit(circuit([part('b', 'battery')], [['b.+', 'b.-']])).warnings
    expect(w.some((x) => x.kind === 'short-circuit' && x.partId === 'b')).toBe(true)
  })
})

/** Pil → regülatör → 100 Ω yük; A0 çıkış, A1 giriş bölücüyle. */
const regCircuit = (reg: PartInstance, battery: Record<string, PropValue>, load = 100) => {
  const inPin = reg.type === 'lm7805' ? 'IN' : 'VIN', outPin = reg.type === 'lm7805' ? 'OUT' : 'VOUT'
  return circuit(
    [part('b', 'battery', battery), reg, part('rl', 'resistor', { ohms: load }), part('r1', 'resistor', { ohms: 10000 }), part('r2', 'resistor', { ohms: 3300 })],
    [['b.-', 'uno.GND'], ['b.+', `u.${inPin}`], ['u.GND', 'uno.GND2'], [`u.${outPin}`, 'rl.1'], ['rl.2', 'uno.GND3'], [`u.${outPin}`, 'uno.A0'],
      ['b.+', 'r1.1'], ['r1.2', 'uno.A1'], ['uno.A1', 'r2.1'], ['r2.2', 'uno.GND']],
  )
}

describe('LM7805', () => {
  it('9 V (6 alkalin) → 5,0 V; yük 50 mA, girişten aynı akım + boşta akım', () => {
    const lab = createLab(regCircuit(part('u', 'lm7805'), { chemistry: 'alkalin', cells: 6, charge: 70 }), REGULATOR_OLCUM_HEX)
    lab.advance(700)
    const r = lab.state.parts.u.regulator!
    expect(r.on).toBe(true)
    expect(r.vout).toBeCloseTo(5, 1)
    expect(r.ioutMa).toBeCloseTo(50, 0)
    expect(r.iinMa - r.ioutMa).toBeCloseTo(5, 0)
    expect(r.inReg).toBe(true)
    const l = lines(lab).at(-1)!
    expect(numAfter(l, 'cikis')).toBeCloseTo(5, 1)
    expect(numAfter(l, 'giris')).toBeGreaterThan(8)
    expect(lab.state.parts.b.battery!.currentMa).toBeGreaterThan(50)
  })
  it('düşüm gerilimi: 2S LiPo %10 (≈ 7 V) → çıkış 5 V altına düşer', () => {
    const lab = createLab(regCircuit(part('u', 'lm7805'), { chemistry: 'lipo', cells: 2, charge: 5 }), REGULATOR_OLCUM_HEX)
    lab.advance(300)
    const r = lab.state.parts.u.regulator!
    expect(r.vout).toBeLessThan(4.9)
    expect(r.inReg).toBe(false)
  })
  it('12 V kurşun-asit ve 25 Ω yük: ~1,4 W ısı, soğutucu uyarısı', () => {
    const lab = createLab(regCircuit(part('u', 'lm7805'), { chemistry: 'kursun-asit', cells: 6, charge: 90 }, 25), REGULATOR_OLCUM_HEX)
    lab.advance(200)
    expect(lab.state.parts.u.regulator!.pdissW).toBeGreaterThan(1.2)
    expect(lab.state.warnings.some((w) => w.kind === 'power' && /soğutucu/.test(w.message))).toBe(true)
  })
})

describe('buck', () => {
  it('3S LiPo → LM2596 5 V: girişten çıkıştan çok daha az akım (verim)', () => {
    const lab = createLab(regCircuit(part('u', 'buck', { model: 'lm2596', vout: 5 }), { chemistry: 'lipo', cells: 3, charge: 80 }, 50), REGULATOR_OLCUM_HEX)
    lab.advance(500)
    const r = lab.state.parts.u.regulator!
    expect(r.vout).toBeCloseTo(5, 1)
    expect(r.ioutMa).toBeCloseTo(100, 0)
    expect(r.iinMa).toBeLessThan(70)
    expect(r.iinMa).toBeGreaterThan(40)
  })
  it('trimpot canlı: 3,3 V', () => {
    const lab = createLab(regCircuit(part('u', 'buck', { model: 'lm2596', vout: 5 }), { chemistry: 'lipo', cells: 3, charge: 80 }), REGULATOR_OLCUM_HEX)
    lab.advance(300)
    lab.setProp('u', 'vout', 3.3)
    lab.advance(600)
    expect(numAfter(lines(lab).at(-1)!, 'cikis')).toBeCloseTo(3.3, 1)
  })
  it('MP1584 girişine 6S kurşun-asit + 6S (fazla): giriş sınırı uyarısı', () => {
    const c = regCircuit(part('u', 'buck', { model: 'mp1584', vout: 5 }), { chemistry: 'kursun-asit', cells: 8, charge: 100 })
    const c2: Circuit = { ...c, parts: c.parts.map((p) => (p.id === 'b' ? { ...p, props: { ...p.props, cells: 8 } } : p)) }
    // 8 × 2,15 = 17,2 V < 28 V: uyarı yok
    const ok = createLab(c2, REGULATOR_OLCUM_HEX); ok.advance(100)
    expect(ok.state.warnings.some((w) => w.kind === 'power' && /sınır 28 V/.test(w.message))).toBe(false)
    const hi: Circuit = { ...c, parts: c.parts.map((p) => (p.id === 'b' ? { ...p, props: { chemistry: 'lipo', cells: 8, charge: 100 } } : p)) } // 33,6 V
    const bad = createLab(hi, REGULATOR_OLCUM_HEX); bad.advance(100)
    expect(bad.state.warnings.some((w) => w.kind === 'power' && /sınır 28 V/.test(w.message))).toBe(true)
  })
  it('regülatör çıkışı 5V hattında: uyarı ve modellenmez', () => {
    const w = analyzeCircuit(circuit([part('u', 'lm7805')], [['u.OUT', 'uno.5V'], ['u.GND', 'uno.GND']])).warnings
    expect(w.some((x) => x.kind === 'power' && /5V\/VIN/.test(x.message))).toBe(true)
  })
})

describe('MAX17048', () => {
  it('1S LiPo %50: VCELL ve SOC I2C ile okunur, sürüm 0x12', () => {
    const c = circuit([part('b', 'battery', { chemistry: 'lipo', cells: 1, charge: 50 }), part('g', 'max17048')],
      [['b.-', 'uno.GND'], ['b.+', 'g.CELL'], ['g.GND', 'uno.GND2'], ['g.SDA', 'uno.A4'], ['g.SCL', 'uno.A5']])
    const lab = createLab(c, MAX17048_OKU_HEX)
    lab.advance(1200)
    expect(lines(lab)[0]).toBe('surum=0x12')
    const l = lines(lab).at(-1)!
    expect(numAfter(l, 'V')).toBeCloseTo(cellOcv('lipo', 50), 2)
    expect(numAfter(l, 'SOC')).toBeCloseTo(50, 0)
    expect(lab.state.parts.g.fuel).toMatchObject({ present: true })
  })
})
