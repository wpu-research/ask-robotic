// Yüz doğrulama sahnesi: gömme haritası (2B izdüşüm), aynı/farklı kişi benzerlik histogramları, eşik süpürme (FAR/FRR) ve kapı denemesi.
import { alpha, clear, dot, text, type Draw, type Pal } from '../draw'
import { fmt, type Lang } from '@/lib/ml/core'
import type { FaceFrame } from '@/lib/ml/yuz-dogrulama'

const MAP = { x: 12, y: 30, w: 288, h: 270 }
const HIST = { x: 350, y: 30, w: 356, h: 150 }
const CUR = { x: 350, y: 232, w: 356, h: 150 }
const LO = -0.2, HI = 1

function box(ctx: CanvasRenderingContext2D, b: { x: number; y: number; w: number; h: number }, p: Pal) {
  ctx.fillStyle = p.bg; ctx.strokeStyle = p.line; ctx.lineWidth = 1
  ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(b.x, b.y, b.w, b.h, 6); else ctx.rect(b.x, b.y, b.w, b.h); ctx.fill(); ctx.stroke()
}
const pct = (x: number, lang: Lang) => (lang === 'tr' ? `%${fmt(x * 100, 1, lang)}` : `${fmt(x * 100, 1, lang)}%`)

export const draw: Draw = (ctx, W, H, f0, p, lang) => {
  const f = f0 as FaceFrame
  const tr = lang === 'tr'
  clear(ctx, W, H, p)
  // --- gömme haritası
  box(ctx, MAP, p)
  text(ctx, tr ? 'gömme haritası (64 boyuttan 2B izdüşüm)' : 'embedding map (2D projection of 64 dims)', MAP.x, MAP.y - 8, p.muted, 11, 'left', 600)
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity
  for (const [x, y] of f.P2) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y) }
  const sc = Math.min((MAP.w - 30) / (x1 - x0), (MAP.h - 30) / (y1 - y0))
  const mx = (x: number) => MAP.x + MAP.w / 2 + (x - (x0 + x1) / 2) * sc
  const my = (y: number) => MAP.y + MAP.h / 2 - (y - (y0 + y1) / 2) * sc
  for (let i = 0; i < f.shown; i++) {
    const [x, y] = f.P2[i]
    dot(ctx, mx(x), my(y), 4, alpha(p.groups[f.lab[i] % 6], f.attempt || f.enrolled ? 0.45 : 0.9))
  }
  const ring = (i: number, r: number, col: string, w = 2) => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.arc(mx(f.P2[i][0]), my(f.P2[i][1]), r, 0, Math.PI * 2); ctx.stroke() }
  if (f.pair) {
    const { a, b, cos } = f.pair
    ctx.strokeStyle = p.ink; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3])
    ctx.beginPath(); ctx.moveTo(mx(f.P2[a][0]), my(f.P2[a][1])); ctx.lineTo(mx(f.P2[b][0]), my(f.P2[b][1])); ctx.stroke(); ctx.setLineDash([])
    ring(a, 7, p.ink); ring(b, 7, p.ink)
    text(ctx, `cos = ${fmt(cos, 2, lang)}`, (mx(f.P2[a][0]) + mx(f.P2[b][0])) / 2 + 6, (my(f.P2[a][1]) + my(f.P2[b][1])) / 2 - 6, p.ink, 12, 'left', 700)
  }
  let tx = 0, ty = 0
  if (f.enrolled) {
    for (const i of f.enrolled) { ring(i, 6, p.groups[f.lab[i]], 1.5); tx += mx(f.P2[i][0]) / f.enrolled.length; ty += my(f.P2[i][1]) / f.enrolled.length }
    ctx.fillStyle = p.ink; ctx.beginPath()
    for (let k = 0; k < 10; k++) { const r = k % 2 ? 4 : 9, an = -Math.PI / 2 + (k * Math.PI) / 5; const X = tx + r * Math.cos(an), Y = ty + r * Math.sin(an); if (k) ctx.lineTo(X, Y); else ctx.moveTo(X, Y) }
    ctx.closePath(); ctx.fill()
    text(ctx, tr ? 'şablon' : 'template', tx + 11, ty - 8, p.ink, 11, 'left', 700)
  }
  if (f.attempt) {
    const i = f.attempt.probe, c = f.attempt.ok ? p.groups[3] : p.groups[0]
    ctx.strokeStyle = c; ctx.lineWidth = 2; ctx.setLineDash([5, 3])
    ctx.beginPath(); ctx.moveTo(mx(f.P2[i][0]), my(f.P2[i][1])); ctx.lineTo(tx, ty); ctx.stroke(); ctx.setLineDash([])
    dot(ctx, mx(f.P2[i][0]), my(f.P2[i][1]), 6, p.groups[f.lab[i]]); ring(i, 9, c, 2.5)
  }
  // kişi lejantı (haritanın altı)
  for (let k = 0; k < 6; k++) { dot(ctx, MAP.x + 10 + k * 47, MAP.y + MAP.h + 14, 4, p.groups[k]); text(ctx, `${tr ? 'kişi' : 'p.'} ${k + 1}`, MAP.x + 17 + k * 47, MAP.y + MAP.h + 18, p.muted, 10) }

  // --- histogram
  box(ctx, HIST, p)
  text(ctx, tr ? 'çiftlerin kosinüs benzerliği' : 'cosine similarity of pairs', HIST.x, HIST.y - 8, p.muted, 11, 'left', 600)
  const hx = (v: number) => HIST.x + 10 + ((v - LO) / (HI - LO)) * (HIST.w - 20)
  const base = HIST.y + HIST.h - 18
  const NB = 48, bw = (HI - LO) / NB
  const bins = (a: number[]) => { const b = new Array(NB).fill(0); for (const v of a) b[Math.max(0, Math.min(NB - 1, Math.floor((v - LO) / bw)))]++; return b.map((c) => c / a.length) }
  const th = f.th
  const series: Array<[number[], string, boolean]> = []
  if (f.hist >= 2) series.push([f.imp, p.groups[1], false])
  if (f.hist >= 1) series.push([f.gen, p.groups[3], true])
  const top = 0.2
  for (const [arr, col, isGen] of series) {
    const b = bins(arr)
    b.forEach((v, k) => {
      const lo = LO + k * bw, X = hx(lo), w = hx(lo + bw) - X - 1, h = Math.min(1, v / top) * (HIST.h - 40)
      // eşiğin yanlış tarafı koyu: farklı kişi ≥ eşik (yanlış kabul), aynı kişi < eşik (yanlış ret)
      const wrong = th !== undefined && (isGen ? lo + bw / 2 < th : lo + bw / 2 >= th)
      ctx.fillStyle = alpha(col, th === undefined ? 0.55 : wrong ? 0.95 : 0.3)
      ctx.fillRect(X, base - h, w, h)
    })
  }
  ctx.strokeStyle = p.muted; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(HIST.x + 10, base); ctx.lineTo(HIST.x + HIST.w - 10, base); ctx.stroke()
  for (const v of [0, 0.25, 0.5, 0.75, 1]) text(ctx, fmt(v, 2, lang), hx(v), base + 13, p.muted, 9, 'center', 400)
  if (th !== undefined) {
    ctx.strokeStyle = p.brand; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(hx(th), HIST.y + 18); ctx.lineTo(hx(th), base); ctx.stroke()
    text(ctx, `${tr ? 'eşik' : 'threshold'} ${fmt(th, 2, lang)}`, hx(th) + (th > 0.7 ? -4 : 4), HIST.y + 16, p.brand, 11, th > 0.7 ? 'right' : 'left', 700)
  }
  if (f.hist >= 1) { dot(ctx, HIST.x + 16, HIST.y + 14, 4, p.groups[3]); text(ctx, tr ? 'aynı kişi (630)' : 'same person (630)', HIST.x + 24, HIST.y + 18, p.muted, 10) }
  if (f.hist >= 2) { dot(ctx, HIST.x + 16, HIST.y + 30, 4, p.groups[1]); text(ctx, tr ? 'farklı kişi (3375)' : 'different people (3375)', HIST.x + 24, HIST.y + 34, p.muted, 10) }

  // --- FAR / FRR eğrileri
  box(ctx, CUR, p)
  text(ctx, tr ? 'eşiğe göre hata oranları' : 'error rates against threshold', CUR.x, CUR.y - 8, p.muted, 11, 'left', 600)
  const cx = (t: number) => CUR.x + 40 + t * (CUR.w - 56), cy = (v: number) => CUR.y + CUR.h - 24 - v * (CUR.h - 40)
  ctx.strokeStyle = p.line; ctx.lineWidth = 1
  for (const v of [0, 0.5, 1]) { ctx.beginPath(); ctx.moveTo(cx(0), cy(v)); ctx.lineTo(cx(1), cy(v)); ctx.stroke(); text(ctx, tr ? `%${v * 100}` : `${v * 100}%`, cx(0) - 6, cy(v) + 4, p.muted, 9, 'right', 400) }
  for (const t of [0, 0.25, 0.5, 0.75, 1]) text(ctx, fmt(t, 2, lang), cx(t), CUR.y + CUR.h - 8, p.muted, 9, 'center', 400)
  const curve = (v: number[], col: string) => {
    ctx.strokeStyle = col; ctx.lineWidth = 2.2; ctx.beginPath()
    for (let k = 0; k < Math.min(f.sweepN, v.length); k++) { const X = cx(k / 100), Y = cy(v[k]); if (k) ctx.lineTo(X, Y); else ctx.moveTo(X, Y) }
    ctx.stroke()
  }
  curve(f.far, p.groups[0]); curve(f.frr, p.groups[2])
  if (f.sweepN) {
    text(ctx, tr ? 'FAR yanlış kabul' : 'FAR false accept', cx(0.02) + 6, CUR.y + 16, p.groups[0], 10, 'left', 700)
    text(ctx, tr ? 'FRR yanlış ret' : 'FRR false reject', cx(1) - 2, CUR.y + 16, p.groups[2], 10, 'right', 700)
  }
  if (f.eer !== undefined) {
    const k = Math.round(f.eer * 100), v = (f.far[k] + f.frr[k]) / 2
    ctx.strokeStyle = p.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx(f.eer), cy(v), 5, 0, Math.PI * 2); ctx.stroke()
    text(ctx, `EER ${pct(v, lang)}`, cx(f.eer) + 8, cy(v) - 8, p.ink, 10, 'left', 700)
  }
  if (th !== undefined && f.sweepN) {
    const k = Math.round(th * 100)
    ctx.strokeStyle = p.brand; ctx.setLineDash([4, 3]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cx(th), CUR.y + 24); ctx.lineTo(cx(th), cy(0)); ctx.stroke(); ctx.setLineDash([])
    if (f.sweepN > k) { dot(ctx, cx(th), cy(f.far[k]), 4, p.groups[0]); dot(ctx, cx(th), cy(f.frr[k]), 4, p.groups[2]) }
  }
  // --- seçili eşikte sonuç / kapı denemesi (sol alt)
  const by = MAP.y + MAP.h + 34
  if (f.attempt) {
    const a = f.attempt, c = a.ok ? p.groups[3] : p.groups[0]
    text(ctx, tr ? `kapı: "ben kişi ${a.claim + 1}" · gelen: kişi ${a.who + 1}` : `door: "I am person ${a.claim + 1}" · actually: person ${a.who + 1}`, MAP.x, by + 12, p.ink, 12, 'left', 700)
    const bx = MAP.x, bw2 = 200, bv = (v: number) => bx + Math.max(0, Math.min(1, v)) * bw2
    ctx.fillStyle = p.line; ctx.fillRect(bx, by + 24, bw2, 12)
    ctx.fillStyle = c; ctx.fillRect(bx, by + 24, bv(a.cos) - bx, 12)
    ctx.strokeStyle = p.brand; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bv(f.userTh), by + 20); ctx.lineTo(bv(f.userTh), by + 40); ctx.stroke()
    text(ctx, `cos ${fmt(a.cos, 2, lang)}`, bx + bw2 + 8, by + 35, c, 13, 'left', 700)
    text(ctx, a.ok ? (tr ? 'KAPI AÇILDI' : 'DOOR OPENS') : (tr ? 'RET' : 'REJECTED'), MAP.x, by + 58, c, 14, 'left', 700)
  } else if (f.th !== undefined && f.sweepN > 100) {
    const k = Math.round(f.th * 100)
    text(ctx, `${tr ? 'eşik' : 'threshold'} ${fmt(f.th, 2, lang)}`, MAP.x, by + 12, p.brand, 13, 'left', 700)
    text(ctx, `FAR ${pct(f.far[k], lang)} · FRR ${pct(f.frr[k], lang)}`, MAP.x, by + 32, p.ink, 13, 'left', 700)
    text(ctx, tr ? 'yabancı içeri girer · çalışan kapıda kalır' : 'stranger gets in · staff member left out', MAP.x, by + 50, p.muted, 10)
  }
  // laboratuvar kapısı robotu (sağ alt)
  const rx = W - 40, ry = H - 46
  ctx.fillStyle = alpha(p.brand, 0.15); ctx.strokeStyle = p.brand; ctx.lineWidth = 1.5
  ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(rx - 14, ry, 28, 34, 6); else ctx.rect(rx - 14, ry, 28, 34); ctx.fill(); ctx.stroke()
  ctx.beginPath(); ctx.arc(rx, ry - 8, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
  const eye = f.attempt ? (f.attempt.ok ? p.groups[3] : p.groups[0]) : p.brand
  dot(ctx, rx - 3, ry - 9, 2, eye); dot(ctx, rx + 3, ry - 9, 2, eye)
  ctx.strokeStyle = p.muted; ctx.lineWidth = 3; ctx.strokeRect(rx - 90, ry - 22, 40, 56)
  if (f.attempt?.ok) { ctx.fillStyle = alpha(p.groups[3], 0.25); ctx.fillRect(rx - 88, ry - 20, 36, 52) }
  text(ctx, tr ? 'kapı' : 'door', rx - 70, ry + 46, p.muted, 10, 'center')
}
