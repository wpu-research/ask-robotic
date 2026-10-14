import { beforeAll, describe, expect, it } from 'vitest'
import { and, eq, lessons, progress, seedContent, users, type Db, type ModuleContent } from '@ask/db'
import { checkLessonAccess, paywallCopy, recordLessonOpen } from './paywall'
import { startTrial } from './billing'
import { createTestDb } from './test-db'

let db: Db
const now = new Date('2026-10-14T10:00:00Z')
const ders = (title: string) => ({ title, durationMin: 20, problem: 'P', contentMd: 'C', question: 'Q' })
const icerik: ModuleContent[] = [{
  slug: 'pw-modul', title: 'PW', track: 'maker', position: 98, minAge: 10,
  weeks: [
    { title: 'H1', project: 'P', lessons: [ders('PW-H1-D1')] },
    { title: 'H2', project: 'P', lessons: [ders('PW-H2-D1'), ders('PW-H2-D2'), ders('PW-H2-D3')] },
  ],
}]
let id: (t: string) => number
const yeni = async () => (await db.insert(users).values({ name: 'K', email: `${crypto.randomUUID()}@t.co` }).returning())[0]

beforeAll(async () => {
  db = await createTestDb()
  await seedContent(db, icerik)
  const rows = await db.select({ id: lessons.id, title: lessons.title }).from(lessons)
  id = (t) => rows.find((r) => r.title === t)!.id
})

describe('paywall kararı', () => {
  it('PAYWALL kapalıyken her ders açık, kayıt yazılmaz', async () => {
    const u = await yeni()
    const g = await checkLessonAccess(db, u.id, id('PW-H2-D1'), { now, paywall: false })
    expect(g.decision).toEqual({ ok: true, reason: 'paywall_off' })
    expect(await db.select().from(progress).where(eq(progress.userId, u.id))).toHaveLength(0)
  })
  it('misafir: ilk hafta açık, sonrası login_required', async () => {
    expect((await checkLessonAccess(db, null, id('PW-H1-D1'), { now, paywall: true })).decision).toMatchObject({ ok: true, reason: 'first_week' })
    expect(await checkLessonAccess(db, null, id('PW-H2-D1'), { now, paywall: true })).toMatchObject({ decision: { ok: false, reason: 'login_required' }, trialAvailable: false })
  })
  it('ücretsiz kullanıcı: günde 1 yeni ders; açılış progress\'e yazılır, aynı ders yeniden açılır', async () => {
    const u = await yeni()
    const a = await checkLessonAccess(db, u.id, id('PW-H2-D1'), { now, paywall: true })
    expect(a.decision).toMatchObject({ ok: true, reason: 'free_quota' })
    const [row] = await db.select().from(progress).where(and(eq(progress.userId, u.id), eq(progress.lessonId, id('PW-H2-D1'))))
    expect(row).toMatchObject({ status: 'started', startedAt: now })
    expect((await checkLessonAccess(db, u.id, id('PW-H2-D1'), { now, paywall: true })).decision).toMatchObject({ ok: true, reason: 'already_opened' })
    expect(await checkLessonAccess(db, u.id, id('PW-H2-D2'), { now, paywall: true })).toMatchObject({ decision: { ok: false, reason: 'daily_limit' }, trialAvailable: true })
    // Ertesi gün (İstanbul) yeni hak
    const yarin = new Date('2026-10-14T21:30:00Z')
    expect((await checkLessonAccess(db, u.id, id('PW-H2-D2'), { now: yarin, paywall: true })).decision).toMatchObject({ ok: true, reason: 'free_quota' })
  })
  it('deneme açılınca sınırsız; denemede açılanlar sonra kotaya sayılır', async () => {
    const u = await yeni()
    await checkLessonAccess(db, u.id, id('PW-H2-D1'), { now, paywall: true }) // ücretsiz hak, yazılır
    await startTrial(db, u.id, now)
    expect((await checkLessonAccess(db, u.id, id('PW-H2-D2'), { now, paywall: true })).decision).toMatchObject({ ok: true, reason: 'plan' })
    expect((await checkLessonAccess(db, u.id, id('PW-H2-D3'), { now, paywall: true })).decision).toMatchObject({ ok: true, reason: 'plan' })
    // Plan erişimiyle açılış yazılmaz (deneme sonrası bedava kalmasın)
    expect(await db.select().from(progress).where(eq(progress.userId, u.id))).toHaveLength(1)

    const sonra = new Date(now.getTime() + 10 * 86_400_000)
    expect((await checkLessonAccess(db, u.id, id('PW-H2-D2'), { now: sonra, paywall: true })).decision).toMatchObject({ ok: true, reason: 'free_quota' })
    expect(await checkLessonAccess(db, u.id, id('PW-H2-D3'), { now: sonra, paywall: true })).toMatchObject({ decision: { ok: false, reason: 'daily_limit' }, trialAvailable: false })
    // Ürün kararı: daha önce açılmış ders, bugünkü hak bitse de açık kalır
    expect((await checkLessonAccess(db, u.id, id('PW-H2-D1'), { now: sonra, paywall: true })).decision).toMatchObject({ ok: true, reason: 'already_opened' })
  })
  it('recordLessonOpen tamamlanmış satıra dokunmaz', async () => {
    const u = await yeni()
    const completedAt = new Date('2026-10-01T00:00:00Z')
    await db.insert(progress).values({ userId: u.id, lessonId: id('PW-H1-D1'), status: 'completed', startedAt: completedAt, completedAt })
    await recordLessonOpen(db, u.id, id('PW-H1-D1'), now)
    const [r] = await db.select().from(progress).where(eq(progress.userId, u.id))
    expect(r).toMatchObject({ status: 'completed', startedAt: completedAt })
  })
})

describe('paywall metni', () => {
  it('günlük sınır: "Bugünkü ücretsiz dersini kullandın" + yarın gel', () => {
    const c = paywallCopy('daily_limit', { loggedIn: true, trialAvailable: true })
    expect(c).toMatchObject({ title: 'Bugünkü ücretsiz dersini kullandın', primary: { action: 'trial', label: '7 gün ücretsiz dene' }, secondary: { href: '/fiyatlar' }, comeBack: true })
    expect(paywallCopy('daily_limit', { loggedIn: true, trialAvailable: false }).primary).toEqual({ label: 'Planları gör', action: 'plans' })
  })
  it('misafir: "Bu ders Premium\'da", kayda yönlendirir', () => {
    const c = paywallCopy('login_required', { loggedIn: false, trialAvailable: false })
    expect(c).toMatchObject({ title: "Bu ders Premium'da", primary: { action: 'register' }, comeBack: false })
  })
})
