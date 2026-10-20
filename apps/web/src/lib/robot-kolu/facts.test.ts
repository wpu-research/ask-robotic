// Ders metinlerindeki sayı ve özellik iddiaları kodla doğrulanır: metinde bir sayı geçiyorsa burada onu üreten kod vardır.
import { describe, expect, it } from 'vitest'
import { runProgram } from './armscript'
import {
  GRIPPER, LINK_RADII, PICK_A, PLACE_B, SAFETY, WALL, defaultCell, edgeViolation, violation,
} from './cell'
import { ARM, DEG, HOME, HOME_DEG, LIMITS, REACH, WRIST_TO_TCP, downReach, fk, ik, poseDown, toDeg, toRad } from './kinematics'
import { JOINT_AMAX, JOINT_VMAX, LIN_AMAX, LIN_VMAX, MAX_JUMP, ROT_VMAX, lineDeviation, planLin, planPtp, tcpTrace } from './motion'
import { PLAN_DEFAULTS, planJoints } from './planner'
import { LIMITS_SCRIPT } from './armscript'
import { sampleCell, sampleSrc } from './samples'

const A = ik(poseDown(PICK_A[0], PICK_A[1], 0.25), HOME)[0]
const B = ik(poseDown(PLACE_B[0], PLACE_B[1], 0.25), HOME)[0]

describe('1. ünite: kol ve çalışma alanı', () => {
  it('uzuv ölçüleri ve sınırlar metindekiyle aynı', () => {
    expect([ARM.d1, ARM.a2, ARM.a3, ARM.d6, ARM.tool]).toEqual([0.4, 0.45, 0.45, 0.1, 0.12])
    expect(WRIST_TO_TCP).toBeCloseTo(0.22, 12)
    expect(LIMITS.map(([lo, hi]) => [Math.round(lo / DEG), Math.round(hi / DEG)])).toEqual([[-170, 170], [-100, 120], [-150, 150], [-180, 180], [-120, 120], [-180, 180]])
    expect(REACH.max).toBeCloseTo(0.9, 12)
  })
  it('yatay erişim: z = 0,03 m için yaklaşık 0,887; en geniş 0,18 m yükseklikte tam 0,9', () => {
    expect(downReach(0.03)!.max).toBeCloseTo(0.887, 3)
    expect(downReach(0.18)!.max).toBeCloseTo(0.9, 12)
    expect(downReach(0.3)!.max).toBeLessThan(0.9)
    expect(ik(poseDown(0.88, 0, 0.03)).length).toBeGreaterThan(0)
    expect(ik(poseDown(0.89, 0, 0.03))).toEqual([])
  })
  it('A ve B bölgeleri tabandan 0,55 m ileride, y = ∓0,32 m ve erişilebilir', () => {
    expect(PICK_A).toEqual([0.55, -0.32, 0]); expect(PLACE_B).toEqual([0.55, 0.32, 0])
    expect(ik(poseDown(PICK_A[0], PICK_A[1], 0.03)).length).toBeGreaterThan(0)
    expect(ik(poseDown(PLACE_B[0], PLACE_B[1], 0.03)).length).toBeGreaterThan(0)
  })
})

describe('2. ünite: ileri kinematik', () => {
  it('sıfır duruşunda TCP (0, 0, 1,52); HOME 0°,30°,60°,0°,90°,0° ve TCP (0,675; 0; 0,570)', () => {
    const z = fk([0, 0, 0, 0, 0, 0]).p
    expect(z[0]).toBeCloseTo(0, 12); expect(z[1]).toBeCloseTo(0, 12); expect(z[2]).toBeCloseTo(1.52, 12)
    expect([...HOME_DEG]).toEqual([0, 30, 60, 0, 90, 0])
    const p = fk(HOME).p
    expect(p[0]).toBeCloseTo(0.675, 3); expect(p[1]).toBeCloseTo(0, 12); expect(p[2]).toBeCloseTo(0.570, 3)
    expect(fk(HOME).R[8]).toBeCloseTo(-1, 12)
  })
  it('q6 TCP konumunu değiştirmez; q4 (q5 ≠ 0) değiştirir; bilek merkezi q4–q6 ile oynamaz', () => {
    const q = toRad([20, 30, 60, 10, 60, 5])
    const p0 = fk(q).p
    const q6 = [...q] as typeof q; q6[5] += 0.7
    expect(fk(q6).p.every((v, i) => Math.abs(v - p0[i]) < 1e-12)).toBe(true)
    const q4 = [...q] as typeof q; q4[3] += 0.7
    expect(Math.max(...fk(q4).p.map((v, i) => Math.abs(v - p0[i])))).toBeGreaterThan(0.01)
  })
})

describe('3. ünite: ters kinematik', () => {
  it('çözüm sayıları: genel duruş 8, masadaki alma noktası 4, HOME 2', () => {
    const q = toRad([30, 40, 50, 20, 60, -10])
    expect(ik(fk(q), q)).toHaveLength(8)
    expect(ik(poseDown(0.55, -0.32, 0.03), HOME)).toHaveLength(4)
    expect(ik(fk(HOME), HOME)).toHaveLength(2)
  })
})

describe('4. ünite: PTP ve LIN', () => {
  it('A–B üstü (z = 0,25 m, 0,64 m ara): PTP yaklaşık 0,86 s, iz sapması yaklaşık 8,6 cm, yol 0,671 m; LIN 1,53 s', () => {
    expect(Math.hypot(PLACE_B[1] - PICK_A[1])).toBeCloseTo(0.64, 12)
    const m = planPtp(A, B)
    expect(m.duration).toBeCloseTo(0.86, 2)
    const dev = lineDeviation(tcpTrace(m, 200))
    expect(dev.maxDev).toBeCloseTo(0.086, 3)
    expect(dev.length).toBeCloseTo(0.671, 3)
    expect(planLin(fk(A), fk(B)).duration).toBeCloseTo(1.53, 2)
  })
  it('hız ve ivme sınırları ve LIN sıçrama eşiği', () => {
    expect([...JOINT_VMAX]).toEqual([2.0, 2.0, 2.5, 3.5, 3.5, 5.0])
    expect([JOINT_AMAX, LIN_VMAX, LIN_AMAX, ROT_VMAX]).toEqual([6, 0.5, 2, 2])
    expect(MAX_JUMP).toBeCloseTo(20 * DEG, 12)
  })
  it('%25 hızda süre 4 değil yaklaşık 2,8 kat (örnek PTP hareketi)', () => {
    const t = toRad([60, 40, 50, 0, 90, 0])
    const r = planPtp(HOME, t, 25).duration / planPtp(HOME, t, 100).duration
    expect(r).toBeGreaterThan(2.7); expect(r).toBeLessThan(2.9)
    expect(planPtp(HOME, t, 100).duration).toBeCloseTo(0.857, 3)
  })
})

describe('5. ünite: tutucu', () => {
  it('tutucu sabitleri 0,08 m, 0,03 m, 25°', () => { expect(GRIPPER).toEqual({ maxOpening: 0.08, graspRadius: 0.03, maxTilt: 25 }) })
  it('geniş parça tutulmaz: 0,09 m boyutunda holding() false', () => {
    const c = defaultCell(false)
    c.items = [{ id: 'k', size: 0.09, pos: [0.55, -0.32, 0.045] }]
    const r = runProgram('ptp pose(0.55, -0.32, 0.25)\nlin pose(0.55, -0.32, 0.045)\nclose\nprint holding()', { cell: c })
    expect(r.output).toEqual(['false'])
    c.items[0].size = 0.06; c.items[0].pos[2] = 0.03
    expect(runProgram('ptp pose(0.55, -0.32, 0.25)\nlin pose(0.55, -0.32, 0.03)\nclose\nprint holding()', { cell: c }).output).toEqual(['true'])
  })
  it('üç parça istifi 30, 90, 150 mm; al-bırak 7,2 s; bırakma yüksekliği 0,2 m olursa düşürme sayılır', () => {
    const s = runProgram(sampleSrc('istif', 'en'), { cell: sampleCell('istif') })
    expect(s.items.map((i) => Math.round(i.pos[2] * 1000))).toEqual([30, 90, 150])
    expect(runProgram(sampleSrc('al-birak', 'en'), { cell: sampleCell('al-birak') }).duration).toBeCloseTo(7.2, 1)
    const d = runProgram('ptp pose(0.55, -0.32, 0.25)\nlin pose(0.55, -0.32, 0.03)\nclose\nlin pose(0.55, -0.32, 0.2)\nopen', { cell: defaultCell(false) })
    expect(d.stats.drops).toBe(1)
  })
})

describe('6–7. ünite: ArmScript sınırları', () => {
  it('metindeki sınırlar', () => {
    expect(LIMITS_SCRIPT).toMatchObject({ maxSteps: 20000, maxDepth: 12, maxOutput: 200, maxDuration: 600, maxChars: 6000, maxLines: 300 })
  })
})

describe('8. ünite: çarpışma ve planlama', () => {
  it('kapsül yarıçapları, duvar 0,42 m, doğrudan PTP hareketin yaklaşık %41\'inde ön kolla (uzuv 2) duvara çarpar', () => {
    expect([...LINK_RADII]).toEqual([0.08, 0.065, 0.055, 0.025])
    expect(WALL.max[2]).toBe(0.42)
    const e = edgeViolation(A, B, defaultCell(true))!
    expect(e.v).toMatchObject({ kind: 'collision', link: 2, with: 'wall' })
    expect(e.at).toBeCloseTo(0.41, 2)
  })
  it('RRT-Connect varsayılanları ve tohum 1 sonucu: 6 yineleme, ham yol 7, düzleştirilmiş 3 düğüm', () => {
    expect(PLAN_DEFAULTS).toMatchObject({ step: 0.35, goalBias: 0.15 })
    const r = planJoints(A, B, defaultCell(true), { seed: 1 })
    expect(r.iterations).toBe(6); expect(r.rawLength).toBe(7); expect(r.path).toHaveLength(3)
  })
})

describe('9. ünite: güvenlik sabitleri', () => {
  it('eşikler 0,8 m ve 0,4 m, yavaşlama ölçeği 0,25, TCP 0,5 m/s → 0,125 m/s', () => {
    expect(SAFETY).toMatchObject({ slowDist: 0.8, stopDist: 0.4, slowScale: 0.25, humanHeight: 1.8 })
    expect(LIN_VMAX * SAFETY.slowScale).toBeCloseTo(0.125, 12)
  })
})

describe('10. ünite ve bitirme: ölçülebilir sonuçlar', () => {
  const wall = sampleCell('bitirme')
  const r = runProgram(sampleSrc('bitirme', 'en'), { cell: wall })
  it('bitirme programı: 3 parça, 3 bırakma, 0 düşürme, 6 plan, yaklaşık 24 s, çıktı "parts moved: 3"', () => {
    expect(r.ok).toBe(true)
    expect(r.stats).toMatchObject({ picks: 3, places: 3, drops: 0, plan: 6 })
    expect(r.duration).toBeGreaterThan(23); expect(r.duration).toBeLessThan(25)
    expect(r.output).toEqual(['parts moved: 3'])
  })
  it('G1 (parçalar en az 0,08 m arayla), G2 (kare kare ihlal yok), G3 (düşürme 0), G5 (30 s altı)', () => {
    for (let i = 0; i < r.items.length; i++) for (let j = i + 1; j < r.items.length; j++) {
      expect(Math.hypot(r.items[i].pos[0] - r.items[j].pos[0], r.items[i].pos[1] - r.items[j].pos[1])).toBeGreaterThanOrEqual(0.08)
    }
    for (const f of r.frames) expect(violation(f.q, wall)).toBeNull()
    expect(r.stats.drops).toBe(0)
    expect(r.duration).toBeLessThan(30)
    for (const it of r.items) expect(it.pos[1]).toBeGreaterThan(0)
  })
  it('derece yardımcıları', () => { expect(toDeg(toRad([10, 20, 30, 40, 50, 60])).map(Math.round)).toEqual([10, 20, 30, 40, 50, 60]) })
})
