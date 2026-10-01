// Statik devre analizi (hex gerekmez): düğüm eşitliği, parça üzerinden bağlantı ve statik uyarılar.
import type { Circuit, CircuitAnalysis, LabWarning, PartType, PinRef } from './contract.js'
import { PINS } from './contract.js'
import { ledSpecs } from './model.js'
import { buildNetlist, internalPaths, type Netlist } from './netlist.js'

const RESISTIVE: ReadonlySet<PartType> = new Set<PartType>(['resistor', 'pot', 'ldr', 'ntc', 'buzzer'])
const PASSIVE: readonly PartType[] = ['resistor', 'button', 'pot', 'ldr', 'ntc', 'buzzer', 'led', 'rgbled']

interface Ends { gnd: boolean; rail: boolean; pin: boolean; freeSrc: Set<number>; freeSink: Set<number> }

/** Bir düğümden (kendi parçası hariç) ulaşılabilen uç türleri; uçlar (toprak, hat, Uno pini) genişletilmez. */
function ends(nl: Netlist, start: number, exclude: string): Ends {
  const r: Ends = { gnd: false, rail: false, pin: false, freeSrc: new Set(), freeSink: new Set() }
  const seen = new Set<string>()
  const queue: Array<[number, boolean]> = [[start, false]]
  while (queue.length) {
    const [net, crossed] = queue.shift()!
    const k = `${net}:${crossed ? 1 : 0}`
    if (seen.has(k)) continue
    seen.add(k)
    const isGnd = net === nl.ground
    const isRail = net === nl.rail5 || net === nl.rail3
    const isPin = nl.unoPinsOnNet(net).length > 0
    if (isGnd || isRail || isPin) {
      if (isGnd) r.gnd = true; else if (isRail) r.rail = true; else r.pin = true
      if (!crossed) {
        if (isRail || isPin) r.freeSrc.add(net)
        if (isGnd || isPin) r.freeSink.add(net)
      }
      continue
    }
    for (const e of nl.neighbors(net, PASSIVE)) {
      if (e.partId === exclude) continue
      queue.push([e.to, crossed || RESISTIVE.has(e.type)])
    }
  }
  return r
}

export function staticWarnings(circuit: Circuit, nl: Netlist = buildNetlist(circuit)): LabWarning[] {
  const out: LabWarning[] = []
  const unoId = nl.unoId
  if (unoId !== undefined && nl.ground !== undefined) {
    if (nl.rail5 === nl.ground) out.push({ kind: 'short-circuit', partId: unoId, message: '5V hattı doğrudan GND\'ye bağlı (kısa devre).' })
    if (nl.rail3 === nl.ground) out.push({ kind: 'short-circuit', partId: unoId, message: '3V3 hattı doğrudan GND\'ye bağlı (kısa devre).' })
    if (nl.rail5 === nl.rail3) out.push({ kind: 'short-circuit', partId: unoId, message: '5V ile 3V3 hatları birbirine bağlı.' })
  }
  const warnedPart = new Set<string>()
  for (const led of ledSpecs(circuit)) {
    const na = nl.netOf(led.a), nk = nl.netOf(led.k)
    if (na === undefined || nk === undefined) continue
    const ea = ends(nl, na, led.partId), ek = ends(nl, nk, led.partId)
    const reversed =
      (ea.gnd && !ea.rail && !ek.gnd && (ek.rail || ek.pin)) ||
      (ea.pin && !ea.gnd && !ea.rail && ek.rail && !ek.gnd)
    if (reversed) {
      out.push({ kind: 'reversed-polarity', partId: led.partId, message: 'LED ters bağlı: anot (+) toprağa daha yakın.' })
      continue
    }
    let noRes = false
    for (const s of ea.freeSrc) for (const t of ek.freeSink) if (s !== t) noRes = true
    if (noRes && !warnedPart.has(led.partId)) {
      warnedPart.add(led.partId)
      out.push({ kind: 'led-no-resistor', partId: led.partId, message: 'LED\'in seri direnci yok; akım sınırlanmazsa LED yanar.' })
    }
  }

  // Yüzen giriş (statik): kabloyla bağlı ama toprak/besleme/başka Uno pini ya da servo sinyaline hiç iletken yolu olmayan pin.
  if (unoId !== undefined) {
    const adj = new Map<number, number[]>()
    const link = (a: number, b: number): void => { (adj.get(a) ?? adj.set(a, []).get(a)!).push(b) }
    const servoNets = new Set<number>()
    for (const p of circuit.parts) {
      if (p.type === 'servo') { const n = nl.netOf({ part: p.id, pin: 'SIG' }); if (n !== undefined) servoNets.add(n) }
      for (const path of internalPaths(p)) {
        const a = nl.netOf({ part: p.id, pin: path.from }), b = nl.netOf({ part: p.id, pin: path.to })
        if (a !== undefined && b !== undefined) { link(a, b); link(b, a) }
      }
    }
    for (const name of PINS.uno.filter((n) => /^(D\d+|A\d)$/.test(n))) {
      const ref: PinRef = { part: unoId, pin: name }
      if (!nl.isWired(ref)) continue
      const start = nl.netOf(ref)!
      const driven = (net: number): boolean =>
        net === nl.ground || net === nl.rail5 || net === nl.rail3 || servoNets.has(net) || nl.unoPinsOnNet(net).some((n) => n !== name)
      const seen = new Set<number>([start]); const stack = [start]
      let ok = false
      while (stack.length) {
        const n = stack.pop()!
        if (driven(n)) { ok = true; break }
        for (const m of adj.get(n) ?? []) if (!seen.has(m)) { seen.add(m); stack.push(m) }
      }
      if (!ok) out.push({ kind: 'floating-input', partId: unoId, message: `${name} pinine bağlı hat toprağa, besleme hattına ya da başka bir uca iletken yolla bağlı değil (yüzen).` })
    }
  }
  return out
}

export function analyzeCircuit(circuit: Circuit): CircuitAnalysis {
  const nl = buildNetlist(circuit)
  return {
    sameNet(a, b) {
      const x = nl.netOf(a), y = nl.netOf(b)
      return x !== undefined && x === y
    },
    connected(a, b, via) {
      const x = nl.netOf(a), y = nl.netOf(b)
      if (x === undefined || y === undefined) return false
      return nl.reachable(x, via ?? []).has(y)
    },
    warnings: staticWarnings(circuit, nl),
  }
}
