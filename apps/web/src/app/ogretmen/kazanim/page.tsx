import type { Metadata } from 'next'
import Link from 'next/link'
import { getDb } from '@/lib/db'
import { getCatalog } from '@/lib/catalog'
import { staffOrgs } from '@/lib/class-access'
import { DEGERLER, kazanimFor, type DegerKey } from '@/lib/kazanim-deger'
import { requireUserPage } from '@/lib/teacher-page'
import { PrintButton } from '@/components/teacher/print-button'
import { getT } from '@/i18n/server'
import '../../ogretmen.css'

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())('teacher.matrix.title') }
}
export const dynamic = 'force-dynamic'

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function KazanimMatrisi({ searchParams }: Props) {
  const sp = await searchParams
  const user = await requireUserPage('/ogretmen/kazanim')
  const t = await getT()
  const db = getDb()
  if (!(await staffOrgs(db, user.id)).length) {
    return <div className="page og"><div className="panel"><p className="muted">{t('teacher.home.notTeacher')}</p></div></div>
  }
  const catalog = await getCatalog(db)
  const mod = catalog.find((m) => m.slug === sp.modul) ?? catalog[0]
  if (!mod) return <div className="page og"><p className="muted">{t('teacher.assign.noCatalog')}</p></div>

  const rows = mod.weeks.map((w) => ({ week: w, k: kazanimFor(mod.slug, w.position) }))
  const counts = new Map<DegerKey, number>()
  for (const { k } of rows) if (k) counts.set(k.deger, (counts.get(k.deger) ?? 0) + 1)

  return (
    <div className="page og">
      <div className="og-head og-no-print">
        <div>
          <p className="v2-eyebrow"><Link href="/ogretmen">{t('teacher.panel')}</Link></p>
          <h1>{t('teacher.matrix.title')}</h1>
          <p className="muted">{t('teacher.matrix.lead')}</p>
        </div>
        <PrintButton />
      </div>
      <nav className="og-tabs og-no-print" aria-label={t('teacher.matrix.modules')}>
        {catalog.map((m) => <Link key={m.slug} href={`/ogretmen/kazanim?modul=${m.slug}`} aria-current={m.slug === mod.slug ? 'page' : undefined}>{m.title}</Link>)}
      </nav>
      <section className="panel og-print">
        <h2 className="panel-title">{mod.title}</h2>
        <p className="muted">
          {t('teacher.matrix.valuesSummary')}{' '}
          {[...counts].map(([d, n]) => `${DEGERLER[d]} (${n})`).join(', ')}
        </p>
        <div className="og-table-wrap">
          <table className="og-table og-matrix">
            <thead>
              <tr>
                <th>{t('teacher.matrix.week')}</th>
                <th>{t('teacher.matrix.topic')}</th>
                <th>{t('teacher.matrix.value')}</th>
                <th>{t('teacher.matrix.outcome')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ week, k }) => (
                <tr key={week.id}>
                  <td>{week.position}</td>
                  <td><b>{week.title}</b>{week.project && <div className="muted">{t('teacher.matrix.project', { name: week.project })}</div>}</td>
                  <td>{k ? <><b>{DEGERLER[k.deger]}</b><div>{k.eylem}</div></> : '—'}</td>
                  <td>{k?.cikti ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="muted og-matrix-note">{t('teacher.matrix.note')}</p>
      </section>
    </div>
  )
}
