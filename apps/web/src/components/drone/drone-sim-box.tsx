'use client'
// Drone dersi simülasyonunu (sims.ts) bir React kutusuna bağlar; görünüm ESOF 323 SimBox'ıyla aynı (.rb-sim). Dil değişince yeniden kurulur.
import { useEffect, useRef } from 'react'
import { mountDroneSim } from './sims'
import { DRONE_SIM_META, type DroneSimId } from './sim-meta'

export function DroneSimBox({ id, lang, cfg }: { id: DroneSimId; lang: 'tr' | 'en'; cfg?: Record<string, string> }) {
  const stage = useRef<HTMLDivElement>(null)
  const side = useRef<HTMLDivElement>(null)
  const cfgKey = JSON.stringify(cfg ?? {})
  useEffect(() => {
    const st = stage.current!, sd = side.current!
    st.replaceChildren(); sd.replaceChildren()
    const stop = mountDroneSim(id, st, sd, JSON.parse(cfgKey), lang)
    return () => { stop(); st.replaceChildren(); sd.replaceChildren() }
  }, [id, lang, cfgKey])
  const m = DRONE_SIM_META[id][lang]
  return (
    <section className="rb-sim" id={`sim-${id}`} data-testid={`drone-sim-${id}`}>
      <div className="rb-sim-head"><h3>{m.title}</h3><p>{m.desc}</p></div>
      <div className="rb-sim-body">
        <div ref={stage} className="rb-sim-stage" />
        <div ref={side} className="rb-sim-side" />
      </div>
    </section>
  )
}
