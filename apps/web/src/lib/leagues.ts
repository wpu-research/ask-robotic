// Sınıf ligleri: haftalık XP (xp_events), yalnız sınıf arkadaşları arasında, okul ayarı `leagues` açıksa.
// Hafta Pazartesi 00:00 Türkiye saatinde başlar (UTC+3, yaz saati yok). Öğrenciler birbirini yalnız "Ada K." biçiminde görür.
import { and, asc, classes, classMembers, eq, organizations, sql, users, xpEvents, type Db } from '@ask/db'
import { parseOrgSettings } from './org-settings'
import { tsz } from './sql-time'
import { shortName } from './roster'

/** İleride sınıflar arası ligler için 10 kademe (düşükten yükseğe). */
export const LEAGUE_TIERS = [
  'Direnç', 'Kondansatör', 'Transistör', 'Mikrodenetleyici', 'Servo', 'Sensör', 'Lidar', 'Robot Kol', 'Otonom', 'Android',
] as const
export type LeagueTier = (typeof LEAGUE_TIERS)[number]

const OFFSET = 3 * 60 * 60 * 1000

/** Haftanın başı: Pazartesi 00:00 Europe/Istanbul. */
export function istanbulWeekStart(now: Date): Date {
  const local = new Date(now.getTime() + OFFSET)
  const daysSinceMonday = (local.getUTCDay() + 6) % 7
  return new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() - daysSinceMonday) - OFFSET)
}

export interface LeagueRow { userId: string; name: string; xp: number }
export interface LeagueEntry { userId: string; name: string; xp: number; rank: number }

/** XP'ye göre sıralar; eşit XP aynı sırayı alır (1, 1, 3). Eşitlikte ada göre. */
export function rankLeague(rows: readonly LeagueRow[]): LeagueEntry[] {
  const sorted = [...rows].sort((a, b) => b.xp - a.xp || a.name.localeCompare(b.name, 'tr'))
  let rank = 0
  return sorted.map((r, i) => {
    if (i === 0 || r.xp !== sorted[i - 1].xp) rank = i + 1
    return { ...r, rank }
  })
}

/** Sınıfın öğrencileri ve bu haftaki XP'leri (XP'si olmayan 0). Ad tam haliyle döner; öğrenciye gösterilmeden önce kısaltılmalı. */
export async function loadClassLeague(db: Db, classId: string, now = new Date()): Promise<LeagueEntry[]> {
  const since = istanbulWeekStart(now)
  const rows = await db
    .select({
      userId: users.id, name: users.name,
      xp: sql<number>`coalesce(sum(${xpEvents.amount}) filter (where ${xpEvents.at} >= ${tsz(since)} and ${xpEvents.at} <= ${tsz(now)}), 0)::int`,
    })
    .from(classMembers)
    .innerJoin(users, eq(users.id, classMembers.userId))
    .leftJoin(xpEvents, eq(xpEvents.userId, users.id))
    .where(and(eq(classMembers.classId, classId), eq(classMembers.role, 'student')))
    .groupBy(users.id, users.name)
  return rankLeague(rows.map((r) => ({ ...r, xp: Number(r.xp) })))
}

export interface MyLeague {
  classId: string
  className: string
  weekStart: Date
  /** Öğrenciye gösterilecek liste: yalnız kısa ad ve XP (diğer öğrencilerin kimliği yok). */
  entries: { name: string; xp: number; rank: number; me: boolean }[]
  myRank: number
  myXp: number
}

/** Kullanıcının öğrenci olduğu, arşivlenmemiş ve okulu ligleri açık sınıfların ligleri. */
export async function myLeagues(db: Db, userId: string, now = new Date()): Promise<MyLeague[]> {
  const cls = await db
    .select({ id: classes.id, name: classes.name, settings: organizations.settings })
    .from(classMembers)
    .innerJoin(classes, eq(classes.id, classMembers.classId))
    .innerJoin(organizations, eq(organizations.id, classes.organizationId))
    .where(and(eq(classMembers.userId, userId), eq(classMembers.role, 'student'), eq(classes.archived, false)))
    .orderBy(asc(classes.name))
  const out: MyLeague[] = []
  for (const c of cls) {
    if (!parseOrgSettings(c.settings).leagues) continue
    const league = await loadClassLeague(db, c.id, now)
    const me = league.find((e) => e.userId === userId)
    out.push({
      classId: c.id, className: c.name, weekStart: istanbulWeekStart(now),
      entries: league.map((e) => ({ name: shortName(e.name), xp: e.xp, rank: e.rank, me: e.userId === userId })),
      myRank: me?.rank ?? league.length, myXp: me?.xp ?? 0,
    })
  }
  return out
}

/** Kullanıcı herhangi bir sınıfta öğrenci mi (lig kartında "bir sınıfa katıl" ile ayrım için). */
export async function inAnyClass(db: Db, userId: string): Promise<boolean> {
  const [r] = await db.select({ id: classMembers.classId }).from(classMembers)
    .innerJoin(classes, eq(classes.id, classMembers.classId))
    .where(and(eq(classMembers.userId, userId), eq(classMembers.role, 'student'), eq(classes.archived, false))).limit(1)
  return !!r
}

