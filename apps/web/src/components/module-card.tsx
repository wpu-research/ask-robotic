'use client'
import Link from 'next/link'
import type { CatalogModule } from '@/lib/catalog'
import { moduleLessonIds, countDone, moduleState } from '@/lib/dashboard'
import type { UpcomingModule } from '@/lib/module-meta'
import { localizedAgeLabel, localizeModule } from '@/lib/catalog-en'
import { useFormat, useLocale, useT } from '@/i18n/client'
import { useActivity } from '@/lib/activity-store'
import { useDoneIds } from '@/lib/progress-store'
import { Icon } from './shell/icons'
import { KindBadge, StatusPill } from './badges'
import { Art, MODULE_ART } from './kids/art'

export function ModuleCard({ m: mTr }: { m: CatalogModule }) {
  const t = useT()
  const locale = useLocale()
  const fmt = useFormat()
  // Modül adı ve tanıtım dile göre (lib/catalog-en.ts)
  const m = localizeModule(mTr, locale)
  const done = useDoneIds()
  const act = useActivity()
  const ids = moduleLessonIds(m)
  const c = countDone(ids, done)
  const state = moduleState(ids, done, act.opened)
  const minutes = m.weeks.reduce((n, w) => n + w.lessons.reduce((k, l) => k + l.durationMin, 0), 0)
  const age = localizedAgeLabel(m.slug, m.minAge, locale)
  return (
    <Link href={`/moduller/${m.slug}`} className={`mcard track-${m.track}`}>
      <Art kind={MODULE_ART[m.slug] ?? 'blok'} className="mcard-art" />
      <div className="mcard-top">
        <span className="mcard-no">{age ?? t('moduleView.lessons', { n: ids.length })}</span>
        <KindBadge kind={m.kind} />
      </div>
      <h3>{m.title}</h3>
      <p className="mcard-desc">{m.tagline}</p>
      <ul className="facts" aria-label={t('moduleView.facts')}>
        <li>{t('moduleView.lessons', { n: ids.length })}</li>
        <li>~{fmt.duration(minutes)}</li>
      </ul>
      <div className="mcard-foot">
        <div className="progress">
          <div className="progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={ids.length} aria-valuenow={c.done} aria-label={t('content.card.progressLabel', { n: m.position })}>
            <div className="progress-fill" style={{ width: `${c.pct}%` }} />
          </div>
          <span className="progress-label">{c.done} / {ids.length}</span>
        </div>
        <div className="mcard-state">
          <StatusPill status={state} />
          <span className="mcard-go">{state === 'yok' ? t('moduleView.start') : state === 'bitti' ? t('content.card.review') : t('moduleView.continue')}<Icon name="arrowRight" size={16} /></span>
        </div>
      </div>
    </Link>
  )
}

export function SoonCard({ u }: { u: UpcomingModule }) {
  const t = useT()
  return (
    <div className={`mcard mcard-soon track-${u.track}`} aria-disabled="true">
      <div className="mcard-top">
        <span className="mcard-no">{t('moduleView.moduleNo', { n: u.position })}</span>
        <span className="badge-soon"><Icon name="lock" size={12} />{t('content.card.soon')}</span>
      </div>
      <h3>{u.title}</h3>
      <p className="mcard-desc">{u.description}</p>
      <ul className="facts"><li>{t(`moduleView.track.${u.track}`)}</li><li>{u.status}</li></ul>
    </div>
  )
}
