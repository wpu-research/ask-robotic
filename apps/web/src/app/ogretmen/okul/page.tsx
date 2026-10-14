import type { Metadata } from 'next'
import Link from 'next/link'
import { and, asc, classes, eq, inArray, organizationMembers, sql, users } from '@ask/db'
import { getDb } from '@/lib/db'
import { ADMIN_ROLES, staffOrgs } from '@/lib/class-access'
import { freeSeats } from '@/lib/classroom'
import { parseOrgSettings } from '@/lib/org-settings'
import { requireUserPage } from '@/lib/teacher-page'
import { NewClassForm, SettingsToggles } from '@/components/teacher/forms'
import { getT } from '@/i18n/server'
import '../../ogretmen.css'

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())('teacher.schoolSettings') }
}
export const dynamic = 'force-dynamic'

const ROLES = ['owner', 'admin', 'teacher'] as const

export default async function Okul() {
  const user = await requireUserPage('/ogretmen/okul')
  const db = getDb()
  const orgs = await staffOrgs(db, user.id)
  const t = await getT()
  const roleLabel = (r: string) => ((ROLES as readonly string[]).includes(r) ? t(`teacher.school.roles.${r as (typeof ROLES)[number]}`) : r)
  if (!orgs.length) {
    return <div className="page og"><div className="panel"><h1>{t('teacher.schoolSettings')}</h1><p className="muted">{t('teacher.school.notTeacher')}</p><Link className="v2-btn accent" href="/ogretmen/basla">{t('teacher.createSchool')}</Link></div></div>
  }
  const ids = orgs.map((o) => o.org.id)
  const [staff, counts] = await Promise.all([
    db.select({ orgId: organizationMembers.organizationId, role: organizationMembers.role, name: users.name, email: users.email })
      .from(organizationMembers).innerJoin(users, eq(users.id, organizationMembers.userId))
      .where(and(inArray(organizationMembers.organizationId, ids), sql`${organizationMembers.role} in ('owner', 'admin', 'teacher')`))
      .orderBy(asc(users.name)),
    db.select({ orgId: classes.organizationId, n: sql<number>`count(*)::int` }).from(classes).where(inArray(classes.organizationId, ids)).groupBy(classes.organizationId),
  ])
  const seats = await Promise.all(ids.map((id) => freeSeats(db, id)))
  return (
    <div className="page og">
      <div className="og-head">
        <div><p className="v2-eyebrow"><Link href="/ogretmen">{t('teacher.myClasses')}</Link></p><h1>{t('teacher.schoolSettings')}</h1></div>
      </div>
      {orgs.map(({ org, role }, k) => (
        <section key={org.id} className="og" style={{ display: 'grid' }}>
          <h2 style={{ margin: 0 }}>{org.name} <span className="chip">{roleLabel(role)}</span></h2>
          <div className="og-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
            <div className="panel">
              <h3 className="panel-title">{t('teacher.school.settings')}</h3>
              <SettingsToggles orgId={org.id} initial={parseOrgSettings(org.settings)} canEdit={ADMIN_ROLES.includes(role)} />
            </div>
            <div className="panel">
              <h3 className="panel-title">{t('teacher.school.teachers')}</h3>
              <ul className="og-list">
                {staff.filter((s) => s.orgId === org.id).map((s, i) => (
                  <li key={i}><span><b>{s.name}</b>{s.email && <span className="muted"> · {s.email}</span>}</span><span className="chip">{roleLabel(s.role)}</span></li>
                ))}
              </ul>
              <p className="muted">{t('teacher.school.classes', { n: counts.find((c) => c.orgId === org.id)?.n ?? 0 })} · {seats[k] === null ? t('teacher.school.noLicense') : t('teacher.school.freeSeats', { n: seats[k] ?? 0 })}</p>
            </div>
          </div>
          <div className="panel"><h3 className="panel-title">{t('teacher.newClass')}</h3><NewClassForm orgId={org.id} /></div>
        </section>
      ))}
    </div>
  )
}
