// Elle verilen üyelikler: kayıtta hoş geldin hediyesi ve admin panelinden (/admin) verilen süreler.
// Hepsi subscriptions satırıdır; yetki kararı yine entitlements.ts'te. Ücretli abonelikler billing.ts'te.
//
//   - Hoş geldin: provider 'hosgeldin', ref = userId → kullanıcı başına bir kez, ilk WELCOME_LIMIT kayda
//   - Admin:      provider 'admin',     ref = userId → kullanıcı başına tek satır; yeniden verince plan/bitiş güncellenir
import { and, eq, inArray, sql, subscriptions, users, type Db } from '@ask/db'
import { randomBytes } from 'node:crypto'
import { z } from 'zod'
import { hashPassword } from './auth/password'
import { subscriptionActive, type PlanId, type SubscriptionStatus } from './entitlements'
import { addMonths, isPaidPlan, type PaidPlanId } from './pricing'
import type { TFunction } from '@/i18n'

export const WELCOME_PROVIDER = 'hosgeldin'
export const ADMIN_PROVIDER = 'admin'
export const WELCOME_MONTHS = 6
export const WELCOME_LIMIT = 1000

type Tx = Parameters<Parameters<Db['transaction']>[0]>[0]

const isUnique = (e: unknown) => (e as { code?: string })?.code === '23505' || (e as { cause?: { code?: string } })?.cause?.code === '23505'

/**
 * Kayıt işleminin içinde çağrılır: kontenjan dolmadıysa WELCOME_MONTHS ay Premium.
 * Kilit, aynı anda gelen kayıtların kontenjanı aşmasını önler (sayım ve ekleme tek sırada).
 */
export async function grantWelcome(tx: Tx, userId: string, now = new Date()): Promise<Date | null> {
  await tx.execute(sql`select pg_advisory_xact_lock(hashtext('hosgeldin'))`)
  const [{ n }] = await tx.select({ n: sql<number>`count(*)::int` }).from(subscriptions).where(eq(subscriptions.provider, WELCOME_PROVIDER))
  if (n >= WELCOME_LIMIT) return null
  const endsAt = addMonths(now, WELCOME_MONTHS)
  await tx.insert(subscriptions).values({
    userId, planId: 'premium', status: 'active', provider: WELCOME_PROVIDER, providerRef: userId, currentPeriodEnd: endsAt,
  })
  return endsAt
}

export async function welcomeRemaining(db: Db) {
  const [{ n }] = await db.select({ n: sql<number>`count(*)::int` }).from(subscriptions).where(eq(subscriptions.provider, WELCOME_PROVIDER))
  return Math.max(0, WELCOME_LIMIT - n)
}

/** /kayit ve /fiyatlar kampanya notu; kontenjan dolunca null (gösterilmez). */
export function welcomeNoticeText(t: TFunction, remaining: number): string | null {
  if (remaining <= 0) return null
  return t('pricing.welcome.notice', { limit: WELCOME_LIMIT, months: WELCOME_MONTHS, n: remaining })
}

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

/** until: bitiş tarihi; null = süresiz */
export const grantSchema = z.object({
  userId: z.string().uuid(),
  plan: z.enum(['premium', 'family']),
  until: z.coerce.date().nullable(),
})

/** Kullanıcının admin üyeliğini verir ya da plan/bitişini değiştirir. Geçmiş bir tarih vermek erişimi kapatır. */
export async function grantMembership(db: Db, userId: string, plan: PaidPlanId, until: Date | null) {
  const [u] = await db.select({ id: users.id }).from(users).where(eq(users.id, userId)).limit(1)
  if (!u) return false
  await db.insert(subscriptions)
    .values({ userId, planId: plan, status: 'active', provider: ADMIN_PROVIDER, providerRef: userId, currentPeriodEnd: until })
    .onConflictDoUpdate({
      target: [subscriptions.provider, subscriptions.providerRef],
      set: { planId: plan, status: 'active', currentPeriodEnd: until },
    })
  return true
}

/** Admin üyeliğini ve hoş geldin hediyesini kapatır; ücretli abonelik ve deneme olduğu gibi kalır. */
export async function revokeMembership(db: Db, userId: string) {
  const r = await db.update(subscriptions).set({ status: 'expired' })
    .where(and(eq(subscriptions.userId, userId), inArray(subscriptions.provider, [ADMIN_PROVIDER, WELCOME_PROVIDER])))
    .returning({ id: subscriptions.id })
  return r.length > 0
}

export const createUserSchema = z.object({
  name: z.string().trim().min(1, 'Ad gerekli').max(80),
  email: z.string().trim().toLowerCase().email('E-posta geçersiz').max(254).optional().or(z.literal('').transform(() => undefined)),
  username: z.string().trim().toLowerCase().regex(/^[a-z0-9._-]{3,40}$/, 'Kullanıcı adı 3-40 karakter: harf, rakam, . _ -').optional()
    .or(z.literal('').transform(() => undefined)),
  // Boşsa üretilir ve bir kez gösterilir
  password: z.string().min(10, 'Parola en az 10 karakter olmalı').max(200).optional().or(z.literal('').transform(() => undefined)),
  role: z.enum(['student', 'parent', 'teacher', 'admin']).default('student'),
  plan: z.enum(['none', 'premium', 'family']).default('none'),
  until: z.coerce.date().nullable().default(null),
}).refine((v) => v.email || v.username, { message: 'E-posta ya da kullanıcı adı gerekli', path: ['email'] })

export type CreateUserResult =
  | { ok: true; user: { id: string; name: string; email: string | null; username: string | null }; password: string | null }
  | { ok: false; code: 'invalid_input' | 'taken'; message: string }

// Karışabilecek karakterler (0/O, 1/l/I) yok
const ALPHABET = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
export function generatePassword(len = 12) {
  return Array.from(randomBytes(len), (b) => ALPHABET[b % ALPHABET.length]).join('')
}

export async function createUserByAdmin(db: Db, input: unknown): Promise<CreateUserResult> {
  const parsed = createUserSchema.safeParse(input)
  if (!parsed.success) return { ok: false, code: 'invalid_input', message: parsed.error.issues[0]?.message ?? 'Geçersiz bilgi' }
  const v = parsed.data
  const generated = v.password ? null : generatePassword()
  const passwordHash = await hashPassword(v.password ?? generated!)
  try {
    const user = await db.transaction(async (tx) => {
      const [u] = await tx.insert(users).values({
        name: v.name, email: v.email ?? null, username: v.username ?? null, passwordHash, role: v.role, loginMode: 'email',
      }).returning({ id: users.id, name: users.name, email: users.email, username: users.username })
      if (v.plan !== 'none') {
        await tx.insert(subscriptions).values({
          userId: u.id, planId: v.plan, status: 'active', provider: ADMIN_PROVIDER, providerRef: u.id, currentPeriodEnd: v.until,
        })
      }
      return u
    })
    return { ok: true, user, password: generated }
  } catch (e) {
    if (isUnique(e)) return { ok: false, code: 'taken', message: 'Bu e-posta ya da kullanıcı adı zaten kayıtlı' }
    throw e
  }
}

export interface AdminUserRow {
  id: string
  name: string
  email: string | null
  username: string | null
  role: string
  createdAt: Date
  /** Etkin en yüksek plan; yoksa null */
  plan: PaidPlanId | null
  /** null = süresiz (plan varken) */
  until: Date | null
  source: string | null
}

/** Ad, e-posta ya da kullanıcı adında arar; en yeni kayıtlar önce. */
export async function listUsers(db: Db, q = '', limit = 200, now = new Date()): Promise<AdminUserRow[]> {
  const term = q.trim()
  // % ve _ aranan metinde jokere dönüşmesin
  const like = `%${term.replace(/[\\%_]/g, (c) => `\\${c}`)}%`
  const where = term ? sql`(${users.name} ilike ${like} or ${users.email} ilike ${like} or ${users.username} ilike ${like})` : undefined
  const rows = await db.select({
    id: users.id, name: users.name, email: users.email, username: users.username, role: users.role, createdAt: users.createdAt,
  }).from(users).where(where).orderBy(sql`${users.createdAt} desc`).limit(limit)
  if (!rows.length) return []
  const subs = await db.select({
    userId: subscriptions.userId, planId: subscriptions.planId, status: subscriptions.status,
    end: subscriptions.currentPeriodEnd, provider: subscriptions.provider,
  }).from(subscriptions).where(inArray(subscriptions.userId, rows.map((r) => r.id)))

  const rank = { premium: 1, family: 2 } as const
  return rows.map((r) => {
    const active = subs.filter((s) => s.userId === r.id && isPaidPlan(s.planId)
      && subscriptionActive({ planId: s.planId as PlanId, status: s.status as SubscriptionStatus, currentPeriodEnd: s.end }, now))
    // En yüksek plan; eşitse en geç biten (süresiz en sonda biter)
    active.sort((a, b) => rank[b.planId as PaidPlanId] - rank[a.planId as PaidPlanId]
      || (b.end?.getTime() ?? Infinity) - (a.end?.getTime() ?? Infinity))
    const best = active[0]
    return { ...r, plan: (best?.planId as PaidPlanId) ?? null, until: best?.end ?? null, source: best?.provider ?? null }
  })
}
