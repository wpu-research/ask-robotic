'use client'
import Link from 'next/link'
import { useDoneIds } from '@/lib/progress-store'
import { useT } from '@/i18n/client'

export function ProgressBar({ ids, label = true }: { ids: number[]; label?: boolean }) {
  const t = useT()
  const done = useDoneIds()
  const n = ids.filter((i) => done.has(i)).length
  const pct = ids.length ? Math.round((n / ids.length) * 100) : 0
  return (
    <div className="progress">
      <div className="progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={ids.length} aria-valuenow={n} aria-label={t('content.progressBar.label', { n, total: ids.length })}>
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      {label && <span className="progress-label">{n} / {ids.length}</span>}
    </div>
  )
}

export function LessonCheck({ id }: { id: number }) {
  const t = useT()
  const done = useDoneIds()
  return done.has(id) ? <span className="check" title={t('content.progressBar.done')} aria-label={t('content.progressBar.done')}>✓</span> : null
}

export function ContinueButton({ lessonIds, className = 'btn btn-primary' }: { lessonIds: number[]; className?: string }) {
  const t = useT()
  const done = useDoneIds()
  const next = lessonIds.find((i) => !done.has(i))
  const started = lessonIds.some((i) => done.has(i))
  if (!lessonIds.length) return null
  if (next === undefined) return <Link className="btn btn-ghost" href={`/ders/${lessonIds[0]}`}>{t('content.progressBar.restart')}</Link>
  return <Link className={className} href={`/ders/${next}`}>{started ? t('moduleView.continue') : t('moduleView.start')} →</Link>
}
