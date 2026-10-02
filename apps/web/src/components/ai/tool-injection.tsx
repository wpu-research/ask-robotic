'use client'
import { useMemo } from 'react'
import type { InjState } from '@/lib/ai/activity'
import { ATTACKS, DEFENSES, LEVELS, SYSTEM_RULE, evaluateDefenses, runAttack, type Level } from '@/lib/ai/injection'
import { Simulation, type ToolProps } from './ui'

export function InjectionTool({ state, onChange }: ToolProps<InjState>) {
  const res = useMemo(() => runAttack(state.level, state.attack), [state.level, state.attack])
  const rep = useMemo(() => evaluateDefenses(state.defenses), [state.defenses])
  const set = (p: Partial<InjState>) => onChange({ ...state, ...p })
  const toggle = (id: string) => set({ defenses: state.defenses.includes(id) ? state.defenses.filter((d) => d !== id) : [...state.defenses, id] })
  return (
    <div className="ai-main">
      <div className="ai-tabs" role="tablist" aria-label="Kırmızı takım modu">
        <button type="button" role="tab" className="ai-tab" aria-selected={state.mode === 'attack'} onClick={() => set({ mode: 'attack' })}>Saldır</button>
        <button type="button" role="tab" className="ai-tab" aria-selected={state.mode === 'defense'} onClick={() => set({ mode: 'defense' })}>Savun</button>
      </div>
      <Simulation>Aşağıdaki "model" gerçek bir model değil, birkaç kuralla çalışan bir taklittir. Amaç saldırı fikrini ve "veriyi talimattan ayır" ilkesini görmektir. Gerçek sistemlerde hiçbir savunma %100 değildir.</Simulation>
      {state.mode === 'attack' ? (
        <>
          <div className="ai-card">
            <h3>Sistem kuralı (saldırgan bunu bilmeyebilir)</h3>
            <pre className="ai-pre">{SYSTEM_RULE}</pre>
            <label className="ai-field" style={{ marginTop: 10 }}><span>Çevrilecek "belge" (senin saldırı metnin)</span>
              <textarea rows={4} value={state.attack} onChange={(e) => set({ attack: e.target.value })} aria-label="Saldırı metni" />
            </label>
            <fieldset style={{ border: 0, padding: 0, margin: '10px 0 0' }}>
              <legend className="muted" style={{ fontWeight: 700, fontSize: '.88rem' }}>Savunma seviyesi</legend>
              <div className="ai-opts">
                {LEVELS.map((l) => <label key={l.level} className="ai-opt"><input type="radio" name="ai-level" checked={state.level === l.level} onChange={() => set({ level: l.level as Level })} />{l.name}</label>)}
              </div>
              <p className="muted" style={{ margin: '6px 0 0', fontSize: '.85rem' }}>{LEVELS[state.level]?.about}</p>
            </fieldset>
          </div>
          <div className="ai-card" aria-live="polite">
            <h3>Sonuç: <span className={res.leaked ? 'ai-bad' : 'ai-ok'}>{res.leaked ? 'SALDIRI ÇALIŞTI: gizli kod sızdı' : 'Saldırı durduruldu / etkisiz'}</span></h3>
            <ol style={{ margin: '0 0 8px', paddingLeft: 20, fontSize: '.88rem', lineHeight: 1.5 }}>{res.trace.map((t, i) => <li key={i}>{t}</li>)}</ol>
            <pre className="ai-pre">{res.output}</pre>
            {res.blockedBy && <p className="muted" style={{ margin: '6px 0 0', fontSize: '.85rem' }}>Engelleyen: {res.blockedBy}</p>}
          </div>
        </>
      ) : (
        <div className="ai-card" aria-live="polite">
          <h3>Savunma katmanlarını seç</h3>
          <div className="ai-opts" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
            {DEFENSES.map((d) => <label key={d.id} className="ai-opt" style={{ borderRadius: 'var(--radius-xs)' }}><input type="checkbox" checked={state.defenses.includes(d.id)} onChange={() => toggle(d.id)} />{d.label} <span className="muted">(maliyet {d.cost})</span></label>)}
          </div>
          <ul className="ai-stats"><li>Toplam maliyet: <b>{rep.cost}</b></li><li>Durdurulan: <b>{rep.blocked.length}/{ATTACKS.length}</b></li></ul>
          <div className="ai-table-wrap" style={{ marginTop: 8 }}>
            <table className="ai-table">
              <thead><tr><th>Saldırı</th><th>Durum</th></tr></thead>
              <tbody>{ATTACKS.map((a) => { const ok = rep.blocked.includes(a.id); return <tr key={a.id}><td>{a.label}</td><td className={ok ? 'ai-ok' : 'ai-bad'}>{ok ? 'durduruldu' : 'AÇIK'}</td></tr> })}</tbody>
            </table>
          </div>
          <p className="muted" style={{ margin: '8px 0 0', fontSize: '.85rem' }}>Tablo ders için sadeleştirilmiştir: hangi önlemin hangi saldırıyı durdurduğu gerçekte duruma göre değişir ve tek bir önlem hiçbir zaman yeterli değildir.</p>
        </div>
      )}
    </div>
  )
}
