// Sahne: rastgele orman. Solda büyük panel: ormanın oylanmış karar bölgesi (ya da büyümekte olan ilk ağaç, torba gösterimi).
// Sağda 5×5 küçük panel: her ağacın kendi bölgesi, ağaç kuruldukça birikir; altında test doğruluğu – ağaç sayısı eğrisi.
import { alpha, axes, chart, clear, dot, inset, text, type Draw } from '../draw'
import { forestVote, treeP, type RfFrame } from '@/lib/ml/rastgele-orman'
import { fmt } from '@/lib/ml/core'

const VX0 = 0, VX1 = 12, TY0 = 20, TY1 = 90

export const draw: Draw = (ctx, W, H, f0, p, lang) => {
  const f = f0 as RfFrame
  const tr = lang === 'tr'
  clear(ctx, W, H, p)
  const v = chart(W, H, VX0, VX1, TY0, TY1, { l: 56, r: 292, t: 20, b: 44 })
  const FAIL = p.groups[0], OK = p.groups[3]
  // büyük panel: oy oranı (ya da büyüyen ağaç)
  const share = f.depth !== undefined ? (x: number, y: number) => (treeP(f.trees[0], x, y, f.depth) > 0.5 ? 1 : 0)
    : f.k > 0 ? (x: number, y: number) => forestVote(f.trees, f.k, x, y) : null
  if (share) {
    const cell = 7
    for (let py = v.sy(TY1); py < v.sy(TY0); py += cell) for (let px = v.sx(VX0); px < v.sx(VX1); px += cell) {
      const q = share(v.ix(px + cell / 2), v.iy(py + cell / 2))
      ctx.fillStyle = alpha(q > 0.5 ? FAIL : OK, 0.05 + 0.24 * Math.abs(q - 0.5) * 2)
      ctx.fillRect(px, py, Math.min(cell, v.sx(VX1) - px), Math.min(cell, v.sy(TY0) - py))
    }
  }
  axes(ctx, v, [0, 2, 4, 6, 8, 10, 12], [20, 30, 40, 50, 60, 70, 80, 90], tr ? 'titreşim (mm/s)' : 'vibration (mm/s)', tr ? 'sıcaklık (°C)' : 'temperature (°C)', p, W, H)
  // büyüyen ağacın bölmeleri
  if (f.depth !== undefined) {
    const t = f.trees[0]
    const walk = (i: number, x0: number, x1: number, y0: number, y1: number) => {
      const n = t[i]
      if (n.f < 0 || n.d >= f.depth!) return
      ctx.strokeStyle = p.ink; ctx.lineWidth = Math.max(1, 2.6 - n.d * 0.4); ctx.beginPath()
      if (n.f === 0) { ctx.moveTo(v.sx(n.t), v.sy(y0)); ctx.lineTo(v.sx(n.t), v.sy(y1)); ctx.stroke(); walk(n.L, x0, n.t, y0, y1); walk(n.R, n.t, x1, y0, y1) }
      else { ctx.moveTo(v.sx(x0), v.sy(n.t)); ctx.lineTo(v.sx(x1), v.sy(n.t)); ctx.stroke(); walk(n.L, x0, x1, y0, n.t); walk(n.R, x0, x1, n.t, y1) }
    }
    walk(0, VX0, VX1, TY0, TY1)
  }
  // noktalar (torba gösteriminde boyut = çekiliş sayısı)
  f.X.forEach((q, i) => {
    const col = q.c ? FAIL : OK
    const X = v.sx(q.x), Y = v.sy(q.y)
    if (f.boot) {
      const c = f.boot[i]
      if (!c) { ctx.strokeStyle = alpha(col, 0.45); ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(X, Y, 2.6, 0, Math.PI * 2); ctx.stroke() }
      else dot(ctx, X, Y, 2.4 + 1.3 * Math.min(c, 3), col)
    } else dot(ctx, X, Y, 3, col)
  })
  // sağ: 5×5 ağaç panelleri
  const gx = W - 272, gy = 20, ts = 48, gap = 4
  text(ctx, tr ? 'tek tek ağaçlar' : 'individual trees', gx, gy - 6 + 2, p.muted, 10, 'left', 600)
  for (let j = 0; j < 25; j++) {
    const x = gx + (j % 5) * (ts + gap), y = gy + 4 + Math.floor(j / 5) * (ts + gap)
    const built = j < f.k
    ctx.fillStyle = p.soft; ctx.fillRect(x, y, ts, ts)
    if (built && j < f.trees.length) {
      const c = 4
      for (let a = 0; a < ts; a += c) for (let b = 0; b < ts; b += c) {
        const xx = VX0 + ((a + c / 2) / ts) * (VX1 - VX0), yy = TY1 - ((b + c / 2) / ts) * (TY1 - TY0)
        ctx.fillStyle = alpha(treeP(f.trees[j], xx, yy) > 0.5 ? FAIL : OK, 0.55)
        ctx.fillRect(x + a, y + b, c, c)
      }
    }
    ctx.strokeStyle = j === f.cur ? p.brand : p.line; ctx.lineWidth = j === f.cur ? 2.5 : 1
    ctx.strokeRect(x + 0.5, y + 0.5, ts - 1, ts - 1)
    if (!built && j < f.trees.length) text(ctx, String(j + 1), x + ts / 2, y + ts / 2 + 4, p.muted, 10, 'center', 500)
  }
  // test doğruluğu eğrisi
  const iy = gy + 4 + 5 * (ts + gap) + 8
  const shown = f.acc.slice(0, Math.max(0, f.k))
  inset(ctx, gx, iy, 5 * ts + 4 * gap, 118, [{ v: shown, col: p.brand }], tr ? 'test doğruluğu · ağaç sayısı' : 'test accuracy · number of trees', p, { n: Math.max(5, f.acc.length) })
  if (shown.length) {
    const a = shown[shown.length - 1]
    text(ctx, tr ? `%${fmt(a * 100, 1, 'tr')}` : `${(a * 100).toFixed(1)}%`, gx + 5 * ts + 4 * gap - 8, iy + 15, p.ink, f.done ? 15 : 12, 'right', 700)
    text(ctx, tr ? `${f.k} ağaç` : `${f.k} ${f.k === 1 ? 'tree' : 'trees'}`, gx, iy + 118 + 16, p.muted, 11, 'left', 600)
  }
  // gösterge
  let lx = v.sx(VX0) + 8
  const L = tr ? ['arıza', 'sağlam'] : ['failed', 'healthy']
  ;[FAIL, OK].forEach((c, i) => { dot(ctx, lx + 4, H - 14, 4, c); text(ctx, L[i], lx + 12, H - 10, p.muted, 11); lx += ctx.measureText(L[i]).width + 30 })
  if (f.boot) { ctx.strokeStyle = p.muted; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(lx + 4, H - 14, 3, 0, Math.PI * 2); ctx.stroke(); text(ctx, tr ? 'torbada yok' : 'not in bag', lx + 12, H - 10, p.muted, 11) }
}
