'use client'
import { useMemo, useState } from 'react'
import type { AgentState } from '@/lib/ai/activity'
import { DEMO_SCRIPTED, MAX_STEPS, TOOL_DOCS, WORLDS, demoScript, runAgent, type WorldId } from '@/lib/ai/agent'
import { Simulation, type ToolProps } from './ui'

function Corridor({ pos, wall, crashed }: { pos: number; wall: number; crashed: boolean }) {
  const pctLeft = wall > 0 ? Math.min(100, (pos / wall) * 100) : 0
  return (
    <div className="ai-corr" role="img" aria-label={`Robot ${pos} cm ilerledi, duvar ${wall} cm uzakta${crashed ? ', çarptı' : ''}`}>
      <span className="ai-corr-robot" data-crash={crashed} style={{ left: `min(${pctLeft}%, calc(100% - 48px))` }}>{crashed ? '💥' : '🤖'}</span>
      <span className="ai-corr-wall" />
    </div>
  )
}

export function AgentTool({ state, onChange, locked }: ToolProps<AgentState>) {
  const run = useMemo(() => runAgent(state.script, state.world), [state.script, state.world])
  const [showDemo, setShowDemo] = useState(false)
  const world = WORLDS[state.world]
  const demo = useMemo(() => runAgent(demoScript(), DEMO_SCRIPTED.world), [])
  const tools = TOOL_DOCS.filter((t) => world.hasRobot || !['mesafe', 'ileri', 'dur'].includes(t.name)).filter((t) => state.world === 'bilgi' || t.name !== 'ara')
  return (
    <div className="ai-main">
      <div className="ai-card">
        <div className="ai-row">
          <label className="ai-field"><span>Dünya</span>
            <select value={state.world} disabled={locked} onChange={(e) => onChange({ ...state, world: e.target.value as WorldId })}>
              {(Object.keys(WORLDS) as WorldId[]).map((w) => <option key={w} value={w}>{WORLDS[w].label}</option>)}
            </select>
          </label>
        </div>
        <label className="ai-field" style={{ marginTop: 10 }}><span>Model adımları (betik): her satır bir araç çağrısı</span>
          <textarea className="ai-mono" rows={7} spellCheck={false} value={state.script} onChange={(e) => onChange({ ...state, script: e.target.value })} placeholder={'hesapla(12*7)\nbitir($1)'} aria-label="Ajan betiği" />
        </label>
        <p className="muted" style={{ margin: '8px 0 0', fontSize: '.85rem' }}>
          Önceki sonuçlar: <code>$1</code>, <code>$2</code> (adım numarası) ve <code>$son</code>. Satırlar: <code>tekrar 3: ileri(20); mesafe()</code> ve <code>eğer $son &lt; 50: dur()</code>. # ile yorum yazılır. En çok {MAX_STEPS} adım atılır.
        </p>
        <div style={{ marginTop: 10 }}>
          <Simulation>Burada bir dil modeli YOK: hangi aracın çağrılacağına sen (betikle) karar verirsin. Araçlar ise gerçekten çalışır. Gerçek bir ajanda bu kararı her adımda, araç sonucunu görerek bir model verirdi.</Simulation>
        </div>
      </div>
      <div className="ai-card">
        <h3>Araçlar</h3>
        <ul className="ai-chunks">{tools.map((t) => <li key={t.name} className="ai-chunk"><small><code>{t.usage}</code></small>{t.about}</li>)}</ul>
      </div>
      <div className="ai-card" aria-live="polite">
        <h3>Çalıştırma</h3>
        {world.hasRobot && <Corridor pos={run.position} wall={world.wall} crashed={run.crashed} />}
        {run.steps.length === 0 ? <p className="muted">Henüz adım yok. Betiğe bir araç çağrısı yaz.</p> : (
          <div className="ai-table-wrap" style={{ marginTop: 8 }}>
            <table className="ai-table">
              <thead><tr><th>Adım</th><th>Çağrı</th><th>Sonuç (gözlem)</th></tr></thead>
              <tbody>{run.steps.map((s) => <tr key={s.n}><td>{s.n}</td><td><code>{s.call}</code></td><td className={s.ok ? undefined : 'ai-bad'}>{s.ok ? s.observation : `HATA: ${s.observation}`}</td></tr>)}</tbody>
            </table>
          </div>
        )}
        <ul className="ai-stats">
          <li>Adım: <b>{run.steps.length}</b></li>
          <li>Nihai cevap: <b>{run.final ?? 'yok (bitir() çağrılmadı)'}</b></li>
          {world.hasRobot && <li>Konum: <b>{run.position} cm</b></li>}
        </ul>
        {run.error && <p className="ai-bad" role="alert" style={{ margin: '8px 0 0' }}>{run.error}</p>}
      </div>
      <div className="ai-card">
        <button type="button" className="ai-btn" aria-expanded={showDemo} onClick={() => setShowDemo((v) => !v)}>{showDemo ? 'Betikli demoyu gizle' : 'Betikli demoyu göster'}</button>
        {showDemo && (
          <div style={{ marginTop: 10 }}>
            <p className="ai-sim"><b>BETİKLİ DEMO.</b> Aşağıdaki "düşünce" metinleri elle yazılmıştır, bir model üretmemiştir. Soru: {DEMO_SCRIPTED.question}</p>
            <table className="ai-table" style={{ marginTop: 8 }}>
              <thead><tr><th>Adım</th><th>Düşünce (elle yazılmış)</th><th>Çağrı</th><th>Gözlem</th></tr></thead>
              <tbody>{DEMO_SCRIPTED.steps.map((s, i) => <tr key={i}><td>{i + 1}</td><td>{s.thought}</td><td><code>{s.call}</code></td><td>{demo.steps[i]?.observation}</td></tr>)}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
