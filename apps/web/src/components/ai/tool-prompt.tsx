'use client'
import { useMemo } from 'react'
import type { PromptState } from '@/lib/ai/activity'
import { PROMPT_TASKS, RULES, lintPrompt, onTopic } from '@/lib/ai/promptlint'
import { useLocale, useT } from '@/i18n/client'
import type { ToolProps } from './ui'

type RuleId = 'gorev' | 'rol' | 'baglam' | 'ornek' | 'bicim' | 'kisit'

export function PromptTool({ state, onChange, locked, lang = 'tr' }: ToolProps<PromptState>) {
  const t = useT()
  const uiEn = useLocale() === 'en'
  const r = useMemo(() => lintPrompt(state.prompt, lang), [state.prompt, lang])
  const task = PROMPT_TASKS[state.task] ?? PROMPT_TASKS['serbest']!
  const topic = onTopic(state.task, state.prompt, lang)
  const topicWords = lang === 'en' ? task.en.topic : task.topic
  // Kural etiketleri arayüz diline; kuralların denetlediği anahtar sözcükler içerik diline uyar.
  const ruleKey = lang === 'en' ? 'ruleHintsEn' : 'ruleHints'
  return (
    <div className="ai-main">
      <div className="ai-card">
        <label className="ai-field"><span>{t('studios.ai.prompt.task')}</span>
          <select value={state.task} disabled={locked} onChange={(e) => onChange({ ...state, task: e.target.value })}>
            {Object.values(PROMPT_TASKS).map((x) => <option key={x.id} value={x.id}>{uiEn ? x.en.title : x.title}</option>)}
          </select>
        </label>
        <p className="ai-intro" style={{ margin: '8px 0 0' }}><b>{t('studios.ai.prompt.taskLead')}</b> {uiEn ? task.en.brief : task.brief}</p>
        <label className="ai-field" style={{ marginTop: 10 }}><span>{t('studios.ai.prompt.yours')}</span>
          <textarea rows={8} value={state.prompt} onChange={(e) => onChange({ ...state, prompt: e.target.value })} aria-label={t('studios.ai.prompt.aria')} />
        </label>
        {!topic && topicWords.length > 0 && <p className="ai-bad" style={{ margin: '8px 0 0' }}>{t('studios.ai.prompt.offTopic', { words: topicWords.join(', ') })}</p>}
      </div>
      <div className="ai-card" aria-live="polite">
        <h3>{t('studios.ai.prompt.checklist')} <span className="muted" style={{ fontWeight: 500, fontSize: '.8rem' }}>{t('studios.ai.prompt.ruleBased')}</span></h3>
        <div className="ai-topbar"><span className="ai-score">{r.score}</span><span className="muted">{t('studios.ai.prompt.scoreOf', { n: r.wordCount })}</span></div>
        <ul className="ai-bars" style={{ margin: '8px 0 12px' }}><li className="ai-bar" style={{ gridTemplateColumns: '1fr' }}><span className="ai-bar-track"><span className="ai-bar-fill" data-kind={r.score >= 80 ? 'ok' : undefined} style={{ width: `${r.score}%` }} /></span></li></ul>
        <ul className="ai-check">
          {RULES.map((rule) => {
            const id = rule.id as RuleId
            return (
              <li key={rule.id} data-ok={r.rules[rule.id]}>
                <span className="ai-mark" aria-hidden="true">{r.rules[rule.id] ? '✓' : '○'}</span>
                <span>{t(`studios.ai.prompt.ruleLabels.${id}`)} <span className="muted">{t('studios.ai.prompt.points', { n: rule.weight })}</span><span className="ai-sr">{r.rules[rule.id] ? t('studios.ai.prompt.found') : t('studios.ai.prompt.missing')}</span>{!r.rules[rule.id] && <small>{t(`studios.ai.prompt.${ruleKey}.${id}`)}</small>}</span>
              </li>
            )
          })}
        </ul>
        {r.tooShort && <p className="ai-bad" style={{ margin: '8px 0 0' }}>{t('studios.ai.prompt.tooShort')}</p>}
        <p className="muted" style={{ margin: '10px 0 0', fontSize: '.85rem' }}>
          {t('studios.ai.prompt.notAi')}
        </p>
      </div>
    </div>
  )
}
