// Aşama C (Modül 4) parçaları: HC-SR04, DHT11/22, PIR, IR engel, reed, BMP280, MPU6050, joystick, enkoder, keypad, RTC ve analog modüller.
// Hex'ler Modül 4 ders sketch'lerinin (ve küçük test sketch'lerinin) derlenmiş halidir (lab-fixtures-c.ts). Sayısal beklentiler yorumlarda hesaplanmıştır.
import { describe, expect, it, vi } from 'vitest'
import { analyzeCircuit, createLab } from '../index.js'
import type { Circuit, LabApi, PartInstance, PartType, PropValue, Wire } from '../index.js'
import { PINS, PROPS } from './contract.js'
import {
  ANALOG_DO_HEX, BMP_OKU_HEX, DHT11_OKU_HEX, DHT_OKU_HEX, ENKODER_BASIT_HEX, I2C_TARAMA_C_HEX, IR_ENGEL_HEX, JOYSTICK_HAM_HEX, KEYPAD_TUS_HEX,
  MPU_HAM_HEX, PINS234_HEX, PIR_ISINMA_HEX, PIR_KENAR_HEX, REED_KAPI_HEX, RTC_SAAT_HEX, SONAR_PULSEIN_HEX, SONAR_US_HEX,
} from './lab-fixtures-c.js'
import { MODEL } from './model.js'

vi.setConfig({ testTimeout: 180_000 }) // gerçek hex'li benzetimler saniyeler sürer

const part = (id: string, type: PartType, props: Record<string, PropValue> = {}): PartInstance => ({ id, type, x: 0, y: 0, rotation: 0, props })
const ref = (s: string): { part: string; pin: string } => { const i = s.indexOf('.'); return { part: s.slice(0, i), pin: s.slice(i + 1) } }
const wire = (a: string, b: string): Wire => ({ id: `${a}~${b}`, a: ref(a), b: ref(b) })
const circuit = (parts: PartInstance[], wires: Array<[string, string]>): Circuit => ({ parts: [part('uno', 'uno'), ...parts], wires: wires.map(([a, b]) => wire(a, b)) })
const kinds = (lab: LabApi): string[] => lab.state.warnings.map((w) => w.kind)
const rt = (lab: LabApi, id: string) => lab.state.parts[id]
const lines = (s: string): string[] => s.trim().split(/\r?\n/).filter(Boolean)
const last = (lab: LabApi): string => lines(lab.state.serial).at(-1) ?? ''
const without = (c: Circuit, s: string): Circuit => ({ ...c, wires: c.wires.filter((w) => `${w.a.part}.${w.a.pin}` !== s && `${w.b.part}.${w.b.pin}` !== s) })
const clearSerial = (lab: LabApi): void => { (lab as unknown as { sim: { serial: string } }).sim.serial = '' }

// ---------------------------------------------------------------------------------------------------------------------
describe('sözleşme: Aşama C parçalarının pin ve özellik tanımları', () => {
  const C: PartType[] = ['hcsr04', 'dht', 'pir', 'irobstacle', 'reed', 'bmp280', 'mpu6050', 'joystick', 'encoder', 'keypad', 'rtc', 'mq2', 'flame', 'sound', 'soil']
  it('her parçanın pinleri ve benzersiz özellik anahtarları var; mevcut parçalar bozulmadı', () => {
    for (const t of C) {
      expect(PINS[t].length).toBeGreaterThan(1)
      expect(new Set(PINS[t]).size).toBe(PINS[t].length)
      const keys = PROPS[t].map((p) => p.key)
      expect(new Set(keys).size).toBe(keys.length)
    }
    expect(PINS.hcsr04).toEqual(['VCC', 'TRIG', 'ECHO', 'GND'])
    expect(PINS.dht).toEqual(['VCC', 'DATA', 'GND'])
    expect(PINS.pir).toEqual(['VCC', 'OUT', 'GND'])
    expect(PROPS.hcsr04[0]).toMatchObject({ key: 'distanceCm', min: 2, max: 400, live: true })
    expect(PINS.lcdI2c).toEqual(['GND', 'VCC', 'SDA', 'SCL'])
    expect(PINS.servo).toEqual(['SIG', 'VCC', 'GND'])
    expect(PROPS.pot.map((p) => p.key)).toEqual(['position', 'ohms'])
  })
})

// ---------------------------------------------------------------------------------------------------------------------
// HC-SR04 (ders 37): TRIG D9, ECHO D10. Echo süresi = cm · 58,2 µs (+ ~450 µs sonra başlar; pulseIn yalnız HIGH süresini ölçer).
// ---------------------------------------------------------------------------------------------------------------------
const sonar = (extra: { vcc?: boolean; gnd?: boolean; echo?: boolean; cm?: number } = {}): Circuit => {
  const { vcc = true, gnd = true, echo = true, cm = 100 } = extra
  const w: Array<[string, string]> = [['hc.TRIG', 'uno.D9']]
  if (vcc) w.push(['hc.VCC', 'uno.5V'])
  if (gnd) w.push(['hc.GND', 'uno.GND'])
  if (echo) w.push(['hc.ECHO', 'uno.D10'])
  return circuit([part('hc', 'hcsr04', { distanceCm: cm })], w)
}
const echoUs = (lab: LabApi): number => Number(last(lab))

describe('HC-SR04', () => {
  it('50 cm -> pulseIn ≈ 2915 µs; canlı değişim; menzil sınırları', () => {
    const lab = createLab(sonar({ cm: 50 }), SONAR_US_HEX)
    lab.advance(400)
    // 50 · 58,2 = 2910 µs (pulseIn döngü çözünürlüğü birkaç µs)
    expect(echoUs(lab)).toBeGreaterThan(2890)
    expect(echoUs(lab)).toBeLessThan(2945)
    expect(rt(lab, 'hc').hcsr04).toMatchObject({ powered: true, distanceCm: 50, inRange: true })
    expect(rt(lab, 'hc').hcsr04!.pings).toBeGreaterThan(0)
    lab.setProp('hc', 'distanceCm', 200)
    lab.advance(400)
    expect(echoUs(lab)).toBeGreaterThan(11_540) // 200 · 58,2 = 11 640 µs (pulseIn döngüsü ~%0,5 eksik sayar)
    expect(echoUs(lab)).toBeLessThan(11_680)
    lab.setProp('hc', 'distanceCm', 2)
    lab.advance(300)
    expect(echoUs(lab)).toBeGreaterThan(100) // 116,4 µs
    expect(echoUs(lab)).toBeLessThan(135)
    lab.setProp('hc', 'distanceCm', 400)
    lab.advance(300)
    expect(echoUs(lab)).toBeGreaterThan(23_100) // 23 280 µs (pulseIn zaman aşımı 30 ms, ~%0,6 eksik sayar)
    expect(echoUs(lab)).toBeLessThan(23_320)
    lab.setProp('hc', 'distanceCm', 450)
    lab.advance(400)
    expect(echoUs(lab)).toBe(0) // menzil dışı: echo yok, pulseIn zaman aşımı
    expect(rt(lab, 'hc').hcsr04!.inRange).toBe(false)
    expect(kinds(lab)).toEqual([])
    lab.dispose()
  })

  it('mesafe_pulsein dersi: süre ve cm yazdırır', () => {
    const lab = createLab(sonar({ cm: 100 }), SONAR_PULSEIN_HEX)
    lab.advance(600)
    const m = /sure=(\d+) us {2}mesafe=([\d.]+) cm/.exec(last(lab))
    expect(m).not.toBeNull()
    expect(Number(m![1])).toBeGreaterThan(5780) // 5820 µs
    expect(Number(m![1])).toBeLessThan(5860)
    expect(Number(m![2])).toBeGreaterThan(99)
    expect(Number(m![2])).toBeLessThan(101)
    lab.setProp('hc', 'distanceCm', 450)
    lab.advance(600)
    expect(last(lab)).toBe('Yansima yok (menzil disi)')
  })

  it('VCC yok: cevap vermez + unpowered uyarısı; ECHO yok: floating-input', () => {
    const c = sonar({ vcc: false })
    expect(analyzeCircuit(c).warnings.map((w) => w.kind)).toContain('unpowered')
    const lab = createLab(c, SONAR_US_HEX)
    lab.advance(400)
    expect(echoUs(lab)).toBe(0)
    expect(rt(lab, 'hc').hcsr04!.powered).toBe(false)
    expect(kinds(lab)).toContain('unpowered')
    const e = sonar({ echo: false })
    expect(analyzeCircuit(e).warnings.some((w) => w.kind === 'floating-input' && w.partId === 'hc')).toBe(true)
    const lab2 = createLab(e, SONAR_US_HEX)
    lab2.advance(400)
    expect(echoUs(lab2)).toBe(0)
    const g = createLab(sonar({ gnd: false }), SONAR_US_HEX)
    g.advance(300)
    expect(echoUs(g)).toBe(0)
  })

  it('ECHO bir dirençten geçerse model doğrudan bağlı olmadığı için uyarır', () => {
    const c = circuit([part('hc', 'hcsr04'), part('r', 'resistor', { ohms: 1000 })], [['hc.TRIG', 'uno.D9'], ['hc.VCC', 'uno.5V'], ['hc.GND', 'uno.GND'], ['hc.ECHO', 'r.1'], ['r.2', 'uno.D10']])
    expect(analyzeCircuit(c).warnings.some((w) => w.kind === 'floating-input' && /doğrudan/.test(w.message))).toBe(true)
  })
})

// ---------------------------------------------------------------------------------------------------------------------
// DHT11 / DHT22 (ders 46): DATA D5.
// ---------------------------------------------------------------------------------------------------------------------
const dhtCircuit = (props: Record<string, PropValue> = {}, o: { vcc?: boolean } = {}): Circuit => circuit(
  [part('d', 'dht', props)],
  [['d.DATA', 'uno.D5'], ['d.GND', 'uno.GND'], ...(o.vcc === false ? [] : ([['d.VCC', 'uno.5V']] as Array<[string, string]>))],
)

describe('DHT', () => {
  it('DHT22 ondalık okur, canlı değişir', () => {
    const lab = createLab(dhtCircuit({ type: 'dht22', tempC: 23.4, humidity: 55.2 }), DHT_OKU_HEX)
    lab.advance(2500)
    expect(lines(lab.state.serial)).toEqual(['Sicaklik: 23.4 C  Nem: 55.2 %'])
    lab.setProp('d', 'tempC', 30.1)
    lab.setProp('d', 'humidity', 40.5)
    clearSerial(lab)
    lab.advance(2100)
    expect(lines(lab.state.serial)).toEqual(['Sicaklik: 30.1 C  Nem: 40.5 %'])
    lab.setProp('d', 'tempC', -5.5)
    clearSerial(lab)
    lab.advance(2100)
    expect(lines(lab.state.serial)).toEqual(['Sicaklik: -5.5 C  Nem: 40.5 %'])
    expect(rt(lab, 'd').dht).toMatchObject({ powered: true, type: 'dht22' })
    expect(rt(lab, 'd').dht!.reads).toBe(3)
    expect(kinds(lab)).toEqual([])
  })

  it('DHT11 tam sayıya yuvarlar (tür özelliği)', () => {
    const lab = createLab(dhtCircuit({ type: 'dht11', tempC: 23.4, humidity: 55.2 }), DHT11_OKU_HEX)
    lab.advance(2500)
    expect(lines(lab.state.serial)).toEqual(['Sicaklik: 23.0 C  Nem: 55.0 %'])
  })

  it('tür özelliği canlı değişir: DHT22 kütüphanesi DHT11 çerçevesini yanlış çözer', () => {
    const lab = createLab(dhtCircuit({ type: 'dht22', tempC: 23.4, humidity: 55.2 }), DHT_OKU_HEX)
    lab.advance(2500)
    lab.setProp('d', 'type', 'dht11')
    clearSerial(lab)
    lab.advance(2100)
    // DHT11 çerçevesi (nem=55, ondalık=0, sıcaklık=23, 0) DHT22 olarak okunur: nem = 0x3700/10 = 1408 değil; sayılar tutarsızdır
    expect(lines(lab.state.serial)[0]).not.toBe('Sicaklik: 23.4 C  Nem: 55.2 %')
  })

  it('beslenmemiş / GND yok: "Okuma hatasi" ve unpowered', () => {
    const c = dhtCircuit({}, { vcc: false })
    expect(analyzeCircuit(c).warnings.map((w) => w.kind)).toContain('unpowered')
    const lab = createLab(c, DHT_OKU_HEX)
    lab.advance(4500)
    expect(lines(lab.state.serial)).toEqual(['Okuma hatasi', 'Okuma hatasi'])
    expect(rt(lab, 'd').dht!.powered).toBe(false)
    expect(kinds(lab)).toContain('unpowered')
  })

  it('3,3 V ile de çalışır', () => {
    const c = circuit([part('d', 'dht', { tempC: 20, humidity: 60 })], [['d.DATA', 'uno.D5'], ['d.GND', 'uno.GND'], ['d.VCC', 'uno.3V3']])
    expect(analyzeCircuit(c).warnings.map((w) => w.kind)).not.toContain('unpowered')
    const lab = createLab(c, DHT_OKU_HEX)
    lab.advance(2500)
    expect(lines(lab.state.serial)).toEqual(['Sicaklik: 20.0 C  Nem: 60.0 %'])
  })
})

// ---------------------------------------------------------------------------------------------------------------------
// PIR (ders 41): OUT D2. Isınma MODEL.pirWarmupMs, tutma MODEL.pirHoldMs.
// ---------------------------------------------------------------------------------------------------------------------
const pirCircuit = (o: { vcc?: boolean; props?: Record<string, PropValue> } = {}): Circuit => circuit(
  [part('pir', 'pir', o.props ?? {})],
  [['pir.OUT', 'uno.D2'], ['pir.GND', 'uno.GND'], ...(o.vcc === false ? [] : ([['pir.VCC', 'uno.5V']] as Array<[string, string]>))],
)
const edges = (lab: LabApi): Array<{ t: number; v: number }> => lines(lab.state.serial).map((l) => { const [t, v] = l.split(' ').map(Number); return { t, v } })

describe('PIR', () => {
  it('ısınma: parazitli çıkış, sonra sakin; hareket HIGH, bitince 3 sn tutar', () => {
    const lab = createLab(pirCircuit(), PIR_KENAR_HEX)
    lab.advance(MODEL.pirWarmupMs - 50)
    expect(rt(lab, 'pir').pir!.warmingUp).toBe(true)
    // ısınma sırasında en az bir yalancı HIGH görülür (kod beklemezse yanılır)
    expect(edges(lab).some((e) => e.v === 1)).toBe(true)
    lab.advance(300)
    expect(rt(lab, 'pir').pir!.warmingUp).toBe(false)
    expect(rt(lab, 'pir').pir!.out).toBe(false)
    expect(lab.state.pins.D2.high).toBe(false)
    const n = edges(lab).length
    lab.advance(1000)
    expect(edges(lab).length).toBe(n) // ısınma sonrası sakin
    // hareket
    lab.setProp('pir', 'motion', true)
    lab.advance(50)
    expect(lab.state.pins.D2.high).toBe(true)
    expect(rt(lab, 'pir').pir!.out).toBe(true)
    lab.advance(2000) // hareket sürüyor: HIGH
    expect(lab.state.pins.D2.high).toBe(true)
    lab.setProp('pir', 'motion', false)
    lab.advance(2900) // tutma süresi (3 sn) dolmadı
    expect(lab.state.pins.D2.high).toBe(true)
    lab.advance(300)
    expect(lab.state.pins.D2.high).toBe(false)
    expect(lab.state.pins.D2.volts).toBeLessThan(0.5)
  })

  it('pir_isinma dersi: ısınmada gelen hareket yok sayılır, sonra tek bildirim', () => {
    const lab = createLab(pirCircuit(), PIR_ISINMA_HEX)
    lab.advance(300)
    lab.setProp('pir', 'motion', true) // ısınmada: modelce yok sayılır
    lab.advance(500)
    lab.setProp('pir', 'motion', false)
    lab.advance(4700) // t ≈ 5,5 sn
    expect(lab.state.serial).toContain('Hazir')
    expect(lab.state.serial).not.toContain('Hareket var')
    lab.setProp('pir', 'motion', true)
    lab.advance(200)
    expect(lines(lab.state.serial).filter((l) => l === 'Hareket var')).toHaveLength(1)
    expect(lab.state.pins.D13.high).toBe(true)
    lab.setProp('pir', 'motion', false)
    lab.advance(3300)
    expect(lines(lab.state.serial).filter((l) => l === 'Hareket bitti')).toHaveLength(1)
    expect(lab.state.pins.D13.high).toBe(false)
  })

  it('beslenmemiş PIR: çıkış LOW, unpowered', () => {
    const c = pirCircuit({ vcc: false, props: { motion: true } })
    expect(analyzeCircuit(c).warnings.map((w) => w.kind)).toContain('unpowered')
    const lab = createLab(c, PIR_KENAR_HEX)
    lab.advance(4000)
    expect(rt(lab, 'pir').pir).toMatchObject({ powered: false, out: false })
    expect(lab.state.pins.D2.high).toBe(false)
    expect(kinds(lab)).toContain('unpowered')
  })

  it('OUT ucu bir LED sürebilir (çıkış gerçek bir elektrik düğümü)', () => {
    const c = circuit([part('pir', 'pir', { motion: true }), part('r', 'resistor', { ohms: 330 }), part('led', 'led')],
      [['pir.VCC', 'uno.5V'], ['pir.GND', 'uno.GND'], ['pir.OUT', 'r.1'], ['r.2', 'led.A'], ['led.K', 'uno.GND2']])
    const lab = createLab(c, PIR_KENAR_HEX)
    lab.advance(MODEL.pirWarmupMs + 200)
    expect(rt(lab, 'led').led!.on).toBe(true)
    // (5 − 1,9) / (330 + 100 + 5) = 7,1 mA
    expect(rt(lab, 'led').led!.currentMa).toBeGreaterThan(6.8)
    expect(rt(lab, 'led').led!.currentMa).toBeLessThan(7.4)
  })
})

// ---------------------------------------------------------------------------------------------------------------------
// IR engel (ders 42): OUT D3 (engel = LOW), AO A0.
// ---------------------------------------------------------------------------------------------------------------------
const irCircuit = (props: Record<string, PropValue> = {}, vcc = true): Circuit => circuit(
  [part('ir', 'irobstacle', props)],
  [['ir.OUT', 'uno.D3'], ['ir.AO', 'uno.A0'], ['ir.GND', 'uno.GND'], ...(vcc ? ([['ir.VCC', 'uno.5V']] as Array<[string, string]>) : [])],
)

describe('IR engel', () => {
  it('ir_engel: yakınlık eşiği geçince OUT LOW olur, eşik canlı ayarlanır', () => {
    const lab = createLab(irCircuit({ proximity: 0, threshold: 0.5 }), IR_ENGEL_HEX)
    lab.advance(500)
    expect(last(lab)).toBe('Engel yok')
    expect(lab.state.pins.D3.high).toBe(true)
    expect(lab.state.pins.D13.high).toBe(false)
    lab.setProp('ir', 'proximity', 0.8)
    lab.advance(500)
    expect(last(lab)).toBe('Engel var')
    expect(lab.state.pins.D13.high).toBe(true)
    expect(rt(lab, 'ir').irobstacle).toMatchObject({ detected: true, out: false })
    lab.setProp('ir', 'threshold', 0.9) // ayar vidası: daha az duyarlı
    lab.advance(500)
    expect(last(lab)).toBe('Engel yok')
    expect(rt(lab, 'ir').irobstacle!.detected).toBe(false)
    expect(kinds(lab)).toEqual([])
  })

  it('AO gerilimi yakınlıkla artar: 0 -> ≈0,25 V, 1 -> ≈4,75 V', () => {
    const at = (prox: number): number => {
      const lab = createLab(irCircuit({ proximity: prox }), ANALOG_DO_HEX)
      lab.advance(300)
      return Number(last(lab).split(' ')[0])
    }
    expect(at(0)).toBeGreaterThan(48) // 0,05·1023 ≈ 51
    expect(at(0)).toBeLessThan(54)
    expect(at(1)).toBeGreaterThan(965) // 0,95·1023 ≈ 972
    expect(at(1)).toBeLessThan(978)
    expect(at(0.5)).toBeGreaterThan(505)
    expect(at(0.5)).toBeLessThan(518)
  })

  it('beslenmemiş: engel yok görünür, unpowered', () => {
    const c = irCircuit({ proximity: 1 }, false)
    expect(analyzeCircuit(c).warnings.map((w) => w.kind)).toContain('unpowered')
    const lab = createLab(c, IR_ENGEL_HEX)
    lab.advance(300)
    expect(rt(lab, 'ir').irobstacle!.powered).toBe(false)
  })
})

// ---------------------------------------------------------------------------------------------------------------------
// Reed (ders 43): bir ucu D4 (INPUT_PULLUP), öbür ucu GND.
// ---------------------------------------------------------------------------------------------------------------------
describe('Reed anahtarı', () => {
  const reedCircuit = (): Circuit => circuit([part('reed', 'reed')], [['reed.A', 'uno.D4'], ['reed.B', 'uno.GND']])
  it('mıknatıs yakınken kontak kapanır (LOW), uzaklaşınca açılır; ölçüm', () => {
    const lab = createLab(reedCircuit(), REED_KAPI_HEX)
    lab.advance(300)
    expect(lab.state.pins.D4.high).toBe(true)
    expect(lab.state.pins.D13.high).toBe(true) // kapı açık: LED yanar
    lab.setProp('reed', 'magnet', true)
    lab.advance(150)
    expect(lab.state.pins.D4.high).toBe(false)
    expect(lines(lab.state.serial)).toEqual(['Kapi kapali'])
    expect(lab.state.pins.D13.high).toBe(false)
    expect(rt(lab, 'reed').reed!.closed).toBe(true)
    expect(rt(lab, 'reed').meas!.vAcross).toBeLessThan(0.05)
    lab.setProp('reed', 'magnet', false)
    lab.advance(150)
    expect(lines(lab.state.serial)).toEqual(['Kapi kapali', 'Kapi acik'])
    expect(rt(lab, 'reed').meas!.vAcross).toBeGreaterThan(4.9) // açık kontakta 5 V (iç pull-up)
    expect(kinds(lab)).toEqual([])
  })
})

// ---------------------------------------------------------------------------------------------------------------------
// BMP280 / MPU6050 / RTC (I2C: SDA A4, SCL A5)
// ---------------------------------------------------------------------------------------------------------------------
const i2cWires = (id: string, o: { vcc?: boolean; sda?: boolean; scl?: boolean; vccPin?: string } = {}): Array<[string, string]> => {
  const w: Array<[string, string]> = [[`${id}.GND`, 'uno.GND']]
  if (o.vcc !== false) w.push([`${id}.VCC`, o.vccPin ?? 'uno.5V'])
  if (o.sda !== false) w.push([`${id}.SDA`, 'uno.A4'])
  if (o.scl !== false) w.push([`${id}.SCL`, 'uno.A5'])
  return w
}

describe('BMP280', () => {
  const bmp = (props: Record<string, PropValue> = {}, o: Parameters<typeof i2cWires>[1] = {}): Circuit => circuit([part('b', 'bmp280', props)], i2cWires('b', o))
  const alt = (hpa: number, p0 = 1013.25): number => 44330 * (1 - Math.pow(hpa / p0, 1 / 5.255))

  it('sıcaklık, basınç, rakım okunur; canlı değişir', () => {
    const lab = createLab(bmp({ tempC: 25, pressureHpa: 1013.25 }), BMP_OKU_HEX)
    lab.advance(1200)
    const m = /Sicaklik: ([\d.-]+) C {2}Basinc: ([\d.]+) hPa {2}Rakim: ([\d.-]+) m/.exec(last(lab))
    expect(m).not.toBeNull()
    expect(Number(m![1])).toBeCloseTo(25, 0)
    expect(Number(m![2])).toBeCloseTo(1013.25, 0)
    expect(Math.abs(Number(m![3]))).toBeLessThan(3)
    expect(rt(lab, 'b').bmp280).toMatchObject({ powered: true, present: true })
    lab.setProp('b', 'pressureHpa', 900)
    lab.setProp('b', 'tempC', 12)
    clearSerial(lab)
    lab.advance(1100)
    const k = /Sicaklik: ([\d.-]+) C {2}Basinc: ([\d.]+) hPa {2}Rakim: ([\d.-]+) m/.exec(last(lab))!
    expect(Number(k[1])).toBeCloseTo(12, 0)
    expect(Number(k[2])).toBeCloseTo(900, 0)
    expect(Number(k[3])).toBeGreaterThan(alt(900) - 8) // ≈ 988 m
    expect(Number(k[3])).toBeLessThan(alt(900) + 8)
    expect(kinds(lab)).toEqual([])
  })

  it('adres 0x77 seçilirse kod 0x76 ararsa "bulunamadi"', () => {
    const lab = createLab(bmp({ address: '0x77' }), BMP_OKU_HEX)
    lab.advance(1500)
    expect(lines(lab.state.serial)).toEqual(['BMP280 bulunamadi'])
    expect(rt(lab, 'b').bmp280!.present).toBe(true) // veri yolunda (0x77'de)
  })

  it('SDA bağlı değil: bulunamadi + floating-input; VCC yok: unpowered', () => {
    const c = bmp({}, { sda: false })
    expect(analyzeCircuit(c).warnings.some((w) => w.kind === 'floating-input' && w.partId === 'b')).toBe(true)
    const lab = createLab(c, BMP_OKU_HEX)
    lab.advance(1500)
    expect(lab.state.serial).toContain('BMP280 bulunamadi')
    expect(rt(lab, 'b').bmp280!.present).toBe(false)
    const d = bmp({}, { vcc: false })
    expect(analyzeCircuit(d).warnings.map((w) => w.kind)).toContain('unpowered')
    const lab2 = createLab(d, BMP_OKU_HEX)
    lab2.advance(1500)
    expect(lab2.state.serial).toContain('BMP280 bulunamadi')
    expect(kinds(lab2)).toContain('unpowered')
  })

  it('3,3 V ile beslenebilir', () => {
    const c = bmp({}, { vccPin: 'uno.3V3' })
    expect(analyzeCircuit(c).warnings.map((w) => w.kind)).not.toContain('unpowered')
    const lab = createLab(c, BMP_OKU_HEX)
    lab.advance(1200)
    expect(last(lab)).toMatch(/^Sicaklik: 25\.0/)
  })
})

describe('MPU6050', () => {
  const mpu = (props: Record<string, PropValue> = {}, o: Parameters<typeof i2cWires>[1] = {}): Circuit => circuit([part('m', 'mpu6050', props)], i2cWires('m', o))
  const grab = (lab: LabApi): { ham: number[]; g: number[]; dps: number[] } => {
    const ls = lines(lab.state.serial)
    const hamLine = [...ls].reverse().find((l) => /^HAM ax=-?\d+ ay=-?\d+ az=-?\d+$/.test(l))!
    const gLine = [...ls].reverse().find((l) => l.startsWith('g ax') && l.includes('| C='))!
    return {
      ham: [...hamLine.matchAll(/=(-?\d+)/g)].map((x) => Number(x[1])),
      g: [...gLine.split('|')[0].matchAll(/=(-?[\d.]+)/g)].map((x) => Number(x[1])),
      dps: [...gLine.split('|')[1].matchAll(/=(-?[\d.]+)/g)].map((x) => Number(x[1])),
    }
  }

  it('durağan: az = 1 g (16384), diğerleri 0; ivme ve jiroskop canlı değişir', () => {
    const lab = createLab(mpu(), MPU_HAM_HEX)
    lab.advance(1100)
    expect(grab(lab).ham).toEqual([0, 0, 16384])
    expect(rt(lab, 'm').mpu6050).toMatchObject({ powered: true, present: true, az: 1 })
    lab.setProp('m', 'ax', 0.5)
    lab.setProp('m', 'az', 0.866)
    lab.setProp('m', 'gy', 100)
    lab.setProp('m', 'gz', -50)
    clearSerial(lab)
    lab.advance(1100)
    const r = grab(lab)
    expect(r.ham[0]).toBe(8192) // 0,5 · 16384
    expect(r.ham[2]).toBe(Math.round(0.866 * 16384))
    expect(r.g[0]).toBeCloseTo(0.5, 2)
    expect(r.dps[1]).toBeCloseTo(100, 0) // gy
    expect(r.dps[2]).toBeCloseTo(-50, 0) // gz
    expect(kinds(lab)).toEqual([])
  })

  it('beslenmemiş: uyarı; AD0 = 0x69 seçilirse 0x68 sorgusu cevapsız kalır', () => {
    const d = mpu({}, { vcc: false })
    expect(analyzeCircuit(d).warnings.map((w) => w.kind)).toContain('unpowered')
    const lab = createLab(mpu({ address: '0x69' }), I2C_TARAMA_C_HEX)
    lab.advance(300)
    expect(lines(lab.state.serial)).toEqual(['105', 'bitti']) // 0x69
  })
})

describe('I2C veri yolu: birden çok cihaz', () => {
  it('BMP280 (0x76) + MPU6050 (0x68) + I2C LCD (0x27) aynı hatta taranır; biri koparsa kaybolur', () => {
    const wires = [...i2cWires('b'), ...i2cWires('m'), ...i2cWires('l')]
    // aynı hat: GND/VCC/SDA/SCL ucu birden çok parçadan Uno pinine kablolanır
    const c = circuit([part('b', 'bmp280'), part('m', 'mpu6050'), part('l', 'lcdI2c')], wires)
    const lab = createLab(c, I2C_TARAMA_C_HEX)
    lab.advance(400)
    expect(lines(lab.state.serial)).toEqual(['39', '104', '118', 'bitti'])
    const c2 = { ...c, wires: c.wires.filter((w) => !(w.a.part === 'm' && w.a.pin === 'SDA')) }
    const lab2 = createLab(c2, I2C_TARAMA_C_HEX)
    lab2.advance(400)
    expect(lines(lab2.state.serial)).toEqual(['39', '118', 'bitti'])
  })
})


describe('RTC DS3231', () => {
  const rtc = (o: Parameters<typeof i2cWires>[1] = {}): Circuit => circuit([part('r', 'rtc')], i2cWires('r', o))
  it('rtc_saat: saat benzetim zamanıyla ilerler (açılış 2026-01-01 00:00:00 UTC)', () => {
    const lab = createLab(rtc(), RTC_SAAT_HEX)
    lab.advance(3100)
    expect(lines(lab.state.serial)).toEqual(['2026-01-01 00:00:01', '2026-01-01 00:00:02', '2026-01-01 00:00:03'])
    expect(rt(lab, 'r').rtc).toMatchObject({ powered: true, present: true })
    expect(rt(lab, 'r').rtc!.time.startsWith('2026-01-01T00:00:03')).toBe(true)
    lab.advance(10_000)
    expect(last(lab)).toBe('2026-01-01 00:00:13')
    expect(kinds(lab)).toEqual([])
  })

  it('modül yoksa "RTC bulunamadi"; beslenmemişse unpowered', () => {
    const c = rtc({ scl: false })
    expect(analyzeCircuit(c).warnings.some((w) => w.kind === 'floating-input' && w.partId === 'r')).toBe(true)
    const lab = createLab(c, RTC_SAAT_HEX)
    lab.advance(500)
    expect(lines(lab.state.serial)).toEqual(['RTC bulunamadi'])
    expect(analyzeCircuit(rtc({ vcc: false })).warnings.map((w) => w.kind)).toContain('unpowered')
  })

  it('reset saati başa alır', () => {
    const lab = createLab(rtc(), RTC_SAAT_HEX)
    lab.advance(5200)
    lab.reset()
    expect(rt(lab, 'r').rtc!.time.startsWith('2026-01-01T00:00:00')).toBe(true)
  })
})

// ---------------------------------------------------------------------------------------------------------------------
// Joystick (ders 56): VRx A0, VRy A1, SW D2 (INPUT_PULLUP)
// ---------------------------------------------------------------------------------------------------------------------
describe('Joystick', () => {
  const joy = (props: Record<string, PropValue> = {}, vcc = true): Circuit => circuit([part('j', 'joystick', props)],
    [['j.VRX', 'uno.A0'], ['j.VRY', 'uno.A1'], ['j.SW', 'uno.D2'], ['j.GND', 'uno.GND'], ...(vcc ? ([['j.VCC', 'uno.5V']] as Array<[string, string]>) : [])])
  const read = (lab: LabApi): { x: number; y: number; b: number } => {
    const m = /X=(\d+) Y=(\d+) BUTON=(\d)/.exec([...lines(lab.state.serial)].reverse().find((l) => /^X=\d+ Y=\d+ BUTON=\d$/.test(l))!)!
    return { x: Number(m[1]), y: Number(m[2]), b: Number(m[3]) }
  }

  it('orta ≈ 512, uçlarda 0 / 1023; düğme basılınca LOW', () => {
    const lab = createLab(joy(), JOYSTICK_HAM_HEX)
    lab.advance(500)
    expect(read(lab).x).toBeGreaterThan(509)
    expect(read(lab).x).toBeLessThan(515)
    expect(read(lab).y).toBeGreaterThan(509)
    expect(read(lab).b).toBe(0)
    lab.setProp('j', 'x', 1)
    lab.setProp('j', 'y', 0)
    lab.advance(500)
    expect(read(lab).x).toBeGreaterThan(1020)
    expect(read(lab).y).toBeLessThan(3)
    lab.setProp('j', 'x', 0.25)
    lab.advance(400)
    expect(read(lab).x).toBeGreaterThan(252) // 0,25 · 1023 = 256
    expect(read(lab).x).toBeLessThan(260)
    lab.setProp('j', 'pressed', true)
    lab.advance(400)
    expect(read(lab).b).toBe(1)
    expect(lab.state.pins.D2.high).toBe(false)
    expect(rt(lab, 'j').joystick).toMatchObject({ powered: true, pressed: true })
    lab.setProp('j', 'pressed', false)
    lab.advance(400)
    expect(read(lab).b).toBe(0)
    expect(kinds(lab)).toEqual([])
  })

  it('VCC yok: eksenler 0 okunur ve unpowered uyarısı', () => {
    const c = joy({}, false)
    expect(analyzeCircuit(c).warnings.map((w) => w.kind)).toContain('unpowered')
    const lab = createLab(c, JOYSTICK_HAM_HEX)
    lab.advance(400)
    expect(read(lab).x).toBe(0)
    expect(rt(lab, 'j').joystick!.powered).toBe(false)
  })
})

// ---------------------------------------------------------------------------------------------------------------------
// Döner enkoder (ders 57): CLK D2 (kesme, FALLING), DT D3, SW D4
// ---------------------------------------------------------------------------------------------------------------------
describe('Döner enkoder (KY-040)', () => {
  const enc = (props: Record<string, PropValue> = {}, o: { vcc?: boolean; gnd?: boolean } = {}): Circuit => circuit([part('e', 'encoder', props)],
    [['e.CLK', 'uno.D2'], ['e.DT', 'uno.D3'], ['e.SW', 'uno.D4'], ...(o.gnd === false ? [] : ([['e.GND', 'uno.GND']] as Array<[string, string]>)), ...(o.vcc ? ([['e.VCC', 'uno.5V']] as Array<[string, string]>) : [])])
  const count = (lab: LabApi): number => {
    const m = [...lines(lab.state.serial)].reverse().find((l) => /^Sayac: -?\d+$/.test(l))
    return m ? Number(m.slice(7)) : 0
  }

  it('enkoder_basit: saat yönü artırır, ters yön azaltır (her tık = 4 durum geçişi)', () => {
    const lab = createLab(enc(), ENKODER_BASIT_HEX)
    lab.advance(200)
    expect(lab.state.pins.D2.high).toBe(true)
    expect(lab.state.pins.D3.high).toBe(true)
    lab.setProp('e', 'position', 5)
    lab.advance(100) // 20 geçiş = 20 ms
    expect(count(lab)).toBe(5)
    expect(rt(lab, 'e').encoder).toMatchObject({ position: 5, moving: false, clk: true, dt: true })
    lab.setProp('e', 'position', 2)
    lab.advance(100)
    expect(count(lab)).toBe(2)
    lab.setProp('e', 'position', -3)
    lab.advance(100)
    expect(count(lab)).toBe(-3)
    expect(rt(lab, 'e').encoder!.position).toBe(-3)
    expect(kinds(lab)).toEqual([])
  })

  it('geçiş sırası: 11 -> 01 -> 00 -> 10 -> 11 (saat yönü) ve ters; dönerken moving=true', () => {
    const lab = createLab(enc(), PINS234_HEX)
    lab.advance(100)
    clearSerial(lab)
    lab.setProp('e', 'position', 1)
    lab.advance(20)
    expect(lines(lab.state.serial)).toEqual(['011', '001', '101', '111']) // CLK DT SW
    clearSerial(lab)
    lab.setProp('e', 'position', 0)
    lab.advance(20)
    expect(lines(lab.state.serial)).toEqual(['101', '001', '011', '111'])
    lab.setProp('e', 'position', 40)
    lab.advance(10)
    expect(rt(lab, 'e').encoder!.moving).toBe(true)
    lab.advance(200)
    expect(rt(lab, 'e').encoder).toMatchObject({ position: 40, moving: false })
  })

  it('SW düğmesi LOW olur; VCC bağlı olmasa da (INPUT_PULLUP) çalışır; GND yoksa sayılmaz', () => {
    const lab = createLab(enc(), PINS234_HEX)
    lab.advance(100)
    lab.setProp('e', 'pressed', true)
    lab.advance(10)
    expect(last(lab)).toBe('110')
    expect(rt(lab, 'e').encoder!.pressed).toBe(true)
    const noGnd = createLab(enc({}, { gnd: false }), ENKODER_BASIT_HEX)
    noGnd.advance(100)
    noGnd.setProp('e', 'position', 3)
    noGnd.advance(100)
    expect(count(noGnd)).toBe(0)
  })

  it('VCC bağlıysa kartın pull-up\'ı hatta 5 V verir (INPUT bile olsa yüksek okunur)', () => {
    const lab = createLab(enc({}, { vcc: true }), PINS234_HEX)
    lab.advance(100)
    expect(lab.state.pins.D2.volts).toBeGreaterThan(4.9)
  })

  it('reset enkoder konumunu özellikten yeniden başlatır (sahte dönüş yok)', () => {
    const lab = createLab(enc(), ENKODER_BASIT_HEX)
    lab.advance(100)
    lab.setProp('e', 'position', 4)
    lab.advance(100)
    lab.reset()
    lab.advance(200)
    expect(count(lab)).toBe(0)
    expect(rt(lab, 'e').encoder).toMatchObject({ position: 4, moving: false })
  })
})

// ---------------------------------------------------------------------------------------------------------------------
// Keypad 4x4 (ders 62): R1..R4 -> D9..D6, C1..C4 -> D5..D2
// ---------------------------------------------------------------------------------------------------------------------
describe('Keypad 4x4', () => {
  const pad = (skip?: string): Circuit => {
    const w: Array<[string, string]> = [['k.R1', 'uno.D9'], ['k.R2', 'uno.D8'], ['k.R3', 'uno.D7'], ['k.R4', 'uno.D6'], ['k.C1', 'uno.D5'], ['k.C2', 'uno.D4'], ['k.C3', 'uno.D3'], ['k.C4', 'uno.D2']]
    return circuit([part('k', 'keypad')], skip ? w.filter(([a]) => a !== skip) : w)
  }
  it('keypad_tus: seçilen tuş okunur, basılı tutulan tuş bir kez bildirilir', () => {
    const lab = createLab(pad(), KEYPAD_TUS_HEX)
    lab.advance(200)
    expect(lab.state.serial).toBe('')
    lab.setProp('k', 'key', '5')
    lab.advance(300)
    expect(lines(lab.state.serial)).toEqual(['Tus: 5'])
    expect(rt(lab, 'k').keypad!.key).toBe('5')
    lab.advance(500)
    expect(lines(lab.state.serial)).toEqual(['Tus: 5']) // basılı tutmak tekrar etmez
    lab.setProp('k', 'key', '')
    lab.advance(300)
    for (const key of ['A', '#', '0', 'D', '1']) {
      lab.setProp('k', 'key', key)
      lab.advance(250)
      lab.setProp('k', 'key', '')
      lab.advance(250)
    }
    expect(lines(lab.state.serial)).toEqual(['Tus: 5', 'Tus: A', 'Tus: #', 'Tus: 0', 'Tus: D', 'Tus: 1'])
    expect(rt(lab, 'k').keypad!.key).toBeNull()
    expect(kinds(lab)).toEqual([])
  })

  it('bir satır/sütun bağlı değilse uyarı verir ve o hat çalışmaz', () => {
    const c = pad('k.R2')
    expect(analyzeCircuit(c).warnings.some((w) => w.kind === 'floating-input' && w.partId === 'k')).toBe(true)
    const lab = createLab(c, KEYPAD_TUS_HEX)
    lab.advance(200)
    lab.setProp('k', 'key', '5')
    lab.advance(300)
    expect(lab.state.serial).toBe('')
  })
})

// ---------------------------------------------------------------------------------------------------------------------
// Analog modüller: ses A0, alev A1, toprak A2, MQ-2 A3; DO -> D7. AO = 5 V · (base + span · seviye); DO seviye ≥ eşik iken LOW.
// ---------------------------------------------------------------------------------------------------------------------
describe('Analog modüller (MQ-2, alev, ses, toprak nemi)', () => {
  const cases = [
    { type: 'sound' as const, prop: 'sound', ao: 'A0', idx: 0, f: (l: number) => 0.25 + 0.7 * l },
    { type: 'flame' as const, prop: 'flame', ao: 'A1', idx: 1, f: (l: number) => 1 - 0.95 * l },
    { type: 'soil' as const, prop: 'moisture', ao: 'A2', idx: 2, f: (l: number) => 0.9 - 0.6 * l },
    { type: 'mq2' as const, prop: 'gas', ao: 'A3', idx: 3, f: (l: number) => 0.1 + 0.9 * l },
  ]
  const build = (type: PartType, ao: string, props: Record<string, PropValue>, vcc = true): Circuit => circuit([part('m', type, props)],
    [['m.AO', `uno.${ao}`], ['m.DO', 'uno.D7'], ['m.GND', 'uno.GND'], ...(vcc ? ([['m.VCC', 'uno.5V']] as Array<[string, string]>) : [])])
  const row = (lab: LabApi): number[] => (lines(lab.state.serial).filter((l) => /^\d+ \d+ \d+ \d+ \d$/.test(l)).at(-1) ?? '').split(' ').map(Number)

  for (const c of cases) {
    it(`${c.type}: AO = 5 V · f(seviye); yön ve DO eşiği`, () => {
      const lab = createLab(build(c.type, c.ao, { [c.prop]: 0, threshold: 0.5 }), ANALOG_DO_HEX)
      lab.advance(300)
      const at = (level: number): number[] => { lab.setProp('m', c.prop, level); lab.advance(300); return row(lab) }
      for (const level of [0, 0.25, 0.5, 1]) {
        const r = at(level)
        const want = c.f(level) * 1023
        expect(r[c.idx]).toBeGreaterThan(want - 4)
        expect(r[c.idx]).toBeLessThan(want + 4)
        // DO: seviye eşiğin (0,5) altında YÜKSEK, ≥ eşikte DÜŞÜK
        expect(r[4]).toBe(level >= 0.5 ? 0 : 1)
        expect(rt(lab, 'm').analogModule).toMatchObject({ powered: true, level, doHigh: level < 0.5 })
        expect(rt(lab, 'm').analogModule!.aoVolts).toBeCloseTo(c.f(level) * 5, 1)
      }
      lab.setProp('m', c.prop, 0.8)
      lab.setProp('m', 'threshold', 0.9) // ayar vidası: 0,8 eşiğin altında kalır
      lab.advance(300)
      expect(row(lab)[4]).toBe(1)
      expect(kinds(lab)).toEqual([])
    })

    it(`${c.type}: VCC yok -> unpowered, AO 0 okunur`, () => {
      const d = build(c.type, c.ao, { [c.prop]: 1 }, false)
      expect(analyzeCircuit(d).warnings.map((w) => w.kind)).toContain('unpowered')
      const lab = createLab(d, ANALOG_DO_HEX)
      lab.advance(300)
      expect(row(lab)[c.idx]).toBe(0)
      expect(rt(lab, 'm').analogModule!.powered).toBe(false)
    })
  }

  it('yönler dersler gibi: MQ-2 gazda yükselir, alev alevde düşer, toprak ıslakta düşer', () => {
    const ao = (type: PartType, prop: string, level: number, pin: string): number => {
      const lab = createLab(build(type, pin, { [prop]: level }), ANALOG_DO_HEX)
      lab.advance(300)
      return row(lab)[Number(pin[1])]
    }
    expect(ao('mq2', 'gas', 1, 'A3')).toBeGreaterThan(ao('mq2', 'gas', 0, 'A3'))
    expect(ao('flame', 'flame', 1, 'A1')).toBeLessThan(ao('flame', 'flame', 0, 'A1'))
    expect(ao('soil', 'moisture', 1, 'A2')).toBeLessThan(ao('soil', 'moisture', 0, 'A2'))
  })
})

// ---------------------------------------------------------------------------------------------------------------------
// Genel: tüm sensörler aynı devrede, varsayılan özellikler kurulur, reset çalışır
// ---------------------------------------------------------------------------------------------------------------------
describe('birleşik devre', () => {
  it('HC-SR04 + DHT + BMP280 + I2C LCD + PIR birlikte çalışır', () => {
    const c = circuit(
      [part('hc', 'hcsr04', { distanceCm: 30 }), part('d', 'dht'), part('b', 'bmp280'), part('l', 'lcdI2c'), part('p', 'pir')],
      [['hc.VCC', 'uno.5V'], ['hc.GND', 'uno.GND'], ['hc.TRIG', 'uno.D9'], ['hc.ECHO', 'uno.D10'],
        ['d.VCC', 'uno.5V'], ['d.GND', 'uno.GND'], ['d.DATA', 'uno.D5'],
        ...i2cWires('b'), ...i2cWires('l'),
        ['p.VCC', 'uno.5V'], ['p.GND', 'uno.GND'], ['p.OUT', 'uno.D2']],
    )
    expect(analyzeCircuit(c).warnings).toEqual([])
    const sonarLab = createLab(c, SONAR_US_HEX)
    sonarLab.advance(400)
    expect(echoUs(sonarLab)).toBeGreaterThan(1730) // 30 · 58,2 = 1746
    expect(echoUs(sonarLab)).toBeLessThan(1770)
    const scan = createLab(c, I2C_TARAMA_C_HEX)
    scan.advance(400)
    expect(lines(scan.state.serial)).toEqual(['39', '118', 'bitti'])
    expect(kinds(sonarLab)).toEqual([])
  })
})
