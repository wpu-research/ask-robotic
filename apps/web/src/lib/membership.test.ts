import { beforeAll, describe, expect, it } from 'vitest'
import { eq, subscriptions, users, type Db } from '@ask/db'
import { registerUser } from './auth/service'
import { createUserByAdmin, grantMembership, listUsers, revokeMembership, welcomeRemaining, WELCOME_LIMIT, WELCOME_PROVIDER } from './membership'
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
