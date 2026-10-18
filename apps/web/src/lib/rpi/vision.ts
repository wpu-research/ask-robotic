// Kamera → OpenCV boru hattı (kavram): yapay kare üret, BGR→HSV, inRange maskesi, aşındır/genişlet, momentlerle
// ağırlık merkezi, merkezden sapmaya göre dönüş komutu. OpenCV'nin HSV ölçeği: H 0–179, S ve V 0–255. Saf fonksiyonlar.

export interface Frame { w: number; h: number; rgb: Uint8ClampedArray }
export interface Ball { x: number; y: number; r: number; color: [number, number, number] }

/** Basit sözde rastgele (deterministik test için). */
export function lcg(seed: number) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32) }

/** Gri-yeşil zemin üzerinde top(lar) ve isteğe bağlı gürültü. */
export function synthFrame(w: number, h: number, balls: Ball[], noise = 0, seed = 1, light = 1): Frame {
  const rgb = new Uint8ClampedArray(w * h * 3)
  const rnd = lcg(seed)
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let c: [number, number, number] = [90 + (y / h) * 40, 110 + (y / h) * 30, 95]
    for (const b of balls) if ((x - b.x) ** 2 + (y - b.y) ** 2 <= b.r * b.r) c = b.color
    const i = (y * w + x) * 3
    for (let k = 0; k < 3; k++) rgb[i + k] = c[k] * light + (noise ? (rnd() - 0.5) * 2 * noise : 0)
  }
  return { w, h, rgb }
}

/** RGB (0–255) → OpenCV HSV (H 0–179, S, V 0–255). */
export function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn
  let h = 0
  if (d) {
    if (mx === r) h = 60 * (((g - b) / d) % 6)
    else if (mx === g) h = 60 * ((b - r) / d + 2)
    else h = 60 * ((r - g) / d + 4)
  }
  if (h < 0) h += 360
  return [Math.round(h / 2), mx ? Math.round((d / mx) * 255) : 0, Math.round(mx)]
}

export interface HsvRange { lo: [number, number, number]; hi: [number, number, number] }
/** cv2.inRange: H aralığı lo>hi ise kırmızı gibi 0'ı saran aralık sayılır. */
export function inRange(f: Frame, r: HsvRange): Uint8Array {
  const m = new Uint8Array(f.w * f.h)
  for (let i = 0; i < m.length; i++) {
    const [h, s, v] = rgbToHsv(f.rgb[i * 3], f.rgb[i * 3 + 1], f.rgb[i * 3 + 2])
    const hOk = r.lo[0] <= r.hi[0] ? h >= r.lo[0] && h <= r.hi[0] : h >= r.lo[0] || h <= r.hi[0]
    m[i] = hOk && s >= r.lo[1] && s <= r.hi[1] && v >= r.lo[2] && v <= r.hi[2] ? 1 : 0
  }
  return m
}
function morph(m: Uint8Array, w: number, h: number, erode: boolean): Uint8Array {
  const o = new Uint8Array(m.length)
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let acc = erode ? 1 : 0
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const xx = x + dx, yy = y + dy
      const v = xx < 0 || yy < 0 || xx >= w || yy >= h ? 0 : m[yy * w + xx]
      acc = erode ? acc & v : acc | v
    }
    o[y * w + x] = acc
  }
  return o
}
/** Açma (aşındır + genişlet): tek piksellik gürültüyü siler. */
export const openMask = (m: Uint8Array, w: number, h: number) => morph(morph(m, w, h, true), w, h, false)

/** Momentler: m00 alan, (m10/m00, m01/m00) ağırlık merkezi. */
export function centroid(m: Uint8Array, w: number): { area: number; x: number; y: number } | null {
  let a = 0, sx = 0, sy = 0
  for (let i = 0; i < m.length; i++) if (m[i]) { a++; sx += i % w; sy += Math.floor(i / w) }
  return a ? { area: a, x: sx / a, y: sy / a } : null
}

/** Merkezden yatay sapma → dönüş komutu (−1 sol … +1 sağ). Alan küçükse "hedef yok". */
export function steer(c: { area: number; x: number } | null, w: number, minArea: number, k = 1): { turn: number; seen: boolean } {
  if (!c || c.area < minArea) return { turn: 0, seen: false }
  const err = (c.x - w / 2) / (w / 2)
  return { turn: Math.max(-1, Math.min(1, k * err)), seen: true }
}

/** Hazır renk aralıkları (OpenCV HSV). */
export const PRESETS: Record<'red' | 'green' | 'blue' | 'yellow', HsvRange> = {
  red: { lo: [170, 120, 70], hi: [10, 255, 255] },
  green: { lo: [40, 80, 60], hi: [85, 255, 255] },
  blue: { lo: [100, 120, 60], hi: [130, 255, 255] },
  yellow: { lo: [20, 120, 100], hi: [35, 255, 255] },
}
