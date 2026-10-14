// Öğretmen paneli yetkisi: sınıfın kurumunda owner/admin/teacher olmalı. Her öğretmen sayfası ve API'si buradan geçer.
import { and, classes, eq, organizationMembers, organizations, type Db } from '@ask/db'

export type OrgRole = 'owner' | 'admin' | 'teacher' | 'student' | 'parent'
export const STAFF_ROLES: readonly OrgRole[] = ['owner', 'admin', 'teacher']
export const ADMIN_ROLES: readonly OrgRole[] = ['owner', 'admin']

export type ClassRow = typeof classes.$inferSelect
export type OrgRow = typeof organizations.$inferSelect

export type Guard<T> = ({ ok: true } & T) | { ok: false; status: 401 | 403 | 404; error: string }

const DENY = { ok: false as const, status: 403 as const, error: 'Bu sayfa için yetkin yok' }

export async function orgRoleOf(db: Db, userId: string, orgId: string): Promise<OrgRole | null> {
  const [m] = await db.select({ role: organizationMembers.role }).from(organizationMembers)
    .where(and(eq(organizationMembers.organizationId, orgId), eq(organizationMembers.userId, userId))).limit(1)
  return m?.role ?? null
}

/** Kurumda öğretmen/yönetici/sahip mi (`roles` ile daraltılabilir). */
export async function requireOrgStaff(
  db: Db, userId: string | null | undefined, orgId: string, roles: readonly OrgRole[] = STAFF_ROLES,
): Promise<Guard<{ org: OrgRow; role: OrgRole }>> {
  if (!userId) return { ok: false, status: 401, error: 'Giriş yapmalısın' }
  if (!isUuid(orgId)) return { ok: false, status: 404, error: 'Kurum bulunamadı' }
  const [org] = await db.select().from(organizations).where(eq(organizations.id, orgId)).limit(1)
  if (!org) return { ok: false, status: 404, error: 'Kurum bulunamadı' }
  const role = await orgRoleOf(db, userId, orgId)
  if (!role || !roles.includes(role)) return DENY
  return { ok: true, org, role }
}

/** Sınıfın kurumunda öğretmen/yönetici/sahip mi. */
export async function requireClassStaff(
  db: Db, userId: string | null | undefined, classId: string, roles: readonly OrgRole[] = STAFF_ROLES,
): Promise<Guard<{ cls: ClassRow; role: OrgRole }>> {
  if (!userId) return { ok: false, status: 401, error: 'Giriş yapmalısın' }
  if (!isUuid(classId)) return { ok: false, status: 404, error: 'Sınıf bulunamadı' }
  const [cls] = await db.select().from(classes).where(eq(classes.id, classId)).limit(1)
  if (!cls) return { ok: false, status: 404, error: 'Sınıf bulunamadı' }
  const role = await orgRoleOf(db, userId, cls.organizationId)
  if (!role || !roles.includes(role)) return DENY
  return { ok: true, cls, role }
}

/** Kullanıcının öğretmen/yönetici/sahip olduğu kurumlar. */
export async function staffOrgs(db: Db, userId: string) {
  const rows = await db.select({ org: organizations, role: organizationMembers.role }).from(organizationMembers)
    .innerJoin(organizations, eq(organizations.id, organizationMembers.organizationId))
    .where(eq(organizationMembers.userId, userId))
  return rows.filter((r) => STAFF_ROLES.includes(r.role))
}

export const isUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)

/** API yanıtı: guard reddi. */
export const guardResponse = (g: { status: number; error: string }) => Response.json({ error: g.error }, { status: g.status })
