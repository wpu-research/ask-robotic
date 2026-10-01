import { getDb } from '@/lib/db'
import { listModules } from '@/lib/content'

export const dynamic = 'force-dynamic'

export default async function Moduller() {
  const mods = await listModules(getDb())
  return (
    <main style={{ maxWidth: 720, margin: '8vh auto', padding: '0 16px' }}>
      <h1>Modüller</h1>
      {mods.length === 0 && <p>Henüz yayınlanmış modül yok.</p>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {mods.map((m) => (
          <li key={m.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16, marginBottom: 12 }}>
            <a href={`/moduller/${m.slug}`} style={{ fontSize: 18, fontWeight: 600 }}>{m.title}</a>
            {m.minAge ? <div style={{ color: '#666' }}>{m.minAge}+ yaş</div> : null}
          </li>
        ))}
      </ul>
      <p><a href="/">← Ana sayfa</a></p>
    </main>
  )
}
