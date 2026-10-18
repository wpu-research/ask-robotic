// Ders: kelime vektörleri sahnesi. Solda eş-bulunma / PPMI ısı haritası ve sayılan cümle, sağda 2B kelime haritası ve
// seçili kelimenin en yakın komşuları (kosinüs).
import { alpha, clear, dot, text, FONT, type Draw, type Pal } from '../draw'
import { WORDS, type WvFrame } from '@/lib/ml/kelime-vektorleri'
import { fmt } from '@/lib/ml/core'

const col = (p: Pal, t: number) => (t < 0 ? p.muted : p.groups[[1, 0, 3][t]])

export const draw: Draw = (ctx, W, H, f0, p, lang) => {
  const f = f0 as WvFrame
  clear(ctx, W, H, p)
  const n = WORDS.length
  const lab = (i: number) => WORDS[i].label[lang]
  // ---- ısı haritası (sol)
  const cs = 11, hx = 78, hy = 46
  text(ctx, f.kind === 'count' ? (lang === 'tr' ? 'eş-bulunma sayıları' : 'co-occurrence counts') : 'PPMI', hx, 26, p.ink, 13, 'left', 700)
  text(ctx, lang === 'tr' ? `pencere ${f.win}` : `window ${f.win}`, hx + n * cs, 26, p.muted, 11, 'right', 500)
  const mx = Math.max(1e-9, ...f.M.flat())
  const inSent = new Set(f.sent !== undefined ? f.S[f.sent] : [])
  for (let i = 0; i < n; i++) {
    const hot = f.sel === i || inSent.has(i)
    text(ctx, lab(i), hx - 6, hy + i * cs + 9, hot ? p.ink : col(p, WORDS[i].topic), 9, 'right', hot ? 700 : 500)
    for (let j = 0; j < n; j++) {
      const v = f.M[i][j]
      ctx.fillStyle = v > 0 ? alpha(p.brand, 0.12 + 0.85 * (v / mx)) : p.soft
      ctx.fillRect(hx + j * cs, hy + i * cs, cs - 1, cs - 1)
    }
  }
  // konu şeridi (sütunların üstünde)
  for (let j = 0; j < n; j++) { ctx.fillStyle = col(p, WORDS[j].topic); ctx.fillRect(hx + j * cs, hy - 6, cs - 1, 3) }
  if (f.sel !== undefined) { ctx.strokeStyle = p.ink; ctx.lineWidth = 1.5; ctx.strokeRect(hx - 0.5, hy + f.sel * cs - 0.5, n * cs, cs) }
  // ---- sayılan cümle ve pencere yayları
  const by = hy + n * cs + 24
  if (f.sent !== undefined) {
    const s = f.S[f.sent]
    text(ctx, lang === 'tr' ? `cümle ${f.sent + 1} / ${f.S.length}` : `sentence ${f.sent + 1} / ${f.S.length}`, 14, by, p.muted, 11, 'left', 600)
    ctx.font = `600 12px ${FONT}`
    const ws = s.map((k) => ctx.measureText(lab(k)).width + 14)
    const xs: number[] = []
    let x = 14
    ws.forEach((w) => { xs.push(x + w / 2); x += w + 8 })
    const cy = by + 52
    for (let a = 0; a < s.length; a++) for (let b = a + 1; b < s.length; b++) {
      if (b - a > f.win) continue
      const h = 10 + 9 * (b - a)
      ctx.strokeStyle = alpha(p.brand, 0.7); ctx.lineWidth = 1.3
      ctx.beginPath(); ctx.moveTo(xs[a], cy - 11); ctx.bezierCurveTo(xs[a], cy - 11 - h, xs[b], cy - 11 - h, xs[b], cy - 11); ctx.stroke()
    }
    s.forEach((k, i) => {
      const w = ws[i], x0 = xs[i] - w / 2
      ctx.fillStyle = p.bg; ctx.strokeStyle = col(p, WORDS[k].topic); ctx.lineWidth = 1.4
      ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x0, cy - 11, w, 22, 6); else ctx.rect(x0, cy - 11, w, 22); ctx.fill(); ctx.stroke()
      text(ctx, lab(k), xs[i], cy + 4, p.ink, 12, 'center', 600)
    })
    text(ctx, lang === 'tr' ? 'her yay: matriste +1 (iki yönde)' : 'each arc: +1 in the matrix (both ways)', 14, cy + 30, p.muted, 10, 'left', 500)
  } else if (!f.Y) {
    const ex = f.S.slice(0, 4).map((s) => s.map(lab).join(' '))
    text(ctx, lang === 'tr' ? 'örnek cümleler' : 'example sentences', 14, by, p.muted, 11, 'left', 600)
    ex.forEach((e, i) => text(ctx, e, 14, by + 18 + i * 16, p.ink, 11, 'left', 500))
    text(ctx, '…', 14, by + 18 + 4 * 16, p.muted, 11)
  } else {
    // renk açıklaması
    const L = lang === 'tr' ? ['algı', 'hareket', 'enerji', 'ortak'] : ['sensing', 'motion', 'energy', 'shared']
    ;[0, 1, 2, -1].forEach((t, i) => { dot(ctx, 20, by + i * 18, 4.5, col(p, t)); text(ctx, L[i], 30, by + 4 + i * 18, p.muted, 11) })
    text(ctx, lang === 'tr' ? 'komşuluk 19 boyutlu kosinüsle' : 'neighbours use 19-D cosine', 14, by + 84, p.muted, 10, 'left', 500)
    if (f.sel !== undefined && f.nn) {
      const y0 = by + 108
      text(ctx, lang === 'tr' ? `${lab(f.sel)} ile kosinüs` : `cosine with ${lab(f.sel)}`, 14, y0, p.ink, 12, 'left', 700)
      f.nn.forEach(([k, c], i) => {
        const y = y0 + 12 + i * 20
        text(ctx, lab(k), 84, y + 11, col(p, WORDS[k].topic), 11, 'right', 600)
        ctx.fillStyle = p.soft; ctx.fillRect(90, y, 150, 14)
        ctx.fillStyle = col(p, WORDS[k].topic); ctx.fillRect(90, y, 150 * Math.max(0, c), 14)
        text(ctx, fmt(c, 2, lang), 246, y + 11, p.ink, 11, 'left', 600)
      })
    }
  }
  // ---- 2B harita (sağ)
  const mx0 = 300, mx1 = W - 14, my0 = 14, my1 = H - 14
  ctx.fillStyle = p.soft; ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(mx0, my0, mx1 - mx0, my1 - my0, 8); else ctx.rect(mx0, my0, mx1 - mx0, my1 - my0); ctx.fill()
  const cx = (mx0 + mx1) / 2, cy = (my0 + my1) / 2
  const sc = Math.min(mx1 - mx0 - 150, my1 - my0 - 80) / 2 / f.ext
  const P = (q: [number, number]) => [Math.max(mx0 + 12, Math.min(mx1 - 12, cx + q[0] * sc)), Math.max(my0 + 30, Math.min(my1 - 12, cy - q[1] * sc))] as [number, number]
  ctx.strokeStyle = p.line; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(mx0 + 10, cy); ctx.lineTo(mx1 - 10, cy); ctx.moveTo(cx, my0 + 10); ctx.lineTo(cx, my1 - 10); ctx.stroke()
  if (!f.Y) {
    text(ctx, lang === 'tr' ? 'harita, PPMI hesaplanınca çizilecek' : 'the map is drawn once PPMI is ready', cx, cy - 8, p.muted, 12, 'center', 600)
    return
  }
  text(ctx, lang === 'tr' ? `2B harita · güç yöntemi adım ${f.iter ?? 0}` : `2D map · power method step ${f.iter ?? 0}`, mx0 + 10, my0 + 20, p.muted, 11, 'left', 600)
  const pos = f.Y.map(P)
  // komşu çizgileri
  if (f.sel !== undefined && f.nn) {
    const [sx, sy] = pos[f.sel]
    f.nn.forEach(([k, c]) => {
      const [x, y] = pos[k]
      ctx.strokeStyle = p.ink; ctx.lineWidth = 1 + 2.5 * Math.max(0, c); ctx.globalAlpha = 0.7
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(x, y); ctx.stroke(); ctx.globalAlpha = 1
    })
  }
  pos.forEach(([x, y], i) => dot(ctx, x, y, f.sel === i ? 7 : 5, col(p, WORDS[i].topic)))
  if (f.sel !== undefined) { const [x, y] = pos[f.sel]; ctx.strokeStyle = p.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2); ctx.stroke() }
  // etiketler: çakışmayı önlemek için sırayla yerleştir (sağa, sola, alta, üste kaydır)
  ctx.font = `600 11px ${FONT}`
  const boxes: Array<[number, number, number, number]> = pos.map(([x, y], i) => (f.sel === i ? [x - 11, y - 11, 22, 22] : [x - 5, y - 5, 10, 10]))
  const hit = (b: [number, number, number, number]) => b[0] < mx0 + 4 || b[0] + b[2] > mx1 - 4 || b[1] < my0 + 26 || b[1] + b[3] > my1 - 4 || boxes.some((q) => b[0] < q[0] + q[2] && q[0] < b[0] + b[2] && b[1] < q[1] + q[3] && q[1] < b[1] + b[3])
  const order = pos.map((_, i) => i).sort((a, b) => (a === f.sel ? -1 : b === f.sel ? 1 : a - b))
  const nnSet = new Map((f.nn ?? []).map(([k, c]) => [k, c]))
  for (const i of order) {
    const [x, y] = pos[i]
    const c = nnSet.get(i)
    const s = c !== undefined ? `${lab(i)} ${fmt(c, 2, lang)}` : lab(i)
    const w = ctx.measureText(s).width + 4, h = 13
    const cand: Array<[number, number]> = []
    for (let r = 0; r < 9; r++) cand.push([x + 8, y - 6 + r * 13], [x - 8 - w, y - 6 + r * 13], [x + 8, y - 6 - r * 13], [x - 8 - w, y - 6 - r * 13])
    let pick = cand[0]
    for (const q of cand) { if (!hit([q[0], q[1], w, h])) { pick = q; break } }
    boxes.push([pick[0], pick[1], w, h])
    if (Math.abs(pick[1] + 6 - y) > 8) { ctx.strokeStyle = p.line; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(pick[0] + (pick[0] > x ? 0 : w), pick[1] + 7); ctx.stroke() }
    const strong = i === f.sel || c !== undefined
    text(ctx, s, pick[0] + 2, pick[1] + 10, strong ? p.ink : col(p, WORDS[i].topic), 11, 'left', strong ? 700 : 500)
  }
}
