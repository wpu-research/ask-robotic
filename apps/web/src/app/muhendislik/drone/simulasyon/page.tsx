import type { Metadata } from 'next'
import Link from 'next/link'
import { DroneSimBox } from '@/components/drone/drone-sim-box'
import { DRONE_SIM_META, type DroneSimId } from '@/components/drone/sim-meta'
import { Icon } from '@/components/shell/icons'
import { getLocale } from '@/i18n/server'
import { DRONE_COURSE, UNITS } from '@/lib/drone/course'

export const metadata: Metadata = { title: 'Drone simülasyonları' }

export default async function DroneSimulasyonlar() {
  const lang = await getLocale()
  const en = lang === 'en'
  const ids = Object.keys(DRONE_SIM_META) as DroneSimId[]
  return (
    <div className="page eng rb">
      <nav aria-label={en ? 'Breadcrumb' : 'Konum'} className="crumbs">
        <Link href="/muhendislik">{en ? 'Engineering path' : 'Mühendislik yolu'}</Link><Icon name="chevronRight" size={14} />
        <Link href="/muhendislik/drone">{DRONE_COURSE[lang].title}</Link><Icon name="chevronRight" size={14} />
        <span aria-current="page">{en ? 'Simulations' : 'Simülasyonlar'}</span>
      </nav>
      <header className="page-title">
        <h1>{en ? 'Drone simulations' : 'Drone simülasyonları'}</h1>
        <p className="lead">{en ? 'Seven simulations with real units (SI; propellers in inches, batteries in mAh, thrust in gram-force). Results are deterministic: the same settings always give the same curve, noise included.' : 'Gerçek birimli yedi simülasyon (SI; pervane inç, batarya mAh, itki gram-kuvvet). Sonuçlar deterministiktir: aynı ayar, gürültüsü dahil her zaman aynı eğriyi verir.'}</p>
      </header>
      <div className="rb-sims">
        {ids.map((id) => {
          const u = UNITS.find((x) => x.sims.includes(id))
          return (
            <div key={id}>
              <DroneSimBox id={id} lang={lang} />
              {u && <p className="muted rb-small"><Link href={`/muhendislik/drone/unite/${u.n}`}>{en ? `Unit ${u.n}` : `${u.n}. ünite`}: {u[lang].title}</Link></p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
