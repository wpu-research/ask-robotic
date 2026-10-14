import type { Metadata } from 'next'
import Link from 'next/link'
import { getDb } from '@/lib/db'
import { staffOrgs } from '@/lib/class-access'
import { listTeacherClasses } from '@/lib/classroom'
import { requireUserPage } from '@/lib/teacher-page'
import { NewClassForm } from '@/components/teacher/forms'
import { intlTag } from '@/i18n'
import { getLocale, getT } from '@/i18n/server'
import '../ogretmen.css'

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())('teacher.panel') }
}
export const dynamic = 'force-dynamic'

const fmt = (d: Date, tag: string) => d.toLocaleDateString(tag, { day: 'numeric', month: 'short', timeZone: 'Europe/Istanbul' })

export default async function Ogretmen() {
  const user = await requireUserPage('/ogretmen')
  const t = await getT()
  const tag = intlTag(await getLocale())
  const db = getDb()
  const [orgs, classes] = await Promise.all([staffOrgs(db, user.id), listTeacherClasses(db, user.id)])
  if (!orgs.length) {
    return (
      <div className="page og">
        <div className="panel" style={{ maxWidth: 640, margin: '24px auto' }}>
          <h1>{t('teacher.panel')}</h1>
          <p className="muted">{t('teacher.home.notTeacher')}</p>
          <Link className="v2-btn accent" href="/ogretmen/basla">{t('teacher.createSchool')}</Link>
        </div>
      </div>
    )
  }
  return (
    <div className="page og">
      <div className="og-head">
        <div>
          <p className="v2-eyebrow">{t('teacher.panel')}</p>
          <h1>{t('teacher.myClasses')}</h1>
        </div>
        <Link className="btn btn-ghost" href="/ogretmen/okul">{t('teacher.schoolSettings')}</Link>
      </div>
      {orgs.map(({ org }) => {
        const mine = classes.filter((c) => c.orgId === org.id)
        return (
          <section key={org.id} className="og" style={{ display: 'grid' }}>
            {orgs.length > 1 && <h2 style={{ margin: 0 }}>{org.name}</h2>}
            {mine.length ? (
              <div className="og-grid">
                {mine.map((c) => (
                  <Link key={c.id} href={`/ogretmen/sinif/${c.id}`} className={`hh-card og-class${c.archived ? ' archived' : ''}`}>
                    <div className="og-head">
                      <h2>{c.name}</h2>
                      <span className="chip og-code" title={t('teacher.home.classCode')}>{c.joinCode}</span>
                    </div>
                    <div className="og-stats">
                      <div><b>{c.students}</b><span>{t('teacher.home.students', { n: c.students })}</span></div>
                      <div><b>{c.activeThisWeek}</b><span>{t('teacher.home.activeThisWeek')}</span></div>
                      <div><b>{c.dueSoon}</b><span>{t('teacher.home.dueSoon')}</span></div>
                    </div>
                    <span className="muted" style={{ fontSize: '.85rem' }}>
                      {c.archived ? t('teacher.home.archived') : c.nextDue ? t('teacher.home.nextDue', { date: fmt(c.nextDue, tag) }) : t('teacher.home.noDue')}
                    </span>
                  </Link>
                ))}
              </div>
            ) : <p className="muted">{t('teacher.home.noClasses')}</p>}
            <div className="panel">
              <h3 className="panel-title">{t('teacher.newClass')}</h3>
              <NewClassForm orgId={org.id} />
            </div>
          </section>
        )
      })}
    </div>
  )
}
