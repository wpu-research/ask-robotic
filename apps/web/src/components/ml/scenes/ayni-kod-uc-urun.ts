// Ders: aynı kod, üç ürün. Solda o anki işin verisi ve modeli (doğru, karar bölgesi ya da çitlenen bölge), sağda üç ürün kartı
// (gizli veri sonucu) ve kayıp grafiği. Gizli örnekler sınamada içi boş halkayla, yanlışlar çarpıyla gösterilir.
import { alpha, axes, chart, clear, dot, inset, text, type Draw, type Pal } from '../draw'
import { SNAP_COUNT, predict, resultText, type AyniFrame } from '@/lib/ml/ayni-kod-uc-urun'

const PAD = { l: 56, r: 268, t: 20, b: 44 }
const CX = 470, CW = 238

function ring(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, col: string, wd = 2) {
  ctx.strokeStyle = col; ctx.lineWidth = wd; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke()
}
function cross(ctx: CanvasRenderingContext2D, x: number, y: number, col: string) {
  ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 7, y - 7); ctx.lineTo(x + 7, y + 7); ctx.moveTo(x + 7, y - 7); ctx.lineTo(x - 7, y + 7); ctx.stroke()
}
function legend(ctx: CanvasRenderingContext2D, items: Array<[string, string, boolean?]>, x: number, y: number, p: Pal) {
  let lx = x
  ctx.font = `400 11px Poppins, system-ui, sans-serif`
  for (const [lbl, col, hollow] of items) {
    if (hollow) ring(ctx, lx + 4, y - 4, 4, col, 1.6); else dot(ctx, lx + 4, y - 4, 4, col)
    text(ctx, lbl, lx + 12, y, p.muted, 11)
    lx += ctx.measureText(lbl).width + 30
  }
}

export const draw: Draw = (ctx, W, H, f0, p, lang) => {
  const f = f0 as AyniFrame
  const tr = lang === 'tr'
  const num = (x: number, d: number) => (tr ? x.toFixed(d).replace('.', ',') : x.toFixed(d))
  clear(ctx, W, H, p)
  const { X, y, k } = f.data
  const M = f.model
  const graded = !!f.graded
  const hiddenIdx = y.map((_, i) => i).slice(k)

  if (f.job === 0) {
    const v = chart(W, H, 0, 5, 0, 2.6, PAD)
    axes(ctx, v, [0, 1, 2, 3, 4, 5], [0, 0.5, 1, 1.5, 2, 2.5], tr ? 'yük (kg)' : 'load (kg)', tr ? 'motor akımı (A)' : 'motor current (A)', p, W, H, String, (q) => num(q, 1))
    if (M) {
      ctx.save(); ctx.beginPath(); ctx.rect(v.sx(0), v.sy(2.6), v.sx(5) - v.sx(0), v.sy(0) - v.sy(2.6)); ctx.clip()
      if (graded) {
        ctx.strokeStyle = alpha(p.groups[0], 0.7); ctx.lineWidth = 1.4
        hiddenIdx.forEach((i) => { ctx.beginPath(); ctx.moveTo(v.sx(X[i][0]), v.sy(y[i])); ctx.lineTo(v.sx(X[i][0]), v.sy(predict(M, X[i]))); ctx.stroke() })
      }
      ctx.strokeStyle = p.brand; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(v.sx(0), v.sy(predict(M, [0]))); ctx.lineTo(v.sx(5), v.sy(predict(M, [5]))); ctx.stroke()
      ctx.restore()
    }
    for (let i = 0; i < k; i++) dot(ctx, v.sx(X[i][0]), v.sy(y[i]), 4.5, p.groups[1])
    if (graded) hiddenIdx.forEach((i) => ring(ctx, v.sx(X[i][0]), v.sy(y[i]), 6, p.groups[2], 2.2))
    if (M) {
      const slope = predict(M, [1]) - predict(M, [0])
      text(ctx, `${tr ? 'akım' : 'current'} ≈ ${num(predict(M, [0]), 2)} + ${num(slope, 3)} · kg`, v.sx(0) + 10, v.sy(2.6) + 18, p.brand, 13, 'left', 700)
    }
    legend(ctx, [[tr ? 'eğitim ölçümü' : 'training', p.groups[1]], [tr ? 'gizli ölçüm' : 'hidden', p.groups[2], true]], 60, H - 8, p)
  } else {
    const zone = f.job === 2
    const [x0, x1] = zone ? [-2, 2] : [0, 10]
    const v = chart(W, H, x0, x1, x0, x1, PAD)
    if (M) {
      const cell = 6
      for (let py = v.sy(x1); py < v.sy(x0) - 0.5; py += cell) for (let px = v.sx(x0); px < v.sx(x1) - 0.5; px += cell) {
        const pr = predict(M, [v.ix(px + cell / 2), v.iy(py + cell / 2)])
        const c = zone ? (pr > 0.5 ? p.groups[3] : p.groups[0]) : (pr > 0.5 ? p.groups[0] : p.groups[1])
        ctx.fillStyle = alpha(c, 0.05 + 0.2 * Math.abs(pr - 0.5) * 2)
        ctx.fillRect(px, py, Math.min(cell, v.sx(x1) - px), Math.min(cell, v.sy(x0) - py))
      }
    }
    const ticks = zone ? [-2, -1, 0, 1, 2] : [0, 2, 4, 6, 8, 10]
    axes(ctx, v, ticks, ticks, zone ? 'x (m)' : tr ? 'IR yansıması' : 'IR reflection', zone ? 'y (m)' : tr ? 'sonar yankısı' : 'sonar echo', p, W, H)
    // pozitif sınıf: engel (kırmızı) ya da güvenli (yeşil)
    const col = (c: number) => (zone ? (c ? p.groups[3] : p.groups[0]) : c ? p.groups[0] : p.groups[1])
    if (zone && graded) {
      ctx.strokeStyle = p.ink; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.2
      ctx.beginPath(); ctx.arc(v.sx(0), v.sy(0), Math.sqrt(1.2) * (v.sx(1) - v.sx(0)), 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([])
    }
    for (let i = 0; i < k; i++) dot(ctx, v.sx(X[i][0]), v.sy(X[i][1]), 3.8, col(y[i]))
    if (graded && M) hiddenIdx.forEach((i) => {
      const X0 = v.sx(X[i][0]), Y0 = v.sy(X[i][1])
      dot(ctx, X0, Y0, 6, p.bg); ring(ctx, X0, Y0, 6, col(y[i]), 2.4)
      if ((predict(M, X[i]) > 0.5 ? 1 : 0) !== y[i]) cross(ctx, X0, Y0, p.ink)
    })
    const L: Array<[string, string, boolean?]> = zone
      ? [[tr ? 'güvenli' : 'safe', p.groups[3]], [tr ? 'güvenli değil' : 'not safe', p.groups[0]], [tr ? 'gizli' : 'hidden', p.muted, true]]
      : [[tr ? 'engel' : 'obstacle', p.groups[0]], [tr ? 'yol açık' : 'clear', p.groups[1]], [tr ? 'gizli' : 'hidden', p.muted, true]]
    legend(ctx, L, 60, H - 8, p)
  }

  // sağda üç ürün kartı
  const titles = tr ? ['1 · sayı tahmini', '2 · evet / hayır', '3 · bölge çitleme'] : ['1 · predict a number', '2 · yes / no', '3 · fence a zone']
  const subs = tr ? ['yük → motor akımı', 'IR + sonar → engel?', 'konum → güvenli bölge?'] : ['load → motor current', 'IR + sonar → obstacle?', 'position → safe zone?']
  for (let j = 0; j < 3; j++) {
    const y0 = 20 + j * 94, cur = j === f.job
    ctx.fillStyle = cur ? p.soft : p.bg; ctx.strokeStyle = cur ? p.brand : p.line; ctx.lineWidth = cur ? 2 : 1
    ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(CX, y0, CW, 84, 8); else ctx.rect(CX, y0, CW, 84); ctx.fill(); ctx.stroke()
    text(ctx, titles[j], CX + 12, y0 + 22, cur ? p.brand : p.ink, 13, 'left', 700)
    text(ctx, subs[j], CX + 12, y0 + 42, p.muted, 11, 'left', 500)
    const R = f.results[j]
    const res = R ? `${tr ? 'gizli' : 'hidden'}: ${resultText(j as 0 | 1 | 2, R)[tr ? 0 : 1]}` : cur ? (tr ? 'learn() öğreniyor…' : 'learn() is learning…') : tr ? 'sırada' : 'waiting'
    text(ctx, res, CX + 12, y0 + 68, R ? p.ink : p.muted, 12, 'left', R ? 700 : 500)
  }
  if (f.loss.length > 1) inset(ctx, CX, 312, CW, 108, [{ v: f.loss, col: p.groups[0] }], tr ? `kayıp (log) · adım ${f.step}` : `loss (log) · step ${f.step}`, p, { log: true, n: SNAP_COUNT })
}
