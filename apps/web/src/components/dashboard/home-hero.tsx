'use client'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import type { CatalogModule } from '@/lib/catalog'
import { askSearch } from '@/lib/ask'
import { useActivity } from '@/lib/activity-store'
import { continueTarget, countDone, moduleLessonIds } from '@/lib/dashboard'
import { useGame } from '@/lib/gamification'
import { goalXp, MAX_CHARGES, streak, weekStrip } from '@/lib/gamification-core'
import { useProfile } from '@/lib/profile'
import { useDoneIds } from '@/lib/progress-store'
import { Mascot } from '../lesson-v2/mascot'
import { useT } from '@/i18n/client'

/** Hazır sorular: arama içeriği Türkçe olduğundan sorgu her dilde Türkçe (`q`), görünen ad çevrilir. */
const CHIPS = [
  { q: 'LED nasıl yakılır', k: 'home.hero.chip1' },
  { q: 'Ohm yasası', k: 'home.hero.chip2' },
  { q: 'Robot çizgi izleme', k: 'home.hero.chip3' },
  { q: 'Yapay zekâ nedir', k: 'home.hero.chip4' },
  { q: 'Kendi oyunumu yapmak', k: 'home.hero.chip5' },
] as const

/** Panel üstü (Brilliant ana sayfası gibi): seri + günlük hedef kartı, kaldığın kurs kartı ve "Neye yardım lazım?" kutusu. */
export function HomeHero({ catalog }: { catalog: CatalogModule[] }) {
  const tr = useT()
  const profile = useProfile()
  const { state, today } = useGame()
  const done = useDoneIds()
  const act = useActivity()
  const [q, setQ] = useState('')
  const [asked, setAsked] = useState('')
  const hits = useMemo(() => askSearch(catalog, asked), [catalog, asked])

  const t = continueTarget(catalog, done, act.opened)
  const preferred = profile && !t?.lastOpened ? catalog.find((m) => m.slug === profile.course) : null
  const courseSlug = preferred?.slug ?? t?.item.moduleSlug
  const course = catalog.find((m) => m.slug === courseSlug)
  const lesson = preferred ? preferred.weeks[0]?.lessons[0] : t?.item.lesson
  const weekPos = preferred ? 1 : t?.item.weekPosition
  const c = course ? countDone(moduleLessonIds(course), done) : null

  const s = today ? streak(state, today) : 0
  const strip = today ? weekStrip(state, today) : []
  const todayXp = today ? state.days[today]?.xp ?? 0 : 0
  const goal = goalXp(profile?.goalMin ?? 15)
  const goalPct = Math.min(100, Math.round((todayXp / goal) * 100))
  const days = tr('home.hero.weekdays').split(',')

  return (
    <div className="hh">
      {profile === null && (
        <Link href="/basla" className="hh-start">
          <Mascot size={52} mood="happy" />
          <span><b>{tr('home.hero.planTitle')}</b><small>{tr('home.hero.planText')}</small></span>
          <span className="v2-btn accent">{tr('home.hero.start')}</span>
        </Link>
      )}
      <div className="hh-grid">
        <section className="hh-card hh-streak" aria-labelledby="seri-b">
          <div className="hh-streak-top">
            <h2 id="seri-b"><span className="hh-bolt" aria-hidden="true">⚡</span>{s}<small>{tr('home.hero.streak')}</small></h2>
            <span className="hh-charges" title={tr('home.hero.chargesTitle')} aria-label={tr('home.hero.chargesAria', { n: state.charges, max: MAX_CHARGES })}>
              {Array.from({ length: MAX_CHARGES }, (_, i) => <span key={i} className={i < state.charges ? 'full' : ''} aria-hidden="true" />)}
            </span>
          </div>
          <ol className="hh-week" aria-label={tr('home.hero.thisWeek')}>
            {strip.map((d, i) => <li key={d.day} data-state={d.state} data-today={d.today}><span aria-hidden="true">{d.state === 'active' ? '⚡' : d.state === 'frozen' ? '🔋' : ''}</span><small>{days[i] ?? d.label}</small></li>)}
          </ol>
          <div className="hh-goal">
            <div className="hh-goal-top"><b>{tr('home.hero.dailyGoal')}</b><span>{tr('home.hero.xpOf', { xp: todayXp, goal })}</span></div>
            <div className="v2-progress" role="progressbar" aria-valuemin={0} aria-valuemax={goal} aria-valuenow={todayXp} aria-label={tr('home.hero.dailyGoal')}><div style={{ width: `${goalPct}%` }} /></div>
            <small className="muted">{tr('home.hero.goalNote', { xp: state.xp })}</small>
          </div>
        </section>

        <section className="hh-card hh-course" aria-labelledby="kurs-b">
          {course && lesson ? (
            <>
              <p className="v2-eyebrow">{preferred ? tr('home.hero.firstCourse') : tr('home.hero.whereYouLeft')}</p>
              <h2 id="kurs-b">{course.title}</h2>
              <p className="muted">{tr('home.hero.weekLesson', { n: weekPos ?? 1, title: lesson.title })}</p>
              {c && <div className="v2-progress" role="progressbar" aria-valuemin={0} aria-valuemax={c.total} aria-valuenow={c.done} aria-label={tr('home.hero.courseProgress')}><div style={{ width: `${Math.max(c.pct, 2)}%` }} /></div>}
              <div className="hh-actions">
                <Link className="v2-btn accent" href={`/ders/${lesson.id}`}>{c?.done ? tr('home.hero.continueCourse') : tr('home.hero.start')}</Link>
                <Link className="v2-btn ghost" href={`/moduller/${course.slug}`}>{tr('home.hero.courseMap')}</Link>
              </div>
            </>
          ) : (
            <>
              <h2 id="kurs-b">{tr('home.hero.topicsWaiting')}</h2>
              <Link className="v2-btn accent" href="/konular">{tr('home.hero.browseTopics')}</Link>
            </>
          )}
        </section>
      </div>

      <section className="hh-ask" aria-labelledby="sor-b">
        <h2 id="sor-b" className="sr-only">{tr('home.hero.askTitle')}</h2>
        <form onSubmit={(e) => { e.preventDefault(); setAsked(q) }} className="hh-ask-form">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tr('home.hero.askPlaceholder')} aria-label={tr('home.hero.askTitle')} />
          <button type="submit" className="v2-btn" disabled={!q.trim()}>{tr('home.hero.ask')}</button>
        </form>
        <div className="hh-chips">{CHIPS.map((x) => <button key={x.q} type="button" onClick={() => { setQ(x.q); setAsked(x.q) }}>{tr(x.k)}</button>)}</div>
        {asked && (
          <div className="hh-answer" aria-live="polite">
            <Mascot size={40} mood={hits.length ? 'happy' : 'think'} />
            {hits.length ? (
              <div>
                <p className="v2-bubble">{tr('home.hero.suggest')}</p>
                <ul className="hh-hits">
                  {hits.map((h) => (
                    <li key={h.href}><Link href={h.href}><small>{h.kind === 'kurs' ? tr('home.hero.kindCourse') : tr('home.hero.kindLesson')} · {h.kind === 'kurs' ? tr('home.hero.courseWhere') : h.where.replace(/(\d+)\. hafta$/, (_, n: string) => tr('home.weekN', { n }))}</small><b>{h.title}</b></Link></li>
                  ))}
                </ul>
              </div>
            ) : <p className="v2-bubble">{tr('home.hero.noHitBefore')}<Link href="/konular">{tr('home.hero.noHitLink')}</Link>{tr('home.hero.noHitAfter')}</p>}
          </div>
        )}
      </section>
    </div>
  )
}
