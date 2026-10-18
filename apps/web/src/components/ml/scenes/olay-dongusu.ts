// Ders: olay döngüsü sahnesi. Solda çağrı yığını, sağda mikro ve makro kuyruklar, altında çıktı sırası; en altta zaman
// çizgisi (ana betik, mikro, makro, meşgul hesap) ve zamanlayıcıların planlanan ile gerçek çalışma anı arasındaki gecikme.
import { FONT, alpha, clear, text, type Draw } from '../draw'
import type { LoopFrame } from '@/lib/ml/olay-dongusu'

export const draw: Draw = (ctx, W, H, f0, p, lang) => {
  const f = f0 as LoopFrame
  const tr = lang === 'tr'
  clear(ctx, W, H, p)
  const col = { main: p.brand, micro: p.groups[3], macro: p.groups[1], busy: p.groups[0] }
  const box = (x: number, y: number, w: number, h: number, fill: string, stroke: string) => {
    ctx.fillStyle = fill; ctx.strokeStyle = stroke; ctx.lineWidth = 1.4
    ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, 6); else ctx.rect(x, y, w, h); ctx.fill(); ctx.stroke()
  }
  const fit = (s: string, w: number, size: number) => { ctx.font = `600 ${size}px ${FONT}`; let t = s; while (t.length > 3 && ctx.measureText(t).width > w) t = t.slice(0, -2); return t === s ? s : t + '…' }
  // çağrı yığını
  text(ctx, tr ? 'çağrı yığını' : 'call stack', 16, 28, p.muted, 11, 'left', 600)
  ctx.strokeStyle = p.line; ctx.lineWidth = 1; ctx.strokeRect(16.5, 36.5, 180, 210)
  f.stack.forEach((s, k) => {
    const y = 246 - 8 - (k + 1) * 36
    const c = k ? col.busy : col[f.src ?? 'main']
    box(24, y, 164, 30, alpha(c, k ? 0.18 : 0.15), c)
    text(ctx, fit(s[lang], 150, 11), 106, y + 19, p.ink, 11, 'center', 600)
  })
  if (!f.stack.length) text(ctx, tr ? 'boş' : 'empty', 106, 146, p.muted, 12, 'center', 500)
  // kuyruklar
  const QX = 216, QW = W - 16 - QX
  const queue = (y: number, title: string, items: Array<{ s: string; sub?: string }>, c: string) => {
    text(ctx, title, QX, y - 8, p.muted, 11, 'left', 600)
    ctx.strokeStyle = p.line; ctx.lineWidth = 1; ctx.strokeRect(QX + 0.5, y + 0.5, QW, 40)
    let x = QX + 6
    for (const it of items) {
      const label = fit(it.s, 120, 11)
      ctx.font = `600 11px ${FONT}`
      const w = Math.max(ctx.measureText(label).width, it.sub ? ctx.measureText(it.sub).width : 0) + 16
      if (x + w > QX + QW - 6) { text(ctx, '…', x + 4, y + 25, p.muted, 14, 'left', 700); break }
      box(x, y + 5, w, 30, alpha(c, 0.15), c)
      if (it.sub) { text(ctx, label, x + w / 2, y + 18, p.ink, 11, 'center', 600); text(ctx, it.sub, x + w / 2, y + 31, p.muted, 9, 'center', 500) }
      else text(ctx, label, x + w / 2, y + 24, p.ink, 11, 'center', 600)
      x += w + 6
    }
    if (!items.length) text(ctx, tr ? 'boş' : 'empty', QX + 10, y + 25, p.muted, 11, 'left', 500)
  }
  queue(44, tr ? 'mikro görevler (söz / promise) · önce hepsi' : 'microtasks (promise) · all of them first', f.micro.map((s) => ({ s: s[lang] })), col.micro)
  queue(116, tr ? 'makro görevler (zamanlayıcı, G/Ç) · sonra birer birer' : 'macrotasks (timer, I/O) · then one at a time',
    f.macro.map((m) => ({ s: m.name[lang], sub: `${m.kind === 'io' ? (tr ? 'G/Ç' : 'I/O') : '⏱'} @${m.at} ms${m.at <= f.now ? (tr ? ' · hazır' : ' · ready') : ''}` })), col.macro)
  // çıktı
  text(ctx, tr ? 'çıktı sırası' : 'output order', QX, 182, p.muted, 11, 'left', 600)
  let x = QX, y = 192
  f.out.forEach((o, i) => {
    const s = `${i + 1}. ${o.s[lang]}`
    ctx.font = `600 11px ${FONT}`
    const w = ctx.measureText(s).width + 14
    if (x + w > W - 16) { x = QX; y += 28 }
    box(x, y, w, 22, alpha(col[o.src], 0.15), col[o.src])
    text(ctx, s, x + 7, y + 15, p.ink, 11, 'left', 600)
    x += w + 6
  })
  // zaman çizgisi
  const TX0 = 56, TX1 = W - 20, TY = 330
  const tx = (t: number) => TX0 + (t / f.tmax) * (TX1 - TX0)
  text(ctx, tr ? 'zaman çizgisi (ms)' : 'timeline (ms)', 16, TY - 52, p.muted, 11, 'left', 600)
  ctx.strokeStyle = p.line; ctx.lineWidth = 1
  for (let t = 0; t <= f.tmax; t += 10) {
    ctx.beginPath(); ctx.moveTo(tx(t) + 0.5, TY - 20); ctx.lineTo(tx(t) + 0.5, TY + 30); ctx.stroke()
    text(ctx, String(t), tx(t), TY + 44, p.muted, 10, 'center', 400)
  }
  for (const s of [...f.segs.filter((q) => q.src !== 'busy'), ...f.segs.filter((q) => q.src === 'busy')]) {
    ctx.fillStyle = s.src === 'busy' ? alpha(col.busy, 0.85) : col[s.src]
    ctx.fillRect(tx(s.t0), TY - 12, Math.max(3, tx(s.t1) - tx(s.t0)), 24)
  }
  // planlanan → gerçek (gecikme)
  let lane = 0
  f.out.forEach((o) => {
    if (o.plan === undefined) return
    const a = tx(o.plan), c = tx(o.t), ly = TY - 20 - 6 * lane++
    ctx.strokeStyle = o.t - o.plan > 5 ? col.busy : p.muted; ctx.lineWidth = 1.6; ctx.setLineDash([4, 3])
    ctx.beginPath(); ctx.moveTo(a, ly); ctx.lineTo(c, ly); ctx.stroke(); ctx.setLineDash([])
    ctx.fillStyle = ctx.strokeStyle; ctx.beginPath(); ctx.arc(a, ly, 3, 0, Math.PI * 2); ctx.fill()
  })
  ctx.strokeStyle = p.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(tx(f.now), TY - 40); ctx.lineTo(tx(f.now), TY + 30); ctx.stroke()
  text(ctx, `t = ${f.now} ms`, Math.min(tx(f.now) + 4, W - 70), TY - 34, p.ink, 10, 'left', 700)
  // açıklama
  const L: Array<[string, string]> = [[tr ? 'ana betik' : 'main script', col.main], [tr ? 'mikro görev' : 'microtask', col.micro], [tr ? 'makro görev' : 'macrotask', col.macro], [tr ? 'meşgul hesap' : 'busy compute', alpha(col.busy, 0.85)]]
  let lx = 16
  for (const [s, c] of L) { ctx.fillStyle = c; ctx.fillRect(lx, H - 22, 12, 12); text(ctx, s, lx + 17, H - 12, p.muted, 11, 'left', 500); ctx.font = `500 11px ${FONT}`; lx += ctx.measureText(s).width + 36 }
  text(ctx, tr ? '- - planlanan → gerçek' : '- - planned → actual', W - 16, H - 12, p.muted, 11, 'right', 500)
}
