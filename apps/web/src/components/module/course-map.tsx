'use client'
import Link from 'next/link'
import type { CatalogModule } from '@/lib/catalog'
import { useDoneIds } from '@/lib/progress-store'
import { Mascot } from '../lesson-v2/mascot'
import { useT } from '@/i18n/client'

// Disklerin yatay kayması: zikzak yol (Brilliant kurs haritası gibi).
const OFFSETS = [0, 56, 84, 56, 0, -56, -84, -56]

/**
 * Kurs haritası: her hafta bir "seviye" başlığı, dersler zikzak diskler, hafta sonunda tekrar düğümü.
 * Sıradaki derste Mac durur ve "Başla" kartı çıkar. Etkileşimli (v2) dersler ✦ ile işaretlenir.
 */
export function CourseMap({ m, nextId, onWeekReview }: { m: CatalogModule; nextId: number | null; onWeekReview: (week: number) => void }) {
  const done = useDoneIds()
  const t = useT()
  let k = 0
  return (
    <ol className="cmap" aria-label={t('moduleView.mapLabel')}>
      {m.weeks.map((w) => (
        <li key={w.id} className="cmap-level">
          <div className="cmap-head"><small>{t('moduleView.mapWeek', { n: w.position })}</small><b>{w.title}</b>{w.project && <span>{t('moduleView.project', { name: w.project })}</span>}</div>
          <ol className="cmap-path">
            {w.lessons.map((l) => {
              const off = OFFSETS[k++ % OFFSETS.length]
              const isDone = done.has(l.id)
              const isNext = l.id === nextId
              return (
                <li key={l.id} style={{ transform: `translateX(${off}px)` }} className={`cmap-node ${isDone ? 'done' : ''} ${isNext ? 'next' : ''}`}>
                  {isNext && <span className="cmap-robi" aria-hidden="true"><Mascot size={44} mood="happy" /></span>}
                  <Link href={`/ders/${l.id}`} className="cmap-disc" aria-label={`${l.title}${isDone ? t('moduleView.mapDone') : isNext ? t('moduleView.mapNext') : ''}`}>
                    <span aria-hidden="true">{isDone ? '✓' : l.steps ? '✦' : ''}</span>
                  </Link>
                  <span className="cmap-label">{l.title}{l.steps ? <small>{t('moduleView.mapSteps', { n: l.steps })}</small> : <small>{t('moduleView.minutes', { n: l.durationMin })}</small>}</span>
                  {isNext && (
                    <div className="cmap-pop">
                      <b>{l.title}</b>
                      <Link className="v2-btn accent" href={`/ders/${l.id}`}>{done.size ? t('moduleView.continue') : t('moduleView.start')}</Link>
                    </div>
                  )}
                </li>
              )
            })}
            <li className="cmap-node review" style={{ transform: `translateX(${OFFSETS[k++ % OFFSETS.length]}px)` }}>
              <button type="button" className="cmap-disc star" onClick={() => onWeekReview(w.position)} aria-label={t('moduleView.mapReviewLabel', { n: w.position })}><span aria-hidden="true">★</span></button>
              <span className="cmap-label">{t('moduleView.mapReview')}<small>{t('moduleView.mapReviewSub')}</small></span>
            </li>
          </ol>
        </li>
      ))}
    </ol>
  )
}
