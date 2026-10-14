'use client'
import Link from 'next/link'
import { useCallback, useState } from 'react'
import type { WidgetGoal } from '@ask/db'
import { Mascot } from '@/components/lesson-v2/mascot'
import { Widget } from '@/components/lesson-v2/widgets'
import { goalMet } from '@/lib/steps'
import { useProfile } from '@/lib/profile'
import { useDoneIds } from '@/lib/progress-store'
import type { Messages } from '@/i18n'

type L = Messages['landing']

/** Ana sayfa denemesi: gerçek ders widget'ı (Ohm devresi) ile tek adımlık mini ders; Brilliant'ın "Koji ile dene" kartı gibi. */
export function HeroDemo({ L }: { L: L }) {
  const goals: WidgetGoal[] = [
    { label: L.demo.goalOn, metric: 'ledOn', min: 1 },
    { label: L.demo.goalSafe, metric: 'I_mA', max: 20 },
  ]
  const [metrics, setMetrics] = useState<Record<string, number>>({})
  const [state, setState] = useState<'idle' | 'ok' | 'bad'>('idle')
  const onMetrics = useCallback((m: Record<string, number>) => setMetrics(m), [])
  const check = () => setState(goals.every((g) => goalMet(g, metrics)) ? 'ok' : 'bad')
  return (
    <div className={`ld-demo ld-demo-${state}`}>
      <div className="ld-demo-head">
        <Mascot size={40} mood={state === 'ok' ? 'happy' : state === 'bad' ? 'oops' : 'think'} />
        <div><small>{L.demo.eyebrow}</small><b>{L.demo.question}</b></div>
      </div>
      <Widget spec={{ type: 'ohm', v: 5, lockV: true, r: 47, led: true }} goals={goals} locked={state === 'ok'} onMetrics={onMetrics} />
      <div className="ld-demo-foot" aria-live="polite">
        {state === 'ok' ? (
          <><p className="v2-bubble ok">{L.demo.ok}</p><Link className="v2-btn ok" href="/basla">{L.demo.cta}</Link></>
        ) : state === 'bad' ? (
          <><p className="v2-bubble bad">{L.demo.bad}</p><button type="button" className="v2-btn" onClick={() => setState('idle')}>{L.demo.again}</button></>
        ) : (
          <button type="button" className="v2-btn" onClick={check}>{L.demo.check}</button>
        )}
      </div>
    </div>
  )
}

const TABS = ['kodlama', 'elektronik', 'robotik', 'ai'] as const
const TAB_ART: Record<(typeof TABS)[number], string> = { kodlama: '⌨️', elektronik: '💡', robotik: '🤖', ai: '🧠' }

/** "Robi ile tanış": alan sekmeleri, her biri 3 özellik + küçük arayüz görseli. */
export function MeetTabs({ L }: { L: L }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>('elektronik')
  return (
    <div className="ld-meet">
      <div className="ld-tabs" role="tablist" aria-label={L.meet.title}>
        {TABS.map((k) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>
            <span aria-hidden="true">{TAB_ART[k]}</span>{L.meet.tabs[k]}
          </button>
        ))}
      </div>
      <div className="ld-meet-body" role="tabpanel">
        <ul className="ld-feats">
          {L.meet.features[tab].map((f) => <li key={f.title}><b>{f.title}</b><span>{f.text}</span></li>)}
        </ul>
        <MockScreen tab={tab} M={L.meet.mock} />
      </div>
    </div>
  )
}

/** Sekmeye göre sade bir ürün görseli (gerçek bileşenlerin stiliyle, etkileşimsiz). */
function MockScreen({ tab, M }: { tab: (typeof TABS)[number]; M: L['meet']['mock'] }) {
  return (
    <div className="ld-mock" aria-hidden="true">
      <div className="ld-mock-bar"><span /><span /><span /><div className="ld-mock-prog"><i style={{ width: tab === 'ai' ? '70%' : tab === 'robotik' ? '55%' : '40%' }} /></div></div>
      {tab === 'kodlama' && (
        <div className="ld-mock-body">
          <pre className="v2-code">{'void loop() {\n  digitalWrite(13, '}<span className="ld-slot">HIGH</span>{');\n  delay('}<span className="ld-slot empty"> </span>{');\n}'}</pre>
          <div className="v2-tokens"><span className="v2-token">500</span><span className="v2-token">LOW</span><span className="v2-token">"1s"</span></div>
        </div>
      )}
      {tab === 'elektronik' && (
        <div className="ld-mock-body ld-mock-center">
          <div className="v2-blink-led on" />
          <div className="v2-timeline" style={{ width: '100%' }}><span className="seg on" style={{ flexGrow: 1 }}>HIGH 500 ms</span><span className="seg off" style={{ flexGrow: 1 }}>LOW 500 ms</span></div>
          <p className="v2-goals-mock">{M.blinkGoal}</p>
        </div>
      )}
      {tab === 'robotik' && (
        <div className="ld-mock-body">
          <svg viewBox="0 0 300 150" className="ld-arena">
            <path d="M20 120 C 80 20, 160 140, 280 30" className="ld-track" />
            <circle cx="150" cy="86" r="11" className="ld-bot" />
            <line x1="150" y1="86" x2="196" y2="56" className="ld-beam" />
            <rect x="210" y="40" width="26" height="26" rx="6" className="ld-obstacle" />
          </svg>
          <p className="v2-goals-mock">{M.arenaGoal}</p>
        </div>
      )}
      {tab === 'ai' && (
        <div className="ld-mock-body">
          <div className="ld-tokens">{M.tokens.map((x) => <span key={x}>{x}</span>)}</div>
          <div className="ld-probs">
            {M.next.map((w, i) => { const p = [62, 28, 5][i]; return <div key={w}><span>{w}</span><i style={{ width: `${p}%` }} /><b>{p}%</b></div> })}
          </div>
        </div>
      )}
      <div className="ld-mock-coach"><Mascot size={30} /><span>{M.coach[tab]}</span></div>
    </div>
  )
}

/** Tarayıcıda ilerlemesi ya da planı olan misafire "Kaldığın yerden devam et". */
export function ContinueLink({ label }: { label: string }) {
  const profile = useProfile()
  const done = useDoneIds()
  if (!profile && done.size === 0) return null
  return <Link className="v2-btn ghost" href="/panel">{label}</Link>
}
