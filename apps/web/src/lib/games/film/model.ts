// Film oyunu: çizim modeli, renkler ve kare karşılaştırma (saf TypeScript, DOM yok).
// Tuval 100x100 birimdir; (0,0) sol üst köşe, y aşağı doğru artar. Zaman 0..99 (100 kare).

export const FRAME_COUNT = 100
export const CANVAS = 100
/** Karşılaştırma ızgarası (hücre sayısı/kenar). */
export const GRID = 50
export const MAX_SHAPES = 300

export type Shape =
  | { k: 'c'; x: number; y: number; r: number; fill: string }
  | { k: 'r'; x: number; y: number; w: number; h: number; fill: string }
  | { k: 'l'; x1: number; y1: number; x2: number; y2: number; w: number; stroke: string }

export interface Frame { bg: string; shapes: Shape[] }

export const BG_DEFAULT = '#ffffff'
export const INK_DEFAULT = '#212121'
export const LINE_WIDTH = 2

/** Sahneye giden anlık görüntü. */
export interface MovieSnap {
  /** Bitmiş kareler (en çok 100). */
  frames: Frame[]
  /** Şu an çizilmekte olan kare (çalışırken). */
  cur: Frame | null
  /** Çalışan karenin zamanı (0..99); henüz başlamadıysa 0. */
  t: number
  /** Hedef animasyonun 100 karesi. */
  target: Frame[]
}

/** Renk adı -> değer (blok açılır listesindeki seçenekler). */
export const COLORS: Record<string, string> = {
  KIRMIZI: '#e53935',
  TURUNCU: '#fb8c00',
  SARI: '#fdd835',
  YESIL: '#43a047',
  MAVI: '#1e88e5',
  MOR: '#8e24aa',
  KAHVE: '#6d4c41',
  SIYAH: '#212121',
  BEYAZ: '#ffffff',
}

const hex2 = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')
export const rgbHex = (r: number, g: number, b: number) => `#${hex2(r)}${hex2(g)}${hex2(b)}`

/** ton 0..360, doygunluk ve parlaklık 0..100. */
export function hslHex(h: number, s: number, l: number): string {
  const hh = (((h % 360) + 360) % 360) / 360
  const ss = Math.max(0, Math.min(1, s / 100))
  const ll = Math.max(0, Math.min(1, l / 100))
  const a = ss * Math.min(ll, 1 - ll)
  const f = (n: number) => {
    const k = (n + hh * 12) % 12
    return ll - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))
  }
  return rgbHex(f(0) * 255, f(8) * 255, f(4) * 255)
}

export const clampNum = (v: number, lim = 10000) => (Number.isFinite(v) ? Math.max(-lim, Math.min(lim, v)) : 0)

function parse(c: string): [number, number, number] {
  const n = parseInt(c.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/** Kareyi GRID x GRID hücreye (merkez örnekleme) çevirir: RGB üçlüleri. */
export function rasterize(f: Frame): Uint8Array {
  const out = new Uint8Array(GRID * GRID * 3)
  const [br, bg, bb] = parse(f.bg)
  for (let i = 0; i < GRID * GRID; i++) { out[i * 3] = br; out[i * 3 + 1] = bg; out[i * 3 + 2] = bb }
  const cell = CANVAS / GRID
  const range = (lo: number, hi: number): [number, number] => [
    Math.max(0, Math.floor(lo / cell - 0.5)),
    Math.min(GRID - 1, Math.ceil(hi / cell - 0.5)),
  ]
  for (const s of f.shapes) {
    let xr: [number, number], yr: [number, number], col: string
    if (s.k === 'c') { xr = range(s.x - s.r, s.x + s.r); yr = range(s.y - s.r, s.y + s.r); col = s.fill }
    else if (s.k === 'r') {
      xr = range(Math.min(s.x, s.x + s.w), Math.max(s.x, s.x + s.w)); yr = range(Math.min(s.y, s.y + s.h), Math.max(s.y, s.y + s.h)); col = s.fill
    } else {
      const hw = Math.max(s.w, LINE_WIDTH) / 2
      xr = range(Math.min(s.x1, s.x2) - hw, Math.max(s.x1, s.x2) + hw); yr = range(Math.min(s.y1, s.y2) - hw, Math.max(s.y1, s.y2) + hw); col = s.stroke
    }
    const [cr, cg, cb] = parse(col)
    for (let gy = yr[0]; gy <= yr[1]; gy++) {
      const py = (gy + 0.5) * cell
      for (let gx = xr[0]; gx <= xr[1]; gx++) {
        const px = (gx + 0.5) * cell
        let hit: boolean
        if (s.k === 'c') hit = (px - s.x) ** 2 + (py - s.y) ** 2 <= s.r * s.r
        else if (s.k === 'r') hit = px >= Math.min(s.x, s.x + s.w) && px <= Math.max(s.x, s.x + s.w) && py >= Math.min(s.y, s.y + s.h) && py <= Math.max(s.y, s.y + s.h)
        else {
          const dx = s.x2 - s.x1, dy = s.y2 - s.y1
          const len2 = dx * dx + dy * dy
          let u = len2 === 0 ? 0 : ((px - s.x1) * dx + (py - s.y1) * dy) / len2
          u = Math.max(0, Math.min(1, u))
          const qx = s.x1 + u * dx, qy = s.y1 + u * dy
          const hw = Math.max(s.w, LINE_WIDTH) / 2
          hit = (px - qx) ** 2 + (py - qy) ** 2 <= hw * hw
        }
        if (hit) { const i = (gy * GRID + gx) * 3; out[i] = cr; out[i + 1] = cg; out[i + 2] = cb }
      }
    }
  }
  return out
}

const COLOR_TOL = 40

export interface FrameDiff { diff: number; nonBg: number }

/** İki kare arasında farklı hücre sayısı; `nonBg` hedefte zemin dışı hücre sayısıdır. */
export function diffRasters(user: Uint8Array, target: Uint8Array, targetBg: [number, number, number]): FrameDiff {
  let diff = 0, nonBg = 0
  for (let i = 0; i < GRID * GRID; i++) {
    const j = i * 3
    const d = Math.max(Math.abs(user[j] - target[j]), Math.abs(user[j + 1] - target[j + 1]), Math.abs(user[j + 2] - target[j + 2]))
    if (d > COLOR_TOL) diff++
    const e = Math.max(Math.abs(target[j] - targetBg[0]), Math.abs(target[j + 1] - targetBg[1]), Math.abs(target[j + 2] - targetBg[2]))
    if (e > COLOR_TOL) nonBg++
  }
  return { diff, nonBg }
}

export const frameOk = (d: FrameDiff) => d.diff <= 3 + 0.02 * d.nonBg

/** En çok bu kadar kare farklı olabilir (yuvarlama gürültüsü payı). */
export const BAD_FRAME_LIMIT = 2

/** Kullanıcı karelerini hedefle karşılaştırır; farklı karelerin sırası döner. */
export function badFrames(user: Frame[], target: Frame[], targetRasters?: Uint8Array[]): number[] {
  const bad: number[] = []
  for (let i = 0; i < target.length; i++) {
    const tr = targetRasters?.[i] ?? rasterize(target[i])
    const ur = rasterize(user[i] ?? { bg: BG_DEFAULT, shapes: [] })
    if (!frameOk(diffRasters(ur, tr, parse(target[i].bg)))) bad.push(i)
  }
  return bad
}
