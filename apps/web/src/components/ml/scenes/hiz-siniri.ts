// Ders sahnesi: hız sınırı. İki şerit aynı istek akışını görür: üstte sınır yok, altta istemci başına jeton kovası.
// Noktalar istekler (mavi robot, kırmızı bot), kutu kuyruk doluluğu, çarpılar düşen istekler; altta meşru başarı zaman grafiği.
import { alpha, axes, chart, clear, dot, text, type Draw } from '../draw'
import type { HizFrame, RateSeries } from '@/lib/ml/hiz-siniri'

const frac = (x: number) => x - Math.floor(x)

export const draw: Draw = (ctx, W, H, f0, p, lang) => {
  const f = f0 as HizFrame
  const S = f.S
  const tr = lang === 'tr'
  const k = f.k
  clear(ctx, W, H, p)
  const LEG = p.groups[1], BOT = p.groups[0]
  const t = k * S.dt
  const atk = t >= S.t0 && t < S.t1
  const win = (arr: number[], n = 10) => { let s = 0; for (let j = Math.max(0, k - n + 1); j <= k; j++) s += arr[j]; return s }
  const gL = win(S.genL), gB = win(S.genB)

  // zaman ve durum (üst satır)
  text(ctx, `t = ${(tr ? t.toFixed(1).replace('.', ',') : t.toFixed(1))} s`, 16, 20, p.ink, 13, 'left', 700)
  if (atk) text(ctx, tr ? 'SALDIRI SÜRÜYOR' : 'ATTACK UNDER WAY', 100, 20, BOT, 12, 'left', 700)
  text(ctx, tr ? `gelen: ${gL} robot + ${gB} bot isteği / s` : `incoming: ${gL} robot + ${gB} bot requests / s`, W - 16, 20, p.muted, 11, 'right', 600)

  const rows: Array<{ y: number; s: RateSeries; lim: boolean; name: string }> = [
    { y: 72, s: S.free, lim: false, name: tr ? 'sınır yok' : 'no limit' },
    { y: 182, s: S.lim, lim: true, name: tr ? 'jeton kovası' : 'token bucket' },
  ]
  for (const R of rows) {
    const y = R.y
    text(ctx, R.name, 16, y - 34, p.ink, 12, 'left', 700)
    // istemciler: 10 robot (her biri 5'i temsil eder) ve 4 bot (her biri 5'i)
    for (let i = 0; i < 10; i++) dot(ctx, 22 + (i % 5) * 12, y - 12 + Math.floor(i / 5) * 12, 4, f.focus === 1 ? LEG : alpha(LEG, 0.8))
    for (let i = 0; i < 4; i++) dot(ctx, 22 + i * 12, y + 18, 4, atk ? BOT : alpha(BOT, 0.25))
    // boru
    const x0 = 90, xg = 240, x1 = 380
    ctx.strokeStyle = p.line; ctx.lineWidth = 22; ctx.lineCap = 'round'
    ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); ctx.lineCap = 'butt'
    const tot = gL + gB, fl = tot ? gL / tot : 1
    const passL = win(R.s.inL), passB = win(R.s.inB), pass = passL + passB, pl = pass ? passL / pass : 1
    const nPre = Math.min(46, Math.round(tot / 10)), nPost = Math.min(46, Math.round(pass / 10))
    const part = (n: number, xa: number, xb: number, legitFrac: number, seed: number) => {
      for (let i = 0; i < n; i++) {
        const u = frac(i * 0.6180339 + k * 0.07 + seed)
        const x = xa + u * (xb - xa)
        const jy = ((i * 7) % 9 - 4) * 2
        dot(ctx, x, y + jy, 2.6, frac(i * 0.3711 + 0.13) < legitFrac ? LEG : BOT)
      }
    }
    if (R.lim) {
      part(nPre, x0, xg - 14, fl, 0.1)
      part(nPost, xg + 14, x1, pl, 0.4)
      // kapı ve kovalar
      ctx.fillStyle = f.focus === 2 ? alpha(p.brand, 0.25) : p.soft; ctx.strokeStyle = p.brand; ctx.lineWidth = 2
      ctx.fillRect(xg - 10, y - 26, 20, 52); ctx.strokeRect(xg - 10, y - 26, 20, 52)
      const bucket = (bx: number, v: number, col: string, lbl: string) => {
        const bh = 34, by = y - 66
        ctx.strokeStyle = p.muted; ctx.lineWidth = 1.2; ctx.strokeRect(bx, by, 14, bh)
        ctx.fillStyle = col; const h = (bh * v) / S.kova; ctx.fillRect(bx + 1, by + bh - h, 12, h)
        text(ctx, lbl, bx + 7, by - 4, p.muted, 9, 'center', 600)
      }
      bucket(xg - 46, R.s.tokRob[k], LEG, tr ? 'robot' : 'robot')
      bucket(xg + 32, R.s.tokBot[k], BOT, 'bot')
      const rej = win(R.s.dropB)
      text(ctx, tr ? `kapıda red: ${rej}/s` : `rejected: ${rej}/s`, xg, y + 44, rej ? BOT : p.muted, 10, 'center', 600)
    } else part(nPre, x0, x1, fl, 0.1)
    // kuyruk
    const qx = 400, qw = 150, qh = 30
    ctx.fillStyle = p.soft; ctx.strokeStyle = p.ink; ctx.lineWidth = 1.2
    ctx.fillRect(qx, y - qh / 2, qw, qh)
    const q = R.s.q[k], ql = R.s.ql[k]
    ctx.fillStyle = LEG; ctx.fillRect(qx, y - qh / 2, (qw * ql) / S.qmax, qh)
    ctx.fillStyle = BOT; ctx.fillRect(qx + (qw * ql) / S.qmax, y - qh / 2, (qw * (q - ql)) / S.qmax, qh)
    ctx.strokeRect(qx, y - qh / 2, qw, qh)
    text(ctx, (tr ? 'kuyruk ' : 'queue ') + `${Math.round(q)}/${S.qmax}`, qx + qw / 2, y - qh / 2 - 6, p.ink, 11, 'center', 600)
    const dq = win(R.s.dropQ)
    if (dq > 0) {
      const nx = Math.min(12, Math.ceil(dq / 30))
      ctx.strokeStyle = BOT; ctx.lineWidth = 1.6
      for (let i = 0; i < nx; i++) { const cx = qx + 8 + i * 12, cy = y + qh / 2 + 10; ctx.beginPath(); ctx.moveTo(cx - 3, cy - 3); ctx.lineTo(cx + 3, cy + 3); ctx.moveTo(cx + 3, cy - 3); ctx.lineTo(cx - 3, cy + 3); ctx.stroke() }
      text(ctx, tr ? `düşen: ${dq}/s` : `dropped: ${dq}/s`, qx + qw / 2, y + qh / 2 + 30, BOT, 10, 'center', 600)
    }
    // sunucu
    const sx = 572
    ctx.fillStyle = f.focus === 0 ? alpha(p.brand, 0.2) : p.bg; ctx.strokeStyle = p.brand; ctx.lineWidth = 2
    ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(sx, y - 30, 132, 60, 8); else ctx.rect(sx, y - 30, 132, 60); ctx.fill(); ctx.stroke()
    text(ctx, tr ? 'sunucu 100/s' : 'server 100/s', sx + 66, y - 13, p.muted, 10, 'center', 600)
    const sc = R.s.succ[k]
    text(ctx, tr ? `%${Math.round(100 * sc)}` : `${Math.round(100 * sc)}%`, sx + 66, y + 12, sc < 0.8 ? BOT : p.groups[3], 20, 'center', 700)
    text(ctx, tr ? 'robot başarısı' : 'robot success', sx + 66, y + 25, p.muted, 9, 'center', 500)
  }

  // zaman grafiği
  const v = chart(W, H, 0, 60, 0, 100, { l: 56, r: 20, t: 262, b: 40 })
  ctx.fillStyle = alpha(BOT, 0.08); ctx.fillRect(v.sx(S.t0), v.sy(100), v.sx(S.t1) - v.sx(S.t0), v.sy(0) - v.sy(100))
  axes(ctx, v, [0, 10, 20, 30, 40, 50, 60], [0, 50, 100], tr ? 'zaman (s)' : 'time (s)', tr ? 'başarı %' : 'success %', p, W, H)
  text(ctx, tr ? 'saldırı' : 'attack', v.sx((S.t0 + S.t1) / 2), v.sy(100) + 12, BOT, 10, 'center', 600)
  const line = (arr: number[], col: string, dash: number[]) => {
    ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.setLineDash(dash); ctx.beginPath()
    for (let j = 0; j <= k; j++) { const X = v.sx(j * S.dt), Y = v.sy(100 * arr[j]); if (j) ctx.lineTo(X, Y); else ctx.moveTo(X, Y) }
    ctx.stroke(); ctx.setLineDash([])
  }
  line(S.free.succ, BOT, [5, 4])
  line(S.lim.succ, p.groups[3], [])
  ctx.strokeStyle = p.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(v.sx(t), v.sy(0)); ctx.lineTo(v.sx(t), v.sy(100)); ctx.stroke()
  // açıklama
  const lx = v.sx(41) + 6, ly = v.sy(30)
  ctx.strokeStyle = BOT; ctx.setLineDash([5, 4]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx + 18, ly); ctx.stroke(); ctx.setLineDash([])
  text(ctx, tr ? 'sınır yok' : 'no limit', lx + 24, ly + 4, p.ink, 10)
  ctx.strokeStyle = p.groups[3]; ctx.beginPath(); ctx.moveTo(lx + 90, ly); ctx.lineTo(lx + 108, ly); ctx.stroke()
  text(ctx, tr ? 'jeton kovası' : 'token bucket', lx + 114, ly + 4, p.ink, 10)
  if (f.done) {
    const pc = (x: number) => (tr ? `%${Math.round(100 * x)}` : `${Math.round(100 * x)}%`)
    text(ctx, tr ? 'saldırı boyunca:' : 'during the attack:', lx, v.sy(78), p.ink, 11, 'left', 700)
    text(ctx, tr ? `sınırsız ${pc(S.okFree)} · kova ${pc(S.okLim)}` : `no limit ${pc(S.okFree)} · bucket ${pc(S.okLim)}`, lx, v.sy(60), p.ink, 12, 'left', 700)
  }
}
