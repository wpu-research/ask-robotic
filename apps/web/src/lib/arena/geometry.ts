import type { Wall } from '@ask/sim'

export const distToSeg = (px: number, py: number, x1: number, y1: number, x2: number, y2: number): number => {
  const dx = x2 - x1, dy = y2 - y1, l2 = dx * dx + dy * dy
  const t = l2 ? Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / l2)) : 0
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy))
}

/** Bir noktanın tüm duvarlara en yakın uzaklığı (m). */
export const nearestWall = (x: number, y: number, walls: Wall[]): number => {
  let d = Infinity
  for (const w of walls) d = Math.min(d, distToSeg(x, y, ...w))
  return d
}

/** Kutu biçiminde kapalı engel (dört duvar). */
export const rectWalls = (x1: number, y1: number, x2: number, y2: number): Wall[] => [
  [x1, y1, x2, y1], [x2, y1, x2, y2], [x2, y2, x1, y2], [x1, y2, x1, y1],
]

/** Oval (stadyum) pist: merkez (cx, cy), yarı düz uzunluk hl, yarıçap R. Alt kenarın ortasından başlar, saat yönünün tersine. */
export function oval(cx: number, cy: number, hl: number, R: number, n = 24): Array<[number, number]> {
  const p: Array<[number, number]> = [[cx, cy - R], [cx + hl, cy - R]]
  for (let i = 1; i <= n; i++) { const a = -Math.PI / 2 + (Math.PI * i) / n; p.push([cx + hl + R * Math.cos(a), cy + R * Math.sin(a)]) }
  p.push([cx - hl, cy + R])
  for (let i = 1; i <= n; i++) { const a = Math.PI / 2 + (Math.PI * i) / n; p.push([cx - hl + R * Math.cos(a), cy + R * Math.sin(a)]) }
  p.push([cx, cy - R])
  return p
}

/** Merkez (cx, cy), yarıçap r olan yay noktaları (derece). */
export function arc(cx: number, cy: number, r: number, fromDeg: number, toDeg: number, n = 12): Array<[number, number]> {
  const out: Array<[number, number]> = []
  for (let i = 0; i <= n; i++) { const a = ((fromDeg + ((toDeg - fromDeg) * i) / n) * Math.PI) / 180; out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]) }
  return out
}

export const wrapPi = (a: number): number => { let d = a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d }
export const DEG = 180 / Math.PI

/** Işın–duvar kesişimine uzaklık (m); kesişmezse Infinity. */
export function rayDistance(ox: number, oy: number, ang: number, walls: Wall[]): number {
  const dx = Math.cos(ang), dy = Math.sin(ang)
  let best = Infinity
  for (const [x1, y1, x2, y2] of walls) {
    const ex = x2 - x1, ey = y2 - y1, den = dx * ey - dy * ex
    if (Math.abs(den) < 1e-12) continue
    const t = ((x1 - ox) * ey - (y1 - oy) * ex) / den
    const u = ((x1 - ox) * dy - (y1 - oy) * dx) / den
    if (t >= 0 && u >= 0 && u <= 1 && t < best) best = t
  }
  return best
}
