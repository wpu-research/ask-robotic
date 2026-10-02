// Kaplumbağa: çizim geometrisi, başsız (Node) rasterleştirme ve hedefle benzerlik karşılaştırması. DOM yok.

export interface Stroke { x1: number; y1: number; x2: number; y2: number; colour: string; width: number }

/** Çizim tuvali mantıksal boyutu (px). */
export const SIZE = 400
/** Karşılaştırma ızgarası: hücre 4 px, 100x100. */
export const CELL = 4
export const GRID = SIZE / CELL

/** Renk paleti (blok seçicisi ve hedefler bunu kullanır). */
export const COLOURS = {
  kirmizi: '#e53935',
  turuncu: '#fb8c00',
  sari: '#fdd835',
  yesil: '#43a047',
  mavi: '#1e88e5',
  mor: '#8e24aa',
  siyah: '#212121',
  gri: '#9e9e9e',
} as const
export const PALETTE: string[] = Object.values(COLOURS)
export const DEFAULT_COLOUR = COLOURS.siyah
export const DEFAULT_WIDTH = 4

export function hexToRgb(s: string): [number, number, number] {
  let h = String(s ?? '').trim().replace('#', '')
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  const n = parseInt(h.slice(0, 6), 16)
  if (!Number.isFinite(n) || h.length < 6) return [33, 33, 33]
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/** Ton (0-360) → #rrggbb (canlı renk). */
export function hueToHex(hue: number): string {
  const h = ((((hue % 360) + 360) % 360)) / 60
  const s = 0.85, l = 0.5
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs((h % 2) - 1))
  const [r1, g1, b1] = h < 1 ? [c, x, 0] : h < 2 ? [x, c, 0] : h < 3 ? [0, c, x] : h < 4 ? [0, x, c] : h < 5 ? [x, 0, c] : [c, 0, x]
  const m = l - c / 2
  const to = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, '0')
  return `#${to(r1)}${to(g1)}${to(b1)}`
}

const rad = (deg: number) => (deg * Math.PI) / 180
/** Yön birim vektörü: 0° yukarı, saat yönünde artar. */
export const dir = (deg: number): [number, number] => [Math.sin(rad(deg)), -Math.cos(rad(deg))]

// ---------- Hedef şablonları (kaplumbağa yürüyüşünden BAĞIMSIZ geometri) ----------

export function line(x1: number, y1: number, x2: number, y2: number, colour: string = DEFAULT_COLOUR, width = DEFAULT_WIDTH): Stroke {
  return { x1, y1, x2, y2, colour, width }
}

/** Noktalardan kapalı/açık çokgen çizgileri. */
export function polyline(pts: [number, number][], opts: { colour?: string; width?: number; closed?: boolean } = {}): Stroke[] {
  const out: Stroke[] = []
  const n = opts.closed ? pts.length : pts.length - 1
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length]
    out.push(line(a[0], a[1], b[0], b[1], opts.colour, opts.width))
  }
  return out
}

/**
 * Düzgün (yıldız) çokgen: `start` köşesinden `heading` yönünde ilk kenar `side` uzunluğunda çizilir ve saat yönünde yön değiştirilir.
 * `skip`: 1 = düzgün çokgen, 2 = beş köşeli yıldız gibi.
 * Çember merkezi/yarıçapı ile köşeler hesaplanır (kaplumbağa yürüyüşünden bağımsız).
 */
export function ngonPoints(start: [number, number], heading: number, side: number, n: number, skip = 1): [number, number][] {
  const R = side / (2 * Math.sin((Math.PI * skip) / n))
  const apothem = Math.sqrt(Math.max(0, R * R - (side / 2) ** 2))
  const [dx, dy] = dir(heading)
  const [rx, ry] = [-dy, dx] // sağ yön (saat yönünde 90°)
  // merkez: ilk kenarın ortasından sağa
  const cx = start[0] + dx * (side / 2) + rx * apothem
  const cy = start[1] + dy * (side / 2) + ry * apothem
  const a0 = Math.atan2(start[1] - cy, start[0] - cx)
  const step = (2 * Math.PI * skip) / n // ekranda saat yönü = artan açı (y aşağı)
  const pts: [number, number][] = []
  for (let i = 0; i < n; i++) pts.push([cx + R * Math.cos(a0 + step * i), cy + R * Math.sin(a0 + step * i)])
  return pts
}

export const ngon = (start: [number, number], heading: number, side: number, n: number, opts: { skip?: number; colour?: string; width?: number } = {}): Stroke[] =>
  polyline(ngonPoints(start, heading, side, n, opts.skip ?? 1), { colour: opts.colour, width: opts.width, closed: true })

// ---------- Rasterleştirme ve karşılaştırma ----------

/** Hücre başına son çizilen renk (RGB tamsayı) ya da -1. */
export interface Raster { cells: Int32Array; ink: number }

export function rasterize(strokes: readonly Stroke[]): Raster {
  const cells = new Int32Array(GRID * GRID).fill(-1)
  for (const s of strokes) {
    const [r, g, b] = hexToRgb(s.colour)
    const col = (r << 16) | (g << 8) | b
    const len = Math.hypot(s.x2 - s.x1, s.y2 - s.y1)
    const n = Math.max(1, Math.ceil(len / (CELL / 2)))
    const rad = Math.max(s.width / 2, CELL * 0.75)
    const reach = Math.ceil(rad / CELL) + 1
    for (let i = 0; i <= n; i++) {
      const px = s.x1 + ((s.x2 - s.x1) * i) / n
      const py = s.y1 + ((s.y2 - s.y1) * i) / n
      const gx = Math.floor(px / CELL), gy = Math.floor(py / CELL)
      for (let dy = -reach; dy <= reach; dy++) {
        for (let dx = -reach; dx <= reach; dx++) {
          const x = gx + dx, y = gy + dy
          if (x < 0 || y < 0 || x >= GRID || y >= GRID) continue
          if (Math.hypot((x + 0.5) * CELL - px, (y + 0.5) * CELL - py) <= rad) cells[y * GRID + x] = col
        }
      }
    }
  }
  let ink = 0
  for (let i = 0; i < cells.length; i++) if (cells[i] >= 0) ink++
  return { cells, ink }
}

const colourDist = (a: number, b: number): number =>
  Math.hypot(((a >> 16) & 255) - ((b >> 16) & 255), ((a >> 8) & 255) - ((b >> 8) & 255), (a & 255) - (b & 255))

/** Renk eşleşme eşiği (RGB uzaklığı). Palet renkleri birbirinden en az ~100 uzaktır. */
export const COLOUR_TOLERANCE = 70
/** Çakışma eşiği: hedef hücrelerinin ve çizimin en az bu oranı karşılıklı örtüşmeli. */
export const MATCH_THRESHOLD = 0.92

export interface Similarity {
  /** Hedefin ne kadarı çizildi (0..1). */
  recall: number
  /** Çizimin ne kadarı hedefin üstünde (0..1). */
  precision: number
  /** Çizim mürekkebi / hedef mürekkebi (kalınlık denetimi). */
  inkRatio: number
}

function covered(from: Raster, to: Raster, colours: boolean): number {
  let total = 0, hit = 0
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      const c = from.cells[y * GRID + x]
      if (c < 0) continue
      total++
      let ok = false
      for (let dy = -1; dy <= 1 && !ok; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx, yy = y + dy
          if (xx < 0 || yy < 0 || xx >= GRID || yy >= GRID) continue
          const d = to.cells[yy * GRID + xx]
          if (d >= 0 && (!colours || colourDist(c, d) <= COLOUR_TOLERANCE)) { ok = true; break }
        }
      }
      if (ok) hit++
    }
  }
  return total === 0 ? 1 : hit / total
}

export function similarity(target: readonly Stroke[], drawn: readonly Stroke[], colours = false): Similarity {
  const t = rasterize(target), u = rasterize(drawn)
  if (u.ink === 0) return { recall: 0, precision: 0, inkRatio: 0 }
  return { recall: covered(t, u, colours), precision: covered(u, t, colours), inkRatio: t.ink === 0 ? 1 : u.ink / t.ink }
}
