// Sanal devre laboratuvarı: Sim (avr8js) + netlist + DC çözücü. Tarayıcı ve Node uyumlu.
import { toBase64, type BME280, type DS18B20, type SSD1306, type VL53L0X, VL53L0X_MAX_MM } from '../bus-devices.js'
import { HD44780, type BMP280, type DHT, type HCSR04, type I2CDevice, type Keypad, type LCDI2C, type MPU6050, type RTC } from '../devices.js'
import { Sim, type Pin, type PinStateName } from '../sim.js'
import { oneWirePullupNets, staticWarnings } from './analysis.js'
import type {
  Circuit, LabApi, LabOptions, LabState, LabWarning, LedState, Measurement, PartInstance, PartRuntime, PinRef, PinSnapshot, PropValue, WarningKind,
} from './contract.js'
import { PINS } from './contract.js'
import { ANALOG_MODULES, MODEL, SEGMENTS, hcsr04Range, isAnalogModule, ldrOhms, ledSpecs, ntcOhms, num, sharpIrVolts, type LedSpec } from './model.js'
import { buildNetlist, type Netlist } from './netlist.js'
import { Sr595Chip, attachSr595, buildSr595, simPin, wiredUno } from './peripherals.js'
import { EncoderModel, PirModel } from './sensors.js'
import { solve, type SolverInput, type SolverResult } from './solver.js'

const UNO_PINS: readonly string[] = PINS.uno.filter((n) => /^(D\d+|A\d)$/.test(n))
const BLANK_LINES = (): string[] => [' '.repeat(16), ' '.repeat(16)]
const clamp01 = (x: number): number => Math.min(1, Math.max(0, x))

/** Bir Uno pininin kenar geçmişi: doluluk oranı, frekans ve servo darbe genişliği. */
class PinTracker {
  private edges: Array<{ t: number; high: boolean }> = []
  private lastRise: number | null = null
  lastPulseUs: number | null = null
  lastFallMs: number | null = null
  pulses = 0
  constructor(private sim: Sim, private pin: Pin) {
    sim.onPin(pin, (high) => this.push(high))
  }
  private push(high: boolean): void {
    const t = this.sim.nowMs()
    this.edges.push({ t, high })
    if (high) this.lastRise = t
    else if (this.lastRise !== null) {
      this.lastPulseUs = (t - this.lastRise) * 1000
      this.lastFallMs = t
      this.pulses++
      this.lastRise = null
    }
  }
  trim(now: number): void {
    const keep = now - 130
    let drop = 0
    while (drop + 1 < this.edges.length && this.edges[drop + 1].t <= keep) drop++
    if (drop > 0) this.edges.splice(0, drop)
  }
  /** Son `w` ms'deki HIGH oranı (0-1). */
  duty(now: number, w: number): number {
    const win = Math.min(w, now)
    if (win <= 0) return this.sim.read(this.pin) ? 1 : 0
    const start = now - win
    let level = false // güç verildiğinde pinler LOW
    let prev = start, acc = 0
    for (const e of this.edges) {
      if (e.t <= start) { level = e.high; continue }
      if (level) acc += e.t - prev
      prev = e.t; level = e.high
    }
    if (level) acc += now - prev
    return clamp01(acc / win)
  }
  /** Son `w` ms'deki yükselen kenarlardan frekans (Hz); yetersizse 0. */
  freq(now: number, w: number): number {
    let first = -1, last = -1, n = 0
    for (const e of this.edges) if (e.high && e.t > now - w) { if (n === 0) first = e.t; last = e.t; n++ }
    if (n < 2 || last <= first) return 0
    return ((n - 1) * 1000) / (last - first)
  }
}

interface SrcMeta { kind: 'rail' | 'pin'; name: string; volts: number }
interface Compiled { input: SolverInput; src: SrcMeta[]; leds: LedSpec[]; npnIds: string[] }
interface Sol { res: SolverResult; comp: Compiled }
interface I2cEntry { lcd: LCDI2C; dev: I2CDevice | undefined; reg: number | null }
/** Aşama C I2C sensörü: cihaz veri yoluna yalnız bağlı ve beslenmişse girer (syncI2c). */
interface I2cSensor { dev: I2CDevice | undefined; reg: number | null; model: BMP280 | MPU6050 | RTC | SSD1306 | BME280 | VL53L0X; powered?: boolean }

const DEFAULT_ADDR: Partial<Record<string, number>> = { lcdI2c: 0x27, bmp280: 0x76, mpu6050: 0x68, rtc: 0x68, oled: 0x3c, bme280: 0x76, vl53l0x: 0x29 }
const parseAddr = (p: PartInstance): number => {
  const def = DEFAULT_ADDR[p.type] ?? 0x27
  const n = Number(String(p.props.address ?? def))
  return Number.isFinite(n) ? n : def
}
const ADC_FRACTION = (base: number, span: number, level: number): number => clamp01(base + span * clamp01(level))

/** Köprü sürücü yarım kolu: 'H' beslemeye, 'L' toprağa sürer; null yüksek empedans (boşta). */
type Half = 'H' | 'L' | null
interface BridgeState { powered: boolean; enabled: boolean; halves: Half[] }
const BRIDGES = {
  l298n: { outs: ['OUT1', 'OUT2', 'OUT3', 'OUT4'], supply: '12V', drop: MODEL.l298nDrop, lowV: MODEL.l298nLowV },
  tb6612: { outs: ['AO1', 'AO2', 'BO1', 'BO2'], supply: 'VM', drop: MODEL.fetBridgeDrop, lowV: MODEL.fetBridgeLowV },
  drv8833: { outs: ['AOUT1', 'AOUT2', 'BOUT1', 'BOUT2'], supply: 'VCC', drop: MODEL.fetBridgeDrop, lowV: MODEL.fetBridgeLowV },
  bts7960: { outs: ['M+', 'M-'], supply: 'VCC', drop: MODEL.fetBridgeDrop, lowV: MODEL.fetBridgeLowV },
  md10c: { outs: ['MA', 'MB'], supply: 'VCC', drop: MODEL.fetBridgeDrop, lowV: MODEL.fetBridgeLowV },
} as const
type BridgeType = keyof typeof BRIDGES
const isBridge = (t: string): t is BridgeType => t in BRIDGES

/** ESC kurulum durumu (laboratuvar modeli: ~1 s düşük gaz → kurulur; darbe kesilirse bozulur). */
interface EscState { lowSince: number | null; armed: boolean }

class LabImpl implements LabApi {
  private readonly circuit: Circuit
  private nl: Netlist
  private readonly hex: string
  private sim!: Sim
  private trackers = new Map<string, PinTracker>()
  private readonly wiredPins: string[] = []
  private readonly unoId: string | undefined
  private readonly nodeIdx = new Map<number, number>()
  private nodeCount = 1
  private readonly specs: LedSpec[]
  private readonly specIndex = new Map<string, number>()
  private readonly drivers = new Map<string, string[]>() // buzzer / servo -> sürücü Uno pinleri

  private chips: Sr595Chip[] = []
  private chipById = new Map<string, Sr595Chip>()
  private lcds = new Map<string, HD44780>()
  private i2cLcds = new Map<string, I2cEntry>()
  // Aşama C
  private hcs = new Map<string, HCSR04>()
  private dhts = new Map<string, DHT>()
  private i2cSensors = new Map<string, I2cSensor>()
  private keypads = new Map<string, { dev: Keypad; pressed: string | null }>()
  private pirs = new Map<string, PirModel>()
  private encs = new Map<string, EncoderModel>()
  // Aşama D
  private steppers = new Map<string, { steps: number }>()
  private escs = new Map<string, EscState>()
  // Aşama E
  private ds18 = new Map<string, DS18B20>()
  private oledCache = new Map<string, { version: number; on: boolean; pixels: string }>()
  /** Sim cihaz modellerinin doğrudan sürdüğü Uno pinleri (ECHO, DHT DATA, keypad satırları): düğüm gerilimi bunlara yazılmaz. */
  private devOwned = new Set<string>()

  private modes: Record<string, PinStateName> = {}
  private version = 0
  private key = ''
  private base!: Sol
  private forced = new Map<string, { hi: Sol; lo: Sol }>()
  private pwmCache: { now: number; list: Array<{ name: string; duty: number }> } | null = null
  private burnt = new Set<string>()
  private dynWarnings = new Map<string, LabWarning>()
  private staticW: LabWarning[] = []
  private runtime: Record<string, PartRuntime> = {}
  private servoAngle = new Map<string, number>()
  private servoPulses = new Map<string, number>()
  private overSince = new Map<string, number>() // buzzer: son kez eşik üstü görülen zaman
  private disposed = false
  /** Sonraki boot'ta yüklenecek EEPROM (null: boş). Çalışırken state.eeprom canlı Sim'den okunur. */
  private eepromCarry: Uint8Array | null
  private eepromRestored: boolean

  constructor(circuit: Circuit, hex: string, opts?: LabOptions) {
    this.eepromCarry = opts?.eeprom ? Uint8Array.from(opts.eeprom as ArrayLike<number>, (x) => Number(x) & 0xff) : null
    this.eepromRestored = this.eepromCarry !== null
    this.circuit = {
      parts: circuit.parts.map((p) => ({ ...p, props: { ...p.props } })),
      wires: circuit.wires.map((w) => ({ ...w, a: { ...w.a }, b: { ...w.b } })),
    }
    this.hex = hex
    this.nl = buildNetlist(this.circuit)
    this.unoId = this.nl.unoId
    this.specs = ledSpecs(this.circuit)
    this.specs.forEach((s, i) => this.specIndex.set(s.key, i))
    if (this.unoId !== undefined) {
      for (const n of UNO_PINS) if (this.nl.isWired({ part: this.unoId, pin: n })) this.wiredPins.push(n)
    }
    this.allocateNodes()
    this.computeDrivers()
    this.refreshStatic()
    this.boot()
  }

  // ---- kurulum ----
  private allocateNodes(): void {
    const nl = this.nl
    if (nl.ground !== undefined) this.nodeIdx.set(nl.ground, 0)
    const take = (ref: PinRef): void => {
      const net = nl.netOf(ref)
      if (net === undefined || this.nodeIdx.has(net)) return
      this.nodeIdx.set(net, this.nodeCount++)
    }
    for (const p of this.circuit.parts) {
      if (p.type === 'uno') {
        for (const pin of ['5V', 'VIN', '3V3']) if (nl.isWired({ part: p.id, pin })) take({ part: p.id, pin })
        for (const n of this.wiredPins) take({ part: p.id, pin: n })
      } else for (const pin of PINS[p.type]) take({ part: p.id, pin })
    }
  }

  private node(ref: PinRef): number {
    const net = this.nl.netOf(ref)
    return net === undefined ? 0 : (this.nodeIdx.get(net) ?? 0)
  }

  /** Direnç zinciriyle (toprak/besleme hattından geçmeden) bir düğüme bağlı Uno pinleri. */
  private drivingPins(...refs: PinRef[]): string[] {
    const nl = this.nl
    const out: string[] = []
    const seen = new Set<number>()
    const stack: number[] = []
    for (const r of refs) { const n = nl.netOf(r); if (n !== undefined) stack.push(n) }
    while (stack.length) {
      const net = stack.pop()!
      if (seen.has(net)) continue
      seen.add(net)
      if (net === nl.ground || net === nl.rail5 || net === nl.rail3) continue
      for (const p of nl.unoPinsOnNet(net)) if (!out.includes(p)) out.push(p)
      for (const e of nl.neighbors(net, ['resistor'])) stack.push(e.to)
    }
    return out
  }

  private computeDrivers(): void {
    for (const p of this.circuit.parts) {
      if (p.type === 'buzzer') this.drivers.set(p.id, this.drivingPins({ part: p.id, pin: '+' }, { part: p.id, pin: '-' }))
      if (p.type === 'servo' || p.type === 'esc') this.drivers.set(p.id, this.nl.unoPinsOnNet(this.nl.netOf({ part: p.id, pin: 'SIG' }) ?? -1))
    }
  }

  private refreshStatic(): void {
    this.nl = buildNetlist(this.circuit)
    // Uno pinlerinin statik "yüzen" tespiti çalışma zamanında geçersiz (kod pini sürebilir); parça uyarıları kalır.
    this.staticW = staticWarnings(this.circuit, this.nl).filter((w) => !(w.kind === 'floating-input' && w.partId === this.unoId))
  }

  private boot(): void {
    this.sim = new Sim(this.hex)
    if (this.eepromCarry) this.sim.importEeprom(this.eepromCarry)
    this.trackers.clear()
    for (const n of this.wiredPins) this.trackers.set(n, new PinTracker(this.sim, simPin(n)))
    this.attachDevices()
    this.modes = {}
    this.key = ''
    this.forced.clear()
    this.pwmCache = null
    this.servoAngle.clear(); this.servoPulses.clear(); this.overSince.clear(); this.escs.clear()
    this.update(true)
  }

  /** Davranışsal aygıtları (74HC595, LCD'ler) yeni Sim'e bağlar. */
  private attachDevices(): void {
    this.chips = buildSr595(this.circuit, this.nl)
    this.chipById = new Map(this.chips.map((c) => [c.id, c] as const))
    attachSr595(this.sim, this.chips)
    this.lcds.clear(); this.i2cLcds.clear()
    for (const p of this.circuit.parts) {
      if (p.type === 'lcd1602') {
        const u = (pin: string): Pin | undefined => wiredUno(this.nl, p.id, pin)?.pin
        const rs = u('RS'), en = u('E'), d4 = u('D4'), d5 = u('D5'), d6 = u('D6'), d7 = u('D7')
        this.lcds.set(p.id, rs !== undefined && en !== undefined && d4 !== undefined && d5 !== undefined && d6 !== undefined && d7 !== undefined
          ? this.sim.lcd({ rs, en, d4, d5, d6, d7 })
          : new HD44780(16, 2))
      } else if (p.type === 'lcdI2c') {
        const addr = parseAddr(p)
        const lcd = this.sim.lcdI2C({ address: addr })
        const dev = this.sim.i2c.devices.get(addr)
        this.sim.i2c.devices.delete(addr) // veri yoluna yalnız bağlı ve beslenmişse girer (syncI2c)
        this.i2cLcds.set(p.id, { lcd, dev, reg: null })
      }
    }
    this.attachSensors()
  }

  /** Aşama C: Sim cihaz modellerini (HC-SR04, DHT, BMP280, MPU6050, RTC, keypad) ve durum modellerini (PIR, enkoder) kurar. */
  private attachSensors(): void {
    this.hcs.clear(); this.dhts.clear(); this.i2cSensors.clear(); this.keypads.clear(); this.pirs.clear(); this.encs.clear(); this.devOwned.clear()
    this.steppers.clear(); this.ds18.clear(); this.oledCache.clear()
    const u = (p: PartInstance, pin: string): { name: string; pin: Pin } | undefined => wiredUno(this.nl, p.id, pin)
    for (const p of this.circuit.parts) {
      switch (p.type) {
        case 'hcsr04': {
          const trig = u(p, 'TRIG'), echo = u(p, 'ECHO')
          if (trig && echo) { this.hcs.set(p.id, this.sim.hcsr04({ trig: trig.pin, echo: echo.pin, cm: num(p, 'distanceCm', 100) })); this.devOwned.add(echo.name) }
          break
        }
        case 'dht': {
          const data = u(p, 'DATA')
          if (data) {
            this.dhts.set(p.id, this.sim.dht({ pin: data.pin, type: p.props.type === 'dht11' ? 'DHT11' : 'DHT22', tempC: num(p, 'tempC', 25), humidity: num(p, 'humidity', 50) }))
            this.devOwned.add(data.name)
          }
          break
        }
        case 'bmp280': case 'mpu6050': case 'rtc': case 'oled': case 'bme280': case 'vl53l0x': {
          const addr = parseAddr(p)
          const model = p.type === 'bmp280' ? this.sim.bmp280({ address: addr })
            : p.type === 'mpu6050' ? this.sim.mpu6050({ address: addr })
              : p.type === 'oled' ? this.sim.ssd1306({ address: addr })
                : p.type === 'bme280' ? this.sim.bme280({ address: addr })
                  : p.type === 'vl53l0x' ? this.sim.vl53l0x({ address: addr })
                    : this.sim.rtc({ address: addr, start: new Date(MODEL.rtcStartIso) })
          const dev = this.sim.i2c.devices.get(addr)
          this.sim.i2c.devices.delete(addr) // veri yoluna yalnız bağlı ve beslenmişse girer (syncI2c)
          this.i2cSensors.set(p.id, { dev, reg: null, model })
          break
        }
        case 'keypad': {
          const rows = ['R1', 'R2', 'R3', 'R4'].map((n) => u(p, n)), cols = ['C1', 'C2', 'C3', 'C4'].map((n) => u(p, n))
          if (rows.every((x) => x) && cols.every((x) => x)) {
            this.keypads.set(p.id, { dev: this.sim.keypad({ rows: rows.map((r) => r!.pin), cols: cols.map((c) => c!.pin) }), pressed: null })
            for (const r of rows) this.devOwned.add(r!.name)
          }
          break
        }
        case 'ds18b20': {
          const dq = u(p, 'DQ')
          if (dq) { this.ds18.set(p.id, this.sim.ds18b20({ pin: dq.pin, tempC: num(p, 'tempC', 25) })); this.devOwned.add(dq.name) }
          break
        }
        case 'pir': this.pirs.set(p.id, new PirModel()); break
        case 'encoder': this.encs.set(p.id, new EncoderModel(Math.round(num(p, 'position', 0)))); break
        case 'stepper': {
          const step = u(p, 'STEP')
          const st = { steps: 0 }
          this.steppers.set(p.id, st)
          // Her yükselen STEP kenarında (beslenmiş ve etkinse) DIR yönünde bir mikro adım
          if (step) this.sim.onPin(step.pin, (high) => { if (high && this.stepperActive(p)) st.steps += this.levelNow(p, 'DIR') ? 1 : -1 })
          break
        }
        default: break
      }
    }
    for (const p of this.circuit.parts) this.applyProps(p)
  }

  /** Canlı özellikleri (mesafe, sıcaklık, ivme, tuş…) Sim cihaz modellerine yazar. */
  private applyProps(p: PartInstance): void {
    switch (p.type) {
      case 'hcsr04': {
        const d = this.hcs.get(p.id)
        if (d) { d.cm = num(p, 'distanceCm', 100); Object.assign(d, hcsr04Range(p)) }
        break
      }
      case 'dht': {
        const d = this.dhts.get(p.id)
        if (d) { d.tempC = num(p, 'tempC', 25); d.humidity = num(p, 'humidity', 50); d.type = p.props.type === 'dht11' ? 'DHT11' : 'DHT22' }
        break
      }
      case 'bmp280': {
        const m = this.i2cSensors.get(p.id)?.model as BMP280 | undefined
        if (m) { m.tempC = num(p, 'tempC', 25); m.pressurePa = num(p, 'pressureHpa', 1013.25) * 100 }
        break
      }
      case 'bme280': {
        const m = this.i2cSensors.get(p.id)?.model as BME280 | undefined
        if (m) { m.tempC = num(p, 'tempC', 25); m.pressurePa = num(p, 'pressureHpa', 1013.25) * 100; m.humidity = num(p, 'humidity', 50) }
        break
      }
      case 'vl53l0x': {
        const m = this.i2cSensors.get(p.id)?.model as VL53L0X | undefined
        if (m) m.distanceMm = num(p, 'distanceMm', 500)
        break
      }
      case 'ds18b20': {
        const d = this.ds18.get(p.id)
        if (d) d.tempC = num(p, 'tempC', 25)
        break
      }
      case 'mpu6050': {
        const m = this.i2cSensors.get(p.id)?.model as MPU6050 | undefined
        if (m) { m.ax = num(p, 'ax', 0); m.ay = num(p, 'ay', 0); m.az = num(p, 'az', 1); m.gx = num(p, 'gx', 0); m.gy = num(p, 'gy', 0); m.gz = num(p, 'gz', 0) }
        break
      }
      case 'keypad': {
        const k = this.keypads.get(p.id)
        if (!k) break
        const want = typeof p.props.key === 'string' && p.props.key !== '' ? p.props.key : null
        if (want === k.pressed) break
        k.dev.release()
        if (want !== null) { try { k.dev.press(want) } catch { /* bilinmeyen tuş: yok say */ } }
        k.pressed = want
        break
      }
      default: break
    }
  }

  // ---- LabApi ----
  get state(): LabState {
    const pins: Record<string, PinSnapshot> = {}
    const sol = this.base
    for (const n of UNO_PINS) {
      const sp = simPin(n)
      const st = this.sim.state(sp)
      const mode: PinSnapshot['mode'] = st === 'High' || st === 'Low' ? 'out' : st === 'InputPullUp' ? 'pullup' : 'in'
      let volts: number, high: boolean
      const wired = this.wiredPins.includes(n)
      if (wired && this.devOwned.has(n) && mode !== 'out') {
        high = this.sim.read(sp) // sürücü bir Sim cihaz modeli (ECHO, DHT DATA, keypad satırı)
        volts = high ? MODEL.vcc : 0
      } else if (wired && this.unoId !== undefined) {
        const nd = this.node({ part: this.unoId, pin: n })
        volts = sol.res.floating[nd] ? 0 : sol.res.volts[nd]
        high = mode === 'out' ? st === 'High' : sol.res.floating[nd] ? this.sim.read(sp) : volts > MODEL.digitalThreshold
      } else {
        high = mode === 'out' ? st === 'High' : this.sim.read(sp)
        volts = mode === 'pullup' ? MODEL.vcc : high && mode === 'out' ? MODEL.vcc : 0
      }
      pins[n] = { mode, high, volts }
    }
    const parts: Record<string, PartRuntime> = {}
    for (const [id, r] of Object.entries(this.runtime)) parts[id] = JSON.parse(JSON.stringify(r)) as PartRuntime
    return {
      timeMs: this.sim.nowMs(),
      running: !this.disposed,
      pins,
      parts,
      serial: this.sim.serial,
      warnings: this.allWarnings(),
      eeprom: this.sim.exportEeprom(),
      eepromRestored: this.eepromRestored,
    }
  }

  setProp(partId: string, key: string, value: PropValue): void {
    const part = this.circuit.parts.find((p) => p.id === partId)
    if (!part) return
    part.props[key] = value
    if (part.type === 'encoder' && key === 'position' && typeof value === 'number' && Number.isFinite(value)) this.encs.get(partId)?.setTarget(value)
    this.applyProps(part)
    this.version++
    this.refreshStatic()
    this.update(true)
  }

  advance(ms: number): void {
    if (this.disposed || !(ms > 0)) return
    let left = ms
    while (left > 1e-9) {
      const step = Math.min(1, left)
      this.sim.run(step)
      left -= step
      this.update(false)
    }
  }

  sendSerial(text: string): void { this.sim.sendSerial(text) }

  reset(opts?: { keepEeprom?: boolean }): void {
    if (opts?.keepEeprom) { this.eepromCarry = this.sim.exportEeprom(); this.eepromRestored = true } else { this.eepromCarry = null; this.eepromRestored = false }
    this.burnt.clear()
    this.dynWarnings.clear()
    this.runtime = {}
    this.boot()
  }

  dispose(): void { this.disposed = true }

  // ---- parça mantığı (düğüm gerilimlerinden) ----
  private ref(p: PartInstance, pin: string): PinRef { return { part: p.id, pin } }

  /** GND ucu kablolu ve Uno toprağıyla aynı düğümde mi. */
  private gndOk(p: PartInstance, pin: string): boolean {
    return this.nl.ground !== undefined && this.nl.isWired(this.ref(p, pin)) && this.nl.netOf(this.ref(p, pin)) === this.nl.ground
  }

  /** `vcc` ucu kablolu, toprak tamam ve gerilim ≥ powerMinVolts. */
  private supplyOk(p: PartInstance, vcc: string, gnd: string, v: Float64Array, minVolts: number = MODEL.powerMinVolts): boolean {
    return this.gndOk(p, gnd) && this.nl.isWired(this.ref(p, vcc)) && v[this.node(this.ref(p, vcc))] > minVolts
  }

  /** Aşama C modüllerinin beslenmesi (3,3 V ile çalışanlar için eşik düşük). */
  private modPowered(p: PartInstance, v: Float64Array): boolean {
    const min = isAnalogModule(p.type) ? ANALOG_MODULES[p.type].minVolts
      : ['dht', 'irobstacle', 'bmp280', 'mpu6050', 'rtc', 'joystick', 'oled', 'bme280', 'ds18b20', 'vl53l0x'].includes(p.type) ? MODEL.powerMin3v3 : MODEL.powerMinVolts
    return this.supplyOk(p, 'VCC', 'GND', v, min)
  }

  /** Giriş ucu kablolu, sürülüyor (yüzmüyor) ve eşiğin üstünde mi. */
  private inHigh(p: PartInstance, pin: string, v: Float64Array, fl: boolean[]): boolean {
    const r = this.ref(p, pin)
    if (!this.nl.isWired(r)) return false
    const n = this.node(r)
    return !fl[n] && v[n] > MODEL.digitalThreshold
  }

  private inLow(p: PartInstance, pin: string, v: Float64Array, fl: boolean[]): boolean {
    const r = this.ref(p, pin)
    if (!this.nl.isWired(r)) return false
    const n = this.node(r)
    return !fl[n] && v[n] < MODEL.digitalThreshold
  }

  private relayOn(p: PartInstance, v: Float64Array, fl: boolean[]): boolean {
    if (!this.supplyOk(p, 'VCC', 'GND', v)) return false
    return p.props.trigger === 'low' ? this.inLow(p, 'IN', v, fl) : this.inHigh(p, 'IN', v, fl)
  }

  /** 74HC595 çıkışları etkin mi: beslenmiş ve OE (aktif-LOW) sürülüyor ve düşük. */
  private chipOutputsOn(p: PartInstance, v: Float64Array, fl: boolean[]): boolean {
    return this.supplyOk(p, 'VCC', 'GND', v) && this.inLow(p, 'OE', v, fl)
  }

  /** Bir ucun şu anki seviyesi: Uno pinine bağlıysa doğrudan Sim'den (aynı ms içindeki değişiklikler için), değilse son çözümden. */
  private levelNow(p: PartInstance, pin: string): boolean {
    const w = wiredUno(this.nl, p.id, pin)
    if (w) {
      const st = this.sim.state(w.pin)
      return st === 'High' || (st !== 'Low' && this.sim.read(w.pin))
    }
    return !!this.base && this.inHigh(p, pin, this.base.res.volts, this.base.res.floating)
  }

  /** TMC2209: beslenmiş ve EN (aktif-LOW) bağlı değil ya da LOW. */
  private stepperActive(p: PartInstance): boolean {
    if (!this.base || !this.supplyOk(p, 'VCC', 'GND', this.base.res.volts, MODEL.powerMin3v3)) return false
    return !this.nl.isWired(this.ref(p, 'EN')) || !this.levelNow(p, 'EN')
  }

  /** Köprü sürücünün yarım kollarının durumu (BRIDGES[type].outs sırasıyla). Bağlı olmayan EN/SLP köprüsü (jumper) etkin sayılır. */
  private bridge(p: PartInstance & { type: BridgeType }, v: Float64Array, fl: boolean[]): BridgeState {
    const hi = (pin: string): boolean => this.inHigh(p, pin, v, fl)
    const jump = (pin: string): boolean => !this.nl.isWired(this.ref(p, pin)) || hi(pin)
    const n = BRIDGES[p.type].outs.length
    const off = (enabled: boolean): BridgeState => ({ powered: false, enabled, halves: new Array<Half>(n).fill(null) })
    switch (p.type) {
      case 'l298n': {
        if (!this.supplyOk(p, '12V', 'GND', v)) return off(false)
        const ch = (en: string, a: string, b: string): Half[] => (jump(en) ? [hi(a) ? 'H' : 'L', hi(b) ? 'H' : 'L'] : [null, null])
        return { powered: true, enabled: jump('ENA') || jump('ENB'), halves: [...ch('ENA', 'IN1', 'IN2'), ...ch('ENB', 'IN3', 'IN4')] }
      }
      case 'tb6612': {
        if (!this.supplyOk(p, 'VM', 'GND', v) || !this.supplyOk(p, 'VCC', 'GND', v, MODEL.powerMin3v3)) return off(false)
        const enabled = hi('STBY')
        const ch = (pwm: string, a: string, b: string): Half[] => {
          const i1 = hi(a), i2 = hi(b)
          if (!enabled || (!i1 && !i2)) return [null, null] // bekleme / serbest dönüş
          if ((i1 && i2) || !hi(pwm)) return ['L', 'L'] // kısa devre freni
          return i1 ? ['H', 'L'] : ['L', 'H']
        }
        return { powered: true, enabled, halves: [...ch('PWMA', 'AIN1', 'AIN2'), ...ch('PWMB', 'BIN1', 'BIN2')] }
      }
      case 'drv8833': {
        if (!this.supplyOk(p, 'VCC', 'GND', v, MODEL.powerMin3v3)) return off(false)
        const enabled = jump('SLP')
        const ch = (a: string, b: string): Half[] => {
          const i1 = hi(a), i2 = hi(b)
          if (!enabled || (!i1 && !i2)) return [null, null]
          if (i1 && i2) return ['L', 'L']
          return i1 ? ['H', 'L'] : ['L', 'H']
        }
        return { powered: true, enabled, halves: [...ch('AIN1', 'AIN2'), ...ch('BIN1', 'BIN2')] }
      }
      case 'bts7960': {
        if (!this.supplyOk(p, 'VCC', 'GND', v)) return off(false)
        // İki bağımsız yarım köprü: R_EN M+ kolunu, L_EN M- kolunu açar
        return { powered: true, enabled: hi('R_EN') && hi('L_EN'), halves: [hi('R_EN') ? (hi('RPWM') ? 'H' : 'L') : null, hi('L_EN') ? (hi('LPWM') ? 'H' : 'L') : null] }
      }
      case 'md10c': {
        if (!this.supplyOk(p, 'VCC', 'GND', v)) return off(false)
        if (!hi('PWM')) return { powered: true, enabled: true, halves: ['L', 'L'] }
        return { powered: true, enabled: true, halves: hi('DIR') ? ['L', 'H'] : ['H', 'L'] }
      }
    }
  }

  // ---- çözüm ----
  private makeKey(): string {
    const m = this.wiredPins.map((n) => {
      const s = this.modes[n]
      return s === 'High' ? 'H' : s === 'Low' ? 'L' : s === 'InputPullUp' ? 'P' : 'I'
    }).join('')
    const c = [...this.pirs.values()].map((x) => x.signature()).join('') + '/' + [...this.encs.values()].map((x) => x.signature()).join('')
    return `${m}|${this.version}|${[...this.burnt].sort().join(',')}|${this.chips.map((x) => x.signature()).join(',')}|${c}`
  }

  private compile(override?: { pin: string; high: boolean }): Compiled {
    const nl = this.nl
    const input: SolverInput = { nodes: this.nodeCount, resistors: [], sources: [], leds: [], npns: [], switches: [], logic: [] }
    const src: SrcMeta[] = []
    const npnIds: string[] = []
    const R = (a: PinRef, b: PinRef, ohms: number): void => { input.resistors.push({ a: this.node(a), b: this.node(b), ohms }) }
    const ref = (p: PartInstance, pin: string): PinRef => ({ part: p.id, pin })
    for (const p of this.circuit.parts) {
      switch (p.type) {
        case 'resistor': R(ref(p, '1'), ref(p, '2'), Math.max(num(p, 'ohms', 330), 0.01)); break
        case 'ldr': R(ref(p, '1'), ref(p, '2'), ldrOhms(num(p, 'light', 0.5))); break
        case 'ntc': R(ref(p, '1'), ref(p, '2'), ntcOhms(num(p, 'tempC', 25))); break
        case 'button': if (p.props.pressed === true) R(ref(p, 'A'), ref(p, 'B'), MODEL.buttonOnOhms); break
        case 'reed': if (p.props.magnet === true) R(ref(p, 'A'), ref(p, 'B'), MODEL.buttonOnOhms); break
        case 'joystick': {
          const tot = MODEL.dividerOhms
          for (const [pin, key] of [['VRX', 'x'], ['VRY', 'y']] as const) {
            const pos = clamp01(num(p, key, 0.5))
            R(ref(p, 'VCC'), ref(p, pin), Math.max((1 - pos) * tot, 0.01))
            R(ref(p, pin), ref(p, 'GND'), Math.max(pos * tot, 0.01))
          }
          if (nl.isWired(ref(p, 'VCC'))) R(ref(p, 'VCC'), ref(p, 'SW'), MODEL.modulePullupOhms)
          if (p.props.pressed === true) R(ref(p, 'SW'), ref(p, 'GND'), MODEL.encoderContactOhms)
          break
        }
        case 'encoder': {
          const e = this.encs.get(p.id)
          // Kartın pull-up'ları '+' ucuna bağlıdır; '+' bağlı değilse devre dışı sayılır (kod INPUT_PULLUP kullanır)
          if (nl.isWired(ref(p, 'VCC'))) for (const pin of ['CLK', 'DT', 'SW']) R(ref(p, 'VCC'), ref(p, pin), MODEL.modulePullupOhms)
          if (e && !e.clk) R(ref(p, 'CLK'), ref(p, 'GND'), MODEL.encoderContactOhms)
          if (e && !e.dt) R(ref(p, 'DT'), ref(p, 'GND'), MODEL.encoderContactOhms)
          if (p.props.pressed === true) R(ref(p, 'SW'), ref(p, 'GND'), MODEL.encoderContactOhms)
          break
        }
        case 'vl53l0x':
          // kartta XSHUT → VCC pull-up: bağlı değilse ya da pin giriş kipindeyse sensör açık
          if (nl.isWired(ref(p, 'VCC'))) R(ref(p, 'VCC'), ref(p, 'XSHUT'), MODEL.modulePullupOhms)
          break
        case 'pir': {
          const m = this.pirs.get(p.id)
          const vcc = this.node(ref(p, 'VCC'))
          input.logic!.push({ node: this.node(ref(p, 'OUT')), ohms: MODEL.moduleOutOhms, drive: (v) => (m && this.modPowered(p, v) && m.level ? v[vcc] : 0) })
          break
        }
        case 'irobstacle': {
          const prox = clamp01(num(p, 'proximity', 0)), thr = clamp01(num(p, 'threshold', 0.5))
          const f = 0.05 + 0.9 * prox
          R(ref(p, 'VCC'), ref(p, 'AO'), Math.max((1 - f) * MODEL.dividerOhms, 0.01))
          R(ref(p, 'AO'), ref(p, 'GND'), Math.max(f * MODEL.dividerOhms, 0.01))
          const vcc = this.node(ref(p, 'VCC'))
          input.logic!.push({ node: this.node(ref(p, 'OUT')), ohms: MODEL.moduleOutOhms, drive: (v) => (this.modPowered(p, v) && !(prox >= thr) ? v[vcc] : 0) })
          break
        }
        case 'sharpir': {
          const vo = sharpIrVolts(num(p, 'distanceCm', 30))
          input.logic!.push({ node: this.node(ref(p, 'VO')), ohms: MODEL.moduleOutOhms, drive: (v) => (this.modPowered(p, v) ? vo : 0) })
          break
        }
        case 'buzzer': R(ref(p, '+'), ref(p, '-'), MODEL.buzzerOhms); break
        case 'dcmotor': R(ref(p, 'M1'), ref(p, 'M2'), MODEL.motorOhms); break
        case 'pot': {
          const total = Math.max(num(p, 'ohms', 10_000), 1), pos = clamp01(num(p, 'position', 0.5))
          R(ref(p, 'VCC'), ref(p, 'SIG'), Math.max((1 - pos) * total, 0.01))
          R(ref(p, 'SIG'), ref(p, 'GND'), Math.max(pos * total, 0.01))
          break
        }
        case 'npn':
          input.npns!.push({
            b: this.node(ref(p, 'B')), c: this.node(ref(p, 'C')), e: this.node(ref(p, 'E')),
            beta: MODEL.npnBeta, vbe: MODEL.npnVbe, rbe: MODEL.npnRbe, vsat: MODEL.npnVsat, rsat: MODEL.npnRsat,
          })
          npnIds.push(p.id)
          break
        case 'mosfet': {
          const g = this.node(ref(p, 'G')), s = this.node(ref(p, 'S'))
          input.switches!.push({ a: this.node(ref(p, 'D')), b: s, ohms: MODEL.mosfetRon, closed: (v) => v[g] - v[s] > MODEL.mosfetVth })
          break
        }
        case 'relay': {
          const com = this.node(ref(p, 'COM'))
          input.switches!.push({ a: com, b: this.node(ref(p, 'NO')), ohms: MODEL.relayContactOhms, closed: (v, fl) => this.relayOn(p, v, fl) })
          input.switches!.push({ a: com, b: this.node(ref(p, 'NC')), ohms: MODEL.relayContactOhms, closed: (v, fl) => !this.relayOn(p, v, fl) })
          break
        }
        case 'l293d': {
          const vcc2 = this.node(ref(p, 'VCC2'))
          const channel = (en: string, inp: string, out: string): void => {
            input.logic!.push({
              node: this.node(ref(p, out)), ohms: MODEL.l293dOutOhms,
              drive: (v, fl) => {
                if (!this.supplyOk(p, 'VCC1', 'GND', v) || !this.supplyOk(p, 'VCC2', 'GND', v)) return null
                if (!this.inHigh(p, en, v, fl)) return null
                return this.inHigh(p, inp, v, fl) ? v[vcc2] - MODEL.l293dDrop : MODEL.l293dLowV
              },
            })
          }
          channel('EN12', 'IN1', 'OUT1'); channel('EN12', 'IN2', 'OUT2')
          channel('EN34', 'IN3', 'OUT3'); channel('EN34', 'IN4', 'OUT4')
          break
        }
        case 'sr595': {
          const chip = this.chipById.get(p.id)
          if (!chip) break
          const vcc = this.node(ref(p, 'VCC'))
          ;['QA', 'QB', 'QC', 'QD', 'QE', 'QF', 'QG', 'QH'].forEach((q, i) => {
            input.logic!.push({
              node: this.node(ref(p, q)), ohms: MODEL.sr595OutOhms,
              drive: (v, fl) => (this.chipOutputsOn(p, v, fl) ? (chip.lat[i] ? v[vcc] : 0) : null),
            })
          })
          input.logic!.push({
            node: this.node(ref(p, 'QH_')), ohms: MODEL.sr595OutOhms,
            drive: (v) => (this.supplyOk(p, 'VCC', 'GND', v) ? (chip.sh[7] ? v[vcc] : 0) : null),
          })
          break
        }
        default: {
          if (isAnalogModule(p.type)) {
            const cfg = ANALOG_MODULES[p.type]
            const level = clamp01(num(p, cfg.prop, 0)), thr = clamp01(num(p, 'threshold', 0.5))
            const f = ADC_FRACTION(cfg.base, cfg.span, level)
            R(ref(p, 'VCC'), ref(p, 'AO'), Math.max((1 - f) * MODEL.dividerOhms, 0.01))
            R(ref(p, 'AO'), ref(p, 'GND'), Math.max(f * MODEL.dividerOhms, 0.01))
            const vcc = this.node(ref(p, 'VCC'))
            input.logic!.push({ node: this.node(ref(p, 'DO')), ohms: MODEL.moduleOutOhms, drive: (v) => (this.modPowered(p, v) && !(level >= thr) ? v[vcc] : 0) })
          } else if (isBridge(p.type)) {
            const bp = p as PartInstance & { type: BridgeType }
            const cfg = BRIDGES[bp.type]
            const sup = this.node(ref(p, cfg.supply))
            cfg.outs.forEach((out, i) => {
              input.logic!.push({
                node: this.node(ref(p, out)), ohms: MODEL.bridgeOutOhms,
                drive: (v, fl) => {
                  const h = this.bridge(bp, v, fl).halves[i]
                  return h === null ? null : h === 'H' ? v[sup] - cfg.drop : cfg.lowV
                },
              })
            })
          }
          break
        }
      }
    }
    if (this.unoId !== undefined) {
      const uid = this.unoId
      if (nl.isWired({ part: uid, pin: '5V' }) || nl.isWired({ part: uid, pin: 'VIN' })) {
        input.sources.push({ node: this.node({ part: uid, pin: '5V' }), volts: MODEL.vcc, ohms: MODEL.railOhms })
        src.push({ kind: 'rail', name: '5V', volts: MODEL.vcc })
      }
      if (nl.isWired({ part: uid, pin: '3V3' })) {
        input.sources.push({ node: this.node({ part: uid, pin: '3V3' }), volts: MODEL.v3v3, ohms: MODEL.railOhms })
        src.push({ kind: 'rail', name: '3V3', volts: MODEL.v3v3 })
      }
      for (const n of this.wiredPins) {
        const st = this.modes[n] ?? 'Input'
        const node = this.node({ part: uid, pin: n })
        if (st === 'High' || st === 'Low') {
          const high = override && override.pin === n ? override.high : st === 'High'
          const v = high ? MODEL.vcc : 0
          input.sources.push({ node, volts: v, ohms: MODEL.pinOhms })
          src.push({ kind: 'pin', name: n, volts: v })
        } else if (st === 'InputPullUp') {
          input.sources.push({ node, volts: MODEL.vcc, ohms: MODEL.pullupOhms })
          src.push({ kind: 'pin', name: '', volts: MODEL.vcc }) // yalnız indeks hizası; pullup uyarıya girmez
        }
      }
    }
    for (const s of this.specs) {
      input.leds.push({ a: this.node(s.a), k: this.node(s.k), vf: s.vf, rs: s.rs, disabled: this.burnt.has(s.key) })
    }
    return { input, src, leds: this.specs, npnIds }
  }

  private runSolve(override?: { pin: string; high: boolean }): Sol {
    const comp = this.compile(override)
    return { comp, res: solve(comp.input) }
  }

  private warn(kind: WarningKind, partId: string | undefined, message: string): void {
    const k = `${kind}|${partId ?? ''}|${message}`
    if (!this.dynWarnings.has(k)) this.dynWarnings.set(k, { kind, partId, message })
  }

  /** Bir çözümde sınır aşımlarını (yanan LED, aşırı akım, kısa devre) kalıcı olarak kaydeder. */
  private scan(sol: Sol): void {
    const { res, comp } = sol
    comp.leds.forEach((s, i) => {
      if (!s.burnable) return
      const a = res.ledAmps[i]
      if (a > MODEL.ledNoResistorA) this.warn('led-no-resistor', s.partId, 'LED\'in seri direnci yok ya da çok küçük: akım güvenli sınırı aştı.')
      if (a > MODEL.ledBurnA && !this.burnt.has(s.key)) {
        this.burnt.add(s.key)
        this.warn('led-burnt', s.partId, `LED yandı (${(a * 1000).toFixed(0)} mA). Sıfırlayınca düzelir; seri direnç ekle.`)
      }
    })
    comp.npnIds.forEach((id, i) => {
      if (res.npnIb[i] > MODEL.baseOverA) this.warn('base-overcurrent', id, `Taban akımı ${(res.npnIb[i] * 1000).toFixed(0)} mA: çok yüksek. Tabana seri direnç (örn. 1 kΩ) ekle.`)
    })
    comp.input.sources.forEach((s, i) => {
      const m = comp.src[i]
      const amps = res.sourceAmps[i]
      if (m.kind === 'rail') {
        if (Math.abs(amps) > MODEL.railShortA) this.warn('short-circuit', this.unoId, `${m.name} hattı dirençsiz bir yolla topraklandı (kısa devre).`)
      } else if (m.name) {
        const drop = Math.abs(m.volts - res.volts[s.node])
        if (drop > 4.5) this.warn('short-circuit', this.unoId, `${m.name} pini doğrudan ${m.volts > 2.5 ? 'GND\'ye' : '5V\'a'} bağlı (kısa devre).`)
        if (Math.abs(amps) > MODEL.pinOvercurrentA + 1e-6) this.warn('pin-overcurrent', this.unoId, `${m.name} pininden ${(Math.abs(amps) * 1000).toFixed(0)} mA geçiyor (sınır 40 mA).`)
      }
    })
  }

  private modeNow(): boolean {
    let changed = false
    for (const n of this.wiredPins) {
      const st = this.sim.state(simPin(n))
      if (this.modes[n] !== st) { this.modes[n] = st; changed = true }
    }
    return changed
  }

  private ensureSolved(force: boolean): void {
    this.modeNow()
    let key = this.makeKey()
    if (!force && key === this.key && this.base) return
    for (let g = 0; g < 4; g++) {
      this.key = key
      this.forced.clear()
      this.pwmCache = null
      this.base = this.runSolve()
      const before = this.burnt.size
      this.scan(this.base)
      this.pushInputs()
      if (this.burnt.size === before) break
      key = this.makeKey()
    }
  }

  /** Çözülen düğüm gerilimlerini Sim'e (ADC ve dijital girişler) yazar. */
  private pushInputs(): void {
    if (this.unoId === undefined) return
    const { res } = this.base
    for (const n of this.wiredPins) {
      const nd = this.node({ part: this.unoId, pin: n })
      const floating = res.floating[nd]
      const v = floating ? 0 : res.volts[nd]
      if (n[0] === 'A') this.sim.analog(n, Math.min(MODEL.vcc, Math.max(0, v)))
      const st = this.modes[n]
      if ((st === 'Input' || st === 'InputPullUp') && !floating && !this.devOwned.has(n)) this.sim.drive(simPin(n), v > MODEL.digitalThreshold)
    }
  }

  private getForced(pin: string): { hi: Sol; lo: Sol } {
    let f = this.forced.get(pin)
    if (!f) {
      f = { hi: this.runSolve({ pin, high: true }), lo: this.runSolve({ pin, high: false }) }
      this.scan(f.hi); this.scan(f.lo)
      this.forced.set(pin, f)
    }
    return f
  }

  private isOut(pin: string): boolean { const s = this.modes[pin]; return s === 'High' || s === 'Low' }

  /** Şu an PWM yapan (doluluk 0,02-0,98) bağlı çıkış pinleri. */
  private pwmPins(now: number): Array<{ name: string; duty: number }> {
    if (this.pwmCache && this.pwmCache.now === now) return this.pwmCache.list
    const list: Array<{ name: string; duty: number }> = []
    for (const n of this.wiredPins) {
      if (!this.isOut(n)) continue
      const d = this.trackers.get(n)!.duty(now, MODEL.dutyWindowMs)
      if (d > 0.02 && d < 0.98) list.push({ name: n, duty: d })
    }
    this.pwmCache = { now, list }
    return list
  }

  /**
   * Bir büyüklüğün (f) zaman ortalaması: ilgili PWM pini varsa doluluğa göre yüksek/alçak çözümlerin karışımı,
   * yoksa anlık çözüm. Doluluk sıfır/bir uçlarında anlık değer geçerlidir.
   */
  private blend(f: (s: Sol) => number, now: number): number {
    for (const pin of this.pwmPins(now)) {
      const fo = this.getForced(pin.name)
      const h = f(fo.hi), l = f(fo.lo)
      if (Math.abs(h - l) > 1e-6) return pin.duty * h + (1 - pin.duty) * l
    }
    return f(this.base)
  }

  // ---- her ms ----
  private update(force: boolean): void {
    const now = this.sim.nowMs()
    for (const t of this.trackers.values()) t.trim(now)
    this.stepModels(now)
    this.ensureSolved(force)
    for (let g = 0; g < 3; g++) {
      const burntBefore = this.burnt.size
      this.computeRuntime(now)
      if (this.burnt.size === burntBefore) break
      this.ensureSolved(true)
    }
  }

  /** Zamana bağlı sensör modellerini (PIR ısınma/tutma, enkoder dönüşü) bir adım ilerletir; son çözümdeki beslemeyi kullanır. */
  private stepModels(now: number): void {
    if (!this.base) return
    const v = this.base.res.volts
    for (const p of this.circuit.parts) {
      if (p.type === 'pir') this.pirs.get(p.id)?.step(now, this.modPowered(p, v), p.props.motion === true)
      else if (p.type === 'encoder') this.encs.get(p.id)?.step()
    }
  }

  private ledMa(i: number, now: number): number {
    const s = this.specs[i]
    if (this.burnt.has(s.key)) return 0
    return this.blend((sol) => sol.res.ledAmps[i] * 1000, now)
  }

  private ledState(i: number, now: number): LedState {
    const s = this.specs[i]
    if (this.burnt.has(s.key)) return { on: false, brightness: 0, currentMa: 0, burnt: true }
    const ma = this.ledMa(i, now)
    const brightness = clamp01(ma / 1000 / MODEL.ledRefA)
    return { on: brightness > 0.01, brightness, currentMa: ma, burnt: false }
  }

  /** Güç/sinyal durumu çözümden çip nesnelerine (kenar geri çağırmaları bunları okur). */
  private updateChips(): void {
    const { volts, floating } = this.base.res
    for (const p of this.circuit.parts) {
      if (p.type !== 'sr595') continue
      const chip = this.chipById.get(p.id)
      if (!chip) continue
      chip.powered = this.supplyOk(p, 'VCC', 'GND', volts)
      const srclrHigh = this.inHigh(p, 'SRCLR', volts, floating)
      chip.active = chip.powered && srclrHigh
      if (!chip.powered) chip.reset()
      else if (!srclrHigh) chip.clearShift()
    }
  }

  /** I2C LCD'leri veri yoluna ekler/çıkarır: beslenmiş ve SDA→A4, SCL→A5 kablolu ise adreste cevap verir. */
  private i2cPresent(p: PartInstance, v: Float64Array): boolean {
    const sda = this.nl.netOf(this.ref(p, 'SDA')), scl = this.nl.netOf(this.ref(p, 'SCL'))
    if (sda === undefined || scl === undefined) return false
    return this.modPowered(p, v) && this.nl.unoPinsOnNet(sda).includes('A4') && this.nl.unoPinsOnNet(scl).includes('A5')
  }

  private syncI2c(p: PartInstance, present: boolean): void {
    const e = this.i2cLcds.get(p.id) ?? this.i2cSensors.get(p.id)
    if (!e) return
    const want = present ? parseAddr(p) : null
    if (e.reg === want) return
    if (e.reg !== null) this.sim.i2c.devices.delete(e.reg)
    if (want !== null && e.dev) { e.dev.address = want; this.sim.i2c.devices.set(want, e.dev) }
    e.reg = want
  }

  private measure(p: PartInstance, now: number): Measurement | undefined {
    const v = (sol: Sol, pin: string): number => sol.res.volts[this.node(this.ref(p, pin))]
    const via = (a: string, b: string, ohms: number | null): Measurement => ({
      vAcross: this.blend((s) => v(s, a) - v(s, b), now),
      currentMa: ohms === null ? 0 : this.blend((s) => ((v(s, a) - v(s, b)) / ohms) * 1000, now),
    })
    switch (p.type) {
      case 'resistor': return via('1', '2', Math.max(num(p, 'ohms', 330), 0.01))
      case 'ldr': return via('1', '2', ldrOhms(num(p, 'light', 0.5)))
      case 'ntc': return via('1', '2', ntcOhms(num(p, 'tempC', 25)))
      case 'button': return via('A', 'B', p.props.pressed === true ? MODEL.buttonOnOhms : null)
      case 'reed': return via('A', 'B', p.props.magnet === true ? MODEL.buttonOnOhms : null)
      case 'buzzer': return via('+', '-', MODEL.buzzerOhms)
      case 'dcmotor': return via('M1', 'M2', MODEL.motorOhms)
      case 'pot': return via('VCC', 'SIG', Math.max((1 - clamp01(num(p, 'position', 0.5))) * Math.max(num(p, 'ohms', 10_000), 1), 0.01))
      case 'led': case 'diode': {
        const i = this.specIndex.get(p.id)!
        return { vAcross: this.blend((s) => v(s, 'A') - v(s, 'K'), now), currentMa: this.ledMa(i, now) }
      }
      default: return undefined
    }
  }

  /** Aşama C parçalarının çalışma zamanı durumu ve cihaz modeli güç denetimi; parça Aşama C ise true. */
  private sensorRuntime(p: PartInstance, out: PartRuntime, now: number): boolean {
    void now
    const v = this.base.res.volts
    const volts = (pin: string): number => v[this.node(this.ref(p, pin))]
    switch (p.type) {
      case 'hcsr04': {
        const dev = this.hcs.get(p.id)
        const powered = this.modPowered(p, v)
        if (dev) dev.enabled = powered
        const cm = num(p, 'distanceCm', 100)
        const rg = hcsr04Range(p)
        out.hcsr04 = { powered, distanceCm: cm, inRange: cm >= rg.minCm && cm <= rg.maxCm, pings: dev?.pings ?? 0 }
        return true
      }
      case 'dht': {
        const dev = this.dhts.get(p.id)
        const powered = this.modPowered(p, v)
        if (dev) dev.enabled = powered
        out.dht = { powered, type: p.props.type === 'dht11' ? 'dht11' : 'dht22', tempC: num(p, 'tempC', 25), humidity: num(p, 'humidity', 50), reads: dev?.reads ?? 0 }
        return true
      }
      case 'pir': {
        const m = this.pirs.get(p.id)
        out.pir = { powered: this.modPowered(p, v), out: m?.level ?? false, warmingUp: m?.warmingUp ?? false }
        return true
      }
      case 'irobstacle': {
        const detected = num(p, 'proximity', 0) >= num(p, 'threshold', 0.5)
        const powered = this.modPowered(p, v)
        out.irobstacle = { powered, out: powered && !detected, detected, aoVolts: volts('AO') }
        return true
      }
      case 'reed': out.reed = { closed: p.props.magnet === true }; return true
      case 'bmp280': case 'mpu6050': case 'rtc': {
        const present = this.i2cPresent(p, v)
        this.syncI2c(p, present)
        const powered = this.modPowered(p, v)
        const e = this.i2cSensors.get(p.id)
        if (p.type === 'bmp280') out.bmp280 = { powered, present, tempC: num(p, 'tempC', 25), pressureHpa: num(p, 'pressureHpa', 1013.25) }
        else if (p.type === 'mpu6050') {
          out.mpu6050 = { powered, present, ax: num(p, 'ax', 0), ay: num(p, 'ay', 0), az: num(p, 'az', 1), gx: num(p, 'gx', 0), gy: num(p, 'gy', 0), gz: num(p, 'gz', 0) }
        } else out.rtc = { powered, present, time: (e?.model as RTC | undefined)?.now().toISOString() ?? MODEL.rtcStartIso }
        return true
      }
      case 'oled': case 'bme280': case 'vl53l0x': {
        const powered = this.modPowered(p, v)
        const xshutOff = p.type === 'vl53l0x' && this.inLow(p, 'XSHUT', v, this.base.res.floating)
        const present = this.i2cPresent(p, v) && !xshutOff
        this.syncI2c(p, present)
        const e = this.i2cSensors.get(p.id)
        if (e) {
          // güç kesilince ya da XSHUT LOW iken denetleyici sıfırlanır (yeniden başlatma gerekir)
          const alive = powered && !xshutOff
          if (e.powered !== undefined && e.powered && !alive) (e.model as SSD1306 | BME280 | VL53L0X).reset()
          e.powered = alive
        }
        if (p.type === 'oled') {
          const m = e?.model as SSD1306 | undefined
          let c = this.oledCache.get(p.id)
          const on = present && !!m && m.on && m.chargePump
          if (m && (!c || c.version !== m.version || c.on !== on)) {
            c = { version: m.version, on, pixels: toBase64(on ? m.visible() : new Uint8Array(1024)) }
            this.oledCache.set(p.id, c)
          }
          out.oled = { powered, present, on, inverted: !!m?.inverted, contrast: m?.contrast ?? 0, pixels: c?.pixels ?? toBase64(new Uint8Array(1024)) }
        } else if (p.type === 'bme280') {
          out.bme280 = { powered, present, tempC: num(p, 'tempC', 25), pressureHpa: num(p, 'pressureHpa', 1013.25), humidity: num(p, 'humidity', 50) }
        } else {
          const m = e?.model as VL53L0X | undefined
          const mm = num(p, 'distanceMm', 500)
          out.vl53l0x = { powered, present, distanceMm: mm, inRange: mm <= VL53L0X_MAX_MM, continuous: present && !!m?.continuous, measurements: m?.measurements ?? 0 }
        }
        return true
      }
      case 'ds18b20': {
        const d = this.ds18.get(p.id)
        const powered = this.modPowered(p, v)
        const pullup = oneWirePullupNets(this.circuit, this.nl, p).some((n) => v[this.nodeIdx.get(n) ?? 0] > MODEL.powerMin3v3)
        if (d && (d.powered !== powered || d.pullup !== pullup)) { d.powered = powered; d.pullup = pullup; d.refresh() }
        out.ds18b20 = { powered, present: !!d && powered && pullup, pullup, tempC: num(p, 'tempC', 25), resolution: d?.resolution() ?? 12, conversions: d?.conversions ?? 0 }
        return true
      }
      case 'joystick':
        out.joystick = { powered: this.modPowered(p, v), x: clamp01(num(p, 'x', 0.5)), y: clamp01(num(p, 'y', 0.5)), pressed: p.props.pressed === true, vrxVolts: volts('VRX'), vryVolts: volts('VRY') }
        return true
      case 'encoder': {
        const e = this.encs.get(p.id)
        out.encoder = { position: e?.position ?? 0, moving: e?.moving ?? false, clk: e?.clk ?? true, dt: e?.dt ?? true, pressed: p.props.pressed === true }
        return true
      }
      case 'keypad': out.keypad = { key: this.keypads.get(p.id)?.pressed ?? null }; return true
      case 'sharpir': {
        const cm = num(p, 'distanceCm', 30)
        out.sharpir = { powered: this.modPowered(p, v), distanceCm: cm, voVolts: volts('VO') }
        return true
      }
      case 'stepper': {
        const steps = this.steppers.get(p.id)?.steps ?? 0
        const micro = Math.max(1, Number(p.props.microsteps ?? 8) || 8)
        out.stepper = {
          powered: this.supplyOk(p, 'VCC', 'GND', v, MODEL.powerMin3v3), enabled: this.stepperActive(p),
          steps, angleDeg: (steps * MODEL.stepDeg) / micro, dirHigh: this.levelNow(p, 'DIR'),
        }
        return true
      }
      case 'esc': {
        out.esc = this.escRuntime(p, now)
        return true
      }
      default: {
        if (isAnalogModule(p.type)) {
          const level = clamp01(num(p, ANALOG_MODULES[p.type].prop, 0))
          out.analogModule = { powered: this.modPowered(p, v), level, aoVolts: volts('AO'), doHigh: volts('DO') > MODEL.digitalThreshold }
          return true
        }
        if (isBridge(p.type)) {
          const bp = p as PartInstance & { type: BridgeType }
          const cfg = BRIDGES[bp.type]
          const st = this.bridge(bp, v, this.base.res.floating)
          const sup = Math.max(volts(cfg.supply), 0.1)
          const channels: { out: number; brake: boolean }[] = []
          for (let i = 0; i < cfg.outs.length; i += 2) {
            const a = cfg.outs[i], b = cfg.outs[i + 1]
            const out = this.blend((s) => {
              const d = s.res.volts[this.node(this.ref(p, a))] - s.res.volts[this.node(this.ref(p, b))]
              return Math.min(1, Math.max(-1, d / sup))
            }, now)
            const h1 = st.halves[i], h2 = st.halves[i + 1]
            channels.push({ out: Math.abs(out) < 1e-4 ? 0 : out, brake: h1 !== null && h1 === h2 })
          }
          out.driver = { powered: st.powered, enabled: st.enabled, channels }
          return true
        }
        return false
      }
    }
  }

  /** ESC: SIG darbe genişliği (servo gibi) → kurulum ve gaz. GND ortak değilse sinyali görmez. */
  private escRuntime(p: PartInstance, now: number): NonNullable<PartRuntime['esc']> {
    const st = this.escs.get(p.id) ?? { lowSince: null, armed: false }
    this.escs.set(p.id, st)
    let us = 0, live = false
    if (this.gndOk(p, 'GND')) {
      for (const n of this.drivers.get(p.id) ?? []) {
        const t = this.trackers.get(n)
        if (!t || t.lastPulseUs === null || t.lastFallMs === null) continue
        if (now - t.lastFallMs < MODEL.escLossMs && t.lastPulseUs > 400 && t.lastPulseUs < 2700) { us = t.lastPulseUs; live = true }
      }
    }
    if (!live) { st.armed = false; st.lowSince = null }
    else if (!st.armed) {
      if (us < MODEL.escArmUs) { st.lowSince ??= now; if (now - st.lowSince >= MODEL.escArmMs) st.armed = true }
      else st.lowSince = null // gaz açıkken kurulmaz (güvenlik)
    }
    const throttle = st.armed ? clamp01((us - MODEL.escMinUs) / (MODEL.escMaxUs - MODEL.escMinUs)) : 0
    const cells = Number(p.props.cells ?? 3) || 3
    return { armed: st.armed, pulseUs: live ? Math.round(us) : 0, throttle, rpm: Math.round(num(p, 'kv', 2300) * cells * MODEL.lipoCellV * throttle) }
  }

  private computeRuntime(now: number): void {
    this.updateChips()
    const volts = (ref: PinRef): number => this.base.res.volts[this.node(ref)]
    const rt: Record<string, PartRuntime> = {}
    for (const p of this.circuit.parts) {
      const meas = this.measure(p, now)
      const out: PartRuntime = meas ? { meas } : {}
      rt[p.id] = out
      if (p.type === 'led') {
        out.led = this.ledState(this.specIndex.get(p.id)!, now)
      } else if (p.type === 'rgbled') {
        const b = (c: string): number => this.ledState(this.specIndex.get(`${p.id}.${c}`)!, now).brightness
        out.rgbled = { r: b('R'), g: b('G'), b: b('B') }
      } else if (p.type === 'sevenseg') {
        const segs = {} as Record<(typeof SEGMENTS)[number], number>
        for (const c of SEGMENTS) segs[c] = this.ledState(this.specIndex.get(`${p.id}.${c}`)!, now).brightness
        out.sevenseg = { segments: segs }
      } else if (p.type === 'dcmotor') {
        const speed = this.blend((s) => {
          const d = s.res.volts[this.node(this.ref(p, 'M1'))] - s.res.volts[this.node(this.ref(p, 'M2'))]
          return Math.min(1, Math.max(-1, d / MODEL.motorRatedV))
        }, now)
        out.dcmotor = { speed: Math.abs(speed) < 1e-4 ? 0 : speed }
      } else if (p.type === 'relay') {
        out.relay = { energized: this.relayOn(p, this.base.res.volts, this.base.res.floating) }
      } else if (p.type === 'sr595') {
        const chip = this.chipById.get(p.id)
        const on = this.chipOutputsOn(p, this.base.res.volts, this.base.res.floating)
        out.sr595 = { outputs: chip ? chip.lat.map((b) => on && b) : new Array(8).fill(false) }
      } else if (p.type === 'lcd1602') {
        const dev = this.lcds.get(p.id)
        const v = this.base.res.volts
        const powered = this.supplyOk(p, 'VDD', 'VSS', v)
        const rwOk = this.gndOk(p, 'RW')
        const v0Wired = this.nl.isWired(this.ref(p, 'V0'))
        const contrastOk = !v0Wired || volts(this.ref(p, 'V0')) <= MODEL.lcdV0Max
        const visible = powered && rwOk && contrastOk && !!dev && dev.displayOn
        const bl = this.specIndex.get(`${p.id}.bl`)
        out.lcd = {
          lines: visible && dev ? dev.lines() : BLANK_LINES(),
          backlight: powered && bl !== undefined && this.ledMa(bl, now) / 1000 > MODEL.lcdBlOnA,
          poweredOn: powered,
        }
      } else if (p.type === 'lcdI2c') {
        const e = this.i2cLcds.get(p.id)
        const v = this.base.res.volts
        const present = this.i2cPresent(p, v)
        this.syncI2c(p, present)
        out.lcd = {
          lines: present && e && e.lcd.displayOn ? e.lcd.lines() : BLANK_LINES(),
          backlight: present && !!e && e.lcd.backlight,
          poweredOn: this.supplyOk(p, 'VCC', 'GND', v),
        }
      } else if (this.sensorRuntime(p, out, now)) {
        /* Aşama C parçası dolduruldu */
      } else if (p.type === 'buzzer') {
        const v = volts({ part: p.id, pin: '+' }) - volts({ part: p.id, pin: '-' })
        if (Math.abs(v) > MODEL.buzzerOnVolts) this.overSince.set(p.id, now)
        const powered = now - (this.overSince.get(p.id) ?? -1e9) < 5
        const pins = this.drivers.get(p.id) ?? []
        if (p.props.kind === 'active') {
          const pwm = pins.some((n) => this.isOut(n) && this.trackers.get(n)!.duty(now, MODEL.dutyWindowMs) > 0.1)
          const on = (v > MODEL.buzzerOnVolts) || (powered && pwm)
          out.buzzer = { on, freqHz: on ? MODEL.activeBuzzerHz : 0 }
        } else {
          let hz = 0
          for (const n of pins) hz = Math.max(hz, this.trackers.get(n)!.freq(now, MODEL.waveWindowMs))
          const on = hz > 0 && powered
          out.buzzer = { on, freqHz: on ? hz : 0 }
        }
      } else if (p.type === 'servo') {
        const pins = this.drivers.get(p.id) ?? []
        const vcc = volts({ part: p.id, pin: 'VCC' }), gnd = volts({ part: p.id, pin: 'GND' })
        const powered = this.nl.isWired({ part: p.id, pin: 'VCC' }) && this.nl.isWired({ part: p.id, pin: 'GND' }) && vcc - gnd > MODEL.servoMinVolts
        let angle = this.servoAngle.get(p.id) ?? 90
        let attached = false
        for (const n of pins) {
          const t = this.trackers.get(n)
          if (!t || t.lastPulseUs === null) continue
          if (t.lastFallMs !== null && now - t.lastFallMs < 60) attached = true
          if (powered && t.pulses !== (this.servoPulses.get(`${p.id}.${n}`) ?? 0) && t.lastPulseUs > 400 && t.lastPulseUs < 2700) {
            angle = clamp01((t.lastPulseUs - MODEL.servoMinUs) / (MODEL.servoMaxUs - MODEL.servoMinUs)) * 180
          }
          if (powered) this.servoPulses.set(`${p.id}.${n}`, t.pulses)
        }
        this.servoAngle.set(p.id, angle)
        out.servo = { angleDeg: angle, attached }
      }
    }
    this.runtime = rt
  }

  private allWarnings(): LabWarning[] {
    const seen = new Set<string>()
    const out: LabWarning[] = []
    for (const w of [...this.staticW, ...this.dynWarnings.values()]) {
      const k = `${w.kind}|${w.partId ?? ''}|${(w.partId === this.unoId || w.kind === 'floating-input') ? w.message : ''}`
      if (seen.has(k)) continue
      seen.add(k)
      out.push({ ...w })
    }
    return out
  }
}

export function createLab(circuit: Circuit, hex: string, opts?: LabOptions): LabApi {
  return new LabImpl(circuit, hex, opts)
}
