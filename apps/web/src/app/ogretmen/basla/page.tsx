import type { Metadata } from 'next'
import Link from 'next/link'
import { getDb } from '@/lib/db'
import { staffOrgs } from '@/lib/class-access'
import { requireUserPage } from '@/lib/teacher-page'
import { OnboardForm } from '@/components/teacher/forms'
import { getT } from '@/i18n/server'
import '../../ogretmen.css'

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())('teacher.createSchool') }
}
export const dynamic = 'force-dynamic'

export default async function Basla() {
  const user = await requireUserPage('/ogretmen/basla')
  const orgs = await staffOrgs(getDb(), user.id)
  const t = await getT()
  return (
    <div className="page og">
      <div className="panel" style={{ maxWidth: 640, margin: '24px auto', width: '100%' }}>
        <p className="v2-eyebrow">{t('teacher.panel')}</p>
        <h1 style={{ marginTop: 4 }}>{t('teacher.onboard.title')}</h1>
        <p className="muted">{t('teacher.onboard.lead')}</p>
        {orgs.length > 0 && (
          <p className="og-ok">{t('teacher.onboard.alreadyBefore', { schools: orgs.map((o) => o.org.name).join(', ') })} <Link href="/ogretmen">{t('teacher.onboard.goToClasses')}</Link> {t('teacher.onboard.alreadyAfter')}</p>
        )}
        <OnboardForm />
      </div>
    </div>
  )
}
