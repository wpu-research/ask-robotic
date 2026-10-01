// Netlist çıkarımı: kablolar ve parça pinlerinden düğüm (net) kümeleri (union-find).
// Uno'nun GND/GND2/GND3 uçları tek düğümdür (toprak); 5V ile VIN aynı 5 V hattıdır.
import type { Circuit, PartInstance, PartType, PinRef } from './contract.js'
import { PINS } from './contract.js'

/** Parçanın iç iletim yolu: from pininden to pinine (directed ise yalnız bu yönde). */
export interface InternalPath { from: string; to: string; directed?: boolean }

export function internalPaths(part: PartInstance): InternalPath[] {
  switch (part.type) {
    case 'resistor': case 'ldr': case 'ntc': return [{ from: '1', to: '2' }]
    case 'led': case 'diode': return [{ from: 'A', to: 'K', directed: true }]
    case 'dcmotor': return [{ from: 'M1', to: 'M2' }]
    case 'sevenseg': {
      const anode = part.props.common === 'anode'
      return ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'dp'].map((c) => (anode ? { from: 'COM', to: c, directed: true } : { from: c, to: 'COM', directed: true }))
    }
    case 'button': return [{ from: 'A', to: 'B' }]
    case 'pot': return [{ from: 'VCC', to: 'SIG' }, { from: 'SIG', to: 'GND' }]
    case 'buzzer': return [{ from: '+', to: '-' }]
    case 'rgbled': {
      const anode = part.props.common === 'anode'
      return ['R', 'G', 'B'].map((c) => (anode ? { from: 'COM', to: c, directed: true } : { from: c, to: 'COM', directed: true }))
    }
    default: return []
  }
}

export interface NetEdge { from: number; to: number; partId: string; type: PartType }

export interface Netlist {
  /** Pinin düğüm kimliği; bilinmeyen parça/pin için undefined. */
  netOf(ref: PinRef): number | undefined
  /** Pine en az bir kablo bağlı mı. */
  isWired(ref: PinRef): boolean
  readonly unoId: string | undefined
  /** Toprak düğümü (Uno yoksa undefined). */
  readonly ground: number | undefined
  /** 5 V hattı (5V + VIN) ve 3,3 V hattı. */
  readonly rail5: number | undefined
  readonly rail3: number | undefined
  readonly netCount: number
  /** Bir düğümden, yalnızca `via` türündeki parçaların iç yollarıyla komşu düğümler. */
  neighbors(net: number, via: readonly PartType[]): NetEdge[]
  /** `via` parçalarıyla ulaşılabilen tüm düğümler (başlangıç dahil). */
  reachable(net: number, via: readonly PartType[]): Set<number>
  /** Düğümdeki Uno dijital/analog pin adları ('D13', 'A0'). */
  unoPinsOnNet(net: number): string[]
  /** Parça pininin doğrudan (kablolarla) bağlı olduğu ilk Uno dijital/analog pini ('D6', 'A4'); yoksa undefined. */
  unoPinOf(ref: PinRef): string | undefined
  readonly partById: Map<string, PartInstance>
}

export function buildNetlist(circuit: Circuit): Netlist {
  const partById = new Map<string, PartInstance>()
  for (const p of circuit.parts) partById.set(p.id, p)
  const key = (part: string, pin: string): string => `${part}\u0000${pin}`
  const index = new Map<string, number>()
  const parent: number[] = []
  const add = (k: string): number => {
    let i = index.get(k)
    if (i === undefined) { i = parent.length; index.set(k, i); parent.push(i) }
    return i
  }
  const find = (i: number): number => { while (parent[i] !== i) { parent[i] = parent[parent[i]]; i = parent[i] } return i }
  const union = (a: number, b: number): void => { const ra = find(a), rb = find(b); if (ra !== rb) parent[rb] = ra }

  for (const p of circuit.parts) for (const pin of PINS[p.type] ?? []) add(key(p.id, pin))
  const uno = circuit.parts.find((p) => p.type === 'uno')
  const unoId = uno?.id
  if (uno) {
    union(add(key(uno.id, 'GND')), add(key(uno.id, 'GND2')))
    union(add(key(uno.id, 'GND')), add(key(uno.id, 'GND3')))
    union(add(key(uno.id, '5V')), add(key(uno.id, 'VIN')))
  }
  const wired = new Set<string>()
  const valid = (r: PinRef): boolean => { const p = partById.get(r.part); return !!p && (PINS[p.type] ?? []).includes(r.pin) }
  for (const w of circuit.wires) {
    if (!valid(w.a) || !valid(w.b)) continue
    union(add(key(w.a.part, w.a.pin)), add(key(w.b.part, w.b.pin)))
    wired.add(key(w.a.part, w.a.pin)); wired.add(key(w.b.part, w.b.pin))
  }

  // kök -> yoğun düğüm kimliği
  const dense = new Map<number, number>()
  const netIdOfRoot = (r: number): number => { let d = dense.get(r); if (d === undefined) { d = dense.size; dense.set(r, d) } return d }
  for (let i = 0; i < parent.length; i++) netIdOfRoot(find(i))
  const netOf = (ref: PinRef): number | undefined => {
    const i = index.get(key(ref.part, ref.pin))
    return i === undefined ? undefined : netIdOfRoot(find(i))
  }

  // iç yol kenarları
  const adj = new Map<number, NetEdge[]>()
  const pushEdge = (e: NetEdge): void => { const l = adj.get(e.from); if (l) l.push(e); else adj.set(e.from, [e]) }
  for (const p of circuit.parts) {
    for (const path of internalPaths(p)) {
      const a = netOf({ part: p.id, pin: path.from }), b = netOf({ part: p.id, pin: path.to })
      if (a === undefined || b === undefined) continue
      pushEdge({ from: a, to: b, partId: p.id, type: p.type })
      if (!path.directed) pushEdge({ from: b, to: a, partId: p.id, type: p.type })
    }
  }
  const unoPinNames = uno ? PINS.uno.filter((n) => /^(D\d+|A\d)$/.test(n)) : []
  const unoByNet = new Map<number, string[]>()
  for (const n of unoPinNames) {
    const net = netOf({ part: uno!.id, pin: n })!
    const l = unoByNet.get(net); if (l) l.push(n); else unoByNet.set(net, [n])
  }

  const neighbors = (net: number, via: readonly PartType[]): NetEdge[] => (adj.get(net) ?? []).filter((e) => via.includes(e.type))
  return {
    netOf,
    isWired: (ref) => wired.has(key(ref.part, ref.pin)),
    unoId,
    ground: uno ? netOf({ part: uno.id, pin: 'GND' }) : undefined,
    rail5: uno ? netOf({ part: uno.id, pin: '5V' }) : undefined,
    rail3: uno ? netOf({ part: uno.id, pin: '3V3' }) : undefined,
    netCount: dense.size,
    neighbors,
    reachable(start, via) {
      const seen = new Set<number>([start]); const stack = [start]
      while (stack.length) {
        const n = stack.pop()!
        for (const e of neighbors(n, via)) if (!seen.has(e.to)) { seen.add(e.to); stack.push(e.to) }
      }
      return seen
    },
    unoPinsOnNet: (net) => unoByNet.get(net) ?? [],
    unoPinOf: (ref) => { const n = netOf(ref); return n === undefined ? undefined : unoByNet.get(n)?.[0] },
    partById,
  }
}
