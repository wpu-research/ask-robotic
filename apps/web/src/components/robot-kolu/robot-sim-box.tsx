'use client'
// Robot Kolu dersi simülasyonunu (sims.ts) bir React kutusuna bağlar; görünüm ESOF 323 SimBox'ıyla aynı (.rb-sim). Dil değişince yeniden kurulur.
import { useEffect, useRef } from 'react'
import { ROBOT_SIM_META, type RobotSimId } from './sim-meta'
import { mountRobotSim } from './sims'

export function RobotSimBox({ id, lang, cfg }: { id: RobotSimId; lang: 'tr' | 'en'; cfg?: Record<string, string> }) {
  const stage = useRef<HTMLDivElement>(null)
  const side = useRef<HTMLDivElement>(null)
  const cfgKey = JSON.stringify(cfg ?? {})
  useEffect(() => {
    const st = stage.current!, sd = side.current!
    st.replaceChildren(); sd.replaceChildren()
    const stop = mountRobotSim(id, st, sd, JSON.parse(cfgKey), lang)
    return () => { stop(); st.replaceChildren(); sd.replaceChildren() }
  }, [id, lang, cfgKey])
  const m = ROBOT_SIM_META[id][lang]
  return (
    <section className="rb-sim" id={`sim-${id}`} data-testid={`robot-sim-${id}`}>
      <div className="rb-sim-head"><h3>{m.title}</h3><p>{m.desc}</p></div>
      <div className="rb-sim-body">
        <div ref={stage} className="rb-sim-stage lm-stage" />
        <div ref={side} className="rb-sim-side" />
      </div>
    </section>
  )
}
