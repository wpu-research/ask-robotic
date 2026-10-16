// Veri yolu cihaz modelleri (Aşama E): SSD1306 OLED (I2C), BME280 (I2C), DS18B20 (1-Wire), VL53L0X (I2C), HC-05 (UART).
// Hedef: değiştirilmemiş resmî kütüphaneler (Adafruit_SSD1306, Adafruit_BME280, OneWire + DallasTemperature, Pololu VL53L0X)
// gerçek donanımdaki gibi çalışsın. Tarayıcı ve Node uyumlu (Node'a özgü API yok).
import type { I2CDevice } from './devices.js'
import { registerDevice } from './devices.js'
import type { Pin, Sim } from './sim.js'

const US = 16 // 1 µs = 16 çevrim (16 MHz)
const nowUs = (sim: Sim): number => sim.cpu.cycles / US

// =====================================================================================================================
// SSD1306 128x64 OLED (I2C, 0x3C / 0x3D)
// =====================================================================================================================

/** Komut → ardından gelen parametre bayt sayısı (yalnız parametreli komutlar). */
const SSD1306_ARGS: Record<number, number> = {
  0x81: 1, 0x8d: 1, 0x20: 1, 0x21: 2, 0x22: 2, 0xa8: 1, 0xd3: 1, 0xd5: 1, 0xd9: 1, 0xda: 1, 0xdb: 1,
  0x26: 6, 0x27: 6, 0x29: 5, 0x2a: 5, 0xa3: 2,
}

export interface SSD1306Options { address?: number }
export interface SSD1306 {
  readonly width: 128
  readonly height: 64
  /** GDDRAM: 8 sayfa × 128 sütun; bayt (sayfa*128 + sütun), bit k = sayfadaki k. satır. */
  ram: Uint8Array
  /** Ekran açık (0xAF). */
  on: boolean
  /** Ters renk (0xA7). */
  inverted: boolean
  /** Tüm pikseller yanık (0xA5). */
  allOn: boolean
  contrast: number
  /** Dahili şarj pompası (0x8D 0x14): kapalıysa panel ışık vermez. */
  chargePump: boolean
  /** 0: yatay, 1: dikey, 2: sayfa adresleme. */
  addressing: number
  segRemap: boolean
  comScanDec: boolean
  startLine: number
  /** Her yazma/komutta artar (önbellek anahtarı). */
  version: number
  /** Alınan veri baytı sayısı. */
  dataBytes: number
  /** Güç kesilince denetleyici sıfırlanır (RAM ve ayarlar). */
  reset(): void
  /** Ekranda görünen pikseller (yön, başlangıç satırı, ters renk ve tüm-açık uygulanmış), sayfa düzeninde 1024 bayt. Ekran kapalıysa sıfırlar. */
  visible(): Uint8Array
  /** (x, y) pikseli yanık mı (visible() düzeninde). */
  pixel(x: number, y: number): boolean
}

export function attachSSD1306(sim: Sim, { address = 0x3c }: SSD1306Options = {}): SSD1306 {
  let ctrl = true // sıradaki bayt kontrol baytı mı
  let co = false // Co=1: tek bayt, sonra yine kontrol baytı
  let dc = false // D/C#=1: veri
  let pending: { cmd: number; need: number; args: number[] } | null = null
  let col = 0, page = 0, colStart = 0, colEnd = 127, pageStart = 0, pageEnd = 7

  const dev: SSD1306 = {
    width: 128, height: 64, ram: new Uint8Array(1024), on: false, inverted: false, allOn: false, contrast: 0x7f, chargePump: false,
    addressing: 2, segRemap: false, comScanDec: false, startLine: 0, version: 0, dataBytes: 0,
    reset() {
      dev.ram.fill(0); dev.on = false; dev.inverted = false; dev.allOn = false; dev.contrast = 0x7f; dev.chargePump = false
      dev.addressing = 2; dev.segRemap = false; dev.comScanDec = false; dev.startLine = 0
      col = 0; page = 0; colStart = 0; colEnd = 127; pageStart = 0; pageEnd = 7; pending = null; ctrl = true
      dev.version++
    },
    visible() {
      const out = new Uint8Array(1024)
      if (!dev.on || !dev.chargePump) return out
      for (let y = 0; y < 64; y++) {
        const ry = ((dev.comScanDec ? y : 63 - y) + dev.startLine) & 63
        for (let x = 0; x < 128; x++) {
          const rx = dev.segRemap ? x : 127 - x
          let lit = dev.allOn || ((dev.ram[(ry >> 3) * 128 + rx] >> (ry & 7)) & 1) === 1
          if (dev.inverted && !dev.allOn) lit = !lit
          if (lit) out[(y >> 3) * 128 + x] |= 1 << (y & 7)
        }
      }
      return out
    },
    pixel(x, y) { return ((dev.visible()[(y >> 3) * 128 + x] >> (y & 7)) & 1) === 1 },
  }

  const advance = (): void => {
    if (dev.addressing === 0) {
      if (++col > colEnd) { col = colStart; if (++page > pageEnd) page = pageStart }
    } else if (dev.addressing === 1) {
      if (++page > pageEnd) { page = pageStart; if (++col > colEnd) col = colStart }
    } else if (++col > 127) col = 0
  }
  const data = (v: number): void => {
    dev.ram[(page & 7) * 128 + (col & 127)] = v
    dev.dataBytes++
    advance()
  }
  const run = (c: number, a: number[]): void => {
    switch (c) {
      case 0x81: dev.contrast = a[0]; break
      case 0x8d: dev.chargePump = (a[0] & 0x04) !== 0; break
      case 0x20: dev.addressing = a[0] & 3; if (dev.addressing === 3) dev.addressing = 2; break
      case 0x21: colStart = a[0] & 127; colEnd = a[1] & 127; col = colStart; break
      case 0x22: pageStart = a[0] & 7; pageEnd = a[1] & 7; page = pageStart; break
      default: break // diğer parametreli komutlar (saat, çoklayıcı, ön şarj, kaydırma…) görüntüyü değiştirmez
    }
  }
  const command = (b: number): void => {
    if (pending) {
      pending.args.push(b)
      if (pending.args.length >= pending.need) { const p = pending; pending = null; run(p.cmd, p.args) }
      return
    }
    const need = SSD1306_ARGS[b]
    if (need) { pending = { cmd: b, need, args: [] }; return }
    if (b >= 0x40 && b <= 0x7f) dev.startLine = b & 63
    else if (b === 0xa0 || b === 0xa1) dev.segRemap = b === 0xa1
    else if (b === 0xa4 || b === 0xa5) dev.allOn = b === 0xa5
    else if (b === 0xa6 || b === 0xa7) dev.inverted = b === 0xa7
    else if (b === 0xae || b === 0xaf) dev.on = b === 0xaf
    else if (b === 0xc0 || b === 0xc8) dev.comScanDec = b === 0xc8
    else if (b >= 0xb0 && b <= 0xb7) page = b & 7
    else if (b <= 0x0f) col = (col & 0xf0) | b
    else if (b >= 0x10 && b <= 0x1f) col = ((b & 0x07) << 4) | (col & 0x0f)
    // 0x2E/0x2F kaydırma aç/kapa, 0xE3 NOP: görüntüye etkisi yok
  }

  const bus: I2CDevice = {
    address,
    start() { ctrl = true; co = false },
    write(v) {
      if (ctrl) { co = (v & 0x80) !== 0; dc = (v & 0x40) !== 0; ctrl = false; return }
      if (dc) data(v); else command(v)
      if (co) ctrl = true
      dev.version++
    },
    read() { return dev.on ? 0x00 : 0x40 }, // durum baytı: D6 = ekran kapalı
  }
  sim.i2c.add(bus)
  return dev
}

// Baytları base64'e çevirir (yerleşik kodlayıcı olmadan; tarayıcı ve Node).
export function toBase64(bytes: Uint8Array): string {
  const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  let s = ''
  for (let i = 0; i < bytes.length; i += 3) {
    const n = (bytes[i] << 16) | ((bytes[i + 1] ?? 0) << 8) | (bytes[i + 2] ?? 0)
    s += A[(n >> 18) & 63] + A[(n >> 12) & 63] + (i + 1 < bytes.length ? A[(n >> 6) & 63] : '=') + (i + 2 < bytes.length ? A[n & 63] : '=')
  }
  return s
}

// =====================================================================================================================
// BME280 (I2C, 0x76 / 0x77): sıcaklık, basınç, nem. Ham ADC değerleri Bosch tamsayı dengeleme formüllerinin tersiyle
// (ikili arama) üretilir; Adafruit_BME280'in okuduğu değerler özelliklere eşit çıkar.
// =====================================================================================================================

/** Gerçek bir BME280'den alınmış tipik kalibrasyon katsayıları. */
const BME = {
  T1: 28485, T2: 26735, T3: 50,
  P1: 36738, P2: -10635, P3: 3024, P4: 7834, P5: -140, P6: -7, P7: 9900, P8: -10230, P9: 4285,
  H1: 75, H2: 362, H3: 0, H4: 313, H5: 50, H6: 30,
} as const

const i32 = (x: number): number => x | 0
const div = (a: number, b: number): number => Math.trunc(a / b)

/** Bosch tamsayı sıcaklık dengelemesi (Adafruit_BME280::readTemperature ile aynı). adc 20 bit. */
export function bme280Temp(adcT: number): { tFine: number; centi: number } {
  let v1 = i32(div(adcT, 8) - BME.T1 * 2)
  v1 = div(i32(v1 * BME.T2), 2048)
  let v2 = i32(div(adcT, 16) - BME.T1)
  v2 = div(i32(div(i32(v2 * v2), 4096) * BME.T3), 16384)
  const tFine = i32(v1 + v2)
  return { tFine, centi: div(i32(tFine * 5 + 128), 256) }
}

/** Bosch 64 bit basınç dengelemesi; sonuç Pa × 256 (Q24.8). */
export function bme280Press(adcP: number, tFine: number): number {
  const B = BigInt
  let var1 = B(tFine) - 128000n
  let var2 = var1 * var1 * B(BME.P6)
  var2 = var2 + var1 * B(BME.P5) * 131072n
  var2 = var2 + B(BME.P4) * 34359738368n
  var1 = (var1 * var1 * B(BME.P3)) / 256n + var1 * B(BME.P2) * 4096n
  const var3 = 140737488355328n
  var1 = ((var3 + var1) * B(BME.P1)) / 8589934592n
  if (var1 === 0n) return 0
  let var4 = 1048576n - B(adcP)
  var4 = ((var4 * 2147483648n - var2) * 3125n) / var1
  var1 = (B(BME.P9) * (var4 / 8192n) * (var4 / 8192n)) / 33554432n
  var2 = (B(BME.P8) * var4) / 524288n
  var4 = (var4 + var1 + var2) / 256n + B(BME.P7) * 16n
  return Number(var4)
}

/** Bosch tamsayı nem dengelemesi; sonuç %RH × 1024. */
export function bme280Hum(adcH: number, tFine: number): number {
  let var1 = i32(tFine - 76800)
  let var2 = i32(adcH * 16384)
  let var3 = i32(BME.H4 * 1048576)
  let var4 = i32(BME.H5 * var1)
  let var5 = div(i32(i32(i32(var2 - var3) - var4) + 16384), 32768)
  var2 = div(i32(var1 * BME.H6), 1024)
  var3 = div(i32(var1 * BME.H3), 2048)
  var4 = i32(div(i32(var2 * i32(var3 + 32768)), 1024) + 2097152)
  var2 = div(i32(i32(var4 * BME.H2) + 8192), 16384)
  var3 = i32(var5 * var2)
  var4 = div(i32(div(var3, 32768) * div(var3, 32768)), 128)
  var5 = i32(var3 - div(i32(var4 * BME.H1), 16))
  var5 = Math.min(Math.max(var5, 0), 419430400)
  return div(var5, 4096)
}

/** Artan (inc) ya da azalan bir tamsayı fonksiyonunda hedefe en yakın girdiyi bulur. */
function closest(f: (x: number) => number, lo: number, hi: number, target: number, inc: boolean): number {
  let a = lo, b = hi
  while (a < b) {
    const m = Math.floor((a + b) / 2)
    if ((f(m) < target) === inc) a = m + 1; else b = m
  }
  const c = [a - 1, a, a + 1].filter((x) => x >= lo && x <= hi)
  return c.reduce((best, x) => (Math.abs(f(x) - target) < Math.abs(f(best) - target) ? x : best), c[0])
}

export interface BME280Options { address?: number; tempC?: number; pressurePa?: number; humidity?: number }
export interface BME280 {
  tempC: number
  pressurePa: number
  humidity: number
  /** Güç kesilince yazmaçlar sıfırlanır. */
  reset(): void
  /** Sıcaklık/basınç/nem ham ADC değerleri (20/20/16 bit). */
  raw(): { adcT: number; adcP: number; adcH: number }
}

export function attachBME280(sim: Sim, { address = 0x76, tempC = 25, pressurePa = 101325, humidity = 50 }: BME280Options = {}): BME280 {
  const cal = new Uint8Array(256)
  const le16 = (r: number, v: number): void => { const x = v & 0xffff; cal[r] = x & 0xff; cal[r + 1] = x >> 8 }
  ;(['T1', 'T2', 'T3', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9'] as const).forEach((k, i) => le16(0x88 + i * 2, BME[k]))
  cal[0xa1] = BME.H1
  le16(0xe1, BME.H2)
  cal[0xe3] = BME.H3
  cal[0xe4] = (BME.H4 >> 4) & 0xff
  cal[0xe5] = (BME.H4 & 0x0f) | ((BME.H5 & 0x0f) << 4)
  cal[0xe6] = (BME.H5 >> 4) & 0xff
  cal[0xe7] = BME.H6 & 0xff

  let ctrlHum = 0, ctrlHumLatched = 0, ctrlMeas = 0, config = 0
  /** Son ölçümün veri yazmaçları (0xF7-0xFE); sıfırlamada "ölçülmedi" değerleri. */
  let latched = [0x80, 0x00, 0x00, 0x80, 0x00, 0x00, 0x80, 0x00]
  let memo = { key: '', adcT: 0, adcP: 0, adcH: 0 }

  const dev: BME280 = {
    tempC, pressurePa, humidity,
    reset() { ctrlHum = 0; ctrlHumLatched = 0; ctrlMeas = 0; config = 0; latched = [0x80, 0x00, 0x00, 0x80, 0x00, 0x00, 0x80, 0x00] },
    raw() {
      const t = Math.min(85, Math.max(-40, dev.tempC)), p = Math.min(110000, Math.max(30000, dev.pressurePa)), h = Math.min(100, Math.max(0, dev.humidity))
      const key = `${t}|${p}|${h}`
      if (memo.key !== key) {
        const adcT = closest((a) => bme280Temp(a).centi, 0, 0xfffff, Math.round(t * 100), true)
        const tFine = bme280Temp(adcT).tFine
        const adcP = closest((a) => bme280Press(a, tFine), 0, 0xfffff, p * 256, false)
        const adcH = closest((a) => bme280Hum(a, tFine), 0, 0xffff, h * 1024, true)
        memo = { key, adcT, adcP, adcH }
      }
      return { adcT: memo.adcT, adcP: memo.adcP, adcH: memo.adcH }
    },
  }
  /** Bir ölçüm yapar: atlanan (osrs = 0) büyüklükler 0x80000 / 0x8000 kalır. */
  const measure = (): void => {
    const { adcT, adcP, adcH } = dev.raw()
    const osT = (ctrlMeas >> 5) & 7, osP = (ctrlMeas >> 2) & 7, osH = ctrlHumLatched & 7
    const t = osT ? adcT : 0x80000, p = osP ? adcP : 0x80000, h = osH ? adcH : 0x8000
    latched = [p >> 12, (p >> 4) & 0xff, (p & 0xf) << 4, t >> 12, (t >> 4) & 0xff, (t & 0xf) << 4, h >> 8, h & 0xff]
  }
  sim.i2c.add(registerDevice(address, {
    read(r) {
      if (r === 0xd0) return 0x60
      if (r === 0xf2) return ctrlHum
      if (r === 0xf3) return 0 // ölçüm/NVM kopyalama yok
      if (r === 0xf4) return ctrlMeas
      if (r === 0xf5) return config
      if (r >= 0xf7 && r <= 0xfe) {
        if ((ctrlMeas & 3) === 3) measure() // normal kip: sürekli ölçüm
        return latched[r - 0xf7]
      }
      return cal[r]
    },
    write(r, v) {
      if (r === 0xe0 && v === 0xb6) dev.reset()
      else if (r === 0xf2) ctrlHum = v & 7
      else if (r === 0xf5) config = v
      else if (r === 0xf4) {
        ctrlMeas = v
        ctrlHumLatched = ctrlHum // ctrl_hum yalnız ctrl_meas yazılınca etkinleşir (veri sayfası 5.4.3)
        const mode = v & 3
        if (mode === 1 || mode === 2) { measure(); ctrlMeas &= ~3 } // zorlanmış kip: tek ölçüm, sonra uyku
      }
    },
  }))
  return dev
}

// =====================================================================================================================
// DS18B20 (1-Wire): bit düzeyinde, çevrim-hassas bağımlı cihaz. DQ hattı açık-akaçtır: ana cihaz (Uno) ya da sensör
// LOW'a çeker, yoksa hattı yalnız pull-up direnci (4,7 kΩ) HIGH yapar. Pull-up yoksa hat yükselmez, cihaz bulunamaz.
// =====================================================================================================================

/** Dallas/Maxim CRC8 (x^8 + x^5 + x^4 + 1, LSB önce). */
export function crc8(bytes: ArrayLike<number>, n = bytes.length): number {
  let crc = 0
  for (let i = 0; i < n; i++) {
    let b = bytes[i] & 0xff
    for (let k = 0; k < 8; k++) {
      const mix = (crc ^ b) & 1
      crc >>= 1
      if (mix) crc ^= 0x8c
      b >>= 1
    }
  }
  return crc
}

/** Örnek ROM: aile 0x28 (DS18B20), 48 bit seri numara, CRC. */
export const DS18B20_ROM: readonly number[] = (() => { const r = [0x28, 0xff, 0x64, 0x1e, 0x0f, 0x47, 0x03]; return [...r, crc8(r)] })()

/** 9, 10, 11, 12 bit için dönüşüm süresi (ms): tipik değerler (veri sayfası üst sınırı 93,75 / 187,5 / 375 / 750 ms). */
const CONV_MS = [75, 150, 300, 600]

export interface DS18B20Options { pin: Pin; tempC?: number; rom?: readonly number[] }
export interface DS18B20 {
  tempC: number
  /** VDD beslemesi var (yoksa hiçbir zaman sinyal üretmez). */
  powered: boolean
  /** DQ hattında harici pull-up direnci var. */
  pullup: boolean
  readonly rom: readonly number[]
  /** Cevaplanan reset (varlık darbesi) ve tamamlanan dönüşüm sayıları. */
  presences: number
  conversions: number
  /** 9-12 bit (yapılandırma yazmacından). */
  resolution(): number
  /** Şu anki ham karalama belleği (9 bayt, CRC dahil). */
  scratchpad(): number[]
  /** Güç/pull-up değişince hattı yeniden sürer. */
  refresh(): void
}

export function attachDS18B20(sim: Sim, { pin, tempC = 25, rom = DS18B20_ROM }: DS18B20Options): DS18B20 {
  // Karalama belleği: sıcaklık (85 °C = güç açılış değeri), TH, TL, yapılandırma (12 bit)
  let temp = 0x0550, th = 0x4b, tl = 0x46, cfg = 0x7f
  const eeprom = { th, tl, cfg }
  let convEndUs = -1, convPending = false, alarm = false

  let slaveLow = false
  let masterLow = false
  let fallUs = 0
  let readSlot = false
  let gen = 0 // zamanlanmış olayların kuşağı (reset gelince eskiler geçersiz)

  /** Alınan bitlerin hedefi; `done` her tam birimde (bayt/bit) çağrılır. */
  let rx: { n: number; bits: number; val: number; done: (v: number) => void } | null = null
  /** Gönderilecek bitler; boşalınca `after` çağrılır. Kuyruk boşsa okuma dilimine `idleBit()` cevabı. */
  let tx: number[] = []
  let after: (() => void) | null = null
  let idleBit: () => number = () => 1
  let active = false // reset sonrası işlem sürüyor (false: sonraki reset'e kadar sessiz)

  const dev: DS18B20 = {
    tempC, powered: true, pullup: true, rom, presences: 0, conversions: 0,
    resolution: () => 9 + ((cfg >> 5) & 3),
    scratchpad() {
      latch()
      const b = [temp & 0xff, (temp >> 8) & 0xff, th, tl, cfg, 0xff, 0x0c, 0x10]
      return [...b, crc8(b)]
    },
    refresh: () => line(),
  }

  const line = (): void => {
    const st = sim.state(pin)
    const high = !masterLow && !slaveLow && (dev.pullup || st === 'High' || st === 'InputPullUp')
    sim.drive(pin, high)
  }
  const after_us = (us: number, fn: () => void): void => {
    const g = gen
    sim.cpu.addClockEvent(() => { if (g === gen) fn() }, Math.max(1, Math.round(us * US)))
  }
  /** Dönüşüm bittiyse sıcaklık yazmacını günceller. */
  function latch(): void {
    if (!convPending || nowUs(sim) < convEndUs) return
    convPending = false
    const res = dev.resolution()
    const t = Math.min(125, Math.max(-55, dev.tempC))
    let raw = Math.round(t * 16)
    raw &= ~((1 << (12 - res)) - 1) // düşük çözünürlükte tanımsız bitler 0
    temp = raw & 0xffff
    const whole = Math.trunc(t)
    alarm = whole >= (th << 24 >> 24) || whole <= (tl << 24 >> 24)
    dev.conversions++
  }
  const bytesToBits = (bytes: readonly number[]): number[] => bytes.flatMap((b) => [0, 1, 2, 3, 4, 5, 6, 7].map((k) => (b >> k) & 1))
  const send = (bytes: readonly number[], then: (() => void) | null = null): void => { rx = null; tx = bytesToBits(bytes); after = then }
  const receive = (n: number, done: (v: number) => void): void => { tx = []; after = null; rx = { n, bits: 0, val: 0, done } }
  const sleep = (): void => { rx = null; tx = []; after = null; active = false }

  const romCommand = (c: number): void => {
    switch (c) {
      case 0x33: send(rom, () => receive(8, funcCommand)); break // READ ROM
      case 0xcc: receive(8, funcCommand); break // SKIP ROM
      case 0x55: { // MATCH ROM
        const got: number[] = []
        receive(8, function next(v) { got.push(v); if (got.length < 8) receive(8, next); else if (got.every((b, i) => b === rom[i])) receive(8, funcCommand); else sleep() })
        break
      }
      case 0xf0: search(0); break // SEARCH ROM
      case 0xec: latch(); if (alarm) search(0); else sleep(); break // ALARM SEARCH
      default: sleep()
    }
  }
  /** ARAMA: her ROM biti için bit, tümleyeni gönderilir; ana cihazın seçtiği yön farklıysa cihaz susar. */
  const search = (i: number): void => {
    if (i >= 64) { receive(8, funcCommand); return }
    const b = (rom[i >> 3] >> (i & 7)) & 1
    rx = null
    tx = [b, b ^ 1]
    after = () => receive(1, (dir) => { if (dir === b) search(i + 1); else sleep() })
  }
  const funcCommand = (c: number): void => {
    switch (c) {
      case 0x44: // CONVERT T
        convEndUs = nowUs(sim) + CONV_MS[dev.resolution() - 9] * 1000
        convPending = true
        tx = []; after = null; rx = null
        idleBit = () => { latch(); return convPending ? 0 : 1 }
        break
      case 0xbe: send(dev.scratchpad()); idleBit = () => 1; break // READ SCRATCHPAD
      case 0x4e: { // WRITE SCRATCHPAD: TH, TL, yapılandırma
        const vals: number[] = []
        receive(8, function next(v) {
          vals.push(v)
          if (vals.length === 1) th = v; else if (vals.length === 2) tl = v; else { cfg = (v & 0x60) | 0x1f; sleep(); return }
          receive(8, next)
        })
        break
      }
      case 0x48: eeprom.th = th; eeprom.tl = tl; eeprom.cfg = cfg; tx = []; rx = null; idleBit = () => 1; break // COPY SCRATCHPAD
      case 0xb8: th = eeprom.th; tl = eeprom.tl; cfg = eeprom.cfg; tx = []; rx = null; idleBit = () => 1; break // RECALL E²
      case 0xb4: tx = []; rx = null; idleBit = () => 1; break // READ POWER SUPPLY: harici besleme → 1
      default: sleep()
    }
  }

  const onFall = (): void => {
    fallUs = nowUs(sim)
    readSlot = false
    if (!dev.powered || !active || rx) return
    // okuma dilimi: cihaz 0 göndereceksek hattı ~30 µs LOW tutar
    readSlot = true
    let bit: number
    if (tx.length) {
      bit = tx.shift()!
      if (!tx.length && after) { const a = after; after = null; a() }
    } else bit = idleBit()
    if (bit === 0) {
      slaveLow = true
      after_us(30, () => { slaveLow = false; line() })
    }
  }
  const onRise = (): void => {
    const d = nowUs(sim) - fallUs
    if (!dev.powered) return
    if (d >= 400) { // reset darbesi (≥ 480 µs): 30 µs sonra 120 µs varlık darbesi
      gen++
      slaveLow = false
      tx = []; after = null; idleBit = () => 1
      active = true
      receive(8, romCommand)
      const g = gen
      sim.cpu.addClockEvent(() => {
        if (g !== gen || !dev.powered) return
        slaveLow = true; line(); dev.presences++
        sim.cpu.addClockEvent(() => { if (g === gen) { slaveLow = false; line() } }, 120 * US)
      }, 30 * US)
      return
    }
    if (readSlot || !rx) return
    // yazma dilimi: 30 µs'de hat HIGH ise 1 (1 yazarken ana cihaz ~10 µs LOW tutar, 0 yazarken ~65 µs)
    const bit = d < 30 ? 1 : 0
    const r = rx
    r.val |= bit << r.bits
    if (++r.bits >= r.n) { rx = null; r.done(r.val) }
  }

  sim.onChange(() => {
    const low = sim.state(pin) === 'Low'
    if (low !== masterLow) {
      masterLow = low
      if (low) onFall(); else onRise()
    }
    line()
  })
  line()
  return dev
}

// =====================================================================================================================
// VL53L0X uçuş süresi (ToF) mesafe sensörü (I2C, 0x29). Pololu VL53L0X kütüphanesinin init(), tek atış ve sürekli
// ölçüm akışlarının gerektirdiği yazmaç davranışı: sayfa seçimi (0xFF), SPAD bilgisi el sıkışması (0x83/0x92),
// SYSRANGE_START (0x00), kesme durumu (0x13), sonuç bloğu (0x14, mesafe +10'da) ve kesme temizleme (0x0B).
// =====================================================================================================================

export interface VL53L0XOptions { address?: number; distanceMm?: number }
export interface VL53L0X {
  distanceMm: number
  /** Sürekli ölçüm kipinde mi. */
  continuous: boolean
  /** Tamamlanan ölçüm sayısı. */
  measurements: number
  /** XSHUT LOW / güç kesilince: yazmaçlar varsayılana döner. */
  reset(): void
  /** Ölçüm süresi bütçesi (ms), yazmaçlardaki zaman aşımı ayarlarından. */
  budgetMs(): number
}

export const VL53L0X_MAX_MM = 2000
/** Hedef menzil dışındayken (sinyal yok) okunan değer. */
export const VL53L0X_NO_TARGET = 8190

export function attachVL53L0X(sim: Sim, { address = 0x29, distanceMm = 500 }: VL53L0XOptions = {}): VL53L0X {
  const mem = new Map<number, number>()
  let page = 0
  let readyAtMs = Infinity // kesme (yeni ölçüm hazır) zamanı
  let startClearAtMs = 0 // SYSRANGE_START bit 0'ın temizleneceği zaman
  let periodMs = 33
  let spadReadyAtMs = Infinity

  const key = (r: number, pg = page): number => (pg << 8) | r
  const get = (r: number, pg = page): number => mem.get(key(r, pg)) ?? 0
  const set = (r: number, v: number, pg = page): void => { mem.set(key(r, pg), v & 0xff) }
  const now = (): number => sim.nowMs()

  const defaults = (): void => {
    mem.clear(); page = 0
    set(0xc0, 0xee, 0); set(0xc1, 0xaa, 0); set(0xc2, 0x10, 0) // model kimliği, tür, revizyon
    set(0x8a, 0x29, 0) // I2C_SLAVE_DEVICE_ADDRESS
    set(0x84, 0x11, 0) // GPIO_HV_MUX_ACTIVE_HIGH
    set(0x60, 0x00, 0) // MSRC_CONFIG_CONTROL
    set(0x01, 0xff, 0) // SYSTEM_SEQUENCE_CONFIG
    set(0xf8, 0x00, 0); set(0xf9, 0x24, 0) // OSC_CALIBRATE_VAL
    set(0x50, 0x06, 0); set(0x51, 0x00, 0); set(0x52, 0x96, 0) // PRE_RANGE vcsel / zaman aşımı
    set(0x70, 0x04, 0); set(0x71, 0x01, 0); set(0x72, 0xfe, 0) // FINAL_RANGE vcsel / zaman aşımı
    set(0x46, 0x25, 0) // MSRC_CONFIG_TIMEOUT_MACROP
    set(0x44, 0x00, 0); set(0x45, 0x20, 0) // FINAL_RANGE_CONFIG_MIN_COUNT_RATE_RTN_LIMIT
    ;[0xff, 0xff, 0xff, 0xff, 0xff, 0x0f].forEach((b, i) => set(0xb0 + i, b, 0)) // GLOBAL_CONFIG_SPAD_ENABLES_REF_0..5
    set(0x91, 0x3c, 1) // stop_variable (sayfa 1)
    set(0x92, 0x86, 7) // SPAD bilgisi: 6 referans SPAD, açıklık tipi (sayfa 7)
    readyAtMs = Infinity; startClearAtMs = 0; spadReadyAtMs = Infinity
    dev.continuous = false
  }

  const dev: VL53L0X = {
    distanceMm, continuous: false, measurements: 0,
    reset: defaults,
    budgetMs() {
      const mclksToUs = (mclks: number, vcselReg: number): number => {
        const pclks = (vcselReg + 1) << 1
        const macroNs = Math.floor((2304 * pclks * 1655 + 500) / 1000)
        return Math.floor((mclks * macroNs + 500) / 1000)
      }
      const decode = (hi: number, lo: number): number => (lo << hi) + 1
      const pre = mclksToUs(decode(get(0x51, 0), get(0x52, 0)), get(0x50, 0))
      const fin = mclksToUs(decode(get(0x71, 0), get(0x72, 0)), get(0x70, 0))
      return Math.min(2000, Math.max(10, (1910 + 960 + 550 + 660 + pre + fin) / 1000))
    },
  }

  const resultBlock = (): number[] => {
    const mm = dev.distanceMm
    const inRange = mm > 0 && mm <= VL53L0X_MAX_MM
    const range = inRange ? Math.round(mm) : VL53L0X_NO_TARGET
    const status = inRange ? 11 : 4 // 11: geçerli ölçüm, 4: faz hatası (hedef yok)
    const signal = inRange ? Math.max(1, Math.round((40 * 128 * 250 * 250) / (mm * mm))) & 0xffff : 0 // MCPS, Q9.7
    const out = new Array<number>(12).fill(0)
    out[0] = status << 3
    out[2] = 0x00; out[3] = 0x0a // etkin SPAD sayısı
    out[6] = signal >> 8; out[7] = signal & 0xff
    out[8] = 0x00; out[9] = 0x40 // ortam ışığı
    out[10] = range >> 8; out[11] = range & 0xff
    return out
  }
  let latchedResult = resultBlock()

  const startMeasurement = (ms: number): void => { readyAtMs = now() + ms }

  sim.i2c.add(registerDevice(address, {
    read(r) {
      if (r === 0xff) return page
      if (page === 0) {
        if (r === 0x00) { // SYSRANGE_START: başlatma biti ölçüm başlayınca temizlenir
          const v = get(0x00)
          return now() >= startClearAtMs ? v & ~1 : v
        }
        if (r === 0x13) { // RESULT_INTERRUPT_STATUS
          if (now() >= readyAtMs) { if (get(0x13) === 0) { latchedResult = resultBlock(); dev.measurements++ } set(0x13, 0x04); return 0x04 }
          return get(0x13)
        }
        if (r >= 0x14 && r <= 0x1f) return latchedResult[r - 0x14]
      }
      if (page === 7 && r === 0x83) return now() >= spadReadyAtMs ? 0x10 : 0x00 // SPAD bilgisi hazır
      return get(r)
    },
    write(r, v) {
      if (r === 0xff) { page = v; return }
      set(r, v)
      if (page === 7 && r === 0x83) { spadReadyAtMs = v === 0x00 ? now() + 0.3 : Infinity; return }
      if (page !== 0) return
      if (r === 0x0b && v & 1) { // SYSTEM_INTERRUPT_CLEAR
        set(0x13, 0)
        if (dev.continuous) readyAtMs = Math.max(now() + 0.2, readyAtMs + periodMs)
        else readyAtMs = Infinity
        return
      }
      if (r === 0x00) { // SYSRANGE_START
        const calib = get(0x01) === 0x01 || get(0x01) === 0x02 || (v & 0x40) !== 0
        if (v & 0x02) { // sürekli, arka arkaya
          dev.continuous = true; periodMs = dev.budgetMs(); startMeasurement(periodMs)
        } else if (v & 0x04) { // sürekli, zamanlı
          const osc = (get(0xf8) << 8) | get(0xf9)
          const per = ((get(0x04) << 24) | (get(0x05) << 16) | (get(0x06) << 8) | get(0x07)) >>> 0
          dev.continuous = true; periodMs = Math.max(dev.budgetMs(), osc ? per / osc : per); startMeasurement(periodMs)
        } else if (v & 0x01) {
          if (dev.continuous) { dev.continuous = false; readyAtMs = Infinity; set(0x00, 0); return } // sürekli ölçümü durdur
          startClearAtMs = now() + 0.1
          startMeasurement(calib ? 1.5 : dev.budgetMs())
        }
      }
    },
  }))
  defaults()
  return dev
}

// =====================================================================================================================
// HC-05 Bluetooth SPP modülü (UART). Uno tarafı bit düzeyindedir: modülün RXD'si Uno'nun gönderdiği çerçeveleri
// (başlangıç biti, 8 veri biti LSB önce, durdurma biti) örnekler, TXD'si Uno'nun giriş pinini aynı biçimde sürer.
// Böylece SoftwareSerial (pin değişim kesmesi) gerçekteki gibi çalışır; baud uyuşmazsa bozuk karakter okunur.
// Veri kipinde (EN/KEY boşta) baud varsayılan 9600'dür ve baytlar eşleşmiş telefona aktarılır; EN güç verilirken
// HIGH ise modül AT komut kipindedir (sabit 38400 baud) ve "AT...\r\n" komutlarına cevap verir.
// =====================================================================================================================

export interface HC05Options {
  /** Uno'nun dinlediği pin (modülün TXD'si buna bağlı; SoftwareSerial RX). Yoksa modül Uno'ya veri gönderemez. */
  toUno?: Pin
  /** Uno'nun gönderdiği pin (modülün RXD'si buna bağlı; SoftwareSerial TX). Yoksa modül Uno'yu duymaz. */
  fromUno?: Pin
  name?: string
}
export interface HC05 {
  /** Besleme var (yoksa TXD sürülmez, RXD dinlenmez). */
  powered: boolean
  /** AT komut kipi (EN güç verilirken HIGH). Lab bunu güç açılışında ayarlar; değişince reset() çağrılmalı. */
  atMode: boolean
  /** Telefon eşleşip bağlandı (yalnız veri kipinde anlamlı). */
  connected: boolean
  name: string
  password: string
  /** Veri kipinde UART baud'u (AT+UART ile değişir, güç döngüsünde korunur). */
  dataBaud: number
  role: number
  /** Telefondaki terminal: Uno'dan gelen baytlar (bağlıyken) ve telefondan gönderilenler. */
  phone: string
  /** Uno'dan alınan / Uno'ya gönderilen bayt sayısı. */
  rxBytes: number
  txBytes: number
  /** Çerçeve hatası (durdurma biti LOW) görülen bayt sayısı: baud uyuşmazlığının işareti. */
  framingErrors: number
  /** Şu anki UART hızı (AT kipinde 38400). */
  baud(): number
  /** Telefondan metin gönderir (yalnız bağlıyken ve veri kipinde Uno'ya ulaşır). */
  phoneSend(text: string): void
  /** Güç döngüsü: alım/gönderim kuyruğu ve AT tamponu sıfırlanır (ad, şifre, baud korunur). */
  reset(): void
}

/** HC-05 AT kipi sabit baud'u (EN/KEY HIGH iken güç verilerek girilir). */
export const HC05_AT_BAUD = 38400
/** Telefondaki terminal günlüğünün en fazla uzunluğu (karakter). */
const PHONE_MAX = 4000
const CPU_HZ_BUS = US * 1_000_000

export function attachHC05(sim: Sim, { toUno, fromUno, name = 'HC-05' }: HC05Options): HC05 {
  const VALID_BAUDS = [4800, 9600, 19200, 38400, 57600, 115200, 230400, 460800]
  let gen = 0
  let rxBusy = false
  let txQueue: number[] = []
  let txBusy = false
  let atBuf = ''
  /** Hat önce boşta (HIGH) görülmeli: pin çıkışa geçerken oluşan ilk LOW başlangıç biti sayılmaz. */
  let idleSeen = false

  const dev: HC05 = {
    powered: true, atMode: false, connected: true, name, password: '1234', dataBaud: 9600, role: 0,
    phone: '', rxBytes: 0, txBytes: 0, framingErrors: 0,
    baud: () => (dev.atMode ? HC05_AT_BAUD : dev.dataBaud),
    phoneSend(text) {
      if (!dev.powered || dev.atMode || !dev.connected) return
      log(text)
      for (const c of text) txQueue.push(c.charCodeAt(0) & 0xff)
      pump()
    },
    reset() {
      gen++
      rxBusy = false; txQueue = []; txBusy = false; atBuf = ''
      idleSeen = fromUno !== undefined && sim.read(fromUno)
      if (toUno !== undefined) sim.drive(toUno, true)
    },
  }

  const log = (s: string): void => {
    dev.phone += s
    if (dev.phone.length > PHONE_MAX) dev.phone = dev.phone.slice(-PHONE_MAX)
  }
  const bitCycles = (): number => CPU_HZ_BUS / dev.baud()

  // ---- Uno → modül: RXD'de başlangıç bitini yakala, bit ortalarından örnekle ----
  if (fromUno !== undefined) sim.onPin(fromUno, (high) => {
    if (high) { idleSeen = true; return }
    if (!idleSeen || rxBusy || !dev.powered) return
    rxBusy = true
    const g = gen
    const bc = bitCycles()
    let val = 0
    for (let k = 0; k < 8; k++) {
      sim.cpu.addClockEvent(() => { if (g === gen && sim.read(fromUno)) val |= 1 << k }, Math.max(1, Math.round(bc * (k + 1.5))))
    }
    sim.cpu.addClockEvent(() => {
      if (g !== gen) return
      rxBusy = false
      if (!sim.read(fromUno)) dev.framingErrors++
      dev.rxBytes++
      onByte(val)
    }, Math.round(bc * 9.5))
  })

  const onByte = (b: number): void => {
    if (dev.atMode) {
      atBuf += String.fromCharCode(b)
      if (atBuf.length > 128) atBuf = atBuf.slice(-128)
      if (atBuf.endsWith('\r\n')) {
        const line = atBuf.slice(0, -2)
        atBuf = ''
        const reply = atCommand(line)
        const g = gen
        sim.cpu.addClockEvent(() => { if (g === gen) reply.split('').forEach((c) => txQueue.push(c.charCodeAt(0))); pump() }, 2 * CPU_HZ_BUS / 1000)
      }
      return
    }
    if (dev.connected) log(String.fromCharCode(b))
  }

  const atCommand = (line: string): string => {
    const OK = 'OK\r\n'
    const m = /^AT(?:\+([A-Za-z]+)(\?|=(.*))?)?$/.exec(line.trim())
    if (!m) return 'ERROR:(0)\r\n'
    const cmd = (m[1] ?? '').toUpperCase()
    const query = m[2] === '?'
    const arg = m[3]
    switch (cmd) {
      case '': return OK
      case 'VERSION': return query ? '+VERSION:2.0-20100601\r\n' + OK : 'ERROR:(0)\r\n'
      case 'ADDR': return query ? '+ADDR:98d3:31:fd5e12\r\n' + OK : 'ERROR:(0)\r\n'
      case 'STATE': return query ? '+STATE:INITIALIZED\r\n' + OK : 'ERROR:(0)\r\n'
      case 'RESET': return OK
      case 'ORGL': dev.name = 'H-C-2010-06-01'; dev.password = '1234'; dev.dataBaud = 38400; dev.role = 0; return OK
      case 'NAME':
        if (query) return `+NAME:${dev.name}\r\n` + OK
        if (arg !== undefined && arg.length > 0 && arg.length <= 32) { dev.name = arg; return OK }
        return 'ERROR:(0)\r\n'
      case 'PSWD': case 'PIN':
        if (query) return `+PSWD:${dev.password}\r\n` + OK
        if (arg !== undefined && /^"?[0-9]{4,16}"?$/.test(arg)) { dev.password = arg.replace(/"/g, ''); return OK }
        return 'ERROR:(0)\r\n'
      case 'ROLE':
        if (query) return `+ROLE:${dev.role}\r\n` + OK
        if (arg === '0' || arg === '1' || arg === '2') { dev.role = Number(arg); return OK }
        return 'ERROR:(0)\r\n'
      case 'UART': {
        if (query) return `+UART:${dev.dataBaud},0,0\r\n` + OK
        const b = Number((arg ?? '').split(',')[0])
        if (VALID_BAUDS.includes(b)) { dev.dataBaud = b; return OK }
        return 'ERROR:(1C)\r\n'
      }
      default: return 'ERROR:(0)\r\n'
    }
  }

  // ---- modül → Uno: TXD'yi bit bit sür ----
  const pump = (): void => {
    if (toUno === undefined) { txQueue = []; return }
    if (txBusy || !txQueue.length || !dev.powered) return
    txBusy = true
    const g = gen
    const b = txQueue.shift()!
    const bc = bitCycles()
    const bits = [0, ...[0, 1, 2, 3, 4, 5, 6, 7].map((k) => (b >> k) & 1), 1]
    const pin = toUno
    sim.drive(pin, false)
    for (let i = 1; i < bits.length; i++) {
      const level = bits[i] === 1
      sim.cpu.addClockEvent(() => { if (g === gen) sim.drive(pin, level) }, Math.max(1, Math.round(bc * i)))
    }
    sim.cpu.addClockEvent(() => {
      if (g !== gen) return
      txBusy = false
      dev.txBytes++
      pump()
    }, Math.max(1, Math.round(bc * 10)))
  }

  if (toUno !== undefined) sim.drive(toUno, true)
  return dev
}
