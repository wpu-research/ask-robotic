// OpenCV dersi: Viola-Jones fikrinin küçük, elle kurulmuş hâli (saf, testli). Gerçek Haar kademesi binlerce öğrenilmiş
// öznitelikten oluşur; burada üç anlaşılır öznitelik var ve her biri bir kademe aşaması. Amaç yöntemi göstermek:
// integral görüntüyle dikdörtgen toplamı dört okumadır, kayan pencere birçok ölçekte gezer, erken aşama çoğu pencereyi eler,
// sonunda örtüşen bulgular birleştirilir (cv2.groupRectangles / NMS benzeri).
import { integral, rectSum, toGray, type Gray, type Rgba } from './ops'

export interface Win { x: number; y: number; s: number }
/** Pencere içinde göreli dikdörtgen [x0, y0, x1, y1] (0..1). */
type R = [number, number, number, number]
export interface HaarFeature { key: 'eyes' | 'bridge' | 'mouth'; dark: R[]; light: R[]; th: number; tr: string; en: string }

/** Kare pencere (s×s) için üç öznitelik. Eşikler ortalama parlaklık farkı (0–255) cinsinden; normalleştirme pencerenin std'siyle. */
export const FEATURES: HaarFeature[] = [
  { key: 'eyes', dark: [[0.12, 0.3, 0.88, 0.42]], light: [[0.12, 0.45, 0.88, 0.6]], th: 1.15,
    tr: 'Göz bandı yanaklardan koyu', en: 'The eye band is darker than the cheeks' },
  { key: 'bridge', dark: [[0.18, 0.3, 0.4, 0.42], [0.6, 0.3, 0.82, 0.42]], light: [[0.44, 0.3, 0.56, 0.5]], th: 1.4,
    tr: 'Burun köprüsü iki gözden açık', en: 'The bridge of the nose is lighter than both eyes' },
  { key: 'mouth', dark: [[0.32, 0.7, 0.68, 0.8]], light: [[0.32, 0.56, 0.68, 0.66]], th: 1.0,
    tr: 'Ağız, üstündeki bölgeden koyu', en: 'The mouth is darker than the area above it' },
]

const mean = (I: Float64Array, w: number, win: Win, r: R) => {
  const x0 = Math.round(win.x + r[0] * win.s), y0 = Math.round(win.y + r[1] * win.s), x1 = Math.max(x0 + 1, Math.round(win.x + r[2] * win.s)), y1 = Math.max(y0 + 1, Math.round(win.y + r[3] * win.s))
  return rectSum(I, w, x0, y0, x1, y1) / ((x1 - x0) * (y1 - y0))
}
/** Bir özniteliğin değeri: (açık ortalama − koyu ortalama) / pencere std'si. Işık değişimine karşı normalleştirilmiş. */
export function featureValue(I: Float64Array, I2: Float64Array, w: number, win: Win, f: HaarFeature): number {
  const m = rectSum(I, w, win.x, win.y, win.x + win.s, win.y + win.s) / (win.s * win.s)
  const m2 = rectSum(I2, w, win.x, win.y, win.x + win.s, win.y + win.s) / (win.s * win.s)
  const sd = Math.sqrt(Math.max(1, m2 - m * m))
  const avg = (rs: R[]) => rs.reduce((a, r) => a + mean(I, w, win, r), 0) / rs.length
  return (avg(f.light) - avg(f.dark)) / sd
}

export interface Detect { wins: Win[]; tested: number; passed: number[]; /** her aşamaya ulaşan pencere sayısı */ reached: number[] }
export function integrals(g: Gray) {
  const sq = { w: g.w, h: g.h, data: new Float32Array(g.data.length) }
  for (let i = 0; i < g.data.length; i++) sq.data[i] = g.data[i] * g.data[i]
  return { I: integral(g), I2: integral(sq) }
}
/** Kayan pencere + kademe. `scales`: pencere boyları; `step`: kaydırma (pencere boyunun oranı). */
export function detect(src: Rgba | Gray, scales = [64, 80, 96, 112, 128], step = 0.05, feats = FEATURES): Detect {
  const g = 'data' in src && src.data.length === src.w * src.h * 4 ? toGray(src as Rgba) : (src as Gray)
  const { I, I2 } = integrals(g)
  const wins: Win[] = [], reached = feats.map(() => 0), passed = feats.map(() => 0)
  let tested = 0
  for (const s of scales) {
    const st = Math.max(2, Math.round(s * step))
    for (let y = 0; y + s <= g.h; y += st) for (let x = 0; x + s <= g.w; x += st) {
      tested++
      const win = { x, y, s }
      let ok = true
      for (let k = 0; k < feats.length; k++) {
        reached[k]++
        if (featureValue(I, I2, g.w, win, feats[k]) < feats[k].th) { ok = false; break }
        passed[k]++
      }
      if (ok) wins.push(win)
    }
  }
  return { wins, tested, passed, reached }
}
const iou = (a: Win, b: Win) => {
  const ix = Math.max(0, Math.min(a.x + a.s, b.x + b.s) - Math.max(a.x, b.x)), iy = Math.max(0, Math.min(a.y + a.s, b.y + b.s) - Math.max(a.y, b.y))
  const i = ix * iy
  return i / (a.s * a.s + b.s * b.s - i)
}
/** Örtüşen pencereleri öbekle, her öbeğin ortalamasını al; `minNeighbors`'tan az komşulu öbekler atılır (cv2'deki gibi). */
export function group(wins: Win[], minNeighbors = 2, thr = 0.3): Array<Win & { n: number }> {
  const cl: Win[][] = []
  for (const w of wins) { const c = cl.find((k) => iou(k[0], w) > thr); if (c) c.push(w); else cl.push([w]) }
  return cl.filter((c) => c.length >= minNeighbors).map((c) => ({
    x: Math.round(c.reduce((a, w) => a + w.x, 0) / c.length), y: Math.round(c.reduce((a, w) => a + w.y, 0) / c.length),
    s: Math.round(c.reduce((a, w) => a + w.s, 0) / c.length), n: c.length,
  }))
}
