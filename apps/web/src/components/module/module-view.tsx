'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { CatalogModule, CatalogWeek } from '@/lib/catalog'
import { useActivity } from '@/lib/activity-store'
import { countDone, lastOpenedLesson, flattenCatalog, lessonStatus, moduleLessonIds } from '@/lib/dashboard'
import { MODULE_META } from '@/lib/module-meta'
import { localizedAgeLabel, localizeModule, moduleCallout } from '@/lib/catalog-en'
import { useFormat, useLocale, useT } from '@/i18n/client'
import { useDoneIds } from '@/lib/progress-store'
import { KindBadge, LessonKindBadge, StatusPill } from '../badges'
import { Icon } from '../shell/icons'
import { LessonMarkdown } from '@/app/ders/[id]/lesson-markdown'
import { CourseMap } from './course-map'

const isProject = (t: string) => /^(Proje|Bitirme)/.test(t)

function WeekProgress({ w }: { w: CatalogWeek }) {
  const done = useDoneIds()
  const t = useT()
  const ids = w.lessons.map((l) => l.id)
  const c = countDone(ids, done)
  return (
    <span className="wk-prog">
      <span className="progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={ids.length} aria-valuenow={c.done} aria-label={t('moduleView.weekProgress', { n: w.position })}><span className="progress-fill" style={{ width: `${c.pct}%`, display: 'block' }} /></span>
      <span className="progress-label">{c.done}/{ids.length}</span>
    </span>
  )
}

export function ModuleView({ m: mTr, guides = {} }: { m: CatalogModule; /** Hafta sırası -> haftalık çalışma rehberi (Markdown). */ guides?: Record<number, string> }) {
  const done = useDoneIds()
  const act = useActivity()
  const t = useT()
  const locale = useLocale()
  const fmt = useFormat()
  // Modül adı, tanıtım, kitle ve hafta adları dile göre (lib/catalog-en.ts); ders başlıkları Türkçe kalır
  const m = localizeModule(mTr, locale)
  const meta = MODULE_META[m.slug] ? { audience: m.audience || MODULE_META[m.slug].audience, callout: moduleCallout(m.slug, locale) } : undefined
  const ids = moduleLessonIds(m)
  const c = countDone(ids, done)
  const minutes = m.weeks.reduce((n, w) => n + w.lessons.reduce((k, l) => k + l.durationMin, 0), 0)
  const age = localizedAgeLabel(m.slug, m.minAge, locale)

  // Devam noktası: modüldeki son açılan bitmemiş ders, yoksa ilk yapılmamış ders.
  const flat = flattenCatalog([m])
  const last = lastOpenedLesson(flat, act.opened)
  const target = last && !done.has(last.lesson.id) ? last : flat.find((f) => !done.has(f.lesson.id)) ?? null
  const targetWeek = target?.weekPosition

  const [open, setOpen] = useState<Set<number>>(() => new Set(m.weeks[0] ? [m.weeks[0].position] : []))
  useEffect(() => { if (targetWeek) setOpen(new Set([targetWeek])) }, [targetWeek, m.slug])
  const allOpen = open.size === m.weeks.length
  const [view, setView] = useState<'harita' | 'liste'>('harita')
  const showWeek = (p: number) => {
    setView('liste'); setOpen(new Set([p]))
    requestAnimationFrame(() => document.getElementById(`hafta-${p}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }
  const toggle = (p: number) => setOpen((s) => { const n = new Set(s); if (n.has(p)) n.delete(p); else n.add(p); return n })

  return (
    <div className={`page track-${m.track}`}>
      <nav aria-label={t('moduleView.crumbs')} className="crumbs"><Link href="/moduller">{t('moduleView.modules')}</Link><Icon name="chevronRight" size={14} /><span aria-current="page">{m.title}</span></nav>

      <header className="mod-head">
        <div className="mod-head-main">
          <div className="mod-tags">
            <span className="mcard-no">{t('moduleView.moduleNo', { n: m.position })}</span>
            <KindBadge kind={m.kind} />
            <span className="chip chip-track">{t(`moduleView.track.${m.track}`)}</span>
          </div>
          <h1>{m.title}</h1>
          <p className="lead">{m.tagline}</p>
          <ul className="facts" aria-label={t('moduleView.facts')}>
            <li>{t('moduleView.lessons', { n: ids.length })}</li><li>{t('moduleView.weeks', { n: m.weeks.length })}</li><li>~{fmt.duration(minutes)}</li>{age && <li>{age}</li>}
          </ul>
        </div>
        <div className="panel mod-progress">
          <div className="mod-progress-top"><b>%{c.pct}</b><span>{t('moduleView.progressOf', { done: c.done, total: ids.length })}</span></div>
          <div className="progress-track big" role="progressbar" aria-valuemin={0} aria-valuemax={ids.length} aria-valuenow={c.done} aria-label={t('moduleView.progressLabel')}><div className="progress-fill" style={{ width: `${c.pct}%` }} /></div>
          {target ? (
            <Link className="btn btn-primary btn-block" href={`/ders/${target.lesson.id}`}>
              {c.done === 0 && target === flat[0] ? t('moduleView.start') : t('moduleView.continue')}<Icon name="arrowRight" size={18} />
            </Link>
          ) : ids.length ? <p className="muted ok-line"><Icon name="check" size={16} /> {t('moduleView.completed')}</p> : null}
          {target && <p className="mod-next"><small>{t('moduleView.next')}</small>{target.lesson.title}</p>}
        </div>
      </header>

      {(meta?.audience || meta?.callout) && (
        <aside className="know" aria-labelledby="bilmen">
          <span className="know-icon" aria-hidden="true"><Icon name="spark" size={20} /></span>
          <div>
            <h2 id="bilmen">{t('moduleView.knowTitle')}</h2>
            {meta.audience && <p><b>{t('moduleView.audience')}</b> {meta.audience}</p>}
            {meta.callout && <p>{meta.callout}</p>}
          </div>
        </aside>
      )}

      <div className="section-head">
        <h2 className="section-title">{t('moduleView.weeksTitle')}</h2>
        <div className="seg" role="group" aria-label={t('moduleView.viewGroup')}>
          <button type="button" aria-pressed={view === 'harita'} onClick={() => setView('harita')}>{t('moduleView.viewMap')}</button>
          <button type="button" aria-pressed={view === 'liste'} onClick={() => setView('liste')}>{t('moduleView.viewList')}</button>
        </div>
        {view === 'liste' && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(allOpen ? new Set() : new Set(m.weeks.map((w) => w.position)))}>
            {allOpen ? t('moduleView.closeAll') : t('moduleView.openAll')}
          </button>
        )}
      </div>

      {view === 'harita' && <CourseMap m={m} nextId={target?.lesson.id ?? null} onWeekReview={showWeek} />}
      <ol className="timeline" style={view === 'liste' ? undefined : { display: 'none' }}>
        {m.weeks.map((w) => {
          const isOpen = open.has(w.position)
          const wc = countDone(w.lessons.map((l) => l.id), done)
          const panelId = `hafta-${w.position}`
          return (
            <li key={w.id} className="tl-item" data-state={wc.pct === 100 ? 'bitti' : wc.done > 0 ? 'suruyor' : 'yok'}>
              <span className="tl-node" aria-hidden="true">{wc.pct === 100 ? <Icon name="check" size={14} /> : w.position}</span>
              <div className="week">
                <h3 className="week-h">
                  <button type="button" className="week-btn" aria-expanded={isOpen} aria-controls={panelId} onClick={() => toggle(w.position)}>
                    <span className="week-main">
                      <span className="week-no">{t('moduleView.weekNo', { n: w.position })}</span>
                      <span className="week-title">{w.title}</span>
                      {w.project && <span className="chip">{t('moduleView.project', { name: w.project })}</span>}
                    </span>
                    <WeekProgress w={w} />
                    <Icon name="chevronDown" className="week-chev" />
                  </button>
                </h3>
                <div id={panelId} role="region" aria-label={t('moduleView.weekLessons', { n: w.position })} hidden={!isOpen}>
                  {guides[w.position] && (
                    <details className="wk-guide">
                      <summary><Icon name="book" size={16} /> {t('moduleView.weeklyGuide')} <small>{t('moduleView.weeklyGuideSub')}</small></summary>
                      <LessonMarkdown>{guides[w.position]}</LessonMarkdown>
                    </details>
                  )}
                  <ol className="lessons">
                    {w.lessons.map((l, i) => {
                      const st = lessonStatus(l.id, done, act.opened)
                      return (
                        <li key={l.id} className="lesson-row">
                          <Link href={`/ders/${l.id}`} className={target?.lesson.id === l.id ? 'is-next' : undefined}>
                            <span className="lesson-n">{i + 1}</span>
                            <span className="lesson-title">{l.title}{isProject(l.title) && <> <span className="project-badge">{t('moduleView.projectBadge')}</span></>}</span>
                            <LessonKindBadge kind={l.kind} />
                            <span className="lesson-dur"><Icon name="clock" size={14} />{t('moduleView.minutes', { n: l.durationMin })}</span>
                            <StatusPill status={st} />
                          </Link>
                        </li>
                      )
                    })}
                  </ol>
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
