import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DemoView } from '@/components/cv-demo/demo-view'
import { PyCode } from '@/components/cv-demo/py-code'
import { Icon } from '@/components/shell/icons'
import { getLocale } from '@/i18n/server'
import { pyFor } from '@/lib/cv-demo-logic'
import { DEMO_TEXT, DEMOS, demoOf, MODEL_LABEL, SECTOR_LABEL } from '@/lib/cv-demolar'

export const dynamicParams = false
export const generateStaticParams = () => DEMOS.map((d) => ({ slug: d.slug }))
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const d = demoOf((await params).slug), lang = await getLocale()
  return d ? { title: `${d[lang].title} · ${DEMO_TEXT[lang].title}`, description: d[lang].tagline } : {}
}

/** Tek demo: canlı sahne (örnek / kamera), nasıl çalışıyor, kendin dene, Python karşılığı. */
export default async function DemoSayfasi({ params }: { params: Promise<{ slug: string }> }) {
  const d = demoOf((await params).slug)
  if (!d) notFound()
  const lang = await getLocale(), T = DEMO_TEXT[lang], t = d[lang]
  const i = DEMOS.indexOf(d), prev = DEMOS[i - 1], next = DEMOS[i + 1]
  return (
    <div className="page cvd-page">
      <header className="page-title">
        <nav aria-label={lang === 'tr' ? 'Konum' : 'Breadcrumb'} className="crumbs">
          <Link href="/robotun-gozleri/demolar">{T.title}</Link><Icon name="chevronRight" size={14} /><span aria-current="page">{t.title}</span>
        </nav>
        <p className="eyebrow">{SECTOR_LABEL[d.sector][lang]} · {MODEL_LABEL[d.model][lang]}</p>
        <h1>{d.emoji} {t.title}</h1>
        <p className="lead">{t.tagline}</p>
      </header>
      <p className="cvd-intro">{t.intro}</p>
      {t.note && <p className="cvd-note" role="note"><b>{T.note}:</b> {t.note}</p>}
      <DemoView slug={d.slug} lang={lang} />
      <p className="cvd-sample-note muted">{t.sample}</p>
      <div className="cvd-explain">
        <section aria-labelledby="cvd-how">
          <h2 id="cvd-how">{T.how}</h2>
          <ol className="cvd-steps">{t.steps.map((s) => <li key={s}>{s}</li>)}</ol>
        </section>
        <section aria-labelledby="cvd-task" className="cvd-task">
          <h2 id="cvd-task">{T.task}</h2>
          <p>{t.task}</p>
        </section>
      </div>
      <section aria-labelledby="cvd-code">
        <h2 id="cvd-code">{T.code}</h2>
        <PyCode code={pyFor(d.py, lang)} title={`${d.slug.replace(/-/g, '_')}.py`} />
      </section>
      <p className="cvd-privacy">🔒 {T.privacy}</p>
      <nav className="cvd-pager" aria-label={T.all}>
        {prev ? <Link href={`/robotun-gozleri/demolar/${prev.slug}`} className="btn btn-outline">← {prev[lang].title}</Link> : <Link href="/robotun-gozleri/demolar" className="btn btn-outline">← {T.all}</Link>}
        {next ? <Link href={`/robotun-gozleri/demolar/${next.slug}`} className="btn btn-primary">{next[lang].title} →</Link> : <Link href="/robotun-gozleri/demolar" className="btn btn-primary">{T.all} →</Link>}
      </nav>
    </div>
  )
}
