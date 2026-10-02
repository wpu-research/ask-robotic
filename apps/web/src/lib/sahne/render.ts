// Tuval çizimi (yalnız tarayıcı): kostüm rasterleme, sahne çizici (arka plan, kalem katmanı, sprite'lar, konuşma balonları, değişken ekranları).
import { costumeQuad, quadBox } from './geometry'
import type { RtTarget, SahneEngine } from './engine'
import { toStr } from './engine'
import { STAGE_H, STAGE_W, type Costume, type Shape } from './types'

// ───────── bitmap yükleme ─────────
const imgCache = new Map<string, HTMLImageElement | 'loading'>()
const imgWaiters = new Set<() => void>()
/** Bitmap katmanı yüklendiğinde çağrılacak dinleyici (çizimi yenilemek için). */
export const onBitmapLoaded = (fn: () => void): (() => void) => { imgWaiters.add(fn); return () => { imgWaiters.delete(fn) } }
function bitmapImage(src: string): HTMLImageElement | null {
  const hit = imgCache.get(src)
  if (hit && hit !== 'loading') return hit
  if (hit === 'loading') return null
  imgCache.set(src, 'loading')
  const im = new Image()
  im.onload = () => { imgCache.set(src, im); costumeCache = new WeakMap(); imgWaiters.forEach((f) => f()) }
  im.onerror = () => { imgCache.delete(src) }
  im.src = src
  return null
}

// ───────── şekil çizimi ─────────
export function drawShapes(ctx: CanvasRenderingContext2D, shapes: Shape[]): void {
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  for (const s of shapes) {
    ctx.beginPath()
    if (s.t === 'path') {
      if (s.pts.length < 2) continue
      ctx.moveTo(s.pts[0], s.pts[1])
      if (s.pts.length === 2) ctx.lineTo(s.pts[0] + 0.01, s.pts[1])
      for (let i = 2; i + 1 < s.pts.length; i += 2) ctx.lineTo(s.pts[i], s.pts[i + 1])
      ctx.strokeStyle = s.c
      ctx.lineWidth = s.w
      ctx.stroke()
      continue
    }
    if (s.t === 'rect') {
      const r = Math.min(s.r ?? 0, s.w / 2, s.h / 2)
      if (r > 0 && 'roundRect' in ctx) (ctx as CanvasRenderingContext2D & { roundRect: (x: number, y: number, w: number, h: number, r: number) => void }).roundRect(s.x, s.y, s.w, s.h, r)
      else ctx.rect(s.x, s.y, s.w, s.h)
    } else if (s.t === 'ellipse') {
      ctx.ellipse(s.cx, s.cy, Math.max(0.01, s.rx), Math.max(0.01, s.ry), 0, 0, Math.PI * 2)
    } else {
      for (let i = 0; i + 1 < s.pts.length; i += 2) { if (i === 0) ctx.moveTo(s.pts[0], s.pts[1]); else ctx.lineTo(s.pts[i], s.pts[i + 1]) }
      ctx.closePath()
    }
    if (s.f) { ctx.fillStyle = s.f; ctx.fill() }
    if (s.s && s.sw > 0) { ctx.strokeStyle = s.s; ctx.lineWidth = s.sw; ctx.stroke() }
  }
}

let costumeCache = new WeakMap<Costume, HTMLCanvasElement>()
export const RES = 2

/** Kostümü `RES` kat çözünürlükte bir tuvale çizer (önbellekli: kostüm nesnesi değişince yenilenir). */
export function rasterize(c: Costume): HTMLCanvasElement {
  const hit = costumeCache.get(c)
  if (hit) return hit
  const cv = document.createElement('canvas')
  cv.width = Math.max(1, Math.round(c.w * RES))
  cv.height = Math.max(1, Math.round(c.h * RES))
  const ctx = cv.getContext('2d')!
  ctx.scale(RES, RES)
  let pending = false
  if (c.bitmap) { const im = bitmapImage(c.bitmap); if (im) ctx.drawImage(im, 0, 0, c.w, c.h); else pending = true }
  drawShapes(ctx, c.shapes)
  if (!pending) costumeCache.set(c, cv)
  return cv
}

/** Küçük resim (liste, galeri) tuvali: kostüm kutuya sığdırılır. */
export function paintThumb(cv: HTMLCanvasElement, c: Costume | undefined, bg?: string): void {
  const ctx = cv.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, cv.width, cv.height)
  if (bg) { ctx.fillStyle = bg; ctx.fillRect(0, 0, cv.width, cv.height) }
  if (!c) return
  const k = Math.min(cv.width / c.w, cv.height / c.h)
  const w = c.w * k, h = c.h * k
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(rasterize(c), (cv.width - w) / 2, (cv.height - h) / 2, w, h)
}

// ───────── sahne çizici ─────────
const roundRectPath = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void => {
  ctx.beginPath()
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const lines: string[] = []
  for (const para of text.split('\n')) {
    let cur = ''
    for (const word of para.split(' ')) {
      const t = cur ? `${cur} ${word}` : word
      if (ctx.measureText(t).width <= maxW || !cur) cur = t
      else { lines.push(cur); cur = word }
    }
    lines.push(cur)
  }
  return lines.slice(0, 8)
}

export interface DrawOptions {
  /** Seçili sprite kimliği: ince bir çerçeve çizilir (yalnız düzenleme önizlemesi). */
  highlightId?: string | null
  monitors?: boolean
}

export class SahneRenderer {
  private pen: HTMLCanvasElement
  private penCursor = 0
  private penSource: unknown = null
  readonly scale: number

  constructor(readonly canvas: HTMLCanvasElement, scale = 2) {
    this.scale = scale
    canvas.width = STAGE_W * scale
    canvas.height = STAGE_H * scale
    this.pen = document.createElement('canvas')
    this.pen.width = STAGE_W * scale
    this.pen.height = STAGE_H * scale
  }

  /** Kalem katmanını sıfırlar (yeni oturum). */
  resetPen(): void { this.penCursor = 0; this.penSource = null; this.pen.getContext('2d')?.clearRect(0, 0, this.pen.width, this.pen.height) }

  private px(x: number): number { return (x + STAGE_W / 2) * this.scale }
  private py(y: number): number { return (STAGE_H / 2 - y) * this.scale }

  private applyPen(e: SahneEngine): void {
    if (this.penSource !== e.pen) { this.resetPen(); this.penSource = e.pen }
    const ctx = this.pen.getContext('2d')!
    for (; this.penCursor < e.pen.length; this.penCursor++) {
      const o = e.pen[this.penCursor]
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      if (o.k === 'clear') ctx.clearRect(0, 0, this.pen.width, this.pen.height)
      else if (o.k === 'line') { ctx.strokeStyle = o.c; ctx.lineWidth = o.w * this.scale; ctx.beginPath(); ctx.moveTo(this.px(o.x0), this.py(o.y0)); ctx.lineTo(this.px(o.x1), this.py(o.y1)); ctx.stroke() }
      else if (o.k === 'dot') { ctx.fillStyle = o.c; ctx.beginPath(); ctx.arc(this.px(o.x), this.py(o.y), (o.w * this.scale) / 2, 0, Math.PI * 2); ctx.fill() }
      else this.drawSprite(ctx, o.costume, o.x, o.y, o.dir, o.size, o.rotationStyle, o.effects)
    }
  }

  private drawSprite(ctx: CanvasRenderingContext2D, c: Costume, x: number, y: number, dir: number, size: number, rot: string, fx: { color: number; ghost: number; brightness: number }): void {
    ctx.save()
    ctx.translate(this.px(x), this.py(y))
    if (rot === 'all') ctx.rotate(((dir - 90) * Math.PI) / 180)
    const flip = rot === 'lr' && dir < 0 ? -1 : 1
    const k = (this.scale * size) / 100
    ctx.scale(k * flip, k)
    if (fx.ghost > 0) ctx.globalAlpha = Math.max(0, 1 - fx.ghost / 100)
    const filters: string[] = []
    if (fx.color) filters.push(`hue-rotate(${(fx.color * 1.8) % 360}deg)`)
    if (fx.brightness) filters.push(`brightness(${100 + fx.brightness}%)`)
    if (filters.length && 'filter' in ctx) ctx.filter = filters.join(' ')
    ctx.drawImage(rasterize(c), -c.w / 2, -c.h / 2, c.w, c.h)
    ctx.restore()
  }

  render(e: SahneEngine, o: DrawOptions = {}): void {
    const ctx = this.canvas.getContext('2d')
    if (!ctx) return
    const W = this.canvas.width, H = this.canvas.height
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, W, H)
    const back = e.stage.costumes[e.stage.costume]
    if (back) {
      ctx.save()
      ctx.scale(W / back.w, H / back.h)
      ctx.drawImage(rasterize(back), 0, 0, back.w, back.h)
      ctx.restore()
    }
    this.applyPen(e)
    ctx.drawImage(this.pen, 0, 0)
    for (const t of e.targets) {
      if (!t.visible) continue
      const c = t.costumes[t.costume]
      if (c) this.drawSprite(ctx, c, t.x, t.y, t.dir, t.size, t.rotationStyle, t.effects)
      if (o.highlightId && t.defId === o.highlightId && !t.isClone) this.drawOutline(ctx, e, t)
    }
    for (const t of e.targets) if (t.visible && t.bubble) this.drawBubble(ctx, e, t)
    if (o.monitors !== false) this.drawMonitors(ctx, e)
  }

  private drawOutline(ctx: CanvasRenderingContext2D, e: SahneEngine, t: RtTarget): void {
    const c = t.costumes[t.costume]
    if (!c) return
    const q = costumeQuad(c, t)
    ctx.save()
    ctx.strokeStyle = 'rgba(76,151,255,0.85)'
    ctx.lineWidth = 2
    ctx.setLineDash([6, 4])
    ctx.beginPath()
    q.forEach((p, i) => (i === 0 ? ctx.moveTo(this.px(p[0]), this.py(p[1])) : ctx.lineTo(this.px(p[0]), this.py(p[1]))))
    ctx.closePath()
    ctx.stroke()
    ctx.restore()
    void e
  }

  private drawBubble(ctx: CanvasRenderingContext2D, e: SahneEngine, t: RtTarget): void {
    const b = t.bubble
    const c = t.costumes[t.costume]
    if (!b || !c) return
    const S = this.scale
    ctx.save()
    ctx.font = `bold ${14 * S}px system-ui, "Segoe UI", sans-serif`
    const lines = wrapText(ctx, b.text, 150 * S)
    const lh = 18 * S
    const tw = Math.max(...lines.map((l) => ctx.measureText(l).width))
    const pad = 9 * S
    const bw = tw + pad * 2, bh = lines.length * lh + pad * 1.4
    const q = quadBox(costumeQuad(c, t))
    let x = this.px(q.r) - bw * 0.15
    let y = this.py(q.t) - bh - 12 * S
    x = Math.max(4 * S, Math.min(this.canvas.width - bw - 4 * S, x))
    y = Math.max(4 * S, y)
    ctx.fillStyle = '#fff'
    ctx.strokeStyle = '#8b97ad'
    ctx.lineWidth = 2 * S
    roundRectPath(ctx, x, y, bw, bh, 12 * S)
    ctx.fill(); ctx.stroke()
    if (b.think) {
      ctx.beginPath(); ctx.arc(x + 14 * S, y + bh + 6 * S, 5 * S, 0, 7); ctx.fill(); ctx.stroke()
      ctx.beginPath(); ctx.arc(x + 6 * S, y + bh + 14 * S, 3 * S, 0, 7); ctx.fill(); ctx.stroke()
    } else {
      ctx.beginPath(); ctx.moveTo(x + 10 * S, y + bh - 1); ctx.lineTo(x + 8 * S, y + bh + 12 * S); ctx.lineTo(x + 26 * S, y + bh - 1); ctx.closePath(); ctx.fill()
      ctx.beginPath(); ctx.moveTo(x + 10 * S, y + bh); ctx.lineTo(x + 8 * S, y + bh + 12 * S); ctx.lineTo(x + 26 * S, y + bh); ctx.stroke()
      ctx.fillStyle = '#fff'; ctx.fillRect(x + 12 * S, y + bh - 2 * S, 13 * S, 3 * S)
    }
    ctx.fillStyle = '#2b2d42'
    ctx.textBaseline = 'top'
    lines.forEach((l, i) => ctx.fillText(l, x + pad, y + pad * 0.7 + i * lh))
    ctx.restore()
    void e
  }

  private drawMonitors(ctx: CanvasRenderingContext2D, e: SahneEngine): void {
    const S = this.scale
    let y = 6 * S, ly = 6 * S
    ctx.save()
    ctx.textBaseline = 'middle'
    for (const v of e.project.variables) {
      if (e.varVisible.get(v.id) === false) continue
      if (v.type === '') {
        const label = v.name
        const val = toStr(e.getVar(v.id)).slice(0, 24)
        ctx.font = `bold ${12 * S}px system-ui, "Segoe UI", sans-serif`
        const lw = ctx.measureText(label).width
        const vw = Math.max(26 * S, ctx.measureText(val).width + 14 * S)
        const h = 22 * S
        ctx.fillStyle = '#e6ecf5'; ctx.strokeStyle = '#b8c2d4'; ctx.lineWidth = 1.5 * S
        roundRectPath(ctx, 6 * S, y, lw + vw + 20 * S, h, 5 * S); ctx.fill(); ctx.stroke()
        ctx.fillStyle = '#4c566a'; ctx.fillText(label, 12 * S, y + h / 2)
        ctx.fillStyle = '#f2790f'; roundRectPath(ctx, 12 * S + lw + 6 * S, y + 3 * S, vw, h - 6 * S, 4 * S); ctx.fill()
        ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.fillText(val, 12 * S + lw + 6 * S + vw / 2, y + h / 2); ctx.textAlign = 'left'
        y += h + 4 * S
      } else {
        const items = e.list(v.id)
        ctx.font = `bold ${12 * S}px system-ui, "Segoe UI", sans-serif`
        const shown = items.slice(0, 7)
        const w = 150 * S, rowH = 18 * S, h = 22 * S + Math.max(1, shown.length) * rowH + 18 * S
        const x = this.canvas.width - w - 6 * S
        ctx.fillStyle = '#e6ecf5'; ctx.strokeStyle = '#b8c2d4'; ctx.lineWidth = 1.5 * S
        roundRectPath(ctx, x, ly, w, h, 5 * S); ctx.fill(); ctx.stroke()
        ctx.fillStyle = '#4c566a'; ctx.textAlign = 'center'; ctx.fillText(v.name, x + w / 2, ly + 11 * S); ctx.textAlign = 'left'
        shown.forEach((it, i) => {
          const ry = ly + 22 * S + i * rowH
          ctx.fillStyle = '#ff661a'; roundRectPath(ctx, x + 6 * S, ry + 1 * S, w - 12 * S, rowH - 3 * S, 3 * S); ctx.fill()
          ctx.fillStyle = '#fff'; ctx.font = `${11 * S}px system-ui, sans-serif`
          ctx.fillText(`${i + 1}  ${toStr(it as never).slice(0, 18)}`, x + 10 * S, ry + rowH / 2)
        })
        ctx.fillStyle = '#4c566a'; ctx.font = `${10 * S}px system-ui, sans-serif`
        ctx.fillText(`uzunluk ${items.length}`, x + 8 * S, ly + h - 8 * S)
        ly += h + 4 * S
      }
    }
    ctx.restore()
  }
}
