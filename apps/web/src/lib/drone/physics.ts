// Drone dersi simülasyonlarının saf matematiği: DOM yok, aynı girdi → aynı çıktı (gürültü tohumlu).
// Birimler SI: m, s, kg, N, N·m, rad (arayüzde derece gösterilir). Pervane çapı inç, batarya mAh, itki gram-kuvvet (gf) girilir.

export const G = 9.81
/** Deniz seviyesi standart hava yoğunluğu, kg/m³. */
export const RHO = 1.225
export const INCH = 0.0254
export const DEG = Math.PI / 180
/** LiPo hücre anma gerilimi, V. */
export const CELL_V = 3.7

export const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x))

/** Tohumlu sözde rastgele sayı (mulberry32) ve Box-Muller ile standart normal. Aynı tohum → aynı dizi. */
export function rng(seed: number) {
  let a = seed >>> 0
  const u = () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const n = () => { let x = 0; while (!x) x = u(); return Math.sqrt(-2 * Math.log(x)) * Math.cos(2 * Math.PI * u()) }
  return { u, n }
}

// ---------------------------------------------------------------- itki / ağırlık ve askıda kalma gazı

/**
 * Gaz (0..1) → bağıl itki (0..1). PX4'ün THR_MDL_FAC modeli: f = 0 doğrusal, f = 1 karesel (T ∝ ω², ω ∝ gaz).
 * Gerçek ESC + motor çoğu zaman ikisinin arasındadır.
 */
export const relThrust = (u: number, f: number) => (1 - f) * u + f * u * u

/** Bağıl itki r'yi veren gaz: f·u² + (1−f)·u − r = 0 denkleminin pozitif kökü. */
export function throttleFor(r: number, f: number): number {
  const rr = clamp(r, 0, 1)
  if (f < 1e-9) return rr
  return (-(1 - f) + Math.sqrt((1 - f) ** 2 + 4 * f * rr)) / (2 * f)
}

export interface TwrInput { massKg: number; motors: number; /** Motor başına azami itki, gf (itki tablosundan). */ maxThrustG: number; /** THR_MDL_FAC, 0..1. */ thrustModel: number }
export interface TwrResult { weightN: number; maxThrustN: number; ratio: number; hoverPerMotorG: number; hoverThrottle: number; /** Tam gazda net dikey ivme, m/s². */ climbAccel: number; canHover: boolean }

export function thrustToWeight(i: TwrInput): TwrResult {
  const weightN = i.massKg * G
  const maxThrustN = i.motors * i.maxThrustG / 1000 * G
  const ratio = maxThrustN / weightN
  const canHover = ratio > 1
  return {
    weightN, maxThrustN, ratio, canHover,
    hoverPerMotorG: i.massKg * 1000 / i.motors,
    hoverThrottle: canHover ? throttleFor(1 / ratio, i.thrustModel) : 1,
    climbAccel: (ratio - 1) * G,
  }
}

// ---------------------------------------------------------------- uçuş süresi (momentum teorisi)

/** Pervane disk alanı, m². */
export const diskArea = (propInch: number) => Math.PI * (propInch * INCH / 2) ** 2

/** İdeal (momentum teorisi) güç: P = T^1.5 / √(2ρA), W. T tek pervanenin itkisi, N. */
export const idealPower = (thrustN: number, propInch: number) => thrustN ** 1.5 / Math.sqrt(2 * RHO * diskArea(propInch))

/**
 * Askıda kalma için bataryadan çekilen elektrik gücü, W.
 * fm: pervanenin başarım katsayısı (figure of merit, 0,5–0,75); drive: motor × ESC verimi (0,7–0,9).
 */
export function hoverPower(totalKg: number, motors: number, propInch: number, fm: number, drive: number): number {
  return motors * idealPower(totalKg * G / motors, propInch) / (fm * drive)
}

/** LiPo kütlesi, kg. whPerKg: paket özgül enerjisi (yüksek C'li drone paketlerinde ≈ 120–150 Wh/kg). */
export const batteryMass = (cells: number, mAh: number, whPerKg: number) => cells * CELL_V * mAh / 1000 / whPerKg

export interface FlightInput {
  /** Batarya hariç kütle, kg. */ dryKg: number
  cells: number; mAh: number; cRating: number
  propInch: number; motors: number
  fm: number; drive: number
  /** Uçuş kontrolcüsü, alıcı, VTX vb. sabit akım, A. */ avionicsA: number
  /** Kullanılabilir kapasite oranı (LiPo'yu %20 yedekle bitir: 0,8). */ usable: number
  whPerKg: number
  /** Motor başına azami itki, gf (tepe akım kontrolü için). */ maxThrustG: number
}
export interface FlightResult { batteryKg: number; totalKg: number; voltage: number; hoverW: number; hoverA: number; minutes: number; energyWh: number; peakA: number; batteryMaxA: number; peakOk: boolean }

export function flightTime(i: FlightInput): FlightResult {
  const batteryKg = batteryMass(i.cells, i.mAh, i.whPerKg)
  const totalKg = i.dryKg + batteryKg
  const voltage = i.cells * CELL_V
  const hoverW = hoverPower(totalKg, i.motors, i.propInch, i.fm, i.drive)
  const hoverA = hoverW / voltage + i.avionicsA
  const ah = i.mAh / 1000
  const minutes = i.usable * ah / hoverA * 60
  // Tam gazda: her motor azami itkisinde (aynı momentum modeli, kaba üst sınır)
  const peakW = i.motors * idealPower(i.maxThrustG / 1000 * G, i.propInch) / (i.fm * i.drive)
  const peakA = peakW / voltage + i.avionicsA
  const batteryMaxA = i.cRating * ah
  return { batteryKg, totalKg, voltage, hoverW, hoverA, minutes, energyWh: voltage * ah, peakA, batteryMaxA, peakOk: peakA <= batteryMaxA }
}

// ---------------------------------------------------------------- PID

export interface PidGains { kp: number; ki: number; kd: number }
export interface PidLimits { outMin: number; outMax: number; /** Türev terimi alçak geçiren süzgeç kesimi, Hz (0: süzgeç yok). */ dCutoffHz?: number }

/**
 * Paralel PID: u = ff + Kp·e + ∫Ki·e dt − Kd·d(ölçüm)/dt.
 * Türev ölçümden alınır (hedef sıçradığında "türev tekmesi" olmaz) ve birinci derece süzgeçten geçer.
 * Çıkış doymuşken integral, doymayı artıracak yönde büyütülmez (koşullu integrasyon, anti-windup).
 */
export class Pid {
  integral = 0
  private prev: number | null = null
  private d = 0
  constructor(public g: PidGains, public lim: PidLimits) {}
  reset() { this.integral = 0; this.prev = null; this.d = 0 }
  update(sp: number, meas: number, dt: number, ff = 0): number {
    const e = sp - meas
    const raw = this.prev === null ? 0 : -(meas - this.prev) / dt
    this.prev = meas
    const fc = this.lim.dCutoffHz ?? 0
    const a = fc > 0 ? dt / (dt + 1 / (2 * Math.PI * fc)) : 1
    this.d += a * (raw - this.d)
    const iNew = this.integral + this.g.ki * e * dt
    const u = ff + this.g.kp * e + iNew + this.g.kd * this.d
    const us = clamp(u, this.lim.outMin, this.lim.outMax)
    // Doymamışsa ya da integral doymayı azaltıyorsa kabul et
    if (u === us || (u > us && e < 0) || (u < us && e > 0)) this.integral = iNew
    return us
  }
}

// ---------------------------------------------------------------- basamak yanıtı ölçütleri

export interface StepMetrics { overshootPct: number; riseTime: number; settlingTime: number; steadyError: number }

/**
 * t0 anında y0 → y1 basamağına yanıtın ölçütleri. Yükselme süresi %10 → %90; oturma süresi ±band
 * bandına son kez girildiği an (hiç oturmazsa Infinity); kalıcı hata son %10'luk dilimin ortalamasından.
 */
export function stepMetrics(t: number[], y: number[], t0: number, y0: number, y1: number, band = 0.02): StepMetrics {
  const span = y1 - y0
  let peak = 0, t10 = NaN, t90 = NaN, lastOut = t0
  for (let k = 0; k < t.length; k++) {
    if (t[k] < t0) continue
    const f = (y[k] - y0) / span
    if (f > peak) peak = f
    if (Number.isNaN(t10) && f >= 0.1) t10 = t[k]
    if (Number.isNaN(t90) && f >= 0.9) t90 = t[k]
    if (Math.abs(y[k] - y1) > band * Math.abs(span)) lastOut = t[k]
  }
  const n = t.length, tail = y.slice(Math.floor(n * 0.9))
  const mean = tail.reduce((a, b) => a + b, 0) / tail.length
  const settled = Math.abs(y[n - 1] - y1) <= band * Math.abs(span)
  return {
    overshootPct: Math.max(0, (peak - 1) * 100),
    riseTime: t90 - t10,
    settlingTime: settled ? lastOut - t0 : Infinity,
    steadyError: y1 - mean,
  }
}

// ---------------------------------------------------------------- 1B irtifa tutma

export interface AltParams extends PidGains {
  /** Uçuş kontrolcüsünün bildiği kütle (ileri besleme m·g bundan), kg. */ massKg: number
  /** Kontrolcünün bilmediği ek yük, kg (I terimi olmadan kalıcı hata üretir). */ payloadKg: number
  /** Toplam azami itki, N. */ maxThrustN: number
  /** Motor + pervane zaman sabiti, s. */ motorTau: number
  /** Doğrusal sürükleme, N/(m/s). */ drag: number
  /** Hedef irtifa basamağı, m (t = stepAt'te 0 → step). */ step: number
  stepAt: number; duration: number; dt: number; dCutoffHz: number
}
export const ALT_DEFAULTS: AltParams = { kp: 6, ki: 0, kd: 3, massKg: 1.2, payloadKg: 0, maxThrustN: 2 * 1.2 * G, motorTau: 0.05, drag: 0.3, step: 2, stepAt: 0.5, duration: 10, dt: 0.002, dCutoffHz: 20 }

export interface AltResult { t: number[]; z: number[]; sp: number[]; thrust: number[]; metrics: StepMetrics; saturatedPct: number }

export function simulateAltitude(p: AltParams): AltResult {
  const ff = p.massKg * G, m = p.massKg + p.payloadKg
  const pid = new Pid({ kp: p.kp, ki: p.ki, kd: p.kd }, { outMin: -ff, outMax: p.maxThrustN - ff, dCutoffHz: p.dCutoffHz })
  let z = 0, v = 0, T = ff, sat = 0
  const t: number[] = [], zs: number[] = [], sps: number[] = [], th: number[] = []
  const N = Math.round(p.duration / p.dt)
  for (let k = 0; k <= N; k++) {
    const tk = k * p.dt, sp = tk >= p.stepAt ? p.step : 0
    const cmd = ff + pid.update(sp, z, p.dt)
    if (cmd <= 1e-9 || cmd >= p.maxThrustN - 1e-9) sat++
    T += (cmd - T) * p.dt / p.motorTau
    const a = (T - m * G - p.drag * v) / m
    v += a * p.dt; z += v * p.dt
    // yer: aşağı inemez
    if (z < 0) { z = 0; if (v < 0) v = 0 }
    t.push(tk); zs.push(z); sps.push(sp); th.push(T)
  }
  return { t, z: zs, sp: sps, thrust: th, metrics: stepMetrics(t, zs, p.stepAt, 0, p.step), saturatedPct: sat / (N + 1) * 100 }
}

// ---------------------------------------------------------------- yuvarlanma (roll) yönelimi: kaskad P → hız PID

export interface RollParams {
  /** Açı döngüsü P, 1/s (PX4 MC_ROLL_P gibi: açı hatası → hız hedefi). */ angleP: number
  /** Hız döngüsü kazançları, N·m/(rad/s), N·m/rad, N·m·s/(rad/s). */ rateP: number; rateI: number; rateD: number
  /** Eylemsizlik, kg·m². */ inertia: number
  motorTau: number; torqueMax: number
  /** Jiroskop gürültüsü σ, °/s. */ gyroNoiseDps: number
  dCutoffHz: number
  /** Hedef açı basamağı, °. */ stepDeg: number
  /** t ≥ 1,5 s'de etkiyen bozucu tork (ağırlık merkezi kayması), N·m. */ disturbance: number
  rateMaxDps: number; duration: number; dt: number; seed: number
}
export const ROLL_DEFAULTS: RollParams = { angleP: 6, rateP: 0.15, rateI: 0.2, rateD: 0.003, inertia: 0.01, motorTau: 0.03, torqueMax: 0.6, gyroNoiseDps: 1, dCutoffHz: 30, stepDeg: 20, disturbance: 0, rateMaxDps: 220, duration: 3, dt: 0.001, seed: 7 }
export interface RollResult { t: number[]; angle: number[]; sp: number[]; torque: number[]; metrics: StepMetrics; /** Oturduktan sonra tork komutundaki gürültü (std), N·m: motor ısınması ve titreşim göstergesi. */ torqueNoise: number }

export function simulateRoll(p: RollParams): RollResult {
  const r = rng(p.seed)
  const rmax = p.rateMaxDps * DEG
  const rate = new Pid({ kp: p.rateP, ki: p.rateI, kd: p.rateD }, { outMin: -p.torqueMax, outMax: p.torqueMax, dCutoffHz: p.dCutoffHz })
  let th = 0, w = 0, tau = 0
  const t: number[] = [], ang: number[] = [], sps: number[] = [], tq: number[] = []
  const stepAt = 0.2, N = Math.round(p.duration / p.dt)
  for (let k = 0; k <= N; k++) {
    const tk = k * p.dt, sp = tk >= stepAt ? p.stepDeg * DEG : 0
    const gyro = w + p.gyroNoiseDps * DEG * r.n()
    const angMeas = th + 0.05 * DEG * r.n()   // durum kestiriminin küçük hatası
    const wSp = clamp(p.angleP * (sp - angMeas), -rmax, rmax)
    const cmd = rate.update(wSp, gyro, p.dt)
    tau += (cmd - tau) * p.dt / p.motorTau
    const dist = tk >= 1.5 ? p.disturbance : 0
    w += (tau + dist) / p.inertia * p.dt
    th += w * p.dt
    t.push(tk); ang.push(th / DEG); sps.push(sp / DEG); tq.push(cmd)
  }
  const tail = tq.slice(Math.floor(tq.length * 0.7))
  const mu = tail.reduce((a, b) => a + b, 0) / tail.length
  const torqueNoise = Math.sqrt(tail.reduce((a, b) => a + (b - mu) ** 2, 0) / tail.length)
  return { t, angle: ang, sp: sps, torque: tq, metrics: stepMetrics(t, ang, stepAt, 0, p.stepDeg, 0.05), torqueNoise }
}

// ---------------------------------------------------------------- quad X motor karıştırıcı

/** PX4 Quad X numaralandırması: M1 sağ ön (CCW), M2 sol arka (CCW), M3 sol ön (CW), M4 sağ arka (CW). */
export const QUAD_X = [
  { id: 'M1', x: 1, y: -1, spin: 'ccw', roll: -1, pitch: 1, yaw: 1 },
  { id: 'M2', x: -1, y: 1, spin: 'ccw', roll: 1, pitch: -1, yaw: 1 },
  { id: 'M3', x: 1, y: 1, spin: 'cw', roll: 1, pitch: 1, yaw: -1 },
  { id: 'M4', x: -1, y: -1, spin: 'cw', roll: -1, pitch: -1, yaw: -1 },
] as const
// x: ileri (+ burun), y: sol (+). roll > 0 sağa yatış, pitch > 0 burun yukarı, yaw > 0 yukarıdan saat yönü.

export interface MixCmd { thrust: number; roll: number; pitch: number; yaw: number }
export interface MixResult { motors: number[]; /** Yuvarlanma/yunuslama ölçeklenmek zorunda kaldı. */ rpScaled: boolean; /** Uygulanan sapma oranı (1: tamamı). */ yawScale: number; /** Gaz kaydırması (+ yukarı). */ thrustShift: number }

/**
 * Komutları dört motora dağıtır (çıkış 0..1). Öncelik: yuvarlanma/yunuslama > gaz > sapma (PX4'ün yaklaşımı).
 * airmode açıksa sıfır gazda bile gaz yukarı kaydırılarak denetim korunur.
 */
export function mixQuadX(c: MixCmd, airmode = true): MixResult {
  let rp = QUAD_X.map((m) => m.roll * c.roll + m.pitch * c.pitch)
  let rpScaled = false
  const spread = Math.max(...rp) - Math.min(...rp)
  if (spread > 1) { rp = rp.map((v) => v / spread); rpScaled = true }
  let T = clamp(c.thrust, 0, 1)
  const hi = T + Math.max(...rp), lo = T + Math.min(...rp)
  if (hi > 1) T -= hi - 1
  else if (lo < 0 && airmode) T += -lo
  const thrustShift = T - clamp(c.thrust, 0, 1)
  // sapmaya kalan pay: her motor için s·yaw_i ∈ [−base_i, 1−base_i]
  const base = rp.map((v) => T + v)
  let yawScale = 1
  QUAD_X.forEach((m, i) => {
    const y = m.yaw * c.yaw
    if (y > 0) yawScale = Math.min(yawScale, Math.max(0, (1 - base[i]) / y))
    else if (y < 0) yawScale = Math.min(yawScale, Math.max(0, base[i] / -y))
  })
  const motors = QUAD_X.map((m, i) => clamp(base[i] + yawScale * m.yaw * c.yaw, 0, 1))
  return { motors, rpScaled, yawScale, thrustShift }
}

// ---------------------------------------------------------------- tamamlayıcı süzgeç (jiroskop + ivmeölçer)

/** Tek adım: θ ← α(θ + ω·dt) + (1−α)·θ_acc, α = τ/(τ + dt). τ: süzgeç zaman sabiti, s. */
export function complementary(angle: number, gyroRate: number, accAngle: number, dt: number, tau: number): number {
  const a = tau / (tau + dt)
  return a * (angle + gyroRate * dt) + (1 - a) * accAngle
}

/** İvmeölçerden yuvarlanma açısı (yalnız yerçekimi ölçülüyorsa doğru), rad. ay, az: m/s². */
export const accelRoll = (ay: number, az: number) => Math.atan2(ay, az)

export interface FusionParams {
  tau: number
  gyroBiasDps: number; gyroNoiseDps: number
  /** İvmeölçer açısındaki gürültü σ, ° (titreşim + doğrusal ivme). */ accNoiseDeg: number
  /** Hareket profili: 'still' sabit 0°, 'manoeuvre' yatış manevraları. */ profile: 'still' | 'manoeuvre'
  duration: number; dt: number; seed: number
}
export const FUSION_DEFAULTS: FusionParams = { tau: 0.5, gyroBiasDps: 2, gyroNoiseDps: 0.5, accNoiseDeg: 4, profile: 'manoeuvre', duration: 20, dt: 0.004, seed: 3 }
export interface FusionResult { t: number[]; truth: number[]; gyro: number[]; acc: number[]; fused: number[]; rmse: { gyro: number; acc: number; fused: number } }

/** Gerçek yatış açısı profili, rad. */
export function rollProfile(t: number, profile: FusionParams['profile']): number {
  if (profile === 'still') return 0
  // yumuşak basamaklar + yavaş salınım: 0 → 25° → −15° → 0
  const sm = (x: number) => 0.5 - 0.5 * Math.cos(Math.PI * clamp(x, 0, 1))
  return (25 * sm(t - 2) - 40 * sm((t - 8) / 1.5) + 15 * sm((t - 14) / 2) + 5 * Math.sin(0.9 * t)) * DEG
}

export function simulateFusion(p: FusionParams): FusionResult {
  const r = rng(p.seed)
  const N = Math.round(p.duration / p.dt)
  const out: FusionResult = { t: [], truth: [], gyro: [], acc: [], fused: [], rmse: { gyro: 0, acc: 0, fused: 0 } }
  let g = 0, f = 0, prev = rollProfile(0, p.profile)
  for (let k = 0; k <= N; k++) {
    const tk = k * p.dt, th = rollProfile(tk, p.profile)
    const w = k === 0 ? 0 : (th - prev) / p.dt
    prev = th
    const gyroMeas = w + (p.gyroBiasDps + p.gyroNoiseDps * r.n()) * DEG
    const accMeas = th + p.accNoiseDeg * DEG * r.n()
    if (k === 0) { g = accMeas; f = accMeas } else { g += gyroMeas * p.dt; f = complementary(f, gyroMeas, accMeas, p.dt, p.tau) }
    out.t.push(tk); out.truth.push(th / DEG); out.gyro.push(g / DEG); out.acc.push(accMeas / DEG); out.fused.push(f / DEG)
  }
  const rm = (a: number[]) => Math.sqrt(a.reduce((s, v, i) => s + (v - out.truth[i]) ** 2, 0) / a.length)
  out.rmse = { gyro: rm(out.gyro), acc: rm(out.acc), fused: rm(out.fused) }
  return out
}

// ---------------------------------------------------------------- 2B ara nokta görevi (GPS benzeri)

export interface Vec { x: number; y: number }
export interface MissionParams {
  /** Ara noktalar, m (ev noktasına göre, x doğu, y kuzey). Sonuncusu iniş pedidir. */ waypoints: Vec[]
  cruise: number; posP: number; velP: number; velI: number; maxTiltDeg: number
  /** Rüzgâr, m/s. */ wind: Vec
  /** Hava sürüklemesi, 1/s (havaya göre hız farkıyla orantılı ivme). */ drag: number
  /** GPS konum hatası σ, m (Gauss-Markov, τ = 20 s: yavaş gezinen hata). */ gpsSigma: number
  /** Ara noktaya varış yarıçapı, m. */ accept: number
  alt: number; climbRate: number; descentRate: number
  /** İnişte konum kaynağı: GPS ya da pede 4 m yaklaşınca ArUco kamerası (σ 5 cm). */ landing: 'gps' | 'vision'
  seed: number
}
export const MISSION_DEFAULTS: MissionParams = {
  waypoints: [{ x: 30, y: 10 }, { x: 40, y: 45 }, { x: 5, y: 50 }, { x: -20, y: 20 }],
  cruise: 6, posP: 0.9, velP: 1.8, velI: 0.3, maxTiltDeg: 25, wind: { x: 0, y: 0 }, drag: 0.35,
  gpsSigma: 1.5, accept: 1, alt: 10, climbRate: 2, descentRate: 1, landing: 'vision', seed: 11,
}
export type MissionPhase = 'takeoff' | 'route' | 'land' | 'done'
export interface MissionState {
  t: number; phase: MissionPhase; wp: number
  pos: Vec; vel: Vec; z: number
  /** Kontrolcünün kullandığı konum kestirimi. */ est: Vec
  gpsErr: Vec; vi: Vec
  usingVision: boolean
  trail: Vec[]
  /** İniş bitince pede uzaklık, m. */ landingError: number | null
}

export function missionInit(p: MissionParams): MissionState {
  return { t: 0, phase: 'takeoff', wp: 0, pos: { x: 0, y: 0 }, vel: { x: 0, y: 0 }, z: 0, est: { x: 0, y: 0 }, gpsErr: { x: 0, y: 0 }, vi: { x: 0, y: 0 }, usingVision: false, trail: [], landingError: null }
}

const GPS_TAU = 20

/** Görevi dt kadar ilerletir (durumu yerinde değiştirir). r: missionInit'le aynı tohumdan rng. */
export function missionStep(s: MissionState, p: MissionParams, dt: number, r: ReturnType<typeof rng>): MissionState {
  if (s.phase === 'done') return s
  const pad = p.waypoints[p.waypoints.length - 1] ?? { x: 0, y: 0 }
  // GPS hatası: birinci derece Gauss-Markov (gerçek GPS hatası beyaz gürültü değildir, yavaş gezinir)
  const q = p.gpsSigma * Math.sqrt(2 * dt / GPS_TAU)
  s.gpsErr.x += -s.gpsErr.x / GPS_TAU * dt + q * r.n()
  s.gpsErr.y += -s.gpsErr.y / GPS_TAU * dt + q * r.n()
  s.usingVision = p.landing === 'vision' && s.phase === 'land' && Math.hypot(s.pos.x - pad.x, s.pos.y - pad.y) < 4
  const vs = s.usingVision ? 0.05 : 0
  s.est = s.usingVision
    ? { x: s.pos.x + vs * r.n(), y: s.pos.y + vs * r.n() }
    : { x: s.pos.x + s.gpsErr.x, y: s.pos.y + s.gpsErr.y }

  // hedef
  let target: Vec
  if (s.phase === 'takeoff') target = { x: 0, y: 0 }
  else if (s.phase === 'route') target = p.waypoints[s.wp]
  else target = pad

  // konum P → hız hedefi (seyir hızıyla sınırlı) → hız PI → ivme (azami eğimle sınırlı)
  let vsx = p.posP * (target.x - s.est.x), vsy = p.posP * (target.y - s.est.y)
  const vn = Math.hypot(vsx, vsy), vmax = s.phase === 'route' ? p.cruise : Math.min(p.cruise, 2)
  if (vn > vmax) { vsx *= vmax / vn; vsy *= vmax / vn }
  const ex = vsx - s.vel.x, ey = vsy - s.vel.y
  let ax = p.velP * ex + s.vi.x, ay = p.velP * ey + s.vi.y
  const amax = G * Math.tan(p.maxTiltDeg * DEG), an = Math.hypot(ax, ay)
  if (an > amax) { ax *= amax / an; ay *= amax / an }
  else { s.vi.x += p.velI * ex * dt; s.vi.y += p.velI * ey * dt }   // doymuşken integral durur

  // dinamik: komut ivmesi + havaya göre sürükleme
  s.vel.x += (ax + p.drag * (p.wind.x - s.vel.x)) * dt
  s.vel.y += (ay + p.drag * (p.wind.y - s.vel.y)) * dt
  s.pos.x += s.vel.x * dt; s.pos.y += s.vel.y * dt

  if (s.phase === 'takeoff') {
    s.z = Math.min(p.alt, s.z + p.climbRate * dt)
    if (s.z >= p.alt) s.phase = p.waypoints.length > 1 ? 'route' : 'land'
  } else if (s.phase === 'route') {
    // varış kontrolü kestirime göre yapılır (uçuş kontrolcüsü gerçek konumu bilmez)
    if (Math.hypot(target.x - s.est.x, target.y - s.est.y) < p.accept) {
      s.wp++
      if (s.wp >= p.waypoints.length - 1) s.phase = 'land'
    }
  } else if (s.phase === 'land') {
    // pedin üstüne (kestirime göre) 1 m yaklaşınca alçal
    if (Math.hypot(pad.x - s.est.x, pad.y - s.est.y) < 1) s.z = Math.max(0, s.z - p.descentRate * dt)
    if (s.z <= 0) { s.phase = 'done'; s.vel = { x: 0, y: 0 }; s.landingError = Math.hypot(s.pos.x - pad.x, s.pos.y - pad.y) }
  }
  s.t += dt
  return s
}

export interface MissionRun { state: MissionState; reached: number; maxTime: number; path: Vec[] }
/** Görevi bitene kadar (en çok maxT saniye) çalıştırır. */
export function simulateMission(p: MissionParams, dt = 0.02, maxT = 300): MissionRun {
  const r = rng(p.seed), s = missionInit(p), path: Vec[] = []
  let k = 0
  while (s.phase !== 'done' && s.t < maxT) {
    missionStep(s, p, dt, r)
    if (k++ % 10 === 0) path.push({ ...s.pos })
  }
  return { state: s, reached: Math.min(s.wp, p.waypoints.length - 1), maxTime: maxT, path }
}
