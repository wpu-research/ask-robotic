import type { Metadata } from 'next'
import { getCatalog } from '@/lib/catalog'
import { getDb } from '@/lib/db'
import { TRACKS, UPCOMING, type TrackKey } from '@/lib/module-meta'
import { ModuleCard, SoonCard } from '@/components/module-card'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Modüller' }

export default async function Moduller() {
  const catalog = await getCatalog(getDb()).catch(() => [])
  const tracks: TrackKey[] = ['cocuk', 'maker', 'ai']
  return (
    <div className="page">
      <header className="page-title">
        <h1>Modüller</h1>
        <p className="muted">İstediğin modülden başlayabilirsin. İlerlemen bu tarayıcıda saklanır.</p>
      </header>
      {catalog.length === 0 && <div className="panel"><p>Modüller yüklenemedi. Veritabanı bağlantısını kontrol et.</p></div>}
      {tracks.map((t) => {
        const own = catalog.filter((m) => m.track === t)
        const soon = UPCOMING.filter((u) => u.track === t && !catalog.some((m) => m.slug === u.slug))
        if (!own.length && !soon.length) return null
        return (
          <section key={t} aria-labelledby={`hat-${t}`} className="track-section">
            <h2 id={`hat-${t}`} className="section-title">{TRACKS[t].label} <small>{TRACKS[t].hint}</small></h2>
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
