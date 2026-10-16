// Mühendislik kitleri: her laboratuvarlı Hyvex parçası, kendi kitinin devresi + derlenmiş başlangıç sketch'iyle gerçekten çalışır.
// Hex'ler sim paketindeki fixture'dan (tools/sim/muhendislik.mjs aynı .ino kaynaklarından üretir).
import { describe, expect, it, vi } from 'vitest'
import * as HEX from '../../../../../packages/sim/src/circuit/lab-fixtures-d'
import { PINS, type LabApi, type PartRuntime } from '@/lib/lab/contract'
import { analyze, createRuntime } from '@/lib/lab/runtime'
import { ENG_PARTS, kitOf, LEVELS, partBySlug, partsOfLevel } from './catalog'
import { KITS, type KitName } from './kits'
import { SKETCHES } from './sketches'
import { decodePixels, oledPath } from '@/components/lab/part-art-e'

vi.setConfig({ testTimeout: 120_000 })

const hexOf = (sketch: string): string => (HEX as Record<string, string>)[`${sketch.toUpperCase()}_HEX`]
const serialLines = (lab: LabApi) => lab.state.serial.trim().split(/\r?\n/).filter(Boolean)
const rt = (lab: LabApi, id: string): PartRuntime => lab.state.parts[id]

/** Kit başına çalışma süresi (ms) ve beklenen gözlem. */
const EXPECT: Record<KitName, { ms: number; check: (lab: LabApi, model?: string) => void }> = {
  led: { ms: 400, check: (l) => expect(rt(l, 'l').led!.brightness).toBeGreaterThan(0) },
  buton: { ms: 200, check: (l) => { l.setProp('b', 'pressed', true); l.advance(100); expect(serialLines(l).at(-1)).toBe('basma=1'); expect(l.state.pins.D13.high).toBe(true) } },
  ldr: { ms: 400, check: (l) => expect(serialLines(l).at(-1)).toMatch(/^V=\d\.\d\d R_LDR=\d+$/) },
  npn: { ms: 800, check: (l) => expect(rt(l, 'm').dcmotor!.speed).toBeGreaterThan(0.5) },
  mosfet: { ms: 1500, check: (l) => expect(rt(l, 'm').dcmotor!.speed).toBeGreaterThan(0.2) },
  gaz: { ms: 400, check: (l) => { expect(serialLines(l).at(-1)).toContain('normal'); l.setProp('g', 'gas', 0.8); l.advance(400); expect(serialLines(l).at(-1)).toContain('ALARM') } },
  dht22: { ms: 2600, check: (l) => expect(serialLines(l).at(-1)).toBe('T=24.0 H=45.0') },
  mesafe: {
    ms: 400, check: (l, model) => {
      const line = serialLines(l).at(-1)!
      expect(line).toMatch(/^cm=(9[89]|10[01])\.\d$/) // 100 cm her modelin aralığında
      if (model === 'jsnsr04t') { l.setProp('h', 'distanceCm', 10); l.advance(300); expect(serialLines(l).at(-1)).toBe('menzil disi') }
    },
  },
  sharp: { ms: 400, check: (l) => expect(Number(/cm=([\d.]+)/.exec(serialLines(l).at(-1)!)![1])).toBeCloseTo(30, -1) },
  l298n: { ms: 500, check: (l) => expect(rt(l, 'd').driver!.channels[0].out).toBeGreaterThan(0.55) },
  tb6612: { ms: 500, check: (l) => expect(rt(l, 'd').driver!.channels[0].out).toBeGreaterThan(0.9) },
  drv8833: { ms: 500, check: (l) => expect(rt(l, 'd').driver!.channels[0].out).toBeGreaterThan(0.9) },
  bts7960: { ms: 500, check: (l) => expect(rt(l, 'd').driver!.channels[0].out).toBeGreaterThan(0.9) },
  md10c: { ms: 500, check: (l) => expect(rt(l, 'd').driver!.channels[0].out).toBeGreaterThan(0.9) },
  stepper: { ms: 800, check: (l) => expect(rt(l, 'st').stepper).toMatchObject({ steps: 800, angleDeg: 180 }) },
  esc: { ms: 3500, check: (l) => expect(rt(l, 'e').esc).toMatchObject({ armed: true }) },
  servo: { ms: 1500, check: (l) => expect(rt(l, 's').servo!.angleDeg).toBeCloseTo(90, -1) },
  mpu6050: { ms: 400, check: (l) => expect(serialLines(l).at(-1)).toBe('ax=0.00 ay=0.00 az=1.00 egim=0.0') },
  lcd: { ms: 400, check: (l) => expect(rt(l, 'lcd').lcd!.lines[0]).toBe('Merhaba muhendis') },
  lcdi2c: { ms: 1500, check: (l) => expect(rt(l, 'lcd').lcd!.lines[0].trim()).toBe('I2C: 2 kablo') },
  oled: {
    ms: 900, check: (l) => {
      expect(serialLines(l)).toContain('OLED hazir')
      const o = rt(l, 'o').oled!
      expect(o).toMatchObject({ present: true, on: true })
      const { lit } = oledPath(decodePixels(o.pixels))
      expect(lit).toBeGreaterThan(600) // yazı + çerçeve + daire
    },
  },
  bme280: {
    ms: 400, check: (l) => {
      const m = /^T=(-?[\d.]+) P=([\d.]+) H=([\d.]+)$/.exec(serialLines(l).at(-1)!)!
      expect(Math.abs(Number(m[1]) - 22)).toBeLessThanOrEqual(0.1)
      expect(Math.abs(Number(m[2]) - 1013.25)).toBeLessThanOrEqual(0.5)
      expect(Math.abs(Number(m[3]) - 45)).toBeLessThanOrEqual(1)
    },
  },
  ds18b20: { ms: 1100, check: (l) => { expect(serialLines(l)[0]).toBe('sensor sayisi=1'); expect(serialLines(l).at(-1)).toBe('T=24.00') } },
  vl53l0x: { ms: 600, check: (l) => expect(serialLines(l)).toContain('mm=350') },
}

describe('katalog', () => {
  it('128 Hyvex parçası, benzersiz slug, 7 seviye, her seviyede parça var', () => {
    expect(ENG_PARTS).toHaveLength(128)
    expect(new Set(ENG_PARTS.map((p) => p.slug)).size).toBe(128)
    expect(LEVELS.map((l) => l.n)).toEqual([1, 2, 3, 4, 5, 6, 7])
    for (const l of LEVELS) expect(partsOfLevel(l.n).length, `seviye ${l.n}`).toBeGreaterThan(0)
    for (const p of ENG_PARTS) {
      expect(p.slug).toMatch(/^[a-z0-9-]+$/)
      expect(!!p.lab !== !!p.offline, p.slug).toBe(true) // ya laboratuvar kiti ya da neden yok
    }
  })
  it('her kitin sketch\'i ve derlenmiş hex\'i var; kit devresindeki pinler sözleşmede', () => {
    for (const [name, kit] of Object.entries(KITS)) {
      expect(SKETCHES[kit.sketch], name).toBeTruthy()
      expect(hexOf(kit.sketch), name).toMatch(/^:10/)
      const c = kit.circuit()
      for (const w of c.wires) for (const end of [w.a, w.b]) {
        const p = c.parts.find((x) => x.id === end.part)!
        expect(PINS[p.type], `${name}: ${end.part}.${end.pin}`).toContain(end.pin)
      }
    }
  })
})

describe('laboratuvarlı her parça kitinde çalışır', () => {
  const withLab = ENG_PARTS.filter((p) => p.lab)
  it('53 parça laboratuvarda açılır', () => expect(withLab).toHaveLength(53))
  it.each(withLab.map((p) => [p.slug, p] as const))('%s', (_slug, p) => {
    const kit = kitOf(p)!
    const circuit = kit.circuit(p.lab!.model)
    const warn = analyze(circuit).warnings.filter((w) => w.kind !== 'floating-input' || w.partId !== 'uno')
    expect(warn, JSON.stringify(warn)).toEqual([])
    const lab = createRuntime(circuit, hexOf(kit.sketch))
    const e = EXPECT[p.lab!.kit]
    lab.advance(e.ms)
    e.check(lab, p.lab!.model)
    expect(lab.state.warnings.filter((w) => w.kind === 'short-circuit' || w.kind === 'pin-overcurrent' || w.kind === 'led-burnt')).toEqual([])
  })
  it('aile modeli parçaya göre seçilir', () => {
    const c = kitOf(partBySlug('mq-135')!)!.circuit(partBySlug('mq-135')!.lab!.model)
    expect(c.parts.find((x) => x.id === 'g')!.type).toBe('mq135')
    expect(KITS.mesafe.circuit('jsnsr04t').parts[1].props.model).toBe('jsnsr04t')
    expect(KITS.servo.circuit('mg996r').parts[1].props.model).toBe('mg996r')
  })
})
