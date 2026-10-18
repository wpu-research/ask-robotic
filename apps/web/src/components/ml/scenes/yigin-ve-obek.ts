// Ders sahnesi: yığın ve öbek. Solda alttan üste çağrı çerçeveleri (yerel değişkenler, sınır çizgisi, taşma),
// sağda öbek nesneleri (liste, demetler; closure'da fonksiyon ve hücre) ve çerçevelerden nesnelere referans okları.
import { alpha, clear, dot, tag, text, type Draw } from '../draw'
import type { YFrame } from '@/lib/ml/yigin-ve-obek'

export const draw: Draw = (ctx, W, H, f0, p, lang) => {
  const f = f0 as YFrame
  const tr = lang === 'tr'
  clear(ctx, W, H, p)
  const SX = 12, SW = 318, BOT = 446
  text(ctx, tr ? 'yığın (stack)' : 'stack', SX, 22, p.ink, 14, 'left', 700)
  text(ctx, tr ? 'öbek (heap)' : 'heap', 368, 22, p.ink, 14, 'left', 700)
  ctx.strokeStyle = p.line; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(348, 10); ctx.lineTo(348, H - 10); ctx.stroke()

  // öbek nesnelerinin konumları
  const pos = new Map<string, { x: number; y: number; w: number; h: number }>()
  const tupleN = f.heap.filter((o) => o.kind === 'tuple').length
  for (const o of f.heap) {
    if (o.kind === 'list') pos.set(o.id, { x: 372, y: 42, w: 330, h: 30 })
    else if (o.kind === 'tuple') { const i = Number(o.id.slice(1)); pos.set(o.id, { x: 372 + (i % 6) * 56, y: 112 + Math.floor(i / 6) * 34, w: 50, h: 22 }) }
    else if (o.kind === 'func') pos.set(o.id, { x: 470, y: 90, w: 150, h: 52 })
    else if (o.kind === 'cell') pos.set(o.id, { x: 470, y: 230, w: 150, h: 52 })
  }
  // öbek içi referanslar
  for (const o of f.heap) for (const r of o.refs ?? []) {
    const a = pos.get(o.id), b = pos.get(r); if (!a || !b) continue
    if (o.kind === 'list') {
      const i = Number(r.slice(1)), sx = a.x + 8 + (i + 0.5) * Math.min(13, (a.w - 16) / Math.max(1, tupleN))
      ctx.strokeStyle = alpha(p.muted, 0.35); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(sx, a.y + a.h); ctx.lineTo(b.x + b.w / 2, b.y); ctx.stroke()
    } else {
      ctx.strokeStyle = p.groups[4]; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(a.x + a.w / 2, a.y + a.h); ctx.lineTo(b.x + b.w / 2, b.y - 2); ctx.stroke()
      ctx.fillStyle = p.groups[4]; ctx.beginPath(); ctx.moveTo(b.x + b.w / 2, b.y - 1); ctx.lineTo(b.x + b.w / 2 - 5, b.y - 10); ctx.lineTo(b.x + b.w / 2 + 5, b.y - 10); ctx.fill()
      text(ctx, '__closure__', a.x + a.w / 2 + 8, (a.y + a.h + b.y) / 2 + 4, p.groups[4], 10, 'left', 600)
    }
  }
  for (const o of f.heap) {
    const q = pos.get(o.id)!
    const hot = f.hot === o.id
    ctx.fillStyle = hot ? alpha(p.brand, 0.18) : o.kind === 'cell' ? alpha(p.groups[4], 0.1) : p.soft
    ctx.strokeStyle = hot ? p.brand : o.kind === 'cell' || o.kind === 'func' ? p.groups[4] : p.line; ctx.lineWidth = hot ? 2.5 : 1.3
    ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(q.x, q.y, q.w, q.h, 6); else ctx.rect(q.x, q.y, q.w, q.h); ctx.fill(); ctx.stroke()
    if (o.kind === 'list') {
      text(ctx, 'list', q.x + q.w - 6, q.y - 4, p.muted, 10, 'right', 600)
      const cw = Math.min(13, (q.w - 16) / Math.max(1, tupleN))
      for (let i = 0; i < tupleN; i++) { ctx.strokeStyle = p.muted; ctx.lineWidth = 1; ctx.strokeRect(q.x + 8 + i * cw, q.y + 8, cw - 2, q.h - 16) }
    } else if (o.kind === 'tuple') text(ctx, o.label, q.x + q.w / 2, q.y + 15, p.ink, 10.5, 'center', 600)
    else {
      text(ctx, o.kind === 'func' ? (tr ? 'fonksiyon nesnesi' : 'function object') : (tr ? 'hücre (cell)' : 'cell'), q.x + q.w / 2, q.y + 20, p.muted, 10, 'center', 600)
      text(ctx, o.label, q.x + q.w / 2, q.y + 40, p.ink, 13, 'center', 700)
    }
  }
  if (tupleN) text(ctx, tr ? `${tupleN} demet (ara noktalar)` : `${tupleN} tuples (waypoints)`, 372, 112 + Math.ceil(tupleN / 6) * 34 + 8, p.muted, 10, 'left', 600)

  // yığın: alttan üste
  const rec = f.mode === 'rec'
  const slots = rec ? f.limit + 2 : 6
  const fh = Math.min(30, (BOT - 44) / slots)
  if (rec) {
    const ly = BOT - (f.limit + 1) * fh
    ctx.strokeStyle = p.groups[0]; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(SX, ly); ctx.lineTo(SX + SW, ly); ctx.stroke(); ctx.setLineDash([])
    text(ctx, tr ? `sınır: ${f.limit} çerçeve` : `limit: ${f.limit} frames`, SX + SW, ly - 4, p.groups[0], 10, 'right', 600)
  }
  f.stack.forEach((fr, i) => {
    const y = BOT - (i + 1) * fh
    const top = i === f.stack.length - 1
    const bad = f.overflow && top && i > f.limit
    ctx.fillStyle = bad ? alpha(p.groups[0], 0.3) : top ? alpha(p.brand, 0.16) : i === 0 ? p.soft : p.bg
    ctx.strokeStyle = bad ? p.groups[0] : top ? p.brand : p.line; ctx.lineWidth = top ? 2 : 1
    ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(SX, y + 1, SW, fh - 2, 4); else ctx.rect(SX, y + 1, SW, fh - 2); ctx.fill(); ctx.stroke()
    const fs = fh < 22 ? 10 : 11.5
    const ty = y + fh / 2 + fs / 2 - 1
    text(ctx, fr.fn, SX + 8, ty, bad ? p.groups[0] : p.ink, fs, 'left', 700)
    let vx = SX + 128
    for (const v of fr.vars) {
      const s = v.ref ? `${v.name} →` : `${v.name} = ${v.val}`
      text(ctx, s, vx, ty, p.muted, fs, 'left', 600)
      ctx.font = `600 ${fs}px Poppins, system-ui, sans-serif`
      const w = ctx.measureText(s).width
      if (v.ref) {
        const b = pos.get(v.ref)
        const ax = vx + w + 4, ay = y + fh / 2
        dot(ctx, ax, ay, 3, p.groups[1])
        if (b) {
          const tx = b.x, tyy = b.y + b.h / 2
          const hotRef = f.hot === v.ref || top
          ctx.strokeStyle = hotRef ? p.groups[1] : alpha(p.groups[1], 0.25); ctx.lineWidth = hotRef ? 1.8 : 1
          ctx.beginPath(); ctx.moveTo(ax, ay); ctx.bezierCurveTo(ax + 60, ay, tx - 60, tyy, tx, tyy); ctx.stroke()
        }
      }
      vx += w + 16
    }
  })
  if (f.ret !== undefined) {
    const y = BOT - f.stack.length * fh - 26
    tag(ctx, (tr ? '↩ döner: ' : '↩ returns: ') + f.ret, SX + 150, Math.max(30, y), p, p.groups[3])
  }
  text(ctx, tr ? `en derin: ${f.maxDepth} çerçeve` : `deepest: ${f.maxDepth} frames`, SX + SW, 22, p.muted, 10, 'right', 600)

  // sonuçlar
  if (f.result !== undefined) text(ctx, (tr ? 'yol = ' : 'path = ') + (tr ? f.result.toFixed(2).replace('.', ',') : f.result.toFixed(2)) + ' m', 372, 400, p.brand, 22, 'left', 700)
  if (f.overflow && rec) text(ctx, tr ? 'yığın taştı: RecursionError' : 'stack overflow: RecursionError', 372, 400, p.groups[0], 18, 'left', 700)
  if (f.mode === 'clo') {
    text(ctx, tr ? 's() çağrıları:' : 's() calls:', 372, 340, p.muted, 12, 'left', 600)
    text(ctx, (f.counts ?? []).join('  ') || '–', 372, 372, p.ink, 22, 'left', 700)
    text(ctx, tr ? 'değer çerçevede değil, hücrede yaşar' : 'the value lives in the cell, not in a frame', 372, 410, p.groups[4], 12, 'left', 600)
  }
}
