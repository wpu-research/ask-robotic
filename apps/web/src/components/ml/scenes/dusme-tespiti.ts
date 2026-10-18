// Düşme tespiti sahnesi: üstte hasta odası ve iskelet, altta gövde açısı ve kalça oranı zaman çizgileri, eşikler ve alarm anı.
import { alpha, clear, dot, tag, text, type Draw, type Pal } from '../draw'
import { fmt, type Lang } from '@/lib/ml/core'
import { DUR, FPS, RATIO, SEGMENTS, kindName, type FallFrame } from '@/lib/ml/dusme-tespiti'

const MX = 68, X0 = 20, FLOOR = 222
const wx = (x: number) => X0 + x * MX
const wy = (y: number) => FLOOR - y * MX

function room(ctx: CanvasRenderingContext2D, p: Pal, f: FallFrame, lang: Lang) {
  ctx.fillStyle = p.soft; ctx.fillRect(8, 8, 704, FLOOR - 8)
  ctx.fillStyle = alpha(p.muted, 0.25); ctx.fillRect(8, FLOOR, 704, 6)
  // duvar kamerası ve görüş alanı
  ctx.fillStyle = p.ink; ctx.fillRect(16, 16, 22, 12); dot(ctx, 40, 22, 4, p.groups[0])
  ctx.strokeStyle = alpha(p.muted, 0.35); ctx.setLineDash([5, 5]); ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(42, 24); ctx.lineTo(700, 60); ctx.moveTo(42, 24); ctx.lineTo(560, FLOOR); ctx.stroke(); ctx.setLineDash([])
  // bakım robotu
  const rx = wx(0.35)
  ctx.fillStyle = alpha(p.brand, 0.15); ctx.strokeStyle = p.brand; ctx.lineWidth = 1.5
  ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(rx - 18, FLOOR - 70, 36, 62, 8); else ctx.rect(rx - 18, FLOOR - 70, 36, 62); ctx.fill(); ctx.stroke()
  ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(rx - 13, FLOOR - 92, 26, 20, 6); else ctx.rect(rx - 13, FLOOR - 92, 26, 20); ctx.fill(); ctx.stroke()
  const alarmOn = f.alarms.length > 0 && f.cnt[f.i] >= f.win
  dot(ctx, rx - 5, FLOOR - 82, 2.5, alarmOn ? p.groups[0] : p.brand); dot(ctx, rx + 5, FLOOR - 82, 2.5, alarmOn ? p.groups[0] : p.brand)
  dot(ctx, rx - 10, FLOOR - 4, 5, p.ink); dot(ctx, rx + 10, FLOOR - 4, 5, p.ink)
  text(ctx, lang === 'tr' ? 'bakım robotu' : 'care robot', rx, FLOOR - 98, p.brand, 10, 'center', 600)
  // sandalye
  const cx = wx(6.2)
  ctx.strokeStyle = p.muted; ctx.lineWidth = 4
  ctx.beginPath(); ctx.moveTo(cx - 22, wy(0.42)); ctx.lineTo(cx + 18, wy(0.42)); ctx.moveTo(cx - 20, wy(0.42)); ctx.lineTo(cx - 20, FLOOR); ctx.moveTo(cx + 16, wy(0.42)); ctx.lineTo(cx + 16, FLOOR)
  ctx.moveTo(cx - 22, wy(0.42)); ctx.lineTo(cx - 26, wy(0.95)); ctx.stroke()
  // yerdeki eşya (eğilmede alınır)
  if (f.i / FPS < 6.4) { ctx.fillStyle = p.groups[2]; ctx.fillRect(wx(4.35) - 7, FLOOR - 10, 14, 10) }
}

function chartPanel(ctx: CanvasRenderingContext2D, p: Pal, f: FallFrame, lang: Lang, y0: number, h: number, data: number[], lo: number, hi: number, thr: number, label: string, fmtThr: string, below: boolean) {
  const x0 = 60, x1 = 700
  const sx = (i: number) => x0 + (i / (DUR * FPS)) * (x1 - x0)
  const sy = (v: number) => y0 + h - ((Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo)) * h
  ctx.strokeStyle = p.line; ctx.lineWidth = 1; ctx.strokeRect(x0, y0, x1 - x0, h)
  // "yerde" sayacı dolu olan kareler
  ctx.fillStyle = alpha(p.brand, 0.14)
  for (let i = 0, a = -1; i <= f.i + 1; i++) {
    const on = i <= f.i && f.cnt[i] > 0
    if (on && a < 0) a = i
    if (!on && a >= 0) { ctx.fillRect(sx(a), y0, sx(i) - sx(a), h); a = -1 }
  }
  // eşik
  ctx.strokeStyle = p.groups[0]; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.2
  ctx.beginPath(); ctx.moveTo(x0, sy(thr)); ctx.lineTo(x1, sy(thr)); ctx.stroke(); ctx.setLineDash([])
  text(ctx, fmtThr, x1 - 4, below ? sy(thr) + 12 : sy(thr) - 4, p.groups[0], 10, 'right', 600)
  ctx.strokeStyle = p.groups[1]; ctx.lineWidth = 1.8; ctx.beginPath()
  for (let i = 0; i <= f.i; i++) { const X = sx(i), Y = sy(data[i]); if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y) }
  ctx.stroke()
  text(ctx, label, x0 - 6, y0 + 10, p.muted, 10, 'right', 600)
  text(ctx, String(hi === 90 ? '90°' : fmt(hi, 1, lang)), x0 - 6, y0 + 22, p.muted, 9, 'right', 400)
  text(ctx, String(lo === 0 && hi === 90 ? '0°' : fmt(lo, 0, lang)), x0 - 6, y0 + h, p.muted, 9, 'right', 400)
  // alarm anları ve imleç
  for (const a of f.alarms) { ctx.strokeStyle = p.groups[0]; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(sx(a), y0); ctx.lineTo(sx(a), y0 + h); ctx.stroke() }
  ctx.strokeStyle = p.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(sx(f.i), y0); ctx.lineTo(sx(f.i), y0 + h); ctx.stroke()
  return sx
}

/** Etiketi kanvas içinde tut: sağa sığmazsa noktanın soluna yaz. */
function tagFit(ctx: CanvasRenderingContext2D, s: string, x: number, y: number, p: Pal, col: string, left: number) {
  ctx.font = `600 12px Poppins, system-ui, sans-serif`
  const w = ctx.measureText(s).width + 16
  tag(ctx, s, x + w > 712 ? left - w : x, y, p, col)
}

export const draw: Draw = (ctx, W, H, f0, p, lang) => {
  const f = f0 as FallFrame
  const tr = lang === 'tr'
  clear(ctx, W, H, p)
  room(ctx, p, f, lang)
  const q = f.kp[f.i]
  const P = (k: number): [number, number] => [wx(q[2 * k]), wy(q[2 * k + 1])]
  const [hd, nk, hp, kl, kr, fl, fr] = [0, 1, 2, 3, 4, 5, 6].map(P)
  const alarmOn = f.alarms.length > 0 && f.cnt[f.i] >= f.win
  const low = f.cnt[f.i] > 0
  const col = alarmOn ? p.groups[0] : low ? p.brand : p.ink
  ctx.strokeStyle = col; ctx.lineWidth = 5; ctx.lineCap = 'round'
  const seg = (a: [number, number], b: [number, number]) => { ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke() }
  seg(nk, hp); seg(hp, kl); seg(kl, fl); seg(hp, kr); seg(kr, fr); seg(hd, nk)
  ctx.lineCap = 'butt'
  ctx.fillStyle = p.bg; ctx.beginPath(); ctx.arc(hd[0], hd[1], 10, 0, Math.PI * 2); ctx.fill(); ctx.lineWidth = 3; ctx.stroke()
  for (const k of [hd, nk, hp, kl, kr, fl, fr]) dot(ctx, k[0], k[1], 3.5, p.groups[1])
  // ölçü gösterimleri
  if (f.show === 'angle') {
    ctx.strokeStyle = p.groups[2]; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3])
    ctx.beginPath(); ctx.moveTo(hp[0], hp[1]); ctx.lineTo(hp[0], hp[1] - 50); ctx.stroke(); ctx.setLineDash([])
    const a = Math.atan2(nk[0] - hp[0], hp[1] - nk[1])
    ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(hp[0], hp[1], 30, -Math.PI / 2, -Math.PI / 2 + a, a < 0); ctx.stroke()
    tagFit(ctx, `${fmt(f.ang[f.i], 0, lang)}°`, hp[0] + 34, hp[1] - 60, p, p.groups[2], hp[0] - 34)
  }
  if (f.show === 'ratio' || f.show === 'drop') {
    const x = hp[0] + 26
    ctx.strokeStyle = p.groups[3]; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(x, FLOOR); ctx.lineTo(x, hp[1]); ctx.moveTo(x - 4, hp[1]); ctx.lineTo(x + 4, hp[1]); ctx.stroke()
    ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(hp[0] - 30, wy(0.92)); ctx.lineTo(hp[0] + 60, wy(0.92)); ctx.stroke(); ctx.setLineDash([])
    if (f.show === 'ratio') tagFit(ctx, tr ? `kalça ${fmt(f.ratio[f.i], 2, lang)} × ayakta` : `hip ${f.ratio[f.i].toFixed(2)} × standing`, x + 8, (FLOOR + hp[1]) / 2 - 11, p, p.groups[3], hp[0] - 40)
    else {
      ctx.strokeStyle = p.groups[0]; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(hp[0] - 26, hp[1] - 30); ctx.lineTo(hp[0] - 26, hp[1]); ctx.lineTo(hp[0] - 31, hp[1] - 7); ctx.moveTo(hp[0] - 26, hp[1]); ctx.lineTo(hp[0] - 21, hp[1] - 7); ctx.stroke()
      tagFit(ctx, tr ? `iniş ${fmt(f.drop[f.i], 2, lang)} m/s` : `drop ${f.drop[f.i].toFixed(2)} m/s`, x + 8, hp[1] - 40, p, p.groups[0], hp[0] - 40)
    }
  }
  // gösterge (sağ üst)
  const gx = 520, gy = 16
  ctx.fillStyle = alpha(p.bg, 0.92); ctx.strokeStyle = p.line; ctx.lineWidth = 1
  ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(gx, gy, 186, 74, 8); else ctx.rect(gx, gy, 186, 74); ctx.fill(); ctx.stroke()
  const st = alarmOn ? (tr ? 'ALARM' : 'ALARM') : low ? (tr ? 'yerde?' : 'on floor?') : (tr ? 'normal' : 'normal')
  tag(ctx, st, gx + 8, gy + 8, p, alarmOn ? p.groups[0] : low ? p.brand : p.groups[3])
  text(ctx, `${fmt(f.ang[f.i], 0, lang)}° · ${fmt(f.ratio[f.i], 2, lang)}`, gx + 178, gy + 24, p.ink, 12, 'right', 700)
  const bw = 170, frac = Math.min(1, f.cnt[f.i] / f.win)
  ctx.fillStyle = p.line; ctx.fillRect(gx + 8, gy + 42, bw, 8)
  ctx.fillStyle = alarmOn ? p.groups[0] : p.brand; ctx.fillRect(gx + 8, gy + 42, bw * frac, 8)
  text(ctx, tr ? `yerde: ${Math.min(f.cnt[f.i], f.win)}/${f.win} kare` : `on floor: ${Math.min(f.cnt[f.i], f.win)}/${f.win} frames`, gx + 8, gy + 66, p.muted, 11, 'left', 600)
  // alt grafikler
  const sx = chartPanel(ctx, p, f, lang, 262, 72, f.ang, 0, 90, f.angThr, tr ? 'açı' : 'angle', tr ? `eşik ${f.angThr}°` : `threshold ${f.angThr}°`, false)
  chartPanel(ctx, p, f, lang, 352, 62, f.ratio, 0, 1.2, RATIO, tr ? 'kalça' : 'hip', fmt(RATIO, 1, lang), true)
  // etkinlik adları
  for (const s of SEGMENTS) {
    if (s.kind === 'stand') continue
    const k = kindName(s.kind)
    text(ctx, tr ? k[0] : k[1], (sx(s.t0 * FPS) + sx(s.t1 * FPS)) / 2, 255, s.kind === 'fall' ? p.groups[0] : p.muted, 10, 'center', 600)
  }
  for (let s = 0; s <= DUR; s += 2) text(ctx, String(s), sx(s * FPS), 428, p.muted, 9, 'center', 400)
  text(ctx, tr ? 'zaman (s)' : 'time (s)', 700, 446, p.muted, 10, 'right', 600)
  for (const a of f.alarms) text(ctx, 'ALARM', sx(a) + 4, 346, p.groups[0], 10, 'left', 700)
}
