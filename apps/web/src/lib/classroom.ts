// Okul/sınıf işlemleri (DB). Yetki kontrolü çağıranın işi: class-access.ts (requireClassStaff / requireOrgStaff).
import { randomBytes } from 'node:crypto'
import {
  and, asc, assignments, classes, classMembers, eq, inArray, lessons, licenses, modules, organizationMembers, organizations,
  progress, sql, users, weeks, xpEvents, events, type Db,
} from '@ask/db'
import { assignmentColumns, assignmentTarget, PLAN_MAX_EVERY_WEEKS, weeklyPlan, type AssignmentTargetInput } from './assignments'
import { seatsAvailable } from './entitlements'
import { createQrCredentials } from './auth/qr'
import { asciiSlug, classSuffix, fullName, makeUsername, MAX_ROSTER, type RosterName } from './roster'
import { STAFF_ROLES, type ClassRow } from './class-access'
import { istanbulWeekStart } from './leagues'
import { tsz } from './sql-time'

// ---- Sınıf kodu ----

const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789' // karışan harfler (0/O, 1/I/L) yok
export const JOIN_CODE_LEN = 6

export function randomJoinCode(): string {
  let s = ''
  for (const b of randomBytes(JOIN_CODE_LEN)) s += CODE_ALPHABET[b % CODE_ALPHABET.length]
  return s
}

/** Kullanıcının yazdığı kodu sadeleştirir (boşluk/tire atılır, büyük harf). */
export const normalizeJoinCode = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, '')

async function uniqueJoinCode(db: Db): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const code = randomJoinCode()
    const [hit] = await db.select({ id: classes.id }).from(classes).where(eq(classes.joinCode, code)).limit(1)
    if (!hit) return code
  }
  throw new Error('Sınıf kodu üretilemedi')
}

// ---- Okul ve sınıf oluşturma ----

export interface NewClassInput { name: string; gradeLevel: number | null }

export function validateClassInput(raw: unknown): NewClassInput | null {
  const o = (raw ?? {}) as Record<string, unknown>
  const name = typeof o.name === 'string' ? o.name.replace(/\s+/g, ' ').trim() : ''
  if (name.length < 1 || name.length > 40) return null
  const g = o.gradeLevel === '' || o.gradeLevel == null ? null : Number(o.gradeLevel)
  if (g !== null && (!Number.isInteger(g) || g < 0 || g > 12)) return null
  return { name, gradeLevel: g }
}

/** Öğretmen okulunu ve ilk sınıfını açar: kurum ('school') + 'owner' üyeliği + sınıf (sorumlu öğretmen). */
export async function createSchool(db: Db, userId: string, input: { schoolName: string } & NewClassInput) {
  const schoolName = input.schoolName.replace(/\s+/g, ' ').trim().slice(0, 120)
  if (schoolName.length < 2) throw new Error('Okul adı en az 2 karakter olmalı')
  return db.transaction(async (tx) => {
    const t = tx as unknown as Db
    const slug = `${asciiSlug(schoolName).slice(0, 40) || 'okul'}-${randomBytes(3).toString('hex')}`
    const [org] = await t.insert(organizations).values({ name: schoolName, slug, kind: 'school' }).returning()
    await t.insert(organizationMembers).values({ organizationId: org.id, userId, role: 'owner' })
    // Kayıt formu yalnız öğrenci/ebeveyn sunuyor; okul açan kişi öğretmen olur (admin olduğu gibi kalır).
    await t.update(users).set({ role: 'teacher' }).where(and(eq(users.id, userId), sql`${users.role} in ('student', 'parent')`))
    const cls = await insertClass(t, org.id, userId, input)
    return { org, cls }
  })
}

async function insertClass(db: Db, orgId: string, teacherId: string, input: NewClassInput) {
  const [cls] = await db.insert(classes).values({
    organizationId: orgId, name: input.name, gradeLevel: input.gradeLevel, joinCode: await uniqueJoinCode(db), teacherId,
  }).returning()
  await db.insert(classMembers).values({ classId: cls.id, userId: teacherId, role: 'teacher' })
  return cls
}

/** Var olan kuruma yeni sınıf (yetki: requireOrgStaff). */
export const createClass = (db: Db, orgId: string, teacherId: string, input: NewClassInput) => insertClass(db, orgId, teacherId, input)

// ---- Öğretmen ana sayfası ----

export interface TeacherClassSummary {
  id: string; name: string; gradeLevel: number | null; joinCode: string; archived: boolean
  orgId: string; orgName: string
  students: number; activeThisWeek: number; dueSoon: number; nextDue: Date | null
}

/** Kullanıcının personel olduğu kurumlardaki sınıflar: öğrenci sayısı, bu hafta etkin öğrenci, 7 gün içinde teslimi olan ödev. */
export async function listTeacherClasses(db: Db, userId: string, now = new Date()): Promise<TeacherClassSummary[]> {
  const orgRows = await db.select({ orgId: organizationMembers.organizationId, role: organizationMembers.role, name: organizations.name })
    .from(organizationMembers).innerJoin(organizations, eq(organizations.id, organizationMembers.organizationId))
    .where(eq(organizationMembers.userId, userId))
  const orgs = orgRows.filter((r) => STAFF_ROLES.includes(r.role))
  if (!orgs.length) return []
  const cls = await db.select().from(classes)
    .where(inArray(classes.organizationId, orgs.map((o) => o.orgId))).orderBy(asc(classes.archived), asc(classes.name))
  if (!cls.length) return []
  const ids = cls.map((c) => c.id)
  const members = await db.select({ classId: classMembers.classId, userId: classMembers.userId }).from(classMembers)
    .where(and(inArray(classMembers.classId, ids), eq(classMembers.role, 'student')))
  const studentIds = [...new Set(members.map((m) => m.userId))]
  const active = await activeSince(db, studentIds, istanbulWeekStart(now))
  const week = new Date(now.getTime() + 7 * 864e5)
  const due = await db.select({ classId: assignments.classId, dueAt: assignments.dueAt }).from(assignments)
    .where(and(inArray(assignments.classId, ids), sql`${assignments.dueAt} >= ${tsz(now)}`)).orderBy(asc(assignments.dueAt))
  const orgName = new Map(orgs.map((o) => [o.orgId, o.name]))
  return cls.map((c) => {
    const mine = members.filter((m) => m.classId === c.id)
    const myDue = due.filter((d) => d.classId === c.id)
    return {
      id: c.id, name: c.name, gradeLevel: c.gradeLevel, joinCode: c.joinCode, archived: c.archived,
      orgId: c.organizationId, orgName: orgName.get(c.organizationId) ?? '',
      students: mine.length,
      activeThisWeek: mine.filter((m) => active.has(m.userId)).length,
      dueSoon: myDue.filter((d) => d.dueAt! <= week).length,
      nextDue: myDue[0]?.dueAt ?? null,
    }
  })
}

/** `since`'ten beri XP, ilerleme ya da olay kaydı olan kullanıcılar. */
export async function activeSince(db: Db, userIds: string[], since: Date): Promise<Set<string>> {
  if (!userIds.length) return new Set()
  const [a, b, c] = await Promise.all([
    db.selectDistinct({ u: xpEvents.userId }).from(xpEvents).where(and(inArray(xpEvents.userId, userIds), sql`${xpEvents.at} >= ${tsz(since)}`)),
    db.selectDistinct({ u: progress.userId }).from(progress)
      .where(and(inArray(progress.userId, userIds), sql`greatest(${progress.startedAt}, coalesce(${progress.completedAt}, ${progress.startedAt})) >= ${tsz(since)}`)),
    db.selectDistinct({ u: events.userId }).from(events).where(and(inArray(events.userId, userIds), sql`${events.ts} >= ${tsz(since)}`)),
  ])
  return new Set([...a, ...b, ...c].map((r) => r.u!).filter(Boolean))
}

// ---- Öğrenciler ----

export interface ClassStudent { id: string; name: string; username: string | null; loginMode: 'email' | 'qr' | 'picture'; joinedAt: Date }

export async function classStudents(db: Db, classId: string): Promise<ClassStudent[]> {
  return db.select({ id: users.id, name: users.name, username: users.username, loginMode: users.loginMode, joinedAt: classMembers.joinedAt })
    .from(classMembers).innerJoin(users, eq(users.id, classMembers.userId))
    .where(and(eq(classMembers.classId, classId), eq(classMembers.role, 'student')))
    .orderBy(asc(users.name))
}

export interface CreatedStudent { id: string; name: string; username: string; secret: string }

export class SeatLimitError extends Error {
  constructor(public free: number) { super(`Lisansta yalnız ${free} boş koltuk var`) }
}

/** Etkin lisans varsa boş koltuk sayısı (öğrenci üyelere göre); lisans yoksa null (pilot: sınır yok). */
export async function freeSeats(db: Db, orgId: string, now = new Date()): Promise<number | null> {
  const lic = await db.select({ seats: licenses.seats }).from(licenses)
    .where(and(eq(licenses.organizationId, orgId), sql`${licenses.startsAt} <= ${tsz(now)}`, sql`${licenses.endsAt} > ${tsz(now)}`))
  if (!lic.length) return null
  const [{ n }] = await db.select({ n: sql<number>`count(*)::int` }).from(organizationMembers)
    .where(and(eq(organizationMembers.organizationId, orgId), eq(organizationMembers.role, 'student')))
  return seatsAvailable(lic.reduce((s, l) => s + l.seats, 0), n)
}

/**
 * Toplu öğrenci: QR girişli hesap (kullanıcı adı benzersiz, yalnız gizli kodun özeti saklanır), kurum ve sınıf üyeliği.
 * Gizli kodlar yalnız bu dönüşte vardır (kart basımı için).
 */
export async function addStudents(db: Db, cls: ClassRow, names: RosterName[], now = new Date()): Promise<CreatedStudent[]> {
  if (!names.length) return []
  if (names.length > MAX_ROSTER) throw new Error(`Tek seferde en çok ${MAX_ROSTER} öğrenci eklenebilir`)
  const free = await freeSeats(db, cls.organizationId, now)
  if (free !== null && free < names.length) throw new SeatLimitError(free)
  const suffix = classSuffix(cls.name)
  return db.transaction(async (tx) => {
    const t = tx as unknown as Db
    const existing = await t.select({ u: users.username }).from(users).where(sql`${users.username} like ${'%-' + suffix}`)
    const taken = new Set(existing.map((r) => r.u!).filter(Boolean))
    const out: CreatedStudent[] = []
    for (const n of names) {
      const username = makeUsername(n, suffix, taken)
      const { secret, hash } = createQrCredentials()
      const name = fullName(n)
      const [u] = await t.insert(users).values({ name, username, role: 'student', loginMode: 'qr', loginSecretHash: hash }).returning({ id: users.id })
      await t.insert(organizationMembers).values({ organizationId: cls.organizationId, userId: u.id, role: 'student' }).onConflictDoNothing()
      await t.insert(classMembers).values({ classId: cls.id, userId: u.id, role: 'student' }).onConflictDoNothing()
      out.push({ id: u.id, name, username, secret })
    }
    return out
  })
}

/** Öğrencinin QR kartını yeniler (eski kart geçersiz olur). Yalnız bu sınıfın QR girişli öğrencisi. */
export async function regenerateStudentCard(db: Db, classId: string, studentId: string): Promise<CreatedStudent | null> {
  const [row] = await db.select({ id: users.id, name: users.name, username: users.username, loginMode: users.loginMode })
    .from(classMembers).innerJoin(users, eq(users.id, classMembers.userId))
    .where(and(eq(classMembers.classId, classId), eq(classMembers.userId, studentId), eq(classMembers.role, 'student'))).limit(1)
  if (!row || !row.username || row.loginMode === 'email') return null
  const { secret, hash } = createQrCredentials()
  await db.update(users).set({ loginSecretHash: hash, loginMode: 'qr' }).where(eq(users.id, row.id))
  return { id: row.id, name: row.name, username: row.username, secret }
}

// ---- Sınıfa katılma (öğrenci) ----

export type JoinResult = { ok: true; cls: ClassRow; already: boolean } | { ok: false; error: string }

export async function joinClassByCode(db: Db, userId: string, rawCode: string): Promise<JoinResult> {
  const code = normalizeJoinCode(rawCode)
  if (code.length !== JOIN_CODE_LEN) return { ok: false, error: 'Sınıf kodu 6 karakter olmalı' }
  const [cls] = await db.select().from(classes).where(eq(classes.joinCode, code)).limit(1)
  if (!cls || cls.archived) return { ok: false, error: 'Bu kodla açık bir sınıf bulunamadı' }
  const [has] = await db.select({ role: classMembers.role }).from(classMembers)
    .where(and(eq(classMembers.classId, cls.id), eq(classMembers.userId, userId))).limit(1)
  if (has) return { ok: true, cls, already: true }
  const [orgMember] = await db.select({ role: organizationMembers.role }).from(organizationMembers)
    .where(and(eq(organizationMembers.organizationId, cls.organizationId), eq(organizationMembers.userId, userId))).limit(1)
  if (!orgMember) {
    const free = await freeSeats(db, cls.organizationId)
    if (free === 0) return { ok: false, error: 'Okulun lisansında boş yer kalmadı; öğretmenine haber ver' }
    await db.insert(organizationMembers).values({ organizationId: cls.organizationId, userId, role: 'student' }).onConflictDoNothing()
  }
  await db.insert(classMembers).values({ classId: cls.id, userId, role: 'student' }).onConflictDoNothing()
  return { ok: true, cls, already: false }
}

// ---- Ödevler ----

export interface AssignmentView {
  id: string; dueAt: Date | null; createdAt: Date
  target: 'lesson' | 'week' | 'module'; targetId: number; label: string; lessonIds: number[]
}

export type CreateAssignmentResult = { ok: true; id: string } | { ok: false; error: string }

export async function createAssignment(
  db: Db, classId: string, createdBy: string, input: AssignmentTargetInput & { dueAt?: string | Date | null },
): Promise<CreateAssignmentResult> {
  const target = assignmentTarget(input)
  if (!target) return { ok: false, error: 'Bir ders, hafta ya da modülden tam olarak birini seç' }
  const exists = 'lessonId' in target
    ? await db.select({ id: lessons.id }).from(lessons).where(eq(lessons.id, target.lessonId)).limit(1)
    : 'weekId' in target
      ? await db.select({ id: weeks.id }).from(weeks).where(eq(weeks.id, target.weekId)).limit(1)
      : await db.select({ id: modules.id }).from(modules).where(eq(modules.id, target.moduleId)).limit(1)
  if (!exists.length) return { ok: false, error: 'Seçilen içerik bulunamadı' }
  let dueAt: Date | null = null
  if (input.dueAt) {
    dueAt = new Date(input.dueAt)
    if (Number.isNaN(dueAt.getTime())) return { ok: false, error: 'Teslim tarihi geçersiz' }
  }
  const [row] = await db.insert(assignments).values({ classId, createdBy, dueAt, ...assignmentColumns(target) }).returning({ id: assignments.id })
  return { ok: true, id: row.id }
}

export type WeeklyPlanResult = { ok: true; created: number; skipped: number } | { ok: false; error: string }

/** Modülün her haftasını ayrı ödev olarak takvime yayar; sınıfta zaten ödevlendirilmiş haftalar atlanır. */
export async function createWeeklyPlan(
  db: Db, classId: string, createdBy: string, input: { moduleId: number; firstDue: string | Date; everyWeeks: number },
): Promise<WeeklyPlanResult> {
  const firstDue = new Date(input.firstDue)
  const every = input.everyWeeks
  if (!Number.isInteger(input.moduleId) || Number.isNaN(firstDue.getTime()) || !Number.isInteger(every) || every < 1 || every > PLAN_MAX_EVERY_WEEKS) {
    return { ok: false, error: `Plan için modül, ilk teslim tarihi ve 1-${PLAN_MAX_EVERY_WEEKS} haftalık aralık gerekli` }
  }
  const ws = await db.select({ id: weeks.id }).from(weeks).where(eq(weeks.moduleId, input.moduleId)).orderBy(asc(weeks.position))
  if (!ws.length) return { ok: false, error: 'Seçilen içerik bulunamadı' }
  const weekIds = ws.map((w) => w.id)
  const taken = await db.select({ id: assignments.weekId }).from(assignments)
    .where(and(eq(assignments.classId, classId), inArray(assignments.weekId, weekIds)))
  const plan = weeklyPlan(weekIds, firstDue, every, new Set(taken.map((t) => t.id!)))
  if (!plan.length) return { ok: false, error: 'Bu modülün bütün haftaları zaten ödevlendirilmiş' }
  await db.insert(assignments).values(plan.map((p) => ({ classId, createdBy, weekId: p.weekId, dueAt: p.dueAt })))
  return { ok: true, created: plan.length, skipped: weekIds.length - plan.length }
}

export async function deleteAssignment(db: Db, classId: string, assignmentId: string) {
  const rows = await db.delete(assignments).where(and(eq(assignments.id, assignmentId), eq(assignments.classId, classId))).returning({ id: assignments.id })
  return rows.length > 0
}

/** Sınıfın ödevleri (yeni önce): hedef etiketi ve kapsadığı ders kimlikleri. */
export async function listAssignments(db: Db, classId: string): Promise<AssignmentView[]> {
  const rows = await db.select().from(assignments).where(eq(assignments.classId, classId)).orderBy(sql`${assignments.createdAt} desc`)
  if (!rows.length) return []
  const lessonIds = rows.flatMap((r) => (r.lessonId ? [r.lessonId] : []))
  const weekIds = rows.flatMap((r) => (r.weekId ? [r.weekId] : []))
  const moduleIds = rows.flatMap((r) => (r.moduleId ? [r.moduleId] : []))
  const lessonRows = await db
    .select({ id: lessons.id, title: lessons.title, position: lessons.position, weekId: weeks.id, weekPos: weeks.position, weekTitle: weeks.title, moduleId: modules.id, moduleTitle: modules.title })
    .from(lessons).innerJoin(weeks, eq(weeks.id, lessons.weekId)).innerJoin(modules, eq(modules.id, weeks.moduleId))
    .where(sql`${lessons.id} in ${ids(lessonIds)} or ${weeks.id} in ${ids(weekIds)} or ${modules.id} in ${ids(moduleIds)}`)
    .orderBy(asc(modules.position), asc(weeks.position), asc(lessons.position))
  const modTitle = new Map<number, string>()
  if (moduleIds.length) {
    for (const m of await db.select({ id: modules.id, title: modules.title }).from(modules).where(inArray(modules.id, moduleIds))) modTitle.set(m.id, m.title)
  }
  return rows.map((r) => {
    if (r.lessonId) {
      const l = lessonRows.find((x) => x.id === r.lessonId)
      return view(r, 'lesson', r.lessonId, l ? `${l.moduleTitle} › ${l.weekPos}. hafta › ${l.title}` : 'Ders', [r.lessonId])
    }
    if (r.weekId) {
      const ls = lessonRows.filter((x) => x.weekId === r.weekId)
      const l = ls[0]
      return view(r, 'week', r.weekId, l ? `${l.moduleTitle} › ${l.weekPos}. hafta: ${l.weekTitle}` : 'Hafta', ls.map((x) => x.id))
    }
    const ls = lessonRows.filter((x) => x.moduleId === r.moduleId)
    return view(r, 'module', r.moduleId!, `${modTitle.get(r.moduleId!) ?? 'Modül'} (tüm modül)`, ls.map((x) => x.id))
  })
}

// Boş liste için "in (null)" (hiçbir şeyle eşleşmez)
const ids = (xs: number[]) => (xs.length ? sql`(${sql.join(xs.map((x) => sql`${x}`), sql`, `)})` : sql`(null)`)

const view = (r: typeof assignments.$inferSelect, target: AssignmentView['target'], targetId: number, label: string, lessonIds: number[]): AssignmentView =>
  ({ id: r.id, dueAt: r.dueAt, createdAt: r.createdAt, target, targetId, label, lessonIds })
