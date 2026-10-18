// OpenCV dersi: köşe algılama ve öznitelik eşleştirme (saf, testli). Harris yanıtı cv2.cornerHarris tanımıyla
// R = det(M) − k·iz(M)², M pencere içinde Gauss ağırlıklı [Ix², IxIy; IxIy, Iy²]. Betimleyici ORB'deki rBRIEF fikrinin sade
// hâli: köşe çevresindeki yamada sabit (tohumlu) nokta çiftlerinin parlaklık karşılaştırması → 256 bit; yama, yoğunluk
// merkezinin yönüne döndürülür (ORB'nin "oriented FAST" adımı), böylece dönmeye dayanıklı olur. Eşleştirme Hamming uzaklığı
// ve Lowe oran testiyle; RANSAC yerine dört eşleşmeden homografi + iç nokta sayımı (geom.perspectiveTransform).
import { field, gaussianBlur, gaussianBlurF, sepFilter, type Field, type Gray } from './ops'
import { applyH, perspectiveTransform, type Mat3 } from './geom'
import type { P } from './contours'
import { rng } from './samples'

export function harris(g: Gray, k = 0.04, blockSigma = 1.5): Field {
  const ix = sepFilter(g, [-1, 0, 1], [1, 2, 1]), iy = sepFilter(g, [1, 2, 1], [-1, 0, 1])
  const n = g.w * g.h, xx = field(g.w, g.h), yy = field(g.w, g.h), xy = field(g.w, g.h)
  for (let i = 0; i < n; i++) { const a = ix.data[i] / 8, b = iy.data[i] / 8; xx.data[i] = a * a; yy.data[i] = b * b; xy.data[i] = a * b }
  const ks = 2 * Math.ceil(3 * blockSigma) + 1
  const A = gaussianBlurF(xx, ks, blockSigma), B = gaussianBlurF(yy, ks, blockSigma), C = gaussianBlurF(xy, ks, blockSigma)
  const R = field(g.w, g.h)
  for (let i = 0; i < n; i++) { const det = A.data[i] * B.data[i] - C.data[i] ** 2, tr = A.data[i] + B.data[i]; R.data[i] = det - k * tr * tr }
  return R
}

export interface Kp extends P { score: number; angle: number }
/** Yanıt haritasında yerel en büyükler: en büyük yanıtın `rel` katından büyük, `r` yarıçapta tek, en iyi `max` tanesi. */
export function peaks(R: Field, rel = 0.01, r = 4, max = 80, border = 10): Kp[] {
  let mx = 0
  for (const v of R.data) if (v > mx) mx = v
  const th = mx * rel, { w, h } = R, out: Kp[] = []
  for (let y = border; y < h - border; y++) for (let x = border; x < w - border; x++) {
    const v = R.data[y * w + x]
    if (v <= th) continue
    let ok = true
    for (let dy = -r; dy <= r && ok; dy++) for (let dx = -r; dx <= r; dx++) {
      if (!dx && !dy) continue
      const u = R.data[(y + dy) * w + x + dx]
      if (u > v || (u === v && (dy < 0 || (dy === 0 && dx < 0)))) { ok = false; break }
    }
    if (ok) out.push({ x, y, score: v, angle: 0 })
  }
  return out.sort((a, b) => b.score - a.score).slice(0, max)
}

const PATCH = 15 // yama yarıçapı
/** 256 karşılaştırma çifti, yarıçap PATCH içinde Gauss dağılımlı (BRIEF'in II. örnekleme düzeni). Sabit tohum: her yerde aynı. */
export const PAIRS: Array<[number, number, number, number]> = (() => {
  const r = rng(2024), g = () => { let s = 0; for (let i = 0; i < 6; i++) s += r(); return (s - 3) * (PATCH / 2.2) }
  const c = (v: number) => Math.max(-PATCH + 1, Math.min(PATCH - 1, Math.round(v)))
  return Array.from({ length: 256 }, () => [c(g()), c(g()), c(g()), c(g())] as [number, number, number, number])
})()

/** Yoğunluk merkezi yönü (ORB): θ = atan2(m01, m10), yarıçap PATCH dairesinde. */
export function orientation(g: Gray, x: number, y: number): number {
  let m01 = 0, m10 = 0
  for (let dy = -PATCH; dy <= PATCH; dy++) for (let dx = -PATCH; dx <= PATCH; dx++) {
    if (dx * dx + dy * dy > PATCH * PATCH) continue
    const xx = x + dx, yy = y + dy
    if (xx < 0 || yy < 0 || xx >= g.w || yy >= g.h) continue
    const v = g.data[yy * g.w + xx]; m10 += dx * v; m01 += dy * v
  }
  return Math.atan2(m01, m10)
}

/** Döndürülmüş BRIEF: 256 bit, 8 adet 32 bitlik sayıda. Görüntü önce hafif bulanıklaştırılmış olmalı (gürültüye karşı). */
export function describe(smooth: Gray, kp: Kp): Uint32Array {
  const d = new Uint32Array(8), c = Math.cos(kp.angle), s = Math.sin(kp.angle)
  const at = (u: number, v: number) => {
    const xx = Math.round(kp.x + c * u - s * v), yy = Math.round(kp.y + s * u + c * v)
    if (xx < 0 || yy < 0 || xx >= smooth.w || yy >= smooth.h) return 0
    return smooth.data[yy * smooth.w + xx]
  }
  PAIRS.forEach(([u1, v1, u2, v2], i) => { if (at(u1, v1) < at(u2, v2)) d[i >> 5] |= 1 << (i & 31) })
  return d
}
export function hamming(a: Uint32Array, b: Uint32Array): number {
  let n = 0
  for (let i = 0; i < a.length; i++) { let x = (a[i] ^ b[i]) >>> 0; while (x) { x &= x - 1; n++ } }
  return n
}

export interface Features { kps: Kp[]; desc: Uint32Array[] }
export function detectAndCompute(g: Gray, max = 80, rel = 0.01): Features {
  const kps = peaks(harris(g), rel, 4, max, PATCH + 1)
  const sm = gaussianBlur(g, 5, 1.2)
  for (const k of kps) k.angle = orientation(sm, k.x, k.y)
  return { kps, desc: kps.map((k) => describe(sm, k)) }
}

export interface Match { i: number; j: number; d: number }
/** En yakın iki komşu; d1 < ratio·d2 ise kabul (Lowe oran testi). `cross`: karşılıklı en yakın olma şartı. */
export function match(a: Uint32Array[], b: Uint32Array[], ratio = 0.8, cross = true): Match[] {
  const best = (q: Uint32Array, set: Uint32Array[]) => {
    let j1 = -1, d1 = 1e9, d2 = 1e9
    set.forEach((t, j) => { const d = hamming(q, t); if (d < d1) { d2 = d1; d1 = d; j1 = j } else if (d < d2) d2 = d })
    return { j: j1, d1, d2 }
  }
  const out: Match[] = []
  a.forEach((q, i) => {
    const r = best(q, b)
    if (r.j < 0 || r.d1 >= ratio * r.d2) return
    if (cross && best(b[r.j], a).j !== i) return
    out.push({ i, j: r.j, d: r.d1 })
  })
  return out.sort((x, y) => x.d - y.d)
}

/** Basit RANSAC: rastgele 4 eşleşme → homografi → `tol` piksel içindeki eşleşmeleri say; en çok iç noktalı model. */
export function ransacH(pa: P[], pb: P[], ms: Match[], iters = 300, tol = 3, seed = 1): { H: Mat3 | null; inliers: boolean[] } {
  const r = rng(seed)
  let bestH: Mat3 | null = null, best: boolean[] = ms.map(() => false), bestN = 0
  if (ms.length < 4) return { H: null, inliers: best }
  for (let it = 0; it < iters; it++) {
    const pick = new Set<number>()
    while (pick.size < 4) pick.add(Math.floor(r() * ms.length))
    const idx = [...pick]
    const H = perspectiveTransform(idx.map((k) => pa[ms[k].i]), idx.map((k) => pb[ms[k].j]))
    if (!H) continue
    const inl = ms.map((m) => { const q = applyH(H, pa[m.i]); return Math.hypot(q.x - pb[m.j].x, q.y - pb[m.j].y) <= tol })
    const n = inl.filter(Boolean).length
    if (n > bestN) { bestN = n; best = inl; bestH = H }
  }
  return { H: bestH, inliers: best }
}
