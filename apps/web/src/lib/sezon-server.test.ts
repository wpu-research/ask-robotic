import { beforeAll, describe, expect, it } from 'vitest'
import { classMembers, classes, eq, organizationMembers, organizations, skillRuns, users, type Db } from '@ask/db'
import { createTestDb } from './test-db'
import { submitSkillRun } from './beceri-server'
import {
  aggregateSchools, aggregateTeams, readSeasonTeams, registerTeam, seasonBests, seasonLeague, teacherSeasonView, validateTeamName, withdrawTeam,
  type MemberBest, type TeamInput,
} from './sezon-server'
import { SEASONS } from './mikro/sezon'
import { onStart, project } from './mikro/program'

let db: Db
const season = SEASONS[0]
const NOW = new Date('2026-10-01T12:00:00Z')
/** Lig sorgu anı (sabit: test tarihten bağımsız). */
const LATER = new Date('2026-10-20T12:00:00Z')
const user = async (name: string) => (await db.insert(users).values({ name, email: `${crypto.randomUUID()}@t.co` }).returning())[0]
const school = async (name: string, settings: Record<string, unknown> = {}) =>
  (await db.insert(organizations).values({ name, slug: `o-${crypto.randomUUID()}`, settings }).returning())[0]
const klass = async (orgId: string, name: string, archived = false) =>
  (await db.insert(classes).values({ organizationId: orgId, name, joinCode: crypto.randomUUID().slice(0, 8), archived }).returning())[0]
const staff = async (orgId: string, role: 'owner' | 'admin' | 'teacher' | 'student' | 'parent' = 'teacher') => {
  const u = await user(`Öğretmen ${role}`)
  await db.insert(organizationMembers).values({ organizationId: orgId, userId: u.id, role })
  return u
}
const students = async (classId: string, ...names: string[]) => {
  const out = []
  for (const n of names) {
    const u = await user(n)
    await db.insert(classMembers).values({ classId, userId: u.id })
    out.push(u)
  }
  return out
}
const run = (userId: string, score: number, at = NOW) =>
  db.insert(skillRuns).values({ userId, challengeId: season.field.id, score, finishMs: 30000, program: {}, createdAt: at })

beforeAll(async () => { db = await createTestDb() })

describe('takım adı ve kayıt okuma', () => {
  it('ad sadeleşir, sınırlar uygulanır', () => {
    expect(validateTeamName('  Robo   Kartallar ')).toBe('Robo Kartallar')
    expect(validateTeamName('<b>X</b>')).toBe('bX/b')
    expect(validateTeamName('a')).toBeNull()
    expect(validateTeamName('x'.repeat(41))).toBeNull()
    expect(validateTeamName(42)).toBeNull()
  })
  it('bozuk ayar girdileri atlanır', () => {
    expect(readSeasonTeams(null, season.id)).toEqual([])
    expect(readSeasonTeams({ seasonTeams: { [season.id]: [{ classId: 'c', team: 't', by: 'u', at: 'a' }, { nope: 1 }, null] } }, season.id)).toHaveLength(1)
  })
})

describe('lig toplama (saf)', () => {
  const t = (classId: string, orgId: string, memberIds: string[], at = '2026-09-10'): TeamInput =>
    ({ classId, team: `T-${classId}`, orgId, school: `Okul ${orgId}`, className: classId, memberIds, registeredAt: at })
  const best = (pairs: Record<string, number>) => new Map<string, MemberBest>(Object.entries(pairs).map(([userId, score]) => [userId, { userId, score, finishMs: null }]))

  it('takım puanı en iyi üç öğrencinin toplamı; puansız üye sayılmaz', () => {
    const rows = aggregateTeams([t('a', 'o1', ['a1', 'a2', 'a3', 'a4', 'a5']), t('b', 'o2', ['b1', 'b2'])], best({ a1: 50, a2: 100, a3: 10, a4: 70, b1: 140, b2: 90 }), 3)
    expect(rows.map((r) => [r.classId, r.score, r.counted, r.participants, r.members, r.rank])).toEqual([
      ['b', 230, [140, 90], 2, 2, 1],
      ['a', 220, [100, 70, 50], 4, 5, 2],
    ])
  })

  it('eşitlikte en iyi tek puan, sonra erken kayıt; tam eşitlik aynı sıra', () => {
    const rows = aggregateTeams([
      t('x', 'o1', ['x1', 'x2'], '2026-09-20'), t('y', 'o2', ['y1', 'y2'], '2026-09-10'), t('z', 'o3', ['z1'], '2026-09-01'), t('w', 'o4', [], '2026-09-01'),
    ], best({ x1: 60, x2: 40, y1: 60, y2: 40, z1: 100 }), 3)
    // z: 100 (tek 100) > y = x: 100 (en iyi 60); y ile x tam eşit → aynı sıra
    expect(rows.map((r) => [r.classId, r.rank])).toEqual([['z', 1], ['y', 2], ['x', 2], ['w', 4]])
    expect(aggregateTeams([t('a', 'o', ['p'])], new Map(), 3)[0]).toMatchObject({ score: 0, participants: 0, rank: 1 })
  })

  it('okul puanı en iyi takımın puanı; takım sayısı öne geçirmez', () => {
    const teams = aggregateTeams([t('a', 'o1', ['a1']), t('b', 'o1', ['b1']), t('c', 'o2', ['c1'])], best({ a1: 50, b1: 80, c1: 90 }), 3)
    expect(aggregateSchools(teams).map((s) => [s.orgId, s.score, s.teams, s.bestTeam, s.rank])).toEqual([['o2', 90, 1, 'T-c', 1], ['o1', 80, 2, 'T-b', 2]])
  })
})

describe('takım kaydı yetkileri', () => {
  it('öğretmen/yönetici/sahip kaydedebilir; öğrenci, veli, başka okul ve girişsiz kullanıcı kaydedemez', async () => {
    const org = await school('Yetki Okulu')
    const other = await school('Başka Okul')
    const cls = await klass(org.id, '6-A')
    for (const role of ['teacher', 'admin', 'owner'] as const) {
      const u = await staff(org.id, role)
      expect(await registerTeam(db, u.id, season.id, cls.id, `Takım ${role}`, NOW), role).toMatchObject({ ok: true })
    }
    for (const role of ['student', 'parent'] as const) {
      const u = await staff(org.id, role)
      expect(await registerTeam(db, u.id, season.id, cls.id, 'Olmaz', NOW), role).toMatchObject({ ok: false, status: 403 })
      expect(await withdrawTeam(db, u.id, season.id, cls.id), role).toMatchObject({ ok: false, status: 403 })
    }
    const outsider = await staff(other.id)
    expect(await registerTeam(db, outsider.id, season.id, cls.id, 'Sızma', NOW)).toMatchObject({ ok: false, status: 403 })
    expect(await registerTeam(db, null, season.id, cls.id, 'Anonim', NOW)).toMatchObject({ ok: false, status: 401 })
    // Aynı sınıf tek kayıt: son ad geçerli
    const [row] = await db.select().from(organizations).where(eq(organizations.id, org.id))
    expect(readSeasonTeams(row.settings, season.id).map((r) => r.team)).toEqual(['Takım owner'])
  })

  it('geçersiz sezon/sınıf/ad, arşiv sınıf, biten sezon ve okulda aynı takım adı reddedilir', async () => {
    const org = await school('Kural Okulu', { leagues: true, aiTutor: false })
    const t = await staff(org.id)
    const [a, b2, arch] = [await klass(org.id, '7-A'), await klass(org.id, '7-B'), await klass(org.id, 'Eski', true)]
    expect(await registerTeam(db, t.id, 'yok', a.id, 'X Takımı', NOW)).toMatchObject({ ok: false, status: 404 })
    expect(await registerTeam(db, t.id, season.id, 'bozuk-id', 'X Takımı', NOW)).toMatchObject({ ok: false, status: 404 })
    expect(await registerTeam(db, t.id, season.id, a.id, ' ', NOW)).toMatchObject({ ok: false, status: 400 })
    expect(await registerTeam(db, t.id, season.id, arch.id, 'Arşiv', NOW)).toMatchObject({ ok: false, status: 400 })
    expect(await registerTeam(db, t.id, season.id, a.id, 'Robotlar', new Date('2027-06-01T00:00:00Z'))).toMatchObject({ ok: false, status: 400 })
    expect(await registerTeam(db, t.id, season.id, a.id, 'Robotlar', NOW)).toMatchObject({ ok: true })
    expect(await registerTeam(db, t.id, season.id, b2.id, 'robotlar', NOW)).toMatchObject({ ok: false, status: 400 })
    expect(await registerTeam(db, t.id, season.id, a.id, 'Robotlar 2', NOW)).toMatchObject({ ok: true })
    // Diğer okul ayarları korunur
    const [row] = await db.select().from(organizations).where(eq(organizations.id, org.id))
    expect(row.settings).toMatchObject({ leagues: true, aiTutor: false })
    expect(await withdrawTeam(db, t.id, season.id, a.id)).toMatchObject({ ok: true })
    const [after] = await db.select().from(organizations).where(eq(organizations.id, org.id))
    expect(readSeasonTeams(after.settings, season.id)).toEqual([])
  })
})

describe('okullar arası lig (DB)', () => {
  it('gönderimler sunucuda puanlanır; lig sezon penceresini, ligleri kapalı okulları ve öğretmen kayıtlarını doğru işler', async () => {
    const o1 = await school('Atatürk Ortaokulu')
    const o2 = await school('Cumhuriyet Ortaokulu')
    const closed = await school('Kapalı Okul', { leagues: false })
    const [c1, c2, c3] = [await klass(o1.id, '7-A'), await klass(o2.id, '8-C'), await klass(closed.id, '5-A')]
    const [t1, t2, t3] = [await staff(o1.id), await staff(o2.id), await staff(closed.id)]
    const [a1, a2, a3, a4] = await students(c1.id, 'Ada Kaya', 'Bora Er', 'Cem Su', 'Deniz Ak')
    const [b1] = await students(c2.id, 'Ece Tan')
    const [k1] = await students(c3.id, 'Gizli Öğrenci')
    await registerTeam(db, t1.id, season.id, c1.id, 'Kartallar', NOW)
    await registerTeam(db, t2.id, season.id, c2.id, 'Şimşekler', NOW)
    await registerTeam(db, t3.id, season.id, c3.id, 'Görünmez', NOW)

    // Gerçek gönderim: puan sunucuda hesaplanır
    const sub = await submitSkillRun(db, b1.id, season.field.id, { ...season.field.sample(), score: 9999 })
    expect(sub).toMatchObject({ ok: true })
    const official = sub.ok ? sub.score : 0
    expect(official).toBeGreaterThan(100)
    expect(official).toBeLessThan(9999)
    await submitSkillRun(db, b1.id, season.field.id, project('boş', [onStart()]))
    // Gönderim anını sezon içine sabitle (test tarihten bağımsız kalsın)
    await db.update(skillRuns).set({ createdAt: NOW }).where(eq(skillRuns.userId, b1.id))

    await run(a1.id, 80); await run(a1.id, 95); await run(a2.id, 60); await run(a3.id, 40); await run(a4.id, 10)
    await run(a4.id, 500, new Date('2026-08-01T00:00:00Z')) // sezon öncesi: sayılmaz
    await run(k1.id, 999)

    const bests = await seasonBests(db, season, [a1.id, a4.id], LATER)
    expect(bests.get(a1.id)!.score).toBe(95)
    expect(bests.get(a4.id)!.score).toBe(10)

    const league = await seasonLeague(db, season, LATER)
    const mine = league.teams.filter((t) => [c1.id, c2.id, c3.id].includes(t.classId))
    expect(mine.map((t) => [t.team, t.score, t.participants])).toEqual(
      [['Kartallar', 195, 4], ['Şimşekler', official, 1]].sort((x, y) => (y[1] as number) - (x[1] as number)),
    )
    expect(league.teams.some((t) => t.classId === c3.id)).toBe(false)
    expect(JSON.stringify(league)).not.toContain('Ada')
    expect(league.schools.find((s) => s.orgId === o1.id)).toMatchObject({ score: 195, teams: 1 })

    const view = await teacherSeasonView(db, t1.id, season, LATER)
    expect(view.classes.map((c) => [c.className, c.team?.team])).toEqual([['7-A', 'Kartallar']])
    expect(view.teams).toHaveLength(1)
    expect(view.teams[0].roster.map((r) => [r.name, r.score])).toEqual([['Ada K.', 95], ['Bora E.', 60], ['Cem S.', 40], ['Deniz A.', 10]])
    expect(view.teams[0].leagueRank).toBe(league.teams.find((t) => t.classId === c1.id)!.rank)
    // Ligleri kapalı okulun öğretmeni kendi takımını görür, ama herkese açık sırası yoktur
    const hidden = await teacherSeasonView(db, t3.id, season, LATER)
    expect(hidden.teams[0]).toMatchObject({ team: 'Görünmez', score: 999, leagueRank: null })
    // Öğretmeni olmayan kullanıcı boş görünüm alır
    const nobody = await user('Kimse')
    expect((await teacherSeasonView(db, nobody.id, season)).classes).toEqual([])
  })

  it('arşivlenen sınıf ligden düşer', async () => {
    const o = await school('Arşiv Okulu')
    const c = await klass(o.id, '9-A')
    const t = await staff(o.id)
    const [s] = await students(c.id, 'Arşiv Öğrenci')
    await registerTeam(db, t.id, season.id, c.id, 'Geçmiş', NOW)
    await run(s.id, 70)
    expect((await seasonLeague(db, season, LATER)).teams.some((x) => x.classId === c.id)).toBe(true)
    await db.update(classes).set({ archived: true }).where(eq(classes.id, c.id))
    expect((await seasonLeague(db, season, LATER)).teams.some((x) => x.classId === c.id)).toBe(false)
  })
})
