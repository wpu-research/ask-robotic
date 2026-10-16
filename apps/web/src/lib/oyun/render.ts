// Motoru 160x120 RGBA piksel arabelleğine çizer (DOM yok): tarayıcıda canvas'a, testlerde doğrudan okunur.
import { PALETTE_RGB } from './palette'
import { CHAR_ADV, drawText, textWidth, wrapText } from './font'
import { SCREEN_H, SCREEN_W, TILE } from './types'
import type { OyunEngine, SpriteState } from './engine'
import { SCREEN_EN, type Locale } from './i18n-en'

export const FRAME_BYTES = SCREEN_W * SCREEN_H * 4

class Canvas {
  constructor(readonly buf: Uint8ClampedArray) {}
  put(x: number, y: number, c: number): void {
    if (x < 0 || y < 0 || x >= SCREEN_W || y >= SCREEN_H) return
    const i = (y * SCREEN_W + x) * 4
    const [r, g, b] = PALETTE_RGB[c]
    this.buf[i] = r; this.buf[i + 1] = g; this.buf[i + 2] = b; this.buf[i + 3] = 255
  }
  rect(x: number, y: number, w: number, h: number, c: number): void {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.put(x + i, y + j, c)
  }
  text(s: string, x: number, y: number, c: number, scale = 1): void {
    drawText(s, 0, 0, (px, py) => { for (let j = 0; j < scale; j++) for (let i = 0; i < scale; i++) this.put(x + px * scale + i, y + py * scale + j, c) })
  }
  /** Okunaklı yazı: gölgeli. */
  label(s: string, x: number, y: number, c = 12, scale = 1): void {
    this.text(s, x + scale, y + scale, 0, scale)
    this.text(s, x, y, c, scale)
  }
}

/** Ekran yazısı (İngilizcede SCREEN_EN karşılığı). */
const scr = (s: string, locale: Locale): string => (locale === 'en' ? SCREEN_EN[s] ?? s : s)

export function renderFrame(e: OyunEngine, out: Uint8ClampedArray = new Uint8ClampedArray(FRAME_BYTES), locale: Locale = 'tr'): Uint8ClampedArray {
  const cv = new Canvas(out)
  const sh = e.shakeOffset()
  const cx = Math.round(e.camera.x) - sh.x, cy = Math.round(e.camera.y) - sh.y

  cv.rect(0, 0, SCREEN_W, SCREEN_H, e.bg)
  drawImageTiled(cv, e, cx, cy)
  drawMap(cv, e, cx, cy)
  const order = [...e.sprites].sort((a, b) => a.z - b.z || a.id - b.id)
  for (const s of order) if (!s.hidden) drawSprite(cv, e, s, cx, cy)
  for (const p of e.particles) cv.rect(Math.round(p.x) - cx, Math.round(p.y) - cy, p.size, p.size, p.color)
  for (const s of order) if (s.speech && !s.hidden) drawBubble(cv, s, cx, cy)
  drawHud(cv, e, locale)
  if (e.toast) drawToast(cv, e.toast.text)
  if (e.state === 'over') drawOver(cv, e, locale)
  else if (e.paused) drawBanner(cv, scr('DURAKLATILDI', locale), 4)
  return out
}

function drawImageTiled(cv: Canvas, e: OyunEngine, cx: number, cy: number): void {
  if (!e.bgTile) return
  const inf = e.info(e.bgTile)
  const x0 = -(((cx % inf.w) + inf.w) % inf.w), y0 = -(((cy % inf.h) + inf.h) % inf.h)
  for (let ty = y0; ty < SCREEN_H; ty += inf.h) for (let tx = x0; tx < SCREEN_W; tx += inf.w) blit(cv, inf.pix, tx, ty, false)
}

function blit(cv: Canvas, pix: { w: number; h: number; d: Int8Array }, x: number, y: number, flip: boolean): void {
  for (let j = 0; j < pix.h; j++) {
    const yy = y + j
    if (yy < 0 || yy >= SCREEN_H) continue
    for (let i = 0; i < pix.w; i++) {
      const v = pix.d[j * pix.w + (flip ? pix.w - 1 - i : i)]
      if (v >= 0) cv.put(x + i, yy, v)
    }
  }
}

function drawMap(cv: Canvas, e: OyunEngine, cx: number, cy: number): void {
  const m = e.map
  if (!m) return
  const c0 = Math.max(0, Math.floor(cx / TILE)), c1 = Math.min(m.cols - 1, Math.floor((cx + SCREEN_W - 1) / TILE))
  const r0 = Math.max(0, Math.floor(cy / TILE)), r1 = Math.min(m.rows - 1, Math.floor((cy + SCREEN_H - 1) / TILE))
  for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
    const id = m.cells[r * m.cols + c]
    if (id) blit(cv, e.info(id).pix, c * TILE - cx, r * TILE - cy, false)
  }
}

function drawSprite(cv: Canvas, e: OyunEngine, s: SpriteState, cx: number, cy: number): void {
  blit(cv, e.info(s.image).pix, Math.round(s.x - s.w / 2) - cx, Math.round(s.y - s.h / 2) - cy, s.flipX)
}

function drawBubble(cv: Canvas, s: SpriteState, cx: number, cy: number): void {
  const lines = wrapText(s.speech!.text.toLocaleUpperCase('tr-TR'), 16)
  const w = Math.max(...lines.map((l) => textWidth(l))) + 6
  const h = lines.length * 8 + 3
  let x = Math.round(s.x) - cx - Math.floor(w / 2)
  x = Math.max(1, Math.min(SCREEN_W - w - 1, x))
  let y = Math.round(s.y - s.h / 2) - cy - h - 3
  if (y < 1) y = 1
  cv.rect(x, y, w, h, 0)
  cv.rect(x + 1, y + 1, w - 2, h - 2, 12)
  lines.forEach((l, i) => cv.text(l, x + 3, y + 3 + i * 8, 0))
  const tx = Math.max(x + 2, Math.min(x + w - 3, Math.round(s.x) - cx))
  cv.put(tx, y + h, 0); cv.put(tx - 1, y + h - 1, 12); cv.put(tx, y + h - 1, 12); cv.put(tx + 1, y + h - 1, 12)
  cv.put(tx, y + h + 1, 0)
}

function drawHud(cv: Canvas, e: OyunEngine, locale: Locale): void {
  if (e.hud.score) cv.label(`${scr('SKOR', locale)} ${e.score}`, 2, 3)
  if (e.hud.time && e.countdownMs !== null) {
    const t = `${Math.ceil(e.countdownMs / 1000)}`
    cv.label(t, Math.floor((SCREEN_W - textWidth(t)) / 2), 3, e.countdownMs < 5000 ? 4 : 12)
  }
  if (e.hud.life) {
    if (e.life <= 5) {
      for (let i = 0; i < e.life; i++) cv.label('♥', SCREEN_W - 2 - (i + 1) * CHAR_ADV, 3, 2)
    } else {
      const t = `♥${e.life}`
      cv.label(t, SCREEN_W - 2 - textWidth(t), 3, 2)
    }
  }
}

function drawToast(cv: Canvas, text: string): void {
  const lines = wrapText(text.toLocaleUpperCase('tr-TR'), 22)
  const w = Math.max(...lines.map((l) => textWidth(l))) + 8
  const h = lines.length * 8 + 4
  const x = Math.floor((SCREEN_W - w) / 2), y = Math.floor((SCREEN_H - h) / 2)
  cv.rect(x - 1, y - 1, w + 2, h + 2, 12)
  cv.rect(x, y, w, h, 0)
  lines.forEach((l, i) => cv.text(l, x + 4, y + 3 + i * 8, 12))
}

function drawBanner(cv: Canvas, text: string, color: number): void {
  const w = textWidth(text) * 2 + 8, x = Math.floor((SCREEN_W - w) / 2)
  cv.rect(x, 46, w, 20, 0)
  cv.rect(x, 46, w, 1, color); cv.rect(x, 65, w, 1, color)
  cv.text(text, x + 4, 52, color, 2)
}

function drawOver(cv: Canvas, e: OyunEngine, locale: Locale): void {
  for (let y = 0; y < SCREEN_H; y++) for (let x = (y & 1); x < SCREEN_W; x += 2) cv.put(x, y, 0)
  const win = e.result === 'win'
  const msg = scr(e.overMessage, locale)
  const w = Math.min(SCREEN_W - 8, textWidth(msg) * 2 + 12), x = Math.floor((SCREEN_W - w) / 2)
  cv.rect(x, 32, w, 54, 0)
  cv.rect(x, 32, w, 1, win ? 4 : 2); cv.rect(x, 85, w, 1, win ? 4 : 2)
  cv.text(msg, Math.floor((SCREEN_W - textWidth(msg) * 2) / 2), 40, win ? 4 : 2, 2)
  if (e.hud.score) { const t = `${scr('SKOR', locale)} ${e.score}`; cv.text(t, Math.floor((SCREEN_W - textWidth(t)) / 2), 60, 12) }
  const hint = scr('A: TEKRAR', locale)
  cv.text(hint, Math.floor((SCREEN_W - textWidth(hint)) / 2), 74, 13)
}

/** Test yardımcısı: kare arabelleğinden bir pikselin palet sırasını bulur (-1: palet dışı). */
export function pixelAt(buf: Uint8ClampedArray, x: number, y: number): number {
  const i = (y * SCREEN_W + x) * 4
  return PALETTE_RGB.findIndex(([r, g, b]) => r === buf[i] && g === buf[i + 1] && b === buf[i + 2])
}
