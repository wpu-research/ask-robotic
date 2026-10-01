'use client'
import type { GoalStatus } from '@/lib/jr/analysis'

export function GoalsPanel({ status }: { status: GoalStatus[] }) {
  if (!status.length) return null
  const done = status.filter((g) => g.done).length
  const all = done === status.length
  return (
    <section className={`jr-goals${all ? ' all' : ''}`} aria-label="Hedefler">
      <div className="jr-goals-head">
        <b>Hedefler</b>
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
      {all && <p className="jr-goals-ok">Tüm hedefler tamam. Harika iş!</p>}
    </section>
  )
}
