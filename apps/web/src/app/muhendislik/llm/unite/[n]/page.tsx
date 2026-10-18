import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { LlmSimBox } from '@/components/llm/llm-sim-box'
import { CodeBlock } from '@/components/robotik/code-block'
import { Quiz } from '@/components/robotik/quiz'
import { Icon } from '@/components/shell/icons'
import { getLocale } from '@/i18n/server'
import { LLM_COURSE, UNITS, unitOf } from '@/lib/llm/course'
import { CAPSTONE } from '@/lib/llm/project'

export const dynamicParams = false
export const generateStaticParams = () => UNITS.map((u) => ({ n: String(u.n) }))

export async function generateMetadata({ params }: { params: Promise<{ n: string }> }): Promise<Metadata> {
  const u = unitOf(Number((await params).n))
  const lang = await getLocale()
  return { title: u ? `${LLM_COURSE[lang].title} · ${u[lang].title}` : LLM_COURSE[lang].title }
}

export default async function Unite({ params }: { params: Promise<{ n: string }> }) {
  const u = unitOf(Number((await params).n))
  if (!u) notFound()
  const lang = await getLocale()
  const en = lang === 'en'
  const t = u[lang]
  const prev = unitOf(u.n - 1), next = unitOf(u.n + 1)
  const steps = CAPSTONE.deliverables.filter((d) => d.afterUnit === u.n)
  return (
    <div className="page eng rb">
      <nav aria-label={en ? 'Breadcrumb' : 'Konum'} className="crumbs">
        <Link href="/muhendislik">{en ? 'Engineering path' : 'Mühendislik yolu'}</Link><Icon name="chevronRight" size={14} />
        <Link href="/muhendislik/llm">{LLM_COURSE[lang].title}</Link><Icon name="chevronRight" size={14} />
        <span aria-current="page">{en ? `Unit ${u.n}` : `${u.n}. ünite`}</span>
      </nav>
      <div className="rb-week">
        <nav className="rb-side" aria-label={en ? 'Units' : 'Üniteler'}>
          <ol>
            {UNITS.map((x) => (
              <li key={x.n}>
                <Link href={`/muhendislik/llm/unite/${x.n}`} className={x.n === u.n ? 'on' : undefined} aria-current={x.n === u.n ? 'page' : undefined}>
                  <span className="k">{x.n}</span><span>{x[lang].title}</span>
                </Link>
              </li>
            ))}
            <li><Link href="/muhendislik/llm/proje"><span className="k">★</span><span>{en ? 'Capstone project' : 'Bitirme projesi'}</span></Link></li>
          </ol>
        </nav>
        <article className="rb-art">
          <p className="rb-of">{en ? `Unit ${u.n} of ${UNITS.length} · ${LLM_COURSE.hours / UNITS.length} hours` : `${u.n}. ünite / ${UNITS.length} · ${LLM_COURSE.hours / UNITS.length} saat`}</p>
          <h1>{t.title}</h1>
          <p className="lead">{t.summary}</p>

          <h2>{en ? 'By the end of this unit you can' : 'Bu ünitenin sonunda'}</h2>
          <ul className="eng-list">{t.goals.map((g) => <li key={g}>{g}</li>)}</ul>

          <h2>{en ? 'Notes' : 'Ders notları'}</h2>
          {/* İçerik ders notlarıdır (lib/llm, depoda); kullanıcı girdisi değildir. */}
          <div className="rb-prose" dangerouslySetInnerHTML={{ __html: t.notes }} />

          <h2>{en ? 'Simulation' : 'Simülasyon'}</h2>
          <p className="lm-teach">{LLM_COURSE[lang].teaching}</p>
          <div className="rb-sims">
            {u.sims.map((id) => <LlmSimBox key={id} id={id} lang={lang} />)}
          </div>
          <section className="rb-box">
            <h3>{en ? 'Try it yourself' : 'Kendin dene'}</h3>
            <p>{t.lab}</p>
          </section>

          <h2>{en ? 'Code' : 'Kod'}</h2>
          <p className="muted rb-small">{en ? 'Run these on your own computer. The key is read from the ANTHROPIC_API_KEY environment variable; never write it in code.' : 'Bunları kendi bilgisayarında çalıştır. Anahtar ANTHROPIC_API_KEY ortam değişkeninden okunur; koda asla yazma.'}</p>
          {t.code.map((c) => <CodeBlock key={c.title} title={c.title} src={c.src} lang={lang} />)}

          <section className="rb-pitfalls" aria-labelledby="lm-pit">
            <h2 id="lm-pit">{en ? 'Common mistakes' : 'Sık yapılan hatalar'}</h2>
            <ul>{t.pitfalls.map((x) => <li key={x}>{x}</li>)}</ul>
          </section>
          <section className="rb-se" aria-labelledby="lm-se">
            <h2 id="lm-se">{en ? 'Software engineering connection' : 'Yazılım mühendisliği bağlantısı'}</h2>
            <div className="rb-prose" dangerouslySetInnerHTML={{ __html: t.se }} />
          </section>

          <Quiz key={`llm-${u.n}-${lang}`} items={t.quiz} lang={lang} />

          {steps.length > 0 && (
            <section className="rb-proj-step" aria-labelledby="lm-ps">
              <h3 id="lm-ps">{en ? 'Capstone after this unit' : 'Bu üniteden sonra bitirme projesinde'}</h3>
              <ul>{steps.map((d) => <li key={d.afterUnit}><Link href="/muhendislik/llm/proje"><b>{d[lang].title}</b></Link>: {d[lang].deliver}</li>)}</ul>
            </section>
          )}

          {u.related.length > 0 && (
            <section className="rb-hw-box" aria-labelledby="lm-rel">
              <h2 id="lm-rel">{en ? 'Related on Macademia' : 'Macademia\'da ilgili'}</h2>
              <ul className="rb-links">{u.related.map((r) => <li key={r.href + r.tr}><Link href={r.href}>{r[lang]}</Link></li>)}</ul>
            </section>
          )}

          <nav className="rb-pager" aria-label={en ? 'Units' : 'Üniteler'}>
            {prev ? <Link href={`/muhendislik/llm/unite/${prev.n}`}><small>{en ? 'Previous unit' : 'Önceki ünite'}</small>{prev[lang].title}</Link> : <span />}
            {next
              ? <Link href={`/muhendislik/llm/unite/${next.n}`} className="r"><small>{en ? 'Next unit' : 'Sonraki ünite'}</small>{next[lang].title}</Link>
              : <Link href="/muhendislik/llm/proje" className="r"><small>{en ? 'Next' : 'Sıradaki'}</small>{CAPSTONE[lang].title}</Link>}
          </nav>
        </article>
      </div>
    </div>
  )
}
