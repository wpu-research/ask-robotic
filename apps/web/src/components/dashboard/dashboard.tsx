'use client'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import type { CatalogModule } from '@/lib/catalog'
import { useActivity } from '@/lib/activity-store'
import { badges, buildEvents, computeStats, continueTarget, formatMinutes, overallProgress, recommendNext } from '@/lib/dashboard'
import { timeAgo } from '@/lib/format'
import { UPCOMING } from '@/lib/module-meta'
import { useDoneIds } from '@/lib/progress-store'
import { LessonKindBadge } from '../badges'
import { ModuleCard, SoonCard } from '../module-card'
import { Icon, type IconName } from '../shell/icons'

const MODE_TEXT = { resume: 'Kaldığın yerden devam et', next: 'Sıradaki dersin', start: 'İlk dersin hazır' } as const
const BTN_TEXT = { resume: 'Devam et', next: 'Derse geç', start: 'Başla' } as const

function ContinueCard({ catalog }: { catalog: CatalogModule[] }) {
  const done = useDoneIds()
  const act = useActivity()
  const t = continueTarget(catalog, done, act.opened)
  if (!t) {
    return (
      <section className="panel continue" aria-labelledby="devam-b">
        <p className="eyebrow">Kaldığın yerden devam et</p>
        <h2 id="devam-b">{catalog.length ? 'Tüm dersleri tamamladın' : 'Dersler yüklenemedi'}</h2>
        <p className="muted">{catalog.length ? 'Harika iş! İstediğin dersi modül sayfasından yeniden açabilirsin.' : 'Veritabanı bağlantısını kontrol et ve sayfayı yenile.'}</p>
        {catalog.length > 0 && <Link className="btn btn-primary" href="/moduller">Modüllere git</Link>}
      </section>
    )
  }
  const { item, mode } = t
  return (
    <section className={`panel continue track-${catalog.find((m) => m.slug === item.moduleSlug)?.track ?? 'maker'}`} aria-labelledby="devam-b">
      <p className="eyebrow">{MODE_TEXT[mode]}</p>
      <p className="continue-where">{item.moduleTitle} <Icon name="chevronRight" size={14} /> {item.weekPosition}. hafta: {item.weekTitle}</p>
      <h2 id="devam-b">{item.lesson.title}</h2>
      <div className="continue-meta">
        <LessonKindBadge kind={item.lesson.kind} />
        <span className="meta-i"><Icon name="clock" size={16} />~{item.lesson.durationMin} dk</span>
      </div>
      <div className="continue-actions">
        <Link className="btn btn-primary btn-lg" href={`/ders/${item.lesson.id}`}>{BTN_TEXT[mode]}<Icon name="arrowRight" size={18} /></Link>
        <Link className="btn btn-ghost" href={`/moduller/${item.moduleSlug}`}>Modül sayfası</Link>
      </div>
    </section>
  )
}

function Ring({ catalog }: { catalog: CatalogModule[] }) {
  const done = useDoneIds()
  const o = overallProgress(catalog, done)
  const R = 52, C = 2 * Math.PI * R
  return (
    <section className="panel ring-card" aria-labelledby="halka-b">
      <h2 id="halka-b" className="panel-title">Genel ilerleme</h2>
      <div className="ring" role="img" aria-label={`Genel ilerleme yüzde ${o.pct}: ${o.done} / ${o.total} ders`}>
        <svg viewBox="0 0 128 128" width="144" height="144" aria-hidden="true">
          <circle cx="64" cy="64" r={R} className="ring-bg" />
          <circle cx="64" cy="64" r={R} className="ring-fg" strokeDasharray={C} strokeDashoffset={C * (1 - o.pct / 100)} transform="rotate(-90 64 64)" />
        </svg>
        <div className="ring-center"><b>%{o.pct}</b><span>{o.done} / {o.total} ders</span></div>
      </div>
      <ul className="ring-legend">
        {catalog.map((m) => {
          const ids = m.weeks.flatMap((w) => w.lessons.map((l) => l.id))
          const n = ids.filter((i) => done.has(i)).length
          return <li key={m.slug} className={`track-${m.track}`}><span className="dot" aria-hidden="true" /><span className="lg-name">Modül {m.position}</span><span className="lg-val">{n}/{ids.length}</span></li>
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
  const s = computeStats(catalog, done, act.goals)
  const earned = badges(catalog, done, act.goals)
  const none = s.lessonsDone === 0 && s.goalLessons === 0
  return (
    <section className="panel" aria-labelledby="istat-b">
      <h2 id="istat-b" className="panel-title">İstatistik ve rozetler</h2>
      {none ? (
        <div className="empty">
          <Icon name="spark" size={28} />
          <p><b>Henüz ders tamamlamadın.</b></p>
          <p className="muted">İlk dersini bitirdiğinde sayıların ve rozetlerin burada görünür. Veriler yalnız bu tarayıcıda saklanır.</p>
        </div>
      ) : (
        <div className="stat-grid">
          <StatTile icon="check" value={String(s.lessonsDone)} label="Tamamlanan ders" />
          <StatTile icon="target" value={String(s.goalLessons)} label="Hedefleri biten etkinlik" />
          <StatTile icon="clock" value={formatMinutes(s.minutes)} label="Toplam süre" hint="Biten derslerin tahmini süresi" />
        </div>
      )}
      <ul className="badges" aria-label="Rozetler">
        {earned.map((b) => (
          <li key={b.id} className="badge-item" data-earned={b.earned}>
            <span className="badge-medal" aria-hidden="true"><Icon name={b.earned ? 'spark' : 'lock'} size={20} /></span>
            <span><b>{b.title}</b><small>{b.earned ? 'Kazanıldı' : b.hint}</small></span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function WeekPlan({ catalog }: { catalog: CatalogModule[] }) {
  const done = useDoneIds()
  const act = useActivity()
  const list = recommendNext(catalog, done, act.opened, 5)
  return (
    <section className="panel" aria-labelledby="hafta-b">
      <h2 id="hafta-b" className="panel-title">Bu hafta</h2>
      {list.length === 0 ? (
        <p className="muted">Önerilecek ders kalmadı.</p>
      ) : (
        <ol className="plan">
          {list.map((f, i) => (
            <li key={f.lesson.id}>
              <Link href={`/ders/${f.lesson.id}`} className="plan-row">
                <span className="plan-n">{i + 1}</span>
                <span className="plan-text"><b>{f.lesson.title}</b><small>Modül {f.modulePosition} · {f.weekPosition}. hafta · ~{f.lesson.durationMin} dk</small></span>
                <LessonKindBadge kind={f.lesson.kind} />
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

const EVENT_TEXT = { done: 'Dersi tamamladın', goals: 'Etkinlik hedeflerini bitirdin', open: 'Dersi açtın' } as const
const EVENT_ICON: Record<'done' | 'goals' | 'open', IconName> = { done: 'check', goals: 'target', open: 'play' }

function Feed({ catalog }: { catalog: CatalogModule[] }) {
  const done = useDoneIds()
  const act = useActivity()
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => { setNow(Date.now()) }, [act])
  const ev = useMemo(() => buildEvents(catalog, act, done, 6), [catalog, act, done])
  return (
    <section className="panel" aria-labelledby="etkin-b">
      <h2 id="etkin-b" className="panel-title">Son etkinlikler</h2>
      {ev.length === 0 ? (
        <div className="empty">
          <Icon name="clock" size={28} />
          <p><b>Henüz etkinlik yok.</b></p>
          <p className="muted">Bir ders açtığında ya da bitirdiğinde burada listelenir.</p>
        </div>
      ) : (
        <ul className="feed">
          {ev.map((e) => (
            <li key={e.key}>
              <Link href={`/ders/${e.item.lesson.id}`} className="feed-row">
                <span className={`feed-icon feed-${e.type}`} aria-hidden="true"><Icon name={EVENT_ICON[e.type]} size={16} /></span>
                <span className="plan-text"><b>{e.item.lesson.title}</b><small>{EVENT_TEXT[e.type]} · Modül {e.item.modulePosition}</small></span>
                <time className="feed-time" dateTime={new Date(e.at).toISOString()}>{now ? timeAgo(e.at, now) : ''}</time>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

const TOOLS: { href: string; icon: IconName; title: string; text: string }[] = [
  { href: '/atolye', icon: 'atolye', title: 'Blok atölyesi', text: 'Blokları sürükle, karakterini programla.' },
  { href: '/laboratuvar', icon: 'laboratuvar', title: 'Devre laboratuvarı', text: 'Sanal Arduino ile devre kur, kod yaz, çalıştır.' },
  { href: '/arena', icon: 'arena', title: 'Robot arenası', text: 'Kodunla sanal robotu pistte sür.' },
  { href: '/oyunlar', icon: 'oyun', title: 'Oyunlar', text: 'Bloklarla çöz: labirent, kuş, bulmaca ve daha fazlası.' },
  { href: '/mikro-kart', icon: 'mikro', title: 'Mikro Kart', text: 'Sanal mikro kartı bloklarla programla.' },
  { href: '/oyun-atolyesi', icon: 'oyun', title: 'Oyun atölyesi', text: 'Kendi oyununu tasarla ve çiz.' },
  { href: '/sahne-atolyesi', icon: 'sahne', title: 'Sahne atölyesi', text: 'Sahneyi kur, karakterleri hareket ettir.' },
  { href: '/ai-atolyesi', icon: 'ai', title: 'AI atölyesi', text: 'Yapay zekâyı dene ve eğit.' },
  { href: '/parcalar', icon: 'parcalar', title: 'Parçalar', text: 'Elektronik parçaları ve özelliklerini incele.' },
]

function QuickTools() {
  return (
    <section aria-labelledby="arac-b">
      <h2 id="arac-b" className="section-title">Araçlara hızlı erişim</h2>
      <div className="tools">
        {TOOLS.map((t) => (
          <Link key={t.href} href={t.href} className="tool">
            <span className="tool-icon" aria-hidden="true"><Icon name={t.icon} size={24} /></span>
            <span><b>{t.title}</b><small>{t.text}</small></span>
            <Icon name="arrowRight" size={18} className="tool-go" />
          </Link>
        ))}
      </div>
    </section>
  )
}

export function Dashboard({ catalog }: { catalog: CatalogModule[] }) {
  const soon = UPCOMING.filter((u) => !catalog.some((m) => m.slug === u.slug))
  return (
    <div className="page dash">
      <header className="page-title">
        <h1>Panel</h1>
        <p className="muted">Öğrenme yolunun özeti. İlerlemen bu tarayıcıda saklanır.</p>
      </header>

      <div className="dash-top">
        <ContinueCard catalog={catalog} />
        <Ring catalog={catalog} />
      </div>

      <section aria-labelledby="mod-b">
        <div className="section-head">
          <h2 id="mod-b" className="section-title">Modüller</h2>
          <Link href="/moduller" className="link-more">Tümünü gör <Icon name="arrowRight" size={16} /></Link>
        </div>
        {catalog.length === 0 ? (
          <div className="panel"><p>Modüller yüklenemedi. Veritabanı bağlantısını kontrol et.</p></div>
        ) : (
          <div className="mgrid">
            {catalog.map((m) => <ModuleCard key={m.id} m={m} />)}
            {soon.map((u) => <div key={u.slug} id="yakinda"><SoonCard u={u} /></div>)}
          </div>
        )}
      </section>

      <div className="dash-two">
        <WeekPlan catalog={catalog} />
        <Feed catalog={catalog} />
      </div>

      <QuickTools />

      <Stats catalog={catalog} />
    </div>
  )
}
