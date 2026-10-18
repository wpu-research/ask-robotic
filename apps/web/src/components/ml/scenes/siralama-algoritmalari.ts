// Ders: sıralama algoritmaları sahnesi. Çubuklar sonar okumaları; karşılaştırılanlar sarı, yazılanlar kırmızı, sıralı kısım
// mavi. Altta karşılaştırma ve yazma sayaçları; sonda üç algoritmanın aynı dizideki sayıları yan yana.
import { alpha, axes, chart, clear, text, type Draw } from '../draw'
import type { SortFrame } from '@/lib/ml/siralama-algoritmalari'

export const draw: Draw = (ctx, W, H, f0, p, lang) => {
  const f = f0 as SortFrame
  const tr = lang === 'tr'
  clear(ctx, W, H, p)
  const n = f.arr.length
  const v = chart(W, H, 0, n, 0, 400, { l: 56, r: 16, t: 34, b: 136 })
  const names = tr ? ['ekleme', 'birleştirme', 'taban (LSD)'] : ['insertion', 'merge', 'radix (LSD)']
  text(ctx, names[f.algo], 16, 20, p.ink, 15, 'left', 700)
  if (f.digit) text(ctx, tr ? `basamak: ${f.digit === 1 ? 'birler' : f.digit === 10 ? 'onlar' : 'yüzler'}` : `digit: ${f.digit === 1 ? 'ones' : f.digit === 10 ? 'tens' : 'hundreds'}`, W - 16, 20, p.brand, 13, 'right', 700)
  if (f.range) {
    ctx.fillStyle = alpha(p.groups[4], 0.1)
    ctx.fillRect(v.sx(f.range[0]), v.sy(400), v.sx(f.range[1]) - v.sx(f.range[0]), v.sy(0) - v.sy(400))
  }
  axes(ctx, v, [0, n], [0, 100, 200, 300, 400], tr ? 'okuma sırası' : 'reading index', tr ? 'mesafe (cm)' : 'distance (cm)', p, W, H, () => '')
  const cw = (v.sx(1) - v.sx(0))
  const bw = Math.max(2, cw - 3)
  const cmp = new Set(f.cmp ?? []), wr = new Set(f.wr ?? [])
  for (let i = 0; i < n; i++) {
    const x = v.sx(i) + (cw - bw) / 2, y = v.sy(f.arr[i])
    let c = alpha(p.groups[1], 0.45)
    if (f.done) c = p.groups[3]
    else if (f.sortedTo !== undefined && i <= f.sortedTo) c = p.groups[1]
    if (cmp.has(i)) c = p.groups[2]
    if (wr.has(i)) c = p.groups[0]
    ctx.fillStyle = c; ctx.fillRect(x, y, bw, v.sy(0) - y)
    if (n <= 24) text(ctx, String(f.arr[i]), x + bw / 2, y - 4, p.muted, 9, 'center', 500)
    if (f.digit) text(ctx, String(Math.floor(f.arr[i] / f.digit) % 10), x + bw / 2, v.sy(0) + 14, p.brand, n <= 32 ? 11 : 9, 'center', 700)
  }
  // sayaçlar
  const y0 = H - 100
  const box = (x: number, label: string, val: number, col: string) => {
    ctx.fillStyle = p.soft; ctx.fillRect(x, y0, 150, 54)
    ctx.fillStyle = col; ctx.fillRect(x, y0, 4, 54)
    text(ctx, label, x + 12, y0 + 18, p.muted, 11, 'left', 600)
    text(ctx, String(val), x + 12, y0 + 44, p.ink, 22, 'left', 700)
  }
  box(16, tr ? 'karşılaştırma' : 'comparisons', f.comps, p.groups[2])
  box(176, tr ? 'yazma' : 'writes', f.writes, p.groups[0])
  // sağda: başvuru değerleri ya da üç algoritmanın tablosu
  const tx = 350
  if (f.table) {
    text(ctx, tr ? 'aynı dizi, üç algoritma' : 'same array, three algorithms', tx, y0 + 12, p.muted, 11, 'left', 600)
    text(ctx, tr ? 'karş.' : 'comp.', tx + 250, y0 + 12, p.muted, 10, 'right', 600)
    text(ctx, tr ? 'yazma' : 'writes', tx + 340, y0 + 12, p.muted, 10, 'right', 600)
    f.table.forEach((t, k) => {
      const y = y0 + 34 + k * 20
      const on = k === f.algo
      text(ctx, names[k], tx, y, on ? p.ink : p.muted, 12, 'left', on ? 700 : 500)
      text(ctx, String(t.comps), tx + 250, y, on ? p.ink : p.muted, 12, 'right', on ? 700 : 500)
      text(ctx, String(t.writes), tx + 340, y, on ? p.ink : p.muted, 12, 'right', on ? 700 : 500)
    })
    if (f.runs !== undefined) text(ctx, tr ? `doğal artan parça: ${f.runs}` : `natural ascending runs: ${f.runs}`, 16, H - 12, p.muted, 11, 'left', 600)
  } else {
    text(ctx, tr ? 'beklenen mertebe' : 'expected order', tx, y0 + 12, p.muted, 11, 'left', 600)
    text(ctx, `n²/4 = ${Math.round((n * n) / 4)}`, tx, y0 + 34, f.algo === 0 ? p.ink : p.muted, 12, 'left', f.algo === 0 ? 700 : 500)
    text(ctx, `n·log2 n = ${Math.round(n * Math.log2(n))}`, tx, y0 + 54, f.algo === 1 ? p.ink : p.muted, 12, 'left', f.algo === 1 ? 700 : 500)
    text(ctx, tr ? `taban: 0 karş., 3 geçiş × 2n yazma` : `radix: 0 comp., 3 passes × 2n writes`, tx, y0 + 74, f.algo === 2 ? p.ink : p.muted, 12, 'left', f.algo === 2 ? 700 : 500)
  }
}
