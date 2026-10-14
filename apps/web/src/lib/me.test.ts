import { beforeAll, describe, expect, it } from 'vitest'
import { asc, eq, lessons, progress, seedContent, users, xpEvents, type Db } from '@ask/db'
import { emptyGame, recordLesson, recordStep, XP } from './gamification-core'
import { importProgress, loadMe, recordXp, saveUserProfile, syncGame } from './me'
import { createTestDb } from './test-db'

let db: Db
let uid: string
let L: number[]
const NOW = new Date('2026-10-14T10:00:00Z') // İstanbul 13:00
const D = '2026-10-14'
const profile = { who: 'kendim', age: 12, interests: ['robotik', 'ai'], level: 'acemi', goalMin: 15, time: 'aksam', course: 'arduino-temelleri', createdAt: 1_790_000_000_000 }

beforeAll(async () => {
  db = await createTestDb()
  await seedContent(db)
  const [u] = await db.insert(users).values({ email: 'me@example.com', name: 'Ece', role: 'student', username: 'ece.7a' }).returning()
  uid = u.id
  L = (await db.select({ id: lessons.id }).from(lessons).orderBy(asc(lessons.id)).limit(5)).map((r) => r.id)
}, 120_000)

const session = () => ({ id: uid, name: 'Ece', role: 'student', locale: 'tr', username: 'ece.7a' })

describe('/api/me biçimi', () => {
  it('misafir: user null, boş durum', async () => {
    expect(await loadMe(db, null)).toEqual({ user: null, profile: null, game: null, doneLessonIds: [] })
  })
  it('kullanıcı: yalnız izinli alanlar (e-posta yok)', async () => {
    const me = await loadMe(db, session())
    expect(Object.keys(me).sort()).toEqual(['doneLessonIds', 'game', 'profile', 'user'])
    expect(me.user).toEqual({ id: uid, name: 'Ece', role: 'student', locale: 'tr', username: 'ece.7a' })
    expect(me).toMatchObject({ profile: null, game: null, doneLessonIds: [] })
  })
})

describe('profil', () => {
  it('geçerli profili kaydeder, /api/me döndürür; bilinmeyen alanlar atılır', async () => {
    const r = await saveUserProfile(db, uid, { profile: { ...profile, sifre: 'x' } })
    expect(r).toEqual({ ok: true, data: profile })
    expect((await loadMe(db, session())).profile).toEqual(profile)
  })
  it('geçersiz profili reddeder, eskisi kalır', async () => {
    expect(await saveUserProfile(db, uid, { profile: { ...profile, age: 'on iki' } })).toMatchObject({ ok: false, status: 400 })
    expect(await saveUserProfile(db, uid, { profile: { ...profile, course: '../../etc' } })).toMatchObject({ ok: false, status: 400 })
    expect((await loadMe(db, session())).profile).toEqual(profile)
  })
})

describe('oyun eşitleme', () => {
  it('ilk gönderim yazılır; ikinci cihaz birleştirilir; tekrar gönderim XP şişirmez', async () => {
    const a = recordLesson(recordStep(emptyGame(), D, true), D, L[0])
    const r1 = await syncGame(db, uid, { game: a }, NOW)
    expect(r1.ok && r1.data.xp).toBe(35)
    const b = recordStep(recordStep(emptyGame(), '2026-10-13', false), D, false)
    const r2 = await syncGame(db, uid, { game: b }, NOW)
    expect(r2.ok && r2.data.days[D]).toEqual({ xp: 35, correct: 1, lessons: 1 })
    expect(r2.ok && r2.data.xp).toBe(45)
    const r3 = await syncGame(db, uid, { game: b }, NOW)
    expect(r3.ok && r3.data.xp).toBe(45)
    expect((await loadMe(db, session())).game?.xp).toBe(45)
  })
  it('saçma XP sınırlanır (gün başı ≤ 2000), gelecek günler atılır', async () => {
    const r = await syncGame(db, uid, { game: { xp: 1e9, days: { '2026-10-12': { xp: 1e9, correct: 1, lessons: 0 }, '2030-01-01': { xp: 50, correct: 3, lessons: 0 } }, frozen: [], charges: 2, lessonXp: [] } }, NOW)
    expect(r.ok && r.data.days['2026-10-12'].xp).toBe(2000)
    expect(r.ok && r.data.days['2030-01-01']).toBeUndefined()
    expect(r.ok && r.data.xp).toBe(2045)
  })
  it('bozuk gövde 400', async () => {
    expect(await syncGame(db, uid, null, NOW)).toMatchObject({ ok: false, status: 400 })
    expect(await syncGame(db, uid, { game: 'x' }, NOW)).toMatchObject({ ok: false, status: 400 })
  })
})

describe('ilerleme aktarımı', () => {
  it('var olan dersleri tamamlandı yazar, bilinmeyenleri atlar; bugünkü sayaca girmez', async () => {
    const r = await importProgress(db, uid, { lessonIds: [L[1], L[2], 99_999_999] }, NOW)
    expect(r).toEqual({ ok: true, data: [L[1], L[2]] })
    const rows = await db.select().from(progress).where(eq(progress.userId, uid))
    expect(rows.every((p) => p.status === 'completed' && p.startedAt < new Date('2026-10-13T21:00:00Z'))).toBe(true)
    expect((await loadMe(db, session())).doneLessonIds).toEqual([L[1], L[2]])
  })
  it('geçersiz gövde 400', async () => {
    expect(await importProgress(db, uid, { lessonIds: ['1'] })).toMatchObject({ ok: false, status: 400 })
  })
})

describe('XP defteri', () => {
  const sum = async () => (await db.select().from(xpEvents).where(eq(xpEvents.userId, uid))).reduce((n, r) => n + r.amount, 0)
  it('sabitlerle eşleşmeyen tutar ve bilinmeyen kaynak reddedilir', async () => {
    expect(await recordXp(db, uid, { items: [{ source: 'step', amount: 500 }] }, NOW)).toMatchObject({ ok: false, status: 400 })
    expect(await recordXp(db, uid, { items: [{ source: 'lesson', amount: 21, lessonId: L[0] }] }, NOW)).toMatchObject({ ok: false, status: 400 })
    expect(await recordXp(db, uid, { items: [{ source: 'lesson', amount: XP.lesson }] }, NOW)).toMatchObject({ ok: false, status: 400 })
    expect(await recordXp(db, uid, { items: [{ source: 'practice', amount: 15 }] }, NOW)).toMatchObject({ ok: false, status: 400 })
    expect(await recordXp(db, uid, { items: [] }, NOW)).toMatchObject({ ok: false, status: 400 })
    expect(await recordXp(db, uid, { items: Array(21).fill({ source: 'step', amount: 15 }) }, NOW)).toMatchObject({ ok: false, status: 400 })
    expect(await sum()).toBe(0)
  })
  it('geçerli satırlar yazılır; aynı ders aynı gün bir kez', async () => {
    const r = await recordXp(db, uid, { items: [{ source: 'step', amount: XP.firstTry, lessonId: L[0] }, { source: 'step', amount: XP.retry }, { source: 'lesson', amount: XP.lesson, lessonId: L[0] }, { source: 'lesson', amount: XP.lesson, lessonId: L[0] }] }, NOW)
    expect(r).toEqual({ ok: true, data: { stored: 3, dropped: 1 } })
    expect(await recordXp(db, uid, { items: [{ source: 'lesson', amount: XP.lesson, lessonId: L[0] }] }, NOW)).toEqual({ ok: true, data: { stored: 0, dropped: 1 } })
    expect(await sum()).toBe(45)
  })
  it('günlük toplam 2000 XP ile sınırlı', async () => {
    for (let i = 0; i < 8; i++) await recordXp(db, uid, { items: Array(20).fill({ source: 'step', amount: XP.firstTry }) }, NOW)
    expect(await sum()).toBeLessThanOrEqual(2000)
    expect(await sum()).toBeGreaterThan(2000 - XP.firstTry)
    // Ertesi gün yeniden açılır
    const r = await recordXp(db, uid, { items: [{ source: 'step', amount: XP.firstTry }] }, new Date('2026-10-15T10:00:00Z'))
    expect(r).toEqual({ ok: true, data: { stored: 1, dropped: 0 } })
  })
})
