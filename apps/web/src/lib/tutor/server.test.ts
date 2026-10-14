import { beforeAll, describe, expect, it } from 'vitest'
import { eq, lessons, modules, tutorMessages, users, weeks, type Db } from '@ask/db'
import { createTestDb } from '@/lib/test-db'
import { countUserMessagesToday, loadTutorLesson, loadTutorUser, saveTutorExchange, tutorGate } from './server'

let db: Db
let lessonId: number
let draftLessonId: number
let userId: string

beforeAll(async () => {
  db = await createTestDb()
  const [m] = await db.insert(modules).values({ slug: 'robi-test', title: 'Robi Test', track: 'maker', position: 99, minAge: 12, published: true }).returning()
  const [d] = await db.insert(modules).values({ slug: 'robi-taslak', title: 'Taslak', track: 'maker', position: 100, published: false }).returning()
  const [w] = await db.insert(weeks).values({ moduleId: m.id, position: 1, title: 'H1' }).returning()
  const [wd] = await db.insert(weeks).values({ moduleId: d.id, position: 1, title: 'H1' }).returning()
  const steps = [{ kind: 'choice' as const, prompt: 'S?', options: ['a', 'b'], answer: 1, why: 'çünkü' }]
  ;[{ id: lessonId }] = await db.insert(lessons).values({ weekId: w.id, position: 1, title: 'Ders', steps }).returning({ id: lessons.id })
  ;[{ id: draftLessonId }] = await db.insert(lessons).values({ weekId: wd.id, position: 1, title: 'Gizli', steps }).returning({ id: lessons.id })
  ;[{ id: userId }] = await db.insert(users).values({ email: 'robi@test.tr', name: 'Ada', birthYear: 2016 }).returning({ id: users.id })
}, 60_000)

describe('tutor/server', () => {
  it('yalnız yayındaki dersi adımlarıyla yükler', async () => {
    const l = await loadTutorLesson(db, lessonId)
    expect(l?.steps).toHaveLength(1)
    expect(l?.moduleTitle).toBe('Robi Test')
    expect(l?.minAge).toBe(12)
    expect(await loadTutorLesson(db, draftLessonId)).toBeNull()
    expect(await loadTutorLesson(db, 999_999)).toBeNull()
  })

  it('yaş doğum yılından', async () => {
    expect(await loadTutorUser(db, userId, new Date('2026-10-14T10:00:00Z'))).toEqual({ age: 10, locale: 'tr' })
  })

  it('kayıt + bugünkü sayım (yalnız öğrenci mesajları, yalnız bugün)', async () => {
    const now = new Date()
    expect(await countUserMessagesToday(db, userId, now)).toBe(0)
    await saveTutorExchange(db, { userId, deviceId: null, lessonId, question: 'İpucu ver', answer: 'Bir düşün', flag: null })
    await saveTutorExchange(db, { userId, deviceId: null, lessonId, question: 'kötü', answer: 'Derse dönelim', flag: 'refusal' })
    await db.insert(tutorMessages).values({ userId, lessonId, role: 'user', content: 'dün', createdAt: new Date(now.getTime() - 2 * 86_400_000) })
    expect(await countUserMessagesToday(db, userId, now)).toBe(2)
    const rows = await db.select().from(tutorMessages).where(eq(tutorMessages.flag, 'refusal'))
    expect(rows.map((r) => r.role).sort()).toEqual(['assistant', 'user'])
  })

  it('misafir sohbeti saklanmaz (KVKK)', async () => {
    await saveTutorExchange(db, { userId: null, deviceId: 'abcdefabcdefabcdefabcdefabcdefab', lessonId, question: 'q', answer: 'a', flag: null })
    const rows = await db.select().from(tutorMessages).where(eq(tutorMessages.deviceId, 'abcdefabcdefabcdefabcdefabcdefab'))
    expect(rows).toHaveLength(0)
  })

  it('yetki: paywall kapalıyken misafir ve kullanıcı açık', async () => {
    const prev = process.env.PAYWALL_ENABLED
    delete process.env.PAYWALL_ENABLED
    expect(await tutorGate(db, null)).toEqual({ ok: true })
    expect(await tutorGate(db, userId)).toEqual({ ok: true })
    process.env.PAYWALL_ENABLED = 'true'
    expect(await tutorGate(db, null)).toEqual({ ok: false, reason: 'not_entitled' })
    if (prev === undefined) delete process.env.PAYWALL_ENABLED; else process.env.PAYWALL_ENABLED = prev
  })
})
