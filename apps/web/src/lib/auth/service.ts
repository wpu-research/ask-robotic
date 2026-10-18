import { consents, eq, sql, users, type Db } from '@ask/db'
import { z } from 'zod'
import { profileSchema } from '@/lib/profile-schema'
import { DUMMY_HASH, hashPassword, verifyPassword } from './password'
import { grantWelcome } from '../membership'
import { createSession } from './session'

const email = z.string().trim().toLowerCase().email().max(254)

/** Yalnız doğum yılı tutulduğu için yıl farkı ≤ 16 ise kişi 16 yaşından küçük olabilir: veli onayı istenir. */
export const mayBeUnder16 = (birthYear: number, now = new Date()) => now.getFullYear() - birthYear <= 16

export function registerSchemaFor(now = new Date()) {
  const year = now.getFullYear()
  return z.object({
    email,
    password: z.string().min(10, 'Parola en az 10 karakter olmalı').max(200),
    name: z.string().trim().min(1, 'Adını yaz').max(80),
    // Okul öğrenci hesaplarını öğretmen açar; burada kendi kaydı yalnız şu rollerle (admin asla)
    role: z.enum(['student', 'parent', 'teacher']).default('student'),
    birthYear: z.coerce.number({ invalid_type_error: 'Doğum yılını seç' }).int().min(year - 100, 'Doğum yılı geçersiz').max(year - 4, 'Doğum yılı geçersiz'),
    // 16 yaş altı: veli/vasi açık rızası (KVKK) → consents 'veli_acik_riza'
    guardianConsent: z.boolean().optional(),
    // Onboarding cevapları (tarayıcıdan); bozuksa kayıt engellenmez, yok sayılır
    profile: profileSchema.optional().catch(undefined),
  }).superRefine((v, ctx) => {
    if (v.role !== 'student' && year - v.birthYear < 18) {
      ctx.addIssue({ code: 'custom', path: ['birthYear'], message: 'Veli ve öğretmen hesabı için 18 yaşından büyük olmalısın' })
    }
    if (mayBeUnder16(v.birthYear, now) && v.guardianConsent !== true) {
      ctx.addIssue({ code: 'custom', path: ['guardianConsent'], message: '16 yaşından küçüksen velinin onayı gerekli' })
    }
  })
}

// Eski istemciler { email } gönderir; yeni form { login } (e-posta ya da kullanıcı adı)
export const loginSchema = z.preprocess(
  (v) => (v && typeof v === 'object' && !('login' in v) && 'email' in v ? { ...v, login: (v as { email: unknown }).email } : v),
  z.object({ login: z.string().trim().min(1).max(254), password: z.string().min(1).max(200) }),
)

export interface AuthUser { id: string; email: string | null; username: string | null; name: string; role: string }

export type AuthResult =
  | { ok: true; token: string; expiresAt: Date; user: AuthUser }
  | { ok: false; code: 'invalid_input' | 'email_taken' | 'bad_credentials' | 'rate_limited'; message: string }

const pick = (u: typeof users.$inferSelect): AuthUser => ({ id: u.id, email: u.email, username: u.username, name: u.name, role: u.role })

export async function registerUser(db: Db, input: unknown, now = new Date()): Promise<AuthResult> {
  const parsed = registerSchemaFor(now).safeParse(input)
  if (!parsed.success) {
    return { ok: false, code: 'invalid_input', message: parsed.error.issues[0]?.message ?? 'Geçersiz bilgi' }
  }
  const { email, password, name, role, birthYear, profile } = parsed.data
  const taken = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1)
  if (taken.length) return { ok: false, code: 'email_taken', message: 'Bu e-posta zaten kayıtlı' }

  const passwordHash = await hashPassword(password)
  try {
    const user = await db.transaction(async (tx) => {
      const [u] = await tx.insert(users).values({ email, passwordHash, name, role, birthYear, loginMode: 'email', profile: profile ?? null }).returning()
      if (mayBeUnder16(birthYear, now)) await tx.insert(consents).values({ userId: u.id, kind: 'veli_acik_riza', granted: true })
      await grantWelcome(tx, u.id, now)
      return u
    })
    const { token, expiresAt } = await createSession(db, user.id)
    return { ok: true, token, expiresAt, user: pick(user) }
  } catch (err) {
    // Eşzamanlı iki kayıtta unique ihlali (23505)
    const e = err as { code?: string; cause?: { code?: string } }
    if (e.code === '23505' || e.cause?.code === '23505') {
      return { ok: false, code: 'email_taken', message: 'Bu e-posta zaten kayıtlı' }
    }
    throw err
  }
}

/** E-posta ('@' içerir) ya da kullanıcı adıyla (büyük/küçük harf duyarsız) parola girişi. */
export async function loginUser(db: Db, input: unknown): Promise<AuthResult> {
  const parsed = loginSchema.safeParse(input)
  if (!parsed.success) return { ok: false, code: 'invalid_input', message: 'Giriş bilgileri geçersiz' }
  const { login, password } = parsed.data
  const key = login.toLowerCase()
  const where = key.includes('@') ? eq(users.email, key) : sql`lower(${users.username}) = ${key}`
  const [user] = await db.select().from(users).where(where).limit(1)
  const valid = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH)
  if (!user || !user.passwordHash || !valid) return { ok: false, code: 'bad_credentials', message: 'Kullanıcı adı/e-posta ya da parola hatalı' }
  const { token, expiresAt } = await createSession(db, user.id)
  return { ok: true, token, expiresAt, user: pick(user) }
}
