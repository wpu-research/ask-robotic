'use client'
// Gömülü kurs simülasyon kutusu: başlık + açıklama + kitine göre (rpi / stm32) simülasyon. Görünüm ESOF 323 .rb-sim.
import type { RpiSimId } from '@/lib/rpi/sims'
import type { StmSimId } from '@/lib/stm32/sims'
import { RpiSim } from './rpi-sims'
import { StmSim } from './stm32-sims'

export function GomuluSim({ kit, id, lang, cfg, title, desc }: { kit: 'rpi' | 'stm32'; id: string; lang: 'tr' | 'en'; cfg?: Record<string, string>; title: string; desc: string }) {
  return (
    <section className="rb-sim gm-sim" id={`sim-${id}`} data-testid={`${kit}-sim-${id}`}>
      <div className="rb-sim-head"><h3>{title}</h3><p>{desc}</p></div>
      {kit === 'rpi' ? <RpiSim key={lang} id={id as RpiSimId} lang={lang} cfg={cfg ?? {}} /> : <StmSim key={lang} id={id as StmSimId} lang={lang} cfg={cfg ?? {}} />}
    </section>
  )
}
