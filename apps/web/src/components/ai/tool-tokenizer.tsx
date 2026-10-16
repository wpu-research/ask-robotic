'use client'
import { useMemo } from 'react'
import type { TokState } from '@/lib/ai/activity'
import { CORPUS_LABEL, MAX_MERGES, displayToken, type CorpusId } from '@/lib/ai/tokenizer'
import { tokView } from '@/lib/ai/views'
import { useT } from '@/i18n/client'
import type { ToolProps } from './ui'

export function TokenizerTool({ state, onChange }: ToolProps<TokState>) {
  const t = useT()
  const v = useMemo(() => tokView(state), [state])
  const set = (p: Partial<TokState>) => onChange({ ...state, ...p })
  const droppedN = v.dropped.length
  return (
    <div className="ai-main">
      <div className="ai-card">
        <label className="ai-field"><span>{t('studios.ai.tokenizer.text')}</span>
          <textarea rows={3} value={state.text} onChange={(e) => set({ text: e.target.value })} aria-label={t('studios.ai.tokenizer.textAria')} />
        </label>
        <div className="ai-row" style={{ marginTop: 10 }}>
          <label className="ai-field"><span>{t('studios.ai.tokenizer.corpus')}</span>
            <select value={state.corpus} onChange={(e) => set({ corpus: e.target.value as CorpusId })}>
              {(Object.keys(CORPUS_LABEL) as CorpusId[]).map((c) => <option key={c} value={c}>{t(`studios.ai.tokenizer.corpora.${c}`)}</option>)}
            </select>
          </label>
          <label className="ai-field"><span>{t('studios.ai.tokenizer.merges')} <b className="ai-val">{state.merges}</b></span>
            <input type="range" min={0} max={MAX_MERGES} value={state.merges} onChange={(e) => set({ merges: Number(e.target.value) })} />
          </label>
          <label className="ai-field"><span>{t('studios.ai.tokenizer.window')} <b className="ai-val">{state.window === 0 ? t('studios.ai.tokenizer.unlimited') : t('studios.ai.tokenizer.tokens', { n: state.window })}</b></span>
            <input type="range" min={0} max={80} value={state.window} onChange={(e) => set({ window: Number(e.target.value) })} />
          </label>
        </div>
      </div>
      <div className="ai-card">
        <h3>{t('studios.ai.tokenizer.title')}</h3>
        <div className="ai-toks" role="list" aria-label={t('studios.ai.tokenizer.listAria')} aria-live="polite">
          {v.tokens.length === 0 && <span className="muted">{t('studios.ai.tokenizer.empty')}</span>}
          {v.tokens.map((tok, i) => {
            const out = i < droppedN
            return <span key={i} role="listitem" className="ai-tok" data-c={i % 6} data-out={out} title={out ? t('studios.ai.tokenizer.outTitle') : undefined}>{displayToken(tok)}</span>
          })}
        </div>
        <ul className="ai-stats">
          <li>{t('studios.ai.tokenizer.statChars')} <b>{v.chars}</b></li>
          <li>{t('studios.ai.tokenizer.statTokens')} <b>{v.count}</b></li>
          <li>{t('studios.ai.tokenizer.statPerChar')} <b>{v.perChar.toFixed(2)}</b></li>
          <li>{t('studios.ai.tokenizer.statBytes')} <b>{v.bytes}</b></li>
          {state.window > 0 && <li>{t('studios.ai.tokenizer.inWindow')} <b>{v.kept.length}</b> · {t('studios.ai.tokenizer.outside')} <b>{droppedN}</b></li>}
        </ul>
        <p className="muted" style={{ margin: '8px 0 0', fontSize: '.85rem' }}>
          {t('studios.ai.tokenizer.note')}
        </p>
      </div>
    </div>
  )
}
