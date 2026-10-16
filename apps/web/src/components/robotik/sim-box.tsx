'use client'
// ESOF 323 simülasyonunu (sims-core) bir React kutusuna bağlar: başlık, açıklama, tuval ve denetimler. Dil değişince yeniden kurulur.
import { useEffect, useRef } from 'react'
import { mountSim } from './sims-core'
import { SIM_META, type SimId } from './sim-meta'

export function SimBox({ id, lang, cfg }: { id: SimId; lang: 'tr' | 'en'; cfg?: Record<string, string> }) {
  const stage = useRef<HTMLDivElement>(null)
  const side = useRef<HTMLDivElement>(null)
  const cfgKey = JSON.stringify(cfg ?? {})
  useEffect(() => {
    const st = stage.current!, sd = side.current!
    st.replaceChildren(); sd.replaceChildren()
    const stop = mountSim(id, st, sd, JSON.parse(cfgKey), lang)
    return () => { stop(); st.replaceChildren(); sd.replaceChildren() }
  }, [id, lang, cfgKey])
  const m = SIM_META[id][lang]
  return (
    <section className="rb-sim" data-testid={`sim-${id}`}>
      <div className="rb-sim-head"><h3>{m.title}</h3><p>{m.desc}</p></div>
      <div className="rb-sim-body">
        <div ref={stage} className="rb-sim-stage" />
        <div ref={side} className="rb-sim-side" />
      </div>
    </section>
  )
}
