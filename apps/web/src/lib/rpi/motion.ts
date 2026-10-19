// Motor ve hareket: L298N doğruluk tablosu, birinci dereceden DC motor modeli, dörtlü (quadrature) enkoder çözme,
// PI hız denetimi ve diferansiyel sürüş kinematiği (ileri/ters, tam yay tümlevi). Saf fonksiyonlar; motion.test.ts.

export type Drive = 'forward' | 'reverse' | 'brake' | 'coast'
/** L298N bir kanal: EN (PWM görev oranı 0..1), IN1, IN2. Çıkış: kip ve ortalama motor gerilimi (işaretli). */
export function l298n(in1: boolean, in2: boolean, en: number, vm = 12, drop = 2): { mode: Drive; volts: number } {
  if (en <= 0) return { mode: 'coast', volts: 0 }
  if (in1 === in2) return { mode: 'brake', volts: 0 }
  // L298N'in bipolar köprüsü yaklaşık 2 V düşürür (TB6612 gibi MOSFET sürücülerde çok daha az)
  const v = Math.max(0, vm - drop) * Math.min(1, en)
  return { mode: in1 ? 'forward' : 'reverse', volts: in1 ? v : -v }
}

export interface MotorParams { kv: number; tau: number; maxRpm: number }
/** 6–12 V metal dişli motor (ders örneği): rpm ≈ kv·V, zaman sabiti tau. */
export const MOTOR: MotorParams = { kv: 15, tau: 0.15, maxRpm: 180 }
/** Bir adım: yük (0..1) hızı düşürür; frenle hız hızla sıfıra iner, serbestte yavaş. */
export function motorStep(rpm: number, volts: number, mode: Drive, dt: number, load = 0, p = MOTOR): number {
  if (mode === 'brake') return rpm * Math.exp(-dt / (p.tau / 4))
  if (mode === 'coast') return rpm * Math.exp(-dt / (p.tau * 3))
  const target = p.kv * volts * (1 - load)
  return target + (rpm - target) * Math.exp(-dt / p.tau)
}

/** Kanal A/B gri kodu sırası: 00 → 01 → 11 → 10 ileri. */
const SEQ = [0b00, 0b01, 0b11, 0b10]
/** Önceki ve şimdiki AB durumundan adım: +1, −1, 0 ya da geçersiz (iki kanal birden değişti: örnek kaçırıldı). */
export function quadStep(prev: number, cur: number): 1 | -1 | 0 | 'error' {
  if (prev === cur) return 0
  const a = SEQ.indexOf(prev), b = SEQ.indexOf(cur)
  if ((a + 1) % 4 === b) return 1
  if ((a + 3) % 4 === b) return -1
  return 'error'
}
/** AB durumu: konum (sayım) → kanal seviyeleri. */
export const quadState = (count: number) => SEQ[((count % 4) + 4) % 4]
/** Sayım farkından devir/dakika. cpr: çıkış milinde tur başına sayım (4× çözme dahil). */
export const rpmFromTicks = (ticks: number, cpr: number, dt: number) => (ticks / cpr) * (60 / dt)

export interface PiState { i: number }
/** PI hız denetimi: çıkış görev oranı −1..1, integral doyumu önlenir. */
export function piStep(st: PiState, target: number, measured: number, kp: number, ki: number, dt: number): number {
  const e = target - measured
  const u = kp * e + ki * (st.i + e * dt)
  if (Math.abs(u) < 1) st.i += e * dt
  return Math.max(-1, Math.min(1, u))
}

export interface Pose { x: number; y: number; th: number }
/** Gövde hızından tekerlek hızları (m/s): L iz genişliği (m). */
export const wheelSpeeds = (v: number, w: number, L: number) => ({ vl: v - (w * L) / 2, vr: v + (w * L) / 2 })
export const bodyTwist = (vl: number, vr: number, L: number) => ({ v: (vl + vr) / 2, w: (vr - vl) / L })
/** Tekerlek yollarından (m) poz güncellemesi: tam yay. */
export function integrate(p: Pose, dl: number, dr: number, L: number): Pose {
  const d = (dl + dr) / 2, dth = (dr - dl) / L
  if (Math.abs(dth) < 1e-9) return { x: p.x + d * Math.cos(p.th), y: p.y + d * Math.sin(p.th), th: p.th }
  const R = d / dth
  return { x: p.x + R * (Math.sin(p.th + dth) - Math.sin(p.th)), y: p.y - R * (Math.cos(p.th + dth) - Math.cos(p.th)), th: wrap(p.th + dth) }
}
export const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a))
/** Sayım → tekerlek yolu (m). */
export const ticksToMeters = (ticks: number, cpr: number, wheelDiam: number) => (ticks / cpr) * Math.PI * wheelDiam

/** Klavye/joystick → (v, w): ileri-geri ve sola-sağa ekseni −1..1. */
export function arcade(fwd: number, turn: number, vMax: number, wMax: number) { return { v: fwd * vMax, w: -turn * wMax } }
