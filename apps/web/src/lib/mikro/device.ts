// Sanal Mikro Kart: 5x5 LED, düğmeler, dokunmatik logo, 3 pin, ivmeölçer, pusula, sensörler, hoparlör, radyo, konsol.
// Tamamen yazılımdır; gerçek donanım yoktur. Zamanı dışarıdan (Runtime) alır, bu yüzden başsız testlerde deterministiktir.
import { glyphFrame, scrollDuration, scrollFrame } from './font'
import type { ButtonEvent, ButtonName, DeviceEvent, FrameEntry, GestureName, InputKey, PinName, RadioMessage } from './types'
import { PINS } from './types'
import type { DriveBase } from './robot'
import type { DonusenBot } from './donusen'

export const LONG_PRESS_MS = 1000
export const SHAKE_MS = 500
const LOG_CAP = 4000
const FRAME_CAP = 800

export interface PinState {
  touch: boolean
  /** Dışarıdan uygulanan değer (0-1023). */
  input: number
  /** Programın yazdığı son çıkış. */
  out: { mode: 'digital' | 'analog' | 'servo'; value: number } | null
}

export type SoundHook = (e: { kind: 'tone'; freq: number; ms: number; volume: number } | { kind: 'stop' }) => void

export class Device {
  readonly id: number
  now = 0

  // ---- Ekran ----
  private base = new Uint8Array(25)
  private mode: 'leds' | 'scroll' | 'glyph' = 'leds'
  private scroll: { text: string; start: number; token: number } | null = null
  private glyph: Uint8Array | null = null
  private scrollToken = 0
  /** Genel parlaklık çarpanı (0-255); LED değerleri bununla çarpılarak gösterilir. */
  brightness = 255
  frames: FrameEntry[] = []

  // ---- Girdiler ----
  btn = { A: false, B: false }
  private downAt: Record<ButtonName, number> = { A: 0, B: 0, AB: 0 }
  private longFired: Record<ButtonName, boolean> = { A: false, B: false, AB: false }
  private abActive = false
  logo = false
  pins: Record<PinName, PinState> = { P0: pinInit(), P1: pinInit(), P2: pinInit() }
  accel = { x: 0, y: 0, z: 1024 }
  private shakeUntil = -1
  private posture: GestureName | null = 'faceUp'
  compass = 0
  temperature = 21
  light = 128
  soundLevel = 20

  // ---- Ses ----
  volume = 128
  tempo = 120
  private toneUntil = 0
  private toneFreq = 0
  soundHook: SoundHook | null = null

  // ---- Radyo ----
  radioGroup = 1
  /** true: grup numarasını arayüz belirler, programdaki "radyo grubu" blokları yoksayılır. */
  radioLocked = false
  lastRadio: RadioMessage | null = null
  onRadioSend: ((from: Device, msg: RadioMessage) => void) | null = null

  /** Kart bir robot gövdesine takılıysa (Robot Atölyesi); zamanı kartla birlikte ilerler. */
  robot: DriveBase | null = null
  /** Kart Dönüşen Robot'a (tek beyin, beş model) takılıysa; zamanı kartla birlikte ilerler. */
  donusen: DonusenBot | null = null

  // ---- Günlük ----
  log: DeviceEvent[] = []
  serial: string[] = []
  /** Runtime bağlar: olay anahtarı + isteğe bağlı yük. */
  onInput: ((key: InputKey, payload?: RadioMessage) => void) | null = null

  constructor(id = 0) { this.id = id }

  /** Fiziksel girdi durumunu (sensörler, ivme, pin girişleri) başka karttan alır; yeniden başlatmada ayarlar korunur. */
  copyInputsFrom(o: Device) {
    this.accel = { ...o.accel }
    this.posture = detectPosture(this.accel)
    this.compass = o.compass; this.temperature = o.temperature; this.light = o.light; this.soundLevel = o.soundLevel
    for (const p of PINS) { this.pins[p].input = o.pins[p].input; this.pins[p].touch = o.pins[p].touch }
    this.radioLocked = o.radioLocked
    if (o.radioLocked) this.radioGroup = o.radioGroup
  }

  // ===================== günlük =====================
  record(e: DeviceEvent) {
    this.log.push(e)
    if (this.log.length > LOG_CAP) this.log.splice(0, this.log.length - LOG_CAP)
  }
  private emit(key: InputKey, payload?: RadioMessage) {
    this.record({ t: this.now, kind: 'input', key })
    this.onInput?.(key, payload)
  }

  // ===================== ekran =====================
  /** Görünen kare (genel parlaklık uygulanmış, 25 eleman, 0-255). */
  frame(): Uint8Array {
    let src: Uint8Array
    if (this.mode === 'scroll' && this.scroll) src = scrollFrame(this.scroll.text, this.now - this.scroll.start)
    else if (this.mode === 'glyph' && this.glyph) src = this.glyph
    else src = this.base
    if (this.brightness >= 255) return src
    const out = new Uint8Array(25)
    for (let i = 0; i < 25; i++) out[i] = Math.round((src[i] * this.brightness) / 255)
    return out
  }
  /** Ham LED belleği (yazılan değerler; kaydırma/glif sırasında da bellek durur). */
  led(x: number, y: number): number { return inBounds(x, y) ? this.base[y * 5 + x] : 0 }
  private touchDisplay() {
    this.mode = 'leds'
    this.scroll = null
    this.glyph = null
  }
  private snap() {
    let s = ''
    const f = this.frame()
    for (let i = 0; i < 25; i++) s += f[i] > 0 ? '1' : '0'
    const last = this.frames[this.frames.length - 1]
    if (last && last.s === s) return
    this.frames.push({ t: this.now, s })
    if (this.frames.length > FRAME_CAP) this.frames.splice(0, this.frames.length - FRAME_CAP)
  }
  /** Şu an görünen kare 25 karakterlik '0'/'1' dizisi. */
  pattern(): string {
    const f = this.frame()
    let s = ''
    for (let i = 0; i < 25; i++) s += f[i] > 0 ? '1' : '0'
    return s
  }
  clear() { this.touchDisplay(); this.base.fill(0); this.snap() }
  /** `cells`: 25 karakter; '0' sönük, '1' yanık, '2'-'9' kısmi parlaklık. */
  setLeds(cells: string) {
    this.touchDisplay()
    for (let i = 0; i < 25; i++) {
      const c = cells[i] ?? '0'
      this.base[i] = c === '0' ? 0 : c === '1' ? 255 : /[2-9]/.test(c) ? Math.round(((Number(c) - 1) / 8) * 255) : 0
    }
    this.snap()
  }
  plot(x: number, y: number, b = 255) {
    x = Math.round(x); y = Math.round(y)
    if (!inBounds(x, y)) return
    this.touchDisplay()
    this.base[y * 5 + x] = clamp(Math.round(b), 0, 255)
    this.snap()
  }
  toggle(x: number, y: number) {
    x = Math.round(x); y = Math.round(y)
    if (!inBounds(x, y)) return
    this.plot(x, y, this.base[y * 5 + x] > 0 ? 0 : 255)
  }
  /** Kaydırmalı yazıyı başlatır; süresini (ms) döndürür. */
  startScroll(text: string): number {
    this.touchDisplay()
    this.mode = 'scroll'
    this.scroll = { text, start: this.now, token: ++this.scrollToken }
    this.base.fill(0)
    this.snap()
    return scrollDuration(text)
  }
  /** Tek glifi (rakam/harf) ortalı gösterir. */
  startGlyph(ch: string) {
    this.touchDisplay()
    this.mode = 'glyph'
    this.glyph = glyphFrame(ch)
    this.base.fill(0)
    this.scrollToken++
    this.snap()
  }
  /** Kaydırma/glif bitince çalışma zamanı çağırır; hâlâ bizimse ekranı temizler. */
  finishText(token?: number) {
    if (this.mode === 'scroll' && this.scroll && (token === undefined || this.scroll.token === token)) { this.touchDisplay(); this.snap() }
    else if (this.mode === 'glyph') { this.touchDisplay(); this.snap() }
  }
  get scrollTokenNow(): number { return this.scrollToken }
  get isScrolling(): boolean { return this.mode === 'scroll' }

  // ===================== düğmeler / logo / pin =====================
  isPressed(b: ButtonName): boolean {
    return b === 'AB' ? this.btn.A && this.btn.B : this.btn[b]
  }
  press(b: ButtonName) {
    if (b === 'AB') {
      if (this.abActive) return
      this.btn.A = true; this.btn.B = true
      this.abActive = true
      this.markDown('A'); this.markDown('B'); this.markDown('AB')
      this.emit('button:AB:press')
      return
    }
    if (this.btn[b]) return
    this.btn[b] = true
    this.markDown(b)
    if (this.btn.A && this.btn.B) {
      this.abActive = true
      this.markDown('AB')
      this.emit('button:AB:press')
    } else this.emit(`button:${b}:press`)
  }
  release(b: ButtonName) {
    if (b === 'AB') {
      if (!this.abActive) return
      this.btn.A = false; this.btn.B = false
      this.abActive = false
      this.emit('button:AB:release')
      return
    }
    if (!this.btn[b]) return
    this.btn[b] = false
    if (this.abActive) { this.abActive = false; this.emit('button:AB:release') }
    else this.emit(`button:${b}:release`)
  }
  private markDown(b: ButtonName) { this.downAt[b] = this.now; this.longFired[b] = false }
  /** Zaman ilerledikçe uzun basış olaylarını üretir. */
  tick(now: number) {
    this.now = now
    this.robot?.advanceTo(now)
    this.donusen?.advanceTo(now)
    for (const b of ['A', 'B', 'AB'] as const) {
      const held = b === 'AB' ? this.abActive : this.btn[b] && !this.abActive
      if (held && !this.longFired[b] && now - this.downAt[b] >= LONG_PRESS_MS) { this.longFired[b] = true; this.emit(`button:${b}:long`) }
    }
  }
  setLogo(down: boolean) {
    if (this.logo === down) return
    this.logo = down
    this.emit(down ? 'logo:touch' : 'logo:release')
  }
  setPinTouch(p: PinName, down: boolean) {
    const s = this.pins[p]
    if (s.touch === down) return
    s.touch = down
    this.emit(`pin:${p}:${down ? 'touch' : 'release'}`)
  }
  setPinInput(p: PinName, v: number) { this.pins[p].input = clamp(Math.round(v), 0, 1023) }
  pinDigitalRead(p: PinName): number { const s = this.pins[p]; return s.touch ? 1 : s.input >= 512 ? 1 : 0 }
  pinAnalogRead(p: PinName): number { const s = this.pins[p]; return s.touch ? 1023 : s.input }
  pinWrite(p: PinName, mode: 'digital' | 'analog' | 'servo', value: number) {
    const v = mode === 'digital' ? (value ? 1 : 0) : mode === 'analog' ? clamp(Math.round(value), 0, 1023) : clamp(Math.round(value), 0, 180)
    this.pins[p].out = { mode, value: v }
    this.record({ t: this.now, kind: 'pin', pin: p, mode, value: v })
  }

  // ===================== hareket =====================
  /** Ivme (milli-g). Duruşa göre `gesture:<ad>` olayı üretir. */
  setAccel(x: number, y: number, z: number) {
    this.accel = { x: clamp(Math.round(x), -2048, 2048), y: clamp(Math.round(y), -2048, 2048), z: clamp(Math.round(z), -2048, 2048) }
    const p = detectPosture(this.accel)
    if (p !== this.posture) {
      this.posture = p
      if (p) this.emit(`gesture:${p}`)
    }
  }
  /** Hazır hareketler: duruş ayarlar ya da sallar. */
  perform(g: GestureName) {
    switch (g) {
      case 'shake': this.shakeUntil = this.now + SHAKE_MS; this.emit('gesture:shake'); break
      case 'tiltLeft': this.setAccel(-1024, 0, 0); break
      case 'tiltRight': this.setAccel(1024, 0, 0); break
      case 'tiltForward': this.setAccel(0, 1024, 0); break
      case 'tiltBack': this.setAccel(0, -1024, 0); break
      case 'faceUp': this.setAccel(0, 0, 1024); break
      case 'faceDown': this.setAccel(0, 0, -1024); break
      case 'freeFall': this.setAccel(0, 0, 0); break
    }
  }
  get shaking(): boolean { return this.now < this.shakeUntil }
  /** Okunan ivme (sallanırken sahte ama deterministik titreşim). */
  accelNow(): { x: number; y: number; z: number } {
    if (!this.shaking) return this.accel
    const t = this.now
    const j = (k: number) => Math.round(Math.sin(t * 0.083 * k + k) * 1900)
    return { x: this.accel.x + j(1.7), y: this.accel.y + j(2.3), z: this.accel.z + j(3.1) }
  }
  strength(): number { const a = this.accelNow(); return Math.round(Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z)) }
  /** "boy" eğimi: öne (+) / arkaya (-), derece. */
  pitch(): number { const a = this.accelNow(); return Math.round((Math.atan2(a.y, a.z) * 180) / Math.PI) }
  /** "yan" eğim: sağa (+) / sola (-), derece. */
  roll(): number { const a = this.accelNow(); return Math.round((Math.atan2(a.x, a.z) * 180) / Math.PI) }
  gestureNow(): GestureName | null { return this.shaking ? 'shake' : detectPosture(this.accel) }
  isGesture(g: GestureName): boolean { return g === 'shake' ? this.shaking : detectPosture(this.accel) === g }

  setCompass(deg: number) { this.compass = ((Math.round(deg) % 360) + 360) % 360 }
  setSensor(name: 'temperature' | 'light' | 'sound', v: number) {
    if (name === 'temperature') this.temperature = clamp(Math.round(v), -5, 50)
    else if (name === 'light') this.light = clamp(Math.round(v), 0, 255)
    else this.soundLevel = clamp(Math.round(v), 0, 255)
  }

  // ===================== ses =====================
  beatMs(beats: number): number { return Math.max(1, Math.round((60000 / Math.max(20, this.tempo)) * beats)) }
  /** Notayı çalar; sesin süresini (ms) döndürür. Beklemeyi çağıran yapar. */
  playTone(freq: number, ms: number) {
    freq = clamp(Math.round(freq), 20, 12000)
    this.toneFreq = freq
    this.toneUntil = this.now + ms
    this.record({ t: this.now, kind: 'tone', freq, ms })
    this.soundHook?.({ kind: 'tone', freq, ms, volume: this.volume })
  }
  stopSound() { this.toneUntil = 0; this.soundHook?.({ kind: 'stop' }) }
  /** Şu an çalan notanın frekansı (yoksa 0). Süresiz ses için Infinity ms verilebilir. */
  toneNow(): number { return this.now < this.toneUntil ? this.toneFreq : 0 }

  // ===================== radyo / konsol =====================
  setRadioGroup(n: number) { if (!this.radioLocked) this.radioGroup = clamp(Math.round(n), 0, 255) }
  radioSend(msg: Omit<RadioMessage, 'signal' | 'from'>) {
    const full: RadioMessage = { ...msg, signal: 200, from: this.id }
    this.record({ t: this.now, kind: 'radioSend', msg: full, group: this.radioGroup })
    this.onRadioSend?.(this, full)
  }
  radioReceive(msg: RadioMessage) {
    this.lastRadio = msg
    this.record({ t: this.now, kind: 'radioRecv', msg })
    this.emit('radio', msg)
  }
  writeSerial(text: string) {
    this.serial.push(text)
    if (this.serial.length > 300) this.serial.splice(0, this.serial.length - 300)
    this.record({ t: this.now, kind: 'serial', text })
  }
}

const pinInit = (): PinState => ({ touch: false, input: 0, out: null })
export const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v)
const inBounds = (x: number, y: number) => Number.isInteger(x) && Number.isInteger(y) && x >= 0 && x < 5 && y >= 0 && y < 5

export function detectPosture(a: { x: number; y: number; z: number }): GestureName | null {
  const mag = Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z)
  if (mag < 300) return 'freeFall'
  const ax = Math.abs(a.x), ay = Math.abs(a.y), az = Math.abs(a.z)
  const m = Math.max(ax, ay, az)
  if (m < 700) return null
  if (m === az) return a.z > 0 ? 'faceUp' : 'faceDown'
  if (m === ax) return a.x < 0 ? 'tiltLeft' : 'tiltRight'
  return a.y > 0 ? 'tiltForward' : 'tiltBack'
}

export { PINS }
export type { ButtonEvent }
