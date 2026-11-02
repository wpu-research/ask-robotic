import { describe, expect, it } from 'vitest'
import { addAssembly, removeAssembly } from '@/lib/mikro/assembly'
import { addPart, addWire } from '@/lib/lab/ops'
import { assemblyConnectionIssues, assemblyPartId, assemblyPin, assemblySketch, syncAssemblyCircuit } from './assembly-circuit'
import { EMPTY_PLAN, channelToProp } from './wiring'

const empty = () => ({ parts: [], wires: [] })

describe('montaj → otomatik devre', () => {
  it('servo ve sensör için Uno, besleme, boş pinler ve fizik eşlemesini kurar', () => {
    const nodes = addAssembly(addAssembly([], 'servo'), 'hcsr04', 'asm_1')
    const result = syncAssemblyCircuit(nodes, empty(), EMPTY_PLAN)
    expect(result.circuit.parts.map((part) => part.type)).toEqual(['uno', 'servo', 'hcsr04'])
    expect(result.circuit.wires).toHaveLength(7)
    expect(assemblyPin(result.circuit, 'asm_1', 'SIG')).toBe('D9')
    expect(assemblyConnectionIssues(nodes, result.circuit)).toEqual([])
    expect(result.plan.motors[0]).toMatchObject({ actuator: 'asm_1_servo', partId: assemblyPartId('asm_1'), kind: 'servo' })
    expect(result.plan.sensors[0]).toMatchObject({ channel: 'asm_2_distance', scale: 100 })
  })

  it('mevcut kartı, elle bağlanan kabloları ve kullanılan pinleri korur', () => {
    let circuit = addPart(empty(), 'uno', 0, 0).circuit
    const servo = addPart(circuit, 'servo', 200, 0)
    circuit = addWire(servo.circuit, { part: servo.part.id, pin: 'SIG' }, { part: 'uno1', pin: 'D9' })!.circuit
    const nodes = addAssembly([], 'servo')
    const result = syncAssemblyCircuit(nodes, circuit, EMPTY_PLAN)
    expect(result.circuit.parts.filter((part) => part.type === 'uno')).toHaveLength(1)
    expect(result.circuit.wires[0]).toEqual(circuit.wires[0])
    expect(assemblyPin(result.circuit, 'asm_1', 'SIG')).toBe('D10')
    expect(assemblySketch(nodes, result.circuit)).toContain('asm_1.attach(10)')
  })

  it('yeniden eşitleme kabloları çoğaltmaz ve bilerek kesilen kabloyu geri getirmez', () => {
    const nodes = addAssembly([], 'servo')
    const first = syncAssemblyCircuit(nodes, empty(), EMPTY_PLAN)
    const again = syncAssemblyCircuit(nodes, first.circuit, first.plan)
    expect(again).toEqual(first)
    const cut = { ...first.circuit, wires: first.circuit.wires.filter((wire) => wire.a.pin !== 'SIG') }
    const result = syncAssemblyCircuit(nodes, cut, first.plan)
    expect(result.circuit.wires).toEqual(cut.wires)
    expect(assemblyConnectionIssues(nodes, result.circuit)).toEqual(['asm_1'])
  })

  it('montaj silinince yalnız onun devre parçalarını ve eşlemelerini temizler', () => {
    const nodes = addAssembly(addAssembly([], 'servo'), 'hcsr04', 'asm_1')
    const first = syncAssemblyCircuit(nodes, addPart(empty(), 'led', 100, 100).circuit, EMPTY_PLAN)
    const result = syncAssemblyCircuit(removeAssembly(nodes, 'asm_1'), first.circuit, first.plan)
    expect(result.circuit.parts.map((part) => part.type)).toEqual(['led', 'uno'])
    expect(result.circuit.wires).toEqual([])
    expect(result.plan).toEqual(EMPTY_PLAN)
  })

  it('dijital pinler dolunca çakışan kablo kurmaz, eksik bağlantıyı bildirir', () => {
    let nodes = addAssembly([], 'servo')
    for (let index = 1; index < 13; index++) nodes = addAssembly(nodes, 'servo')
    const result = syncAssemblyCircuit(nodes, empty(), EMPTY_PLAN)
    const signals = result.circuit.wires.filter((wire) => wire.a.pin === 'SIG').map((wire) => wire.b.pin)
    expect(new Set(signals).size).toBe(12)
    expect(assemblyConnectionIssues(nodes, result.circuit)).toEqual(['asm_13'])
  })

  it('menzil dışında nesne yoksa sensör en uzak mesafeyi bildirir', () => {
    expect(channelToProp(-1, { partId: 'sensor', channel: 'range', prop: 'distanceCm', scale: 100, min: 2, max: 400 })).toBe(400)
  })
})
