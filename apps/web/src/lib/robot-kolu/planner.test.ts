// Planlayıcı: duvar arkasına çarpışmasız yol, determinizm, geçersiz uç noktalar, yol uzunluğu, ulaşılamaz durum.
import { describe, expect, it } from 'vitest'
import { PICK_A, PLACE_B, cloneCell, defaultCell, edgeViolation, violation, type Cell } from './cell'
import { HOME, ik, poseDown } from './kinematics'
import { pathLength, planJoints, planToPose } from './planner'

const A = ik(poseDown(PICK_A[0], PICK_A[1], 0.25), HOME)[0]
const B = ik(poseDown(PLACE_B[0], PLACE_B[1], 0.25), HOME)[0]
const wall = defaultCell(true)

describe('RRT-Connect', () => {
  it('doğrudan yol serbestse tek kenar döner', () => {
    const r = planJoints(A, B, defaultCell(false))
    expect(r.ok).toBe(true)
    expect(r.path).toHaveLength(2)
    expect(r.iterations).toBe(0)
  })
  it('duvarlı hücrede doğrudan eklem hareketi çarpışır ama plan çarpışmasız yol bulur', () => {
    expect(edgeViolation(A, B, wall)).not.toBeNull()
    const r = planJoints(A, B, wall)
    expect(r.ok).toBe(true)
    expect(r.path.length).toBeGreaterThanOrEqual(3)
    expect(r.path[0]).toEqual(A)
    expect(r.path[r.path.length - 1]).toEqual(B)
    for (let i = 1; i < r.path.length; i++) expect(edgeViolation(r.path[i - 1], r.path[i], wall), `kenar ${i}`).toBeNull()
    for (const q of r.path) expect(violation(q, wall)).toBeNull()
  })
  it('aynı tohum aynı yolu verir; farklı tohum farklı olabilir ama yine geçerli', () => {
    const a = planJoints(A, B, wall, { seed: 5 }), b = planJoints(A, B, wall, { seed: 5 })
    expect(a).toEqual(b)
    for (const seed of [2, 3, 4, 9]) {
      const r = planJoints(A, B, wall, { seed })
      expect(r.ok, `tohum ${seed}`).toBe(true)
      for (let i = 1; i < r.path.length; i++) expect(edgeViolation(r.path[i - 1], r.path[i], wall)).toBeNull()
    }
  })
  it('düzleştirme yolu kısaltır ya da aynı bırakır, ham yoldan uzun yapmaz', () => {
    const smooth = planJoints(A, B, wall, { seed: 3, smooth: 300 }), raw = planJoints(A, B, wall, { seed: 3, smooth: 0 })
    expect(pathLength(smooth.path)).toBeLessThanOrEqual(pathLength(raw.path) + 1e-9)
    expect(smooth.path.length).toBeLessThanOrEqual(raw.path.length)
    expect(raw.rawLength).toBe(raw.path.length)
  })
  it('başlangıç ya da hedef çarpışıyorsa nedeniyle birlikte reddeder', () => {
    const inWall = ik(poseDown(0.55, 0, 0.2), HOME)[0]
    expect(planJoints(inWall, B, wall)).toMatchObject({ ok: false, reason: 'start-invalid' })
    expect(planJoints(A, inWall, wall)).toMatchObject({ ok: false, reason: 'goal-invalid' })
  })
  it('yineleme bütçesi bitince no-path döner (yol yok demek değil, bulunamadı demektir)', () => {
    const r = planJoints(A, B, wall, { maxIter: 2 })
    expect(r).toMatchObject({ ok: false, reason: 'no-path', iterations: 2, path: [] })
    expect(planJoints(A, B, wall, { maxIter: 200 }).ok).toBe(true)
  })
})

describe('duruş hedefine plan', () => {
  it('erişilebilir duruş: çarpışmasız çözüme planlar', () => {
    const r = planToPose(HOME, poseDown(PLACE_B[0], PLACE_B[1], 0.25), wall)
    expect(r.ok).toBe(true)
    expect(violation(r.goalQ!, wall)).toBeNull()
  })
  it('erişilemeyen duruş: goal-invalid', () => {
    expect(planToPose(HOME, poseDown(1.5, 0, 0.2), wall)).toMatchObject({ ok: false, reason: 'goal-invalid' })
  })
})
