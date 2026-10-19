'use client'
// Drone dersi simülasyonunu (sims.ts) bir React kutusuna bağlar; görünüm ESOF 323 SimBox'ıyla aynı (.rb-sim). Dil değişince yeniden kurulur.
// 3B sahnesi olan simlerde üstte 3B uçuş sahnesi (Drone3D), altında 2B grafikler ve denetimler eşlik eden panel olarak kalır;
// ikisi SimLink ile aynı parametreleri paylaşır.
import { useEffect, useRef } from 'react'
import { Drone3D } from './drone-3d'
import { createLink } from './link'
import { mountDroneSim } from './sims'
import { DRONE_3D, DRONE_SIM_META, type DroneSimId } from './sim-meta'

export function DroneSimBox({ id, lang, cfg }: { id: DroneSimId; lang: 'tr' | 'en'; cfg?: Record<string, string> }) {
  const stage = useRef<HTMLDivElement>(null)
  const side = useRef<HTMLDivElement>(null)
  const link = useRef(createLink()).current
  const cfgKey = JSON.stringify(cfg ?? {})
  useEffect(() => {
    const st = stage.current!, sd = side.current!
    st.replaceChildren(); sd.replaceChildren()
    const stop = mountDroneSim(id, st, sd, JSON.parse(cfgKey), lang, link)
    return () => { stop(); st.replaceChildren(); sd.replaceChildren() }
  }, [id, lang, cfgKey, link])
  const m = DRONE_SIM_META[id][lang]
  return (
    <section className="rb-sim" id={`sim-${id}`} data-testid={`drone-sim-${id}`}>
      <div className="rb-sim-head"><h3>{m.title}</h3><p>{m.desc}</p></div>
      {DRONE_3D.includes(id) && <Drone3D id={id} link={link} lang={lang} cfg={cfg} />}
      <div className="rb-sim-body">
        <div ref={stage} className="rb-sim-stage" />
        <div ref={side} className="rb-sim-side" />
      </div>
    </section>
  )
}
