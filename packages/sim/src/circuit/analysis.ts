// Statik devre analizi (hex gerekmez): düğüm eşitliği, parça üzerinden bağlantı ve statik uyarılar.
import type { Circuit, CircuitAnalysis, LabWarning, PartType, PinRef } from './contract.js'
import { PINS } from './contract.js'
import { ledSpecs } from './model.js'
import { buildNetlist, internalPaths, type Netlist } from './netlist.js'

const RESISTIVE: ReadonlySet<PartType> = new Set<PartType>(['resistor', 'pot', 'ldr', 'ntc', 'buzzer', 'dcmotor'])
const PASSIVE: readonly PartType[] = ['resistor', 'button', 'pot', 'ldr', 'ntc', 'buzzer', 'led', 'rgbled', 'diode', 'dcmotor', 'sevenseg']

/** Pinleri sinyal girişi/çıkışı olan etkin parçalar: bu parçalara bağlı hat "yüzen" sayılmaz. */
const ACTIVE: readonly PartType[] = ['npn', 'mosfet', 'l293d', 'relay', 'sr595', 'lcd1602', 'lcdI2c']

/** Besleme pinleri (modül/entegre): VCC 5 V hattında (ya da bir Uno pininde), GND toprakta olmalı. */
const POWER: Partial<Record<PartType, { vcc: string[]; gnd: string; name: string }>> = {
  l293d: { vcc: ['VCC1', 'VCC2'], gnd: 'GND', name: 'L293D' },
  relay: { vcc: ['VCC'], gnd: 'GND', name: 'Röle modülü' },
  sr595: { vcc: ['VCC'], gnd: 'GND', name: '74HC595' },
  lcd1602: { vcc: ['VDD'], gnd: 'VSS', name: 'LCD' },
  lcdI2c: { vcc: ['VCC'], gnd: 'GND', name: 'I2C LCD' },
}

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
  for (const led of ledSpecs(circuit).filter((l) => l.burnable)) {
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
      if (ACTIVE.includes(p.type)) for (const pin of PINS[p.type]) { const n = nl.netOf({ part: p.id, pin }); if (n !== undefined) servoNets.add(n) }
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
  staticPartWarnings(circuit, nl, out)
  return out
}

/** Aşama B parçalarının statik uyarıları: besleme, flyback diyodu, taban direnci, yüzen giriş. */
function staticPartWarnings(circuit: Circuit, nl: Netlist, out: LabWarning[]): void {
  const ref = (part: string, pin: string): PinRef => ({ part, pin })
  const isSupply = (net: number | undefined): boolean => net !== undefined && (net === nl.rail5 || nl.unoPinsOnNet(net).length > 0)
  for (const p of circuit.parts) {
    const pw = POWER[p.type]
    if (pw) {
      const missing: string[] = []
      for (const v of pw.vcc) if (!nl.isWired(ref(p.id, v)) || !isSupply(nl.netOf(ref(p.id, v)))) missing.push(v === 'VCC2' ? 'VCC2 (motor beslemesi)' : v)
      const g = nl.netOf(ref(p.id, pw.gnd))
      if (!nl.isWired(ref(p.id, pw.gnd)) || g === undefined || g !== nl.ground) missing.push(pw.gnd)
      if (missing.length) out.push({ kind: 'unpowered', partId: p.id, message: `${pw.name} beslenmemiş: ${missing.join(', ')} 5 V / GND hattına bağlı değil.` })
    }
    if (p.type === 'sr595') {
      for (const pin of ['SER', 'SRCLK', 'RCLK', 'OE', 'SRCLR']) {
        if (!nl.isWired(ref(p.id, pin))) {
          const note = pin === 'OE' ? 'çıkışlar kapalı kalır (OE GND\'ye bağlanmalı)' : pin === 'SRCLR' ? 'kaydırma yazmacı temizlenmiş sayılır (SRCLR 5 V\'a bağlanmalı)' : 'çip çalışmaz'
          out.push({ kind: 'floating-input', partId: p.id, message: `74HC595 ${pin} ucu bağlı değil (yüzen giriş): ${note}.` })
        }
      }
    }
    if (p.type === 'npn') {
      const base = nl.netOf(ref(p.id, 'B'))
      if (base !== undefined && nl.isWired(ref(p.id, 'B'))) {
        const e = ends(nl, base, p.id)
        if (e.freeSrc.size > 0) out.push({ kind: 'base-overcurrent', partId: p.id, message: 'Transistörün tabanında seri direnç yok: taban akımı sınırsız (tabana direnç ekle).' })
      }
    }
    if (p.type === 'dcmotor') {
      const n1 = nl.netOf(ref(p.id, 'M1')), n2 = nl.netOf(ref(p.id, 'M2'))
      if (n1 === undefined || n2 === undefined) continue
      // sürücü: motor ucunun düğümünde bir transistör kolektörü ya da MOSFET akacı var mı (alçak taraf anahtarı)
      let lowNet: number | undefined
      for (const q of circuit.parts) {
        const pin = q.type === 'npn' ? 'C' : q.type === 'mosfet' ? 'D' : undefined
        if (!pin) continue
        const qn = nl.netOf(ref(q.id, pin))
        if (qn === n1 || qn === n2) lowNet = qn
      }
      if (lowNet === undefined || n1 === n2) continue
      let ok = false, reversed = false
      for (const d of circuit.parts) {
        if (d.type !== 'diode') continue
        const a = nl.netOf(ref(d.id, 'A')), k = nl.netOf(ref(d.id, 'K'))
        if (!((a === n1 && k === n2) || (a === n2 && k === n1))) continue
        if (a === lowNet) ok = true; else reversed = true
      }
      if (!ok) out.push({ kind: 'flyback-missing', partId: p.id, message: reversed ? 'Motorun flyback diyodu ters bağlı: anot (düz uç) transistör tarafında, katot (çizgili uç) motorun artı ucunda olmalı.' : 'Motor transistör/MOSFET ile sürülüyor ama uçlarına paralel flyback diyodu yok: kesilen akım transistörü bozabilir.' })
    }
  }
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
