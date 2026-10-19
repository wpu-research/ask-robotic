import { describe, expect, it } from 'vitest'
import type { Circuit } from './contract'
import { PART_DEFS, localToWorld, partBounds, pinDir, pinWorld, wireRoute, wireTrace } from './geometry'
import { WIRE_BLACK, WIRE_COLORS, WIRE_RED, addPart, addWire, canAddWire, hasParts, isCircuit, normalizeCircuit, removePart, resistorBands, rotatePart, formatOhms } from './ops'

const base = (): Circuit => ({ parts: [{ id: 'uno', type: 'uno', x: 0, y: 0, rotation: 0, props: {} }], wires: [] })

describe('kablo kuralları', () => {
  const c0 = (() => {
    let c = base()
    c = addPart(c, 'led', 400, 100).circuit
    c = addPart(c, 'resistor', 400, 200).circuit
    return c
  })()
  it('iki pin arasında kablo oluşturur', () => {
    const r = addWire(c0, { part: 'uno', pin: 'D13' }, { part: 'resistor1', pin: '1' })
    expect(r?.circuit.wires).toHaveLength(1)
    expect(r?.wire.color).toBeTruthy()
  })
  it('aynı pine kendi kendine kablo yok', () => {
    expect(canAddWire(c0, { part: 'led1', pin: 'A' }, { part: 'led1', pin: 'A' }).ok).toBe(false)
  })
  it('aynı iki pin arasında ikinci kablo yok (yön önemsiz)', () => {
    const c1 = addWire(c0, { part: 'led1', pin: 'A' }, { part: 'uno', pin: 'D13' })!.circuit
    expect(canAddWire(c1, { part: 'uno', pin: 'D13' }, { part: 'led1', pin: 'A' }).ok).toBe(false)
    expect(addWire(c1, { part: 'led1', pin: 'A' }, { part: 'uno', pin: 'D13' })).toBeNull()
  })
  it('parçanın kendi iki pinini bağlayan tek kablo olabilir', () => {
    const r = addWire(c0, { part: 'led1', pin: 'A' }, { part: 'led1', pin: 'K' })
    expect(r).not.toBeNull()
    expect(canAddWire(r!.circuit, { part: 'led1', pin: 'K' }, { part: 'led1', pin: 'A' }).ok).toBe(false)
  })
  it('geçersiz pin/parça reddedilir', () => {
    expect(canAddWire(c0, { part: 'led1', pin: 'X' }, { part: 'uno', pin: 'D2' }).ok).toBe(false)
    expect(canAddWire(c0, { part: 'yok', pin: 'A' }, { part: 'uno', pin: 'D2' }).ok).toBe(false)
  })
  it('kablo rengi: 5V kırmızı, GND siyah, diğerleri döngü', () => {
    let c = addPart(c0, 'button', 300, 100).circuit
    const w1 = addWire(c, { part: 'uno', pin: '5V' }, { part: 'button1', pin: 'A' })!
    expect(w1.wire.color).toBe(WIRE_RED)
    const w2 = addWire(w1.circuit, { part: 'button1', pin: 'B' }, { part: 'uno', pin: 'GND3' })!
    expect(w2.wire.color).toBe(WIRE_BLACK)
    const w3 = addWire(w2.circuit, { part: 'uno', pin: 'D2' }, { part: 'button1', pin: 'A' })!
    const w4 = addWire(w3.circuit, { part: 'uno', pin: 'D3' }, { part: 'led1', pin: 'A' })!
    expect([w3.wire.color, w4.wire.color]).toEqual([WIRE_COLORS[0], WIRE_COLORS[1]])
  })
  it('bir pine birden çok kablo bağlanabilir', () => {
    let c = addWire(c0, { part: 'uno', pin: 'GND' }, { part: 'led1', pin: 'K' })!.circuit
    c = addWire(c, { part: 'uno', pin: 'GND' }, { part: 'resistor1', pin: '2' })!.circuit
    expect(c.wires).toHaveLength(2)
  })
  it('parça silinince bağlı kablolar da silinir', () => {
    let c = addWire(c0, { part: 'uno', pin: 'D13' }, { part: 'resistor1', pin: '1' })!.circuit
    c = addWire(c, { part: 'resistor1', pin: '2' }, { part: 'led1', pin: 'A' })!.circuit
    const after = removePart(c, 'resistor1')
    expect(after.parts.map((p) => p.id)).toEqual(['uno', 'led1'])
    expect(after.wires).toHaveLength(0)
  })
})

describe('döndürme ve pin koordinatı', () => {
  const part = { type: 'resistor' as const, x: 100, y: 50, rotation: 0 as const }
  it('0 derecede yerel + konum', () => {
    expect(pinWorld(part, '1')).toEqual({ x: 104, y: 62 })
    expect(pinWorld(part, '2')).toEqual({ x: 176, y: 62 })
  })
  it('90 derece: yatay direnç dikey olur, merkez sabit', () => {
    const p = { ...part, rotation: 90 as const }
    const a = pinWorld(p, '1')!, b = pinWorld(p, '2')!
    expect(a.x).toBeCloseTo(b.x); expect(Math.abs(a.y - b.y)).toBeCloseTo(72)
    expect((a.x + b.x) / 2).toBeCloseTo(100 + 40); expect((a.y + b.y) / 2).toBeCloseTo(50 + 12)
    expect(a.y).toBeLessThan(b.y) // 1. pin yukarı
  })
  it('180 derece pinleri yer değiştirir; 4 dönüş başa döner', () => {
    const p = { ...part, rotation: 180 as const }
    expect(pinWorld(p, '1')!.x).toBeCloseTo(176); expect(pinWorld(p, '2')!.x).toBeCloseTo(104)
    let c: Circuit = { parts: [{ id: 'r', type: 'resistor', x: 100, y: 50, rotation: 0, props: {} }], wires: [] }
    for (let i = 0; i < 4; i++) c = rotatePart(c, 'r')
    expect(c.parts[0].rotation).toBe(0)
  })
  it('sınır kutusu 90 derecede en/boy değişir', () => {
    const b = partBounds({ ...part, rotation: 90 })
    expect(b.w).toBe(24); expect(b.h).toBe(80)
  })
  it('tüm pinler parça kutusu içinde', () => {
    for (const [type, def] of Object.entries(PART_DEFS)) {
      for (const [pin, pt] of Object.entries(def.pins)) {
        expect(pt.x, `${type}.${pin}`).toBeGreaterThanOrEqual(0); expect(pt.x).toBeLessThanOrEqual(def.w)
        expect(pt.y).toBeGreaterThanOrEqual(0); expect(pt.y).toBeLessThanOrEqual(def.h)
      }
    }
    expect(localToWorld({ type: 'led', x: 0, y: 0, rotation: 0 }, { x: 5, y: 5 })).toEqual({ x: 5, y: 5 })
  })
  it('kablo izi: uçlardan geçer, yalnız yatay/dikey parçalardan oluşur', () => {
    const pins = [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }]
    const a = { x: 100, y: 100 }
    for (const da of pins) for (const db of pins) for (const b of [{ x: 300, y: 40 }, { x: 20, y: 220 }, { x: 100, y: 180 }]) {
      const r = wireRoute(a, da, b, db, 8)
      expect(r[0]).toEqual(a)
      expect(r.at(-1)).toEqual(b)
      for (let i = 1; i < r.length; i++) expect(r[i].x === r[i - 1].x || r[i].y === r[i - 1].y).toBe(true)
    }
    expect(wireTrace(a, { x: 0, y: -1 }, { x: 300, y: 40 }, { x: 0, y: 1 })).toMatch(/^M100 100 L.* L300 40$/)
  })
  it('kablo izi: serbest uç tek köşeli', () => {
    expect(wireRoute({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 100, y: 60 }, { x: 0, y: 0 })).toEqual([{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 60 }])
  })
  it('pin çıkış yönü: kenara göre ve döndürmeyle', () => {
    expect(pinDir({ type: 'uno', rotation: 0 }, 'D13')).toEqual({ x: 0, y: -1 }) // üst başlık
    expect(pinDir({ type: 'uno', rotation: 0 }, 'A0')).toEqual({ x: 0, y: 1 }) // alt başlık
    expect(pinDir({ type: 'resistor', rotation: 0 }, '1')).toEqual({ x: -1, y: 0 })
    expect(pinDir({ type: 'resistor', rotation: 0 }, '2')).toEqual({ x: 1, y: 0 })
    expect(pinDir({ type: 'resistor', rotation: 90 }, '2').y).toBe(1) // sağ → aşağı
  })
})

describe('serileştirme / doğrulama', () => {
  it('geçerli devre ve gidiş-dönüş', () => {
    let c = addPart(base(), 'led', 300, 40).circuit
    c = addWire(c, { part: 'uno', pin: 'D13' }, { part: 'led1', pin: 'A' })!.circuit
    expect(isCircuit(JSON.parse(JSON.stringify(c)))).toBe(true)
    expect(hasParts(c, ['uno'])).toBe(true)
    expect(hasParts(c, ['uno', 'x'])).toBe(false)
  })
  it('bozuk veriyi reddeder', () => {
    expect(isCircuit(null)).toBe(false)
    expect(isCircuit({ parts: [], wires: 1 })).toBe(false)
    expect(isCircuit({ parts: [{ id: 'a', type: 'foo', x: 0, y: 0, rotation: 0, props: {} }], wires: [] })).toBe(false)
    expect(isCircuit({ parts: [{ id: 'a', type: 'led', x: 0, y: 0, rotation: 45, props: {} }], wires: [] })).toBe(false)
    const bad = { parts: [{ id: 'a', type: 'led', x: 0, y: 0, rotation: 0, props: {} }], wires: [{ id: 'w', a: { part: 'a', pin: 'A' }, b: { part: 'zzz', pin: 'A' } }] }
    expect(isCircuit(bad)).toBe(false)
    const selfLoop = { parts: bad.parts, wires: [{ id: 'w', a: { part: 'a', pin: 'A' }, b: { part: 'a', pin: 'A' } }] }
    expect(isCircuit(selfLoop)).toBe(false)
    expect(isCircuit({ parts: [{ id: 'a', type: 'led', x: NaN, y: 0, rotation: 0, props: {} }], wires: [] })).toBe(false)
  })
  it('normalize eksik prop ekler', () => {
    const c = normalizeCircuit({ parts: [{ id: 'l', type: 'led', x: 0, y: 0, rotation: 0, props: {} }], wires: [] })
    expect(c.parts[0].props.color).toBe('red')
  })
})

describe('direnç renk bandı', () => {
  it('330 Ω turuncu turuncu kahverengi altın', () => expect(resistorBands(330)).toEqual(['orange', 'orange', 'brown', 'gold']))
  it('10 kΩ kahverengi siyah turuncu', () => expect(resistorBands(10_000).slice(0, 3)).toEqual(['brown', 'black', 'orange']))
  it('220 Ω kırmızı kırmızı kahverengi', () => expect(resistorBands(220).slice(0, 3)).toEqual(['red', 'red', 'brown']))
  it('1 kΩ kahverengi siyah kırmızı', () => expect(resistorBands(1000).slice(0, 3)).toEqual(['brown', 'black', 'red']))
  it('4.7 Ω sarı mor altın; 1 Ω kahverengi siyah altın', () => {
    expect(resistorBands(4.7).slice(0, 3)).toEqual(['yellow', 'violet', 'gold'])
    expect(resistorBands(1).slice(0, 3)).toEqual(['brown', 'black', 'gold'])
  })
  it('1 MΩ kahverengi siyah yeşil', () => expect(resistorBands(1_000_000).slice(0, 3)).toEqual(['brown', 'black', 'green']))
  it('biçimlendirme', () => { expect(formatOhms(330)).toBe('330 Ω'); expect(formatOhms(4700)).toBe('4.7 kΩ') })
})
