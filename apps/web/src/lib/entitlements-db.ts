// resolveAccess için bağlamı DB'den toplar (ince katman; karar mantığı entitlements.ts'te).
import {
  and, classes, classMembers, eq, inArray, lessons, licenses, modules, organizationMembers, plans, progress,
  sql, subscriptionMembers, subscriptions, users, weeks, type Db,
} from '@ask/db'
import type { AccessContext, LessonRef, OrgLicenseInput, PlanId, SubscriptionInput } from './entitlements'

type MemberRole = OrgLicenseInput['memberRole']
// Aynı kurumda birden çok üyelik varsa güçlü olan geçerli
const ROLE_RANK: Record<MemberRole, number> = { parent: 0, student: 1, teacher: 2, admin: 3, owner: 4 }

/** Kullanıcının abonelikleri (sahip + aile üyesi) ve üyesi olduğu kurumların lisansları. Kullanıcı yoksa misafir bağlamı. */
export async function loadAccessContext(db: Db, userId: string | null | undefined): Promise<AccessContext> {
  if (!userId) return { user: null }
  const [user] = await db.select({ id: users.id, role: users.role }).from(users).where(eq(users.id, userId)).limit(1)
  if (!user) return { user: null }

  const subCols = {
    planId: subscriptions.planId, status: subscriptions.status,
    currentPeriodEnd: subscriptions.currentPeriodEnd, features: plans.features,
  }
  const [owned, shared] = await Promise.all([
    db.select(subCols).from(subscriptions)
      .innerJoin(plans, eq(plans.id, subscriptions.planId))
      .where(eq(subscriptions.userId, userId)),
    db.select(subCols).from(subscriptionMembers)
      .innerJoin(subscriptions, eq(subscriptions.id, subscriptionMembers.subscriptionId))
      .innerJoin(plans, eq(plans.id, subscriptions.planId))
      .where(eq(subscriptionMembers.userId, userId)),
  ])
  const subs: SubscriptionInput[] = [...owned, ...shared].map((s) => ({ ...s, planId: s.planId as PlanId }))

  // Kurum rolü: doğrudan üyelik + arşivlenmemiş sınıf üyeliği
  const roles = new Map<string, MemberRole>()
  const put = (org: string, role: MemberRole) => {
    const cur = roles.get(org)
    if (!cur || ROLE_RANK[role] > ROLE_RANK[cur]) roles.set(org, role)
  }
  const [orgRows, classRows] = await Promise.all([
    db.select({ org: organizationMembers.organizationId, role: organizationMembers.role })
      .from(organizationMembers).where(eq(organizationMembers.userId, userId)),
    db.select({ org: classes.organizationId, role: classMembers.role })
      .from(classMembers).innerJoin(classes, eq(classes.id, classMembers.classId))
      .where(and(eq(classMembers.userId, userId), eq(classes.archived, false))),
  ])
  for (const r of orgRows) put(r.org, r.role)
  for (const r of classRows) put(r.org, r.role)

  let orgLicenses: OrgLicenseInput[] = []
  if (roles.size) {
    const rows = await db
      .select({
        organizationId: licenses.organizationId, planId: licenses.planId, seats: licenses.seats,
        startsAt: licenses.startsAt, endsAt: licenses.endsAt, scope: licenses.scope, features: plans.features,
      })
      .from(licenses)
      .innerJoin(plans, eq(plans.id, licenses.planId))
      .where(inArray(licenses.organizationId, [...roles.keys()]))
    orgLicenses = rows.map((l) => ({ ...l, planId: l.planId as PlanId, memberRole: roles.get(l.organizationId)! }))
  }

  return { user, subscriptions: subs, orgLicenses }
}

/** Türkiye günü başlangıcı (UTC+3, yaz saati yok). Günlük ücretsiz ders sayacı bu sınırla sıfırlanır. */
export function istanbulDayStart(now: Date): Date {
  const OFFSET = 3 * 60 * 60 * 1000
  const local = new Date(now.getTime() + OFFSET)
  return new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()) - OFFSET)
}

/**
 * Bugün açılan dersler (progress.started_at). İlk hafta ücretsiz açıksa sayaca girmez.
 * Not: ders açılışında progress satırı ('started') yazan akış henüz yok; paywall açılmadan önce eklenmeli.
 */
export async function loadLessonUsage(db: Db, userId: string, now = new Date(), excludeFirstWeek = true) {
  const rows = await db
    .select({ lessonId: progress.lessonId })
    .from(progress)
    .innerJoin(lessons, eq(lessons.id, progress.lessonId))
    .innerJoin(weeks, eq(weeks.id, lessons.weekId))
    .where(and(
      eq(progress.userId, userId),
      // ISO metni: postgres-js tipsiz sql parametresinde Date'i serileştiremiyor (PGlite yapabildiği için testler geçiyordu)
      sql`${progress.startedAt} >= ${istanbulDayStart(now).toISOString()}::timestamptz`,
      excludeFirstWeek ? sql`${weeks.position} > 1` : undefined,
    ))
  const before = await db.select({ lessonId: progress.lessonId }).from(progress).where(eq(progress.userId, userId))
  return { openedToday: rows.map((r) => r.lessonId), openedBefore: before.map((r) => r.lessonId) }
}

/** Ders kimliğinden yetki sorgusu için referans. Bant DB'de yok; modül→bant eşlemesi verilirse eklenir. */
export async function loadLessonRef(db: Db, lessonId: number, bandOf?: (moduleSlug: string) => string | undefined): Promise<LessonRef | null> {
  const [row] = await db
    .select({ lessonId: lessons.id, moduleSlug: modules.slug, weekPosition: weeks.position })
    .from(lessons)
    .innerJoin(weeks, eq(weeks.id, lessons.weekId))
    .innerJoin(modules, eq(modules.id, weeks.moduleId))
    .where(eq(lessons.id, lessonId))
    .limit(1)
  return row ? { ...row, band: bandOf?.(row.moduleSlug) } : null
}
