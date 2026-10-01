// Parça geometrisi: boyutlar, parça-yerel pin koordinatları, döndürme dönüşümü, kablo yolu. Saf (DOM yok).
import type { PartInstance, PartType } from './contract'

export interface Pt { x: number; y: number }
export interface PartDef {
  name: string
  w: number
  h: number
  /** Parça-yerel pin koordinatları (döndürülmemiş). */
  pins: Record<string, Pt>
}

const row = (names: string[], x0: number, step: number, y: number): Record<string, Pt> =>
  Object.fromEntries(names.map((n, i) => [n, { x: x0 + i * step, y }]))

export const PART_DEFS: Record<PartType, PartDef> = {
  uno: {
    name: 'Arduino Uno', w: 290, h: 150,
    pins: {
      GND2: { x: 36, y: 12 },
      ...row(['D13', 'D12', 'D11', 'D10', 'D9', 'D8'], 52, 16, 12),
      ...row(['D7', 'D6', 'D5', 'D4', 'D3', 'D2', 'D1', 'D0'], 152, 16, 12),
      ...row(['3V3', '5V', 'GND', 'GND3', 'VIN'], 60, 16, 138),
      ...row(['A0', 'A1', 'A2', 'A3', 'A4', 'A5'], 164, 16, 138),
    },
  },
  led: { name: 'LED', w: 40, h: 64, pins: { A: { x: 12, y: 60 }, K: { x: 28, y: 60 } } },
  resistor: { name: 'Direnç', w: 80, h: 24, pins: { '1': { x: 4, y: 12 }, '2': { x: 76, y: 12 } } },
  button: { name: 'Buton', w: 50, h: 50, pins: { A: { x: 4, y: 25 }, B: { x: 46, y: 25 } } },
  pot: { name: 'Potansiyometre', w: 60, h: 70, pins: { VCC: { x: 10, y: 66 }, SIG: { x: 30, y: 66 }, GND: { x: 50, y: 66 } } },
  ldr: { name: 'LDR (ışık sensörü)', w: 60, h: 32, pins: { '1': { x: 4, y: 16 }, '2': { x: 56, y: 16 } } },
  ntc: { name: 'NTC (sıcaklık sensörü)', w: 60, h: 32, pins: { '1': { x: 4, y: 16 }, '2': { x: 56, y: 16 } } },
  buzzer: { name: 'Buzzer', w: 50, h: 64, pins: { '+': { x: 14, y: 60 }, '-': { x: 36, y: 60 } } },
  rgbled: { name: 'RGB LED', w: 62, h: 70, pins: { R: { x: 10, y: 66 }, G: { x: 24, y: 66 }, B: { x: 38, y: 66 }, COM: { x: 52, y: 66 } } },
  servo: { name: 'Servo', w: 100, h: 64, pins: { SIG: { x: 4, y: 16 }, VCC: { x: 4, y: 32 }, GND: { x: 4, y: 48 } } },
}

export type Rotation = PartInstance['rotation']
export const ROTATIONS: Rotation[] = [0, 90, 180, 270]
export const nextRotation = (r: Rotation): Rotation => ROTATIONS[(ROTATIONS.indexOf(r) + 1) % 4]

/** Parça-yerel noktayı, parçanın merkezi etrafında döndürüp tuval koordinatına çevirir. */
export function localToWorld(part: Pick<PartInstance, 'type' | 'x' | 'y' | 'rotation'>, p: Pt): Pt {
  const { w, h } = PART_DEFS[part.type]
  const cx = w / 2, cy = h / 2
  const dx = p.x - cx, dy = p.y - cy
  let rx = dx, ry = dy
  switch (part.rotation) {
    case 90: rx = -dy; ry = dx; break
    case 180: rx = -dx; ry = -dy; break
    case 270: rx = dy; ry = -dx; break
  }
  return { x: part.x + cx + rx, y: part.y + cy + ry }
}

export function pinWorld(part: Pick<PartInstance, 'type' | 'x' | 'y' | 'rotation'>, pin: string): Pt | null {
  const loc = PART_DEFS[part.type].pins[pin]
  return loc ? localToWorld(part, loc) : null
}

/** Döndürülmüş parçanın tuvaldeki sınır kutusu. */
export function partBounds(part: Pick<PartInstance, 'type' | 'x' | 'y' | 'rotation'>): { x: number; y: number; w: number; h: number } {
  const { w, h } = PART_DEFS[part.type]
  const cx = part.x + w / 2, cy = part.y + h / 2
  const sw = part.rotation === 90 || part.rotation === 270
  const bw = sw ? h : w, bh = sw ? w : h
  return { x: cx - bw / 2, y: cy - bh / 2, w: bw, h: bh }
}

/** Pinin parçadan dışarı doğru çıkış yönü (dünya ekseninde birim vektör): en yakın kenara göre, döndürme uygulanır. */
export function pinDir(part: Pick<PartInstance, 'type' | 'rotation'>, pin: string): Pt {
  const def = PART_DEFS[part.type]
  const p = def.pins[pin]
  if (!p) return { x: 0, y: 1 }
  const d = [
    { v: { x: -1, y: 0 }, d: p.x }, { v: { x: 1, y: 0 }, d: def.w - p.x },
    { v: { x: 0, y: -1 }, d: p.y }, { v: { x: 0, y: 1 }, d: def.h - p.y },
  ].sort((a, b) => a.d - b.d)[0].v
  switch (part.rotation) {
    case 90: return { x: -d.y, y: d.x }
    case 180: return { x: -d.x, y: -d.y }
    case 270: return { x: d.y, y: -d.x }
    default: return d
  }
}

/** Kablo yolu: pin yönlerinde çıkan yumuşak eğri (kübik Bezier). `lane` paralel kabloları hafifçe ayırır. */
export function wireCurve(a: Pt, da: Pt, b: Pt, db: Pt, lane = 0): string {
  const dist = Math.hypot(b.x - a.x, b.y - a.y)
  const L = Math.max(24, Math.min(140, dist * 0.45)) + Math.abs(lane)
  const c1 = { x: a.x + da.x * L + (da.y !== 0 ? lane : 0), y: a.y + da.y * L + (da.x !== 0 ? lane : 0) }
  const c2 = { x: b.x + db.x * L + (db.y !== 0 ? lane : 0), y: b.y + db.y * L + (db.x !== 0 ? lane : 0) }
  return `M${a.x} ${a.y} C${c1.x} ${c1.y} ${c2.x} ${c2.y} ${b.x} ${b.y}`
}

/** Serbest uca (fare) giden önizleme eğrisi. */
export const wirePreview = (a: Pt, da: Pt, b: Pt) => wireCurve(a, da, b, { x: 0, y: 0 })

export const WORLD = { w: 1200, h: 760 }
export const GRID = 10
export const snap = (v: number) => Math.round(v / GRID) * GRID
