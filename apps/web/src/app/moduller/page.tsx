import type { Metadata } from 'next'
import { getDb } from '@/lib/db'
import { getModuleSummaries } from '@/lib/summaries'
import { TRACKS, UPCOMING, type TrackKey } from '@/lib/module-meta'
import { ModuleCard } from '@/components/module-card'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Modüller' }

export default async function Moduller() {
  const mods = await getModuleSummaries(getDb()).catch(() => [])
  const tracks = (['cocuk', 'maker', 'ai'] as TrackKey[])
  return (
    <div className="container">
      <div className="page-head">
        <p className="eyebrow">Müfredat</p>
        <h1>Modüller</h1>
        <p className="muted">İstediğin modülden başlayabilirsin. İlerlemen bu tarayıcıda saklanır.</p>
      </div>
      {tracks.map((t) => {
        const own = mods.filter((m) => m.track === t)
        const soon = UPCOMING.filter((u) => u.track === t && !mods.some((m) => m.slug === u.slug))
        if (!own.length && !soon.length) return null
        return (
          <section key={t} className="section" style={{ paddingTop: 24 }}>
            <h2>{TRACKS[t].label}</h2>
            <p className="muted">{TRACKS[t].hint}</p>
            <div className="grid" style={{ marginTop: 16 }}>
              {own.map((m) => <ModuleCard key={m.id} m={m} />)}
              {soon.map((u) => (
                <div key={u.slug} className={`card card-soon track-${u.track}`}>
                  <div className="card-top"><span className="step-no">YAKINDA</span><span className="chip">{u.status}</span></div>
                  <h3>{u.title}</h3>
                </div>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
