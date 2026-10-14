// Oturumlu kullanıcının öğrenme durumu (sunucu): /api/me ve alt yolları. Tarayıcı tarafı: components/auth/session-sync.tsx.
import { and, eq, inArray, sql, enrollments, lessons, progress, users, weeks, xpEvents, type Db } from '@ask/db'
import { z } from 'zod'
import { istanbulDayStart } from './entitlements-db'
import { addDays, clampGame, dayKey, emptyGame, MAX_DAY_XP, mergeGame, XP, type GameState } from './gamification-core'
import { profileSchema, type ProfileInput } from './profile-schema'

export interface MeUser { id: string; name: string; role: string; locale: string; username?: string }
export interface MeResponse { user: MeUser | null; profile: ProfileInput | null; game: GameState | null; doneLessonIds: number[] }

type SessionUser = { id: string; name: string; role: string; locale?: string | null; username?: string | null }

export async function loadMe(db: Db, u: SessionUser | null): Promise<MeResponse> {
  if (!u) return { user: null, profile: null, game: null, doneLessonIds: [] }
  const [row] = await db.select({ profile: users.profile, game: users.game, locale: users.locale, username: users.username }).from(users).where(eq(users.id, u.id)).limit(1)
  const done = await db.select({ id: progress.lessonId }).from(progress)
    .where(and(eq(progress.userId, u.id), eq(progress.status, 'completed'))).orderBy(progress.lessonId)
  const p = profileSchema.safeParse(row?.profile)
  const user: MeUser = { id: u.id, name: u.name, role: u.role, locale: row?.locale ?? u.locale ?? 'tr' }
  const username = row?.username ?? u.username
  if (username) user.username = username
  return {
    user,
    profile: p.success ? p.data : null,
    game: row?.game ? clampGame(row.game, '9999-12-31') : null,
    doneLessonIds: done.map((d) => d.id),
  }
}

export type Result<T> = { ok: true; data: T } | { ok: false; status: number; error: string }

export async function saveUserProfile(db: Db, userId: string, input: unknown): Promise<Result<ProfileInput>> {
  const p = profileSchema.safeParse((input as { profile?: unknown } | null)?.profile ?? input)
  if (!p.success) return { ok: false, status: 400, error: 'Geçersiz profil' }
  await db.update(users).set({ profile: p.data }).where(eq(users.id, userId))
  return { ok: true, data: p.data }
}

/** Arayüz dili tercihi (PUT /api/me/locale): yalnız 'tr' | 'en'. */
export async function saveUserLocale(db: Db, userId: string, input: unknown): Promise<Result<'tr' | 'en'>> {
  const l = (input as { locale?: unknown } | null)?.locale
  if (l !== 'tr' && l !== 'en') return { ok: false, status: 400, error: 'Geçersiz dil' }
  await db.update(users).set({ locale: l }).where(eq(users.id, userId))
  return { ok: true, data: l }
}

/** İstemci durumunu sunucudakiyle birleştirir (mergeGame), yazar ve birleşik durumu döndürür. Satır kilidiyle yarış yok. */
export async function syncGame(db: Db, userId: string, input: unknown, now = new Date()): Promise<Result<GameState>> {
  const raw = (input as { game?: unknown } | null)?.game
  if (!raw || typeof raw !== 'object') return { ok: false, status: 400, error: 'Geçersiz oyun durumu' }
  // İstemcinin yerel günü sunucudan ileride olabilir (saat dilimi): yarına kadar kabul
  const client = clampGame(raw, addDays(dayKey(now), 1))
  const merged = await db.transaction(async (tx) => {
    const [row] = await tx.select({ game: users.game }).from(users).where(eq(users.id, userId)).for('update')
    const server = row?.game ? clampGame(row.game, '9999-12-31') : emptyGame()
    const m = mergeGame(server, client)
    await tx.update(users).set({ game: m as unknown as Record<string, unknown> }).where(eq(users.id, userId))
    return m
  })
  return { ok: true, data: merged }
}

const progressInput = z.object({ lessonIds: z.array(z.number().int().positive()).max(2000) })

/**
 * Tarayıcıdaki tamamlanan dersleri sunucuya aktarır (girişten önce yapılanlar dahil). Yalnız var olan dersler.
 * Aktarılan satırların started_at'i bugünden öncedir: ücretsiz plandaki günlük ders sayacına sayılmaz.
 */
export async function importProgress(db: Db, userId: string, input: unknown, now = new Date()): Promise<Result<number[]>> {
  const p = progressInput.safeParse(input)
  if (!p.success) return { ok: false, status: 400, error: 'Geçersiz ilerleme' }
  const ids = [...new Set(p.data.lessonIds)]
  if (ids.length) {
    const found = await db.select({ id: lessons.id, moduleId: weeks.moduleId }).from(lessons)
      .innerJoin(weeks, eq(weeks.id, lessons.weekId)).where(inArray(lessons.id, ids))
    if (found.length) {
      const before = new Date(istanbulDayStart(now).getTime() - 1000)
      await db.insert(progress)
        .values(found.map((l) => ({ userId, lessonId: l.id, status: 'completed' as const, startedAt: before, completedAt: now })))
        .onConflictDoUpdate({ target: [progress.userId, progress.lessonId], set: { status: 'completed', completedAt: sql`coalesce(${progress.completedAt}, excluded.completed_at)` } })
      await db.insert(enrollments).values([...new Set(found.map((l) => l.moduleId))].map((moduleId) => ({ userId, moduleId }))).onConflictDoNothing()
    }
  }
  const done = await db.select({ id: progress.lessonId }).from(progress)
    .where(and(eq(progress.userId, userId), eq(progress.status, 'completed'))).orderBy(progress.lessonId)
  return { ok: true, data: done.map((d) => d.id) }
}

// ---- XP defteri (xp_events): sınıf ligleri buradan haftalık toplam alır ----

const STEP_AMOUNTS: number[] = [XP.firstTry, XP.retry]
const xpItem = z.discriminatedUnion('source', [
  z.object({ source: z.literal('step'), amount: z.number().refine((n) => STEP_AMOUNTS.includes(n), 'Geçersiz XP'), lessonId: z.number().int().positive().optional() }),
  z.object({ source: z.literal('lesson'), amount: z.literal(XP.lesson), lessonId: z.number().int().positive() }),
])
export const xpInput = z.object({ items: z.array(xpItem).min(1).max(20) })
export const XP_RATE = { max: 30, windowMs: 60_000 }

/**
 * XP satırlarını ekler. Tutar gamification-core XP sabitlerine eşit olmalı; aynı ders aynı gün (İstanbul) bir kez;
 * günlük toplam MAX_DAY_XP'yi aşan satırlar atılır. Bilinmeyen ders: 'lesson' atılır, 'step' derssiz yazılır.
 */
export async function recordXp(db: Db, userId: string, input: unknown, now = new Date()): Promise<Result<{ stored: number; dropped: number }>> {
  const p = xpInput.safeParse(input)
  if (!p.success) return { ok: false, status: 400, error: p.error.issues[0]?.message ?? 'Geçersiz XP' }
  const items = p.data.items
  // postgres-js ham sql içinde Date kabul etmez: ISO metin
  const since = istanbulDayStart(now)
  const lessonIds = [...new Set(items.map((i) => i.lessonId).filter((x): x is number => !!x))]
  const known = new Set(lessonIds.length ? (await db.select({ id: lessons.id }).from(lessons).where(inArray(lessons.id, lessonIds))).map((r) => r.id) : [])
  const today = await db.select({ amount: xpEvents.amount, source: xpEvents.source, lessonId: xpEvents.lessonId }).from(xpEvents)
    .where(and(eq(xpEvents.userId, userId), sql`${xpEvents.at} >= ${since.toISOString()}`))
  let total = today.reduce((n, r) => n + r.amount, 0)
  const lessonDone = new Set(today.filter((r) => r.source === 'lesson').map((r) => r.lessonId))
  const rows: (typeof xpEvents.$inferInsert)[] = []
  for (const it of items) {
    const lessonId = it.lessonId && known.has(it.lessonId) ? it.lessonId : null
    if (it.source === 'lesson' && (!lessonId || lessonDone.has(lessonId))) continue
    if (total + it.amount > MAX_DAY_XP) continue
    total += it.amount
    if (it.source === 'lesson') lessonDone.add(lessonId)
    rows.push({ userId, amount: it.amount, source: it.source, lessonId, at: now })
  }
  if (rows.length) await db.insert(xpEvents).values(rows)
  return { ok: true, data: { stored: rows.length, dropped: items.length - rows.length } }
}
