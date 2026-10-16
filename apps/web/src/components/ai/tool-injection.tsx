'use client'
import { useMemo } from 'react'
import type { InjState } from '@/lib/ai/activity'
import { ATTACKS, DEFENSES, LEVELS, evaluateDefenses, runAttack, systemRuleFor, type Level } from '@/lib/ai/injection'
import { useLocale, useT } from '@/i18n/client'
import { Simulation, type ToolProps } from './ui'

export function InjectionTool({ state, onChange, lang = 'tr' }: ToolProps<InjState>) {
  const t = useT()
  const uiEn = useLocale() === 'en'
  const res = useMemo(() => runAttack(state.level, state.attack, lang), [state.level, state.attack, lang])
  const rep = useMemo(() => evaluateDefenses(state.defenses), [state.defenses])
  const set = (p: Partial<InjState>) => onChange({ ...state, ...p })
  const toggle = (id: string) => set({ defenses: state.defenses.includes(id) ? state.defenses.filter((d) => d !== id) : [...state.defenses, id] })
  const lvl = LEVELS[state.level]
  return (
    <div className="ai-main">
      <div className="ai-tabs" role="tablist" aria-label={t('studios.ai.injection.modeAria')}>
        <button type="button" role="tab" className="ai-tab" aria-selected={state.mode === 'attack'} onClick={() => set({ mode: 'attack' })}>{t('studios.ai.injection.attack')}</button>
        <button type="button" role="tab" className="ai-tab" aria-selected={state.mode === 'defense'} onClick={() => set({ mode: 'defense' })}>{t('studios.ai.injection.defend')}</button>
      </div>
      <Simulation>{t('studios.ai.injection.sim')}</Simulation>
      {state.mode === 'attack' ? (
        <>
          <div className="ai-card">
            <h3>{t('studios.ai.injection.systemRule')}</h3>
            <pre className="ai-pre">{systemRuleFor(lang)}</pre>
            <label className="ai-field" style={{ marginTop: 10 }}><span>{t('studios.ai.injection.docLabel')}</span>
              <textarea rows={4} value={state.attack} onChange={(e) => set({ attack: e.target.value })} aria-label={t('studios.ai.injection.docAria')} />
            </label>
            <fieldset style={{ border: 0, padding: 0, margin: '10px 0 0' }}>
              <legend className="muted" style={{ fontWeight: 700, fontSize: '.88rem' }}>{t('studios.ai.injection.level')}</legend>
              <div className="ai-opts">
                {LEVELS.map((l) => <label key={l.level} className="ai-opt"><input type="radio" name="ai-level" checked={state.level === l.level} onChange={() => set({ level: l.level as Level })} />{uiEn ? l.en.name : l.name}</label>)}
              </div>
              <p className="muted" style={{ margin: '6px 0 0', fontSize: '.85rem' }}>{lvl && (uiEn ? lvl.en.about : lvl.about)}</p>
            </fieldset>
          </div>
          <div className="ai-card" aria-live="polite">
            <h3>{t('studios.ai.injection.result')} <span className={res.leaked ? 'ai-bad' : 'ai-ok'}>{res.leaked ? t('studios.ai.injection.leaked') : t('studios.ai.injection.stopped')}</span></h3>
            <ol style={{ margin: '0 0 8px', paddingLeft: 20, fontSize: '.88rem', lineHeight: 1.5 }}>{res.trace.map((x, i) => <li key={i}>{x}</li>)}</ol>
            <pre className="ai-pre">{res.output}</pre>
            {res.blockedBy && <p className="muted" style={{ margin: '6px 0 0', fontSize: '.85rem' }}>{t('studios.ai.injection.blockedBy', { what: res.blockedBy })}</p>}
          </div>
        </>
      ) : (
        <div className="ai-card" aria-live="polite">
          <h3>{t('studios.ai.injection.pickDefenses')}</h3>
          <div className="ai-opts" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
            {DEFENSES.map((d) => <label key={d.id} className="ai-opt" style={{ borderRadius: 'var(--radius-xs)' }}><input type="checkbox" checked={state.defenses.includes(d.id)} onChange={() => toggle(d.id)} />{uiEn ? d.labelEn : d.label} <span className="muted">{t('studios.ai.injection.cost', { n: d.cost })}</span></label>)}
          </div>
          <ul className="ai-stats"><li>{t('studios.ai.injection.totalCost')} <b>{rep.cost}</b></li><li>{t('studios.ai.injection.blockedCount')} <b>{rep.blocked.length}/{ATTACKS.length}</b></li></ul>
          <div className="ai-table-wrap" style={{ marginTop: 8 }}>
            <table className="ai-table">
              <thead><tr><th>{t('studios.ai.injection.colAttack')}</th><th>{t('studios.ai.injection.colStatus')}</th></tr></thead>
              <tbody>{ATTACKS.map((a) => { const ok = rep.blocked.includes(a.id); return <tr key={a.id}><td>{uiEn ? a.labelEn : a.label}</td><td className={ok ? 'ai-ok' : 'ai-bad'}>{ok ? t('studios.ai.injection.statusBlocked') : t('studios.ai.injection.statusOpen')}</td></tr> })}</tbody>
            </table>
          </div>
          <p className="muted" style={{ margin: '8px 0 0', fontSize: '.85rem' }}>{t('studios.ai.injection.tableNote')}</p>
        </div>
      )}
    </div>
  )
}
