'use client'
import Link from 'next/link'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { CatalogModule } from '@/lib/catalog'
import { useActivity } from '@/lib/activity-store'
import { badges, buildEvents, computeStats, continueTarget, overallProgress, recommendNext, type BadgeInfo } from '@/lib/dashboard'
import { useFormat, useLocale, useT } from '@/i18n/client'
import { localizeCatalog } from '@/lib/catalog-en'
import type { MessageKey, TFunction } from '@/i18n'
import { UPCOMING } from '@/lib/module-meta'
import { useDoneIds } from '@/lib/progress-store'
import { LessonKindBadge } from '../badges'
import { ModuleCard, SoonCard } from '../module-card'
import { Icon, type IconName } from '../shell/icons'
import { HomeHero } from './home-hero'
import { Mascot } from '../lesson-v2/mascot'
import { WorkshopCards } from '../kids/workshop-cards'
import { useSession } from '@/lib/session'

const MODE_TEXT: Record<'resume' | 'next' | 'start', MessageKey> = { resume: 'home.continue.resume', next: 'home.continue.next', start: 'home.continue.start' }
const BTN_TEXT: Record<'resume' | 'next' | 'start', MessageKey> = { resume: 'home.continue.btnResume', next: 'home.continue.btnNext', start: 'home.continue.btnStart' }

/** lib/dashboard formatMinutes'in dile bağlı eşi (tr çıktısı aynı). */
function minutesText(t: TFunction, min: number): string {
  if (min < 60) return t('home.stats.minutes', { m: min })
  const h = Math.floor(min / 60), m = min % 60
  return m ? t('home.stats.hoursMinutes', { h, m }) : t('home.stats.hours', { h })
}

/** Rozet adı/ipucu: lib/dashboard badges() Türkçe üretir; kimliğe göre çevrilir. */
function badgeText(t: TFunction, b: BadgeInfo, catalog: CatalogModule[]): { title: string; hint: string } {
  if (b.id === 'ilk-ders') return { title: t('home.badge.firstLesson'), hint: t('home.badge.firstLessonHint') }
  if (b.id === 'on-ders') return { title: t('home.badge.tenLessons'), hint: t('home.badge.tenLessonsHint') }
  if (b.id === 'ilk-hedef') return { title: t('home.badge.firstGoal'), hint: t('home.badge.firstGoalHint') }
  const m = b.id.startsWith('modul-') ? catalog.find((x) => x.slug === b.id.slice(6)) : undefined
  if (m) return { title: t('home.badge.moduleDone', { n: m.position }), hint: t('home.badge.moduleDoneHint', { title: m.title }) }
  return { title: b.title, hint: b.hint }
}

function ContinueCard({ catalog }: { catalog: CatalogModule[] }) {
  const done = useDoneIds()
  const act = useActivity()
  const tr = useT()
  const t = continueTarget(catalog, done, act.opened)
  if (!t) {
    return (
      <section className="panel continue" aria-labelledby="devam-b">
        <p className="eyebrow">{tr('home.continue.resume')}</p>
        <h2 id="devam-b">{catalog.length ? tr('home.continue.allDone') : tr('home.continue.loadFailed')}</h2>
        <p className="muted">{catalog.length ? tr('home.continue.allDoneText') : tr('home.continue.loadFailedText')}</p>
        {catalog.length > 0 && <Link className="btn btn-primary" href="/moduller">{tr('home.continue.toModules')}</Link>}
      </section>
    )
  }
  const { item, mode } = t
  return (
    <section className={`panel continue track-${catalog.find((m) => m.slug === item.moduleSlug)?.track ?? 'maker'}`} aria-labelledby="devam-b">
      <p className="eyebrow">{tr(MODE_TEXT[mode])}</p>
      <p className="continue-where">{item.moduleTitle} <Icon name="chevronRight" size={14} /> {tr('home.continue.where', { n: item.weekPosition, title: item.weekTitle })}</p>
      <h2 id="devam-b">{item.lesson.title}</h2>
      <div className="continue-meta">
        <LessonKindBadge kind={item.lesson.kind} />
        <span className="meta-i"><Icon name="clock" size={16} />{tr('home.minutesApprox', { n: item.lesson.durationMin })}</span>
      </div>
      <div className="continue-actions">
        <Link className="btn btn-primary btn-lg" href={`/ders/${item.lesson.id}`}>{tr(BTN_TEXT[mode])}<Icon name="arrowRight" size={18} /></Link>
        <Link className="btn btn-ghost" href={`/moduller/${item.moduleSlug}`}>{tr('home.continue.modulePage')}</Link>
      </div>
    </section>
  )
}

function Ring({ catalog }: { catalog: CatalogModule[] }) {
  const done = useDoneIds()
  const t = useT()
  const o = overallProgress(catalog, done)
  const R = 52, C = 2 * Math.PI * R
  return (
    <section className="panel ring-card" aria-labelledby="halka-b">
      <h2 id="halka-b" className="panel-title">{t('home.ring.title')}</h2>
      <div className="ring" role="img" aria-label={t('home.ring.aria', { pct: o.pct, done: o.done, total: o.total })}>
        <svg viewBox="0 0 128 128" width="144" height="144" aria-hidden="true">
          <circle cx="64" cy="64" r={R} className="ring-bg" />
          <circle cx="64" cy="64" r={R} className="ring-fg" strokeDasharray={C} strokeDashoffset={C * (1 - o.pct / 100)} transform="rotate(-90 64 64)" />
        </svg>
        <div className="ring-center"><b>{t('home.ring.pct', { pct: o.pct })}</b><span>{t('home.ring.lessons', { done: o.done, total: o.total })}</span></div>
      </div>
      <ul className="ring-legend">
        {catalog.map((m) => {
          const ids = m.weeks.flatMap((w) => w.lessons.map((l) => l.id))
          const n = ids.filter((i) => done.has(i)).length
          return <li key={m.slug} className={`track-${m.track}`}><span className="dot" aria-hidden="true" /><span className="lg-name">{t('home.moduleN', { n: m.position })}</span><span className="lg-val">{n}/{ids.length}</span></li>
        })}
      </ul>
    </section>
  )
}

function StatTile({ icon, value, label, hint }: { icon: IconName; value: string; label: string; hint?: string }) {
  return (
    <div className="stat-tile">
      <span className="stat-icon" aria-hidden="true"><Icon name={icon} size={22} /></span>
      <div><b>{value}</b><span>{label}</span>{hint && <small>{hint}</small>}</div>
    </div>
  )
}

function Stats({ catalog }: { catalog: CatalogModule[] }) {
  const done = useDoneIds()
  const act = useActivity()
  const t = useT()
  const s = computeStats(catalog, done, act.goals)
  const earned = badges(catalog, done, act.goals)
  const none = s.lessonsDone === 0 && s.goalLessons === 0
  return (
    <section className="panel" aria-labelledby="istat-b">
      <h2 id="istat-b" className="panel-title">{t('home.stats.title')}</h2>
      {none ? (
        <div className="empty">
          <Icon name="spark" size={28} />
          <p><b>{t('home.stats.noneTitle')}</b></p>
          <p className="muted">{t('home.stats.noneText')}</p>
        </div>
      ) : (
        <div className="stat-grid">
          <StatTile icon="check" value={String(s.lessonsDone)} label={t('home.stats.lessonsDone')} />
          <StatTile icon="target" value={String(s.goalLessons)} label={t('home.stats.goalLessons')} />
          <StatTile icon="clock" value={minutesText(t, s.minutes)} label={t('home.stats.totalTime')} hint={t('home.stats.totalTimeHint')} />
        </div>
      )}
      <ul className="badges" aria-label={t('home.stats.badges')}>
        {earned.map((b) => { const bt = badgeText(t, b, catalog); return (
          <li key={b.id} className="badge-item" data-earned={b.earned}>
            <span className="badge-medal" aria-hidden="true"><Icon name={b.earned ? 'spark' : 'lock'} size={20} /></span>
            <span><b>{bt.title}</b><small>{b.earned ? t('home.stats.earned') : bt.hint}</small></span>
          </li>
        ) })}
      </ul>
    </section>
  )
}

function WeekPlan({ catalog }: { catalog: CatalogModule[] }) {
  const done = useDoneIds()
  const act = useActivity()
  const t = useT()
  const list = recommendNext(catalog, done, act.opened, 5)
  return (
    <section className="panel" aria-labelledby="hafta-b">
      <h2 id="hafta-b" className="panel-title">{t('home.week.title')}</h2>
      {list.length === 0 ? (
        <p className="muted">{t('home.week.empty')}</p>
      ) : (
        <ol className="plan">
          {list.map((f, i) => (
            <li key={f.lesson.id}>
              <Link href={`/ders/${f.lesson.id}`} className="plan-row">
                <span className="plan-n">{i + 1}</span>
                <span className="plan-text"><b>{f.lesson.title}</b><small>{t('home.week.meta', { m: f.modulePosition, w: f.weekPosition, min: f.lesson.durationMin })}</small></span>
                <LessonKindBadge kind={f.lesson.kind} />
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

const EVENT_TEXT: Record<'done' | 'goals' | 'open', MessageKey> = { done: 'home.feed.done', goals: 'home.feed.goals', open: 'home.feed.open' }
const EVENT_ICON: Record<'done' | 'goals' | 'open', IconName> = { done: 'check', goals: 'target', open: 'play' }

function Feed({ catalog }: { catalog: CatalogModule[] }) {
  const done = useDoneIds()
  const act = useActivity()
  const t = useT()
  const fmt = useFormat()
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => { setNow(Date.now()) }, [act])
  const ev = useMemo(() => buildEvents(catalog, act, done, 6), [catalog, act, done])
  return (
    <section className="panel" aria-labelledby="etkin-b">
      <h2 id="etkin-b" className="panel-title">{t('home.feed.title')}</h2>
      {ev.length === 0 ? (
        <div className="empty">
          <Icon name="clock" size={28} />
          <p><b>{t('home.feed.emptyTitle')}</b></p>
          <p className="muted">{t('home.feed.emptyText')}</p>
        </div>
      ) : (
        <ul className="feed">
          {ev.map((e) => (
            <li key={e.key}>
              <Link href={`/ders/${e.item.lesson.id}`} className="feed-row">
                <span className={`feed-icon feed-${e.type}`} aria-hidden="true"><Icon name={EVENT_ICON[e.type]} size={16} /></span>
                <span className="plan-text"><b>{e.item.lesson.title}</b><small>{t('home.feed.meta', { event: t(EVENT_TEXT[e.type]), m: e.item.modulePosition })}</small></span>
                <time className="feed-time" dateTime={new Date(e.at).toISOString()}>{now ? fmt.timeAgo(e.at, now) : ''}</time>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export function Dashboard({ catalog: catalogTr, league }: { catalog: CatalogModule[]; /** Sınıf ligi kartı (sunucu bileşeni; giriş açıkken). */ league?: ReactNode }) {
  const t = useT()
  const locale = useLocale()
  // Modül/hafta adları ve ders başlıkları dile göre (lib/catalog-en.ts); alt kartlar (devam, plan, rozet, akış) bunu kullanır
  const catalog = useMemo(() => localizeCatalog(catalogTr, locale), [catalogTr, locale])
  const session = useSession()
  const soon = UPCOMING.filter((u) => !catalog.some((m) => m.slug === u.slug))
  const first = session.user?.name?.split(' ')[0]
  return (
    <div className="page dash">
      <header className="kid-hello">
        <Mascot size={64} mood="happy" />
        <div>
          <h1>{first ? t('home.kids.helloName', { name: first }) : t('home.kids.hello')}</h1>
          <p className="muted">{t('home.kids.lead')}</p>
        </div>
      </header>

      <HomeHero catalog={catalog} />
      {league}

      <section aria-labelledby="atolye-b" className="kid-section">
        <div className="section-head">
          <div><h2 id="atolye-b" className="section-title">{t('home.kids.workshops')}</h2><p className="muted kid-sub">{t('home.kids.workshopsLead')}</p></div>
        </div>
        <WorkshopCards />
      </section>

      <section aria-labelledby="mod-b" className="kid-section">
        <div className="section-head">
          <h2 id="mod-b" className="section-title">{t('home.kids.lessons')}</h2>
          <Link href="/moduller" className="link-more">{t('home.seeAll')} <Icon name="arrowRight" size={16} /></Link>
        </div>
        {catalog.length === 0 ? (
          <div className="panel"><p>{t('home.modulesFailed')}</p></div>
        ) : (
          <div className="mgrid">
            {catalog.map((m) => <ModuleCard key={m.id} m={m} />)}
            {soon.map((u) => <div key={u.slug} id="yakinda"><SoonCard u={u} /></div>)}
          </div>
        )}
      </section>

      <details className="dash-more">
        <summary>{t('home.kids.more')}</summary>
        <div className="dash-more-body">
          <div className="dash-top">
            <ContinueCard catalog={catalog} />
            <Ring catalog={catalog} />
          </div>
          <div className="dash-two">
            <WeekPlan catalog={catalog} />
            <Feed catalog={catalog} />
          </div>
          <Stats catalog={catalog} />
        </div>
      </details>
    </div>
  )
}
