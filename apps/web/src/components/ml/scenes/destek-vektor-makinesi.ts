// Sahne: destek vektör makinesi. Parçalar (ağırlık–uzunluk), karar çizgisi, iki kenar çizgisi, marj şeridi, halkalı destek vektörleri.
// Sağ altta dönemlere göre marj genişliği; güncellenen nokta kalın halkayla işaretlenir.
import { alpha, axes, chart, clear, dot, inset, tag, text, type Draw } from '../draw'
import { svmF, type SvmFrame } from '@/lib/ml/destek-vektor-makinesi'
import { fmt } from '@/lib/ml/core'

const X0 = 15, X1 = 45, Y0 = 25, Y1 = 55

export const draw: Draw = (ctx, W, H, f0, p, lang) => {
  const f = f0 as SvmFrame
  const tr = lang === 'tr'
  clear(ctx, W, H, p)
  const v = chart(W, H, X0, X1, Y0, Y1, { l: 56, r: 20, t: 20, b: 44 })
  const has = f.w[0] !== 0 || f.w[1] !== 0
  const F = (x: number, y: number) => svmF(f.w, f.mu, f.sd, x, y)
  // bölgeler ve marj şeridi
  if (has) {
    const cell = 6
    for (let py = v.sy(Y1); py < v.sy(Y0); py += cell) for (let px = v.sx(X0); px < v.sx(X1); px += cell) {
      const val = F(v.ix(px + cell / 2), v.iy(py + cell / 2))
      ctx.fillStyle = Math.abs(val) < 1 ? alpha(p.brand, 0.07) : alpha(val > 0 ? p.groups[1] : p.groups[0], 0.09)
      ctx.fillRect(px, py, cell, cell)
    }
  }
  axes(ctx, v, [15, 20, 25, 30, 35, 40, 45], [25, 30, 35, 40, 45, 50, 55], tr ? 'ağırlık (g)' : 'weight (g)', tr ? 'uzunluk (mm)' : 'length (mm)', p, W, H)
  // f = k çizgisi (fiziksel birimlerde düz çizgi)
  const level = (k: number, col: string, lw: number, dash: number[]) => {
    const [w0, w1, b] = f.w
    ctx.save(); ctx.beginPath(); ctx.rect(v.sx(X0), v.sy(Y1), v.sx(X1) - v.sx(X0), v.sy(Y0) - v.sy(Y1)); ctx.clip()
    ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.setLineDash(dash); ctx.beginPath()
    if (Math.abs(w1) > 1e-9) {
      const yAt = (x: number) => f.mu[1] + (f.sd[1] * (k - b - (w0 * (x - f.mu[0])) / f.sd[0])) / w1
      ctx.moveTo(v.sx(X0), v.sy(yAt(X0))); ctx.lineTo(v.sx(X1), v.sy(yAt(X1)))
    } else {
      const x = f.mu[0] + (f.sd[0] * (k - b)) / w0
      ctx.moveTo(v.sx(x), v.sy(Y0)); ctx.lineTo(v.sx(x), v.sy(Y1))
    }
    ctx.stroke(); ctx.setLineDash([]); ctx.restore()
  }
  if (has) {
    level(-1, p.groups[0], 1.6, [6, 5])
    level(1, p.groups[1], 1.6, [6, 5])
    level(0, p.brand, 3, [])
  }
  // noktalar: tip A daire, tip B kare
  f.X.forEach((q, i) => {
    const X = v.sx(q.x), Y = v.sy(q.y)
    if (q.c) { ctx.fillStyle = p.groups[1]; ctx.fillRect(X - 3.8, Y - 3.8, 7.6, 7.6) } else dot(ctx, X, Y, 4.2, p.groups[0])
    if (f.alpha && f.alpha[i] > 1e-6) {
      ctx.strokeStyle = p.ink; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(X, Y, 8.5, 0, Math.PI * 2); ctx.stroke()
    }
    if (i === f.at) {
      ctx.strokeStyle = p.brand; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(X, Y, 12, 0, Math.PI * 2); ctx.stroke()
    }
  })
  // güncellenen noktanın α'sı
  if (f.at !== undefined && f.alpha) {
    const q = f.X[f.at]
    const s = `α = ${fmt(f.alpha[f.at], 2, lang)}`
    tag(ctx, s, v.sx(q.x) + 15, v.sy(q.y) - 30, p, p.brand)
  }
  // sol üst: marj ve destek vektörü sayısı
  if (has && f.alpha) {
    const m = 2 / Math.hypot(f.w[0], f.w[1])
    const nsv = f.alpha.filter((a) => a > 1e-6).length
    let x = v.sx(X0) + 10
    x += tag(ctx, `${tr ? 'marj' : 'margin'} 2/‖w‖ = ${fmt(m, 2, lang)}`, x, v.sy(Y1) + 10, p, p.brand) + 8
    tag(ctx, tr ? `${nsv} destek vektörü` : `${nsv} support vectors`, x, v.sy(Y1) + 10, p, p.ink)
  }
  if (f.margin !== undefined && f.errors !== undefined) {
    text(ctx, tr ? `${f.errors} hata` : `${f.errors} errors`, v.sx(X0) + 12, v.sy(Y1) + 60, p.ink, 18, 'left', 700)
  }
  // sağ alt: amaç eğrisi
  if (f.hist.length > 1) inset(ctx, v.sx(X1) - 206, v.sy(Y0) - 104, 200, 96, [{ v: f.hist, col: p.brand }], tr ? 'marj genişliği · dönemler' : 'margin width · epochs', p)
  // gösterge
  let lx = v.sx(X0) + 8
  const L = tr ? ['tip A', 'tip B', 'destek vektörü'] : ['type A', 'type B', 'support vector']
  dot(ctx, lx + 4, H - 14, 4, p.groups[0]); text(ctx, L[0], lx + 12, H - 10, p.muted, 11); lx += ctx.measureText(L[0]).width + 34
  ctx.fillStyle = p.groups[1]; ctx.fillRect(lx, H - 18, 8, 8); text(ctx, L[1], lx + 12, H - 10, p.muted, 11); lx += ctx.measureText(L[1]).width + 34
  ctx.strokeStyle = p.ink; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(lx + 4, H - 14, 5, 0, Math.PI * 2); ctx.stroke(); text(ctx, L[2], lx + 14, H - 10, p.muted, 11)
}
