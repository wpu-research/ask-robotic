import { describe, expect, it } from 'vitest'
import { allArenaActivities, getArenaActivity } from './activity'
import { evaluateArenaGoals, idleSnapshot } from './goals'
import { lessonOf, solutionOf } from './test-support'

const entries = allArenaActivities()

describe('arena etkinlikleri: yapı', () => {
  it('en az bir etkinlik var', () => expect(entries.length).toBeGreaterThan(0))

  it('Hafta 1-3 (ders 76-90) her dersin etkinliği vardır', () => {
    for (let w = 1; w <= 3; w++) for (let l = 1; l <= 5; l++) expect(getArenaActivity(`robotik:${w}:${l}`), `robotik:${w}:${l}`).not.toBeNull()
  })

  it('her anahtar Modül 5\'in gerçek bir hafta/ders konumudur', () => {
    for (const [k] of entries) {
      const [slug] = k.split(':')
      expect(slug).toBe('robotik')
      expect(lessonOf(k), k).toBeTruthy()
    }
  })

  it('getArenaActivity bilinmeyen anahtarda null döner', () => {
    expect(getArenaActivity('yok:1:1')).toBeNull()
    expect(getArenaActivity('robotik:99:99')).toBeNull()
    expect(getArenaActivity(null)).toBeNull()
    expect(getArenaActivity('arduino-temelleri:1:3')).toBeNull()
  })

  for (const [k, a] of entries) {
    describe(k, () => {
      it('sahne tutarlı: tampon/enkoder çakışmaz, robot arena içinde, bölgeler arena içinde', () => {
        const sc = a.scene
        expect(new Set(sc.kind === 'balancer' ? [] : sc.zones.map((z) => z.id)).size).toBe(sc.kind === 'balancer' ? 0 : sc.zones.length)
        if (sc.kind === 'rover') {
          expect(sc.sensors.bumpers && sc.sensors.encoders).toBeFalsy()
          expect(sc.pose.x).toBeGreaterThan(0.08); expect(sc.pose.x).toBeLessThan(sc.width - 0.08)
          expect(sc.pose.y).toBeGreaterThan(0.08); expect(sc.pose.y).toBeLessThan(sc.height - 0.08)
          for (const z of sc.zones) { expect(z.x).toBeGreaterThanOrEqual(0); expect(z.x).toBeLessThanOrEqual(sc.width); expect(z.y).toBeGreaterThanOrEqual(0); expect(z.y).toBeLessThanOrEqual(sc.height) }
          for (const b of sc.buttons ?? []) expect([2, 3].includes(b.pin) ? !sc.sensors.bumpers && !sc.sensors.encoders : true).toBe(true)
        }
      })
      it('3-6 hedef, kimlikler benzersiz, en az biri davranış hedefi', () => {
        expect(a.goals.length).toBeGreaterThanOrEqual(3); expect(a.goals.length).toBeLessThanOrEqual(6)
        expect(new Set(a.goals.map((g) => g.id)).size).toBe(a.goals.length)
        expect(a.goals.some((g) => g.behavior)).toBe(true)
      })
      it('starter() her çağrıda aynı metni üretir ve boş değildir', () => {
        expect(a.starter().length).toBeGreaterThan(40); expect(a.starter()).toBe(a.starter())
      })
      it('çözüm kaynağı bulunur', () => { expect(solutionOf(k, a).length).toBeGreaterThan(40) })
      it('başlangıçta (çalıştırmadan) tüm hedefler sağlanmaz', () => {
        const res = evaluateArenaGoals(a.goals, { snap: idleSnapshot(a.scene), started: false, code: a.starter(), scene: a.scene })
        expect(res.every((r) => r.done)).toBe(false)
        expect(res.some((r) => r.done && a.goals.find((g) => g.id === r.id)?.behavior)).toBe(false)
      })
    })
  }
})
