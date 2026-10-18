// 3B keşif robotu sahnesinin saf mantığı: GPIO pin seviyeleri (L298N IN1/IN2/ENA, IN3/IN4/ENB) → tekerlek hızları →
// diferansiyel sürüş pozu; kameranın görüş konisinde hedef top var mı; isteğe bağlı "izle" kipinde topa dönüş. Çarpışma:
// robot saha sınırında ve kutu engellerde durur. 3B bileşen (components/gomulu/scene3d-rpi.tsx) yalnız bu durumu çizer.
import { integrate, l298n, wrap, type Pose } from './motion'

export interface MotorPins { in1: boolean; in2: boolean; ena: number; in3: boolean; in4: boolean; enb: number }
export interface Box { x: number; y: number; w: number; h: number }
export interface World { half: number; boxes: Box[]; ball: { x: number; y: number; r: number } }
export interface Robot3D { pose: Pose; vl: number; vr: number; bumped: boolean; trail: Array<[number, number]> }

export const TRACK = 0.16
/** 7,4 V pil, L298N, ders motoru: tam görevde tekerlek çevresel hızı ≈ 0,4 m/s (5,4 V motor geriliminde). */
export const V_PER_VOLT = 0.4 / 5.4
export const FOV = (62 * Math.PI) / 180 // Camera Module 3 yatay görüş açısı (~66°) yuvarlanmış
export const RANGE = 4
export const ROBOT_R = 0.12

export const WORLD: World = { half: 2, boxes: [{ x: 0.8, y: 0.6, w: 0.4, h: 0.4 }, { x: -1, y: -0.5, w: 0.3, h: 0.8 }], ball: { x: 1.4, y: -1.1, r: 0.07 } }
export const newRobot3D = (): Robot3D => ({ pose: { x: -1.2, y: 1.0, th: -0.4 }, vl: 0, vr: 0, bumped: false, trail: [] })

/** Pin seviyelerinden tekerlek hızları (m/s): sol kanal IN1/IN2/ENA, sağ kanal IN3/IN4/ENB. */
export function pinsToWheels(p: MotorPins, vm = 7.4): { vl: number; vr: number } {
  const l = l298n(p.in1, p.in2, p.ena, vm), r = l298n(p.in3, p.in4, p.enb, vm)
  return { vl: l.volts * V_PER_VOLT, vr: r.volts * V_PER_VOLT }
}
/** Ters yönde: (ileri, dön) komutundan pin seviyeleri; gpiozero Robot sınıfının yaptığı iş. */
export function commandToPins(fwd: number, turn: number): MotorPins {
  const l = Math.max(-1, Math.min(1, fwd + turn)), r = Math.max(-1, Math.min(1, fwd - turn))
  return { in1: l > 0, in2: l < 0, ena: Math.abs(l), in3: r > 0, in4: r < 0, enb: Math.abs(r) }
}

export function collides(x: number, y: number, w: World = WORLD): boolean {
  if (Math.abs(x) > w.half - ROBOT_R || Math.abs(y) > w.half - ROBOT_R) return true
  return w.boxes.some((b) => x > b.x - b.w / 2 - ROBOT_R && x < b.x + b.w / 2 + ROBOT_R && y > b.y - b.h / 2 - ROBOT_R && y < b.y + b.h / 2 + ROBOT_R)
}

/** Bir adım: yeni poz çarpışıyorsa robot yerinde kalır ve bumped = true (tampon anahtarı). */
export function step(s: Robot3D, p: MotorPins, dt: number, w: World = WORLD): Robot3D {
  const { vl, vr } = pinsToWheels(p)
  const next = integrate(s.pose, vl * dt, vr * dt, TRACK)
  const hit = collides(next.x, next.y, w)
  const pose = hit ? { ...s.pose, th: next.th } : next
  const trail = s.trail.length && Math.hypot(s.trail[s.trail.length - 1][0] - pose.x, s.trail[s.trail.length - 1][1] - pose.y) < 0.03 ? s.trail : [...s.trail.slice(-400), [pose.x, pose.y] as [number, number]]
  return { pose, vl, vr, bumped: hit, trail }
}

/** Kamera görüşü: topun gövdeye göre açısı ve uzaklığı; koni içindeyse ve önünde engel yoksa görünür. */
export function seeBall(pose: Pose, w: World = WORLD): { seen: boolean; bearing: number; dist: number; x: number } {
  const dx = w.ball.x - pose.x, dy = w.ball.y - pose.y
  const dist = Math.hypot(dx, dy)
  const bearing = wrap(Math.atan2(dy, dx) - pose.th)
  let seen = Math.abs(bearing) <= FOV / 2 && dist <= RANGE
  if (seen) {
    // Görüş hattı engel kutusundan geçiyor mu (örnekleyerek)
    for (let k = 1; k < 20 && seen; k++) {
      const px = pose.x + (dx * k) / 20, py = pose.y + (dy * k) / 20
      if (w.boxes.some((b) => Math.abs(px - b.x) < b.w / 2 && Math.abs(py - b.y) < b.h / 2)) seen = false
    }
  }
  // Görüntüdeki yatay konum: −1 sol … +1 sağ (sağ = negatif açı)
  return { seen, bearing, dist, x: Math.max(-1, Math.min(1, -bearing / (FOV / 2))) }
}

/** İzle kipi: top görünüyorsa yaklaş, 0,35 m'de dur; görünmüyorsa yerinde ara. 6. ve 10. ünitedeki denetleyiciyle aynı. */
export function followPins(pose: Pose, w: World = WORLD): MotorPins {
  const v = seeBall(pose, w)
  if (!v.seen) return commandToPins(0, 0.35)
  const fwd = v.dist > 0.35 ? Math.min(0.7, (v.dist - 0.35) * 1.5 + 0.25) : 0
  return commandToPins(fwd, 0.9 * v.x)
}
