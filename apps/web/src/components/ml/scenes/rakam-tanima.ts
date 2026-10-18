// Rakam tanıma sahnesi: solda kameradaki etiket ve softmax çubukları, sağda on nöronun 12×12 ağırlık haritası
// (yeşil artı, kırmızı eksi), altta tur tur test sonucu ya da yanlış okunan etiketler.
import { alpha, clear, text, type Draw, type Pal } from '../draw'
import { SIDE, type DigitFrame } from '@/lib/ml/rakam-tanima'

function pixels(ctx: CanvasRenderingContext2D, img: Float32Array, x: number, y: number, cell: number, p: Pal) {
  ctx.fillStyle = p.soft; ctx.fillRect(x, y, cell * SIDE, cell * SIDE)
  for (let a = 0; a < SIDE; a++) for (let b = 0; b < SIDE; b++) {
    const v = img[a * SIDE + b]
    if (v <= 0.02) continue
    ctx.fillStyle = alpha(p.ink, Math.min(1, v)); ctx.fillRect(x + b * cell, y + a * cell, cell, cell)
  }
  ctx.strokeStyle = p.line; ctx.lineWidth = 1; ctx.strokeRect(x - 0.5, y - 0.5, cell * SIDE + 1, cell * SIDE + 1)
}

function wmap(ctx: CanvasRenderingContext2D, W: Float32Array | null, k: number, wmax: number, x: number, y: number, cell: number, p: Pal) {
  ctx.fillStyle = p.soft; ctx.fillRect(x, y, cell * SIDE, cell * SIDE)
  if (W && wmax > 0) for (let j = 0; j < SIDE * SIDE; j++) {
    const v = W[j * 10 + k] / wmax
    if (Math.abs(v) < 0.02) continue
    ctx.fillStyle = alpha(v > 0 ? p.groups[3] : p.groups[0], Math.min(1, Math.abs(v)))
    ctx.fillRect(x + (j % SIDE) * cell, y + Math.floor(j / SIDE) * cell, cell, cell)
  }
}

export const draw: Draw = (ctx, W, H, f0, p, lang) => {
  const f = f0 as DigitFrame
  const tr = lang === 'tr'
  clear(ctx, W, H, p)

  // sol: kamera görüntüsü
  const cell = 14, ix = 30, iy = 32
  text(ctx, tr ? 'kamera: kutu etiketi' : 'camera: box label', ix, 22, p.muted, 11, 'left', 600)
  pixels(ctx, f.img, ix, iy, cell, p)
  text(ctx, `${tr ? 'gerçek' : 'true'}: ${f.y}`, ix + cell * SIDE + 12, iy + 14, p.ink, 13, 'left', 700)

  // softmax çubukları
  const bx = 22, by0 = 232, bh = 110, bw = 16, gap = 5.5
  text(ctx, tr ? 'softmax: her rakamın olasılığı' : 'softmax: chance of each digit', bx, by0 - 10, p.muted, 11, 'left', 600)
  ctx.strokeStyle = p.line; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(bx - 4, by0 + bh + 0.5); ctx.lineTo(bx + 10 * (bw + gap), by0 + bh + 0.5); ctx.stroke()
  const top = f.probs.reduce((bi, v, i) => (v > f.probs[bi] ? i : bi), 0)
  const neg = f.probs.some((v) => v < 0)
  const zero = neg ? by0 + bh * 0.55 : by0 + bh
  f.probs.forEach((v, k) => {
    const x = bx + k * (bw + gap)
    const h = (neg ? 0.55 : 1) * bh * Math.max(-1, Math.min(1, v))
    ctx.fillStyle = k === f.y ? p.groups[3] : v < 0 ? p.groups[0] : alpha(p.brand, 0.55)
    if (h >= 0) ctx.fillRect(x, zero - h, bw, Math.max(1, h)); else ctx.fillRect(x, zero, bw, -h)
    text(ctx, String(k), x + bw / 2, by0 + bh + 16, k === f.y ? p.ink : p.muted, 11, 'center', k === f.y ? 700 : 500)
  })
  if (!neg) {
    const x = bx + top * (bw + gap) + bw / 2
    const s = tr ? `%${Math.round(f.probs[top] * 100)}` : `${Math.round(f.probs[top] * 100)}%`
    text(ctx, s, Math.max(bx + 12, Math.min(bx + 10 * (bw + gap) - 14, x)), zero - Math.max(1, bh * f.probs[top]) - 5, p.ink, 11, 'center', 700)
  } else text(ctx, tr ? 'hata = olasılık − doğru cevap' : 'error = chance − right answer', bx, by0 + bh + 34, p.groups[0], 11, 'left', 600)

  // sağ: ağırlık haritaları
  const mc = 7, mw = mc * SIDE, mx0 = 262, mg = (W - 16 - mx0 - 5 * mw) / 4
  text(ctx, tr ? 'her nöronun 144 ağırlığı (yeşil +, kırmızı −)' : "each neuron's 144 weights (green +, red −)", mx0, 22, p.muted, 11, 'left', 600)
  for (let k = 0; k < 10; k++) {
    const x = mx0 + (k % 5) * (mw + mg), y = 48 + Math.floor(k / 5) * (mw + 30)
    wmap(ctx, f.W, k, f.wmax, x, y, mc, p)
    const hi = f.hi === k
    ctx.strokeStyle = hi ? p.ink : p.line; ctx.lineWidth = hi ? 2.5 : 1; ctx.strokeRect(x - 0.5, y - 0.5, mw + 1, mw + 1)
    text(ctx, String(k), x + mw / 2, y - 6, hi ? p.ink : p.muted, 12, 'center', hi ? 700 : 600)
  }
  if (!f.W) text(ctx, tr ? 'henüz ağırlık yok' : 'no weights yet', mx0 + (W - 16 - mx0) / 2, 48 + mw / 2 + 4, p.muted, 12, 'center', 600)

  // 144 sayılık şerit
  if (f.flat) {
    const sw = 4.5, sx = (W - 144 * sw) / 2, sy = 392
    text(ctx, tr ? '12 satır art arda → modelin gördüğü 144 sayı' : '12 rows one after another → the 144 numbers the model sees', sx, sy - 8, p.muted, 11, 'left', 600)
    for (let j = 0; j < 144; j++) {
      ctx.fillStyle = alpha(p.ink, Math.max(0.04, f.img[j])); ctx.fillRect(sx + j * sw, sy, sw - 0.6, 26)
      if (j % SIDE === 0) { ctx.fillStyle = p.brand; ctx.fillRect(sx + j * sw, sy + 28, 1.5, 6) }
    }
    return
  }

  // alt sağ: tur sonuçları ya da hatalar
  const ax = mx0, ay = 296
  if (f.miss) {
    text(ctx, f.miss.length ? (tr ? 'yanlış okunan test etiketleri (gerçek → tahmin)' : 'misread test labels (true → guess)') : (tr ? 'yanlış okunan etiket yok' : 'no misread labels'), ax, ay, p.muted, 11, 'left', 600)
    f.miss.forEach((m, i) => {
      const x = ax + i * 74, y = ay + 12
      pixels(ctx, m.img, x, y, 5, p)
      text(ctx, `${m.y} → ${m.pred}`, x + 30, y + 78, p.groups[0], 12, 'center', 700)
    })
    return
  }
  text(ctx, tr ? `görmediği 500 etikette doğru (tur sonunda)` : 'right out of 500 unseen labels (end of round)', ax, ay, p.muted, 11, 'left', 600)
  const cw = 70
  for (let t = 0; t < f.rounds; t++) {
    const x = ax + t * (cw + 12), y = ay + 14
    const v = f.acc[t]
    ctx.fillStyle = v === undefined ? p.soft : alpha(p.groups[3], 0.15); ctx.strokeStyle = t + 1 === f.round && v === undefined ? p.brand : p.line; ctx.lineWidth = 1.2
    ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, cw, 54, 6); else ctx.rect(x, y, cw, 54); ctx.fill(); ctx.stroke()
    text(ctx, `${tr ? 'tur' : 'round'} ${t + 1}`, x + cw / 2, y + 17, p.muted, 10, 'center', 600)
    text(ctx, v === undefined ? '…' : String(v), x + cw / 2, y + 42, v === undefined ? p.muted : p.ink, 18, 'center', 700)
  }
  if (f.round > 0 && f.seen) {
    const x = ax, y = ay + 92, w = W - 16 - ax
    ctx.fillStyle = p.soft; ctx.fillRect(x, y, w, 8)
    ctx.fillStyle = p.brand; ctx.fillRect(x, y, (w * f.seen) / 3000, 8)
    text(ctx, tr ? 'bu turda okunan örnek' : 'examples read this round', x, y + 24, p.muted, 10, 'left', 500)
  }
}
