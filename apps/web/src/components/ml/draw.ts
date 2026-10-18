// Makine öğrenmesi sahneleri: canvas çizimleri (ders slug'ına göre). Renkler kapsayıcının CSS değişkenlerinden okunur.
import type { Frame, Lang } from '@/lib/ml/core'
import type { KMeansFrame } from '@/lib/ml/kmeans'
import type { RegFrame } from '@/lib/ml/regression'
import { polyval, type OverfitFrame } from '@/lib/ml/overfit'
import { knnPredict, type KnnFrame } from '@/lib/ml/knn'
import { nbPredict, type NBFrame, type NBModel } from '@/lib/ml/naive-bayes'
import type { TreeFrame } from '@/lib/ml/tree'
import type { PcaFrame } from '@/lib/ml/pca'
import type { PerFrame } from '@/lib/ml/perceptron'
import { forward, type MlpFrame } from '@/lib/ml/mlp'

export interface Pal { bg: string; soft: string; ink: string; muted: string; line: string; brand: string; groups: string[] }

export function readPal(el: Element): Pal {
  const cs = getComputedStyle(el)
  const g = (n: string, d: string) => cs.getPropertyValue(n).trim() || d
  return {
    bg: g('--surface', '#ffffff'), soft: g('--bg-soft', '#f8f1e7'), ink: g('--ink', '#2a1d16'), muted: g('--muted', '#6e6156'),
    line: g('--line', '#ebe1d6'), brand: g('--brand', '#7a4426'),
    groups: [g('--ml-c0', '#c8414b'), g('--ml-c1', '#2c7bb6'), g('--ml-c2', '#d99a00'), g('--ml-c3', '#3f7d3a'), g('--ml-c4', '#8e5ea2'), g('--ml-c5', '#e07a2e')],
  }
}

/** Dünya koordinatlarını (x sağa, y yukarı) tuvale eşler. */
export interface View { sx: (x: number) => number; sy: (y: number) => number; ix: (px: number) => number; iy: (py: number) => number; s: number }
export function view(W: number, H: number, x0: number, x1: number, y0: number, y1: number, pad = 28): View {
  const s = Math.min((W - 2 * pad) / (x1 - x0), (H - 2 * pad) / (y1 - y0))
  const ox = (W - s * (x1 - x0)) / 2, oy = (H - s * (y1 - y0)) / 2
  return {
    s,
    sx: (x) => ox + (x - x0) * s,
    sy: (y) => H - oy - (y - y0) * s,
    ix: (px) => x0 + (px - ox) / s,
    iy: (py) => y0 + (H - oy - py) / s,
  }
}
/** Grafik görünümü: x ve y ayrı ölçeklenir (eksen adları için solda ve altta pay). */
export function chart(W: number, H: number, x0: number, x1: number, y0: number, y1: number, pad = { l: 56, r: 20, t: 20, b: 44 }): View {
  const kx = (W - pad.l - pad.r) / (x1 - x0), ky = (H - pad.t - pad.b) / (y1 - y0)
  return {
    s: kx,
    sx: (x) => pad.l + (x - x0) * kx,
    sy: (y) => H - pad.b - (y - y0) * ky,
    ix: (px) => x0 + (px - pad.l) / kx,
    iy: (py) => y0 + (H - pad.b - py) / ky,
  }
}

export const FONT = 'Poppins, system-ui, sans-serif'
export function text(ctx: CanvasRenderingContext2D, s: string, x: number, y: number, col: string, size = 12, align: CanvasTextAlign = 'left', weight = 500) {
  ctx.fillStyle = col; ctx.font = `${weight} ${size}px ${FONT}`; ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.fillText(s, x, y)
}
/** Etiket kutusu (sahne üstündeki kısa notlar). */
export function tag(ctx: CanvasRenderingContext2D, s: string, x: number, y: number, p: Pal, col = p.ink) {
  ctx.font = `600 12px ${FONT}`
  const w = ctx.measureText(s).width + 16
  ctx.fillStyle = p.bg; ctx.strokeStyle = col; ctx.lineWidth = 1.2
  ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, 22, 11); else ctx.rect(x, y, w, 22); ctx.fill(); ctx.stroke()
  text(ctx, s, x + 8, y + 15, col, 12, 'left', 600)
  return w
}
export function scaleBar(ctx: CanvasRenderingContext2D, v: View, meters: number, label: string, p: Pal, H: number) {
  const x = 16, y = H - 14, w = meters * v.s
  ctx.strokeStyle = p.muted; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, y - 4); ctx.lineTo(x, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y - 4); ctx.stroke()
  text(ctx, label, x + w / 2, y - 6, p.muted, 10, 'center')
}
export function clear(ctx: CanvasRenderingContext2D, W: number, H: number, p: Pal) {
  ctx.fillStyle = p.bg; ctx.fillRect(0, 0, W, H)
}
export const alpha = (hex: string, a: number) => {
  const m = /^#([0-9a-f]{6})$/i.exec(hex)
  if (!m) return hex
  const n = parseInt(m[1], 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}
/** Karar bölgeleri: kaba ızgarada her hücreye sınıfın soluk rengi. */
export function regions(ctx: CanvasRenderingContext2D, W: number, H: number, v: View, cls: (x: number, y: number) => number, p: Pal, cell = 8, a = 0.13) {
  for (let py = 0; py < H; py += cell) for (let px = 0; px < W; px += cell) {
    const c = cls(v.ix(px + cell / 2), v.iy(py + cell / 2))
    if (c < 0) continue
    ctx.fillStyle = alpha(p.groups[c % p.groups.length], a)
    ctx.fillRect(px, py, cell, cell)
  }
}
export function dot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, col: string) {
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
}


/** Eksenler: ızgara çizgileri, değerler ve eksen adları. */
export function axes(ctx: CanvasRenderingContext2D, v: View, xs: number[], ys: number[], xl: string, yl: string, p: Pal, W: number, H: number, fx = (x: number) => String(x), fy = (y: number) => String(y)) {
  ctx.strokeStyle = p.line; ctx.lineWidth = 1
  for (const x of xs) { ctx.beginPath(); ctx.moveTo(v.sx(x) + .5, v.sy(ys[0])); ctx.lineTo(v.sx(x) + .5, v.sy(ys[ys.length - 1])); ctx.stroke(); text(ctx, fx(x), v.sx(x), v.sy(ys[0]) + 15, p.muted, 10, 'center', 400) }
  for (const y of ys) { ctx.beginPath(); ctx.moveTo(v.sx(xs[0]), v.sy(y) + .5); ctx.lineTo(v.sx(xs[xs.length - 1]), v.sy(y) + .5); ctx.stroke(); text(ctx, fy(y), v.sx(xs[0]) - 6, v.sy(y) + 4, p.muted, 10, 'right', 400) }
  text(ctx, xl, v.sx(xs[xs.length - 1]), v.sy(ys[0]) + 30, p.muted, 11, 'right', 600)
  ctx.save(); ctx.translate(14, v.sy(ys[ys.length - 1])); ctx.rotate(-Math.PI / 2); text(ctx, yl, 0, 0, p.muted, 11, 'right', 600); ctx.restore()
  void W; void H
}

/** Küçük çizgi grafiği (ör. dönemlere göre kayıp). Seriler aynı y ölçeğinde; log: logaritmik y. */
export function inset(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, series: Array<{ v: number[]; col: string }>, title: string, p: Pal, opts: { log?: boolean; n?: number; mark?: number } = {}) {
  ctx.fillStyle = p.bg; ctx.strokeStyle = p.line; ctx.lineWidth = 1
  ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, 6); else ctx.rect(x, y, w, h); ctx.fill(); ctx.stroke()
  text(ctx, title, x + 8, y + 14, p.muted, 10, 'left', 600)
  const f = (q: number) => (opts.log ? Math.log10(Math.max(q, 1e-6)) : q)
  const all = series.flatMap((s) => s.v.filter(Number.isFinite).map(f))
  if (!all.length) return
  const lo = Math.min(...all), hi = Math.max(...all)
  const n = opts.n ?? Math.max(...series.map((s) => s.v.length))
  const px = (i: number) => x + 8 + (i / Math.max(1, n - 1)) * (w - 16)
  const py = (q: number) => y + h - 8 - ((f(q) - lo) / (hi - lo || 1)) * (h - 30)
  for (const s of series) {
    ctx.strokeStyle = s.col; ctx.lineWidth = 1.8; ctx.beginPath()
    let started = false
    s.v.forEach((q, i) => { if (!Number.isFinite(q)) return; const X = px(i), Y = Math.max(y + 18, Math.min(y + h - 6, py(q))); if (started) ctx.lineTo(X, Y); else { ctx.moveTo(X, Y); started = true } })
    ctx.stroke()
  }
  if (opts.mark !== undefined) { ctx.strokeStyle = p.ink; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(px(opts.mark), y + 18); ctx.lineTo(px(opts.mark), y + h - 6); ctx.stroke(); ctx.setLineDash([]) }
}

export type Draw = (ctx: CanvasRenderingContext2D, W: number, H: number, f: Frame, p: Pal, lang: Lang) => void

function drawKMeans(ctx: CanvasRenderingContext2D, W: number, H: number, f0: Frame, p: Pal, lang: Lang) {
  const f = f0 as KMeansFrame
  const v = view(W, H, 0, 10, 0, 6.2, 22)
  clear(ctx, W, H, p)
  // oda çerçevesi
  ctx.strokeStyle = p.line; ctx.lineWidth = 1; ctx.strokeRect(v.sx(0), v.sy(6.2), 10 * v.s, 6.2 * v.s)
  if (f.C.length && f.g) {
    const C = f.C
    regions(ctx, W, H, v, (x, y) => { let bj = 0, bd = Infinity; C.forEach((c, j) => { const d = (x - c[0]) ** 2 + (y - c[1]) ** 2; if (d < bd) { bd = d; bj = j } }); return bj }, p, 10, 0.08)
  }
  for (let i = 0; i < f.pts.length; i++) {
    const q = f.pts[i]
    dot(ctx, v.sx(q.x), v.sy(q.y), 2.4, f.g ? p.groups[f.g[i] % p.groups.length] : p.muted)
  }
  // örnek noktanın merkezlere uzaklığı
  if (f.probe !== undefined && f.C.length) {
    const q = f.pts[f.probe]
    f.C.forEach((c, j) => {
      ctx.strokeStyle = p.groups[j]; ctx.setLineDash([4, 3]); ctx.lineWidth = 1.2
      ctx.beginPath(); ctx.moveTo(v.sx(q.x), v.sy(q.y)); ctx.lineTo(v.sx(c[0]), v.sy(c[1])); ctx.stroke(); ctx.setLineDash([])
      const d = Math.hypot(q.x - c[0], q.y - c[1])
      text(ctx, `${d.toFixed(1)} m`, (v.sx(q.x) + v.sx(c[0])) / 2 + 4, (v.sy(q.y) + v.sy(c[1])) / 2 - 4, p.groups[j], 11, 'left', 600)
    })
    ctx.strokeStyle = p.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(v.sx(q.x), v.sy(q.y), 6, 0, Math.PI * 2); ctx.stroke()
  }
  // merkez yolları ve merkezler
  f.paths.forEach((path, j) => {
    if (path.length < 2) return
    ctx.strokeStyle = p.groups[j]; ctx.lineWidth = 2; ctx.globalAlpha = 0.7
    ctx.beginPath(); path.forEach(([x, y], i) => (i ? ctx.lineTo(v.sx(x), v.sy(y)) : ctx.moveTo(v.sx(x), v.sy(y)))); ctx.stroke(); ctx.globalAlpha = 1
  })
  f.C.forEach(([x, y], j) => {
    const X = v.sx(x), Y = v.sy(y)
    dot(ctx, X, Y, 9, p.bg)
    ctx.strokeStyle = p.groups[j]; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(X, Y, 9, 0, Math.PI * 2); ctx.stroke()
    ctx.strokeStyle = p.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(X - 4, Y); ctx.lineTo(X + 4, Y); ctx.moveTo(X, Y - 4); ctx.lineTo(X, Y + 4); ctx.stroke()
  })
  if (!f.g && !f.C.length) {
    const L = lang === 'tr' ? ['duvar?', 'kanepe?', 'masa?'] : ['wall?', 'sofa?', 'table?']
    text(ctx, L[0], v.sx(5.1), v.sy(5.75), p.muted, 13, 'center', 600)
    text(ctx, L[1], v.sx(1.9), v.sy(2.85), p.muted, 13, 'center', 600)
    text(ctx, L[2], v.sx(8.0), v.sy(3.0), p.muted, 13, 'center', 600)
  }
  // denemeler çizelgesi (sağ üst)
  if (f.tries?.length) {
    const x0 = W - 14 - 10 * 16
    f.tries.forEach((t, i) => {
      const best = f.bestTry === i + 1
      ctx.fillStyle = t.ok ? p.groups[3] : p.groups[0]; ctx.globalAlpha = best ? 1 : 0.55
      ctx.fillRect(x0 + i * 16, 12, 12, 12); ctx.globalAlpha = 1
      if (best) { ctx.strokeStyle = p.ink; ctx.lineWidth = 2; ctx.strokeRect(x0 + i * 16 - 2, 10, 16, 16) }
    })
    text(ctx, lang === 'tr' ? 'denemeler' : 'tries', x0, 40, p.muted, 10)
  }
  scaleBar(ctx, v, 1, '1 m', p, H)
}


function drawRegression(ctx: CanvasRenderingContext2D, W: number, H: number, f0: Frame, p: Pal, lang: Lang) {
  const f = f0 as RegFrame
  clear(ctx, W, H, p)
  const v = chart(W, H, 0, 260, 0, 60)
  axes(ctx, v, [0, 50, 100, 150, 200, 250], [0, 10, 20, 30, 40, 50, 60], 'PWM', lang === 'tr' ? 'hız (cm/s)' : 'speed (cm/s)', p, W, H)
  const yhat = (pwm: number) => f.w * ((pwm - f.mu) / f.sigma) + f.b
  if (f.resid && Number.isFinite(f.w)) {
    ctx.strokeStyle = p.groups[0]; ctx.globalAlpha = .55; ctx.lineWidth = 1.2
    f.pwm.forEach((x, i) => { ctx.beginPath(); ctx.moveTo(v.sx(x), v.sy(f.speed[i])); ctx.lineTo(v.sx(x), v.sy(Math.max(0, Math.min(60, yhat(x))))); ctx.stroke() })
    ctx.globalAlpha = 1
  }
  f.pwm.forEach((x, i) => dot(ctx, v.sx(x), v.sy(f.speed[i]), 4, p.groups[1]))
  if (f.scaled) {
    const m = v.sx(f.mu)
    ctx.strokeStyle = p.brand; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(m, v.sy(0)); ctx.lineTo(m, v.sy(60)); ctx.stroke(); ctx.setLineDash([])
    tag(ctx, lang === 'tr' ? 'x = 0 (ortalama)' : 'x = 0 (mean)', m + 6, v.sy(58), p, p.brand)
  }
  if (Number.isFinite(f.w) && Number.isFinite(f.b)) {
    ctx.save(); ctx.beginPath(); ctx.rect(v.sx(0), v.sy(60), v.sx(260) - v.sx(0), v.sy(0) - v.sy(60)); ctx.clip()
    ctx.strokeStyle = p.brand; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(v.sx(0), v.sy(yhat(0))); ctx.lineTo(v.sx(260), v.sy(yhat(260))); ctx.stroke(); ctx.restore()
  }
  if (f.loss.length) inset(ctx, v.sx(0) + 10, v.sy(60) + 6, 200, 96, [{ v: f.loss, col: p.groups[0] }], lang === 'tr' ? 'kayıp (log)' : 'loss (log)', p, { log: true, n: 60 })
}

function drawOverfit(ctx: CanvasRenderingContext2D, W: number, H: number, f0: Frame, p: Pal, lang: Lang) {
  const f = f0 as OverfitFrame
  clear(ctx, W, H, p)
  const v = chart(W, H, 10, 80, 0, 3.2, { l: 56, r: 230, t: 20, b: 44 })
  axes(ctx, v, [10, 20, 30, 40, 50, 60, 70, 80], [0, 0.5, 1, 1.5, 2, 2.5, 3], lang === 'tr' ? 'uzaklık (cm)' : 'distance (cm)', lang === 'tr' ? 'gerilim (V)' : 'voltage (V)', p, W, H, String, (y) => (lang === 'tr' ? String(y).replace('.', ',') : String(y)))
  if (f.showTest) f.dt.forEach((x, i) => { ctx.strokeStyle = p.groups[2]; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(v.sx(x), v.sy(f.vt[i]), 4, 0, Math.PI * 2); ctx.stroke() })
  f.d.forEach((x, i) => dot(ctx, v.sx(x), v.sy(f.v[i]), 4.5, p.groups[1]))
  if (f.coef) {
    ctx.save(); ctx.beginPath(); ctx.rect(v.sx(10), v.sy(3.2), v.sx(80) - v.sx(10), v.sy(0) - v.sy(3.2)); ctx.clip()
    ctx.strokeStyle = p.brand; ctx.lineWidth = 2.6; ctx.beginPath()
    for (let i = 0; i <= 280; i++) { const x = 10 + (70 * i) / 280; const y = polyval(f.coef, x); const X = v.sx(x), Y = v.sy(Math.max(-1, Math.min(4.2, y))); if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y) }
    ctx.stroke(); ctx.restore()
  }
  // sağda: dereceye göre hata
  const x0 = W - 214
  inset(ctx, x0, 20, 200, 200, [{ v: f.train, col: p.groups[1] }, { v: f.test, col: p.groups[2] }], lang === 'tr' ? 'hata (log) · derece 1–12' : 'error (log) · degree 1–12', p, { log: true, n: 12, mark: f.best ? f.best - 1 : undefined })
  dot(ctx, x0 + 12, 236, 4, p.groups[1]); text(ctx, lang === 'tr' ? 'eğitim' : 'training', x0 + 22, 240, p.muted, 11)
  ctx.strokeStyle = p.groups[2]; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(x0 + 12, 254, 4, 0, Math.PI * 2); ctx.stroke(); text(ctx, lang === 'tr' ? 'doğrulama' : 'validation', x0 + 22, 258, p.muted, 11)
  if (f.deg) { text(ctx, `${lang === 'tr' ? 'derece' : 'degree'} ${f.deg}`, x0, 300, p.ink, 22, 'left', 700) }
}

const KNN_V = (W: number, H: number) => chart(W, H, 10, 90, 20, 95, { l: 56, r: 20, t: 20, b: 44 })
function drawKnn(ctx: CanvasRenderingContext2D, W: number, H: number, f0: Frame, p: Pal, lang: Lang) {
  const f = f0 as KnnFrame
  clear(ctx, W, H, p)
  const v = KNN_V(W, H)
  if (f.regions) regions(ctx, W, H, v, (x, y) => (x < 10 || x > 90 || y < 20 || y > 95 ? -1 : knnPredict(f.X, x, y, f.k).pred), p, 8, 0.16)
  axes(ctx, v, [10, 30, 50, 70, 90], [20, 40, 60, 80], lang === 'tr' ? 'ton' : 'hue', lang === 'tr' ? 'parlaklık' : 'brightness', p, W, H)
  const near = new Set(f.near ?? [])
  f.X.forEach((q, i) => dot(ctx, v.sx(q.x), v.sy(q.y), near.has(i) ? 5.5 : 4, p.groups[q.c]))
  f.test?.forEach((q) => { ctx.strokeStyle = p.groups[q.pred]; ctx.lineWidth = 2; ctx.strokeRect(v.sx(q.x) - 4, v.sy(q.y) - 4, 8, 8); if (q.pred !== q.c) { ctx.strokeStyle = p.ink; ctx.beginPath(); ctx.moveTo(v.sx(q.x) - 6, v.sy(q.y) - 6); ctx.lineTo(v.sx(q.x) + 6, v.sy(q.y) + 6); ctx.stroke() } })
  f.done.forEach((q) => { dot(ctx, v.sx(q.x), v.sy(q.y), 7, p.groups[q.pred]); ctx.strokeStyle = p.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(v.sx(q.x), v.sy(q.y), 7, 0, Math.PI * 2); ctx.stroke() })
  if (f.q) {
    const Q = f.q, X = v.sx(Q.x), Y = v.sy(Q.y)
    if (f.near) {
      const far = f.near.at(-1)!
      const R = Math.hypot(v.sx(f.X[far].x) - X, v.sy(f.X[far].y) - Y)
      ctx.strokeStyle = p.ink; ctx.setLineDash([4, 4]); ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(X, Y, R, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([])
      f.near.forEach((i) => { ctx.strokeStyle = p.groups[f.X[i].c]; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(X, Y); ctx.lineTo(v.sx(f.X[i].x), v.sy(f.X[i].y)); ctx.stroke() })
    } else {
      ctx.strokeStyle = p.line; ctx.lineWidth = 0.7
      f.X.forEach((q) => { ctx.beginPath(); ctx.moveTo(X, Y); ctx.lineTo(v.sx(q.x), v.sy(q.y)); ctx.stroke() })
    }
    dot(ctx, X, Y, 9, f.pred !== undefined ? p.groups[f.pred] : p.bg)
    ctx.strokeStyle = p.ink; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(X, Y, 9, 0, Math.PI * 2); ctx.stroke()
    text(ctx, '?', X, Y + 4, p.ink, 12, 'center', 700)
    if (f.votes) {
      const names = lang === 'tr' ? ['top', 'silindir', 'küp'] : ['ball', 'cylinder', 'cube']
      let y = 30
      f.votes.forEach((n, c) => { const w = tag(ctx, `${names[c]}: ${n}`, W - 130, y, p, p.groups[c]); void w; y += 28 })
    }
  }
  const names = lang === 'tr' ? ['kırmızı top', 'mavi silindir', 'sarı küp'] : ['red ball', 'blue cylinder', 'yellow cube']
  let lx = v.sx(10) + 8
  names.forEach((n, c) => { dot(ctx, lx + 4, H - 14, 4, p.groups[c]); text(ctx, n, lx + 12, H - 10, p.muted, 11); lx += ctx.measureText(n).width + 34 })
}

function drawNB(ctx: CanvasRenderingContext2D, W: number, H: number, f0: Frame, p: Pal, lang: Lang) {
  const f = f0 as NBFrame
  clear(ctx, W, H, p)
  const v = chart(W, H, 0, 200, 0, 100, { l: 56, r: 20, t: 70, b: 44 })
  const full = f.model.every(Boolean) ? (f.model as NBModel[]) : null
  if (f.regions && full) regions(ctx, W, H, v, (x, y) => (x < 0 || x > 200 || y < 0 || y > 100 ? -1 : nbPredict(full, x, y) ? 0 : 1), p, 8, 0.16)
  axes(ctx, v, [0, 50, 100, 150, 200], [0, 25, 50, 75, 100], lang === 'tr' ? 'ultrasonik mesafe (cm)' : 'ultrasonic distance (cm)', 'IR', p, W, H)
  // sınıf rengi: engel = kırmızı (0), boş = mavi (1)
  const col = (c: number) => p.groups[c ? 0 : 1]
  f.X.forEach((q) => dot(ctx, v.sx(q.x), v.sy(q.y), 3.8, col(q.c)))
  // üstte mesafe için çan eğrileri, sağda IR için
  f.model.forEach((M, c) => {
    if (!M) return
    const g = (z: number, m: number, s2: number) => Math.exp(-((z - m) ** 2) / (2 * s2)) / Math.sqrt(2 * Math.PI * s2)
    const peakX = g(M.m[0], M.m[0], M.v[0]), peakY = g(M.m[1], M.m[1], M.v[1])
    ctx.strokeStyle = col(c); ctx.lineWidth = f.fitC === c ? 3 : 1.8; ctx.beginPath()
    for (let i = 0; i <= 200; i += 2) { const Y = v.sy(100) - 6 - (g(i, M.m[0], M.v[0]) / peakX) * 40; if (i) ctx.lineTo(v.sx(i), Y); else ctx.moveTo(v.sx(i), Y) }
    ctx.stroke()
    ctx.beginPath()
    for (let i = 0; i <= 100; i += 1) { const X = v.sx(200) - 4 - (g(i, M.m[1], M.v[1]) / peakY) * 50; if (i) ctx.lineTo(X, v.sy(i)); else ctx.moveTo(X, v.sy(i)) }
    ctx.globalAlpha = 0.6; ctx.stroke(); ctx.globalAlpha = 1
    // ortalama ve ±1σ elipsi
    ctx.strokeStyle = col(c); ctx.setLineDash([5, 4]); ctx.lineWidth = 1.5; ctx.beginPath()
    ctx.ellipse(v.sx(M.m[0]), v.sy(M.m[1]), Math.sqrt(M.v[0]) * (v.sx(1) - v.sx(0)), Math.sqrt(M.v[1]) * (v.sy(0) - v.sy(1)), 0, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([])
  })
  f.done.forEach((q) => { dot(ctx, v.sx(q.x), v.sy(q.y), 7, col(q.pred)); ctx.strokeStyle = p.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(v.sx(q.x), v.sy(q.y), 7, 0, Math.PI * 2); ctx.stroke() })
  if (f.q) {
    const X = v.sx(f.q.x), Y = v.sy(f.q.y)
    ctx.strokeStyle = p.ink; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(X, v.sy(100)); ctx.lineTo(X, v.sy(0)); ctx.moveTo(v.sx(0), Y); ctx.lineTo(v.sx(200), Y); ctx.stroke(); ctx.setLineDash([])
    dot(ctx, X, Y, 9, f.pred !== undefined ? col(f.pred) : p.bg); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(X, Y, 9, 0, Math.PI * 2); ctx.stroke()
    text(ctx, '?', X, Y + 4, p.ink, 12, 'center', 700)
  }
  const L = lang === 'tr' ? ['engel', 'boş yol'] : ['obstacle', 'free path']
  let lx = v.sx(0) + 8
  L.forEach((n, i) => { dot(ctx, lx + 4, H - 14, 4, p.groups[i]); text(ctx, n, lx + 12, H - 10, p.muted, 11); lx += ctx.measureText(n).width + 34 })
}

function drawTree(ctx: CanvasRenderingContext2D, W: number, H: number, f0: Frame, p: Pal, lang: Lang) {
  const f = f0 as TreeFrame
  clear(ctx, W, H, p)
  const v = chart(W, H, 0, 1023, 0, 1023, { l: 56, r: 20, t: 20, b: 44 })
  const COL = [p.groups[0], p.groups[3], p.groups[1]] // sola kırmızı, düz yeşil, sağa mavi
  const alphaHex = (c: string) => c + '26'
  f.leaves.forEach(({ box, c }) => { ctx.fillStyle = alphaHex(COL[c]); ctx.fillRect(v.sx(box.x0), v.sy(box.y1), v.sx(box.x1) - v.sx(box.x0), v.sy(box.y0) - v.sy(box.y1)) })
  axes(ctx, v, [0, 256, 512, 768, 1023], [0, 256, 512, 768, 1023], lang === 'tr' ? 'sol sensör' : 'left sensor', lang === 'tr' ? 'sağ sensör' : 'right sensor', p, W, H)
  if (f.active) { const b = f.active; ctx.strokeStyle = p.brand; ctx.lineWidth = 2; ctx.setLineDash([6, 4]); ctx.strokeRect(v.sx(b.x0), v.sy(b.y1), v.sx(b.x1) - v.sx(b.x0), v.sy(b.y0) - v.sy(b.y1)); ctx.setLineDash([]) }
  f.X.forEach((q) => dot(ctx, v.sx(q.x), v.sy(q.y), 3.6, COL[q.c]))
  f.splits.forEach((s, i) => {
    ctx.strokeStyle = p.ink; ctx.lineWidth = Math.max(1, 3 - s.depth * 0.6)
    ctx.beginPath()
    if (s.f === 0) { ctx.moveTo(v.sx(s.t), v.sy(s.box.y0)); ctx.lineTo(v.sx(s.t), v.sy(s.box.y1)) } else { ctx.moveTo(v.sx(s.box.x0), v.sy(s.t)); ctx.lineTo(v.sx(s.box.x1), v.sy(s.t)) }
    ctx.stroke()
    if (i === f.splits.length - 1 && f.active) {
      const lbl = `${s.f ? (lang === 'tr' ? 'sağ' : 'right') : lang === 'tr' ? 'sol' : 'left'} ≤ ${s.t}`
      tag(ctx, lbl, s.f === 0 ? v.sx(s.t) + 6 : v.sx(s.box.x0) + 6, s.f === 0 ? v.sy(s.box.y1) + 6 : v.sy(s.t) - 28, p, p.brand)
    }
  })
  const L = lang === 'tr' ? ['sola', 'düz', 'sağa'] : ['left', 'straight', 'right']
  let lx = v.sx(0) + 8
  L.forEach((n, i) => { dot(ctx, lx + 4, H - 14, 4, COL[i]); text(ctx, n, lx + 12, H - 10, p.muted, 11); lx += ctx.measureText(n).width + 34 })
}

function drawPca(ctx: CanvasRenderingContext2D, W: number, H: number, f0: Frame, p: Pal, lang: Lang) {
  const f = f0 as PcaFrame
  clear(ctx, W, H, p)
  // eş ölçek: yönler ve açılar gerçek görünsün (sağda 220 px grafik payı)
  const v = view(W - 220, H, -3, 4, -2.2, 2.8, 44)
  axes(ctx, v, [-3, -2, -1, 0, 1, 2, 3, 4], [-2, -1, 0, 1, 2], lang === 'tr' ? 'ileri ivme ax' : 'forward ax', lang === 'tr' ? 'yan ivme ay' : 'side ay', p, W, H)
  const sh = f.centered
  const pts = f.A.map(([x, y]) => [x - sh * f.mu[0], y - sh * f.mu[1]] as [number, number])
  const a = f.angle
  pts.forEach(([x, y]) => {
    let X = x, Y = y
    if (a !== undefined && f.project) { const t = x * Math.cos(a) + y * Math.sin(a); X = x + (t * Math.cos(a) - x) * f.project; Y = y + (t * Math.sin(a) - y) * f.project }
    dot(ctx, v.sx(X), v.sy(Y), 3.2, p.groups[1])
  })
  if (sh > 0) { const ox = v.sx(0), oy = v.sy(0); ctx.strokeStyle = p.muted; ctx.beginPath(); ctx.moveTo(ox - 6, oy); ctx.lineTo(ox + 6, oy); ctx.moveTo(ox, oy - 6); ctx.lineTo(ox, oy + 6); ctx.stroke() }
  if (a !== undefined) {
    const L = 4
    ctx.save(); ctx.beginPath(); ctx.rect(v.sx(-3), v.sy(2.8), v.sx(4) - v.sx(-3), v.sy(-2.2) - v.sy(2.8)); ctx.clip()
    ctx.strokeStyle = f.found ? p.brand : p.groups[0]; ctx.lineWidth = f.found ? 3 : 2
    ctx.beginPath(); ctx.moveTo(v.sx(-L * Math.cos(a)), v.sy(-L * Math.sin(a))); ctx.lineTo(v.sx(L * Math.cos(a)), v.sy(L * Math.sin(a))); ctx.stroke(); ctx.restore()
  }
  // sağda varyans – açı grafiği
  if (f.sweep.length) {
    const x0 = W - 210, y0 = 24, w = 196, h = 170
    ctx.fillStyle = p.bg; ctx.strokeStyle = p.line; ctx.strokeRect(x0, y0, w, h)
    text(ctx, lang === 'tr' ? 'varyans · eksen açısı 0–180°' : 'variance · axis angle 0–180°', x0 + 8, y0 + 14, p.muted, 10, 'left', 600)
    const vmax = Math.max(...f.sweep.map(([, q]) => q)) * 1.05 || 1
    ctx.strokeStyle = p.groups[0]; ctx.lineWidth = 2; ctx.beginPath()
    f.sweep.forEach(([an, q], i) => { const X = x0 + 8 + (an / Math.PI) * (w - 16), Y = y0 + h - 8 - (q / vmax) * (h - 32); if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y) })
    ctx.stroke()
    if (f.found && a !== undefined) { const an = ((a % Math.PI) + Math.PI) % Math.PI; const X = x0 + 8 + (an / Math.PI) * (w - 16); ctx.strokeStyle = p.brand; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(X, y0 + 18); ctx.lineTo(X, y0 + h - 6); ctx.stroke(); ctx.setLineDash([]) }
  }
  if (f.ratio !== undefined) text(ctx, lang === 'tr' ? `%${(f.ratio * 100).toFixed(1).replace('.', ',')}` : `${(f.ratio * 100).toFixed(1)}%`, W - 210, 240, p.ink, 26, 'left', 700)
}

function drawPerceptron(ctx: CanvasRenderingContext2D, W: number, H: number, f0: Frame, p: Pal, lang: Lang) {
  const f = f0 as PerFrame
  clear(ctx, W, H, p)
  const v = chart(W, H, 0, 21, 0, 12.5, { l: 56, r: 20, t: 20, b: 44 })
  const [w0, w1] = f.w
  if (w0 || w1 || f.b) regions(ctx, W, H, v, (x, y) => (x < 0 || x > 21 || y < 0 || y > 12.5 ? -1 : w0 * x + w1 * y + f.b > 0 ? 0 : 1), p, 8, 0.12)
  axes(ctx, v, [0, 5, 10, 15, 20], [0, 3, 6, 9, 12], lang === 'tr' ? 'mesafe (m)' : 'distance (m)', lang === 'tr' ? 'hız (m/s)' : 'speed (m/s)', p, W, H)
  f.X.forEach((q, i) => {
    const X = v.sx(q.x), Y = v.sy(q.y)
    if (q.c) dot(ctx, X, Y, 4.2, p.groups[0]); else { ctx.strokeStyle = p.groups[1]; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.arc(X, Y, 4, 0, Math.PI * 2); ctx.stroke() }
    if (i === f.at) { ctx.strokeStyle = f.wrong ? p.ink : p.brand; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(X, Y, 10, 0, Math.PI * 2); ctx.stroke() }
  })
  if (w1 !== 0 || w0 !== 0) {
    ctx.save(); ctx.beginPath(); ctx.rect(v.sx(0), v.sy(12.5), v.sx(21) - v.sx(0), v.sy(0) - v.sy(12.5)); ctx.clip()
    ctx.strokeStyle = p.brand; ctx.lineWidth = 3; ctx.beginPath()
    if (Math.abs(w1) > 1e-9) { ctx.moveTo(v.sx(0), v.sy(-f.b / w1)); ctx.lineTo(v.sx(21), v.sy(-(f.b + w0 * 21) / w1)) } else { ctx.moveTo(v.sx(-f.b / w0), v.sy(0)); ctx.lineTo(v.sx(-f.b / w0), v.sy(12.5)) }
    ctx.stroke(); ctx.restore()
  }
  if (f.history.length) inset(ctx, W - 214, 26, 196, 90, [{ v: f.history, col: p.groups[0] }], lang === 'tr' ? 'dönem başına hata' : 'mistakes per epoch', p, { n: Math.max(5, f.history.length) })
  const L = lang === 'tr' ? ['fren', 'devam'] : ['brake', 'go']
  let lx = v.sx(0) + 8
  L.forEach((n, i) => { dot(ctx, lx + 4, H - 14, 4, p.groups[i]); text(ctx, n, lx + 12, H - 10, p.muted, 11); lx += ctx.measureText(n).width + 34 })
}

function drawMlp(ctx: CanvasRenderingContext2D, W: number, H: number, f0: Frame, p: Pal, lang: Lang) {
  const f = f0 as MlpFrame
  clear(ctx, W, H, p)
  const v = chart(W, H, -1.6, 2.6, -1.1, 1.6, { l: 56, r: 210, t: 20, b: 44 })
  if (f.net) {
    const net = f.net
    const cell = 7
    for (let py = 0; py < H; py += cell) for (let px = 0; px < W - 210; px += cell) {
      const x = v.ix(px + cell / 2), y = v.iy(py + cell / 2)
      if (x < -1.6 || x > 2.6 || y < -1.1 || y > 1.6) continue
      const pr = forward(net, x, y).p
      const c = pr > 0.5 ? p.groups[3] : p.groups[0]
      ctx.fillStyle = c; ctx.globalAlpha = 0.06 + 0.22 * Math.abs(pr - 0.5) * 2; ctx.fillRect(px, py, cell, cell)
    }
    ctx.globalAlpha = 1
  }
  axes(ctx, v, [-1, 0, 1, 2], [-1, 0, 1], 'x (m)', 'y (m)', p, W, H)
  f.X.forEach((q) => dot(ctx, v.sx(q.x), v.sy(q.y), 3.6, q.c ? p.groups[3] : p.groups[0]))
  // sağda ağ şeması
  const x0 = W - 196
  const layers = [2, Math.min(f.H, 10), 1]
  const lx = [x0 + 20, x0 + 88, x0 + 156]
  const ly = (n: number, i: number) => 40 + ((i + 0.5) / n) * 170
  for (let a = 0; a < 2; a++) for (let i = 0; i < layers[a]; i++) for (let j = 0; j < layers[a + 1]; j++) {
    const hot = (f.phase === 'fwd' && a === 0) || (f.phase === 'bwd' && a === 1) || (f.phase === 'bwd' && a === 0)
    ctx.strokeStyle = hot ? p.brand : p.line; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(lx[a], ly(layers[a], i)); ctx.lineTo(lx[a + 1], ly(layers[a + 1], j)); ctx.stroke()
  }
  layers.forEach((n, a) => { for (let i = 0; i < n; i++) { dot(ctx, lx[a], ly(n, i), 7, p.bg); ctx.strokeStyle = p.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(lx[a], ly(n, i), 7, 0, Math.PI * 2); ctx.stroke() } })
  text(ctx, lang === 'tr' ? `2 → ${f.H} → 1` : `2 → ${f.H} → 1`, x0 + 88, 228, p.muted, 11, 'center', 600)
  if (f.phase) text(ctx, f.phase === 'fwd' ? (lang === 'tr' ? 'ileri →' : 'forward →') : (lang === 'tr' ? '← geri yayılım' : '← backprop'), x0 + 88, 30, p.brand, 11, 'center', 700)
  if (f.loss.length > 1) inset(ctx, x0 - 8, 250, 196, 110, [{ v: f.loss, col: p.groups[0] }], lang === 'tr' ? 'kayıp (log)' : 'loss (log)', p, { log: true, n: 41 })
  const L = lang === 'tr' ? ['pistte', 'dışında'] : ['on track', 'off track']
  let lxx = v.sx(-1.6) + 8
  ;[3, 0].forEach((c, i) => { dot(ctx, lxx + 4, H - 14, 4, p.groups[c]); text(ctx, L[i], lxx + 12, H - 10, p.muted, 11); lxx += ctx.measureText(L[i]).width + 34 })
}

export const DRAW: Record<string, Draw> = {
  'k-means': drawKMeans,
  'dogrusal-regresyon': drawRegression,
  'asiri-ogrenme': drawOverfit,
  'k-en-yakin-komsu': drawKnn,
  'naive-bayes': drawNB,
  'karar-agaci': drawTree,
  pca: drawPca,
  perceptron: drawPerceptron,
  'sinir-agi': drawMlp,
}
