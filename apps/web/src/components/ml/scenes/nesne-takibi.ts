// Nesne takibi sahnesi: tavan kamerasının kuşbakışı görüntüsü, tespit kutuları, kimlikli izler, hız etiketleri ve ihlaller.
import { alpha, clear, text, type Draw, type Pal } from '../draw'
import { fmt, type Lang } from '@/lib/ml/core'
import { IMG_H, IMG_W, LIMIT, PX_M, type TrackFrame } from '@/lib/ml/nesne-takibi'

const OX = 35, OY = 8

const idCol = (id: number, viol: boolean, p: Pal) => (viol ? p.groups[0] : p.groups[1 + (id % 5)])

function floor(ctx: CanvasRenderingContext2D, p: Pal, lang: Lang) {
  ctx.fillStyle = p.soft; ctx.fillRect(OX, OY, IMG_W, IMG_H)
  // şeritler (y = 5 m ve 9,5 m) ve dik koridor (x = 13 m)
  ctx.fillStyle = p.bg
  ctx.fillRect(OX, OY + 3.6 * PX_M, IMG_W, 7.4 * PX_M)
  ctx.fillRect(OX + 11.6 * PX_M, OY, 2.8 * PX_M, IMG_H)
  ctx.strokeStyle = p.muted; ctx.lineWidth = 1; ctx.setLineDash([10, 8])
  ctx.beginPath(); ctx.moveTo(OX, OY + 7.25 * PX_M); ctx.lineTo(OX + IMG_W, OY + 7.25 * PX_M); ctx.stroke(); ctx.setLineDash([])
  ctx.strokeStyle = p.line; ctx.lineWidth = 2
  ctx.strokeRect(OX, OY + 3.6 * PX_M, IMG_W, 7.4 * PX_M)
  ctx.strokeRect(OX + 11.6 * PX_M, OY, 2.8 * PX_M, IMG_H)
  // raflar (yol kenarı)
  ctx.fillStyle = alpha(p.muted, 0.18)
  for (let i = 0; i < 4; i++) { ctx.fillRect(OX + 20 + i * 70, OY + 14, 52, 40); ctx.fillRect(OX + 400 + i * 62, OY + 14, 46, 40) }
  for (let i = 0; i < 4; i++) { ctx.fillRect(OX + 20 + i * 70, OY + IMG_H - 60, 52, 44); ctx.fillRect(OX + 400 + i * 62, OY + IMG_H - 60, 46, 44) }
  // yön okları
  const arrow = (x: number, y: number, dx: number, dy: number) => {
    ctx.strokeStyle = alpha(p.muted, 0.7); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - dx * 12, y - dy * 12); ctx.lineTo(x + dx * 12, y + dy * 12)
    ctx.lineTo(x + dx * 6 - dy * 5, y + dy * 6 - dx * 5); ctx.moveTo(x + dx * 12, y + dy * 12); ctx.lineTo(x + dx * 6 + dy * 5, y + dy * 6 + dx * 5); ctx.stroke()
  }
  arrow(OX + 560, OY + 4.2 * PX_M, 1, 0); arrow(OX + 90, OY + 10.4 * PX_M, -1, 0); arrow(OX + 13 * PX_M, OY + 2.3 * PX_M, 0, 1)
  // hız sınırı levhası
  const sx = OX + 610, sy = OY + 36
  ctx.fillStyle = p.bg; ctx.beginPath(); ctx.arc(sx, sy, 22, 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = p.groups[0]; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(sx, sy, 20, 0, Math.PI * 2); ctx.stroke()
  text(ctx, fmt(LIMIT, 0, lang), sx, sy + 3, p.ink, 15, 'center', 700)
  text(ctx, 'm/s', sx, sy + 13, p.ink, 8, 'center', 600)
  ctx.strokeStyle = p.line; ctx.lineWidth = 1; ctx.strokeRect(OX + 0.5, OY + 0.5, IMG_W - 1, IMG_H - 1)
}

export const draw: Draw = (ctx, W, H, f0, p, lang) => {
  const f = f0 as TrackFrame
  const tr = lang === 'tr'
  clear(ctx, W, H, p)
  floor(ctx, p, lang)
  ctx.save(); ctx.beginPath(); ctx.rect(OX, OY, IMG_W, IMG_H); ctx.clip()
  // izler
  for (const k of f.tracks) {
    const c = idCol(k.id, k.viol, p)
    ctx.strokeStyle = alpha(c, 0.55); ctx.lineWidth = 2.2; ctx.beginPath()
    for (let i = 0; i < k.trail.length; i += 2) { const X = OX + k.trail[i], Y = OY + k.trail[i + 1]; if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y) }
    ctx.stroke()
  }
  // ham tespitler
  for (const d of f.dets) {
    ctx.strokeStyle = p.ink; ctx.lineWidth = 1; ctx.setLineDash([3, 3])
    ctx.strokeRect(OX + d.x - d.w / 2, OY + d.y - d.h / 2, d.w, d.h); ctx.setLineDash([])
    ctx.fillStyle = p.ink; ctx.fillRect(OX + d.x - 1.5, OY + d.y - 1.5, 3, 3)
  }
  // izlerin kutuları
  for (const k of f.tracks) {
    const c = idCol(k.id, k.viol, p)
    const X = OX + k.x - k.w / 2, Y = OY + k.y - k.h / 2
    ctx.globalAlpha = k.missed ? 0.45 : 1
    ctx.fillStyle = alpha(c, 0.22); ctx.fillRect(X, Y, k.w, k.h)
    ctx.strokeStyle = c; ctx.lineWidth = 2.4; ctx.strokeRect(X, Y, k.w, k.h)
    ctx.globalAlpha = 1
  }
  // eşleştirme bağları
  if (f.links) for (const l of f.links) {
    const PX = OX + l.px, PY = OY + l.py, DX = OX + l.dx, DY = OY + l.dy
    ctx.strokeStyle = alpha(p.brand, 0.5); ctx.lineWidth = 1; ctx.setLineDash([4, 4])
    ctx.beginPath(); ctx.arc(PX, PY, f.gate, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([])
    ctx.strokeStyle = l.ok ? p.brand : p.muted; ctx.lineWidth = l.ok ? 2 : 1
    ctx.beginPath(); ctx.moveTo(PX, PY); ctx.lineTo(DX, DY); ctx.stroke()
    ctx.strokeStyle = p.brand; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(PX - 4, PY - 4); ctx.lineTo(PX + 4, PY + 4); ctx.moveTo(PX + 4, PY - 4); ctx.lineTo(PX - 4, PY + 4); ctx.stroke()
  }
  ctx.restore()
  // etiketler (kutunun üstünde; kenara taşmasın)
  for (const k of f.tracks) {
    const c = idCol(k.id, k.viol, p)
    const sp = Number.isFinite(k.speed) ? ` · ${fmt(k.speed, 1, lang)} m/s` : ''
    const s = `ID ${k.id}${sp}${k.viol ? ' !' : ''}`
    ctx.font = `600 11px Poppins, system-ui, sans-serif`
    const w = ctx.measureText(s).width + 10
    let x = OX + k.x - w / 2, y = OY + k.y - k.h / 2 - 20
    x = Math.max(OX + 2, Math.min(OX + IMG_W - w - 2, x)); if (y < OY + 2) y = OY + k.y + k.h / 2 + 4
    ctx.globalAlpha = k.missed ? 0.55 : 1
    ctx.fillStyle = c; ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, 17, 4); else ctx.rect(x, y, w, 17); ctx.fill()
    text(ctx, s, x + 5, y + 12.5, p.bg, 11, 'left', 600)
    ctx.globalAlpha = 1
  }
  if (f.born) for (const id of f.born) {
    const k = f.tracks.find((q) => q.id === id)
    if (!k) continue
    ctx.strokeStyle = p.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(OX + k.x, OY + k.y, Math.max(k.w, k.h) * 0.75, 0, Math.PI * 2); ctx.stroke()
  }
  // sonuç tablosu
  if (f.summary) {
    const x0 = OX + 140, y0 = OY + 80, w = 370, rh = 22
    ctx.fillStyle = alpha(p.bg, 0.95); ctx.strokeStyle = p.ink; ctx.lineWidth = 1.2
    ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x0, y0, w, 44 + rh * f.summary.length + 14, 8); else ctx.rect(x0, y0, w, 44 + rh * f.summary.length + 14); ctx.fill(); ctx.stroke()
    const cols = [x0 + 16, x0 + 76, x0 + 150, x0 + 226, x0 + 306]
    const hd = tr ? ['araç', 'kimlik', 'gerçek', 'tahmin', 'hata'] : ['vehicle', 'ID', 'true', 'estimate', 'error']
    hd.forEach((h, i) => text(ctx, h, cols[i], y0 + 24, p.muted, 11, 'left', 600))
    f.summary.forEach((q, g) => {
      const y = y0 + 48 + g * rh
      const col = q.viol ? p.groups[0] : p.ink
      text(ctx, `AGV ${g + 1}`, cols[0], y, p.ink, 12, 'left', 600)
      text(ctx, `ID ${q.id}`, cols[1], y, col, 12, 'left', 600)
      text(ctx, `${fmt(q.truth, 2, lang)} m/s`, cols[2], y, p.ink, 12)
      text(ctx, `${fmt(q.est, 2, lang)} m/s`, cols[3], y, col, 12, 'left', 700)
      const e = ((q.est - q.truth) / q.truth) * 100
      text(ctx, `${e >= 0 ? '+' : '−'}${fmt(Math.abs(e), 1, lang)}%`, cols[4], y, p.muted, 12)
    })
  }
  // alt şerit: ihlal günlüğü ve ölçek
  const by = OY + IMG_H + 22
  text(ctx, tr ? 'İhlaller:' : 'Violations:', OX, by, p.ink, 12, 'left', 700)
  let x = OX + (tr ? 66 : 80)
  if (!f.events.length) text(ctx, tr ? 'henüz yok' : 'none yet', x, by, p.muted, 12)
  for (const e of f.events) {
    const s = `ID ${e.id} · ${fmt(e.speed, 2, lang)} m/s · ${fmt(e.t / 10, 1, lang)} s`
    ctx.font = `600 11px Poppins, system-ui, sans-serif`
    const w = ctx.measureText(s).width + 14
    if (x + w > OX + IMG_W) break
    ctx.fillStyle = alpha(p.groups[0], 0.12); ctx.strokeStyle = p.groups[0]; ctx.lineWidth = 1
    ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, by - 14, w, 20, 10); else ctx.rect(x, by - 14, w, 20); ctx.fill(); ctx.stroke()
    text(ctx, s, x + 7, by, p.groups[0], 11, 'left', 600)
    x += w + 8
  }
  // ölçek: 1 m = 25 px
  const sy = H - 14
  ctx.strokeStyle = p.muted; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(OX, sy - 4); ctx.lineTo(OX, sy); ctx.lineTo(OX + 2 * PX_M, sy); ctx.lineTo(OX + 2 * PX_M, sy - 4); ctx.stroke()
  text(ctx, tr ? '2 m = 50 piksel' : '2 m = 50 pixels', OX + 2 * PX_M + 8, sy + 1, p.muted, 10)
  ctx.setLineDash([3, 3]); ctx.strokeStyle = p.ink; ctx.lineWidth = 1; ctx.strokeRect(OX + 190, sy - 9, 14, 9); ctx.setLineDash([])
  text(ctx, tr ? 'tespit kutusu' : 'detection box', OX + 210, sy + 1, p.muted, 10)
  ctx.strokeStyle = p.groups[1]; ctx.lineWidth = 2; ctx.strokeRect(OX + 310, sy - 9, 14, 9)
  text(ctx, tr ? 'iz (kimlik)' : 'track (ID)', OX + 330, sy + 1, p.muted, 10)
  ctx.strokeStyle = p.groups[0]; ctx.strokeRect(OX + 420, sy - 9, 14, 9)
  text(ctx, tr ? `> ${fmt(LIMIT, 0, lang)} m/s ihlal` : `> ${LIMIT} m/s violation`, OX + 440, sy + 1, p.muted, 10)
}
