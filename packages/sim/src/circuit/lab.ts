// Sanal devre laboratuvarı: Sim (avr8js) + netlist + DC çözücü. Tarayıcı ve Node uyumlu.
import { Sim, type Pin, type PinStateName } from '../sim.js'
import { staticWarnings } from './analysis.js'
import type {
  Circuit, LabApi, LabState, LabWarning, LedState, PartInstance, PartRuntime, PinRef, PinSnapshot, PropValue, WarningKind,
} from './contract.js'
import { PINS } from './contract.js'
import { MODEL, ldrOhms, ledSpecs, ntcOhms, num, type LedSpec } from './model.js'
import { buildNetlist, type Netlist } from './netlist.js'
import { solve, type SolverInput, type SolverResult } from './solver.js'

const UNO_PINS: readonly string[] = PINS.uno.filter((n) => /^(D\d+|A\d)$/.test(n))
const simPin = (name: string): Pin => (name[0] === 'D' ? Number(name.slice(1)) : name)
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
interface Compiled { input: SolverInput; src: SrcMeta[]; leds: LedSpec[] }
interface Sol { res: SolverResult; comp: Compiled }

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
  private readonly drivers = new Map<string, string[]>() // anahtar (LED / buzzer) -> sürücü Uno pinleri

  private modes: Record<string, PinStateName> = {}
  private version = 0
  private key = ''
  private base!: Sol
  private forced = new Map<string, { hi: Sol; lo: Sol }>()
  private burnt = new Set<string>()
  private dynWarnings = new Map<string, LabWarning>()
  private staticW: LabWarning[] = []
  private runtime: Record<string, PartRuntime> = {}
  private servoAngle = new Map<string, number>()
  private servoPulses = new Map<string, number>()
  private overSince = new Map<string, number>() // buzzer: son kez eşik üstü görülen zaman
  private disposed = false

  constructor(circuit: Circuit, hex: string) {
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
    for (const s of this.specs) this.drivers.set(s.key, this.drivingPins(s.a, s.k))
    for (const p of this.circuit.parts) {
      if (p.type === 'buzzer') this.drivers.set(p.id, this.drivingPins({ part: p.id, pin: '+' }, { part: p.id, pin: '-' }))
      if (p.type === 'servo') this.drivers.set(p.id, this.nl.unoPinsOnNet(this.nl.netOf({ part: p.id, pin: 'SIG' }) ?? -1))
    }
  }

  private refreshStatic(): void {
    this.nl = buildNetlist(this.circuit)
    this.staticW = staticWarnings(this.circuit, this.nl).filter((w) => w.kind !== 'floating-input')
  }

  private boot(): void {
    this.sim = new Sim(this.hex)
    this.trackers.clear()
    for (const n of this.wiredPins) this.trackers.set(n, new PinTracker(this.sim, simPin(n)))
    this.modes = {}
    this.key = ''
    this.forced.clear()
    this.servoAngle.clear(); this.servoPulses.clear(); this.overSince.clear()
    this.update(true)
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
      if (wired && this.unoId !== undefined) {
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
    for (const [id, r] of Object.entries(this.runtime)) {
      parts[id] = {
        ...(r.led && { led: { ...r.led } }),
        ...(r.buzzer && { buzzer: { ...r.buzzer } }),
        ...(r.servo && { servo: { ...r.servo } }),
        ...(r.rgbled && { rgbled: { ...r.rgbled } }),
      }
    }
    return {
      timeMs: this.sim.nowMs(),
      running: !this.disposed,
      pins,
      parts,
      serial: this.sim.serial,
      warnings: this.allWarnings(),
    }
  }

  setProp(partId: string, key: string, value: PropValue): void {
    const part = this.circuit.parts.find((p) => p.id === partId)
    if (!part) return
    part.props[key] = value
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

  reset(): void {
    this.burnt.clear()
    this.dynWarnings.clear()
    this.runtime = {}
    this.boot()
  }

  dispose(): void { this.disposed = true }

  // ---- çözüm ----
  private makeKey(): string {
    const m = this.wiredPins.map((n) => {
      const s = this.modes[n]
      return s === 'High' ? 'H' : s === 'Low' ? 'L' : s === 'InputPullUp' ? 'P' : 'I'
    }).join('')
    return `${m}|${this.version}|${[...this.burnt].sort().join(',')}`
  }

  private compile(override?: { pin: string; high: boolean }): Compiled {
    const nl = this.nl
    const input: SolverInput = { nodes: this.nodeCount, resistors: [], sources: [], leds: [] }
    const src: SrcMeta[] = []
    const R = (a: PinRef, b: PinRef, ohms: number): void => { input.resistors.push({ a: this.node(a), b: this.node(b), ohms }) }
    const ref = (p: PartInstance, pin: string): PinRef => ({ part: p.id, pin })
    for (const p of this.circuit.parts) {
      switch (p.type) {
        case 'resistor': R(ref(p, '1'), ref(p, '2'), Math.max(num(p, 'ohms', 330), 0.01)); break
        case 'ldr': R(ref(p, '1'), ref(p, '2'), ldrOhms(num(p, 'light', 0.5))); break
        case 'ntc': R(ref(p, '1'), ref(p, '2'), ntcOhms(num(p, 'tempC', 25))); break
        case 'button': if (p.props.pressed === true) R(ref(p, 'A'), ref(p, 'B'), MODEL.buttonOnOhms); break
        case 'buzzer': R(ref(p, '+'), ref(p, '-'), MODEL.buzzerOhms); break
        case 'pot': {
          const total = Math.max(num(p, 'ohms', 10_000), 1), pos = clamp01(num(p, 'position', 0.5))
          R(ref(p, 'VCC'), ref(p, 'SIG'), Math.max((1 - pos) * total, 0.01))
          R(ref(p, 'SIG'), ref(p, 'GND'), Math.max(pos * total, 0.01))
          break
        }
        default: break
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
      input.leds.push({ a: this.node(s.a), k: this.node(s.k), vf: s.vf, rs: MODEL.ledSeriesOhms, disabled: this.burnt.has(s.key) })
    }
    return { input, src, leds: this.specs }
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
      const a = res.ledAmps[i]
      if (a > MODEL.ledNoResistorA) this.warn('led-no-resistor', s.partId, 'LED\'in seri direnci yok ya da çok küçük: akım güvenli sınırı aştı.')
      if (a > MODEL.ledBurnA && !this.burnt.has(s.key)) {
        this.burnt.add(s.key)
        this.warn('led-burnt', s.partId, `LED yandı (${(a * 1000).toFixed(0)} mA). Sıfırlayınca düzelir; seri direnç ekle.`)
      }
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
      if ((st === 'Input' || st === 'InputPullUp') && !floating) this.sim.drive(simPin(n), v > MODEL.digitalThreshold)
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

  // ---- her ms ----
  private update(force: boolean): void {
    const now = this.sim.nowMs()
    for (const t of this.trackers.values()) t.trim(now)
    this.ensureSolved(force)
    for (let g = 0; g < 3; g++) {
      const burntBefore = this.burnt.size
      this.computeRuntime(now)
      if (this.burnt.size === burntBefore) break
      this.ensureSolved(true)
    }
  }

  private ledAmps(i: number, now: number): number {
    const s = this.specs[i]
    if (this.burnt.has(s.key)) return 0
    for (const p of this.drivers.get(s.key) ?? []) {
      if (!this.isOut(p)) continue
      const d = this.trackers.get(p)!.duty(now, MODEL.dutyWindowMs)
      if (d > 0.02 && d < 0.98) {
        const f = this.getForced(p)
        return d * f.hi.res.ledAmps[i] + (1 - d) * f.lo.res.ledAmps[i]
      }
    }
    return this.base.res.ledAmps[i]
  }

  private ledState(i: number, now: number): LedState {
    const s = this.specs[i]
    if (this.burnt.has(s.key)) return { on: false, brightness: 0, currentMa: 0, burnt: true }
    const amps = this.ledAmps(i, now)
    const brightness = clamp01(amps / MODEL.ledRefA)
    return { on: brightness > 0.01, brightness, currentMa: amps * 1000, burnt: false }
  }

  private computeRuntime(now: number): void {
    const volts = (ref: PinRef): number => this.base.res.volts[this.node(ref)]
    const rt: Record<string, PartRuntime> = {}
    for (const p of this.circuit.parts) {
      if (p.type === 'led') {
        rt[p.id] = { led: this.ledState(this.specIndex.get(p.id)!, now) }
      } else if (p.type === 'rgbled') {
        const b = (c: string): number => this.ledState(this.specIndex.get(`${p.id}.${c}`)!, now).brightness
        rt[p.id] = { rgbled: { r: b('R'), g: b('G'), b: b('B') } }
      } else if (p.type === 'buzzer') {
        const v = volts({ part: p.id, pin: '+' }) - volts({ part: p.id, pin: '-' })
        if (Math.abs(v) > MODEL.buzzerOnVolts) this.overSince.set(p.id, now)
        const powered = now - (this.overSince.get(p.id) ?? -1e9) < 5
        const pins = this.drivers.get(p.id) ?? []
        if (p.props.kind === 'active') {
          const pwm = pins.some((n) => this.isOut(n) && this.trackers.get(n)!.duty(now, MODEL.dutyWindowMs) > 0.1)
          const on = (v > MODEL.buzzerOnVolts) || (powered && pwm)
          rt[p.id] = { buzzer: { on, freqHz: on ? MODEL.activeBuzzerHz : 0 } }
        } else {
          let hz = 0
          for (const n of pins) hz = Math.max(hz, this.trackers.get(n)!.freq(now, MODEL.waveWindowMs))
          const on = hz > 0 && powered
          rt[p.id] = { buzzer: { on, freqHz: on ? hz : 0 } }
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
        rt[p.id] = { servo: { angleDeg: angle, attached } }
      }
    }
    this.runtime = rt
  }

  private allWarnings(): LabWarning[] {
    const seen = new Set<string>()
    const out: LabWarning[] = []
    for (const w of [...this.staticW, ...this.dynWarnings.values()]) {
      const k = `${w.kind}|${w.partId ?? ''}|${w.partId === this.unoId ? w.message : ''}`
      if (seen.has(k)) continue
      seen.add(k)
      out.push({ ...w })
    }
    return out
  }
}

export function createLab(circuit: Circuit, hex: string): LabApi {
  return new LabImpl(circuit, hex)
}
