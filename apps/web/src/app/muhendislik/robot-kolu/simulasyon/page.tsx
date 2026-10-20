import type { Metadata } from 'next'
import Link from 'next/link'
import { RobotSimBox } from '@/components/robot-kolu/robot-sim-box'
import { ROBOT_SIM_META, type RobotSimId } from '@/components/robot-kolu/sim-meta'
import { Icon } from '@/components/shell/icons'
import { getLocale } from '@/i18n/server'
import { ROBOT_COURSE, UNITS } from '@/lib/robot-kolu/course'

export const metadata: Metadata = { title: 'Robot kolu simülasyonları' }

export default async function RobotKoluSimulasyonlar() {
  const lang = await getLocale()
  const en = lang === 'en'
  const ids = Object.keys(ROBOT_SIM_META) as RobotSimId[]
  return (
    <div className="page eng rb">
      <nav aria-label={en ? 'Breadcrumb' : 'Konum'} className="crumbs">
        <Link href="/muhendislik">{en ? 'Engineering path' : 'Mühendislik yolu'}</Link><Icon name="chevronRight" size={14} />
        <Link href="/muhendislik/robot-kolu">{ROBOT_COURSE[lang].title}</Link><Icon name="chevronRight" size={14} />
        <span aria-current="page">{en ? 'Simulations' : 'Simülasyonlar'}</span>
      </nav>
      <header className="page-title">
        <h1>{en ? 'Robot arm simulations' : 'Robot kolu simülasyonları'}</h1>
        <p className="lead">{en ? 'Eight 3D simulations of a virtual six-axis arm (metres, degrees). Results are deterministic: the same settings always give the same motion.' : 'Sanal altı eksenli kolun sekiz 3B simülasyonu (metre, derece). Sonuçlar deterministiktir: aynı ayar her zaman aynı hareketi verir.'}</p>
        <p className="lm-teach">{ROBOT_COURSE[lang].teaching}</p>
      </header>
      <div className="rb-sims">
        {ids.map((id) => {
          const u = UNITS.find((x) => x.sims.includes(id))
          return (
            <div key={id}>
              <RobotSimBox id={id} lang={lang} cfg={u?.simCfg?.[id]} />
              {u && <p className="muted rb-small"><Link href={`/muhendislik/robot-kolu/unite/${u.n}`}>{en ? `Unit ${u.n}` : `${u.n}. ünite`}: {u[lang].title}</Link></p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
