// OpenCV dersi: kendi ürettiğimiz örnek görüntüler (saf TypeScript, DOM yok, tohumlu ve deterministik). Fotoğraf lisansı
// sorunu yok; testler de aynı görüntülerle çalışır. Her sahne bir konuyu sınamak için kurgulandı (eşik için düzensiz ışık,
// morfoloji için gürültülü lekeler, perspektif için eğik belge…). Boyutlar küçük tutuldu: tarayıcıda her kaydırıcıda yeniden hesap.
import { rgba, type Rgba } from './ops'
import type { P } from './contours'

export type SampleId = 'shapes' | 'lowlight' | 'page' | 'document' | 'blocks' | 'face' | 'coins' | 'fruit'
export const SAMPLE_IDS: SampleId[] = ['shapes', 'lowlight', 'page', 'document', 'blocks', 'face', 'coins', 'fruit']
export const SAMPLE_TEXT: Record<SampleId, { tr: string; en: string }> = {
  shapes: { tr: 'Renkli şekiller', en: 'Coloured shapes' },
  lowlight: { tr: 'Loş sahne', en: 'Dim scene' },
  page: { tr: 'Düzensiz ışıkta sayfa', en: 'Page under uneven light' },
  document: { tr: 'Masada eğik belge', en: 'Tilted document on a desk' },
  blocks: { tr: 'Bloklar ve köşeler', en: 'Blocks and corners' },
  face: { tr: 'Çizgi yüz', en: 'Cartoon face' },
  coins: { tr: 'Gürültülü pullar', en: 'Noisy tokens' },
  fruit: { tr: 'Meyve tabağı', en: 'Fruit plate' },
}

export type RGB = [number, number, number]
/** Tohumlu rastgele sayı (LCG): aynı tohum aynı görüntüyü verir. */
export function rng(seed: number): () => number {
  let s = seed >>> 0
  return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 2 ** 32)
}

// ---------------------------------------------------------------- küçük çizim yardımcıları (kenar yumuşatmasız, tam sayı)
export function fill(img: Rgba, c: RGB) { for (let i = 0; i < img.data.length; i += 4) { img.data[i] = c[0]; img.data[i + 1] = c[1]; img.data[i + 2] = c[2]; img.data[i + 3] = 255 } }
export function px(img: Rgba, x: number, y: number, c: RGB) {
  if (x < 0 || y < 0 || x >= img.w || y >= img.h) return
  const i = (y * img.w + x) * 4
  img.data[i] = c[0]; img.data[i + 1] = c[1]; img.data[i + 2] = c[2]; img.data[i + 3] = 255
}
export function rect(img: Rgba, x0: number, y0: number, w: number, h: number, c: RGB) {
  for (let y = Math.max(0, y0); y < Math.min(img.h, y0 + h); y++) for (let x = Math.max(0, x0); x < Math.min(img.w, x0 + w); x++) px(img, x, y, c)
}
export function ellipse(img: Rgba, cx: number, cy: number, rx: number, ry: number, c: RGB) {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
    if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1) px(img, x, y, c)
  }
}
/** Çokgen doldurma (çift-tek kuralı, piksel merkezleri). */
export function poly(img: Rgba, pts: P[], c: RGB) {
  const ys = pts.map((p) => p.y), y0 = Math.max(0, Math.floor(Math.min(...ys))), y1 = Math.min(img.h - 1, Math.ceil(Math.max(...ys)))
  for (let y = y0; y <= y1; y++) {
    const yc = y + 0.5, xs: number[] = []
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length]
      if ((a.y <= yc && b.y > yc) || (b.y <= yc && a.y > yc)) xs.push(a.x + ((yc - a.y) / (b.y - a.y)) * (b.x - a.x))
    }
    xs.sort((p, q) => p - q)
    for (let k = 0; k + 1 < xs.length; k += 2) for (let x = Math.ceil(xs[k] - 0.5); x <= Math.floor(xs[k + 1] - 0.5); x++) px(img, x, y, c)
  }
}
export const regular = (cx: number, cy: number, r: number, n: number, rot = -Math.PI / 2): P[] =>
  Array.from({ length: n }, (_, i) => ({ x: cx + r * Math.cos(rot + (2 * Math.PI * i) / n), y: cy + r * Math.sin(rot + (2 * Math.PI * i) / n) }))
export function line(img: Rgba, a: P, b: P, c: RGB, t = 1) {
  const n = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y)) + 1
  for (let i = 0; i <= n; i++) {
    const x = a.x + ((b.x - a.x) * i) / n, y = a.y + ((b.y - a.y) * i) / n
    rect(img, Math.round(x - t / 2), Math.round(y - t / 2), t, t, c)
  }
}
/** Her pikseli (x, y, eski renk) → yeni renk ile değiştirir (ışık, gürültü). */
export function shade(img: Rgba, f: (x: number, y: number, c: RGB) => RGB) {
  for (let y = 0; y < img.h; y++) for (let x = 0; x < img.w; x++) {
    const i = (y * img.w + x) * 4, o = f(x, y, [img.data[i], img.data[i + 1], img.data[i + 2]])
    img.data[i] = o[0]; img.data[i + 1] = o[1]; img.data[i + 2] = o[2]
  }
}
const mix = (a: RGB, k: number): RGB => [a[0] * k, a[1] * k, a[2] * k]

// ---------------------------------------------------------------- sahneler (RGB sırasında renk verilir, tuval gibi)
/** Açık zeminde altı şekil: üçgen, kare, dikdörtgen, beşgen, altıgen, daire. Konturlar ve renk dersi için. */
export function shapesScene(w = 320, h = 240): Rgba {
  const img = rgba(w, h); fill(img, [236, 232, 222])
  const s = w / 320
  poly(img, regular(55 * s, 70 * s, 38 * s, 3), [220, 50, 47])
  rect(img, Math.round(118 * s), Math.round(35 * s), Math.round(66 * s), Math.round(66 * s), [38, 139, 210])
  rect(img, Math.round(215 * s), Math.round(45 * s), Math.round(90 * s), Math.round(48 * s), [133, 153, 0])
  poly(img, regular(60 * s, 175 * s, 40 * s, 5), [181, 137, 0])
  poly(img, regular(160 * s, 175 * s, 40 * s, 6, 0), [108, 113, 196])
  ellipse(img, 260 * s, 172 * s, 40 * s, 40 * s, [211, 54, 130])
  return img
}
/** Loş, düşük karşıtlıklı sahne: histogram 30–90 arasına sıkışmış. Nokta işlemleri ve eşitleme için. */
export function lowlightScene(w = 320, h = 240): Rgba {
  const img = shapesScene(w, h)
  const r = rng(7)
  shade(img, (x, y, c) => mix(c, 0.22 + 0.1 * (x / w)).map((v) => v + 18 + r() * 4) as RGB)
  return img
}
/** Satır satır "yazı" (koyu çizgi öbekleri) ve soldan sağa kararan ışık. Sabit eşik bir yanı kaybeder, uyarlamalı kazanır. */
export function pageScene(w = 320, h = 240): Rgba {
  const img = rgba(w, h); fill(img, [245, 242, 235])
  const r = rng(3)
  for (let row = 0; row < 9; row++) {
    const y = 22 + row * 23
    let x = 18
    while (x < w - 30) {
      const len = 8 + Math.floor(r() * 30)
      if (x + len > w - 18) break
      rect(img, x, y, len, 9, [40, 40, 48])
      // harf boşlukları: kelime içinde dikey açıklıklar
      for (let k = x + 3; k < x + len - 2; k += 5 + Math.floor(r() * 3)) rect(img, k, y + 2, 1, 6, [245, 242, 235])
      x += len + 6 + Math.floor(r() * 6)
    }
  }
  shade(img, (x, y, c) => mix(c, 1.0 - 0.72 * (x / w) ** 1.4 - 0.1 * (y / h)))
  return img
}
/** Ahşap masada perspektifle eğik duran belge. Köşeler `DOC_CORNERS` (320×240 için). */
export const DOC_CORNERS: P[] = [{ x: 78, y: 38 }, { x: 252, y: 58 }, { x: 274, y: 212 }, { x: 46, y: 196 }]
export function documentScene(w = 320, h = 240): Rgba {
  const img = rgba(w, h), r = rng(11)
  fill(img, [120, 78, 46])
  shade(img, (x, y) => { const g = 18 * Math.sin(y * 0.21 + Math.sin(x * 0.03) * 2) + r() * 8; return [120 + g, 78 + g * 0.7, 46 + g * 0.4] })
  const s = w / 320, q = DOC_CORNERS.map((p) => ({ x: p.x * s, y: p.y * (h / 240) }))
  poly(img, q, [246, 244, 238])
  // belgenin içine satırlar: köşeler arasında doğrusal ara değerleme (yaklaşık, düzlemsel görünüm yeter)
  const lerp = (a: P, b: P, t: number): P => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t })
  for (let i = 0; i < 9; i++) {
    const t = 0.14 + i * 0.085
    const a = lerp(q[0], q[3], t), b = lerp(q[1], q[2], t)
    line(img, lerp(a, b, 0.1), lerp(a, b, i === 0 ? 0.6 : 0.9 - (i % 3) * 0.12), i === 0 ? [30, 30, 90] : [60, 60, 70], i === 0 ? 3 : 2)
  }
  return img
}
/** Bloklar: dama tahtası, dikdörtgenler ve bir yıldız: bol köşe ve kenar. Kenar ve öznitelik dersi için. */
export function blocksScene(w = 320, h = 240): Rgba {
  const img = rgba(w, h); fill(img, [200, 205, 210])
  // zemin dokusu: tohumlu, üst üste binen küçük şekiller; köşeler birbirine benzemesin (betimleyici ayırt edebilsin)
  const r = rng(29)
  for (let k = 0; k < 70; k++) {
    const c: RGB = [60 + r() * 180, 60 + r() * 180, 60 + r() * 180], x = r() * w, y = r() * h, s = 5 + r() * 16
    if (k % 2) rect(img, Math.round(x), Math.round(y), Math.round(s), Math.round(s * (0.5 + r())), c); else ellipse(img, x, y, s * 0.6, s * 0.4 + 2, c)
  }
  for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) if ((x + y) % 2 === 0) rect(img, 20 + x * 22, 24 + y * 22, 22, 22, [30, 30, 30])
  rect(img, 140, 30, 70, 46, [40, 90, 160]); rect(img, 160, 50, 30, 60, [230, 180, 40])
  rect(img, 230, 28, 64, 64, [60, 60, 60]); rect(img, 246, 44, 32, 32, [240, 240, 240])
  const star: P[] = []
  for (let i = 0; i < 10; i++) { const rr = i % 2 ? 18 : 42, a = -Math.PI / 2 + (i * Math.PI) / 5; star.push({ x: 80 + rr * Math.cos(a), y: 175 + rr * Math.sin(a) }) }
  poly(img, star, [190, 40, 40])
  poly(img, [{ x: 150, y: 140 }, { x: 225, y: 128 }, { x: 240, y: 210 }, { x: 160, y: 220 }], [90, 140, 70])
  ellipse(img, 278, 175, 26, 34, [120, 60, 150])
  return img
}
/** Çizgi yüz: Haar öznitelikleri gibi koyu gözler, açık burun köprüsü, koyu ağız. `FACE_BOX` yüzün kutusu (320×240). */
export const FACE_BOX = { x: 112, y: 52, w: 96, h: 120 }
export function faceScene(w = 320, h = 240, at: { x: number; y: number; s: number } = { x: 160, y: 112, s: 1 }): Rgba {
  const img = rgba(w, h); fill(img, [176, 196, 214])
  const r = rng(5)
  shade(img, (x, y, c) => c.map((v) => v - 20 * (y / h) + r() * 10) as RGB)
  drawFace(img, at.x, at.y, at.s)
  return img
}
export function drawFace(img: Rgba, cx: number, cy: number, s: number) {
  ellipse(img, cx, cy, 48 * s, 60 * s, [232, 190, 160])
  ellipse(img, cx, cy - 52 * s, 50 * s, 18 * s, [70, 50, 35])
  ellipse(img, cx - 20 * s, cy - 12 * s, 11 * s, 6 * s, [40, 30, 30]); ellipse(img, cx + 20 * s, cy - 12 * s, 11 * s, 6 * s, [40, 30, 30])
  rect(img, Math.round(cx - 34 * s), Math.round(cy - 24 * s), Math.round(26 * s), Math.round(3 * s), [90, 60, 40])
  rect(img, Math.round(cx + 8 * s), Math.round(cy - 24 * s), Math.round(26 * s), Math.round(3 * s), [90, 60, 40])
  rect(img, Math.round(cx - 3 * s), Math.round(cy - 10 * s), Math.round(6 * s), Math.round(22 * s), [246, 210, 182])
  ellipse(img, cx, cy + 28 * s, 18 * s, 6 * s, [150, 50, 60])
}
/** Siyah zeminde beyaz pullar: bazıları birbirine değiyor, tuz-biber gürültüsü ve pul içinde delikler var. Morfoloji için. */
export function coinsScene(w = 320, h = 240): Rgba {
  const img = rgba(w, h); fill(img, [24, 24, 28])
  const r = rng(19)
  const pos: Array<[number, number, number]> = [[60, 60, 26], [108, 66, 24], [190, 60, 30], [270, 70, 22], [70, 170, 30], [150, 160, 22], [176, 182, 20], [255, 170, 32]]
  for (const [x, y, rr] of pos) ellipse(img, x, y, rr, rr, [235, 235, 225])
  // pul içi delikler (kapama doldurur) ve ince köprü (açma koparır)
  for (let k = 0; k < 25; k++) { const [x, y, rr] = pos[k % pos.length]; const a = r() * 6.28, d = r() * rr * 0.7; ellipse(img, x + d * Math.cos(a), y + d * Math.sin(a), 1.5, 1.5, [24, 24, 28]) }
  rect(img, 212, 66, 50, 2, [235, 235, 225])
  shade(img, (_x, _y, c) => { const u = r(); return u < 0.02 ? [255, 255, 255] : u < 0.04 ? [0, 0, 0] : c })
  return img
}
/** Meyve tabağı: kırmızı, turuncu, sarı, yeşil meyveler ve gölge. HSV renk aralığı için (ton ışıkla az değişir). */
export function fruitScene(w = 320, h = 240): Rgba {
  const img = rgba(w, h); fill(img, [228, 224, 214])
  ellipse(img, 160, 130, 140, 92, [250, 250, 248])
  const items: Array<[number, number, number, RGB]> = [[90, 110, 30, [205, 30, 35]], [150, 95, 28, [240, 140, 20]], [212, 110, 30, [235, 215, 40]], [115, 168, 28, [80, 170, 50]], [190, 170, 32, [190, 25, 40]], [245, 158, 22, [60, 140, 40]]]
  for (const [x, y, rr, c] of items) { ellipse(img, x + 6, y + 8, rr, rr * 0.9, [205, 205, 200]); ellipse(img, x, y, rr, rr, c); ellipse(img, x - rr * 0.35, y - rr * 0.35, rr * 0.22, rr * 0.18, c.map((v) => Math.min(255, v + 60)) as RGB) }
  // sağ yarıda gölge: BGR değerleri düşer, ton aynı kalır
  shade(img, (x, _y, c) => (x > 180 ? mix(c, 0.62) : c))
  return img
}

export function sample(id: SampleId, w = 320, h = 240): Rgba {
  switch (id) {
    case 'shapes': return shapesScene(w, h)
    case 'lowlight': return lowlightScene(w, h)
    case 'page': return pageScene(w, h)
    case 'document': return documentScene(w, h)
    case 'blocks': return blocksScene(w, h)
    case 'face': return faceScene(w, h)
    case 'coins': return coinsScene(w, h)
    case 'fruit': return fruitScene(w, h)
  }
}

// ---------------------------------------------------------------- hareketli sahneler
/** Renk takibi: masada dolaşan turuncu top (Lissajous yolu) ve mavi bir kutu; `light` sahne ışığı (0,4–1,2). */
export function ballFrame(t: number, light = 1, w = 320, h = 240): { img: Rgba; ball: P } {
  const img = rgba(w, h); fill(img, [70, 110, 80])
  shade(img, (x, y) => { const g = 10 * Math.sin(x * 0.05) * Math.cos(y * 0.07); return [70 + g, 110 + g, 80 + g] })
  rect(img, 30, 150, 60, 50, [40, 80, 200])
  const ball = { x: w / 2 + (w * 0.36) * Math.sin(t * 0.9), y: h / 2 + (h * 0.32) * Math.sin(t * 1.7 + 0.6) }
  ellipse(img, ball.x, ball.y, 16, 16, [250, 120, 20])
  ellipse(img, ball.x - 5, ball.y - 5, 4, 4, [255, 190, 110])
  shade(img, (_x, _y, c) => mix(c, light))
  return { img, ball }
}
export interface Car { x: number; lane: number; len: number; color: RGB; speed: number }
/** Yukarıdan yol: iki şeritte soldan sağa (üst şerit) ve sağdan sola (alt şerit) giden araçlar. Arka plan çıkarma için. */
export function trafficCars(t: number, w = 320): Car[] {
  const out: Car[] = []
  const spec: Array<[number, number, number, RGB, number]> = [[0, 0, 44, [230, 90, 70], 70], [1.7, 0, 52, [240, 240, 240], 70], [3.9, 0, 40, [70, 130, 230], 70], [0.6, 1, 46, [230, 190, 30], 55], [2.8, 1, 60, [40, 40, 40], 55], [4.6, 1, 42, [60, 160, 80], 55]]
  for (const [ph, lane, len, color, sp] of spec) {
    // konum: sabit hızla ilerler, yolun sonunda baştan girer (ekran dışında 60 px pay)
    const d = (((t * sp + ph * 70) % (w + 120)) + (w + 120)) % (w + 120) - 60
    out.push({ x: lane === 0 ? d : w - d, lane, len, color, speed: sp })
  }
  return out
}
const roadCache = new Map<string, Uint8ClampedArray>()
export function trafficFrame(t: number, w = 320, h = 240, noise = 6, seed = 1): Rgba {
  // sabit yol bir kez çizilir, her karede kopyalanır (kare başına maliyet düşük kalsın)
  let base = roadCache.get(`${w}x${h}`)
  if (!base) {
    const r0 = rgba(w, h); fill(r0, [96, 140, 70])
    rect(r0, 0, 60, w, 120, [86, 86, 90])
    for (let x = 0; x < w; x += 30) rect(r0, x, 118, 16, 4, [230, 230, 230])
    base = r0.data; roadCache.set(`${w}x${h}`, base)
  }
  const img: Rgba = { w, h, data: new Uint8ClampedArray(base) }
  for (const c of trafficCars(t, w)) {
    const y = c.lane === 0 ? 78 : 136
    rect(img, Math.round(c.x - c.len / 2), y, c.len, 26, c.color)
    rect(img, Math.round(c.x - c.len / 2 + (c.lane === 0 ? c.len * 0.55 : 6)), y + 4, Math.round(c.len * 0.25), 18, [50, 60, 80])
  }
  if (noise > 0) {
    const r = rng(seed + Math.floor(t * 30)), d = img.data
    for (let i = 0; i < d.length; i += 4) { d[i] += (r() - 0.5) * 2 * noise; d[i + 1] += (r() - 0.5) * 2 * noise; d[i + 2] += (r() - 0.5) * 2 * noise }
  }
  return img
}
