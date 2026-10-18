// Ders: aktivasyon fonksiyonları. Üç bölüm: (1) dört eğri ve üzerlerinde gezen z noktası, (2) bir nöronun üç adımı kutularla
// (toplam, eğri, aktarım), (3) eğrisiz iki katmanın tek doğruya çökmesi ve araya tanh girince bükülmesi.
import { alpha, axes, chart, clear, dot, text, type Draw, type Pal } from '../draw'
import { ACTS, NET2, XOR, composite, sigmoid, twoLayer, type AktFrame } from '@/lib/ml/aktivasyon-fonksiyonlari'

type Ctx = CanvasRenderingContext2D

function box(ctx: Ctx, x: number, y: number, w: number, h: number, p: Pal, on: boolean, done: boolean) {
  ctx.fillStyle = on ? p.soft : p.bg; ctx.strokeStyle = on ? p.brand : done ? p.ink : p.line; ctx.lineWidth = on ? 2.4 : 1.2
  ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, 10); else ctx.rect(x, y, w, h); ctx.fill(); ctx.stroke()
}
function arrow(ctx: Ctx, x0: number, y0: number, x1: number, y1: number, col: string, wd = 1.6) {
  ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = wd
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke()
  const a = Math.atan2(y1 - y0, x1 - x0)
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - 8 * Math.cos(a - 0.4), y1 - 8 * Math.sin(a - 0.4)); ctx.lineTo(x1 - 8 * Math.cos(a + 0.4), y1 - 8 * Math.sin(a + 0.4)); ctx.closePath(); ctx.fill()
}
function circle(ctx: Ctx, x: number, y: number, r: number, p: Pal, col: string, fill = p.bg) {
  dot(ctx, x, y, r, fill); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke()
}

export const draw: Draw = (ctx, W, H, f0, p, lang) => {
  const f = f0 as AktFrame
  const tr = lang === 'tr'
  const num = (x: number, d: number) => { const s = x.toFixed(d).replace('-', '−'); return tr ? s.replace('.', ',') : s }
  clear(ctx, W, H, p)

  if (f.phase === 'curves') {
    const names = ['sigmoid', 'tanh', 'ReLU', 'GELU']
    const jobs = tr ? ['0–1 arası güven', '−1 ile 1 arası', 'sıfırın altını keser', "ReLU'nun yumuşak hâli"] : ['a 0–1 confidence', 'between −1 and 1', 'cuts below zero', 'smooth cousin of ReLU']
    const pw = 340, ph = 205
    ACTS.forEach((A, i) => {
      const x0 = 14 + (i % 2) * (pw + 12), y0 = 10 + Math.floor(i / 2) * (ph + 14)
      ctx.fillStyle = p.bg; ctx.strokeStyle = p.line; ctx.lineWidth = 1
      ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x0, y0, pw, ph, 8); else ctx.rect(x0, y0, pw, ph); ctx.fill(); ctx.stroke()
      const L = x0 + 40, R = x0 + pw - 14, T = y0 + 34, B = y0 + ph - 26
      const sx = (z: number) => L + ((z + 4) / 8) * (R - L), sy = (q: number) => B - ((q - A.lo) / (A.hi - A.lo)) * (B - T)
      // eksenler: z = 0 ve çıktı = 0
      ctx.strokeStyle = p.line; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(L, sy(0)); ctx.lineTo(R, sy(0)); ctx.moveTo(sx(0), T); ctx.lineTo(sx(0), B); ctx.stroke()
      const yt = A.key === 'sigmoid' ? [0, 1] : A.key === 'tanh' ? [-1, 0, 1] : [0, 2, 4]
      for (const q of yt) { ctx.strokeStyle = alpha(p.muted, 0.25); ctx.beginPath(); ctx.moveTo(L, sy(q)); ctx.lineTo(R, sy(q)); ctx.stroke(); text(ctx, num(q, 0), L - 6, sy(q) + 4, p.muted, 10, 'right', 400) }
      for (const zt of [-4, -2, 0, 2, 4]) text(ctx, num(zt, 0), sx(zt), B + 14, p.muted, 10, 'center', 400)
      text(ctx, 'z', R, sy(0) - 5, p.muted, 11, 'right', 700)
      text(ctx, names[i], x0 + 12, y0 + 20, p.ink, 14, 'left', 700)
      text(ctx, jobs[i], x0 + pw - 12, y0 + 20, p.muted, 11, 'right', 500)
      // eğri
      ctx.strokeStyle = p.groups[i === 0 ? 1 : i === 1 ? 4 : i === 2 ? 0 : 3]; ctx.lineWidth = 2.6; ctx.beginPath()
      for (let k = 0; k <= 160; k++) { const z = -4 + k * 0.05; const Y = sy(Math.max(A.lo, Math.min(A.hi, A.f(z)))); if (k) ctx.lineTo(sx(z), Y); else ctx.moveTo(sx(z), Y) }
      ctx.stroke()
      // gezen nokta
      const v = A.f(f.z), X = sx(f.z), Y = sy(Math.max(A.lo, Math.min(A.hi, v)))
      ctx.strokeStyle = alpha(p.brand, 0.6); ctx.setLineDash([3, 3]); ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(X, B); ctx.lineTo(X, Y); ctx.lineTo(L, Y); ctx.stroke(); ctx.setLineDash([])
      dot(ctx, X, Y, 6, p.brand)
      const lbl = num(v, 2)
      text(ctx, lbl, X + (f.z > 2 ? -10 : 10), Y + (A.key === 'sigmoid' && v > 0.8 ? 18 : -9), p.brand, 12, f.z > 2 ? 'right' : 'left', 700)
    })
    return
  }

  if (f.phase === 'neuron') {
    const N = f.N, s = f.step
    text(ctx, tr ? 'bir nöronun üç adımı' : 'the three steps of a neuron', 16, 30, p.ink, 16, 'left', 700)
    text(ctx, tr ? 'XOR ağı · 1. gizli nöron' : 'XOR network · hidden neuron 1', W - 16, 30, p.muted, 12, 'right', 600)
    // girdiler
    const ix = 52, iy = [150, 290]
    const xs = [f.x1, f.x2], ws = XOR.w1
    const names = tr ? ['sol sensör', 'sağ sensör'] : ['left sensor', 'right sensor']
    iy.forEach((y, k) => {
      circle(ctx, ix, y, 22, p, p.ink, s === 0 ? p.soft : p.bg)
      text(ctx, num(xs[k], 1), ix, y + 5, p.ink, 14, 'center', 700)
      text(ctx, names[k], ix, y + 40, p.muted, 11, 'center', 500)
    })
    // 1) toplam
    const b1 = { x: 140, y: 150, w: 180, h: 140 }
    iy.forEach((y, k) => {
      arrow(ctx, ix + 24, y, b1.x - 2, b1.y + 40 + k * 60, s >= 1 ? p.ink : p.line, s === 1 ? 2.4 : 1.6)
      if (s >= 1) text(ctx, `× ${num(ws[k], 1)}`, ix + 34, y + (k ? 26 : -16), p.brand, 13, 'left', 700)
    })
    box(ctx, b1.x, b1.y, b1.w, b1.h, p, s === 2, s > 2)
    text(ctx, tr ? '1 · toplam' : '1 · sum', b1.x + 12, b1.y + 22, p.ink, 13, 'left', 700)
    if (s >= 1) text(ctx, `+ ${tr ? 'sapma' : 'bias'} ${num(XOR.b1, 1)}`, b1.x + 12, b1.y + 44, p.muted, 12, 'left', 500)
    if (s >= 2) {
      text(ctx, `${num(f.x1, 1)}·(${num(ws[0], 1)}) + ${num(f.x2, 1)}·${num(ws[1], 1)} + ${num(XOR.b1, 1)}`, b1.x + 12, b1.y + 76, p.muted, 11, 'left', 500)
      text(ctx, `z = ${num(N.z, 1)}`, b1.x + 12, b1.y + 116, p.brand, 22, 'left', 700)
    }
    // 2) eğri
    const b2 = { x: 352, y: 120, w: 176, h: 200 }
    arrow(ctx, b1.x + b1.w + 2, b1.y + b1.h / 2, b2.x - 2, b1.y + b1.h / 2, s >= 3 ? p.ink : p.line)
    box(ctx, b2.x, b2.y, b2.w, b2.h, p, s === 3, s > 3)
    text(ctx, tr ? '2 · eğri (sigmoid)' : '2 · curve (sigmoid)', b2.x + 12, b2.y + 22, p.ink, 13, 'left', 700)
    {
      const L = b2.x + 16, R = b2.x + b2.w - 14, T = b2.y + 40, B = b2.y + 150
      const sx = (z: number) => L + ((z + 6) / 12) * (R - L), sy = (q: number) => B - q * (B - T)
      ctx.strokeStyle = p.line; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(L, B); ctx.lineTo(R, B); ctx.moveTo(sx(0), T); ctx.lineTo(sx(0), B); ctx.stroke()
      ctx.strokeStyle = p.groups[1]; ctx.lineWidth = 2.4; ctx.beginPath()
      for (let k = 0; k <= 120; k++) { const z = -6 + k * 0.1; if (k) ctx.lineTo(sx(z), sy(sigmoid(z))); else ctx.moveTo(sx(z), sy(sigmoid(z))) }
      ctx.stroke()
      text(ctx, '0', L - 4, B + 4, p.muted, 10, 'right', 400); text(ctx, '1', L - 4, T + 4, p.muted, 10, 'right', 400)
      if (s >= 3) {
        const zc = Math.max(-6, Math.min(6, N.z)), X = sx(zc), Y = sy(N.a)
        ctx.strokeStyle = alpha(p.brand, 0.7); ctx.setLineDash([3, 3]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X, B); ctx.lineTo(X, Y); ctx.stroke(); ctx.setLineDash([])
        dot(ctx, X, Y, 6, p.brand)
        text(ctx, `z = ${num(N.z, 1)}`, X, B + 14, p.muted, 10, 'center', 600)
        text(ctx, `a = ${num(N.a, 2)}`, b2.x + 12, b2.y + b2.h - 14, p.brand, 22, 'left', 700)
      }
    }
    // ikinci gizli nöron (aktarımın diğer girdisi)
    const h2x = 440, h2y = 390
    if (s >= 4) {
      circle(ctx, h2x, h2y, 20, p, alpha(p.ink, 0.6), s === 4 ? p.soft : p.bg)
      text(ctx, num(N.h2, 2), h2x, h2y + 5, p.ink, 12, 'center', 700)
      text(ctx, tr ? '2. gizli nöron h₂' : 'hidden neuron 2, h₂', h2x - 28, h2y + 5, p.muted, 11, 'right', 600)
    }
    // 3) aktarım
    const b3 = { x: 560, y: 150, w: 146, h: 140 }
    arrow(ctx, b2.x + b2.w + 2, b1.y + b1.h / 2, b3.x - 2, b1.y + b1.h / 2, s >= 5 ? p.ink : p.line)
    if (s >= 5) text(ctx, '× −7', (b2.x + b2.w + b3.x) / 2, b1.y + b1.h / 2 - 12, p.brand, 12, 'center', 700)
    if (s >= 4) { arrow(ctx, h2x + 20, h2y - 6, b3.x + 20, b3.y + b3.h + 2, s >= 5 ? p.ink : p.line); if (s >= 5) text(ctx, '× −7', (h2x + b3.x) / 2 + 30, (h2y + b3.y + b3.h) / 2 + 18, p.brand, 12, 'center', 700) }
    box(ctx, b3.x, b3.y, b3.w, b3.h, p, s === 5, false)
    text(ctx, tr ? '3 · aktarım' : '3 · hand over', b3.x + 12, b3.y + 22, p.ink, 13, 'left', 700)
    text(ctx, tr ? 'cevap nöronu' : 'answer neuron', b3.x + 12, b3.y + 42, p.muted, 11, 'left', 500)
    if (s >= 5) {
      text(ctx, `+ ${num(XOR.c, 1)} → sigmoid`, b3.x + 12, b3.y + 66, p.muted, 11, 'left', 500)
      text(ctx, num(N.y, 2), b3.x + 12, b3.y + 108, p.brand, 26, 'left', 700)
      text(ctx, N.y > 0.5 ? (tr ? 'evet' : 'yes') : tr ? 'hayır' : 'no', b3.x + b3.w - 12, b3.y + 108, p.ink, 14, 'right', 700)
    }
    return
  }

  // çöküş: eğrisiz iki katman tek doğrudur
  const v = chart(W, H, -3, 3, -6, 8, { l: 56, r: 240, t: 20, b: 44 })
  axes(ctx, v, [-3, -2, -1, 0, 1, 2, 3], [-6, -4, -2, 0, 2, 4, 6, 8], tr ? 'girdi x' : 'input x', tr ? 'çıktı' : 'output', p, W, H, (x) => num(x, 0), (y) => num(y, 0))
  const C = composite()
  const plot = (fn: (x: number) => number, col: string, wd: number, dash: number[] = []) => {
    ctx.save(); ctx.beginPath(); ctx.rect(v.sx(-3), v.sy(8), v.sx(3) - v.sx(-3), v.sy(-6) - v.sy(8)); ctx.clip()
    ctx.strokeStyle = col; ctx.lineWidth = wd; ctx.setLineDash(dash); ctx.beginPath()
    for (let k = 0; k <= 120; k++) { const x = -3 + k * 0.05; if (k) ctx.lineTo(v.sx(x), v.sy(fn(x))); else ctx.moveTo(v.sx(x), v.sy(fn(x))) }
    ctx.stroke(); ctx.setLineDash([]); ctx.restore()
  }
  const cols = [p.groups[1], p.groups[2], p.groups[4]]
  const partA = f.step === 0 ? 1 : 0.35
  NET2.W1.forEach((w, j) => plot((x) => NET2.W2[j] * (w * x + NET2.b1[j]), alpha(cols[j], partA), f.step === 0 ? 2 : 1.4, [6, 4]))
  if (f.step >= 1) plot((x) => twoLayer(x), f.step >= 3 ? alpha(p.brand, 0.45) : p.brand, 3.2)
  if (f.step >= 3) plot((x) => twoLayer(x, Math.tanh), p.groups[3], 3.4)
  // sağ panel: açıklama
  const x0 = W - 226
  let y = 34
  text(ctx, tr ? '1 girdi → 3 gizli → 1 çıktı' : '1 input → 3 hidden → 1 output', x0, y, p.ink, 13, 'left', 700); y += 26
  NET2.W1.forEach((w, j) => {
    ctx.strokeStyle = cols[j]; ctx.lineWidth = 2; ctx.setLineDash([6, 4]); ctx.beginPath(); ctx.moveTo(x0, y - 4); ctx.lineTo(x0 + 22, y - 4); ctx.stroke(); ctx.setLineDash([])
    text(ctx, `${num(NET2.W2[j], 1)} · (${num(w, 1)}x ${NET2.b1[j] < 0 ? '−' : '+'} ${num(Math.abs(NET2.b1[j]), 1)})`, x0 + 30, y, p.muted, 11, 'left', 500); y += 20
  })
  y += 12
  if (f.step >= 1) {
    ctx.strokeStyle = p.brand; ctx.lineWidth = 3.2; ctx.beginPath(); ctx.moveTo(x0, y - 4); ctx.lineTo(x0 + 22, y - 4); ctx.stroke()
    text(ctx, tr ? 'eğrisiz toplam' : 'sum, no curve', x0 + 30, y, p.ink, 12, 'left', 600); y += 24
  }
  if (f.step >= 2) {
    text(ctx, `y = ${num(C.w, 2)}·x + ${num(C.b, 2)}`, x0, y + 6, p.brand, 17, 'left', 700); y += 26
    text(ctx, tr ? 'iki katman = tek doğru' : 'two layers = one line', x0, y, p.muted, 12, 'left', 600); y += 30
  }
  if (f.step >= 3) {
    ctx.strokeStyle = p.groups[3]; ctx.lineWidth = 3.4; ctx.beginPath(); ctx.moveTo(x0, y - 4); ctx.lineTo(x0 + 22, y - 4); ctx.stroke()
    text(ctx, tr ? 'araya tanh: bükülür' : 'tanh in between: it bends', x0 + 30, y, p.ink, 12, 'left', 600); y += 20
    text(ctx, tr ? 'aynı ağırlıklar' : 'same weights', x0 + 30, y, p.muted, 11, 'left', 500)
  }
}
