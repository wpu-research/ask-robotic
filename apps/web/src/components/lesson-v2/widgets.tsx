'use client'
import { useEffect, useMemo, useState } from 'react'
import type { WidgetGoal, WidgetSpec } from '@ask/db'
import { useT } from '@/i18n/client'
import { blinkMetrics, goalMet, LED_VF, ohmMetrics, R_VALUES } from '@/lib/steps'

interface Props { spec: WidgetSpec; goals: WidgetGoal[]; locked: boolean; onMetrics: (m: Record<string, number>) => void }

/** Hedef listesi: Brilliant'taki gibi her kısıt canlı tiklenir. */
export function GoalList({ goals, metrics }: { goals: WidgetGoal[]; metrics: Record<string, number> }) {
  const t = useT()
  return (
    <ul className="v2-goals" aria-label={t('lesson.widgets.goals')}>
      {goals.map((g) => {
        const ok = goalMet(g, metrics)
        return <li key={g.label} data-ok={ok}><span aria-hidden="true">{ok ? '✓' : '→'}</span>{g.label}<span className="sr-only">{ok ? t('lesson.widgets.goalDone') : t('lesson.widgets.goalNotYet')}</span></li>
      })}
    </ul>
  )
}

export function Widget(p: Props) {
  if (p.spec.type === 'ohm') return <OhmWidget {...p} spec={p.spec} />
  return <BlinkWidget {...p} spec={p.spec as Extract<WidgetSpec, { type: 'blink' }>} />
}

function OhmWidget({ spec, goals, locked, onMetrics }: Props & { spec: Extract<WidgetSpec, { type: 'ohm' }> }) {
  const t = useT()
  const led = spec.led !== false
  const [v, setV] = useState(spec.v ?? 5)
  const [ri, setRi] = useState(() => Math.max(0, R_VALUES.indexOf(spec.r ?? 220)))
  const r = R_VALUES[ri]
  const m = useMemo(() => ohmMetrics(v, r, led), [v, r, led])
  useEffect(() => { onMetrics(m) }, [m, onMetrics])
  const burnt = led && m.I_mA > 30
  const glow = led ? Math.min(1, m.I_mA / 20) : 0
  return (
    <div className="v2-widget">
      <GoalList goals={goals} metrics={m} />
      <svg viewBox="0 0 320 170" className="v2-circuit" role="img" aria-label={t('lesson.widgets.circuit', { v, r, i: m.I_mA })}>
        <path d="M60 40 H260 V130 H60 Z" className="wire" fill="none" />
        <g transform="translate(60 85)">
          <rect x="-16" y="-26" width="32" height="52" rx="6" className="part" />
          <text y="-6" textAnchor="middle" className="lbl">+</text>
          <text y="16" textAnchor="middle" className="val">{v} V</text>
        </g>
        <g transform="translate(160 40)">
          <rect x="-34" y="-11" width="68" height="22" rx="6" className="part resistor" />
          <text y="5" textAnchor="middle" className="val">{r >= 1000 ? `${r / 1000} kΩ` : `${r} Ω`}</text>
        </g>
        {led ? (
          <g transform="translate(260 85)">
            <circle r="26" className="led-glow" style={{ opacity: burnt ? 0 : glow * 0.55 }} />
            <path d="M-12 8 V-6 A12 12 0 0 1 12 -6 V8 Z" className={`led ${burnt ? 'burnt' : ''}`} style={{ fillOpacity: burnt ? 1 : 0.25 + glow * 0.75 }} />
            <text y="30" textAnchor="middle" className="val">{burnt ? t('lesson.widgets.burnt') : 'LED'}</text>
          </g>
        ) : (
          <g transform="translate(260 85)"><circle r="14" className="part" /><text y="5" textAnchor="middle" className="val">A</text></g>
        )}
        <g transform="translate(160 150)"><text textAnchor="middle" className="readout">I = {m.I_mA} mA</text></g>
      </svg>
      <div className="v2-sliders">
        <label>
          <span>{t('lesson.widgets.voltage')} <b>{v} V</b></span>
          <input type="range" min={0} max={9} step={0.5} value={v} disabled={locked || spec.lockV} onChange={(e) => setV(Number(e.target.value))} />
        </label>
        <label>
          <span>{t('lesson.widgets.resistance')} <b>{r >= 1000 ? `${r / 1000} kΩ` : `${r} Ω`}</b></span>
          <input type="range" min={0} max={R_VALUES.length - 1} step={1} value={ri} disabled={locked || spec.lockR} onChange={(e) => setRi(Number(e.target.value))} />
        </label>
      </div>
      <p className="v2-formula">{led ? <>I = (V − {LED_VF} V) / R = ({v} − {LED_VF}) / {r} = <b>{m.I_mA} mA</b></> : <>I = V / R = {v} / {r} = <b>{m.I_mA} mA</b></>}</p>
    </div>
  )
}

function BlinkWidget({ spec, goals, locked, onMetrics }: Props & { spec: Extract<WidgetSpec, { type: 'blink' }> }) {
  const t = useT()
  const [on, setOn] = useState(spec.onMs ?? 1000)
  const [off, setOff] = useState(spec.offMs ?? 1000)
  const m = useMemo(() => blinkMetrics(on, off), [on, off])
  useEffect(() => { onMetrics(m) }, [m, onMetrics])
  const [lit, setLit] = useState(true)
  useEffect(() => {
    let alive = true
    let t: ReturnType<typeof setTimeout>
    const tick = (state: boolean) => { if (!alive) return; setLit(state); t = setTimeout(() => tick(!state), state ? on : off) }
    tick(true)
    return () => { alive = false; clearTimeout(t) }
  }, [on, off])
  return (
    <div className="v2-widget">
      <GoalList goals={goals} metrics={m} />
      <div className="v2-blink">
        <div className={`v2-blink-led ${lit ? 'on' : ''}`} aria-hidden="true" />
        <div className="v2-timeline" aria-hidden="true">
          <span className="seg on" style={{ flexGrow: on }}>HIGH {on} ms</span>
          <span className="seg off" style={{ flexGrow: off }}>LOW {off} ms</span>
        </div>
        <p className="v2-formula">{t('lesson.widgets.period')} <b>{m.periodMs} ms</b> · {t('lesson.widgets.rate').split('{n}').map((part, i) => (i ? <span key={i}><b>{m.hz}</b>{part}</span> : part))} · {t('lesson.widgets.dutyLabel')} <b>{t('lesson.widgets.dutyValue', { n: m.duty })}</b></p>
      </div>
      <div className="v2-sliders">
        <label><span>{t('lesson.widgets.onTime')} <b>{on} ms</b></span><input type="range" min={100} max={2000} step={50} value={on} disabled={locked} onChange={(e) => setOn(Number(e.target.value))} /></label>
        <label><span>{t('lesson.widgets.offTime')} <b>{off} ms</b></span><input type="range" min={100} max={2000} step={50} value={off} disabled={locked} onChange={(e) => setOff(Number(e.target.value))} /></label>
      </div>
      <pre className="v2-code"><code>{`digitalWrite(13, HIGH);\ndelay(${on});\ndigitalWrite(13, LOW);\ndelay(${off});`}</code></pre>
    </div>
  )
}
