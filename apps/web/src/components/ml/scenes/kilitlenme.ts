// Ders: kilitlenme sahnesi. Üstte iki iş parçacığının zaman çizgileri (kilitle, bırak, oku, yaz; bekleme kırmızı taralı);
// ortada kilit sahipliği (düz ok) ve bekleme (kesikli ok) grafiği, döngü kırmızı; altta sayaç ve okunan değerler.
import { alpha, clear, text, type Draw } from '../draw'
import { THREADS, type LockFrame, type Op, type Th } from '@/lib/ml/kilitlenme'

const LX = 132, LANE_Y: Record<Th, number> = { M: 50, S: 104 }, LH = 30

export const draw: Draw = (ctx, W, H, f0, p, lang) => {
  const f = f0 as LockFrame
  const tr = lang === 'tr'
  clear(ctx, W, H, p)
  const red = p.groups[0]
  const colOf = (op: Op) => (op.k === 'lock' ? p.groups[1] : op.k === 'unlock' ? p.groups[4] : op.k === 'read' ? p.groups[2] : p.groups[3])
  const abbr = (op: Op) => (op.k === 'lock' ? `+${op.l}` : op.k === 'unlock' ? `−${op.l}` : op.k === 'read' ? (tr ? 'O' : 'R') : (tr ? 'Y' : 'W'))
  const names: Record<Th, [string, string]> = { M: [tr ? 'motor sürücü' : 'motor driver', '(M)'], S: [tr ? 'sensör okuyucu' : 'sensor reader', '(S)'] }
  // şeritler
  const tw = (W - 16 - LX) / f.ticks
  for (const t of THREADS) {
    const y = LANE_Y[t]
    text(ctx, names[t][0], 16, y + 13, p.ink, 11, 'left', 700)
    text(ctx, names[t][1], 16, y + 27, p.muted, 10, 'left', 500)
    ctx.fillStyle = p.soft; ctx.fillRect(LX, y, W - 16 - LX, LH)
  }
  for (let i = 0; i < f.upto; i++) {
    const e = f.hist[i]
    const x = LX + e.tick * tw + 1, y = LANE_Y[e.th], w = Math.max(2, tw - 2)
    if (e.blocked) {
      ctx.save(); ctx.beginPath(); ctx.rect(x, y + 2, w, LH - 4); ctx.clip()
      ctx.strokeStyle = alpha(red, 0.7); ctx.lineWidth = 1.2
      for (let k = -LH; k < w + LH; k += 5) { ctx.beginPath(); ctx.moveTo(x + k, y + LH); ctx.lineTo(x + k + LH, y); ctx.stroke() }
      ctx.restore()
      continue
    }
    ctx.fillStyle = colOf(e.op); ctx.fillRect(x, y + 2, w, LH - 4)
    if (tw >= 18) text(ctx, abbr(e.op), x + w / 2, y + 19, p.bg, tw >= 22 ? 11 : 9, 'center', 700)
  }
  text(ctx, tr ? 'zaman (tık) →' : 'time (ticks) →', W - 16, LANE_Y.S + LH + 16, p.muted, 10, 'right', 500)
  // açıklama
  const leg: Array<[string, string]> = [[tr ? '+A kilitle' : '+A lock', p.groups[1]], [tr ? '−A bırak' : '−A unlock', p.groups[4]], [tr ? 'O oku' : 'R read', p.groups[2]], [tr ? 'Y yaz' : 'W write', p.groups[3]], [tr ? 'bekliyor' : 'waiting', alpha(red, 0.7)]]
  let lx = LX
  for (const [s, c] of leg) { ctx.fillStyle = c; ctx.fillRect(lx, 18, 11, 11); text(ctx, s, lx + 15, 28, p.muted, 10, 'left', 500); lx += s.length * 6.2 + 34 }
  // kilit grafiği
  const NODE: Record<Th, [number, number]> = { M: [170, 270], S: [550, 270] }
  const LOCK = { A: [360, 200] as [number, number], B: [360, 340] as [number, number] }
  const arrow = (x0: number, y0: number, x1: number, y1: number, c: string, dash: boolean, label: string) => {
    ctx.strokeStyle = c; ctx.lineWidth = 2.2; ctx.setLineDash(dash ? [6, 4] : [])
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.setLineDash([])
    const a = Math.atan2(y1 - y0, x1 - x0)
    ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - 11 * Math.cos(a - 0.4), y1 - 11 * Math.sin(a - 0.4)); ctx.lineTo(x1 - 11 * Math.cos(a + 0.4), y1 - 11 * Math.sin(a + 0.4)); ctx.closePath(); ctx.fill()
    const mx = (x0 + x1) / 2, my = (y0 + y1) / 2
    text(ctx, label, mx, my + (y1 > y0 ? -8 : 16), c, 10, 'center', 600)
  }
  const edge = (from: [number, number], to: [number, number], rFrom: number, rTo: number) => {
    const dx = to[0] - from[0], dy = to[1] - from[1], L = Math.hypot(dx, dy)
    return [from[0] + (dx / L) * rFrom, from[1] + (dy / L) * rFrom, to[0] - (dx / L) * rTo, to[1] - (dy / L) * rTo] as const
  }
  for (const l of ['A', 'B'] as const) {
    const o = f.owner[l]
    if (o) { const [a, b, c, d] = edge(LOCK[l], NODE[o], 26, 62); arrow(a, b, c, d, f.cycle ? red : p.brand, false, tr ? 'tutuyor' : 'held by') }
  }
  for (const t of THREADS) {
    const l = f.wait[t]
    if (l) { const [a, b, c, d] = edge(NODE[t], LOCK[l], 62, 28); arrow(a, b, c, d, red, true, tr ? 'bekliyor' : 'waits for') }
  }
  for (const t of THREADS) {
    const [x, y] = NODE[t]
    const waiting = !!f.wait[t]
    ctx.fillStyle = waiting ? alpha(red, 0.12) : p.soft; ctx.strokeStyle = waiting ? red : p.ink; ctx.lineWidth = 1.6
    ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x - 60, y - 22, 120, 44, 8); else ctx.rect(x - 60, y - 22, 120, 44); ctx.fill(); ctx.stroke()
    text(ctx, names[t][0], x, y - 2, p.ink, 12, 'center', 700)
    text(ctx, waiting ? (tr ? 'bekliyor' : 'waiting') : f.done ? (tr ? 'bitti' : 'done') : names[t][1], x, y + 14, waiting ? red : p.muted, 10, 'center', 600)
  }
  const lockLabel = { A: tr ? 'A: motor veri yolu' : 'A: motor bus', B: tr ? 'B: sensör tamponu' : 'B: sensor buffer' }
  for (const l of ['A', 'B'] as const) {
    const [x, y] = LOCK[l]
    const held = !!f.owner[l]
    ctx.fillStyle = held ? alpha(p.groups[1], 0.2) : p.bg; ctx.strokeStyle = held ? p.groups[1] : p.muted; ctx.lineWidth = 2
    ctx.beginPath(); ctx.arc(x, y, 24, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
    text(ctx, l, x, y + 7, p.ink, 18, 'center', 700)
    text(ctx, lockLabel[l], x, l === 'A' ? y - 32 : y + 42, p.muted, 10, 'center', 600)
  }
  if (f.cycle) text(ctx, tr ? 'döngü: M → B → S → A → M' : 'cycle: M → B → S → A → M', 360, 276, red, 13, 'center', 700)
  else if (f.scen === 0) text(ctx, tr ? 'kilit yok' : 'no locks', 360, 276, p.muted, 12, 'center', 600)
  // sayaç
  const by = H - 50
  ctx.fillStyle = p.soft; ctx.fillRect(16, by, W - 32, 38)
  const wrong = (f.done || f.cycle) && f.counter !== f.expected
  text(ctx, tr ? 'sayaç' : 'counter', 28, by + 24, p.muted, 12, 'left', 600)
  text(ctx, `${f.counter}`, 90, by + 28, wrong ? red : p.ink, 22, 'left', 700)
  text(ctx, tr ? `beklenen ${f.expected}` : `expected ${f.expected}`, 130, by + 24, p.muted, 12, 'left', 500)
  const regs = THREADS.map((t) => `${t} ${tr ? 'okudu' : 'read'}: ${f.reg[t] ?? '–'}`).join('   ·   ')
  text(ctx, regs, W - 28, by + 24, p.ink, 12, 'right', 600)
}
