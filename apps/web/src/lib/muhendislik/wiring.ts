// Kit devresinin kablolarını okunur satırlara çevirir ("Uno 5V → MQ-135 VCC"). Saf; parça sayfası ve testler kullanır.
import type { Circuit } from '@/lib/lab/contract'
import { SHORT_NAME } from '@/lib/lab/parts'
import { PART_DEFS } from '@/lib/lab/geometry'

export interface WireRow { from: string; to: string }

const UNO_GND = /^GND\d?$/

export function wiringRows(c: Circuit): WireRow[] {
  const name = (id: string, pin: string): string => {
    const p = c.parts.find((x) => x.id === id)
    if (!p) return `${id}.${pin}`
    if (p.type === 'uno') return `Uno ${UNO_GND.test(pin) ? 'GND' : pin}`
    return `${SHORT_NAME[p.type] ?? PART_DEFS[p.type].name} ${pin}`
  }
  // Uno ucu hep sağda: "parça ucu → Uno pini"
  return c.wires.map((w) => {
    const aUno = c.parts.find((x) => x.id === w.a.part)?.type === 'uno'
    const [x, y] = aUno ? [w.b, w.a] : [w.a, w.b]
    return { from: name(x.part, x.pin), to: name(y.part, y.pin) }
  })
}
