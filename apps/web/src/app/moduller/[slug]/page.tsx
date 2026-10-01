import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getDb } from '@/lib/db'
import { getModuleTree } from '@/lib/content'
import { MODULE_META, TRACKS } from '@/lib/module-meta'
import { hours } from '@/lib/summaries'
import { ContinueButton, LessonCheck, ProgressBar } from '@/components/progress'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const tree = await getModuleTree(getDb(), slug).catch(() => null)
  return { title: tree?.module.title ?? 'Modül' }
}

export default async function ModulSayfasi({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const tree = await getModuleTree(getDb(), slug)
  if (!tree) notFound()
  const { module: m } = tree
  const meta = MODULE_META[m.slug]
  const all = tree.weeks.flatMap((w) => w.lessons)
  const minutes = all.reduce((n, l) => n + l.durationMin, 0)

  return (
    <div className={`container track-${m.track}`}>
      <div className="page-head">
        <p className="crumbs"><Link href="/moduller">Modüller</Link> / {m.title}</p>
        <div className="card-top" style={{ justifyContent: 'flex-start', gap: 12, marginBottom: 10 }}>
          <span className="step-no">MODÜL {m.position}</span>
          <span className="chip chip-track">{TRACKS[m.track].label}</span>
        </div>
        <h1>{m.title}</h1>
        <p className="muted" style={{ fontSize: '1.1rem', maxWidth: '60ch' }}>{meta?.tagline}</p>
        <div className="meta" style={{ marginBottom: 18 }}>
          <span>{all.length} ders</span><span>{tree.weeks.length} hafta</span><span>~{hours(minutes)}</span>
          {meta?.audience && <span>Kimler için: {meta.audience}</span>}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', maxWidth: 560 }}>
          <ContinueButton lessonIds={all.map((l) => l.id)} className="btn btn-primary btn-lg" />
          <div style={{ flex: 1, minWidth: 200 }}><ProgressBar ids={all.map((l) => l.id)} /></div>
        </div>
        {meta?.callout && <div className="callout"><b>Bilmen gerekenler</b>{meta.callout}</div>}
      </div>

      <div style={{ paddingBottom: 56 }}>
        {tree.weeks.map((w) => (
          <section key={w.id} className="week">
            <div className="week-head">
              <span className="week-no">{w.position}. hafta</span>
              <h3>{w.title}</h3>
              {w.project && <span className="chip">Proje: {w.project}</span>}
              <div style={{ marginLeft: 'auto', width: 150 }}><ProgressBar ids={w.lessons.map((l) => l.id)} /></div>
            </div>
            <ol className="lessons">
              {w.lessons.map((l, i) => (
                <li key={l.id} className="lesson-row">
                  <Link href={`/ders/${l.id}`}>
                    <span className="lesson-n">{i + 1}</span>
                    <span className="lesson-title">{l.title}{/^(Proje|Bitirme)/.test(l.title) && <> <span className="project-badge">proje</span></>}</span>
                    <span className="lesson-dur">{l.durationMin} dk</span>
                    <LessonCheck id={l.id} />
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </div>
  )
}
