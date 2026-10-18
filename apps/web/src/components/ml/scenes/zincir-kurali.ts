// Zincir kuralı sahnesi: solda servo verisi ve modelin S eğrisi (köşede kayıp grafiği), sağda iki ağırlığın kayıp arazisi ve
// gradyan inişinin yolu. Zincir karelerinde sağ panel halka halka çarpanlara (kutulara) dönüşür.
import { alpha, axes, chart, clear, dot, inset, tag, text, type Draw, type Pal, type View } from '../draw'
import { predict, zkLoss, type ZkFrame, type ZkPhase } from '@/lib/ml/zincir-kurali'

const W1D: [number, number] = [-1, 4], W2D: [number, number] = [0, 4.5]
const CHAIN: ZkPhase[] = ['dpred', 'g2', 'dz', 'g1', 'check']

function sgn(x: number, d: number, tr: boolean) {
  const s = Math.abs(x).toFixed(d)
  return (x < 0 ? '−' : '') + (tr ? s.replace('.', ',') : s)
}

function rbox(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fill: string, stroke: string, lw = 1) {
  ctx.fillStyle = fill; ctx.strokeStyle = stroke; ctx.lineWidth = lw
  ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, 8); else ctx.rect(x, y, w, h); ctx.fill(); ctx.stroke()
}

/** Sağdaki grafik için eksenler (draw.axes y adını solda 14 px'e yazar; burada grafiğin soluna yazılır). */
function axesR(ctx: CanvasRenderingContext2D, v: View, xs: number[], ys: number[], xl: string, yl: string, p: Pal, ylx: number) {
  ctx.strokeStyle = p.line; ctx.lineWidth = 1
  for (const x of xs) { ctx.beginPath(); ctx.moveTo(v.sx(x) + 0.5, v.sy(ys[0])); ctx.lineTo(v.sx(x) + 0.5, v.sy(ys[ys.length - 1])); ctx.stroke(); text(ctx, String(x).replace('-', '−'), v.sx(x), v.sy(ys[0]) + 15, p.muted, 10, 'center', 400) }
  for (const y of ys) { ctx.beginPath(); ctx.moveTo(v.sx(xs[0]), v.sy(y) + 0.5); ctx.lineTo(v.sx(xs[xs.length - 1]), v.sy(y) + 0.5); ctx.stroke(); text(ctx, String(y), v.sx(xs[0]) - 6, v.sy(y) + 4, p.muted, 10, 'right', 400) }
  text(ctx, xl, v.sx(xs[xs.length - 1]), v.sy(ys[0]) + 30, p.muted, 11, 'right', 600)
  ctx.save(); ctx.translate(ylx, v.sy(ys[ys.length - 1])); ctx.rotate(-Math.PI / 2); text(ctx, yl, 0, 0, p.muted, 11, 'right', 600); ctx.restore()
}

export const draw: Draw = (ctx, W, H, f0, p, lang) => {
  const f = f0 as ZkFrame
  const tr = lang === 'tr'
  clear(ctx, W, H, p)
  const k = Math.min(f.k, f.path.length)
  const cur = f.path[Math.max(0, k - 1)]
  const chainOn = CHAIN.includes(f.phase) && !!f.chain

  // sol: veri ve model
  const v = chart(W, H, -3, 3, -0.5, 3.5, { l: 52, r: 336, t: 24, b: 44 })
  axes(ctx, v, [-3, -2, -1, 0, 1, 2, 3], [0, 1, 2, 3], tr ? 'servo komutu u' : 'servo command u', tr ? 'eklem açısı (rad)' : 'joint angle (rad)', p, W, H, (x) => String(x).replace('-', '−'))
  if (k > 0) {
    ctx.save(); ctx.beginPath(); ctx.rect(v.sx(-3), v.sy(3.5), v.sx(3) - v.sx(-3), v.sy(-0.5) - v.sy(3.5)); ctx.clip()
    if (f.phase === 'model' || f.phase === 'fwd') {
      ctx.strokeStyle = alpha(p.groups[0], 0.6); ctx.lineWidth = 1.2
      f.u.forEach((q, i) => { ctx.beginPath(); ctx.moveTo(v.sx(q), v.sy(f.y[i])); ctx.lineTo(v.sx(q), v.sy(predict(cur[0], cur[1], q))); ctx.stroke() })
    }
    ctx.strokeStyle = p.brand; ctx.lineWidth = 2.6; ctx.beginPath()
    for (let i = 0; i <= 120; i++) { const q = -3 + (6 * i) / 120; const X = v.sx(q), Y = v.sy(predict(cur[0], cur[1], q)); if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y) }
    ctx.stroke(); ctx.restore()
  }
  f.u.forEach((q, i) => dot(ctx, v.sx(q), v.sy(f.y[i]), 4, p.groups[1]))
  if (chainOn) {
    const c = f.chain!
    ctx.strokeStyle = p.groups[0]; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(v.sx(c.u), v.sy(f.y[c.i]), 9, 0, Math.PI * 2); ctx.stroke()
  }
  if (k > 1) inset(ctx, v.sx(-3) + 6, v.sy(3.5) + 4, 150, 84, [{ v: f.losses.slice(0, k), col: p.groups[0] }], tr ? 'kayıp (log) · adım' : 'loss (log) · step', p, { log: true, n: 101 })

  // sağ: zincir kutuları ya da kayıp arazisi
  const RX = W - 300
  if (chainOn) {
    const c = f.chain!, g = f.g!
    const ph = CHAIN.indexOf(f.phase)
    text(ctx, tr ? `zincir, işaretli nokta için (u = ${sgn(c.u, 2, tr)})` : `the chain, for the marked point (u = ${sgn(c.u, 2, tr)})`, RX, 34, p.muted, 11, 'left', 600)
    const rows: Array<{ k: string; d: string; v: number; on: boolean }> = [
      { k: '∂L/∂ŷ', d: tr ? '2 · (ŷ − y) / 20' : '2 · (ŷ − y) / 20', v: c.dPred, on: true },
      { k: '∂ŷ/∂h', d: 'w2', v: c.w2, on: ph >= 2 },
      { k: '∂h/∂z', d: 'h · (1 − h)', v: c.dh, on: ph >= 2 },
      { k: '∂z/∂w1', d: 'u', v: c.u, on: ph >= 3 },
    ]
    rows.forEach((r, i) => {
      const y = 48 + i * 60
      const hot = (ph === 0 && i === 0) || (ph === 2 && (i === 1 || i === 2)) || (ph === 3 && i === 3)
      rbox(ctx, RX, y, 280, 44, r.on ? (hot ? alpha(p.brand, 0.1) : p.bg) : p.soft, r.on ? (hot ? p.brand : p.line) : p.line, hot ? 2 : 1)
      text(ctx, r.k, RX + 12, y + 27, r.on ? p.ink : p.muted, 14, 'left', 700)
      text(ctx, r.d, RX + 96, y + 27, p.muted, 11, 'left', 500)
      if (r.on) text(ctx, sgn(r.v, 4, tr), RX + 268, y + 27, p.ink, 14, 'right', 700)
      if (i < 3) text(ctx, '×', RX + 140, y + 56, p.muted, 14, 'center', 700)
    })
    const y5 = 48 + 4 * 60
    if (ph >= 3) {
      rbox(ctx, RX, y5 - 4, 280, 36, alpha(p.groups[0], 0.08), p.groups[0])
      text(ctx, tr ? `= bu noktanın payı ${sgn(c.part, 5, tr)}` : `= this point's share ${sgn(c.part, 5, tr)}`, RX + 12, y5 + 19, p.groups[0], 13, 'left', 700)
      text(ctx, tr ? '20 noktanın toplamı: ∂L/∂w1 (geri yayılım)' : 'sum over the 20 points: ∂L/∂w1 (backprop)', RX, y5 + 56, p.muted, 11, 'left', 600)
      text(ctx, sgn(g[0], 7, tr), RX, y5 + 84, p.ink, 22, 'left', 700)
    }
    if (ph === 1) {
      rbox(ctx, RX, y5 - 4, 280, 60, alpha(p.groups[1], 0.08), p.groups[1])
      text(ctx, tr ? 'w2 için zincir kısa: ∂L/∂ŷ · h' : 'the chain to w2 is short: ∂L/∂ŷ · h', RX + 12, y5 + 18, p.groups[1], 12, 'left', 700)
      text(ctx, `∂L/∂w2 = ${sgn(g[1], 4, tr)}`, RX + 12, y5 + 42, p.ink, 14, 'left', 700)
    }
    if (f.phase === 'check' && f.nudge !== undefined) {
      text(ctx, tr ? 'dürtme ölçümü (w1 + 0,000001)' : 'nudge measurement (w1 + 0.000001)', RX, y5 + 108, p.muted, 11, 'left', 600)
      text(ctx, sgn(f.nudge, 7, tr), RX, y5 + 134, p.groups[3], 22, 'left', 700)
    }
  } else {
    const r = chart(W, H, W1D[0], W1D[1], W2D[0], W2D[1], { l: RX + 44, r: 14, t: 24, b: 44 })
    const X0 = r.sx(W1D[0]), X1 = r.sx(W1D[1]), Y0 = r.sy(W2D[1]), Y1 = r.sy(W2D[0])
    if (k > 0) {
      const cell = 6, cols = Math.ceil((X1 - X0) / cell), rows = Math.ceil((Y1 - Y0) / cell)
      const vals: number[] = []
      let lo = Infinity, hi = -Infinity
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
        const q = Math.log(zkLoss(f.u, f.y, r.ix(X0 + (i + 0.5) * cell), r.iy(Y0 + (j + 0.5) * cell)) + 1e-3)
        vals.push(q); if (q < lo) lo = q; if (q > hi) hi = q
      }
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
        const t = (vals[j * cols + i] - lo) / (hi - lo || 1)
        const band = Math.floor(t * 12) % 2 ? 0.05 : 0
        ctx.fillStyle = alpha(p.groups[1], Math.max(0.03, 0.62 * (1 - t) ** 1.4 + band))
        ctx.fillRect(X0 + i * cell, Y0 + j * cell, Math.min(cell, X1 - X0 - i * cell), Math.min(cell, Y1 - Y0 - j * cell))
      }
    }
    axesR(ctx, r, [-1, 0, 1, 2, 3, 4], [0, 1, 2, 3, 4], tr ? 'w1 (diklik)' : 'w1 (steepness)', tr ? 'w2 (yükseklik)' : 'w2 (height)', p, RX + 14)
    // gerçek değerler
    const tx = r.sx(2), ty = r.sy(3)
    ctx.strokeStyle = p.ink; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(tx - 5, ty - 5); ctx.lineTo(tx + 5, ty + 5); ctx.moveTo(tx + 5, ty - 5); ctx.lineTo(tx - 5, ty + 5); ctx.stroke()
    text(ctx, tr ? 'gerçek (2, 3)' : 'true (2, 3)', tx + 8, ty - 8, p.ink, 11, 'left', 600)
    if (k > 0) {
      ctx.save(); ctx.beginPath(); ctx.rect(X0, Y0, X1 - X0, Y1 - Y0); ctx.clip()
      ctx.strokeStyle = p.brand; ctx.lineWidth = 2; ctx.beginPath()
      for (let i = 0; i < k; i++) { const X = r.sx(f.path[i][0]), Y = r.sy(f.path[i][1]); if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y) }
      ctx.stroke()
      for (let i = 0; i < k; i++) if (i < 10 || i % 5 === 0) dot(ctx, r.sx(f.path[i][0]), r.sy(f.path[i][1]), 2.4, p.brand)
      const [sw1, sw2] = f.path[0]
      dot(ctx, r.sx(sw1), r.sy(sw2), 6, p.bg); ctx.strokeStyle = p.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(r.sx(sw1), r.sy(sw2), 6, 0, Math.PI * 2); ctx.stroke()
      dot(ctx, r.sx(cur[0]), r.sy(cur[1]), 5.5, p.brand)
      ctx.restore()
    }
    if (f.phase === 'step') tag(ctx, tr ? 'optimizer.step(): w ← w − lr · ∂L/∂w' : 'optimizer.step(): w ← w − lr · ∂L/∂w', X0 + 6, Y1 - 30, p, p.brand)
  }
}
