import { describe, expect, it } from 'vitest'
import type { CatalogModule } from './catalog'
import { badges, buildEvents, computeStats, continueTarget, countDone, formatMinutes, lessonStatus, moduleState, overallProgress, recommendNext } from './dashboard'

const L = (id: number, position: number, durationMin = 10) => ({ id, title: `Ders ${id}`, durationMin, kind: 'metin' as const, position })
const mod = (id: number, position: number, weeks: number[][]): CatalogModule => ({
  id, slug: `m${id}`, title: `Modül ${id}`, position, track: 'maker', kind: 'devre', minAge: 12, tagline: '', audience: '',
  weeks: weeks.map((ids, wi) => ({ id: id * 10 + wi, position: wi + 1, title: `H${wi + 1}`, project: null, lessons: ids.map((i, li) => L(i, li + 1)) })),
})
const cat = [mod(2, 2, [[21, 22]]), mod(1, 1, [[1, 2, 3], [4, 5]])]
const set = (...n: number[]) => new Set(n)

describe('ilerleme hesapları', () => {
  it('countDone yüzdeyi yuvarlar, boş listede 0', () => {
    expect(countDone([1, 2, 3], set(1))).toEqual({ done: 1, total: 3, pct: 33 })
    expect(countDone([], set(1))).toEqual({ done: 0, total: 0, pct: 0 })
  })
  it('overallProgress tüm modülleri sayar', () => {
    expect(overallProgress(cat, set(1, 2, 21, 99))).toMatchObject({ done: 3, total: 7 })
  })
  it('moduleState ve lessonStatus', () => {
    expect(moduleState([1, 2], set())).toBe('yok')
    expect(moduleState([1, 2], set(1))).toBe('suruyor')
    expect(moduleState([1, 2], set(1, 2))).toBe('bitti')
    expect(moduleState([1, 2], set(), { '2': 5 })).toBe('suruyor')
    expect(moduleState([], set())).toBe('yok')
    expect(lessonStatus(1, set(1))).toBe('bitti')
    expect(lessonStatus(1, set(), { '1': 1 })).toBe('suruyor')
    expect(lessonStatus(1, set())).toBe('yok')
  })
})

describe('devam noktası ve öneri', () => {
  it('veri yokken müfredattaki ilk ders (modül sırasına göre)', () => {
    const t = continueTarget(cat, set())!
    expect(t.item.lesson.id).toBe(1)
    expect(t.mode).toBe('start')
  })
  it('son açılan ders bitmediyse onu önerir', () => {
    const t = continueTarget(cat, set(1), { '3': 100, '2': 50 })!
    expect(t.item.lesson.id).toBe(3)
    expect(t.mode).toBe('resume')
  })
  it('son açılan ders bittiyse sonrakini önerir, modül sınırını aşar', () => {
    expect(continueTarget(cat, set(1, 2, 3, 4, 5), { '5': 9 })!.item.lesson.id).toBe(21)
    expect(continueTarget(cat, set(1, 2), { '2': 9 })!.item).toMatchObject({ lesson: { id: 3 } })
  })
  it('hepsi bitince null', () => {
    expect(continueTarget(cat, set(1, 2, 3, 4, 5, 21, 22))).toBeNull()
  })
  it('recommendNext devam noktasından başlayıp yapılanları atlar', () => {
    const ids = recommendNext(cat, set(2), { '3': 5 }, 4).map((f) => f.lesson.id)
    expect(ids).toEqual([3, 4, 5, 21])
    expect(recommendNext(cat, set(), {}, 3).map((f) => f.lesson.id)).toEqual([1, 2, 3])
    expect(recommendNext(cat, set(1, 2, 3, 4, 5, 21, 22))).toEqual([])
  })
})

describe('istatistik, rozet, etkinlik', () => {
  it('computeStats yalnız müfredattaki dersleri sayar, süreyi toplar', () => {
    expect(computeStats(cat, set(1, 2, 999), { '1': 1, '777': 1 })).toEqual({ lessonsDone: 2, goalLessons: 1, minutes: 20 })
    expect(computeStats(cat, set())).toEqual({ lessonsDone: 0, goalLessons: 0, minutes: 0 })
  })
  it('formatMinutes', () => {
    expect(formatMinutes(45)).toBe('45 dk')
    expect(formatMinutes(120)).toBe('2 sa')
    expect(formatMinutes(95)).toBe('1 sa 35 dk')
  })
  it('rozetler gerçek veriden türetilir', () => {
    const none = badges(cat, set())
    expect(none.every((b) => !b.earned)).toBe(true)
    const some = badges(cat, set(21, 22), { '21': 1 })
    expect(some.find((b) => b.id === 'ilk-ders')!.earned).toBe(true)
    expect(some.find((b) => b.id === 'ilk-hedef')!.earned).toBe(true)
    expect(some.find((b) => b.id === 'modul-m2')!.earned).toBe(true)
    expect(some.find((b) => b.id === 'modul-m1')!.earned).toBe(false)
  })
  it('buildEvents yeniden eskiye sıralar, tamamlanmış dersin açma kaydını gizler, bilinmeyen dersi atar', () => {
    const ev = buildEvents(cat, { opened: { '1': 10, '2': 30, '999': 50 }, goals: { '2': 20 }, finished: { '1': 40, '5': 5 } }, set(1), 10)
    expect(ev.map((e) => e.key)).toEqual(['done:1', 'open:2', 'goals:2'])
  })
})
