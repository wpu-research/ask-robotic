// İnsansı robot (ileri seviye): ileri kinematik, iki bağlı ters kinematik, ağırlık merkezi, destek çokgeni, statik denge ve
// doğrusal ters sarkaç (LIPM) tabanlı yürüyüş üreteci. Saf TypeScript; Node'da başsız çalışır.
// Eksenler: x ileri, y sola, z yukarı (m). Açılar dışarıya derece, içeride radyan.
// Bacak: kalça yunuslama (+ bacak öne), kalça yuvarlanma (+ bacak dışa, sol için +y), diz (+ büküm, baldır geriye),
// bilek yunuslama (+ parmak yukarı), bilek yuvarlanma. Kol: omuz yunuslama (+ kol öne), omuz yuvarlanma (+ dışa), dirsek (+ büküm).

export const DEG = 180 / Math.PI
export const RAD = Math.PI / 180

/** Gövde ölçüleri (m) ve kütleleri (kg). Küçük bir eğitim insansısı (yaklaşık 60 cm boy, 3,5 kg). */
export const BODY = {
  hipHalf: 0.055,      // kalça eklemi, pelvis merkezinden yana
  thigh: 0.16,         // L1: kalça → diz
  shank: 0.16,         // L2: diz → bilek
  ankleH: 0.035,       // bilek → taban
  footBack: 0.035,     // bilekten topuğa
  footFront: 0.085,    // bilekten parmak ucuna
  footHalfW: 0.035,
  torso: 0.18,         // pelvis → omuz hattı
  shoulderHalf: 0.09,
  upperArm: 0.11,
  forearm: 0.11,
  head: 0.07,
  mass: { pelvis: 0.45, torso: 1.1, head: 0.3, thigh: 0.3, shank: 0.22, foot: 0.12, upperArm: 0.12, forearm: 0.1 },
}
export const L1 = BODY.thigh
export const L2 = BODY.shank

export type Side = 'L' | 'R'
export type JointId =
  | 'hipPitchL' | 'hipRollL' | 'kneeL' | 'anklePitchL' | 'ankleRollL'
  | 'hipPitchR' | 'hipRollR' | 'kneeR' | 'anklePitchR' | 'ankleRollR'
  | 'shoulderPitchL' | 'shoulderRollL' | 'elbowL'
  | 'shoulderPitchR' | 'shoulderRollR' | 'elbowR'
export type Joints = Record<JointId, number>

export const JOINT_IDS: JointId[] = [
  'hipPitchL', 'hipRollL', 'kneeL', 'anklePitchL', 'ankleRollL', 'hipPitchR', 'hipRollR', 'kneeR', 'anklePitchR', 'ankleRollR',
  'shoulderPitchL', 'shoulderRollL', 'elbowL', 'shoulderPitchR', 'shoulderRollR', 'elbowR',
]

/** Servo sınırları (derece) ve görünen adlar. */
export const SERVO: Record<JointId, { min: number; max: number; tr: string; en: string }> = {
  hipPitchL: { min: -40, max: 100, tr: 'sol kalça (öne/arkaya)', en: 'left hip pitch' },
  hipRollL: { min: -25, max: 35, tr: 'sol kalça (yana)', en: 'left hip roll' },
  kneeL: { min: 0, max: 130, tr: 'sol diz', en: 'left knee' },
  anklePitchL: { min: -50, max: 75, tr: 'sol bilek (öne/arkaya)', en: 'left ankle pitch' },
  ankleRollL: { min: -35, max: 25, tr: 'sol bilek (yana)', en: 'left ankle roll' },
  hipPitchR: { min: -40, max: 100, tr: 'sağ kalça (öne/arkaya)', en: 'right hip pitch' },
  hipRollR: { min: -25, max: 35, tr: 'sağ kalça (yana)', en: 'right hip roll' },
  kneeR: { min: 0, max: 130, tr: 'sağ diz', en: 'right knee' },
  anklePitchR: { min: -50, max: 75, tr: 'sağ bilek (öne/arkaya)', en: 'right ankle pitch' },
  ankleRollR: { min: -35, max: 25, tr: 'sağ bilek (yana)', en: 'right ankle roll' },
  shoulderPitchL: { min: -60, max: 180, tr: 'sol omuz (öne)', en: 'left shoulder pitch' },
  shoulderRollL: { min: 0, max: 120, tr: 'sol omuz (yana)', en: 'left shoulder roll' },
  elbowL: { min: 0, max: 140, tr: 'sol dirsek', en: 'left elbow' },
  shoulderPitchR: { min: -60, max: 180, tr: 'sağ omuz (öne)', en: 'right shoulder pitch' },
  shoulderRollR: { min: 0, max: 120, tr: 'sağ omuz (yana)', en: 'right shoulder roll' },
  elbowR: { min: 0, max: 140, tr: 'sağ dirsek', en: 'right elbow' },
}

export const zeroJoints = (): Joints => Object.fromEntries(JOINT_IDS.map((j) => [j, 0])) as Joints

export type V3 = [number, number, number]
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
const mid = (a: V3, b: V3): V3 => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]
/** x ekseni etrafında döndürme (yuvarlanma). */
const rotX = (v: V3, a: number): V3 => [v[0], v[1] * Math.cos(a) - v[2] * Math.sin(a), v[1] * Math.sin(a) + v[2] * Math.cos(a)]

export interface LegFK { hip: V3; knee: V3; ankle: V3; /** taban merkezi ve tabanın dört köşesi (dünya) */ sole: V3; corners: V3[]; /** tabanın eğimi (rad): yunuslama, yuvarlanma */ pitch: number; roll: number }

/** Bacak ileri kinematiği: pelvis konumundan (gövde dik) eklem açılarına göre diz, bilek ve taban. */
export function legFK(pelvis: V3, side: Side, hipPitch: number, hipRoll: number, knee: number, anklePitch: number, ankleRoll: number): LegFK {
  const s = side === 'L' ? 1 : -1
  const hip = add(pelvis, [0, s * BODY.hipHalf, 0])
  const th = hipPitch * RAD, tk = knee * RAD, ta = anklePitch * RAD
  const roll = s * hipRoll * RAD // sol bacakta + dışa = +y, sağda + dışa = -y
  const kL: V3 = [L1 * Math.sin(th), 0, -L1 * Math.cos(th)]
  const sh = th - tk
  const aL: V3 = [kL[0] + L2 * Math.sin(sh), 0, kL[2] - L2 * Math.cos(sh)]
  const knee3 = add(hip, rotX(kL, roll))
  const ankle = add(hip, rotX(aL, roll))
  // taban: bilekten aşağıda; eğimi kalça + diz + bilek açılarının toplamı (düz ayak: 0)
  const footPitch = sh + ta
  const footRoll = roll + s * ankleRoll * RAD
  // bilekten tabana vektör: önce yunuslama (parmak yukarı = taban öne kayar), sonra yuvarlanma
  const sole = add(ankle, rotX([BODY.ankleH * Math.sin(footPitch), 0, -BODY.ankleH * Math.cos(footPitch)], footRoll))
  const corner = (fx: number, fy: number): V3 => {
    // tabanda (fx ileri, fy yana) noktası: önce yunuslama (y ekseni), sonra yuvarlanma (x ekseni)
    const p: V3 = [fx * Math.cos(footPitch), fy, fx * Math.sin(footPitch)]
    return add(sole, rotX(p, footRoll))
  }
  const corners = [corner(BODY.footFront, BODY.footHalfW), corner(BODY.footFront, -BODY.footHalfW), corner(-BODY.footBack, -BODY.footHalfW), corner(-BODY.footBack, BODY.footHalfW)]
  return { hip, knee: knee3, ankle, sole, corners, pitch: footPitch, roll: footRoll }
}

export interface ArmFK { shoulder: V3; elbow: V3; hand: V3 }
export function armFK(pelvis: V3, side: Side, pitch: number, roll: number, elbow: number): ArmFK {
  const s = side === 'L' ? 1 : -1
  const shoulder = add(pelvis, [0, s * BODY.shoulderHalf, BODY.torso])
  const p = pitch * RAD, r = s * roll * RAD, e = elbow * RAD
  // kol aşağı sarkar; yunuslama öne kaldırır, dirsek ön kolu öne/yukarı büker
  const u: V3 = [BODY.upperArm * Math.sin(p), 0, -BODY.upperArm * Math.cos(p)]
  const fa = p + e
  const f: V3 = [u[0] + BODY.forearm * Math.sin(fa), 0, u[2] - BODY.forearm * Math.cos(fa)]
  return { shoulder, elbow: add(shoulder, rotX(u, r)), hand: add(shoulder, rotX(f, r)) }
}

export interface BodyFK { pelvis: V3; neck: V3; head: V3; legs: Record<Side, LegFK>; arms: Record<Side, ArmFK> }

export function bodyFK(pelvis: V3, j: Joints): BodyFK {
  return {
    pelvis,
    neck: add(pelvis, [0, 0, BODY.torso]),
    head: add(pelvis, [0, 0, BODY.torso + BODY.head]),
    legs: {
      L: legFK(pelvis, 'L', j.hipPitchL, j.hipRollL, j.kneeL, j.anklePitchL, j.ankleRollL),
      R: legFK(pelvis, 'R', j.hipPitchR, j.hipRollR, j.kneeR, j.anklePitchR, j.ankleRollR),
    },
    arms: { L: armFK(pelvis, 'L', j.shoulderPitchL, j.shoulderRollL, j.elbowL), R: armFK(pelvis, 'R', j.shoulderPitchR, j.shoulderRollR, j.elbowR) },
  }
}

// ---------------- ters kinematik ----------------
export interface LegIK { hipPitch: number; hipRoll: number; knee: number; anklePitch: number; ankleRoll: number; /** hedefe uzanamadı (bacak tam gergin sınırlandı) */ clamped: boolean }

/**
 * İki bağlı ters kinematik: kalçaya göre bilek hedefi (dx ileri, dy yana, dz yukarı; dz < 0) için açılar. Taban yere paralel kalır.
 * Diz her zaman geriye bükülür (insan bacağı gibi tek çözüm seçilir).
 */
export function legIK(side: Side, dx: number, dy: number, dz: number): LegIK {
  const s = side === 'L' ? 1 : -1
  // yuvarlanma: bacak düzlemini hedefe çevir
  const roll = Math.atan2(dy, -dz)
  const zp = -Math.hypot(dy, dz)
  let D = Math.hypot(dx, zp)
  const max = L1 + L2 - 1e-6, min = Math.abs(L1 - L2) + 1e-6
  const clamped = D > max || D < min
  D = Math.max(min, Math.min(max, D))
  const knee = Math.PI - Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + L2 * L2 - D * D) / (2 * L1 * L2))))
  const alpha = Math.atan2(dx, -zp)
  const beta = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + D * D - L2 * L2) / (2 * L1 * D))))
  const hipPitch = alpha + beta
  return {
    hipPitch: hipPitch * DEG, hipRoll: s * roll * DEG, knee: knee * DEG,
    anklePitch: -(hipPitch - knee) * DEG, ankleRoll: -s * roll * DEG, clamped,
  }
}

/** Taban hedefi (dünya; taban merkezi) için pelvise göre bacak IK'sı: bilek tabanın `ankleH` üstündedir. */
export function footIK(pelvis: V3, side: Side, sole: V3): LegIK {
  const s = side === 'L' ? 1 : -1
  return legIK(side, sole[0] - pelvis[0], sole[1] - (pelvis[1] + s * BODY.hipHalf), sole[2] + BODY.ankleH - pelvis[2])
}

export function applyLegIK(j: Joints, side: Side, ik: LegIK): Joints {
  return { ...j, [`hipPitch${side}`]: ik.hipPitch, [`hipRoll${side}`]: ik.hipRoll, [`knee${side}`]: ik.knee, [`anklePitch${side}`]: ik.anklePitch, [`ankleRoll${side}`]: -ik.hipRoll } as Joints
}

// ---------------- ağırlık merkezi ve denge ----------------
export function centerOfMass(b: BodyFK): V3 {
  const M = BODY.mass
  const parts: Array<[number, V3]> = [
    [M.pelvis, b.pelvis], [M.torso, mid(b.pelvis, b.neck)], [M.head, b.head],
  ]
  for (const s of ['L', 'R'] as const) {
    const l = b.legs[s], a = b.arms[s]
    parts.push([M.thigh, mid(l.hip, l.knee)], [M.shank, mid(l.knee, l.ankle)], [M.foot, mid(l.ankle, l.sole)], [M.upperArm, mid(a.shoulder, a.elbow)], [M.forearm, mid(a.elbow, a.hand)])
  }
  const m = parts.reduce((s, [w]) => s + w, 0)
  return parts.reduce<V3>((acc, [w, p]) => [acc[0] + (w * p[0]) / m, acc[1] + (w * p[1]) / m, acc[2] + (w * p[2]) / m], [0, 0, 0])
}
export const totalMass = () => { const M = BODY.mass; return M.pelvis + M.torso + M.head + 2 * (M.thigh + M.shank + M.foot + M.upperArm + M.forearm) }

type P2 = [number, number]
export function convexHull2(pts: P2[]): P2[] {
  const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1])
  if (p.length < 3) return p
  const cross = (o: P2, a: P2, b: P2) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
  const lo: P2[] = [], up: P2[] = []
  for (const q of p) { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 1e-12) lo.pop(); lo.push(q) }
  for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], q) <= 1e-12) up.pop(); up.push(q) }
  return [...lo.slice(0, -1), ...up.slice(0, -1)]
}
/** İşaretli uzaklık: içeride +, dışarıda - (saat yönünün tersindeki dışbükey çokgen). */
export function margin2(poly: P2[], x: number, y: number): number {
  if (poly.length < 3) return -Infinity
  let inside = true, best = Infinity
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length]
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy)
    if ((dx * (y - a[1]) - dy * (x - a[0])) / L < 0) inside = false
    const t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / (L * L)))
    best = Math.min(best, Math.hypot(x - a[0] - t * dx, y - a[1] - t * dy))
  }
  return inside ? best : -best
}

/** Yere değen ayakların taban köşelerinden destek çokgeni (zemin z = 0; `tol` içindeki köşeler değer sayılır). */
export function supportPolygon(b: BodyFK, groundZ = minSoleZ(b), tol = 0.004): P2[] {
  const pts: P2[] = []
  for (const s of ['L', 'R'] as const) for (const c of b.legs[s].corners) if (c[2] <= groundZ + tol) pts.push([c[0], c[1]])
  return convexHull2(pts)
}
export const minSoleZ = (b: BodyFK) => Math.min(...(['L', 'R'] as const).flatMap((s) => b.legs[s].corners.map((c) => c[2])))

export interface Balance { com: V3; support: P2[]; margin: number; stable: boolean }
/** Statik denge: ağırlık merkezinin yer izdüşümü destek çokgeninin içinde mi. */
export function staticBalance(b: BodyFK): Balance {
  const com = centerOfMass(b)
  const support = supportPolygon(b)
  const margin = margin2(support, com[0], com[1])
  return { com, support, margin, stable: margin > 0 }
}

/** Ayaklar düz ve yerdeyken pelvis yüksekliği (z): bacaklar düzken L1 + L2 + taban yüksekliği. */
export const STAND_Z = L1 + L2 + BODY.ankleH

/** Ayak tabanları yerde kalacak biçimde pelvisi aşağı kaydırır (görünüm ve denge için: en alçak taban köşesi z = 0). */
export function grounded(pelvis: V3, j: Joints): BodyFK {
  const b = bodyFK(pelvis, j)
  const dz = -minSoleZ(b)
  return bodyFK([pelvis[0], pelvis[1], pelvis[2] + dz], j)
}

/** Servo sınırı dışındaki eklemler. */
export function limitViolations(j: Joints): JointId[] {
  return JOINT_IDS.filter((k) => j[k] < SERVO[k].min - 1e-6 || j[k] > SERVO[k].max + 1e-6)
}
export const clampJoints = (j: Joints): Joints => Object.fromEntries(JOINT_IDS.map((k) => [k, Math.max(SERVO[k].min, Math.min(SERVO[k].max, j[k]))])) as Joints

// ---------------- yürüyüş üreteci (LIPM) ----------------
export interface GaitParams {
  /** Adım boyu (m): bir ayaktan öbürüne ileri uzaklık. */
  stepLength: number
  /** Salınan ayağın en yüksek kalkışı (m). */
  stepHeight: number
  /** Bir adımın süresi (s); bir yürüyüş döngüsü iki adımdır. */
  period: number
  /** Ağırlık merkezi (pelvis) yüksekliği (m); dizler bükülü yürür. */
  comHeight: number
  /** Ayakların yanlamasına yarı açıklığı (m). */
  footHalfSpread: number
  /** Kol salınımı (derece, adım boyuna göre ölçeklenir). */
  armSwing: number
}
export const DEFAULT_GAIT: GaitParams = { stepLength: 0.06, stepHeight: 0.03, period: 0.6, comHeight: 0.3, footHalfSpread: BODY.hipHalf, armSwing: 20 }
export const G = 9.81

export interface GaitSample {
  t: number
  /** Döngü evresi 0..1 (iki adım). */
  phase: number
  pelvis: V3
  com: V3
  /** Sıfır moment noktası (tek destek varsayımıyla destek ayağının merkezi). */
  zmp: [number, number]
  feet: Record<Side, V3>
  support: Side
  joints: Joints
  /** Bacak hedefe uzanamadı. */
  clamped: boolean
}

/**
 * Doğrusal ters sarkaç ile yürüyüş: k. adımda destek ayağı x = k·S'de durur (ZMP orada), ağırlık merkezi
 * x̃(t) = -S/2 · sinh((T/2 - t)/Tc) / sinh(T/2Tc), ỹ(t) = p - p·cosh((t - T/2)/Tc) / cosh(T/2Tc) izler (Tc = √(zc/g)).
 * Bu çözüm adım sınırlarında konumu ve hızı sürekli, iki adımda bir periyodiktir. Salınan ayak sikloid eğriyle taşınır.
 * Ağırlık merkezi pelvisle aynı kabul edilir (gövde kütlesi pelviste yoğun; eğitim modeli).
 */
export function gaitAt(gp: GaitParams, t: number): GaitSample {
  const { stepLength: S, stepHeight: H, period: T, comHeight: zc, footHalfSpread: w } = gp
  const Tc = Math.sqrt(zc / G)
  const k = Math.floor(t / T)
  const tau = t - k * T
  // k çiftse sol ayak destekte, tekse sağ (ilk adımda sağ ayak öne salınır)
  const support: Side = k % 2 === 0 ? 'L' : 'R'
  const sy = support === 'L' ? w : -w
  const px = k * S
  const xr = (-S / 2) * Math.sinh((T / 2 - tau) / Tc) / Math.sinh(T / (2 * Tc))
  // yanal salınım: destek ayağına doğru, ama ayağın üstüne kadar değil (LIPM periyodik çözümü)
  const yr = sy - sy * Math.cosh((tau - T / 2) / Tc) / Math.cosh(T / (2 * Tc))
  const com: V3 = [px + xr, yr, zc]
  const swing: Side = support === 'L' ? 'R' : 'L'
  const u = tau / T
  const cyc = u - Math.sin(2 * Math.PI * u) / (2 * Math.PI)
  const swingStart = (k - 1) * S, swingEnd = (k + 1) * S
  const feet = {
    [support]: [px, sy, 0] as V3,
    [swing]: [swingStart + (swingEnd - swingStart) * cyc, -sy, (H * (1 - Math.cos(2 * Math.PI * u))) / 2] as V3,
  } as Record<Side, V3>
  const pelvis = com
  const ikL = footIK(pelvis, 'L', feet.L), ikR = footIK(pelvis, 'R', feet.R)
  let j = applyLegIK(applyLegIK(zeroJoints(), 'L', ikL), 'R', ikR)
  // kollar bacaklara ters salınır
  const swingAmt = (gp.armSwing * Math.min(1, S / 0.08)) * Math.sin(Math.PI * (t / T))
  j = { ...j, shoulderPitchL: swingAmt, shoulderPitchR: -swingAmt, elbowL: 20, elbowR: 20, shoulderRollL: 8, shoulderRollR: 8 }
  return { t, phase: (t % (2 * T)) / (2 * T), pelvis, com, zmp: [px, sy], feet, support, joints: j, clamped: ikL.clamped || ikR.clamped }
}

/** Bir yürüyüş döngüsü (iki adım) boyunca `n` örnek: grafikler ve sınır denetimi için. */
export function gaitCycle(gp: GaitParams, n = 80, t0 = 2 * gp.period): GaitSample[] {
  return Array.from({ length: n }, (_, i) => gaitAt(gp, t0 + (i / n) * 2 * gp.period))
}

/** Döngüde servo sınırını aşan eklemler ve uzanamama. */
export function gaitIssues(gp: GaitParams): { limits: JointId[]; clamped: boolean } {
  const cyc = gaitCycle(gp, 60)
  const set = new Set<JointId>()
  for (const s of cyc) for (const k of limitViolations(s.joints)) set.add(k)
  return { limits: [...set], clamped: cyc.some((s) => s.clamped) }
}

// ---------------- hazır pozlar ----------------
export type PoseId = 'hazir' | 'comel' | 'tek-ayak' | 'el-salla' | 'kollar-yukari' | 'egil' | 'tekme'
const crouch = (z: number): Joints => {
  const j0 = zeroJoints()
  const pel: V3 = [0, 0, z]
  const l = footIK(pel, 'L', [0, BODY.hipHalf, 0]), r = footIK(pel, 'R', [0, -BODY.hipHalf, 0])
  return applyLegIK(applyLegIK(j0, 'L', l), 'R', r)
}
/** Sol ayak üstünde denge: pelvis sol ayağın üstüne kayar (kalça yuvarlanması), sağ ayak kalkar. */
const oneLeg = (): Joints => {
  const pel: V3 = [0.0, BODY.hipHalf * 0.95, STAND_Z - 0.02]
  const l = footIK(pel, 'L', [0, BODY.hipHalf, 0])
  const r = footIK(pel, 'R', [0.02, -BODY.hipHalf + 0.01, 0.06])
  return { ...applyLegIK(applyLegIK(zeroJoints(), 'L', l), 'R', r), shoulderRollL: 30, shoulderRollR: 45 }
}
export const POSES: Record<PoseId, { tr: string; en: string; joints: () => Joints }> = {
  hazir: { tr: 'hazır (dik dur)', en: 'ready (stand)', joints: () => ({ ...crouch(STAND_Z - 0.01), shoulderRollL: 8, shoulderRollR: 8, elbowL: 15, elbowR: 15 }) },
  comel: { tr: 'çömel', en: 'squat', joints: () => ({ ...crouch(STAND_Z - 0.1), shoulderPitchL: 60, shoulderPitchR: 60 }) },
  'tek-ayak': { tr: 'tek ayak (sol)', en: 'one leg (left)', joints: oneLeg },
  'el-salla': { tr: 'el salla', en: 'wave', joints: () => ({ ...crouch(STAND_Z - 0.01), shoulderPitchR: 10, shoulderRollR: 110, elbowR: 70, shoulderRollL: 8 }) },
  'kollar-yukari': { tr: 'kollar yukarı', en: 'arms up', joints: () => ({ ...crouch(STAND_Z - 0.01), shoulderPitchL: 170, shoulderPitchR: 170 }) },
  egil: { tr: 'öne eğil', en: 'lean forward', joints: () => { const pel: V3 = [-0.035, 0, STAND_Z - 0.05]; const j = applyLegIK(applyLegIK(zeroJoints(), 'L', footIK(pel, 'L', [0, BODY.hipHalf, 0])), 'R', footIK(pel, 'R', [0, -BODY.hipHalf, 0])); return { ...j, shoulderPitchL: 80, shoulderPitchR: 80 } } },
  tekme: { tr: 'tekme (sağ)', en: 'kick (right)', joints: () => { const j = oneLeg(); return { ...j, hipPitchR: 60, kneeR: 10, anklePitchR: -30 } } },
}
export const POSE_IDS = Object.keys(POSES) as PoseId[]

/** Pozdan pelvis konumu: ayak tabanları yere değecek yükseklik (yatay konum sabit). */
export const poseBody = (j: Joints, x = 0, y = 0): BodyFK => grounded([x, y, STAND_Z], j)

export const lerpJoints = (a: Joints, b: Joints, u: number): Joints => Object.fromEntries(JOINT_IDS.map((k) => [k, a[k] + (b[k] - a[k]) * u])) as Joints
