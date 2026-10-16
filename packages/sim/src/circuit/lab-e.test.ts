// Aşama E: veri yolu cihazları gerçek Arduino kütüphaneleriyle. Hex'ler değiştirilmemiş kütüphanelerle derlenmiştir:
// başlangıç sketch'leri lab-fixtures-d.ts (content-src/muhendislik/sketches), test sketch'leri lab-fixtures-e.ts (tools/sim/lab-e).
import { describe, expect, it, vi } from 'vitest'
import { analyzeCircuit, createLab, crc8, DS18B20_ROM } from '../index.js'
import type { Circuit, LabApi, PartInstance, PartType, PropValue, Wire } from '../index.js'
import { PINS, PROPS } from './contract.js'
import { BME280_OKU_HEX, DS18B20_OKU_HEX, OLED_MERHABA_HEX, VL53L0X_MESAFE_HEX } from './lab-fixtures-d.js'
import { OLED_KAPAT_HEX, ONEWIRE_HAM_HEX, VL53_SUREKLI_HEX } from './lab-fixtures-e.js'

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
const i2c = (id: string): Array<[string, string]> => [[`${id}.VCC`, 'uno.5V'], [`${id}.GND`, 'uno.GND'], [`${id}.SDA`, 'uno.A4'], [`${id}.SCL`, 'uno.A5']]

/** base64 → 1024 bayt; (x, y) pikseli. */
const decode = (b64: string): Uint8Array => {
  const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  const out: number[] = []
  for (let i = 0; i < b64.length; i += 4) {
    const n = [0, 1, 2, 3].map((k) => (b64[i + k] === '=' ? 0 : A.indexOf(b64[i + k])))
    const v = (n[0] << 18) | (n[1] << 12) | (n[2] << 6) | n[3]
    out.push((v >> 16) & 255); if (b64[i + 2] !== '=') out.push((v >> 8) & 255); if (b64[i + 3] !== '=') out.push(v & 255)
  }
  return Uint8Array.from(out)
}
const lit = (px: Uint8Array, x: number, y: number): boolean => ((px[(y >> 3) * 128 + x] >> (y & 7)) & 1) === 1
const count = (px: Uint8Array, x0 = 0, y0 = 0, x1 = 128, y1 = 64): number => {
  let n = 0
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) if (lit(px, x, y)) n++
  return n
}

describe('sözleşme: Aşama E parçaları', () => {
  it('pinler ve özellikler', () => {
    expect(PINS.oled).toEqual(['VCC', 'GND', 'SDA', 'SCL'])
    expect(PINS.ds18b20).toEqual(['VCC', 'GND', 'DQ'])
    expect(PINS.vl53l0x).toContain('XSHUT')
    expect(PROPS.oled[0].options?.map((o) => o.value)).toEqual(['0x3C', '0x3D'])
    expect(PROPS.bme280.map((p) => p.key)).toEqual(['tempC', 'pressureHpa', 'humidity', 'address'])
    expect(PROPS.vl53l0x[0]).toMatchObject({ key: 'distanceMm', live: true })
  })
  it('ROM geçerli CRC taşır, aile 0x28', () => {
    expect(DS18B20_ROM[0]).toBe(0x28)
    expect(crc8(DS18B20_ROM, 7)).toBe(DS18B20_ROM[7])
    expect(crc8([0x02, 0x1c, 0xb8, 0x01, 0, 0, 0])).toBe(0xa2) // Maxim AN27 örneği
  })
})

// ---------------------------------------------------------------------------------------------------------------------
// SSD1306 OLED (Adafruit_SSD1306 2.5.16 + GFX)
// ---------------------------------------------------------------------------------------------------------------------
describe('SSD1306 OLED', () => {
  const oled = (props: Record<string, PropValue> = {}): Circuit => circuit([part('o', 'oled', props)], i2c('o'))
  it('başlangıç sketch\'i: "Merhaba!" yazısı, çerçeve ve dolu daire yanar', () => {
    const lab = createLab(oled(), OLED_MERHABA_HEX)
    lab.advance(900)
    expect(lab.state.serial).toContain('OLED hazir')
    const o = rt(lab, 'o').oled!
    expect(o).toMatchObject({ powered: true, present: true, on: true, inverted: false })
    const px = decode(o.pixels)
    expect(px).toHaveLength(1024)
    // çerçeve: üst kenar (y=0) ve sol kenar (x=0) tümüyle yanık
    for (let x = 0; x < 128; x++) expect(lit(px, x, 0), `x=${x}`).toBe(true)
    for (let y = 0; y < 24; y++) expect(lit(px, 0, y), `y=${y}`).toBe(true)
    // yazı bölgesi (4..100, 4..20) dolu, çerçevenin içi yazı dışında boş
    expect(count(px, 4, 4, 100, 20)).toBeGreaterThan(150)
    expect(count(px, 101, 2, 127, 22)).toBe(0)
    // dolu daire merkezi (112, 46)
    expect(lit(px, 112, 46)).toBe(true)
    expect(count(px, 102, 36, 123, 57)).toBeGreaterThan(250)
    // sayaç satırı (t = …)
    expect(count(px, 0, 44, 60, 52)).toBeGreaterThan(20)
  })
  it('ekran kapat/aç ve ters renk komutları', () => {
    const lab = createLab(oled(), OLED_KAPAT_HEX)
    lab.advance(1200)
    let px = decode(rt(lab, 'o').oled!.pixels)
    expect(count(px)).toBe(64 * 32)
    expect(lit(px, 0, 0)).toBe(true); expect(lit(px, 63, 31)).toBe(true); expect(lit(px, 64, 0)).toBe(false); expect(lit(px, 0, 32)).toBe(false)
    lab.advance(800) // t = 2 s: kapalı
    expect(last(lab)).toBe('kapali')
    expect(rt(lab, 'o').oled).toMatchObject({ on: false })
    expect(count(decode(rt(lab, 'o').oled!.pixels))).toBe(0)
    lab.advance(1000) // t = 3 s: açık, RAM korunmuş
    expect(rt(lab, 'o').oled!.on).toBe(true)
    expect(count(decode(rt(lab, 'o').oled!.pixels))).toBe(64 * 32)
    lab.advance(1000) // t = 4 s: ters renk
    const o = rt(lab, 'o').oled!
    expect(o.inverted).toBe(true)
    px = decode(o.pixels)
    expect(count(px)).toBe(128 * 64 - 64 * 32)
    expect(lit(px, 0, 0)).toBe(false); expect(lit(px, 100, 50)).toBe(true)
  })
  it('yanlış adres (0x3D) ya da SDA kopuk: ekran karanlık (Adafruit begin() ACK denetlemez, gerçekte de "hazır" der)', () => {
    const a = createLab(oled({ address: '0x3D' }), OLED_MERHABA_HEX)
    a.advance(600)
    expect(rt(a, 'o').oled).toMatchObject({ present: true, on: false })
    expect(count(decode(rt(a, 'o').oled!.pixels))).toBe(0)
    const c = without(oled(), 'o.SDA')
    expect(analyzeCircuit(c).warnings.some((w) => w.partId === 'o' && /SDA/.test(w.message))).toBe(true)
    const b = createLab(c, OLED_MERHABA_HEX)
    b.advance(600)
    expect(rt(b, 'o').oled).toMatchObject({ present: false, on: false })
  })
  it('besleme yoksa uyarı ve karanlık ekran', () => {
    const c = without(oled(), 'o.VCC')
    expect(analyzeCircuit(c).warnings.some((w) => w.kind === 'unpowered' && w.partId === 'o')).toBe(true)
    const lab = createLab(c, OLED_MERHABA_HEX)
    lab.advance(300)
    expect(rt(lab, 'o').oled).toMatchObject({ powered: false, on: false })
  })
})

// ---------------------------------------------------------------------------------------------------------------------
// BME280 (Adafruit BME280 Library 2.2.4)
// ---------------------------------------------------------------------------------------------------------------------
describe('BME280', () => {
  const bme = (props: Record<string, PropValue> = {}): Circuit => circuit([part('b', 'bme280', props)], i2c('b'))
  const read = (lab: LabApi) => { const l = last(lab); return { t: numAfter(l, 'T'), p: numAfter(l, 'P'), h: numAfter(l, 'H') } }
  it.each([
    [25, 1013.25, 50], [-12.3, 850.5, 12], [41.7, 1080, 93],
  ])('T=%s °C, P=%s hPa, H=%s %% geri okunur', (t, p, h) => {
    const lab = createLab(bme({ tempC: t, pressureHpa: p, humidity: h }), BME280_OKU_HEX)
    lab.advance(400)
    const r = read(lab)
    expect(Math.abs(r.t - t)).toBeLessThanOrEqual(0.1)
    expect(Math.abs(r.p - p)).toBeLessThanOrEqual(0.5)
    expect(Math.abs(r.h - h)).toBeLessThanOrEqual(1)
    expect(rt(lab, 'b').bme280).toMatchObject({ powered: true, present: true })
  })
  it('canlı özellik değişikliği sonraki okumada gelir', () => {
    const lab = createLab(bme({ tempC: 20, pressureHpa: 1000, humidity: 40 }), BME280_OKU_HEX)
    lab.advance(400)
    expect(read(lab).t).toBeCloseTo(20, 1)
    lab.setProp('b', 'tempC', 30.5); lab.setProp('b', 'humidity', 70); lab.setProp('b', 'pressureHpa', 990)
    lab.advance(1000)
    const r = read(lab)
    expect(Math.abs(r.t - 30.5)).toBeLessThanOrEqual(0.1)
    expect(Math.abs(r.h - 70)).toBeLessThanOrEqual(1)
    expect(Math.abs(r.p - 990)).toBeLessThanOrEqual(0.5)
  })
  it('0x77 adresinde ya da beslemesiz bulunamaz', () => {
    const a = createLab(bme({ address: '0x77' }), BME280_OKU_HEX)
    a.advance(300)
    expect(last(a)).toBe('BME280 bulunamadi')
    const b = createLab(without(bme(), 'b.VCC'), BME280_OKU_HEX)
    b.advance(300)
    expect(last(b)).toBe('BME280 bulunamadi')
    expect(rt(b, 'b').bme280!.present).toBe(false)
  })
})

// ---------------------------------------------------------------------------------------------------------------------
// DS18B20 (OneWire 2.3.8 + DallasTemperature 4.0.5)
// ---------------------------------------------------------------------------------------------------------------------
describe('DS18B20', () => {
  const ds = (tempC: number, o: { pullup?: boolean; ohms?: number } = {}): Circuit => circuit(
    [part('t', 'ds18b20', { tempC }), ...(o.pullup === false ? [] : [part('r', 'resistor', { ohms: o.ohms ?? 4700 })])],
    [['t.GND', 'uno.GND'], ['t.VCC', 'uno.5V'], ['t.DQ', 'uno.D2'], ...(o.pullup === false ? [] : [['r.1', 't.DQ'], ['r.2', 'uno.5V']] as Array<[string, string]>)],
  )
  it.each([[23.5], [-10.25], [85.0625]])('DallasTemperature: %s °C', (t) => {
    const lab = createLab(ds(t), DS18B20_OKU_HEX)
    lab.advance(1100)
    expect(lines(lab.state.serial)[0]).toBe('sensor sayisi=1')
    expect(Math.abs(numAfter(last(lab), 'T') - t)).toBeLessThanOrEqual(0.0625)
    expect(rt(lab, 't').ds18b20).toMatchObject({ powered: true, present: true, pullup: true, resolution: 12 })
    expect(rt(lab, 't').ds18b20!.conversions).toBeGreaterThan(0)
  })
  it('canlı sıcaklık değişikliği', () => {
    const lab = createLab(ds(20), DS18B20_OKU_HEX)
    lab.advance(1100)
    lab.setProp('t', 'tempC', -3.5)
    lab.advance(1800)
    expect(numAfter(last(lab), 'T')).toBe(-3.5)
  })
  it('düz OneWire: READ ROM + CRC, CONVERT T meşgulken 0 okunur (~600 ms), karalama belleği CRC tutar', () => {
    const lab = createLab(ds(-21.0625), ONEWIRE_HAM_HEX)
    lab.advance(800)
    const hex = DS18B20_ROM.map((b) => b.toString(16).toUpperCase().padStart(2, '0')).join('')
    expect(lines(lab.state.serial)[0]).toBe(`rom=${hex} crc=ok`)
    const l = last(lab)
    expect(l).toContain('crc=ok')
    expect(numAfter(l, 'T')).toBe(-21.0625)
    expect(numAfter(l, 'sure')).toBeGreaterThanOrEqual(595)
    expect(numAfter(l, 'sure')).toBeLessThanOrEqual(605)
  })
  it('pull-up direnci yoksa cihaz bulunamaz ve statik uyarı verilir', () => {
    const c = ds(25, { pullup: false })
    expect(analyzeCircuit(c).warnings.some((w) => w.partId === 't' && /pull-up/.test(w.message))).toBe(true)
    expect(analyzeCircuit(ds(25)).warnings.filter((w) => w.partId === 't')).toEqual([])
    const lab = createLab(c, DS18B20_OKU_HEX)
    lab.advance(1500)
    expect(lines(lab.state.serial)[0]).toBe('sensor sayisi=0')
    expect(last(lab)).toBe('sensor yok')
    expect(rt(lab, 't').ds18b20).toMatchObject({ powered: true, pullup: false, present: false })
    // 100 kΩ pull-up çok zayıf: sayılmaz
    expect(analyzeCircuit(ds(25, { ohms: 100_000 })).warnings.some((w) => /pull-up/.test(w.message))).toBe(true)
  })
  it('besleme yoksa cevap vermez (düz OneWire: varlık darbesi yok)', () => {
    const c = without(ds(25), 't.VCC')
    expect(analyzeCircuit(c).warnings.some((w) => w.kind === 'unpowered' && w.partId === 't')).toBe(true)
    const lab = createLab(c, ONEWIRE_HAM_HEX)
    lab.advance(300)
    expect(lines(lab.state.serial)[0]).toBe('varlik yok')
    const lab2 = createLab(c, DS18B20_OKU_HEX)
    lab2.advance(1500)
    expect(last(lab2)).toBe('sensor yok')
  })
})

// ---------------------------------------------------------------------------------------------------------------------
// VL53L0X (Pololu VL53L0X 1.3.1)
// ---------------------------------------------------------------------------------------------------------------------
describe('VL53L0X', () => {
  const tof = (mm: number, extra: Array<[string, string]> = []): Circuit => circuit([part('v', 'vl53l0x', { distanceMm: mm })], [...i2c('v'), ...extra])
  it.each([[50], [347], [1890]])('tek atış: %s mm', (mm) => {
    const lab = createLab(tof(mm), VL53L0X_MESAFE_HEX)
    lab.advance(600)
    expect(last(lab)).toBe(`mm=${mm}`)
    expect(rt(lab, 'v').vl53l0x).toMatchObject({ powered: true, present: true, inRange: true, continuous: false })
    expect(rt(lab, 'v').vl53l0x!.measurements).toBeGreaterThan(2)
  })
  it('menzil dışı (> 2000 mm): 8190 okunur', () => {
    const lab = createLab(tof(2400), VL53L0X_MESAFE_HEX)
    lab.advance(600)
    expect(lines(lab.state.serial)).toContain('menzil disi 8190')
    expect(rt(lab, 'v').vl53l0x!.inRange).toBe(false)
  })
  it('ölçüm süresi gerçekçi (~30 ms): 1 s içinde 7-8 okuma (100 ms bekleme ile)', () => {
    const lab = createLab(tof(500), VL53L0X_MESAFE_HEX)
    lab.advance(300)
    const n0 = lines(lab.state.serial).length
    lab.advance(1000)
    const n = lines(lab.state.serial).length - n0
    expect(n).toBeGreaterThanOrEqual(6)
    expect(n).toBeLessThanOrEqual(9)
  })
  it('XSHUT GND\'ye bağlı: sensör kapalı, init() başarısız', () => {
    const lab = createLab(tof(500, [['v.XSHUT', 'uno.GND']]), VL53L0X_MESAFE_HEX)
    lab.advance(300)
    expect(last(lab)).toBe('VL53L0X bulunamadi')
    expect(rt(lab, 'v').vl53l0x!.present).toBe(false)
  })
  it('sürekli kip, XSHUT D7 ile yeniden başlatma; canlı mesafe değişikliği', () => {
    const lab = createLab(tof(800, [['v.XSHUT', 'uno.D7']]), VL53_SUREKLI_HEX)
    lab.advance(400)
    expect(lab.state.serial).toContain('surekli')
    expect(last(lab)).toBe('mm=800')
    expect(rt(lab, 'v').vl53l0x!.continuous).toBe(true)
    lab.setProp('v', 'distanceMm', 120)
    lab.advance(200)
    expect(last(lab)).toBe('mm=120')
    lab.setProp('v', 'distanceMm', 2300)
    lab.advance(200)
    expect(last(lab)).toBe('mm=8190')
  })
})
