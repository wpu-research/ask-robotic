import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { PINS, PROPS, type PartInstance, type PartRuntime, type PartType } from '@/lib/lab/contract'
import { STAGE_B_PARTS } from '@/lib/lab/parts'
import { MeasureBox } from './props-panel'
import { PartArt, lcdRows } from './part-art'

const part = (type: PartType, props: PartInstance['props'] = {}): PartInstance => ({ id: `${type}1`, type, x: 0, y: 0, rotation: 0, props })
const svg = (type: PartType, runtime?: PartRuntime, props?: PartInstance['props']) => renderToStaticMarkup(createElement('svg', null, createElement(PartArt, { part: part(type, props), runtime })))

describe('çizimler', () => {
  it('her Aşama B parçası çalışma zamanı olmadan da çizilir', () => {
    for (const t of STAGE_B_PARTS) expect(svg(t).length, t).toBeGreaterThan(200)
  })
  it('boş/eksik çalışma zamanı alanlarıyla çökmez', () => {
    for (const t of STAGE_B_PARTS) expect(() => svg(t, {} as PartRuntime), t).not.toThrow()
    expect(() => svg('lcd1602', { lcd: { lines: [], backlight: true, poweredOn: true } })).not.toThrow()
    expect(() => svg('sevenseg', { sevenseg: { segments: {} as never } })).not.toThrow()
  })
  it('DC motor: hız 0 durur, hız ≠ 0 döner, yön ters', () => {
    expect(svg('dcmotor', { dcmotor: { speed: 0 } })).toContain('data-motor-spinning="false"')
    const fwd = svg('dcmotor', { dcmotor: { speed: 0.8 } }), rev = svg('dcmotor', { dcmotor: { speed: -0.8 } })
    expect(fwd).toContain('data-motor-spinning="true"'); expect(fwd).toContain('animation-direction:normal'); expect(rev).toContain('animation-direction:reverse')
    expect(svg('dcmotor', { dcmotor: { speed: 0.2 } })).toMatch(/animation-duration:1\.40s/)
  })
  it('röle: enerji → LED yanar, kontak NO tarafına geçer', () => {
    const on = svg('relay', { relay: { energized: true } }), off = svg('relay', { relay: { energized: false } })
    expect(on).toContain('data-relay-led="on"'); expect(on).toContain('data-relay-arm="no"')
    expect(off).toContain('data-relay-led="off"'); expect(off).toContain('data-relay-arm="nc"')
  })
  it('7-segment: yalnız parlak segmentler yanar', () => {
    const segs = { a: 1, b: 1, c: 0, d: 0, e: 0, f: 0, g: 0.5, dp: 1 }
    const m = svg('sevenseg', { sevenseg: { segments: segs } })
    expect(m).toContain('data-seg="abgdp"'); expect(m).not.toContain('data-seg-on="c"')
    expect(svg('sevenseg')).toContain('data-seg=""')
  })
  it('74HC595: çıkış göstergeleri', () => {
    const m = svg('sr595', { sr595: { outputs: [true, false, true, false, false, false, false, true] } })
    expect((m.match(/data-on="true"/g) ?? []).length).toBe(3)
    expect((svg('sr595').match(/data-on="true"/g) ?? []).length).toBe(0)
  })
  it('LCD: metin, kapalı ve arka ışıksız durumlar', () => {
    const lines = ['Merhaba!         ', 'Sayac: 42']
    const on = svg('lcd1602', { lcd: { lines, backlight: true, poweredOn: true } })
    expect(on).toContain('data-lcd="on"'); expect(on).toContain('data-lcd-text="Merhaba!|Sayac: 42"')
    expect(svg('lcd1602', { lcd: { lines, backlight: false, poweredOn: true } })).toContain('data-lcd="dark"')
    const off = svg('lcdI2c', { lcd: { lines, backlight: true, poweredOn: false } })
    expect(off).toContain('data-lcd="off"'); expect(off).not.toContain('Merhaba')
    expect(svg('lcdI2c')).toContain('data-lcd="off"')
  })
  it('lcdRows 16 karaktere tamamlar/keser', () => {
    expect(lcdRows(['abc'])).toEqual(['abc'.padEnd(16), ' '.repeat(16)])
    expect(lcdRows(['x'.repeat(40), 'y'])[0]).toHaveLength(16)
    expect(lcdRows(undefined)[1]).toHaveLength(16)
  })
})

describe('sanal ölçüm kutusu', () => {
  const box = (running: boolean, rt?: PartRuntime) => renderToStaticMarkup(createElement(MeasureBox, { part: part('resistor'), runtime: rt, running }))
  it('çalışmıyorken yönlendirir', () => expect(box(false)).toContain('Ölçmek için ▶’e bas'))
  it('değeri işaretli ve virgüllü gösterir', () => {
    const h = box(true, { meas: { vAcross: 3.1, currentMa: 8.6 } })
    expect(h).toContain('3,10 V · 8,6 mA →'); expect(h).toContain('Akım yönü 1. uçtan 2. uca')
  })
  it('değer yoksa Ölçülemiyor', () => expect(box(true, {})).toContain('Ölçülemiyor'))
})

describe('yeni PROPS', () => {
  it('röle tetik, 7-seg ortak uç, I2C adres seçenekleri tanımlı', () => {
    expect(PROPS.relay[0].options?.map((o) => o.value)).toEqual(['high', 'low'])
    expect(PROPS.sevenseg[0].key).toBe('common')
    expect(PROPS.lcdI2c[0].options?.map((o) => o.value)).toEqual(['0x27', '0x3F'])
    expect(PINS.relay).toContain('COM')
  })
})
