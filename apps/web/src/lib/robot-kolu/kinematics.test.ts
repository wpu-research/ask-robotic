// Kinematik: sıfır duruşu, eklem eksenleri, FK→IK→FK gidiş-dönüş, çoklu çözüm, ulaşılamayan hedef, tekillikler.
import { describe, expect, it } from 'vitest'
import { ARM, DEG, HOME, LIMITS, REACH, WRIST_TO_TCP, downReach, fk, fkFrames, ik, inLimits, jointDist, poseDown, rotFromVec, rotVec, singularities, toRad, toolTilt, yawOf, type Joints, type Pose } from './kinematics'
import { rng } from './rand'

const near = (a: readonly number[], b: readonly number[], tol = 1e-9) => a.every((v, i) => Math.abs(v - b[i]) < tol)
const poseErr = (a: Pose, b: Pose) => Math.max(...a.p.map((v, i) => Math.abs(v - b.p[i])), ...a.R.map((v, i) => Math.abs(v - b.R[i])))

describe('ileri kinematik', () => {
  it('sıfır duruşunda kol dikey: TCP, taban ekseni üzerinde d1 + a2 + a3 + d6 + tutucu yükseklikte', () => {
    const f = fkFrames([0, 0, 0, 0, 0, 0])
    expect(near(f.pts[1], [0, 0, ARM.d1])).toBe(true)
    expect(near(f.pts[2], [0, 0, ARM.d1 + ARM.a2])).toBe(true)
    expect(near(f.pts[3], [0, 0, ARM.d1 + ARM.a2 + ARM.a3])).toBe(true)
    expect(near(f.pts[5], [0, 0, ARM.d1 + ARM.a2 + ARM.a3 + WRIST_TO_TCP])).toBe(true)
  })
  it('q1 taban etrafında Z ekseninde döner; q2 pozitifken kol +X yönüne yatar', () => {
    const a = fk([90 * DEG, 30 * DEG, 0, 0, 0, 0]).p
    expect(a[0]).toBeCloseTo(0, 9)
    expect(a[1]).toBeGreaterThan(0.3)
    expect(fk([0, 90 * DEG, 0, 0, 0, 0]).p[0]).toBeGreaterThan(0.9)
  })
  it('uzuvlar sabit uzunlukta (eklem açısından bağımsız)', () => {
    const r = rng(7)
    for (let i = 0; i < 50; i++) {
      const q = LIMITS.map(([lo, hi]) => lo + r() * (hi - lo)) as Joints
      const { pts } = fkFrames(q)
      const d = (i: number, j: number) => Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1], pts[i][2] - pts[j][2])
      expect(d(1, 2)).toBeCloseTo(ARM.a2, 9)
      expect(d(2, 3)).toBeCloseTo(ARM.a3, 9)
      expect(d(3, 5)).toBeCloseTo(WRIST_TO_TCP, 9)
    }
  })
  it('HOME duruşunda tutucu aşağı bakar', () => {
    expect(toolTilt(fk(HOME).R)).toBeLessThan(1e-6)
  })
  it('eksen-açı gösterimi gidiş-dönüş', () => {
    const R = fk(toRad([40, 25, -30, 70, 35, -120])).R
    const R2 = rotFromVec(rotVec(R))
    expect(near(R, R2, 1e-9)).toBe(true)
  })
})

describe('ters kinematik', () => {
  it('rastgele sınır içi duruşlar: FK(IK) aynı duruşu verir ve çözümler arasında orijinal q vardır', () => {
    const r = rng(11)
    let n = 0
    for (let i = 0; i < 300; i++) {
      const q = LIMITS.map(([lo, hi]) => lo + r() * (hi - lo) * 0.98) as Joints
      if (singularities(q).length) continue
      n++
      const target = fk(q)
      const sols = ik(target, q)
      expect(sols.length, `örnek ${i}`).toBeGreaterThan(0)
      for (const s of sols) { expect(inLimits(s)).toBe(true); expect(poseErr(fk(s), target), `örnek ${i}`).toBeLessThan(1e-9) }
      expect(jointDist(sols[0], q), `örnek ${i}: en yakın çözüm`).toBeLessThan(1e-7)
    }
    expect(n).toBeGreaterThan(150)
  })
  it('genel bir duruşun birden çok çözümü var (omuz/dirsek/bilek)', () => {
    const q = toRad([30, 40, 50, 20, 60, -10])
    const sols = ik(fk(q), q)
    expect(sols.length).toBeGreaterThanOrEqual(2)
    expect(sols.length).toBeLessThanOrEqual(8)
    // aynı duruşa farklı eklem açılarıyla varıyorlar
    expect(jointDist(sols[0], sols[1])).toBeGreaterThan(0.1)
  })
  it('erişim dışı hedef için boş dizi: çok uzak ve çok yüksek', () => {
    expect(ik(poseDown(2, 0, 0.1))).toEqual([])
    expect(ik(poseDown(0.2, 0, 1.9))).toEqual([])
  })
  it('aşağı bakan tutucu: erişim kabuğu downReach ile tutarlı', () => {
    const z = 0.05
    const reach = downReach(z)!
    expect(ik(poseDown(reach.max - 0.01, 0, z)).length).toBeGreaterThan(0)
    expect(ik(poseDown(reach.max + 0.01, 0, z))).toEqual([])
    expect(downReach(10)).toBeNull()
    expect(REACH.max).toBeCloseTo(0.9, 12)
  })
  it('masa üzerindeki noktalar için tutucu yaw değerleri korunur', () => {
    for (const yaw of [0, 45, 90, -60]) {
      const t = poseDown(0.5, 0.2, 0.03, yaw)
      const s = ik(t)
      expect(s.length).toBeGreaterThan(0)
      expect(yawOf(fk(s[0]).R)).toBeCloseTo(yaw, 6)
    }
  })
  it('bilek merkezi taban ekseninde (omuz tekilliği) iken de çözüm döner, q1 ref`ten alınır', () => {
    const sols = ik(poseDown(0, 0, 0.48), toRad([25, 0, 0, 0, 0, 0]))
    expect(sols.length).toBeGreaterThan(0)
    expect(sols[0][0]).toBeCloseTo(25 * DEG, 9)
    expect(poseErr(fk(sols[0]), poseDown(0, 0, 0.48))).toBeLessThan(1e-9)
  })
})

describe('tekillikler', () => {
  it('üç tür yakın tekillik algılanır, HOME tekil değil', () => {
    expect(singularities(HOME)).toEqual([])
    expect(singularities(toRad([0, 20, 2, 0, 60, 0]))).toContain('elbow')
    expect(singularities(toRad([0, 20, 60, 0, 2, 0]))).toContain('wrist')
    expect(singularities(toRad([0, 0, 0, 0, 60, 0]))).toContain('shoulder')
  })
})
