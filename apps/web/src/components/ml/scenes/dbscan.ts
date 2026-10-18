// Sahne: DBSCAN. Depo zemini (15 m × 8 m) üstünde LiDAR noktaları; küme kare kare genişler (BFS). Çekirdekler dolu, sınır
// noktaları halkalı, gürültü gri çarpı; kuyruktan çıkan çekirdeklerin eps çemberi kesikli çizilir.
import { FONT, alpha, clear, dot, scaleBar, tag, text, view, type Draw } from '../draw'
import type { DbFrame } from '@/lib/ml/dbscan'
import { fmt } from '@/lib/ml/core'

export const draw: Draw = (ctx, W, H, f0, p, lang) => {
  const f = f0 as DbFrame
  const tr = lang === 'tr'
  clear(ctx, W, H, p)
  const v = view(W, H - 24, 0, 15, 0, 8, 30)
  const col = (k: number) => p.groups[k % p.groups.length]
  // zemin çerçevesi
  ctx.fillStyle = p.soft; ctx.fillRect(v.sx(0), v.sy(8), 15 * v.s, 8 * v.s)
  ctx.strokeStyle = p.line; ctx.lineWidth = 1; ctx.strokeRect(v.sx(0), v.sy(8), 15 * v.s, 8 * v.s)
  const R = f.eps * v.s
  // kuyruktan çıkan çekirdeklerin eps çemberi
  f.popped?.forEach((j) => {
    if (!f.core?.[j]) return
    const q = f.X[j]
    ctx.fillStyle = alpha(col(f.label[j] >= 0 ? f.label[j] : 0), 0.08); ctx.beginPath(); ctx.arc(v.sx(q.x), v.sy(q.y), R, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = p.ink; ctx.lineWidth = 1; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.arc(v.sx(q.x), v.sy(q.y), R, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([])
  })
  const added = new Set(f.added ?? [])
  f.X.forEach((q, i) => {
    const X = v.sx(q.x), Y = v.sy(q.y), l = f.label[i]
    if (l >= 0) {
      if (added.has(i)) { ctx.fillStyle = alpha(col(l), 0.25); ctx.beginPath(); ctx.arc(X, Y, 7, 0, Math.PI * 2); ctx.fill() }
      if (f.core?.[i]) dot(ctx, X, Y, 3.4, col(l))
      else { ctx.strokeStyle = col(l); ctx.lineWidth = 1.8; ctx.beginPath(); ctx.arc(X, Y, 3.6, 0, Math.PI * 2); ctx.stroke() }
    } else if (f.done) {
      ctx.strokeStyle = p.muted; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(X - 4, Y - 4); ctx.lineTo(X + 4, Y + 4); ctx.moveTo(X + 4, Y - 4); ctx.lineTo(X - 4, Y + 4); ctx.stroke()
    } else if (f.core) {
      if (f.core[i]) dot(ctx, X, Y, 3, alpha(p.muted, 0.75))
      else { ctx.strokeStyle = alpha(p.muted, 0.7); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(X, Y, 2.8, 0, Math.PI * 2); ctx.stroke() }
    } else dot(ctx, X, Y, 2.6, alpha(p.muted, 0.8))
  })
  // tanıtım: örnek noktaların eps çemberi ve komşu sayısı
  f.probes?.forEach((i) => {
    const q = f.X[i], X = v.sx(q.x), Y = v.sy(q.y)
    const n = f.X.filter((o) => (o.x - q.x) ** 2 + (o.y - q.y) ** 2 <= f.eps * f.eps).length
    const ok = n >= f.minPts
    ctx.strokeStyle = ok ? p.brand : p.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(X, Y, R, 0, Math.PI * 2); ctx.stroke()
    dot(ctx, X, Y, 3.6, ok ? p.brand : p.ink)
    const s = tr ? `${n} nokta${ok ? ' · çekirdek' : ' · çekirdek değil'}` : `${n} point${n === 1 ? '' : 's'}${ok ? ' · core' : ' · not core'}`
    ctx.font = `600 12px ${FONT}`
    const w = ctx.measureText(s).width + 16
    const tx = Math.min(W - w - 8, Math.max(8, X + R + 6)), ty = Math.max(4, Math.min(v.sy(0) - 26, Y - 11))
    tag(ctx, s, tx, ty, p, ok ? p.brand : p.ink)
  })
  // üst satır: kümeler
  let x = v.sx(0)
  const sizes: number[] = []
  f.label.forEach((l) => { if (l >= 0) sizes[l] = (sizes[l] ?? 0) + 1 })
  const ks = Math.min(f.k, 8)
  for (let j = 0; j < ks; j++) {
    const n = sizes[j] ?? 0
    x += tag(ctx, tr ? `küme ${j + 1}: ${n}` : `cluster ${j + 1}: ${n}`, x, 4, p, col(j)) + 6
    if (x > W - 140) break
  }
  if (f.k > ks) { text(ctx, `+${f.k - ks}`, x, 19, p.muted, 12, 'left', 600); x += 30 }
  if (f.done) {
    const noise = f.label.filter((l) => l < 0).length
    tag(ctx, tr ? `gürültü: ${noise}` : `noise: ${noise}`, Math.min(x, W - 110), 4, p, p.muted)
  }
  // alt satır: ölçek, gösterge
  scaleBar(ctx, v, 1, '1 m', p, H)
  let lx = 16 + v.s + 24
  const item = (s: string, mark: (cx: number, cy: number) => void) => { mark(lx + 5, H - 14); text(ctx, s, lx + 14, H - 10, p.muted, 11); lx += ctx.measureText(s).width + 32 }
  item(tr ? 'çekirdek' : 'core', (cx, cy) => dot(ctx, cx, cy, 3.6, p.ink))
  item(tr ? 'sınır' : 'border', (cx, cy) => { ctx.strokeStyle = p.ink; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.arc(cx, cy, 3.6, 0, Math.PI * 2); ctx.stroke() })
  item(tr ? 'gürültü' : 'noise', (cx, cy) => { ctx.strokeStyle = p.muted; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(cx - 4, cy - 4); ctx.lineTo(cx + 4, cy + 4); ctx.moveTo(cx + 4, cy - 4); ctx.lineTo(cx - 4, cy + 4); ctx.stroke() })
  item(`${tr ? 'eps çemberi' : 'eps circle'} (${fmt(f.eps, 2, lang)} m)`, (cx, cy) => { ctx.strokeStyle = p.ink; ctx.lineWidth = 1; ctx.setLineDash([3, 2]); ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]) })
  text(ctx, `minPts = ${f.minPts}`, W - 16, H - 10, p.muted, 11, 'right', 600)
}
