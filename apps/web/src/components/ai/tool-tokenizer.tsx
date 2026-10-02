'use client'
import { useMemo } from 'react'
import type { TokState } from '@/lib/ai/activity'
import { CORPUS_LABEL, MAX_MERGES, displayToken, type CorpusId } from '@/lib/ai/tokenizer'
import { tokView } from '@/lib/ai/views'
import type { ToolProps } from './ui'

export function TokenizerTool({ state, onChange }: ToolProps<TokState>) {
  const v = useMemo(() => tokView(state), [state])
  const set = (p: Partial<TokState>) => onChange({ ...state, ...p })
  const droppedN = v.dropped.length
  return (
    <div className="ai-main">
      <div className="ai-card">
        <label className="ai-field"><span>Metin</span>
          <textarea rows={3} value={state.text} onChange={(e) => set({ text: e.target.value })} aria-label="Parçalanacak metin" />
        </label>
        <div className="ai-row" style={{ marginTop: 10 }}>
          <label className="ai-field"><span>Eğitim derlemi</span>
            <select value={state.corpus} onChange={(e) => set({ corpus: e.target.value as CorpusId })}>
              {(Object.keys(CORPUS_LABEL) as CorpusId[]).map((c) => <option key={c} value={c}>{CORPUS_LABEL[c]}</option>)}
            </select>
          </label>
          <label className="ai-field"><span>Birleştirme sayısı: <b className="ai-val">{state.merges}</b></span>
            <input type="range" min={0} max={MAX_MERGES} value={state.merges} onChange={(e) => set({ merges: Number(e.target.value) })} />
          </label>
          <label className="ai-field"><span>Bağlam penceresi: <b className="ai-val">{state.window === 0 ? 'sınırsız' : `${state.window} token`}</b></span>
            <input type="range" min={0} max={80} value={state.window} onChange={(e) => set({ window: Number(e.target.value) })} />
          </label>
        </div>
      </div>
      <div className="ai-card">
        <h3>Token'lar</h3>
        <div className="ai-toks" role="list" aria-label="Token listesi" aria-live="polite">
          {v.tokens.length === 0 && <span className="muted">Metin yaz.</span>}
          {v.tokens.map((t, i) => {
            const out = i < droppedN
            return <span key={i} role="listitem" className="ai-tok" data-c={i % 6} data-out={out} title={out ? 'bağlam penceresine sığmadı' : undefined}>{displayToken(t)}</span>
          })}
        </div>
        <ul className="ai-stats">
          <li>Karakter: <b>{v.chars}</b></li>
          <li>Token: <b>{v.count}</b></li>
          <li>Token / karakter: <b>{v.perChar.toFixed(2)}</b></li>
          <li>UTF-8 bayt: <b>{v.bytes}</b></li>
          {state.window > 0 && <li>Pencerede: <b>{v.kept.length}</b> · dışarıda: <b>{droppedN}</b></li>}
        </ul>
        <p className="muted" style={{ margin: '8px 0 0', fontSize: '.85rem' }}>
          · işareti kelime başıdır. Birleştirme 0 iken her karakter ayrı token olur. Bu küçük bir BPE'dir: yalnız seçtiğin mini derlemden öğrenir (gerçek modeller çok büyük veriyle ve bayt düzeyinde eğitilir). Üstü çizili token'lar bağlam penceresine sığmadığı için "unutulur".
        </p>
      </div>
    </div>
  )
}
