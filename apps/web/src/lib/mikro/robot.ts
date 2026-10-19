// Mikro Kart robotu: kart, iki motorlu bir gövdeye takılıdır. Pinsiz, kinematik sürüş modeli (diferansiyel sürüş).
// Saf TypeScript; Node'da başsız çalışır. Birimler: metre, saniye, radyan (dışarıya cm ve derece verilir).
// Gövde profilleri okullarda yaygın blok tabanlı eğitim robotlarına benzer; hiçbir ürünün adı, görseli ya da kodu kullanılmaz.
import type { Polyline, Wall } from '@ask/sim'
import { distToSeg, rayDistance } from '../arena/geometry'

export type RobotProfileId = 'blok' | 'gezgin' | 'kiskac'
/** `gripper`: kıskaç (tutma/bırakma ve tutulan nesnenin rengini algılama); araç kutusu süzgeci için sensörlerle birlikte durur. */
export type RobotSensor = 'distance' | 'color' | 'force' | 'line' | 'gripper' | 'light' | 'gyro'
export type FloorColor = 'beyaz' | 'siyah' | 'kirmizi' | 'yesil' | 'mavi' | 'sari'
export type LightColor = 'kapali' | 'kirmizi' | 'yesil' | 'mavi' | 'sari' | 'beyaz'

/** Sensörün gövdedeki yeri (dönüş merkezine göre: ileri x, sola y, m) ve bakış yönü (radyan, sola +). */
export interface SensorMount { x: number; y: number; rot?: number }

export interface RobotProfile {
  /** 'ozel': Robotunu Tasarla'da kurulan gövde. */
  id: RobotProfileId | 'ozel'
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
  // ---- Robotunu Tasarla: tasarımdan türetilen ek fizik (yoksa hazır gövdelerin varsayılanları) ----
  /** Motor tepki süresi (s): ağır robot ve zayıf motor daha geç hızlanır. */
  tauS?: number
  /** Dönüşte gerçekleşen oran (1 = kaymasız teker; palet ve dört teker kayar, < 1). Jiroskop yoksa dönüşler eksik kalır. */
  turnSlip?: number
  /** Tek sürüş motoru: iki teker ortak akstadır, robot dönemez (sol ve sağ gücün ortalaması uygulanır). */
  coupled?: boolean
  /** Mesafe sensörü menzili (cm). */
  rangeCm?: number
  /** Sensör yerleri; verilmeyen sensör hazır gövdelerdeki yerinde durur. */
  mounts?: Partial<Record<'distance' | 'color' | 'line' | 'force' | 'gripper', SensorMount>>
  /** 3B görünüm için tasarım (yalnız görüntü; fizik yukarıdaki alanlardan okunur). */
  design?: import('./tasarim').RobotDesign
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
  kiskac: {
    id: 'kiskac',
    title: 'Kıskaçlı Robot',
    summary: 'Önünde iki parmaklı kıskaç olan iki motorlu robot: önde mesafe sensörü, altta renk sensörü; kıskaç küpü tutar, taşır ve rengini algılar.',
    wheelBase: 0.12, wheelDiameter: 0.056, radius: 0.08, maxDegPerS: 700,
    sensors: ['distance', 'color', 'gripper'],
    lights: 'status',
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
/** Arenadaki taşınabilir küp (m). Robot gövdesi iterek kaydırır, kıskaç tutup taşır; mesafe sensörü görür. */
export interface SceneObject { id: string; x: number; y: number; color: FloorColor; /** Kenar uzunluğu (m), varsayılan 0,04. */ size?: number }
/** Benzetimdeki küp durumu. */
export interface LiveObject { id: string; x: number; y: number; color: FloorColor; half: number }
export interface RobotZone { id: string; label?: string; kind: 'start' | 'goal' | 'checkpoint' | 'penalty'; x: number; y: number; r: number }

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
  /** Taşınabilir küpler (yoksa boş). */
  objects?: SceneObject[]
  pose: { x: number; y: number; theta: number }
}

export const DEFAULT_SPEED = 50
const STEP_MS = 5
const TAU_S = 0.06
const MAX_RANGE_CM = 250
const TRAIL_EVERY_MS = 40
const DEG = 180 / Math.PI
/** Kıskacın kapanınca küpü yakalayabildiği uzaklık (küp merkezi ile kıskaç ağzı arası, m). */
const GRAB_TOL = 0.035
const objWalls = (o: LiveObject): Wall[] => [
  [o.x - o.half, o.y - o.half, o.x + o.half, o.y - o.half], [o.x + o.half, o.y - o.half, o.x + o.half, o.y + o.half],
  [o.x + o.half, o.y + o.half, o.x - o.half, o.y + o.half], [o.x - o.half, o.y + o.half, o.x - o.half, o.y - o.half],
]

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
  /** Bölgeye ilk giriş anı (ms): sıra denetimi için. */
  visitedAt = new Map<string, number>()
  /** Işıklar yanarken görülen "zemin rengi:ışık" eşleri, ilk görülme sırasıyla (ışık kapalıyken kaydedilmez). */
  colorLights: string[] = []
  /** Küplerin canlı durumu (sahnedekinin kopyası). */
  objects: LiveObject[]
  /** Kıskaçta tutulan küpün kimliği. */
  held: string | null = null
  gripClosed = false
  trail: Array<[number, number]> = []
  private cmd: Command | null = null
  /** Tekerlek açılarından tahmin edilen yön (jiroskopsuz dönüş bunu kullanır). */
  private encTheta: number
  private t = 0
  private trailT = 0

  constructor(profile: RobotProfileId | RobotProfile, scene: RobotScene) {
    this.profile = typeof profile === 'string' ? ROBOT_PROFILES[profile] : profile
    this.scene = scene
    this.x = scene.pose.x
    this.y = scene.pose.y
    this.theta = scene.pose.theta
    this.zeroTheta = this.theta
    this.encTheta = this.theta
    this.objects = (scene.objects ?? []).map((o) => ({ id: o.id, x: o.x, y: o.y, color: o.color, half: (o.size ?? 0.04) / 2 }))
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
    this.cmd = { kind: 'turn', deg: Math.abs(deg), startTheta: this.turnRef }
    this.powerL = -p; this.powerR = p
    if (deg === 0) this.stop()
  }
  /** Kıskacı kapat (önündeki küpü tutar) ya da aç (tuttuğunu önüne bırakır). */
  grip(close: boolean) {
    this.gripClosed = close
    if (close) {
      if (this.held) return
      let best: LiveObject | null = null, bd = GRAB_TOL
      for (const o of this.objects) {
        const [gx, gy] = this.holdPoint(o.half)
        const d = Math.hypot(o.x - gx, o.y - gy)
        if (d <= bd) { bd = d; best = o }
      }
      if (best) { this.held = best.id; this.carry() }
    } else this.held = null
  }
  /** Tutulan küp gövdenin önüne değecek yerde durur. */
  private holdPoint(half: number): [number, number] {
    const m = this.profile.mounts?.gripper
    return m ? this.bodyToWorld(m.x + half, m.y) : this.bodyToWorld(this.profile.radius + half, 0)
  }
  private carry() {
    const o = this.heldObject
    if (o) [o.x, o.y] = this.holdPoint(o.half)
  }
  get heldObject(): LiveObject | null { return this.held ? this.objects.find((o) => o.id === this.held) ?? null : null }
  get heldColor(): FloorColor | null { return this.heldObject?.color ?? null }
  object(id: string): LiveObject | undefined { return this.objects.find((o) => o.id === id) }
  /** Küpün altındaki zemin rengi. */
  objectFloor(id: string): FloorColor | null { const o = this.object(id); return o ? this.floorAtWorld(o.x, o.y) : null }
  get busy(): boolean { return this.cmd !== null }
  /** Dönüş bloğunun ölçtüğü yön: jiroskop varsa gerçek yön, yoksa tekerlek açılarından tahmin (kayan gövdede eksik kalır). */
  private get turnRef(): number { return this.has('gyro') || (this.profile.turnSlip ?? 1) === 1 ? this.theta : this.encTheta }
  /** Gövdeye göre bir noktanın dünya konumu. */
  private bodyToWorld(fx: number, fy: number): [number, number] {
    return [this.x + Math.cos(this.theta) * fx - Math.sin(this.theta) * fy, this.y + Math.sin(this.theta) * fx + Math.cos(this.theta) * fy]
  }
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
    const m = this.profile.mounts?.distance
    const [ox, oy] = m ? this.bodyToWorld(m.x, m.y) : this.bodyToWorld(this.profile.radius * 0.8, 0)
    const walls = this.objects.length ? [...this.scene.walls, ...this.objects.filter((o) => o.id !== this.held).flatMap(objWalls)] : this.scene.walls
    const d = rayDistance(ox, oy, this.theta + (m?.rot ?? 0), walls) * 100
    return Math.min(this.profile.rangeCm ?? MAX_RANGE_CM, Math.round(d * 10) / 10)
  }
  /** Gövdeye göre (ileri x, sola y) bir noktanın altındaki zemin rengi. */
  floorAt(fx: number, fy: number): FloorColor {
    const px = this.x + Math.cos(this.theta) * fx - Math.sin(this.theta) * fy
    const py = this.y + Math.sin(this.theta) * fx + Math.cos(this.theta) * fy
    return this.floorAtWorld(px, py)
  }
  /** Dünya koordinatındaki zemin rengi. */
  floorAtWorld(px: number, py: number): FloorColor {
    const half = (this.scene.lineWidth ?? 0.02) / 2
    if (this.scene.lines.some((pl) => pl.slice(1).some((pt, i) => distToSeg(px, py, ...pl[i], ...pt) < half))) return 'siyah'
    for (let i = this.scene.patches.length - 1; i >= 0; i--) {
      const p = this.scene.patches[i]
      if (px >= Math.min(p.x1, p.x2) && px <= Math.max(p.x1, p.x2) && py >= Math.min(p.y1, p.y2) && py <= Math.max(p.y1, p.y2)) return p.color
    }
    return 'beyaz'
  }
  /** Renk sensörü gövdenin ön altında. */
  get color(): FloorColor { const m = this.profile.mounts?.color; return m ? this.floorAt(m.x, m.y) : this.floorAt(this.profile.radius * 0.5, 0) }
  get reflect(): number { return FLOOR_COLORS[this.color].reflect }
  /** Çizgi sensörleri: önde, ortanın 1,5 cm solu ve sağı. */
  lineOn(side: 'left' | 'right'): boolean {
    const m = this.profile.mounts?.line
    return this.floorAt(m ? m.x : this.profile.radius * 0.6, (m?.y ?? 0) + (side === 'left' ? 0.015 : -0.015)) === 'siyah'
  }
  /** Tampon: önünde 1 cm içinde duvar var mı. */
  get pressed(): boolean {
    const m = this.profile.mounts?.force
    const [fx, fy] = m ? this.bodyToWorld(Math.max(m.x, this.profile.radius), m.y) : this.bodyToWorld(this.profile.radius, 0)
    return this.scene.walls.some((w) => distToSeg(fx, fy, ...w) < 0.012)
  }
  inZone(id: string): boolean {
    const z = this.scene.zones.find((q) => q.id === id)
    return !!z && Math.hypot(this.x - z.x, this.y - z.y) <= z.r
  }
  /** Benzetim saati (ms). */
  get timeMs(): number { return this.t }
  get moving(): boolean { return Math.abs(this.wL) > 1 || Math.abs(this.wR) > 1 }
  /** Motorlar kapalı ve tekerlekler durmuş. */
  get stopped(): boolean { return !this.busy && this.powerL === 0 && this.powerR === 0 && !this.moving }

  // ---------- fizik ----------
  /** Saati `nowMs`'ye (mutlak) ilerletir. */
  advanceTo(nowMs: number) {
    while (this.t + STEP_MS <= nowMs) { this.step(STEP_MS / 1000); this.t += STEP_MS }
  }

  private step(dt: number) {
    const p = this.profile
    const k = 1 - Math.exp(-dt / (p.tauS ?? TAU_S))
    // tek motorlu gövdede iki teker ortak akstadır: ikisi de aynı gücü alır
    const pL = p.coupled ? (this.powerL + this.powerR) / 2 : this.powerL
    const pR = p.coupled ? pL : this.powerR
    this.wL += ((pL / 100) * p.maxDegPerS - this.wL) * k
    this.wR += ((pR / 100) * p.maxDegPerS - this.wR) * k
    const dL = this.wL * dt, dR = this.wR * dt
    this.degL += dL
    this.degR += dR
    const circ = Math.PI * this.profile.wheelDiameter
    const sL = (dL / 360) * circ, sR = (dR / 360) * circ
    const ds = (sL + sR) / 2
    const encDth = (sR - sL) / this.profile.wheelBase
    // tekerlek açılarından hesaplanan dönüş (kodlayıcı); gerçek dönüş kayma yüzünden daha az olabilir
    this.encTheta += encDth
    const dth = encDth * (this.profile.turnSlip ?? 1)
    const nt = this.theta + dth
    const nx = this.x + ds * Math.cos(nt), ny = this.y + ds * Math.sin(nt)
    let blocked = this.scene.walls.some((w) => distToSeg(nx, ny, ...w) < this.profile.radius)
    if (!blocked && this.objects.length) blocked = !this.pushObjects(nx, ny, nt)
    this.theta = nt
    this.turnedDeg += Math.abs(dth) * DEG
    if (!blocked) { this.x = nx; this.y = ny; this.distanceM += Math.abs(ds) }
    this.carry()
    if (blocked && !this.touching) this.collisions++
    this.touching = blocked
    for (const z of this.scene.zones) if (!this.visited.has(z.id) && Math.hypot(this.x - z.x, this.y - z.y) <= z.r) { this.visited.add(z.id); this.visitedAt.set(z.id, this.t + dt * 1000) }
    if (this.lights !== 'kapali' && this.has('color')) {
      const k = `${this.color}:${this.lights}`
      if (!this.colorLights.includes(k)) this.colorLights.push(k)
    }
    this.trailT += dt * 1000
    if (this.trailT >= TRAIL_EVERY_MS) { this.trailT = 0; this.trail.push([this.x, this.y]); if (this.trail.length > 4000) this.trail.shift() }
    this.checkCommand()
  }

  /**
   * Gövde (nx, ny) konumuna giderken değdiği serbest küpleri ileri iter (küp daire gibi ele alınır). Tutulan küp duvara girecekse
   * ya da itilen küp duvara/başka küpe dayanırsa hareket engellenir (false).
   */
  private pushObjects(nx: number, ny: number, nt: number): boolean {
    const R = this.profile.radius
    const hit = (o: LiveObject, x: number, y: number) => this.scene.walls.some((w) => distToSeg(x, y, ...w) < o.half)
      || this.objects.some((q) => q !== o && q.id !== this.held && Math.abs(q.x - x) < q.half + o.half && Math.abs(q.y - y) < q.half + o.half)
    const held = this.heldObject
    if (held) {
      const d = R + held.half
      if (hit(held, nx + Math.cos(nt) * d, ny + Math.sin(nt) * d)) return false
    }
    const moves: Array<[LiveObject, number, number]> = []
    for (const o of this.objects) {
      if (o === held) continue
      const dx = o.x - nx, dy = o.y - ny, dist = Math.hypot(dx, dy), need = R + o.half
      if (dist >= need || dist === 0) continue
      const px = nx + (dx / dist) * need, py = ny + (dy / dist) * need
      if (hit(o, px, py)) return false
      moves.push([o, px, py])
    }
    for (const [o, px, py] of moves) { o.x = px; o.y = py }
    return true
  }

  private checkCommand() {
    const c = this.cmd
    if (!c) return
    const done = c.kind === 'move'
      ? (Math.abs(this.degL - c.startL) + Math.abs(this.degR - c.startR)) / 2 >= c.wheelDeg
      : Math.abs(this.turnRef - c.startTheta) * DEG >= c.deg
    if (done) this.stop()
  }
}

const clampPct = (v: number) => Math.max(-100, Math.min(100, Number.isFinite(v) ? v : 0))
