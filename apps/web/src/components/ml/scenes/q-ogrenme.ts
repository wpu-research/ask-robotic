// Q-öğrenme sahnesi: depo zemini (hücre rengi = en iyi Q puanı, ok = en iyi hamle), robot ve izi; altta oyun başına adım çubukları.
import { alpha, clear, dot, text, type Draw } from '../draw'
import type { QFrame } from '@/lib/ml/q-ogrenme'
import { MOVES } from '@/lib/ml/q-ogrenme'

export const draw: Draw = (ctx, W, H, f0, p, lang) => {
  const f = f0 as QFrame
  const tr = lang === 'tr'
  clear(ctx, W, H, p)
  const L = f.maze, R = L.length, C = L[0].length
  const s = 54, ox = Math.round((W - s * C) / 2), oy = 34
  const cx = (c: number) => ox + c * s + s / 2, cy = (r: number) => oy + r * s + s / 2
  // başlık satırı
  text(ctx, tr ? 'depo zemini · renk: şarja kalan tahmini adım' : 'warehouse floor · colour: estimated steps to charger', ox, 20, p.muted, 11, 'left', 600)
  text(ctx, f.learn ? (tr ? 'öğrenme açık' : 'learning on') : (tr ? 'öğrenme kapalı' : 'learning off'), ox + s * C, 20, f.learn ? p.groups[3] : p.groups[0], 11, 'right', 700)
  // en kötü (en negatif) en iyi puan: renk ölçeği için
  let worst = -1
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
    if (L[r][c] === '#') continue
    const b = (r * C + c) * 4
    worst = Math.min(worst, Math.max(f.Q[b], f.Q[b + 1], f.Q[b + 2], f.Q[b + 3]))
  }
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
    const x = ox + c * s, y = oy + r * s, ch = L[r][c]
    if (ch === '#') {
      ctx.fillStyle = alpha(p.ink, 0.82); ctx.fillRect(x, y, s, s)
      ctx.strokeStyle = alpha(p.bg, 0.25); ctx.lineWidth = 1
      for (let k = 1; k < 3; k++) { ctx.beginPath(); ctx.moveTo(x + 4, y + (k * s) / 3); ctx.lineTo(x + s - 4, y + (k * s) / 3); ctx.stroke() }
      continue
    }
    const b = (r * C + c) * 4
    const q = [f.Q[b], f.Q[b + 1], f.Q[b + 2], f.Q[b + 3]]
    const v = Math.max(...q)
    ctx.fillStyle = p.bg; ctx.fillRect(x, y, s, s)
    if (ch === 'G') { ctx.fillStyle = alpha(p.groups[3], 0.35); ctx.fillRect(x, y, s, s) }
    else if (v < 0) {
      const t = 1 - (-v - 1) / Math.max(1, -worst)
      ctx.fillStyle = alpha(p.brand, 0.08 + 0.5 * t); ctx.fillRect(x, y, s, s)
    }
    ctx.strokeStyle = p.line; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, s - 1, s - 1)
    if (v < 0 && ch !== 'G') {
      const a = q.indexOf(v), [dr, dc] = MOVES[a]
      const x1 = x + s / 2 - dc * s * 0.16, y1 = y + s / 2 - dr * s * 0.16, x2 = x + s / 2 + dc * s * 0.2, y2 = y + s / 2 + dr * s * 0.2
      ctx.strokeStyle = p.ink; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
      const ang = Math.atan2(dr, dc)
      ctx.fillStyle = p.ink; ctx.beginPath(); ctx.moveTo(x2 + Math.cos(ang) * 4, y2 + Math.sin(ang) * 4)
      ctx.lineTo(x2 + Math.cos(ang + 2.4) * 6, y2 + Math.sin(ang + 2.4) * 6); ctx.lineTo(x2 + Math.cos(ang - 2.4) * 6, y2 + Math.sin(ang - 2.4) * 6); ctx.fill()
      text(ctx, String(-v), x + s - 4, y + 12, p.muted, 9, 'right', 600)
    }
    if (ch === 'S') text(ctx, tr ? 'başla' : 'start', x + s / 2, y + s - 5, p.ink, 10, 'center', 700)
    if (ch === 'G') text(ctx, tr ? 'şarj' : 'charger', x + s / 2, y + s - 5, p.ink, 10, 'center', 700)
  }
  ctx.strokeStyle = p.muted; ctx.lineWidth = 1.2; ctx.strokeRect(ox, oy, s * C, s * R)
  // iz
  const poly = (cells: number[], col: string, w: number) => {
    if (cells.length < 2) return
    ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineJoin = 'round'; ctx.beginPath()
    cells.forEach((k, i) => { const X = cx(k % C), Y = cy(Math.floor(k / C)); if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y) })
    ctx.stroke()
  }
  if (f.path.length > 1) poly(f.path, alpha(p.groups[1], 0.35), 3)
  if (f.greedy) poly(f.greedy, p.groups[3], 4)
  // çarpılan raf
  if (f.bump) {
    const [br, bc] = f.bump
    const X = Math.max(ox - 8, Math.min(ox + s * C + 8, cx(bc))), Y = Math.max(oy - 8, Math.min(oy + s * R + 8, cy(br)))
    const mx = (X + cx(f.pos[1])) / 2, my = (Y + cy(f.pos[0])) / 2
    ctx.strokeStyle = p.groups[0]; ctx.lineWidth = 2.5
    ctx.beginPath(); ctx.moveTo(mx - 6, my - 6); ctx.lineTo(mx + 6, my + 6); ctx.moveTo(mx + 6, my - 6); ctx.lineTo(mx - 6, my + 6); ctx.stroke()
  }
  // robot
  const RX = cx(f.pos[1]), RY = cy(f.pos[0])
  dot(ctx, RX, RY, 13, p.bg)
  ctx.fillStyle = p.groups[5]; ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(RX - 11, RY - 11, 22, 22, 5); else ctx.rect(RX - 11, RY - 11, 22, 22); ctx.fill()
  ctx.strokeStyle = p.ink; ctx.lineWidth = 1.5; ctx.stroke()
  dot(ctx, RX - 4.5, RY - 2, 2.2, p.bg); dot(ctx, RX + 4.5, RY - 2, 2.2, p.bg)

  // alt şerit: oyun başına adım
  const by0 = oy + s * R + 30, by1 = H - 14, bx0 = ox, bx1 = ox + s * C
  text(ctx, tr ? 'oyun başına adım' : 'steps per game', bx0, by0 - 12, p.muted, 11, 'left', 600)
  const hist = f.hist
  const n = Math.max(hist.length, 40)
  const mx = Math.min(120, Math.max(40, ...hist.map((v) => (v < 0 ? 0 : v))))
  const bh = by1 - by0
  const Y = (v: number) => by1 - (Math.min(v, mx) / mx) * bh
  ctx.strokeStyle = p.line; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(bx0, by1 + 0.5); ctx.lineTo(bx1, by1 + 0.5); ctx.stroke()
  const bw = (bx1 - bx0) / n
  hist.forEach((v, i) => {
    const stuck = v < 0
    ctx.fillStyle = stuck ? p.groups[0] : v === f.shortest ? p.groups[3] : alpha(p.muted, 0.55)
    const top = stuck ? by0 : Y(v)
    ctx.fillRect(bx0 + i * bw + 0.5, top, Math.max(1, bw - 1.5), by1 - top)
  })
  if (f.shortest > 0) {
    ctx.strokeStyle = p.groups[3]; ctx.setLineDash([4, 3]); ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(bx0, Y(f.shortest)); ctx.lineTo(bx1, Y(f.shortest)); ctx.stroke(); ctx.setLineDash([])
    text(ctx, tr ? `en kısa ${f.shortest}` : `shortest ${f.shortest}`, bx1, Y(f.shortest) - 4, p.groups[3], 10, 'right', 600)
  }
  text(ctx, String(mx) + (hist.some((v) => v > mx) ? '+' : ''), bx0 - 6, by0 + 8, p.muted, 9, 'right', 400)
  hist.forEach((v, i) => { if (v > mx) { ctx.fillStyle = p.ink; ctx.beginPath(); const X = bx0 + i * bw + bw / 2; ctx.moveTo(X, by0 - 5); ctx.lineTo(X - 3, by0); ctx.lineTo(X + 3, by0); ctx.fill() } })
  text(ctx, '0', bx0 - 6, by1, p.muted, 9, 'right', 400)
  if (hist.length) text(ctx, tr ? `${hist.length} oyun` : `${hist.length} games`, bx1, by0 - 12, p.muted, 10, 'right', 500)
}
