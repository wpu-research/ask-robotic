// Saf geometri: kostüm sınırları, döndürülmüş dörtgenler, çarpışma (SAT), nokta denetimi, şekil vuruş testi.
import { STAGE_H, STAGE_W, type Costume, type RotationStyle, type Shape } from './types'

export const rad = (d: number): number => (d * Math.PI) / 180
export const deg = (r: number): number => (r * 180) / Math.PI

/** Yönü (-180, 180] aralığına getirir. */
export function normDir(d: number): number {
  if (!Number.isFinite(d)) return 90
  let x = d % 360
  if (x > 180) x -= 360
  else if (x <= -180) x += 360
  return x
}

export interface Box { x0: number; y0: number; x1: number; y1: number }

const growBox = (b: Box | null, x: number, y: number, pad = 0): Box =>
  b ? { x0: Math.min(b.x0, x - pad), y0: Math.min(b.y0, y - pad), x1: Math.max(b.x1, x + pad), y1: Math.max(b.y1, y + pad) } : { x0: x - pad, y0: y - pad, x1: x + pad, y1: y + pad }

const boundsCache = new WeakMap<Costume, Box>()

/** Kostümün içeriğinin (saydam olmayan alanın) tuval koordinatlarındaki sınır kutusu. */
export function contentBox(c: Costume): Box {
  const hit = boundsCache.get(c)
  if (hit) return hit
  let b: Box | null = null
  if (c.bitmap) b = { x0: 0, y0: 0, x1: c.w, y1: c.h }
  for (const s of c.shapes) {
    switch (s.t) {
      case 'rect': b = growBox(growBox(b, s.x, s.y, s.sw / 2), s.x + s.w, s.y + s.h, s.sw / 2); break
      case 'ellipse': b = growBox(growBox(b, s.cx - s.rx, s.cy - s.ry, s.sw / 2), s.cx + s.rx, s.cy + s.ry, s.sw / 2); break
      case 'poly': for (let i = 0; i + 1 < s.pts.length; i += 2) b = growBox(b, s.pts[i], s.pts[i + 1], s.sw / 2); break
      case 'path': for (let i = 0; i + 1 < s.pts.length; i += 2) b = growBox(b, s.pts[i], s.pts[i + 1], s.w / 2); break
    }
  }
  const out: Box = b ?? { x0: c.w / 2 - 2, y0: c.h / 2 - 2, x1: c.w / 2 + 2, y1: c.h / 2 + 2 }
  boundsCache.set(c, out)
  return out
}

export interface Pose { x: number; y: number; dir: number; size: number; rotationStyle: RotationStyle }
export type Pt = [number, number]
export type Quad = [Pt, Pt, Pt, Pt]

/** Kostümün sahnedeki (y yukarı) dörtgeni. */
export function costumeQuad(c: Costume, p: Pose): Quad {
  const b = contentBox(c)
  const s = p.size / 100
  const flip = p.rotationStyle === 'lr' && p.dir < 0 ? -1 : 1
  const th = p.rotationStyle === 'all' ? rad(p.dir - 90) : 0
  const cs = Math.cos(th), sn = Math.sin(th)
  const corner = (cx: number, cy: number): Pt => {
    // tuval (y aşağı) → yerel (y yukarı), dönme merkezi tuval ortası
    const lx = (cx - c.w / 2) * s * flip
    const ly = -(cy - c.h / 2) * s
    return [p.x + lx * cs + ly * sn, p.y - lx * sn + ly * cs]
  }
  return [corner(b.x0, b.y0), corner(b.x1, b.y0), corner(b.x1, b.y1), corner(b.x0, b.y1)]
}

export function quadBox(q: Quad): { l: number; r: number; b: number; t: number } {
  const xs = q.map((p) => p[0]), ys = q.map((p) => p[1])
  return { l: Math.min(...xs), r: Math.max(...xs), b: Math.min(...ys), t: Math.max(...ys) }
}

const axes = (q: Quad): Pt[] => [[q[1][0] - q[0][0], q[1][1] - q[0][1]], [q[3][0] - q[0][0], q[3][1] - q[0][1]]]
function project(q: Quad, ax: Pt): [number, number] {
  let lo = Infinity, hi = -Infinity
  for (const p of q) { const d = p[0] * ax[0] + p[1] * ax[1]; if (d < lo) lo = d; if (d > hi) hi = d }
  return [lo, hi]
}
/** İki dörtgen (dikdörtgen, olası dönük) kesişiyor mu? */
export function quadsOverlap(a: Quad, b: Quad): boolean {
  for (const ax of [...axes(a), ...axes(b)]) {
    if (Math.abs(ax[0]) + Math.abs(ax[1]) < 1e-9) continue
    const [a0, a1] = project(a, ax), [b0, b1] = project(b, ax)
    if (a1 < b0 || b1 < a0) return false
  }
  return true
}

export function pointInQuad(q: Quad, x: number, y: number): boolean {
  let sign = 0
  for (let i = 0; i < 4; i++) {
    const p = q[i], n = q[(i + 1) % 4]
    const cr = (n[0] - p[0]) * (y - p[1]) - (n[1] - p[1]) * (x - p[0])
    if (Math.abs(cr) < 1e-9) continue
    const s = cr > 0 ? 1 : -1
    if (sign === 0) sign = s
    else if (s !== sign) return false
  }
  return true
}

/** Dörtgen sahnenin kenarına değiyor ya da dışına taşıyor mu? */
export function touchesEdge(q: Quad): boolean {
  const b = quadBox(q)
  return b.l <= -STAGE_W / 2 || b.r >= STAGE_W / 2 || b.b <= -STAGE_H / 2 || b.t >= STAGE_H / 2
}

/** Sprite'ın sahnede en az bir parçası görünür kalsın diye gereken kayma (Scratch'teki "çit"). */
export function fenceDelta(q: Quad): { dx: number; dy: number } {
  const b = quadBox(q)
  const inset = Math.floor(Math.min(15, (b.r - b.l) / 2, (b.t - b.b) / 2))
  const fl = -STAGE_W / 2 + inset, fr = STAGE_W / 2 - inset, ft = STAGE_H / 2 - inset, fb = -STAGE_H / 2 + inset
  let dx = 0, dy = 0
  if (b.r < fl) dx += fl - b.r
  if (b.l > fr) dx += fr - b.l
  if (b.t < fb) dy += fb - b.t
  if (b.b > ft) dy += ft - b.b
  return { dx, dy }
}

// ───────── Şekil vuruş testi (kostüm editörü: silgi, doldur, seç) ─────────
function distSeg(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax, dy = by - ay
  const l2 = dx * dx + dy * dy
  const t = l2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l2))
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy))
}
function inPoly(pts: number[], x: number, y: number): boolean {
  let inside = false
  for (let i = 0, j = pts.length - 2; i < pts.length; j = i, i += 2) {
    const xi = pts[i], yi = pts[i + 1], xj = pts[j], yj = pts[j + 1]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}
function nearPolyline(pts: number[], x: number, y: number, tol: number, closed: boolean): boolean {
  const n = pts.length / 2
  for (let i = 0; i < n - (closed ? 0 : 1); i++) {
    const a = i * 2, b = ((i + 1) % n) * 2
    if (distSeg(x, y, pts[a], pts[a + 1], pts[b], pts[b + 1]) <= tol) return true
  }
  return n === 1 && Math.hypot(x - pts[0], y - pts[1]) <= tol
}

/** (x, y) noktası şeklin boyalı alanında mı? `tol`: kalem payı. */
export function hitShape(s: Shape, x: number, y: number, tol = 3): boolean {
  switch (s.t) {
    case 'rect': {
      const inside = x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h
      if (s.f && inside) return true
      if (!s.s) return false
      const e = s.sw / 2 + tol
      return x >= s.x - e && x <= s.x + s.w + e && y >= s.y - e && y <= s.y + s.h + e && !(x > s.x + e && x < s.x + s.w - e && y > s.y + e && y < s.y + s.h - e)
    }
    case 'ellipse': {
      if (s.rx <= 0 || s.ry <= 0) return false
      const q = ((x - s.cx) / s.rx) ** 2 + ((y - s.cy) / s.ry) ** 2
      if (s.f && q <= 1) return true
      if (!s.s) return false
      const e = (s.sw / 2 + tol) / Math.min(s.rx, s.ry)
      return Math.abs(Math.sqrt(q) - 1) <= e
    }
    case 'poly':
      if (s.f && inPoly(s.pts, x, y)) return true
      return !!s.s && nearPolyline(s.pts, x, y, s.sw / 2 + tol, true)
    case 'path':
      return nearPolyline(s.pts, x, y, s.w / 2 + tol, false)
  }
}

/** En üstteki (dizinin sonundaki) vuruş alan şeklin sırası; yoksa -1. */
export function topShapeAt(shapes: Shape[], x: number, y: number, tol = 3): number {
  for (let i = shapes.length - 1; i >= 0; i--) if (hitShape(shapes[i], x, y, tol)) return i
  return -1
}

export function translateShape(s: Shape, dx: number, dy: number): Shape {
  switch (s.t) {
    case 'rect': return { ...s, x: s.x + dx, y: s.y + dy }
    case 'ellipse': return { ...s, cx: s.cx + dx, cy: s.cy + dy }
    case 'poly': case 'path': return { ...s, pts: s.pts.map((v, i) => v + (i % 2 === 0 ? dx : dy)) }
  }
}

/** Şekli tuvalin ortasına göre yatay/dikey çevirir. */
export function flipShape(s: Shape, w: number, h: number, axis: 'h' | 'v'): Shape {
  const fx = (x: number) => (axis === 'h' ? w - x : x)
  const fy = (y: number) => (axis === 'v' ? h - y : y)
  switch (s.t) {
    case 'rect': return { ...s, x: axis === 'h' ? w - s.x - s.w : s.x, y: axis === 'v' ? h - s.y - s.h : s.y }
    case 'ellipse': return { ...s, cx: fx(s.cx), cy: fy(s.cy) }
    case 'poly': case 'path': return { ...s, pts: s.pts.map((v, i) => (i % 2 === 0 ? fx(v) : fy(v))) }
  }
}
