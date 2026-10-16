'use client'
import Link from 'next/link'
import type { CatalogModule } from '@/lib/catalog'
import { moduleLessonIds, countDone, moduleState } from '@/lib/dashboard'
import { ageLabel, TRACKS, type UpcomingModule } from '@/lib/module-meta'
import { hoursLabel } from '@/lib/format'
import { useActivity } from '@/lib/activity-store'
import { useDoneIds } from '@/lib/progress-store'
import { Icon } from './shell/icons'
import { KindBadge, StatusPill } from './badges'
import { Art, MODULE_ART } from './kids/art'

export function ModuleCard({ m }: { m: CatalogModule }) {
  const done = useDoneIds()
  const act = useActivity()
  const ids = moduleLessonIds(m)
  const c = countDone(ids, done)
  const state = moduleState(ids, done, act.opened)
  const minutes = m.weeks.reduce((n, w) => n + w.lessons.reduce((k, l) => k + l.durationMin, 0), 0)
  const age = ageLabel(m.slug, m.minAge)
  return (
    <Link href={`/moduller/${m.slug}`} className={`mcard track-${m.track}`}>
      <Art kind={MODULE_ART[m.slug] ?? 'blok'} className="mcard-art" />
      <div className="mcard-top">
        <span className="mcard-no">{age ?? `${ids.length} ders`}</span>
        <KindBadge kind={m.kind} />
      </div>
      <h3>{m.title}</h3>
      <p className="mcard-desc">{m.tagline}</p>
      <ul className="facts" aria-label="Modül bilgisi">
        <li>{ids.length} ders</li>
        <li>~{hoursLabel(minutes)}</li>
      </ul>
      <div className="mcard-foot">
        <div className="progress">
          <div className="progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={ids.length} aria-valuenow={c.done} aria-label={`Modül ${m.position} ilerleme`}>
            <div className="progress-fill" style={{ width: `${c.pct}%` }} />
          </div>
          <span className="progress-label">{c.done} / {ids.length}</span>
        </div>
        <div className="mcard-state">
          <StatusPill status={state} />
          <span className="mcard-go">{state === 'yok' ? 'Başla' : state === 'bitti' ? 'Gözden geçir' : 'Devam et'}<Icon name="arrowRight" size={16} /></span>
        </div>
      </div>
    </Link>
  )
}

export function SoonCard({ u }: { u: UpcomingModule }) {
  return (
    <div className={`mcard mcard-soon track-${u.track}`} aria-disabled="true">
      <div className="mcard-top">
        <span className="mcard-no">Modül {u.position}</span>
        <span className="badge-soon"><Icon name="lock" size={12} />Yakında</span>
      </div>
      <h3>{u.title}</h3>
      <p className="mcard-desc">{u.description}</p>
      <ul className="facts"><li>{TRACKS[u.track].label}</li><li>{u.status}</li></ul>
    </div>
  )
}
