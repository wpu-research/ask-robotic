// Ders: önbellek sahnesi. Solda 8×5 karoluk harita ve robotun yolu (önbellekteki karolar renkli); sağda yuvalar (en yeniden
// en eskiye), gelen istek (isabet yeşil, ıska turuncu), ortalama gecikme ve boyuta göre isabet oranı eğrisi.
import { alpha, clear, dot, text, type Draw } from '../draw'
import { COLS, ROWS, avgMs, tileName, type CacheFrame } from '@/lib/ml/onbellek'

const C = 40, MX = 16, MY = 44

export const draw: Draw = (ctx, W, H, f0, p, lang) => {
  const f = f0 as CacheFrame
  const tr = lang === 'tr'
  clear(ctx, W, H, p)
  const ok = p.groups[3], miss = p.groups[5]
  const inCache = new Set(f.slots)
  const cur = f.t >= 0 ? f.req[f.t] : -1
  // harita
  text(ctx, tr ? 'depo haritası (8×5 karo)' : 'warehouse map (8×5 tiles)', MX, 28, p.muted, 11, 'left', 600)
  for (let id = 0; id < COLS * ROWS; id++) {
    const x = MX + (id % COLS) * C, y = MY + Math.floor(id / COLS) * C
    ctx.fillStyle = inCache.has(id) ? alpha(p.brand, 0.22) : p.soft
    ctx.fillRect(x + 1, y + 1, C - 2, C - 2)
    text(ctx, tileName(id), x + 5, y + 13, p.muted, 9, 'left', 500)
  }
  // yol (son 25 adım), robot
  const from = Math.max(0, f.t - 25)
  const ctr = (id: number) => [MX + (id % COLS) * C + C / 2, MY + Math.floor(id / COLS) * C + C / 2]
  if (f.t < 0) {
    ctx.strokeStyle = alpha(p.ink, 0.35); ctx.lineWidth = 1.2; ctx.beginPath()
    f.req.forEach((id, i) => { const [x, y] = ctr(id); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y) }); ctx.stroke()
  } else {
    ctx.strokeStyle = alpha(p.ink, 0.5); ctx.lineWidth = 2; ctx.beginPath()
    for (let i = from; i <= f.t; i++) { const [x, y] = ctr(f.req[i]); if (i > from) ctx.lineTo(x, y); else ctx.moveTo(x, y) }
    ctx.stroke()
  }
  if (cur >= 0) {
    const x = MX + (cur % COLS) * C, y = MY + Math.floor(cur / COLS) * C
    ctx.strokeStyle = f.hit === undefined ? p.ink : f.hit ? ok : miss; ctx.lineWidth = 3; ctx.strokeRect(x + 2, y + 2, C - 4, C - 4)
    const [cx, cy] = ctr(cur); dot(ctx, cx, cy + 3, 7, p.ink); dot(ctx, cx, cy + 3, 3, p.bg)
  }
  // yuvalar
  const SX = 372, SW = 50, SG = 6
  text(ctx, tr ? `önbellek: ${f.size} yuva (en yeni → en eski)` : `cache: ${f.size} slots (newest → oldest)`, SX, 28, p.muted, 11, 'left', 600)
  for (let k = 0; k < f.size; k++) {
    const x = SX + (k % 6) * (SW + SG), y = MY + Math.floor(k / 6) * 48
    const id = f.slots[k]
    const isCur = id !== undefined && id === cur && f.hit !== undefined
    ctx.fillStyle = id === undefined ? p.bg : isCur ? alpha(f.hit ? ok : miss, 0.3) : alpha(p.brand, 0.14)
    ctx.strokeStyle = isCur ? (f.hit ? ok : miss) : p.line; ctx.lineWidth = isCur ? 2.5 : 1
    ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, SW, 40, 6); else ctx.rect(x, y, SW, 40); ctx.fill(); ctx.stroke()
    if (id !== undefined) text(ctx, tileName(id), x + SW / 2, y + 26, p.ink, 14, 'center', 700)
  }
  // istek sonucu
  const ry = MY + 2 * 48 + 14
  if (cur >= 0) {
    const s = f.hit === undefined ? (tr ? `istek: ${tileName(cur)} ?` : `request: ${tileName(cur)} ?`)
      : f.hit ? (tr ? `istek: ${tileName(cur)} → isabet, 2 ms` : `request: ${tileName(cur)} → hit, 2 ms`)
        : (tr ? `istek: ${tileName(cur)} → ıska, 80 ms` : `request: ${tileName(cur)} → miss, 80 ms`)
    text(ctx, s, SX, ry, f.hit === undefined ? p.ink : f.hit ? ok : miss, 15, 'left', 700)
    if (f.evicted !== undefined) {
      const s2 = tr ? `atıldı: ${tileName(f.evicted)} (en eski)` : `evicted: ${tileName(f.evicted)} (oldest)`
      text(ctx, s2, SX, ry + 22, p.muted, 12, 'left', 600)
      ctx.font = `600 12px Poppins, system-ui, sans-serif`
      const w = ctx.measureText(tileName(f.evicted)).width, x0 = SX + ctx.measureText(tr ? 'atıldı: ' : 'evicted: ').width
      ctx.strokeStyle = p.groups[0]; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0, ry + 18); ctx.lineTo(x0 + w, ry + 18); ctx.stroke()
    }
  }
  // sayılar (harita altı)
  const by = MY + ROWS * C + 30
  const rate = f.done ? f.hits / f.done : 0, avg = f.done ? f.ms / f.done : 0
  const stat = (x: number, label: string, val: string, col: string) => {
    text(ctx, label, x, by, p.muted, 11, 'left', 600)
    text(ctx, val, x, by + 30, col, 24, 'left', 700)
  }
  stat(MX, tr ? 'istek' : 'requests', String(f.done), p.ink)
  stat(MX + 100, tr ? 'isabet oranı' : 'hit rate', `${Math.round(100 * rate)}%`, ok)
  stat(MX + 210, tr ? 'ort. gecikme' : 'avg latency', `${f.done ? (tr ? avg.toFixed(1).replace('.', ',') : avg.toFixed(1)) : '–'} ms`, f.done ? p.brand : p.muted)
  // gecikme çubuğu: 2 ms … 80 ms
  const gy = by + 52
  ctx.fillStyle = p.soft; ctx.fillRect(MX, gy, 320, 12)
  if (f.done) { ctx.fillStyle = alpha(p.brand, 0.75); ctx.fillRect(MX, gy, (320 * avg) / 80, 12) }
  text(ctx, tr ? '0 ms' : '0 ms', MX, gy + 28, p.muted, 10, 'left', 500)
  text(ctx, tr ? '80 ms (önbelleksiz)' : '80 ms (no cache)', MX + 320, gy + 28, p.muted, 10, 'right', 500)
  // isabet eğrisi
  const gx = 372, gyy = 250, gw = W - 16 - gx, gh = H - 16 - gyy
  ctx.fillStyle = p.bg; ctx.strokeStyle = p.line; ctx.lineWidth = 1
  ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(gx, gyy, gw, gh, 6); else ctx.rect(gx, gyy, gw, gh); ctx.fill(); ctx.stroke()
  text(ctx, tr ? 'isabet oranı · önbellek boyu 1–12' : 'hit rate · cache size 1–12', gx + 10, gyy + 16, p.muted, 10, 'left', 600)
  const px = (k: number) => gx + 40 + ((k - 1) / 11) * (gw - 56)
  const py = (r: number) => gyy + gh - 26 - r * (gh - 52)
  ctx.strokeStyle = p.line
  for (const r of [0, 0.5, 1]) { ctx.beginPath(); ctx.moveTo(px(1), py(r)); ctx.lineTo(px(12), py(r)); ctx.stroke(); text(ctx, `${Math.round(r * 100)}%`, gx + 34, py(r) + 4, p.muted, 9, 'right', 400) }
  for (const k of [1, 4, 8, 12]) text(ctx, String(k), px(k), gyy + gh - 10, p.muted, 9, 'center', 400)
  if (f.final) {
    ctx.strokeStyle = ok; ctx.lineWidth = 2; ctx.beginPath()
    f.curve.forEach((r, i) => (i ? ctx.lineTo(px(i + 1), py(r)) : ctx.moveTo(px(i + 1), py(r)))); ctx.stroke()
    f.curve.forEach((r, i) => dot(ctx, px(i + 1), py(r), 2.5, ok))
  }
  const r0 = f.final ? f.curve[f.size - 1] : rate
  dot(ctx, px(f.size), py(r0), 5.5, p.brand)
  if (f.final) text(ctx, `${Math.round(100 * r0)}% · ${avgMs(r0).toFixed(0)} ms`, Math.min(px(f.size) + 8, gx + gw - 80), py(r0) + 18, p.brand, 10, 'left', 700)
}
