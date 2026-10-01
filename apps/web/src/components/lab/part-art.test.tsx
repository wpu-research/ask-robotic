import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { PINS, PROPS, type PartInstance, type PartRuntime, type PartType } from '@/lib/lab/contract'
import { STAGE_B_PARTS, STAGE_C_PARTS } from '@/lib/lab/parts'
import { MeasureBox, PropsPanel } from './props-panel'
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

const analog = (o: Partial<NonNullable<PartRuntime['analogModule']>> = {}): PartRuntime => ({ analogModule: { powered: true, level: 0, aoVolts: 0, doHigh: true, ...o } })

describe('Aşama C çizimleri', () => {
  it('her parça çalışma zamanı olmadan, boş ve kısmi çalışma zamanıyla çizilir', () => {
    for (const t of STAGE_C_PARTS) {
      expect(svg(t).length, t).toBeGreaterThan(300)
      expect(() => svg(t, {} as PartRuntime), t).not.toThrow()
      expect(() => svg(t, { hcsr04: {}, dht: {}, pir: {}, irobstacle: {}, bmp280: {}, mpu6050: {}, rtc: {}, joystick: {}, encoder: {}, keypad: {}, analogModule: {}, reed: {} } as unknown as PartRuntime), t).not.toThrow()
    }
  })
  it('her parça kendi pinlerinin pedlerini çizer', () => {
    for (const t of STAGE_C_PARTS.filter((x) => x !== 'reed')) {
      const m = svg(t)
      expect(m, t).toContain(`data-pads="${t}"`)
      for (const pin of PINS[t]) expect(m, `${t}:${pin}`).toContain(`>${pin}</text>`)
    }
  })
  it('HC-SR04: besleme ve menzil durumu', () => {
    expect(svg('hcsr04')).toContain('data-hc-active="false"')
    const on = svg('hcsr04', { hcsr04: { powered: true, distanceCm: 42, inRange: true, pings: 3 } })
    expect(on).toContain('data-hc-active="true"'); expect(on).toContain('42 cm'); expect((on.match(/data-hc-eye/g) ?? []).length).toBe(2)
    expect(svg('hcsr04', { hcsr04: { powered: true, distanceCm: 500, inRange: false, pings: 0 } })).toContain('menzil dışı')
  })
  it('DHT: DHT11 mavi, DHT22 beyaz gövde; okuma yazılır', () => {
    expect(svg('dht', undefined, { type: 'dht11' })).toContain('data-dht-type="dht11"')
    expect(svg('dht', undefined, { type: 'dht11' })).toContain('#2f7fc9')
    expect(svg('dht', undefined, { type: 'dht22' })).toContain('#f1f5f9')
    const m = svg('dht', { dht: { powered: true, type: 'dht22', tempC: 23.5, humidity: 61, reads: 1 } })
    expect(m).toContain('23,5°C 61%'); expect(m).toContain('DHT22')
  })
  it('PIR: çıkış ve ısınma', () => {
    expect(svg('pir', { pir: { powered: true, out: true, warmingUp: false } })).toContain('data-pir-out="true"')
    expect(svg('pir', { pir: { powered: true, out: false, warmingUp: false } })).toContain('data-pir-out="false"')
    expect(svg('pir', { pir: { powered: true, out: false, warmingUp: true } })).toContain('data-pir-warmup="true"')
  })
  it('IR engel: algılanınca sinyal LED’i yanar', () => {
    const on = svg('irobstacle', { irobstacle: { powered: true, out: false, detected: true, aoVolts: 3 } })
    const off = svg('irobstacle', { irobstacle: { powered: true, out: true, detected: false, aoVolts: 0.2 } })
    expect(on).toContain('data-ir-detected="true"'); expect((on.match(/data-led-on="true"/g) ?? []).length).toBe(2)
    expect(off).toContain('data-ir-detected="false"'); expect((off.match(/data-led-on="true"/g) ?? []).length).toBe(1)
  })
  it('reed: mıknatıs yakınken kapalı', () => {
    expect(svg('reed', { reed: { closed: true } })).toContain('data-reed-closed="true"')
    expect(svg('reed', { reed: { closed: false } })).toContain('data-reed-closed="false"')
    expect(svg('reed', undefined, { magnet: true })).toContain('data-reed-closed="true"')
  })
  it('BMP280 ve MPU6050: okuma ve eksenler', () => {
    expect(svg('bmp280', { bmp280: { powered: true, present: true, tempC: 21.5, pressureHpa: 1000 } })).toContain('21,5°C')
    const m = svg('mpu6050', { mpu6050: { powered: true, present: true, ax: 0.5, ay: -0.25, az: 0.98, gx: 0, gy: 0, gz: 0 } })
    expect(m).toContain('data-mpu-ax="0.50"'); expect(m).toContain('data-mpu-ay="-0.25"'); expect(m).toContain('Z 0,98g')
    expect(svg('mpu6050', undefined, { ax: 1 })).toContain('data-mpu-ax="1.00"')
  })
  it('RTC: saat yazılır', () => {
    expect(svg('rtc', { rtc: { powered: true, present: true, time: '2026-03-04T12:34:56Z' } })).toContain('data-rtc-time="12:34:56"')
    expect(svg('rtc')).toContain('data-rtc-time=""')
  })
  it('joystick: çubuk eksene göre kayar, düğme basılı', () => {
    const c = svg('joystick', { joystick: { powered: true, x: 0.5, y: 0.5, pressed: false, vrxVolts: 2.5, vryVolts: 2.5 } })
    const l = svg('joystick', { joystick: { powered: true, x: 0, y: 1, pressed: true, vrxVolts: 0, vryVolts: 5 } })
    expect(c).toContain('data-joy-pressed="false"'); expect(l).toContain('data-joy-pressed="true"')
    expect(c).not.toEqual(l); expect(l).toContain('data-joy-x="0.00"')
  })
  it('enkoder: konuma göre döner, basılıyken küçülür', () => {
    expect(svg('encoder', { encoder: { position: 5, moving: false, clk: true, dt: false, pressed: false } })).toContain('data-encoder-angle="90"')
    expect(svg('encoder', { encoder: { position: -1, moving: true, clk: true, dt: true, pressed: true } })).toContain('data-encoder-pressed="true"')
    expect(svg('encoder', undefined, { position: 2 })).toContain('data-encoder-angle="36"')
  })
  it('keypad: yalnız basılı tuş vurgulanır', () => {
    const m = svg('keypad', { keypad: { key: '7' } })
    expect(m).toContain('data-keypad-key="7"'); expect((m.match(/data-key-down="true"/g) ?? []).length).toBe(1)
    expect(m).toMatch(/data-key="7" data-key-down="true"/)
    expect((svg('keypad', { keypad: { key: null } }).match(/data-key-down="true"/g) ?? []).length).toBe(0)
    expect(svg('keypad', undefined, { key: 'D' })).toMatch(/data-key="D" data-key-down="true"/)
    expect((svg('keypad').match(/data-key=/g) ?? []).length).toBe(16)
  })
  it('MQ-2 / alev / ses / toprak: düzey, güç ve DO LED’i', () => {
    for (const t of ['mq2', 'flame', 'sound', 'soil'] as const) {
      const hi = svg(t, analog({ level: 0.8, doHigh: false }))
      expect(hi, t).toContain('data-module-level="0.80"'); expect(hi, t).toContain('data-module-do="low"')
      expect((hi.match(/data-led-on="true"/g) ?? []).length, t).toBe(2)
      const lo = svg(t, analog({ level: 0, doHigh: true }))
      expect(lo, t).toContain('data-module-do="high"'); expect((lo.match(/data-led-on="true"/g) ?? []).length, t).toBe(1)
      expect(svg(t, analog({ powered: false })), t).toContain('data-module-powered="false"')
    }
    expect(svg('flame', analog({ level: 0.6 }))).toContain('data-flame-visible')
    expect(svg('flame', analog({ level: 0 }))).not.toContain('data-flame-visible')
    expect(svg('sound', analog({ level: 0.7 }))).toContain('data-sound-wave')
    expect(svg('soil', analog({ level: 1 }))).toContain('data-soil-fill="62"')
    expect(svg('soil', undefined, { moisture: 0.5 })).toContain('data-soil-fill="31"')
  })
})

describe('Aşama C özellik paneli (canlı kaydırıcılar)', () => {
  const panel = (type: PartType, running: boolean) => renderToStaticMarkup(createElement(PropsPanel, {
    selection: { kind: 'part', id: `${type}1` }, part: part(type), runtime: null, wireInfo: null, running, locked: false, latched: false,
    onLatch: () => {}, onProp: () => {}, onRotate: () => {}, onDelete: () => {},
  }))
  it('çalışırken canlı kaydırıcılar etkin, canlı olmayanlar kilitli', () => {
    const hc = panel('hcsr04', true)
    expect(hc).toContain('Mesafe'); expect(hc).not.toMatch(/type="range"[^>]*disabled/)
    const dht = panel('dht', true)
    expect(dht).toContain('Sıcaklık'); expect(dht).toContain('Nem'); expect(dht).toMatch(/<select[^>]*disabled/)
    expect(panel('pir', true)).toContain('Hareket')
    expect(panel('mpu6050', true)).toContain('İvme X')
    expect(panel('joystick', true)).toContain('X ekseni')
    expect(panel('keypad', true)).toContain('Basılı tuş')
  })
  it('enkoder konumu (negatif alt sınır) logaritmik değil, doğrusal kaydırıcı', () => {
    const m = panel('encoder', true)
    expect(m).toContain('min="-10000"'); expect(m).toContain('max="10000"'); expect(m).not.toContain('NaN')
  })
  it('her Aşama C parçasının paneli çökmeden çizilir', () => {
    for (const t of STAGE_C_PARTS) expect(panel(t, false).length, t).toBeGreaterThan(100)
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
