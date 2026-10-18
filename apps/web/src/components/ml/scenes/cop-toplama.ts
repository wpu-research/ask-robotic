// Ders: çöp toplama sahnesi. Nesneler daire, işaretçiler ok; işaretlenenler yeşil, süpürülenler soluk ve çarpılı.
// Referans sayımı karesinde her nesnenin sayacı rozet olarak görünür; döngü kırmızı kesikli.
import { FONT, alpha, clear, text, type Draw } from '../draw'
import { CYCLE, N, NAMES, ROOTS, type GcFrame } from '@/lib/ml/cop-toplama'

const POS: Array<[number, number]> = [
  [140, 130], [140, 300], [290, 72], [240, 195], [305, 315], [430, 68], [490, 170], [415, 268], [490, 355], [605, 100], [670, 222], [585, 320],
]
const R = 21

export const draw: Draw = (ctx, W, H, f0, p, lang) => {
  const f = f0 as GcFrame
  const tr = lang === 'tr'
  clear(ctx, W, H, p)
  const ok = p.groups[3], bad = p.groups[0]
  const gone = (o: number) => (f.mode === 'ms' ? !!f.swept?.[o] : !!f.dead?.[o])
  text(ctx, f.mode === 'ms' ? (tr ? 'işaretle ve süpür' : 'mark and sweep') : (tr ? 'referans sayımı' : 'reference counting'), 16, 22, p.ink, 14, 'left', 700)
  // kökler kutusu
  const rx = 20, ry = 190, rw = 62, rh = 50
  ctx.fillStyle = p.soft; ctx.strokeStyle = p.brand; ctx.lineWidth = 1.5
  ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(rx, ry, rw, rh, 6); else ctx.rect(rx, ry, rw, rh); ctx.fill(); ctx.stroke()
  text(ctx, tr ? 'kökler' : 'roots', rx + rw / 2, ry + 21, p.brand, 12, 'center', 700)
  text(ctx, tr ? '(yığın)' : '(stack)', rx + rw / 2, ry + 37, p.muted, 10, 'center', 500)
  const arrow = (x0: number, y0: number, x1: number, y1: number, col: string, w: number, bend: number) => {
    const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1
    const ux = dx / L, uy = dy / L
    const sx = x0 + ux * R, sy = y0 + uy * R, ex = x1 - ux * (R + 2), ey = y1 - uy * (R + 2)
    const cx = (sx + ex) / 2 - uy * bend, cy = (sy + ey) / 2 + ux * bend
    ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(cx, cy, ex, ey); ctx.stroke()
    const ax = ex - cx, ay = ey - cy, al = Math.hypot(ax, ay) || 1
    const bx = ax / al, by = ay / al
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex - bx * 9 - by * 4.5, ey - by * 9 + bx * 4.5); ctx.lineTo(ex - bx * 9 + by * 4.5, ey - by * 9 - bx * 4.5); ctx.closePath(); ctx.fill()
  }
  for (const o of ROOTS) arrow(rx + rw - R + 2, ry + rh / 2, POS[o][0], POS[o][1], p.brand, 1.8, 0)
  // işaretçiler
  for (let i = 0; i < N; i++) for (const j of f.g.refs[i]) {
    const [x0, y0] = POS[i], [x1, y1] = POS[j]
    const hot = f.mode === 'ms' && f.marked?.[i] && f.marked?.[j]
    const faded = gone(i)
    const col = faded ? alpha(p.muted, 0.2) : hot ? ok : f.showCycle && CYCLE.includes(i) ? bad : alpha(p.muted, 0.7)
    arrow(x0, y0, x1, y1, col, hot ? 2 : 1.4, 14)
  }
  // nesneler
  for (let o = 0; o < N; o++) {
    const [x, y] = POS[o]
    const g = gone(o)
    ctx.globalAlpha = g ? 0.3 : 1
    const m = f.mode === 'ms' && f.marked?.[o]
    ctx.fillStyle = m ? alpha(ok, 0.28) : p.soft
    ctx.strokeStyle = o === f.cur ? p.ink : m ? ok : f.showCycle && CYCLE.includes(o) ? bad : p.muted
    ctx.lineWidth = o === f.cur ? 3 : 1.6
    if (f.showCycle && CYCLE.includes(o) && o !== f.cur) ctx.setLineDash([4, 3])
    ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.setLineDash([])
    if (ROOTS.includes(o)) { ctx.strokeStyle = p.brand; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(x, y, R + 4, 0, Math.PI * 2); ctx.stroke() }
    text(ctx, `${f.g.kb[o]}`, x, y + 2, p.ink, 11, 'center', 700)
    text(ctx, 'KB', x, y + 13, p.muted, 8, 'center', 500)
    ctx.font = `600 11px ${FONT}`
    const lw = ctx.measureText(NAMES[o][lang]).width + 8
    ctx.fillStyle = alpha(p.bg, 0.88); ctx.fillRect(x - lw / 2, y + R + (ROOTS.includes(o) ? 7 : 3), lw, 16)
    text(ctx, NAMES[o][lang], x, y + R + (ROOTS.includes(o) ? 19 : 15), p.ink, 11, 'center', 600)
    if (g) {
      ctx.strokeStyle = bad; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x - 12, y - 12); ctx.lineTo(x + 12, y + 12); ctx.moveTo(x + 12, y - 12); ctx.lineTo(x - 12, y + 12); ctx.stroke()
    }
    ctx.globalAlpha = 1
    if (f.mode === 'rc' && f.rc && !g) {
      const c = f.rc[o], bx = x + R - 2, by = y - R + 2
      ctx.fillStyle = c === 0 ? bad : f.showCycle && CYCLE.includes(o) ? bad : p.brand
      ctx.beginPath(); ctx.arc(bx, by, 9, 0, Math.PI * 2); ctx.fill()
      text(ctx, String(c), bx, by + 4, p.bg, 11, 'center', 700)
    }
  }
  // alt şerit: bellek ve yığın
  const y0 = H - 30
  const total = f.g.kb.reduce((s, x) => s + x, 0), live = f.live ?? total
  text(ctx, tr ? 'bellek' : 'memory', 16, y0 - 6, p.muted, 11, 'left', 600)
  ctx.fillStyle = p.soft; ctx.fillRect(16, y0, 250, 14)
  ctx.fillStyle = alpha(p.brand, 0.75); ctx.fillRect(16, y0, (250 * live) / total, 14)
  text(ctx, `${live} / ${total} KB`, 274, y0 + 12, p.ink, 11, 'left', 700)
  if (f.stack) {
    const s = f.stack.length ? f.stack.map((o) => NAMES[o][lang]).join(', ') : '—'
    text(ctx, tr ? 'işaret yığını' : 'mark stack', W - 16, y0 - 6, p.muted, 11, 'right', 600)
    text(ctx, s.length > 46 ? '…' + s.slice(-45) : s, W - 16, y0 + 12, p.ink, 11, 'right', 600)
  } else if (f.mode === 'rc') {
    text(ctx, tr ? 'rozet = nesneyi gösteren ok sayısı' : 'badge = arrows pointing at the object', W - 16, y0 + 12, p.muted, 11, 'right', 600)
  }
}
