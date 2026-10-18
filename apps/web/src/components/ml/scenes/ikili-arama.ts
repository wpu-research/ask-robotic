// Ders: ikili arama sahnesi. Tablo kutuları (16'şar satır), lo/mid/hi işaretleri, elenen yarı soluk; altta iki yöntemin
// karşılaştırma sayaçları ve n'ye göre adım sayısı grafiği.
import { alpha, clear, text, type Draw } from '../draw'
import { bound, type BinFrame } from '@/lib/ml/ikili-arama'

const BW = 40, BH = 34, GAP = 3, ROWH = 60, Y0 = 62, PER = 16

export const draw: Draw = (ctx, W, H, f0, p, lang) => {
  const f = f0 as BinFrame
  const tr = lang === 'tr'
  clear(ctx, W, H, p)
  const X0 = (W - (PER * (BW + GAP) - GAP)) / 2
  const pos = (i: number): { x: number; y: number } => {
    // i = n (dizinin sonu) için son kutunun hemen sağı
    if (i >= f.n) { const q = pos(f.n - 1); return { x: q.x + BW + GAP, y: q.y } }
    return { x: X0 + (i % PER) * (BW + GAP), y: Y0 + Math.floor(i / PER) * ROWH }
  }
  text(ctx, tr ? `aranan: x = ${f.x}` : `target: x = ${f.x}`, 16, 26, p.ink, 15, 'left', 700)
  text(ctx, tr ? 'ADC tablosu (artan sırada)' : 'ADC table (increasing)', W - 16, 26, p.muted, 11, 'right', 600)
  const active = f.lo !== undefined && f.hi !== undefined && f.res === undefined
  for (let i = 0; i < f.n; i++) {
    const { x, y } = pos(i)
    const out = active && (i < f.lo! || i >= f.hi!)
    ctx.globalAlpha = out ? 0.28 : 1
    let fill = p.soft
    if (f.lin !== undefined && i <= f.lin) fill = alpha(p.groups[2], 0.28)
    if (f.res !== undefined && f.found && i === f.res) fill = alpha(p.groups[3], 0.45)
    ctx.fillStyle = fill; ctx.strokeStyle = i === f.mid && active ? p.brand : p.line; ctx.lineWidth = i === f.mid && active ? 3 : 1
    ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, BW, BH, 5); else ctx.rect(x, y, BW, BH); ctx.fill(); ctx.stroke()
    text(ctx, String(f.a[i]), x + BW / 2, y + 17, p.ink, 12, 'center', 600)
    text(ctx, String(i), x + BW / 2, y + 29, p.muted, 9, 'center', 400)
    ctx.globalAlpha = 1
  }
  // işaretler (aynı yerdeki adlar birleşir: "lo/mid")
  const marks = new Map<number, Array<[string, string]>>()
  const add = (i: number | undefined, s: string, c: string) => { if (i === undefined) return; const m = marks.get(i) ?? []; m.push([s, c]); marks.set(i, m) }
  if (active) { add(f.lo, 'lo', p.groups[1]); add(f.mid, 'mid', p.brand); add(f.hi, 'hi', p.groups[0]) }
  if (f.lin !== undefined && (f.found || f.res === undefined || Math.abs(f.lin - f.res) > 1)) add(f.lin, 'i', p.groups[2])
  for (const [i, m] of marks) {
    const { x, y } = pos(i)
    let tx = x + BW / 2 - (m.length - 1) * 13
    tx = Math.min(tx, W - 14 - (m.length - 1) * 26)
    for (const [s, c] of m) { text(ctx, s, tx, y - 7, c, 11, 'center', 700); tx += 26 }
    if (i >= f.n) { ctx.strokeStyle = p.groups[0]; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 2, y); ctx.lineTo(x + 2, y + BH); ctx.stroke() }
  }
  // ekleme noktası (tam eşleşme yoksa)
  if (f.res !== undefined && !f.found) {
    const q = f.res >= f.n ? pos(f.n) : pos(f.res)
    ctx.strokeStyle = p.groups[3]; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(q.x - 1.5, q.y - 4); ctx.lineTo(q.x - 1.5, q.y + BH + 4); ctx.stroke()
    text(ctx, tr ? 'buraya' : 'here', q.x - 1.5, q.y - 8, p.groups[3], 11, 'center', 700)
  }
  // sayaçlar
  const yb = Y0 + 4 * ROWH + 18
  const bx = 16, bw = 400
  text(ctx, tr ? 'karşılaştırma sayısı' : 'comparisons', bx, yb, p.muted, 11, 'left', 600)
  const bars: Array<[string, number, string]> = [[tr ? 'ikili' : 'binary', f.bs, p.brand], [tr ? 'doğrusal' : 'linear', f.ls, p.groups[2]]]
  bars.forEach(([s, v, c], k) => {
    const y = yb + 14 + k * 34
    text(ctx, s, bx, y + 15, p.ink, 12, 'left', 600)
    ctx.fillStyle = p.soft; ctx.fillRect(bx + 70, y, bw - 130, 22)
    ctx.fillStyle = c; ctx.fillRect(bx + 70, y, ((bw - 130) * v) / 64, 22)
    text(ctx, String(v), bx + bw - 30, y + 16, p.ink, 13, 'right', 700)
  })
  text(ctx, tr ? `sınır ⌈log2(n+1)⌉ = ${bound(f.n)}` : `bound ⌈log2(n+1)⌉ = ${bound(f.n)}`, bx + 70, yb + 98, p.muted, 11, 'left', 500)
  // n'ye göre en kötü adım sayısı
  const gx = 440, gy = yb - 10, gw = W - 16 - gx, gh = H - 12 - gy
  ctx.fillStyle = p.bg; ctx.strokeStyle = p.line; ctx.lineWidth = 1
  ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(gx, gy, gw, gh, 6); else ctx.rect(gx, gy, gw, gh); ctx.fill(); ctx.stroke()
  text(ctx, tr ? 'en kötü adım · n = 1–64' : 'worst-case steps · n = 1–64', gx + 8, gy + 15, p.muted, 10, 'left', 600)
  const px = (n: number) => gx + 10 + ((n - 1) / 63) * (gw - 20)
  const py = (s: number) => gy + gh - 8 - (s / 64) * (gh - 30)
  const curve = (g: (n: number) => number, c: string) => { ctx.strokeStyle = c; ctx.lineWidth = 2; ctx.beginPath(); for (let n = 1; n <= 64; n++) n === 1 ? ctx.moveTo(px(n), py(g(n))) : ctx.lineTo(px(n), py(g(n))); ctx.stroke() }
  curve((n) => n, p.groups[2]); curve(bound, p.brand)
  ctx.strokeStyle = p.ink; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(px(f.n), gy + 20); ctx.lineTo(px(f.n), gy + gh - 6); ctx.stroke(); ctx.setLineDash([])
  text(ctx, tr ? 'doğrusal: n' : 'linear: n', px(40), py(52), p.groups[2], 10, 'right', 600)
  text(ctx, 'log2', px(60), py(bound(60)) - 5, p.brand, 10, 'right', 600)
}
