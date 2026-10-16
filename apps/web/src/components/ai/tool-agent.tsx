'use client'
import { useMemo, useState } from 'react'
import type { AgentState } from '@/lib/ai/activity'
import { DEMO_SCRIPTED, DEMO_SCRIPTED_EN, MAX_STEPS, TOOL_DOCS, TOOL_DOCS_EN, WORLDS, WORLD_LABEL_EN, demoScript, demoScriptEn, runAgent, type WorldId } from '@/lib/ai/agent'
import { useLocale, useT } from '@/i18n/client'
import { Simulation, type ToolProps } from './ui'

function Corridor({ pos, wall, crashed }: { pos: number; wall: number; crashed: boolean }) {
  const t = useT()
  const pctLeft = wall > 0 ? Math.min(100, (pos / wall) * 100) : 0
  return (
    <div className="ai-corr" role="img" aria-label={t(crashed ? 'studios.ai.agent.corridorCrashed' : 'studios.ai.agent.corridor', { pos, wall })}>
      <span className="ai-corr-robot" data-crash={crashed} style={{ left: `min(${pctLeft}%, calc(100% - 48px))` }}>{crashed ? '💥' : '🤖'}</span>
      <span className="ai-corr-wall" />
    </div>
  )
}

export function AgentTool({ state, onChange, locked, lang = 'tr' }: ToolProps<AgentState>) {
  const t = useT()
  const locale = useLocale()
  const en = lang === 'en'
  const run = useMemo(() => runAgent(state.script, state.world, lang), [state.script, state.world, lang])
  const [showDemo, setShowDemo] = useState(false)
  const world = WORLDS[state.world]
  const demoDef = en ? DEMO_SCRIPTED_EN : DEMO_SCRIPTED
  const demo = useMemo(() => runAgent(en ? demoScriptEn() : demoScript(), demoDef.world, lang), [en, demoDef, lang])
  const tools = TOOL_DOCS.filter((x) => world.hasRobot || !['mesafe', 'ileri', 'dur'].includes(x.name)).filter((x) => state.world === 'bilgi' || x.name !== 'ara')
  // Kullanım örnekleri içerik diline (betikte yazılacak adlar), açıklamalar arayüz diline uyar.
  const usageOf = (d: (typeof TOOL_DOCS)[number]) => (en ? TOOL_DOCS_EN[d.name]?.usage ?? d.usage : d.usage)
  const aboutOf = (d: (typeof TOOL_DOCS)[number]) => (locale === 'en' ? TOOL_DOCS_EN[d.name]?.about ?? d.about : d.about)
  return (
    <div className="ai-main">
      <div className="ai-card">
        <div className="ai-row">
          <label className="ai-field"><span>{t('studios.ai.agent.world')}</span>
            <select value={state.world} disabled={locked} onChange={(e) => onChange({ ...state, world: e.target.value as WorldId })}>
              {(Object.keys(WORLDS) as WorldId[]).map((w) => <option key={w} value={w}>{locale === 'en' ? WORLD_LABEL_EN[w] : WORLDS[w].label}</option>)}
            </select>
          </label>
        </div>
        <label className="ai-field" style={{ marginTop: 10 }}><span>{t('studios.ai.agent.scriptLabel')}</span>
          <textarea className="ai-mono" rows={7} spellCheck={false} value={state.script} onChange={(e) => onChange({ ...state, script: e.target.value })} placeholder={en ? 'calc(12*7)\nfinish($1)' : 'hesapla(12*7)\nbitir($1)'} aria-label={t('studios.ai.agent.scriptAria')} />
        </label>
        <p className="muted" style={{ margin: '8px 0 0', fontSize: '.85rem' }}>
          {t('studios.ai.agent.helpPrev')} <code>$1</code>, <code>$2</code> {t('studios.ai.agent.helpStepNo')} <code>{en ? '$last' : '$son'}</code>. {t('studios.ai.agent.helpLines')} <code>{en ? 'repeat 3: forward(20); distance()' : 'tekrar 3: ileri(20); mesafe()'}</code> {t('studios.ai.agent.helpAnd')} <code>{en ? 'if $last < 50: stop()' : 'eğer $son < 50: dur()'}</code>. {t('studios.ai.agent.helpTail', { n: MAX_STEPS })}
        </p>
        <div style={{ marginTop: 10 }}>
          <Simulation>{t('studios.ai.agent.sim')}</Simulation>
        </div>
      </div>
      <div className="ai-card">
        <h3>{t('studios.ai.agent.tools')}</h3>
        <ul className="ai-chunks">{tools.map((d) => <li key={d.name} className="ai-chunk"><small><code>{usageOf(d)}</code></small>{aboutOf(d)}</li>)}</ul>
      </div>
      <div className="ai-card" aria-live="polite">
        <h3>{t('studios.ai.agent.run')}</h3>
        {world.hasRobot && <Corridor pos={run.position} wall={world.wall} crashed={run.crashed} />}
        {run.steps.length === 0 ? <p className="muted">{t('studios.ai.agent.noSteps')}</p> : (
          <div className="ai-table-wrap" style={{ marginTop: 8 }}>
            <table className="ai-table">
              <thead><tr><th>{t('studios.ai.agent.colStep')}</th><th>{t('studios.ai.agent.colCall')}</th><th>{t('studios.ai.agent.colResult')}</th></tr></thead>
              <tbody>{run.steps.map((s) => <tr key={s.n}><td>{s.n}</td><td><code>{s.call}</code></td><td className={s.ok ? undefined : 'ai-bad'}>{s.ok ? s.observation : t('studios.ai.agent.error', { msg: s.observation })}</td></tr>)}</tbody>
            </table>
          </div>
        )}
        <ul className="ai-stats">
          <li>{t('studios.ai.agent.statSteps')} <b>{run.steps.length}</b></li>
          <li>{t('studios.ai.agent.statFinal')} <b>{run.final ?? t('studios.ai.agent.noFinal')}</b></li>
          {world.hasRobot && <li>{t('studios.ai.agent.statPos')} <b>{run.position} cm</b></li>}
        </ul>
        {run.error && <p className="ai-bad" role="alert" style={{ margin: '8px 0 0' }}>{run.error}</p>}
      </div>
      <div className="ai-card">
        <button type="button" className="ai-btn" aria-expanded={showDemo} onClick={() => setShowDemo((v) => !v)}>{showDemo ? t('studios.ai.agent.demoHide') : t('studios.ai.agent.demoShow')}</button>
        {showDemo && (
          <div style={{ marginTop: 10 }}>
            <p className="ai-sim"><b>{t('studios.ai.agent.demoTitle')}</b> {t('studios.ai.agent.demoNote')} {demoDef.question}</p>
            <table className="ai-table" style={{ marginTop: 8 }}>
              <thead><tr><th>{t('studios.ai.agent.colStep')}</th><th>{t('studios.ai.agent.colThought')}</th><th>{t('studios.ai.agent.colCall')}</th><th>{t('studios.ai.agent.colObs')}</th></tr></thead>
              <tbody>{demoDef.steps.map((s, i) => <tr key={i}><td>{i + 1}</td><td>{s.thought}</td><td><code>{s.call}</code></td><td>{demo.steps[i]?.observation}</td></tr>)}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
