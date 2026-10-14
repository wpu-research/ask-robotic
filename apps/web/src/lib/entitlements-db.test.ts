import { beforeAll, describe, expect, it } from 'vitest'
import {
  assignments, classes, classMembers, eq, lessons, licenses, organizationMembers, organizations, plans, progress,
  seedContent, sql, subscriptionMembers, subscriptions, users, type Db, type LessonStep, type ModuleContent,
} from '@ask/db'
import { resolveAccess } from './entitlements'
import { loadAccessContext, loadLessonRef, loadLessonUsage } from './entitlements-db'
import { createTestDb } from './test-db'

let db: Db
const now = new Date('2026-10-14T10:00:00Z')
const gun = 24 * 60 * 60 * 1000

const adimlar: LessonStep[] = [
  { kind: 'intro', title: 'Merhaba', body: 'LED yakalım.' },
  { kind: 'choice', prompt: '5V / 250Ω = ?', options: ['20 mA', '2 mA'], answer: 0, why: 'I = V / R' },
]
const ders = (title: string, steps?: LessonStep[]) => ({
  title, durationMin: 20, problem: 'Neden yanmıyor?', contentMd: 'Etkinlik', question: 'Ne öğrendin?', steps,
})
const icerik: ModuleContent[] = [{
  slug: 'test-modul', title: 'Test', track: 'maker', position: 99, minAge: 10,
  weeks: [
    { title: 'H1', project: 'P1', lessons: [ders('D1', adimlar), ders('D2')] },
    { title: 'H2', project: 'P2', lessons: [ders('D3')] },
  ],
}]

const yeniKullanici = async (o: Partial<typeof users.$inferInsert> = {}) =>
  (await db.insert(users).values({ name: 'K', email: `${crypto.randomUUID()}@t.co`, ...o }).returning())[0]

beforeAll(async () => {
  db = await createTestDb()
  await seedContent(db, icerik)
})

describe('0003 okul/üyelik migrasyonu', () => {
  it('yeni tablolar var', async () => {
    const r = await db.execute<{ table_name: string }>(sql`select table_name from information_schema.tables where table_schema = 'public'`)
    const names = new Set((r as unknown as { rows: { table_name: string }[] }).rows.map((x) => x.table_name))
    for (const t of [
      'organizations', 'campuses', 'organization_members', 'classes', 'class_members', 'assignments', 'plans',
      'subscriptions', 'subscription_members', 'licenses', 'guardian_links', 'consents', 'xp_events',
    ]) expect(names.has(t), t).toBe(true)
  })
  it('varsayılan planlar yazılı', async () => {
    const rows = await db.select().from(plans)
    expect(rows.map((p) => p.id).sort()).toEqual(['family', 'free', 'premium', 'school'])
    expect(rows.find((p) => p.id === 'school')?.features).toContain('class_leagues')
  })
  it('seedContent adımları (steps) yazar, adımsız derste null', async () => {
    const rows = await db.select({ title: lessons.title, steps: lessons.steps }).from(lessons)
    expect(rows.find((r) => r.title === 'D1')?.steps).toEqual(adimlar)
    expect(rows.find((r) => r.title === 'D2')?.steps).toBeNull()
    // Tekrar çalıştırınca günceller
    await seedContent(db, [{ ...icerik[0], weeks: [{ ...icerik[0].weeks[0], lessons: [ders('D1', adimlar.slice(0, 1)), ders('D2')] }, icerik[0].weeks[1]] }])
    const [d1] = await db.select({ steps: lessons.steps }).from(lessons).where(eq(lessons.title, 'D1'))
    expect(d1.steps).toHaveLength(1)
  })
  it('e-postasız öğrenci kullanıcı adıyla açılır; ikisi de yoksa reddedilir', async () => {
    const u = await yeniKullanici({ email: null, username: 'ada.k-7b', loginMode: 'qr', birthYear: 2018 })
    expect(u).toMatchObject({ locale: 'tr', loginMode: 'qr', passwordHash: null })
    await expect(db.insert(users).values({ name: 'X' })).rejects.toThrow()
  })
  it('ödev tek hedefli olmalı (CHECK)', async () => {
    const [org] = await db.insert(organizations).values({ name: 'Kolej', slug: 'kolej-odev' }).returning()
    const [cls] = await db.insert(classes).values({ organizationId: org.id, name: '7-B', joinCode: 'ODEV01' }).returning()
    const [l] = await db.select().from(lessons).limit(1)
    await db.insert(assignments).values({ classId: cls.id, lessonId: l.id })
    await expect(db.insert(assignments).values({ classId: cls.id })).rejects.toThrow()
    await expect(db.insert(assignments).values({ classId: cls.id, lessonId: l.id, weekId: l.weekId })).rejects.toThrow()
  })
})

describe('loadAccessContext', () => {
  it('kullanıcı yoksa misafir', async () => {
    expect(await loadAccessContext(db, null)).toEqual({ user: null })
    expect(await loadAccessContext(db, crypto.randomUUID())).toEqual({ user: null })
  })
  it('aile üyesi aboneliği ve sınıf üzerinden okul lisansı yüklenir', async () => {
    const sahip = await yeniKullanici({ role: 'parent' })
    const cocuk = await yeniKullanici()
    const [sub] = await db.insert(subscriptions).values({
      userId: sahip.id, planId: 'family', status: 'active', provider: 'manual', currentPeriodEnd: new Date(now.getTime() + gun),
    }).returning()
    await db.insert(subscriptionMembers).values({ subscriptionId: sub.id, userId: cocuk.id })

    const [org] = await db.insert(organizations).values({ name: 'Kolej', slug: 'kolej-a' }).returning()
    const [cls] = await db.insert(classes).values({ organizationId: org.id, name: '5-A', joinCode: 'ABC123' }).returning()
    await db.insert(classMembers).values({ classId: cls.id, userId: cocuk.id })
    await db.insert(licenses).values({
      organizationId: org.id, seats: 30, startsAt: new Date(now.getTime() - gun), endsAt: new Date(now.getTime() + gun),
      scope: { modules: ['test-modul'] },
    })

    const ctx = await loadAccessContext(db, cocuk.id)
    expect(ctx.subscriptions).toHaveLength(1)
    expect(ctx.orgLicenses).toMatchObject([{ organizationId: org.id, planId: 'school', memberRole: 'student', scope: { modules: ['test-modul'] } }])
    const a = resolveAccess({ ...ctx, now, paywall: true })
    expect(a.plan).toBe('school')
    expect(a.has('unlimited_lessons')).toBe(true)
  })
  it('kurumda yönetici olan öğretmen en güçlü rolle gelir, arşiv sınıf sayılmaz', async () => {
    const t = await yeniKullanici({ role: 'teacher' })
    const [org] = await db.insert(organizations).values({ name: 'Kolej B', slug: 'kolej-b' }).returning()
    await db.insert(organizationMembers).values({ organizationId: org.id, userId: t.id, role: 'admin' })
    const [cls] = await db.insert(classes).values({ organizationId: org.id, name: 'Eski', joinCode: 'OLD999', archived: true }).returning()
    await db.insert(classMembers).values({ classId: cls.id, userId: t.id, role: 'teacher' })
    await db.insert(licenses).values({ organizationId: org.id, seats: 10, startsAt: new Date(now.getTime() - gun), endsAt: new Date(now.getTime() + gun) })
    const ctx = await loadAccessContext(db, t.id)
    expect(ctx.orgLicenses?.map((l) => l.memberRole)).toEqual(['admin'])
    expect(resolveAccess({ ...ctx, now, paywall: true }).has('teacher_dashboard')).toBe(true)

    const yabanci = await yeniKullanici()
    expect((await loadAccessContext(db, yabanci.id)).orgLicenses).toEqual([])
  })
})

describe('günlük kullanım ve ders referansı', () => {
  it('bugün açılan ilk hafta dışı dersler sayılır', async () => {
    const u = await yeniKullanici()
    const rows = await db.select({ id: lessons.id, title: lessons.title }).from(lessons)
    const id = (t: string) => rows.find((r) => r.title === t)!.id
    await db.insert(progress).values([
      { userId: u.id, lessonId: id('D1'), startedAt: now },
      { userId: u.id, lessonId: id('D3'), startedAt: now },
      { userId: u.id, lessonId: id('D2'), startedAt: new Date(now.getTime() - 2 * gun) },
    ])
    expect((await loadLessonUsage(db, u.id, now)).openedToday).toEqual([id('D3')])
    expect((await loadLessonUsage(db, u.id, now, false)).openedToday.sort()).toEqual([id('D1'), id('D3')].sort())
    expect(await loadLessonRef(db, id('D3'), () => 'yapicilar')).toEqual({ lessonId: id('D3'), moduleSlug: 'test-modul', weekPosition: 2, band: 'yapicilar' })
    expect(await loadLessonRef(db, 999999)).toBeNull()
  })
})
