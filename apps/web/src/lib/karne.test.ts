import { beforeAll, describe, expect, it } from 'vitest'
import { users, xpEvents, type Db } from '@ask/db'
import { createTestDb } from './test-db'
import type { CatalogModule } from './catalog'
import type { SkillMastery } from './skills'
import { achievement, buildReportCard, loadXpStats } from './karne'

const mod = (id: number, slug: string, kind: CatalogModule['kind'], weeks: number[][]): CatalogModule => ({
  id, slug, title: slug, position: id, track: 'maker', kind, minAge: null, tagline: '', audience: '',
  weeks: weeks.map((ls, i) => ({ id: id * 100 + i, position: i + 1, title: `H${i + 1}`, project: null,
    lessons: ls.map((l, j) => ({ id: l, title: `D${l}`, durationMin: 20, kind: 'metin' as const, position: j + 1 })) })),
})
const sk = (skill: string, score: number, level: SkillMastery['level']): SkillMastery => ({ skill, score, attempts: 5, confidence: 1, level })

describe('rozet basamakları', () => {
  it('eşiklere göre bronz/gümüş/altın ve bir sonraki hedef', () => {
    expect(achievement('proje', 0)).toEqual({ id: 'proje', value: 0, tier: null, next: 1 })
    expect(achievement('proje', 5)).toMatchObject({ tier: 'gumus', next: 15 })
    expect(achievement('proje', 40)).toMatchObject({ tier: 'altin', next: null })
  })
})

describe('gelişim karnesi', () => {
  const catalog = [
    mod(1, 'robotik', 'robot', [[1, 2], [3]]),
    mod(2, 'mikro-kart', 'blok', [[4]]),
    mod(3, 'scratch', 'blok', [[5]]),
  ]

  it('yalnız tamamen biten hafta proje ve değer sayılır; başlanmamış modül listelenmez', () => {
    const r = buildReportCard(catalog, new Set([1, 2, 3, 4]), [sk('a', 0.9, 'ustalasti'), sk('b', 0.4, 'baslangic')], { total: 120, days: 4 })
    expect(r.modules.map((m) => [m.slug, m.done, m.total, m.weeksDone])).toEqual([['robotik', 3, 3, 2], ['mikro-kart', 1, 1, 1]])
    expect(r.lessonsDone).toBe(4)
    expect(r.weeksDone).toBe(3)
    expect(r.values.map((v) => v.deger)).toEqual(['saygi', 'duyarlilik', 'estetik'])
    expect(r.mastered.map((s) => s.skill)).toEqual(['a'])
    expect(r.developing.map((s) => s.skill)).toEqual(['b'])
    expect(Object.fromEntries(r.achievements.map((a) => [a.id, a.tier]))).toEqual({ proje: 'bronz', beceri: null, duzen: 'bronz', kasif: 'bronz' })
  })

  it('yarım hafta değer saymaz; veri yoksa her şey sıfır', () => {
    const r = buildReportCard(catalog, new Set([1]), [], { total: 0, days: 0 })
    expect(r.weeksDone).toBe(0)
    expect(r.values).toEqual([])
    expect(buildReportCard(catalog, new Set(), [], { total: 0, days: 0 }).modules).toEqual([])
  })
})

describe('XP istatistiği', () => {
  let db: Db
  beforeAll(async () => { db = await createTestDb() })

  it('toplam ve İstanbul gününe göre farklı gün', async () => {
    const [u] = await db.insert(users).values({ name: 'Ö', email: `${crypto.randomUUID()}@t.co` }).returning()
    expect(await loadXpStats(db, u.id)).toEqual({ total: 0, days: 0 })
    await db.insert(xpEvents).values([
      { userId: u.id, amount: 15, source: 'step', at: new Date('2026-10-14T20:30:00Z') }, // 23:30 İstanbul, 14 Ekim
      { userId: u.id, amount: 20, source: 'lesson', at: new Date('2026-10-14T21:30:00Z') }, // 00:30 İstanbul, 15 Ekim
      { userId: u.id, amount: 10, source: 'step', at: new Date('2026-10-15T08:00:00Z') },
    ])
    expect(await loadXpStats(db, u.id)).toEqual({ total: 45, days: 2 })
  })
})
