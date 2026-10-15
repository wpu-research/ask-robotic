import { beforeAll, describe, expect, it } from 'vitest'
import { createHash } from 'node:crypto'
import {
  assignments, classMembers, eq, events, lessons, licenses, organizationMembers, organizations, progress, seedContent,
  tutorMessages, users, weeks, xpEvents, type Db, type ModuleContent,
} from '@ask/db'
import { createTestDb } from './test-db'
import { requireClassStaff, requireOrgStaff, ADMIN_ROLES } from './class-access'
import {
  addStudents, createAssignment, createClass, createSchool, createWeeklyPlan, joinClassByCode, listAssignments, listTeacherClasses,
  normalizeJoinCode, regenerateStudentCard, SeatLimitError,
} from './classroom'
import { weeklyPlan } from './assignments'
import { asciiSlug, makeUsername, parseRoster, shortName } from './roster'
import { istanbulWeekStart, LEAGUE_TIERS, loadClassLeague, myLeagues, rankLeague } from './leagues'
import { aiTutorAllowedForUser, getOrgSettings, updateOrgSettings } from './org-settings'
import { loadProgressMatrix, loadSkillHeatmap, loadStuck, loadTutorMessages, skillHeatmap, stuckStudents } from './class-insights'
import { createQrCredentials, qrLoginUrl } from './auth/qr'

let db: Db
const now = new Date('2026-10-14T10:00:00Z') // Çarşamba 13:00 İstanbul
const sha = (s: string) => createHash('sha256').update(s).digest('hex')

const ders = (title: string) => ({ title, durationMin: 20, problem: 'P', contentMd: 'C', question: 'Q' })
const icerik: ModuleContent[] = [{
  slug: 'ogr-modul', title: 'Öğretmen Test', track: 'maker', position: 98, minAge: 10,
  weeks: [{ title: 'H1', project: 'P', lessons: [ders('L1'), ders('L2')] }, { title: 'H2', project: 'P', lessons: [ders('L3')] }],
}]

const user = async (o: Partial<typeof users.$inferInsert> = {}) =>
  (await db.insert(users).values({ name: 'Öğretmen', email: `${crypto.randomUUID()}@t.co`, ...o }).returning())[0]

let lessonIds: number[] = []
let weekIds: number[] = []

beforeAll(async () => {
  db = await createTestDb()
  await seedContent(db, icerik)
  const ws = await db.select().from(weeks).orderBy(weeks.id)
  weekIds = ws.map((w) => w.id)
  lessonIds = (await db.select().from(lessons).orderBy(lessons.id)).map((l) => l.id)
})

describe('roster (saf)', () => {
  it('satır ve CSV ayrıştırır, başlığı atlar', () => {
    expect(parseRoster('ad,soyad\nAda,Kaya\n\nMehmet Ali Çelik\nZeynep\n  ;  \n')).toEqual([
      { first: 'Ada', last: 'Kaya' }, { first: 'Mehmet Ali', last: 'Çelik' }, { first: 'Zeynep', last: '' },
    ])
  })
  it('Türkçe harfleri sadeleştirir, kullanıcı adı benzersiz', () => {
    expect(asciiSlug('Işıl Göğüş')).toBe('isilgogus')
    const taken = new Set<string>()
    expect(makeUsername({ first: 'Ada', last: 'Kaya' }, '7b', taken)).toBe('ada.k-7b')
    expect(makeUsername({ first: 'Ada', last: 'Koç' }, '7b', taken)).toBe('ada.k2-7b')
    expect(makeUsername({ first: 'Şule', last: '' }, '7b', taken)).toBe('sule-7b')
  })
  it('kısa ad: ad + soyadın baş harfi', () => {
    expect(shortName('Ada Kaya')).toBe('Ada K.')
    expect(shortName('Mehmet Ali İnce')).toBe('Mehmet İ.')
    expect(shortName('Zeynep')).toBe('Zeynep')
  })
})

describe('qr kimlik', () => {
  it('URL-güvenli gizli kod, sha256 özeti', () => {
    const { secret, hash } = createQrCredentials()
    expect(secret).toMatch(/^[A-Za-z0-9_-]{10,}$/)
    expect(hash).toBe(sha(secret))
    expect(qrLoginUrl('https://x.co', 'ada.k-7b', secret)).toContain('u=ada.k-7b')
  })
})

describe('okul + yetki', () => {
  it('okul açan owner olur, sınıf kodu üretilir; yetki kontrolleri', async () => {
    const t = await user({ role: 'parent' })
    const { org, cls } = await createSchool(db, t.id, { schoolName: 'Deneme Koleji', name: '7-B', gradeLevel: 7 })
    expect(org.kind).toBe('school')
    expect(cls.joinCode).toMatch(/^[A-Z2-9]{6}$/)
    const [m] = await db.select().from(organizationMembers).where(eq(organizationMembers.userId, t.id))
    expect(m.role).toBe('owner')
    expect((await db.select().from(users).where(eq(users.id, t.id)))[0].role).toBe('teacher')

    expect((await requireClassStaff(db, t.id, cls.id)).ok).toBe(true)
    expect(await requireClassStaff(db, null, cls.id)).toMatchObject({ ok: false, status: 401 })
    expect(await requireClassStaff(db, t.id, crypto.randomUUID())).toMatchObject({ ok: false, status: 404 })
    expect(await requireClassStaff(db, t.id, 'bozuk')).toMatchObject({ ok: false, status: 404 })

    // Başka okulun öğretmeni erişemez
    const other = await user()
    await createSchool(db, other.id, { schoolName: 'Başka Okul', name: '5-A', gradeLevel: 5 })
    expect(await requireClassStaff(db, other.id, cls.id)).toMatchObject({ ok: false, status: 403 })
    // Aynı okulun öğrencisi erişemez
    const st = await user({ role: 'student' })
    await db.insert(organizationMembers).values({ organizationId: org.id, userId: st.id, role: 'student' })
    expect(await requireClassStaff(db, st.id, cls.id)).toMatchObject({ ok: false, status: 403 })
    // Öğretmen erişir ama yönetici işi yapamaz
    const t2 = await user({ role: 'teacher' })
    await db.insert(organizationMembers).values({ organizationId: org.id, userId: t2.id, role: 'teacher' })
    expect((await requireClassStaff(db, t2.id, cls.id)).ok).toBe(true)
    expect(await requireOrgStaff(db, t2.id, org.id, ADMIN_ROLES)).toMatchObject({ ok: false, status: 403 })
    expect((await requireOrgStaff(db, t.id, org.id, ADMIN_ROLES)).ok).toBe(true)

    const c2 = await createClass(db, org.id, t2.id, { name: '8-A', gradeLevel: 8 })
    const list = await listTeacherClasses(db, t.id, now)
    expect(list.map((c) => c.name)).toEqual(['7-B', '8-A'])
    expect(list.find((c) => c.id === c2.id)?.students).toBe(0)
  })
})

async function school(name = 'Okul') {
  const t = await user({ role: 'teacher' })
  const { org, cls } = await createSchool(db, t.id, { schoolName: name, name: '7-B', gradeLevel: 7 })
  return { t, org, cls }
}

describe('toplu öğrenci', () => {
  it('benzersiz kullanıcı adı, yalnız özet saklanır, üyelikler yazılır', async () => {
    const { org, cls } = await school()
    const a = await addStudents(db, cls, parseRoster('Ada Kaya\nAda Koç'), now)
    const b = await addStudents(db, cls, parseRoster('Ada Kurt'), now)
    const names = [...a, ...b].map((s) => s.username)
    expect(new Set(names).size).toBe(3)
    expect(names[0]).toMatch(/^ada\.k\d*-7b$/)
    for (const s of [...a, ...b]) {
      const [u] = await db.select().from(users).where(eq(users.id, s.id))
      expect(u.loginMode).toBe('qr')
      expect(u.email).toBeNull()
      expect(u.passwordHash).toBeNull()
      expect(u.loginSecretHash).toBe(sha(s.secret))
      expect(u.loginSecretHash).not.toContain(s.secret)
    }
    const om = await db.select().from(organizationMembers).where(eq(organizationMembers.organizationId, org.id))
    expect(om.filter((m) => m.role === 'student')).toHaveLength(3)
    const cm = await db.select().from(classMembers).where(eq(classMembers.classId, cls.id))
    expect(cm.filter((m) => m.role === 'student')).toHaveLength(3)

    const before = (await db.select().from(users).where(eq(users.id, a[0].id)))[0].loginSecretHash
    const re = await regenerateStudentCard(db, cls.id, a[0].id)
    expect(re?.username).toBe(a[0].username)
    const after = (await db.select().from(users).where(eq(users.id, a[0].id)))[0].loginSecretHash
    expect(after).not.toBe(before)
    expect(after).toBe(sha(re!.secret))
    // Başka sınıfın öğrencisi yenilenemez
    const { cls: other } = await school('Diğer')
    expect(await regenerateStudentCard(db, other.id, a[0].id)).toBeNull()
  })
  it('lisans koltuğu aşılamaz', async () => {
    const { org, cls } = await school('Lisanslı')
    await db.insert(licenses).values({ organizationId: org.id, seats: 2, startsAt: new Date('2026-09-01'), endsAt: new Date('2027-07-01') })
    await addStudents(db, cls, parseRoster('A B\nC D'), now)
    await expect(addStudents(db, cls, parseRoster('E F'), now)).rejects.toBeInstanceOf(SeatLimitError)
  })
})

describe('sınıf kodu ile katılma', () => {
  it('kodla öğrenci olarak katılır; tekrar katılma ve hatalı kod', async () => {
    const { org, cls } = await school('Kodlu')
    const s = await user({ role: 'student' })
    const code = cls.joinCode.slice(0, 3).toLowerCase() + ' - ' + cls.joinCode.slice(3)
    expect(normalizeJoinCode(code)).toBe(cls.joinCode)
    const r = await joinClassByCode(db, s.id, code)
    expect(r).toMatchObject({ ok: true, already: false })
    expect((await joinClassByCode(db, s.id, cls.joinCode))).toMatchObject({ ok: true, already: true })
    const [om] = await db.select().from(organizationMembers).where(eq(organizationMembers.userId, s.id))
    expect(om).toMatchObject({ organizationId: org.id, role: 'student' })
    expect((await joinClassByCode(db, s.id, 'ZZZZZZ')).ok).toBe(false)
    expect((await joinClassByCode(db, s.id, 'AB')).ok).toBe(false)
  })
})

describe('ödevler', () => {
  it('tam olarak bir hedef; ders/hafta/modül kapsamı; ilerleme matrisi', async () => {
    const { t, cls } = await school('Ödevli')
    expect(await createAssignment(db, cls.id, t.id, { lessonId: lessonIds[0], weekId: weekIds[0] })).toMatchObject({ ok: false })
    expect(await createAssignment(db, cls.id, t.id, {})).toMatchObject({ ok: false })
    expect(await createAssignment(db, cls.id, t.id, { lessonId: 999999 })).toMatchObject({ ok: false })
    expect(await createAssignment(db, cls.id, t.id, { lessonId: lessonIds[0], dueAt: 'yarın' })).toMatchObject({ ok: false })
    const a1 = await createAssignment(db, cls.id, t.id, { lessonId: lessonIds[0], dueAt: '2026-10-20T12:00:00Z' })
    expect(a1.ok).toBe(true)
    await createAssignment(db, cls.id, t.id, { weekId: weekIds[0] })
    const [mod] = await db.select({ id: weeks.moduleId }).from(weeks).where(eq(weeks.id, weekIds[0]))
    await createAssignment(db, cls.id, t.id, { moduleId: mod.id })
    const list = await listAssignments(db, cls.id)
    expect(list.map((a) => a.target).sort()).toEqual(['lesson', 'module', 'week'])
    expect(list.find((a) => a.target === 'week')?.lessonIds).toHaveLength(2)
    expect(list.find((a) => a.target === 'module')?.lessonIds).toHaveLength(3)
    expect(list.find((a) => a.target === 'lesson')?.label).toContain('L1')
    const rows = await db.select().from(assignments).where(eq(assignments.classId, cls.id))
    expect(rows).toHaveLength(3)

    const [s] = await addStudents(db, cls, parseRoster('Ali Can'), now)
    await db.insert(progress).values({ userId: s.id, lessonId: lessonIds[0], status: 'completed', startedAt: now, completedAt: now })
    const m = await loadProgressMatrix(db, cls.id)
    const wk = list.find((a) => a.target === 'week')!
    expect(m.cells[s.id][wk.id]).toEqual({ done: 1, total: 2 })
    expect(m.lastActivity[s.id]?.getTime()).toBe(now.getTime())
  })
})

describe('haftalık plan', () => {
  it('saf: sırayla, aralıklı; atlanan hafta yer tutmaz', () => {
    const first = new Date('2026-10-20T09:00:00Z')
    expect(weeklyPlan([1, 2, 3], first, 2, new Set([2])).map((p) => [p.weekId, p.dueAt.toISOString()])).toEqual([
      [1, '2026-10-20T09:00:00.000Z'],
      [3, '2026-11-03T09:00:00.000Z'],
    ])
  })

  it('her haftayı ödevlendirir, tekrarında var olanları atlar, geçersiz girdiyi reddeder', async () => {
    const { t, cls } = await school('Planlı')
    const [mod] = await db.select({ id: weeks.moduleId }).from(weeks).where(eq(weeks.id, weekIds[0]))
    expect(await createWeeklyPlan(db, cls.id, t.id, { moduleId: mod.id, firstDue: 'yarın', everyWeeks: 1 })).toMatchObject({ ok: false })
    expect(await createWeeklyPlan(db, cls.id, t.id, { moduleId: mod.id, firstDue: '2026-10-20T09:00:00Z', everyWeeks: 5 })).toMatchObject({ ok: false })
    expect(await createWeeklyPlan(db, cls.id, t.id, { moduleId: 999999, firstDue: '2026-10-20T09:00:00Z', everyWeeks: 1 })).toMatchObject({ ok: false })

    await createAssignment(db, cls.id, t.id, { weekId: weekIds[1] })
    expect(await createWeeklyPlan(db, cls.id, t.id, { moduleId: mod.id, firstDue: '2026-10-20T09:00:00Z', everyWeeks: 1 }))
      .toEqual({ ok: true, created: 1, skipped: 1 })
    const rows = await db.select().from(assignments).where(eq(assignments.classId, cls.id))
    expect(rows.find((r) => r.weekId === weekIds[0])?.dueAt?.toISOString()).toBe('2026-10-20T09:00:00.000Z')
    expect(await createWeeklyPlan(db, cls.id, t.id, { moduleId: mod.id, firstDue: '2026-10-20T09:00:00Z', everyWeeks: 1 })).toMatchObject({ ok: false })
  })
})

describe('kim takıldı', () => {
  it('saf: ≥3 yanlış ve durma kuralı', () => {
    const min = 60_000
    const at = (m: number) => new Date(now.getTime() - m * min)
    const out = stuckStudents({
      now,
      students: [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }, { id: 'c', name: 'C' }, { id: 'd', name: 'D' }],
      wrongAnswers: [at(5), at(10), at(20)].map((ts) => ({ userId: 'a', lessonId: 1, ts })).concat([{ userId: 'b', lessonId: 1, ts: at(90) }]),
      current: { lessonIds: [1] },
      lastOnCurrent: { a: at(1), b: at(30), c: null, d: at(2) },
      completedCurrent: new Set(['d']),
    })
    expect(out.map((s) => [s.id, s.reasons])).toEqual([['a', ['wrong']], ['b', ['idle']], ['c', ['idle']]])
    // Sınıf çalışmıyorsa (son 15 dk kimse etkin değil) durma kuralı işlemez
    expect(stuckStudents({ now, students: [{ id: 'c', name: 'C' }], wrongAnswers: [], current: { lessonIds: [1] }, lastOnCurrent: {}, completedCurrent: new Set() })).toEqual([])
  })
  it('DB: quiz_answer ok=false olaylarından', async () => {
    const { t, cls } = await school('Takılan')
    const [s1, s2] = await addStudents(db, cls, parseRoster('Bir Kişi\nİki Kişi'), now)
    await createAssignment(db, cls.id, t.id, { lessonId: lessonIds[1] })
    const ev = (u: string, ok: boolean, m: number) => ({ deviceId: 'd', userId: u, type: 'quiz_answer', lessonId: lessonIds[1], payload: { q: `v2-${m}`, ok, sk: 'x' }, ts: new Date(now.getTime() - m * 60_000) })
    await db.insert(events).values([ev(s1.id, false, 3), ev(s1.id, false, 4), ev(s1.id, false, 5), ev(s2.id, true, 1)])
    const r = await loadStuck(db, cls.id, now)
    expect(r.current?.lessonIds).toEqual([lessonIds[1]])
    expect(r.stuck.map((s) => s.id)).toEqual([s1.id])
    expect(r.stuck[0].wrong).toBe(3)
  })
})

describe('beceri ısı haritası', () => {
  it('saf: öğrenci × beceri, sınıf ortalaması', () => {
    const r = (u: string, q: string, ok: boolean, sk: string, t: number) => ({ userId: u, lessonId: 1, ts: new Date(t), payload: { q, ok, sk } })
    const map = skillHeatmap([
      r('a', 'q1', true, 'ohm,led', 1), r('a', 'q2', true, 'ohm', 2),
      r('b', 'q1', false, 'ohm', 3), r('b', 'q3', false, '', 4),
    ])
    expect(map.byUser.a.ohm.score).toBe(1)
    expect(map.byUser.a.led.attempts).toBe(1)
    expect(map.byUser.b.ohm.score).toBe(0)
    expect(map.byUser.b.led).toBeUndefined()
    expect(map.classAvg.ohm).toEqual({ score: 0.5, attempts: 3, students: 2 })
    expect(map.skills).toEqual(['ohm', 'led']) // zayıf beceri önce
  })
  it('DB: yalnız sınıf öğrencilerinin olayları', async () => {
    const { cls } = await school('Beceri')
    const [s] = await addStudents(db, cls, parseRoster('Bir Öğrenci'), now)
    const yabanci = await user()
    await db.insert(events).values([
      { deviceId: 'd', userId: s.id, type: 'quiz_answer', lessonId: lessonIds[0], payload: { q: 'q', ok: true, sk: 'ohm' }, ts: now },
      { deviceId: 'd', userId: yabanci.id, type: 'quiz_answer', lessonId: lessonIds[0], payload: { q: 'q', ok: false, sk: 'ohm' }, ts: now },
    ])
    const { map } = await loadSkillHeatmap(db, cls.id)
    expect(Object.keys(map.byUser)).toEqual([s.id])
    expect(map.classAvg.ohm.score).toBe(1)
  })
})

describe('ligler', () => {
  it('hafta Pazartesi 00:00 İstanbul', () => {
    expect(istanbulWeekStart(now).toISOString()).toBe('2026-10-11T21:00:00.000Z')
    // Pazartesi 00:30 İstanbul = Pazar 21:30 UTC → aynı gün başlar
    expect(istanbulWeekStart(new Date('2026-10-18T21:30:00Z')).toISOString()).toBe('2026-10-18T21:00:00.000Z')
    // Pazar 23:59 İstanbul → önceki Pazartesi
    expect(istanbulWeekStart(new Date('2026-10-18T20:59:00Z')).toISOString()).toBe('2026-10-11T21:00:00.000Z')
    expect(LEAGUE_TIERS).toHaveLength(10)
  })
  it('sıralama: eşitlikte aynı sıra', () => {
    expect(rankLeague([{ userId: 'a', name: 'A', xp: 5 }, { userId: 'b', name: 'B', xp: 9 }, { userId: 'c', name: 'C', xp: 5 }, { userId: 'd', name: 'D', xp: 0 }])
      .map((e) => [e.userId, e.rank])).toEqual([['b', 1], ['a', 2], ['c', 2], ['d', 4]])
  })
  it('DB: yalnız bu haftanın XP\'si ve sınıf arkadaşları; ayar kapalıysa lig yok', async () => {
    const { org, cls } = await school('Ligli')
    const [a, b, c] = await addStudents(db, cls, parseRoster('Ada Kaya\nBora Tan\nCan Er'), now)
    const disari = await user()
    const ws = istanbulWeekStart(now).getTime()
    await db.insert(xpEvents).values([
      { userId: a.id, amount: 30, source: 'step', at: new Date(ws + 60_000) },
      { userId: a.id, amount: 100, source: 'step', at: new Date(ws - 60_000) }, // geçen hafta
      { userId: b.id, amount: 50, source: 'lesson', at: new Date(ws + 3600_000) },
      { userId: disari.id, amount: 999, source: 'step', at: new Date(ws + 60_000) },
    ])
    const league = await loadClassLeague(db, cls.id, now)
    expect(league.map((e) => [e.userId, e.xp, e.rank])).toEqual([[b.id, 50, 1], [a.id, 30, 2], [c.id, 0, 3]])
    const mine = await myLeagues(db, a.id, now)
    expect(mine).toHaveLength(1)
    expect(mine[0]).toMatchObject({ myRank: 2, myXp: 30 })
    expect(mine[0].entries.map((e) => e.name)).toEqual(['Bora T.', 'Ada K.', 'Can E.'])
    expect(JSON.stringify(mine)).not.toContain(b.id) // diğer öğrencinin kimliği sızmaz
    await updateOrgSettings(db, org.id, { leagues: false })
    expect(await myLeagues(db, a.id, now)).toEqual([])
  })
})

describe('okul ayarları', () => {
  it('varsayılanlar, güncelleme, AI öğretmen izni', async () => {
    const { org, cls } = await school('Ayarlı')
    expect(await getOrgSettings(db, org.id)).toEqual({ aiTutor: true, leagues: true })
    await db.update(organizations).set({ settings: { other: 1 } }).where(eq(organizations.id, org.id))
    const [s] = await addStudents(db, cls, parseRoster('Ece Su'), now)
    const bireysel = await user()
    expect(await aiTutorAllowedForUser(db, s.id)).toBe(true)
    expect(await aiTutorAllowedForUser(db, bireysel.id)).toBe(true)
    expect(await updateOrgSettings(db, org.id, { aiTutor: false })).toEqual({ aiTutor: false, leagues: true })
    expect((await db.select().from(organizations).where(eq(organizations.id, org.id)))[0].settings).toEqual({ other: 1, aiTutor: false })
    expect(await aiTutorAllowedForUser(db, s.id)).toBe(false)
    // Herhangi bir kurum kapattıysa false: açık ikinci okul sonucu değiştirmez
    const { cls: c2 } = await school('Açık Okul')
    await db.insert(classMembers).values({ classId: c2.id, userId: s.id, role: 'student' })
    expect(await aiTutorAllowedForUser(db, s.id)).toBe(false)
  })
})

describe('AI sohbetleri', () => {
  it('yalnız sınıf öğrencileri, yeni önce, öğrenci filtresi', async () => {
    const { cls } = await school('Sohbet')
    const [a, b] = await addStudents(db, cls, parseRoster('Ali Bir\nBeren İki'), now)
    const disari = await user()
    await db.insert(tutorMessages).values([
      { userId: a.id, role: 'user', content: 'ilk', createdAt: new Date(now.getTime() - 2000) },
      { userId: a.id, role: 'assistant', content: 'cevap', createdAt: new Date(now.getTime() - 1000) },
      { userId: b.id, role: 'user', content: 'b', createdAt: now },
      { userId: disari.id, role: 'user', content: 'gizli', createdAt: now },
    ])
    const all = await loadTutorMessages(db, cls.id)
    expect(all.map((m) => m.content)).toEqual(['b', 'cevap', 'ilk'])
    expect((await loadTutorMessages(db, cls.id, { studentId: a.id })).map((m) => m.content)).toEqual(['cevap', 'ilk'])
    expect(await loadTutorMessages(db, cls.id, { studentId: disari.id })).toEqual([])
  })
})
