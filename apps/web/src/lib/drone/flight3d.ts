// Drone dersinin 3B uçuş fiziği ("6 serbestlik derecesi, sade"): physics.ts'teki PID, karıştırıcı (mixQuadX), itki modeli ve
// GPS hatası üzerine kurulu. DOM yok, aynı girdi → aynı çıktı (gürültü tohumlu). 3B sahneler yalnız bu dosyayı oynatır.
//
// Eksenler PX4 ile aynı: dünya NED (x kuzey, y doğu, z aşağı), gövde FRD (x burun, y sağ, z aşağı). Euler ZYX (sapma ψ,
// yunuslama θ, yuvarlanma φ): φ > 0 sağ taraf aşağı, θ > 0 burun yukarı, ψ > 0 yukarıdan bakınca saat yönü (QUAD_X ile aynı).
// İrtifa h = −z. Motor itkisi gövdenin −z yönündedir; her motor birinci derece gecikmeyle (motorTau) komutu izler.
import {
  ALT_DEFAULTS, DEG, G, MISSION_DEFAULTS, Pid, QUAD_X, ROLL_DEFAULTS, clamp, mixQuadX, relThrust, rng, stepMetrics, throttleFor,
  type AltParams, type MissionParams, type MixCmd, type RollParams, type StepMetrics, type Vec,
} from './physics'

export type V3 = [number, number, number]

export interface QuadParams {
  /** Uçuş kontrolcüsünün bildiği kütle, kg. */ massKg: number
  /** Kontrolcünün bilmediği ek yük, kg. */ payloadKg: number
  /** Motor ekseninin merkeze uzaklığı, m (X500 ≈ 0,25). */ armM: number
  /** Motor başına azami itki, N. */ maxThrustN: number
  /** THR_MDL_FAC (yalnız ESC gazı gösterimi için: itki → gaz). */ thrustModel: number
  motorTau: number
  /** Asal eylemsizlikler Ixx, Iyy, Izz, kg·m². */ inertia: V3
  /** Pervane tepki torku / itki, m (sapma torku = kYaw · T). */ kYaw: number
  /** Doğrusal hava sürüklemesi, N/(m/s) (havaya göre hız). */ drag: number
  /** Dönüş sönümü, N·m/(rad/s). */ rotDrag: number
}
/** 1,2 kg'lık X500 benzeri quad; toplam azami itki ALT_DEFAULTS ile aynı (2 × ağırlık). */
export const QUAD_DEFAULTS: QuadParams = {
  massKg: ALT_DEFAULTS.massKg, payloadKg: 0, armM: 0.25, maxThrustN: ALT_DEFAULTS.maxThrustN / 4, thrustModel: 0.3,
  motorTau: ALT_DEFAULTS.motorTau, inertia: [ROLL_DEFAULTS.inertia, ROLL_DEFAULTS.inertia, 0.018], kYaw: 0.016, drag: ALT_DEFAULTS.drag, rotDrag: 0,
}

export interface QuadState {
  t: number
  /** Konum NED, m. */ pos: V3
  vel: V3
  /** [φ, θ, ψ], rad. */ att: V3
  /** Gövde açısal hızları [p, q, r], rad/s. */ rate: V3
  /** Motor itkileri M1..M4, N (QUAD_X sırası). */ thrust: number[]
  /** Son karıştırıcı çıkışları 0..1 (bağıl itki). */ cmd: number[]
  onGround: boolean
  /** Son yere temasta dikey hız, m/s (aşağı +). */ touchdownSpeed: number | null
}

export function quadInit(p: QuadParams, o: { pos?: V3; att?: V3; hoverThrust?: boolean } = {}): QuadState {
  // hoverThrust: motorlar zaten askıda kalma itkisinde başlar (1B simdeki T = m·g başlangıcıyla aynı)
  const T0 = o.hoverThrust ? p.massKg * G / 4 : 0
  const pos: V3 = o.pos ? [...o.pos] : [0, 0, 0]
  return { t: 0, pos, vel: [0, 0, 0], att: o.att ? [...o.att] : [0, 0, 0], rate: [0, 0, 0], thrust: [T0, T0, T0, T0], cmd: [T0 / p.maxThrustN, T0 / p.maxThrustN, T0 / p.maxThrustN, T0 / p.maxThrustN], onGround: pos[2] >= 0, touchdownSpeed: null }
}

/** İrtifa, m (yukarı +). */
export const altitude = (s: QuadState) => 0 - s.pos[2]

/** Gövde → dünya dönüş matrisinin üçüncü sütunu (gövde z ekseninin dünyadaki yönü). */
export function bodyZ([φ, θ, ψ]: V3): V3 {
  const cφ = Math.cos(φ), sφ = Math.sin(φ), cθ = Math.cos(θ), sθ = Math.sin(θ), cψ = Math.cos(ψ), sψ = Math.sin(ψ)
  return [cψ * sθ * cφ + sψ * sφ, sψ * sθ * cφ - cψ * sφ, cθ * cφ]
}

/** Gövde → dünya dönüş matrisi (satır sıralı 3×3), ZYX Euler. */
export function rotation([φ, θ, ψ]: V3): number[] {
  const cφ = Math.cos(φ), sφ = Math.sin(φ), cθ = Math.cos(θ), sθ = Math.sin(θ), cψ = Math.cos(ψ), sψ = Math.sin(ψ)
  return [
    cψ * cθ, cψ * sθ * sφ - sψ * cφ, cψ * sθ * cφ + sψ * sφ,
    sψ * cθ, sψ * sθ * sφ + cψ * cφ, sψ * sθ * cφ - cψ * sφ,
    -sθ, cθ * sφ, cθ * cφ,
  ]
}

/**
 * Dört motor itkisinden gövde torkları [τx, τy, τz], N·m. Motor i, gövdede (x, y) = ℓ·(QUAD_X.x, −QUAD_X.y) noktasında
 * (QUAD_X'te y sola +), ℓ = kol/√2. τ = r × F, F = (0, 0, −T): τx = ℓ·Σ yₗ·T (sol motorlar → sağa yatış),
 * τy = ℓ·Σ x·T (ön motorlar → burun yukarı), τz = kYaw·Σ ±T (CCW pervanenin tepkisi gövdeyi saat yönüne çevirir).
 */
export function bodyTorques(p: QuadParams, thrust: readonly number[]): V3 {
  const l = p.armM / Math.SQRT2
  let tx = 0, ty = 0, tz = 0
  QUAD_X.forEach((m, i) => {
    const T = thrust[i]
    tx += l * m.y * T
    ty += l * m.x * T
    tz += p.kYaw * T * (m.spin === 'ccw' ? 1 : -1)
  })
  return [tx, ty, tz]
}

/** Toplam itki (N) ve istenen gövde torkunu (N·m) karıştırıcı komutuna çevirir (bodyTorques'un tersi, doymasız bölgede tam). */
export function torqueToMix(p: QuadParams, thrustN: number, tau: V3): MixCmd {
  const l = p.armM / Math.SQRT2, T = p.maxThrustN
  return { thrust: thrustN / (4 * T), roll: tau[0] / (4 * l * T), pitch: tau[1] / (4 * l * T), yaw: tau[2] / (4 * p.kYaw * T) }
}

/** Karıştırıcı çıkışını (bağıl itki 0..1) ESC gaz komutuna çevirir (THR_MDL_FAC). */
export const escThrottle = (p: QuadParams, rel: number) => throttleFor(rel, p.thrustModel)

export interface StepExtra {
  /** Dünya çerçevesinde dış kuvvet (rüzgâr hamlesi vb.), N. */ force?: V3
  /** Gövde çerçevesinde bozucu tork, N·m. */ torque?: V3
  /** Rüzgâr (dünya NED), m/s. */ wind?: V3
  /**
   * Test düzeneği: öteleme kilitli; serbest olmayan eksen sabit tutulur, yay/sönüm eklenebilir.
   * free: [yuvarlanma, yunuslama, sapma]; spring N·m/rad; damp N·m/(rad/s).
   */
  rig?: { free: [boolean, boolean, boolean]; spring?: V3; damp?: V3 }
}

/**
 * Bir adım ilerletir (durumu yerinde değiştirir). rel: karıştırıcı çıkışı, motor başına bağıl itki 0..1.
 * Sıra 1B simlerle aynıdır: itki gecikmesi → ivme → hız → konum; yer altına inemez.
 */
export function quadStep(s: QuadState, p: QuadParams, rel: readonly number[], dt: number, ex: StepExtra = {}): QuadState {
  for (let i = 0; i < 4; i++) {
    const c = clamp(rel[i], 0, 1)
    s.cmd[i] = c
    s.thrust[i] += (c * p.maxThrustN - s.thrust[i]) * dt / p.motorTau
  }
  const Tsum = s.thrust[0] + s.thrust[1] + s.thrust[2] + s.thrust[3]
  const m = p.massKg + p.payloadKg

  // dönüş: J·ω̇ = τ + τ_dış − ω × Jω − c·ω
  const tau = bodyTorques(p, s.thrust)
  const [Ix, Iy, Iz] = p.inertia
  const [pp, q, r] = s.rate
  const et = ex.torque ?? [0, 0, 0]
  const rig = ex.rig
  const k = rig?.spring ?? [0, 0, 0], c = rig?.damp ?? [0, 0, 0]
  const ax = (tau[0] + et[0] - (Iz - Iy) * q * r - p.rotDrag * pp - k[0] * s.att[0] - c[0] * pp) / Ix
  const ay = (tau[1] + et[1] - (Ix - Iz) * pp * r - p.rotDrag * q - k[1] * s.att[1] - c[1] * q) / Iy
  const az = (tau[2] + et[2] - (Iy - Ix) * pp * q - p.rotDrag * r - k[2] * s.att[2] - c[2] * r) / Iz
  s.rate = [pp + ax * dt, q + ay * dt, r + az * dt]
  if (rig) for (let i = 0; i < 3; i++) if (!rig.free[i]) s.rate[i] = 0
  const [φ, θ] = s.att
  const [p2, q2, r2] = s.rate
  const tθ = Math.tan(θ), cθ = Math.cos(θ), sφ = Math.sin(φ), cφ = Math.cos(φ)
  s.att = [φ + (p2 + (q2 * sφ + r2 * cφ) * tθ) * dt, θ + (q2 * cφ - r2 * sφ) * dt, s.att[2] + (q2 * sφ + r2 * cφ) / cθ * dt]

  if (rig) { s.t += dt; return s }

  // öteleme: m·a = −T·gövde_z + m·g·ẑ − sürükleme·(v − rüzgâr) + F_dış
  const bz = bodyZ(s.att), w = ex.wind ?? [0, 0, 0], f = ex.force ?? [0, 0, 0]
  for (let i = 0; i < 3; i++) {
    const a = (-Tsum * bz[i] + (i === 2 ? m * G : 0) - p.drag * (s.vel[i] - w[i]) + f[i]) / m
    s.vel[i] += a * dt
  }
  for (let i = 0; i < 3; i++) s.pos[i] += s.vel[i] * dt
  // yer: z > 0 yerin altı. Temas anında dikey hız kaydedilir, iniş takımı yatışı sıfırlar.
  if (s.pos[2] > 0) {
    if (!s.onGround && s.vel[2] > 0) s.touchdownSpeed = s.vel[2]
    s.pos[2] = 0
    if (s.vel[2] > 0) s.vel[2] = 0
    s.onGround = true
    s.vel[0] = 0; s.vel[1] = 0
    s.att[0] = 0; s.att[1] = 0; s.rate = [0, 0, 0]
  } else if (s.pos[2] < -0.01) s.onGround = false
  s.t += dt
  return s
}

// ---------------------------------------------------------------- denetleyici: irtifa PID + kaskad yönelim (açı P → hız PID)

export interface AttGains {
  /** Açı döngüsü P, 1/s: [yuvarlanma, yunuslama, sapma]. */ angleP: V3
  rateP: V3; rateI: V3; rateD: V3
  rateMaxDps: number; torqueMax: V3; dCutoffHz: number
}
export const ATT_DEFAULTS: AttGains = {
  angleP: [ROLL_DEFAULTS.angleP, ROLL_DEFAULTS.angleP, 3], rateP: [ROLL_DEFAULTS.rateP, ROLL_DEFAULTS.rateP, 0.2], rateI: [ROLL_DEFAULTS.rateI, ROLL_DEFAULTS.rateI, 0.1],
  rateD: [ROLL_DEFAULTS.rateD, ROLL_DEFAULTS.rateD, 0], rateMaxDps: ROLL_DEFAULTS.rateMaxDps, torqueMax: [ROLL_DEFAULTS.torqueMax, ROLL_DEFAULTS.torqueMax, 0.3], dCutoffHz: ROLL_DEFAULTS.dCutoffHz,
}

const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a))

export class AttitudeCtrl {
  rate: Pid[]
  constructor(public g: AttGains = ATT_DEFAULTS) {
    this.rate = [0, 1, 2].map((i) => new Pid({ kp: g.rateP[i], ki: g.rateI[i], kd: g.rateD[i] }, { outMin: -g.torqueMax[i], outMax: g.torqueMax[i], dCutoffHz: g.dCutoffHz }))
  }
  /** Açı hedefi ve (kestirilen) açı/hız → gövde torku. */
  update(attSp: V3, att: V3, rate: V3, dt: number): V3 {
    const rmax = this.g.rateMaxDps * DEG
    return [0, 1, 2].map((i) => {
      const e = i === 2 ? wrap(attSp[i] - att[i]) : attSp[i] - att[i]
      const wSp = clamp(this.g.angleP[i] * e, -rmax, rmax)
      return this.rate[i].update(wSp, rate[i], dt)
    }) as V3
  }
}

// ---------------------------------------------------------------- senaryo 1: askıda kalma ve itki/ağırlık (açık döngü gaz)

export interface HoverParams { massKg: number; motors: number; maxThrustG: number; thrustModel: number }
/** Gaz (0..1) → motor başına itki (N): PX4 THR_MDL_FAC modeli. */
export const motorThrustN = (h: HoverParams, throttle: number) => h.maxThrustG / 1000 * G * relThrust(clamp(throttle, 0, 1), h.thrustModel)

/** Hover senaryosu için quad parametreleri: n motorun toplam itkisi dört sanal motora eşit bölünür (yalnız ortak gaz). */
export function hoverQuad(h: HoverParams): QuadParams {
  return { ...QUAD_DEFAULTS, massKg: h.massKg, maxThrustN: h.maxThrustG / 1000 * G * h.motors / 4, thrustModel: h.thrustModel }
}

/**
 * Bağlama ipli itki testi: gaz → itki → dikey hareket. İp uzunluğunda drone tutulur (h ≤ tether). Durumu yerinde değiştirir.
 */
export function hoverStep(s: QuadState, h: HoverParams, throttle: number, dt: number, tether = 4): QuadState {
  const q = hoverQuad(h)
  const rel = relThrust(clamp(throttle, 0, 1), h.thrustModel)
  quadStep(s, q, [rel, rel, rel, rel], dt)
  if (altitude(s) > tether) { s.pos[2] = -tether; if (s.vel[2] < 0) s.vel[2] = 0 }
  return s
}

// ---------------------------------------------------------------- senaryo 2: karıştırıcı test düzeneği (yaylı gimbal)

export const MIX_RIG = { free: [true, true, true] as [boolean, boolean, boolean], spring: [0.9, 0.9, 0] as V3, damp: [0.08, 0.08, 0.03] as V3 }

/** Karıştırıcı komutu → motorlar → torklar → yaylı gimbal üzerinde açı. Sonuç: motor çıkışları, torklar, açılar. */
export function mixerRigStep(s: QuadState, p: QuadParams, c: MixCmd, airmode: boolean, dt: number) {
  const mix = mixQuadX(c, airmode)
  quadStep(s, p, mix.motors, dt, { rig: MIX_RIG })
  return { mix, torque: bodyTorques(p, s.thrust) }
}

// ---------------------------------------------------------------- senaryo 3: irtifa PID (3B gövdeyle 1B simdeki ile aynı denetim)

export interface Alt3dResult { t: number[]; h: number[]; sp: number[]; thrust: number[]; motors: number[][]; att: V3[]; metrics: StepMetrics }

/**
 * simulateAltitude ile aynı PID ve ileri besleme; tek fark itki dört motorlu 3B gövdeden, karıştırıcıdan geçer ve yönelim
 * denetleyicisi gövdeyi düz tutar. Bozucu yoksa irtifa eğrisi 1B simle (yuvarlama hatası içinde) aynıdır.
 * tilt: yatıkken dikey itki cos φ·cos θ ile düşer; denetleyici ileri beslemeyi buna göre büyütür.
 */
export function simulateAltitude3d(a: AltParams, o: { attDisturb?: (t: number) => V3; record?: number } = {}): Alt3dResult {
  const p: QuadParams = { ...QUAD_DEFAULTS, massKg: a.massKg, payloadKg: a.payloadKg, maxThrustN: a.maxThrustN / 4, motorTau: a.motorTau, drag: a.drag }
  const ff = a.massKg * G
  const pid = new Pid({ kp: a.kp, ki: a.ki, kd: a.kd }, { outMin: -ff, outMax: a.maxThrustN - ff, dCutoffHz: a.dCutoffHz })
  const att = new AttitudeCtrl()
  const s = quadInit(p, { hoverThrust: true })
  const N = Math.round(a.duration / a.dt), every = o.record ?? 1
  const out: Alt3dResult = { t: [], h: [], sp: [], thrust: [], motors: [], att: [], metrics: null as unknown as StepMetrics }
  for (let k = 0; k <= N; k++) {
    const tk = k * a.dt, sp = tk >= a.stepAt ? a.step : 0
    const tilt = Math.cos(s.att[0]) * Math.cos(s.att[1])
    const Tcmd = (ff + pid.update(sp, altitude(s), a.dt)) / Math.max(0.5, tilt)
    const tau = att.update([0, 0, 0], s.att, s.rate, a.dt)
    const mix = mixQuadX(torqueToMix(p, Tcmd, tau))
    quadStep(s, p, mix.motors, a.dt, { torque: o.attDisturb?.(tk) })
    if (k % every === 0) {
      out.t.push(tk); out.h.push(altitude(s)); out.sp.push(sp)
      out.thrust.push(s.thrust[0] + s.thrust[1] + s.thrust[2] + s.thrust[3]); out.motors.push([...s.cmd]); out.att.push([...s.att])
    }
  }
  out.metrics = stepMetrics(out.t, out.h, a.stepAt, 0, a.step)
  return out
}

// ---------------------------------------------------------------- senaryo 4: yönelim (roll) PID, tek eksenli test düzeneğinde

export interface Att3dResult { t: number[]; roll: number[]; sp: number[]; torque: number[]; motors: number[][]; metrics: StepMetrics }

/**
 * simulateRoll'un aynısı, ama tork komutu karıştırıcıdan dört motora gider ve tork motor itkilerinden geri hesaplanır
 * (gövde tek eksenli gimbalda: yalnız yuvarlanma serbest). Gürültü dizisi 1B simle aynı tohumdan, aynı sırayla çekilir;
 * doyum yoksa açı eğrisi 1B simle aynıdır. Bozucu tork (t ≥ 1,5 s) yandan gelen rüzgâr hamlesi olarak gösterilir.
 */
export function simulateAttitude3d(rp: RollParams, o: { record?: number } = {}): Att3dResult {
  const r = rng(rp.seed)
  const rmax = rp.rateMaxDps * DEG
  const p: QuadParams = { ...QUAD_DEFAULTS, inertia: [rp.inertia, rp.inertia, QUAD_DEFAULTS.inertia[2]], motorTau: rp.motorTau }
  const rate = new Pid({ kp: rp.rateP, ki: rp.rateI, kd: rp.rateD }, { outMin: -rp.torqueMax, outMax: rp.torqueMax, dCutoffHz: rp.dCutoffHz })
  const s = quadInit(p, { pos: [0, 0, -1.5], hoverThrust: true })
  const base = p.massKg * G
  const stepAt = 0.2, N = Math.round(rp.duration / rp.dt), every = o.record ?? 1
  const out: Att3dResult = { t: [], roll: [], sp: [], torque: [], motors: [], metrics: null as unknown as StepMetrics }
  for (let k = 0; k <= N; k++) {
    const tk = k * rp.dt, sp = tk >= stepAt ? rp.stepDeg * DEG : 0
    const gyro = s.rate[0] + rp.gyroNoiseDps * DEG * r.n()
    const angMeas = s.att[0] + 0.05 * DEG * r.n()
    const wSp = clamp(rp.angleP * (sp - angMeas), -rmax, rmax)
    const cmd = rate.update(wSp, gyro, rp.dt)
    const mix = mixQuadX(torqueToMix(p, base, [cmd, 0, 0]))
    const dist = tk >= 1.5 ? rp.disturbance : 0
    quadStep(s, p, mix.motors, rp.dt, { torque: [dist, 0, 0], rig: { free: [true, false, false] } })
    if (k % every === 0) { out.t.push(tk); out.roll.push(s.att[0] / DEG); out.sp.push(sp / DEG); out.torque.push(cmd); out.motors.push([...s.cmd]) }
  }
  out.metrics = stepMetrics(out.t, out.roll, stepAt, 0, rp.stepDeg, 0.05)
  return out
}

// ---------------------------------------------------------------- senaryo 5: 3B ara nokta görevi ve hassas iniş

export interface Mission3dParams extends MissionParams {
  /** Rüzgâr hamlesi σ, m/s (Gauss-Markov, τ = 3 s). */ gust: number
  /** Son 2 m'deki iniş hızı, m/s (PX4 MPC_LAND_SPEED). */ landSpeed: number
  /** Başlangıç noktası (x doğu, y kuzey), m. */ start: Vec
}
export const MISSION3D_DEFAULTS: Mission3dParams = { ...MISSION_DEFAULTS, gust: 0.6, landSpeed: 0.5, start: { x: 0, y: 0 } }

export interface Mission3dState {
  phase: 'takeoff' | 'route' | 'land' | 'done'
  wp: number
  q: QuadState
  /** Kontrolcünün kullandığı yatay konum kestirimi (x doğu, y kuzey). */ est: Vec
  gpsErr: Vec; gust: Vec; vi: Vec
  usingVision: boolean
  trail: Vec[]
  /** Pede uzaklık ve temas hızı (bitince). */ landingError: number | null; touchdownSpeed: number | null
  /** Hedef yönelim (görselleştirme için). */ attSp: V3
}

interface Mission3dCtl { att: AttitudeCtrl; vz: Pid }
const MCTL = new WeakMap<Mission3dState, Mission3dCtl>()
const P3 = (_m: Mission3dParams): QuadParams => ({ ...QUAD_DEFAULTS, rotDrag: 0.002 })
const GPS_TAU = 20, GUST_TAU = 3

export function mission3dInit(m: Mission3dParams): Mission3dState {
  const q = quadInit(P3(m), { pos: [m.start.y, m.start.x, 0] })
  const s: Mission3dState = { phase: 'takeoff', wp: 0, q, est: { ...m.start }, gpsErr: { x: 0, y: 0 }, gust: { x: 0, y: 0 }, vi: { x: 0, y: 0 }, usingVision: false, trail: [{ ...m.start }], landingError: null, touchdownSpeed: null, attSp: [0, 0, 0] }
  MCTL.set(s, { att: new AttitudeCtrl(), vz: new Pid({ kp: 4, ki: 1.5, kd: 0 }, { outMin: -8, outMax: 8 }) })
  return s
}

/** Yatay konum (x doğu, y kuzey). */
export const m3pos = (s: Mission3dState): Vec => ({ x: s.q.pos[1], y: s.q.pos[0] })

/**
 * Görevi dt kadar ilerletir. Dış döngü 2B görevle aynı: konum P → hız PI → ivme (azami eğimle sınırlı). İvme burada
 * doğrudan uygulanmaz: yatış/yunuslama hedefine çevrilir, yönelim denetleyicisi ve karıştırıcı dört motorla gerçekleştirir.
 * Dikey: irtifa hatası → dikey hız hedefi → hız PI → itki. Son 2 m'de iniş hızı landSpeed'e düşer.
 */
export function mission3dStep(s: Mission3dState, m: Mission3dParams, dt: number, r: ReturnType<typeof rng>): Mission3dState {
  if (s.phase === 'done') return s
  const ctl = MCTL.get(s)!
  const p = P3(m), q = s.q
  const pad = m.waypoints[m.waypoints.length - 1] ?? { x: 0, y: 0 }
  const pos = m3pos(s)

  // ölçümler: GPS hatası yavaş gezinir; pede 4 m yaklaşınca (iniş evresinde) ArUco kamerası devralır
  const qg = m.gpsSigma * Math.sqrt(2 * dt / GPS_TAU)
  s.gpsErr.x += -s.gpsErr.x / GPS_TAU * dt + qg * r.n()
  s.gpsErr.y += -s.gpsErr.y / GPS_TAU * dt + qg * r.n()
  const qw = m.gust * Math.sqrt(2 * dt / GUST_TAU)
  s.gust.x += -s.gust.x / GUST_TAU * dt + qw * r.n()
  s.gust.y += -s.gust.y / GUST_TAU * dt + qw * r.n()
  s.usingVision = m.landing === 'vision' && s.phase === 'land' && Math.hypot(pos.x - pad.x, pos.y - pad.y) < 4
  const vs = s.usingVision ? 0.05 : 0
  s.est = s.usingVision ? { x: pos.x + vs * r.n(), y: pos.y + vs * r.n() } : { x: pos.x + s.gpsErr.x, y: pos.y + s.gpsErr.y }

  const target = s.phase === 'takeoff' ? m.start : s.phase === 'route' ? m.waypoints[s.wp] : pad
  const vel = { x: q.vel[1], y: q.vel[0] }
  let vsx = m.posP * (target.x - s.est.x), vsy = m.posP * (target.y - s.est.y)
  const vn = Math.hypot(vsx, vsy), vmax = s.phase === 'route' ? m.cruise : Math.min(m.cruise, 2)
  if (vn > vmax) { vsx *= vmax / vn; vsy *= vmax / vn }
  const ex = vsx - vel.x, ey = vsy - vel.y
  let ax = m.velP * ex + s.vi.x, ay = m.velP * ey + s.vi.y
  const amax = G * Math.tan(m.maxTiltDeg * DEG), an = Math.hypot(ax, ay)
  if (an > amax) { ax *= amax / an; ay *= amax / an } else { s.vi.x += m.velI * ex * dt; s.vi.y += m.velI * ey * dt }
  if (q.onGround && s.phase === 'takeoff' && altitude(q) < 0.05) { ax = 0; ay = 0 }

  // burun hedefe döner (uzaktayken); ivme gövde eksenlerine çevrilip eğim hedefi olur
  const dist = Math.hypot(target.x - s.est.x, target.y - s.est.y)
  const yawSp = s.phase === 'route' && dist > 3 ? Math.atan2(target.x - s.est.x, target.y - s.est.y) : s.attSp[2]
  const ψ = q.att[2]
  const aN = ay, aE = ax
  const aF = aN * Math.cos(ψ) + aE * Math.sin(ψ), aR = -aN * Math.sin(ψ) + aE * Math.cos(ψ)
  const θsp = -Math.atan(aF / G), φsp = Math.atan(aR * Math.cos(θsp) / G)
  s.attSp = [φsp, θsp, yawSp]

  // dikey
  const h = altitude(q)
  let vzSp: number
  if (s.phase === 'takeoff') vzSp = Math.min(m.climbRate, 1.2 * (m.alt - h) + 0.3)
  else if (s.phase === 'route') vzSp = clamp(1.2 * (m.alt - h), -m.descentRate, m.climbRate)
  else vzSp = dist < 1 || s.usingVision && dist < 0.5 ? -(h > 2 ? m.descentRate : m.landSpeed) : clamp(1.2 * (m.alt - h), -m.descentRate, m.climbRate)
  const tilt = Math.max(0.5, Math.cos(q.att[0]) * Math.cos(q.att[1]))
  const Tcmd = (p.massKg * G + p.massKg * ctl.vz.update(vzSp, -q.vel[2], dt)) / tilt

  const tau = ctl.att.update(s.attSp, q.att, q.rate, dt)
  const mix = mixQuadX(torqueToMix(p, Tcmd, tau))
  const wind: V3 = [m.wind.y + s.gust.y, m.wind.x + s.gust.x, 0]
  const wasAir = !q.onGround
  quadStep(q, p, mix.motors, dt, { wind })

  const np = m3pos(s)
  const last = s.trail[s.trail.length - 1]
  if (Math.hypot(np.x - last.x, np.y - last.y) > 0.5) s.trail.push(np)

  if (s.phase === 'takeoff') { if (altitude(q) >= m.alt - 0.3) s.phase = m.waypoints.length > 1 ? 'route' : 'land' }
  else if (s.phase === 'route') {
    if (Math.hypot(target.x - s.est.x, target.y - s.est.y) < m.accept) { s.wp++; if (s.wp >= m.waypoints.length - 1) s.phase = 'land' }
  } else if (s.phase === 'land' && wasAir && q.onGround) {
    s.phase = 'done'
    s.touchdownSpeed = q.touchdownSpeed
    s.landingError = Math.hypot(np.x - pad.x, np.y - pad.y)
    q.thrust = [0, 0, 0, 0]; q.cmd = [0, 0, 0, 0]
  }
  return s
}

export interface Mission3dRun { state: Mission3dState; time: number; reached: number }
export function simulateMission3d(m: Mission3dParams, dt = 0.004, maxT = 300): Mission3dRun {
  const r = rng(m.seed), s = mission3dInit(m)
  while (s.phase !== 'done' && s.q.t < maxT) mission3dStep(s, m, dt, r)
  return { state: s, time: s.q.t, reached: Math.min(s.wp, m.waypoints.length - 1) }
}
