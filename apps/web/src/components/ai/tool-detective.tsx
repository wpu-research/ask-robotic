'use client'
import { useState } from 'react'
import type { DetState } from '@/lib/ai/activity'
import { MARK_LABEL, MARK_LABEL_EN, SETS, SETS_EN, scoreMarks, type Mark } from '@/lib/ai/detective'
import { useLocale, useT } from '@/i18n/client'
import type { ToolProps } from './ui'

export function DetectiveTool({ state, onChange, locked, lang = 'tr' }: ToolProps<DetState>) {
  const t = useT()
  const locale = useLocale()
  const set = SETS[state.setId] ?? SETS['sensor']!
  // İçerik (kaynak, iddialar) içerik diline; işaret adları arayüz diline uyar.
  const setEn = lang === 'en' ? SETS_EN[set.id] : undefined
  const labels = locale === 'en' ? MARK_LABEL_EN : MARK_LABEL
  const [reveal, setReveal] = useState(false)
  const rep = scoreMarks(set.id, state.marks)
  const source = setEn?.source ?? set.source
  return (
    <div className="ai-main">
      <div className="ai-card">
        <label className="ai-field"><span>{t('studios.ai.detective.case')}</span>
          <select value={set.id} disabled={locked} onChange={(e) => { onChange({ setId: e.target.value, marks: {} }); setReveal(false) }}>
            {Object.values(SETS).map((s) => <option key={s.id} value={s.id}>{(lang === 'en' ? SETS_EN[s.id]?.title : undefined) ?? s.title}</option>)}
          </select>
        </label>
        <p className="ai-sim" style={{ marginTop: 10 }}><b>{t('studios.ai.detective.handTitle')}</b> {t('studios.ai.detective.handBody')}</p>
        <h4>{set.kind === 'kod' ? t('studios.ai.detective.sourceCode') : t('studios.ai.detective.sourceText')}</h4>
        {set.kind === 'kod' ? <pre className="ai-pre">{source}</pre> : <p className="ai-intro" style={{ padding: '8px 12px', background: 'var(--surface-2)', borderRadius: 'var(--radius-xs)' }}>{source}</p>}
      </div>
      <div className="ai-card">
        <h3>{t('studios.ai.detective.claims')}</h3>
        <ul className="ai-claims">
          {set.claims.map((c) => {
            const m = state.marks[c.id]
            const res = reveal && m ? (m === c.key ? 'ok' : 'bad') : undefined
            const text = setEn?.claims[c.id]?.text ?? c.text
            const why = setEn?.claims[c.id]?.why ?? c.why
            return (
              <li key={c.id} className="ai-claim" data-res={res}>
                <p>{text}</p>
                <div className="ai-opts" role="radiogroup" aria-label={t('studios.ai.detective.claimAria', { text })}>
                  {(Object.keys(MARK_LABEL) as Mark[]).map((k) => (
                    <label key={k} className="ai-opt"><input type="radio" name={`ai-${c.id}`} checked={m === k} onChange={() => onChange({ ...state, marks: { ...state.marks, [c.id]: k } })} />{labels[k]}</label>
                  ))}
                </div>
                {reveal && m && <p className="ai-why">{m === c.key ? t('studios.ai.detective.right') : t('studios.ai.detective.answer', { label: labels[c.key] })}{why}</p>}
              </li>
            )
          })}
        </ul>
        <div className="ai-topbar" style={{ marginTop: 10 }}>
          <button type="button" className="ai-btn" data-primary="true" onClick={() => setReveal(true)} disabled={rep.marked === 0}>{t('studios.ai.detective.check')}</button>
          <span aria-live="polite">{t('studios.ai.detective.marked')} <b>{rep.marked}/{rep.total}</b>{reveal && <> · {t('studios.ai.detective.correct')} <b>{rep.correct}</b></>}</span>
        </div>
      </div>
    </div>
  )
}
