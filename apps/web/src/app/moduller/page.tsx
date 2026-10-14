import type { Metadata } from 'next'
import { getCatalog } from '@/lib/catalog'
import { getDb } from '@/lib/db'
import { UPCOMING, type TrackKey } from '@/lib/module-meta'
import { getT } from '@/i18n/server'
import { ModuleCard, SoonCard } from '@/components/module-card'

export const dynamic = 'force-dynamic'
export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())('moduleView.metaTitle') }
}

export default async function Moduller() {
  const catalog = await getCatalog(getDb()).catch(() => [])
  const tr = await getT()
  const tracks: TrackKey[] = ['cocuk', 'maker', 'ai']
  return (
    <div className="page">
      <header className="page-title">
        <h1>{tr('moduleView.listTitle')}</h1>
        <p className="muted">{tr('moduleView.listIntro')}</p>
      </header>
      {catalog.length === 0 && <div className="panel"><p>{tr('moduleView.listError')}</p></div>}
      {tracks.map((t) => {
        const own = catalog.filter((m) => m.track === t)
        const soon = UPCOMING.filter((u) => u.track === t && !catalog.some((m) => m.slug === u.slug))
        if (!own.length && !soon.length) return null
        return (
          <section key={t} aria-labelledby={`hat-${t}`} className="track-section">
            <h2 id={`hat-${t}`} className="section-title">{tr(`moduleView.track.${t}`)} <small>{tr(`moduleView.trackHint.${t}`)}</small></h2>
            <div className="mgrid">
              {own.map((m) => <ModuleCard key={m.id} m={m} />)}
              {soon.map((u) => <SoonCard key={u.slug} u={u} />)}
            </div>
          </section>
        )
      })}
    </div>
  )
}
