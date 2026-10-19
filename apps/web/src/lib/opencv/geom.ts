// OpenCV dersi: geometrik dönüşümler (saf, testli). getRotationMatrix2D, warpAffine, getPerspectiveTransform (dört nokta
// çiftinden 8×8 doğrusal sistem), warpPerspective (ters eşlemeyle, en yakın komşu ya da çift doğrusal ara değerleme) ve
// belge köşelerini bulan hat (gri → Gauss → Canny → genişletme → en büyük dışbükey dörtgen).
import { approxPolyDP, arcLength, contourArea, convexHull, findContours, type P } from './contours'
import { canny, morphology, rgba, toGray, type Gray, type Rgba } from './ops'

export type Mat3 = [number, number, number, number, number, number, number, number, number]
export type Affine = [number, number, number, number, number, number]

/** cv2.getRotationMatrix2D(merkez, açı°, ölçek): pozitif açı saat yönünün tersine (görüntüde y aşağı). */
export function rotationMatrix(cx: number, cy: number, angleDeg: number, scale: number): Affine {
  const a = (angleDeg * Math.PI) / 180, al = scale * Math.cos(a), be = scale * Math.sin(a)
  return [al, be, (1 - al) * cx - be * cy, -be, al, be * cx + (1 - al) * cy]
}
export const applyAffine = (M: Affine, p: P): P => ({ x: M[0] * p.x + M[1] * p.y + M[2], y: M[3] * p.x + M[4] * p.y + M[5] })
export function invertAffine(M: Affine): Affine {
  const det = M[0] * M[4] - M[1] * M[3]
  const a = M[4] / det, b = -M[1] / det, d = -M[3] / det, e = M[0] / det
  return [a, b, -(a * M[2] + b * M[5]), d, e, -(d * M[2] + e * M[5])]
}
export const affineToMat3 = (M: Affine): Mat3 => [M[0], M[1], M[2], M[3], M[4], M[5], 0, 0, 1]

export function applyH(H: Mat3, p: P): P {
  const w = H[6] * p.x + H[7] * p.y + H[8]
  return { x: (H[0] * p.x + H[1] * p.y + H[2]) / w, y: (H[3] * p.x + H[4] * p.y + H[5]) / w }
}
export function invert3(m: Mat3): Mat3 {
  const [a, b, c, d, e, f, g, h, i] = m
  const A = e * i - f * h, B = -(d * i - f * g), C = d * h - e * g
  const det = a * A + b * B + c * C
  return [A / det, -(b * i - c * h) / det, (b * f - c * e) / det, B / det, (a * i - c * g) / det, -(a * f - c * d) / det, C / det, -(a * h - b * g) / det, (a * e - b * d) / det]
}
/** Kısmi pivotlu Gauss yok etme; tekil sistemde null. */
export function solve(A: number[][], b: number[]): number[] | null {
  const n = b.length, M = A.map((r, i) => [...r, b[i]])
  for (let c = 0; c < n; c++) {
    let p = c
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r
    if (Math.abs(M[p][c]) < 1e-12) return null
    ;[M[c], M[p]] = [M[p], M[c]]
    for (let r = 0; r < n; r++) {
      if (r === c) continue
      const f = M[r][c] / M[c][c]
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k]
    }
  }
  return M.map((r, i) => r[n] / r[i])
}
/** cv2.getPerspectiveTransform: src[i] → dst[i] eşleyen 3×3 homografi (h₃₃ = 1). */
export function perspectiveTransform(src: P[], dst: P[]): Mat3 | null {
  const A: number[][] = [], b: number[] = []
  for (let i = 0; i < 4; i++) {
    const { x, y } = src[i], { x: u, y: v } = dst[i]
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.push(u)
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); b.push(v)
  }
  const h = solve(A, b)
  return h ? [h[0], h[1], h[2], h[3], h[4], h[5], h[6], h[7], 1] : null
}

export type Interp = 'nearest' | 'linear'
/** Kaynaktan (x, y) noktasını örnekler; dışarıda `fill`. */
function sample(src: Rgba, x: number, y: number, interp: Interp, out: Uint8ClampedArray, o: number, fill: number) {
  const { w, h, data } = src
  if (interp === 'nearest') {
    const xi = Math.round(x), yi = Math.round(y)
    if (xi < 0 || yi < 0 || xi >= w || yi >= h) { out[o] = out[o + 1] = out[o + 2] = fill; out[o + 3] = 255; return }
    const i = (yi * w + xi) * 4
    out[o] = data[i]; out[o + 1] = data[i + 1]; out[o + 2] = data[i + 2]; out[o + 3] = 255
    return
  }
  if (x < -0.5 || y < -0.5 || x > w - 0.5 || y > h - 0.5) { out[o] = out[o + 1] = out[o + 2] = fill; out[o + 3] = 255; return }
  const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0
  const cl = (v: number, n: number) => (v < 0 ? 0 : v >= n ? n - 1 : v)
  const xa = cl(x0, w), xb = cl(x0 + 1, w), ya = cl(y0, h), yb = cl(y0 + 1, h)
  for (let c = 0; c < 3; c++) {
    const p00 = data[(ya * w + xa) * 4 + c], p10 = data[(ya * w + xb) * 4 + c], p01 = data[(yb * w + xa) * 4 + c], p11 = data[(yb * w + xb) * 4 + c]
    out[o + c] = (p00 * (1 - fx) + p10 * fx) * (1 - fy) + (p01 * (1 - fx) + p11 * fx) * fy
  }
  out[o + 3] = 255
}
/** cv2.warpPerspective: her hedef pikseli ters homografiyle kaynağa götürüp örnekler. */
export function warpPerspective(src: Rgba, H: Mat3, w: number, h: number, interp: Interp = 'linear', fill = 0): Rgba {
  const Hi = invert3(H), o = rgba(w, h)
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const p = applyH(Hi, { x, y }); sample(src, p.x, p.y, interp, o.data, (y * w + x) * 4, fill) }
  return o
}
export const warpAffine = (src: Rgba, M: Affine, w: number, h: number, interp: Interp = 'linear', fill = 0): Rgba => warpPerspective(src, affineToMat3(M), w, h, interp, fill)

/** Dört noktayı sol üst, sağ üst, sağ alt, sol alt sırasına koyar (x+y ve y−x ile). */
export function orderCorners(pts: P[]): P[] {
  const s = [...pts].sort((a, b) => a.x + a.y - (b.x + b.y))
  const d = [...pts].sort((a, b) => a.y - a.x - (b.y - b.x))
  return [s[0], d[0], s[3], d[3]]
}
/** Düzlenmiş belgenin boyu: karşılıklı kenarların uzunu. */
export function quadSize(q: P[]): { w: number; h: number } {
  const L = (a: P, b: P) => Math.hypot(a.x - b.x, a.y - b.y)
  return { w: Math.round(Math.max(L(q[0], q[1]), L(q[3], q[2]))), h: Math.round(Math.max(L(q[0], q[3]), L(q[1], q[2]))) }
}
export interface DocSteps { gray: Gray; edges: Gray; closed: Gray; quad: P[] | null; candidates: number }
/** Belge köşeleri: en büyük, görüntünün en az %minFrac'ı kadar, dört köşeye yaklaşan dışbükey kontur. */
export function findDocument(src: Rgba, lo = 50, hi = 150, minFrac = 0.1): DocSteps {
  const g = toGray(src), edges = canny(g, lo, hi, 5, 0).edges
  const closed = morphology(edges, 'close', 'rect', 3, 2)
  const cs = findContours(closed, 50)
  let best: P[] | null = null, bestA = minFrac * src.w * src.h, cand = 0
  for (const c of cs) {
    const hull = convexHull(c)
    const a = contourArea(hull)
    if (a < bestA) continue
    const ap = approxPolyDP(hull, 0.02 * arcLength(hull))
    if (ap.length !== 4) continue
    cand++
    best = ap; bestA = a
  }
  return { gray: g, edges, closed, quad: best ? orderCorners(best) : null, candidates: cand }
}
