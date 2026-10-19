// Yarışma sezonları: takım kaydı ve okullar arası lig (DB). Yeni tablo yok:
// - Gönderimler Sanal Beceri ile aynı skill_runs tablosunda (challenge_id = sezon alanı kimliği); puan sunucuda yeniden hesaplanır.
// - Takım kaydı okulun ayarlarında: organizations.settings.seasonTeams[sezonId] = [{ classId, team, by, at }].
// Takım = bir sınıf; üyeleri sınıfın öğrencileridir. Takım puanı = sezon penceresindeki en iyi `teamTop` öğrenci puanının toplamı.
import { and, classes, classMembers, eq, inArray, organizations, skillRuns, sql, users, type Db } from '@ask/db'
import { requireClassStaff, staffOrgs } from './class-access'
import { parseOrgSettings } from './org-settings'
import { shortName } from './roster'
import { tsz } from './sql-time'
import { SEASON_BY_ID, seasonPhase, type Season } from './mikro/sezon'

export interface TeamReg { classId: string; team: string; by: string; at: string }

export const TEAM_NAME_MIN = 2
export const TEAM_NAME_MAX = 40

/** Takım adı: boşluklar sadeleşir, denetim karakterleri atılır; 2-40 karakter. */
export function validateTeamName(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  // eslint-disable-next-line no-control-regex
  const s = raw.replace(/[\u0000-\u001f\u007f<>]/g, '').replace(/\s+/g, ' ').trim()
  return s.length >= TEAM_NAME_MIN && s.length <= TEAM_NAME_MAX ? s : null
}

/** settings.seasonTeams içinden bir sezonun geçerli kayıtları (bozuk girdiler atlanır). */
export function readSeasonTeams(settings: unknown, seasonId: string): TeamReg[] {
  const all = settings && typeof settings === 'object' ? (settings as Record<string, unknown>).seasonTeams : null
  const list = all && typeof all === 'object' ? (all as Record<string, unknown>)[seasonId] : null
  if (!Array.isArray(list)) return []
  return list.filter((x): x is TeamReg => !!x && typeof x === 'object'
    && typeof (x as TeamReg).classId === 'string' && typeof (x as TeamReg).team === 'string')
}

async function writeSeasonTeams(db: Db, orgId: string, seasonId: string, edit: (list: TeamReg[]) => TeamReg[]) {
  const [row] = await db.select({ settings: organizations.settings }).from(organizations).where(eq(organizations.id, orgId)).limit(1)
  const settings: Record<string, unknown> = { ...(row?.settings ?? {}) }
  const all = { ...((settings.seasonTeams as Record<string, unknown> | undefined) ?? {}) }
  all[seasonId] = edit(readSeasonTeams(settings, seasonId))
  settings.seasonTeams = all
  await db.update(organizations).set({ settings }).where(eq(organizations.id, orgId))
}

export type TeamActionResult = { ok: true; team: TeamReg | null } | { ok: false; status: 400 | 401 | 403 | 404; error: string }

/** Öğretmen sınıfını sezona takım olarak kaydeder (zaten kayıtlıysa adı günceller). Yetki: sınıfın kurumunda öğretmen/yönetici. */
export async function registerTeam(db: Db, userId: string | null, seasonId: string, classId: string, rawName: unknown, now = new Date()): Promise<TeamActionResult> {
  const season = SEASON_BY_ID[seasonId]
  if (!season) return { ok: false, status: 404, error: 'Böyle bir sezon yok' }
  const g = await requireClassStaff(db, userId, classId)
  if (!g.ok) return g
  if (g.cls.archived) return { ok: false, status: 400, error: 'Arşivlenmiş sınıf takım olamaz' }
  if (seasonPhase(season, now) === 'bitti') return { ok: false, status: 400, error: 'Bu sezon bitti' }
  const team = validateTeamName(rawName)
  if (!team) return { ok: false, status: 400, error: `Takım adı ${TEAM_NAME_MIN}-${TEAM_NAME_MAX} karakter olmalı` }
  const [org] = await db.select({ settings: organizations.settings }).from(organizations).where(eq(organizations.id, g.cls.organizationId)).limit(1)
  const existing = readSeasonTeams(org?.settings, seasonId)
  if (existing.some((t) => t.classId !== classId && t.team.toLocaleLowerCase('tr') === team.toLocaleLowerCase('tr'))) {
    return { ok: false, status: 400, error: 'Okulunda bu adla bir takım zaten var' }
  }
  const reg: TeamReg = { classId, team, by: userId!, at: now.toISOString() }
  await writeSeasonTeams(db, g.cls.organizationId, seasonId, (list) => [...list.filter((t) => t.classId !== classId), reg])
  return { ok: true, team: reg }
}

/** Takım kaydını siler (gönderimler silinmez; yalnız lige katılım biter). */
export async function withdrawTeam(db: Db, userId: string | null, seasonId: string, classId: string): Promise<TeamActionResult> {
  if (!SEASON_BY_ID[seasonId]) return { ok: false, status: 404, error: 'Böyle bir sezon yok' }
  const g = await requireClassStaff(db, userId, classId)
  if (!g.ok) return g
  await writeSeasonTeams(db, g.cls.organizationId, seasonId, (list) => list.filter((t) => t.classId !== classId))
  return { ok: true, team: null }
}

// ---------------- puanlama (saf işlevler; testte DB'siz) ----------------

export interface TeamInput { classId: string; team: string; orgId: string; school: string; className: string; memberIds: string[]; registeredAt: string }
export interface MemberBest { userId: string; score: number; finishMs: number | null }
export interface TeamStanding {
  classId: string; team: string; orgId: string; school: string; className: string
  score: number
  /** Takım puanına katkı veren öğrenci puanları (büyükten küçüğe). */
  counted: number[]
  members: number
  participants: number
  rank: number
}
export interface SchoolStanding { orgId: string; school: string; score: number; teams: number; bestTeam: string; rank: number }

/**
 * Takım puanları: her takım için üyelerin en iyi puanlarından en büyük `top` tanesinin toplamı.
 * Sıralama: puan ↓, en iyi tek puan ↓, katılımcı sayısı ↓, erken kayıt, takım adı. Eşit puan ve eşit en iyi puan aynı sırayı alır.
 */
export function aggregateTeams(teams: readonly TeamInput[], best: ReadonlyMap<string, MemberBest>, top: number): TeamStanding[] {
  const rows = teams.map((t) => {
    const scores = t.memberIds.map((id) => best.get(id)?.score).filter((s): s is number => s != null).sort((a, b) => b - a)
    const counted = scores.slice(0, top)
    return {
      classId: t.classId, team: t.team, orgId: t.orgId, school: t.school, className: t.className,
      score: counted.reduce((s, x) => s + x, 0), counted, members: t.memberIds.length, participants: scores.length, rank: 0, at: t.registeredAt,
    }
  })
  rows.sort((a, b) => b.score - a.score || (b.counted[0] ?? 0) - (a.counted[0] ?? 0) || b.participants - a.participants
    || a.at.localeCompare(b.at) || a.team.localeCompare(b.team, 'tr'))
  let rank = 0
  return rows.map(({ at: _at, ...r }, i) => {
    const prev = rows[i - 1]
    if (i === 0 || r.score !== prev.score || (r.counted[0] ?? 0) !== (prev.counted[0] ?? 0)) rank = i + 1
    return { ...r, rank }
  })
}

/** Okul tablosu: okulun en iyi takımının puanı (bir okul çok takım kaydederek öne geçemez). */
export function aggregateSchools(teams: readonly TeamStanding[]): SchoolStanding[] {
  const by = new Map<string, SchoolStanding>()
  for (const t of teams) {
    const s = by.get(t.orgId)
    if (!s) by.set(t.orgId, { orgId: t.orgId, school: t.school, score: t.score, teams: 1, bestTeam: t.team, rank: 0 })
    else { s.teams++; if (t.score > s.score) { s.score = t.score; s.bestTeam = t.team } }
  }
  const rows = [...by.values()].sort((a, b) => b.score - a.score || a.school.localeCompare(b.school, 'tr'))
  let rank = 0
  return rows.map((r, i) => {
    if (i === 0 || r.score !== rows[i - 1].score) rank = i + 1
    return { ...r, rank }
  })
}

// ---------------- DB okuma ----------------

/** Sezona kayıtlı tüm takımlar (arşivlenmiş sınıflar atlanır). `publicOnly`: ligleri kapalı okulları gizler. */
export async function loadTeams(db: Db, season: Season, opts: { publicOnly?: boolean; orgIds?: string[] } = {}): Promise<TeamInput[]> {
  const orgs = await db.select({ id: organizations.id, name: organizations.name, settings: organizations.settings }).from(organizations)
    .where(and(
      sql`${organizations.settings} -> 'seasonTeams' -> ${season.id} is not null`,
      opts.orgIds ? (opts.orgIds.length ? inArray(organizations.id, opts.orgIds) : sql`false`) : undefined,
    ))
  const regs = orgs.flatMap((o) => (opts.publicOnly && !parseOrgSettings(o.settings).leagues ? [] : readSeasonTeams(o.settings, season.id).map((r) => ({ ...r, org: o }))))
  if (!regs.length) return []
  const classIds = regs.map((r) => r.classId)
  const [cls, members] = await Promise.all([
    db.select({ id: classes.id, name: classes.name, orgId: classes.organizationId, archived: classes.archived }).from(classes).where(inArray(classes.id, classIds)),
    db.select({ classId: classMembers.classId, userId: classMembers.userId }).from(classMembers)
      .where(and(inArray(classMembers.classId, classIds), eq(classMembers.role, 'student'))),
  ])
  const clsById = new Map(cls.map((c) => [c.id, c]))
  return regs.flatMap((r) => {
    const c = clsById.get(r.classId)
    // Kayıt başka okulun sınıfını gösteremez; arşivlenmiş sınıf ligden düşer.
    if (!c || c.archived || c.orgId !== r.org.id) return []
    return [{
      classId: r.classId, team: r.team, orgId: r.org.id, school: r.org.name, className: c.name, registeredAt: r.at,
      memberIds: members.filter((m) => m.classId === r.classId).map((m) => m.userId),
    }]
  })
}

/** Kullanıcıların sezon penceresindeki en iyi kaydı. */
export async function seasonBests(db: Db, season: Season, userIds: string[], now = new Date()): Promise<Map<string, MemberBest>> {
  if (!userIds.length) return new Map()
  const end = new Date(Math.min(now.getTime(), new Date(season.endsAt).getTime()))
  const rows = await db.select({
    userId: skillRuns.userId,
    score: sql<number>`max(${skillRuns.score})::int`,
    finishMs: sql<number | null>`min(${skillRuns.finishMs})`,
  }).from(skillRuns)
    .where(and(eq(skillRuns.challengeId, season.field.id), inArray(skillRuns.userId, [...new Set(userIds)]),
      sql`${skillRuns.createdAt} >= ${tsz(new Date(season.startsAt))}`, sql`${skillRuns.createdAt} <= ${tsz(end)}`))
    .groupBy(skillRuns.userId)
  return new Map(rows.map((r) => [r.userId, { userId: r.userId, score: Number(r.score), finishMs: r.finishMs == null ? null : Number(r.finishMs) }]))
}

export interface SeasonLeague { teams: TeamStanding[]; schools: SchoolStanding[] }

/** Okullar arası lig (herkese açık görünüm: öğrenci adı yok, ligleri kapalı okullar yok). */
export async function seasonLeague(db: Db, season: Season, now = new Date()): Promise<SeasonLeague> {
  const teams = await loadTeams(db, season, { publicOnly: true })
  const best = await seasonBests(db, season, teams.flatMap((t) => t.memberIds), now)
  const standings = aggregateTeams(teams, best, season.teamTop)
  return { teams: standings, schools: aggregateSchools(standings) }
}

export interface TeacherClassOption { classId: string; className: string; orgId: string; school: string; team: TeamReg | null }
export interface TeacherTeamView extends TeamStanding {
  /** Öğrenci katkıları (kısa ad; yalnız öğretmen görür). */
  roster: { name: string; score: number | null }[]
  /** Herkese açık ligdeki sırası (okulun ligleri kapalıysa null). */
  leagueRank: number | null
}

/** Öğretmen görünümü: yönettiği okulların sınıfları, kayıt durumu ve kendi takımlarının ayrıntılı puanı. */
export async function teacherSeasonView(db: Db, userId: string, season: Season, now = new Date()) {
  const orgs = await staffOrgs(db, userId)
  const orgIds = orgs.map((o) => o.org.id)
  if (!orgIds.length) return { classes: [] as TeacherClassOption[], teams: [] as TeacherTeamView[], league: { teams: [], schools: [] } as SeasonLeague }
  const cls = await db.select({ id: classes.id, name: classes.name, orgId: classes.organizationId }).from(classes)
    .where(and(inArray(classes.organizationId, orgIds), eq(classes.archived, false)))
  const orgById = new Map(orgs.map((o) => [o.org.id, o.org]))
  const options: TeacherClassOption[] = cls.map((c) => ({
    classId: c.id, className: c.name, orgId: c.orgId, school: orgById.get(c.orgId)!.name,
    team: readSeasonTeams(orgById.get(c.orgId)!.settings, season.id).find((t) => t.classId === c.id) ?? null,
  })).sort((a, b) => a.school.localeCompare(b.school, 'tr') || a.className.localeCompare(b.className, 'tr'))

  const mine = await loadTeams(db, season, { orgIds })
  const allIds = mine.flatMap((t) => t.memberIds)
  const [best, names, league] = await Promise.all([
    seasonBests(db, season, allIds, now),
    allIds.length ? db.select({ id: users.id, name: users.name }).from(users).where(inArray(users.id, allIds)) : Promise.resolve([]),
    seasonLeague(db, season, now),
  ])
  const nameById = new Map(names.map((n) => [n.id, n.name]))
  const teams: TeacherTeamView[] = aggregateTeams(mine, best, season.teamTop).map((t) => ({
    ...t,
    roster: mine.find((m) => m.classId === t.classId)!.memberIds
      .map((id) => ({ name: shortName(nameById.get(id) ?? ''), score: best.get(id)?.score ?? null }))
      .sort((a, b) => (b.score ?? -1) - (a.score ?? -1) || a.name.localeCompare(b.name, 'tr')),
    leagueRank: league.teams.find((x) => x.classId === t.classId)?.rank ?? null,
  }))
  return { classes: options, teams, league }
}
