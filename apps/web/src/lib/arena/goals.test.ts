import { describe, expect, it } from 'vitest'
import { GoalTracker, angleDiffDeg, codeHas, evaluateArenaGoals, idleSnapshot, lastLine, noComments, serialCount, serialHas, stopped } from './goals'
import { armScene } from './arm-scenes'
import { easyLine, flatRoad, hardLine, maze, roverScene, withScene } from './scenes'
import type { ArenaGoal, ArenaGoalCtx, RoverSnapshot } from './types'

const scene = roverScene({ id: 't', title: 't' })
const ctx = (patch: Partial<RoverSnapshot> = {}, o: Partial<ArenaGoalCtx> = {}): ArenaGoalCtx => ({ snap: { ...(idleSnapshot(scene) as RoverSnapshot), ...patch }, started: true, code: '', scene, ...o })

describe('evaluateArenaGoals', () => {
  const goals: ArenaGoal[] = [
    { id: 'yol', text: 'yol', behavior: true, check: ({ snap }) => (snap as RoverSnapshot).distanceM >= 1 },
    { id: 'kod', text: 'kod', check: codeHas(/INPUT_PULLUP/) },
    { id: 'hata', text: 'hata', check: () => { throw new Error('x') } },
  ]
  it('çalışma başlamadan davranış hedefleri sağlanmış sayılmaz, kod hedefleri sayılır', () => {
    const r = evaluateArenaGoals(goals, ctx({ distanceM: 5 }, { started: false, code: 'pinMode(2, INPUT_PULLUP);' }))
    expect(r.map((x) => x.done)).toEqual([false, true, false])
  })
  it('çalışırken hedefler anlık duruma bakar; fırlatan hedef güvenle "yapılmadı" olur', () => {
    expect(evaluateArenaGoals(goals, ctx({ distanceM: 1.2 })).map((x) => x.done)).toEqual([true, false, false])
  })
  it('sonuçlar metin ve ipucunu taşır', () => {
    const r = evaluateArenaGoals([{ id: 'a', text: 'metin', hint: 'ipucu', check: () => false }], ctx())
    expect(r[0]).toEqual({ id: 'a', text: 'metin', hint: 'ipucu', done: false })
  })
})

describe('GoalTracker', () => {
  const g: ArenaGoal[] = [{ id: 'yol', text: 'yol', behavior: true, check: ({ snap }) => (snap as RoverSnapshot).distanceM >= 1 }, { id: 'canli', text: 'canlı', check: ({ snap }) => (snap as RoverSnapshot).v > 0 }]
  it('davranış hedefi bir kez sağlanınca kalıcıdır, canlı hedef düşer; reset temizler', () => {
    const t = new GoalTracker(g)
    expect(t.evaluate(ctx({ distanceM: 2, v: 0.2 })).map((x) => x.done)).toEqual([true, true])
    expect(t.evaluate(ctx({ distanceM: 0, v: 0 })).map((x) => x.done)).toEqual([true, false])
    t.reset()
    expect(t.evaluate(ctx({ distanceM: 0, v: 0 })).map((x) => x.done)).toEqual([false, false])
  })
})

describe('hedef yardımcıları', () => {
  it('codeHas yorumları yok sayar', () => {
    expect(codeHas(/delay/)({ code: '// delay(10)\nint x;' })).toBe(false)
    expect(codeHas(/delay/)({ code: '/* a */ delay(10);' })).toBe(true)
    expect(noComments('a // b\nc /* d */ e')).toBe('a \nc  e')
  })
  it('serialHas / serialCount / lastLine', () => {
    const snap = { ...(idleSnapshot(scene) as RoverSnapshot), serial: 'a=1\r\nTAMPON\r\nTAMPON\r\nson satir\r\n' }
    expect(serialHas(/TAMPON/)({ snap })).toBe(true); expect(serialHas(/YOK/)({ snap })).toBe(false)
    expect(serialCount(/TAMPON/, 2)({ snap })).toBe(true); expect(serialCount(/TAMPON/, 3)({ snap })).toBe(false)
    expect(lastLine(snap.serial)).toBe('son satir'); expect(lastLine('')).toBe('')
  })
  it('stopped ve angleDiffDeg', () => {
    const s = idleSnapshot(scene) as RoverSnapshot
    expect(stopped({ ...s, v: 0.005, omega: 0.01 })).toBe(true); expect(stopped({ ...s, v: 0.1 })).toBe(false)
    expect(angleDiffDeg(350, 10)).toBe(-20); expect(angleDiffDeg(10, 350)).toBe(20)
  })
})

describe('idleSnapshot ve sahneler', () => {
  it('robot sahnesinde başlangıç konumu, sıfır sayaçlar; çizgi sensörleri A0 en solda', () => {
    const sc = easyLine()
    const s = idleSnapshot(sc) as RoverSnapshot
    expect(s.x).toBe(1); expect(s.y).toBe(0.7); expect(s.timeS).toBe(0); expect(s.collisions).toBe(0); expect(s.finishedAtS).toBeNull()
    expect(s.line.map((l) => l.pin)).toEqual([0, 1, 2, 3, 4]); expect(s.line[0].y).toBeGreaterThan(s.line[4].y)
  })
  it('kol sahnesinde nesneler başlangıç yerinde, kol dik yukarıda', () => {
    const sc = armScene({ objects: [{ id: 'n', x: 16, y: 2 }] })
    const s = idleSnapshot(sc)
    expect(s.kind).toBe('arm')
    if (s.kind === 'arm') { expect(s.objects).toEqual([{ id: 'n', x: 16, y: 2 }]); expect(s.tipY).toBe(20); expect(s.held).toBeNull() }
  })
  it('tampon ve enkoder aynı sahnede olamaz (ikisi de D2/D3)', () => {
    expect(() => roverScene({ id: 'x', title: 'x', sensors: { bumpers: true, encoders: true } })).toThrow(/aynı anda/)
  })
  it('hazır sahneler arena içinde başlar, bölge kimlikleri benzersizdir', () => {
    for (const sc of [easyLine(), hardLine(), maze(), flatRoad()]) {
      expect(sc.pose.x).toBeGreaterThan(0); expect(sc.pose.x).toBeLessThan(sc.width)
      expect(new Set(sc.zones.map((z) => z.id)).size).toBe(sc.zones.length)
    }
  })
  it('withScene bağımsız kopya üretir', () => {
    const a = easyLine(), b = withScene(a, { id: 'baska' })
    b.zones.push({ id: 'yeni', kind: 'target', x: 0, y: 0, r: 1 })
    expect(a.zones.some((z) => z.id === 'yeni')).toBe(false); expect(b.id).toBe('baska')
  })
  it('labirentin çıkışı sahnede bir bölge ve engeller çerçevenin içindedir', () => {
    const m = maze()
    expect(m.zones.some((z) => z.kind === 'goal')).toBe(true)
    for (const w of m.walls) for (const v of [w[0], w[2]]) { expect(v).toBeGreaterThanOrEqual(0); expect(v).toBeLessThanOrEqual(m.width) }
  })
})
