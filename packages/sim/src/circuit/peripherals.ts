// Çevre birimleri: Uno pinlerine kablolanmış davranışsal entegreler (74HC595) ve ortak "kablolu Uno pini" yardımcıları.
// Tarayıcı ve Node uyumlu (Node'a özgü API yok). Zamanlama çevrim-hassastır: kenarlar `Sim.onPin` geri çağırmalarıyla
// (1 ms dilimden bağımsız) işlenir; shiftOut µs hızında çalışır.
import type { Pin, Sim } from '../sim.js'
import type { Circuit, PinRef } from './contract.js'
import type { Netlist } from './netlist.js'

/** 'D6' → 6, 'A4' → 'A4' (Sim pin türü). */
export function simPin(name: string): Pin { return name[0] === 'D' ? Number(name.slice(1)) : name }

/** Bir parça pininin doğrudan bağlı olduğu Uno pin adı ('D6', 'A4') ve Sim karşılığı; yoksa undefined. */
export function wiredUno(nl: Netlist, part: string, pin: string): { name: string; pin: Pin } | undefined {
  const name = nl.unoPinOf({ part, pin })
  return name === undefined ? undefined : { name, pin: simPin(name) }
}

/**
 * 74HC595: 8 bitlik kaydırma yazmacı + 8 bitlik mandal. QA = kaydırma yazmacının ilk katı (yeni bit buraya girer),
 * QH son kat. `sh` kaydırma yazmacı, `lat` mandal (çıkışlar). QH' (QH_) = sh[7].
 */
export class Sr595Chip {
  sh: boolean[] = new Array(8).fill(false)
  lat: boolean[] = new Array(8).fill(false)
  /** VCC 5 V ve GND toprakta (devre çözümünden güncellenir). */
  powered = false
  /** SRCLR yüksek (temizleme yok) ve beslenmiş: kenarlar kaydırır. */
  active = false
  constructor(
    readonly id: string,
    readonly ser: Pin | undefined,
    readonly srclk: Pin | undefined,
    readonly rclk: Pin | undefined,
    /** SER ucu başka bir 595'in QH_ ucuna bağlıysa onun kimliği. */
    readonly serFrom: string | undefined,
  ) {}
  /** Durum imzası (çözüm önbelleği anahtarı için): mandal + QH_. */
  signature(): string { return `${this.lat.map(Number).join('')}${this.sh[7] ? 1 : 0}${this.powered ? 1 : 0}${this.active ? 1 : 0}` }
  clearShift(): void { this.sh.fill(false) }
  reset(): void { this.sh.fill(false); this.lat.fill(false) }
}

export function buildSr595(circuit: Circuit, nl: Netlist): Sr595Chip[] {
  const chips = circuit.parts.filter((p) => p.type === 'sr595')
  const qhNet = new Map<number, string>()
  for (const p of chips) { const n = nl.netOf({ part: p.id, pin: 'QH_' }); if (n !== undefined && nl.isWired({ part: p.id, pin: 'QH_' })) qhNet.set(n, p.id) }
  return chips.map((p) => {
    const ref = (pin: string): PinRef => ({ part: p.id, pin })
    const uno = (pin: string): Pin | undefined => wiredUno(nl, p.id, pin)?.pin
    const serNet = nl.netOf(ref('SER'))
    const from = serNet !== undefined ? qhNet.get(serNet) : undefined
    return new Sr595Chip(p.id, uno('SER'), uno('SRCLK'), uno('RCLK'), from === p.id ? undefined : from)
  })
}

/** Saat/mandal kenarlarına abone olur. Aynı Uno pinine bağlı birden çok çip (zincir) iki aşamada işlenir: önce tüm SER örneklenir, sonra kaydırılır. */
export function attachSr595(sim: Sim, chips: Sr595Chip[]): void {
  const byId = new Map(chips.map((c) => [c.id, c] as const))
  const bySrclk = new Map<Pin, Sr595Chip[]>(), byRclk = new Map<Pin, Sr595Chip[]>()
  for (const c of chips) {
    if (c.srclk !== undefined) (bySrclk.get(c.srclk) ?? bySrclk.set(c.srclk, []).get(c.srclk)!).push(c)
    if (c.rclk !== undefined) (byRclk.get(c.rclk) ?? byRclk.set(c.rclk, []).get(c.rclk)!).push(c)
  }
  const serOf = (c: Sr595Chip): boolean => {
    if (c.ser !== undefined) return sim.read(c.ser)
    if (c.serFrom !== undefined) return byId.get(c.serFrom)?.sh[7] ?? false
    return false
  }
  for (const [pin, group] of bySrclk) {
    sim.onPin(pin, (high) => {
      if (!high) return
      const bits = group.map(serOf)
      group.forEach((c, i) => { if (c.active) { c.sh.pop(); c.sh.unshift(bits[i]) } })
    })
  }
  for (const [pin, group] of byRclk) {
    sim.onPin(pin, (high) => {
      if (!high) return
      for (const c of group) if (c.powered) c.lat = c.sh.slice()
    })
  }
}
