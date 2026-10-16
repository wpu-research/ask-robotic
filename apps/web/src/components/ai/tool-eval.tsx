'use client'
import { useMemo } from 'react'
import type { EvalState } from '@/lib/ai/activity'
import { LABEL_EN, TARGETS, runEval, type EvalCase, type TargetId } from '@/lib/ai/evals'
import { useLocale, useT } from '@/i18n/client'
import { Bar, pct, type ToolProps } from './ui'

export function EvalTool({ state, onChange, locked, lang = 'tr' }: ToolProps<EvalState>) {
  const t = useT()
  const locale = useLocale()
  const target = TARGETS[state.target] ?? TARGETS.sentiment
  const uiEn = locale === 'en'
  // Etiket kimlikleri (kayıtta saklanan) Türkçedir; arayüz İngilizceyse görünen adları çevrilir.
  const lbl = (l: string) => (uiEn ? LABEL_EN[l] ?? l : l)
  const cases: EvalCase[] = useMemo(() => state.cases.filter((c): c is EvalCase => !!c && typeof c.text === 'string' && typeof c.expected === 'string'), [state.cases])
  const rep = useMemo(() => runEval(state.target, cases, lang), [state.target, cases, lang])
  const upd = (i: number, p: Partial<EvalCase>) => onChange({ ...state, cases: cases.map((c, j) => (j === i ? { ...c, ...p } : c)) })
  return (
    <div className="ai-main">
      <div className="ai-card">
        <label className="ai-field"><span>{t('studios.ai.eval.target')}</span>
          <select value={state.target} disabled={locked} onChange={(e) => { const id = e.target.value as TargetId; onChange({ target: id, cases: [] }) }}>
            {Object.values(TARGETS).map((x) => <option key={x.id} value={x.id}>{uiEn ? x.en.title : x.title}</option>)}
          </select>
        </label>
        <p className="muted" style={{ margin: '8px 0 0', fontSize: '.88rem' }}>{lang === 'en' ? target.en.about : uiEn ? t(`studios.ai.eval.about.${target.id}`) : target.about} {t('studios.ai.eval.notModel')}</p>
      </div>
      <div className="ai-card">
        <h3>{t('studios.ai.eval.cases')}</h3>
        <div className="ai-table-wrap">
          <table className="ai-table">
            <thead><tr><th>{t('studios.ai.eval.colInput')}</th><th>{t('studios.ai.eval.colExpected')}</th><th>{t('studios.ai.eval.colSystem')}</th><th /></tr></thead>
            <tbody>
              {cases.map((c, i) => {
                const row = rep.rows.find((r) => r.text === c.text && r.expected === c.expected)
                return (
                  <tr key={i}>
                    <td><input className="ai-cell" type="text" value={c.text} placeholder={lang === 'en' ? target.en.placeholder : target.placeholder} aria-label={t('studios.ai.eval.inputAria', { n: i + 1 })} onChange={(e) => upd(i, { text: e.target.value })} /></td>
                    <td><select className="ai-cell" value={c.expected} aria-label={t('studios.ai.eval.expectedAria', { n: i + 1 })} onChange={(e) => upd(i, { expected: e.target.value })}>{target.labels.filter((l) => l !== 'hata').map((l) => <option key={l} value={l}>{lbl(l)}</option>)}</select></td>
                    <td className={row ? (row.ok ? 'ai-ok' : 'ai-bad') : 'muted'}>{row ? `${row.ok ? '✓' : '✗'} ${lbl(row.got)}` : '-'}</td>
                    <td><button type="button" className="ai-btn" aria-label={t('studios.ai.eval.deleteAria', { n: i + 1 })} onClick={() => onChange({ ...state, cases: cases.filter((_, j) => j !== i) })}>{t('studios.ai.eval.delete')}</button></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="ai-topbar" style={{ marginTop: 10 }}>
          <button type="button" className="ai-btn" data-primary="true" onClick={() => onChange({ ...state, cases: [...cases, { text: '', expected: target.labels[0]! }] })}>{t('studios.ai.eval.add')}</button>
        </div>
      </div>
      <div className="ai-card" aria-live="polite">
        <h3>{t('studios.ai.eval.result')}</h3>
        <ul className="ai-stats"><li>{t('studios.ai.eval.statCases')} <b>{rep.total}</b></li><li>{t('studios.ai.eval.statCorrect')} <b>{rep.correct}</b></li><li>{t('studios.ai.eval.statAccuracy')} <b>{pct(rep.accuracy)}</b></li>{rep.duplicates > 0 && <li className="ai-bad">{t('studios.ai.eval.statDup')} <b>{rep.duplicates}</b></li>}</ul>
        {rep.total > 0 && (<>
          <h4>{t('studios.ai.eval.perLabel')}</h4>
          <ul className="ai-bars">{Object.entries(rep.recall).map(([l, v]) => <Bar key={l} name={`${lbl(l)} (${v.ok}/${v.n})`} value={v.n ? v.ok / v.n : 0} kind={v.ok === v.n ? 'ok' : 'warn'} />)}</ul>
        </>)}
      </div>
    </div>
  )
}
