// Ödeme → abonelik (DB katmanı). Ön ödemeli model: her başarılı ödeme aboneliğin bitişini dönem kadar uzatır,
// otomatik çekim yok. Yetki kararı yine entitlements.ts'te (subscriptions satırlarından okunur).
//
// Abonelik satırları (subscriptions.provider / provider_ref; (provider, provider_ref) unique):
//   - Deneme: provider 'trial',   ref = userId              → kullanıcı başına tek deneme (DB de garanti eder)
//   - Ücretli: provider 'prepaid', ref = `${userId}:${planId}` → plan başına tek satır, her ödeme bitişi uzatır
// Ödeme satırları (payments): (provider, provider_ref) unique; etkinleştirme 'pending' → 'succeeded' koşullu
// güncellemesiyle yapılır, aynı callback iki kez gelse de dönem bir kez uzar (idempotent).
import {
  and, eq, inArray, payments, plans, sql, subscriptionMembers, subscriptions, users, type Db,
} from '@ask/db'
import {
  FAMILY_MAX_MEMBERS, PLAN_INFO, TRIAL_DAYS, TRIAL_REMINDER_DAY, addDays, extendPeriod, isPaidPlan, isPeriod, needsRenewalReminder, priceOf,
  type BillingPeriod, type PaidPlanId,
} from './pricing'
import { subscriptionActive, type PlanId, type SubscriptionStatus } from './entitlements'
import { ADMIN_PROVIDER, WELCOME_PROVIDER } from './membership'
import type { PaymentProvider, VerifiedPayment } from './payments/provider'

export const TRIAL_PROVIDER = 'trial'
export const PREPAID_PROVIDER = 'prepaid'
export const prepaidRef = (userId: string, planId: PaidPlanId) => `${userId}:${planId}`

type Tx = Parameters<Parameters<Db['transaction']>[0]>[0]
type Q = Db | Tx

const isUnique = (e: unknown) => (e as { code?: string })?.code === '23505' || (e as { cause?: { code?: string } })?.cause?.code === '23505'

// ---------------------------------------------------------------------------
// Deneme
// ---------------------------------------------------------------------------

export type TrialResult =
  | { ok: true; endsAt: Date }
  | { ok: false; code: 'trial_used' | 'already_premium' | 'no_user' }

/** Kullanıcının etkin Premium/Aile erişimi var mı (sahip ya da aile üyesi). */
async function hasActivePaidAccess(db: Q, userId: string, now: Date) {
  const cols = { planId: subscriptions.planId, status: subscriptions.status, currentPeriodEnd: subscriptions.currentPeriodEnd }
  const [owned, shared] = await Promise.all([
    db.select(cols).from(subscriptions).where(eq(subscriptions.userId, userId)),
    db.select(cols).from(subscriptionMembers).innerJoin(subscriptions, eq(subscriptions.id, subscriptionMembers.subscriptionId))
      .where(eq(subscriptionMembers.userId, userId)),
  ])
  return [...owned, ...shared].some((s) => s.planId !== 'free' && subscriptionActive({ ...s, planId: s.planId as PlanId }, now))
}

export async function trialUsed(db: Q, userId: string) {
  const r = await db.select({ id: subscriptions.id }).from(subscriptions)
    .where(and(eq(subscriptions.provider, TRIAL_PROVIDER), eq(subscriptions.providerRef, userId))).limit(1)
  return r.length > 0
}

/** 7 gün ücretsiz Premium, kart yok. Kullanıcı başına bir kez; zaten Premium/Aile erişimi varsa verilmez. */
export async function startTrial(db: Db, userId: string, now = new Date()): Promise<TrialResult> {
  const [u] = await db.select({ id: users.id }).from(users).where(eq(users.id, userId)).limit(1)
  if (!u) return { ok: false, code: 'no_user' }
  if (await trialUsed(db, userId)) return { ok: false, code: 'trial_used' }
  if (await hasActivePaidAccess(db, userId, now)) return { ok: false, code: 'already_premium' }
  const endsAt = addDays(now, TRIAL_DAYS)
  try {
    await db.insert(subscriptions).values({
      userId, planId: 'premium', status: 'trialing', provider: TRIAL_PROVIDER, providerRef: userId, currentPeriodEnd: endsAt,
    })
  } catch (e) {
    if (isUnique(e)) return { ok: false, code: 'trial_used' }
    throw e
  }
  return { ok: true, endsAt }
}

// ---------------------------------------------------------------------------
// Ödeme başlatma ve tamamlama
// ---------------------------------------------------------------------------

export type StartCheckoutResult =
  | { ok: true; paymentId: string; redirectUrl: string }
  | { ok: false; code: 'invalid_plan' | 'no_user' | 'provider_error'; message: string }

/** payments satırını 'pending' açar, sağlayıcıda ödeme sayfası oluşturur ve ref'i yazar. */
export async function startCheckout(
  db: Db, provider: PaymentProvider,
  input: { userId: string; planId: unknown; period: unknown; callbackUrl: string; ip: string },
): Promise<StartCheckoutResult> {
  const { planId, period } = input
  if (!isPaidPlan(planId) || !isPeriod(period)) return { ok: false, code: 'invalid_plan', message: 'Geçersiz plan' }
  const [user] = await db.select({ id: users.id, name: users.name, email: users.email }).from(users).where(eq(users.id, input.userId)).limit(1)
  if (!user) return { ok: false, code: 'no_user', message: 'Kullanıcı bulunamadı' }

  const amount = priceOf(planId, period)
  const [p] = await db.insert(payments).values({
    userId: user.id, planId, period, provider: provider.id, amount, status: 'pending',
  }).returning({ id: payments.id })
  try {
    const s = await provider.initialize({
      paymentId: p.id, user, planId, period, planTitle: PLAN_INFO[planId].title, amountKurus: amount,
      callbackUrl: input.callbackUrl, ip: input.ip,
    })
    await db.update(payments).set({ providerRef: s.providerRef, raw: { init: s.raw ?? null } }).where(eq(payments.id, p.id))
    return { ok: true, paymentId: p.id, redirectUrl: s.redirectUrl }
  } catch (e) {
    await db.update(payments).set({ status: 'failed', raw: { initError: String((e as Error)?.message ?? e) } }).where(eq(payments.id, p.id))
    return { ok: false, code: 'provider_error', message: 'Ödeme sayfası açılamadı, lütfen tekrar dene' }
  }
}

export type CompleteResult =
  | { ok: true; status: 'succeeded'; paymentId: string; userId: string; periodEnd: Date; already: boolean }
  | { ok: false; status: 'failed' | 'pending' | 'unknown'; paymentId?: string; userId?: string; reason?: string }

/**
 * Sağlayıcının DOĞRULANMIŞ sonucunu (retrieve) işler. Callback gövdesi buraya girmez.
 * - Başarılı ve tutar/kimlik tutuyorsa: ödeme 'succeeded', abonelik dönem kadar uzar (bir kez).
 * - Başarısızsa ya da tutar/kimlik tutmuyorsa: 'failed'. Bekliyorsa dokunulmaz.
 */
export async function completeCheckout(
  db: Db, provider: string, providerRef: string, v: VerifiedPayment, now = new Date(),
): Promise<CompleteResult> {
  const [p] = await db.select().from(payments).where(and(eq(payments.provider, provider), eq(payments.providerRef, providerRef))).limit(1)
  if (!p) return { ok: false, status: 'unknown', reason: 'payment_not_found' }
  // Hesap silinmiş: kayıt saklanır (vergi), etkinleştirilecek kullanıcı yok
  if (!p.userId) return { ok: false, status: 'unknown', paymentId: p.id, reason: 'account_deleted' }

  if (p.status === 'succeeded') {
    const [s] = p.subscriptionId
      ? await db.select({ end: subscriptions.currentPeriodEnd }).from(subscriptions).where(eq(subscriptions.id, p.subscriptionId))
      : []
    return { ok: true, status: 'succeeded', paymentId: p.id, userId: p.userId, periodEnd: s?.end ?? now, already: true }
  }
  if (p.status !== 'pending') return { ok: false, status: 'failed', paymentId: p.id, userId: p.userId, reason: p.status }
  if (v.status === 'pending') return { ok: false, status: 'pending', paymentId: p.id, userId: p.userId }

  let reason: string | undefined
  if (v.status === 'failed') reason = 'provider_failed'
  else if (v.paymentId !== undefined && v.paymentId !== p.id) reason = 'payment_id_mismatch'
  else if (v.paidKurus !== undefined && v.paidKurus !== p.amount) reason = 'amount_mismatch'

  if (reason) {
    await db.update(payments).set({ status: 'failed', raw: { ...(p.raw ?? {}), verify: v.raw, reason } })
      .where(and(eq(payments.id, p.id), eq(payments.status, 'pending')))
    return { ok: false, status: 'failed', paymentId: p.id, userId: p.userId, reason }
  }
  return activatePayment(db, p.id, v.raw, now)
}

/** 'pending' ödemeyi etkinleştirir. Koşullu güncelleme sayesinde eşzamanlı/yinelenen çağrıda dönem bir kez uzar. */
export async function activatePayment(db: Db, paymentId: string, raw: Record<string, unknown>, now = new Date()): Promise<CompleteResult> {
  return db.transaction(async (tx) => {
    const [p] = await tx.update(payments).set({ status: 'succeeded' })
      .where(and(eq(payments.id, paymentId), eq(payments.status, 'pending'))).returning()
    if (!p) {
      const [cur] = await tx.select().from(payments).where(eq(payments.id, paymentId))
      if (cur?.status === 'succeeded' && cur.userId) {
        const [s] = cur.subscriptionId ? await tx.select({ end: subscriptions.currentPeriodEnd }).from(subscriptions).where(eq(subscriptions.id, cur.subscriptionId)) : []
        return { ok: true as const, status: 'succeeded' as const, paymentId, userId: cur.userId, periodEnd: s?.end ?? now, already: true }
      }
      return { ok: false as const, status: 'failed' as const, paymentId, reason: cur?.status ?? 'payment_not_found' }
    }
    // Hesap silinmişse işlem geri alınır (ödeme 'pending' kalır, kayıt saklanır)
    if (!p.userId) throw new Error('account_deleted')
    const userId = p.userId
    const planId = p.planId as PaidPlanId
    const period = p.period as BillingPeriod
    const ref = prepaidRef(userId, planId)

    // Taban: mevcut ücretli dönemin bitişi; Premium alınırken süren deneme varsa onun bitişi (deneme günü yanmaz)
    const [cur] = await tx.select({ end: subscriptions.currentPeriodEnd, status: subscriptions.status }).from(subscriptions)
      .where(and(eq(subscriptions.provider, PREPAID_PROVIDER), eq(subscriptions.providerRef, ref)))
    let base: Date | null = cur && cur.status !== 'expired' ? cur.end : null
    if (planId === 'premium') {
      const [trial] = await tx.select({ end: subscriptions.currentPeriodEnd }).from(subscriptions)
        .where(and(eq(subscriptions.provider, TRIAL_PROVIDER), eq(subscriptions.providerRef, userId), eq(subscriptions.status, 'trialing')))
      if (trial?.end && (!base || trial.end > base)) base = trial.end
    }
    const end = extendPeriod(base, period, now)

    const [sub] = await tx.insert(subscriptions).values({
      userId: userId, planId, status: 'active', provider: PREPAID_PROVIDER, providerRef: ref, currentPeriodEnd: end,
    }).onConflictDoUpdate({
      target: [subscriptions.provider, subscriptions.providerRef],
      set: { status: 'active', currentPeriodEnd: end },
    }).returning({ id: subscriptions.id })
    await tx.update(payments).set({ subscriptionId: sub.id, raw: { ...(p.raw ?? {}), verify: raw } }).where(eq(payments.id, p.id))
    return { ok: true as const, status: 'succeeded' as const, paymentId: p.id, userId: userId, periodEnd: end, already: false }
  })
}

/** Ödemeyi kullanıcının iptal ettiği / hatayla döndüğü durumda kapatır (yalnız 'pending' ise). */
export async function failPayment(db: Db, paymentId: string, reason: string) {
  await db.update(payments).set({ status: 'failed', raw: { reason } }).where(and(eq(payments.id, paymentId), eq(payments.status, 'pending')))
}

export async function loadPaymentByRef(db: Db, provider: string, providerRef: string) {
  const [p] = await db.select().from(payments).where(and(eq(payments.provider, provider), eq(payments.providerRef, providerRef))).limit(1)
  return p ?? null
}

// ---------------------------------------------------------------------------
// Aile üyeleri
// ---------------------------------------------------------------------------

/** Sahibin etkin aile aboneliği (en geç biten). */
export async function ownedFamilySubscription(db: Q, ownerId: string, now = new Date()) {
  const rows = await db.select().from(subscriptions)
    .where(and(eq(subscriptions.userId, ownerId), eq(subscriptions.planId, 'family')))
  const active = rows.filter((s) => subscriptionActive({ planId: 'family', status: s.status as SubscriptionStatus, currentPeriodEnd: s.currentPeriodEnd }, now))
  active.sort((a, b) => (b.currentPeriodEnd?.getTime() ?? Infinity) - (a.currentPeriodEnd?.getTime() ?? Infinity))
  return active[0] ?? null
}

export async function familyMemberLimit(db: Q) {
  // plans.seat_limit (family = 5) sahip hariç ek üye sayısı olarak okunur; yoksa FAMILY_MAX_MEMBERS
  const [p] = await db.select({ seatLimit: plans.seatLimit }).from(plans).where(eq(plans.id, 'family'))
  return p?.seatLimit ?? FAMILY_MAX_MEMBERS
}

export type FamilyResult =
  | { ok: true; member: { id: string; name: string } }
  | { ok: false; code: 'no_family_plan' | 'not_found' | 'self' | 'already_member' | 'seats_full'; message: string }

/** Kullanıcı adı ya da e-postayla aile üyesi ekler (koltuk sınırı: familyMemberLimit). */
export async function addFamilyMember(db: Db, ownerId: string, identifier: string, now = new Date()): Promise<FamilyResult> {
  const sub = await ownedFamilySubscription(db, ownerId, now)
  if (!sub) return { ok: false, code: 'no_family_plan', message: 'Etkin bir Aile planın yok' }
  const id = identifier.trim().toLowerCase()
  if (!id) return { ok: false, code: 'not_found', message: 'Bu kullanıcı adı ya da e-postayla bir hesap bulunamadı' }
  const [target] = await db.select({ id: users.id, name: users.name }).from(users)
    .where(id.includes('@') ? sql`lower(${users.email}) = ${id}` : sql`lower(${users.username}) = ${id}`).limit(1)
  if (!target) return { ok: false, code: 'not_found', message: 'Bu kullanıcı adı ya da e-postayla bir hesap bulunamadı' }
  if (target.id === ownerId) return { ok: false, code: 'self', message: 'Kendini üye olarak ekleyemezsin; plan zaten senin' }

  return db.transaction(async (tx) => {
    // Koltuk sayımı satır kilidiyle: aynı anda iki ekleme sınırı aşamaz
    await tx.execute(sql`select id from subscriptions where id = ${sub.id} for update`)
    const members = await tx.select({ userId: subscriptionMembers.userId }).from(subscriptionMembers).where(eq(subscriptionMembers.subscriptionId, sub.id))
    if (members.some((m) => m.userId === target.id)) return { ok: false as const, code: 'already_member' as const, message: 'Bu kişi zaten ailende' }
    const limit = await familyMemberLimit(tx)
    if (members.length >= limit) return { ok: false as const, code: 'seats_full' as const, message: `Aile planı en fazla ${limit + 1} kişi (sen + ${limit})` }
    await tx.insert(subscriptionMembers).values({ subscriptionId: sub.id, userId: target.id }).onConflictDoNothing()
    return { ok: true as const, member: target }
  })
}

export async function removeFamilyMember(db: Db, ownerId: string, memberId: string) {
  const owned = await db.select({ id: subscriptions.id }).from(subscriptions).where(and(eq(subscriptions.userId, ownerId), eq(subscriptions.planId, 'family')))
  if (!owned.length) return false
  const r = await db.delete(subscriptionMembers)
    .where(and(inArray(subscriptionMembers.subscriptionId, owned.map((s) => s.id)), eq(subscriptionMembers.userId, memberId)))
    .returning({ userId: subscriptionMembers.userId })
  return r.length > 0
}

// ---------------------------------------------------------------------------
// Hesap özeti (/hesap)
// ---------------------------------------------------------------------------

export interface AccountSummary {
  user: { id: string; name: string; email: string | null; username: string | null; hasPassword: boolean }
  /** En yüksek etkin plan (aile üyeliği dahil) */
  plan: 'free' | 'premium' | 'family'
  status: 'none' | 'trialing' | 'active' | 'expired'
  periodEnd: Date | null
  source: 'own' | 'family_member' | null
  /** Etkin plan ödemesiz verildiyse: kayıt hediyesi (membership.ts WELCOME_PROVIDER) ya da admin */
  grant: 'welcome' | 'admin' | null
  renewalReminder: boolean
  trialAvailable: boolean
  payments: { id: string; planId: string; period: string; amount: number; status: string; provider: string; createdAt: Date }[]
  family: null | { subscriptionId: string; limit: number; members: { id: string; name: string; username: string | null; email: string | null }[] }
}

export async function loadAccountSummary(db: Db, userId: string, now = new Date()): Promise<AccountSummary | null> {
  const [row] = await db.select({ id: users.id, name: users.name, email: users.email, username: users.username, passwordHash: users.passwordHash })
    .from(users).where(eq(users.id, userId))
  if (!row) return null
  // Parola özeti sayfaya taşınmaz; yalnız var/yok (QR/resimli girişte parola yok)
  const { passwordHash, ...rest } = row
  const user = { ...rest, hasPassword: !!passwordHash }
  const cols = { id: subscriptions.id, planId: subscriptions.planId, status: subscriptions.status, end: subscriptions.currentPeriodEnd, provider: subscriptions.provider }
  const [owned, shared, pays] = await Promise.all([
    db.select(cols).from(subscriptions).where(eq(subscriptions.userId, userId)),
    db.select(cols).from(subscriptionMembers).innerJoin(subscriptions, eq(subscriptions.id, subscriptionMembers.subscriptionId))
      .where(eq(subscriptionMembers.userId, userId)),
    db.select({
      id: payments.id, planId: payments.planId, period: payments.period, amount: payments.amount, status: payments.status,
      provider: payments.provider, createdAt: payments.createdAt,
    }).from(payments).where(eq(payments.userId, userId)).orderBy(sql`${payments.createdAt} desc`).limit(50),
  ])
  const rank = { free: 0, premium: 1, family: 2 } as const
  type Cand = { planId: 'premium' | 'family'; status: 'trialing' | 'active'; end: Date | null; source: 'own' | 'family_member'; provider: string | null }
  const cands: Cand[] = []
  for (const [list, source] of [[owned, 'own'], [shared, 'family_member']] as const) {
    for (const s of list) {
      if (!isPaidPlan(s.planId)) continue
      if (!subscriptionActive({ planId: s.planId, status: s.status as SubscriptionStatus, currentPeriodEnd: s.end }, now)) continue
      cands.push({ planId: s.planId, status: s.status === 'trialing' ? 'trialing' : 'active', end: s.end, source, provider: s.provider })
    }
  }
  // En yüksek plan; eşitse en geç biten
  cands.sort((a, b) => rank[b.planId] - rank[a.planId] || (b.end?.getTime() ?? Infinity) - (a.end?.getTime() ?? Infinity))
  const best = cands[0]
  // Aynı planın birden çok satırı varsa (deneme + ücretli) bitiş en geç olan
  const periodEnd = best ? cands.filter((c) => c.planId === best.planId).reduce<Date | null>((m, c) => (!m || (c.end && c.end > m) ? c.end : m), null) : null
  const everPaid = owned.some((s) => isPaidPlan(s.planId))

  let family: AccountSummary['family'] = null
  const fam = await ownedFamilySubscription(db, userId, now)
  if (fam) {
    const members = await db.select({ id: users.id, name: users.name, username: users.username, email: users.email })
      .from(subscriptionMembers).innerJoin(users, eq(users.id, subscriptionMembers.userId))
      .where(eq(subscriptionMembers.subscriptionId, fam.id))
    family = { subscriptionId: fam.id, limit: await familyMemberLimit(db), members }
  }

  return {
    user,
    plan: best?.planId ?? 'free',
    status: best ? best.status : everPaid ? 'expired' : 'none',
    periodEnd,
    source: best?.source ?? null,
    grant: best?.source !== 'own' ? null : best.provider === WELCOME_PROVIDER ? 'welcome' : best.provider === ADMIN_PROVIDER ? 'admin' : null,
    // Deneme: 5. gün hatırlatması (bitişe 2 gün); ücretli: bitişe RENEWAL_REMINDER_DAYS gün
    renewalReminder: !!best && best.source === 'own'
      && needsRenewalReminder(periodEnd, now, best.status === 'trialing' && periodEnd === best.end ? TRIAL_DAYS - TRIAL_REMINDER_DAY : undefined),
    trialAvailable: !owned.some((s) => s.provider === TRIAL_PROVIDER) && !best,
    payments: pays,
    family,
  }
}
