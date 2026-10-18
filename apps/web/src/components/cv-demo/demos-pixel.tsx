'use client'
// Gerçek Hayat Demoları 5–8: nabız (rPPG, yüz + piksel), yorgunluk (yüz noktaları), trafik sayacı ve meyve olgunluğu (piksel işleme).
// rPPG, trafik ve meyve demolarında ölçüm örnek sahnede de çizilen piksellerden gerçekten yapılır.
import {
  blobHueCounts, blobs, bgUpdate, countStep, estimateBpm, faceEar, faceMar, fatigueInit, fatigueStep, fgMask, LEFT_EYE, MOUTH, perclos, resample,
  RIGHT_EYE, RIPE_DEFAULTS, ripeness, segmentFruit, toGray, trackStep, type FatigueState, type Pt, type Rect, type Ripe, type Track,
} from '@/lib/cv-demo-logic'
import { foreheadRoi, makeFace } from '@/lib/cv-demo-scenes'
import type { DemoImpl } from './host'
import { banner, bracketBox, COL, panel, spark, tag } from './overlay'

type C = CanvasRenderingContext2D
type L = 'tr' | 'en'
const tx = (l: L, tr: string, en: string) => (l === 'en' ? en : tr)
const push = (a: number[], v: number, n = 90) => { a.push(v); if (a.length > n) a.shift() }
/** Tohumlu rastgele (örnek sahne her açılışta aynı akar). */
function rng(seed: number) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32) }
function offscreen(w: number, h: number) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c }

// ================================================================ 5. nabız (rPPG)
interface PulseS { ts: number[]; gs: number[]; roi: Rect | null; lm: Pt[] | null; est: { bpm: number; snr: number } | null; filt: number[]; spec: { f: number[]; p: number[] } | null; lastEst: number; g: number }
const TRUE_BPM = 68
function faceScene(ctx: C, lm: Pt[], fw: number, skin: string, eyeOpen = 1) {
  const cx = lm[1].x, cy = lm[1].y - 0.1 * fw
  ctx.fillStyle = skin; ctx.fillRect(cx - fw * 0.17, cy + fw * 0.5, fw * 0.34, fw * 0.6)
  ctx.beginPath(); ctx.ellipse(cx, cy, fw * 0.5, fw * 0.66, 0, 0, 7); ctx.fill()
  ctx.fillStyle = '#2d1d14'; ctx.beginPath(); ctx.ellipse(cx, cy - fw * 0.5, fw * 0.55, fw * 0.24, 0, Math.PI, 0); ctx.fill()
  ctx.fillRect(cx - fw * 0.55, cy - fw * 0.52, fw * 0.12, fw * 0.5); ctx.fillRect(cx + fw * 0.43, cy - fw * 0.52, fw * 0.12, fw * 0.5)
  for (const idx of [LEFT_EYE, RIGHT_EYE]) {
    const p = idx.map((i) => lm[i])
    ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.moveTo(p[0].x, p[0].y); ctx.quadraticCurveTo((p[1].x + p[2].x) / 2, p[1].y * 2 - p[0].y, p[3].x, p[3].y); ctx.quadraticCurveTo((p[4].x + p[5].x) / 2, p[5].y * 2 - p[3].y, p[0].x, p[0].y); ctx.fill()
    if (eyeOpen > 0.25) { ctx.save(); ctx.clip(); ctx.fillStyle = '#3b2a20'; ctx.beginPath(); ctx.arc((p[0].x + p[3].x) / 2, (p[0].y + p[3].y) / 2, fw * 0.035, 0, 7); ctx.fill(); ctx.restore() }
    ctx.strokeStyle = '#5a3b2a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(p[0].x, p[0].y); ctx.quadraticCurveTo((p[1].x + p[2].x) / 2, p[1].y * 2 - p[0].y, p[3].x, p[3].y); ctx.stroke()
    ctx.strokeStyle = '#2d1d14'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(p[0].x - 4, p[0].y - fw * 0.07); ctx.lineTo(p[3].x + 4, p[3].y - fw * 0.08); ctx.stroke()
  }
  ctx.strokeStyle = 'rgba(90,50,30,.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, cy - 0.02 * fw); ctx.lineTo(cx - 0.04 * fw, cy + 0.18 * fw); ctx.lineTo(cx + 0.03 * fw, cy + 0.2 * fw); ctx.stroke()
  const mw = Math.abs(lm[MOUTH.right].x - lm[MOUTH.left].x), mh = Math.abs(lm[14].y - lm[13].y)
  ctx.fillStyle = '#7f1d1d'; ctx.beginPath(); ctx.ellipse((lm[61].x + lm[291].x) / 2, (lm[13].y + lm[14].y) / 2, mw / 2, Math.max(2, mh / 2 + 2), 0, 0, 7); ctx.fill()
}
export const pulseDemo: DemoImpl<PulseS> = {
  init: () => ({ ts: [], gs: [], roi: null, lm: null, est: null, filt: [], spec: null, lastEst: 0, g: 0 }),
  scene(ctx, c) {
    ctx.fillStyle = '#cfd8dc'; ctx.fillRect(0, 0, 640, 480)
    ctx.fillStyle = '#b0bec5'; ctx.fillRect(0, 380, 640, 100)
    const t = c.t, fw = 220
    const pulse = 2 * Math.sin(2 * Math.PI * (TRUE_BPM / 60) * t)
    const light = 4 * Math.sin(2 * Math.PI * 0.05 * t) + (Math.random() - 0.5) * 1.6
    const skin = `rgb(${Math.round(212 + light)},${Math.round(158 + light + pulse)},${Math.round(128 + light)})`
    const lm = makeFace({ cx: 320 + 6 * Math.sin(t * 0.4), cy: 240 + 3 * Math.sin(t * 0.3), fw, eye: 1, mouth: 0.04 })
    faceScene(ctx, lm, fw, skin)
    return lm
  },
  pre(ctx, c, s) {
    if (!s.roi || c.dt <= 0) return
    const r = s.roi, x = Math.max(0, Math.round(r.x)), y = Math.max(0, Math.round(r.y)), w = Math.min(c.W - x, Math.round(r.w)), h = Math.min(c.H - y, Math.round(r.h))
    if (w < 4 || h < 4) return
    const d = ctx.getImageData(x, y, w, h).data
    let g = 0; for (let i = 1; i < d.length; i += 4) g += d[i]
    s.g = g / (d.length / 4)
    s.ts.push(c.t); s.gs.push(s.g)
    while (s.ts.length && c.t - s.ts[0] > 25) { s.ts.shift(); s.gs.shift() }
  },
  infer(_ctx, c, s, lm) {
    s.lm = lm
    s.roi = lm ? foreheadRoi(lm) : null
    if (!lm) return
    if (c.t - s.lastEst < 0.5) return
    s.lastEst = c.t
    const win = c.params.window, i0 = s.ts.findIndex((t) => t >= c.t - win)
    if (i0 < 0 || c.t - s.ts[i0] < win * 0.95) { s.est = null; return }
    const x = resample(s.ts.slice(i0), s.gs.slice(i0), 30)
    const e = estimateBpm(x, 30)
    if (e) { s.est = { bpm: e.bpm, snr: e.snr }; s.filt = e.filtered.slice(-240); s.spec = { f: e.f, p: e.p } }
  },
  overlay(ctx, c, s) {
    if (s.lm) {
      ctx.fillStyle = 'rgba(56,189,248,.7)'
      for (let i = 0; i < s.lm.length; i += 6) ctx.fillRect(s.lm[i].x - 1, s.lm[i].y - 1, 2, 2)
    }
    if (s.roi) bracketBox(ctx, s.roi.x, s.roi.y, s.roi.x + s.roi.w, s.roi.y + s.roi.h, '#4ade80', `ROI · G ${s.g.toFixed(1)}`)
    const win = c.params.window, have = s.ts.length ? Math.min(win, c.t - s.ts[0]) : 0
    const strong = !!s.est && s.est.snr >= 0.5
    panel(ctx, 10, 10, [
      ['BPM', s.est ? s.est.bpm.toFixed(0) : '…', s.est ? (strong ? COL.ok : COL.warn) : undefined],
      ['SNR', s.est ? s.est.snr.toFixed(2) : '—', strong ? COL.ok : COL.warn],
      [tx(c.lang, 'pencere', 'window'), `${have.toFixed(1)} / ${win} s`],
      ...(c.mode === 'sample' ? [[tx(c.lang, 'sahnede gerçek', 'true in scene'), `${TRUE_BPM}`] as [string, string]] : []),
    ], 200)
    const lo = Math.min(...s.filt, -1e-3), hi = Math.max(...s.filt, 1e-3)
    if (s.filt.length) spark(ctx, 10, 370, 300, 70, s.filt, lo, hi, '#4ade80', undefined, tx(c.lang, 'bant geçiren yeşil sinyal', 'band-passed green signal'))
    if (s.spec) {
      const pm = Math.max(...s.spec.p)
      spark(ctx, 320, 370, 300, 70, s.spec.p.map((v) => v / pm), 0, 1, '#f472b6', undefined, tx(c.lang, 'spektrum 42–180 atım/dk', 'spectrum 42–180 bpm'))
      if (s.est) { const x = 320 + ((s.est.bpm - 42) / 138) * 300; ctx.fillStyle = '#f472b6'; ctx.fillRect(x - 1, 372, 2, 66) }
    }
    tag(ctx, 420, 10, tx(c.lang, 'EĞİTİM AMAÇLI · TIBBİ DEĞİL', 'EDUCATIONAL · NOT MEDICAL'), '#fbbf24')
  },
  hud(s, c) {
    const l = c.lang
    if (!s.lm) return { level: 'idle', label: tx(l, 'Yüz görünmüyor', 'No face visible'), metrics: [] }
    const have = s.ts.length ? c.t - s.ts[0] : 0
    if (!s.est) return { level: 'warn', label: tx(l, `Sinyal toplanıyor (${Math.min(have, c.params.window).toFixed(0)}/${c.params.window} sn), kıpırdama`, `Collecting signal (${Math.min(have, c.params.window).toFixed(0)}/${c.params.window} s), keep still`), metrics: [] }
    const strong = s.est.snr >= 0.5
    return {
      level: strong ? 'ok' : 'warn', label: `${s.est.bpm.toFixed(0)} BPM${strong ? '' : tx(l, ' (zayıf sinyal)', ' (weak signal)')} · ${tx(l, 'tıbbi değil', 'not medical')}`,
      metrics: [['BPM', s.est.bpm.toFixed(1)], ['SNR', s.est.snr.toFixed(2)], [tx(l, 'ROI yeşil ort.', 'ROI green mean'), s.g.toFixed(1)], [tx(l, 'Örnek', 'Samples'), String(s.ts.length)]],
    }
  },
}

// ================================================================ 8. yorgunluk / esneme
interface FatS { f: FatigueState; ear: number; mar: number; lm: Pt[] | null; ears: number[]; mars: number[] }
const BLINKS = [2, 5.5, 8, 17, 19]
function driverScene(t: number) {
  const k = t % 20
  let eye = 1, mouth = 0.03
  for (const b of BLINKS) if (k >= b && k < b + 0.16) eye = 0.1
  if (k >= 10 && k < 11.8) eye = k < 10.15 || k > 11.65 ? 0.5 : 0.12
  if (k >= 13 && k < 15.5) { mouth = 0.03 + Math.sin(((k - 13) / 2.5) * Math.PI) * 1.0; eye = 0.8 }
  return { eye, mouth: Math.min(1, mouth) }
}
export const fatigueDemo: DemoImpl<FatS> = {
  init: () => ({ f: fatigueInit(), ear: 0, mar: 0, lm: null, ears: [], mars: [] }),
  scene(ctx, c) {
    const g = ctx.createLinearGradient(0, 0, 0, 480); g.addColorStop(0, '#0f172a'); g.addColorStop(1, '#1e293b')
    ctx.fillStyle = g; ctx.fillRect(0, 0, 640, 480)
    ctx.fillStyle = '#334155'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(90, 0); ctx.lineTo(40, 480); ctx.lineTo(0, 480); ctx.fill()
    ctx.beginPath(); ctx.moveTo(640, 0); ctx.lineTo(550, 0); ctx.lineTo(600, 480); ctx.lineTo(640, 480); ctx.fill()
    ctx.fillStyle = '#475569'; ctx.fillRect(140, 400, 360, 80)
    const { eye, mouth } = driverScene(c.t), fw = 240
    const lm = makeFace({ cx: 320 + 4 * Math.sin(c.t * 0.5), cy: 225, fw, eye, mouth })
    faceScene(ctx, lm, fw, '#d6a585', eye)
    ctx.fillStyle = '#0f172a'; ctx.fillRect(220, 410, 200, 70)
    return lm
  },
  infer(_ctx, c, s, lm) {
    s.lm = lm
    if (!lm || lm.length < 400) { s.f = fatigueStep(s.f, null); return }
    s.ear = faceEar(lm); s.mar = faceMar(lm)
    s.f = fatigueStep(s.f, { t: c.t, ear: s.ear, mar: s.mar }, { ear: c.params.ear, closedSec: c.params.closedSec, mar: c.params.mar, yawnSec: 1.2 })
    push(s.ears, s.ear); push(s.mars, s.mar)
  },
  overlay(ctx, c, s) {
    const a = s.f.alert, closed = s.ear < c.params.ear
    if (s.lm && s.lm.length >= 400) {
      ctx.save(); ctx.lineWidth = 2
      for (const idx of [LEFT_EYE, RIGHT_EYE]) {
        const order = [0, 1, 2, 3, 4, 5].map((k) => s.lm![idx[k]])
        ctx.strokeStyle = closed ? COL.alert : '#22d3ee'; ctx.beginPath(); order.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.closePath(); ctx.stroke()
        ctx.fillStyle = '#fff'; for (const p of order) ctx.fillRect(p.x - 2, p.y - 2, 4, 4)
      }
      const m = [MOUTH.left, 81, 13, 311, MOUTH.right, 402, 14, 178].map((i) => s.lm![i])
      ctx.strokeStyle = s.mar > c.params.mar ? COL.warn : '#a78bfa'; ctx.beginPath(); m.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.closePath(); ctx.stroke()
      ctx.restore()
      const xs = s.lm.map((p) => p.x), ys = s.lm.map((p) => p.y)
      bracketBox(ctx, Math.min(...xs) - 8, Math.min(...ys) - 8, Math.max(...xs) + 8, Math.max(...ys) + 8, a === 'drowsy' ? COL.alert : a === 'yawn' ? COL.warn : COL.ok, `${tx(c.lang, 'SÜRÜCÜ', 'DRIVER')} · EAR ${s.ear.toFixed(2)}`)
    }
    panel(ctx, 10, 10, [
      ['EAR', `${s.ear.toFixed(3)} / ${c.params.ear}`, closed ? COL.alert : COL.ok],
      ['MAR', `${s.mar.toFixed(2)} / ${c.params.mar}`, s.mar > c.params.mar ? COL.warn : COL.ok],
      [tx(c.lang, 'kırpma/dk', 'blinks/min'), String(s.f.blinks.length)],
      ['PERCLOS', `${(perclos(s.f) * 100).toFixed(0)}%`],
      [tx(c.lang, 'esneme', 'yawns'), String(s.f.yawns)],
    ], 200)
    spark(ctx, 430, 10, 200, 52, s.ears, 0, 0.4, '#22d3ee', c.params.ear, 'EAR')
    spark(ctx, 430, 66, 200, 52, s.mars, 0, 1, '#a78bfa', c.params.mar, 'MAR')
    if (a === 'drowsy') banner(ctx, tx(c.lang, '⚠ UYUKLAMA: GÖZLER KAPALI', '⚠ DROWSY: EYES CLOSED'), COL.alert, c.t, !c.reduced)
    else if (a === 'yawn') banner(ctx, tx(c.lang, 'ESNEME: MOLA VER', 'YAWN: TAKE A BREAK'), COL.warn, c.t, false)
  },
  hud(s, c) {
    const l = c.lang, a = s.f.alert
    return {
      level: !s.lm ? 'idle' : a === 'drowsy' ? 'alert' : a === 'yawn' ? 'warn' : 'ok',
      label: !s.lm ? tx(l, 'Yüz görünmüyor', 'No face visible') : a === 'drowsy' ? tx(l, 'UYUKLAMA: gözler uzun süre kapalı', 'DROWSY: eyes closed too long') : a === 'yawn' ? tx(l, 'Esneme algılandı', 'Yawn detected') : tx(l, 'Uyanık', 'Alert'),
      metrics: [['EAR', s.ear.toFixed(3)], ['MAR', s.mar.toFixed(2)], [tx(l, 'Göz kırpma (60 sn)', 'Blinks (60 s)'), String(s.f.blinks.length)], ['PERCLOS (30 s)', `${(perclos(s.f) * 100).toFixed(0)}%`], [tx(l, 'Esneme', 'Yawns'), String(s.f.yawns)]],
    }
  },
}

// ================================================================ 6. trafik sayacı
const SW = 320, SH = 240
interface Car { lane: number; y: number; v: number; kmh: number; color: string }
interface TrafS {
  small: HTMLCanvasElement | null; thumb: HTMLCanvasElement | null; bg: Float32Array | null; gray: Float32Array; mask: Uint8Array
  tracks: Track[]; nextId: number; down: number; up: number; over: number; speeds: number[]; log: string[]
  cars: Car[]; timers: number[]; rnd: () => number; fg: number
}
const LANES = [267.5, 302.5, 337.5, 372.5], MPP_SCENE = 0.1
const CAR_COLORS = ['#e63946', '#f1faee', '#1d3557', '#ffb703', '#2a9d8f', '#a8b2c1', '#111111', '#e76f51', '#7b2cbf']
const GRASS = (() => { const r = rng(5); return Array.from({ length: 140 }, () => [r() < 0.5 ? r() * 230 : 410 + r() * 230, r() * 480, 3 + r() * 10]) })()
function road(ctx: C) {
  ctx.fillStyle = '#4d7c3a'; ctx.fillRect(0, 0, 640, 480)
  ctx.fillStyle = '#5b8c45'; for (const [x, y, r] of GRASS) { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill() }
  ctx.fillStyle = '#7d7f80'; ctx.fillRect(238, 0, 164, 480)
  ctx.fillStyle = '#3d4044'; ctx.fillRect(250, 0, 140, 480)
  ctx.fillStyle = '#e5e7eb'; ctx.fillRect(252, 0, 2, 480); ctx.fillRect(386, 0, 2, 480)
  ctx.fillStyle = '#facc15'; ctx.fillRect(317, 0, 2, 480); ctx.fillRect(321, 0, 2, 480)
  ctx.fillStyle = '#e5e7eb'; for (const x of [284.5, 354.5]) for (let y = 0; y < 480; y += 90) ctx.fillRect(x, y, 2, 30)
  ctx.fillStyle = '#2f5d24'; for (const [x, y] of [[90, 80], [150, 300], [520, 140], [580, 380], [60, 430]]) { ctx.beginPath(); ctx.arc(x, y, 26, 0, 7); ctx.fill() }
}
function drawCar(ctx: C, car: Car) {
  const x = LANES[car.lane], up = car.v < 0
  ctx.fillStyle = car.color; ctx.beginPath(); ctx.roundRect(x - 9, car.y - 22, 18, 45, 5); ctx.fill()
  ctx.fillStyle = 'rgba(20,28,38,.85)'
  const ws = up ? car.y - 12 : car.y + 4
  ctx.fillRect(x - 6, ws, 12, 8)
  ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(x - 6, car.y - 4, 12, 8)
}
export const trafficDemo: DemoImpl<TrafS> = {
  init: () => ({ small: null, thumb: null, bg: null, gray: new Float32Array(SW * SH), mask: new Uint8Array(SW * SH), tracks: [], nextId: 1, down: 0, up: 0, over: 0, speeds: [], log: [], cars: [], timers: [0.3, 1.4, 0.8, 2.1], rnd: rng(11), fg: 0 }),
  scene(ctx, c, s) {
    road(ctx)
    const dt = c.dt
    for (const car of s.cars) car.y += car.v * dt
    s.cars = s.cars.filter((car) => car.y > -80 && car.y < 560)
    s.timers = s.timers.map((tm, lane) => {
      tm -= dt
      if (tm > 0) return tm
      const up = lane < 2, y0 = up ? 540 : -60
      if (s.cars.some((k) => k.lane === lane && Math.abs(k.y - y0) < 130)) return 0.3
      const kmh = Math.round(40 + s.rnd() * 55 + (s.rnd() < 0.2 ? 20 : 0))
      s.cars.push({ lane, y: y0, kmh, v: ((up ? -1 : 1) * kmh) / 3.6 / MPP_SCENE, color: CAR_COLORS[Math.floor(s.rnd() * CAR_COLORS.length)] })
      return 1.6 + s.rnd() * 2.6
    })
    for (const car of s.cars) drawCar(ctx, car)
    return null
  },
  infer(ctx, c, s) {
    s.small ??= offscreen(SW, SH); s.thumb ??= offscreen(SW, SH)
    const sc = s.small.getContext('2d', { willReadFrequently: true })!
    sc.drawImage(ctx.canvas, 0, 0, SW, SH)
    toGray(sc.getImageData(0, 0, SW, SH).data, s.gray)
    if (!s.bg) { s.bg = s.gray.slice(); return }
    s.fg = fgMask(s.gray, s.bg, 28, s.mask) / (SW * SH)
    bgUpdate(s.bg, s.gray, s.mask, 0.05, 0.002)
    const { blobs: bs } = blobs(s.mask, SW, SH, 25)
    ;({ tracks: s.tracks, nextId: s.nextId } = trackStep(s.tracks, bs, c.t, 30, 8, s.nextId))
    for (const e of countStep(s.tracks, c.params.line * SH, c.params.mpp * (c.W / SW))) {
      if (e.dir === 1) s.down++; else s.up++
      if (e.kmh !== null) { push(s.speeds, e.kmh, 50); if (e.kmh > c.params.limit) s.over++ }
      s.log.unshift(`#${e.id} ${e.dir === 1 ? '↓' : '↑'} ${e.kmh !== null ? e.kmh.toFixed(0) : '?'} km/h`); s.log.length = Math.min(s.log.length, 4)
    }
    const tc = s.thumb.getContext('2d')!, img = tc.createImageData(SW, SH)
    for (let i = 0; i < s.mask.length; i++) { const v = s.mask[i] ? 255 : 0; img.data[i * 4] = v; img.data[i * 4 + 1] = v; img.data[i * 4 + 2] = v; img.data[i * 4 + 3] = 255 }
    tc.putImageData(img, 0, 0)
  },
  overlay(ctx, c, s) {
    const k = c.W / SW, ly = c.params.line * c.H
    ctx.save(); ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 3; ctx.setLineDash([12, 6]); ctx.beginPath(); ctx.moveTo(0, ly); ctx.lineTo(c.W, ly); ctx.stroke(); ctx.restore()
    tag(ctx, 410, ly - 2, tx(c.lang, 'SAYMA ÇİZGİSİ', 'COUNT LINE'), '#38bdf8', '#0b1220', 'bottom')
    for (const tr of s.tracks) {
      if (tr.miss) continue
      const b = tr.box, fast = tr.speed !== null && tr.speed > c.params.limit
      const col = fast ? COL.alert : tr.counted ? COL.ok : '#facc15'
      ctx.save(); ctx.strokeStyle = col; ctx.globalAlpha = 0.6; ctx.lineWidth = 2; ctx.beginPath()
      tr.hist.forEach((h, i) => (i ? ctx.lineTo(h.x * k, h.y * k) : ctx.moveTo(h.x * k, h.y * k))); ctx.stroke(); ctx.restore()
      bracketBox(ctx, b.x0 * k - 3, b.y0 * k - 3, b.x1 * k + 3, b.y1 * k + 3, col, `#${tr.id}${tr.speed !== null ? ` ${tr.speed.toFixed(0)}` : ''}`)
    }
    if (c.mode === 'sample') for (const car of s.cars) if (car.y > 0 && car.y < c.H) {
      // sahnenin gerçek hızı, yolun kenarında (karşılaştırma için; ölçüm bundan habersizdir)
      const left = car.lane < 2
      ctx.save(); ctx.font = '600 11px ui-monospace, Menlo, monospace'; ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.textBaseline = 'middle'; ctx.textAlign = left ? 'right' : 'left'
      ctx.fillText(`${tx(c.lang, 'gerçek', 'true')} ${car.kmh}`, left ? 234 : 406, car.y); ctx.restore()
    }
    const avg = s.speeds.length ? s.speeds.reduce((a, b) => a + b, 0) / s.speeds.length : 0
    panel(ctx, 10, 10, [
      [tx(c.lang, '↓ aşağı', '↓ down'), String(s.down)], [tx(c.lang, '↑ yukarı', '↑ up'), String(s.up)],
      [tx(c.lang, 'ort. hız', 'avg speed'), s.speeds.length ? `${avg.toFixed(0)} km/h` : '—'],
      [tx(c.lang, `> ${c.params.limit} km/h`, `> ${c.params.limit} km/h`), String(s.over), s.over ? COL.alert : undefined],
      [tx(c.lang, 'ön plan', 'foreground'), `${(s.fg * 100).toFixed(1)}%`],
      ...s.log.map((e) => ['', e] as [string, string]),
    ], 166)
    if (s.thumb) {
      ctx.save(); ctx.globalAlpha = 0.9; ctx.drawImage(s.thumb, 10, c.H - 130, 160, 120); ctx.restore()
      ctx.strokeStyle = 'rgba(148,163,184,.6)'; ctx.strokeRect(10.5, c.H - 129.5, 159, 119)
      tag(ctx, 10, c.H - 130, tx(c.lang, 'ön plan maskesi', 'foreground mask'), COL.panel, '#e2e8f0', 'bottom')
    }
  },
  hud(s, c) {
    const l = c.lang, avg = s.speeds.length ? s.speeds.reduce((a, b) => a + b, 0) / s.speeds.length : 0
    const active = s.tracks.filter((t) => !t.miss).length
    return {
      level: s.over ? 'warn' : 'ok', label: tx(l, `${s.down + s.up} araç sayıldı, ${active} iz`, `${s.down + s.up} vehicles counted, ${active} tracks`),
      metrics: [[tx(l, 'Aşağı', 'Down'), String(s.down)], [tx(l, 'Yukarı', 'Up'), String(s.up)], [tx(l, 'Ortalama hız', 'Average speed'), s.speeds.length ? `${avg.toFixed(0)} km/h` : '—'], [tx(l, 'Hız ihlali', 'Speeding'), String(s.over)]],
    }
  },
}

// ================================================================ 7. meyve olgunluğu
interface Fruit { x: number; y: number; r: number; q: number }
interface FruitS {
  small: HTMLCanvasElement | null; thumb: HTMLCanvasElement | null; items: Array<{ id: number; x0: number; y0: number; x1: number; y1: number; ratio: number; label: Ripe }>
  tracks: Track[]; nextId: number; counts: Record<Ripe, number>; fruits: Fruit[]; spawn: number; rnd: () => number; slat: number
}
const RIPE_COL: Record<Ripe, string> = { ripe: '#ef4444', half: '#f59e0b', unripe: '#22c55e' }
const RIPE_NAME: Record<Ripe, { tr: string; en: string }> = { ripe: { tr: 'OLGUN', en: 'RIPE' }, half: { tr: 'YARI', en: 'HALF' }, unripe: { tr: 'HAM', en: 'UNRIPE' } }
function tomato(ctx: C, f: Fruit) {
  ctx.save(); ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 7); ctx.clip()
  ctx.fillStyle = '#4f9a3a'; ctx.fillRect(f.x - f.r, f.y - f.r, 2 * f.r, 2 * f.r)
  const edge = f.x - f.r + 2 * f.r * f.q
  ctx.fillStyle = '#d23a2c'; ctx.fillRect(f.x - f.r, f.y - f.r, edge - (f.x - f.r), 2 * f.r)
  if (f.q > 0.08 && f.q < 0.92) { ctx.fillStyle = '#e8932a'; ctx.fillRect(edge - f.r * 0.15, f.y - f.r, f.r * 0.3, 2 * f.r) }
  const g = ctx.createRadialGradient(f.x - f.r * 0.35, f.y - f.r * 0.35, 1, f.x, f.y, f.r); g.addColorStop(0, 'rgba(255,255,255,.55)'); g.addColorStop(0.25, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,.18)')
  ctx.fillStyle = g; ctx.fillRect(f.x - f.r, f.y - f.r, 2 * f.r, 2 * f.r)
  ctx.restore()
  ctx.fillStyle = '#2f6b26'; ctx.beginPath()
  for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2, rr = i % 2 ? f.r * 0.08 : f.r * 0.3; ctx.lineTo(f.x + Math.cos(a) * rr, f.y - f.r * 0.82 + Math.sin(a) * rr * 0.5) }
  ctx.fill()
}
const roiOf = (c: { W: number; H: number }) => ({ x: c.W * 0.2, y: c.H * 0.2, w: c.W * 0.6, h: c.H * 0.6 })
export const fruitDemo: DemoImpl<FruitS> = {
  init: () => ({ small: null, thumb: null, items: [], tracks: [], nextId: 1, counts: { ripe: 0, half: 0, unripe: 0 }, fruits: [], spawn: 0, rnd: rng(3), slat: 0 }),
  scene(ctx, c, s) {
    ctx.fillStyle = '#2b3038'; ctx.fillRect(0, 0, 640, 480)
    ctx.fillStyle = '#5c636d'; ctx.fillRect(0, 140, 640, 8); ctx.fillRect(0, 352, 640, 8)
    ctx.fillStyle = '#8a8f96'; ctx.fillRect(0, 148, 640, 204)
    s.slat = (s.slat + c.dt * 70) % 40
    ctx.fillStyle = '#7f848b'; for (let x = -40 + s.slat; x < 640; x += 40) ctx.fillRect(x, 148, 3, 204)
    ctx.fillStyle = '#3a4049'; for (let x = 20; x < 640; x += 120) { ctx.fillRect(x, 360, 14, 120); ctx.fillRect(x, 0, 14, 140) }
    for (const f of s.fruits) f.x += 70 * c.dt
    s.fruits = s.fruits.filter((f) => f.x < 700)
    s.spawn -= c.dt
    if (s.spawn <= 0) {
      const qs = [0.04, 0.3, 0.5, 0.72, 0.95]
      s.fruits.push({ x: -45, y: 195 + s.rnd() * 110, r: 30 + s.rnd() * 8, q: Math.min(1, Math.max(0, qs[Math.floor(s.rnd() * qs.length)] + (s.rnd() - 0.5) * 0.08)) })
      s.spawn = 1.2 + s.rnd() * 0.6
    }
    for (const f of s.fruits) tomato(ctx, f)
    return null
  },
  infer(ctx, c, s) {
    s.small ??= offscreen(SW, SH); s.thumb ??= offscreen(SW, SH)
    const sc = s.small.getContext('2d', { willReadFrequently: true })!
    sc.drawImage(ctx.canvas, 0, 0, SW, SH)
    const k = c.W / SW
    const p = { ...RIPE_DEFAULTS, ripe: c.params.ripe, redMax: c.params.redMax, sMin: c.params.sMin }
    const { cls, mask } = segmentFruit(sc.getImageData(0, 0, SW, SH).data, SW, SH, p)
    if (c.mode === 'camera') {
      const r = roiOf(c)
      for (let i = 0; i < mask.length; i++) { const x = (i % SW) * k, y = Math.floor(i / SW) * k; if (x < r.x || x > r.x + r.w || y < r.y || y > r.y + r.h) { mask[i] = 0; cls[i] = 0 } }
    }
    const { blobs: bs, labels } = blobs(mask, SW, SH, 150)
    const counts = blobHueCounts(cls, labels)
    s.items = bs.map((b) => ({ id: b.id, x0: b.x0 * k, y0: b.y0 * k, x1: b.x1 * k, y1: b.y1 * k, ...ripeness(counts.get(b.id) ?? { red: 0, yellow: 0, green: 0 }, p) }))
    ;({ tracks: s.tracks, nextId: s.nextId } = trackStep(s.tracks, bs, c.t, 25, 6, s.nextId))
    for (const e of countStep(s.tracks, (c.W * 0.72) / k, 1, 'x')) {
      const tr = s.tracks.find((t) => t.id === e.id), it = tr && s.items.find((i) => i.id === tr.box.id)
      if (it && e.dir === 1) s.counts[it.label]++
    }
    const tc = s.thumb.getContext('2d')!, img = tc.createImageData(SW, SH)
    const pal = [[15, 23, 42], [239, 68, 68], [245, 158, 11], [34, 197, 94]]
    for (let i = 0; i < cls.length; i++) { const q = pal[mask[i] ? cls[i] : 0]; img.data[i * 4] = q[0]; img.data[i * 4 + 1] = q[1]; img.data[i * 4 + 2] = q[2]; img.data[i * 4 + 3] = 255 }
    tc.putImageData(img, 0, 0)
  },
  overlay(ctx, c, s) {
    const gx = c.W * 0.72
    if (c.mode === 'camera') { const r = roiOf(c); ctx.save(); ctx.strokeStyle = '#38bdf8'; ctx.setLineDash([8, 6]); ctx.lineWidth = 2; ctx.strokeRect(r.x, r.y, r.w, r.h); ctx.restore(); tag(ctx, r.x, r.y - 2, 'ROI', '#38bdf8', '#0b1220', 'bottom') }
    else { ctx.save(); ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 3; ctx.setLineDash([10, 6]); ctx.beginPath(); ctx.moveTo(gx, 130); ctx.lineTo(gx, 370); ctx.stroke(); ctx.restore(); tag(ctx, gx - 30, 372, tx(c.lang, 'KAPI', 'GATE'), '#38bdf8') }
    for (const it of s.items) bracketBox(ctx, it.x0 - 3, it.y0 - 3, it.x1 + 3, it.y1 + 3, RIPE_COL[it.label], `${RIPE_NAME[it.label][c.lang]} ${(it.ratio * 100).toFixed(0)}%`)
    panel(ctx, 10, 10, [
      [tx(c.lang, 'olgun', 'ripe'), String(s.counts.ripe), RIPE_COL.ripe], [tx(c.lang, 'yarı olgun', 'half-ripe'), String(s.counts.half), RIPE_COL.half],
      [tx(c.lang, 'ham', 'unripe'), String(s.counts.unripe), RIPE_COL.unripe], [tx(c.lang, 'görünen', 'in view'), String(s.items.length)],
    ], 190)
    if (s.thumb) {
      ctx.drawImage(s.thumb, c.W - 170, 10, 160, 120)
      ctx.strokeStyle = 'rgba(148,163,184,.6)'; ctx.strokeRect(c.W - 169.5, 10.5, 159, 119)
      tag(ctx, c.W - 170, 130, tx(c.lang, 'HSV sınıf haritası', 'HSV class map'), COL.panel, '#e2e8f0')
    }
  },
  hud(s, c) {
    const l = c.lang, tot = s.counts.ripe + s.counts.half + s.counts.unripe
    return {
      level: s.items.length ? 'ok' : 'idle', label: s.items.length ? tx(l, `${s.items.length} meyve görünüyor, ${tot} sınıflandırıldı`, `${s.items.length} fruit in view, ${tot} sorted`) : tx(l, 'Meyve (doygun renkli nesne) yok', 'No fruit (saturated object) in view'),
      metrics: [[tx(l, 'Olgun', 'Ripe'), String(s.counts.ripe)], [tx(l, 'Yarı olgun', 'Half-ripe'), String(s.counts.half)], [tx(l, 'Ham', 'Unripe'), String(s.counts.unripe)]],
    }
  },
}
