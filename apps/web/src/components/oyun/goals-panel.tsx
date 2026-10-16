'use client'
import { useLocale, useT } from '@/i18n/client'
import type { GoalEvaluation } from '@/lib/oyun/activity'
import { oyunErrorText } from '@/lib/oyun/i18n-en'

export function GoalsPanel({ evaluation, onShowBlock }: { evaluation: GoalEvaluation | null; onShowBlock: (id: string | null | undefined) => void }) {
  const t = useT()
  const locale = useLocale()
  if (!evaluation) return <p className="oy-goals-empty" aria-live="polite">{t('studios.oyun.goals.checking')}</p>
  const done = evaluation.results.filter((r) => r.ok).length
  return (
    <section className="oy-goals" aria-label={t('studios.oyun.goals.title')} data-testid="oyun-goals">
      <h3>{t('studios.oyun.goals.title')} <span className="chip" data-ok={evaluation.allPassed}>{done}/{evaluation.results.length}</span></h3>
      <ul>
        {evaluation.results.map((g) => (
          <li key={g.id} data-ok={g.ok}>
            <span className="oy-goal-mark" aria-hidden="true">{g.ok ? '✓' : '○'}</span>
            <span>
              <span className="oy-goal-label">{g.label}</span>
              <span className="sr-only">{g.ok ? t('studios.oyun.goals.done') : t('studios.oyun.goals.notDone')}</span>
              {!g.ok && g.hint && <span className="oy-goal-hint">{g.hint}</span>}
            </span>
          </li>
        ))}
      </ul>
      {evaluation.error && (
        <p className="oy-goals-err" role="alert">
          {t('studios.oyun.goals.error', { error: oyunErrorText(evaluation.report.error ?? '', locale) })}
          {evaluation.report.engine.error?.blockId && <button type="button" className="oy-link" onClick={() => onShowBlock(evaluation.report.engine.error?.blockId)}>{t('studios.oyun.editor.showBlock')}</button>}
        </p>
      )}
      {evaluation.allPassed && <p className="oy-goals-ok" role="status">{t('studios.oyun.goals.allDone')}</p>}
    </section>
  )
}
