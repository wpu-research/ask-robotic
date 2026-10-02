'use client'
import { useState } from 'react'
import type { DetState } from '@/lib/ai/activity'
import { MARK_LABEL, SETS, scoreMarks, type Mark } from '@/lib/ai/detective'
import type { ToolProps } from './ui'

export function DetectiveTool({ state, onChange, locked }: ToolProps<DetState>) {
  const set = SETS[state.setId] ?? SETS['sensor']!
  const [reveal, setReveal] = useState(false)
  const rep = scoreMarks(set.id, state.marks)
  return (
    <div className="ai-main">
      <div className="ai-card">
        <label className="ai-field"><span>Vaka</span>
          <select value={set.id} disabled={locked} onChange={(e) => { onChange({ setId: e.target.value, marks: {} }); setReveal(false) }}>
            {Object.values(SETS).map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
        </label>
        <p className="ai-sim" style={{ marginTop: 10 }}><b>Elle yazılmış örnek.</b> Aşağıdaki "özet" gerçek bir model çıktısı değildir; halüsinasyon türlerini göstermek için hazırlandı.</p>
        <h4>{set.kind === 'kod' ? 'Kod (kaynak)' : 'Kaynak metin'}</h4>
        {set.kind === 'kod' ? <pre className="ai-pre">{set.source}</pre> : <p className="ai-intro" style={{ padding: '8px 12px', background: 'var(--surface-2)', borderRadius: 'var(--radius-xs)' }}>{set.source}</p>}
      </div>
      <div className="ai-card">
        <h3>İddialar</h3>
        <ul className="ai-claims">
          {set.claims.map((c) => {
            const m = state.marks[c.id]
            const res = reveal && m ? (m === c.key ? 'ok' : 'bad') : undefined
            return (
              <li key={c.id} className="ai-claim" data-res={res}>
                <p>{c.text}</p>
                <div className="ai-opts" role="radiogroup" aria-label={`İddia: ${c.text}`}>
                  {(Object.keys(MARK_LABEL) as Mark[]).map((k) => (
                    <label key={k} className="ai-opt"><input type="radio" name={`ai-${c.id}`} checked={m === k} onChange={() => onChange({ ...state, marks: { ...state.marks, [c.id]: k } })} />{MARK_LABEL[k]}</label>
                  ))}
                </div>
                {reveal && m && <p className="ai-why">{m === c.key ? 'Doğru. ' : `Doğrusu: ${MARK_LABEL[c.key]}. `}{c.why}</p>}
              </li>
            )
          })}
        </ul>
        <div className="ai-topbar" style={{ marginTop: 10 }}>
          <button type="button" className="ai-btn" data-primary="true" onClick={() => setReveal(true)} disabled={rep.marked === 0}>Cevapları kontrol et</button>
          <span aria-live="polite">İşaretlenen: <b>{rep.marked}/{rep.total}</b>{reveal && <> · Doğru: <b>{rep.correct}</b></>}</span>
        </div>
      </div>
    </div>
  )
}
