import { describe, expect, it } from 'vitest'
import { PINS } from './contract'
import { PART_DEFS, WORLD } from './geometry'
import { DEFAULT_PARTS } from './parts'
import { buildCircuit, catalogText, describeCircuit, parseNetlist, systemPrompt, type Netlist } from './ai-circuit'

const led: Netlist = {
  parts: [{ id: 'uno', type: 'uno' }, { id: 'r1', type: 'resistor', props: { ohms: 220 } }, { id: 'led1', type: 'led', props: { color: 'red' } }],
  wires: [{ a: 'uno.D13', b: 'r1.1' }, { a: 'r1.2', b: 'led1.A' }, { a: 'led1.K', b: 'uno.GND' }],
  code: 'void setup(){pinMode(13,OUTPUT);}\nvoid loop(){digitalWrite(13,HIGH);delay(500);digitalWrite(13,LOW);delay(500);}',
  note: 'LED yanıp söner.',
}

describe('parseNetlist', () => {
  it('çitli ve öncesinde yazılı JSON', () => {
    const r = parseNetlist('Tamam:\n```json\n' + JSON.stringify(led) + '\n```\nBitti.')
    expect('error' in r).toBe(false)
    expect((r as Netlist).parts).toHaveLength(3)
  })
  it('çitsiz JSON ve çöp', () => {
    expect('error' in parseNetlist(JSON.stringify(led))).toBe(false)
    expect('error' in parseNetlist('merhaba')).toBe(true)
    expect('error' in parseNetlist('{"parts": 1}')).toBe(true)
  })
})

describe('buildCircuit', () => {
  it('LED devresi: parçalar, kablolar, yerleşim dünya içinde', () => {
    const r = buildCircuit(led, DEFAULT_PARTS)
    if ('error' in r) throw new Error(r.error)
    expect(r.circuit.parts.map((p) => p.id)).toEqual(['uno', 'r1', 'led1'])
    expect(r.circuit.wires).toHaveLength(3)
    expect(r.warnings).toEqual([])
    expect(r.code).toContain('digitalWrite')
    for (const p of r.circuit.parts) {
      const { w, h } = PART_DEFS[p.type]
      expect(p.x).toBeGreaterThanOrEqual(0); expect(p.y).toBeGreaterThanOrEqual(0)
      expect(p.x + w).toBeLessThanOrEqual(WORLD.w); expect(p.y + h).toBeLessThanOrEqual(WORLD.h)
    }
    const uno = r.circuit.parts[0]; const r1 = r.circuit.parts[1]
    expect(r1.x).toBeGreaterThan(uno.x + PART_DEFS.uno.w) // parçalar Arduino'nun sağında
    expect(r1.props.ohms).toBe(220)
  })
  it('Arduino yoksa eklenir; pin adı büyük/küçük harf farkı tolere edilir', () => {
    const r = buildCircuit({ parts: [{ id: 'led1', type: 'led' }], wires: [{ a: 'uno.d13', b: 'led1.a' }, { a: 'led1.k', b: 'uno.gnd' }] }, DEFAULT_PARTS)
    if ('error' in r) throw new Error(r.error)
    expect(r.circuit.parts.some((p) => p.type === 'uno')).toBe(true)
    expect(r.circuit.wires).toHaveLength(2)
    expect(r.circuit.wires[0].a).toEqual({ part: 'uno', pin: 'D13' })
  })
  it('geçersiz tür, pin, özellik ve tekrar eden kablo güvenle atlanır', () => {
    const r = buildCircuit({
      parts: [{ id: 'uno', type: 'uno' }, { id: 'x', type: 'laser' }, { id: 'r1', type: 'resistor', props: { ohms: 99999999, renk: 'mavi' } }, { id: 'l', type: 'led', props: { color: 'mor' } }],
      wires: [{ a: 'uno.D13', b: 'r1.1' }, { a: 'uno.D13', b: 'r1.1' }, { a: 'uno.D99', b: 'r1.1' }, { a: 'yok.1', b: 'r1.2' }, { a: 'r1.2', b: 'r1.2' }],
    }, DEFAULT_PARTS)
    if ('error' in r) throw new Error(r.error)
    expect(r.circuit.parts.map((p) => p.type)).toEqual(['uno', 'resistor', 'led'])
    expect(r.circuit.parts[1].props.ohms).toBe(1_000_000)
    expect(r.circuit.parts[2].props.color).toBe('red') // geçersiz renk varsayılana döner
    expect(r.circuit.wires).toHaveLength(1)
    expect(r.warnings.length).toBeGreaterThanOrEqual(5)
  })
  it('izin verilmeyen parça türü atlanır; kullanılabilir parça yoksa hata', () => {
    expect('error' in buildCircuit({ parts: [{ id: 'l', type: 'led' }], wires: [] }, ['resistor'])).toBe(true)
  })
  it('parça sayısı sınırlanır, çift Arduino tek kalır', () => {
    const many = Array.from({ length: 40 }, (_, i) => ({ id: `r${i}`, type: 'resistor' }))
    const r = buildCircuit({ parts: [{ id: 'uno', type: 'uno' }, { id: 'u2', type: 'uno' }, ...many], wires: [] }, DEFAULT_PARTS)
    if ('error' in r) throw new Error(r.error)
    expect(r.circuit.parts.length).toBeLessThanOrEqual(24)
    expect(r.circuit.parts.filter((p) => p.type === 'uno')).toHaveLength(1)
  })
})

describe('istem', () => {
  it('katalog izinli parçaların tüm pinlerini içerir', () => {
    const t = catalogText(['led', 'hcsr04'])
    expect(t).toContain('led: pins A K'); expect(t).toContain(`hcsr04: pins ${PINS.hcsr04.join(' ')}`)
    expect(t).not.toContain('servo')
  })
  it('dile göre kod dili ve yorum talimatı', () => {
    expect(systemPrompt(['led'], 'en')).toContain('English identifiers and English comments')
    expect(systemPrompt(['led'], 'tr')).toContain('Türkçe')
  })
  it('mevcut devre özeti: boş devre için boş', () => {
    expect(describeCircuit({ parts: [], wires: [] })).toBe('')
    const r = buildCircuit(led, DEFAULT_PARTS)
    if ('error' in r) throw new Error(r.error)
    expect(describeCircuit(r.circuit)).toContain('uno.D13-r1.1')
  })
})
