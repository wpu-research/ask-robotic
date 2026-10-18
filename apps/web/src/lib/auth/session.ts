import { createHash, randomBytes } from 'node:crypto'
import { and, eq, gt, sessions, sql, users, type Db } from '@ask/db'

export const SESSION_COOKIE = 'ask_session'
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex')

export async function createSession(db: Db, userId: string, now = new Date()) {
  const token = randomBytes(32).toString('base64url')
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS)
  await db.insert(sessions).values({ userId, tokenHash: hashToken(token), expiresAt })
  return { token, expiresAt }
}

export async function getSessionUser(db: Db, token: string | undefined, now = new Date()) {
  if (!token) return null
  const rows = await db
    .select({ id: users.id, email: users.email, username: users.username, name: users.name, role: users.role, locale: users.locale })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.tokenHash, hashToken(token)), gt(sessions.expiresAt, now)))
    .limit(1)
  return rows[0] ?? null
}

export async function deleteSession(db: Db, token: string | undefined) {
  if (!token) return
  await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)))
}

/** Kullanıcının bu jeton dışındaki tüm oturumlarını siler (parola değişince diğer cihazlardan çıkış). */
export async function deleteOtherSessions(db: Db, userId: string, keepToken: string | undefined) {
  const where = keepToken
    ? and(eq(sessions.userId, userId), sql`${sessions.tokenHash} <> ${hashToken(keepToken)}`)
    : eq(sessions.userId, userId)
  const r = await db.delete(sessions).where(where).returning({ id: sessions.id })
  return r.length
}
