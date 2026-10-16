'use client'
import type { AiEvaluation } from '@/lib/ai/activity'
import { useT } from '@/i18n/client'

export function GoalsPanel({ evaluation }: { evaluation: AiEvaluation }) {
  const t = useT()
  const done = evaluation.results.filter((r) => r.ok).length
  return (
    <section className="ai-card ai-goals" aria-label={t('studios.ai.goals.title')} data-testid="ai-goals">
      <h3>{t('studios.ai.goals.title')} <span className="chip" data-ok={evaluation.allPassed}>{done}/{evaluation.results.length}</span></h3>
      <ul>
        {evaluation.results.map((g) => (
          <li key={g.id} data-ok={g.ok}>
            <span className="ai-goal-mark" aria-hidden="true">{g.ok ? '✓' : '○'}</span>
            <span>
              <span className="ai-goal-label">{g.label}</span>
              <span className="ai-sr">{g.ok ? t('studios.ai.goals.done') : t('studios.ai.goals.notDone')}</span>
              {!g.ok && g.hint && <span className="ai-goal-hint">{g.hint}</span>}
            </span>
          </li>
        ))}
      </ul>
      {evaluation.allPassed && <p className="ai-goals-ok" role="status">{t('studios.ai.goals.allDone')}</p>}
    </section>
  )
}
