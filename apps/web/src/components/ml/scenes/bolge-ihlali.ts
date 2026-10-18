// Bölge ihlali sahnesi: kuşbakışı robot hücresi, tehlike çokgeni, işçi kutuları ve ayak noktaları, ışın atma, olay günlüğü.
import { alpha, clear, dot, tag, text, type Draw, type Pal } from '../draw'
import { fmt } from '@/lib/ml/core'
import { BASE, CELL, FPS, WORKERS, robotName, type Person, type ZoneFrame } from '@/lib/ml/bolge-ihlali'

const S = 42, OX = 14, OY = 14
const X = (x: number) => OX + x * S
const Y = (y: number) => OY + y * S

const personCol = (q: Person, p: Pal) => (q.inside ? (q.ppe ? p.groups[2] : p.groups[0]) : p.groups[1])

export const draw: Draw = (ctx, W, H, f0, p, lang) => {
  const f = f0 as ZoneFrame
  const tr = lang === 'tr'
  clear(ctx, W, H, p)
  // hücre zemini ve ızgara
  ctx.fillStyle = p.soft; ctx.fillRect(X(0), Y(0), CELL.w * S, CELL.h * S)
  ctx.strokeStyle = p.line; ctx.lineWidth = 1
  for (let x = 1; x < CELL.w; x++) { ctx.beginPath(); ctx.moveTo(X(x) + 0.5, Y(0)); ctx.lineTo(X(x) + 0.5, Y(CELL.h)); ctx.stroke() }
  for (let y = 1; y < CELL.h; y++) { ctx.beginPath(); ctx.moveTo(X(0), Y(y) + 0.5); ctx.lineTo(X(CELL.w), Y(y) + 0.5); ctx.stroke() }
  // konveyör (girintiden aşağı)
  ctx.fillStyle = alpha(p.muted, 0.25); ctx.fillRect(X(6.75), Y(5.4), 0.5 * S, (CELL.h - 5.4) * S)
  ctx.strokeStyle = alpha(p.muted, 0.6); ctx.lineWidth = 1
  for (let y = 5.7; y < CELL.h; y += 0.45) { ctx.beginPath(); ctx.moveTo(X(6.8), Y(y + 0.15)); ctx.lineTo(X(7), Y(y)); ctx.lineTo(X(7.2), Y(y + 0.15)); ctx.stroke() }
  // tehlike çokgeni
  ctx.fillStyle = alpha(p.groups[0], 0.1); ctx.strokeStyle = p.groups[0]; ctx.lineWidth = 2
  ctx.beginPath(); f.zone.forEach(([x, y], i) => (i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y)))); ctx.closePath(); ctx.fill(); ctx.stroke()
  for (const [x, y] of f.zone) dot(ctx, X(x), Y(y), 2.5, p.groups[0])
  // robot kolu
  const [bx, by] = BASE
  const a1 = f.arm, a2 = f.arm * 1.7 + 0.8
  const j1 = [bx + 1.3 * Math.cos(a1), by + 1.3 * Math.sin(a1)], j2 = [j1[0] + 1.0 * Math.cos(a2), j1[1] + 1.0 * Math.sin(a2)]
  ctx.strokeStyle = alpha(p.brand, 0.35); ctx.setLineDash([4, 4]); ctx.lineWidth = 1
  ctx.beginPath(); ctx.arc(X(bx), Y(by), 2.3 * S, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([])
  ctx.strokeStyle = p.brand; ctx.lineCap = 'round'; ctx.lineWidth = 9
  ctx.beginPath(); ctx.moveTo(X(bx), Y(by)); ctx.lineTo(X(j1[0]), Y(j1[1])); ctx.stroke()
  ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(X(j1[0]), Y(j1[1])); ctx.lineTo(X(j2[0]), Y(j2[1])); ctx.stroke(); ctx.lineCap = 'butt'
  dot(ctx, X(bx), Y(by), 13, p.brand); dot(ctx, X(bx), Y(by), 5, p.bg); dot(ctx, X(j1[0]), Y(j1[1]), 5, p.ink); dot(ctx, X(j2[0]), Y(j2[1]), 4, p.ink)
  text(ctx, tr ? 'tehlike bölgesi' : 'danger zone', X(f.zone[1][0]), Y(f.zone[1][1]) + 22, p.groups[0], 11, 'center', 700)
  // ışın
  if (f.ray) {
    const q = f.people[f.ray.k]
    ctx.strokeStyle = p.brand; ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(X(q.fx), Y(q.fy)); ctx.lineTo(X(CELL.w), Y(q.fy)); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(X(CELL.w) - 8, Y(q.fy) - 5); ctx.lineTo(X(CELL.w), Y(q.fy)); ctx.lineTo(X(CELL.w) - 8, Y(q.fy) + 5); ctx.stroke()
    f.ray.hits.forEach((x, i) => {
      dot(ctx, X(x), Y(q.fy), 7, p.bg); ctx.strokeStyle = p.brand; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(X(x), Y(q.fy), 7, 0, Math.PI * 2); ctx.stroke()
      text(ctx, String(i + 1), X(x), Y(q.fy) + 4, p.brand, 10, 'center', 700)
    })
    const n = f.ray.hits.length
    const s = tr ? `${n} kesişim → ${n % 2 ? 'tek: içeride' : 'çift: dışarıda'}` : `${n} crossing${n === 1 ? '' : 's'} → ${n % 2 ? 'odd: inside' : 'even: outside'}`
    ctx.font = `600 12px Poppins, system-ui, sans-serif`
    const w = ctx.measureText(s).width + 16
    tag(ctx, s, Math.min(X(CELL.w) - w - 4, X(q.fx) + 10), Y(q.fy) + 10, p, p.brand)
  }
  // işçiler
  for (const q of f.people) {
    const c = personCol(q, p)
    const x0 = X(q.bx), y0 = Y(q.by), w = q.bw * S, h = q.bh * S
    ctx.fillStyle = alpha(c, 0.14); ctx.fillRect(x0, y0, w, h)
    ctx.strokeStyle = c; ctx.lineWidth = q.inside ? 2.6 : 1.8; ctx.strokeRect(x0, y0, w, h)
    // yelek bandı ve kask
    if (q.vest) { ctx.fillStyle = p.groups[5]; ctx.fillRect(x0 + 3, y0 + h * 0.38, w - 6, 6) } else { ctx.strokeStyle = p.groups[5]; ctx.setLineDash([2, 2]); ctx.lineWidth = 1; ctx.strokeRect(x0 + 3, y0 + h * 0.38, w - 6, 6); ctx.setLineDash([]) }
    if (q.helmet) dot(ctx, x0 + w / 2, y0 + 7, 5.5, p.groups[2])
    else { ctx.strokeStyle = p.groups[2]; ctx.setLineDash([2, 2]); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(x0 + w / 2, y0 + 7, 5.5, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]) }
    // ayak noktası
    dot(ctx, X(q.fx), Y(q.fy), 4, p.ink)
    text(ctx, String(q.k + 1), x0 + w + 3, y0 + 11, c, 12, 'left', 700)
  }
  ctx.strokeStyle = p.ink; ctx.lineWidth = 1; ctx.strokeRect(X(0) + 0.5, Y(0) + 0.5, CELL.w * S - 1, CELL.h * S - 1)

  // sağ panel: robot durumu ve olay günlüğü
  const px = X(CELL.w) + 16, pw = W - px - 8
  const rc = f.robot === 'stop' ? p.groups[0] : f.robot === 'slow' ? p.groups[2] : p.groups[3]
  tag(ctx, robotName(f.robot)[tr ? 0 : 1], px, OY, p, rc)
  text(ctx, tr ? 'Olay günlüğü' : 'Event log', px, OY + 46, p.ink, 13, 'left', 700)
  ctx.strokeStyle = p.line; ctx.beginPath(); ctx.moveTo(px, OY + 54); ctx.lineTo(px + pw, OY + 54); ctx.stroke()
  const ev = f.events.slice(-10).reverse()
  if (!ev.length) text(ctx, tr ? 'henüz olay yok' : 'no events yet', px, OY + 74, p.muted, 11)
  ev.forEach((e, i) => {
    const y = OY + 74 + i * 24
    const wk = WORKERS[e.k]
    const miss = !wk.helmet && !wk.vest ? (tr ? 'kask+yelek yok' : 'no helmet+vest') : !wk.helmet ? (tr ? 'kask yok' : 'no helmet') : !wk.vest ? (tr ? 'yelek yok' : 'no vest') : (tr ? 'KKD tam' : 'full PPE')
    const c = e.kind === 'alarm' ? p.groups[0] : p.groups[2]
    dot(ctx, px + 5, y - 4, 4, c)
    text(ctx, `${fmt(e.t / FPS, 1, lang)} s · ${tr ? 'işçi' : 'worker'} ${e.k + 1}`, px + 14, y, p.ink, 11, 'left', 600)
    text(ctx, `${e.kind === 'alarm' ? 'ALARM' : tr ? 'uyarı' : 'warning'} · ${miss}`, px + 14, y + 12, c, 10, 'left', 600)
    void i
  })
  if (f.summary) {
    const y = OY + 74 + 10 * 24 + 6
    text(ctx, tr ? `${f.summary.alarms} alarm · ${f.summary.warns} uyarı` : `${f.summary.alarms} alarms · ${f.summary.warns} warnings`, px, Math.min(y, Y(CELL.h)), p.ink, 13, 'left', 700)
  }

  // alt şerit: lejant
  const ly = Y(CELL.h) + 26
  const item = (x: number, col: string, s: string) => { ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.strokeRect(x, ly - 10, 10, 12); text(ctx, s, x + 15, ly, p.muted, 11); ctx.font = `500 11px Poppins, system-ui, sans-serif`; return x + 15 + ctx.measureText(s).width + 16 }
  let x = OX
  x = item(x, p.groups[1], tr ? 'dışarıda' : 'outside')
  x = item(x, p.groups[2], tr ? 'içeride, KKD tam' : 'inside, full PPE')
  x = item(x, p.groups[0], tr ? 'içeride, KKD eksik' : 'inside, PPE missing')
  dot(ctx, x + 5, ly - 4, 5, p.groups[2]); text(ctx, tr ? 'kask' : 'helmet', x + 14, ly, p.muted, 11)
  ctx.font = `500 11px Poppins, system-ui, sans-serif`; x += 14 + ctx.measureText(tr ? 'kask' : 'helmet').width + 14
  ctx.fillStyle = p.groups[5]; ctx.fillRect(x, ly - 7, 14, 6); text(ctx, tr ? 'yelek' : 'vest', x + 19, ly, p.muted, 11)
  ctx.font = `500 11px Poppins, system-ui, sans-serif`; x += 19 + ctx.measureText(tr ? 'yelek' : 'vest').width + 14
  dot(ctx, x + 4, ly - 4, 4, p.ink); text(ctx, tr ? 'ayak noktası' : 'foot point', x + 12, ly, p.muted, 11)
  const sy = H - 16
  ctx.strokeStyle = p.muted; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(OX, sy - 4); ctx.lineTo(OX, sy); ctx.lineTo(OX + 2 * S, sy); ctx.lineTo(OX + 2 * S, sy - 4); ctx.stroke()
  text(ctx, '2 m', OX + 2 * S + 6, sy + 1, p.muted, 10)
  text(ctx, tr ? 'kesik çizgi: kolun erişimi · çokgen: güvenlik bölgesi (girintide konveyör)' : 'dashed: arm reach · polygon: safety zone (conveyor in the notch)', OX + 2 * S + 40, sy + 1, p.muted, 10)
}
