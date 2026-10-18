// Gerçek Hayat Demoları: örnek mod için sentetik "model çıktısı" üreticileri (saf geometri, DOM yok).
// Kamera yokken sahnedeki karakterin iskeleti bu fonksiyonlarla çizilir ve aynı karar fonksiyonlarına verilir;
// MediaPipe'ın nokta numaralandırmasıyla aynıdır (Pose 33, El 21, Yüz 478). Birim: piksel.
import type { Pt } from './cv-demo-logic'

const rot = (p: Pt, a: number): Pt => ({ x: p.x * Math.cos(a) - p.y * Math.sin(a), y: p.x * Math.sin(a) + p.y * Math.cos(a) })

/**
 * Ayakta/yürüyen/düşen tam vücut (Pose, 33 nokta). Kişinin solu (tek numaralar) +x yönünde.
 * `lean`: ayak noktası çevresinde dönme (radyan; π/2 sağa yatmış), `crouch` 0…1 çömelme/oturma, `phase` yürüme evresi.
 */
export function makePose(o: { cx: number; footY: number; h: number; lean?: number; crouch?: number; phase?: number; stride?: number }): Pt[] {
  const { h } = o, c = o.crouch ?? 0, ph = o.phase ?? 0, st = o.stride ?? 0
  const sw = Math.sin(ph) * st
  const hipY = -0.52 * h * (1 - 0.38 * c), kneeY = -0.27 * h * (1 - 0.2 * c)
  const L: Array<[number, number]> = new Array(33).fill([0, -0.5 * h])
  const set = (i: number, x: number, y: number) => { L[i] = [x * h, y] }
  const shY = hipY - 0.3 * h
  set(0, 0, shY - 0.11 * h); set(1, 0.02, shY - 0.13 * h); set(2, 0.025, shY - 0.13 * h); set(3, 0.035, shY - 0.13 * h)
  set(4, -0.02, shY - 0.13 * h); set(5, -0.025, shY - 0.13 * h); set(6, -0.035, shY - 0.13 * h)
  set(7, 0.05, shY - 0.115 * h); set(8, -0.05, shY - 0.115 * h); set(9, 0.015, shY - 0.085 * h); set(10, -0.015, shY - 0.085 * h)
  set(11, 0.12, shY); set(12, -0.12, shY)
  set(13, 0.16 - sw * 0.25, shY + 0.15 * h); set(14, -0.16 + sw * 0.25, shY + 0.15 * h)
  set(15, 0.17 - sw * 0.5, shY + 0.29 * h); set(16, -0.17 + sw * 0.5, shY + 0.29 * h)
  for (const [i, w] of [[17, 15], [19, 15], [21, 15], [18, 16], [20, 16], [22, 16]] as const) L[i] = [L[w][0], L[w][1] + 0.03 * h]
  set(23, 0.08, hipY); set(24, -0.08, hipY)
  set(25, 0.07 + sw * 0.5 + c * 0.12, kneeY); set(26, -0.07 - sw * 0.5 + c * 0.12, kneeY)
  set(27, 0.06 + sw, 0); set(28, -0.06 - sw, 0)
  set(29, 0.05 + sw, 0.01 * h); set(30, -0.07 - sw, 0.01 * h); set(31, 0.1 + sw, 0.01 * h); set(32, -0.02 - sw, 0.01 * h)
  const a = o.lean ?? 0
  return L.map(([x, y]) => { const r = rot({ x, y }, a); return { x: o.cx + r.x, y: o.footY + r.y, visibility: 0.95 } })
}

/** Önden bel üstü (duruş analizi): omuz ortası (cx, cy), omuz genişliği sw; `tilt` omuz eğimi, `neck` baş yan eğimi (derece), `drop` 0…1 başın öne/aşağı düşmesi. */
export function makeUpper(o: { cx: number; cy: number; sw: number; tilt?: number; neck?: number; drop?: number }): Pt[] {
  const { cx, cy, sw } = o, t = ((o.tilt ?? 0) * Math.PI) / 180, n = ((o.neck ?? 0) * Math.PI) / 180, d = o.drop ?? 0
  const pts: Pt[] = new Array(33).fill(null).map(() => ({ x: cx, y: cy + sw, visibility: 0.05 }))
  const at = (i: number, p: Pt) => { pts[i] = { ...p, visibility: 0.95 } }
  const s = rot({ x: sw / 2, y: 0 }, t)
  at(11, { x: cx + s.x, y: cy + s.y }); at(12, { x: cx - s.x, y: cy - s.y })
  const head = rot({ x: 0, y: -0.78 * sw * (1 - 0.42 * d) }, n)
  const nose = { x: cx + head.x, y: cy + head.y }
  at(0, nose)
  const eL = rot({ x: 0.2 * sw, y: -0.04 * sw }, n), eR = rot({ x: -0.2 * sw, y: -0.04 * sw }, n)
  at(7, { x: nose.x + eL.x, y: nose.y + eL.y }); at(8, { x: nose.x + eR.x, y: nose.y + eR.y })
  at(13, { x: pts[11].x + 0.12 * sw, y: pts[11].y + 0.6 * sw }); at(14, { x: pts[12].x - 0.12 * sw, y: pts[12].y + 0.6 * sw })
  return pts
}

/** Açık el (21 nokta), bilek (x, y), boy `s` (bilekten orta parmak ucuna ≈ 1,22·s), dönme `r` radyan. */
const HAND_LOCAL: Array<[number, number]> = [
  [0, 0], [-0.25, -0.15], [-0.45, -0.3], [-0.6, -0.45], [-0.72, -0.6],
  [-0.2, -0.6], [-0.24, -0.85], [-0.26, -1.0], [-0.28, -1.15],
  [0, -0.62], [0, -0.9], [0, -1.07], [0, -1.22],
  [0.18, -0.58], [0.21, -0.83], [0.23, -0.98], [0.24, -1.1],
  [0.34, -0.5], [0.4, -0.68], [0.43, -0.8], [0.46, -0.9],
]
export function makeHand(x: number, y: number, s: number, r = 0): Pt[] {
  return HAND_LOCAL.map(([a, b]) => { const p = rot({ x: a * s, y: b * s }, r); return { x: x + p.x, y: y + p.y, visibility: 1 } })
}

/**
 * Yüz (478 nokta; yalnız gözler, ağız, burun, alın, çene, yanaklar anlamlı, kalanlar yüz ovali üzerinde).
 * `eye` 0…1 göz açıklığı (1 → EAR ≈ 0,30), `mouth` 0…1 ağız açıklığı (1 → MAR ≈ 0,9).
 */
export function makeFace(o: { cx: number; cy: number; fw: number; eye?: number; mouth?: number }): Pt[] {
  const { cx, cy, fw } = o, eo = o.eye ?? 1, mo = o.mouth ?? 0
  const pts: Pt[] = []
  for (let i = 0; i < 478; i++) { const a = (i / 478) * Math.PI * 2 * 7; const k = 0.85 + 0.15 * ((i * 37) % 11) / 10; pts.push({ x: cx + Math.cos(a) * fw * 0.5 * k, y: cy + Math.sin(a) * fw * 0.66 * k }) }
  const P = (i: number, x: number, y: number) => { pts[i] = { x, y } }
  const ew = 0.16 * fw, hh = 0.024 * fw * eo, eyY = cy - 0.08 * fw
  const eye = (ex: number, [p1, p2, p3, p4, p5, p6]: number[]) => {
    P(p1, ex - ew / 2, eyY); P(p4, ex + ew / 2, eyY)
    P(p2, ex - ew / 6, eyY - hh); P(p3, ex + ew / 6, eyY - hh); P(p6, ex - ew / 6, eyY + hh); P(p5, ex + ew / 6, eyY + hh)
  }
  eye(cx + 0.2 * fw, [362, 385, 387, 263, 373, 380])
  eye(cx - 0.2 * fw, [33, 160, 158, 133, 153, 144])
  const my = cy + 0.3 * fw, gap = 0.01 * fw + mo * 0.27 * fw
  P(61, cx - 0.15 * fw, my); P(291, cx + 0.15 * fw, my)
  P(13, cx, my - gap / 2); P(14, cx, my + gap / 2)
  P(81, cx - 0.07 * fw, my - gap * 0.4); P(178, cx - 0.07 * fw, my + gap * 0.4)
  P(311, cx + 0.07 * fw, my - gap * 0.4); P(402, cx + 0.07 * fw, my + gap * 0.4)
  P(1, cx, cy + 0.1 * fw); P(10, cx, cy - 0.62 * fw); P(151, cx, cy - 0.42 * fw); P(152, cx, cy + 0.64 * fw)
  P(234, cx - 0.5 * fw, cy); P(454, cx + 0.5 * fw, cy)
  return pts
}

/** Yüz noktalarından alın bölgesi (rPPG ölçüm alanı): 151 (alın) çevresinde, yüz genişliğinin %36'sı × %14'ü. */
export function foreheadRoi(lm: Pt[]): { x: number; y: number; w: number; h: number } {
  const fw = Math.abs(lm[454].x - lm[234].x)
  const c = lm[151]
  return { x: c.x - fw * 0.18, y: c.y - fw * 0.07, w: fw * 0.36, h: fw * 0.14 }
}
