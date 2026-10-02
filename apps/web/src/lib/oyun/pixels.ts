// Piksel resim modeli ve düzenleme işlemleri (saf; Node'da çalışır). Saklama biçimi: satır dizisi (ASCII), '.' = saydam.
import { PALETTE_CHARS, TRANSPARENT } from './palette'

export const T = -1 // saydam piksel değeri

export interface Pix { w: number; h: number; d: Int8Array }

export const isValidRows = (rows: unknown, maxSide = 64): rows is string[] =>
  Array.isArray(rows) && rows.length >= 1 && rows.length <= maxSide &&
  typeof rows[0] === 'string' && rows[0].length >= 1 && rows[0].length <= maxSide &&
  rows.every((r) => typeof r === 'string' && r.length === rows[0].length && /^[0-9a-f.]+$/.test(r))

export function blank(w: number, h: number): Pix { return { w, h, d: new Int8Array(w * h).fill(T) } }

export function parse(rows: readonly string[]): Pix {
  const h = rows.length, w = rows[0]?.length ?? 0
  const p = blank(w, h)
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const ch = rows[y][x] ?? TRANSPARENT
    const i = PALETTE_CHARS.indexOf(ch)
    p.d[y * w + x] = i < 0 ? T : i
  }
  return p
}

export function toRows(p: Pix): string[] {
  const out: string[] = []
  for (let y = 0; y < p.h; y++) {
    let s = ''
    for (let x = 0; x < p.w; x++) { const v = p.d[y * p.w + x]; s += v < 0 ? TRANSPARENT : PALETTE_CHARS[v] }
    out.push(s)
  }
  return out
}

export const clone = (p: Pix): Pix => ({ w: p.w, h: p.h, d: p.d.slice() })
export const inside = (p: Pix, x: number, y: number) => x >= 0 && y >= 0 && x < p.w && y < p.h
export const get = (p: Pix, x: number, y: number): number => (inside(p, x, y) ? p.d[y * p.w + x] : T)
export function set(p: Pix, x: number, y: number, v: number): void { if (inside(p, x, y)) p.d[y * p.w + x] = v }

/** Boya kovası: (x,y) ile bitişik ve aynı renkteki alanı doldurur (4 yönlü). */
export function floodFill(p: Pix, x: number, y: number, v: number): void {
  if (!inside(p, x, y)) return
  const target = get(p, x, y)
  if (target === v) return
  const stack: number[] = [x, y]
  while (stack.length) {
    const cy = stack.pop()!, cx = stack.pop()!
    if (!inside(p, cx, cy) || p.d[cy * p.w + cx] !== target) continue
    p.d[cy * p.w + cx] = v
    stack.push(cx + 1, cy, cx - 1, cy, cx, cy + 1, cx, cy - 1)
  }
}

export function flipH(p: Pix): Pix {
  const o = blank(p.w, p.h)
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) o.d[y * p.w + x] = p.d[y * p.w + (p.w - 1 - x)]
  return o
}
export function flipV(p: Pix): Pix {
  const o = blank(p.w, p.h)
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) o.d[y * p.w + x] = p.d[(p.h - 1 - y) * p.w + x]
  return o
}
/** 90° saat yönünde döndürür (en-boy yer değiştirir). */
export function rotateCW(p: Pix): Pix {
  const o = blank(p.h, p.w)
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) o.d[x * o.w + (p.h - 1 - y)] = p.d[y * p.w + x]
  return o
}
/** Resmi kaydırır (kenardan taşan kısım diğer taraftan girer). */
export function shift(p: Pix, dx: number, dy: number): Pix {
  const o = blank(p.w, p.h)
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
    o.d[((y + dy + p.h) % p.h) * p.w + ((x + dx + p.w) % p.w)] = p.d[y * p.w + x]
  }
  return o
}
/** Doğru çizgi (Bresenham) üzerindeki hücreler. */
export function line(x0: number, y0: number, x1: number, y1: number): [number, number][] {
  const out: [number, number][] = []
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0)
  const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1
  let err = dx + dy
  let x = x0, y = y0
  for (let guard = 0; guard < 10000; guard++) {
    out.push([x, y])
    if (x === x1 && y === y1) break
    const e2 = 2 * err
    if (e2 >= dy) { err += dy; x += sx }
    if (e2 <= dx) { err += dx; y += sy }
  }
  return out
}

export interface Bounds { x: number; y: number; w: number; h: number }
/** Saydam olmayan piksellerin sınır kutusu; tamamen saydamsa tüm resim. */
export function opaqueBounds(p: Pix): Bounds {
  let x0 = p.w, y0 = p.h, x1 = -1, y1 = -1
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
    if (p.d[y * p.w + x] >= 0) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y }
  }
  return x1 < 0 ? { x: 0, y: 0, w: p.w, h: p.h } : { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 }
}

/** Satırlardan, sol yarıyı aynalayarak tam resim üretir (varlık yazarken zahmeti yarıya indirir). */
export function mirrorRows(half: readonly string[]): string[] {
  return half.map((r) => r + [...r].reverse().join(''))
}
