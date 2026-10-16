import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getLocale } from '@/i18n/server'
import { LESSONS, lessonBySlug } from '@/lib/ml/lessons'
import { ML_TEXT } from '@/lib/ml/text'
import { MlPlayer } from '@/components/ml/ml-player'
import { Icon } from '@/components/shell/icons'
import '../ml.css'

export function generateStaticParams() { return LESSONS.map((l) => ({ slug: l.slug })) }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const l = lessonBySlug((await params).slug)
  const lang = await getLocale()
  return l ? { title: `${l.title[lang]} · ${ML_TEXT[lang].course}`, description: l.sub[lang] } : {}
}

/** Tek ders: hikâye, oynatıcı (sahne + kod), nasıl çalışır, neden önemli, önceki/sonraki. */
export default async function MlDers({ params }: { params: Promise<{ slug: string }> }) {
  const l = lessonBySlug((await params).slug)
  if (!l) notFound()
  const lang = await getLocale()
  const T = ML_TEXT[lang]
  const i = LESSONS.indexOf(l)
  const prev = LESSONS[i - 1], next = LESSONS[i + 1]
  return (
    <div className="page ml-page">
      <header className="page-title">
        <nav aria-label={lang === 'tr' ? 'Konum' : 'Breadcrumb'} className="crumbs">
          <Link href="/makine-ogrenmesi">{T.course}</Link><Icon name="chevronRight" size={14} /><span aria-current="page">{T.part.replace('{n}', String(l.n))}</span>
        </nav>
        <p className="eyebrow">{T.course} · {T.part.replace('{n}', String(l.n))}</p>
        <h1>{l.title[lang]}</h1>
        <p className="lead">{l.sub[lang]}</p>
      </header>
      <p className="ml-story"><b>{T.data}.</b> {l.story[lang]}</p>
      <MlPlayer slug={l.slug} />
      <p className="ml-note muted">{T.note}</p>
      <div className="ml-explain">
        <section aria-labelledby="ml-how">
          <h2 id="ml-how">{T.how2}</h2>
          <ol className="ml-how">{l.how.map((h) => <li key={h.tr}>{h[lang]}</li>)}</ol>
        </section>
        <section className="ml-why" aria-labelledby="ml-why">
          <h2 id="ml-why">{T.why}</h2>
          <p>{l.why[lang]}</p>
          <Link href="/muhendislik/robotik/hafta/11" className="mx-link">{T.related} →</Link>
        </section>
      </div>
      <nav className="ml-pager" aria-label={T.lessons}>
        {prev ? <Link href={`/makine-ogrenmesi/${prev.slug}`} className="btn btn-outline">← {prev.title[lang]}</Link> : <Link href="/makine-ogrenmesi" className="btn btn-outline">← {T.all}</Link>}
        {next ? <Link href={`/makine-ogrenmesi/${next.slug}`} className="btn btn-primary">{next.title[lang]} →</Link> : <Link href="/makine-ogrenmesi" className="btn btn-primary">{T.all} →</Link>}
      </nav>
    </div>
  )
}
