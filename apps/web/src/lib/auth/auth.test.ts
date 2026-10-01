import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import { migrate } from 'drizzle-orm/pglite/migrator'
import { fileURLToPath } from 'node:url'
import { beforeAll, describe, expect, it } from 'vitest'
import * as schema from '@ask/db'
import type { Db } from '@ask/db'
import { hashPassword, verifyPassword } from './password'
import { rateLimited } from './rate-limit'
import { loginUser, registerUser } from './service'
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

const valid = { email: 'Ada@Example.com', password: 'cok-guclu-parola', name: 'Ada', role: 'student', adult: true }

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
    const r = await registerUser(db, valid)
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.user.email).toBe('ada@example.com')
      expect((await getSessionUser(db, r.token))?.name).toBe('Ada')
    }
  })
  it('aynı e-postayı (büyük/küçük harf fark etmez) ikinci kez kabul etmez', async () => {
    const r = await registerUser(db, { ...valid, email: 'ADA@example.com' })
    expect(r).toMatchObject({ ok: false, code: 'email_taken' })
  })
  it('kısa parolayı, 16 yaş onayı olmayanı ve admin rolünü reddeder', async () => {
    expect(await registerUser(db, { ...valid, email: 'a@b.co', password: 'kisa' })).toMatchObject({ ok: false, code: 'invalid_input' })
    expect(await registerUser(db, { ...valid, email: 'c@d.co', adult: false })).toMatchObject({ ok: false, code: 'invalid_input' })
    expect(await registerUser(db, { ...valid, email: 'e@f.co', role: 'admin' })).toMatchObject({ ok: false, code: 'invalid_input' })
  })
  it('doğru parolayla girer', async () => {
    const r = await loginUser(db, { email: 'ada@example.com', password: valid.password })
    expect(r.ok).toBe(true)
  })
  it('yanlış parola ve bilinmeyen e-postada aynı hatayı verir', async () => {
    const a = await loginUser(db, { email: 'ada@example.com', password: 'yanlis-parola-1' })
    const b = await loginUser(db, { email: 'yok@example.com', password: 'yanlis-parola-1' })
    expect(a).toMatchObject({ ok: false, code: 'bad_credentials' })
    expect(b).toEqual(a)
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

describe('hız sınırı', () => {
  it('limitten sonra engeller, pencere geçince açar', () => {
    const t = 1_000_000
    for (let i = 0; i < 5; i++) expect(rateLimited('k', 5, 1000, t)).toBe(false)
    expect(rateLimited('k', 5, 1000, t)).toBe(true)
    expect(rateLimited('k', 5, 1000, t + 2000)).toBe(false)
  })
})
