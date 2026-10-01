// Sanal cihaz modelleri: harness'taki Sim nesnesine bağlanır. Hepsi 16 MHz çevrim doğruluğunda zamanlanır.
const US = 16 // 1 µs = 16 çevrim (16 MHz)

/** HC-SR04: trig'in düşen kenarından ~450 µs sonra echo'yu mesafeyle orantılı süre HIGH yapar (58,2 µs/cm). */
export function attachHCSR04(sim, { trig, echo, cm = 100 }) {
  const dev = { cm }
  sim.drive(echo, false) // echo boşta LOW
  sim.onPin(trig, (high) => {
    if (high) return
    if (dev.cm < 2 || dev.cm > 400) return // menzil dışı: echo yok (pulseIn zaman aşımı)
    const widthUs = dev.cm * 58.2
    sim.cpu.addClockEvent(() => {
      sim.drive(echo, true)
      sim.cpu.addClockEvent(() => sim.drive(echo, false), Math.round(widthUs * US))
    }, 450 * US)
  })
  return dev
}

/** DHT11/DHT22 tek-kablo protokolü. Alanlar canlı değiştirilebilir: dev.tempC, dev.humidity. */
export function attachDHT(sim, { pin, type = 'DHT22', tempC = 25, humidity = 50 }) {
  const dev = { tempC, humidity, type, reads: 0 }
  sim.drive(pin, true)
  let lowSinceMs = null
  let responding = false
  const frame = () => {
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
  const play = (steps) => {
    let i = 0
    const next = () => {
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
      if (lowMs >= 0.4) { // geçerli başlangıç darbesi (DHT22 ≥ 1 ms, DHT11 ≥ 18 ms; kütüphane bunlara uyar)
        responding = true
        dev.reads++
        const bytes = frame()
        const steps = [[true, 25], [false, 80], [true, 80]]
        for (const b of bytes) for (let k = 7; k >= 0; k--) steps.push([false, 50], [true, (b >> k) & 1 ? 70 : 27])
        steps.push([false, 50])
        sim.cpu.addClockEvent(() => play(steps), 1)
      }
    }
  })
  return dev
}

// ---- I2C veri yolu ----
export class I2CBus {
  constructor(twi) {
    this.twi = twi
    this.devices = new Map()
    this.current = null
    twi.eventHandler = this
  }
  add(device) { this.devices.set(device.address, device); return device }
  start() { this.twi.completeStart() }
  stop() { this.current?.stop?.(); this.current = null; this.twi.completeStop() }
  connectToSlave(addr, write) {
    this.current = this.devices.get(addr) ?? null
    this.current?.start?.(write)
    this.twi.completeConnect(!!this.current)
  }
  writeByte(v) { const ok = this.current ? this.current.write(v) !== false : false; this.twi.completeWrite(ok) }
  readByte() { this.twi.completeRead(this.current ? this.current.read() & 0xff : 0xff) }
}

/** Yazmaç göstergeli (register pointer) cihaz: ilk yazılan bayt yazmaç adresi, sonrası otomatik artar. */
export function registerDevice(address, { read, write }) {
  let ptr = 0, first = true
  return {
    address,
    start(isWrite) { if (isWrite) first = true },
    write(v) { if (first) { ptr = v; first = false } else { write?.(ptr, v); ptr = (ptr + 1) & 0xff } },
    read() { const b = read(ptr); ptr = (ptr + 1) & 0xff; return b },
  }
}

// BMP280 (adres 0x76/0x77). Kalibrasyon: Bosch veri sayfası örneği.
const CAL = { T1: 27504, T2: 26435, T3: -1000, P1: 36477, P2: -10685, P3: 3024, P4: 2855, P5: 140, P6: -7, P7: 15500, P8: -14600, P9: 6000 }
const tempOf = (adc) => {
  const v1 = (adc / 16384 - CAL.T1 / 1024) * CAL.T2
  const v2 = (adc / 131072 - CAL.T1 / 8192) ** 2 * CAL.T3
  return { fine: Math.trunc(v1 + v2), c: (v1 + v2) / 5120 }
}
const pressOf = (adcP, fine) => {
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
const bisect = (f, lo, hi, target, increasing) => {
  for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; ((f(m) < target) === increasing) ? (lo = m) : (hi = m) }
  return Math.round((lo + hi) / 2)
}
export function attachBMP280(sim, { address = 0x76, tempC = 25, pressurePa = 101325 } = {}) {
  const dev = { tempC, pressurePa }
  const calBytes = []
  for (const [k, signed] of [['T1', 0], ['T2', 1], ['T3', 1], ['P1', 0], ['P2', 1], ['P3', 1], ['P4', 1], ['P5', 1], ['P6', 1], ['P7', 1], ['P8', 1], ['P9', 1]]) {
    const v = CAL[k] & 0xffff; calBytes.push(v & 0xff, v >> 8)
  }
  const data = () => {
    const adcT = bisect((a) => tempOf(a).c, 0, 1048575, dev.tempC, true)
    const fine = tempOf(adcT).fine
    const adcP = bisect((a) => pressOf(a, fine), 0, 1048575, dev.pressurePa, false)
    return [adcP >> 12, (adcP >> 4) & 0xff, (adcP & 0xf) << 4, adcT >> 12, (adcT >> 4) & 0xff, (adcT & 0xf) << 4]
  }
  const mem = new Uint8Array(256)
  return sim.i2c.add(registerDevice(address, {
    read(r) {
      if (r === 0xd0) return 0x58
      if (r === 0xf3) return 0
      if (r >= 0x88 && r < 0x88 + calBytes.length) return calBytes[r - 0x88]
      if (r >= 0xf7 && r <= 0xfc) return data()[r - 0xf7]
      return mem[r]
    },
    write(r, v) { mem[r] = v },
  })) && dev
}

/** MPU6050 (0x68): ham ivme/jiroskop yazmaçları. dev.ax/ay/az (g), dev.gx/gy/gz (°/s), dev.tempC. */
export function attachMPU6050(sim, { address = 0x68, ax = 0, ay = 0, az = 1, gx = 0, gy = 0, gz = 0, tempC = 25 } = {}) {
  const dev = { ax, ay, az, gx, gy, gz, tempC }
  const mem = new Uint8Array(256)
  mem[0x6b] = 0x40
  const s16 = (v) => { const x = Math.max(-32768, Math.min(32767, Math.round(v))) & 0xffff; return [x >> 8, x & 0xff] }
  const frame = () => {
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

/** DS3231 / DS1307 (0x68): saat benzetim zamanıyla ilerler. */
export function attachRTC(sim, { address = 0x68, start = new Date(Date.UTC(2026, 0, 1, 0, 0, 0)) } = {}) {
  const dev = { base: start.getTime(), baseSimMs: 0 }
  const now = () => new Date(dev.base + (sim.nowMs() - dev.baseSimMs))
  const bcd = (n) => ((n / 10) | 0) << 4 | (n % 10)
  const unbcd = (b) => (b >> 4) * 10 + (b & 15)
  const regs = () => { const d = now(); return [bcd(d.getUTCSeconds()), bcd(d.getUTCMinutes()), bcd(d.getUTCHours()), (d.getUTCDay() || 7), bcd(d.getUTCDate()), bcd(d.getUTCMonth() + 1), bcd(d.getUTCFullYear() % 100)] }
  const pending = {}
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
class HD44780 {
  constructor(cols, rows) {
    this.cols = cols; this.rows = rows
    this.ddram = new Array(0x80).fill(' ')
    this.addr = 0; this.inc = 1; this.fourBit = false; this.hi = null; this.cgram = false; this.displayOn = false
    this.history = []
  }
  nibble(rs, n) {
    if (!this.fourBit) { if (!rs && n === 0x2) { this.fourBit = true; this.hi = null } return }
    if (this.hi === null) { this.hi = n; return }
    const b = (this.hi << 4) | n; this.hi = null; this.byte(rs, b)
  }
  byte(rs, b) {
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
  lines() {
    const starts = [0x00, 0x40, 0x14, 0x54]
    return Array.from({ length: this.rows }, (_, r) => this.ddram.slice(starts[r], starts[r] + this.cols).join(''))
  }
  /** Okunabilir ekran: satırlar dizisi. */
  get text() { return this.lines() }
}

/** Paralel 4-bit LCD (LiquidCrystal). Ekran içeriği lcd.text ile okunur. */
export function attachLCD(sim, { rs, en, d4, d5, d6, d7, cols = 16, rows = 2 }) {
  const lcd = new HD44780(cols, rows)
  sim.onPin(en, (high) => {
    if (high) return
    const n = (sim.read(d4) ? 1 : 0) | (sim.read(d5) ? 2 : 0) | (sim.read(d6) ? 4 : 0) | (sim.read(d7) ? 8 : 0)
    lcd.nibble(sim.read(rs), n)
  })
  return lcd
}

/** PCF8574 arkapaketli I2C LCD (LiquidCrystal_I2C): adres 0x27 (PCF8574A için 0x3F). */
export function attachLCDI2C(sim, { address = 0x27, cols = 16, rows = 2 } = {}) {
  const lcd = new HD44780(cols, rows)
  let prev = 0
  lcd.backlight = false
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

/** 4x4 (veya r×c) matris tuş takımı. Keypad kütüphanesiyle uyumlu: sütunlar taranır (çıkış LOW), satırlar INPUT_PULLUP okunur. */
export function attachKeypad(sim, { rows, cols, keys = ['1', '2', '3', 'A', '4', '5', '6', 'B', '7', '8', '9', 'C', '*', '0', '#', 'D'] }) {
  const pressed = new Set()
  const update = () => {
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
