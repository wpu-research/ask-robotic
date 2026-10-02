'use client'
import type { GoalEvaluation } from '@/lib/oyun/activity'

export function GoalsPanel({ evaluation, onShowBlock }: { evaluation: GoalEvaluation | null; onShowBlock: (id: string | null | undefined) => void }) {
  if (!evaluation) return <p className="oy-goals-empty" aria-live="polite">Hedefler denetleniyor…</p>
  const done = evaluation.results.filter((r) => r.ok).length
  return (
    <section className="oy-goals" aria-label="Hedefler" data-testid="oyun-goals">
      <h3>Hedefler <span className="chip" data-ok={evaluation.allPassed}>{done}/{evaluation.results.length}</span></h3>
      <ul>
        {evaluation.results.map((g) => (
          <li key={g.id} data-ok={g.ok}>
            <span className="oy-goal-mark" aria-hidden="true">{g.ok ? '✓' : '○'}</span>
            <span>
              <span className="oy-goal-label">{g.label}</span>
              <span className="sr-only">{g.ok ? ' (tamamlandı)' : ' (tamamlanmadı)'}</span>
              {!g.ok && g.hint && <span className="oy-goal-hint">{g.hint}</span>}
            </span>
          </li>
        ))}
      </ul>
      {evaluation.error && (
        <p className="oy-goals-err" role="alert">
          Programın hata veriyor: {evaluation.report.error}
          {evaluation.report.engine.error?.blockId && <button type="button" className="oy-link" onClick={() => onShowBlock(evaluation.report.engine.error?.blockId)}>Bloğu göster</button>}
        </p>
      )}
      {evaluation.allPassed && <p className="oy-goals-ok" role="status">Harika! Bütün hedefleri tamamladın.</p>}
    </section>
  )
}
