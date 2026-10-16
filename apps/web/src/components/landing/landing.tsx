import Link from 'next/link'
import type { CatalogModule } from '@/lib/catalog'
import { BANDS, bandText, TOPICS, topicText } from '@/lib/learning-paths'
import { Mascot } from '@/components/lesson-v2/mascot'
import { dictionaries, type Locale } from '@/i18n'
import { ContinueLink, HeroDemo, MeetTabs } from './landing-client'
import { WorkshopCards } from '@/components/kids/workshop-cards'
import { WORKSHOPS } from '@/components/kids/workshops'
import '@/app/landing.css'

const BAND_ART = ['🧩', '🎮', '🔆', '💡', '🤖']

/**
 * Tanıtım ana sayfası (giriş yapmamış ziyaretçi için "/"), Brilliant ana sayfası düzeninde:
 * kahraman + canlı deneme · güven sayıları · Robi ile tanış · etkili ve güvenilir · yaş bantları ·
 * alışkanlık · okullar · nasıl çalışır · kapanış çağrısı. Sayılar katalogdan gelir (uydurma istatistik yok).
 */
export function Landing({ catalog, parts, locale }: { catalog: CatalogModule[]; parts: number; locale: Locale }) {
  const L = dictionaries[locale].landing
  const H = dictionaries[locale].home
  const lessons = catalog.reduce((n, m) => n + m.weeks.reduce((k, w) => k + w.lessons.length, 0), 0)
  const stats = [
    { v: String(lessons), l: L.stats.lessons },
    { v: String(catalog.length), l: L.stats.courses },
    { v: String(parts), l: L.stats.parts },
    { v: '5–18', l: L.stats.ages },
    { v: locale === 'en' ? '$0' : '0 TL', l: L.stats.hardware },
  ]
  return (
    <div className="ld">
      <section className="ld-hero">
        <div className="ld-hero-text">
          <h1>{L.hero.title}</h1>
          <p className="ld-lead">{L.hero.lead}</p>
          <div className="ld-cta">
            <Link className="v2-btn accent ld-big" href="/basla">{L.hero.learner}</Link>
            <Link className="v2-btn ghost ld-big" href="/okullar">{L.hero.adult}</Link>
          </div>
          <div className="ld-cta-sub"><ContinueLink label={L.hero.continue} /><span className="muted">{L.hero.noHardware}</span></div>
        </div>
        <HeroDemo L={L} />
      </section>

      <ul className="ld-stats" aria-label="ASK Robotic">
        {stats.map((s) => <li key={s.l}><b>{s.v}</b><span>{s.l}</span></li>)}
      </ul>

      <section className="ld-section" aria-labelledby="ld-atolye">
        <h2 id="ld-atolye" className="ld-h2">{H.kids.workshops}</h2>
        <p className="ld-sub">{H.kids.workshopsLead}</p>
        <WorkshopCards items={WORKSHOPS.slice(0, 8)} />
      </section>

      <section className="ld-section">
        <div className="ld-title"><Mascot size={56} mood="happy" /><div><h2>{L.meet.title}</h2><p>{L.meet.lead}</p></div></div>
        <MeetTabs L={L} />
      </section>

      <section className="ld-section">
        <h2 className="ld-h2">{L.trust.title}</h2>
        <div className="ld-trust">
          {L.trust.items.map((it, i) => (
            <div key={it.title} className="ld-card"><span className="ld-num">{['✦', '🎯', '🔒', '🏫'][i]}</span><b>{it.title}</b><p>{it.text}</p></div>
          ))}
        </div>
      </section>

      <section className="ld-section">
        <h2 className="ld-h2">{L.catalog.title}</h2>
        <p className="ld-sub">{L.catalog.lead}</p>
        <div className="ld-bands">
          {BANDS.map((b, i) => {
            const bt = bandText(b, locale)
            return (
              <div key={b.key} className="ld-band">
                <span className="ld-band-art" aria-hidden="true">{BAND_ART[i]}</span>
                <small>{bt.grades} · {bt.ages}</small>
                <b>{bt.title}</b>
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
        <p className="ld-center"><Link className="v2-btn ghost" href="/konular">{L.catalog.all}</Link></p>
      </section>

      <section className="ld-section ld-split">
        <div>
          <h2 className="ld-h2 left">{L.habit.title}</h2>
          <p className="ld-sub left">{L.habit.lead}</p>
          <ul className="ld-checks">{L.habit.points.map((p) => <li key={p}>{p}</li>)}</ul>
        </div>
        <div className="ld-streak" aria-hidden="true">
          <div className="ld-streak-top"><span>⚡</span><b>12</b><small>{locale === 'en' ? 'day streak' : 'günlük seri'}</small></div>
          <div className="ld-week">{(locale === 'en' ? ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'] : ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz']).map((d, i) => <span key={d} className={i < 5 ? 'on' : i === 5 ? 'charge' : ''}><i>{i < 5 ? '⚡' : i === 5 ? '🔋' : ''}</i>{d}</span>)}</div>
          <div className="ld-goal"><span>{locale === 'en' ? 'Daily goal' : 'Günlük hedef'}</span><div className="v2-progress"><div style={{ width: '80%' }} /></div></div>
        </div>
      </section>

      <section className="ld-section ld-schools">
        <div>
          <h2 className="ld-h2 left">{L.schools.title}</h2>
          <p className="ld-sub left">{L.schools.lead}</p>
          <ul className="ld-pills">{L.schools.points.map((p) => <li key={p}>{p}</li>)}</ul>
          <Link className="v2-btn accent" href="/okullar">{L.schools.cta}</Link>
        </div>
        <div className="ld-class" aria-hidden="true">
          {['Ada K.', 'Can D.', 'Elif Ş.', 'Mert A.'].map((n, i) => (
            <div key={n} className="ld-class-row"><span>{n}</span><div className="ld-dots">{[0, 1, 2, 3, 4].map((j) => <i key={j} className={j < 4 - (i % 3) ? 'ok' : i === 2 && j === 4 ? 'stuck' : ''} />)}</div></div>
          ))}
        </div>
      </section>

      <section className="ld-section">
        <h2 className="ld-h2">{L.how.title}</h2>
        <ol className="ld-how">{L.how.steps.map((s, i) => <li key={s.title}><span>{i + 1}</span><b>{s.title}</b><p>{s.text}</p></li>)}</ol>
      </section>

      <section className="ld-final">
        <Mascot size={88} mood="happy" />
        <h2>{L.final.title}</h2>
        <p>{L.final.lead}</p>
        <div className="ld-cta center">
          <Link className="v2-btn accent ld-big" href="/basla">{L.final.cta}</Link>
          <Link className="v2-btn ghost ld-big" href="/giris">{L.final.login}</Link>
        </div>
      </section>
    </div>
  )
}
