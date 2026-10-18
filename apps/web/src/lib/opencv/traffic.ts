// OpenCV dersi 12. ünite: arka plan çıkarma → maske temizliği → lekeler → izleme → çizgi sayımı. Gerçek Hayat Demoları'ndaki
// trafik sayacının fonksiyonlarını (lib/cv-demo-logic) yeniden kullanır; burada yalnız hat bir araya getirilir (saf, testli).
import { bgUpdate, blobs, countStep, fgMask, toGray, trackStep, type Track } from '@/lib/cv-demo-logic'
import { morphology, type Gray, type Rgba } from './ops'
import { trafficCars } from './samples'

/** Isınma süresi (sn). */
export const WARM = 2
/** Piksel başına ortanca. */
export function temporalMedian(fr: Float32Array[]): Float32Array {
  const o = new Float32Array(fr[0].length), v = new Float32Array(fr.length)
  for (let i = 0; i < o.length; i++) { for (let k = 0; k < fr.length; k++) v[k] = fr[k][i]; v.sort(); o[i] = v[v.length >> 1] }
  return o
}
export interface CounterOpts { alpha: number; th: number; selective: boolean; clean: boolean; line: number; minArea?: number }
export interface CounterState {
  t: number; bg: Float32Array | null; tracks: Track[]; nextId: number
  /** ısınma sırasında biriktirilen gri kareler (zamansal ortanca ile boş yol kestirimi) */
  warmFrames: Float32Array[]; frameNo: number
  lr: number; rl: number; truthLr: number; truthRl: number; prevCars: ReturnType<typeof trafficCars>
}
export const counterInit = (): CounterState => ({ t: 0, bg: null, tracks: [], nextId: 1, warmFrames: [], frameNo: 0, lr: 0, rl: 0, truthLr: 0, truthRl: 0, prevCars: trafficCars(0) })

/** Bir kare işler; durumu yerinde günceller, görselleştirme için maske ve arka planı döner. */
export function counterStep(s: CounterState, frame: Rgba, t: number, o: CounterOpts): { mask: Gray; bg: Gray } {
  const { w, h } = frame, n = w * h
  s.t = t
  const gray = toGray(frame.data, new Float32Array(n))
  if (!s.bg) s.bg = new Float32Array(gray)
  // ısınma (ilk WARM sn): araçlar ilk karede de vardı. Her 4. kareyi biriktir; süre dolunca piksel başına zamansal ortanca
  // boş yolu verir (her piksel zamanın çoğunda yoldur). Bu sürede sayım yapılmaz.
  const warm = t < WARM
  s.frameNo++
  if (warm && s.frameNo % 4 === 1) s.warmFrames.push(gray)
  if (!warm && s.warmFrames.length) { s.bg = temporalMedian(s.warmFrames); s.warmFrames = [] }
  const raw = new Uint8Array(n)
  fgMask(gray, s.bg, o.th, raw)
  let m: Gray = { w, h, data: new Uint8ClampedArray(n) }
  for (let i = 0; i < n; i++) m.data[i] = raw[i] ? 255 : 0
  if (o.clean) m = morphology(morphology(m, 'open', 'rect', 3), 'close', 'rect', 7)
  const bin = new Uint8Array(n)
  for (let i = 0; i < n; i++) bin[i] = m.data[i] ? 1 : 0
  if (!warm) bgUpdate(s.bg, gray, o.selective ? bin : null, o.alpha, o.alpha * 0.04)
  const bs = blobs(bin, w, h, o.minArea ?? 120).blobs
  const r = trackStep(s.tracks, bs, t, 40, 4, s.nextId)
  s.tracks = r.tracks; s.nextId = r.nextId
  if (!warm) for (const e of countStep(s.tracks, o.line, 0.05, 'x')) { if (e.dir > 0) s.lr++; else s.rl++ }
  // gerçek sayım: sahnedeki aracın merkezi çizgiyi geçti mi (yolun sonunda baştan girişi sayma)
  const cars = trafficCars(t, w)
  cars.forEach((c, i) => {
    const p = s.prevCars[i].x
    if (warm || Math.abs(c.x - p) > 50) return
    if (p < o.line && c.x >= o.line) s.truthLr++
    else if (p >= o.line && c.x < o.line) s.truthRl++
  })
  s.prevCars = cars
  return { mask: m, bg: { w, h, data: new Uint8ClampedArray(s.bg) } }
}
