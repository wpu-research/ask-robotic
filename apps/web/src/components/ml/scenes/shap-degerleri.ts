// SHAP sahnesi: solda şelale grafiği (taban → her özelliğin katkısı → tahmin), sağda 16 koalisyonun v(S) değerleri.
import { alpha, clear, text, type Draw } from '../draw'
import { fmt } from '@/lib/ml/core'
import { FEATS, type ShapFrame } from '@/lib/ml/shap-degerleri'

export const draw: Draw = (ctx, W, H, f0, p, lang) => {
  const f = f0 as ShapFrame
  const tr = lang === 'tr'
  const n1 = (x: number) => fmt(x, 1, lang)
  const fc = (j: number) => p.groups[[1, 4, 5, 2][j]]
  clear(ctx, W, H, p)
  // üst satır: görevin özellikleri
  text(ctx, tr ? `görev ${f.sample}` : `mission ${f.sample}`, 20, 22, p.ink, 13, 'left', 700)
  let x = 100
  FEATS.forEach((ft, j) => {
    const s = `${tr ? ft.tr : ft.en} ${fmt(f.x[j], ft.d, lang)} ${ft.unit}`
    ctx.fillStyle = fc(j); ctx.fillRect(x, 12, 10, 10)
    text(ctx, s, x + 14, 22, p.ink, 11, 'left', 600)
    ctx.font = `600 11px Poppins, system-ui, sans-serif`; x += ctx.measureText(s).width + 26
  })
  text(ctx, f.model ? (tr ? 'doğrusal model' : 'linear model') : (tr ? 'eğri model' : 'curved model'), W - 20, 22, p.muted, 11, 'right', 600)

  // --- şelale
  const gx0 = 70, gx1 = 440, gy0 = 56, gy1 = 380
  const [lo, hi] = f.yr
  const Y = (v: number) => gy1 - ((v - lo) / (hi - lo)) * (gy1 - gy0)
  ctx.strokeStyle = p.line; ctx.lineWidth = 1
  const step = (hi - lo) > 120 ? 40 : 20
  for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) {
    ctx.beginPath(); ctx.moveTo(gx0, Y(v) + 0.5); ctx.lineTo(gx1, Y(v) + 0.5); ctx.stroke()
    text(ctx, String(v), gx0 - 6, Y(v) + 4, p.muted, 10, 'right', 400)
  }
  ctx.save(); ctx.translate(16, gy1); ctx.rotate(-Math.PI / 2); text(ctx, tr ? 'pil ömrü (dakika) →' : 'battery life (minutes) →', 0, 0, p.muted, 11, 'left', 600); ctx.restore()
  const cols = 6, cw = (gx1 - gx0) / cols, bw = cw * 0.62
  const cxi = (i: number) => gx0 + cw * (i + 0.5)
  const label = (i: number, s: string, col: string) => text(ctx, s, cxi(i), gy1 + 16, col, 11, 'center', 700)
  // taban
  const bar = (i: number, a: number, b: number, col: string, a2 = 0.85) => {
    const top = Y(Math.max(a, b)), h = Math.max(1.5, Math.abs(Y(a) - Y(b)))
    ctx.fillStyle = alpha(col, a2); ctx.fillRect(cxi(i) - bw / 2, top, bw, h)
  }
  bar(0, lo, f.base, p.muted, 0.35)
  label(0, tr ? 'taban' : 'base', p.muted)
  text(ctx, n1(f.base), cxi(0), Y(f.base) - 6, p.ink, 11, 'center', 700)
  let c = f.base
  for (let j = 0; j < 4; j++) {
    label(j + 1, tr ? FEATS[j].tr : ['load', 'speed', 'temp.', 'slope'][j], fc(j))
    const ph = f.phi[j]
    if (ph === null) continue
    const nc = c + ph
    bar(j + 1, c, nc, ph >= 0 ? p.groups[3] : p.groups[0], f.feat === undefined || f.feat === j ? 0.9 : 0.55)
    ctx.strokeStyle = p.muted; ctx.setLineDash([3, 3]); ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(cxi(j) + bw / 2, Y(c)); ctx.lineTo(cxi(j + 1) - bw / 2, Y(c)); ctx.stroke(); ctx.setLineDash([])
    const s = `${ph >= 0 ? '+' : '−'}${n1(Math.abs(ph))}`
    text(ctx, s, cxi(j + 1), ph >= 0 ? Y(nc) - 6 : Y(nc) + 15, ph >= 0 ? p.groups[3] : p.groups[0], 11, 'center', 700)
    if (f.feat === j) { ctx.strokeStyle = p.ink; ctx.lineWidth = 1.5; ctx.strokeRect(cxi(j + 1) - bw / 2 - 2, Math.min(Y(c), Y(nc)) - 2, bw + 4, Math.abs(Y(c) - Y(nc)) + 4) }
    c = nc
  }
  label(5, tr ? 'tahmin' : 'prediction', p.ink)
  if (f.phi.every((v) => v !== null)) {
    ctx.strokeStyle = p.muted; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(cxi(4) + bw / 2, Y(c)); ctx.lineTo(cxi(5) - bw / 2, Y(c)); ctx.stroke(); ctx.setLineDash([])
    bar(5, lo, f.pred, p.brand, 0.85)
    text(ctx, n1(f.pred), cxi(5), Y(f.pred) - 6, p.ink, 11, 'center', 700)
  } else {
    ctx.strokeStyle = p.brand; ctx.setLineDash([4, 3]); ctx.lineWidth = 1.5
    ctx.strokeRect(cxi(5) - bw / 2, Y(f.pred), bw, Y(lo) - Y(f.pred)); ctx.setLineDash([])
    text(ctx, n1(f.pred), cxi(5), Y(f.pred) - 6, p.brand, 11, 'center', 700)
  }
  text(ctx, tr ? 'yeşil: ömrü uzatır · kırmızı: kısaltır' : 'green: extends life · red: shortens it', gx0, gy1 + 40, p.muted, 10, 'left', 500)

  // --- koalisyonlar
  const kx0 = 470, ky0 = 56, kw = 60, kh = 60
  text(ctx, tr ? '16 koalisyon: v(S), dakika' : '16 coalitions: v(S), minutes', kx0, 46, p.muted, 11, 'left', 600)
  const ORDER = Array.from({ length: 16 }, (_, S) => S).sort((a, b) => [0, 1, 2, 3].filter((j) => (a >> j) & 1).length - [0, 1, 2, 3].filter((j) => (b >> j) & 1).length || a - b)
  ORDER.forEach((S, k) => {
    const X = kx0 + (k % 4) * kw, Yy = ky0 + Math.floor(k / 4) * kh
    const v = f.vals[S]
    const hot = f.S === S || (f.feat !== undefined && (((S >> f.feat) & 1) === 1))
    ctx.fillStyle = hot ? alpha(p.brand, 0.12) : p.soft; ctx.fillRect(X + 2, Yy + 2, kw - 4, kh - 4)
    ctx.strokeStyle = f.S === S ? p.ink : p.line; ctx.lineWidth = f.S === S ? 1.8 : 1; ctx.strokeRect(X + 2, Yy + 2, kw - 4, kh - 4)
    for (let j = 0; j < 4; j++) {
      const sx = X + 10 + j * 11, sy = Yy + 10
      if ((S >> j) & 1) { ctx.fillStyle = fc(j); ctx.fillRect(sx, sy, 9, 9) } else { ctx.strokeStyle = alpha(p.muted, 0.6); ctx.lineWidth = 1; ctx.strokeRect(sx + 0.5, sy + 0.5, 8, 8) }
    }
    text(ctx, v === null ? '·' : n1(v), X + kw / 2, Yy + 44, v === null ? p.muted : p.ink, 12, 'center', 700)
  })
  const ly = ky0 + 4 * kh + 18
  text(ctx, tr ? 'dolu kare: bilinen özellik' : 'filled square: known feature', kx0, ly, p.muted, 10, 'left', 500)
  text(ctx, tr ? 'boş kare: ortalamayla doldurulur' : 'empty square: filled with the average', kx0, ly + 14, p.muted, 10, 'left', 500)
  if (f.phi.every((v) => v !== null)) {
    const sum = f.base + (f.phi as number[]).reduce((a, b) => a + b, 0)
    text(ctx, tr ? 'taban + katkılar' : 'base + contributions', kx0, ly + 44, p.muted, 11, 'left', 600)
    text(ctx, `${n1(f.base)} ${(f.phi as number[]).map((v) => `${v >= 0 ? '+' : '−'} ${n1(Math.abs(v))}`).join(' ')}`, kx0, ly + 62, p.ink, 11, 'left', 600)
    text(ctx, `= ${n1(sum)} ${tr ? 'dk' : 'min'}`, kx0, ly + 82, p.brand, 14, 'left', 700)
  }
}
