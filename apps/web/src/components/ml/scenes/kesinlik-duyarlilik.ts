// Kesinlik–duyarlılık sahnesi: iki sınıfın puan dağılımı (hatalı yukarı, sağlam aşağı) ve eşik çizgisi; sağda karışıklık matrisi
// ve kesinlik–duyarlılık eğrisi üzerinde hareket eden nokta; solda altta P, R, F1 çubukları.
import { alpha, clear, dot, text, type Draw } from '../draw'
import { fmt } from '@/lib/ml/core'
import type { PRFrame } from '@/lib/ml/kesinlik-duyarlilik'

export const draw: Draw = (ctx, W, H, f0, p, lang) => {
  const f = f0 as PRFrame
  const tr = lang === 'tr'
  const n2 = (x: number) => (Number.isFinite(x) ? fmt(x, 2, lang) : '—')
  clear(ctx, W, H, p)
  const bad = p.groups[0], good = p.groups[1]
  // --- histogram
  const hx0 = 56, hx1 = 420, hy0 = 50, hmid = 158, hy1 = 266
  text(ctx, tr ? 'modelin "hatalı" puanı' : 'the model\'s "defective" score', hx0, 20, p.muted, 11, 'left', 600)
  const B = 25, cnt = [new Array(B).fill(0), new Array(B).fill(0)]
  for (let i = 0; i < f.data.y.length; i++) cnt[f.data.y[i]][Math.min(B - 1, Math.floor(f.data.score[i] * B))]++
  const mx = Math.max(...cnt[0], ...cnt[1])
  const bw = (hx1 - hx0) / B
  const X = (s: number) => hx0 + s * (hx1 - hx0)
  if (f.t !== undefined) { ctx.fillStyle = alpha(p.brand, 0.07); ctx.fillRect(X(f.t), hy0, hx1 - X(f.t), hy1 - hy0) }
  for (let b = 0; b < B; b++) {
    const flagged = f.t !== undefined && (b + 0.5) / B >= f.t
    const hb = (cnt[1][b] / mx) * (hmid - hy0), hg = (cnt[0][b] / mx) * (hy1 - hmid)
    ctx.fillStyle = alpha(bad, flagged ? 0.9 : 0.45); ctx.fillRect(hx0 + b * bw + 1, hmid - hb, bw - 2, hb)
    ctx.fillStyle = alpha(good, flagged ? 0.9 : 0.45); ctx.fillRect(hx0 + b * bw + 1, hmid, bw - 2, hg)
  }
  ctx.strokeStyle = p.muted; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(hx0, hmid + 0.5); ctx.lineTo(hx1, hmid + 0.5); ctx.stroke()
  for (const s of [0, 0.25, 0.5, 0.75, 1]) text(ctx, fmt(s, 2, lang), X(s), hy1 + 14, p.muted, 10, 'center', 400)
  text(ctx, tr ? 'puan →' : 'score →', hx1, hy1 + 28, p.muted, 11, 'right', 600)
  ctx.font = `600 11px Poppins, system-ui, sans-serif`
  let lx0 = hx0 + ctx.measureText(tr ? 'modelin "hatalı" puanı' : 'the model\'s "defective" score').width + 18
  for (const [lab, col] of [[tr ? 'hatalı ↑' : 'defective ↑', bad], [tr ? 'sağlam ↓' : 'good ↓', good]] as Array<[string, string]>) {
    ctx.fillStyle = col; ctx.fillRect(lx0, 11, 10, 10)
    text(ctx, lab, lx0 + 14, 20, col, 11, 'left', 700)
    ctx.font = `700 11px Poppins, system-ui, sans-serif`; lx0 += ctx.measureText(lab).width + 30
  }
  if (f.t !== undefined) {
    const x = X(f.t)
    ctx.strokeStyle = p.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, hy0 - 4); ctx.lineTo(x, hy1); ctx.stroke()
    const lab = `${tr ? 'eşik' : 'threshold'} ${fmt(f.t, 2, lang)}`
    ctx.font = `700 11px Poppins, system-ui, sans-serif`
    const w = ctx.measureText(lab).width
    const lx = Math.min(hx1 - w, Math.max(hx0, x - w / 2))
    text(ctx, lab, lx, hy0 - 6, p.ink, 11, 'left', 700)
    text(ctx, tr ? 'işaretli →' : 'flagged →', Math.min(x + 6, hx1 - 60), hy0 + 12, p.brand, 10, 'left', 600)
  }

  // --- P, R, F1 çubukları
  const by = 316
  const rows: Array<[string, number, string, 'P' | 'R' | 'F1']> = [
    [tr ? 'kesinlik P' : 'precision P', f.m?.P ?? NaN, p.groups[4], 'P'],
    [tr ? 'duyarlılık R' : 'recall R', f.m?.R ?? NaN, p.groups[2], 'R'],
    ['F1', f.m?.F1 ?? NaN, p.groups[3], 'F1'],
  ]
  rows.forEach(([lab, v, col, key], i) => {
    const y = by + i * 40
    const on = f.focus === key
    text(ctx, lab, hx0 - 40, y + 15, on ? p.ink : p.muted, 12, 'left', on ? 800 : 600)
    const x0 = hx0 + 70, w = hx1 - x0 - 46
    ctx.fillStyle = p.soft; ctx.fillRect(x0, y, w, 22)
    if (Number.isFinite(v)) { ctx.fillStyle = alpha(col, on || !f.focus ? 0.9 : 0.5); ctx.fillRect(x0, y, w * v, 22) }
    if (on) { ctx.strokeStyle = p.ink; ctx.lineWidth = 1.5; ctx.strokeRect(x0 - 1, y - 1, w + 2, 24) }
    text(ctx, n2(v), x0 + w + 8, y + 16, p.ink, 13, 'left', 700)
  })

  // --- karışıklık matrisi
  const cx0 = 520, cy0 = 54, cw = 92, ch = 52
  text(ctx, tr ? 'karışıklık matrisi' : 'confusion matrix', 446, 20, p.muted, 11, 'left', 600)
  text(ctx, tr ? 'işaretli' : 'flagged', cx0 + cw / 2, cy0 - 8, p.muted, 10, 'center', 600)
  text(ctx, tr ? 'geçti' : 'passed', cx0 + cw * 1.5, cy0 - 8, p.muted, 10, 'center', 600)
  text(ctx, tr ? 'hatalı' : 'defective', cx0 - 8, cy0 + ch / 2 + 4, bad, 11, 'right', 700)
  text(ctx, tr ? 'sağlam' : 'good', cx0 - 8, cy0 + ch * 1.5 + 4, good, 11, 'right', 700)
  const m = f.m
  const cells: Array<[string, number | undefined, number, number, string, boolean]> = [
    ['TP', m?.tp, 0, 0, p.groups[3], f.focus === 'cm' || f.focus === 'P' || f.focus === 'R'],
    ['FN', m?.fn, 1, 0, p.groups[0], f.focus === 'cm' || f.focus === 'R'],
    ['FP', m?.fp, 0, 1, p.groups[0], f.focus === 'cm' || f.focus === 'P'],
    ['TN', m?.tn, 1, 1, p.groups[3], f.focus === 'cm'],
  ]
  for (const [lab, v, c, r, col, hi] of cells) {
    const x = cx0 + c * cw, y = cy0 + r * ch
    ctx.fillStyle = alpha(col, hi ? 0.28 : 0.12); ctx.fillRect(x + 1, y + 1, cw - 2, ch - 2)
    ctx.strokeStyle = hi ? p.ink : p.line; ctx.lineWidth = hi ? 1.5 : 1; ctx.strokeRect(x + 1, y + 1, cw - 2, ch - 2)
    text(ctx, lab, x + 8, y + 16, p.muted, 10, 'left', 700)
    text(ctx, v === undefined ? '—' : String(v), x + cw - 10, y + ch - 12, p.ink, 18, 'right', 700)
  }

  // --- kesinlik–duyarlılık eğrisi
  const px0 = 480, px1 = 700, py0 = 216, py1 = 410
  text(ctx, tr ? 'kesinlik–duyarlılık eğrisi' : 'precision–recall curve', 446, py0 - 14, p.muted, 11, 'left', 600)
  const PX = (r: number) => px0 + r * (px1 - px0), PY = (q: number) => py1 - q * (py1 - py0)
  ctx.strokeStyle = p.line; ctx.lineWidth = 1
  for (const g of [0, 0.5, 1]) {
    ctx.beginPath(); ctx.moveTo(PX(0), PY(g) + 0.5); ctx.lineTo(PX(1), PY(g) + 0.5); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(PX(g) + 0.5, PY(0)); ctx.lineTo(PX(g) + 0.5, PY(1)); ctx.stroke()
    text(ctx, fmt(g, 1, lang), px0 - 6, PY(g) + 4, p.muted, 10, 'right', 400)
    text(ctx, fmt(g, 1, lang), PX(g), py1 + 14, p.muted, 10, 'center', 400)
  }
  text(ctx, tr ? 'duyarlılık →' : 'recall →', px1, py1 + 30, p.muted, 11, 'right', 600)
  ctx.save(); ctx.translate(px0 - 30, py1); ctx.rotate(-Math.PI / 2); text(ctx, tr ? 'kesinlik →' : 'precision →', 0, 0, p.muted, 11, 'left', 600); ctx.restore()
  const base = f.data.nBad / f.data.y.length
  ctx.strokeStyle = p.muted; ctx.setLineDash([2, 4]); ctx.beginPath(); ctx.moveTo(PX(0), PY(base)); ctx.lineTo(PX(1), PY(base)); ctx.stroke(); ctx.setLineDash([])
  text(ctx, tr ? `rastgele ${fmt(base, 2, lang)}` : `random ${fmt(base, 2, lang)}`, px0 + 4, PY(base) - 4, p.muted, 9, 'left', 600)
  ctx.strokeStyle = p.brand; ctx.lineWidth = 2.2; ctx.beginPath()
  let started = false
  for (const c of f.data.curve) {
    if (!Number.isFinite(c.P) || !Number.isFinite(c.R)) continue
    if (started) ctx.lineTo(PX(c.R), PY(c.P)); else { ctx.moveTo(PX(c.R), PY(c.P)); started = true }
  }
  ctx.stroke()
  if (f.best) {
    const c = f.data.curve[Math.round(f.best.t * 100)]
    ctx.strokeStyle = p.groups[3]; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(PX(c.R), PY(c.P), 7, 0, Math.PI * 2); ctx.stroke()
    text(ctx, tr ? 'en iyi F1' : 'best F1', PX(c.R) - 10, PY(c.P) + 20, p.groups[3], 10, 'right', 700)
  }
  if (m && Number.isFinite(m.P) && Number.isFinite(m.R)) {
    dot(ctx, PX(m.R), PY(m.P), 6, p.ink)
    dot(ctx, PX(m.R), PY(m.P), 3, p.bg)
  }
}
