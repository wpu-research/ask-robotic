import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CodeBlock } from '@/components/robotik/code-block'
import { Quiz } from '@/components/robotik/quiz'
import { SimBox } from '@/components/robotik/sim-box'
import { Icon } from '@/components/shell/icons'
import { getLocale } from '@/i18n/server'
import { labHref, partText } from '@/lib/muhendislik/catalog'
import { COURSE, WEEKS, WOKWI, kitPartsOf, partsOf, weekOf } from '@/lib/robotik/course'
import { courseKitOf } from '@/lib/robotik/kits'
import { milestonesOfWeek } from '@/lib/robotik/projects'

export async function generateMetadata({ params }: { params: Promise<{ n: string }> }): Promise<Metadata> {
  const w = weekOf(Number((await params).n))
  const lang = await getLocale()
  return { title: w ? `${COURSE.code} · ${w[lang].title}` : COURSE.code }
}

export default async function Hafta({ params }: { params: Promise<{ n: string }> }) {
  const w = weekOf(Number((await params).n))
  if (!w) notFound()
  const lang = await getLocale()
  const en = lang === 'en'
  const t = w[lang]
  const prev = weekOf(w.n - 1), next = weekOf(w.n + 1)
  const parts = partsOf(w), kits = kitPartsOf(w)
  const ck = w.courseKit ? courseKitOf(w.courseKit) : undefined
  const steps = milestonesOfWeek(w.n)
  return (
    <div className="page eng rb">
      <nav aria-label={en ? 'Breadcrumb' : 'Konum'} className="crumbs">
        <Link href="/muhendislik">{en ? 'Engineering path' : 'Mühendislik yolu'}</Link><Icon name="chevronRight" size={14} />
        <Link href="/muhendislik/robotik">{COURSE.code}</Link><Icon name="chevronRight" size={14} />
        <span aria-current="page">{en ? `Week ${w.n}` : `${w.n}. hafta`}</span>
      </nav>
      <div className="rb-week">
        <nav className="rb-side" aria-label={en ? 'Weeks' : 'Haftalar'}>
          <ol>
            {WEEKS.map((x) => (
              <li key={x.n}>
                <Link href={`/muhendislik/robotik/hafta/${x.n}`} className={x.n === w.n ? 'on' : undefined} aria-current={x.n === w.n ? 'page' : undefined}>
                  <span className="k">{x.n}</span><span>{x[lang].title}</span>
                </Link>
              </li>
            ))}
          </ol>
        </nav>
        <article className="rb-art">
          <p className="rb-of">{en ? `Week ${w.n} of ${WEEKS.length}` : `${w.n}. hafta / ${WEEKS.length}`}</p>
          <h1>{t.title}</h1>
          <p className="rb-tools">{en ? 'Tools' : 'Araçlar'}: {t.tools}</p>

          <h2>{w.exam ? (en ? 'What to prepare' : 'Neye hazırlanmalı') : (en ? 'By the end of this week you can' : 'Bu haftanın sonunda')}</h2>
          <ul className="eng-list">{t.goals.map((g) => <li key={g}>{g}</li>)}</ul>


          <h2>{w.exam ? (en ? 'Exam guide' : 'Sınav rehberi') : (en ? 'Lecture notes' : 'Ders notları')}</h2>
          {/* İçerik ders notlarıdır (weeks.json, depoda); kullanıcı girdisi değildir. */}
          <div className="rb-prose" dangerouslySetInnerHTML={{ __html: t.notes }} />

          {t.deep && (
            <>
              <h2>{en ? (w.exam ? 'Worked solutions' : 'Going deeper') : (w.exam ? 'Çözümlü örnekler' : 'Derinlemesine')}</h2>
              <div className="rb-prose" dangerouslySetInnerHTML={{ __html: t.deep }} />
            </>
          )}

          {w.sims.length > 0 && (
            <>
              <h2>{w.exam ? (en ? 'Review simulations' : 'Tekrar simülasyonları') : en ? (w.sims.length > 1 ? 'Simulations' : 'Simulation') : (w.sims.length > 1 ? 'Simülasyonlar' : 'Simülasyon')}</h2>
              <div className="rb-sims">{w.sims.map((id) => <SimBox key={id} id={id} lang={lang} cfg={w.simCfg[id]} />)}</div>
            </>
          )}

          {t.code.length > 0 && (
            <>
              <h2>{en ? 'Code' : 'Kod'}</h2>
              {t.code.map((c) => <CodeBlock key={c.title} title={c.title} src={c.src} lang={lang} />)}
            </>
          )}

          {t.pitfalls.length > 0 && (
            <section className="rb-pitfalls" aria-labelledby="rb-pit">
              <h2 id="rb-pit">{en ? 'Common mistakes' : 'Sık yapılan hatalar'}</h2>
              <ul>{t.pitfalls.map((x) => <li key={x}>{x}</li>)}</ul>
            </section>
          )}
          {t.se && (
            <section className="rb-se" aria-labelledby="rb-se">
              <h2 id="rb-se">{en ? 'Software engineering connection' : 'Yazılım mühendisliği bağlantısı'}</h2>
              <div className="rb-prose" dangerouslySetInnerHTML={{ __html: t.se }} />
            </section>
          )}

          {ck && (
            <section className="eng-labbox rb-kitbox" aria-labelledby="rb-kit">
              <h2 id="rb-kit">{en ? 'In the lab' : 'Laboratuvarda'}: {en ? ck.en.title : ck.title}</h2>
              <p>{en ? ck.en.watch : ck.watch}</p>
              <Link className="btn btn-primary" href={`/laboratuvar?kit=${w.courseKit}`} data-testid="rb-open-kit">{en ? 'Open in the lab' : 'Laboratuvarda aç'} <Icon name="arrowRight" size={16} /></Link>
            </section>
          )}

          {(t.lab || kits.length > 0 || w.wokwi.length > 0) && (
            <section className="rb-box">
              <h3>{en ? 'Lab task' : 'Laboratuvar görevi'}</h3>
              {t.lab && <p>{t.lab}</p>}
              {(kits.length > 0 || w.wokwi.length > 0) && (
                <ul className="rb-links">
                  {kits.map((p) => <li key={p.slug}><Link href={labHref(p)!}>{en ? 'Open in our lab' : 'Laboratuvarda aç'}: {partText(p, lang).name}</Link></li>)}
                  {w.wokwi.map((b) => <li key={b}><a href={WOKWI[b].href} target="_blank" rel="noreferrer">{WOKWI[b][lang]}</a></li>)}
                </ul>
              )}
            </section>
          )}
          {t.quiz.length > 0 && <Quiz key={`${w.n}-${lang}`} items={t.quiz} lang={lang} />}

          {steps.length > 0 && (
            <section className="rb-proj-step" aria-labelledby="rb-ps">
              <h3 id="rb-ps">{en ? 'Term project this week' : 'Bu hafta dönem projesinde'}</h3>
              <ul>{steps.map(({ project, m }) => <li key={project.slug}><Link href={`/muhendislik/robotik/proje/${project.slug}`}><b>{project[lang].title}</b></Link>: {m[lang].title}. {m[lang].deliver}</li>)}</ul>
            </section>
          )}
          {t.hw && <section className="rb-box rb-box-hw"><h3>{en ? 'Homework' : 'Ödev'}</h3><p>{t.hw}</p></section>}

          {parts.length > 0 && (
            <section className="rb-hw-box" aria-labelledby="rb-hw">
              <h2 id="rb-hw">{en ? 'Hardware this week (Hyvex)' : 'Bu haftanın donanımı (Hyvex)'}</h2>
              <ul className="eng-chips">
                {parts.map((p) => (
                  <li key={p.slug}><Link className="eng-chip" href={`/muhendislik/parca/${p.slug}`}><span className="eng-chip-lv">{en ? 'L' : 'S'}{p.level}</span>{partText(p, lang).name}</Link></li>
                ))}
              </ul>
            </section>
          )}

          <nav className="rb-pager" aria-label={en ? 'Weeks' : 'Haftalar'}>
            {prev ? <Link href={`/muhendislik/robotik/hafta/${prev.n}`}><small>{en ? 'Previous week' : 'Önceki hafta'}</small>{prev[lang].title}</Link> : <span />}
            {next ? <Link href={`/muhendislik/robotik/hafta/${next.n}`} className="r"><small>{en ? 'Next week' : 'Sonraki hafta'}</small>{next[lang].title}</Link> : <span />}
          </nav>
        </article>
      </div>
    </div>
  )
}
