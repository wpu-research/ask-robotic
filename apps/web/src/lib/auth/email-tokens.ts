// E-posta doğrulama ve parola sıfırlama: tek kullanımlık, süreli belirteçler (DB'de yalnız SHA-256 özeti).
// Gönderim `Mailer` üzerinden; mailer null ise (SMTP ayarsız) hiçbir şey üretilmez, yazılmaz, gönderilmez.
import { createHash, randomBytes } from 'node:crypto'
import { z } from 'zod'
import { and, authTokens, eq, gt, isNull, sql, users, type Db } from '@ask/db'
import { hashPassword } from './password'
import { deleteOtherSessions } from './session'
import { resetPasswordMail, verifyEmailMail, type MailLocale } from '../mail/templates'
import type { Mailer } from '../mail/send'

export type TokenKind = 'verify_email' | 'reset_password'

export const TOKEN_TTL_MS: Record<TokenKind, number> = {
  verify_email: 24 * 60 * 60 * 1000,
  reset_password: 60 * 60 * 1000,
}

export const hashAuthToken = (token: string) => createHash('sha256').update(token).digest('hex')

/** Yeni belirteç üretir; aynı kullanıcı+tür için önceki kullanılmamış belirteçler geçersiz kılınır. */
export async function issueToken(db: Db, userId: string, kind: TokenKind, now = new Date()) {
  const token = randomBytes(32).toString('base64url')
  const expiresAt = new Date(now.getTime() + TOKEN_TTL_MS[kind])
  await db.delete(authTokens).where(and(eq(authTokens.userId, userId), eq(authTokens.kind, kind), isNull(authTokens.usedAt)))
  await db.insert(authTokens).values({ userId, kind, tokenHash: hashAuthToken(token), expiresAt })
  return { token, expiresAt }
}

/** Belirteci tek atomik UPDATE ile tüketir (eşzamanlı iki kullanım yarışında yalnız biri kazanır). */
export async function consumeToken(db: Db, token: unknown, kind: TokenKind, now = new Date()): Promise<string | null> {
  if (typeof token !== 'string' || token.length < 20 || token.length > 200) return null
  const rows = await db
    .update(authTokens)
    .set({ usedAt: now })
    .where(and(eq(authTokens.tokenHash, hashAuthToken(token)), eq(authTokens.kind, kind), isNull(authTokens.usedAt), gt(authTokens.expiresAt, now)))
    .returning({ userId: authTokens.userId })
  return rows[0]?.userId ?? null
}

export interface MailDeps { mailer: Mailer | null; appUrl: string; locale: MailLocale }

const link = (appUrl: string, path: string, token: string) => `${appUrl}${path}?token=${encodeURIComponent(token)}`

/** Doğrulama e-postası yollar. Mailer yoksa, kullanıcının e-postası yoksa ya da zaten doğrulanmışsa false. Asla fırlatmaz. */
export async function sendVerificationEmail(db: Db, userId: string, deps: MailDeps, now = new Date()): Promise<boolean> {
  if (!deps.mailer) return false
  try {
    const [u] = await db.select({ email: users.email, name: users.name, verified: users.emailVerifiedAt }).from(users).where(eq(users.id, userId)).limit(1)
    if (!u?.email || u.verified) return false
    const { token } = await issueToken(db, userId, 'verify_email', now)
    await deps.mailer.send(u.email, verifyEmailMail(deps.locale, u.name, link(deps.appUrl, '/eposta-dogrula', token)))
    return true
  } catch {
    // Ayrıntı (adres, bağlantı, SMTP yanıtı) bilerek günlüğe yazılmaz
    return false
  }
}

export const forgotSchema = z.object({ email: z.string().trim().toLowerCase().email().max(254) })

/**
 * "Şifremi unuttum": yanıt hesabın var olup olmadığına, parolası olup olmadığına ya da gönderimin başarısına
 * bağlı olmaz (hesap numaralandırması yok). Gönderim beklenmez; böylece süre farkı da bilgi sızdırmaz.
 */
export async function requestPasswordReset(db: Db, input: unknown, deps: MailDeps, now = new Date()): Promise<{ ok: true }> {
  const parsed = forgotSchema.safeParse(input)
  if (parsed.success && deps.mailer) {
    const mailer = deps.mailer
    const work = async () => {
      const [u] = await db.select({ id: users.id, name: users.name, passwordHash: users.passwordHash }).from(users).where(eq(users.email, parsed.data.email)).limit(1)
      // Parolasız (QR/resimli) okul hesaplarına sıfırlama gönderilmez
      if (!u || !u.passwordHash) return
      const { token } = await issueToken(db, u.id, 'reset_password', now)
      await mailer.send(parsed.data.email, resetPasswordMail(deps.locale, u.name, link(deps.appUrl, '/sifre-sifirla', token)))
    }
    void work().catch(() => { /* bilerek sessiz */ })
  }
  return { ok: true }
}

export const resetSchema = z.object({
  token: z.string().min(20).max(200),
  password: z.string().min(10, 'Parola en az 10 karakter olmalı').max(200),
})

export type ResetResult =
  | { ok: true; signedOut: number }
  | { ok: false; code: 'invalid_input' | 'invalid_token'; message: string }

/** Belirteçle yeni parola yazar; tüm oturumları kapatır. Parola geçersizse belirteç harcanmaz. */
export async function resetPassword(db: Db, input: unknown, now = new Date()): Promise<ResetResult> {
  const parsed = resetSchema.safeParse(input)
  if (!parsed.success) return { ok: false, code: 'invalid_input', message: parsed.error.issues[0]?.message ?? 'Geçersiz bilgi' }
  const userId = await consumeToken(db, parsed.data.token, 'reset_password', now)
  if (!userId) return { ok: false, code: 'invalid_token', message: 'Bağlantı geçersiz ya da süresi dolmuş' }
  await db.update(users).set({
    passwordHash: await hashPassword(parsed.data.password),
    // Sıfırlama e-postasına erişim, adresin sahibi olduğunu da gösterir
    emailVerifiedAt: sql`coalesce(${users.emailVerifiedAt}, ${now.toISOString()}::timestamptz)`,
  }).where(eq(users.id, userId))
  // Bekleyen diğer sıfırlama bağlantıları da kullanılamaz olsun
  await db.delete(authTokens).where(and(eq(authTokens.userId, userId), eq(authTokens.kind, 'reset_password'), isNull(authTokens.usedAt)))
  const signedOut = await deleteOtherSessions(db, userId, undefined)
  return { ok: true, signedOut }
}

export type VerifyResult = { ok: true } | { ok: false; code: 'invalid_token'; message: string }

export async function verifyEmail(db: Db, token: unknown, now = new Date()): Promise<VerifyResult> {
  const userId = await consumeToken(db, token, 'verify_email', now)
  if (!userId) return { ok: false, code: 'invalid_token', message: 'Bağlantı geçersiz ya da süresi dolmuş' }
  await db.update(users).set({ emailVerifiedAt: sql`coalesce(${users.emailVerifiedAt}, ${now.toISOString()}::timestamptz)` }).where(eq(users.id, userId))
  return { ok: true }
}
