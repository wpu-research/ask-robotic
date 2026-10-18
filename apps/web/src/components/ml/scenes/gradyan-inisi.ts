// Gradyan inişi sahnesi: solda (w, b) kayıp arazisi (koyu = düşük kayıp) ve üstünde adım adım yol; sağda veri ve doğru,
// altında kayıp eğrisi (log).
import { alpha, axes, chart, clear, dot, inset, tag, text, type Draw } from '../draw'
import { lossAt, type GdFrame } from '@/lib/ml/gradyan-inisi'

const WD: [number, number] = [-1.5, 4], BD: [number, number] = [-4, 8]

export const draw: Draw = (ctx, W, H, f0, p, lang) => {
  const f = f0 as GdFrame
  const tr = lang === 'tr'
  const num = (x: number, d: number) => (tr ? x.toFixed(d).replace('.', ',') : x.toFixed(d))
  clear(ctx, W, H, p)
  const v = chart(W, H, WD[0], WD[1], BD[0], BD[1], { l: 56, r: 256, t: 20, b: 44 })
  const X0 = v.sx(WD[0]), X1 = v.sx(WD[1]), Y0 = v.sy(BD[1]), Y1 = v.sy(BD[0])

  // ısı haritası: log kayıp, koyu = düşük; eş yükseklik bantları
  if (f.k > 0) {
    const cell = 6
    const vals: number[] = []
    const cols = Math.ceil((X1 - X0) / cell), rows = Math.ceil((Y1 - Y0) / cell)
    let lo = Infinity, hi = -Infinity
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const q = Math.log(lossAt(f.x, f.y, v.ix(X0 + (i + 0.5) * cell), v.iy(Y0 + (j + 0.5) * cell)))
      vals.push(q); if (q < lo) lo = q; if (q > hi) hi = q
    }
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const t = (vals[j * cols + i] - lo) / (hi - lo || 1)
      const band = Math.floor(t * 12) % 2 ? 0.05 : 0
      ctx.fillStyle = alpha(p.groups[1], Math.max(0.03, 0.62 * (1 - t) ** 1.4 + band))
      ctx.fillRect(X0 + i * cell, Y0 + j * cell, Math.min(cell, X1 - X0 - i * cell), Math.min(cell, Y1 - Y0 - j * cell))
    }
  }
  axes(ctx, v, [-1, 0, 1, 2, 3, 4], [-4, -2, 0, 2, 4, 6, 8], tr ? 'eğim w' : 'slope w', tr ? 'kesişim b' : 'intercept b', p, W, H, (x) => String(x).replace('-', '−'), (y) => String(y).replace('-', '−'))

  // vadinin dibi (en küçük kareler çözümü)
  const n = f.x.length
  const mx = f.x.reduce((s, q) => s + q, 0) / n, my = f.y.reduce((s, q) => s + q, 0) / n
  let sxy = 0, sxx = 0
  for (let i = 0; i < n; i++) { sxy += (f.x[i] - mx) * (f.y[i] - my); sxx += (f.x[i] - mx) ** 2 }
  const wS = sxy / sxx, bS = my - wS * mx
  if (f.k > 0) {
    const cx = v.sx(wS), cy = v.sy(bS)
    ctx.strokeStyle = p.ink; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(cx - 5, cy - 5); ctx.lineTo(cx + 5, cy + 5); ctx.moveTo(cx + 5, cy - 5); ctx.lineTo(cx - 5, cy + 5); ctx.stroke()
    text(ctx, tr ? 'dip' : 'bottom', cx + 8, cy + 16, p.ink, 11, 'left', 600)
  }

  // yol
  const k = Math.min(f.k, f.path.length)
  if (k > 0) {
    ctx.save(); ctx.beginPath(); ctx.rect(X0, Y0, X1 - X0, Y1 - Y0); ctx.clip()
    // ıraksayan yolda çok uzaktaki noktalar çizilmez (yalnız arazinin yakınındaki parçalar)
    const near = (i: number) => Math.abs(f.path[i][0]) < 40 && Math.abs(f.path[i][1]) < 80
    ctx.strokeStyle = p.brand; ctx.lineWidth = 2; ctx.beginPath()
    for (let i = 1; i < k; i++) {
      if (!near(i) || !near(i - 1)) continue
      ctx.moveTo(v.sx(f.path[i - 1][0]), v.sy(f.path[i - 1][1])); ctx.lineTo(v.sx(f.path[i][0]), v.sy(f.path[i][1]))
    }
    ctx.stroke()
    for (let i = 0; i < k; i++) if ((i < 12 || i % 5 === 0) && near(i)) dot(ctx, v.sx(f.path[i][0]), v.sy(f.path[i][1]), 2.6, p.brand)
    // başlangıç
    const [ws, bs] = f.path[0]
    dot(ctx, v.sx(ws), v.sy(bs), 7, p.bg); ctx.strokeStyle = p.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(v.sx(ws), v.sy(bs), 7, 0, Math.PI * 2); ctx.stroke()
    // şu anki nokta
    const [wc, bc] = f.path[k - 1]
    dot(ctx, v.sx(wc), v.sy(bc), 5.5, p.brand)
    if (f.arrow) {
      const [aw, ab] = f.arrow
      const dx = aw * v.s, dy = -ab * ((v.sy(0) - v.sy(1)))
      const L = Math.hypot(dx, dy) || 1, len = 64
      const ex = v.sx(wc) + (dx / L) * len, ey = v.sy(bc) + (dy / L) * len
      ctx.strokeStyle = p.groups[0]; ctx.fillStyle = p.groups[0]; ctx.lineWidth = 2.5
      ctx.beginPath(); ctx.moveTo(v.sx(wc), v.sy(bc)); ctx.lineTo(ex, ey); ctx.stroke()
      const a = Math.atan2(ey - v.sy(bc), ex - v.sx(wc))
      ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex - 10 * Math.cos(a - 0.4), ey - 10 * Math.sin(a - 0.4)); ctx.lineTo(ex - 10 * Math.cos(a + 0.4), ey - 10 * Math.sin(a + 0.4)); ctx.closePath(); ctx.fill()
    }
    ctx.restore()
    if (f.arrow) tag(ctx, tr ? 'yokuş aşağı: −eğim' : 'downhill: −slope', X0 + 8, Y0 + 8, p, p.groups[0])
  }
  if (f.blown) tag(ctx, tr ? 'patladı: adımlar vadinin üstünden atlıyor' : 'exploded: steps jump across the valley', X0 + 8, Y0 + 8, p, p.groups[0])

  // sağ üst: veri ve doğru
  const rx = W - 236, rw = 222, ry = 20, rh = 196
  ctx.fillStyle = p.bg; ctx.strokeStyle = p.line; ctx.lineWidth = 1
  ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(rx, ry, rw, rh, 6); else ctx.rect(rx, ry, rw, rh); ctx.fill(); ctx.stroke()
  text(ctx, tr ? 'kayma (°/dk) · sıcaklık (°C)' : 'drift (°/min) · temperature (°C)', rx + 8, ry + 14, p.muted, 10, 'left', 600)
  const px0 = rx + 30, px1 = rx + rw - 10, py0 = ry + rh - 22, py1 = ry + 24
  const PX = (t: number) => px0 + ((t - 10) / 40) * (px1 - px0), PY = (d: number) => py0 - (d / 10) * (py0 - py1)
  ctx.strokeStyle = p.line
  for (const t of [10, 30, 50]) { ctx.beginPath(); ctx.moveTo(PX(t), py0); ctx.lineTo(PX(t), py1); ctx.stroke(); text(ctx, String(t), PX(t), py0 + 13, p.muted, 9, 'center', 400) }
  for (const d of [0, 5, 10]) { ctx.beginPath(); ctx.moveTo(px0, PY(d)); ctx.lineTo(px1, PY(d)); ctx.stroke(); text(ctx, String(d), px0 - 5, PY(d) + 3, p.muted, 9, 'right', 400) }
  const cur = f.path[Math.max(0, k - 1)]
  const okLine = k > 0 && !f.blown && Number.isFinite(cur[0])
  ctx.save(); ctx.beginPath(); ctx.rect(px0, py1, px1 - px0, py0 - py1); ctx.clip()
  if (okLine && f.resid) {
    ctx.strokeStyle = alpha(p.groups[0], 0.6); ctx.lineWidth = 1.2
    f.x.forEach((x, i) => { ctx.beginPath(); ctx.moveTo(PX(x * 10), PY(f.y[i])); ctx.lineTo(PX(x * 10), PY(cur[0] * x + cur[1])); ctx.stroke() })
  }
  f.x.forEach((x, i) => dot(ctx, PX(x * 10), PY(f.y[i]), 3, p.groups[1]))
  if (okLine) {
    ctx.strokeStyle = p.brand; ctx.lineWidth = 2.4; ctx.beginPath()
    ctx.moveTo(PX(10), PY(cur[0] * 1 + cur[1])); ctx.lineTo(PX(50), PY(cur[0] * 5 + cur[1])); ctx.stroke()
  }
  ctx.restore()

  // sağ alt: kayıp eğrisi ve sayılar
  const shown = f.losses.slice(0, Math.max(1, k))
  if (k > 1) inset(ctx, rx, 232, rw, 110, [{ v: shown, col: p.groups[0] }], tr ? 'kayıp (log) · adım' : 'loss (log) · step', p, { log: true, n: Math.max(shown.length, 40) })
  if (k > 0) {
    const L = f.losses[k - 1]
    const Ls = L >= 1000 ? (tr ? L.toExponential(1).replace('.', ',') : L.toExponential(1)) : num(L, L < 1 ? 3 : 2)
    text(ctx, tr ? 'kayıp' : 'loss', rx, 368, p.muted, 11, 'left', 600)
    text(ctx, Ls, rx, 396, f.blown ? p.groups[0] : p.ink, 24, 'left', 700)
    text(ctx, `${tr ? 'adım' : 'step'} ${k - 1} · lr ${num(f.lr, f.lr < 0.001 ? 4 : 3).replace(/0+$/, '')}`, rx, 416, p.muted, 11, 'left', 500)
  }
}
