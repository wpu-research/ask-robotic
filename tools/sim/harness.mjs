// Arduino sketch'lerini derleyip avr8js ile başsız (headless) çalıştıran test düzeneği.
// Hedef kart: Arduino Uno (ATmega328P, 16 MHz).
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  AVRADC, AVREEPROM, AVRIOPort, AVRTimer, AVRTWI, AVRUSART, CPU, EEPROMMemoryBackend,
  PinState, adcConfig, avrInstruction, eepromConfig, portBConfig, portCConfig, portDConfig,
  timer0Config, timer1Config, timer2Config, twiConfig, usart0Config,
} from 'avr8js'
import * as dev from './devices.mjs'
import * as robot from './robot.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const CACHE = join(HERE, '.cache')
const CPU_HZ = 16_000_000

/** Arduino pin numarası → { port, bit }. D0-7 = PORTD, D8-13 = PORTB, A0-A5 = D14-19 = PORTC. */
export function pinInfo(pin) {
  if (typeof pin === 'string' && /^A[0-5]$/.test(pin)) return { port: 'C', bit: Number(pin[1]) }
  if (pin >= 0 && pin <= 7) return { port: 'D', bit: pin }
  if (pin >= 8 && pin <= 13) return { port: 'B', bit: pin - 8 }
  if (pin >= 14 && pin <= 19) return { port: 'C', bit: pin - 14 }
  throw new Error(`Geçersiz pin: ${pin}`)
}

/** Sketch kaynağını derler, .hex içeriğini döndürür. Aynı kaynak için önbellek kullanır. */
export function compileSketch(source, { fqbn = 'arduino:avr:uno', name = 'sketch' } = {}) {
  const key = createHash('sha1').update(fqbn + source).digest('hex').slice(0, 16)
  const dir = join(CACHE, key, name)
  const hexPath = join(dir, 'build', `${name}.ino.hex`)
  if (existsSync(hexPath)) return readFileSync(hexPath, 'utf8')
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, `${name}.ino`), source)
  try {
    execFileSync('arduino-cli', ['compile', '--fqbn', fqbn, '--output-dir', join(dir, 'build'), dir], {
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 120_000,
    })
  } catch (err) {
    const out = `${err.stdout ?? ''}${err.stderr ?? ''}`.trim()
    throw new Error(`Derleme hatası (${name}):\n${out.split('\n').slice(0, 25).join('\n')}`)
  }
  return readFileSync(hexPath, 'utf8')
}

function parseHex(hex) {
  const flash = new Uint8Array(0x8000)
  for (const line of hex.split(/\r?\n/)) {
    if (!line.startsWith(':')) continue
    const len = parseInt(line.slice(1, 3), 16)
    const addr = parseInt(line.slice(3, 7), 16)
    const type = parseInt(line.slice(7, 9), 16)
    if (type !== 0) continue
    for (let i = 0; i < len; i++) flash[addr + i] = parseInt(line.slice(9 + i * 2, 11 + i * 2), 16)
  }
  return new Uint16Array(flash.buffer)
}

export class Sim {
  constructor(hex) {
    this.cpu = new CPU(parseHex(hex))
    this.timers = [new AVRTimer(this.cpu, timer0Config), new AVRTimer(this.cpu, timer1Config), new AVRTimer(this.cpu, timer2Config)]
    this.ports = {
      B: new AVRIOPort(this.cpu, portBConfig),
      C: new AVRIOPort(this.cpu, portCConfig),
      D: new AVRIOPort(this.cpu, portDConfig),
    }
    // Girişler varsayılan olarak HIGH: INPUT_PULLUP'ta iç direnç böyle davranır.
    // Düz INPUT için gerçek devrenin (pull-down vb.) durumunu drive() ile test içinde tanımla.
    for (const port of Object.values(this.ports)) for (let bit = 0; bit < 8; bit++) port.setPin(bit, true)
    this.adc = new AVRADC(this.cpu, adcConfig)
    this.eeprom = new AVREEPROM(this.cpu, new EEPROMMemoryBackend(1024), eepromConfig)
    this.twi = new AVRTWI(this.cpu, twiConfig, CPU_HZ)
    this.i2c = new dev.I2CBus(this.twi)
    this._pinCbs = {}
    this._changeCbs = []
    this.usart = new AVRUSART(this.cpu, usart0Config, CPU_HZ)
    this.serial = ''
    this.usart.onByteTransmit = (b) => { this.serial += String.fromCharCode(b) }
    /** Her pin için değişim kaydı: { pin, value, t } (t: milisaniye, ondalıklı) */
    this.edges = []
    this._last = {}
    for (const [letter, port] of Object.entries(this.ports)) {
      port.addListener(() => {
        for (let bit = 0; bit < 8; bit++) {
          const high = port.pinState(bit) === PinState.High
          const k = letter + bit
          if (this._last[k] !== high) {
            this._last[k] = high
            const pin = this._arduinoPin(letter, bit)
            this.edges.push({ pin, value: high, t: this.nowMs() })
            for (const cb of this._pinCbs[pin] ?? []) cb(high)
          }
        }
        for (const cb of this._changeCbs) cb()
      })
    }
  }

  _arduinoPin(letter, bit) {
    if (letter === 'D') return bit
    if (letter === 'B') return bit + 8
    return `A${bit}`
  }

  /** Pin çıkış değiştirince (HIGH/LOW kenarı) çağrılır. */
  onPin(pin, cb) { (this._pinCbs[pin] ??= []).push(cb) }
  /** Herhangi bir port yazmacı (PORT/DDR) değişince çağrılır. */
  onChange(cb) { this._changeCbs.push(cb) }
  /** 'High' | 'Low' (çıkış) ya da 'Input' | 'InputPullUp'. */
  state(pin) { const { port, bit } = this._port(pin); return PinState[port.pinState(bit)] }

  // ---- sanal cihazlar (devices.mjs) ----
  hcsr04(o) { return dev.attachHCSR04(this, o) }
  dht(o) { return dev.attachDHT(this, o) }
  bmp280(o) { return dev.attachBMP280(this, o) }
  mpu6050(o) { return dev.attachMPU6050(this, o) }
  rtc(o) { return dev.attachRTC(this, o) }
  lcd(o) { return dev.attachLCD(this, o) }
  lcdI2C(o) { return dev.attachLCDI2C(this, o) }
  keypad(o) { return dev.attachKeypad(this, o) }
  rover(o) { return robot.attachRover(this, o) }
  balancer(o) { return robot.attachBalancer(this, o) }

  nowMs() { return (this.cpu.cycles / CPU_HZ) * 1000 }

  /** ms milisaniye benzetim çalıştırır. */
  run(ms) {
    const target = this.cpu.cycles + (ms / 1000) * CPU_HZ
    while (this.cpu.cycles < target) {
      avrInstruction(this.cpu)
      this.cpu.tick()
    }
    return this
  }

  _port(pin) { const { port, bit } = pinInfo(pin); return { port: this.ports[port], bit } }

  /** Pinin şu anki çıkış/giriş durumu: true = HIGH. */
  read(pin) { const { port, bit } = this._port(pin); return port.pinState(bit) === PinState.High }

  /** Pini dışarıdan sürer (buton, sensör çıkışı). INPUT_PULLUP butonu için basılı = false (LOW). */
  drive(pin, high) { const { port, bit } = this._port(pin); port.setPin(bit, high) }

  /** Analog girişe volt uygular (0-5 V). Kanal: 0-5 veya 'A0'-'A5'. */
  analog(channel, volts) {
    const ch = typeof channel === 'string' ? Number(channel[1]) : channel
    this.adc.channelValues[ch] = volts
  }

  /** Seri porta bayt gönderir. */
  sendSerial(text) { for (const c of text) this.usart.writeByte(c.charCodeAt(0)) }

  /** Pinin [fromMs, toMs] aralığındaki değişimleri. */
  pinEdges(pin, fromMs = 0, toMs = Infinity) {
    return this.edges.filter((e) => e.pin === pin && e.t >= fromMs && e.t <= toMs)
  }

  /** Pindeki dalga biçimini bir süre gözleyip frekans (Hz) ve doluluk oranı (0-1) döndürür. */
  wave(pin, fromMs, toMs) {
    const e = this.pinEdges(pin, fromMs, toMs)
    const rises = e.filter((x) => x.value).map((x) => x.t)
    if (rises.length < 2) return { hz: 0, duty: this.read(pin) ? 1 : 0, periods: 0 }
    const period = (rises.at(-1) - rises[0]) / (rises.length - 1)
    let high = 0
    for (let i = 0; i < e.length - 1; i++) if (e[i].value) high += e[i + 1].t - e[i].t
    const span = e.at(-1).t - e[0].t
    return { hz: 1000 / period, duty: span > 0 ? high / span : 0, periods: rises.length - 1 }
  }

  /** Pindeki HIGH darbe genişlikleri (mikrosaniye) — servo ve HC-SR04 echo ölçmek için. */
  pulseWidthsUs(pin, fromMs = 0, toMs = Infinity) {
    const e = this.pinEdges(pin, fromMs, toMs)
    const out = []
    for (let i = 0; i < e.length - 1; i++) if (e[i].value && !e[i + 1].value) out.push((e[i + 1].t - e[i].t) * 1000)
    return out
  }
}

/** Kaynak kodu derleyip bir Sim döndürür. */
export function createSim(source, opts) { return new Sim(compileSketch(source, opts)) }

/** Yalnızca derleme denemesi (davranış kontrolü yok). */
export function assertCompiles(source, opts) { compileSketch(source, opts); return true }

export { Arena } from './robot.mjs'
