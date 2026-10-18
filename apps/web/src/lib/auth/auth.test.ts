import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import { migrate } from 'drizzle-orm/pglite/migrator'
import { fileURLToPath } from 'node:url'
import { beforeAll, describe, expect, it } from 'vitest'
import * as schema from '@ask/db'
import type { Db } from '@ask/db'
import { hashPassword, verifyPassword } from './password'
import { rateLimited } from './rate-limit'
import { consents, eq } from '@ask/db'
import { createQrCredentials, hashQrSecret, loginWithQr, QR_LIMIT, qrLoginUrl } from './qr'
import { changePassword, loginUser, mayBeUnder16, registerUser } from './service'
import { createSession, deleteSession, getSessionUser, SESSION_TTL_MS } from './session'

let db: Db

beforeAll(async () => {
  const pg = new PGlite()
  const pgDb = drizzle(pg, { schema })
  await migrate(pgDb, {
    migrationsFolder: fileURLToPath(new URL('../../../../../packages/db/migrations', import.meta.url)),
  })
  db = pgDb as unknown as Db
})

const NOW = new Date('2026-10-14T12:00:00Z')
const valid = { email: 'Ada@Example.com', password: 'cok-guclu-parola', name: 'Ada', role: 'student', birthYear: 2000 }

describe('parola', () => {
  it('doğru parolayı kabul eder, yanlışı reddeder', async () => {
    const h = await hashPassword('abc12345678')
    expect(await verifyPassword('abc12345678', h)).toBe(true)
    expect(await verifyPassword('abc12345679', h)).toBe(false)
  })
  it('bozuk özet formatını reddeder', async () => {
    expect(await verifyPassword('x', 'duz-metin')).toBe(false)
  })
})

describe('kayıt ve giriş', () => {
  it('kayıt olur, e-postayı küçük harfe çevirir, oturum açar', async () => {
    const r = await registerUser(db, valid, NOW)
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.user.email).toBe('ada@example.com')
      expect((await getSessionUser(db, r.token))?.name).toBe('Ada')
    }
  })
  it('aynı e-postayı (büyük/küçük harf fark etmez) ikinci kez kabul etmez', async () => {
    const r = await registerUser(db, { ...valid, email: 'ADA@example.com' }, NOW)
    expect(r).toMatchObject({ ok: false, code: 'email_taken' })
  })
  it('kısa parolayı, veli onayı olmayan 16 yaş altını, admin rolünü ve doğum yılı olmayanı reddeder', async () => {
    expect(await registerUser(db, { ...valid, email: 'a@b.co', password: 'kisa' }, NOW)).toMatchObject({ ok: false, code: 'invalid_input' })
    expect(await registerUser(db, { ...valid, email: 'c@d.co', birthYear: 2014 }, NOW)).toMatchObject({ ok: false, code: 'invalid_input' })
    expect(await registerUser(db, { ...valid, email: 'c@d.co', birthYear: 2014, guardianConsent: false }, NOW)).toMatchObject({ ok: false, code: 'invalid_input' })
    expect(await registerUser(db, { ...valid, email: 'e@f.co', role: 'admin' }, NOW)).toMatchObject({ ok: false, code: 'invalid_input' })
    expect(await registerUser(db, { ...valid, email: 'g@h.co', birthYear: undefined }, NOW)).toMatchObject({ ok: false, code: 'invalid_input' })
  })
  it('16 yaş altı: veli onayıyla kaydolur, consents satırı (veli_acik_riza) yazılır', async () => {
    expect(mayBeUnder16(2010, NOW)).toBe(true)
    expect(mayBeUnder16(2009, NOW)).toBe(false)
    const r = await registerUser(db, { ...valid, email: 'kucuk@example.com', birthYear: 2015, guardianConsent: true }, NOW)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const rows = await db.select().from(consents).where(eq(consents.userId, r.user.id))
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ kind: 'veli_acik_riza', granted: true, grantedBy: null })
    const [u] = await db.select().from(schema.users).where(eq(schema.users.id, r.user.id))
    expect(u.birthYear).toBe(2015)
  })
  it('yetişkin kaydında onay satırı yok; öğretmen rolü 18+ ister; profil kaydedilir', async () => {
    const profile = { who: 'okulum', age: 34, interests: ['robotik'], level: 'orta', goalMin: 15, time: 'aksam', course: 'arduino-temelleri', createdAt: 1 }
    const t = await registerUser(db, { ...valid, email: 'ogretmen@example.com', role: 'teacher', birthYear: 1990, profile }, NOW)
    expect(t).toMatchObject({ ok: true, user: { role: 'teacher' } })
    if (!t.ok) return
    expect(await db.select().from(consents).where(eq(consents.userId, t.user.id))).toHaveLength(0)
    const [u] = await db.select().from(schema.users).where(eq(schema.users.id, t.user.id))
    expect(u.profile).toEqual(profile)
    expect(await registerUser(db, { ...valid, email: 'genc@example.com', role: 'teacher', birthYear: 2010, guardianConsent: true }, NOW)).toMatchObject({ ok: false, code: 'invalid_input' })
  })
  it('bozuk profil kaydı engellemez, yok sayılır', async () => {
    const r = await registerUser(db, { ...valid, email: 'bozuk@example.com', profile: { who: 'hacker', age: 'x' } }, NOW)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const [u] = await db.select().from(schema.users).where(eq(schema.users.id, r.user.id))
    expect(u.profile).toBeNull()
  })
  it('doğru parolayla girer', async () => {
    const r = await loginUser(db, { email: 'ada@example.com', password: valid.password })
    expect(r.ok).toBe(true)
  })
  it('yeni form alanı (login) e-postayla da çalışır', async () => {
    expect((await loginUser(db, { login: ' ADA@example.com ', password: valid.password })).ok).toBe(true)
  })
  it('yanlış parola ve bilinmeyen e-postada aynı hatayı verir', async () => {
    const a = await loginUser(db, { email: 'ada@example.com', password: 'yanlis-parola-1' })
    const b = await loginUser(db, { email: 'yok@example.com', password: 'yanlis-parola-1' })
    expect(a).toMatchObject({ ok: false, code: 'bad_credentials' })
    expect(b).toEqual(a)
  })
})

describe('kullanıcı adıyla giriş (okul hesabı)', () => {
  beforeAll(async () => {
    await db.insert(schema.users).values({ username: 'ada.k-7b', name: 'Ada K', passwordHash: await hashPassword('okul-parolasi-1') })
    await db.insert(schema.users).values({ username: 'qr.only', name: 'Parolasız', loginMode: 'qr' })
  })
  it('kullanıcı adı + parolayla girer (büyük/küçük harf duyarsız)', async () => {
    const r = await loginUser(db, { login: 'Ada.K-7B', password: 'okul-parolasi-1' })
    expect(r).toMatchObject({ ok: true, user: { username: 'ada.k-7b', email: null, name: 'Ada K' } })
    if (r.ok) expect((await getSessionUser(db, r.token))?.username).toBe('ada.k-7b')
  })
  it('yanlış parola, bilinmeyen ad ve parolasız hesap aynı hatayı verir', async () => {
    const a = await loginUser(db, { login: 'ada.k-7b', password: 'yanlis' })
    expect(a).toMatchObject({ ok: false, code: 'bad_credentials' })
    expect(await loginUser(db, { login: 'yok.boyle', password: 'yanlis' })).toEqual(a)
    expect(await loginUser(db, { login: 'qr.only', password: 'herhangi' })).toEqual(a)
  })
})

describe('QR kartla giriş', () => {
  const secret = createQrCredentials()
  beforeAll(async () => {
    await db.insert(schema.users).values({ username: 'minik.ali', name: 'Ali', loginMode: 'qr', loginSecretHash: secret.hash })
    await db.insert(schema.users).values({ username: 'ogretmen.qr', name: 'Öğretmen', role: 'teacher', loginMode: 'qr', loginSecretHash: secret.hash })
  })
  it('kod üretimi: özet SHA-256, kod tahmin edilemez uzunlukta; adres biçimi', () => {
    expect(secret.secret).toMatch(/^[\w-]{10}$/)
    expect(secret.hash).toBe(hashQrSecret(secret.secret))
    expect(createQrCredentials().secret).not.toBe(secret.secret)
    expect(qrLoginUrl('https://ask.example/', 'minik.ali', 'a+b')).toBe('https://ask.example/giris/qr?u=minik.ali&k=a%2Bb')
  })
  it('doğru kartla öğrenci girer, oturum açılır', async () => {
    const r = await loginWithQr(db, { u: 'Minik.Ali', k: secret.secret }, 'ip-1')
    expect(r).toMatchObject({ ok: true, user: { username: 'minik.ali', role: 'student' } })
    if (r.ok) expect((await getSessionUser(db, r.token))?.name).toBe('Ali')
  })
  it('yanlış kod, bilinmeyen kullanıcı ve öğretmen hesabı reddedilir', async () => {
    const other = createQrCredentials().secret
    expect(await loginWithQr(db, { u: 'minik.ali', k: other }, 'ip-2')).toMatchObject({ ok: false, code: 'bad_credentials' })
    expect(await loginWithQr(db, { u: 'yok.kimse', k: secret.secret }, 'ip-2')).toMatchObject({ ok: false, code: 'bad_credentials' })
    expect(await loginWithQr(db, { u: 'ogretmen.qr', k: secret.secret }, 'ip-2')).toMatchObject({ ok: false, code: 'bad_credentials' })
    expect(await loginWithQr(db, { u: 'minik.ali', k: 'kisa' }, 'ip-2')).toMatchObject({ ok: false, code: 'invalid_input' })
  })
  it('kullanıcı başına hız sınırı: doğru kod bile sınırdan sonra reddedilir', async () => {
    const t = 5_000_000
    for (let i = 0; i < QR_LIMIT.perUser; i++) await loginWithQr(db, { u: 'minik.ali', k: createQrCredentials().secret }, `ip-rl-${i}`, t)
    expect(await loginWithQr(db, { u: 'minik.ali', k: secret.secret }, 'ip-rl-x', t)).toMatchObject({ ok: false, code: 'rate_limited' })
    expect((await loginWithQr(db, { u: 'minik.ali', k: secret.secret }, 'ip-rl-x', t + QR_LIMIT.windowMs + 1)).ok).toBe(true)
  })
  it('IP başına hız sınırı', async () => {
    const t = 9_000_000
    for (let i = 0; i < QR_LIMIT.perIp; i++) await loginWithQr(db, { u: `deneme-${i}`, k: secret.secret }, 'ip-saldiri', t)
    expect(await loginWithQr(db, { u: 'minik.ali', k: secret.secret }, 'ip-saldiri', t)).toMatchObject({ ok: false, code: 'rate_limited' })
  })
})

describe('oturum', () => {
  it('süresi dolunca kullanıcı döndürmez', async () => {
    const [u] = await db.select().from(schema.users).limit(1)
    const { token } = await createSession(db, u.id, new Date(Date.now() - SESSION_TTL_MS - 1000))
    expect(await getSessionUser(db, token)).toBeNull()
  })
  it('çıkışta silinir; ham token veritabanında saklanmaz', async () => {
    const [u] = await db.select().from(schema.users).limit(1)
    const { token } = await createSession(db, u.id)
    const rows = await db.select().from(schema.sessions)
    expect(rows.some((s) => s.tokenHash === token)).toBe(false)
    await deleteSession(db, token)
    expect(await getSessionUser(db, token)).toBeNull()
  })
  it('geçersiz ve boş token null döner', async () => {
    expect(await getSessionUser(db, 'uydurma')).toBeNull()
    expect(await getSessionUser(db, undefined)).toBeNull()
  })
})

describe('parola değiştirme', () => {
  const pw = { email: 'degis@example.com', password: 'eski-parola-123', name: 'Değiş', role: 'student', birthYear: 1995 }
  it('mevcut parola doğruysa yenisini yazar; bu oturum kalır, diğerleri kapanır', async () => {
    const r = await registerUser(db, pw, NOW)
    if (!r.ok) throw new Error('kayıt olmadı')
    const other = await createSession(db, r.user.id)
    const res = await changePassword(db, r.user.id, { current: pw.password, next: 'yeni-parola-456' }, r.token)
    expect(res).toEqual({ ok: true, signedOut: 1 })
    expect((await getSessionUser(db, r.token))?.name).toBe('Değiş')
    expect(await getSessionUser(db, other.token)).toBeNull()
    expect(await loginUser(db, { login: pw.email, password: pw.password })).toMatchObject({ ok: false, code: 'bad_credentials' })
    expect((await loginUser(db, { login: pw.email, password: 'yeni-parola-456' })).ok).toBe(true)
  })
  it('yanlış mevcut parola, kısa yeni parola ve aynı parola reddedilir; parola değişmez', async () => {
    const [u] = await db.select().from(schema.users).where(eq(schema.users.email, pw.email))
    expect(await changePassword(db, u.id, { current: 'yanlis-parola', next: 'baska-parola-789' })).toMatchObject({ ok: false, code: 'bad_current' })
    expect(await changePassword(db, u.id, { current: 'yeni-parola-456', next: 'kisa' })).toMatchObject({ ok: false, code: 'invalid_input', message: 'Parola en az 10 karakter olmalı' })
    expect(await changePassword(db, u.id, { current: 'yeni-parola-456', next: 'yeni-parola-456' })).toMatchObject({ ok: false, code: 'same_password' })
    expect(await changePassword(db, u.id, null)).toMatchObject({ ok: false, code: 'invalid_input' })
    expect((await loginUser(db, { login: pw.email, password: 'yeni-parola-456' })).ok).toBe(true)
  })
  it('parolasız (QR) hesap açık bir hatayla reddedilir; bilinmeyen kullanıcı bulunamaz', async () => {
    const [u] = await db.insert(schema.users).values({ username: 'qr.parolasiz', name: 'QR', loginMode: 'qr', loginSecretHash: 'x' }).returning()
    expect(await changePassword(db, u.id, { current: 'herhangi-bir', next: 'yeni-parola-456' })).toMatchObject({ ok: false, code: 'no_password' })
    expect(await changePassword(db, '00000000-0000-0000-0000-000000000000', { current: 'a', next: 'yeni-parola-456' })).toMatchObject({ ok: false, code: 'not_found' })
  })
  it('jeton verilmezse tüm oturumlar kapanır', async () => {
    const [u] = await db.select().from(schema.users).where(eq(schema.users.email, pw.email))
    const a = await createSession(db, u.id)
    expect(await changePassword(db, u.id, { current: 'yeni-parola-456', next: 'ucuncu-parola-0' })).toMatchObject({ ok: true })
    expect(await getSessionUser(db, a.token)).toBeNull()
  })
})

describe('hız sınırı', () => {
  it('limitten sonra engeller, pencere geçince açar', () => {
    const t = 1_000_000
    for (let i = 0; i < 5; i++) expect(rateLimited('k', 5, 1000, t)).toBe(false)
    expect(rateLimited('k', 5, 1000, t)).toBe(true)
    expect(rateLimited('k', 5, 1000, t + 2000)).toBe(false)
  })
})
