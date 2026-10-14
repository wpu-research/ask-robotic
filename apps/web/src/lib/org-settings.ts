// Okul (kurum) ayarları: organizations.settings jsonb. Bilinmeyen anahtarlar korunur, eksikler varsayılana düşer.
import { and, classes, classMembers, eq, inArray, organizationMembers, organizations, type Db } from '@ask/db'

export interface OrgSettings {
  /** AI öğretmen (sohbet) öğrencilere açık mı */
  aiTutor: boolean
  /** Sınıf içi haftalık ligler açık mı */
  leagues: boolean
}

export const DEFAULT_ORG_SETTINGS: OrgSettings = { aiTutor: true, leagues: true }

export function parseOrgSettings(raw: unknown): OrgSettings {
  const o = raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {}
  return {
    aiTutor: typeof o.aiTutor === 'boolean' ? o.aiTutor : DEFAULT_ORG_SETTINGS.aiTutor,
    leagues: typeof o.leagues === 'boolean' ? o.leagues : DEFAULT_ORG_SETTINGS.leagues,
  }
}

/** Kurum yoksa varsayılanlar. */
export async function getOrgSettings(db: Db, orgId: string): Promise<OrgSettings> {
  const [row] = await db.select({ settings: organizations.settings }).from(organizations).where(eq(organizations.id, orgId)).limit(1)
  return parseOrgSettings(row?.settings)
}

/** Yalnız bilinen boolean alanlar yazılır; diğer anahtarlar olduğu gibi kalır. */
export async function updateOrgSettings(db: Db, orgId: string, patch: Partial<OrgSettings>): Promise<OrgSettings> {
  const [row] = await db.select({ settings: organizations.settings }).from(organizations).where(eq(organizations.id, orgId)).limit(1)
  if (!row) throw new Error('Kurum bulunamadı')
  const next: Record<string, unknown> = { ...(row.settings ?? {}) }
  for (const k of ['aiTutor', 'leagues'] as const) if (typeof patch[k] === 'boolean') next[k] = patch[k]
  await db.update(organizations).set({ settings: next }).where(eq(organizations.id, orgId))
  return parseOrgSettings(next)
}

/** Kullanıcının öğrenci olarak bağlı olduğu kurumlar (doğrudan üyelik + arşivlenmemiş sınıf üyeliği). */
export async function studentOrgIds(db: Db, userId: string): Promise<string[]> {
  const [direct, viaClass] = await Promise.all([
    db.select({ org: organizationMembers.organizationId }).from(organizationMembers)
      .where(and(eq(organizationMembers.userId, userId), eq(organizationMembers.role, 'student'))),
    db.select({ org: classes.organizationId }).from(classMembers).innerJoin(classes, eq(classes.id, classMembers.classId))
      .where(and(eq(classMembers.userId, userId), eq(classMembers.role, 'student'), eq(classes.archived, false))),
  ])
  return [...new Set([...direct, ...viaClass].map((r) => r.org))]
}

/**
 * AI öğretmen bu kullanıcıya açık mı: öğrencisi olduğu kurumlardan HERHANGİ biri kapattıysa false.
 * Okula bağlı olmayan kullanıcı için true (bireysel kurallar ayrıca uygulanır: yetki, onay).
 */
export async function aiTutorAllowedForUser(db: Db, userId: string): Promise<boolean> {
  const orgIds = await studentOrgIds(db, userId)
  if (!orgIds.length) return true
  const rows = await db.select({ settings: organizations.settings }).from(organizations).where(inArray(organizations.id, orgIds))
  return rows.every((r) => parseOrgSettings(r.settings).aiTutor)
}
