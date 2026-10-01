'use client'
import Link from 'next/link'
import { useDoneIds } from '@/lib/progress-store'

export function ProgressBar({ ids, label = true }: { ids: number[]; label?: boolean }) {
  const done = useDoneIds()
  const n = ids.filter((i) => done.has(i)).length
  const pct = ids.length ? Math.round((n / ids.length) * 100) : 0
  return (
    <div className="progress">
      <div className="progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={ids.length} aria-valuenow={n} aria-label={`${n} / ${ids.length} ders tamamlandı`}>
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      {label && <span className="progress-label">{n} / {ids.length}</span>}
    </div>
  )
}

export function LessonCheck({ id }: { id: number }) {
  const done = useDoneIds()
  return done.has(id) ? <span className="check" title="Tamamlandı" aria-label="Tamamlandı">✓</span> : null
}

export function ContinueButton({ lessonIds, className = 'btn btn-primary' }: { lessonIds: number[]; className?: string }) {
  const done = useDoneIds()
  const next = lessonIds.find((i) => !done.has(i))
  const started = lessonIds.some((i) => done.has(i))
  if (!lessonIds.length) return null
  if (next === undefined) return <Link className="btn btn-ghost" href={`/ders/${lessonIds[0]}`}>Baştan gözden geçir</Link>
  return <Link className={className} href={`/ders/${next}`}>{started ? 'Devam et' : 'Başla'} →</Link>
}
