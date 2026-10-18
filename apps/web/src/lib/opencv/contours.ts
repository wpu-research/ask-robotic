// OpenCV dersi: konturlar ve şekil öznitelikleri (saf, testli). findContours'un RETR_EXTERNAL + CHAIN_APPROX_NONE karşılığı:
// her bağlı bileşenin dış sınırı Moore komşuluk izlemesiyle bulunur. Alan (ayakkabı bağı formülü), çevre, approxPolyDP
// (Douglas-Peucker), dışbükey örtü, momentler ve dairesellik OpenCV'deki tanımlarla.
import type { Gray } from './ops'

export interface P { x: number; y: number }
export interface ContourInfo {
  pts: P[]
  area: number
  perimeter: number
  /** 4πA/P²: daire 1, kare ≈ 0,785, ince uzun şekil 0'a yakın. */
  circularity: number
  box: { x: number; y: number; w: number; h: number }
  cx: number
  cy: number
  approx: P[]
  hullArea: number
  /** Alan / dışbükey örtü alanı (solidity). */
  solidity: number
}

/** 8-komşulu bağlı bileşen etiketleri (0: arka plan). */
export function label8(m: Gray): { labels: Int32Array; n: number } {
  const { w, h } = m, labels = new Int32Array(w * h), stack = new Int32Array(w * h)
  let n = 0
  for (let s = 0; s < labels.length; s++) {
    if (!m.data[s] || labels[s]) continue
    n++
    let sp = 0
    stack[sp++] = s; labels[s] = n
    while (sp) {
      const i = stack[--sp], x = i % w, y = (i - x) / w
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const xx = x + dx, yy = y + dy
        if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue
        const j = yy * w + xx
        if (m.data[j] && !labels[j]) { labels[j] = n; stack[sp++] = j }
      }
    }
  }
  return { labels, n }
}

// Moore komşuları, saat yönünde: D, GD, G, GB, B, KB, K, KD (y aşağı)
const DX = [1, 1, 0, -1, -1, -1, 0, 1], DY = [0, 1, 1, 1, 0, -1, -1, -1]

/** Bir bileşenin dış sınırı: en üst-soldaki pikselden başlayıp Moore izlemesi (Jacob durdurma ölçütüyle). */
function trace(labels: Int32Array, w: number, h: number, id: number, start: number): P[] {
  const at = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h && labels[y * w + x] === id
  const sx = start % w, sy = (start - sx) / w
  const pts: P[] = [{ x: sx, y: sy }]
  // radyal tarama: son hareket d ise geri yön (d+4); arama onun bir sonrasından saat yönünde başlar.
  // Başlangıçta doğuya hareket etmiş sayılır: geri yön batı (arka plan, çünkü başlangıç en üst-sol piksel).
  let cx = sx, cy = sy, dir = 0, first = -1
  const next = (x: number, y: number, d0: number) => {
    for (let k = 0; k < 8; k++) { const d = (d0 + 5 + k) % 8; if (at(x + DX[d], y + DY[d])) return d }
    return -1
  }
  const max = 4 * w * h
  for (let it = 0; it < max; it++) {
    const d = next(cx, cy, dir)
    if (d < 0) break // tek piksel
    // Jacob ölçütü: başlangıca dönüp ilk hareketi tekrarlayacaksak kontur kapandı
    if (cx === sx && cy === sy && d === first) break
    if (first < 0) first = d
    cx += DX[d]; cy += DY[d]; dir = d
    if (!(cx === sx && cy === sy)) pts.push({ x: cx, y: cy })
  }
  return pts
}

/** RETR_EXTERNAL: her bileşenin dış konturu. minArea piksel altındaki bileşenler atlanır. */
export function findContours(m: Gray, minArea = 0): P[][] {
  const { labels, n } = label8(m), { w, h } = m
  const first = new Int32Array(n + 1).fill(-1), count = new Int32Array(n + 1)
  for (let i = 0; i < labels.length; i++) { const l = labels[i]; if (l) { count[l]++; if (first[l] < 0) first[l] = i } }
  const out: P[][] = []
  for (let id = 1; id <= n; id++) if (count[id] >= minArea) out.push(trace(labels, w, h, id, first[id]))
  return out
}

export function contourArea(c: P[]): number {
  let s = 0
  for (let i = 0, j = c.length - 1; i < c.length; j = i++) s += c[j].x * c[i].y - c[i].x * c[j].y
  return Math.abs(s) / 2
}
export function arcLength(c: P[], closed = true): number {
  let s = 0
  for (let i = 1; i < c.length; i++) s += Math.hypot(c[i].x - c[i - 1].x, c[i].y - c[i - 1].y)
  if (closed && c.length > 1) s += Math.hypot(c[0].x - c[c.length - 1].x, c[0].y - c[c.length - 1].y)
  return s
}
function dpOpen(pts: P[], eps: number): P[] {
  if (pts.length < 3) return pts.slice()
  const a = pts[0], b = pts[pts.length - 1], L = Math.hypot(b.x - a.x, b.y - a.y) || 1e-9
  let dmax = -1, idx = 0
  for (let i = 1; i < pts.length - 1; i++) {
    const d = Math.abs((b.x - a.x) * (a.y - pts[i].y) - (a.x - pts[i].x) * (b.y - a.y)) / L
    if (d > dmax) { dmax = d; idx = i }
  }
  if (dmax <= eps) return [a, b]
  const l = dpOpen(pts.slice(0, idx + 1), eps), r = dpOpen(pts.slice(idx), eps)
  return [...l.slice(0, -1), ...r]
}
/** approxPolyDP (kapalı): başlangıçtan en uzak noktadan bölüp iki açık zincire Douglas-Peucker uygulanır. */
export function approxPolyDP(c: P[], eps: number): P[] {
  if (c.length < 3) return c.slice()
  let far = 0, dm = -1
  for (let i = 1; i < c.length; i++) { const d = Math.hypot(c[i].x - c[0].x, c[i].y - c[0].y); if (d > dm) { dm = d; far = i } }
  const a = dpOpen(c.slice(0, far + 1), eps), b = dpOpen([...c.slice(far), c[0]], eps)
  return [...a.slice(0, -1), ...b.slice(0, -1)]
}
/** Dışbükey örtü (monoton zincir), saat yönünün tersine. */
export function convexHull(pts: P[]): P[] {
  const p = [...pts].sort((a, b) => a.x - b.x || a.y - b.y)
  if (p.length < 3) return p
  const cross = (o: P, a: P, b: P) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)
  const lo: P[] = [], up: P[] = []
  for (const q of p) { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q) }
  for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q) }
  return [...lo.slice(0, -1), ...up.slice(0, -1)]
}
export function boundingRect(c: P[]) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity
  for (const p of c) { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y) }
  return { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 }
}
/** Kontur çokgeninin ağırlık merkezi (m10/m00, m01/m00); alan sıfırsa nokta ortalaması. */
export function centroid(c: P[]): P {
  let a = 0, cx = 0, cy = 0
  for (let i = 0, j = c.length - 1; i < c.length; j = i++) {
    const f = c[j].x * c[i].y - c[i].x * c[j].y
    a += f; cx += (c[j].x + c[i].x) * f; cy += (c[j].y + c[i].y) * f
  }
  if (Math.abs(a) < 1e-9) return { x: c.reduce((s, p) => s + p.x, 0) / c.length, y: c.reduce((s, p) => s + p.y, 0) / c.length }
  return { x: cx / (3 * a), y: cy / (3 * a) }
}
/** Bir konturun tüm öznitelikleri; epsFrac: approxPolyDP için çevrenin kesri (genelde 0,02). */
export function describe(c: P[], epsFrac = 0.02): ContourInfo {
  // piksel merkezli konturda alan dış sınırı yarım piksel kaçırır; çevreye yarım piksel şerit eklenerek düzeltilir
  const per = arcLength(c), area = contourArea(c) + per / 2 + 1
  const hull = convexHull(c), hullArea = contourArea(hull) + arcLength(hull) / 2 + 1
  const ctr = centroid(c)
  return {
    pts: c, area, perimeter: per,
    circularity: per > 0 ? Math.min(1, (4 * Math.PI * area) / (per * per)) : 0,
    box: boundingRect(c), cx: ctr.x, cy: ctr.y,
    approx: approxPolyDP(c, Math.max(1, epsFrac * per)),
    hullArea, solidity: hullArea > 0 ? Math.min(1, area / hullArea) : 0,
  }
}
export type ShapeK = 'triangle' | 'square' | 'rectangle' | 'pentagon' | 'hexagon' | 'circle' | 'other'
/** Köşe sayısı + dairesellik + en-boy oranıyla basit şekil adı. */
export function shapeName(ci: ContourInfo): ShapeK {
  const v = ci.approx.length, ar = ci.box.w / ci.box.h
  if (ci.circularity > 0.86 && v > 6) return 'circle'
  if (v === 3) return 'triangle'
  if (v === 4) return ar > 0.85 && ar < 1.18 ? 'square' : 'rectangle'
  if (v === 5) return 'pentagon'
  if (v === 6) return 'hexagon'
  if (ci.circularity > 0.8) return 'circle'
  return 'other'
}
export const SHAPE_TEXT: Record<ShapeK, { tr: string; en: string }> = {
  triangle: { tr: 'üçgen', en: 'triangle' }, square: { tr: 'kare', en: 'square' }, rectangle: { tr: 'dikdörtgen', en: 'rectangle' },
  pentagon: { tr: 'beşgen', en: 'pentagon' }, hexagon: { tr: 'altıgen', en: 'hexagon' }, circle: { tr: 'daire', en: 'circle' }, other: { tr: 'diğer', en: 'other' },
}
