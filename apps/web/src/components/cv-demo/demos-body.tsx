'use client'
// Gerçek Hayat Demoları 1–4 (vücut ve el noktaları): düşme tespiti, bölge ihlali + gece modu, el yasak bölgede, duruş analizi.
// Örnek modda sahne üreticisi (lib/cv-demo-scenes) noktaları verir; kamera modunda MediaPipe. Karar kodu ikisinde aynıdır.
import {
  bbox, debounce, deb, fallInit, fallObs, fallStep, footPoint, handHazard, hazardNeed, nightVision, pointInPolygon, postureFeatures,
  postureStep, postureVerdict, POSTURE_DEFAULTS, ZONE_DEFAULTS, type Deb, type FallState, type Hazard, type PostureF, type PostureWhy, type Pt, type Rect,
} from '@/lib/cv-demo-logic'
import { makeHand, makePose, makeUpper } from '@/lib/cv-demo-scenes'
import { DEMO_TEXT } from '@/lib/cv-demolar'
import type { Ctx, DemoImpl, Hud, L } from './host'
import { banner, bracketBox, COL, cross, drawPerson, HAND_EDGES, panel, POSE_EDGES, skeleton, spark, tag, zone } from './overlay'

type C = CanvasRenderingContext2D
const tx = (l: L, tr: string, en: string) => (l === 'en' ? en : tr)
const ease = (k: number) => k * k
const clamp01 = (k: number) => Math.max(0, Math.min(1, k))
const lerp = (a: number, b: number, k: number) => a + (b - a) * clamp01(k)
const push = (a: number[], v: number, n = 60) => { a.push(v); if (a.length > n) a.shift() }

// ================================================================ 1. düşme tespiti
interface FallS { f: FallState; lm: Pt[] | null; falls: number; vs: number[]; as: number[] }
function roomBg(ctx: C) {
  ctx.fillStyle = '#d9d4cb'; ctx.fillRect(0, 0, 640, 480)
  ctx.fillStyle = '#b9a58a'; ctx.fillRect(0, 410, 640, 70)
  ctx.fillStyle = '#a48f73'; for (let x = 0; x < 640; x += 64) ctx.fillRect(x, 410, 2, 70)
  ctx.fillStyle = '#9fc3e0'; ctx.fillRect(470, 70, 120, 150); ctx.strokeStyle = '#f5f2ec'; ctx.lineWidth = 8; ctx.strokeRect(470, 70, 120, 150)
  ctx.beginPath(); ctx.moveTo(530, 70); ctx.lineTo(530, 220); ctx.stroke()
}
function chair(ctx: C, x: number) {
  ctx.fillStyle = '#6b4f3a'; ctx.fillRect(x - 40, 335, 80, 12); ctx.fillRect(x - 40, 345, 8, 66); ctx.fillRect(x + 32, 345, 8, 66); ctx.fillRect(x + 32, 250, 8, 95)
}
/** 16 sn'lik döngü: yürü, yavaşça otur, kalk, yürü, düş, yat, kalk. */
function fallScene(t: number) {
  const k = t % 16
  const base = { footY: 412, h: 280 }
  if (k < 3) return { ...base, cx: lerp(110, 300, k / 3), phase: k * 7, stride: 0.1 }
  if (k < 4.5) return { ...base, cx: 300, crouch: (k - 3) / 1.5 }
  if (k < 6) return { ...base, cx: 300, crouch: 1 }
  if (k < 7.5) return { ...base, cx: 300, crouch: 1 - (k - 6) / 1.5 }
  if (k < 9) return { ...base, cx: lerp(300, 380, (k - 7.5) / 1.5), phase: k * 7, stride: 0.1 }
  if (k < 9.6) return { ...base, cx: 380, lean: (Math.PI / 2) * ease((k - 9) / 0.6) }
  if (k < 13) return { ...base, cx: 380, lean: Math.PI / 2 }
  if (k < 14.5) return { ...base, cx: 380, lean: (Math.PI / 2) * (1 - (k - 13) / 1.5) }
  return { ...base, cx: 380 }
}
export const fallDemo: DemoImpl<FallS> = {
  init: () => ({ f: fallInit(), lm: null, falls: 0, vs: [], as: [] }),
  scene(ctx, c) {
    roomBg(ctx); chair(ctx, 300)
    const lm = makePose(fallScene(c.t))
    drawPerson(ctx, lm, '#3d5a80', '#e0b48f')
    return lm
  },
  infer(_ctx, c, s, lm) {
    s.lm = lm
    const p = { speed: c.params.speed, angle: c.params.angle, frames: c.params.frames, window: 1.5 }
    const prev = s.f.phase
    s.f = fallStep(s.f, lm ? fallObs(lm, c.t) : null, p)
    if (s.f.phase === 'fall' && prev !== 'fall') s.falls++
    push(s.vs, s.f.v); push(s.as, s.f.angle)
  },
  overlay(ctx, c, s) {
    const ph = s.f.phase, col = ph === 'fall' ? COL.alert : ph === 'ok' ? COL.ok : COL.warn
    if (s.lm) {
      skeleton(ctx, s.lm, POSE_EDGES)
      const b = bbox(s.lm)
      if (b) bracketBox(ctx, b.x0 - 12, b.y0 - 30, b.x1 + 12, b.y1 + 8, col, `${tx(c.lang, 'KİŞİ', 'PERSON')} · ${s.f.angle.toFixed(0)}°`)
      const sm = { x: (s.lm[11].x + s.lm[12].x) / 2, y: (s.lm[11].y + s.lm[12].y) / 2 }, hm = { x: (s.lm[23].x + s.lm[24].x) / 2, y: (s.lm[23].y + s.lm[24].y) / 2 }
      ctx.save(); ctx.strokeStyle = '#facc15'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(sm.x, sm.y); ctx.lineTo(hm.x, hm.y); ctx.stroke(); ctx.restore()
      cross(ctx, hm.x, hm.y, '#facc15')
    }
    panel(ctx, 10, 10, [
      [tx(c.lang, 'evre', 'phase'), ph.toUpperCase(), col],
      [tx(c.lang, 'gövde açısı', 'torso angle'), `${s.f.angle.toFixed(0)}° / ${c.params.angle}°`],
      [tx(c.lang, 'düşüş hızı', 'drop speed'), `${s.f.v.toFixed(2)} / ${c.params.speed}`],
      [tx(c.lang, 'onay', 'confirm'), `${s.f.frames} / ${c.params.frames}`],
    ], 230)
    spark(ctx, 10, 96, 230, 46, s.vs, -1, 4, '#38bdf8', c.params.speed, tx(c.lang, 'hız (gövde/sn)', 'speed (torsos/s)'))
    spark(ctx, 10, 146, 230, 46, s.as, 0, 100, '#facc15', c.params.angle, tx(c.lang, 'açı (°)', 'angle (°)'))
    if (ph === 'fall') banner(ctx, tx(c.lang, '⚠ DÜŞME ALGILANDI', '⚠ FALL DETECTED'), COL.alert, c.t, !c.reduced)
  },
  hud(s, c): Hud {
    const ph = s.f.phase, l = c.lang
    const label = { ok: tx(l, 'Normal', 'Normal'), drop: tx(l, 'Ani alçalma: açı izleniyor', 'Sudden drop: watching angle'), fall: tx(l, 'DÜŞME ALGILANDI', 'FALL DETECTED'), lying: tx(l, 'Yatıyor (yavaş, alarm yok)', 'Lying (slow, no alarm)') }[ph]
    return {
      level: !s.lm ? 'idle' : ph === 'fall' ? 'alert' : ph === 'ok' ? 'ok' : 'warn', label: s.lm ? label : tx(l, 'Kişi görünmüyor', 'No person visible'),
      metrics: [[tx(l, 'Gövde açısı', 'Torso angle'), `${s.f.angle.toFixed(0)}°`], [tx(l, 'Düşüş hızı', 'Drop speed'), `${s.f.v.toFixed(2)} ${tx(l, 'gövde/sn', 'torsos/s')}`], [tx(l, 'Düşme sayısı', 'Falls'), String(s.falls)]],
    }
  },
}

// ================================================================ 2. bölge ihlali + gece modu
interface ZoneS { poly: Pt[]; drawing: boolean; draft: Pt[]; night: boolean; z: Deb<boolean>; events: number; since: number | null; lm: Pt[] | null; foot: Pt | null; lum: { before: number; after: number } | null }
const DEFAULT_ZONE: Pt[] = [{ x: 250, y: 300 }, { x: 470, y: 290 }, { x: 560, y: 450 }, { x: 200, y: 460 }]
function yard(ctx: C) {
  ctx.fillStyle = '#0a0e16'; ctx.fillRect(0, 0, 640, 480)
  ctx.fillStyle = '#111827'; ctx.fillRect(0, 0, 640, 230)
  ctx.fillStyle = '#161d2a'; ctx.fillRect(40, 90, 330, 150)
  ctx.fillStyle = '#1d2636'; for (let x = 60; x < 360; x += 70) ctx.fillRect(x, 150, 46, 90)
  ctx.fillStyle = '#1a1f1a'; ctx.fillRect(0, 230, 640, 250)
  ctx.strokeStyle = '#232a33'; ctx.lineWidth = 2
  for (let x = 380; x < 640; x += 18) { ctx.beginPath(); ctx.moveTo(x, 150); ctx.lineTo(x, 240); ctx.stroke() }
  ctx.beginPath(); ctx.moveTo(380, 160); ctx.lineTo(640, 160); ctx.stroke()
  const g = ctx.createRadialGradient(200, 100, 2, 200, 100, 120); g.addColorStop(0, 'rgba(255,214,140,.22)'); g.addColorStop(1, 'rgba(255,214,140,0)')
  ctx.fillStyle = g; ctx.fillRect(60, 0, 300, 240)
  ctx.fillStyle = '#2b2f36'; for (const [x, y] of [[90, 380], [120, 395], [560, 300]]) ctx.fillRect(x, y, 40, 30)
}
export const zoneDemo: DemoImpl<ZoneS> = {
  init: () => ({ poly: DEFAULT_ZONE.map((p) => ({ ...p })), drawing: false, draft: [], night: true, z: deb(false), events: 0, since: null, lm: null, foot: null, lum: null }),
  scene(ctx, c) {
    yard(ctx)
    const k = (c.t % 14) / 14, back = k > 0.5, u = back ? (1 - k) * 2 : k * 2
    const cx = lerp(40, 600, u), footY = lerp(290, 450, Math.sin(u * Math.PI) * 0.9), h = lerp(150, 240, (footY - 290) / 160)
    const lm = makePose({ cx, footY, h, phase: c.t * 7, stride: 0.12 })
    drawPerson(ctx, lm, '#252b33', '#2c3138')
    return lm
  },
  pre(ctx, c, s) {
    if (!s.night) { s.lum = null; return }
    const img = ctx.getImageData(0, 0, c.W, c.H)
    s.lum = nightVision(img.data, c.params.gain)
    ctx.putImageData(img, 0, 0)
  },
  infer(_ctx, c, s, lm) {
    s.lm = lm; s.foot = lm ? footPoint(lm) : null
    const inNow = !!s.foot && s.poly.length >= 3 && pointInPolygon(s.foot, s.poly)
    const was = s.z.value
    s.z = debounce(s.z, inNow, (_f, to) => (to ? c.params.enter : ZONE_DEFAULTS.exit))
    if (s.z.value && !was) { s.events++; s.since = c.t }
    if (!s.z.value) s.since = null
  },
  overlay(ctx, c, s) {
    const on = s.z.value, col = on ? COL.alert : '#facc15'
    if (!s.drawing) zone(ctx, s.poly, col, on ? 0.28 : 0.14, tx(c.lang, 'YASAK BÖLGE', 'RESTRICTED ZONE'))
    else { zone(ctx, s.draft, '#38bdf8', 0.12, undefined, true); tag(ctx, 10, 10, DEMO_TEXT[c.lang].drawHelp, '#38bdf8') }
    if (s.lm) {
      skeleton(ctx, s.lm, POSE_EDGES, on ? 'rgba(239,68,68,.9)' : COL.line)
      const b = bbox(s.lm)
      if (b) bracketBox(ctx, b.x0 - 10, b.y0 - 24, b.x1 + 10, b.y1 + 6, on ? COL.alert : COL.ok, `${tx(c.lang, 'KİŞİ', 'PERSON')} #1`)
    }
    if (s.foot) cross(ctx, s.foot.x, s.foot.y, on ? COL.alert : '#38bdf8')
    if (!s.drawing) panel(ctx, 10, 10, [
      [tx(c.lang, 'bölge', 'zone'), on ? tx(c.lang, 'İHLAL', 'BREACH') : tx(c.lang, 'temiz', 'clear'), on ? COL.alert : COL.ok],
      [tx(c.lang, 'ihlal sayısı', 'breaches'), String(s.events)],
      [tx(c.lang, 'bölgede', 'in zone'), s.since !== null ? `${(c.t - s.since).toFixed(1)} s` : '—'],
      [tx(c.lang, 'gece modu', 'night mode'), s.night && s.lum ? `${s.lum.before.toFixed(0)}→${s.lum.after.toFixed(0)}` : tx(c.lang, 'kapalı', 'off')],
    ], 220)
    if (on) banner(ctx, tx(c.lang, '⚠ BÖLGE İHLALİ', '⚠ ZONE INTRUSION'), COL.alert, c.t, !c.reduced)
  },
  hud(s, c) {
    const l = c.lang
    return {
      level: !s.lm ? 'idle' : s.z.value ? 'alert' : 'ok', label: s.drawing ? DEMO_TEXT[l].drawHelp : !s.lm ? tx(l, 'Kişi görünmüyor', 'No person visible') : s.z.value ? tx(l, 'BÖLGE İHLALİ', 'ZONE INTRUSION') : tx(l, 'Bölge temiz', 'Zone clear'),
      metrics: [[tx(l, 'İhlal sayısı', 'Intrusions'), String(s.events)], [tx(l, 'Köşe sayısı', 'Corners'), String(s.poly.length)], [tx(l, 'Gece modu', 'Night mode'), s.night ? tx(l, 'açık', 'on') : tx(l, 'kapalı', 'off')]],
    }
  },
  click(s, x, y) { if (s.drawing) s.draft.push({ x, y }) },
  Controls({ s, lang, bump }) {
    const T = DEMO_TEXT[lang]
    return <>
      {!s.drawing
        ? <button type="button" className="btn btn-outline btn-sm" onClick={() => { s.drawing = true; s.draft = []; bump() }}>{T.draw}</button>
        : <button type="button" className="btn btn-primary btn-sm" disabled={s.draft.length < 3} onClick={() => { s.poly = s.draft; s.drawing = false; s.z = deb(false); bump() }}>{T.done}</button>}
      <label className="cvd-check"><input type="checkbox" checked={s.night} onChange={(e) => { s.night = e.target.checked; bump() }} /> {T.night}</label>
    </>
  },
}

// ================================================================ 3. el yasak bölgede
interface HotS { zone: Rect; lv: Deb<Hazard>; d: number; near: Pt | null; lm: Pt[] | null; alarms: number }
function kitchen(ctx: C, z: Rect, t: number, reduced: boolean) {
  ctx.fillStyle = '#e8eef1'; ctx.fillRect(0, 0, 640, 480)
  ctx.strokeStyle = '#cfd9de'; ctx.lineWidth = 1
  for (let y = 0; y < 200; y += 40) for (let x = (y / 40) % 2 ? 20 : 0; x < 640; x += 40) ctx.strokeRect(x, y, 40, 40)
  ctx.fillStyle = '#9aa5ad'; ctx.fillRect(0, 200, 640, 280)
  ctx.fillStyle = '#b8c2c9'; ctx.fillRect(0, 200, 640, 10)
  ctx.fillStyle = '#23272b'; ctx.fillRect(z.x, z.y, z.w, z.h)
  const flick = reduced ? 1 : 0.85 + 0.15 * Math.sin(t * 13)
  for (const [fx, fy] of [[0.3, 0.35], [0.7, 0.35], [0.3, 0.75], [0.7, 0.75]]) {
    const x = z.x + fx * z.w, y = z.y + fy * z.h, r = Math.min(z.w, z.h) * 0.2
    ctx.strokeStyle = '#555c63'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.stroke()
    const g = ctx.createRadialGradient(x, y, 1, x, y, r * 1.1); g.addColorStop(0, `rgba(255,140,40,${0.9 * flick})`); g.addColorStop(1, 'rgba(255,60,20,0)')
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 1.1, 0, 7); ctx.fill()
  }
}
function drawHandShape(ctx: C, lm: Pt[], s: number) {
  ctx.save(); ctx.strokeStyle = '#d9a37f'; ctx.fillStyle = '#d9a37f'; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
  ctx.lineWidth = s * 0.5; ctx.beginPath(); ctx.moveTo(lm[0].x, lm[0].y); ctx.lineTo(lm[0].x - s * 0.4, lm[0].y + s * 3); ctx.stroke()
  ctx.beginPath(); for (const i of [0, 1, 5, 9, 13, 17]) ctx.lineTo(lm[i].x, lm[i].y); ctx.closePath(); ctx.fill(); ctx.lineWidth = s * 0.3; ctx.stroke()
  ctx.lineWidth = s * 0.2
  for (const f of [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16], [17, 18, 19, 20]]) { ctx.beginPath(); f.forEach((i, k) => (k ? ctx.lineTo(lm[i].x, lm[i].y) : ctx.moveTo(lm[i].x, lm[i].y))); ctx.stroke() }
  ctx.restore()
}
export const hotDemo: DemoImpl<HotS> = {
  init: () => ({ zone: { x: 380, y: 230, w: 200, h: 130 }, lv: deb<Hazard>('safe'), d: Infinity, near: null, lm: null, alarms: 0 }),
  scene(ctx, c, s) {
    kitchen(ctx, s.zone, c.t, c.reduced)
    const x = 300 + 210 * Math.sin(c.t * 0.55), y = 400 + 50 * Math.sin(c.t * 0.9 + 1)
    const lm = makeHand(x, y, 70, 0.25 * Math.sin(c.t * 0.7))
    drawHandShape(ctx, lm, 70)
    return lm
  },
  infer(_ctx, c, s, lm) {
    s.lm = lm
    if (!lm) { s.lv = debounce(s.lv, 'safe', hazardNeed); s.near = null; s.d = Infinity; return }
    const h = handHazard(lm, s.zone, c.params.margin)
    const was = s.lv.value
    s.lv = debounce(s.lv, h.level, hazardNeed); s.d = h.d; s.near = lm[h.idx]
    if (s.lv.value === 'danger' && was !== 'danger') s.alarms++
  },
  overlay(ctx, c, s) {
    const z = s.zone, m = c.params.margin, v = s.lv.value
    const col = v === 'danger' ? COL.alert : v === 'warn' ? COL.warn : COL.ok
    ctx.save()
    if (m > 0) { ctx.strokeStyle = 'rgba(245,158,11,.9)'; ctx.setLineDash([6, 5]); ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(z.x - m, z.y - m, z.w + 2 * m, z.h + 2 * m, m); ctx.stroke(); ctx.setLineDash([]) }
    ctx.lineWidth = 5; ctx.strokeStyle = col; ctx.strokeRect(z.x, z.y, z.w, z.h)
    ctx.fillStyle = col; ctx.globalAlpha = v === 'danger' ? 0.3 : 0.1; ctx.fillRect(z.x, z.y, z.w, z.h)
    ctx.restore()
    tag(ctx, z.x, z.y - 4, tx(c.lang, 'SICAK BÖLGE', 'HOT ZONE'), col, '#0b1220', 'bottom')
    if (s.lm) {
      skeleton(ctx, s.lm, HAND_EDGES, '#a855f7', 3)
      const b = bbox(s.lm)
      if (b) bracketBox(ctx, b.x0 - 8, b.y0 - 8, b.x1 + 8, b.y1 + 8, col, `${tx(c.lang, 'EL', 'HAND')} · ${Number.isFinite(s.d) ? s.d.toFixed(0) : '—'} px`)
      if (s.near && s.d > 0) {
        const qx = Math.max(z.x, Math.min(z.x + z.w, s.near.x)), qy = Math.max(z.y, Math.min(z.y + z.h, s.near.y))
        ctx.save(); ctx.strokeStyle = col; ctx.setLineDash([4, 4]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(s.near.x, s.near.y); ctx.lineTo(qx, qy); ctx.stroke(); ctx.restore()
        cross(ctx, s.near.x, s.near.y, col, 7)
      }
    }
    panel(ctx, 10, 10, [
      [tx(c.lang, 'seviye', 'level'), v === 'danger' ? tx(c.lang, 'TEHLİKE', 'DANGER') : v === 'warn' ? tx(c.lang, 'UYARI', 'WARNING') : tx(c.lang, 'güvenli', 'safe'), col],
      [tx(c.lang, 'mesafe', 'distance'), Number.isFinite(s.d) ? `${s.d.toFixed(0)} px` : '—'],
      [tx(c.lang, 'uyarı sınırı', 'warn limit'), `${m} px`],
      [tx(c.lang, 'alarm', 'alarms'), String(s.alarms)],
    ], 210)
    if (v === 'danger') banner(ctx, tx(c.lang, '⚠ EL TEHLİKELİ BÖLGEDE', '⚠ HAND IN DANGER ZONE'), COL.alert, c.t, !c.reduced)
  },
  hud(s, c) {
    const l = c.lang, v = s.lv.value
    return {
      level: !s.lm ? 'idle' : v === 'danger' ? 'alert' : v === 'warn' ? 'warn' : 'ok',
      label: !s.lm ? tx(l, 'El görünmüyor', 'No hand visible') : v === 'danger' ? tx(l, 'TEHLİKE: el bölgenin içinde', 'DANGER: hand inside the zone') : v === 'warn' ? tx(l, 'Uyarı: el bölgeye yakın', 'Warning: hand close to the zone') : tx(l, 'Güvenli', 'Safe'),
      metrics: [[tx(l, 'Bölgeye mesafe', 'Distance to zone'), Number.isFinite(s.d) ? `${s.d.toFixed(0)} px` : '—'], [tx(l, 'Alarm sayısı', 'Alarms'), String(s.alarms)]],
    }
  },
  click(s, x, y, c) { s.zone = { ...s.zone, x: Math.max(0, Math.min(c.W - s.zone.w, x - s.zone.w / 2)), y: Math.max(0, Math.min(c.H - s.zone.h, y - s.zone.h / 2)) } },
  Controls({ lang }) { return <span className="cvd-hint-inline">{DEMO_TEXT[lang].clickZone}</span> },
}

// ================================================================ 4. duruş analizi
interface PostS { base: number | null; f: PostureF | null; why: PostureWhy[]; ps: { badSince: number | null; alert: boolean }; lm: Pt[] | null; reminders: number; calib: boolean; badTime: number; lastT: number }
/** 18 sn'lik döngü: dik → kamburlaşma → dik → omuz düşmesi + baş eğme → dik. */
function postureScene(t: number) {
  const k = t % 18
  const slouch = k < 4 ? 0 : k < 6 ? (k - 4) / 2 : k < 10 ? 1 : k < 11 ? 1 - (k - 10) : 0
  const tilt = k < 13 ? 0 : k < 14 ? k - 13 : k < 16 ? 1 : k < 17 ? 1 - (k - 16) : 0
  return { cx: 320, cy: 330 + slouch * 18, sw: 190 - slouch * 8, drop: slouch * 0.8, neck: slouch * 6 + tilt * 24, tilt: tilt * 12 }
}
function office(ctx: C) {
  ctx.fillStyle = '#e6ebe4'; ctx.fillRect(0, 0, 640, 480)
  ctx.fillStyle = '#c9d3c4'; ctx.fillRect(0, 0, 640, 60)
  ctx.fillStyle = '#88a07e'; ctx.beginPath(); ctx.ellipse(560, 200, 40, 70, 0, 0, 7); ctx.fill()
  ctx.fillStyle = '#7a6150'; ctx.fillRect(540, 260, 40, 50)
}
function drawUpper(ctx: C, lm: Pt[]) {
  const sw = Math.hypot(lm[11].x - lm[12].x, lm[11].y - lm[12].y)
  ctx.save(); ctx.fillStyle = '#5b7f95'
  ctx.beginPath(); ctx.moveTo(lm[12].x - sw * 0.08, lm[12].y); ctx.lineTo(lm[11].x + sw * 0.08, lm[11].y); ctx.lineTo(lm[11].x + sw * 0.15, 480); ctx.lineTo(lm[12].x - sw * 0.15, 480); ctx.closePath(); ctx.fill()
  ctx.beginPath(); ctx.arc(lm[11].x, lm[11].y + sw * 0.05, sw * 0.12, 0, 7); ctx.arc(lm[12].x, lm[12].y + sw * 0.05, sw * 0.12, 0, 7); ctx.fill()
  const sm = { x: (lm[11].x + lm[12].x) / 2, y: (lm[11].y + lm[12].y) / 2 }
  ctx.strokeStyle = '#d9a37f'; ctx.lineWidth = sw * 0.2; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(sm.x, sm.y); ctx.lineTo(lm[0].x, lm[0].y + sw * 0.1); ctx.stroke()
  ctx.fillStyle = '#d9a37f'; ctx.beginPath(); ctx.ellipse(lm[0].x, lm[0].y, sw * 0.22, sw * 0.28, Math.atan2(lm[7].y - lm[8].y, lm[7].x - lm[8].x), 0, 7); ctx.fill()
  ctx.fillStyle = '#3b2a20'; ctx.beginPath(); ctx.ellipse(lm[0].x, lm[0].y - sw * 0.14, sw * 0.23, sw * 0.16, Math.atan2(lm[7].y - lm[8].y, lm[7].x - lm[8].x), Math.PI, 0); ctx.fill()
  ctx.restore()
  ctx.fillStyle = '#4a4f55'; ctx.fillRect(120, 440, 400, 40)
}
export const postureDemo: DemoImpl<PostS> = {
  init: () => ({ base: null, f: null, why: [], ps: { badSince: null, alert: false }, lm: null, reminders: 0, calib: false, badTime: 0, lastT: 0 }),
  scene(ctx, c, s) {
    office(ctx)
    const lm = makeUpper(postureScene(c.t))
    drawUpper(ctx, lm)
    if (s.base === null) { const f = postureFeatures(makeUpper(postureScene(0))); s.base = f?.ratio ?? null }
    return lm
  },
  infer(_ctx, c, s, lm) {
    s.lm = lm; s.f = lm ? postureFeatures(lm) : null
    const dt = s.lastT ? Math.max(0, Math.min(0.5, c.t - s.lastT)) : 0; s.lastT = c.t
    if (s.calib && s.f) { s.base = s.f.ratio; s.calib = false }
    if (!s.f) { s.why = []; s.ps = { badSince: null, alert: false }; return }
    s.why = postureVerdict(s.f, s.base, { ...POSTURE_DEFAULTS, tilt: c.params.tilt, neck: c.params.neck })
    const was = s.ps.alert
    s.ps = postureStep(s.ps, s.why.length > 0, c.t, c.params.hold)
    if (s.why.length) s.badTime += dt
    if (s.ps.alert && !was) s.reminders++
  },
  overlay(ctx, c, s) {
    const lm = s.lm, f = s.f, bad = s.why.length > 0
    if (lm && f) {
      skeleton(ctx, lm, [[11, 12], [11, 13], [12, 14]], COL.line)
      const sm = { x: (lm[11].x + lm[12].x) / 2, y: (lm[11].y + lm[12].y) / 2 }, ear = { x: (lm[7].x + lm[8].x) / 2, y: (lm[7].y + lm[8].y) / 2 }
      ctx.save(); ctx.lineWidth = 3
      ctx.strokeStyle = s.why.includes('tilt') ? COL.alert : COL.ok; ctx.beginPath(); ctx.moveTo(lm[12].x, lm[12].y); ctx.lineTo(lm[11].x, lm[11].y); ctx.stroke()
      ctx.strokeStyle = 'rgba(226,232,240,.6)'; ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.moveTo(lm[12].x - 30, sm.y); ctx.lineTo(lm[11].x + 30, sm.y); ctx.moveTo(sm.x, sm.y); ctx.lineTo(sm.x, sm.y - 220); ctx.stroke(); ctx.setLineDash([])
      ctx.strokeStyle = s.why.includes('neck') ? COL.alert : COL.ok; ctx.beginPath(); ctx.moveTo(sm.x, sm.y); ctx.lineTo(ear.x, ear.y); ctx.stroke()
      ctx.restore()
      for (const i of [0, 7, 8, 11, 12]) cross(ctx, lm[i].x, lm[i].y, '#facc15', 6)
      tag(ctx, lm[11].x + 14, lm[11].y, `${tx(c.lang, 'omuz', 'shoulder')} ${f.tilt.toFixed(1)}°`, s.why.includes('tilt') ? COL.alert : COL.ok)
      tag(ctx, ear.x + 26, ear.y - 30, `${tx(c.lang, 'boyun', 'neck')} ${f.neck.toFixed(1)}°`, s.why.includes('neck') ? COL.alert : COL.ok)
    }
    panel(ctx, 10, 10, [
      [tx(c.lang, 'omuz eğimi', 'shoulder tilt'), f ? `${f.tilt.toFixed(1)}° / ${c.params.tilt}°` : '—', s.why.includes('tilt') ? COL.alert : undefined],
      [tx(c.lang, 'boyun açısı', 'neck angle'), f ? `${f.neck.toFixed(1)}° / ${c.params.neck}°` : '—', s.why.includes('neck') ? COL.alert : undefined],
      [tx(c.lang, 'baş oranı', 'head ratio'), f ? `${f.ratio.toFixed(2)} / ${s.base ? (s.base * POSTURE_DEFAULTS.drop).toFixed(2) : '—'}` : '—', s.why.includes('drop') ? COL.alert : undefined],
      [tx(c.lang, 'kötü duruş', 'bad posture'), s.ps.badSince !== null ? `${(c.t - s.ps.badSince).toFixed(1)} / ${c.params.hold} s` : '—', bad ? COL.warn : COL.ok],
    ], 250)
    if (s.ps.alert) banner(ctx, tx(c.lang, '↑ DİK OTUR', '↑ SIT UP STRAIGHT'), COL.warn, c.t, !c.reduced)
  },
  hud(s, c) {
    const l = c.lang
    const names: Record<PostureWhy, string> = { tilt: tx(l, 'omuz eğik', 'shoulders tilted'), neck: tx(l, 'baş yana/öne', 'head leaning'), drop: tx(l, 'baş düştü', 'head dropped') }
    return {
      level: !s.f ? 'idle' : s.ps.alert ? 'alert' : s.why.length ? 'warn' : 'ok',
      label: !s.f ? tx(l, 'Omuzlar ve baş görünmüyor', 'Shoulders and head not visible') : s.ps.alert ? tx(l, 'DİK OTUR', 'SIT UP STRAIGHT') : s.why.length ? s.why.map((w) => names[w]).join(', ') : tx(l, 'İyi duruş', 'Good posture'),
      metrics: [[tx(l, 'Hatırlatma', 'Reminders'), String(s.reminders)], [tx(l, 'Kötü duruş süresi', 'Bad posture time'), `${s.badTime.toFixed(0)} s`], [tx(l, 'Kalibrasyon', 'Calibration'), s.base ? s.base.toFixed(2) : tx(l, 'varsayılan', 'default')]],
    }
  },
  Controls({ s, lang, mode, bump }) {
    return mode === 'camera' ? <button type="button" className="btn btn-outline btn-sm" onClick={() => { s.calib = true; bump() }}>{DEMO_TEXT[lang].calibrate}</button> : null
  },
}

export type { Ctx }
