import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { LessonMarkdown } from '@/app/ders/[id]/lesson-markdown'
import { PartViewLogger } from '@/components/learn/part-view-logger'
import { Icon } from '@/components/shell/icons'
import { resolveLessonKeys } from '@/lib/content'
import { getDb } from '@/lib/db'
import { guideBySlug } from '@/lib/parca-rehberi'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const g = guideBySlug((await params).slug)
  return { title: g?.title ?? 'Parça' }
}

export default async function Parca({ params }: { params: Promise<{ slug: string }> }) {
  const g = guideBySlug((await params).slug)
  if (!g) notFound()
  // Veritabanı kapalıysa sayfa yine açılır; yalnız ilgili ders bağlantıları görünmez.
  const lessons = await resolveLessonKeys(getDb(), g.relatedLessons).catch(() => [])
  return (
    <div className="page part-page">
      <PartViewLogger slug={g.slug} />
      <nav aria-label="Konum" className="crumbs"><Link href="/parcalar">Parçalar</Link><Icon name="chevronRight" size={14} /><span aria-current="page">{g.title}</span></nav>
      <header className="page-title">
        <span className="chip">{g.category}</span>
        <h1>{g.title}</h1>
        <p className="lead">{g.summary}</p>
        <p><Link className="btn btn-primary btn-sm" href="/laboratuvar">Laboratuvarda dene</Link></p>
      </header>

      <div className="part-layout">
        <div className="part-main">
          <section aria-labelledby="p-nasil"><h2 id="p-nasil">Nasıl çalışır?</h2><LessonMarkdown>{g.howItWorksMd}</LessonMarkdown></section>
          <section aria-labelledby="p-bagla"><h2 id="p-bagla">Laboratuvarda nasıl bağlanır?</h2><LessonMarkdown>{g.wiringMd}</LessonMarkdown></section>
          <section aria-labelledby="p-hata"><h2 id="p-hata">Sık yapılan hatalar</h2><LessonMarkdown>{g.commonMistakesMd}</LessonMarkdown></section>
        </div>
        <aside className="part-side">
          <section className="panel" aria-labelledby="p-pin">
            <h2 id="p-pin" className="panel-title">Pinler</h2>
            <dl className="pin-list">
              {g.pins.map((p) => (<div key={p.name}><dt><code>{p.name}</code></dt><dd>{p.description}</dd></div>))}
            </dl>
          </section>
          <section className="panel" aria-labelledby="p-deger">
            <h2 id="p-deger" className="panel-title">Tipik değerler</h2>
            <dl className="value-list">
              {g.typicalValues.map((v) => (<div key={v.label}><dt>{v.label}</dt><dd><b>{v.value}</b>{v.note && <small>{v.note}</small>}</dd></div>))}
            </dl>
          </section>
          {lessons.length > 0 && (
            <section className="panel" aria-labelledby="p-ders">
              <h2 id="p-ders" className="panel-title">İlgili dersler</h2>
              <ul className="rel-lessons">
                {lessons.map((l) => (<li key={l.key}><Link href={`/ders/${l.id}`}>{l.title}</Link><small>{l.weekTitle}</small></li>))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </div>
  )
}
