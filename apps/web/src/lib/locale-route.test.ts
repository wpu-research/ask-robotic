// PUT /api/me/locale: users.locale yazılır, ask-locale çerezi eşitlenir; misafir 401, geçersiz dil 400.
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { users, eq, type Db } from '@ask/db'
import { createSession, SESSION_COOKIE } from './auth/session'
import { createTestDb } from './test-db'

const h = vi.hoisted(() => ({ db: null as unknown, jar: new Map<string, string>() }))
vi.mock('@/lib/db', () => ({ getDb: () => h.db }))
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (k: string) => (h.jar.has(k) ? { name: k, value: h.jar.get(k) } : undefined),
    set: (k: string, v: string) => { h.jar.set(k, v) },
    delete: (k: string) => { h.jar.delete(k) },
  }),
}))

let db: Db
beforeAll(async () => { db = await createTestDb(); h.db = db }, 60_000)

const put = async (body: unknown) => {
  const { PUT } = await import('../app/api/me/locale/route')
  return PUT(new Request('http://localhost/api/me/locale', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }))
}

describe('PUT /api/me/locale', () => {
  it('misafir 401', async () => {
    h.jar.clear()
    expect((await put({ locale: 'en' })).status).toBe(401)
  })

  it('kullanıcının dilini yazar ve çerezi eşitler; geçersiz dil 400', async () => {
    const [u] = await db.insert(users).values({ email: 'dil@example.com', name: 'Dil' }).returning()
    expect(u.locale).toBe('tr')
    h.jar.clear()
    h.jar.set(SESSION_COOKIE, (await createSession(db, u.id)).token)
    const res = await put({ locale: 'en' })
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ locale: 'en' })
    expect(h.jar.get('ask-locale')).toBe('en')
    expect((await db.select({ l: users.locale }).from(users).where(eq(users.id, u.id)))[0].l).toBe('en')
    expect((await put({ locale: 'fr' })).status).toBe(400)
  })
})
