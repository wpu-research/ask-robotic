// KVKK veri hakları: kişinin kendi verisini indirmesi (md. 11) ve hesabını silmesi.
// Dışa aktarımda parola/QR özetleri ve oturum belirteçleri yer almaz.
import {
  classMembers, consents, enrollments, eq, events, guardianLinks, organizationMembers, payments, progress, sessions,
  skillRuns, sql, subscriptionMembers, subscriptions, tutorMessages, users, xpEvents, type Db,
} from '@ask/db'

export const DELETE_CONFIRM_PHRASE = 'HESABIMI SİL'

export async function exportUserData(db: Db, userId: string, now = new Date()) {
  const [user] = await db.select({
    id: users.id, email: users.email, username: users.username, name: users.name, role: users.role, locale: users.locale,
    birthYear: users.birthYear, loginMode: users.loginMode, profile: users.profile, game: users.game, parentId: users.parentId,
    createdAt: users.createdAt,
  }).from(users).where(eq(users.id, userId))
  if (!user) return null

  const [prog, enr, subs, subMember, pays, cons, xp, ev, tutor, skills, guardians, orgs, cls, sess] = await Promise.all([
    db.select().from(progress).where(eq(progress.userId, userId)),
    db.select().from(enrollments).where(eq(enrollments.userId, userId)),
    db.select({
      id: subscriptions.id, planId: subscriptions.planId, status: subscriptions.status, provider: subscriptions.provider,
      currentPeriodEnd: subscriptions.currentPeriodEnd, createdAt: subscriptions.createdAt,
    }).from(subscriptions).where(eq(subscriptions.userId, userId)),
    db.select().from(subscriptionMembers).where(eq(subscriptionMembers.userId, userId)),
    db.select({
      id: payments.id, planId: payments.planId, period: payments.period, provider: payments.provider, amount: payments.amount,
      currency: payments.currency, status: payments.status, createdAt: payments.createdAt,
    }).from(payments).where(eq(payments.userId, userId)),
    db.select().from(consents).where(eq(consents.userId, userId)),
    db.select().from(xpEvents).where(eq(xpEvents.userId, userId)),
    db.select().from(events).where(eq(events.userId, userId)),
    db.select().from(tutorMessages).where(eq(tutorMessages.userId, userId)),
    db.select().from(skillRuns).where(eq(skillRuns.userId, userId)),
    db.select().from(guardianLinks).where(sql`${guardianLinks.parentUserId} = ${userId} or ${guardianLinks.studentUserId} = ${userId}`),
    db.select().from(organizationMembers).where(eq(organizationMembers.userId, userId)),
    db.select().from(classMembers).where(eq(classMembers.userId, userId)),
    db.select({ createdAt: sessions.createdAt, expiresAt: sessions.expiresAt }).from(sessions).where(eq(sessions.userId, userId)),
  ])

  return {
    exportedAt: now.toISOString(),
    note: 'ASK Robotic hesabına ait kişisel veriler (KVKK md. 11). Parola ve giriş özetleri güvenlik nedeniyle dahil edilmez.',
    user,
    progress: prog,
    enrollments: enr,
    subscriptions: subs,
    familyMemberships: subMember,
    payments: pays,
    consents: cons,
    xpEvents: xp,
    events: ev,
    tutorMessages: tutor,
    skillRuns: skills,
    guardianLinks: guardians,
    organizationMemberships: orgs,
    classMemberships: cls,
    sessions: sess,
  }
}

export type DeleteResult = { ok: true } | { ok: false; code: 'confirm_required' | 'not_found' }

/**
 * Hesabı ve bağlı kişisel kayıtları siler (FK cascade: ilerleme, oturum, abonelik, ödeme, onay, XP, olay, AI sohbeti).
 * NOT: payments da cascade silinir. Vergi mevzuatı fatura/ödeme kaydının saklanmasını isteyebilir; şema değişikliği
 * (payments.user_id → set null + anonimleştirme) hukuk/muhasebe kararıyla yapılmalı.
 */
export async function deleteUserAccount(db: Db, userId: string, confirm: unknown): Promise<DeleteResult> {
  if (typeof confirm !== 'string' || confirm.trim().toLocaleUpperCase('tr-TR') !== DELETE_CONFIRM_PHRASE) {
    return { ok: false, code: 'confirm_required' }
  }
  const r = await db.delete(users).where(eq(users.id, userId)).returning({ id: users.id })
  return r.length ? { ok: true } : { ok: false, code: 'not_found' }
}
