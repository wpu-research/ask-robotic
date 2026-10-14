// Uç noktalar (route handler) uçtan uca: çerez kavanozu ve DB taklit edilir (PGlite).
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { events, users, xpEvents, eq, type Db } from '@ask/db'
import { createQrCredentials } from './auth/qr'
import { hashPassword } from './auth/password'
import { XP } from './gamification-core'
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

const req = (url: string, method: string, body?: unknown) =>
  new Request(`http://localhost${url}`, { method, headers: { 'content-type': 'application/json', 'x-forwarded-for': '10.0.0.9' }, body: body === undefined ? undefined : JSON.stringify(body) })

const me = async () => (await (await import('../app/api/me/route')).GET()).json()

describe('oturum uçları', () => {
  it('misafir /api/me: 200 ve user null', async () => {
    h.jar.clear()
    expect(await me()).toEqual({ user: null, profile: null, game: null, doneLessonIds: [] })
  })

  it('kayıt çerez yazar; /api/me kullanıcıyı ve onboarding profilini döndürür', async () => {
    h.jar.clear()
    const { POST } = await import('../app/api/auth/register/route')
    const profile = { who: 'kendim', age: 11, interests: ['oyun'], level: 'yeni', goalMin: 10, time: 'ogle', course: 'scratch', createdAt: 5 }
    const res = await POST(req('/api/auth/register', 'POST', { email: 'deniz@example.com', password: 'uzun-bir-parola', name: 'Deniz', role: 'student', birthYear: new Date().getFullYear() - 11, guardianConsent: true, profile }))
    expect(res.status).toBe(201)
    expect(h.jar.get('ask_session')).toBeTruthy()
    const m = await me()
    expect(m.user).toMatchObject({ name: 'Deniz', role: 'student', locale: 'tr' })
    expect(m.user.username).toBeUndefined()
    expect(m.profile).toEqual(profile)
  })

  it('kullanıcı adıyla giriş (login alanı)', async () => {
    await db.insert(users).values({ username: 'can.5b', name: 'Can', passwordHash: await hashPassword('okul-parolasi-2') })
    h.jar.clear()
    const { POST } = await import('../app/api/auth/login/route')
    expect((await POST(req('/api/auth/login', 'POST', { login: 'can.5b', password: 'yanlis' }))).status).toBe(401)
    expect((await POST(req('/api/auth/login', 'POST', { login: 'CAN.5B', password: 'okul-parolasi-2' }))).status).toBe(200)
    expect((await me()).user).toMatchObject({ name: 'Can', username: 'can.5b' })
  })

  it('QR uç noktası: geçersiz 401, geçerli 200 + çerez', async () => {
    const q = createQrCredentials()
    await db.insert(users).values({ username: 'minik.su', name: 'Su', loginMode: 'qr', loginSecretHash: q.hash })
    h.jar.clear()
    const { POST } = await import('../app/api/auth/qr/route')
    expect((await POST(req('/api/auth/qr', 'POST', { u: 'minik.su', k: createQrCredentials().secret }))).status).toBe(401)
    expect((await POST(req('/api/auth/qr', 'POST', { u: 'minik.su', k: q.secret }))).status).toBe(200)
    expect((await me()).user).toMatchObject({ name: 'Su', username: 'minik.su' })
  })
})

describe('/api/me yazma uçları', () => {
  it('oturumsuz 401', async () => {
    h.jar.clear()
    const { POST } = await import('../app/api/me/xp/route')
    expect((await POST(req('/api/me/xp', 'POST', { items: [{ source: 'step', amount: XP.firstTry }] }))).status).toBe(401)
  })

  it('profil kaydı ve XP doğrulaması (oturumla)', async () => {
    h.jar.clear()
    const { POST: login } = await import('../app/api/auth/login/route')
    await login(req('/api/auth/login', 'POST', { login: 'can.5b', password: 'okul-parolasi-2' }))
    const { PUT } = await import('../app/api/me/profile/route')
    const profile = { who: 'kendim', age: 10, interests: ['robotik'], level: 'orta', goalMin: 20, time: 'sabah', course: 'mikro-kart', createdAt: 9 }
    expect((await PUT(req('/api/me/profile', 'PUT', { profile }))).status).toBe(200)
    expect((await PUT(req('/api/me/profile', 'PUT', { profile: { ...profile, goalMin: -1 } }))).status).toBe(400)
    expect((await me()).profile).toEqual(profile)

    const { POST: xp } = await import('../app/api/me/xp/route')
    expect((await xp(req('/api/me/xp', 'POST', { items: [{ source: 'step', amount: 9999 }] }))).status).toBe(400)
    const ok = await xp(req('/api/me/xp', 'POST', { items: [{ source: 'step', amount: XP.retry }] }))
    expect(ok.status).toBe(200)
    expect(await ok.json()).toEqual({ result: { stored: 1, dropped: 0 } })
    const [u] = await db.select().from(users).where(eq(users.username, 'can.5b'))
    expect((await db.select().from(xpEvents).where(eq(xpEvents.userId, u.id))).map((r) => r.amount)).toEqual([XP.retry])

    const { POST: game } = await import('../app/api/me/game/route')
    const g = await game(req('/api/me/game', 'POST', { game: { days: { '2026-10-01': { xp: 99999, correct: 2, lessons: 0 } }, frozen: [], charges: 0, lessonXp: [] } }))
    expect((await g.json()).game.xp).toBe(2000)
  })

  it('olay günlüğü oturum varsa user_id yazar', async () => {
    const [u] = await db.select().from(users).where(eq(users.username, 'can.5b'))
    const { POST } = await import('../app/api/events/route')
    const dev = 'dddddddddddddddddddddddddddddddd'
    expect((await POST(req('/api/events', 'POST', { deviceId: dev, events: [{ t: Date.now(), type: 'run' }] }))).status).toBe(200)
    h.jar.clear()
    expect((await POST(req('/api/events', 'POST', { deviceId: dev, events: [{ t: Date.now() + 1, type: 'run' }] }))).status).toBe(200)
    const rows = await db.select().from(events).where(eq(events.deviceId, dev))
    expect(rows.map((r) => r.userId)).toEqual([u.id, null])
  })
})
