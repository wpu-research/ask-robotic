'use client'
import { useMemo } from 'react'
import type { EvalState } from '@/lib/ai/activity'
import { TARGETS, runEval, type EvalCase, type TargetId } from '@/lib/ai/evals'
import { Bar, pct, type ToolProps } from './ui'

export function EvalTool({ state, onChange, locked }: ToolProps<EvalState>) {
  const target = TARGETS[state.target] ?? TARGETS.sentiment
  const cases: EvalCase[] = useMemo(() => state.cases.filter((c): c is EvalCase => !!c && typeof c.text === 'string' && typeof c.expected === 'string'), [state.cases])
  const rep = useMemo(() => runEval(state.target, cases), [state.target, cases])
  const upd = (i: number, p: Partial<EvalCase>) => onChange({ ...state, cases: cases.map((c, j) => (j === i ? { ...c, ...p } : c)) })
  return (
    <div className="ai-main">
      <div className="ai-card">
        <label className="ai-field"><span>Test edilen sistem</span>
          <select value={state.target} disabled={locked} onChange={(e) => { const t = e.target.value as TargetId; onChange({ target: t, cases: [] }) }}>
            {Object.values(TARGETS).map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
          </select>
        </label>
        <p className="muted" style={{ margin: '8px 0 0', fontSize: '.88rem' }}>{target.about} Bu sistem bir MODEL DEĞİL, kural tabanlı bir programdır; ölçme yöntemi ise bir modelde kullanılanın aynısıdır.</p>
      </div>
      <div className="ai-card">
        <h3>Test vakaları</h3>
        <div className="ai-table-wrap">
          <table className="ai-table">
            <thead><tr><th>Girdi</th><th>Beklenen</th><th>Sistem</th><th /></tr></thead>
            <tbody>
              {cases.map((c, i) => {
                const row = rep.rows.find((r) => r.text === c.text && r.expected === c.expected)
                return (
                  <tr key={i}>
                    <td><input className="ai-cell" type="text" value={c.text} placeholder={target.placeholder} aria-label={`Vaka ${i + 1} girdisi`} onChange={(e) => upd(i, { text: e.target.value })} /></td>
                    <td><select className="ai-cell" value={c.expected} aria-label={`Vaka ${i + 1} beklenen etiket`} onChange={(e) => upd(i, { expected: e.target.value })}>{target.labels.filter((l) => l !== 'hata').map((l) => <option key={l} value={l}>{l}</option>)}</select></td>
                    <td className={row ? (row.ok ? 'ai-ok' : 'ai-bad') : 'muted'}>{row ? `${row.ok ? '✓' : '✗'} ${row.got}` : '-'}</td>
                    <td><button type="button" className="ai-btn" aria-label={`Vaka ${i + 1} sil`} onClick={() => onChange({ ...state, cases: cases.filter((_, j) => j !== i) })}>Sil</button></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="ai-topbar" style={{ marginTop: 10 }}>
          <button type="button" className="ai-btn" data-primary="true" onClick={() => onChange({ ...state, cases: [...cases, { text: '', expected: target.labels[0]! }] })}>Vaka ekle</button>
        </div>
      </div>
      <div className="ai-card" aria-live="polite">
        <h3>Sonuç</h3>
        <ul className="ai-stats"><li>Vaka: <b>{rep.total}</b></li><li>Doğru: <b>{rep.correct}</b></li><li>Doğruluk: <b>{pct(rep.accuracy)}</b></li>{rep.duplicates > 0 && <li className="ai-bad">Tekrar eden: <b>{rep.duplicates}</b></li>}</ul>
        {rep.total > 0 && (<>
          <h4>Etiket başına: beklenen etiketin kaçı doğru bulundu?</h4>
          <ul className="ai-bars">{Object.entries(rep.recall).map(([l, v]) => <Bar key={l} name={`${l} (${v.ok}/${v.n})`} value={v.n ? v.ok / v.n : 0} kind={v.ok === v.n ? 'ok' : 'warn'} />)}</ul>
        </>)}
      </div>
    </div>
  )
}
