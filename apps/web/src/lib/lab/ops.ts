// Devre düzenleme işlemleri (saf, değişmez güncellemeler) + doğrulama + renk bandı.
import { PINS, PROPS, type Circuit, type PartInstance, type PartType, type PinRef, type PropValue, type Wire } from './contract'
import { PART_DEFS, WORLD, nextRotation, snap } from './geometry'

export const WIRE_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#a855f7', '#14b8a6', '#ec4899', '#0ea5e9']
export const WIRE_RED = '#ef4444'
export const WIRE_BLACK = '#1f2937'

const isPlus = (r: PinRef) => r.pin === '5V' || r.pin === '3V3' || r.pin === 'VIN'
const isGnd = (r: PinRef) => r.pin === 'GND' || r.pin === 'GND2' || r.pin === 'GND3'

/** Kablo rengi: 5V/3V3/VIN → kırmızı, GND → siyah, diğerleri döngüyle yeşil/mavi/turuncu/mor… */
export function wireColor(c: Circuit, a: PinRef, b: PinRef): string {
  if (isPlus(a) || isPlus(b)) return WIRE_RED
  if (isGnd(a) || isGnd(b)) return WIRE_BLACK
  const others = c.wires.filter((w) => !isPlus(w.a) && !isPlus(w.b) && !isGnd(w.a) && !isGnd(w.b)).length
  return WIRE_COLORS[others % WIRE_COLORS.length]
}

export function defaultProps(type: PartType): Record<string, PropValue> {
  return Object.fromEntries(PROPS[type].map((d) => [d.key, d.default]))
}

export function uniqueId(prefix: string, taken: Iterable<string>): string {
  const set = new Set(taken)
  let n = 1
  while (set.has(`${prefix}${n}`)) n++
  return `${prefix}${n}`
}

const clampPos = (type: PartType, x: number, y: number) => {
  const { w, h } = PART_DEFS[type]
  return { x: Math.max(0, Math.min(WORLD.w - w, snap(x))), y: Math.max(0, Math.min(WORLD.h - h, snap(y))) }
}

export function addPart(c: Circuit, type: PartType, x: number, y: number): { circuit: Circuit; part: PartInstance } {
  const part: PartInstance = {
    id: uniqueId(type, c.parts.map((p) => p.id)), type, ...clampPos(type, x, y), rotation: 0, props: defaultProps(type),
  }
  return { circuit: { ...c, parts: [...c.parts, part] }, part }
}

export function movePart(c: Circuit, id: string, x: number, y: number): Circuit {
  return { ...c, parts: c.parts.map((p) => (p.id === id ? { ...p, ...clampPos(p.type, x, y) } : p)) }
}

export function rotatePart(c: Circuit, id: string): Circuit {
  return { ...c, parts: c.parts.map((p) => (p.id === id ? { ...p, rotation: nextRotation(p.rotation) } : p)) }
}

/** Parçayı ve ona bağlı tüm kabloları siler. */
export function removePart(c: Circuit, id: string): Circuit {
  return { parts: c.parts.filter((p) => p.id !== id), wires: c.wires.filter((w) => w.a.part !== id && w.b.part !== id) }
}

export function removeWire(c: Circuit, id: string): Circuit {
  return { ...c, wires: c.wires.filter((w) => w.id !== id) }
}

export function setProp(c: Circuit, id: string, key: string, value: PropValue): Circuit {
  return { ...c, parts: c.parts.map((p) => (p.id === id ? { ...p, props: { ...p.props, [key]: value } } : p)) }
}

const samePin = (a: PinRef, b: PinRef) => a.part === b.part && a.pin === b.pin

export type WireCheck = { ok: true } | { ok: false; reason: string }

/**
 * Kablo kuralları: iki uç da var olan pinler olmalı; aynı pine kendi kendine kablo yok;
 * aynı iki pin arasında ikinci kablo yok (yön önemsiz). Aynı parçanın iki farklı pini bağlanabilir.
 */
export function canAddWire(c: Circuit, a: PinRef, b: PinRef): WireCheck {
  const pa = c.parts.find((p) => p.id === a.part), pb = c.parts.find((p) => p.id === b.part)
  if (!pa || !pb) return { ok: false, reason: 'Parça bulunamadı.' }
  if (!PINS[pa.type].includes(a.pin) || !PINS[pb.type].includes(b.pin)) return { ok: false, reason: 'Geçersiz pin.' }
  if (samePin(a, b)) return { ok: false, reason: 'Bir pini kendisine bağlayamazsın.' }
  if (c.wires.some((w) => (samePin(w.a, a) && samePin(w.b, b)) || (samePin(w.a, b) && samePin(w.b, a)))) {
    return { ok: false, reason: 'Bu iki pin zaten bağlı.' }
  }
  return { ok: true }
}

export function addWire(c: Circuit, a: PinRef, b: PinRef): { circuit: Circuit; wire: Wire } | null {
  if (!canAddWire(c, a, b).ok) return null
  const wire: Wire = { id: uniqueId('w', c.wires.map((w) => w.id)), a: { ...a }, b: { ...b }, color: wireColor(c, a, b) }
  return { circuit: { ...c, wires: [...c.wires, wire] }, wire }
}

// ---- Doğrulama (tarayıcıda saklanan veri bozuk/eski olabilir) ----

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)

export function isCircuit(x: unknown): x is Circuit {
  const c = x as Circuit
  if (!c || !Array.isArray(c.parts) || !Array.isArray(c.wires)) return false
  const ids = new Set<string>()
  const types = new Map<string, PartType>()
  for (const p of c.parts) {
    if (!p || typeof p.id !== 'string' || ids.has(p.id)) return false
    if (typeof p.type !== 'string' || !(p.type in PINS)) return false
    if (!isNum(p.x) || !isNum(p.y) || ![0, 90, 180, 270].includes(p.rotation)) return false
    if (!p.props || typeof p.props !== 'object') return false
    for (const v of Object.values(p.props)) if (!['number', 'string', 'boolean'].includes(typeof v) || (typeof v === 'number' && !Number.isFinite(v))) return false
    ids.add(p.id); types.set(p.id, p.type)
  }
  const wireIds = new Set<string>()
  for (const w of c.wires) {
    if (!w || typeof w.id !== 'string' || wireIds.has(w.id)) return false
    wireIds.add(w.id)
    for (const end of [w.a, w.b]) {
      if (!end || typeof end.part !== 'string' || typeof end.pin !== 'string') return false
      const t = types.get(end.part)
      if (!t || !PINS[t].includes(end.pin)) return false
    }
    if (samePin(w.a, w.b)) return false
  }
  return true
}

/** Kilitli (ör. Uno) parçaların kayıtlı devrede de var olduğunu doğrular. */
export function hasParts(c: Circuit, ids: string[]): boolean {
  return ids.every((id) => c.parts.some((p) => p.id === id))
}

/** Eksik prop'lara varsayılan değerleri ekler (sözleşme genişlediyse eski kayıtlar çökmesin). */
export function normalizeCircuit(c: Circuit): Circuit {
  return { ...c, parts: c.parts.map((p) => ({ ...p, props: { ...defaultProps(p.type), ...p.props } })) }
}

// ---- Direnç renk bandı (4 bant) ----

export const BAND_COLORS: Record<string, string> = {
  black: '#111827', brown: '#7c3f12', red: '#dc2626', orange: '#f97316', yellow: '#facc15',
  green: '#16a34a', blue: '#2563eb', violet: '#7c3aed', grey: '#9ca3af', white: '#f9fafb', gold: '#d4a017', silver: '#cbd5e1',
}
const DIGIT_NAMES = ['black', 'brown', 'red', 'orange', 'yellow', 'green', 'blue', 'violet', 'grey', 'white']

/** 4 bant: 1. rakam, 2. rakam, çarpan, tolerans (altın ±%5). Renk adlarını döndürür. */
export function resistorBands(ohms: number): [string, string, string, string] {
  const v = Number.isFinite(ohms) && ohms > 0 ? ohms : 1
  let exp = Math.floor(Math.log10(v))
  let sig = Math.round(v / 10 ** (exp - 1))
  if (sig >= 100) { sig = Math.round(sig / 10); exp++ }
  const mult = exp - 1 // 10^mult
  const multName = mult >= 0 ? DIGIT_NAMES[Math.min(9, mult)] : mult === -1 ? 'gold' : 'silver'
  return [DIGIT_NAMES[Math.floor(sig / 10)], DIGIT_NAMES[sig % 10], multName, 'gold']
}

export function formatOhms(ohms: number): string {
  if (ohms >= 1_000_000) return `${+(ohms / 1_000_000).toFixed(2)} MΩ`
  if (ohms >= 1000) return `${+(ohms / 1000).toFixed(2)} kΩ`
  return `${+ohms.toFixed(2)} Ω`
}
