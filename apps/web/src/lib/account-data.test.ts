import { beforeAll, describe, expect, it } from 'vitest'
import { consents, eq, payments, progress, seedContent, sessions, subscriptionMembers, subscriptions, users, lessons, type Db } from '@ask/db'
import { DELETE_CONFIRM_PHRASE, deleteUserAccount, exportUserData } from './account-data'
import { createSession } from './auth/session'
import { createTestDb } from './test-db'

let db: Db
beforeAll(async () => {
  db = await createTestDb()
  await seedContent(db, [{ slug: 'ad-modul', title: 'AD', track: 'maker', position: 97, minAge: 10, weeks: [{ title: 'H1', project: 'P', lessons: [{ title: 'AD-D1', durationMin: 20, problem: 'P', contentMd: 'C', question: 'Q' }] }] }])
})

async function doluKullanici() {
  const [u] = await db.insert(users).values({ name: 'Ada', email: `${crypto.randomUUID()}@t.co`, passwordHash: 'gizli-ozet', loginSecretHash: 'qr-ozet' }).returning()
  const [l] = await db.select().from(lessons).limit(1)
  await db.insert(progress).values({ userId: u.id, lessonId: l.id })
  await db.insert(consents).values({ userId: u.id, kind: 'kvkk_aydinlatma', granted: true })
  const [s] = await db.insert(subscriptions).values({ userId: u.id, planId: 'family', status: 'active', provider: 'prepaid', providerRef: `${u.id}:family`, currentPeriodEnd: new Date('2030-01-01') }).returning()
  await db.insert(payments).values({ userId: u.id, planId: 'family', period: 'yearly', provider: 'mock', providerRef: `mock_${u.id}`, amount: 299000, status: 'succeeded', subscriptionId: s.id, raw: { token: 'x' } })
  await createSession(db, u.id)
  return { u, s }
}

describe('verilerimi indir', () => {
  it('kişinin kendi verisi; parola/QR özeti ve oturum belirteci yok', async () => {
    const { u } = await doluKullanici()
    const data = await exportUserData(db, u.id)
    expect(data?.user).toMatchObject({ id: u.id, name: 'Ada', email: u.email })
    expect(data?.progress).toHaveLength(1)
    expect(data?.consents).toHaveLength(1)
    expect(data?.subscriptions).toHaveLength(1)
    expect(data?.payments).toEqual([expect.objectContaining({ amount: 299000, status: 'succeeded' })])
    expect(data?.sessions).toHaveLength(1)
    const json = JSON.stringify(data)
    expect(json).not.toContain('gizli-ozet')
    expect(json).not.toContain('qr-ozet')
    expect(json).not.toMatch(/tokenHash|passwordHash|loginSecretHash/)
    expect(await exportUserData(db, crypto.randomUUID())).toBeNull()
  })
})

describe('hesabımı sil', () => {
  it('onay ifadesi olmadan silmez', async () => {
    const { u } = await doluKullanici()
    expect(await deleteUserAccount(db, u.id, 'evet')).toEqual({ ok: false, code: 'confirm_required' })
    expect(await deleteUserAccount(db, u.id, undefined)).toEqual({ ok: false, code: 'confirm_required' })
    expect(await db.select().from(users).where(eq(users.id, u.id))).toHaveLength(1)
  })
  it('onayla siler; bağlı kişisel kayıtlar cascade gider, aile üyeleri erişimini kaybeder', async () => {
    const { u, s } = await doluKullanici()
    const [uye] = await db.insert(users).values({ name: 'Üye', email: `${crypto.randomUUID()}@t.co` }).returning()
    await db.insert(subscriptionMembers).values({ subscriptionId: s.id, userId: uye.id })
    expect(await deleteUserAccount(db, u.id, DELETE_CONFIRM_PHRASE.toLocaleLowerCase('tr-TR'))).toEqual({ ok: true })
    for (const t of [progress, consents, subscriptions, payments, sessions] as const) {
      expect(await db.select().from(t).where(eq(t.userId, u.id))).toHaveLength(0)
    }
    expect(await db.select().from(subscriptionMembers).where(eq(subscriptionMembers.userId, uye.id))).toHaveLength(0)
    expect(await db.select().from(users).where(eq(users.id, uye.id))).toHaveLength(1)
    expect(await deleteUserAccount(db, u.id, DELETE_CONFIRM_PHRASE)).toEqual({ ok: false, code: 'not_found' })
  })
})
