import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { and, eq, payments, subscriptionMembers, subscriptions, users, type Db } from '@ask/db'
import {
  PREPAID_PROVIDER, activatePayment, addFamilyMember, completeCheckout, loadAccountSummary, prepaidRef, removeFamilyMember,
  startCheckout, startTrial,
} from './billing'
import { loadAccessContext } from './entitlements-db'
import { resolveAccess } from './entitlements'
import { mockProvider } from './payments/mock'
import { addMonths, priceOf } from './pricing'
import { createTestDb } from './test-db'
import { WELCOME_MONTHS, WELCOME_PROVIDER } from './membership'

let db: Db
const now = new Date('2026-10-14T10:00:00Z')
const gun = 86_400_000

const yeni = async (o: Partial<typeof users.$inferInsert> = {}) =>
  (await db.insert(users).values({ name: 'Ada Yılmaz', email: `${crypto.randomUUID()}@t.co`, ...o }).returning())[0]

/** Mock ile ödeme başlatır ve sonuçlandırır (barındırılan sayfadaki düğme + callback'in yaptığı). */
async function mockOde(userId: string, planId: 'premium' | 'family', period: 'monthly' | 'yearly', outcome: 'succeeded' | 'failed', at = now) {
  const s = await startCheckout(db, mockProvider, { userId, planId, period, callbackUrl: 'http://x/cb', ip: '1.1.1.1' })
  if (!s.ok) throw new Error(s.message)
  const ref = `mock_${s.paymentId}`
  mockProvider.settle(ref, outcome)
  return { ref, paymentId: s.paymentId, result: await completeCheckout(db, 'mock', ref, await mockProvider.retrieve(ref), at) }
}

const prepaid = async (userId: string, planId: 'premium' | 'family') =>
  (await db.select().from(subscriptions).where(and(eq(subscriptions.provider, PREPAID_PROVIDER), eq(subscriptions.providerRef, prepaidRef(userId, planId)))))[0]

beforeAll(async () => { db = await createTestDb() })
beforeEach(() => mockProvider.reset())

describe('mock ödeme', () => {
  it('başlatma pending satır açar, ref ve yönlendirme döner', async () => {
    const u = await yeni()
    const s = await startCheckout(db, mockProvider, { userId: u.id, planId: 'premium', period: 'monthly', callbackUrl: 'http://x', ip: '1' })
    expect(s).toMatchObject({ ok: true, redirectUrl: expect.stringContaining('/odeme/mock?ref=mock_') })
    const [p] = await db.select().from(payments).where(eq(payments.userId, u.id))
    expect(p).toMatchObject({ status: 'pending', provider: 'mock', amount: priceOf('premium', 'monthly'), providerRef: `mock_${p.id}` })
  })
  it('geçersiz plan reddedilir', async () => {
    const u = await yeni()
    expect(await startCheckout(db, mockProvider, { userId: u.id, planId: 'school', period: 'monthly', callbackUrl: '', ip: '' })).toMatchObject({ ok: false, code: 'invalid_plan' })
  })
  it('başarılı ödeme Premium açar', async () => {
    const u = await yeni()
    const { result } = await mockOde(u.id, 'premium', 'monthly', 'succeeded')
    expect(result).toMatchObject({ ok: true, already: false, periodEnd: addMonths(now, 1) })
    const a = resolveAccess({ ...(await loadAccessContext(db, u.id)), now, paywall: true })
    expect(a.plan).toBe('premium')
    expect(a.has('unlimited_lessons')).toBe(true)
  })
  it('başarısız ödeme abonelik açmaz', async () => {
    const u = await yeni()
    const { result, paymentId } = await mockOde(u.id, 'premium', 'monthly', 'failed')
    expect(result).toMatchObject({ ok: false, status: 'failed', reason: 'provider_failed' })
    expect((await db.select().from(payments).where(eq(payments.id, paymentId)))[0].status).toBe('failed')
    expect(await prepaid(u.id, 'premium')).toBeUndefined()
  })
  it('tutar ya da ödeme kimliği tutmazsa reddedilir', async () => {
    const u = await yeni()
    const s = await startCheckout(db, mockProvider, { userId: u.id, planId: 'premium', period: 'yearly', callbackUrl: '', ip: '' })
    if (!s.ok) throw new Error()
    const ref = `mock_${s.paymentId}`
    expect(await completeCheckout(db, 'mock', ref, { status: 'succeeded', paidKurus: 100, raw: {} }, now)).toMatchObject({ ok: false, reason: 'amount_mismatch' })
    const s2 = await startCheckout(db, mockProvider, { userId: u.id, planId: 'premium', period: 'yearly', callbackUrl: '', ip: '' })
    if (!s2.ok) throw new Error()
    expect(await completeCheckout(db, 'mock', `mock_${s2.paymentId}`, { status: 'succeeded', paymentId: s.paymentId, raw: {} }, now)).toMatchObject({ ok: false, reason: 'payment_id_mismatch' })
    expect(await prepaid(u.id, 'premium')).toBeUndefined()
  })
  it('bilinmeyen ref', async () => {
    expect(await completeCheckout(db, 'mock', 'mock_yok', { status: 'succeeded', raw: {} })).toMatchObject({ ok: false, status: 'unknown' })
  })
})

describe('idempotent etkinleştirme', () => {
  it('aynı callback iki kez gelince dönem bir kez uzar', async () => {
    const u = await yeni()
    const { ref, result } = await mockOde(u.id, 'premium', 'monthly', 'succeeded')
    const again = await completeCheckout(db, 'mock', ref, await mockProvider.retrieve(ref), now)
    expect(again).toMatchObject({ ok: true, already: true })
    expect((await prepaid(u.id, 'premium')).currentPeriodEnd).toEqual(result.ok ? result.periodEnd : null)
  })
  it('eşzamanlı iki etkinleştirme: biri uzatır, diğeri "zaten" döner', async () => {
    const u = await yeni()
    const s = await startCheckout(db, mockProvider, { userId: u.id, planId: 'premium', period: 'monthly', callbackUrl: '', ip: '' })
    if (!s.ok) throw new Error()
    const [a, b] = await Promise.all([activatePayment(db, s.paymentId, {}, now), activatePayment(db, s.paymentId, {}, now)])
    expect([a, b].filter((r) => r.ok && !r.already)).toHaveLength(1)
    expect((await prepaid(u.id, 'premium')).currentPeriodEnd).toEqual(addMonths(now, 1))
  })
  it('(provider, provider_ref) tekil: aynı ref ikinci kez yazılamaz', async () => {
    const u = await yeni()
    await db.insert(payments).values({ userId: u.id, planId: 'premium', period: 'monthly', provider: 'mock', providerRef: 'tekil-1', amount: 1 })
    await expect(db.insert(payments).values({ userId: u.id, planId: 'premium', period: 'monthly', provider: 'mock', providerRef: 'tekil-1', amount: 1 })).rejects.toThrow()
  })
})

describe('dönem uzatma', () => {
  it('ikinci ödeme mevcut bitişin üstüne ekler; süresi dolmuşsa bugünden başlar', async () => {
    const u = await yeni()
    await mockOde(u.id, 'premium', 'monthly', 'succeeded')
    await mockOde(u.id, 'premium', 'yearly', 'succeeded', new Date(now.getTime() + 5 * gun))
    expect((await prepaid(u.id, 'premium')).currentPeriodEnd).toEqual(addMonths(addMonths(now, 1), 12))
    // Süre dolduktan çok sonra
    const later = new Date('2029-01-01T00:00:00Z')
    await mockOde(u.id, 'premium', 'monthly', 'succeeded', later)
    expect((await prepaid(u.id, 'premium')).currentPeriodEnd).toEqual(addMonths(later, 1))
  })
  it('deneme sürerken Premium alınırsa dönem deneme bitişinden başlar', async () => {
    const u = await yeni()
    const t = await startTrial(db, u.id, now)
    if (!t.ok) throw new Error()
    await mockOde(u.id, 'premium', 'monthly', 'succeeded', new Date(now.getTime() + gun))
    expect((await prepaid(u.id, 'premium')).currentPeriodEnd).toEqual(addMonths(t.endsAt, 1))
  })
})

describe('deneme', () => {
  it('7 gün, kartsız, kullanıcı başına bir kez', async () => {
    const u = await yeni()
    const r = await startTrial(db, u.id, now)
    expect(r).toEqual({ ok: true, endsAt: new Date(now.getTime() + 7 * gun) })
    expect(await startTrial(db, u.id, now)).toEqual({ ok: false, code: 'trial_used' })
    // Süresi bitse de ikinci deneme yok
    expect(await startTrial(db, u.id, new Date(now.getTime() + 30 * gun))).toEqual({ ok: false, code: 'trial_used' })
    const a = resolveAccess({ ...(await loadAccessContext(db, u.id)), now, paywall: true })
    expect(a.has('unlimited_lessons')).toBe(true)
    const sonra = resolveAccess({ ...(await loadAccessContext(db, u.id)), now: new Date(now.getTime() + 8 * gun), paywall: true })
    expect(sonra.plan).toBe('free')
  })
  it('eşzamanlı iki istek tek deneme açar (DB tekilliği)', async () => {
    const u = await yeni()
    const rs = await Promise.all([startTrial(db, u.id, now), startTrial(db, u.id, now)])
    expect(rs.filter((r) => r.ok)).toHaveLength(1)
  })
  it('zaten Premium olan deneme alamaz', async () => {
    const u = await yeni()
    await mockOde(u.id, 'premium', 'monthly', 'succeeded')
    expect(await startTrial(db, u.id, now)).toEqual({ ok: false, code: 'already_premium' })
  })
})

describe('aile koltukları', () => {
  it('Aile planı yoksa üye eklenemez', async () => {
    const o = await yeni()
    const m = await yeni()
    expect(await addFamilyMember(db, o.id, m.email!, now)).toMatchObject({ ok: false, code: 'no_family_plan' })
  })
  it('kullanıcı adı/e-postayla ekler, sınır 5 üye (sahip dahil 6), çıkarınca yer açılır', async () => {
    const o = await yeni()
    await mockOde(o.id, 'family', 'yearly', 'succeeded')
    const ms = await Promise.all([0, 1, 2, 3, 4, 5].map((i) => yeni({ email: null, username: `cocuk-${crypto.randomUUID().slice(0, 8)}-${i}` })))
    expect(await addFamilyMember(db, o.id, o.email!, now)).toMatchObject({ ok: false, code: 'self' })
    expect(await addFamilyMember(db, o.id, 'yok@yok.yok', now)).toMatchObject({ ok: false, code: 'not_found' })
    for (const m of ms.slice(0, 5)) expect(await addFamilyMember(db, o.id, m.username!.toUpperCase(), now)).toMatchObject({ ok: true })
    expect(await addFamilyMember(db, o.id, ms[0].username!, now)).toMatchObject({ ok: false, code: 'already_member' })
    expect(await addFamilyMember(db, o.id, ms[5].username!, now)).toMatchObject({ ok: false, code: 'seats_full' })

    // Üye Aile erişimi alır
    const a = resolveAccess({ ...(await loadAccessContext(db, ms[0].id)), now, paywall: true })
    expect(a.plan).toBe('family')

    expect(await removeFamilyMember(db, o.id, ms[0].id)).toBe(true)
    expect(await removeFamilyMember(db, o.id, ms[0].id)).toBe(false)
    expect(await addFamilyMember(db, o.id, ms[5].username!, now)).toMatchObject({ ok: true })
    const count = await db.select().from(subscriptionMembers).innerJoin(subscriptions, eq(subscriptions.id, subscriptionMembers.subscriptionId)).where(eq(subscriptions.userId, o.id))
    expect(count).toHaveLength(5)
  })
  it('başkası benim ailemden üye çıkaramaz', async () => {
    const o = await yeni()
    const x = await yeni()
    await mockOde(o.id, 'family', 'monthly', 'succeeded')
    const m = await yeni()
    await addFamilyMember(db, o.id, m.email!, now)
    expect(await removeFamilyMember(db, x.id, m.id)).toBe(false)
  })
})

describe('hesap özeti', () => {
  it('ücretsiz → deneme → ücretli; hatırlatma ve ödeme geçmişi', async () => {
    const u = await yeni()
    expect(await loadAccountSummary(db, u.id, now)).toMatchObject({ plan: 'free', status: 'none', trialAvailable: true, payments: [], family: null })
    await startTrial(db, u.id, now)
    expect(await loadAccountSummary(db, u.id, now)).toMatchObject({ plan: 'premium', status: 'trialing', trialAvailable: false, renewalReminder: false })
    // 5. gün: deneme hatırlatması
    expect((await loadAccountSummary(db, u.id, new Date(now.getTime() + 5 * gun)))?.renewalReminder).toBe(true)
    await mockOde(u.id, 'premium', 'monthly', 'succeeded')
    await mockOde(u.id, 'premium', 'monthly', 'failed')
    const s = await loadAccountSummary(db, u.id, now)
    expect(s).toMatchObject({ plan: 'premium', source: 'own', periodEnd: addMonths(new Date(now.getTime() + 7 * gun), 1) })
    expect(s?.payments.map((p) => p.status).sort()).toEqual(['failed', 'succeeded'])
    // Bitişe 3 gün kala yenileme hatırlatması; bittikten sonra 'expired'
    const end = s!.periodEnd!
    expect((await loadAccountSummary(db, u.id, new Date(end.getTime() - 3 * gun)))?.renewalReminder).toBe(true)
    expect(await loadAccountSummary(db, u.id, new Date(end.getTime() + gun))).toMatchObject({ plan: 'free', status: 'expired', trialAvailable: false })
  })
  it('kayıt hediyesi kendi etkin Premium planı olarak, kaynağı welcome işaretiyle görünür', async () => {
    const u = await yeni()
    const end = addMonths(now, WELCOME_MONTHS)
    await db.insert(subscriptions).values({ userId: u.id, planId: 'premium', status: 'active', provider: WELCOME_PROVIDER, providerRef: u.id, currentPeriodEnd: end })
    expect(await loadAccountSummary(db, u.id, now)).toMatchObject({ plan: 'premium', status: 'active', source: 'own', grant: 'welcome', periodEnd: end, trialAvailable: false })
    expect(await loadAccountSummary(db, u.id, new Date(end.getTime() + gun))).toMatchObject({ plan: 'free', grant: null })
    expect((await loadAccountSummary(db, (await yeni()).id, now))?.grant).toBeNull()
  })
  it('parola özeti taşınmaz; yalnız var/yok bilgisi', async () => {
    const qr = await yeni({ email: null, username: `qr-${crypto.randomUUID().slice(0, 8)}`, loginMode: 'qr' })
    const pw = await yeni({ passwordHash: 'scrypt$x' })
    expect((await loadAccountSummary(db, qr.id, now))?.user).toEqual({ id: qr.id, name: qr.name, email: null, username: qr.username, hasPassword: false })
    expect((await loadAccountSummary(db, pw.id, now))?.user.hasPassword).toBe(true)
  })
  it('aile sahibi üyeleri, üye kaynağı görür', async () => {
    const o = await yeni()
    const m = await yeni()
    await mockOde(o.id, 'family', 'monthly', 'succeeded')
    await addFamilyMember(db, o.id, m.email!, now)
    expect((await loadAccountSummary(db, o.id, now))?.family).toMatchObject({ limit: 5, members: [{ id: m.id }] })
    expect(await loadAccountSummary(db, m.id, now)).toMatchObject({ plan: 'family', source: 'family_member', family: null, renewalReminder: false })
  })
})
