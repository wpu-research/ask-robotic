// Gerçek Hayat Demoları: endüstriyel görüntü işleme demosu görünümünde çizim yardımcıları
// (köşeli kutular, etiketler, bölgeler, iskelet, uyarı bandı, küçük grafikler). Hepsi 640×480 tuval koordinatında.
import type { Pt } from '@/lib/cv-demo-logic'

type C = CanvasRenderingContext2D
export const MONO = '600 13px ui-monospace, "JetBrains Mono", Menlo, Consolas, monospace'
export const COL = { ok: '#22c55e', warn: '#f59e0b', alert: '#ef4444', info: '#38bdf8', ink: '#e2e8f0', panel: 'rgba(8,12,20,.72)', line: 'rgba(56,189,248,.9)' }

/** Köşe parantezli kutu (algılama kutusu) ve üstte etiket. */
export function bracketBox(ctx: C, x0: number, y0: number, x1: number, y1: number, color: string, label?: string) {
  const w = x1 - x0, h = y1 - y0, k = Math.max(8, Math.min(22, Math.min(w, h) * 0.25))
  ctx.save()
  ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.globalAlpha = 0.45; ctx.strokeRect(x0, y0, w, h)
  ctx.globalAlpha = 1; ctx.lineWidth = 3; ctx.lineCap = 'square'
  ctx.beginPath()
  for (const [x, y, dx, dy] of [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]]) { ctx.moveTo(x + dx * k, y); ctx.lineTo(x, y); ctx.lineTo(x, y + dy * k) }
  ctx.stroke()
  ctx.restore()
  if (label) tag(ctx, x0, y0 - 2, label, color, '#0b1220', 'bottom')
}

/** Dolu arka planlı küçük etiket. `anchor`: metin kutusunun y'ye göre yeri. */
export function tag(ctx: C, x: number, y: number, text: string, bg: string, fg = '#0b1220', anchor: 'top' | 'bottom' = 'top', font = MONO) {
  ctx.save(); ctx.font = font
  const w = ctx.measureText(text).width + 10, h = 18
  const yy = anchor === 'bottom' ? y - h : y
  const xx = Math.min(Math.max(0, x), ctx.canvas.width - w)
  ctx.fillStyle = bg; ctx.fillRect(xx, yy, w, h)
  ctx.fillStyle = fg; ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.fillText(text, xx + 5, yy + h / 2 + 1)
  ctx.restore()
}

/** Yarı saydam panel ve satırlar (sol üst bilgi kutusu gibi). */
export function panel(ctx: C, x: number, y: number, lines: Array<[string, string, string?]>, w = 210) {
  ctx.save(); ctx.font = MONO
  const h = 10 + lines.length * 18
  ctx.fillStyle = COL.panel; ctx.fillRect(x, y, w, h)
  ctx.strokeStyle = 'rgba(148,163,184,.35)'; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1)
  ctx.textBaseline = 'middle'
  lines.forEach(([k, v, c], i) => {
    const yy = y + 14 + i * 18
    ctx.fillStyle = '#94a3b8'; ctx.textAlign = 'left'; ctx.fillText(k, x + 8, yy)
    ctx.fillStyle = c ?? COL.ink; ctx.textAlign = 'right'; ctx.fillText(v, x + w - 8, yy)
  })
  ctx.restore()
}

/** Çokgen bölge; köşe tutamaçları ve isteğe bağlı etiket. */
export function zone(ctx: C, pts: Pt[], color: string, fillAlpha = 0.18, label?: string, dashed = false) {
  if (pts.length < 2) return
  ctx.save()
  ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.closePath()
  ctx.globalAlpha = fillAlpha; ctx.fillStyle = color; if (pts.length > 2) ctx.fill()
  ctx.globalAlpha = 1; ctx.strokeStyle = color; ctx.lineWidth = 2; if (dashed) ctx.setLineDash([8, 6]); ctx.stroke(); ctx.setLineDash([])
  ctx.fillStyle = color; for (const p of pts) ctx.fillRect(p.x - 3, p.y - 3, 6, 6)
  ctx.restore()
  if (label) { const top = pts.reduce((a, b) => (b.y < a.y ? b : a)); tag(ctx, top.x, top.y - 4, label, color, '#0b1220', 'bottom') }
}

export const POSE_EDGES: Array<[number, number]> = [[11, 12], [11, 13], [13, 15], [12, 14], [14, 16], [11, 23], [12, 24], [23, 24], [23, 25], [25, 27], [24, 26], [26, 28], [27, 31], [28, 32]]
export const HAND_EDGES: Array<[number, number]> = [[0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8], [5, 9], [9, 10], [10, 11], [11, 12], [9, 13], [13, 14], [14, 15], [15, 16], [13, 17], [17, 18], [18, 19], [19, 20], [0, 17]]

export function skeleton(ctx: C, lm: Pt[], edges: Array<[number, number]>, color = COL.line, r = 3.5, visTh = 0.4) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 2.5
  ctx.beginPath()
  for (const [a, b] of edges) {
    const p = lm[a], q = lm[b]
    if (!p || !q || (p.visibility ?? 1) < visTh || (q.visibility ?? 1) < visTh) continue
    ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y)
  }
  ctx.stroke()
  ctx.fillStyle = '#f8fafc'
  const idx = new Set(edges.flat())
  for (const i of idx) { const p = lm[i]; if (!p || (p.visibility ?? 1) < visTh) continue; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 7); ctx.fill() }
  ctx.restore()
}

/** Üstte uyarı bandı; `blink` açıksa yanıp söner (hareket azaltmada sabit). */
export function banner(ctx: C, text: string, color: string, t: number, blink = true) {
  const W = ctx.canvas.width, on = !blink || Math.floor(t * 3) % 2 === 0
  ctx.save()
  ctx.strokeStyle = color; ctx.lineWidth = on ? 8 : 4; ctx.strokeRect(4, 4, W - 8, ctx.canvas.height - 8)
  ctx.font = '800 20px ui-monospace, Menlo, Consolas, monospace'
  const w = ctx.measureText(text).width + 28
  ctx.fillStyle = color; ctx.globalAlpha = on ? 0.95 : 0.75; ctx.fillRect((W - w) / 2, 40, w, 34)
  ctx.globalAlpha = 1; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, W / 2, 58)
  ctx.restore()
}

/** Küçük çizgi grafik (zaman serisi) ve isteğe bağlı eşik çizgisi. */
export function spark(ctx: C, x: number, y: number, w: number, h: number, vs: number[], lo: number, hi: number, color: string, th?: number, title?: string) {
  ctx.save()
  ctx.fillStyle = COL.panel; ctx.fillRect(x, y, w, h)
  const Y = (v: number) => y + h - 4 - ((Math.min(hi, Math.max(lo, v)) - lo) / (hi - lo || 1)) * (h - 8)
  if (th !== undefined) { ctx.strokeStyle = 'rgba(239,68,68,.8)'; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(x, Y(th)); ctx.lineTo(x + w, Y(th)); ctx.stroke(); ctx.setLineDash([]) }
  ctx.strokeStyle = color; ctx.lineWidth = 1.6; ctx.beginPath()
  vs.forEach((v, i) => { const xx = x + (i / Math.max(1, vs.length - 1)) * w; if (i) ctx.lineTo(xx, Y(v)); else ctx.moveTo(xx, Y(v)) })
  ctx.stroke()
  if (title) { ctx.font = '600 11px ui-monospace, Menlo, monospace'; ctx.fillStyle = '#94a3b8'; ctx.textBaseline = 'top'; ctx.fillText(title, x + 5, y + 3) }
  ctx.restore()
}

/** Artı işareti (ölçüm noktası). */
export function cross(ctx: C, x: number, y: number, color: string, r = 9) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(x - r, y); ctx.lineTo(x + r, y); ctx.moveTo(x, y - r); ctx.lineTo(x, y + r); ctx.stroke()
  ctx.beginPath(); ctx.arc(x, y, r * 0.55, 0, 7); ctx.stroke(); ctx.restore()
}

/** Örnek sahnedeki sentetik kişi: kalın uzuvlar, gövde, baş (Pose noktalarından). */
export function drawPerson(ctx: C, lm: Pt[], color: string, head = color) {
  const torso = Math.hypot((lm[11].x + lm[12].x) / 2 - (lm[23].x + lm[24].x) / 2, (lm[11].y + lm[12].y) / 2 - (lm[23].y + lm[24].y) / 2)
  const w = Math.max(4, torso * 0.26)
  ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
  ctx.lineWidth = w
  ctx.beginPath()
  for (const [a, b] of [[23, 25], [25, 27], [24, 26], [26, 28], [11, 13], [13, 15], [12, 14], [14, 16]] as const) { ctx.moveTo(lm[a].x, lm[a].y); ctx.lineTo(lm[b].x, lm[b].y) }
  ctx.stroke()
  ctx.lineWidth = w * 0.6
  ctx.beginPath(); ctx.moveTo(lm[11].x, lm[11].y); ctx.lineTo(lm[12].x, lm[12].y); ctx.lineTo(lm[24].x, lm[24].y); ctx.lineTo(lm[23].x, lm[23].y); ctx.closePath(); ctx.fill(); ctx.stroke()
  const sm = { x: (lm[11].x + lm[12].x) / 2, y: (lm[11].y + lm[12].y) / 2 }
  ctx.lineWidth = w * 0.7; ctx.beginPath(); ctx.moveTo(sm.x, sm.y); ctx.lineTo(lm[0].x, lm[0].y); ctx.stroke()
  ctx.fillStyle = head; ctx.beginPath(); ctx.arc(lm[0].x, lm[0].y, torso * 0.3, 0, 7); ctx.fill()
  ctx.restore()
}
