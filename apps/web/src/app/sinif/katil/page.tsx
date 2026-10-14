import type { Metadata } from 'next'
import { requireUserPage } from '@/lib/teacher-page'
import { JoinForm } from '@/components/teacher/forms'
import { getT } from '@/i18n/server'
import '../../ogretmen.css'

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())('classJoin.metaTitle') }
}
export const dynamic = 'force-dynamic'

export default async function Katil({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams
  const kod = typeof sp.kod === 'string' ? sp.kod.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6) : ''
  await requireUserPage(`/sinif/katil${kod ? `?kod=${kod}` : ''}`)
  const t = await getT()
  return (
    <div className="page og">
      <div className="panel" style={{ maxWidth: 520, margin: '24px auto', width: '100%' }}>
        <p className="v2-eyebrow">{t('classJoin.eyebrow')}</p>
        <h1 style={{ marginTop: 4 }}>{t('classJoin.title')}</h1>
        <p className="muted">{t('classJoin.lead')}</p>
        <JoinForm initial={kod} />
      </div>
    </div>
  )
}
