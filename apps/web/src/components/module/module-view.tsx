'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { CatalogModule, CatalogWeek } from '@/lib/catalog'
import { useActivity } from '@/lib/activity-store'
import { countDone, lastOpenedLesson, flattenCatalog, lessonStatus, moduleLessonIds } from '@/lib/dashboard'
import { hoursLabel } from '@/lib/format'
import { ageLabel, MODULE_META, TRACKS } from '@/lib/module-meta'
import { useDoneIds } from '@/lib/progress-store'
import { KindBadge, LessonKindBadge, StatusPill } from '../badges'
import { Icon } from '../shell/icons'

const isProject = (t: string) => /^(Proje|Bitirme)/.test(t)

function WeekProgress({ w }: { w: CatalogWeek }) {
  const done = useDoneIds()
  const ids = w.lessons.map((l) => l.id)
  const c = countDone(ids, done)
  return (
    <span className="wk-prog">
      <span className="progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={ids.length} aria-valuenow={c.done} aria-label={`${w.position}. hafta ilerleme`}><span className="progress-fill" style={{ width: `${c.pct}%`, display: 'block' }} /></span>
      <span className="progress-label">{c.done}/{ids.length}</span>
    </span>
  )
}

export function ModuleView({ m }: { m: CatalogModule }) {
  const done = useDoneIds()
  const act = useActivity()
  const meta = MODULE_META[m.slug]
  const ids = moduleLessonIds(m)
  const c = countDone(ids, done)
  const minutes = m.weeks.reduce((n, w) => n + w.lessons.reduce((k, l) => k + l.durationMin, 0), 0)
  const age = ageLabel(m.slug, m.minAge)

  // Devam noktası: modüldeki son açılan bitmemiş ders, yoksa ilk yapılmamış ders.
  const flat = flattenCatalog([m])
  const last = lastOpenedLesson(flat, act.opened)
  const target = last && !done.has(last.lesson.id) ? last : flat.find((f) => !done.has(f.lesson.id)) ?? null
  const targetWeek = target?.weekPosition

  const [open, setOpen] = useState<Set<number>>(() => new Set(m.weeks[0] ? [m.weeks[0].position] : []))
  useEffect(() => { if (targetWeek) setOpen(new Set([targetWeek])) }, [targetWeek, m.slug])
  const allOpen = open.size === m.weeks.length
  const toggle = (p: number) => setOpen((s) => { const n = new Set(s); if (n.has(p)) n.delete(p); else n.add(p); return n })

  return (
    <div className={`page track-${m.track}`}>
      <nav aria-label="Konum" className="crumbs"><Link href="/moduller">Modüller</Link><Icon name="chevronRight" size={14} /><span aria-current="page">{m.title}</span></nav>

      <header className="mod-head">
        <div className="mod-head-main">
          <div className="mod-tags">
            <span className="mcard-no">Modül {m.position}</span>
            <KindBadge kind={m.kind} />
            <span className="chip chip-track">{TRACKS[m.track].label}</span>
          </div>
          <h1>{m.title}</h1>
          <p className="lead">{m.tagline}</p>
          <ul className="facts" aria-label="Modül bilgisi">
            <li>{ids.length} ders</li><li>{m.weeks.length} hafta</li><li>~{hoursLabel(minutes)}</li>{age && <li>{age}</li>}
          </ul>
        </div>
        <div className="panel mod-progress">
          <div className="mod-progress-top"><b>%{c.pct}</b><span>{c.done} / {ids.length} ders</span></div>
          <div className="progress-track big" role="progressbar" aria-valuemin={0} aria-valuemax={ids.length} aria-valuenow={c.done} aria-label="Modül ilerlemesi"><div className="progress-fill" style={{ width: `${c.pct}%` }} /></div>
          {target ? (
            <Link className="btn btn-primary btn-block" href={`/ders/${target.lesson.id}`}>
              {c.done === 0 && target === flat[0] ? 'Başla' : 'Devam et'}<Icon name="arrowRight" size={18} />
            </Link>
          ) : ids.length ? <p className="muted ok-line"><Icon name="check" size={16} /> Modülü tamamladın</p> : null}
          {target && <p className="mod-next"><small>Sıradaki</small>{target.lesson.title}</p>}
        </div>
      </header>

      {(meta?.audience || meta?.callout) && (
        <aside className="know" aria-labelledby="bilmen">
          <span className="know-icon" aria-hidden="true"><Icon name="spark" size={20} /></span>
          <div>
            <h2 id="bilmen">Bilmen gerekenler</h2>
            {meta.audience && <p><b>Kimler için:</b> {meta.audience}</p>}
            {meta.callout && <p>{meta.callout}</p>}
          </div>
        </aside>
      )}

      <div className="section-head">
        <h2 className="section-title">Haftalar</h2>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(allOpen ? new Set() : new Set(m.weeks.map((w) => w.position)))}>
          {allOpen ? 'Hepsini kapat' : 'Hepsini aç'}
        </button>
      </div>

      <ol className="timeline">
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
                      <span className="week-no">{w.position}. hafta</span>
                      <span className="week-title">{w.title}</span>
                      {w.project && <span className="chip">Proje: {w.project}</span>}
                    </span>
                    <WeekProgress w={w} />
                    <Icon name="chevronDown" className="week-chev" />
                  </button>
                </h3>
                <div id={panelId} role="region" aria-label={`${w.position}. hafta dersleri`} hidden={!isOpen}>
                  <ol className="lessons">
                    {w.lessons.map((l, i) => {
                      const st = lessonStatus(l.id, done, act.opened)
                      return (
                        <li key={l.id} className="lesson-row">
                          <Link href={`/ders/${l.id}`} className={target?.lesson.id === l.id ? 'is-next' : undefined}>
                            <span className="lesson-n">{i + 1}</span>
                            <span className="lesson-title">{l.title}{isProject(l.title) && <> <span className="project-badge">proje</span></>}</span>
                            <LessonKindBadge kind={l.kind} />
                            <span className="lesson-dur"><Icon name="clock" size={14} />{l.durationMin} dk</span>
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
