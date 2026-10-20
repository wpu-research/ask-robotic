import { beforeAll, describe, expect, it, vi } from 'vitest'
import { authTokens, eq, sessions, users, type Db } from '@ask/db'
import { createTestDb } from '../test-db'
import { mailConfig } from '../mail/config'
import { resetPasswordMail, verifyEmailMail } from '../mail/templates'
import type { Mailer } from '../mail/send'
import { loginUser, registerUser } from './service'
import { createSession, getSessionUser } from './session'
import {
  consumeToken, hashAuthToken, issueToken, requestPasswordReset, resetPassword, sendVerificationEmail, TOKEN_TTL_MS, verifyEmail,
  type MailDeps,
} from './email-tokens'

let db: Db
const NOW = new Date('2026-10-20T12:00:00Z')
const APP = 'https://app.test'

beforeAll(async () => { db = await createTestDb() })

function fakeMailer() {
  const sent: { to: string; subject: string; text: string; html: string }[] = []
  const mailer: Mailer = { send: async (to, c) => { sent.push({ to, ...c }) } }
  return { sent, deps: { mailer, appUrl: APP, locale: 'tr' } satisfies MailDeps }
}
const tokenIn = (text: string) => new URL(text.match(/https?:\/\/\S+/)![0]).searchParams.get('token')!
const flush = () => new Promise((r) => setTimeout(r, 50))

async function newUser(email: string, password = 'eski-parola-12345') {
  const r = await registerUser(db, { email, password, name: 'Ada', role: 'student', birthYear: 1990 }, NOW)
  if (!r.ok) throw new Error(r.message)
  return r
}

describe('SMTP yapılandırması', () => {
  const full = { SMTP_HOST: 'h', SMTP_PORT: '465', SMTP_USER: 'u', SMTP_PASS: 'p', MAIL_FROM: 'a@b.c', APP_URL: 'https://x.test/' }
  it('hepsi doluysa açık, sondaki / atılır', () => {
    expect(mailConfig(full)).toMatchObject({ host: 'h', port: 465, appUrl: 'https://x.test' })
  })
  it('herhangi biri eksikse kapalı (port boşsa 465 varsayılır)', () => {
    for (const k of Object.keys(full).filter((x) => x !== 'SMTP_PORT')) expect(mailConfig({ ...full, [k]: '' })).toBeNull()
    expect(mailConfig({})).toBeNull()
  })
  it('bozuk port ya da APP_URL kapalı sayılır', () => {
    expect(mailConfig({ ...full, SMTP_PORT: 'abc' })).toBeNull()
    expect(mailConfig({ ...full, APP_URL: 'ftp://x' })).toBeNull()
  })
})

describe('belirteç üretimi', () => {
  it('DB yalnız özeti saklar, ham belirteci değil; süreler 24 sa / 1 sa', async () => {
    const { user } = await newUser('uretim@example.com')
    const v = await issueToken(db, user.id, 'verify_email', NOW)
    const r = await issueToken(db, user.id, 'reset_password', NOW)
    expect(v.token).not.toBe(r.token)
    expect(v.token.length).toBeGreaterThanOrEqual(40)
    expect(v.expiresAt.getTime() - NOW.getTime()).toBe(24 * 3600_000)
    expect(r.expiresAt.getTime() - NOW.getTime()).toBe(3600_000)
    const rows = await db.select().from(authTokens).where(eq(authTokens.userId, user.id))
    expect(rows).toHaveLength(2)
    for (const row of rows) expect([v.token, r.token]).not.toContain(row.tokenHash)
    expect(rows.map((x) => x.tokenHash).sort()).toEqual([hashAuthToken(v.token), hashAuthToken(r.token)].sort())
  })
  it('yenisi üretilince öncekinin bağlantısı geçersiz olur', async () => {
    const { user } = await newUser('yeni@example.com')
    const a = await issueToken(db, user.id, 'reset_password', NOW)
    const b = await issueToken(db, user.id, 'reset_password', NOW)
    expect(await consumeToken(db, a.token, 'reset_password', NOW)).toBeNull()
    expect(await consumeToken(db, b.token, 'reset_password', NOW)).toBe(user.id)
  })
})

describe('süre ve tek kullanım', () => {
  it('süre dolunca reddeder (sınırda hâlâ geçerli, 1 ms sonra değil)', async () => {
    const { user } = await newUser('sure@example.com')
    const t = await issueToken(db, user.id, 'reset_password', NOW)
    const late = new Date(NOW.getTime() + TOKEN_TTL_MS.reset_password)
    expect(await consumeToken(db, t.token, 'reset_password', new Date(late.getTime() + 1))).toBeNull()
    expect(await consumeToken(db, t.token, 'reset_password', new Date(late.getTime() - 1))).toBe(user.id)
  })
  it('ikinci kullanım reddedilir; eşzamanlı iki denemeden yalnız biri kazanır', async () => {
    const { user } = await newUser('tek@example.com')
    const t = await issueToken(db, user.id, 'verify_email', NOW)
    const both = await Promise.all([consumeToken(db, t.token, 'verify_email', NOW), consumeToken(db, t.token, 'verify_email', NOW)])
    expect(both.filter(Boolean)).toHaveLength(1)
    expect(await consumeToken(db, t.token, 'verify_email', NOW)).toBeNull()
  })
  it('tür karışmaz: doğrulama belirteci sıfırlamada çalışmaz', async () => {
    const { user } = await newUser('tur@example.com')
    const t = await issueToken(db, user.id, 'verify_email', NOW)
    const r = await resetPassword(db, { token: t.token, password: 'yepyeni-parola-1' }, NOW)
    expect(r).toMatchObject({ ok: false, code: 'invalid_token' })
  })
  it('çöp girdiyi reddeder', async () => {
    for (const bad of [undefined, null, 42, '', 'kisa', 'x'.repeat(500), { a: 1 }]) expect(await consumeToken(db, bad, 'verify_email', NOW)).toBeNull()
  })
})

describe('e-posta doğrulama', () => {
  it('bağlantı hesabı doğrular, ikinci kullanım olmaz', async () => {
    const { user } = await newUser('dogrula@example.com')
    const { sent, deps } = fakeMailer()
    expect(await sendVerificationEmail(db, user.id, deps, NOW)).toBe(true)
    expect(sent).toHaveLength(1)
    expect(sent[0].to).toBe('dogrula@example.com')
    const token = tokenIn(sent[0].text)
    expect(sent[0].text).toContain(`${APP}/eposta-dogrula?token=`)
    expect((await db.select().from(users).where(eq(users.id, user.id)))[0].emailVerifiedAt).toBeNull()
    expect(await verifyEmail(db, token, NOW)).toEqual({ ok: true })
    expect((await db.select().from(users).where(eq(users.id, user.id)))[0].emailVerifiedAt).toEqual(NOW)
    expect(await verifyEmail(db, token, NOW)).toMatchObject({ ok: false })
    // doğrulanmış hesaba yeniden gönderilmez
    expect(await sendVerificationEmail(db, user.id, deps, NOW)).toBe(false)
    expect(sent).toHaveLength(1)
  })
  it('mailer yoksa (SMTP ayarsız) hiçbir şey üretilmez', async () => {
    const { user } = await newUser('sessiz@example.com')
    expect(await sendVerificationEmail(db, user.id, { mailer: null, appUrl: '', locale: 'tr' }, NOW)).toBe(false)
    expect(await db.select().from(authTokens).where(eq(authTokens.userId, user.id))).toHaveLength(0)
  })
  it('gönderim hatası fırlatmaz', async () => {
    const { user } = await newUser('hata@example.com')
    const mailer: Mailer = { send: async () => { throw new Error('smtp down') } }
    await expect(sendVerificationEmail(db, user.id, { mailer, appUrl: APP, locale: 'en' }, NOW)).resolves.toBe(false)
  })
  it('doğrulama zorunlu değil: doğrulanmamış hesap giriş yapabilir', async () => {
    await newUser('girer@example.com', 'girer-parola-12345')
    const r = await loginUser(db, { login: 'girer@example.com', password: 'girer-parola-12345' })
    expect(r.ok).toBe(true)
  })
  it('16 yaş altı kaydı ve veli onayı akışı değişmedi', async () => {
    const r = await registerUser(db, { email: 'kucuk@example.com', password: 'kucuk-parola-123', name: 'Can', role: 'student', birthYear: 2015 }, NOW)
    expect(r).toMatchObject({ ok: false, code: 'invalid_input' })
    const ok = await registerUser(db, { email: 'kucuk@example.com', password: 'kucuk-parola-123', name: 'Can', role: 'student', birthYear: 2015, guardianConsent: true }, NOW)
    expect(ok.ok).toBe(true)
  })
})

describe('parola sıfırlama', () => {
  it('var olan ve olmayan hesap için yanıt aynı; yalnız var olana e-posta gider', async () => {
    await newUser('var@example.com')
    const { sent, deps } = fakeMailer()
    const a = await requestPasswordReset(db, { email: 'var@example.com' }, deps, NOW)
    const b = await requestPasswordReset(db, { email: 'yok@example.com' }, deps, NOW)
    const c = await requestPasswordReset(db, { email: 'gecersiz' }, deps, NOW)
    const d = await requestPasswordReset(db, null, deps, NOW)
    await flush()
    expect(b).toEqual(a); expect(c).toEqual(a); expect(d).toEqual(a)
    expect(sent).toHaveLength(1)
    expect(sent[0].to).toBe('var@example.com')
    const all = await db.select().from(authTokens)
    expect(all.every((x) => x.kind === 'reset_password' || x.kind === 'verify_email')).toBe(true)
  })
  it('gönderim hatası yanıtı değiştirmez', async () => {
    await newUser('bozuk@example.com')
    const mailer: Mailer = { send: async () => { throw new Error('boom') } }
    const r = await requestPasswordReset(db, { email: 'bozuk@example.com' }, { mailer, appUrl: APP, locale: 'tr' }, NOW)
    await flush()
    expect(r).toEqual({ ok: true })
  })
  it('SMTP ayarsızken hiçbir belirteç üretilmez ve konsola yazılmaz', async () => {
    const { user } = await newUser('kapali@example.com')
    const spies = (['log', 'info', 'warn', 'error', 'debug'] as const).map((m) => vi.spyOn(console, m).mockImplementation(() => {}))
    const r = await requestPasswordReset(db, { email: 'kapali@example.com' }, { mailer: null, appUrl: '', locale: 'tr' }, NOW)
    await flush()
    expect(r).toEqual({ ok: true })
    expect(await db.select().from(authTokens).where(eq(authTokens.userId, user.id))).toHaveLength(0)
    for (const s of spies) { expect(s).not.toHaveBeenCalled(); s.mockRestore() }
  })
  it('QR/resimli (parolasız) hesaba sıfırlama gönderilmez', async () => {
    await db.insert(users).values({ username: 'ada.k-7b', email: 'okul@example.com', name: 'Okul', loginMode: 'qr' })
    const { sent, deps } = fakeMailer()
    await requestPasswordReset(db, { email: 'okul@example.com' }, deps, NOW)
    await flush()
    expect(sent).toHaveLength(0)
  })
  it('belirteçle parola değişir, eski parola geçersiz, tüm oturumlar iptal, belirteç tek kullanımlık', async () => {
    const reg = await newUser('sifirla@example.com', 'eski-parola-12345')
    const s2 = await createSession(db, reg.user.id)
    const { sent, deps } = fakeMailer()
    await requestPasswordReset(db, { email: 'sifirla@example.com' }, deps, NOW)
    await flush()
    const token = tokenIn(sent[0].text)
    expect(sent[0].text).toContain(`${APP}/sifre-sifirla?token=`)
    expect(await getSessionUser(db, reg.token)).not.toBeNull()

    expect(await resetPassword(db, { token, password: 'yepyeni-parola-1' }, NOW)).toEqual({ ok: true, signedOut: 2 })
    expect(await getSessionUser(db, reg.token)).toBeNull()
    expect(await getSessionUser(db, s2.token)).toBeNull()
    expect(await db.select().from(sessions).where(eq(sessions.userId, reg.user.id))).toHaveLength(0)
    expect((await loginUser(db, { login: 'sifirla@example.com', password: 'eski-parola-12345' })).ok).toBe(false)
    expect((await loginUser(db, { login: 'sifirla@example.com', password: 'yepyeni-parola-1' })).ok).toBe(true)
    expect(await resetPassword(db, { token, password: 'bir-baska-parola-9' }, NOW)).toMatchObject({ ok: false, code: 'invalid_token' })
    // sıfırlama e-postasına erişim adresi de doğrular
    expect((await db.select().from(users).where(eq(users.id, reg.user.id)))[0].emailVerifiedAt).toEqual(NOW)
  })
  it('kısa parola reddedilir ve belirteci harcamaz', async () => {
    const reg = await newUser('kisa@example.com')
    const t = await issueToken(db, reg.user.id, 'reset_password', NOW)
    expect(await resetPassword(db, { token: t.token, password: 'kisa' }, NOW)).toMatchObject({ ok: false, code: 'invalid_input' })
    expect(await resetPassword(db, { token: t.token, password: 'yeterince-uzun-1' }, NOW)).toMatchObject({ ok: true })
  })
  it('süresi dolmuş belirteçle sıfırlanmaz', async () => {
    const reg = await newUser('eski@example.com')
    const t = await issueToken(db, reg.user.id, 'reset_password', NOW)
    const later = new Date(NOW.getTime() + 3600_000 + 1000)
    expect(await resetPassword(db, { token: t.token, password: 'yeterince-uzun-1' }, later)).toMatchObject({ ok: false, code: 'invalid_token' })
  })
})

describe('e-posta şablonları', () => {
  const link = 'https://app.test/sifre-sifirla?token=abc&x=1'
  it('TR ve EN, marka Macademia, bağlantı HTML ve düz metinde', () => {
    for (const locale of ['tr', 'en'] as const) {
      for (const m of [verifyEmailMail(locale, 'Ada', link), resetPasswordMail(locale, 'Ada', link)]) {
        expect(m.subject).toContain('Macademia')
        expect(m.html).toContain('Macademia')
        expect(m.text).toContain(link)
        expect(m.html).toContain('token=abc&amp;x=1')
        expect(m.html).toContain(`lang="${locale}"`)
      }
    }
    expect(resetPasswordMail('tr', 'Ada', link).subject).toMatch(/parola/i)
    expect(resetPasswordMail('en', 'Ada', link).subject).toMatch(/password/i)
  })
  it('ad HTML olarak kaçırılır', () => {
    expect(verifyEmailMail('en', '<script>x</script>', link).html).not.toContain('<script>')
  })
})
