// Hücre: geometri, çarpışma, tutucu kuralları, parça yerleşimi ve hücre güvenliği.
import { describe, expect, it } from 'vitest'
import {
  GRIPPER, PICK_A, SAFETY, TABLE, WALL, canResetEStop, capsules, cloneCell, defaultCell, edgeViolation, evaluateSafety, graspable, humanDistance, insideBox, pointSegDist, restZ,
  segHitsBox, violation, type Box, type Item,
} from './cell'
import { HOME, fk, ik, poseDown, toRad, type Joints } from './kinematics'

const box: Box = { name: 'b', min: [0, 0, 0], max: [1, 1, 1] }

describe('geometri', () => {
  it('doğru parçası–kutu: içinden, yanından, şişirilmiş kenardan', () => {
    expect(segHitsBox([-1, 0.5, 0.5], [2, 0.5, 0.5], box, 0)).toBe(true)
    expect(segHitsBox([-1, 2, 0.5], [2, 2, 0.5], box, 0)).toBe(false)
    expect(segHitsBox([-1, 1.05, 0.5], [2, 1.05, 0.5], box, 0)).toBe(false)
    expect(segHitsBox([-1, 1.05, 0.5], [2, 1.05, 0.5], box, 0.06)).toBe(true)
    expect(segHitsBox([0.5, 0.5, 0.5], [0.6, 0.6, 0.6], box, 0)).toBe(true)
  })
  it('nokta–doğru uzaklığı', () => {
    expect(pointSegDist([0, 1, 0], [-1, 0, 0], [1, 0, 0])).toBeCloseTo(1, 12)
    expect(pointSegDist([3, 0, 0], [-1, 0, 0], [1, 0, 0])).toBeCloseTo(2, 12)
    expect(insideBox([0.5, 0.5, 0.5], box)).toBe(true)
  })
  it('dört kapsül zincirleme bağlı', () => {
    const c = capsules(HOME)
    expect(c).toHaveLength(4)
    for (let i = 1; i < 4; i++) expect(c[i][0]).toEqual(c[i - 1][1])
  })
})

describe('çarpışma ve yasak bölge', () => {
  const free = defaultCell(false), wall = defaultCell(true)
  it('HOME serbest hücrede ve duvarlı hücrede ihlalsiz', () => {
    expect(violation(HOME, free)).toBeNull()
    expect(violation(HOME, wall)).toBeNull()
  })
  it('kol masaya iniyorsa masa çarpışması; parça alma yüksekliği (z=0.03) çarpışma değil', () => {
    const ok = ik(poseDown(0.55, -0.32, 0.03), HOME)[0]
    expect(violation(ok, free)).toBeNull()
    const low = ik(poseDown(0.55, -0.32, -0.05), HOME)[0]
    expect(violation(low, free)).toMatchObject({ kind: 'collision', with: 'table' })
  })
  it('duvarın içinden geçen duruş çarpışır', () => {
    const q = ik(poseDown(0.55, 0, 0.2), HOME)[0]
    expect(violation(q, wall)).toMatchObject({ kind: 'collision', with: 'wall' })
    expect(violation(q, free)).toBeNull()
  })
  it('eklem sınırı dışı duruş: limit', () => {
    expect(violation(toRad([200, 30, 60, 0, 90, 0]), free)).toEqual({ kind: 'limit' })
  })
  it('yasak bölgeye giren duruş zone; kenar denetimi hareketin hangi oranında girdiğini bulur', () => {
    const c = cloneCell(free)
    c.zones.push({ name: 'forbidden', min: [0.4, -0.1, 0], max: [0.7, 0.1, 0.6] })
    const a = ik(poseDown(0.55, -0.32, 0.25), HOME)[0], b = ik(poseDown(0.55, 0.32, 0.25), HOME)[0]
    expect(violation(a, c)).toBeNull()
    const e = edgeViolation(a, b, c)
    expect(e?.v).toMatchObject({ kind: 'zone', name: 'forbidden' })
    expect(e!.at).toBeGreaterThan(0.1)
    expect(e!.at).toBeLessThan(0.9)
  })
  it('hücre kopyası bağımsız', () => {
    const c = cloneCell(wall)
    c.items[0].pos[0] = 9
    expect(wall.items[0].pos[0]).not.toBe(9)
    expect(TABLE.max[2]).toBe(0)
    expect(WALL.max[2]).toBeGreaterThan(0.3)
  })
})

describe('tutucu', () => {
  const item = (id: string, x: number, y: number, size = 0.06): Item => ({ id, size, pos: [x, y, size / 2] })
  it('TCP parçanın merkezindeyken ve araç aşağı bakarken tutulur', () => {
    const q = ik(poseDown(0.5, 0, 0.03), HOME)[0]
    expect(graspable(q, [item('a', 0.5, 0)])?.id).toBe('a')
  })
  it('uzak parça, geniş parça ve eğik araç tutulmaz', () => {
    const q = ik(poseDown(0.5, 0, 0.03), HOME)[0]
    expect(graspable(q, [item('a', 0.5 + GRIPPER.graspRadius * 2, 0)])).toBeNull()
    expect(graspable(q, [item('b', 0.5, 0, GRIPPER.maxOpening + 0.01)])).toBeNull()
    const tilted: Joints = toRad([0, 30, 60, 0, 90 - 40, 0])
    expect(graspable(tilted, [{ id: 'c', size: 0.06, pos: fk(tilted).p }])).toBeNull()
  })
  it('birden çok aday varsa en yakın olan', () => {
    const q = ik(poseDown(0.5, 0, 0.03), HOME)[0]
    expect(graspable(q, [item('far', 0.52, 0), item('near', 0.505, 0)])?.id).toBe('near')
  })
  it('restZ: masa üstü ve altındaki parçanın üstü', () => {
    const a = item('a', 0.5, 0), b = item('b', 0.5, 0)
    expect(restZ(b, [a, b])).toBeCloseTo(0.09, 12)
    expect(restZ(b, [b])).toBeCloseTo(0.03, 12)
    expect(restZ({ ...b, pos: [0.8, 0, 0] }, [a, b])).toBeCloseTo(0.03, 12)
  })
  it('varsayılan hücrede parçalar masada ve alma bölgesinde', () => {
    for (const it of defaultCell().items) { expect(it.pos[2]).toBeCloseTo(it.size / 2, 12); expect(it.pos[1]).toBeLessThan(0) }
    expect(PICK_A[1]).toBeLessThan(0)
  })
})

describe('hücre güvenliği', () => {
  const q = ik(poseDown(0.55, 0, 0.3), HOME)[0]
  const base = { q, human: null, eStop: false, manual: false, zones: [] as Box[] }
  const tcp = fk(q).p
  it('kimse yokken normal', () => {
    expect(evaluateSafety(base)).toMatchObject({ state: 'ok', speedScale: 1, reasons: [] })
  })
  it('insan yaklaştıkça: uzak ok, yavaşlama bölgesi slow, durdurma bölgesi stop', () => {
    const far = evaluateSafety({ ...base, human: [tcp[0] + 2, tcp[1] + 2] })
    expect(far.state).toBe('ok')
    const mid = evaluateSafety({ ...base, human: [tcp[0], tcp[1] + (SAFETY.slowDist + SAFETY.stopDist) / 2] })
    expect(mid).toMatchObject({ state: 'slow', speedScale: SAFETY.slowScale })
    expect(mid.reasons).toContain('human-slow')
    const near = evaluateSafety({ ...base, human: [tcp[0], tcp[1] + 0.1] })
    expect(near).toMatchObject({ state: 'stop', speedScale: 0 })
    expect(near.reasons).toContain('human-stop')
  })
  it('uzaklık monoton: insan uzaklaştıkça mesafe artar', () => {
    const d = [0.2, 0.5, 1, 2].map((s) => humanDistance(q, [tcp[0], tcp[1] + s]))
    for (let i = 1; i < d.length; i++) expect(d[i]).toBeGreaterThan(d[i - 1])
  })
  it('acil durdurma her şeyi durdurur; elle kipi hızı tavana indirir; yasak bölge durdurur', () => {
    expect(evaluateSafety({ ...base, eStop: true })).toMatchObject({ state: 'stop', speedScale: 0 })
    expect(evaluateSafety({ ...base, manual: true })).toMatchObject({ state: 'slow', speedScale: SAFETY.manualCap })
    const z: Box = { name: 'z', min: [0.5, -0.2, 0], max: [0.6, 0.2, 1] }
    expect(evaluateSafety({ ...base, zones: [z] }).reasons).toContain('zone')
  })
  it('acil durdurma sıfırlama: başka durdurma nedeni varken açılamaz', () => {
    expect(canResetEStop(base)).toBe(true)
    expect(canResetEStop({ ...base, human: [tcp[0], tcp[1] + 0.1] })).toBe(false)
  })
})
