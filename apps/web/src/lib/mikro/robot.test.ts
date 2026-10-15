import { describe, expect, it } from 'vitest'
import { DriveBase, type RobotScene } from './robot'
import { rectWalls } from '../arena/geometry'

const scene = (o: Partial<RobotScene> = {}): RobotScene => ({
  id: 't', title: 't', width: 2, height: 1, walls: rectWalls(0, 0, 2, 1), lines: [], patches: [], zones: [],
  pose: { x: 0.3, y: 0.5, theta: 0 }, ...o,
})

const run = (r: DriveBase, ms: number, from = 0) => { for (let t = from; t <= from + ms; t += 10) r.advanceTo(t); return from + ms }

describe('sürüş tabanı', () => {
  it('50 cm ileri gider ve fren yapar (±1 cm)', () => {
    for (const p of ['blok', 'gezgin'] as const) {
      const r = new DriveBase(p, scene())
      r.move(50)
      run(r, 5000)
      expect(r.busy).toBe(false)
      expect(r.x - 0.3).toBeGreaterThan(0.49)
      expect(r.x - 0.3).toBeLessThan(0.51)
      expect(Math.abs(r.y - 0.5)).toBeLessThan(0.001)
    }
  })

  it('geri gider; 90 derece sola ve sağa döner (±2°)', () => {
    const r = new DriveBase('blok', scene({ pose: { x: 1, y: 0.5, theta: 0 } }))
    r.move(-20); let t = run(r, 3000)
    expect(r.x).toBeCloseTo(0.8, 2)
    r.turn(90); t = run(r, 3000, t)
    expect(Math.abs(r.headingDeg - 90)).toBeLessThanOrEqual(2)
    r.turn(-180); run(r, 4000, t)
    expect(Math.abs(r.headingDeg + 90)).toBeLessThanOrEqual(3)
    expect(r.turnedDeg).toBeGreaterThan(265)
  })

  it('duvardan geçmez, çarpmayı sayar; mesafe ve tampon sensörü', () => {
    const r = new DriveBase('blok', scene())
    expect(r.distanceCm).toBeGreaterThan(160)
    r.setMotors(60, 60)
    run(r, 8000)
    expect(r.x).toBeLessThanOrEqual(2 - r.profile.radius + 1e-6)
    expect(r.collisions).toBe(1)
    expect(r.pressed).toBe(true)
    expect(r.distanceCm).toBeLessThan(3)
  })

  it('renk ve çizgi sensörleri zemini okur', () => {
    const r = new DriveBase('blok', scene({ patches: [{ x1: 0.3, y1: 0.4, x2: 0.5, y2: 0.6, color: 'kirmizi' }] }))
    expect(r.color).toBe('kirmizi')
    expect(r.reflect).toBe(58)
    const g = new DriveBase('gezgin', scene({ lines: [[[0, 0.515], [2, 0.515]]], lineWidth: 0.02 }))
    expect(g.lineOn('left')).toBe(true)
    expect(g.lineOn('right')).toBe(false)
  })

  it('açılar sıfırlanabilir; motor açısı tekerlek dönüşünü verir', () => {
    const r = new DriveBase('gezgin', scene())
    r.move(10); run(r, 2000)
    const expected = (0.1 / (Math.PI * 0.043)) * 360
    expect(Math.abs(r.motorDegL - expected)).toBeLessThan(6)
    r.resetAngles()
    expect(r.motorDegL).toBe(0)
    expect(r.headingDeg).toBe(0)
  })
})
