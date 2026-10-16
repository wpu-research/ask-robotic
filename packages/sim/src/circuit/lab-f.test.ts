// HC-05 Bluetooth (UART): değiştirilmemiş SoftwareSerial ile bit düzeyinde. Başlangıç sketch'leri lab-fixtures-d.ts
// (content-src/muhendislik/sketches), hız hatası sketch'i lab-fixtures-e.ts (tools/sim/lab-e).
import { describe, expect, it, vi } from 'vitest'
import { analyzeCircuit, createLab, HC05_AT_BAUD } from '../index.js'
import type { Circuit, LabApi, PartInstance, PartType, PropValue, Wire } from '../index.js'
import { PINS, PROPS } from './contract.js'
import { HC05_AT_HEX, HC05_LED_HEX } from './lab-fixtures-d.js'
import { HC05_HIZ_HATASI_HEX } from './lab-fixtures-e.js'

vi.setConfig({ testTimeout: 180_000 })

const part = (id: string, type: PartType, props: Record<string, PropValue> = {}): PartInstance => ({ id, type, x: 0, y: 0, rotation: 0, props })
const ref = (s: string): { part: string; pin: string } => { const i = s.indexOf('.'); return { part: s.slice(0, i), pin: s.slice(i + 1) } }
const wire = (a: string, b: string): Wire => ({ id: `${a}~${b}`, a: ref(a), b: ref(b) })
const circuit = (parts: PartInstance[], wires: Array<[string, string]>): Circuit => ({ parts: [part('uno', 'uno'), ...parts], wires: wires.map(([a, b]) => wire(a, b)) })
const rt = (lab: LabApi) => lab.state.parts.h.hc05!
const hcWarnings = (c: Circuit) => analyzeCircuit(c).warnings.filter((w) => w.partId === 'h')

/** Başlangıç devresi: TXD → D10, D11 → 1 kΩ → RXD → 2 kΩ → GND, STATE → D4. */
const BASE: Array<[string, string]> = [
  ['h.VCC', 'uno.5V'], ['h.GND', 'uno.GND'], ['h.TXD', 'uno.D10'], ['h.STATE', 'uno.D4'],
  ['r1.1', 'uno.D11'], ['r1.2', 'h.RXD'], ['r2.1', 'h.RXD'], ['r2.2', 'uno.GND'],
]
const hc05 = (props: Record<string, PropValue> = {}, extra: Array<[string, string]> = []): Circuit =>
  circuit([part('h', 'hc05', props), part('r1', 'resistor', { ohms: 1000 }), part('r2', 'resistor', { ohms: 2000 })], [...BASE, ...extra])

describe('sözleşme: HC-05', () => {
  it('pinler (ZS-040 başlık sırası) ve canlı "telefon bağlı" özelliği', () => {
    expect(PINS.hc05).toEqual(['EN', 'VCC', 'GND', 'TXD', 'RXD', 'STATE'])
    expect(PROPS.hc05[0]).toMatchObject({ key: 'connected', kind: 'bool', default: true, live: true })
  })
})

describe('HC-05 statik uyarılar', () => {
  it('bölücülü başlangıç devresi temiz', () => {
    expect(hcWarnings(hc05())).toEqual([])
  })
  it('RXD doğrudan D11: 3,3 V lojik uyarısı', () => {
    const c = circuit([part('h', 'hc05')], [['h.VCC', 'uno.5V'], ['h.GND', 'uno.GND'], ['h.TXD', 'uno.D10'], ['h.RXD', 'uno.D11']])
    const w = hcWarnings(c)
    expect(w.map((x) => x.kind)).toEqual(['logic-level'])
    expect(w[0].message).toMatch(/1 kΩ \/ 2 kΩ/)
  })
  it('D0/D1 (USB seri hattı) uyarısı', () => {
    const c = circuit([part('h', 'hc05')], [['h.VCC', 'uno.5V'], ['h.GND', 'uno.GND'], ['h.TXD', 'uno.D0']])
    expect(hcWarnings(c).some((w) => /D0\/D1/.test(w.message))).toBe(true)
  })
  it('besleme ve veri uçları yok', () => {
    const w = hcWarnings(circuit([part('h', 'hc05')], []))
    expect(w.some((x) => x.kind === 'unpowered')).toBe(true)
    expect(w.some((x) => /TXD ve RXD/.test(x.message))).toBe(true)
  })
})

describe('HC-05 veri kipi (SoftwareSerial 9600)', () => {
  it('bağlanınca telefona karşılama, "1"/"0" LED\'i yakar/söndürür', () => {
    const lab = createLab(hc05(), HC05_LED_HEX)
    lab.advance(300)
    expect(lab.state.serial).toContain('HC-05 hazir')
    expect(lab.state.serial).toContain('telefon bagli')
    expect(rt(lab)).toMatchObject({ powered: true, mode: 'data', connected: true, baud: 9600, framingErrors: 0 })
    expect(rt(lab).phone).toContain('Merhaba! 1: LED yak, 0: sondur, ?: durum\r\n')
    expect(lab.state.pins.D4.high).toBe(true)

    lab.phoneSend('h', '1')
    lab.advance(100)
    expect(lab.state.pins.D13.high).toBe(true)
    expect(rt(lab).phone).toContain('1LED acik\r\n') // telefon terminali gönderileni de gösterir
    expect(lab.state.serial).toContain('komut 1')

    lab.phoneSend('h', '?')
    lab.advance(100)
    expect(rt(lab).phone.endsWith('?LED acik\r\n')).toBe(true)

    lab.phoneSend('h', '0')
    lab.advance(100)
    expect(lab.state.pins.D13.high).toBe(false)
    expect(rt(lab).phone.endsWith('0LED kapali\r\n')).toBe(true)
    expect(rt(lab).framingErrors).toBe(0)
  })
  it('telefon bağlantısı kopunca STATE LOW, telefondan gelenler Arduino\'ya ulaşmaz', () => {
    const lab = createLab(hc05(), HC05_LED_HEX)
    lab.advance(200)
    lab.setProp('h', 'connected', false)
    lab.advance(100)
    expect(lab.state.pins.D4.high).toBe(false)
    expect(lab.state.serial).toContain('baglanti yok')
    expect(rt(lab).connected).toBe(false)
    lab.phoneSend('h', '1')
    lab.advance(100)
    expect(lab.state.pins.D13.high).toBe(false)
    lab.setProp('h', 'connected', true)
    lab.advance(200)
    expect(lab.state.serial.match(/telefon bagli/g)).toHaveLength(2)
  })
  it('beslenmezse sessiz', () => {
    const c = hc05()
    const lab = createLab({ ...c, wires: c.wires.filter((w) => w.a.pin !== 'VCC') }, HC05_LED_HEX)
    lab.advance(300)
    expect(rt(lab)).toMatchObject({ powered: false, connected: false, phone: '' })
    expect(lab.state.serial).not.toContain('telefon bagli')
  })
  it('RXD bağlı değilse Arduino gönderemez ama telefondan komut alır', () => {
    const lab = createLab(circuit([part('h', 'hc05')], [['h.VCC', 'uno.5V'], ['h.GND', 'uno.GND'], ['h.TXD', 'uno.D10'], ['h.STATE', 'uno.D4']]), HC05_LED_HEX)
    lab.advance(200)
    expect(rt(lab).phone).toBe('')
    lab.phoneSend('h', '1')
    lab.advance(100)
    expect(lab.state.pins.D13.high).toBe(true)
  })
  it('baud uyuşmazlığı (Arduino 38400, modül 9600): telefonda bozuk karakterler', () => {
    const lab = createLab(hc05(), HC05_HIZ_HATASI_HEX)
    lab.advance(700)
    const r = rt(lab)
    expect(r.rxBytes).toBeGreaterThan(0)
    expect(r.phone).not.toContain('merhaba')
  })
})

describe('HC-05 AT kipi (EN güç verilirken HIGH, 38400)', () => {
  const at = (): LabApi => createLab(hc05({}, [['h.EN', 'uno.3V3']]), HC05_AT_HEX)
  const ask = (lab: LabApi, cmd: string): string => {
    const before = lab.state.serial.length
    lab.sendSerial(cmd + '\n')
    lab.advance(150)
    return lab.state.serial.slice(before)
  }
  it('AT komutlarına cevap verir; ad, şifre ve hız', () => {
    const lab = at()
    lab.advance(100)
    expect(lab.state.serial).toContain('AT kipi')
    expect(rt(lab)).toMatchObject({ mode: 'at', baud: HC05_AT_BAUD, connected: false })
    expect(lab.state.pins.D4.high).toBe(false) // AT kipinde bağlantı yok
    expect(ask(lab, 'AT')).toBe('OK\r\n')
    expect(ask(lab, 'AT+NAME?')).toBe('+NAME:HC-05\r\nOK\r\n')
    expect(ask(lab, 'AT+NAME=Robotum')).toBe('OK\r\n')
    expect(ask(lab, 'AT+NAME?')).toBe('+NAME:Robotum\r\nOK\r\n')
    expect(rt(lab).name).toBe('Robotum')
    expect(ask(lab, 'AT+PSWD?')).toBe('+PSWD:1234\r\nOK\r\n')
    expect(ask(lab, 'AT+UART?')).toBe('+UART:9600,0,0\r\nOK\r\n')
    expect(ask(lab, 'AT+UART=12345,0,0')).toBe('ERROR:(1C)\r\n')
    expect(ask(lab, 'AT+UART=38400,0,0')).toBe('OK\r\n')
    expect(ask(lab, 'AT+UART?')).toBe('+UART:38400,0,0\r\nOK\r\n')
    expect(ask(lab, 'AT+VERSION?')).toBe('+VERSION:2.0-20100601\r\nOK\r\n')
    expect(ask(lab, 'MERHABA')).toBe('ERROR:(0)\r\n')
    // telefon AT kipinde bağlanamaz
    lab.phoneSend('h', 'x')
    expect(rt(lab).phone).toBe('')
  })
  it('EN boştayken veri kipi: AT komutları telefona gider, cevap gelmez', () => {
    const lab = createLab(hc05(), HC05_AT_HEX)
    lab.advance(100)
    expect(rt(lab).mode).toBe('data')
    // köprü 38400'de, modül 9600'de: cevap yok, telefonda anlamsız baytlar
    expect(ask(lab, 'AT')).toBe('')
    expect(rt(lab).phone).not.toContain('AT')
  })
})
