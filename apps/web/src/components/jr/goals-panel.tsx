'use client'
import type { GoalStatus } from '@/lib/jr/analysis'
import { useT } from '@/i18n/client'

export function GoalsPanel({ status }: { status: GoalStatus[] }) {
  const t = useT()
  if (!status.length) return null
  const done = status.filter((g) => g.done).length
  const all = done === status.length
  return (
    <section className={`jr-goals${all ? ' all' : ''}`} aria-label={t('studios.jr.goals.aria')}>
      <div className="jr-goals-head">
        <b>{t('studios.jr.goals.title')}</b>
        <span>{done} / {status.length}</span>
      </div>
      <ul>
        {status.map((g) => (
          <li key={g.id} className={g.done ? 'done' : undefined} data-goal={g.id} data-done={g.done}>
            <span className="jr-goal-mark" aria-hidden="true">{g.done ? '✓' : ''}</span>
            <span>
              {g.text}
              {!g.done && g.hint && <small>{g.hint}</small>}
            </span>
          </li>
        ))}
      </ul>
      {all && <p className="jr-goals-ok">{t('studios.jr.goals.allDone')}</p>}
    </section>
  )
}
