// Ders: dikkat mekanizması sahnesi. Üstte cümle ve sorgu kelimesinden çıkan dikkat okları; solda vektör tablosu (X ya da Q, K),
// sağda sorgunun adım adım hesabı (benzerlik → ölçekleme → üs → ağırlık) ya da 6 × 6 dikkat ısı haritası; altta karışım.
import { alpha, clear, text, FONT, type Draw, type Pal } from '../draw'
import { FEATS, type AttnFrame, type Stage } from '@/lib/ml/dikkat-mekanizmasi'
import { fmt, type Lang } from '@/lib/ml/core'

const ORDER: Stage[] = ['emb', 'mix', 'qkv', 'score', 'scale', 'exp', 'norm', 'out', 'all']
const at = (s: Stage, t: Stage) => ORDER.indexOf(s) >= ORDER.indexOf(t)

function box(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fill: string, stroke: string, lw = 1.2, r = 6) {
  ctx.fillStyle = fill; ctx.strokeStyle = stroke; ctx.lineWidth = lw
  ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h); ctx.fill(); ctx.stroke()
}

export const draw: Draw = (ctx, W, H, f0, p, lang) => {
  const f = f0 as AttnFrame
  const r = f.r, qi = f.qi
  clear(ctx, W, H, p)
  const L = (b: { tr: string; en: string }) => b[lang]
  const n = (x: number, d = 2) => fmt(x, d, lang)
  const hiWord = f.stage === 'emb' && f.kn < 0 ? -1 - f.kn : f.stage === 'mix' ? 4 : -1
  const showQ = at(f.stage, 'score')
  // ---- cümle
  ctx.font = `600 14px ${FONT}`
  const ws = r.words.map((w) => ctx.measureText(L(w)).width + 22)
  const gap = 14, total = ws.reduce((s, w) => s + w, 0) + gap * 5
  let x = (W - total) / 2
  const cx: number[] = []
  const cy = 98
  ws.forEach((w) => { cx.push(x + w / 2); x += w + gap })
  // oklar: sorgudan her kelimeye
  const weights = at(f.stage, 'norm') ? r.A[qi] : null
  if (showQ) {
    for (let j = 0; j < 6; j++) {
      if (f.stage === 'score' && j >= f.kn) continue
      const x0 = cx[qi], x1 = cx[j]
      const wgt = weights ? weights[j] : 0.15
      const h = j === qi ? 40 : 26 + Math.abs(x1 - x0) * 0.2
      ctx.strokeStyle = weights ? p.brand : p.muted; ctx.lineWidth = weights ? 1 + 9 * wgt : 1.2
      ctx.globalAlpha = weights ? 0.35 + 0.65 * wgt : 0.7
      if (!weights) ctx.setLineDash([4, 3])
      ctx.beginPath()
      if (j === qi) { ctx.moveTo(x0 - 8, cy - 13); ctx.bezierCurveTo(x0 - 26, cy - 13 - h, x0 + 26, cy - 13 - h, x0 + 8, cy - 13) }
      else { ctx.moveTo(x0, cy - 13); ctx.bezierCurveTo(x0, cy - 13 - h, x1, cy - 13 - h, x1, cy - 15) }
      ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1
      // ok ucu
      ctx.fillStyle = weights ? p.brand : p.muted
      ctx.beginPath(); ctx.moveTo(x1, cy - 13); ctx.lineTo(x1 - 4, cy - 21); ctx.lineTo(x1 + 4, cy - 21); ctx.fill()
      const lab = weights ? (lang === 'tr' ? `%${Math.round(wgt * 100)}` : `${Math.round(wgt * 100)}%`) : n(r.raw[qi][j], 1)
      text(ctx, lab, x1, cy + 28, weights ? p.ink : p.muted, 11, 'center', 700)
    }
  }
  r.words.forEach((w, i) => {
    const q = showQ && i === qi
    const hot = i === hiWord
    const wgt = weights ? weights[i] : 0
    box(ctx, cx[i] - ws[i] / 2, cy - 13, ws[i], 26, q ? alpha(p.brand, 0.14) : weights ? alpha(p.brand, 0.04 + 0.3 * wgt) : p.bg, q || hot ? p.brand : p.line, q || hot ? 2 : 1.2)
    text(ctx, L(w), cx[i], cy + 5, p.ink, 14, 'center', q ? 700 : 600)
  })
  if (showQ) text(ctx, lang === 'tr' ? 'sorgu' : 'query', cx[qi], cy - 64, p.brand, 10, 'center', 700)
  // ---- sol: vektör tablosu
  const tx = 14, ty = 164, rh = 22
  const lw = 74
  if (!at(f.stage, 'qkv')) {
    text(ctx, lang === 'tr' ? 'kelime vektörleri X' : 'word vectors X', tx, ty - 22, p.ink, 12, 'left', 700)
    FEATS.forEach((ft, k) => text(ctx, L(ft), tx + lw + 22 + k * 50, ty - 6, p.muted, 10, 'center', 600))
    r.words.forEach((w, i) => {
      const row = f.stage === 'mix' ? r.X[i] : r.X0[i]
      const y = ty + i * rh
      if (i === hiWord) { ctx.fillStyle = alpha(p.brand, 0.1); ctx.fillRect(tx, y, lw + 260, rh - 2) }
      text(ctx, L(w), tx + lw - 6, y + 15, p.ink, 11, 'right', 600)
      row.forEach((v, k) => {
        ctx.fillStyle = v ? alpha(p.groups[1], 0.15 + 0.6 * Math.min(1, v)) : p.soft
        ctx.fillRect(tx + lw + k * 50, y, 44, rh - 3)
        text(ctx, v ? n(v, 1) : '0', tx + lw + 22 + k * 50, y + 14, p.ink, 10, 'center', 500)
      })
    })
    if (f.stage === 'mix') text(ctx, lang === 'tr' ? '"o" += son kelime' : '"it" += last word', tx + lw, ty + 6 * rh + 16, p.brand, 11, 'left', 700)
  } else {
    text(ctx, lang === 'tr' ? 'sorgu Q  ·  anahtar K' : 'query Q  ·  key K', tx, ty - 22, p.ink, 12, 'left', 700)
    const hd = lang === 'tr' ? ['ajan?', 'nesne?', 'eylem?'] : ['agent?', 'object?', 'action?']
    hd.forEach((h, k) => text(ctx, h, tx + lw + 18 + k * 38, ty - 6, p.muted, 9, 'center', 600))
    ;['ajan', 'nesne', 'eylem'].forEach((_, k) => text(ctx, L(FEATS[k]), tx + lw + 132 + 18 + k * 38, ty - 6, p.muted, 9, 'center', 600))
    r.words.forEach((w, i) => {
      const y = ty + i * rh
      if (showQ && i === qi) { ctx.fillStyle = alpha(p.brand, 0.1); ctx.fillRect(tx, y, lw + 112, rh - 2) }
      if (f.stage === 'score' && i === f.kn - 1) { ctx.fillStyle = alpha(p.groups[1], 0.12); ctx.fillRect(tx + lw + 130, y, 116, rh - 2) }
      text(ctx, L(w), tx + lw - 6, y + 15, p.ink, 11, 'right', 600)
      r.Q[i].forEach((v, k) => { ctx.fillStyle = v ? alpha(p.brand, 0.12 + 0.08 * Math.min(5, v)) : p.soft; ctx.fillRect(tx + lw + k * 38, y, 34, rh - 3); text(ctx, n(v, 1), tx + lw + 17 + k * 38, y + 14, p.ink, 10, 'center', 500) })
      r.K[i].forEach((v, k) => { ctx.fillStyle = v ? alpha(p.groups[1], 0.15 + 0.6 * Math.min(1, v)) : p.soft; ctx.fillRect(tx + lw + 132 + k * 38, y, 34, rh - 3); text(ctx, n(v, 1), tx + lw + 149 + k * 38, y + 14, p.ink, 10, 'center', 500) })
    })
  }
  // ---- sol alt: karışım (çıktı vektörü)
  if (at(f.stage, 'out')) {
    const oy = 318
    const o = r.out[qi]
    text(ctx, lang === 'tr' ? `"${L(r.words[qi])}" için yeni vektör = Σ ağırlık · V` : `new vector for "${L(r.words[qi])}" = Σ weight · V`, tx, oy, p.ink, 12, 'left', 700)
    o.forEach((v, k) => {
      const y = oy + 12 + k * 24
      text(ctx, L(FEATS[k]), tx + 60, y + 14, p.muted, 11, 'right', 600)
      ctx.fillStyle = p.soft; ctx.fillRect(tx + 68, y, 220, 18)
      ctx.fillStyle = [p.groups[0], p.groups[1], p.groups[2]][k]; ctx.fillRect(tx + 68, y, 220 * Math.min(1, v), 18)
      text(ctx, n(v), tx + 294, y + 14, p.ink, 11, 'left', 600)
    })
  }
  // ---- sağ: adım adım hesap ya da ısı haritası
  const rx = 384
  if (f.stage === 'all') heat(ctx, f, rx, W, p, lang)
  else if (showQ) steps(ctx, f, rx, W, p, lang)
  void H
}

function steps(ctx: CanvasRenderingContext2D, f: AttnFrame, rx: number, W: number, p: Pal, lang: Lang) {
  const r = f.r, qi = f.qi
  const n = (x: number, d = 2) => fmt(x, d, lang)
  const ty = 164, rh = 22, lw = 70
  const cols = lang === 'tr' ? ['q · k', '÷ √d·τ', 'eˣ', 'ağırlık'] : ['q · k', '÷ √d·τ', 'eˣ', 'weight']
  const cw = [52, 56, 52, W - 14 - rx - lw - 160]
  const cxs = [rx + lw, rx + lw + 52, rx + lw + 108, rx + lw + 160]
  const shown = [true, at(f.stage, 'scale'), at(f.stage, 'exp'), at(f.stage, 'norm')]
  text(ctx, lang === 'tr' ? `"${r.words[qi].tr}" sorgusunun hesabı` : `computation for the query "${r.words[qi].en}"`, rx, ty - 22, p.ink, 12, 'left', 700)
  cols.forEach((c, k) => text(ctx, c, cxs[k] + cw[k] / 2, ty - 6, shown[k] ? p.muted : p.line, 10, 'center', 600))
  const best = r.A[qi].indexOf(Math.max(...r.A[qi]))
  for (let j = 0; j < 6; j++) {
    const y = ty + j * rh
    text(ctx, r.words[j][lang], rx + lw - 6, y + 15, p.ink, 11, 'right', j === best && shown[3] ? 700 : 600)
    if (f.stage === 'score' && j >= f.kn) continue
    const vals = [r.raw[qi][j], r.S[qi][j], r.E[qi][j]]
    vals.forEach((v, k) => { if (!shown[k]) return; ctx.fillStyle = p.soft; ctx.fillRect(cxs[k] + 2, y, cw[k] - 4, rh - 3); text(ctx, n(v), cxs[k] + cw[k] / 2, y + 14, p.ink, 10, 'center', 500) })
    if (shown[3]) {
      const a = r.A[qi][j]
      ctx.fillStyle = p.soft; ctx.fillRect(cxs[3] + 2, y, cw[3] - 40, rh - 3)
      ctx.fillStyle = j === best ? p.brand : alpha(p.brand, 0.45); ctx.fillRect(cxs[3] + 2, y, (cw[3] - 40) * a, rh - 3)
      text(ctx, n(a), cxs[3] + cw[3] - 34, y + 14, p.ink, 10, 'left', 600)
    }
  }
  const sy = ty + 6 * rh + 16
  const parts: string[] = []
  if (shown[1]) parts.push(`√${r.d}·τ = ${n(Math.sqrt(r.d) * f.tau)}`)
  if (shown[2]) parts.push(`Σ eˣ = ${n(r.E[qi].reduce((s, x) => s + x, 0))}`)
  if (shown[3]) parts.push(`${lang === 'tr' ? 'Σ ağırlık' : 'Σ weight'} = ${n(r.A[qi].reduce((s, x) => s + x, 0))}`)
  text(ctx, parts.join('   ·   '), rx + lw, sy, p.muted, 10, 'left', 600)
}

function heat(ctx: CanvasRenderingContext2D, f: AttnFrame, rx: number, W: number, p: Pal, lang: Lang) {
  const r = f.r
  const c = 37, lw = 66
  const x0 = rx + lw, y0 = 202
  text(ctx, lang === 'tr' ? 'dikkat matrisi A (satır: sorgu, sütun: anahtar)' : 'attention matrix A (row: query, column: key)', rx, 150, p.ink, 12, 'left', 700)
  for (let j = 0; j < 6; j++) {
    ctx.save(); ctx.translate(x0 + j * c + c / 2 - 2, y0 - 6); ctx.rotate(-Math.PI / 5); text(ctx, r.words[j][lang], 0, 0, p.muted, 10, 'left', 600); ctx.restore()
  }
  for (let i = 0; i < 6; i++) {
    text(ctx, r.words[i][lang], x0 - 6, y0 + i * c + c / 2 + 4, i === f.qi ? p.brand : p.ink, 11, 'right', i === f.qi ? 700 : 600)
    for (let j = 0; j < 6; j++) {
      const k = i * 6 + j
      const filled = k < f.cells
      const a = r.A[i][j]
      ctx.fillStyle = filled ? alpha(p.brand, 0.06 + 0.94 * a) : p.soft
      ctx.fillRect(x0 + j * c, y0 + i * c, c - 2, c - 2)
      if (filled) text(ctx, fmt(a, 2, lang), x0 + j * c + c / 2 - 1, y0 + i * c + c / 2 + 4, a > 0.45 ? p.bg : p.ink, 10, 'center', 600)
      if (filled && k === f.cells - 1 && f.cells < 36) { ctx.strokeStyle = p.ink; ctx.lineWidth = 2; ctx.strokeRect(x0 + j * c - 1, y0 + i * c - 1, c, c) }
    }
  }
  ctx.strokeStyle = p.brand; ctx.lineWidth = 2; ctx.strokeRect(x0 - 2, y0 + f.qi * c - 2, 6 * c + 2, c + 2)
  void W
}
