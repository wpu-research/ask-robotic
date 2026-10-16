import type { Metadata } from 'next'
import Link from 'next/link'
import { SimBox } from '@/components/robotik/sim-box'
import { SIM_META, type SimId } from '@/components/robotik/sim-meta'
import { Icon } from '@/components/shell/icons'
import { getLocale } from '@/i18n/server'

export const metadata: Metadata = { title: 'Robotik simülasyonları' }

export default async function Simulasyonlar() {
  const lang = await getLocale()
  const en = lang === 'en'
  return (
    <div className="page eng">
      <nav aria-label={en ? 'Breadcrumb' : 'Konum'} className="crumbs">
        <Link href="/muhendislik">{en ? 'Engineering path' : 'Mühendislik yolu'}</Link><Icon name="chevronRight" size={14} />
        <Link href="/muhendislik/robotik">ESOF 323</Link><Icon name="chevronRight" size={14} />
        <span aria-current="page">{en ? 'Simulations' : 'Simülasyonlar'}</span>
      </nav>
      <header className="page-title">
        <h1>{en ? 'Simulations' : 'Simülasyonlar'}</h1>
        <p className="lead">{en ? 'Every simulation of the course, running in your browser with no installation.' : 'Dersin tüm simülasyonları; kurulum gerekmeden tarayıcında çalışır.'}</p>
      </header>
      {(Object.keys(SIM_META) as SimId[]).map((id) => <SimBox key={id} id={id} lang={lang} />)}
    </div>
  )
}
