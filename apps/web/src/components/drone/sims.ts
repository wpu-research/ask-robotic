// Drone dersi tarayıcı simülasyonları: tuval çizimi ve denetimler. Hesap lib/drone/physics.ts'te (saf, testli);
// burada yalnız girdi toplama, çizim ve canlandırma var. Renkler .rb-sim kapsayıcısındaki --sim-* değişkenlerinden
// okunur (ESOF 323 simülasyonlarıyla aynı görünüm). mountDroneSim() durdurma fonksiyonu döndürür.
import {
  ALT_DEFAULTS, DEG, FUSION_DEFAULTS, MISSION_DEFAULTS, QUAD_X, ROLL_DEFAULTS, flightTime, missionInit, missionStep, mixQuadX,
  relThrust, rng, simulateAltitude, simulateFusion, simulateRoll, thrustToWeight, type FlightInput, type MissionParams, type Vec,
} from '@/lib/drone/physics'
import type { DroneSimId } from './sim-meta'

type Lang = 'tr' | 'en'
type Cfg = Record<string, string>
type Ctx = CanvasRenderingContext2D
interface Pal { bg: string; grid: string; ink: string; mute: string; a: string; gold: string; red: string; green: string; sky: string; line: string }

const FONT = 'Poppins, system-ui, sans-serif'
const nf = (lang: Lang, d = 1) => (v: number) => Number.isFinite(v) ? v.toLocaleString(lang === 'en' ? 'en-GB' : 'tr-TR', { minimumFractionDigits: d, maximumFractionDigits: d }) : '∞'

function el<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Record<string, string> = {}, ...kids: Array<Node | string>): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag)
  for (const [k, v] of Object.entries(attrs)) { if (k === 'class') e.className = v; else e.setAttribute(k, v) }
  e.append(...kids)
  return e
}
function palette(host: HTMLElement): Pal {
  const cs = getComputedStyle(host.closest('.rb-sim') ?? host)
  const g = (n: string) => cs.getPropertyValue(n).trim() || '#888'
  return { bg: g('--sim-bg'), grid: g('--sim-grid'), ink: g('--ink'), mute: g('--mute'), a: g('--sim-a'), gold: g('--gold'), red: g('--red'), green: g('--green'), sky: g('--sky'), line: g('--line') }
}
/** Küçük ekranda tuval küçülünce yazı da küçülür; bu çarpan yazı boyunu büyütüp okunur tutar (tuval başına). */
const FS = new WeakMap<Ctx, number>()
const fs = (ctx: Ctx) => FS.get(ctx) ?? 1
/** Tuval: çizim mantıksal W×H biriminde yapılır; arka bellek kapsayıcı genişliği × devicePixelRatio'ya göre kurulur
 *  (her ekranda keskin). Genişlik değişince yeniden kurulur ve `redraw` çağrılır (yalnız girdiyle çizen simler atar;
 *  canlandırmalı simler zaten her karede çizer). */
function canvas(host: HTMLElement, W = 640, H = 400) {
  const cv = el('canvas', { class: 'sim-canvas', role: 'img' })
  cv.style.aspectRatio = `${W} / ${H}`
  const ctx = cv.getContext('2d')!
  const pos = (e: MouseEvent) => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height } }
  const c = { cv, ctx, W, H, pos, redraw: () => {} }
  let lastW = -1
  const fit = () => {
    const cssW = cv.clientWidth || W
    if (cssW === lastW) return false
    lastW = cssW
    const dpr = Math.min(3, window.devicePixelRatio || 1), k = cssW / W
    cv.width = Math.round(cssW * dpr); cv.height = Math.round(cssW * H / W * dpr)
    ctx.setTransform(k * dpr, 0, 0, k * dpr, 0, 0)
    FS.set(ctx, Math.min(1.45, Math.max(1, 0.8 / k))) // telefonda (~320 px genişlik) yazılar ~1,45 kat
    return true
  }
  host.append(cv); fit()
  if (typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(() => { if (!cv.isConnected) { ro.disconnect(); return } if (fit()) c.redraw() })
    ro.observe(cv)
  }
  return c
}
function controls(host: HTMLElement) { const c = el('div', { class: 'ctrl' }); host.append(c); return c }
interface Ctl<T> { v: T }
function slider(p: HTMLElement, label: string, min: number, max: number, step: number, val: number, fmt: (v: number) => string, on: () => void): Ctl<number> {
  const out = el('output', {}, fmt(val))
  const inp = el('input', { type: 'range', min: String(min), max: String(max), step: String(step), value: String(val), 'aria-label': label })
  const o = { v: +inp.value }
  inp.addEventListener('input', () => { o.v = +inp.value; out.textContent = fmt(o.v); on() })
  p.append(el('label', { class: 'sl' }, el('span', { class: 'sl-h' }, el('span', {}, label), out), inp))
  return o
}
function select(p: HTMLElement, label: string, opts: Array<[string, string]>, val: string, on: () => void): Ctl<string> {
  const s = el('select', { 'aria-label': label })
  for (const [v, t] of opts) s.append(el('option', { value: v }, t))
  s.value = val
  const o = { v: s.value }
  s.addEventListener('change', () => { o.v = s.value; on() })
  p.append(el('label', { class: 'sl' }, el('span', { class: 'sl-h' }, label), s))
  return o
}
function check(p: HTMLElement, label: string, val: boolean, on: () => void): Ctl<boolean> {
  const i = el('input', { type: 'checkbox' }); i.checked = val
  const o = { v: val }
  i.addEventListener('change', () => { o.v = i.checked; on() })
  p.append(el('label', { class: 'ck' }, i, label))
  return o
}
function button(p: HTMLElement, label: string, fn: () => void, cls = '') { const b = el('button', { class: `sbtn ${cls}`, type: 'button' }, label); b.addEventListener('click', fn); p.append(b); return b }
function readout(p: HTMLElement) { const r = el('div', { class: 'readout', 'aria-live': 'polite' }); p.append(r); return r }
function loop(fn: (dt: number) => void) {
  let alive = true, last = performance.now(), id = 0
  const f = (t: number) => { if (!alive) return; const dt = Math.min(0.05, Math.max(0, (t - last) / 1000)); last = t; fn(dt); id = requestAnimationFrame(f) }
  id = requestAnimationFrame(f)
  return () => { alive = false; cancelAnimationFrame(id) }
}
function txt(ctx: Ctx, s: string, x: number, y: number, col: string, size = 12, align: CanvasTextAlign = 'left', weight = 400) {
  ctx.fillStyle = col; ctx.font = `${weight} ${size * fs(ctx)}px ${FONT}`; ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.fillText(s, x, y)
}
function legend(ctx: Ctx, items: Array<[string, string]>, x: number, y: number, p: Pal) {
  ctx.font = `${12 * fs(ctx)}px ${FONT}`
  let cx = x
  y -= (fs(ctx) - 1) * 10 // büyütülmüş yazıda eksen etiketinden uzaklaş
  for (const [t, c] of items) { ctx.fillStyle = c; ctx.fillRect(cx, y - 5, 14, 3); ctx.fillStyle = p.ink; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText(t, cx + 18, y); cx += ctx.measureText(t).width + 28 }
}

interface Box { x: number; y: number; w: number; h: number }
interface Series { x: number[]; y: number[]; color: string; width?: number; dash?: number[] }
/** Eksenli çizgi grafiği: kutu, ızgara, eksen etiketleri ve seriler. */
function plot(ctx: Ctx, b: Box, xr: [number, number], yr: [number, number], series: Series[], p: Pal, xl: string, yl: string, fmtY: (v: number) => string = (v) => String(+v.toFixed(2))) {
  const X = (v: number) => b.x + (v - xr[0]) / (xr[1] - xr[0]) * b.w
  const Y = (v: number) => b.y + b.h - (v - yr[0]) / (yr[1] - yr[0]) * b.h
  ctx.fillStyle = p.bg; ctx.fillRect(b.x, b.y, b.w, b.h)
  ctx.strokeStyle = p.grid; ctx.lineWidth = 1; ctx.beginPath()
  for (let i = 0; i <= 4; i++) { const yy = b.y + i * b.h / 4 + 0.5; ctx.moveTo(b.x, yy); ctx.lineTo(b.x + b.w, yy) }
  for (let i = 0; i <= 5; i++) { const xx = b.x + i * b.w / 5 + 0.5; ctx.moveTo(xx, b.y); ctx.lineTo(xx, b.y + b.h) }
  ctx.stroke()
  ctx.strokeStyle = p.line; ctx.strokeRect(b.x + 0.5, b.y + 0.5, b.w, b.h)
  for (let i = 0; i <= 4; i++) txt(ctx, fmtY(yr[1] - i * (yr[1] - yr[0]) / 4), b.x - 6, b.y + i * b.h / 4 + 4, p.mute, 10, 'right')
  for (let i = 0; i <= 5; i++) txt(ctx, String(+(xr[0] + i * (xr[1] - xr[0]) / 5).toFixed(2)), b.x + i * b.w / 5, b.y + b.h + 14, p.mute, 10, 'center')
  txt(ctx, xl, b.x + b.w, b.y + b.h + 28, p.mute, 11, 'right')
  txt(ctx, yl, b.x, b.y - 6 + (fs(ctx) - 1) * 7, p.mute, 11, 'left') // büyük yazıda göstergeyle çakışmasın
  ctx.save(); ctx.beginPath(); ctx.rect(b.x, b.y, b.w, b.h); ctx.clip()
  for (const s of series) {
    ctx.strokeStyle = s.color; ctx.lineWidth = s.width ?? 2; ctx.setLineDash(s.dash ?? []); ctx.beginPath()
    const step = Math.max(1, Math.floor(s.x.length / (b.w * 2)))
    for (let i = 0; i < s.x.length; i += step) { const px = X(s.x[i]), py = Y(s.y[i]); if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py) }
    ctx.stroke(); ctx.setLineDash([])
  }
  ctx.restore()
  return { X, Y }
}
/** Yandan görünüşte küçük quad simgesi (açı rad, saat yönü +). */
function quadIcon(ctx: Ctx, x: number, y: number, ang: number, p: Pal, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s)
  ctx.fillStyle = p.ink; ctx.fillRect(-26, -2, 52, 4)
  ctx.fillStyle = p.a; ctx.fillRect(-8, -6, 16, 9)
  ctx.strokeStyle = p.mute; ctx.lineWidth = 2
  for (const sx of [-24, 24]) { ctx.fillStyle = p.ink; ctx.fillRect(sx - 3, -9, 6, 7); ctx.beginPath(); ctx.moveTo(sx - 14, -10); ctx.lineTo(sx + 14, -10); ctx.stroke() }
  ctx.restore()
}
const T = (lang: Lang) => (tr: string, en: string) => (lang === 'en' ? en : tr)

type Mount = (stage: HTMLElement, side: HTMLElement, cfg: Cfg, lang: Lang) => () => void

// ---------------------------------------------------------------- itki/ağırlık
const twr: Mount = (stage, side, cfg, lang) => {
  const t = T(lang), f1 = nf(lang, 1), f2 = nf(lang, 2)
  const cvs = canvas(stage, 640, 360), { ctx, W, H } = cvs
  cvs.redraw = () => draw() // boyut değişince yeniden çiz
  const c = controls(side)
  const presets: Record<string, [number, number, number]> = { fpv: [0.65, 4, 1300], x500: [1.6, 4, 1000], hexa: [4, 6, 2000], heavy: [1.4, 4, 450] }
  const pr = select(c, t('Hazır ayar', 'Preset'), [['fpv', t('5" FPV freestyle', '5" FPV freestyle')], ['x500', 'X500 (10")'], ['hexa', t('Altı rotorlu yük drone\'u', 'Hexacopter for payload')], ['heavy', t('Ağır ve zayıf', 'Heavy and weak')]], cfg.preset ?? 'x500', () => { const [m, n, th] = presets[pr.v]; set(m, n, th) })
  const host = el('div', { class: 'ctrl' }); c.append(host)
  let mass: Ctl<number>, motors: Ctl<string>, thr: Ctl<number>
  const fac = slider(c, t('İtki modeli THR_MDL_FAC', 'Thrust model THR_MDL_FAC'), 0, 1, 0.05, 0.3, f2, draw)
  const ro = readout(c)
  function set(m: number, n: number, th: number) {
    host.replaceChildren()
    mass = slider(host, t('Toplam kütle (kg)', 'Total mass (kg)'), 0.1, 6, 0.05, m, f2, draw)
    motors = select(host, t('Motor sayısı', 'Motors'), [['4', t('4 (quad)', '4 (quad)')], ['6', t('6 (hexa)', '6 (hexa)')], ['8', t('8 (okto)', '8 (octo)')]], String(n), draw)
    thr = slider(host, t('Motor başına azami itki (gf)', 'Max thrust per motor (gf)'), 100, 3000, 10, th, (v) => String(v), draw)
    draw()
  }
  function draw() {
    if (!mass) return
    const p = palette(stage)
    const r = thrustToWeight({ massKg: mass.v, motors: +motors.v, maxThrustG: thr.v, thrustModel: fac.v })
    ctx.fillStyle = p.bg; ctx.fillRect(0, 0, W, H)
    // sol: ağırlık ve itki çubukları
    const base = 320, top = 50, maxN = Math.max(r.weightN, r.maxThrustN) * 1.1, hh = (v: number) => (base - top) * v / maxN
    ctx.fillStyle = p.red; ctx.fillRect(50, base - hh(r.weightN), 60, hh(r.weightN))
    ctx.fillStyle = p.a; ctx.fillRect(140, base - hh(r.maxThrustN), 60, hh(r.maxThrustN))
    ctx.strokeStyle = p.ink; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(40, base - hh(r.weightN)); ctx.lineTo(210, base - hh(r.weightN)); ctx.stroke(); ctx.setLineDash([])
    txt(ctx, t('Ağırlık', 'Weight'), 80, base + 18, p.ink, 12, 'center'); txt(ctx, `${f1(r.weightN)} N`, 80, base - hh(r.weightN) - 6, p.ink, 12, 'center', 700)
    txt(ctx, t('Azami itki', 'Max thrust'), 170, base + 18, p.ink, 12, 'center'); txt(ctx, `${f1(r.maxThrustN)} N`, 170, base - hh(r.maxThrustN) - 6, p.ink, 12, 'center', 700)
    txt(ctx, `${t('İtki/ağırlık', 'Thrust/weight')} = ${f2(r.ratio)}`, 125, 30, r.ratio >= 2 ? p.green : r.ratio > 1.3 ? p.gold : p.red, 16, 'center', 700)
    // sağ: gaz → bağıl itki eğrisi ve askıda kalma noktası
    const xs: number[] = [], ys: number[] = []
    for (let i = 0; i <= 100; i++) { xs.push(i); ys.push(relThrust(i / 100, fac.v) * 100) }
    const { X, Y } = plot(ctx, { x: 290, y: 40, w: 320, h: 270 }, [0, 100], [0, 100], [{ x: xs, y: ys, color: p.sky, width: 2.5 }], p, t('gaz (%)', 'throttle (%)'), t('itki (% azami)', 'thrust (% of max)'), (v) => String(Math.round(v)))
    if (r.canHover) {
      const hx = X(r.hoverThrottle * 100), hy = Y(100 / r.ratio)
      ctx.strokeStyle = p.gold; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(X(0), hy); ctx.lineTo(hx, hy); ctx.lineTo(hx, Y(0)); ctx.stroke(); ctx.setLineDash([])
      ctx.fillStyle = p.gold; ctx.beginPath(); ctx.arc(hx, hy, 6, 0, 7); ctx.fill()
      txt(ctx, `${t('askıda', 'hover')} ${Math.round(r.hoverThrottle * 100)}%`, hx + 8, hy - 8, p.gold, 12, 'left', 700)
    } else txt(ctx, t('Kalkamaz: itki ağırlıktan az', 'Cannot take off: thrust below weight'), 450, 180, p.red, 14, 'center', 700)
    const use = r.ratio < 1.5 ? t('yetersiz: rüzgâr ve manevra payı yok', 'not enough: no margin for wind or manoeuvres') : r.ratio < 2 ? t('sınırda: yalnız sakin uçuş', 'marginal: calm flight only') : r.ratio < 4 ? t('taşıma, haritalama, kamera', 'payload, mapping, camera') : t('FPV, akrobasi, yarış', 'FPV, acrobatics, racing')
    ro.textContent = `${t('Ağırlık', 'Weight')}: ${f1(r.weightN)} N\n${t('Azami itki', 'Max thrust')}: ${f1(r.maxThrustN)} N\n${t('İtki/ağırlık', 'Thrust/weight')}: ${f2(r.ratio)} (${use})\n${t('Askıda motor başına', 'Hover per motor')}: ${Math.round(r.hoverPerMotorG)} gf\n${t('Askıda kalma gazı', 'Hover throttle')}: ${r.canHover ? Math.round(r.hoverThrottle * 100) + '%' : '–'}\n${t('Tam gazda dikey ivme', 'Vertical accel. at full throttle')}: ${f1(r.climbAccel)} m/s²`
  }
  const [m0, n0, t0] = presets[pr.v] ?? presets.x500
  set(m0, n0, t0)
  return () => {}
}

// ---------------------------------------------------------------- uçuş süresi
const flight: Mount = (stage, side, cfg, lang) => {
  const t = T(lang), f1 = nf(lang, 1), f2 = nf(lang, 2)
  const cvs = canvas(stage, 640, 380), { ctx, W, H } = cvs
  cvs.redraw = () => draw() // boyut değişince yeniden çiz
  const c = controls(side)
  const big = cfg.preset === 'fpv' ? false : true
  const dry = slider(c, t('Batarya hariç kütle (kg)', 'Mass without battery (kg)'), 0.2, 5, 0.05, big ? 1.1 : 0.5, f2, draw)
  const cells = select(c, t('Hücre sayısı (S)', 'Cell count (S)'), [1, 2, 3, 4, 6].map((n) => [String(n), `${n}S · ${(n * 3.7).toFixed(1)} V`] as [string, string]), big ? '4' : '6', draw)
  const mah = slider(c, t('Kapasite (mAh)', 'Capacity (mAh)'), 300, 12000, 50, big ? 5000 : 1300, (v) => String(v), draw)
  const cr = slider(c, t('C oranı', 'C rating'), 5, 150, 5, big ? 30 : 100, (v) => `${v}C`, draw)
  const prop = slider(c, t('Pervane çapı (inç)', 'Propeller diameter (in)'), 2, 18, 0.5, big ? 10 : 5, f1, draw)
  const thr = slider(c, t('Motor başına azami itki (gf)', 'Max thrust per motor (gf)'), 100, 4000, 10, big ? 1000 : 1300, (v) => String(v), draw)
  const fm = slider(c, t('Pervane başarım katsayısı FM', 'Propeller figure of merit FM'), 0.4, 0.8, 0.01, 0.65, f2, draw)
  const drv = slider(c, t('Motor × ESC verimi', 'Motor × ESC efficiency'), 0.5, 0.95, 0.01, 0.8, f2, draw)
  const res = slider(c, t('Kullanılan kapasite (yedek bırak)', 'Capacity used (keep a reserve)'), 0.5, 0.95, 0.05, 0.8, (v) => `${Math.round(v * 100)}%`, draw)
  const ro = readout(c)
  const input = (m: number): FlightInput => ({ dryKg: dry.v, cells: +cells.v, mAh: m, cRating: cr.v, propInch: prop.v, motors: 4, fm: fm.v, drive: drv.v, avionicsA: 0.6, usable: res.v, whPerKg: 140, maxThrustG: thr.v })
  function draw() {
    const p = palette(stage)
    ctx.fillStyle = p.bg; ctx.fillRect(0, 0, W, H)
    const r = flightTime(input(mah.v))
    const xs: number[] = [], ys: number[] = [], ws: number[] = []
    for (let m = 300; m <= 12000; m += 100) { const q = flightTime(input(m)); xs.push(m / 1000); ys.push(q.minutes); ws.push(q.totalKg) }
    const ymax = Math.max(8, Math.ceil(Math.max(...ys) / 8) * 8)   // 4 aralık → tam sayı etiketler
    const { X, Y } = plot(ctx, { x: 60, y: 40, w: 550, h: 280 }, [0, 12], [0, ymax], [{ x: xs, y: ys, color: p.a, width: 2.5 }], p, t('kapasite (Ah)', 'capacity (Ah)'), t('askıda uçuş süresi (dk)', 'hover flight time (min)'), (v) => String(Math.round(v)))
    const px = X(mah.v / 1000), py = Y(r.minutes)
    ctx.fillStyle = p.gold; ctx.beginPath(); ctx.arc(px, py, 6, 0, 7); ctx.fill()
    txt(ctx, `${f1(r.minutes)} ${t('dk', 'min')} · ${f2(r.totalKg)} kg`, px + 10, py - 10, p.gold, 12, 'left', 700)
    legend(ctx, [[t('uçuş süresi (batarya kütlesi dahil)', 'flight time (battery mass included)'), p.a]], 60, 18, p)
    if (!r.peakOk) txt(ctx, t('Uyarı: tam gaz akımı bataryanın C sınırını aşıyor', 'Warning: full-throttle current exceeds the battery C limit'), 610, 64, p.red, 12, 'right', 700)
    ro.textContent = `${t('Batarya kütlesi', 'Battery mass')}: ${Math.round(r.batteryKg * 1000)} g (${t('140 Wh/kg varsayımı', 'assuming 140 Wh/kg')})\n${t('Toplam kütle', 'Total mass')}: ${f2(r.totalKg)} kg\n${t('Enerji', 'Energy')}: ${f1(r.energyWh)} Wh\n${t('Askıda güç', 'Hover power')}: ${Math.round(r.hoverW)} W\n${t('Askıda akım', 'Hover current')}: ${f1(r.hoverA)} A\n${t('Uçuş süresi', 'Flight time')}: ${f1(r.minutes)} ${t('dk', 'min')}\n${t('Tam gaz akımı (kaba)', 'Full-throttle current (rough)')}: ${Math.round(r.peakA)} A\n${t('Batarya sınırı C × Ah', 'Battery limit C × Ah')}: ${Math.round(r.batteryMaxA)} A ${r.peakOk ? '✓' : '✗'}`
  }
  draw()
  return () => {}
}

// ---------------------------------------------------------------- irtifa PID
const alt: Mount = (stage, side, _cfg, lang) => {
  const t = T(lang), f1 = nf(lang, 1), f2 = nf(lang, 2)
  const { ctx, W, H } = canvas(stage, 640, 400)
  const c = controls(side)
  const kp = slider(c, 'Kp (N/m)', 0, 30, 0.5, ALT_DEFAULTS.kp, f1, run)
  const ki = slider(c, 'Ki (N/(m·s))', 0, 10, 0.1, ALT_DEFAULTS.ki, f1, run)
  const kd = slider(c, 'Kd (N·s/m)', 0, 12, 0.1, ALT_DEFAULTS.kd, f1, run)
  const pl = slider(c, t('Bilinmeyen ek yük (kg)', 'Unknown payload (kg)'), 0, 0.6, 0.05, 0, f2, run)
  const st = slider(c, t('Basamak (m)', 'Step (m)'), 0.5, 5, 0.5, 2, f1, run)
  const ro = readout(c)
  let res = simulateAltitude(ALT_DEFAULTS), play = 0
  function run() {
    res = simulateAltitude({ ...ALT_DEFAULTS, kp: kp.v, ki: ki.v, kd: kd.v, payloadKg: pl.v, step: st.v })
    play = 0
    const m = res.metrics
    ro.textContent = `${t('Aşım', 'Overshoot')}: ${f1(m.overshootPct)}%\n${t('Yükselme süresi (%10→%90)', 'Rise time (10→90%)')}: ${Number.isFinite(m.riseTime) ? f2(m.riseTime) + ' s' : '–'}\n${t('Oturma süresi (±%2)', 'Settling time (±2%)')}: ${Number.isFinite(m.settlingTime) ? f2(m.settlingTime) + ' s' : t('oturmadı', 'not settled')}\n${t('Kalıcı hata', 'Steady-state error')}: ${Math.round(m.steadyError * 100)} cm\n${t('İtki doyumda', 'Thrust saturated')}: ${f1(res.saturatedPct)}%`
  }
  run()
  return loop((dt) => {
    play = (play + dt) % (ALT_DEFAULTS.duration + 1.5)
    const p = palette(stage)
    ctx.fillStyle = p.bg; ctx.fillRect(0, 0, W, H)
    const zmax = Math.max(st.v * 1.6, ...res.z) * 1.05
    const band = st.v * 0.02
    const { X, Y } = plot(ctx, { x: 160, y: 40, w: 460, h: 220 }, [0, ALT_DEFAULTS.duration], [0, zmax], [
      { x: res.t, y: res.sp, color: p.ink, width: 1.5, dash: [5, 4] },
      { x: res.t, y: res.z, color: p.a, width: 2.5 },
    ], p, 't (s)', t('irtifa z (m)', 'altitude z (m)'))
    ctx.fillStyle = p.gold; ctx.globalAlpha = 0.15; ctx.fillRect(X(ALT_DEFAULTS.stepAt), Y(st.v + band), X(ALT_DEFAULTS.duration) - X(ALT_DEFAULTS.stepAt), Y(st.v - band) - Y(st.v + band)); ctx.globalAlpha = 1
    // itki alt grafiği (askıda itkiye göre)
    const hov = ALT_DEFAULTS.massKg * 9.81
    plot(ctx, { x: 160, y: 300, w: 460, h: 60 }, [0, ALT_DEFAULTS.duration], [0, 2], [{ x: res.t, y: res.thrust.map((v) => v / hov), color: p.gold, width: 1.8 }], p, '', t('itki / askıda itki', 'thrust / hover thrust'))
    // canlandırma: soldaki drone
    const k = Math.min(res.t.length - 1, Math.floor(play / ALT_DEFAULTS.dt))
    const yy = 260 - (res.z[k] / zmax) * 220
    ctx.strokeStyle = p.line; ctx.beginPath(); ctx.moveTo(30, 262); ctx.lineTo(120, 262); ctx.stroke()
    ctx.strokeStyle = p.ink; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(30, 260 - st.v / zmax * 220); ctx.lineTo(120, 260 - st.v / zmax * 220); ctx.stroke(); ctx.setLineDash([])
    quadIcon(ctx, 75, yy - 6, 0, p)
    txt(ctx, `z = ${f2(res.z[k])} m`, 75, 290, p.ink, 12, 'center', 700)
    ctx.strokeStyle = p.mute; ctx.beginPath(); ctx.moveTo(X(res.t[k]), 40); ctx.lineTo(X(res.t[k]), 260); ctx.stroke()
    legend(ctx, [[t('hedef', 'setpoint'), p.ink], [t('irtifa', 'altitude'), p.a], [t('±%2 bandı', '±2% band'), p.gold]], 160, 18, p)
  })
}

// ---------------------------------------------------------------- roll kaskad PID
const roll: Mount = (stage, side, _cfg, lang) => {
  const t = T(lang), f1 = nf(lang, 1), f2 = nf(lang, 2), f3 = nf(lang, 3)
  const { ctx, W, H } = canvas(stage, 640, 400)
  const c = controls(side)
  const ap = slider(c, t('Açı P (1/s)', 'Angle P (1/s)'), 0, 20, 0.5, ROLL_DEFAULTS.angleP, f1, run)
  const rp = slider(c, t('Hız P (N·m·s/rad)', 'Rate P (N·m·s/rad)'), 0, 0.6, 0.01, ROLL_DEFAULTS.rateP, f2, run)
  const ri = slider(c, t('Hız I (N·m/rad)', 'Rate I (N·m/rad)'), 0, 1.5, 0.05, ROLL_DEFAULTS.rateI, f2, run)
  const rd = slider(c, t('Hız D (N·m·s²/rad)', 'Rate D (N·m·s²/rad)'), 0, 0.02, 0.0005, ROLL_DEFAULTS.rateD, f3, run)
  const nz = slider(c, t('Jiroskop gürültüsü σ (°/s)', 'Gyro noise σ (°/s)'), 0, 6, 0.1, ROLL_DEFAULTS.gyroNoiseDps, f1, run)
  const fc = slider(c, t('D süzgeci kesimi (Hz)', 'D filter cutoff (Hz)'), 5, 200, 5, ROLL_DEFAULTS.dCutoffHz, (v) => String(v), run)
  const ds = slider(c, t('Bozucu tork, t ≥ 1,5 s (N·m)', 'Disturbance torque, t ≥ 1.5 s (N·m)'), 0, 0.1, 0.005, 0, f3, run)
  const ro = readout(c)
  let res = simulateRoll(ROLL_DEFAULTS), play = 0
  function run() {
    res = simulateRoll({ ...ROLL_DEFAULTS, angleP: ap.v, rateP: rp.v, rateI: ri.v, rateD: rd.v, gyroNoiseDps: nz.v, dCutoffHz: fc.v, disturbance: ds.v })
    play = 0
    const m = res.metrics
    ro.textContent = `${t('Aşım', 'Overshoot')}: ${f1(m.overshootPct)}%\n${t('Yükselme süresi', 'Rise time')}: ${Number.isFinite(m.riseTime) ? Math.round(m.riseTime * 1000) + ' ms' : '–'}\n${t('Oturma süresi (±%5)', 'Settling time (±5%)')}: ${Number.isFinite(m.settlingTime) ? Math.round(m.settlingTime * 1000) + ' ms' : t('oturmadı', 'not settled')}\n${t('Son açı hatası', 'Final angle error')}: ${f2(m.steadyError)}°\n${t('Tork komutu gürültüsü', 'Torque command noise')}: ${f3(res.torqueNoise)} N·m${res.torqueNoise > 0.03 ? t(' (motorlar ısınır!)', ' (motors get hot!)') : ''}`
  }
  run()
  return loop((dt) => {
    play = (play + dt * 0.5) % (ROLL_DEFAULTS.duration + 0.5)
    const p = palette(stage)
    ctx.fillStyle = p.bg; ctx.fillRect(0, 0, W, H)
    const amax = Math.max(30, ...res.angle.map(Math.abs)) * 1.1
    const { X } = plot(ctx, { x: 160, y: 40, w: 460, h: 200 }, [0, ROLL_DEFAULTS.duration], [-amax * 0.3, amax], [
      { x: res.t, y: res.sp, color: p.ink, width: 1.5, dash: [5, 4] },
      { x: res.t, y: res.angle, color: p.a, width: 2.5 },
    ], p, 't (s)', t('yatış açısı (°)', 'roll angle (°)'), (v) => String(Math.round(v)))
    plot(ctx, { x: 160, y: 280, w: 460, h: 80 }, [0, ROLL_DEFAULTS.duration], [-ROLL_DEFAULTS.torqueMax, ROLL_DEFAULTS.torqueMax], [{ x: res.t, y: res.torque, color: p.red, width: 1 }], p, '', t('tork komutu (N·m)', 'torque command (N·m)'))
    const k = Math.min(res.t.length - 1, Math.floor(play / ROLL_DEFAULTS.dt))
    quadIcon(ctx, 75, 150, res.angle[k] * DEG, p, 1.3)
    txt(ctx, `${f1(res.angle[k])}°`, 75, 200, p.ink, 13, 'center', 700)
    txt(ctx, t('arkadan görünüş', 'rear view'), 75, 220, p.mute, 11, 'center')
    ctx.strokeStyle = p.mute; ctx.beginPath(); ctx.moveTo(X(res.t[k]), 40); ctx.lineTo(X(res.t[k]), 240); ctx.stroke()
    legend(ctx, [[t('hedef', 'setpoint'), p.ink], [t('açı', 'angle'), p.a], [t('tork', 'torque'), p.red]], 160, 18, p)
  })
}

// ---------------------------------------------------------------- karıştırıcı
const mixer: Mount = (stage, side, _cfg, lang) => {
  const t = T(lang), f2 = nf(lang, 2)
  const cvs = canvas(stage, 640, 400), { ctx, W, H } = cvs
  cvs.redraw = () => draw() // boyut değişince yeniden çiz
  const c = controls(side)
  const th = slider(c, t('Gaz (0…1)', 'Throttle (0…1)'), 0, 1, 0.01, 0.5, f2, draw)
  const rl = slider(c, t('Yuvarlanma (roll, + sağa)', 'Roll (+ right)'), -0.6, 0.6, 0.01, 0, f2, draw)
  const pt = slider(c, t('Yunuslama (pitch, + burun yukarı)', 'Pitch (+ nose up)'), -0.6, 0.6, 0.01, 0, f2, draw)
  const yw = slider(c, t('Sapma (yaw, + saat yönü)', 'Yaw (+ clockwise)'), -0.6, 0.6, 0.01, 0, f2, draw)
  const am = check(c, t('Airmode (sıfır gazda da denetim)', 'Airmode (control at zero throttle)'), true, draw)
  const ro = readout(c)
  function draw() {
    const p = palette(stage)
    const r = mixQuadX({ thrust: th.v, roll: rl.v, pitch: pt.v, yaw: yw.v }, am.v)
    ctx.fillStyle = p.bg; ctx.fillRect(0, 0, W, H)
    // üstten görünüş: burun yukarıda; x ileri → ekranda yukarı, y sol → ekranda sola
    const cx = 210, cy = 205, arm = 115
    const sp = (m: (typeof QUAD_X)[number]) => ({ x: cx - m.y * arm * 0.707, y: cy - m.x * arm * 0.707 })
    ctx.strokeStyle = p.ink; ctx.lineWidth = 8; ctx.lineCap = 'round'
    ctx.beginPath(); ctx.moveTo(sp(QUAD_X[0]).x, sp(QUAD_X[0]).y); ctx.lineTo(sp(QUAD_X[1]).x, sp(QUAD_X[1]).y); ctx.moveTo(sp(QUAD_X[2]).x, sp(QUAD_X[2]).y); ctx.lineTo(sp(QUAD_X[3]).x, sp(QUAD_X[3]).y); ctx.stroke()
    ctx.lineCap = 'butt'; ctx.lineWidth = 1
    ctx.fillStyle = p.a; ctx.beginPath(); ctx.moveTo(cx, cy - 34); ctx.lineTo(cx + 18, cy + 14); ctx.lineTo(cx - 18, cy + 14); ctx.closePath(); ctx.fill()
    txt(ctx, t('burun', 'nose'), cx, cy - 44, p.mute, 11, 'center')
    QUAD_X.forEach((m, i) => {
      const q = sp(m), u = r.motors[i]
      ctx.globalAlpha = 0.15 + 0.75 * u; ctx.fillStyle = u >= 0.999 || u <= 0.001 ? p.red : p.gold
      ctx.beginPath(); ctx.arc(q.x, q.y, 44, 0, 7); ctx.fill(); ctx.globalAlpha = 1
      ctx.strokeStyle = p.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(q.x, q.y, 44, 0, 7); ctx.stroke()
      // dönüş yönü oku (üstten bakış: cw saat yönü)
      const cw = m.spin === 'cw'
      ctx.strokeStyle = p.sky; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(q.x, q.y, 34, -2.4, -0.7, !cw ? true : false); ctx.stroke()
      const ea = cw ? -0.7 : -2.4, ex = q.x + 34 * Math.cos(ea), ey = q.y + 34 * Math.sin(ea), dir = cw ? 1 : -1
      ctx.fillStyle = p.sky; ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex - 8 * dir, ey - 6); ctx.lineTo(ex - 2 * dir, ey + 8); ctx.closePath(); ctx.fill()
      txt(ctx, m.id, q.x, q.y - 2, p.ink, 15, 'center', 800)
      txt(ctx, `${Math.round(u * 100)}% · ${cw ? 'CW' : 'CCW'}`, q.x, q.y + 16, p.ink, Math.min(11, 12.5 / fs(ctx)), 'center', 600) // daire içine sığsın: büyütme sınırlı
    })
    // sağ: çubuklar ve ESC değerleri
    const bx = 420, bw = 36, bh = 230, by = 60
    QUAD_X.forEach((m, i) => {
      const x = bx + i * 52, u = r.motors[i]
      ctx.strokeStyle = p.line; ctx.strokeRect(x + 0.5, by + 0.5, bw, bh)
      ctx.fillStyle = u >= 0.999 || u <= 0.001 ? p.red : p.a; ctx.fillRect(x, by + bh * (1 - u), bw, bh * u)
      txt(ctx, m.id, x + bw / 2, by + bh + 18, p.ink, 12, 'center', 700)
      txt(ctx, `${Math.round(1000 + 1000 * u)}`, x + bw / 2, by + bh + 36, p.mute, 10, 'center')
      txt(ctx, `${Math.round(48 + 1999 * u)}`, x + bw / 2, by + bh + 54, p.mute, 10, 'center')
    })
    txt(ctx, t('PWM µs', 'PWM µs'), bx - 6, by + bh + 36, p.mute, 10, 'right')
    txt(ctx, 'DShot', bx - 6, by + bh + 54, p.mute, 10, 'right')
    txt(ctx, t('motor çıkışı', 'motor output'), bx, by - 12, p.mute, 11)
    const flags = [r.rpScaled ? t('yuvarlanma/yunuslama ölçeklendi', 'roll/pitch scaled down') : '', r.yawScale < 0.999 ? `${t('sapma kısıldı', 'yaw reduced')} → ${Math.round(r.yawScale * 100)}%` : '', Math.abs(r.thrustShift) > 1e-6 ? `${t('gaz kaydırıldı', 'throttle shifted')} ${r.thrustShift > 0 ? '+' : ''}${f2(r.thrustShift)}` : ''].filter(Boolean)
    ro.textContent = `M1..M4: ${r.motors.map((v) => Math.round(v * 100) + '%').join(' · ')}\n${t('Toplam (itki ∝ toplam)', 'Sum (thrust ∝ sum)')}: ${f2(r.motors.reduce((a, b) => a + b, 0))}\n${flags.length ? flags.join('\n') : t('Doyum yok: tüm komutlar uygulandı', 'No saturation: all commands applied')}`
  }
  draw()
  return () => {}
}

// ---------------------------------------------------------------- tamamlayıcı süzgeç
const fusion: Mount = (stage, side, _cfg, lang) => {
  const t = T(lang), f1 = nf(lang, 1), f2 = nf(lang, 2)
  const cvs = canvas(stage, 640, 380), { ctx, W, H } = cvs
  cvs.redraw = () => draw() // boyut değişince yeniden çiz
  const c = controls(side)
  const tau = slider(c, t('Süzgeç zaman sabiti τ (s)', 'Filter time constant τ (s)'), 0.02, 5, 0.02, FUSION_DEFAULTS.tau, f2, run)
  const bias = slider(c, t('Jiroskop sapması (°/s)', 'Gyro bias (°/s)'), -5, 5, 0.1, FUSION_DEFAULTS.gyroBiasDps, f1, run)
  const gn = slider(c, t('Jiroskop gürültüsü σ (°/s)', 'Gyro noise σ (°/s)'), 0, 5, 0.1, FUSION_DEFAULTS.gyroNoiseDps, f1, run)
  const an = slider(c, t('İvmeölçer açı gürültüsü σ (°)', 'Accelerometer angle noise σ (°)'), 0, 15, 0.5, FUSION_DEFAULTS.accNoiseDeg, f1, run)
  const pr = select(c, t('Hareket', 'Motion'), [['manoeuvre', t('Yatış manevraları', 'Roll manoeuvres')], ['still', t('Yerde sabit (0°)', 'Still on the ground (0°)')]], 'manoeuvre', run)
  const sg = check(c, t('Yalnız jiroskop', 'Gyro only'), true, draw), sa = check(c, t('Yalnız ivmeölçer', 'Accelerometer only'), true, draw)
  const ro = readout(c)
  let res = simulateFusion(FUSION_DEFAULTS)
  function run() {
    res = simulateFusion({ ...FUSION_DEFAULTS, tau: tau.v, gyroBiasDps: bias.v, gyroNoiseDps: gn.v, accNoiseDeg: an.v, profile: pr.v as 'still' | 'manoeuvre' })
    const a = tau.v / (tau.v + FUSION_DEFAULTS.dt)
    ro.textContent = `${t('Hata (RMSE, °)', 'Error (RMSE, °)')}\n${t('Yalnız jiroskop', 'Gyro only')}: ${f2(res.rmse.gyro)}\n${t('Yalnız ivmeölçer', 'Accelerometer only')}: ${f2(res.rmse.acc)}\n${t('Tamamlayıcı', 'Complementary')}: ${f2(res.rmse.fused)}\nα = τ/(τ+dt) = ${a.toFixed(4)} (250 Hz)\n${t('Sapmadan kalıcı hata ≈ sapma × τ', 'Steady error from bias ≈ bias × τ')} = ${f2(bias.v * tau.v)}°`
    draw()
  }
  function draw() {
    const p = palette(stage)
    ctx.fillStyle = p.bg; ctx.fillRect(0, 0, W, H)
    const s: Series[] = []
    if (sa.v) s.push({ x: res.t, y: res.acc, color: p.mute, width: 1 })
    if (sg.v) s.push({ x: res.t, y: res.gyro, color: p.sky, width: 2 })
    s.push({ x: res.t, y: res.truth, color: p.ink, width: 1.5, dash: [5, 4] }, { x: res.t, y: res.fused, color: p.red, width: 2.2 })
    plot(ctx, { x: 60, y: 40, w: 550, h: 290 }, [0, FUSION_DEFAULTS.duration], [-40, 50], s, p, 't (s)', t('yatış açısı (°)', 'roll angle (°)'), (v) => String(Math.round(v)))
    legend(ctx, [[t('gerçek', 'true'), p.ink], [t('jiroskop', 'gyro'), p.sky], [t('ivmeölçer', 'accelerometer'), p.mute], [t('tamamlayıcı', 'complementary'), p.red]], 60, 18, p)
  }
  run()
  return () => {}
}

// ---------------------------------------------------------------- ara nokta görevi
const mission: Mount = (stage, side, cfg, lang) => {
  const t = T(lang), f1 = nf(lang, 1), f2 = nf(lang, 2)
  const { cv, ctx, W, H, pos } = canvas(stage, 640, 420)
  const c = controls(side)
  const land = select(c, t('İnişte konum kaynağı', 'Position source for landing'), [['vision', t('ArUco kamerası (hassas iniş)', 'ArUco camera (precision landing)')], ['gps', t('Yalnız GPS', 'GPS only')]], cfg.landing ?? 'vision', reset)
  const gps = slider(c, t('GPS hatası σ (m)', 'GPS error σ (m)'), 0, 4, 0.1, MISSION_DEFAULTS.gpsSigma, f1, reset)
  const wind = slider(c, t('Doğu rüzgârı (m/s)', 'East wind (m/s)'), -8, 8, 0.5, 0, f1, reset)
  const cruise = slider(c, t('Seyir hızı (m/s)', 'Cruise speed (m/s)'), 1, 12, 0.5, MISSION_DEFAULTS.cruise, f1, reset)
  const kp = slider(c, t('Konum P (1/s)', 'Position P (1/s)'), 0.2, 3, 0.1, MISSION_DEFAULTS.posP, f1, reset)
  const speed = slider(c, t('Oynatma hızı', 'Playback speed'), 1, 10, 1, 4, (v) => `${v}×`, () => {})
  const row = el('div', { class: 'row' }); c.append(row)
  button(row, t('Yeniden başlat', 'Restart'), reset)
  button(row, t('Ara noktaları sil', 'Clear waypoints'), () => { wps = []; reset() }, 'ghost')
  button(row, t('Varsayılan rota', 'Default route'), () => { wps = MISSION_DEFAULTS.waypoints.map((w) => ({ ...w })); reset() }, 'ghost')
  const ro = readout(c)
  let wps: Vec[] = MISSION_DEFAULTS.waypoints.map((w) => ({ ...w }))
  let seed = MISSION_DEFAULTS.seed
  let prm: MissionParams, st = missionInit(MISSION_DEFAULTS), r = rng(seed), acc = 0
  const S = 5, ox = W / 2 - 40, oy = H / 2 + 120   // 1 m = 5 px; ev noktası
  const toPx = (v: Vec) => ({ x: ox + v.x * S, y: oy - v.y * S })
  function reset() {
    seed++
    prm = { ...MISSION_DEFAULTS, waypoints: wps.length ? wps : [{ x: 0, y: 0 }], landing: land.v as 'gps' | 'vision', gpsSigma: gps.v, wind: { x: wind.v, y: 0 }, cruise: cruise.v, posP: kp.v, seed }
    st = missionInit(prm); r = rng(seed); acc = 0
  }
  const onClick = (e: MouseEvent) => { const q = pos(e); wps.push({ x: (q.x - ox) / S, y: (oy - q.y) / S }); reset() }
  cv.addEventListener('click', onClick)
  reset()
  const DT = 0.02
  const stop = loop((dt) => {
    acc += dt * speed.v
    while (acc >= DT) { acc -= DT; missionStep(st, prm, DT, r); if (st.trail.length === 0 || Math.hypot(st.pos.x - st.trail[st.trail.length - 1].x, st.pos.y - st.trail[st.trail.length - 1].y) > 0.5) st.trail.push({ ...st.pos }) }
    const p = palette(stage)
    ctx.fillStyle = p.bg; ctx.fillRect(0, 0, W, H)
    ctx.strokeStyle = p.grid; ctx.lineWidth = 1; ctx.beginPath()
    for (let x = ox % 50; x < W; x += 50) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, H) }
    for (let y = oy % 50; y < H; y += 50) { ctx.moveTo(0, y + 0.5); ctx.lineTo(W, y + 0.5) }
    ctx.stroke()
    txt(ctx, t('ızgara 10 m', 'grid 10 m'), W - 10, H - 10, p.mute, 11, 'right')
    // rota
    const h = toPx({ x: 0, y: 0 })
    ctx.strokeStyle = p.line; ctx.setLineDash([6, 5]); ctx.beginPath(); ctx.moveTo(h.x, h.y); prm.waypoints.forEach((w) => { const q = toPx(w); ctx.lineTo(q.x, q.y) }); ctx.stroke(); ctx.setLineDash([])
    ctx.fillStyle = p.green; ctx.fillRect(h.x - 6, h.y - 6, 12, 12); txt(ctx, t('EV', 'HOME'), h.x, h.y + 20, p.green, 11, 'center', 700)
    prm.waypoints.forEach((w, i) => {
      const q = toPx(w), last = i === prm.waypoints.length - 1
      if (last) {
        ctx.fillStyle = p.ink; ctx.fillRect(q.x - 10, q.y - 10, 20, 20); ctx.fillStyle = p.bg; ctx.fillRect(q.x - 6, q.y - 6, 5, 5); ctx.fillRect(q.x + 1, q.y + 1, 5, 5)
        ctx.strokeStyle = p.sky; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.arc(q.x, q.y, 4 * S, 0, 7); ctx.stroke(); ctx.setLineDash([])
        txt(ctx, t('PED (ArUco)', 'PAD (ArUco)'), q.x, q.y + 26, p.ink, 11, 'center', 700)
      } else {
        ctx.strokeStyle = i < st.wp ? p.green : p.gold; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(q.x, q.y, prm.accept * S + 3, 0, 7); ctx.stroke(); ctx.lineWidth = 1
        txt(ctx, `WP${i + 1}`, q.x + 10, q.y - 8, p.ink, 11, 'left', 700)
      }
    })
    // iz, gerçek konum ve kestirim
    ctx.strokeStyle = p.a; ctx.lineWidth = 2; ctx.beginPath(); st.trail.forEach((v, i) => { const q = toPx(v); if (i) ctx.lineTo(q.x, q.y); else ctx.moveTo(q.x, q.y) }); ctx.stroke(); ctx.lineWidth = 1
    const e = toPx(st.est), d = toPx(st.pos)
    ctx.strokeStyle = st.usingVision ? p.sky : p.red; ctx.beginPath(); ctx.arc(e.x, e.y, 7, 0, 7); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(e.x - 10, e.y); ctx.lineTo(e.x + 10, e.y); ctx.moveTo(e.x, e.y - 10); ctx.lineTo(e.x, e.y + 10); ctx.stroke()
    const sc = 0.6 + 0.4 * st.z / prm.alt
    ctx.save(); ctx.translate(d.x, d.y); ctx.scale(sc, sc)
    ctx.strokeStyle = p.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-10, -10); ctx.lineTo(10, 10); ctx.moveTo(10, -10); ctx.lineTo(-10, 10); ctx.stroke()
    ctx.fillStyle = p.a; for (const [a, b] of [[-10, -10], [10, 10], [10, -10], [-10, 10]]) { ctx.beginPath(); ctx.arc(a, b, 5, 0, 7); ctx.fill() }
    ctx.restore()
    // irtifa çubuğu
    ctx.strokeStyle = p.line; ctx.strokeRect(20.5, 60.5, 14, 200)
    ctx.fillStyle = p.sky; const zh = 200 * st.z / (prm.alt * 1.2); ctx.fillRect(21, 260 - zh, 13, zh)
    txt(ctx, `${f1(st.z)} m`, 27, 278, p.ink, 11, 'center', 700); txt(ctx, 'z', 27, 52, p.mute, 11, 'center')
    legend(ctx, [[t('iz (gerçek)', 'trail (true)'), p.a], [t('GPS kestirimi', 'GPS estimate'), p.red], [t('kamera kestirimi', 'camera estimate'), p.sky]], 50, 20, p)
    const phase = { takeoff: t('KALKIŞ', 'TAKEOFF'), route: `${t('ROTA', 'ROUTE')} → WP${st.wp + 1}`, land: st.usingVision ? t('İNİŞ (kamera)', 'LANDING (camera)') : t('İNİŞ (GPS)', 'LANDING (GPS)'), done: t('BİTTİ', 'DONE') }[st.phase]
    ro.textContent = `${t('Durum', 'State')}: ${phase}\n${t('Süre', 'Time')}: ${f1(st.t)} s\n${t('Hız', 'Speed')}: ${f1(Math.hypot(st.vel.x, st.vel.y))} m/s\n${t('Kestirim hatası', 'Estimate error')}: ${f2(Math.hypot(st.est.x - st.pos.x, st.est.y - st.pos.y))} m${st.landingError !== null ? `\n${t('İniş hatası (pede uzaklık)', 'Landing error (distance to pad)')}: ${Math.round(st.landingError * 100)} cm` : ''}\n${t('Haritaya tıkla: ara nokta ekle', 'Click the map: add a waypoint')}`
  })
  return () => { stop(); cv.removeEventListener('click', onClick) }
}

export const DRONE_SIMS: Record<DroneSimId, Mount> = { twr, flight, alt, roll, mixer, fusion, mission }

export function mountDroneSim(id: DroneSimId, stage: HTMLElement, side: HTMLElement, cfg: Cfg, lang: Lang): () => void {
  return DRONE_SIMS[id](stage, side, cfg, lang)
}
