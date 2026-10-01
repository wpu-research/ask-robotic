// 2B robot benzetimi: Arduino pinlerini okuyup (PWM, yön) tekerlek hızına çevirir, sensörleri besler.
// Fizik 1 ms adımla çevrim-doğrulukta saatle birlikte ilerler. Birimler: metre, saniye, radyan.
import type { Pin, Sim } from './sim.js'
import type { HCSR04, MPU6050, MPU6050Options } from './devices.js'

const CYCLES_PER_MS = 16000

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}
const gauss = (rnd: () => number): number => Math.sqrt(-2 * Math.log(rnd() || 1e-9)) * Math.cos(2 * Math.PI * rnd())

/** Duvar kesmesi: [x1, y1, x2, y2]. */
export type Wall = [number, number, number, number]
/** Zemin çizgisi: [x, y] noktaları. */
export type Polyline = Array<[number, number]>

/** Arena: duvarlar (kesmeler) ve zemin çizgileri (çoklu nokta). */
export class Arena {
  walls: Wall[] = []
  lines: Polyline[] = []
  lineWidth = 0.02
  static box(w = 2, h = 2): Arena {
    const a = new Arena()
    a.walls.push([0, 0, w, 0], [w, 0, w, h], [w, h, 0, h], [0, h, 0, 0])
    return a
  }
  wall(x1: number, y1: number, x2: number, y2: number): this { this.walls.push([x1, y1, x2, y2]); return this }
  line(points: Polyline): this { this.lines.push(points); return this }
}

const distToSeg = (px: number, py: number, x1: number, y1: number, x2: number, y2: number): number => {
  const dx = x2 - x1, dy = y2 - y1, l2 = dx * dx + dy * dy
  const t = l2 ? Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / l2)) : 0
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy))
}
function rayHit(ox: number, oy: number, ang: number, [x1, y1, x2, y2]: Wall): number {
  const dx = Math.cos(ang), dy = Math.sin(ang), ex = x2 - x1, ey = y2 - y1
  const den = dx * ey - dy * ex
  if (Math.abs(den) < 1e-12) return Infinity
  const t = ((x1 - ox) * ey - (y1 - oy) * ex) / den
  const u = ((x1 - ox) * dy - (y1 - oy) * dx) / den
  return t >= 0 && u >= 0 && u <= 1 ? t : Infinity
}

/** Pinin son birkaç ms'deki doluluk oranını (PWM) izler. */
function dutyTracker(sim: Sim, pin: Pin, windowMs = 4.2): () => number {
  const edges: Array<{ t: number; high: boolean }> = []
  sim.onPin(pin, (high) => { edges.push({ t: sim.nowMs(), high }); if (edges.length > 64) edges.shift() })
  return () => {
    const now = sim.nowMs()
    if (!edges.length) return sim.read(pin) ? 1 : 0
    let acc = 0, tEnd = now
    for (let i = edges.length - 1; i >= 0; i--) {
      const start = Math.max(edges[i].t, now - windowMs)
      if (edges[i].high) acc += tEnd - start
      tEnd = start
      if (edges[i].t <= now - windowMs) return acc / windowMs
    }
    if (!edges[0].high) acc += tEnd - (now - windowMs) // ilk kenardan önce HIGH idi
    return acc / windowMs
  }
}

/** Servo sinyalinden açıyı (0-180°) çıkarır. */
function servoAngle(sim: Sim, pin: Pin): () => number {
  let rise: number | null = null, width = 1472
  sim.onPin(pin, (high) => { if (high) rise = sim.nowMs(); else if (rise !== null) { width = (sim.nowMs() - rise) * 1000; rise = null } })
  return () => Math.max(0, Math.min(180, ((width - 544) / (2400 - 544)) * 180))
}

export interface MotorPins { en: Pin; in1: Pin; in2: Pin }
export interface MotorsConfig { left: MotorPins; right: MotorPins }
export interface LineSensor {
  pin: Pin
  kind?: 'analog' | 'digital'
  /** Robot gövdesine göre ileri / yana konum (m). Varsayılan x=0.07, y=0. */
  x?: number
  y?: number
  /** Her adımda güncellenir: sensör çizgi üstünde mi. */
  on?: boolean
}
export interface RoverConfig {
  arena?: Arena
  pose?: { x?: number; y?: number; theta?: number }
  motors: MotorsConfig
  encoders?: { left?: Pin; right?: Pin }
  ultrasonic?: { trig: Pin; echo: Pin; servo?: Pin }
  lineSensors?: LineSensor[]
  bumpers?: { left?: Pin; right?: Pin }
  gain?: { left?: number; right?: number }
  deadband?: number
  wheelBase?: number
  wheelRadius?: number
  radius?: number
  maxOmega?: number
  tau?: number
  slots?: number
  noiseCm?: number
  seed?: number
  imu?: boolean
  gyroBiasDps?: number
  gyroNoiseDps?: number
}

export interface RoverState {
  x: number; y: number
  /** rad; 0 = +x ekseni, + = sola. */
  theta: number
  /** Tekerlek açısal hızları (rad/s). */
  wL: number; wR: number
  angL: number; angR: number
  ticksL: number; ticksR: number
  distanceM: number
  frontCm: number
  collided: boolean
  trail: Array<[number, number, number]>
}
export interface Rover {
  state: RoverState
  arena: Arena
  params: RoverConfig & { wheelBase: number; wheelRadius: number; radius: number; maxOmega: number; tau: number; deadband: number; slots: number; noiseCm: number }
  imu: MPU6050 | null
  readonly headingDeg: number
}

/**
 * Diferansiyel sürüşlü gezgin robot (L298N/TB6612 benzeri sürücü).
 */
export function attachRover(sim: Sim, cfg: RoverConfig): Rover {
  const arena = cfg.arena ?? Arena.box(2, 2)
  const p = {
    wheelBase: 0.12, wheelRadius: 0.033, radius: 0.075, maxOmega: 12, tau: 0.08, deadband: 0.2, slots: 20,
    noiseCm: 0, ...cfg,
  }
  const gain = { left: 1, right: 1, ...(cfg.gain ?? {}) }
  const rnd = mulberry32(cfg.seed ?? 1)
  const s: RoverState = {
    x: cfg.pose?.x ?? 0.5, y: cfg.pose?.y ?? 0.5, theta: cfg.pose?.theta ?? 0,
    wL: 0, wR: 0, angL: 0, angR: 0, ticksL: 0, ticksR: 0, distanceM: 0, frontCm: 400, collided: false, trail: [],
  }
  const sides = ['left', 'right'] as const
  const duties = {} as Record<'left' | 'right', () => number>
  const servo = p.ultrasonic?.servo ? servoAngle(sim, p.ultrasonic.servo) : null
  for (const m of sides) {
    const mo = p.motors[m]
    duties[m] = dutyTracker(sim, mo.en)
  }
  const target = (m: 'left' | 'right'): number => {
    const mo = p.motors[m]
    const d = duties[m](), a = sim.read(mo.in1), b = sim.read(mo.in2)
    const dir = a && !b ? 1 : !a && b ? -1 : 0
    if (!dir || d < p.deadband) return 0
    return dir * ((d - p.deadband) / (1 - p.deadband)) * p.maxOmega * gain[m]
  }
  // İsteğe bağlı IMU (MPU6050 0x68): gz = yaw hızı (°/s) + sabit sapma (gyroBiasDps) + gürültü (gyroNoiseDps)
  const imu: MPU6050 | null = p.imu ? sim.mpu6050({}) : null
  const us: HCSR04 | null = p.ultrasonic ? sim.hcsr04({ trig: p.ultrasonic.trig, echo: p.ultrasonic.echo, cm: 400 }) : null
  const encLevel = { left: false, right: false }
  for (const m of sides) { const e = p.encoders?.[m]; if (e !== undefined) sim.drive(e, false) }
  let trailT = 0

  const step = (dt: number): void => {
    const tl = target('left'), tr = target('right'), k = 1 - Math.exp(-dt / p.tau)
    s.wL += (tl - s.wL) * k
    s.wR += (tr - s.wR) * k
    const v = (p.wheelRadius * (s.wL + s.wR)) / 2
    const om = (p.wheelRadius * (s.wR - s.wL)) / p.wheelBase
    const nt = s.theta + om * dt
    const nx = s.x + v * Math.cos(nt) * dt, ny = s.y + v * Math.sin(nt) * dt
    const blocked = arena.walls.some((w) => distToSeg(nx, ny, ...w) < p.radius)
    s.theta = nt
    if (!blocked) { s.distanceM += Math.abs(v) * dt; s.x = nx; s.y = ny }
    s.collided = blocked
    // tekerlek açıları ve enkoder (her yuva için 2 kenar: HIGH/LOW)
    s.angL += s.wL * dt; s.angR += s.wR * dt
    const half = Math.PI / p.slots
    for (const [m, ang] of [['left', s.angL], ['right', s.angR]] as const) {
      const pin = p.encoders?.[m]; if (pin === undefined) continue
      const level = Math.floor(ang / half) % 2 !== 0
      if (level !== encLevel[m]) { encLevel[m] = level; sim.drive(pin, level); if (level) s[m === 'left' ? 'ticksL' : 'ticksR'] += ang >= 0 ? 1 : 0 }
    }
    if (imu) {
      imu.gz = (om * 180) / Math.PI + (p.gyroBiasDps ?? 0) + (p.gyroNoiseDps ? gauss(rnd) * p.gyroNoiseDps : 0)
      imu.ax = 0; imu.ay = 0; imu.az = 1; imu.gx = 0; imu.gy = 0
    }
    // ultrasonik
    if (us) {
      const sa = servo ? ((servo() - 90) * Math.PI) / 180 : 0
      const ox = s.x + Math.cos(s.theta) * 0.06, oy = s.y + Math.sin(s.theta) * 0.06
      let t = Infinity
      for (const w of arena.walls) t = Math.min(t, rayHit(ox, oy, s.theta + sa, w))
      let cm = Number.isFinite(t) ? t * 100 : 500
      if (p.noiseCm && cm < 400) cm += gauss(rnd) * p.noiseCm
      us.cm = cm; s.frontCm = cm
    }
    // çizgi sensörleri
    for (const ls of p.lineSensors ?? []) {
      const fx = s.x + Math.cos(s.theta) * (ls.x ?? 0.07) - Math.sin(s.theta) * (ls.y ?? 0)
      const fy = s.y + Math.sin(s.theta) * (ls.x ?? 0.07) + Math.cos(s.theta) * (ls.y ?? 0)
      const on = arena.lines.some((pl) => pl.slice(1).some((pt, i) => distToSeg(fx, fy, ...pl[i], ...pt) < arena.lineWidth / 2))
      ls.on = on
      if (ls.kind === 'digital') sim.drive(ls.pin, on)
      else sim.analog(ls.pin, on ? 4.2 : 0.8)
    }
    // tamponlar (basılı = LOW)
    if (p.bumpers) {
      for (const [side, sign] of [['left', 1], ['right', -1]] as const) {
        const bp = p.bumpers[side]
        if (bp === undefined) continue
        const bx = s.x + Math.cos(s.theta) * 0.085 - Math.sin(s.theta) * 0.04 * sign
        const by = s.y + Math.sin(s.theta) * 0.085 + Math.cos(s.theta) * 0.04 * sign
        sim.drive(bp, !arena.walls.some((w) => distToSeg(bx, by, ...w) < 0.012))
      }
    }
    trailT += dt
    if (trailT >= 0.02) { trailT = 0; s.trail.push([s.x, s.y, s.theta]) }
  }
  const loop = (): void => { step(0.001); sim.cpu.addClockEvent(loop, CYCLES_PER_MS) }
  sim.cpu.addClockEvent(loop, CYCLES_PER_MS)
  step(0.001) // başlangıç sensör değerleri
  return { state: s, arena, params: p, imu, get headingDeg() { return ((s.theta * 180) / Math.PI) % 360 } }
}

export interface BalancerConfig {
  motors: MotorsConfig
  mpu?: MPU6050Options
  /** İlk eğim (derece). */
  theta0Deg?: number
  A?: number; B?: number; C?: number
  deadband?: number
  fallDeg?: number
  gyroBiasDps?: number
}
export interface BalancerState {
  theta: number; omega: number; x: number; v: number; fell: boolean; maxAbsDeg: number
}
export interface Balancer {
  state: BalancerState
  mpu: MPU6050
  readonly thetaDeg: number
}

/**
 * Dengelenen robot (ters sarkaç). Tekerlek komutu u ∈ [-1,1]: θ'' = A·sinθ − B·u − C·θ'.
 * θ > 0 ileri eğilme. MPU6050 (0x68) ham verisi: ax = sinθ, az = cosθ (g), gy = θ' (°/s).
 */
export function attachBalancer(sim: Sim, cfg: BalancerConfig): Balancer {
  const P = { A: 25, B: 80, C: 0.6, deadband: 0.08, theta0Deg: 3, fallDeg: 45, ...cfg }
  const s: BalancerState = { theta: (P.theta0Deg * Math.PI) / 180, omega: 0, x: 0, v: 0, fell: false, maxAbsDeg: 0 }
  const duties = { left: dutyTracker(sim, P.motors.left.en), right: dutyTracker(sim, P.motors.right.en) }
  const cmd = (m: 'left' | 'right'): number => {
    const mo = P.motors[m], d = duties[m](), a = sim.read(mo.in1), b = sim.read(mo.in2)
    const dir = a && !b ? 1 : !a && b ? -1 : 0
    if (!dir || d < P.deadband) return 0
    return dir * ((d - P.deadband) / (1 - P.deadband))
  }
  const mpu = sim.mpu6050(cfg.mpu ?? {})
  const step = (dt: number): void => {
    if (!s.fell) {
      const u = (cmd('left') + cmd('right')) / 2
      const acc = P.A * Math.sin(s.theta) - P.B * u - P.C * s.omega
      s.omega += acc * dt; s.theta += s.omega * dt
      s.v = u * 0.5; s.x += s.v * dt
      s.maxAbsDeg = Math.max(s.maxAbsDeg, Math.abs((s.theta * 180) / Math.PI))
      if (Math.abs(s.theta) > (P.fallDeg * Math.PI) / 180) s.fell = true
    }
    mpu.ax = Math.sin(s.theta); mpu.az = Math.cos(s.theta); mpu.ay = 0
    mpu.gy = ((s.omega * 180) / Math.PI) + (P.gyroBiasDps ?? 0)
  }
  const loop = (): void => { step(0.001); sim.cpu.addClockEvent(loop, CYCLES_PER_MS) }
  sim.cpu.addClockEvent(loop, CYCLES_PER_MS)
  step(0.001)
  return { state: s, mpu, get thetaDeg() { return (s.theta * 180) / Math.PI } }
}

/** Modül 5 standart pin düzeni (derslerde ve checks.mjs'te aynı kullanılır). */
export const STD_MOTORS: MotorsConfig = { left: { en: 5, in1: 7, in2: 8 }, right: { en: 6, in1: 9, in2: 10 } }
export const STD_ENCODERS = { left: 2, right: 3 }
export const STD_ULTRASONIC = { trig: 11, echo: 12, servo: 4 }
