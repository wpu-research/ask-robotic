// Ders: tek nöron. Noktalar 0/1 seviyesinde (görev bitti / yolda kaldı), sigmoid eğrisi öğrenirken dikleşir;
// kesikli %50 çizgisi ve karar çizgisi (eşik), sağ altta kayıp grafiği.
import { alpha, axes, chart, clear, dot, inset, tag, text, type Draw } from '../draw'
import type { LogFrame } from '@/lib/ml/lojistik-noron'

const X0 = 6.4, X1 = 8.8, Y0 = -0.12, Y1 = 1.12

export const draw: Draw = (ctx, W, H, f0, p, lang) => {
  const f = f0 as LogFrame
  const tr = lang === 'tr'
  const num = (x: number, d: number) => (tr ? x.toFixed(d).replace('.', ',') : x.toFixed(d))
  clear(ctx, W, H, p)
  const v = chart(W, H, X0, X1, Y0, Y1, { l: 64, r: 20, t: 18, b: 44 })
  axes(ctx, v, [6.4, 6.8, 7.2, 7.6, 8.0, 8.4, 8.8], [Y0, 0, 0.25, 0.5, 0.75, 1], tr ? 'başlangıç gerilimi (V)' : 'starting voltage (V)', tr ? 'görev bitti mi · güven' : 'finished? · confidence', p, W, H,
    (x) => num(x, 1), (y) => (y === Y0 ? '' : y === 0 ? '0' : y === 1 ? '1' : tr ? `%${y * 100}` : `${y * 100}%`))
  const sx = (x: number) => v.sx(x), sy = (y: number) => v.sy(y)
  const conf = (V: number) => 1 / (1 + Math.exp(-(f.w * ((V - f.mu) / f.sigma) + f.b)))
  const ok = Number.isFinite(f.w) && Number.isFinite(f.b)
  // %50 çizgisi
  ctx.strokeStyle = p.muted; ctx.lineWidth = 1.2; ctx.setLineDash([6, 5])
  ctx.beginPath(); ctx.moveTo(sx(X0), sy(0.5)); ctx.lineTo(sx(X1), sy(0.5)); ctx.stroke(); ctx.setLineDash([])
  text(ctx, tr ? '%50: karar' : '50%: decide', sx(X0) + 6, sy(0.5) - 6, p.muted, 11, 'left', 600)
  // ölçekleme: ortalama çizgisi
  if (f.scaled) {
    const m = sx(f.mu)
    ctx.strokeStyle = p.brand; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(m, sy(Y0)); ctx.lineTo(m, sy(Y1)); ctx.stroke(); ctx.setLineDash([])
    tag(ctx, tr ? 'x = 0 (ortalama)' : 'x = 0 (mean)', m + 6, sy(0.86), p, p.brand)
  }
  // hatalar: noktadan eğriye dikey çizgi
  if (f.resid && ok) {
    ctx.strokeStyle = alpha(p.groups[0], 0.5); ctx.lineWidth = 1.2
    f.V.forEach((V, i) => { ctx.beginPath(); ctx.moveTo(sx(V), sy(f.done[i])); ctx.lineTo(sx(V), sy(conf(V))); ctx.stroke() })
  }
  // sigmoid eğrisi
  if (ok && (f.epoch > 0 || f.line === 6)) {
    ctx.strokeStyle = p.brand; ctx.lineWidth = 3; ctx.beginPath()
    for (let i = 0; i <= 220; i++) { const V = X0 + ((X1 - X0) * i) / 220; const Y = sy(conf(V)); if (i) ctx.lineTo(sx(V), Y); else ctx.moveTo(sx(V), Y) }
    ctx.stroke()
  }
  // karar çizgisi (güven = %50)
  const thr = ok && f.w ? f.mu - (f.b / f.w) * f.sigma : NaN
  if (Number.isFinite(thr) && thr > X0 && thr < X1 && f.epoch > 0) {
    ctx.strokeStyle = f.thr ? p.ink : alpha(p.ink, 0.45); ctx.lineWidth = f.thr ? 2 : 1.2; ctx.setLineDash([4, 4])
    ctx.beginPath(); ctx.moveTo(sx(thr), sy(Y0)); ctx.lineTo(sx(thr), sy(Y1)); ctx.stroke(); ctx.setLineDash([])
    const lbl = `${tr ? 'eşik' : 'threshold'} ${num(thr, 2)} V`
    ctx.font = `600 12px Poppins, system-ui, sans-serif`
    const w = ctx.measureText(lbl).width + 16
    tag(ctx, lbl, Math.min(sx(thr) + 8, sx(X1) - w - 4), sy(0.62), p, f.thr ? p.ink : p.muted)
  }
  // noktalar: 1 = bitti (yeşil, üstte), 0 = yolda kaldı (kırmızı, altta); üst üste binmesin diye hafif kaydırma
  f.V.forEach((V, i) => {
    const d = f.done[i]
    const jit = (((i * 37) % 7) - 3) * 0.012
    dot(ctx, sx(V), sy(d + jit), 4.6, d ? p.groups[3] : p.groups[0])
  })
  // açıklama (sol üst, noktaların olmadığı yer)
  const L = tr ? ['görev bitti (1)', 'yolda kaldı (0)'] : ['finished (1)', 'stranded (0)']
  let ly = sy(1.0) + 22
  ;[3, 0].forEach((c, i) => { dot(ctx, sx(X0) + 14, ly - 4, 4.6, p.groups[c]); text(ctx, L[i], sx(X0) + 24, ly, p.muted, 11); ly += 18 })
  if (ok && f.epoch > 0) {
    ctx.strokeStyle = p.brand; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(sx(X0) + 6, ly - 4); ctx.lineTo(sx(X0) + 22, ly - 4); ctx.stroke()
    text(ctx, tr ? 'nöronun güveni' : "neuron's confidence", sx(X0) + 28, ly, p.muted, 11)
  }
  // kayıp grafiği (sağ alt)
  if (f.loss.length) inset(ctx, sx(X1) - 196, sy(0.36), 192, 84, [{ v: f.loss, col: p.groups[0] }], tr ? `kayıp · dönem ${f.epoch}` : `loss · epoch ${f.epoch}`, p, { n: 300 })
}
