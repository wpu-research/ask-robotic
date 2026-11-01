// Uçtan uca: gerçek derlenmiş Arduino hex'i → AVR emülatörü → devre çözücü →
// köprü → MuJoCo motor hedefi. Zincirin herhangi bir halkası kopsa bu test düşer.
import { describe, expect, it } from 'vitest'
import { createRuntime } from '@/lib/lab/runtime'
import type { Circuit } from '@/lib/lab/contract'
import { pumpWiring, type CtrlRange, type WiringPlan } from './wiring'
import { SERVO_SWEEP_HEX } from './servo-fixture'

/** Uno + servo: SIG → D9, besleme 5V ve GND. Taslak servoyu 0° ile 180° arasında gezdirir. */
const circuit: Circuit = {
  parts: [
    { id: 'uno', type: 'uno', x: 0, y: 0, rotation: 0, props: {} },
    { id: 'sv', type: 'servo', x: 200, y: 0, rotation: 0, props: {} },
  ],
  wires: [
    { id: 'w1', a: { part: 'sv', pin: 'SIG' }, b: { part: 'uno', pin: 'D9' } },
    { id: 'w2', a: { part: 'sv', pin: 'VCC' }, b: { part: 'uno', pin: '5V' } },
    { id: 'w3', a: { part: 'sv', pin: 'GND' }, b: { part: 'uno', pin: 'GND' } },
  ],
}

const ranges: CtrlRange[] = [{ name: 'hip', lo: -1, hi: 1 }]
const plan: WiringPlan = { motors: [{ actuator: 'hip', partId: 'sv', kind: 'servo' }], sensors: [] }

/** Devreyi `ms` kadar ilerletip köprüyü her 10 ms'de bir çalıştırır; görülen kontrol değerlerini döndürür. */
function runFor(c: Circuit, p: WiringPlan, ms: number) {
  const lab = createRuntime(c, SERVO_SWEEP_HEX)
  const ctrl = [0]
  const seen: number[] = []
  try {
    for (let t = 0; t < ms; t += 10) {
      for (let k = 0; k < 2; k++) lab.advance(5)
      pumpWiring({ lab, plan: p, ranges, ctrl, readings: {} })
      seen.push(ctrl[0])
    }
  } finally {
    lab.dispose()
  }
  return { seen, ctrl, lab }
}

describe('devre → robot zinciri', () => {
  it('derlenmiş Arduino kodu servoyu gezdirir ve motor hedefi iki uca da gider', () => {
    // İki tam tarama için yeterli süre (taslak 300 ms'de bir yön değiştirir)
    const { seen } = runFor(circuit, plan, 1600)
    const min = Math.min(...seen)
    const max = Math.max(...seen)
    expect(max).toBeGreaterThan(0.9)   // 180° → üst sınır
    expect(min).toBeLessThan(-0.9)     // 0°   → alt sınır
  }, 30_000)

  it('sinyal kablosu kopukken motor kımıldamaz — yanlış kablolama robotu durdurur', () => {
    const kopuk: Circuit = { ...circuit, wires: circuit.wires.filter((w) => w.id !== 'w1') }
    const { seen } = runFor(kopuk, plan, 800)
    const span = Math.max(...seen) - Math.min(...seen)
    expect(span).toBeLessThan(0.05)
  }, 30_000)

  it('bağlantı kurulmamışsa kod çalışsa da motora yazılmaz', () => {
    const { seen } = runFor(circuit, { motors: [], sensors: [] }, 800)
    expect(seen.every((v) => v === 0)).toBe(true)
  }, 30_000)

  it('ters yön seçilince uçlar yer değiştirir', () => {
    const ters: WiringPlan = { motors: [{ actuator: 'hip', partId: 'sv', kind: 'servo', invert: true }], sensors: [] }
    const duz = runFor(circuit, plan, 1600).seen
    const inv = runFor(circuit, ters, 1600).seen
    // Düz sürümde ilk uç neyse, ters sürümde işareti dönmüş olmalı
    expect(Math.sign(Math.max(...duz))).toBe(-Math.sign(Math.min(...inv)))
    expect(Math.max(...inv)).toBeGreaterThan(0.9)
    expect(Math.min(...inv)).toBeLessThan(-0.9)
  }, 60_000)
})
