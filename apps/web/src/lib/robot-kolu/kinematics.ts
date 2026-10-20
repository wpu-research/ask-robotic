// Robot Kolu Mühendisliği dersi: sanal 6 eksenli kolun kinematiği. Bu bir ders modelidir; hiçbir üreticinin robotunun ölçüsü
// ya da yazılımı değildir. Dünya çerçevesi Z yukarı, metre ve radyan. Kolun sıfır duruşu dikey, yukarı bakar.
//   T = Tz(d1) · Rz(q1) · Ry(q2) · Tz(a2) · Ry(q3) · Tz(a3) · Rz(q4) · Ry(q5) · Rz(q6) · Tz(d6 + tutucu)
// Bilek ekseni üçü bir noktada keser (küresel bilek); bu yüzden ters kinematik kapalı biçimde (analitik) çözülür.

export type V3 = [number, number, number]
/** Satır öncelikli 3x3 dönüş matrisi. */
export type Mat3 = [number, number, number, number, number, number, number, number, number]
export type Joints = [number, number, number, number, number, number]
export interface Pose { p: V3; R: Mat3 }

export const DEG = Math.PI / 180

/** Uzuv ölçüleri (m). */
export const ARM = {
  /** Taban ekseninden omuz eklemine yükseklik. */
  d1: 0.4,
  /** Üst kol ve ön kol uzunlukları. */
  a2: 0.45,
  a3: 0.45,
  /** Bilek merkezinden flanşa. */
  d6: 0.1,
  /** Flanştan tutucu parmak ucuna (TCP). */
  tool: 0.12,
} as const
/** Bilek merkezinden TCP'ye uzaklık. */
export const WRIST_TO_TCP = ARM.d6 + ARM.tool

/** Eklem sınırları (rad): [en az, en çok]. */
export const LIMITS: ReadonlyArray<readonly [number, number]> = [
  [-170 * DEG, 170 * DEG],
  [-100 * DEG, 120 * DEG],
  [-150 * DEG, 150 * DEG],
  [-180 * DEG, 180 * DEG],
  [-120 * DEG, 120 * DEG],
  [-180 * DEG, 180 * DEG],
]
/** Bekleme duruşu (derece): kol öne eğik, tutucu aşağı bakar. */
export const HOME_DEG: readonly [number, number, number, number, number, number] = [0, 30, 60, 0, 90, 0]
export const HOME: Joints = HOME_DEG.map((d) => d * DEG) as Joints

export const toRad = (d: readonly number[]): Joints => d.map((x) => x * DEG) as Joints
export const toDeg = (q: readonly number[]): number[] => q.map((x) => x / DEG)
export const wrap = (a: number) => { let x = (a + Math.PI) % (2 * Math.PI); if (x < 0) x += 2 * Math.PI; return x - Math.PI }

/* ---------- küçük doğrusal cebir ---------- */
export const I3: Mat3 = [1, 0, 0, 0, 1, 0, 0, 0, 1]
export const mul = (A: Mat3, B: Mat3): Mat3 => {
  const o = new Array(9).fill(0) as Mat3
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) o[i * 3 + j] = A[i * 3] * B[j] + A[i * 3 + 1] * B[3 + j] + A[i * 3 + 2] * B[6 + j]
  return o
}
export const transpose = (A: Mat3): Mat3 => [A[0], A[3], A[6], A[1], A[4], A[7], A[2], A[5], A[8]]
export const apply = (A: Mat3, v: V3): V3 => [A[0] * v[0] + A[1] * v[1] + A[2] * v[2], A[3] * v[0] + A[4] * v[1] + A[5] * v[2], A[6] * v[0] + A[7] * v[1] + A[8] * v[2]]
export const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
export const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
export const scale = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k]
export const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
export const norm = (a: V3) => Math.hypot(a[0], a[1], a[2])
export const dist = (a: V3, b: V3) => norm(sub(a, b))
export const Rz = (a: number): Mat3 => { const c = Math.cos(a), s = Math.sin(a); return [c, -s, 0, s, c, 0, 0, 0, 1] }
export const Ry = (a: number): Mat3 => { const c = Math.cos(a), s = Math.sin(a); return [c, 0, s, 0, 1, 0, -s, 0, c] }
export const Rx = (a: number): Mat3 => { const c = Math.cos(a), s = Math.sin(a); return [1, 0, 0, 0, c, -s, 0, s, c] }

/** Göreli dönüşün eksen-açı gösterimi (Rodrigues'in tersi): R = I + sin·K + (1-cos)·K². */
export function rotVec(R: Mat3): V3 {
  const tr = R[0] + R[4] + R[8]
  const c = Math.max(-1, Math.min(1, (tr - 1) / 2))
  const ang = Math.acos(c)
  if (ang < 1e-9) return [0, 0, 0]
  if (Math.PI - ang < 1e-6) {
    // 180° civarı: eksen R + I'nın en büyük sütunundan
    const d = [R[0], R[4], R[8]]
    const k = d.indexOf(Math.max(...d))
    const col: V3 = [R[k] + (k === 0 ? 1 : 0), R[3 + k] + (k === 1 ? 1 : 0), R[6 + k] + (k === 2 ? 1 : 0)]
    const n = norm(col) || 1
    return scale(col, Math.PI / n)
  }
  const k = ang / (2 * Math.sin(ang))
  return [(R[7] - R[5]) * k, (R[2] - R[6]) * k, (R[3] - R[1]) * k]
}
export function rotFromVec(w: V3): Mat3 {
  const th = norm(w)
  if (th < 1e-12) return I3
  const [x, y, z] = scale(w, 1 / th)
  const c = Math.cos(th), s = Math.sin(th), t = 1 - c
  return [t * x * x + c, t * x * y - s * z, t * x * z + s * y, t * x * y + s * z, t * y * y + c, t * y * z - s * x, t * x * z - s * y, t * y * z + s * x, t * z * z + c]
}

/* ---------- ileri kinematik ---------- */
/** Eklem ve uç noktaları (çizim ve çarpışma için): taban, omuz, dirsek, bilek merkezi, flanş, TCP. */
export interface Frames { pts: [V3, V3, V3, V3, V3, V3]; R: Mat3 }
export function fkFrames(q: Joints): Frames {
  const R1 = Rz(q[0])
  const R2 = mul(R1, Ry(q[1]))
  const R3 = mul(R2, Ry(q[2]))
  const R6 = mul(mul(mul(R3, Rz(q[3])), Ry(q[4])), Rz(q[5]))
  const shoulder: V3 = [0, 0, ARM.d1]
  const elbow = add(shoulder, apply(R2, [0, 0, ARM.a2]))
  const wrist = add(elbow, apply(R3, [0, 0, ARM.a3]))
  const flange = add(wrist, apply(R6, [0, 0, ARM.d6]))
  const tcp = add(wrist, apply(R6, [0, 0, WRIST_TO_TCP]))
  return { pts: [[0, 0, 0], shoulder, elbow, wrist, flange, tcp], R: R6 }
}
export function fk(q: Joints): Pose {
  const f = fkFrames(q)
  return { p: f.pts[5], R: f.R }
}

/** Tutucu aşağı bakar (araç z ekseni dünya -Z), dikey eksen etrafında yaw (derece). R = Rz(yaw) · Ry(π). */
export function poseDown(x: number, y: number, z: number, yawDeg = 0): Pose {
  return { p: [x, y, z], R: mul(Rz(yawDeg * DEG), Ry(Math.PI)) }
}
/** Tutucu aşağı bakan bir duruşun yaw'ı (derece); aşağıya bakmıyorsa da yatay izdüşümden hesaplanır. */
export const yawOf = (R: Mat3): number => Math.atan2(-R[3], -R[0]) / DEG
/** Araç ekseninin dikeyden (aşağı) sapması (derece). */
export const toolTilt = (R: Mat3): number => Math.acos(Math.max(-1, Math.min(1, -R[8]))) / DEG

/* ---------- ters kinematik ---------- */
const EPS = 1e-9
export const inLimits = (q: readonly number[], tol = 1e-9) => q.every((v, i) => v >= LIMITS[i][0] - tol && v <= LIMITS[i][1] + tol)

/**
 * Bir duruşa götüren bütün eklem çözümleri (sınırlar içinde), `ref`e (varsayılan HOME) eklem uzayında en yakından başlayarak.
 * En çok sekiz aday: omuz önde/arkada × dirsek yukarı/aşağı × bilek normal/ters. Ulaşılamıyorsa boş dizi.
 * Tekil bilekte (q5 ≈ 0) q4 `ref`ten alınır, q6 buna göre kapanır.
 */
export function ik(target: Pose, ref: Joints = HOME): Joints[] {
  const { p, R } = target
  const wc = sub(p, scale([R[2], R[5], R[8]], WRIST_TO_TCP))
  const rho = Math.hypot(wc[0], wc[1])
  const z = wc[2] - ARM.d1
  const sols: Joints[] = []
  const q1s = rho < 1e-6 ? [ref[0]] : [Math.atan2(wc[1], wc[0]), wrap(Math.atan2(wc[1], wc[0]) + Math.PI)]
  for (let i = 0; i < q1s.length; i++) {
    const q1 = q1s[i]
    const r = rho < 1e-6 ? 0 : (i === 0 ? rho : -rho)
    const D = r * r + z * z
    const c3 = (D - ARM.a2 * ARM.a2 - ARM.a3 * ARM.a3) / (2 * ARM.a2 * ARM.a3)
    if (c3 > 1 + 1e-9 || c3 < -1 - 1e-9) continue
    const a3 = Math.acos(Math.max(-1, Math.min(1, c3)))
    for (const q3 of a3 < 1e-9 ? [0] : [a3, -a3]) {
      const q2 = Math.atan2(r, z) - Math.atan2(ARM.a3 * Math.sin(q3), ARM.a2 + ARM.a3 * Math.cos(q3))
      const R03 = mul(Rz(q1), Ry(q2 + q3))
      const W = mul(transpose(R03), R)
      const sb = Math.hypot(W[2], W[5])
      const variants: Array<[number, number, number]> = []
      if (sb > 1e-7) {
        const b = Math.atan2(sb, W[8]), a = Math.atan2(W[5], W[2]), c = Math.atan2(W[7], -W[6])
        variants.push([a, b, c], [wrap(a + Math.PI), -b, wrap(c + Math.PI)])
      } else if (W[8] > 0) {
        const a = ref[3]
        variants.push([a, 0, wrap(Math.atan2(W[3], W[0]) - a)])
      } else {
        const a = ref[3]
        variants.push([a, Math.PI, wrap(a - Math.atan2(-W[3], -W[0]))])
      }
      for (const [a, b, c] of variants) {
        const q: Joints = [wrap(q1), wrap(q2), wrap(q3), wrap(a), wrap(b), wrap(c)]
        if (inLimits(q)) sols.push(q)
      }
    }
  }
  sols.sort((u, v) => jointDist(u, ref) - jointDist(v, ref))
  return sols
}
/** Eklem uzayı uzaklığı (rad, en büyük eklem farkı). Sarılmaz: sınırlı eklemler ±180° çizgisini geçemez, yol doğrudan farktır. */
export const jointDist = (a: readonly number[], b: readonly number[]) => a.reduce((m, v, i) => Math.max(m, Math.abs(v - b[i])), 0)

/* ---------- tekillik ---------- */
export type Singularity = 'shoulder' | 'elbow' | 'wrist'
export const SINGULAR_DEG = 5
export const SHOULDER_SINGULAR_M = 0.02
/** Yakın tekillikler: bilek merkezi taban ekseninde (omuz), kol tam açık ya da kapalı (dirsek), q5 sıfır ya da π (bilek). */
export function singularities(q: Joints): Singularity[] {
  const out: Singularity[] = []
  const wc = fkFrames(q).pts[3]
  if (Math.hypot(wc[0], wc[1]) < SHOULDER_SINGULAR_M) out.push('shoulder')
  if (Math.abs(Math.sin(q[2])) < Math.sin(SINGULAR_DEG * DEG)) out.push('elbow')
  if (Math.abs(Math.sin(q[4])) < Math.sin(SINGULAR_DEG * DEG)) out.push('wrist')
  return out
}

/** Bilek merkezi için erişim kabuğu: kol tam açıkken a2 + a3, katlanmışken |a2 − a3|. */
export const REACH = { max: ARM.a2 + ARM.a3, min: Math.abs(ARM.a2 - ARM.a3) }
/** Tutucu aşağı bakarken TCP'nin yatay erişimi, belirli yükseklikte: bilek merkezi TCP'nin WRIST_TO_TCP kadar üstündedir. */
export function downReach(z: number): { min: number; max: number } | null {
  const dz = z + WRIST_TO_TCP - ARM.d1
  const m = REACH.max * REACH.max - dz * dz
  if (m < 0) return null
  const lo = REACH.min * REACH.min - dz * dz
  return { min: lo > 0 ? Math.sqrt(lo) : 0, max: Math.sqrt(m) }
}
