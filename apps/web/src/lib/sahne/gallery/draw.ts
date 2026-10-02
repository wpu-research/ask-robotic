// Kendi çizimlerimiz: vektör şekil kurucuları. Telif sorunu yoktur (hepsi bu projede yazıldı).
import type { Costume, Shape } from '../types'

export const R = (x: number, y: number, w: number, h: number, f: string | null, s: string | null = null, sw = 0, r = 0): Shape => ({ t: 'rect', x, y, w, h, f, s, sw, ...(r ? { r } : {}) })
export const E = (cx: number, cy: number, rx: number, ry: number, f: string | null, s: string | null = null, sw = 0): Shape => ({ t: 'ellipse', cx, cy, rx, ry, f, s, sw })
export const C = (cx: number, cy: number, r: number, f: string | null, s: string | null = null, sw = 0): Shape => E(cx, cy, r, r, f, s, sw)
export const P = (pts: number[], f: string | null, s: string | null = null, sw = 0): Shape => ({ t: 'poly', pts, f, s, sw })
export const L = (pts: number[], c: string, w = 3): Shape => ({ t: 'path', pts, c, w })

export const INK = '#1f2937'

export function costume(id: string, name: string, shapes: Shape[], w = 96, h = 96): Costume {
  return { id, name, w, h, shapes }
}

/** n köşeli yıldız. */
export function star(cx: number, cy: number, ro: number, ri: number, n = 5, rot = -90): number[] {
  const pts: number[] = []
  for (let i = 0; i < n * 2; i++) {
    const a = ((rot + (i * 180) / n) * Math.PI) / 180
    const r = i % 2 === 0 ? ro : ri
    pts.push(Math.round((cx + r * Math.cos(a)) * 10) / 10, Math.round((cy + r * Math.sin(a)) * 10) / 10)
  }
  return pts
}
