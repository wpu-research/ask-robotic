// Arduino Uno (ATmega328P, 16 MHz) benzetim çekirdeği: avr8js sarmalayıcısı.
// Tarayıcıda ve Node'da çalışır: Node'a özgü API (fs, child_process, process, Buffer) KULLANILMAZ.
import {
  AVRADC, AVREEPROM, AVRIOPort, AVRTimer, AVRTWI, AVRUSART, CPU, EEPROMMemoryBackend,
  PinState, adcConfig, avrInstruction, eepromConfig, portBConfig, portCConfig, portDConfig,
  timer0Config, timer1Config, timer2Config, twiConfig, usart0Config,
} from 'avr8js'
import * as dev from './devices.js'
import * as robot from './robot.js'

export const CPU_HZ = 16_000_000

/** Arduino pin numarası (0-19) ya da 'A0'-'A5'. */
export type Pin = number | string
/** Pin değişim kaydı: t milisaniye (ondalıklı). */
export interface PinEdge { pin: Pin; value: boolean; t: number }
export interface WaveInfo { hz: number; duty: number; periods: number }
export type PinStateName = 'High' | 'Low' | 'Input' | 'InputPullUp'

/** Arduino pin numarası → { port, bit }. D0-7 = PORTD, D8-13 = PORTB, A0-A5 = D14-19 = PORTC. */
export function pinInfo(pin: Pin): { port: 'B' | 'C' | 'D'; bit: number } {
  if (typeof pin === 'string' && /^A[0-5]$/.test(pin)) return { port: 'C', bit: Number(pin[1]) }
  if (typeof pin === 'number') {
    if (pin >= 0 && pin <= 7) return { port: 'D', bit: pin }
    if (pin >= 8 && pin <= 13) return { port: 'B', bit: pin - 8 }
    if (pin >= 14 && pin <= 19) return { port: 'C', bit: pin - 14 }
  }
  throw new Error(`Geçersiz pin: ${pin}`)
}

/** Intel HEX metnini 32 KB flash'a (16 bit sözcükler) çevirir. */
export function parseHex(hex: string): Uint16Array {
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

type PortLetter = 'B' | 'C' | 'D'

export class Sim {
  readonly cpu: CPU
  readonly timers: AVRTimer[]
  readonly ports: Record<PortLetter, AVRIOPort>
  readonly adc: AVRADC
  readonly eeprom: AVREEPROM
  readonly twi: AVRTWI
  readonly i2c: dev.I2CBus
  readonly usart: AVRUSART
  /** Şimdiye kadar yazılan seri çıktı. */
  serial = ''
  /** Her pin için değişim kaydı. */
  edges: PinEdge[] = []
  private _pinCbs: Record<string, Array<(high: boolean) => void>> = {}
  private _changeCbs: Array<() => void> = []
  private _last: Record<string, boolean> = {}

  constructor(hex: string) {
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
    this.usart = new AVRUSART(this.cpu, usart0Config, CPU_HZ)
    this.usart.onByteTransmit = (b) => { this.serial += String.fromCharCode(b) }
    for (const letter of Object.keys(this.ports) as PortLetter[]) {
      const port = this.ports[letter]
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

  private _arduinoPin(letter: PortLetter, bit: number): Pin {
    if (letter === 'D') return bit
    if (letter === 'B') return bit + 8
    return `A${bit}`
  }

  /** Pin çıkış değiştirince (HIGH/LOW kenarı) çağrılır. */
  onPin(pin: Pin, cb: (high: boolean) => void): void { (this._pinCbs[pin] ??= []).push(cb) }
  /** Herhangi bir port yazmacı (PORT/DDR) değişince çağrılır. */
  onChange(cb: () => void): void { this._changeCbs.push(cb) }
  /** 'High' | 'Low' (çıkış) ya da 'Input' | 'InputPullUp'. */
  state(pin: Pin): PinStateName {
    const { port, bit } = this._port(pin)
    return PinState[port.pinState(bit)] as PinStateName
  }

  // ---- sanal cihazlar (devices.ts, robot.ts) ----
  hcsr04(o: dev.HCSR04Options): dev.HCSR04 { return dev.attachHCSR04(this, o) }
  dht(o: dev.DHTOptions): dev.DHT { return dev.attachDHT(this, o) }
  bmp280(o?: dev.BMP280Options): dev.BMP280 { return dev.attachBMP280(this, o) }
  mpu6050(o?: dev.MPU6050Options): dev.MPU6050 { return dev.attachMPU6050(this, o) }
  rtc(o?: dev.RTCOptions): dev.RTC { return dev.attachRTC(this, o) }
  lcd(o: dev.LCDOptions): dev.HD44780 { return dev.attachLCD(this, o) }
  lcdI2C(o?: dev.LCDI2COptions): dev.LCDI2C { return dev.attachLCDI2C(this, o) }
  keypad(o: dev.KeypadOptions): dev.Keypad { return dev.attachKeypad(this, o) }
  rover(o: robot.RoverConfig): robot.Rover { return robot.attachRover(this, o) }
  balancer(o: robot.BalancerConfig): robot.Balancer { return robot.attachBalancer(this, o) }

  /** Benzetim zamanı (ms). */
  nowMs(): number { return (this.cpu.cycles / CPU_HZ) * 1000 }

  /** ms milisaniye benzetim çalıştırır. */
  run(ms: number): this {
    const target = this.cpu.cycles + (ms / 1000) * CPU_HZ
    while (this.cpu.cycles < target) {
      avrInstruction(this.cpu)
      this.cpu.tick()
      // avr8js tek baytlık alma tamponuna sahiptir; kuyruktaki baytlar alıcı boşaldıkça teslim edilir.
      if (this.rxQueue.length > 0 && this.usart.writeByte(this.rxQueue[0])) this.rxQueue.shift()
    }
    return this
  }

  private _port(pin: Pin): { port: AVRIOPort; bit: number } {
    const { port, bit } = pinInfo(pin)
    return { port: this.ports[port], bit }
  }

  /** Pinin şu anki çıkış/giriş durumu: true = HIGH. */
  read(pin: Pin): boolean { const { port, bit } = this._port(pin); return port.pinState(bit) === PinState.High }

  /** Pini dışarıdan sürer (buton, sensör çıkışı). INPUT_PULLUP butonu için basılı = false (LOW). */
  drive(pin: Pin, high: boolean): void { const { port, bit } = this._port(pin); port.setPin(bit, high) }

  /** Analog girişe volt uygular (0-5 V). Kanal: 0-5 veya 'A0'-'A5'. */
  analog(channel: number | string, volts: number): void {
    const ch = typeof channel === 'string' ? Number(channel[1]) : channel
    this.adc.channelValues[ch] = volts
  }

  /** Seri porta bayt gönderir. */
  sendSerial(text: string): void { for (const c of text) this.rxQueue.push(c.charCodeAt(0)) }
  private rxQueue: number[] = []

  /** Pinin [fromMs, toMs] aralığındaki değişimleri. */
  pinEdges(pin: Pin, fromMs = 0, toMs = Infinity): PinEdge[] {
    return this.edges.filter((e) => e.pin === pin && e.t >= fromMs && e.t <= toMs)
  }

  /** Pindeki dalga biçimini bir süre gözleyip frekans (Hz) ve doluluk oranı (0-1) döndürür. */
  wave(pin: Pin, fromMs?: number, toMs?: number): WaveInfo {
    const e = this.pinEdges(pin, fromMs, toMs)
    const rises = e.filter((x) => x.value).map((x) => x.t)
    if (rises.length < 2) return { hz: 0, duty: this.read(pin) ? 1 : 0, periods: 0 }
    const period = (rises.at(-1)! - rises[0]) / (rises.length - 1)
    let high = 0
    for (let i = 0; i < e.length - 1; i++) if (e[i].value) high += e[i + 1].t - e[i].t
    const span = e.at(-1)!.t - e[0].t
    return { hz: 1000 / period, duty: span > 0 ? high / span : 0, periods: rises.length - 1 }
  }

  /** Pindeki HIGH darbe genişlikleri (mikrosaniye) — servo ve HC-SR04 echo ölçmek için. */
  pulseWidthsUs(pin: Pin, fromMs = 0, toMs = Infinity): number[] {
    const e = this.pinEdges(pin, fromMs, toMs)
    const out: number[] = []
    for (let i = 0; i < e.length - 1; i++) if (e[i].value && !e[i + 1].value) out.push((e[i + 1].t - e[i].t) * 1000)
    return out
  }
}
