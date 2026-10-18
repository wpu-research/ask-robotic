// Boruta sahnesi: üstte her sensörün ve gölgesinin önem çubuğu, gölgelerin en iyisi çizgisi; altta tur tur isabet tablosu
// ve karar (kabul yeşil, ret gri, kararsız sarı).
import { alpha, clear, text, type Draw } from '../draw'
import { fmt } from '@/lib/ml/core'
import { SENSORS, type BorutaFrame } from '@/lib/ml/boruta'

export const draw: Draw = (ctx, W, H, f0, p, lang) => {
  const f = f0 as BorutaFrame
  const tr = lang === 'tr'
  clear(ctx, W, H, p)
  const L = f.t > 0 ? f.log[f.t - 1] : undefined
  const status = L && f.stage >= 4 ? L.status : new Array(8).fill(0)
  const stCol = (s: number) => (s === 1 ? p.groups[3] : s === -1 ? alpha(p.muted, 0.55) : p.groups[2])
  // --- önem çubukları
  const x0 = 64, x1 = W - 16, y0 = 44, y1 = 236
  const top = Math.max(...f.log.flatMap((r) => r.imp)) * 1.08
  const Y = (v: number) => y1 - (v / top) * (y1 - y0)
  text(ctx, tr ? `önem (|ağırlık|)${f.t ? ` · tur ${f.t} / ${f.rounds}` : ''}` : `importance (|weight|)${f.t ? ` · round ${f.t} / ${f.rounds}` : ''}`, x0, 20, p.muted, 11, 'left', 600)
  // açıklama
  let lx = W - 16
  const legend: Array<[string, string]> = [[tr ? 'gölge' : 'shadow', alpha(p.muted, 0.35)], [tr ? 'sensör' : 'sensor', p.groups[1]]]
  for (const [lab, col] of legend) {
    ctx.font = `600 11px Poppins, system-ui, sans-serif`
    const w = ctx.measureText(lab).width
    lx -= w; text(ctx, lab, lx, 20, p.muted, 11, 'left', 600)
    lx -= 14; ctx.fillStyle = col; ctx.fillRect(lx, 11, 10, 10); lx -= 16
  }
  ctx.strokeStyle = p.line; ctx.lineWidth = 1
  const step = top > 1 ? 0.5 : 0.2
  for (let v = 0; v <= top; v += step) {
    ctx.beginPath(); ctx.moveTo(x0, Y(v) + 0.5); ctx.lineTo(x1, Y(v) + 0.5); ctx.stroke()
    text(ctx, fmt(v, 1, lang), x0 - 6, Y(v) + 4, p.muted, 10, 'right', 400)
  }
  const gw = (x1 - x0) / 8, bw = gw * 0.32
  for (let j = 0; j < 8; j++) {
    const gx = x0 + j * gw + gw / 2
    const name = tr ? SENSORS[j].tr : SENSORS[j].en
    text(ctx, name, gx, y1 + 16, f.stage >= 4 && status[j] ? (status[j] === 1 ? p.groups[3] : p.muted) : p.ink, 11, 'center', 700)
    if (f.stage >= 1) text(ctx, tr ? 'gölge' : 'shadow', gx + bw / 2 + 2, y1 + 29, p.muted, 9, 'left', 500)
    if (!L || f.stage < 1) continue
    if (f.stage === 1) {
      ctx.strokeStyle = alpha(p.muted, 0.5); ctx.setLineDash([3, 3])
      ctx.strokeRect(gx + 2, y1 - 30, bw, 30); ctx.setLineDash([])
      ctx.fillStyle = alpha(p.groups[1], 0.25); ctx.fillRect(gx - bw - 2, y1 - 30, bw, 30)
      continue
    }
    const v = L.imp[j], sv = L.imp[8 + j]
    const col = f.stage >= 4 ? (status[j] ? stCol(status[j]) : L.hit[j] ? p.groups[3] : p.groups[1]) : p.groups[1]
    ctx.fillStyle = alpha(col, 0.88); ctx.fillRect(gx - bw - 2, Y(v), bw, y1 - Y(v))
    ctx.fillStyle = alpha(p.muted, 0.35); ctx.fillRect(gx + 2, Y(sv), bw, y1 - Y(sv))
    if (f.stage >= 4 && L.hit[j]) {
      // isabet işareti
      const cx = gx - bw / 2 - 2, cy = Y(v) - 10
      ctx.strokeStyle = p.groups[3]; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(cx - 5, cy); ctx.lineTo(cx - 1, cy + 4); ctx.lineTo(cx + 6, cy - 5); ctx.stroke()
    }
  }
  ctx.strokeStyle = p.muted; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y1 + 0.5); ctx.lineTo(x1, y1 + 0.5); ctx.stroke()
  if (L && f.stage >= 3) {
    ctx.strokeStyle = p.groups[0]; ctx.setLineDash([6, 4]); ctx.lineWidth = 1.6
    ctx.beginPath(); ctx.moveTo(x0, Y(L.shadowMax)); ctx.lineTo(x1, Y(L.shadowMax)); ctx.stroke(); ctx.setLineDash([])
    const lab = `${tr ? 'gölgelerin en iyisi' : 'best shadow'} ${fmt(L.shadowMax, 2, lang)}`
    ctx.font = `700 10px Poppins, system-ui, sans-serif`
    const w = ctx.measureText(lab).width + 8
    const tx = x0 + 3.5 * gw - w / 2
    ctx.fillStyle = p.bg; ctx.fillRect(tx, Y(L.shadowMax) - 16, w, 13)
    text(ctx, lab, tx + 4, Y(L.shadowMax) - 6, p.groups[0], 10, 'left', 700)
  }

  // --- isabet tablosu
  const ty0 = 290, rh = 19
  text(ctx, tr ? 'tur tur isabetler' : 'hits round by round', x0, ty0 - 8, p.muted, 11, 'left', 600)
  const gx0 = x0 + 24, gx1 = W - 150
  const sq = Math.min(14, (gx1 - gx0) / Math.max(1, f.rounds))
  const shown = f.stage >= 4 ? f.t : f.t - 1
  for (let j = 0; j < 8; j++) {
    const y = ty0 + j * rh
    text(ctx, tr ? SENSORS[j].tr : SENSORS[j].en, gx0 - 8, y + 12, p.ink, 10, 'right', 600)
    for (let t = 0; t < f.rounds; t++) {
      const X = gx0 + t * sq
      if (t < shown) {
        const h = f.log[t].hit[j]
        ctx.fillStyle = h ? p.groups[3] : alpha(p.muted, 0.18)
        ctx.fillRect(X + 1, y + 2, sq - 2, rh - 5)
      } else { ctx.strokeStyle = p.line; ctx.lineWidth = 1; ctx.strokeRect(X + 1.5, y + 2.5, sq - 3, rh - 6) }
    }
    const hits = shown > 0 ? f.log[shown - 1].hits[j] : 0
    const s = shown > 0 && f.stage >= 4 ? f.log[shown - 1].status[j] : 0
    text(ctx, `${hits}/${Math.max(0, shown)}`, W - 132, y + 12, p.ink, 10, 'left', 700)
    const lab = s === 1 ? (tr ? 'kabul' : 'accept') : s === -1 ? (tr ? 'ret' : 'reject') : shown > 0 ? (tr ? 'kararsız' : 'tentative') : ''
    if (lab) {
      ctx.fillStyle = alpha(stCol(s), s === -1 ? 0.5 : 0.25); ctx.fillRect(W - 90, y + 1, 74, rh - 3)
      text(ctx, lab, W - 53, y + 12, s === -1 ? p.ink : p.ink, 10, 'center', 700)
    }
  }
}
