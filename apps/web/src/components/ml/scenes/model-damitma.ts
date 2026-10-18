// Ders: model damıtma sahnesi. Üstte üç karar haritası yan yana (öğretmen, sert etiketli öğrenci, damıtılmış öğrenci) ve
// parametre sayıları; altta test doğruluğu eğrileri ve seçili örneğin sert etiketi ile öğretmenin yumuşak hedefi.
import { alpha, clear, dot, text, type Draw, type Pal } from '../draw'
import { accuracy, paramCount, predict, type DistFrame, type Net } from '@/lib/ml/model-damitma'
import { fmt, type Lang, type Pt } from '@/lib/ml/core'

const X0 = -3, X1 = 3, Y0 = -2.5, Y1 = 3
const COL = (p: Pal) => [p.groups[5], p.groups[3], p.groups[1]] // beton, çim, çakıl
const NAMES = { tr: ['beton', 'çim', 'çakıl'], en: ['concrete', 'grass', 'gravel'] }

function panel(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, net: Net | null, pts: Pt[], r: number, p: Pal, probe?: Pt) {
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip()
  ctx.fillStyle = p.soft; ctx.fillRect(x, y, w, h)
  const sx = (v: number) => x + ((v - X0) / (X1 - X0)) * w, sy = (v: number) => y + h - ((v - Y0) / (Y1 - Y0)) * h
  const C = COL(p)
  if (net) {
    const cell = 6
    for (let py = 0; py < h; py += cell) for (let px = 0; px < w; px += cell) {
      const wx = X0 + ((px + cell / 2) / w) * (X1 - X0), wy = Y1 - ((py + cell / 2) / h) * (Y1 - Y0)
      ctx.fillStyle = alpha(C[predict(net, wx, wy)], 0.22)
      ctx.fillRect(x + px, y + py, Math.min(cell, w - px), Math.min(cell, h - py))
    }
  }
  for (const q of pts) dot(ctx, sx(q.x), sy(q.y), r, C[q.c])
  if (probe) { ctx.strokeStyle = p.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(sx(probe.x), sy(probe.y), r + 4, 0, Math.PI * 2); ctx.stroke() }
  ctx.restore()
  ctx.strokeStyle = p.line; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1)
}

export const draw: Draw = (ctx, W, H, f0, p, lang) => {
  const f = f0 as DistFrame
  clear(ctx, W, H, p)
  const pw = 222, ph = 200, py = 40, gap = (W - 28 - 3 * pw) / 2
  const xs = [14, 14 + pw + gap, 14 + 2 * (pw + gap)]
  const pct = (v: number) => (lang === 'tr' ? `%${Math.round(v * 100)}` : `${Math.round(v * 100)}%`)
  const probe = f.probe !== undefined ? f.small[f.probe] : undefined
  const tN = paramCount(f.teacher)
  const sN = 6 * 4 + 3 // 2 → 4 → 3 ağ: 8 + 4 + 12 + 3
  // başlıklar
  const titles = lang === 'tr'
    ? [`öğretmen · sunucu · ${tN} sayı`, `öğrenci · sert etiket · ${sN} sayı`, `öğrenci · damıtılmış · ${sN} sayı`]
    : [`teacher · server · ${tN} numbers`, `student · hard labels · ${sN} numbers`, `student · distilled · ${sN} numbers`]
  const accs = [f.showTeacher ? f.tAcc : null, f.hardAcc.at(-1) ?? null, f.softAcc.at(-1) ?? null]
  titles.forEach((t, i) => {
    text(ctx, t, xs[i], 18, i === 0 ? p.ink : i === 1 ? p.groups[0] : p.brand, 11, 'left', 700)
    if (accs[i] !== null) text(ctx, `${lang === 'tr' ? 'test' : 'test'} ${pct(accs[i]!)}`, xs[i] + pw, 33, p.ink, 11, 'right', 700)
  })
  text(ctx, lang === 'tr' ? (f.showBig ? '1500 etiketli sürüş' : `${f.small.length} etiketli örnek`) : f.showBig ? '1500 labelled drives' : `${f.small.length} labelled examples`, xs[0], 33, p.muted, 10, 'left', 600)
  text(ctx, lang === 'tr' ? 'mikrodenetleyici' : 'microcontroller', xs[1], 33, p.muted, 10, 'left', 600)
  text(ctx, lang === 'tr' ? `T = ${fmt(f.T, 1, 'tr')}` : `T = ${f.T.toFixed(1)}`, xs[2], 33, p.muted, 10, 'left', 600)
  panel(ctx, xs[0], py, pw, ph, f.showTeacher ? f.teacher : null, f.showBig ? f.big : f.small, f.showBig ? 1.6 : 3.4, p, probe)
  panel(ctx, xs[1], py, pw, ph, f.hard, f.small, 3.4, p, probe)
  panel(ctx, xs[2], py, pw, ph, f.dist, f.small, 3.4, p, probe)
  if (!f.hard) {
    ;[1, 2].forEach((i) => { ctx.fillStyle = alpha(p.bg, 0.85); ctx.fillRect(xs[i] + 40, py + ph - 30, pw - 80, 22); text(ctx, lang === 'tr' ? 'henüz eğitilmedi' : 'not trained yet', xs[i] + pw / 2, py + ph - 14, p.muted, 12, 'center', 600) })
  }
  // eksen adları (paylaşılan)
  text(ctx, lang === 'tr' ? 'x: titreşim · y: tekerlek kayması (ölçekli)' : 'x: vibration · y: wheel slip (scaled)', xs[0], py + ph + 16, p.muted, 10, 'left', 500)
  // renk açıklaması
  let lx = xs[2] + pw
  ;[2, 1, 0].forEach((c) => { const s = NAMES[lang][c]; ctx.font = `500 10px Poppins, system-ui, sans-serif`; lx -= ctx.measureText(s).width + 18; dot(ctx, lx, py + ph + 12, 4, COL(p)[c]); text(ctx, s, lx + 7, py + ph + 16, p.muted, 10, 'left', 500) })
  // ---- doğruluk eğrileri
  curves(ctx, f, 14, 274, 380, 172, p, lang)
  // ---- sağ alt: sert etiket / yumuşak hedef ya da boyut karşılaştırması
  const bx = 414, bw = W - 14 - bx
  if (probe) softBox(ctx, f, probe, bx, 274, bw, p, lang)
  else sizeBox(ctx, f, tN, sN, bx, 274, bw, p, lang)
}

function curves(ctx: CanvasRenderingContext2D, f: DistFrame, x: number, y: number, w: number, h: number, p: Pal, lang: Lang) {
  ctx.fillStyle = p.bg; ctx.strokeStyle = p.line; ctx.lineWidth = 1
  ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, 6); else ctx.rect(x, y, w, h); ctx.fill(); ctx.stroke()
  text(ctx, lang === 'tr' ? 'test doğruluğu · eğitim adımı 0 → 2000' : 'test accuracy · training step 0 → 2000', x + 8, y + 15, p.muted, 10, 'left', 600)
  const lo = 0.3, hi = 0.9
  const L = x + 34, R = x + w - 10, T = y + 24, B = y + h - 22
  const px = (i: number) => L + (i / 50) * (R - L), pyy = (a: number) => B - ((Math.max(lo, Math.min(hi, a)) - lo) / (hi - lo)) * (B - T)
  for (const a of [0.4, 0.6, 0.8]) { ctx.strokeStyle = p.line; ctx.beginPath(); ctx.moveTo(L, pyy(a)); ctx.lineTo(R, pyy(a)); ctx.stroke(); text(ctx, lang === 'tr' ? `%${a * 100}` : `${a * 100}%`, L - 4, pyy(a) + 3, p.muted, 9, 'right', 400) }
  text(ctx, '0', L, B + 13, p.muted, 9, 'center', 400)
  ctx.strokeStyle = p.ink; ctx.setLineDash([4, 3]); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(L, pyy(f.tAcc)); ctx.lineTo(R, pyy(f.tAcc)); ctx.stroke(); ctx.setLineDash([])
  const line = (v: number[], col: string) => { if (v.length < 1) return; ctx.strokeStyle = col; ctx.lineWidth = 2.2; ctx.beginPath(); v.forEach((a, i) => (i ? ctx.lineTo(px(i), pyy(a)) : ctx.moveTo(px(i), pyy(a)))); ctx.stroke() }
  line(f.hardAcc, p.groups[0]); line(f.softAcc, p.brand)
  const lg = lang === 'tr' ? ['öğretmen', 'sert etiket', 'damıtılmış'] : ['teacher', 'hard labels', 'distilled']
  ;[p.ink, p.groups[0], p.brand].forEach((c, i) => { const lx = x + w - 10 - (2 - i) * 78 - 70; ctx.fillStyle = c; ctx.fillRect(lx, B + 6, 12, 3); text(ctx, lg[i], lx + 16, B + 11, p.muted, 9, 'left', 600) })
}

function bars(ctx: CanvasRenderingContext2D, v: number[], x: number, y: number, w: number, p: Pal, lang: Lang, title: string, col: string) {
  text(ctx, title, x, y, col, 11, 'left', 700)
  v.forEach((a, k) => {
    const yy = y + 8 + k * 18
    text(ctx, NAMES[lang][k], x + 58, yy + 11, p.muted, 10, 'right', 600)
    ctx.fillStyle = p.soft; ctx.fillRect(x + 64, yy, w - 110, 13)
    ctx.fillStyle = COL(p)[k]; ctx.fillRect(x + 64, yy, (w - 110) * a, 13)
    text(ctx, fmt(a, 2, lang), x + w - 40, yy + 11, p.ink, 10, 'left', 600)
  })
}

function softBox(ctx: CanvasRenderingContext2D, f: DistFrame, q: Pt, x: number, y: number, w: number, p: Pal, lang: Lang) {
  const i = f.probe!
  text(ctx, lang === 'tr' ? `örnek ${i + 1} (halkalı nokta)` : `example ${i + 1} (ringed point)`, x, y + 12, p.ink, 12, 'left', 700)
  bars(ctx, [0, 1, 2].map((k) => (k === q.c ? 1 : 0)), x, y + 36, w, p, lang, lang === 'tr' ? 'sert etiket' : 'hard label', p.groups[0])
  bars(ctx, f.soft[i], x, y + 108, w, p, lang, lang === 'tr' ? `yumuşak hedef (öğretmen, T = ${fmt(f.T, 1, 'tr')})` : `soft target (teacher, T = ${f.T.toFixed(1)})`, p.brand)
}

function sizeBox(ctx: CanvasRenderingContext2D, f: DistFrame, tN: number, sN: number, x: number, y: number, w: number, p: Pal, lang: Lang) {
  text(ctx, lang === 'tr' ? 'model boyutu (32 bit sayılar)' : 'model size (32-bit numbers)', x, y + 12, p.ink, 12, 'left', 700)
  const mx = tN
  ;[[tN, lang === 'tr' ? 'öğretmen' : 'teacher', p.ink], [sN, lang === 'tr' ? 'öğrenci' : 'student', p.brand]].forEach(([n, l, c], k) => {
    const yy = y + 28 + k * 30
    text(ctx, l as string, x, yy + 12, p.muted, 10, 'left', 600)
    ctx.fillStyle = c as string; ctx.fillRect(x + 62, yy, ((w - 150) * (n as number)) / mx, 16)
    text(ctx, `${n} · ${(n as number) * 4} B`, x + 68 + ((w - 150) * (n as number)) / mx, yy + 12, p.ink, 10, 'left', 600)
  })
  const L = lang === 'tr'
    ? [`öğrenci ${Math.round(tN / sN)} kat küçük.`, 'Aynı küçük veriyle iki öğrenci eğitilir;', 'tek fark: sert etiket ya da öğretmenin', 'yumuşak olasılıkları.']
    : [`the student is ${Math.round(tN / sN)}× smaller.`, 'Two students train on the same small data;', 'the only difference: hard labels or the', "teacher's soft probabilities."]
  L.forEach((s, i) => text(ctx, s, x, y + 104 + i * 16, i === 0 ? p.ink : p.muted, 11, 'left', i === 0 ? 700 : 500))
  void f; void accuracy
}
