// OpenCV dersi 3B sahne mantığı (saf, testli): masada A4 bir belge ve iğne deliği modeliyle sanal bir kamera. Görüntü bu
// kameradan gerçekten üretilir (her piksel için ışın masa düzlemiyle kesiştirilir), sonra 9. ünitedeki köşe bulma ve
// perspektif düzeltme aynı görüntüye uygulanır. 3B görünüm (three.js) yalnız bu durumu çizer.
// Koordinatlar: dünya Z yukarı, masa z = 0 düzlemi, metre. Kamera: x sağ, y aşağı, z ileri (OpenCV kuralı).
import { rgba, type Rgba } from './ops'
import type { P } from './contours'
import { rng } from './samples'

export type V3 = [number, number, number]
export interface CamParams { elev: number; azim: number; dist: number; docYaw: number; f: number; w: number; h: number }
export const CAM_DEFAULT: CamParams = { elev: 55, azim: 20, dist: 0.6, docYaw: 10, f: 300, w: 320, h: 240 }
export const DOC_W = 0.21, DOC_H = 0.297
export const DESK = { w: 1.2, h: 0.8 }

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
const norm = (a: V3): V3 => { const l = Math.hypot(...a); return [a[0] / l, a[1] / l, a[2] / l] }

export interface CamPose { C: V3; /** kamera eksenleri dünya koordinatında: sağ, aşağı, ileri */ r: V3; d: V3; fwd: V3 }
/** Kamera masa merkezine bakar; elev yükseklik açısı (90 = tam yukarıdan), azim masanın etrafında dönme (derece). */
export function cameraPose(p: CamParams): CamPose {
  const e = (p.elev * Math.PI) / 180, a = (p.azim * Math.PI) / 180
  const C: V3 = [p.dist * Math.cos(e) * Math.sin(a), -p.dist * Math.cos(e) * Math.cos(a), p.dist * Math.sin(e)]
  const fwd = norm(sub([0, 0, 0], C))
  // dünya yukarısı Z; tam tepeden bakışta yön belirsiz kalmasın diye masa +y ekseni "yukarı" alınır
  const upRef: V3 = Math.abs(fwd[2]) > 0.999 ? [0, 1, 0] : [0, 0, 1]
  const r = norm(cross(fwd, upRef)), d = norm(cross(fwd, r))
  return { C, r, d, fwd }
}
/** Dünya noktası → piksel (iğne deliği; u = f·x/z + cx). Kameranın arkasındaysa null. */
export function project(p: CamParams, pose: CamPose, X: V3): P | null {
  const v = sub(X, pose.C), z = dot(v, pose.fwd)
  if (z <= 1e-6) return null
  return { x: (p.f * dot(v, pose.r)) / z + p.w / 2, y: (p.f * dot(v, pose.d)) / z + p.h / 2 }
}
/** Belgenin köşeleri (dünya): sol üst, sağ üst, sağ alt, sol alt (belge koordinatında; yukarı +y). */
export function docCorners(yawDeg: number): V3[] {
  const c = Math.cos((yawDeg * Math.PI) / 180), s = Math.sin((yawDeg * Math.PI) / 180)
  return ([[-1, 1], [1, 1], [1, -1], [-1, -1]] as const).map(([u, v]) => { const x = (u * DOC_W) / 2, y = (v * DOC_H) / 2; return [x * c - y * s, x * s + y * c, 0] as V3 })
}
/** Pikselden çıkan ışının masa düzlemini (z = 0) kestiği nokta. */
export function backProject(p: CamParams, pose: CamPose, u: number, v: number): V3 | null {
  const x = (u - p.w / 2) / p.f, y = (v - p.h / 2) / p.f
  const dir: V3 = [pose.fwd[0] + x * pose.r[0] + y * pose.d[0], pose.fwd[1] + x * pose.r[1] + y * pose.d[1], pose.fwd[2] + x * pose.r[2] + y * pose.d[2]]
  if (dir[2] >= -1e-9) return null
  const t = -pose.C[2] / dir[2]
  return [pose.C[0] + t * dir[0], pose.C[1] + t * dir[1], 0]
}

/** Belgenin kendi dokusu (dikey A4, 210×297 "piksel"): başlık ve satırlar. 3B sahnede de doku olarak kullanılır. */
export function docTexture(w = 210, h = 297): Rgba {
  const img = rgba(w, h), r = rng(9)
  for (let i = 0; i < img.data.length; i += 4) { img.data[i] = 246; img.data[i + 1] = 244; img.data[i + 2] = 238; img.data[i + 3] = 255 }
  const box = (x0: number, y0: number, bw: number, bh: number, c: [number, number, number]) => {
    for (let y = y0; y < y0 + bh; y++) for (let x = x0; x < x0 + bw; x++) { if (x < 0 || y < 0 || x >= w || y >= h) continue; const i = (y * w + x) * 4; img.data[i] = c[0]; img.data[i + 1] = c[1]; img.data[i + 2] = c[2] }
  }
  box(20, 22, 120, 12, [30, 30, 90])
  for (let k = 0; k < 18; k++) { const y = 52 + k * 13; let x = 20; while (x < w - 30) { const len = 8 + Math.floor(r() * 26); if (x + len > w - 20) break; box(x, y, len, 5, [60, 60, 70]); x += len + 5 } }
  return img
}

/** Kameranın gördüğü 320×240 görüntü: belge, ahşap masa, masanın dışı koyu zemin. */
export function renderPhoto(p: CamParams, tex: Rgba = docTexture()): { img: Rgba; corners: Array<P | null> } {
  const pose = cameraPose(p), img = rgba(p.w, p.h), yaw = (p.docYaw * Math.PI) / 180, c = Math.cos(yaw), s = Math.sin(yaw)
  for (let v = 0; v < p.h; v++) for (let u = 0; u < p.w; u++) {
    const o = (v * p.w + u) * 4
    const X = backProject(p, pose, u + 0.5, v + 0.5)
    let col: [number, number, number] = [40, 44, 52]
    if (X && Math.abs(X[0]) < DESK.w / 2 && Math.abs(X[1]) < DESK.h / 2) {
      // belge koordinatı: masa noktasını belgenin dönüşünün tersiyle çevir
      const dx = X[0] * c + X[1] * s, dy = -X[0] * s + X[1] * c
      if (Math.abs(dx) < DOC_W / 2 && Math.abs(dy) < DOC_H / 2) {
        const tx = Math.min(tex.w - 1, Math.floor(((dx + DOC_W / 2) / DOC_W) * tex.w)), ty = Math.min(tex.h - 1, Math.floor(((DOC_H / 2 - dy) / DOC_H) * tex.h))
        const i = (ty * tex.w + tx) * 4
        col = [tex.data[i], tex.data[i + 1], tex.data[i + 2]]
      } else {
        const g = 16 * Math.sin(X[1] * 90 + Math.sin(X[0] * 9) * 2)
        col = [122 + g, 80 + g * 0.7, 48 + g * 0.4]
      }
    }
    img.data[o] = col[0]; img.data[o + 1] = col[1]; img.data[o + 2] = col[2]; img.data[o + 3] = 255
  }
  return { img, corners: docCorners(p.docYaw).map((X) => project(p, pose, X)) }
}
/** Kamera piramidinin (frustum) dört köşe ışını dünya koordinatında, `depth` metre uzakta. */
export function frustum(p: CamParams, depth = 0.12): V3[] {
  const pose = cameraPose(p)
  return ([[0, 0], [p.w, 0], [p.w, p.h], [0, p.h]] as const).map(([u, v]) => {
    const x = (u - p.w / 2) / p.f, y = (v - p.h / 2) / p.f
    return [0, 1, 2].map((k) => pose.C[k] + depth * (pose.fwd[k] + x * pose.r[k] + y * pose.d[k])) as V3
  })
}
