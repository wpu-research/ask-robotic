// Öneri sistemi sahnesi: solda projelerin öğrenilen 2B haritası (renk = gizli tarz), sağda gizli beğenilerde doğruluk eğrisi,
// mümkün en iyi ve rastgele çizgileri; sonda önerilen ilk 3 ile rastgele projenin karşılaştırması.
import { alpha, clear, dot, text, type Draw } from '../draw'
import { fmt } from '@/lib/ml/core'
import type { RecFrame } from '@/lib/ml/oneri-sistemi'

export const draw: Draw = (ctx, W, H, f0, p, lang) => {
  const f = f0 as RecFrame
  const tr = lang === 'tr'
  const pc = (x: number, d = 0) => (tr ? `%${fmt(100 * x, d, 'tr')}` : `${(100 * x).toFixed(d)}%`)
  clear(ctx, W, H, p)
  // --- sol: harita
  const mx0 = 20, my0 = 34, ms = 340
  text(ctx, tr ? 'projelerin öğrenilen konumu' : 'learned positions of the projects', mx0, 20, p.muted, 11, 'left', 600)
  ctx.fillStyle = p.soft; ctx.fillRect(mx0, my0, ms, ms)
  ctx.strokeStyle = p.line; ctx.lineWidth = 1; ctx.strokeRect(mx0 + 0.5, my0 + 0.5, ms - 1, ms - 1)
  ctx.beginPath(); ctx.moveTo(mx0 + ms / 2, my0); ctx.lineTo(mx0 + ms / 2, my0 + ms); ctx.moveTo(mx0, my0 + ms / 2); ctx.lineTo(mx0 + ms, my0 + ms / 2); ctx.stroke()
  const m = Math.max(0.3, ...f.V.flat().map(Math.abs)) * 1.12
  const X = (x: number) => mx0 + ms / 2 + (x / m) * (ms / 2), Y = (y: number) => my0 + ms / 2 - (y / m) * (ms / 2)
  f.V.forEach(([a, b], i) => {
    dot(ctx, X(a), Y(b), 5, p.groups[f.data.group[i]])
    ctx.strokeStyle = p.bg; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(X(a), Y(b), 5, 0, Math.PI * 2); ctx.stroke()
  })
  if (f.pair) {
    const [a, b] = f.V[f.pair[1]]
    ctx.strokeStyle = p.ink; ctx.lineWidth = 1.6
    ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(a), Y(b)); ctx.stroke()
    ctx.beginPath(); ctx.arc(X(a), Y(b), 9, 0, Math.PI * 2); ctx.stroke()
    text(ctx, tr ? `proje ${f.pair[1]}` : `project ${f.pair[1]}`, Math.min(X(a) + 12, mx0 + ms - 70), Y(b) - 10, p.ink, 11, 'left', 700)
  }
  text(ctx, f.k > 1 ? (tr ? 'gizli boyut 1 →' : 'hidden dim 1 →') : (tr ? 'tek gizli boyut →' : 'single hidden dim →'), mx0 + ms, my0 + ms + 16, p.muted, 10, 'right', 600)
  if (f.k > 1) {
    ctx.save(); ctx.translate(mx0 - 6, my0 + ms); ctx.rotate(-Math.PI / 2); text(ctx, tr ? 'gizli boyut 2 →' : 'hidden dim 2 →', 0, 0, p.muted, 10, 'left', 600); ctx.restore()
  }
  // renk açıklaması
  text(ctx, tr ? 'renk: gizli tarz (modele gösterilmez)' : 'colour: hidden style (never shown to the model)', mx0, my0 + ms + 34, p.muted, 10, 'left', 500)
  for (let g = 0; g < 6; g++) dot(ctx, mx0 + 6 + g * 14, my0 + ms + 48, 4.5, p.groups[g])

  // --- sağ: doğruluk eğrisi
  const cx0 = 420, cx1 = 700, cy0 = 40, cy1 = 280
  text(ctx, tr ? 'gizli beğenilerde doğru tahmin' : 'hidden likes guessed right', cx0, 20, p.muted, 11, 'left', 600)
  const lo = 0.4, hi = 1
  const R = Math.max(1, f.rounds)
  const sx = (e: number) => cx0 + ((e - 1) / Math.max(1, R - 1)) * (cx1 - cx0)
  const sy = (a: number) => cy1 - ((a - lo) / (hi - lo)) * (cy1 - cy0)
  ctx.strokeStyle = p.line; ctx.lineWidth = 1
  for (const a of [0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]) {
    ctx.beginPath(); ctx.moveTo(cx0, sy(a) + 0.5); ctx.lineTo(cx1, sy(a) + 0.5); ctx.stroke()
    text(ctx, pc(a), cx0 - 6, sy(a) + 4, p.muted, 10, 'right', 400)
  }
  for (const e of [1, Math.round(R / 2), R]) text(ctx, String(e), sx(e), cy1 + 15, p.muted, 10, 'center', 400)
  text(ctx, tr ? 'tur' : 'round', cx1, cy1 + 30, p.muted, 11, 'right', 600)
  const hline = (a: number, col: string, dash: number[], lab: string, above: boolean) => {
    ctx.strokeStyle = col; ctx.setLineDash(dash); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(cx0, sy(a)); ctx.lineTo(cx1, sy(a)); ctx.stroke(); ctx.setLineDash([])
    text(ctx, lab, cx1 - 4, sy(a) + (above ? -5 : 13), col, 10, 'right', 700)
  }
  hline(f.data.bayes, p.groups[3], [5, 4], `${tr ? 'mümkün en iyi' : 'best possible'} ${pc(f.data.bayes, 1)}`, true)
  hline(0.5, p.groups[0], [2, 4], tr ? 'rastgele %50' : 'random 50%', false)
  if (f.acc.length) {
    ctx.strokeStyle = p.brand; ctx.lineWidth = 2.4; ctx.beginPath()
    f.acc.forEach((a, i) => (i ? ctx.lineTo(sx(i + 1), sy(a)) : ctx.moveTo(sx(i + 1), sy(a))))
    if (f.acc.length === 1) ctx.lineTo(sx(1) + 2, sy(f.acc[0]))
    ctx.stroke()
    const a = f.acc[f.acc.length - 1]
    dot(ctx, sx(f.acc.length), sy(a), 4.5, p.brand)
    text(ctx, pc(a, 1), Math.min(sx(f.acc.length) + 8, cx1 - 40), sy(a) + 18, p.brand, 12, 'left', 700)
  }
  // --- sağ alt: öneri sonucu
  const bx = 420, by = 330
  if (f.top3 !== undefined && f.rand !== undefined) {
    text(ctx, tr ? 'zevke uyan proje oranı' : 'share of projects that suit the taste', bx, by, p.muted, 11, 'left', 600)
    const rows: Array<[string, number, string]> = [[tr ? 'önerilen ilk 3' : 'top-3 picks', f.top3, p.groups[3]], [tr ? 'rastgele proje' : 'random project', f.rand, p.muted]]
    rows.forEach(([lab, v, col], i) => {
      const y = by + 14 + i * 30
      text(ctx, lab, bx, y + 14, p.ink, 11, 'left', 600)
      ctx.fillStyle = p.soft; ctx.fillRect(bx + 100, y, 150, 20)
      ctx.fillStyle = alpha(col, 0.85); ctx.fillRect(bx + 100, y, 150 * v, 20)
      text(ctx, pc(v, 1), bx + 256, y + 15, p.ink, 11, 'left', 700)
    })
  } else {
    text(ctx, tr ? `${f.k} gizli sayı / öğrenci ve proje` : `${f.k} hidden numbers / student and project`, bx, by, p.muted, 11, 'left', 600)
    text(ctx, tr ? `tur ${f.epoch} / ${f.rounds}` : `round ${f.epoch} / ${f.rounds}`, bx, by + 30, p.ink, 20, 'left', 700)
  }
}
