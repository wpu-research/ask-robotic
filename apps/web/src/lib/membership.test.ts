import { beforeAll, describe, expect, it } from 'vitest'
import { eq, sessions, subscriptions, users, type Db } from '@ask/db'
import { registerUser } from './auth/service'
import { verifyPassword } from './auth/password'
import { createSession, getSessionUser } from './auth/session'
import { createT } from '@/i18n'
import {
  createUserByAdmin, editUserByAdmin, grantMembership, listUsers, resetPasswordByAdmin, revokeMembership,
  welcomeNoticeText, welcomeRemaining, WELCOME_LIMIT, WELCOME_PROVIDER,
} from './membership'
import { createTestDb } from './test-db'

let db: Db
const NOW = new Date('2026-10-18T12:00:00Z')
const kayit = (email: string) => registerUser(db, { email, password: 'cok-guclu-parola', name: 'Ada', birthYear: 2000 }, NOW)

beforeAll(async () => { db = await createTestDb() })

describe('hoş geldin üyeliği', () => {
  it('kayıtta 6 ay Premium verir ve kontenjandan düşer', async () => {
    const r = await kayit('ada@t.co')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const [s] = await db.select().from(subscriptions).where(eq(subscriptions.userId, r.user.id))
    expect(s).toMatchObject({ planId: 'premium', status: 'active', provider: WELCOME_PROVIDER })
    expect(s.currentPeriodEnd?.toISOString()).toBe('2027-04-18T12:00:00.000Z')
    expect(await welcomeRemaining(db)).toBe(WELCOME_LIMIT - 1)
  })
  it('kontenjan dolunca kayıt olur ama üyelik verilmez', async () => {
    const fill = await db.insert(users).values(Array.from({ length: WELCOME_LIMIT }, (_, i) => ({ name: 'D', email: `d${i}@t.co` }))).returning({ id: users.id })
    await db.insert(subscriptions).values(fill.slice(1).map((u) => ({ userId: u.id, planId: 'premium', status: 'active' as const, provider: WELCOME_PROVIDER, providerRef: u.id })))
    expect(await welcomeRemaining(db)).toBe(0)
    const r = await kayit('gec@t.co')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(await db.select().from(subscriptions).where(eq(subscriptions.userId, r.user.id))).toHaveLength(0)
  })
})

describe('kampanya notu', () => {
  it('kalan sayıyla gösterilir, kontenjan dolunca gizlenir', () => {
    expect(welcomeNoticeText(createT('tr'), 873)).toBe('İlk 1000 kayda 6 ay Premium ücretsiz — kalan: 873')
    expect(welcomeNoticeText(createT('en'), 1)).toBe('6 months of Premium free for the first 1000 sign-ups — 1 spot left')
    expect(welcomeNoticeText(createT('tr'), 0)).toBeNull()
  })
})

describe('admin', () => {
  it('hesap açar, parolayı üretir, üyeliği yazar; aynı e-postayı reddeder', async () => {
    const r = await createUserByAdmin(db, { name: 'Can', email: 'Can@T.co', plan: 'family', until: null })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.password).toMatch(/^[A-Za-z0-9]{12}$/)
    const [row] = await listUsers(db, 'can@t.co', 10, NOW)
    expect(row).toMatchObject({ email: 'can@t.co', plan: 'family', until: null, source: 'admin' })
    expect(await createUserByAdmin(db, { name: 'Can 2', email: 'can@t.co' })).toMatchObject({ ok: false, code: 'taken' })
    expect(await createUserByAdmin(db, { name: 'Kimliksiz' })).toMatchObject({ ok: false, code: 'invalid_input' })
  })
  it('üyeliği verir, süresini değiştirir ve kapatır', async () => {
    const r = await createUserByAdmin(db, { name: 'Ece', username: 'ece.7b' })
    if (!r.ok) throw new Error(r.message)
    const id = r.user.id
    expect((await listUsers(db, 'ece', 10, NOW))[0].plan).toBeNull()
    await grantMembership(db, id, 'premium', new Date('2027-01-01T00:00:00Z'))
    await grantMembership(db, id, 'premium', new Date('2028-01-01T00:00:00Z'))
    expect(await db.select().from(subscriptions).where(eq(subscriptions.userId, id))).toHaveLength(1)
    expect((await listUsers(db, 'ece', 10, NOW))[0].until?.toISOString()).toBe('2028-01-01T00:00:00.000Z')
    expect(await revokeMembership(db, id)).toBe(true)
    expect((await listUsers(db, 'ece', 10, NOW))[0].plan).toBeNull()
    expect(await grantMembership(db, crypto.randomUUID(), 'premium', null)).toBe(false)
  })
})

describe('admin: düzenleme ve parola sıfırlama', () => {
  const ac = async (name: string, email?: string, username?: string, role = 'student') => {
    const r = await createUserByAdmin(db, { name, email, username, role })
    if (!r.ok) throw new Error(r.message)
    return r.user.id
  }

  it('ad, e-posta, kullanıcı adı ve rolü değiştirir', async () => {
    const adminId = await ac('Yönetici', 'yon@t.co', undefined, 'admin')
    const id = await ac('Fer', 'fer@t.co')
    const r = await editUserByAdmin(db, adminId, { userId: id, name: ' Feride ', email: '', username: 'Feride.K', role: 'teacher' })
    expect(r).toMatchObject({ ok: true, user: { id, name: 'Feride', email: null, username: 'feride.k', role: 'teacher' } })
    const [row] = await db.select().from(users).where(eq(users.id, id))
    expect(row).toMatchObject({ name: 'Feride', email: null, username: 'feride.k', role: 'teacher' })
  })

  it('kimliksiz bırakmaz, başkasının e-postasını ya da kullanıcı adını almaz', async () => {
    const adminId = await ac('Yönetici 2', 'yon2@t.co', undefined, 'admin')
    await ac('Gül', 'gul@t.co', 'gul.x')
    const id = await ac('Hak', 'hak@t.co')
    expect(await editUserByAdmin(db, adminId, { userId: id, name: 'Hak', email: '', username: '', role: 'student' }))
      .toMatchObject({ ok: false, code: 'invalid_input', message: 'E-posta ya da kullanıcı adı gerekli' })
    expect(await editUserByAdmin(db, adminId, { userId: id, name: 'Hak', email: 'GUL@t.co', role: 'student' }))
      .toMatchObject({ ok: false, code: 'taken', message: expect.stringContaining('zaten kayıtlı') })
    expect(await editUserByAdmin(db, adminId, { userId: id, name: 'Hak', email: 'hak@t.co', username: 'gul.x', role: 'student' }))
      .toMatchObject({ ok: false, code: 'taken' })
    expect(await editUserByAdmin(db, adminId, { userId: crypto.randomUUID(), name: 'Yok', email: 'yok@t.co', role: 'student' }))
      .toMatchObject({ ok: false, code: 'not_found' })
    const [row] = await db.select().from(users).where(eq(users.id, id))
    expect(row).toMatchObject({ email: 'hak@t.co', username: null })
  })

  it('admin kendi admin rolünü kaldıramaz; başka bir admini indirebilir', async () => {
    const me = await ac('Ben', 'ben@t.co', undefined, 'admin')
    const other = await ac('Öteki', 'oteki@t.co', undefined, 'admin')
    expect(await editUserByAdmin(db, me, { userId: me, name: 'Ben', email: 'ben@t.co', role: 'teacher' }))
      .toMatchObject({ ok: false, code: 'self_demote' })
    expect((await db.select().from(users).where(eq(users.id, me)))[0].role).toBe('admin')
    expect(await editUserByAdmin(db, me, { userId: me, name: 'Ben Yeni', email: 'ben@t.co', role: 'admin' })).toMatchObject({ ok: true })
    expect(await editUserByAdmin(db, me, { userId: other, name: 'Öteki', email: 'oteki@t.co', role: 'student' }))
      .toMatchObject({ ok: true, user: { role: 'student' } })
  })

  it('parola sıfırlama özeti değiştirir, tüm oturumları kapatır, yeni parolayla giriş açılır', async () => {
    const id = await ac('İpek', 'ipek@t.co')
    const [before] = await db.select({ h: users.passwordHash }).from(users).where(eq(users.id, id))
    const s1 = await createSession(db, id)
    await createSession(db, id)
    const r = await resetPasswordByAdmin(db, { userId: id })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.password).toMatch(/^[A-Za-z0-9]{12}$/)
    expect(r.sessionsEnded).toBe(2)
    const [after] = await db.select({ h: users.passwordHash }).from(users).where(eq(users.id, id))
    expect(after.h).not.toBe(before.h)
    expect(await verifyPassword(r.password, after.h!)).toBe(true)
    expect(await db.select().from(sessions).where(eq(sessions.userId, id))).toHaveLength(0)
    expect(await getSessionUser(db, s1.token)).toBeNull()
  })

  it('QR/resimli hesapta ve bilinmeyen kullanıcıda parola sıfırlamaz', async () => {
    const [qr] = await db.insert(users).values({ name: 'Kart', username: 'kart.7b', loginMode: 'qr' }).returning({ id: users.id })
    await createSession(db, qr.id)
    expect(await resetPasswordByAdmin(db, { userId: qr.id })).toMatchObject({ ok: false, code: 'no_password_login' })
    expect(await db.select().from(sessions).where(eq(sessions.userId, qr.id))).toHaveLength(1)
    expect(await resetPasswordByAdmin(db, { userId: crypto.randomUUID() })).toMatchObject({ ok: false, code: 'not_found' })
    expect(await resetPasswordByAdmin(db, { userId: 'x' })).toMatchObject({ ok: false, code: 'invalid_input' })
  })
})
