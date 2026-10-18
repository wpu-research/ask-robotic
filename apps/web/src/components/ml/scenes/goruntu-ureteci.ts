// Görüntü üreteci sahnesi: solda 2 boyutlu gizli harita (noktalar türe göre renkli), sağda girdi ve kod çözücünün boyadığı
// görüntü, hata eğrisi; sonda iki küme arasındaki yürüyüşün kareleri alt şeritte.
import { alpha, clear, dot, inset, text, type Draw, type Pal } from '../draw'
import { DIGITS, NS, SIDE, type GenFrame } from '@/lib/ml/goruntu-ureteci'

function img(ctx: CanvasRenderingContext2D, im: Float32Array, off: number, x: number, y: number, cell: number, p: Pal, frame = p.line) {
  ctx.fillStyle = p.soft; ctx.fillRect(x, y, cell * SIDE, cell * SIDE)
  for (let a = 0; a < SIDE; a++) for (let b = 0; b < SIDE; b++) {
    const v = im[off + a * SIDE + b]
    if (v <= 0.02) continue
    ctx.fillStyle = alpha(p.ink, Math.min(1, v)); ctx.fillRect(x + b * cell, y + a * cell, cell, cell)
  }
  ctx.strokeStyle = frame; ctx.lineWidth = 1; ctx.strokeRect(x - 0.5, y - 0.5, cell * SIDE + 1, cell * SIDE + 1)
}

export const draw: Draw = (ctx, W, H, f0, p, lang) => {
  const f = f0 as GenFrame
  const tr = lang === 'tr'
  clear(ctx, W, H, p)

  // sol: gizli harita
  const mx = 24, my = 40, ms = f.walk ? 300 : 360
  text(ctx, tr ? 'gizli harita: her etiket 2 sayı' : 'hidden map: every label is 2 numbers', mx, 22, p.muted, 11, 'left', 600)
  ctx.fillStyle = p.soft; ctx.fillRect(mx, my, ms, ms)
  ctx.strokeStyle = p.line; ctx.lineWidth = 1; ctx.strokeRect(mx + 0.5, my + 0.5, ms - 1, ms - 1)
  const [x0, x1, y0, y1] = f.box
  const sx = (x: number) => mx + ((x - x0) / (x1 - x0)) * ms
  const sy = (y: number) => my + ms - ((y - y0) / (y1 - y0)) * ms
  if (f.Z) {
    for (let i = 0; i < NS; i++) dot(ctx, sx(f.Z[2 * i]), sy(f.Z[2 * i + 1]), 2.6, alpha(p.groups[f.k[i]], 0.75))
    text(ctx, tr ? 'kod 1 →' : 'code 1 →', mx + ms - 4, my + ms + 14, p.muted, 10, 'right', 500)
    ctx.save(); ctx.translate(mx - 6, my + ms); ctx.rotate(-Math.PI / 2); text(ctx, tr ? 'kod 2 →' : 'code 2 →', 0, 0, p.muted, 10, 'left', 500); ctx.restore()
  } else text(ctx, tr ? 'ağ henüz yok' : 'no network yet', mx + ms / 2, my + ms / 2, p.muted, 13, 'center', 600)
  // tür açıklaması (haritanın sağ üst köşesi)
  ctx.fillStyle = alpha(p.bg, 0.85); ctx.fillRect(mx + ms - 4 * 30 - 8, my + 4, 4 * 30 + 4, 20)
  DIGITS.forEach((d, j) => { const x = mx + ms - 4 * 30 + j * 30; dot(ctx, x + 4, my + 14, 4, p.groups[j]); text(ctx, String(d), x + 11, my + 18, p.ink, 11, 'left', 600) })
  if (f.walkPts && f.walkPts.length) {
    const a = f.walkPts[0], b = f.walk!.length === 8 ? f.walkPts[7] : f.walkPts.at(-1)!
    ctx.strokeStyle = p.ink; ctx.setLineDash([4, 3]); ctx.lineWidth = 1.4
    ctx.beginPath(); ctx.moveTo(sx(a[0]), sy(a[1])); ctx.lineTo(sx(b[0]), sy(b[1])); ctx.stroke(); ctx.setLineDash([])
    f.walkPts.forEach((q) => dot(ctx, sx(q[0]), sy(q[1]), 3, p.ink))
  }
  if (f.probe) {
    const X = sx(f.probe[0]), Y = sy(f.probe[1])
    ctx.strokeStyle = p.brand; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(X, Y, 8, 0, Math.PI * 2); ctx.stroke()
    if (f.near !== undefined && f.Z) {
      ctx.strokeStyle = alpha(p.brand, 0.6); ctx.lineWidth = 1; ctx.setLineDash([2, 3])
      ctx.beginPath(); ctx.arc(X, Y, (f.near / (x1 - x0)) * ms, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([])
    }
  }

  // sağ: görüntüler
  const rx = 412
  if (f.samples) {
    text(ctx, tr ? 'kameradan örnek etiketler (8×8)' : 'sample labels from the camera (8×8)', rx, 22, p.muted, 11, 'left', 600)
    for (let i = 0; i < 16; i++) img(ctx, f.X, i * 64, rx + (i % 4) * 72, 40 + Math.floor(i / 4) * 72, 7.5, p)
    return
  }
  if (f.rec && f.sel !== undefined) {
    text(ctx, tr ? 'girdi' : 'input', rx, 22, p.muted, 11, 'left', 600)
    img(ctx, f.X, f.sel * 64, rx, 32, 14, p)
    text(ctx, '→', rx + 132, 98, p.muted, 18, 'center', 600)
    text(ctx, tr ? '2 sayıdan boyanan' : 'painted from 2 numbers', rx + 152, 22, p.muted, 11, 'left', 600)
    img(ctx, f.rec, 0, rx + 152, 32, 14, p, p.brand)
  } else if (f.paint) {
    const lab = f.walk ? (tr ? 'haritadaki noktadan boyanan' : 'painted from the map spot') : (tr ? 'boş noktadan boyanan yeni etiket' : 'a new label painted from an empty spot')
    text(ctx, lab, rx, 22, p.muted, 11, 'left', 600)
    img(ctx, f.paint, 0, rx + 64, 32, 18, p, p.brand)
  }
  if (f.err.length) inset(ctx, rx, 200, W - 16 - rx, 120, [{ v: f.err, col: p.groups[0] }], tr ? 'piksel başına hata (kare kare)' : 'error per pixel (frame by frame)', p)
  if (f.err.length) {
    const e = f.err.at(-1)!
    text(ctx, `${tr ? 'adım' : 'step'} ${f.step} · ${tr ? e.toFixed(3).replace('.', ',') : e.toFixed(3)}`, W - 16, 338, p.ink, 11, 'right', 700)
  }

  // alt şerit: yürüyüş
  if (f.walk) {
    const cell = 7, w = cell * SIDE, gap = 22
    const x = 24, y = 372
    text(ctx, tr ? "0'lardan 7'lere düz yol" : 'straight path from the 0s to the 7s', x, y - 10, p.muted, 11, 'left', 600)
    f.walk.forEach((im, i) => img(ctx, im, 0, x + i * (w + gap), y, cell, p, i === f.walk!.length - 1 ? p.brand : p.line))
  }
}
