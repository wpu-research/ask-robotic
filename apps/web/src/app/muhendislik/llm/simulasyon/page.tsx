import type { Metadata } from 'next'
import Link from 'next/link'
import { LlmSimBox } from '@/components/llm/llm-sim-box'
import { LLM_SIM_META, type LlmSimId } from '@/components/llm/sim-meta'
import { Icon } from '@/components/shell/icons'
import { getLocale } from '@/i18n/server'
import { LLM_COURSE, UNITS } from '@/lib/llm/course'

export const metadata: Metadata = { title: 'LLM simülasyonları' }

export default async function LlmSimulasyonlar() {
  const lang = await getLocale()
  const en = lang === 'en'
  const ids = Object.keys(LLM_SIM_META) as LlmSimId[]
  return (
    <div className="page eng rb">
      <nav aria-label={en ? 'Breadcrumb' : 'Konum'} className="crumbs">
        <Link href="/muhendislik">{en ? 'Engineering path' : 'Mühendislik yolu'}</Link><Icon name="chevronRight" size={14} />
        <Link href="/muhendislik/llm">{LLM_COURSE[lang].title}</Link><Icon name="chevronRight" size={14} />
        <span aria-current="page">{en ? 'Simulations' : 'Simülasyonlar'}</span>
      </nav>
      <header className="page-title">
        <h1>{en ? 'LLM simulations' : 'LLM simülasyonları'}</h1>
        <p className="lead">{LLM_COURSE[lang].teaching}</p>
      </header>
      <div className="rb-sims">
        {ids.map((id) => {
          const u = UNITS.find((x) => x.sims.includes(id))
          return (
            <div key={id}>
              <LlmSimBox id={id} lang={lang} />
              {u && <p className="muted rb-small"><Link href={`/muhendislik/llm/unite/${u.n}`}>{en ? `Unit ${u.n}` : `${u.n}. ünite`}: {u[lang].title}</Link></p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
