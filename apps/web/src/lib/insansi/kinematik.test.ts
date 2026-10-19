import { describe, expect, it } from 'vitest'
import {
  BODY, DEFAULT_GAIT, L1, L2, POSES, POSE_IDS, STAND_Z, applyLegIK, bodyFK, centerOfMass, footIK, gaitAt, gaitCycle, gaitIssues, grounded,
  legFK, legIK, limitViolations, margin2, staticBalance, supportPolygon, totalMass, zeroJoints, type V3,
} from './kinematik'
import { compilePoseProgram, poseTimeline, sampleTimeline } from './poz-programi'

const close = (a: V3, b: V3, tol = 1e-6) => a.every((v, i) => Math.abs(v - b[i]) < tol)

describe('ileri kinematik', () => {
  it('düz bacak: bilek kalçanın L1+L2 altında, taban bileğin ankleH altında', () => {
    const l = legFK([0, 0, 1], 'L', 0, 0, 0, 0, 0)
    expect(close(l.hip, [0, BODY.hipHalf, 1])).toBe(true)
    expect(close(l.knee, [0, BODY.hipHalf, 1 - L1])).toBe(true)
    expect(close(l.ankle, [0, BODY.hipHalf, 1 - L1 - L2])).toBe(true)
    expect(close(l.sole, [0, BODY.hipHalf, 1 - L1 - L2 - BODY.ankleH])).toBe(true)
  })
  it('kalça 90°: uyluk yatay öne; diz 90° ile baldır yine dikey aşağı', () => {
    const l = legFK([0, 0, 1], 'R', 90, 0, 90, 0, 0)
    expect(close(l.knee, [L1, -BODY.hipHalf, 1])).toBe(true)
    expect(close(l.ankle, [L1, -BODY.hipHalf, 1 - L2])).toBe(true)
  })
  it('kalça yuvarlanması sol bacağı +y, sağ bacağı -y yönünde açar', () => {
    expect(legFK([0, 0, 1], 'L', 0, 20, 0, 0, 0).ankle[1]).toBeGreaterThan(BODY.hipHalf)
    expect(legFK([0, 0, 1], 'R', 0, 20, 0, 0, 0).ankle[1]).toBeLessThan(-BODY.hipHalf)
  })
})

describe('ters kinematik (iki bağ)', () => {
  it('gidiş-dönüş: rastgele erişilebilir hedefler için FK(IK(hedef)) = hedef (0,01 mm içinde), taban yere paralel', () => {
    let seed = 7
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 }
    for (let i = 0; i < 300; i++) {
      const side = i % 2 ? 'L' : 'R'
      const s = side === 'L' ? 1 : -1
      const dx = (rnd() - 0.5) * 0.18, dy = (rnd() - 0.5) * 0.08, dz = -(0.12 + rnd() * 0.18)
      if (Math.hypot(dx, dy, dz) > L1 + L2 - 1e-3) continue
      const ik = legIK(side, dx, dy, dz)
      expect(ik.clamped).toBe(false)
      const l = legFK([0, 0, 0], side, ik.hipPitch, ik.hipRoll, ik.knee, ik.anklePitch, ik.ankleRoll)
      expect(close(l.ankle, [dx, s * BODY.hipHalf + dy, dz], 1e-5)).toBe(true)
      expect(Math.abs(l.pitch)).toBeLessThan(1e-9)
      expect(Math.abs(l.roll)).toBeLessThan(1e-9)
      expect(ik.knee).toBeGreaterThanOrEqual(0)
    }
  })
  it('gidiş-dönüş: açılar → FK → IK aynı açıları verir (diz bükülü çözüm)', () => {
    for (const [hp, hr, kn] of [[20, 5, 40], [-10, -8, 15], [45, 12, 90], [5, 0, 1]]) {
      const l = legFK([0, 0, 0], 'L', hp, hr, kn, -(hp - kn), -hr)
      const ik = legIK('L', l.ankle[0], l.ankle[1] - BODY.hipHalf, l.ankle[2])
      expect(ik.hipPitch).toBeCloseTo(hp, 6)
      expect(ik.hipRoll).toBeCloseTo(hr, 6)
      expect(ik.knee).toBeCloseTo(kn, 6)
    }
  })
  it('uzanılamayan hedef sınırlandırılır ve işaretlenir', () => {
    const ik = legIK('L', 0, 0, -1)
    expect(ik.clamped).toBe(true)
    expect(ik.knee).toBeLessThan(1)
  })
  it('taban hedefi (dünya) için footIK tabanı hedefe koyar', () => {
    const pel: V3 = [0.01, 0.005, 0.3]
    const target: V3 = [0.04, BODY.hipHalf + 0.01, 0.02]
    const j = applyLegIK(zeroJoints(), 'L', footIK(pel, 'L', target))
    expect(close(bodyFK(pel, j).legs.L.sole, target, 1e-5)).toBe(true)
  })
})

describe('ağırlık merkezi ve destek çokgeni', () => {
  it('simetrik duruşta CoM ortada, pelvisin üstünde; toplam kütle doğru', () => {
    const b = grounded([0, 0, STAND_Z], POSES.hazir.joints())
    const com = centerOfMass(b)
    expect(Math.abs(com[1])).toBeLessThan(1e-9)
    expect(com[2]).toBeGreaterThan(b.pelvis[2] - 0.05)
    expect(totalMass()).toBeCloseTo(3.57, 2)
  })
  it('iki ayak yerdeyken destek çokgeni iki tabanı kapsar; ortalanmış CoM dengede', () => {
    const b = grounded([0, 0, STAND_Z], POSES.hazir.joints())
    const poly = supportPolygon(b)
    expect(poly.length).toBe(4)
    const ys = poly.map((p) => p[1])
    expect(Math.max(...ys)).toBeCloseTo(BODY.hipHalf + BODY.footHalfW, 3)
    expect(Math.min(...ys)).toBeCloseTo(-BODY.hipHalf - BODY.footHalfW, 3)
    const bal = staticBalance(b)
    expect(bal.stable).toBe(true)
    expect(bal.margin).toBeGreaterThan(0.02)
  })
  it('tek ayak duruşu: destek yalnız sol taban; CoM sol tabanın üstünde (denge) — kalça kaydırılmazsa düşer', () => {
    const b = grounded([0, BODY.hipHalf * 0.95, STAND_Z], POSES['tek-ayak'].joints())
    const bal = staticBalance(b)
    expect(bal.support.every(([, y]) => y > 0)).toBe(true)
    expect(bal.stable).toBe(true)
    // aynı ayak kaldırma, ama pelvis ortada kalırsa: CoM sol tabanın dışında, robot düşer
    const pel: V3 = [0, 0, STAND_Z - 0.02]
    const j = applyLegIK(applyLegIK(zeroJoints(), 'L', footIK(pel, 'L', [0, BODY.hipHalf, 0])), 'R', footIK(pel, 'R', [0.02, -BODY.hipHalf, 0.06]))
    const fall = staticBalance(bodyFK(pel, j))
    expect(fall.support.every(([, y]) => y > 0)).toBe(true)
    expect(fall.stable).toBe(false)
  })
  it('çokgen payı işareti', () => {
    const sq: Array<[number, number]> = [[0, 0], [1, 0], [1, 1], [0, 1]]
    expect(margin2(sq, 0.5, 0.25)).toBeCloseTo(0.25)
    expect(margin2(sq, -0.5, 0.5)).toBeCloseTo(-0.5)
  })
  it('hazır pozlar servo sınırları içinde', () => {
    for (const id of POSE_IDS) expect(limitViolations(POSES[id].joints()), id).toEqual([])
  })
})

describe('yürüyüş üreteci (LIPM)', () => {
  it('eklem açıları iki adımda bir periyodik; konum her döngüde 2·S ilerler', () => {
    const g = DEFAULT_GAIT
    for (const t of [0.13, 0.5, 0.77, 1.01]) {
      const a = gaitAt(g, t + 2 * g.period), b = gaitAt(g, t + 4 * g.period)
      for (const k of Object.keys(a.joints) as Array<keyof typeof a.joints>) expect(b.joints[k]).toBeCloseTo(a.joints[k], 9)
      expect(b.com[0] - a.com[0]).toBeCloseTo(2 * g.stepLength, 9)
      expect(b.com[1]).toBeCloseTo(a.com[1], 9)
    }
  })
  it('adım sınırında CoM konumu ve hızı sürekli; ZMP destek ayağında', () => {
    const g = DEFAULT_GAIT, T = g.period, e = 1e-6
    for (const k of [1, 2, 3]) {
      const before = gaitAt(g, k * T - e), after = gaitAt(g, k * T + e)
      expect(after.com[0]).toBeCloseTo(before.com[0], 5)
      expect(after.com[1]).toBeCloseTo(before.com[1], 5)
      const vb = (gaitAt(g, k * T - e).com[0] - gaitAt(g, k * T - 2 * e).com[0]) / e
      const va = (gaitAt(g, k * T + 2 * e).com[0] - gaitAt(g, k * T + e).com[0]) / e
      expect(va).toBeCloseTo(vb, 2)
      expect(before.support).not.toBe(after.support)
    }
    const s = gaitAt(g, 2.2 * T)
    expect(s.zmp[0]).toBeCloseTo(s.feet[s.support][0], 9)
    expect(s.zmp[1]).toBeCloseTo(s.feet[s.support][1], 9)
  })
  it('salınan ayak adım ortasında stepHeight kadar kalkar, destek ayağı yerde; tabanlar IK ile hedefte', () => {
    const g = DEFAULT_GAIT
    const s = gaitAt(g, 2.5 * g.period)
    const swing = s.support === 'L' ? 'R' : 'L'
    expect(s.feet[swing][2]).toBeCloseTo(g.stepHeight, 9)
    expect(s.feet[s.support][2]).toBe(0)
    const b = bodyFK(s.pelvis, s.joints)
    expect(close(b.legs.L.sole, s.feet.L, 1e-5)).toBe(true)
    expect(close(b.legs.R.sole, s.feet.R, 1e-5)).toBe(true)
  })
  it('varsayılan yürüyüş sınırlar içinde; çok uzun adım uzanamaz ya da servo sınırını aşar', () => {
    expect(gaitIssues(DEFAULT_GAIT)).toEqual({ limits: [], clamped: false })
    const bad = gaitIssues({ ...DEFAULT_GAIT, stepLength: 0.3, comHeight: 0.33 })
    expect(bad.clamped || bad.limits.length > 0).toBe(true)
    expect(gaitCycle(DEFAULT_GAIT, 40)).toHaveLength(40)
  })
})

describe('poz programı', () => {
  it('blok ve kod aynı adımlara çözülür; tekrarla açılır, süre toplanır', () => {
    const r = compilePoseProgram('poz hazir 500\ntekrarla 2 {\n  poz el-salla 400\n  bekle 100\n}\neklem kneeL 30 200\n')
    expect(r.error).toBeNull()
    expect(r.steps.map((s) => s.kind)).toEqual(['pose', 'pose', 'wait', 'pose', 'wait', 'joint'])
    const tl = poseTimeline(r.steps)
    expect(tl.durationMs).toBe(500 + 2 * 500 + 200)
    const end = sampleTimeline(tl, tl.durationMs)
    expect(end.kneeL).toBeCloseTo(30, 6)
  })
  it('İngilizce anahtar sözcükler ve hatalı satır', () => {
    expect(compilePoseProgram('pose wave 300\nwait 200\nwalk 2').error).toBeNull()
    const bad = compilePoseProgram('poz uc 300')
    expect(bad.error).toMatch(/1\. satır/)
    expect(compilePoseProgram('eklem dizL 30 100').error).toMatch(/eklem/)
  })
})
