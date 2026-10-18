import type { Metadata } from 'next'
import Link from 'next/link'
import { Icon } from '@/components/shell/icons'
import { getLocale } from '@/i18n/server'
import { PROGRAMS, totalHours } from '@/lib/programlar'

export const metadata: Metadata = {
  title: 'Programlar',
  description: 'Büyükler için (16+) çok dersli programlar: Robotik Programlama, Gömülü Sistemler, Nesnelerin İnterneti ve Veri, Yapay Zekâ Uygulama Geliştirme, Görüntü İşleme, Otonom Sistemler.',
}

export default async function Programlar() {
  const lang = await getLocale()
  const en = lang === 'en'
  return (
    <div className="page eng">
      <nav aria-label={en ? 'Breadcrumb' : 'Konum'} className="crumbs">
        <Link href="/muhendislik">{en ? 'Engineering path' : 'Mühendislik yolu'}</Link><Icon name="chevronRight" size={14} />
        <span aria-current="page">{en ? 'Programmes' : 'Programlar'}</span>
      </nav>
      <header className="eng-hero">
        <p className="eyebrow">{en ? 'For adults · age 16 and up' : 'Büyükler için · 16 yaş ve üstü'}</p>
        <h1>{en ? 'Programmes: courses chained into a path' : 'Programlar: dersleri bir yola bağla'}</h1>
        <p className="lead">{en ? 'Each programme puts several courses in order, from the first circuit or the first line of Python to a capstone project. Everything runs in the browser; no kit or installation is needed to start.' : 'Her program birkaç dersi sıraya koyar: ilk devreden ya da ilk Python satırından bir bitirme projesine kadar. Her şey tarayıcıda çalışır; başlamak için kit ya da kurulum gerekmez.'}</p>
        <dl className="eng-stats">
          <div><dt>{en ? 'Programmes' : 'Program'}</dt><dd>{PROGRAMS.length}</dd></div>
          <div><dt>{en ? 'Courses' : 'Ders'}</dt><dd>{new Set(PROGRAMS.flatMap((p) => p.courses.map((c) => c.href))).size}</dd></div>
        </dl>
        <ul className="pg-jump" aria-label={en ? 'Jump to a programme' : 'Programa git'}>
          {PROGRAMS.map((p) => <li key={p.slug}><a href={`#${p.slug}`}>{p[lang].title}</a></li>)}
        </ul>
      </header>

      <div className="pg-list">
        {PROGRAMS.map((p) => {
          const t = p[lang]
          return (
            <section key={p.slug} id={p.slug} className={`pg-card t-${p.tone}`} aria-labelledby={`pg-${p.slug}`} data-testid={`program-${p.slug}`}>
              <h2 id={`pg-${p.slug}`}>{t.title}</h2>
              <p className="lead">{t.summary}</p>
              <dl className="pg-meta">
                <div><dt>{en ? 'Total' : 'Toplam'}</dt><dd className="big">{totalHours(p)} {en ? 'h' : 'saat'}</dd></div>
                <div><dt>{en ? 'Courses' : 'Ders'}</dt><dd className="big">{p.courses.length}</dd></div>
                <div><dt>{en ? 'Level' : 'Seviye'}</dt><dd>{t.level}</dd></div>
              </dl>
              <p className="pg-prereq">{t.prereq}</p>
              <div className="pg-grid">
                <div>
                  <h3>{en ? 'Courses, in order' : 'Dersler, sırayla'}</h3>
                  <ol className="pg-chain">
                    {p.courses.map((c) => (
                      <li key={c.href}>
                        <Link href={c.href}><b>{c[lang].title}</b><span className="h">{c.hours} {en ? 'h' : 'sa'}</span><small>{c[lang].why}</small></Link>
                      </li>
                    ))}
                  </ol>
                </div>
                <div>
                  <h3>{en ? 'Outcomes' : 'Kazanımlar'}</h3>
                  <ul className="eng-list">{t.outcomes.map((o) => <li key={o}>{o}</li>)}</ul>
                  <h3 style={{ marginTop: 14 }}>{en ? 'Capstone' : 'Bitirme projesi'}</h3>
                  <p className="pg-cap">{t.capstone}</p>
                </div>
              </div>
            </section>
          )
        })}
      </div>

      <p className="pg-note">{en ? 'Hours are guided study time, including simulations, code and quizzes. Learners who complete a programme\'s courses and capstone receive a Macademia certificate of participation.' : 'Saatler simülasyon, kod ve testler dahil rehberli çalışma süresidir. Bir programın derslerini ve bitirme projesini tamamlayana Macademia katılım belgesi verilir.'}</p>
    </div>
  )
}
