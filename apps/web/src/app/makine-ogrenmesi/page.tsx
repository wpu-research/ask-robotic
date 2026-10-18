import type { Metadata } from 'next'
import Link from 'next/link'
import { getLocale } from '@/i18n/server'
import { LESSONS } from '@/lib/ml/lessons'
import { PROJECTS } from '@/lib/ml/projeler'
import { PROJE_BOLUMU, SECTIONS } from '@/lib/ml/sections'
import { ML_TEXT } from '@/lib/ml/text'
import './ml.css'

export async function generateMetadata(): Promise<Metadata> {
  const T = ML_TEXT[await getLocale()]
  return { title: T.title, description: T.lead }
}

/** Makine Öğrenmesi (sıfırdan) kurs sayfası: Macademia bölüm düzeni; dersler bölüm bölüm, her bölümün başında kısa tanıtım. */
export default async function MakineOgrenmesi() {
  const lang = await getLocale()
  const T = ML_TEXT[lang]
  return (
    <div className="page ml-page">
      <header className="page-title">
        <p className="eyebrow">{T.eyebrow}</p>
        <h1>{T.title}</h1>
        <p className="lead">{T.lead}</p>
        <div className="hero-actions">
          <Link className="btn btn-primary" href={`/makine-ogrenmesi/${LESSONS[0].slug}`}>{T.start}</Link>
          <span className="ml-count-all">{T.count.replace('{l}', String(LESSONS.length)).replace('{u}', String(SECTIONS.length)).replace('{p}', String(PROJECTS.length))}</span>
        </div>
        <nav className="ml-parts" aria-label={T.units}>
          {SECTIONS.map((s, k) => <a key={s.id} href={`#bolum-${s.id}`}><b>{k + 1}</b>{s.title[lang]}</a>)}
          <a href={`#bolum-${PROJE_BOLUMU.id}`} className="ml-parts-proj"><b>3B</b>{PROJE_BOLUMU.title[lang]}</a>
        </nav>
      </header>

      <section aria-labelledby="ml-how">
        <div className="section-head"><div><p className="eyebrow">{T.how2}</p><h2 id="ml-how">{T.howTitle}</h2></div></div>
        <div className="steps">{T.how.map(([h, p]) => <div key={h} className="step"><h3>{h}</h3><p>{p}</p></div>)}</div>
      </section>

      {SECTIONS.map((s, k) => {
        const list = LESSONS.filter((l) => l.section === s.id)
        return (
          <section key={s.id} id={`bolum-${s.id}`} className="ml-section" aria-labelledby={`ml-s-${s.id}`}>
            <div className="section-head">
              <div>
                <p className="eyebrow">{T.unit.replace('{n}', String(k + 1))} · {T.unitCount.replace('{n}', String(list.length))}</p>
                <h2 id={`ml-s-${s.id}`}>{s.title[lang]}</h2>
                <p>{s.sub[lang]}</p>
              </div>
            </div>
            <ol className="ml-list">
              {list.map((l) => (
                <li key={l.slug}>
                  <Link href={`/makine-ogrenmesi/${l.slug}`} className="ml-item" data-testid={`ml-${l.slug}`}>
                    <span className="ml-n">{String(l.n).padStart(2, '0')}</span>
                    <span className="ml-item-body"><b>{l.title[lang]}</b><span>{l.sub[lang]}</span></span>
                    <span aria-hidden="true" className="ml-go">→</span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        )
      })}

      <section id={`bolum-${PROJE_BOLUMU.id}`} className="ml-section" aria-labelledby="ml-s-projeler">
        <div className="section-head">
          <div>
            <p className="eyebrow">{T.projectCount.replace('{n}', String(PROJECTS.length))}</p>
            <h2 id="ml-s-projeler">{PROJE_BOLUMU.title[lang]}</h2>
            <p>{PROJE_BOLUMU.sub[lang]}</p>
          </div>
        </div>
        <ol className="ml-list">
          {PROJE_BOLUMU.slugs.map((slug, i) => {
            const p = PROJECTS.find((x) => x.slug === slug)!
            return (
              <li key={slug}>
                <Link href={`/makine-ogrenmesi/${slug}`} className="ml-item ml-item-proj" data-testid={`ml-${slug}`}>
                  <span className="ml-n">P{i + 1}</span>
                  <span className="ml-item-body"><b>{p.title[lang]}</b><span>{p.sub[lang]}</span></span>
                  <span aria-hidden="true" className="ml-go">→</span>
                </Link>
              </li>
            )
          })}
        </ol>
      </section>
    </div>
  )
}
