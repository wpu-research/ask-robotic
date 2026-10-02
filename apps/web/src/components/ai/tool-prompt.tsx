'use client'
import { useMemo } from 'react'
import type { PromptState } from '@/lib/ai/activity'
import { PROMPT_TASKS, RULES, lintPrompt, onTopic } from '@/lib/ai/promptlint'
import type { ToolProps } from './ui'

export function PromptTool({ state, onChange, locked }: ToolProps<PromptState>) {
  const r = useMemo(() => lintPrompt(state.prompt), [state.prompt])
  const task = PROMPT_TASKS[state.task] ?? PROMPT_TASKS['serbest']!
  const topic = onTopic(state.task, state.prompt)
  return (
    <div className="ai-main">
      <div className="ai-card">
        <label className="ai-field"><span>Görev</span>
          <select value={state.task} disabled={locked} onChange={(e) => onChange({ ...state, task: e.target.value })}>
            {Object.values(PROMPT_TASKS).map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
          </select>
        </label>
        <p className="ai-intro" style={{ margin: '8px 0 0' }}><b>Görev:</b> {task.brief}</p>
        <label className="ai-field" style={{ marginTop: 10 }}><span>Prompt'un</span>
          <textarea rows={8} value={state.prompt} onChange={(e) => onChange({ ...state, prompt: e.target.value })} aria-label="Prompt metni" />
        </label>
        {!topic && task.topic.length > 0 && <p className="ai-bad" style={{ margin: '8px 0 0' }}>Konudan sapmış görünüyorsun: prompt'ta şu sözcükler geçmeli: {task.topic.join(', ')}.</p>}
      </div>
      <div className="ai-card" aria-live="polite">
        <h3>Kontrol listesi <span className="muted" style={{ fontWeight: 500, fontSize: '.8rem' }}>(kural tabanlı denetleyici)</span></h3>
        <div className="ai-topbar"><span className="ai-score">{r.score}</span><span className="muted">/ 100 · {r.wordCount} kelime</span></div>
        <ul className="ai-bars" style={{ margin: '8px 0 12px' }}><li className="ai-bar" style={{ gridTemplateColumns: '1fr' }}><span className="ai-bar-track"><span className="ai-bar-fill" data-kind={r.score >= 80 ? 'ok' : undefined} style={{ width: `${r.score}%` }} /></span></li></ul>
        <ul className="ai-check">
          {RULES.map((rule) => (
            <li key={rule.id} data-ok={r.rules[rule.id]}>
              <span className="ai-mark" aria-hidden="true">{r.rules[rule.id] ? '✓' : '○'}</span>
              <span>{rule.label} <span className="muted">({rule.weight} puan)</span><span className="ai-sr">{r.rules[rule.id] ? ' bulundu' : ' eksik'}</span>{!r.rules[rule.id] && <small>{rule.hint}</small>}</span>
            </li>
          ))}
        </ul>
        {r.tooShort && <p className="ai-bad" style={{ margin: '8px 0 0' }}>Çok kısa: 6 kelimenin altındaki istemler en çok 30 puan alır.</p>}
        <p className="muted" style={{ margin: '10px 0 0', fontSize: '.85rem' }}>
          Bu denetleyici bir yapay zekâ DEĞİLDİR: yalnız anahtar sözcüklere ve biçime bakar, anlamı anlamaz. Yüksek puan, prompt'un iyi olduğunu değil, iyi bir prompt'ta bulunması gereken parçaları içerdiğini söyler. Gerçek sınama, prompt'u bir modelde denemek ve sonucu ölçmektir.
        </p>
      </div>
    </div>
  )
}
