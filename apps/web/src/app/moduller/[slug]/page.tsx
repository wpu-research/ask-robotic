import { notFound } from 'next/navigation'
import { getDb } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth/current'
import { getCompletedLessonIds, getModuleTree } from '@/lib/content'

export const dynamic = 'force-dynamic'

export default async function ModulSayfasi({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const db = getDb()
  const tree = await getModuleTree(db, slug)
  if (!tree) notFound()
  const user = await getCurrentUser()
  const all = tree.weeks.flatMap((w) => w.lessons)
  const done = user ? await getCompletedLessonIds(db, user.id, all.map((l) => l.id)) : new Set<number>()

  return (
    <main style={{ maxWidth: 720, margin: '8vh auto', padding: '0 16px' }}>
      <p><a href="/moduller">← Modüller</a></p>
      <h1>{tree.module.title}</h1>
      {user && <p style={{ color: '#666' }}>{done.size} / {all.length} ders tamamlandı</p>}
      {!user && <p><a href="/giris">Giriş yap</a> ya da <a href="/kayit">kayıt ol</a>, derslere başlamak için.</p>}
      {tree.weeks.map((w) => (
        <section key={w.id} style={{ marginBottom: 24 }}>
          <h2 style={{ marginBottom: 4 }}>{w.position}. Hafta: {w.title}</h2>
          {w.project && <div style={{ color: '#666', marginBottom: 8 }}>Proje: {w.project}</div>}
          <ol style={{ paddingLeft: 20 }}>
            {w.lessons.map((l) => (
              <li key={l.id} style={{ margin: '6px 0' }}>
                <a href={`/ders/${l.id}`}>{l.title}</a> <span style={{ color: '#666' }}>· {l.durationMin} dk</span>
                {done.has(l.id) && <span aria-label="tamamlandı"> ✓</span>}
              </li>
            ))}
          </ol>
        </section>
      ))}
    </main>
  )
}
