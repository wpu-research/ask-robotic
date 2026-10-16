import Link from 'next/link'
import type { CatalogModule } from '@/lib/catalog'
import { BANDS, bandText, TOPICS, topicText } from '@/lib/learning-paths'
import { Mascot } from '@/components/lesson-v2/mascot'
import { dictionaries, type Locale } from '@/i18n'
import { ContinueLink, HeroDemo, MeetTabs } from './landing-client'
import { HeroScene } from './hero-scene'
import { WorkshopCards } from '@/components/kids/workshop-cards'
import { WORKSHOPS } from '@/components/kids/workshops'
import { MACADEMIA_URL } from '@/components/shell/nav-items'
import { PHOTOS } from '@/lib/photo-credits'
import '@/app/landing.css'

/** "Bugünün planı" kartındaki örnek ustalık değerleri (belirsizlik aralığıyla; Macademia'daki "TUS örneği" gibi örnek olarak işaretli). */
const SAMPLE = [{ p: 31, u: 17 }, { p: 58, u: 14 }, { p: 72, u: 11 }]

/**
 * Tanıtım ana sayfası (giriş yapmamış ziyaretçi için "/"), macademia.online'ın bölüm sırasıyla: kahraman (çizim sahne + Mac'in
 * konuşma balonu "bugünün planı") · nasıl çalışır (dört adım) · programlarımız (kartlar) · hemen dene · Mac · yaşa göre yol · kurumsal bant ·
 * hakkımızda ilkeleri · başla. Sayılar katalogdan gelir (uydurma istatistik yok).
 */
export function Landing({ catalog, parts, locale }: { catalog: CatalogModule[]; parts: number; locale: Locale }) {
  const L = dictionaries[locale].landing
  const H = dictionaries[locale].home
  const X = L.mx
  const lessons = catalog.reduce((n, m) => n + m.weeks.reduce((k, w) => k + w.lessons.length, 0), 0)
  const fill = (s: string) => s.replace('{lessons}', String(lessons)).replace('{courses}', String(catalog.length)).replace('{parts}', String(parts))
  return (
    <div className="mx-home">
      <section className="mx-hero">
        <div className="wrap">
          <div>
            <p className="eyebrow">{X.hero.eyebrow}</p>
            <h1>{X.hero.title1}<em>{X.hero.em}</em>{X.hero.title2}</h1>
            <p className="lead">{X.hero.lead}</p>
            <div className="hero-actions">
              <Link className="btn btn-primary" href="/basla">{X.hero.primary}</Link>
              <Link className="btn btn-outline" href="#programlar">{X.hero.secondary}</Link>
            </div>
            <p className="mx-hero-sub"><ContinueLink label={L.hero.continue} /><span className="muted">{L.hero.noHardware}</span></p>
          </div>
          <div className="hero-visual">
            <HeroScene />
            <div className="today-card" aria-label={X.hero.card.label}>
              <div className="label"><span>{X.hero.card.label}</span><span className="chip chip-line">{X.hero.card.tag}</span></div>
              <strong>{X.hero.card.title}</strong>
              <ul>
                {X.hero.card.rows.map((r, i) => (
                  <li key={r}><span>{r}</span><span className="today-bar" aria-hidden="true"><i style={{ width: `${SAMPLE[i].p}%` }} /></span><b>%{SAMPLE[i].p}</b><small>±{SAMPLE[i].u}</small></li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <span className="mx-wave" aria-hidden="true" />
      </section>

      <section className="section" id="yontem">
        <div className="wrap">
          <div className="section-head">
            <div><p className="eyebrow">{X.how.eyebrow}</p><h2>{X.how.title}</h2></div>
            <p>{X.how.lead} <a className="mx-link" href={`${MACADEMIA_URL}#yontem`}>{X.how.link}</a></p>
          </div>
          <div className="steps">
            {X.how.steps.map((s) => <div key={s.title} className="step"><h3>{s.title}</h3><p>{s.text}</p></div>)}
          </div>
        </div>
      </section>

      <section className="section soft" id="programlar">
        <div className="wrap">
          <div className="section-head">
            <div><p className="eyebrow">{X.programs.eyebrow}</p><h2>{X.programs.title}</h2></div>
            <p>{fill(X.programs.lead)}</p>
          </div>
          <div className="mx-cards three mx-feature">
            <Link href="/muhendislik" className="mx-card">
              <span className="mx-card-img"><img src={PHOTOS.robotik.file} alt="" width={800} height={500} /></span>
              <span className="mx-card-body"><h3>{X.programs.engTitle}</h3><span className="mx-card-meta">{X.programs.engMeta}</span><p>{X.programs.engText}</p></span>
            </Link>
            <Link href="/muhendislik/robotik" className="mx-card">
              <span className="mx-card-img"><img src={PHOTOS.gencler.file} alt="" width={800} height={500} /></span>
              <span className="mx-card-body"><h3>{X.programs.courseTitle}</h3><span className="mx-card-meta">{X.programs.courseMeta}</span><p>{X.programs.courseText}</p></span>
            </Link>
            <Link href="/konular" className="mx-card">
              <span className="mx-card-img"><img src={PHOTOS.kodlama.file} alt="" width={800} height={500} /></span>
              <span className="mx-card-body"><h3>{X.programs.allTopics}</h3><span className="mx-card-meta">{lessons} {L.stats.lessons} · {catalog.length} {L.stats.courses}</span><p>{L.catalog.lead}</p></span>
            </Link>
          </div>
          <h3 className="mx-subhead">{H.kids.workshops}</h3>
          <WorkshopCards items={WORKSHOPS} />
        </div>
      </section>

      <section className="section">
        <div className="wrap mx-demo">
          <div>
            <p className="eyebrow">{X.demo.eyebrow}</p>
            <h2 className="mx-h2">{X.demo.title}</h2>
            <p className="muted">{X.demo.lead}</p>
          </div>
          <HeroDemo L={L} />
        </div>
      </section>

      <section className="section soft">
        <div className="wrap">
          <div className="section-head">
            <div className="mx-meet-title"><Mascot size={64} mood="happy" /><div><p className="eyebrow">{X.meet.eyebrow}</p><h2>{L.meet.title}</h2></div></div>
            <p>{L.meet.lead}</p>
          </div>
          <MeetTabs L={L} />
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div><p className="eyebrow">{X.bands.eyebrow}</p><h2>{L.catalog.title}</h2></div>
            <p>{L.catalog.lead}</p>
          </div>
          <div className="mx-bands">
            {BANDS.map((b) => {
              const bt = bandText(b, locale)
              return (
                <div key={b.key} className="mx-band">
                  <span className="mx-card-meta">{bt.grades} · {bt.ages}</span>
                  <h3>{bt.title}</h3>
                  <p>{bt.blurb}</p>
                  <ul>
                    {TOPICS.filter((t) => t.bands.includes(b.key)).map((t) => {
                      const first = catalog.find((m) => m.slug === t.courses[0])
                      return <li key={t.key}><Link href={first ? `/moduller/${first.slug}` : '/konular'}>{topicText(t, locale).title} →</Link></li>
                    })}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="band" id="kurumsal">
        <div className="wrap">
          <div>
            <p className="eyebrow">{X.corporate.eyebrow}</p>
            <h2>{X.corporate.title}</h2>
            <p>{X.corporate.lead}</p>
            <div className="hero-actions"><Link className="btn btn-primary" href="/okullar">{X.corporate.cta}</Link></div>
          </div>
          <ul className="feature-list">
            {X.corporate.items.map((it) => <li key={it}><span>{it}</span><span className="chip chip-ready">{X.corporate.ready}</span></li>)}
          </ul>
        </div>
      </section>

      <section className="section" id="hakkimizda">
        <div className="wrap mx-about">
          <div>
            <p className="eyebrow">{X.about.eyebrow}</p>
            <h2 className="mx-h2">{X.about.title1}<br />{X.about.title2}</h2>
            <p className="muted">{X.about.p1}</p>
            <p className="muted">{X.about.p2}</p>
          </div>
          <div className="principles">
            {L.trust.items.map((it) => <div key={it.title}><h3>{it.title}</h3><p>{it.text}</p></div>)}
          </div>
        </div>
      </section>

      <section className="section soft">
        <div className="wrap mx-final">
          <Mascot size={88} mood="happy" />
          <div>
            <p className="eyebrow">{X.final.eyebrow}</p>
            <h2 className="mx-h2">{L.final.title}</h2>
            <p className="muted">{L.final.lead}</p>
          </div>
          <div className="hero-actions">
            <Link className="btn btn-primary" href="/basla">{L.final.cta}</Link>
            <Link className="btn btn-outline" href="/giris">{X.final.login}</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
