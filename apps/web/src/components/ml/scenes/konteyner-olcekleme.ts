// Ders sahnesi: konteyner ve ölçekleme. Giriş: imaj katmanları ve "benim makinemde çalışıyor"; round-robin dağıtım;
// benzetim: kopya kutuları (CPU dolulukları), yük–kapasite basamakları ve gecikme grafiği; son: monolit ve mikroservis.
import { alpha, axes, chart, clear, tag, text, type Draw, type Pal } from '../draw'
import { MIX, type KonFrame } from '@/lib/ml/konteyner-olcekleme'

function box(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, stroke: string, fill: string, dash = false, lw = 1.5) {
  ctx.fillStyle = fill; ctx.strokeStyle = stroke; ctx.lineWidth = lw
  if (dash) ctx.setLineDash([4, 3])
  ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, 6); else ctx.rect(x, y, w, h); ctx.fill(); ctx.stroke()
  ctx.setLineDash([])
}
function arrow(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, col: string, lw = 1.5) {
  ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = lw
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke()
  const a = Math.atan2(y1 - y0, x1 - x0)
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - 8 * Math.cos(a - 0.4), y1 - 8 * Math.sin(a - 0.4)); ctx.lineTo(x1 - 8 * Math.cos(a + 0.4), y1 - 8 * Math.sin(a + 0.4)); ctx.closePath(); ctx.fill()
}
const OK = (p: Pal) => p.groups[3]
const BAD = (p: Pal) => p.groups[0]

export const draw: Draw = (ctx, W, H, f0, p, lang) => {
  const f = f0 as KonFrame
  const S = f.S
  const tr = lang === 'tr'
  clear(ctx, W, H, p)

  if (f.mode === 'image') {
    const layers = tr ? ['harita_servisi.py', 'harita.pgm (depo haritası)', 'numpy 1.26 · scipy 1.11', 'python 3.11', 'debian taban'] : ['map_service.py', 'map.pgm (warehouse map)', 'numpy 1.26 · scipy 1.11', 'python 3.11', 'debian base']
    if (f.step === 0) {
      box(ctx, 40, 60, 290, 220, p.line, p.soft)
      text(ctx, tr ? 'geliştiricinin dizüstü' : "developer's laptop", 60, 88, p.ink, 14, 'left', 700)
      ;['python 3.11', 'numpy 1.26', 'harita.pgm ✓'].forEach((s, i) => text(ctx, s, 60, 124 + i * 26, p.ink, 13))
      text(ctx, tr ? '✓ çalışıyor' : '✓ works', 60, 250, OK(p), 16, 'left', 700)
      box(ctx, 390, 60, 290, 220, p.line, p.soft)
      text(ctx, tr ? 'bulut sunucusu' : 'cloud server', 410, 88, p.ink, 14, 'left', 700)
      ;['python 3.8', 'numpy 2.0', tr ? 'harita.pgm yok' : 'no map.pgm'].forEach((s, i) => text(ctx, s, 410, 124 + i * 26, BAD(p), 13, 'left', 600))
      text(ctx, '✗ ImportError', 410, 250, BAD(p), 16, 'left', 700)
      text(ctx, tr ? 'aynı kod, farklı ortam → farklı sonuç' : 'same code, different environment → different result', W / 2, 330, p.muted, 14, 'center', 600)
    } else if (f.step === 1) {
      text(ctx, tr ? 'konteyner imajı: harita-servisi:1.4' : 'container image: map-service:1.4', W / 2, 50, p.ink, 15, 'center', 700)
      layers.forEach((s, i) => {
        const y = 80 + i * 56
        box(ctx, 200, y, 320, 46, p.brand, i === 0 ? alpha(p.brand, 0.18) : alpha(p.brand, 0.06 + 0.03 * i))
        text(ctx, s, W / 2, y + 28, p.ink, 13, 'center', 600)
      })
      text(ctx, tr ? 'her katman donmuş: sürüm değişmez' : 'every layer is frozen: versions never change', W / 2, 390, p.muted, 13, 'center', 600)
    } else {
      const hosts = tr ? ['dizüstü', 'test', 'bulut'] : ['laptop', 'test', 'cloud']
      text(ctx, tr ? 'aynı imaj, üç makine' : 'one image, three machines', W / 2, 46, p.ink, 15, 'center', 700)
      box(ctx, 290, 64, 140, 40, p.brand, alpha(p.brand, 0.15))
      text(ctx, 'harita-servisi:1.4', 360, 89, p.ink, 12, 'center', 700)
      hosts.forEach((h, i) => {
        const x = 70 + i * 210
        arrow(ctx, 360, 106, x + 80, 168, p.muted)
        box(ctx, x, 172, 160, 150, p.line, p.soft)
        text(ctx, h, x + 80, 196, p.ink, 13, 'center', 700)
        box(ctx, x + 20, 212, 120, 56, p.brand, alpha(p.brand, 0.12))
        text(ctx, tr ? 'konteyner' : 'container', x + 80, 236, p.ink, 11, 'center', 600)
        text(ctx, 'python 3.11', x + 80, 254, p.muted, 10, 'center')
        text(ctx, tr ? '✓ çalışıyor' : '✓ works', x + 80, 300, OK(p), 14, 'center', 700)
      })
      text(ctx, tr ? `her kopya ${S.mu} istek/s işler` : `each copy handles ${S.mu} req/s`, W / 2, 380, p.muted, 13, 'center', 600)
    }
    return
  }

  if (f.mode === 'lb') {
    box(ctx, 60, 180, 140, 70, p.brand, alpha(p.brand, 0.12), false, 2)
    text(ctx, tr ? 'yük dengeleyici' : 'load balancer', 130, 210, p.ink, 12, 'center', 700)
    text(ctx, 'round-robin', 130, 230, p.muted, 11, 'center')
    const cnt = [0, 0, 0]
    for (let i = 0; i < (f.rr ?? 0); i++) cnt[i % 3]++
    const cur = ((f.rr ?? 1) - 1) % 3
    for (let j = 0; j < 3; j++) {
      const y = 80 + j * 120
      box(ctx, 440, y, 200, 70, j === cur ? p.brand : p.line, j === cur ? alpha(p.brand, 0.15) : p.soft, false, j === cur ? 2.5 : 1.5)
      text(ctx, (tr ? 'kopya ' : 'copy ') + (j + 1), 460, y + 28, p.ink, 13, 'left', 700)
      text(ctx, (tr ? 'aldığı istek: ' : 'requests: ') + cnt[j], 460, y + 50, p.muted, 12)
      arrow(ctx, 202, 215, 436, y + 35, j === cur ? p.brand : p.line, j === cur ? 2.5 : 1.2)
    }
    for (let i = 0; i < (f.rr ?? 0); i++) {
      const x = 30 + i * 26
      ctx.fillStyle = i === (f.rr ?? 0) - 1 ? p.brand : alpha(p.groups[1], 0.6)
      ctx.beginPath(); ctx.arc(x + 10, 140, 10, 0, Math.PI * 2); ctx.fill()
      text(ctx, String(i + 1), x + 10, 144, p.bg, 11, 'center', 700)
    }
    text(ctx, tr ? 'gelen istekler' : 'incoming requests', 30, 116, p.muted, 11, 'left', 600)
    return
  }

  if (f.mode === 'arch') {
    const crashed = f.step === 1
    const parts = tr ? ['harita karosu', 'konum', 'rota planlama'] : ['map tiles', 'positions', 'route planning']
    const mix = [MIX.tile, MIX.pos, MIX.route]
    // monolit
    text(ctx, tr ? 'monolit' : 'monolith', 190, 40, p.ink, 15, 'center', 700)
    box(ctx, 60, 60, 260, 250, crashed ? BAD(p) : p.brand, crashed ? alpha(BAD(p), 0.12) : alpha(p.brand, 0.06), false, 2.5)
    parts.forEach((s, i) => {
      const y = 84 + i * 70
      const dead = crashed && i === 2
      box(ctx, 84, y, 212, 50, dead ? BAD(p) : p.line, dead ? alpha(BAD(p), 0.25) : p.bg)
      text(ctx, s + (dead ? ' ✗' : ''), 190, y + 30, dead ? BAD(p) : p.ink, 13, 'center', 600)
    })
    text(ctx, crashed ? (tr ? 'tek süreç çöktü → 503' : 'one process died → 503') : (tr ? 'tek süreç, tek imaj' : 'one process, one image'), 190, 336, crashed ? BAD(p) : p.muted, 13, 'center', 700)
    text(ctx, (tr ? 'yanıtlanan: ' : 'answered: ') + (crashed ? (tr ? '%0' : '0%') : (tr ? '%100' : '100%')), 190, 362, crashed ? BAD(p) : OK(p), 15, 'center', 700)
    // mikroservis
    text(ctx, tr ? 'mikroservisler' : 'microservices', 530, 40, p.ink, 15, 'center', 700)
    parts.forEach((s, i) => {
      const y = 70 + i * 80
      const dead = crashed && i === 2
      box(ctx, 420, y, 220, 58, dead ? BAD(p) : p.brand, dead ? alpha(BAD(p), 0.2) : alpha(p.brand, 0.08), false, 2)
      text(ctx, s + (dead ? ' ✗' : ''), 530, y + 26, dead ? BAD(p) : p.ink, 13, 'center', 600)
      text(ctx, (tr ? 'isteklerin %' : '') + Math.round(100 * mix[i]) + (tr ? '' : '% of requests'), 530, y + 45, p.muted, 11, 'center')
    })
    const ans = crashed ? 1 - MIX.route : 1
    text(ctx, crashed ? (tr ? 'yalnız rota düştü' : 'only routes are down') : (tr ? 'her parça ayrı konteyner' : 'each part its own container'), 530, 336, crashed ? p.groups[2] : p.muted, 13, 'center', 700)
    text(ctx, (tr ? 'yanıtlanan: %' : 'answered: ') + Math.round(100 * ans) + (tr ? '' : '%'), 530, 362, OK(p), 15, 'center', 700)
    return
  }

  // ---- benzetim ----
  const k = f.k
  const n = S.nAuto[k], pend = S.pend[k], L = S.load[k]
  const rho = L / (n * S.mu)
  // yük dengeleyici
  box(ctx, 14, 64, 92, 64, p.brand, alpha(p.brand, 0.1), false, 2)
  text(ctx, tr ? 'yük' : 'load', 60, 88, p.ink, 11, 'center', 700)
  text(ctx, tr ? 'dengeleyici' : 'balancer', 60, 102, p.ink, 11, 'center', 700)
  text(ctx, `${Math.round(L)}/s`, 60, 120, p.muted, 10, 'center', 600)
  const cols = 10, bw = 50, bh = 36, gx = 6, x0 = 140, y0 = 28
  for (let i = 0; i < Math.min(30, n + pend); i++) {
    const x = x0 + (i % cols) * (bw + gx), y = y0 + Math.floor(i / cols) * (bh + 8)
    if (i < n) {
      const u = Math.min(1, rho)
      box(ctx, x, y, bw, bh, p.brand, p.bg)
      ctx.fillStyle = alpha(u > 0.85 ? BAD(p) : u > S.target + 0.1 ? p.groups[2] : OK(p), 0.45)
      ctx.fillRect(x + 2, y + bh - 2 - (bh - 4) * u, bw - 4, (bh - 4) * u)
      text(ctx, tr ? `%${Math.round(100 * Math.min(rho, 9.99))}` : `${Math.round(100 * Math.min(rho, 9.99))}%`, x + bw / 2, y + 22, p.ink, 10, 'center', 600)
    } else {
      box(ctx, x, y, bw, bh, p.muted, p.soft, true)
      text(ctx, tr ? 'açılıyor' : 'starting', x + bw / 2, y + 22, p.muted, 9, 'center', 500)
    }
  }
  // dengeleyiciden ilk sıraya oklar (kalabalığı göstermeden)
  for (let i = 0; i < Math.min(3, Math.ceil(Math.min(30, n + pend) / cols)); i++) arrow(ctx, 108, 96, x0 - 4, y0 + 18 + i * (bh + 8), alpha(p.brand, 0.6), 1.2)
  const lat = S.latAuto[k]
  text(ctx, (tr ? `${n} kopya hazır` : `${n} copies ready`) + (pend ? (tr ? ` · ${pend} açılıyor` : ` · ${pend} starting`) : ''), x0, 176, p.ink, 12, 'left', 700)
  text(ctx, (tr ? 'kopya başına CPU ' : 'CPU per copy ') + (tr ? `%${Math.round(100 * rho)}` : `${Math.round(100 * rho)}%`) + (tr ? ` · hedef %${Math.round(100 * S.target)}` : ` · target ${Math.round(100 * S.target)}%`), x0 + 230, 176, p.muted, 11, 'left', 600)
  text(ctx, lat >= 10000 ? '≫ 1 s' : `${Math.round(lat)} ms`, W - 16, 176, lat > S.slo ? BAD(p) : OK(p), 13, 'right', 700)

  // sol grafik: yük ve kapasite
  const ymax = Math.ceil(Math.max(Math.max(...S.load) * 1.2, S.peakN * S.mu * 1.05) / 100) * 100
  const v = chart(W, H, 0, 120, 0, ymax, { l: 56, r: 380, t: 214, b: 40 })
  const ys = [0, ymax / 2, ymax]
  axes(ctx, v, [0, 30, 60, 90, 120], ys, tr ? 'dakika' : 'minutes', tr ? 'istek/s' : 'req/s', p, W, H)
  ctx.strokeStyle = p.groups[1]; ctx.lineWidth = 1.8; ctx.beginPath()
  for (let i = 0; i <= k; i++) { const X = v.sx(S.t[i]), Y = v.sy(S.load[i]); if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y) }
  ctx.stroke()
  ctx.strokeStyle = p.brand; ctx.lineWidth = 2; ctx.beginPath()
  for (let i = 0; i <= k; i++) {
    const X = v.sx(S.t[i]), Y = v.sy(Math.min(ymax, S.nAuto[i] * S.mu))
    if (i) { ctx.lineTo(X, v.sy(Math.min(ymax, S.nAuto[i - 1] * S.mu))); ctx.lineTo(X, Y) } else ctx.moveTo(X, Y)
  }
  ctx.stroke()
  ctx.strokeStyle = p.muted; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(v.sx(0), v.sy(2 * S.mu)); ctx.lineTo(v.sx(120), v.sy(2 * S.mu)); ctx.stroke(); ctx.setLineDash([])
  text(ctx, tr ? 'yük' : 'load', v.sx(2), v.sy(ymax) + 12, p.groups[1], 10, 'left', 700)
  text(ctx, tr ? 'kapasite (kopya × 50)' : 'capacity (copies × 50)', v.sx(22), v.sy(ymax) + 12, p.brand, 10, 'left', 700)
  text(ctx, tr ? 'sabit 2 kopya' : 'fixed 2 copies', v.sx(119), v.sy(2 * S.mu) + 12, p.muted, 9, 'right', 600)

  // sağ grafik: gecikme
  const LM = 600
  const g = chart(W, H, 0, 120, 0, LM, { l: 420, r: 20, t: 214, b: 40 })
  axes(ctx, g, [0, 30, 60, 90, 120], [0, 200, 400, 600], tr ? 'dakika' : 'minutes', '', p, W, H)
  text(ctx, tr ? 'gecikme (ms)' : 'latency (ms)', 420, 206, p.muted, 11, 'left', 600)
  ctx.fillStyle = alpha(BAD(p), 0.07); ctx.fillRect(g.sx(0), g.sy(LM), g.sx(120) - g.sx(0), g.sy(S.slo) - g.sy(LM))
  ctx.strokeStyle = BAD(p); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(g.sx(0), g.sy(S.slo)); ctx.lineTo(g.sx(120), g.sy(S.slo)); ctx.stroke()
  text(ctx, tr ? 'sınır 200 ms' : 'limit 200 ms', g.sx(2), g.sy(S.slo) - 4, BAD(p), 9, 'left', 600)
  const curve = (arr: number[], col: string, dash: number[]) => {
    ctx.save(); ctx.beginPath(); ctx.rect(g.sx(0), g.sy(LM), g.sx(120) - g.sx(0), g.sy(0) - g.sy(LM)); ctx.clip()
    ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.setLineDash(dash); ctx.beginPath()
    for (let i = 0; i <= k; i++) { const X = g.sx(S.t[i]), Y = g.sy(Math.min(LM * 1.1, arr[i])); if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y) }
    ctx.stroke(); ctx.setLineDash([]); ctx.restore()
  }
  curve(S.latFix, p.muted, [5, 4])
  curve(S.latAuto, OK(p), [])
  text(ctx, tr ? '— ölçekleyici' : '— autoscaler', g.sx(120), g.sy(LM) + 12, OK(p), 10, 'right', 700)
  text(ctx, tr ? '- - sabit 2 kopya' : '- - fixed 2 copies', g.sx(120), g.sy(LM) + 26, p.muted, 10, 'right', 700)
  if (f.done) {
    const fx = (x: number) => (x >= 10000 ? `${Math.round(x / 1000)} s` : `${Math.round(x)} ms`)
    tag(ctx, (tr ? 'en kötü: ' : 'worst: ') + fx(S.maxLatAuto) + (tr ? ' / sabit ' : ' / fixed ') + fx(S.maxLatFix), g.sx(4), g.sy(LM) + 34, p, S.maxLatAuto < S.slo ? OK(p) : BAD(p))
  }
}
