// Sahne: gradyan artırma. Üstte uçuşlar ve basamak basamak iyileşen toplam model; altta kalıntılar ve o turun kütüğü;
// sağda kayıp eğrisi (log) ve tur sayacı.
import { alpha, axes, chart, clear, dot, inset, text, type Draw } from '../draw'
import { gbPredict, stumpAt, type GbFrame } from '@/lib/ml/gradyan-artirma'
import { fmt } from '@/lib/ml/core'

const XS = [-10, 0, 10, 20, 30, 40, 50]
const NICE = [1, 2, 3, 5, 10, 15, 20, 25, 30, 40, 80]

export const draw: Draw = (ctx, W, H, f0, p, lang) => {
  const f = f0 as GbFrame
  const tr = lang === 'tr'
  clear(ctx, W, H, p)
  const RW = 216
  const top = chart(W, H, -10, 50, 20, 70, { l: 56, r: RW, t: 20, b: H - 236 })
  axes(ctx, top, XS, [20, 30, 40, 50, 60, 70], '', tr ? 'uçuş süresi (dk)' : 'flight time (min)', p, W, H)
  const model = (m: number, x: number) => gbPredict(f.F0, f.lr, f.stumps, m, x)
  const curve = (m: number, col: string, lw: number, dash: number[] = []) => {
    ctx.save(); ctx.beginPath(); ctx.rect(top.sx(-10), top.sy(70), top.sx(50) - top.sx(-10), top.sy(20) - top.sy(70)); ctx.clip()
    ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.setLineDash(dash); ctx.beginPath()
    for (let i = 0; i <= 360; i++) { const x = -10 + (60 * i) / 360; const X = top.sx(x), Y = top.sy(model(m, x)); if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y) }
    ctx.stroke(); ctx.setLineDash([]); ctx.restore()
  }
  f.T.forEach((x, i) => dot(ctx, top.sx(x), top.sy(f.y[i]), 3.6, p.groups[1]))
  if (f.show !== undefined && f.m === f.show + 1) curve(f.m - 1, alpha(p.brand, 0.35), 2, [5, 4])
  curve(f.m, p.brand, 3)
  // alt panel: kalıntı ve kütük
  const res = f.res ?? f.m
  const r = f.T.map((x, i) => f.y[i] - model(res, x))
  const st = f.show !== undefined ? f.stumps[f.show] : undefined
  const peak = Math.max(...r.map(Math.abs), st ? Math.max(Math.abs(st.a), Math.abs(st.b)) : 0) * 1.1
  const R = NICE.find((q) => q >= peak) ?? NICE[NICE.length - 1]
  const bot = chart(W, H, -10, 50, -R, R, { l: 56, r: RW, t: 280, b: 44 })
  axes(ctx, bot, XS, [-R, -R / 2, 0, R / 2, R], tr ? 'ortam sıcaklığı (°C)' : 'air temperature (°C)', tr ? 'kalıntı (dk)' : 'residual (min)', p, W, H, String, (q) => fmt(q, Number.isInteger(q) ? 0 : 1, lang))
  ctx.strokeStyle = p.muted; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(bot.sx(-10), bot.sy(0)); ctx.lineTo(bot.sx(50), bot.sy(0)); ctx.stroke()
  r.forEach((q, i) => {
    const X = bot.sx(f.T[i]), Y = bot.sy(Math.max(-R, Math.min(R, q)))
    ctx.strokeStyle = alpha(p.groups[0], 0.6); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(X, bot.sy(0)); ctx.lineTo(X, Y); ctx.stroke()
    dot(ctx, X, Y, 2.6, p.groups[0])
  })
  if (st) {
    ctx.strokeStyle = p.groups[2]; ctx.lineWidth = 3; ctx.beginPath()
    ctx.moveTo(bot.sx(-10), bot.sy(stumpAt(st, -10))); ctx.lineTo(bot.sx(st.t), bot.sy(st.a)); ctx.lineTo(bot.sx(st.t), bot.sy(st.b)); ctx.lineTo(bot.sx(50), bot.sy(st.b)); ctx.stroke()
    ctx.setLineDash([3, 3]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(bot.sx(st.t), bot.sy(R)); ctx.lineTo(bot.sx(st.t), bot.sy(-R)); ctx.stroke(); ctx.setLineDash([])
  }
  // sağ sütun
  const x0 = W - RW + 14, w = RW - 24
  const seen = f.loss.slice(0, f.m + 1)
  inset(ctx, x0, 20, w, 150, [{ v: seen, col: p.groups[0] }], tr ? 'kayıp (ort. kare hata, log)' : 'loss (mean sq. error, log)', p, { log: true, n: Math.max(2, f.loss.length) })
  text(ctx, tr ? `tur ${f.m}` : `round ${f.m}`, x0, 206, p.ink, 22, 'left', 700)
  text(ctx, `${tr ? 'kayıp' : 'loss'} ${fmt(f.loss[f.m], 2, lang)}`, x0, 228, p.muted, 12, 'left', 600)
  text(ctx, `${tr ? 'öğrenme oranı' : 'learning rate'} ${fmt(f.lr, 2, lang)}`, x0, 246, p.muted, 12, 'left', 600)
  // gösterge
  const L: Array<[string, string, number]> = [
    [tr ? 'uçuş' : 'flight', p.groups[1], 0],
    [tr ? 'model (toplam)' : 'model (sum)', p.brand, 1],
    [tr ? 'kalıntı' : 'residual', p.groups[0], 0],
    [tr ? 'bu turun kütüğü' : "this round's stump", p.groups[2], 1],
  ]
  L.forEach(([s, col, line], i) => {
    const y = 296 + i * 22
    if (line) { ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0, y - 4); ctx.lineTo(x0 + 16, y - 4); ctx.stroke() } else dot(ctx, x0 + 8, y - 4, 4, col)
    text(ctx, s, x0 + 24, y, p.muted, 11)
  })
}
