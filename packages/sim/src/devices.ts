// Sanal cihaz modelleri: Sim nesnesine bağlanır. Hepsi 16 MHz çevrim doğruluğunda zamanlanır.
import type { AVRTWI, TWIEventHandler } from 'avr8js'
import type { Pin, Sim } from './sim.js'

const US = 16 // 1 µs = 16 çevrim (16 MHz)

// ---- HC-SR04 ----
export interface HCSR04Options { trig: Pin; echo: Pin; cm?: number }
/** `enabled=false`: modül beslenmemiş, tetiklemeye cevap vermez. `pings`: cevap verilen ölçüm sayısı. */
export interface HCSR04 { cm: number; enabled: boolean; pings: number; minCm: number; maxCm: number }

/** HC-SR04: trig'in düşen kenarından ~450 µs sonra echo'yu mesafeyle orantılı süre HIGH yapar (58,2 µs/cm). */
export function attachHCSR04(sim: Sim, { trig, echo, cm = 100 }: HCSR04Options): HCSR04 {
  const dev: HCSR04 = { cm, enabled: true, pings: 0, minCm: 2, maxCm: 400 }
  sim.drive(echo, false) // echo boşta LOW
  sim.onPin(trig, (high) => {
    if (high) return
    if (!dev.enabled) return
    if (dev.cm < dev.minCm || dev.cm > dev.maxCm) return // menzil dışı: echo yok (pulseIn zaman aşımı)
    dev.pings++
    const widthUs = dev.cm * 58.2
    sim.cpu.addClockEvent(() => {
      sim.drive(echo, true)
      sim.cpu.addClockEvent(() => sim.drive(echo, false), Math.round(widthUs * US))
    }, 450 * US)
  })
  return dev
}

// ---- DHT11 / DHT22 ----
export interface DHTOptions { pin: Pin; type?: 'DHT22' | 'DHT11'; tempC?: number; humidity?: number }
/** `enabled=false`: sensör beslenmemiş, başlangıç darbesine cevap vermez. */
export interface DHT { tempC: number; humidity: number; type: 'DHT22' | 'DHT11'; reads: number; enabled: boolean }

/** DHT11/DHT22 tek-kablo protokolü. Alanlar canlı değiştirilebilir: dev.tempC, dev.humidity. */
export function attachDHT(sim: Sim, { pin, type = 'DHT22', tempC = 25, humidity = 50 }: DHTOptions): DHT {
  const dev: DHT = { tempC, humidity, type, reads: 0, enabled: true }
  sim.drive(pin, true)
  let lowSinceMs: number | null = null
  let responding = false
  const frame = (): Uint8Array => {
    const bytes = new Uint8Array(5)
    if (dev.type === 'DHT11') {
      bytes[0] = Math.round(dev.humidity); bytes[2] = Math.round(Math.abs(dev.tempC)) | (dev.tempC < 0 ? 0x80 : 0)
    } else {
      const h = Math.round(dev.humidity * 10), t = Math.round(Math.abs(dev.tempC) * 10) | (dev.tempC < 0 ? 0x8000 : 0)
      bytes[0] = h >> 8; bytes[1] = h & 0xff; bytes[2] = t >> 8; bytes[3] = t & 0xff
    }
    bytes[4] = (bytes[0] + bytes[1] + bytes[2] + bytes[3]) & 0xff
    return bytes
  }
  const play = (steps: Array<[boolean, number]>): void => {
    let i = 0
    const next = (): void => {
      if (i >= steps.length) { sim.drive(pin, true); responding = false; return }
      const [level, us] = steps[i++]
      sim.drive(pin, level)
      sim.cpu.addClockEvent(next, Math.max(1, Math.round(us * US)))
    }
    next()
  }
  sim.onChange(() => {
    if (responding) return
    const st = sim.state(pin)
    if (st === 'Low') { if (lowSinceMs === null) lowSinceMs = sim.nowMs(); return }
    if (lowSinceMs !== null) {
      const lowMs = sim.nowMs() - lowSinceMs
      lowSinceMs = null
      if (lowMs >= 0.4 && dev.enabled) { // geçerli başlangıç darbesi (DHT22 ≥ 1 ms, DHT11 ≥ 18 ms; kütüphane bunlara uyar)
        responding = true
        dev.reads++
        const bytes = frame()
        const steps: Array<[boolean, number]> = [[true, 25], [false, 80], [true, 80]]
        for (const b of bytes) for (let k = 7; k >= 0; k--) steps.push([false, 50], [true, (b >> k) & 1 ? 70 : 27])
        steps.push([false, 50])
        sim.cpu.addClockEvent(() => play(steps), 1)
      }
    }
  })
  return dev
}

// ---- I2C veri yolu ----
/** Veri yoluna eklenen bir I2C bağımlı cihazı. */
export interface I2CDevice {
  address: number
  /** Bağlantı kurulunca; write = ana cihaz yazacak. */
  start?(write: boolean): void
  stop?(): void
  /** false döndürürse NACK. */
  write(value: number): boolean | void
  read(): number
}

export class I2CBus implements TWIEventHandler {
  readonly devices = new Map<number, I2CDevice>()
  current: I2CDevice | null = null
  constructor(readonly twi: AVRTWI) {
    twi.eventHandler = this
  }
  add<T extends I2CDevice>(device: T): T { this.devices.set(device.address, device); return device }
  start(): void { this.twi.completeStart() }
  stop(): void { this.current?.stop?.(); this.current = null; this.twi.completeStop() }
  connectToSlave(addr: number, write: boolean): void {
    this.current = this.devices.get(addr) ?? null
    this.current?.start?.(write)
    this.twi.completeConnect(!!this.current)
  }
  writeByte(v: number): void { const ok = this.current ? this.current.write(v) !== false : false; this.twi.completeWrite(ok) }
  readByte(): void { this.twi.completeRead(this.current ? this.current.read() & 0xff : 0xff) }
}

/** Yazmaç göstergeli (register pointer) cihaz: ilk yazılan bayt yazmaç adresi, sonrası otomatik artar. */
export function registerDevice(
  address: number,
  { read, write }: { read: (reg: number) => number; write?: (reg: number, value: number) => void },
): I2CDevice {
  let ptr = 0, first = true
  return {
    address,
    start(isWrite) { if (isWrite) first = true },
    write(v) { if (first) { ptr = v; first = false } else { write?.(ptr, v); ptr = (ptr + 1) & 0xff } },
    read() { const b = read(ptr); ptr = (ptr + 1) & 0xff; return b },
  }
}

// ---- BMP280 (adres 0x76/0x77). Kalibrasyon: Bosch veri sayfası örneği. ----
const CAL = { T1: 27504, T2: 26435, T3: -1000, P1: 36477, P2: -10685, P3: 3024, P4: 2855, P5: 140, P6: -7, P7: 15500, P8: -14600, P9: 6000 }
const tempOf = (adc: number): { fine: number; c: number } => {
  const v1 = (adc / 16384 - CAL.T1 / 1024) * CAL.T2
  const v2 = (adc / 131072 - CAL.T1 / 8192) ** 2 * CAL.T3
  return { fine: Math.trunc(v1 + v2), c: (v1 + v2) / 5120 }
}
const pressOf = (adcP: number, fine: number): number => {
  let v1 = fine / 2 - 64000
  let v2 = (v1 * v1 * CAL.P6) / 32768
  v2 = v2 + v1 * CAL.P5 * 2
  v2 = v2 / 4 + CAL.P4 * 65536
  v1 = ((CAL.P3 * v1 * v1) / 524288 + CAL.P2 * v1) / 524288
  v1 = (1 + v1 / 32768) * CAL.P1
  let p = 1048576 - adcP
  p = ((p - v2 / 4096) * 6250) / v1
  v1 = (CAL.P9 * p * p) / 2147483648
  v2 = (p * CAL.P8) / 32768
  return p + (v1 + v2 + CAL.P7) / 16
}
const bisect = (f: (x: number) => number, lo: number, hi: number, target: number, increasing: boolean): number => {
  for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; ((f(m) < target) === increasing) ? (lo = m) : (hi = m) }
  return Math.round((lo + hi) / 2)
}

export interface BMP280Options { address?: number; tempC?: number; pressurePa?: number }
export interface BMP280 { tempC: number; pressurePa: number }

export function attachBMP280(sim: Sim, { address = 0x76, tempC = 25, pressurePa = 101325 }: BMP280Options = {}): BMP280 {
  const dev: BMP280 = { tempC, pressurePa }
  const calBytes: number[] = []
  for (const k of ['T1', 'T2', 'T3', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9'] as const) {
    const v = CAL[k] & 0xffff; calBytes.push(v & 0xff, v >> 8)
  }
  const data = (): number[] => {
    const adcT = bisect((a) => tempOf(a).c, 0, 1048575, dev.tempC, true)
    const fine = tempOf(adcT).fine
    const adcP = bisect((a) => pressOf(a, fine), 0, 1048575, dev.pressurePa, false)
    return [adcP >> 12, (adcP >> 4) & 0xff, (adcP & 0xf) << 4, adcT >> 12, (adcT >> 4) & 0xff, (adcT & 0xf) << 4]
  }
  const mem = new Uint8Array(256)
  sim.i2c.add(registerDevice(address, {
    read(r) {
      if (r === 0xd0) return 0x58
      if (r === 0xf3) return 0
      if (r >= 0x88 && r < 0x88 + calBytes.length) return calBytes[r - 0x88]
      if (r >= 0xf7 && r <= 0xfc) return data()[r - 0xf7]
      return mem[r]
    },
    write(r, v) { mem[r] = v },
  }))
  return dev
}

// ---- MPU6050 ----
export interface MPU6050Options {
  address?: number
  ax?: number; ay?: number; az?: number
  gx?: number; gy?: number; gz?: number
  tempC?: number
}
export interface MPU6050 { ax: number; ay: number; az: number; gx: number; gy: number; gz: number; tempC: number }

/** MPU6050 (0x68): ham ivme/jiroskop yazmaçları. dev.ax/ay/az (g), dev.gx/gy/gz (°/s), dev.tempC. */
export function attachMPU6050(
  sim: Sim,
  { address = 0x68, ax = 0, ay = 0, az = 1, gx = 0, gy = 0, gz = 0, tempC = 25 }: MPU6050Options = {},
): MPU6050 {
  const dev: MPU6050 = { ax, ay, az, gx, gy, gz, tempC }
  const mem = new Uint8Array(256)
  mem[0x6b] = 0x40
  const s16 = (v: number): number[] => { const x = Math.max(-32768, Math.min(32767, Math.round(v))) & 0xffff; return [x >> 8, x & 0xff] }
  const frame = (): number[] => {
    const aScale = [16384, 8192, 4096, 2048][(mem[0x1c] >> 3) & 3]
    const gScale = [131, 65.5, 32.8, 16.4][(mem[0x1b] >> 3) & 3]
    return [...s16(dev.ax * aScale), ...s16(dev.ay * aScale), ...s16(dev.az * aScale), ...s16((dev.tempC - 36.53) * 340), ...s16(dev.gx * gScale), ...s16(dev.gy * gScale), ...s16(dev.gz * gScale)]
  }
  sim.i2c.add(registerDevice(address, {
    read(r) { if (r === 0x75) return 0x68; if (r >= 0x3b && r <= 0x48) return frame()[r - 0x3b]; return mem[r] },
    write(r, v) { mem[r] = v },
  }))
  return dev
}

// ---- DS3231 / DS1307 ----
export interface RTCOptions { address?: number; start?: Date }
export interface RTC { base: number; baseSimMs: number; now: () => Date }

/** DS3231 / DS1307 (0x68): saat benzetim zamanıyla ilerler. */
export function attachRTC(sim: Sim, { address = 0x68, start = new Date(Date.UTC(2026, 0, 1, 0, 0, 0)) }: RTCOptions = {}): RTC {
  const dev = { base: start.getTime(), baseSimMs: 0 } as RTC
  const now = (): Date => new Date(dev.base + (sim.nowMs() - dev.baseSimMs))
  const bcd = (n: number): number => ((n / 10) | 0) << 4 | (n % 10)
  const unbcd = (b: number): number => (b >> 4) * 10 + (b & 15)
  const regs = (): number[] => { const d = now(); return [bcd(d.getUTCSeconds()), bcd(d.getUTCMinutes()), bcd(d.getUTCHours()), (d.getUTCDay() || 7), bcd(d.getUTCDate()), bcd(d.getUTCMonth() + 1), bcd(d.getUTCFullYear() % 100)] }
  const pending: Record<number, number> = {}
  sim.i2c.add(registerDevice(address, {
    read(r) { if (r <= 6) return regs()[r]; return 0 },
    write(r, v) {
      if (r > 6) return
      pending[r] = v
      const cur = regs(); for (let i = 0; i < 7; i++) if (pending[i] === undefined) pending[i] = cur[i]
      const t = Date.UTC(2000 + unbcd(pending[6]), unbcd(pending[5]) - 1, unbcd(pending[4]), unbcd(pending[2] & 0x3f), unbcd(pending[1]), unbcd(pending[0] & 0x7f))
      if (!Number.isNaN(t)) { dev.base = t; dev.baseSimMs = sim.nowMs() }
    },
  }))
  dev.now = now
  return dev
}

// ---- HD44780 LCD ----
export class HD44780 {
  readonly cols: number
  readonly rows: number
  ddram: string[] = new Array(0x80).fill(' ')
  addr = 0
  inc = 1
  fourBit = false
  hi: number | null = null
  cgram = false
  displayOn = false
  history: unknown[] = []
  constructor(cols: number, rows: number) {
    this.cols = cols; this.rows = rows
  }
  nibble(rs: boolean, n: number): void {
    if (!this.fourBit) { if (!rs && n === 0x2) { this.fourBit = true; this.hi = null } return }
    if (this.hi === null) { this.hi = n; return }
    const b = (this.hi << 4) | n; this.hi = null; this.byte(rs, b)
  }
  byte(rs: boolean, b: number): void {
    if (rs) { if (!this.cgram) { this.ddram[this.addr] = String.fromCharCode(b); this.addr = (this.addr + this.inc) & 0x7f } return }
    if (b & 0x80) { this.addr = b & 0x7f; this.cgram = false }
    else if (b & 0x40) this.cgram = true
    else if (b & 0x20) { /* işlev ayarı */ }
    else if (b & 0x10) { /* imleç/ekran kaydırma */ }
    else if (b & 0x08) this.displayOn = !!(b & 0x04)
    else if (b & 0x04) this.inc = b & 2 ? 1 : -1
    else if (b === 1) { this.ddram.fill(' '); this.addr = 0; this.inc = 1; this.cgram = false }
    else if (b === 2 || b === 3) { this.addr = 0; this.cgram = false }
  }
  lines(): string[] {
    const starts = [0x00, 0x40, 0x14, 0x54]
    return Array.from({ length: this.rows }, (_, r) => this.ddram.slice(starts[r], starts[r] + this.cols).join(''))
  }
  /** Okunabilir ekran: satırlar dizisi. */
  get text(): string[] { return this.lines() }
}

export interface LCDOptions { rs: Pin; en: Pin; d4: Pin; d5: Pin; d6: Pin; d7: Pin; cols?: number; rows?: number }

/** Paralel 4-bit LCD (LiquidCrystal). Ekran içeriği lcd.text ile okunur. */
export function attachLCD(sim: Sim, { rs, en, d4, d5, d6, d7, cols = 16, rows = 2 }: LCDOptions): HD44780 {
  const lcd = new HD44780(cols, rows)
  sim.onPin(en, (high) => {
    if (high) return
    const n = (sim.read(d4) ? 1 : 0) | (sim.read(d5) ? 2 : 0) | (sim.read(d6) ? 4 : 0) | (sim.read(d7) ? 8 : 0)
    lcd.nibble(sim.read(rs), n)
  })
  return lcd
}

export class LCDI2C extends HD44780 {
  backlight = false
}
export interface LCDI2COptions { address?: number; cols?: number; rows?: number }

/** PCF8574 arkapaketli I2C LCD (LiquidCrystal_I2C): adres 0x27 (PCF8574A için 0x3F). */
export function attachLCDI2C(sim: Sim, { address = 0x27, cols = 16, rows = 2 }: LCDI2COptions = {}): LCDI2C {
  const lcd = new LCDI2C(cols, rows)
  let prev = 0
  sim.i2c.add({
    address,
    write(v) {
      if ((prev & 4) && !(v & 4)) lcd.nibble(!!(prev & 1), prev >> 4)
      prev = v
      lcd.backlight = !!(v & 8)
    },
    read() { return 0xff },
  })
  return lcd
}

// ---- Keypad ----
export interface KeypadOptions { rows: Pin[]; cols: Pin[]; keys?: string[] }
export interface Keypad {
  press(key: string): void
  /** Tuş verilmezse hepsini bırakır. */
  release(key?: string): void
}

/** 4x4 (veya r×c) matris tuş takımı. Keypad kütüphanesiyle uyumlu: sütunlar taranır (çıkış LOW), satırlar INPUT_PULLUP okunur. */
export function attachKeypad(
  sim: Sim,
  { rows, cols, keys = ['1', '2', '3', 'A', '4', '5', '6', 'B', '7', '8', '9', 'C', '*', '0', '#', 'D'] }: KeypadOptions,
): Keypad {
  const pressed = new Set<number>()
  const update = (): void => {
    rows.forEach((rp, ri) => {
      let low = false
      cols.forEach((cp, ci) => { if (pressed.has(ri * cols.length + ci) && sim.state(cp) === 'Low') low = true })
      sim.drive(rp, !low)
    })
  }
  sim.onChange(update)
  return {
    press(key) { const i = keys.indexOf(key); if (i < 0) throw new Error(`Tuş yok: ${key}`); pressed.add(i); update() },
    release(key) { if (key === undefined) pressed.clear(); else pressed.delete(keys.indexOf(key)); update() },
  }
}
