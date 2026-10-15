// Mikro Kart robotu: kart, iki motorlu bir gövdeye takılıdır. Pinsiz, kinematik sürüş modeli (diferansiyel sürüş).
// Saf TypeScript; Node'da başsız çalışır. Birimler: metre, saniye, radyan (dışarıya cm ve derece verilir).
// Gövde profilleri okullarda yaygın blok tabanlı eğitim robotlarına benzer; hiçbir ürünün adı, görseli ya da kodu kullanılmaz.
import type { Polyline, Wall } from '@ask/sim'
import { distToSeg, rayDistance } from '../arena/geometry'

export type RobotProfileId = 'blok' | 'gezgin'
export type RobotSensor = 'distance' | 'color' | 'force' | 'line'
export type FloorColor = 'beyaz' | 'siyah' | 'kirmizi' | 'yesil' | 'mavi' | 'sari'
export type LightColor = 'kapali' | 'kirmizi' | 'yesil' | 'mavi' | 'sari' | 'beyaz'

export interface RobotProfile {
  id: RobotProfileId
  title: string
  summary: string
  /** Tekerlekler arası uzaklık ve tekerlek çapı (m). */
  wheelBase: number
  wheelDiameter: number
  /** Çarpışma yarıçapı (m). */
  radius: number
  /** %100 güçte motor hızı (derece/sn). */
  maxDegPerS: number
  sensors: readonly RobotSensor[]
  /** Işıklar: tek durum ışığı ya da iki "göz" far. */
  lights: 'status' | 'eyes'
}

export const ROBOT_PROFILES: Record<RobotProfileId, RobotProfile> = {
  blok: {
    id: 'blok',
    title: 'Blok Robotu',
    summary: 'Yapı parçalarından kurulan iki motorlu robot: önde mesafe sensörü, altta renk sensörü, önde tampon (kuvvet) sensörü.',
    wheelBase: 0.112, wheelDiameter: 0.056, radius: 0.08, maxDegPerS: 800,
    sensors: ['distance', 'color', 'force'],
    lights: 'status',
  },
  gezgin: {
    id: 'gezgin',
    title: 'Mini Gezgin',
    summary: 'Küçük, hazır gövdeli robot: önde ultrasonik mesafe sensörü, altta iki çizgi sensörü, önde iki renkli far.',
    wheelBase: 0.085, wheelDiameter: 0.043, radius: 0.06, maxDegPerS: 900,
    sensors: ['distance', 'line'],
    lights: 'eyes',
  },
}

export const FLOOR_COLORS: Record<FloorColor, { label: string; css: string; reflect: number }> = {
  beyaz: { label: 'beyaz', css: '#f8fafc', reflect: 92 },
  siyah: { label: 'siyah', css: '#111827', reflect: 7 },
  kirmizi: { label: 'kırmızı', css: '#ef4444', reflect: 58 },
  yesil: { label: 'yeşil', css: '#22c55e', reflect: 34 },
  mavi: { label: 'mavi', css: '#3b82f6', reflect: 27 },
  sari: { label: 'sarı', css: '#facc15', reflect: 81 },
}

/** Zemine boyanmış dikdörtgen renk alanı (m). */
export interface Patch { x1: number; y1: number; x2: number; y2: number; color: FloorColor }
export interface RobotZone { id: string; label?: string; kind: 'start' | 'goal' | 'checkpoint'; x: number; y: number; r: number }

export interface RobotScene {
  id: string
  title: string
  width: number
  height: number
  walls: Wall[]
  /** Siyah çizgiler (çizgi izleme pisti). */
  lines: Polyline[]
  lineWidth?: number
  patches: Patch[]
  zones: RobotZone[]
  pose: { x: number; y: number; theta: number }
}

export const DEFAULT_SPEED = 50
const STEP_MS = 5
const TAU_S = 0.06
const MAX_RANGE_CM = 250
const TRAIL_EVERY_MS = 40
const DEG = 180 / Math.PI

type Command = { kind: 'move'; wheelDeg: number; startL: number; startR: number } | { kind: 'turn'; deg: number; startTheta: number }

export class DriveBase {
  readonly profile: RobotProfile
  readonly scene: RobotScene
  x: number
  y: number
  theta: number
  /** Gerçek tekerlek hızları (derece/sn). */
  private wL = 0
  private wR = 0
  /** Hedef güç (-100..100). */
  powerL = 0
  powerR = 0
  /** Toplam tekerlek dönüşü (derece, sıfırlanabilir değil; okuma ofsetle yapılır). */
  private degL = 0
  private degR = 0
  private zeroL = 0
  private zeroR = 0
  private zeroTheta: number
  /** Sürüş ve dönüş blokları bu hızı kullanır (%). */
  speed = DEFAULT_SPEED
  lights: LightColor = 'kapali'
  distanceM = 0
  /** Toplam yön değişimi (derece, mutlak değer toplamı). */
  turnedDeg = 0
  collisions = 0
  touching = false
  /** Robot merkezinin bir kez girdiği bölgeler. */
  visited = new Set<string>()
  trail: Array<[number, number]> = []
  private cmd: Command | null = null
  private t = 0
  private trailT = 0

  constructor(profile: RobotProfileId | RobotProfile, scene: RobotScene) {
    this.profile = typeof profile === 'string' ? ROBOT_PROFILES[profile] : profile
    this.scene = scene
    this.x = scene.pose.x
    this.y = scene.pose.y
    this.theta = scene.pose.theta
    this.zeroTheta = this.theta
    this.trail.push([this.x, this.y])
  }

  has(s: RobotSensor): boolean { return this.profile.sensors.includes(s) }

  // ---------- komutlar ----------
  setMotors(left: number, right: number) {
    this.cmd = null
    this.powerL = clampPct(left)
    this.powerR = clampPct(right)
  }
  stop() { this.cmd = null; this.powerL = 0; this.powerR = 0; this.wL = 0; this.wR = 0 }
  /** İleri (+) / geri (-) `cm` kadar sür; bitince fren yapar. */
  move(cm: number) {
    const wheelDeg = (Math.abs(cm) / 100 / (Math.PI * this.profile.wheelDiameter)) * 360
    const p = cm >= 0 ? this.speed : -this.speed
    this.cmd = { kind: 'move', wheelDeg, startL: this.degL, startR: this.degR }
    this.powerL = p; this.powerR = p
    if (wheelDeg === 0) this.stop()
  }
  /** Sola (+) / sağa (-) `deg` derece yerinde dön; bitince fren yapar. */
  turn(deg: number) {
    const p = deg >= 0 ? this.speed : -this.speed
    this.cmd = { kind: 'turn', deg: Math.abs(deg), startTheta: this.theta }
    this.powerL = -p; this.powerR = p
    if (deg === 0) this.stop()
  }
  get busy(): boolean { return this.cmd !== null }
  resetAngles() { this.zeroL = this.degL; this.zeroR = this.degR; this.zeroTheta = this.theta }

  // ---------- sensörler ----------
  /** Ham tekerlek açıları (derece; çizim için, sıfırlanmaz). */
  get wheelDegL(): number { return this.degL }
  get wheelDegR(): number { return this.degR }
  get motorDegL(): number { return Math.round(this.degL - this.zeroL) }
  get motorDegR(): number { return Math.round(this.degR - this.zeroR) }
  /** Başlangıçtan (ya da sıfırlamadan) bu yana yön değişimi; sola +. */
  get headingDeg(): number { return Math.round((this.theta - this.zeroTheta) * DEG) }
  /** Ön sensörden duvara uzaklık (cm, en çok 250). */
  get distanceCm(): number {
    const ox = this.x + Math.cos(this.theta) * this.profile.radius * 0.8
    const oy = this.y + Math.sin(this.theta) * this.profile.radius * 0.8
    const d = rayDistance(ox, oy, this.theta, this.scene.walls) * 100
    return Math.min(MAX_RANGE_CM, Math.round(d * 10) / 10)
  }
  /** Gövdeye göre (ileri x, sola y) bir noktanın altındaki zemin rengi. */
  floorAt(fx: number, fy: number): FloorColor {
    const px = this.x + Math.cos(this.theta) * fx - Math.sin(this.theta) * fy
    const py = this.y + Math.sin(this.theta) * fx + Math.cos(this.theta) * fy
    const half = (this.scene.lineWidth ?? 0.02) / 2
    if (this.scene.lines.some((pl) => pl.slice(1).some((pt, i) => distToSeg(px, py, ...pl[i], ...pt) < half))) return 'siyah'
    for (let i = this.scene.patches.length - 1; i >= 0; i--) {
      const p = this.scene.patches[i]
      if (px >= Math.min(p.x1, p.x2) && px <= Math.max(p.x1, p.x2) && py >= Math.min(p.y1, p.y2) && py <= Math.max(p.y1, p.y2)) return p.color
    }
    return 'beyaz'
  }
  /** Renk sensörü gövdenin ön altında. */
  get color(): FloorColor { return this.floorAt(this.profile.radius * 0.5, 0) }
  get reflect(): number { return FLOOR_COLORS[this.color].reflect }
  /** Çizgi sensörleri: önde, ortanın 1,5 cm solu ve sağı. */
  lineOn(side: 'left' | 'right'): boolean { return this.floorAt(this.profile.radius * 0.6, side === 'left' ? 0.015 : -0.015) === 'siyah' }
  /** Tampon: önünde 1 cm içinde duvar var mı. */
  get pressed(): boolean {
    const fx = this.x + Math.cos(this.theta) * this.profile.radius
    const fy = this.y + Math.sin(this.theta) * this.profile.radius
    return this.scene.walls.some((w) => distToSeg(fx, fy, ...w) < 0.012)
  }
  inZone(id: string): boolean {
    const z = this.scene.zones.find((q) => q.id === id)
    return !!z && Math.hypot(this.x - z.x, this.y - z.y) <= z.r
  }
  get moving(): boolean { return Math.abs(this.wL) > 1 || Math.abs(this.wR) > 1 }
  /** Motorlar kapalı ve tekerlekler durmuş. */
  get stopped(): boolean { return !this.busy && this.powerL === 0 && this.powerR === 0 && !this.moving }

  // ---------- fizik ----------
  /** Saati `nowMs`'ye (mutlak) ilerletir. */
  advanceTo(nowMs: number) {
    while (this.t + STEP_MS <= nowMs) { this.step(STEP_MS / 1000); this.t += STEP_MS }
  }

  private step(dt: number) {
    const k = 1 - Math.exp(-dt / TAU_S)
    this.wL += ((this.powerL / 100) * this.profile.maxDegPerS - this.wL) * k
    this.wR += ((this.powerR / 100) * this.profile.maxDegPerS - this.wR) * k
    const dL = this.wL * dt, dR = this.wR * dt
    this.degL += dL
    this.degR += dR
    const circ = Math.PI * this.profile.wheelDiameter
    const sL = (dL / 360) * circ, sR = (dR / 360) * circ
    const ds = (sL + sR) / 2
    const dth = (sR - sL) / this.profile.wheelBase
    const nt = this.theta + dth
    const nx = this.x + ds * Math.cos(nt), ny = this.y + ds * Math.sin(nt)
    const blocked = this.scene.walls.some((w) => distToSeg(nx, ny, ...w) < this.profile.radius)
    this.theta = nt
    this.turnedDeg += Math.abs(dth) * DEG
    if (!blocked) { this.x = nx; this.y = ny; this.distanceM += Math.abs(ds) }
    if (blocked && !this.touching) this.collisions++
    this.touching = blocked
    for (const z of this.scene.zones) if (!this.visited.has(z.id) && Math.hypot(this.x - z.x, this.y - z.y) <= z.r) this.visited.add(z.id)
    this.trailT += dt * 1000
    if (this.trailT >= TRAIL_EVERY_MS) { this.trailT = 0; this.trail.push([this.x, this.y]); if (this.trail.length > 4000) this.trail.shift() }
    this.checkCommand()
  }

  private checkCommand() {
    const c = this.cmd
    if (!c) return
    const done = c.kind === 'move'
      ? (Math.abs(this.degL - c.startL) + Math.abs(this.degR - c.startR)) / 2 >= c.wheelDeg
      : Math.abs(this.theta - c.startTheta) * DEG >= c.deg
    if (done) this.stop()
  }
}

const clampPct = (v: number) => Math.max(-100, Math.min(100, Number.isFinite(v) ? v : 0))
