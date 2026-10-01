import { beforeAll, describe, expect, it } from 'vitest'
import { allModules, lessons, modules, progress, seedContent, users, weeks, type Db } from '@ask/db'
import { completeLesson, getCompletedLessonIds, getLessonContext, getModuleTree, listModules } from './content'
import { createTestDb } from './test-db'

let db: Db
let userId: string

beforeAll(async () => {
  db = await createTestDb()
  await seedContent(db)
  const [u] = await db.insert(users).values({ email: 't@t.co', passwordHash: 'x', name: 'T' }).returning()
  userId = u.id
})

describe('içerik verisi', () => {
  it('her ders problem, etkinlik ve soru içerir', () => {
    for (const m of allModules)
      for (const w of m.weeks)
        for (const l of w.lessons) {
          expect(l.title.length, l.title).toBeGreaterThan(0)
          expect(l.problem.length, `${l.title} problem`).toBeGreaterThan(10)
          expect(l.contentMd.length, `${l.title} içerik`).toBeGreaterThan(100)
          expect(l.question.length, `${l.title} soru`).toBeGreaterThan(10)
          expect(l.durationMin).toBeGreaterThanOrEqual(15)
          expect(l.durationMin).toBeLessThanOrEqual(60)
        }
  })
  it('Modül 2: 8 hafta, 16 ders', () => {
    const m = allModules.find((x) => x.slug === 'scratch')!
    expect(m.weeks).toHaveLength(8)
    expect(m.weeks.flatMap((w) => w.lessons)).toHaveLength(16)
    expect(m.minAge).toBe(8)
  })
  it('Modül 3: 7 hafta, 35 ders, her derste en az bir sketch', () => {
    const m = allModules.find((x) => x.slug === 'arduino-temelleri')!
    expect(m.weeks).toHaveLength(7)
    const lessons = m.weeks.flatMap((w) => w.lessons)
    expect(lessons).toHaveLength(35)
    // 01 ve 02 saf kavram dersleri: sketch zorunlu değil
    const withSketch = lessons.filter((l) => l.contentMd.includes('// sketch:'))
    expect(withSketch.length).toBeGreaterThanOrEqual(30)
    expect(m.track).toBe('maker')
  })
  it('modül konumları ve slug\'lar benzersiz', () => {
    expect(new Set(allModules.map((m) => m.slug)).size).toBe(allModules.length)
    expect(new Set(allModules.map((m) => m.position)).size).toBe(allModules.length)
  })
  it('Modül 1: 5 hafta, 10 ders', () => {
    const m = allModules.find((x) => x.slug === 'scratchjr')!
    expect(m.weeks).toHaveLength(5)
    expect(m.weeks.flatMap((w) => w.lessons)).toHaveLength(10)
  })
})

describe('seed', () => {
  it('tekrar çalıştırınca kayıt çoğaltmaz', async () => {
    const count = async () => [
      (await db.select().from(modules)).length,
      (await db.select().from(weeks)).length,
      (await db.select().from(lessons)).length,
    ]
    const before = await count()
    await seedContent(db)
    expect(await count()).toEqual(before)
    expect(before).toEqual([3, 20, 61])
  })
  it('içerik değişince günceller', async () => {
    const changed = structuredClone(allModules)
    changed[0].title = 'Yeni başlık'
    await seedContent(db, changed)
    expect((await listModules(db))[0].title).toBe('Yeni başlık')
    await seedContent(db) // geri al
    expect((await listModules(db))[0].title).toBe(allModules[0].title)
  })
  it('yayından kaldırılan modülü yeniden açmaz', async () => {
    await db.update(modules).set({ published: false })
    await seedContent(db)
    expect(await listModules(db)).toHaveLength(0)
    expect(await getModuleTree(db, 'scratchjr')).toBeNull()
    await db.update(modules).set({ published: true })
  })
})

describe('sorgular', () => {
  it('modül ağacı sıralı gelir', async () => {
    const t = (await getModuleTree(db, 'scratchjr'))!
    expect(t.weeks.map((w) => w.position)).toEqual([1, 2, 3, 4, 5])
    expect(t.weeks[0].lessons.map((l) => l.position)).toEqual([1, 2])
    expect(t.weeks[0].lessons[0].title).toBe('Robot oyunu (ekransız)')
  })
  it('olmayan modül null döner', async () => {
    expect(await getModuleTree(db, 'yok')).toBeNull()
  })
  it('önceki/sonraki ders doğru, ilk ve son uçta null', async () => {
    const t = (await getModuleTree(db, 'scratchjr'))!
    const flat = t.weeks.flatMap((w) => w.lessons)
    const first = (await getLessonContext(db, flat[0].id))!
    expect(first.prev).toBeNull()
    expect(first.next?.id).toBe(flat[1].id)
    expect(first.index).toBe(1)
    const mid = (await getLessonContext(db, flat[3].id))!
    expect(mid.prev?.id).toBe(flat[2].id)
    expect(mid.next?.id).toBe(flat[4].id)
    const last = (await getLessonContext(db, flat[9].id))!
    expect(last.next).toBeNull()
    expect(last.total).toBe(10)
  })
  it('olmayan ders null döner', async () => {
    expect(await getLessonContext(db, 999999)).toBeNull()
  })
})

describe('ilerleme', () => {
  it('dersi tamamlar, tekrar çağrılınca çoğaltmaz, kaydı oluşturur', async () => {
    const t = (await getModuleTree(db, 'scratchjr'))!
    const id = t.weeks[0].lessons[0].id
    expect(await completeLesson(db, userId, id)).toBe(true)
    expect(await completeLesson(db, userId, id)).toBe(true)
    expect(await db.select().from(progress)).toHaveLength(1)
    expect((await getCompletedLessonIds(db, userId, [id, id + 1])).has(id)).toBe(true)
    expect((await getCompletedLessonIds(db, userId, [id + 1])).size).toBe(0)
  })
  it('olmayan veya yayında olmayan dersi tamamlatmaz', async () => {
    expect(await completeLesson(db, userId, 999999)).toBe(false)
    await db.update(modules).set({ published: false })
    const t = (await getModuleTree(db, 'scratchjr').catch(() => null))
    expect(t).toBeNull()
    const [l] = await db.select().from(lessons).limit(1)
    expect(await completeLesson(db, userId, l.id)).toBe(false)
    await db.update(modules).set({ published: true })
  })
  it('başka kullanıcının ilerlemesini görmez', async () => {
    const [other] = await db.insert(users).values({ email: 'o@o.co', passwordHash: 'x', name: 'O' }).returning()
    const t = (await getModuleTree(db, 'scratchjr'))!
    expect((await getCompletedLessonIds(db, other.id, t.weeks[0].lessons.map((l) => l.id))).size).toBe(0)
  })
})
