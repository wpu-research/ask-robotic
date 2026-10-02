import { describe, expect, it } from 'vitest'
import { analyzeCircuit } from '@ask/sim'
import type { Circuit } from './contract'
import { emptyStats } from './stats'
import { evaluateLabGoals, type LabGoal } from './goals'
import { addPart, addWire } from './ops'

function build(): Circuit {
  let c: Circuit = { parts: [{ id: 'uno', type: 'uno', x: 0, y: 0, rotation: 0, props: {} }], wires: [] }
  c = addPart(c, 'resistor', 400, 0).circuit
  c = addPart(c, 'led', 500, 0).circuit
  c = addWire(c, { part: 'uno', pin: 'D13' }, { part: 'resistor1', pin: '1' })!.circuit
  c = addWire(c, { part: 'resistor1', pin: '2' }, { part: 'led1', pin: 'A' })!.circuit
  c = addWire(c, { part: 'led1', pin: 'K' }, { part: 'uno', pin: 'GND2' })!.circuit
  return c
}

const goals: LabGoal[] = [
  { id: 'wired', text: 'D13 → direnç → LED anodu', check: ({ analysis }) => analysis.connected({ part: 'uno', pin: 'D13' }, { part: 'led1', pin: 'A' }, ['resistor']) },
  { id: 'direct', text: 'D13 doğrudan LED anodunda değil', check: ({ analysis }) => !analysis.sameNet({ part: 'uno', pin: 'D13' }, { part: 'led1', pin: 'A' }) },
  { id: 'gnd', text: 'LED katodu GND', check: ({ analysis }) => analysis.sameNet({ part: 'led1', pin: 'K' }, { part: 'uno', pin: 'GND' }) },
  { id: 'blink', text: 'LED yanıyor', check: ({ lab }) => !!lab?.parts.led1?.led?.on },
  { id: 'code', text: 'kodda delay', check: ({ code }) => /delay/.test(code) },
  { id: 'throws', text: 'hata', check: () => { throw new Error('x') } },
]

describe('hedef değerlendirme', () => {
  const circuit = build()
  const analysis = analyzeCircuit(circuit)
  it('bağlantı hedefleri', () => {
    const r = evaluateLabGoals(goals, { circuit, analysis, lab: null, code: 'delay(1)', stats: emptyStats() })
    expect(Object.fromEntries(r.map((g) => [g.id, g.done]))).toEqual({ wired: true, direct: true, gnd: true, blink: false, code: true, throws: false })
  })
  it('davranış hedefi lab durumuna bağlı', () => {
    const lab = { timeMs: 1, running: true, pins: {}, parts: { led1: { led: { on: true, brightness: 1, currentMa: 10, burnt: false } } }, serial: '', warnings: [], eeprom: new Uint8Array(1024).fill(255), eepromRestored: false }
    expect(evaluateLabGoals(goals, { circuit, analysis, lab, code: '', stats: emptyStats() }).find((g) => g.id === 'blink')?.done).toBe(true)
  })
  it('yedek analiz: doğrudan değilse via olmadan bağlı değil', () => {
    expect(analysis.connected({ part: 'uno', pin: 'D13' }, { part: 'led1', pin: 'A' })).toBe(false)
    expect(analysis.sameNet({ part: 'uno', pin: 'GND' }, { part: 'uno', pin: 'GND3' })).toBe(true)
  })
})
