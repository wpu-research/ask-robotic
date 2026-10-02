'use client'
import type { AiEvaluation } from '@/lib/ai/activity'

export function GoalsPanel({ evaluation }: { evaluation: AiEvaluation }) {
  const done = evaluation.results.filter((r) => r.ok).length
  return (
    <section className="ai-card ai-goals" aria-label="Hedefler" data-testid="ai-goals">
      <h3>Hedefler <span className="chip" data-ok={evaluation.allPassed}>{done}/{evaluation.results.length}</span></h3>
      <ul>
        {evaluation.results.map((g) => (
          <li key={g.id} data-ok={g.ok}>
            <span className="ai-goal-mark" aria-hidden="true">{g.ok ? '✓' : '○'}</span>
            <span>
              <span className="ai-goal-label">{g.label}</span>
              <span className="ai-sr">{g.ok ? ' (tamamlandı)' : ' (tamamlanmadı)'}</span>
              {!g.ok && g.hint && <span className="ai-goal-hint">{g.hint}</span>}
            </span>
          </li>
        ))}
      </ul>
      {evaluation.allPassed && <p className="ai-goals-ok" role="status">Harika! Bütün hedefleri tamamladın.</p>}
    </section>
  )
}
