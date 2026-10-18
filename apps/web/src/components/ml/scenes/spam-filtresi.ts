// Ders: spam süzgeci. Gelen kutusu ızgarası, en sık kelimeler, kelime puanları (ortadan iki yana çubuklar), tek e-postanın
// kelime kelime toplanan puanı ve eşik, test sonucu türlere göre.
import { alpha, clear, text, type Draw, type Pal } from '../draw'
import { KIND_NAMES, WORDS, type SpamFrame } from '@/lib/ml/spam-filtresi'

const kindCol = (p: Pal, k: number) => [p.groups[0], p.groups[5], p.groups[3], p.groups[1]][k]

function bars(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, rows: Array<[string, number, string?]>, max: number, col: string, title: string, p: Pal) {
  text(ctx, title, x, y, p.ink, 13, 'left', 700)
  const lw = 96, bh = 26
  rows.forEach(([lbl, v, extra], i) => {
    const yy = y + 14 + i * bh
    text(ctx, lbl, x + lw - 8, yy + 17, p.ink, 12, 'right', 500)
    const bw = Math.max(2, ((w - lw - 56) * v) / max)
    ctx.fillStyle = alpha(col, 0.8); ctx.fillRect(x + lw, yy + 5, bw, bh - 10)
    text(ctx, extra ?? String(v), x + lw + bw + 6, yy + 17, p.muted, 11, 'left', 600)
  })
}

/** Ortadan iki yana çubuklar: sağ spam, sol normal. */
function diverging(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, rows: Array<[string, number | null, boolean]>, max: number, p: Pal, tr: boolean) {
  const lw = 110, mid = x + lw + (w - lw) / 2, half = (w - lw) / 2 - 46
  const bh = Math.min(26, 300 / Math.max(1, rows.length))
  text(ctx, tr ? '← normal' : '← normal', mid - 8, y, p.groups[3], 11, 'right', 700)
  text(ctx, tr ? 'spam →' : 'spam →', mid + 8, y, p.groups[0], 11, 'left', 700)
  ctx.strokeStyle = p.line; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(mid + 0.5, y + 6); ctx.lineTo(mid + 0.5, y + 10 + rows.length * bh); ctx.stroke()
  rows.forEach(([lbl, v, on], i) => {
    const yy = y + 8 + i * bh
    text(ctx, lbl, x + lw - 8, yy + bh / 2 + 4, on ? p.ink : alpha(p.muted, 0.6), 12, 'right', on ? 600 : 400)
    if (v === null) { text(ctx, tr ? 'sözlükte yok, atlandı' : 'not in vocabulary, skipped', mid + 8, yy + bh / 2 + 4, p.muted, 11); return }
    const L = (v / max) * half
    ctx.fillStyle = alpha(v > 0 ? p.groups[0] : p.groups[3], on ? 0.85 : 0.2)
    ctx.fillRect(Math.min(mid, mid + L), yy + 4, Math.abs(L), bh - 8)
    if (on) {
      const s = `${v > 0 ? '+' : ''}${tr ? v.toFixed(2).replace('.', ',') : v.toFixed(2)}`
      text(ctx, s, v > 0 ? mid + L + 4 : mid + L - 4, yy + bh / 2 + 4, p.muted, 11, v > 0 ? 'left' : 'right', 600)
    }
  })
}

export const draw: Draw = (ctx, W, H, f0, p, lang) => {
  const f = f0 as SpamFrame
  const tr = lang === 'tr', L = tr ? 0 : 1
  const num = (x: number, d = 2) => (tr ? x.toFixed(d).replace('.', ',') : x.toFixed(d))
  clear(ctx, W, H, p)
  if (f.view === 'inbox' && f.kinds) {
    const cols = 25, cell = 21, gx = (W - cols * cell) / 2, gy = 36
    text(ctx, tr ? 'gelen kutusu: 400 e-posta (dolu: eğitim, çerçeve: test)' : 'inbox: 400 e-mails (filled: training, outlined: test)', W / 2, 22, p.muted, 12, 'center', 600)
    f.kinds.forEach((k, i) => {
      const x = gx + (i % cols) * cell, y = gy + Math.floor(i / cols) * cell
      const c = kindCol(p, k)
      if (i < (f.nTrain ?? 300)) { ctx.fillStyle = alpha(c, 0.85); ctx.fillRect(x + 2, y + 4, cell - 4, cell - 8) }
      else { ctx.strokeStyle = c; ctx.lineWidth = 1.4; ctx.strokeRect(x + 2.5, y + 4.5, cell - 5, cell - 9) }
      // zarf kapağı
      ctx.strokeStyle = alpha(p.bg, 0.8); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + 2, y + 4); ctx.lineTo(x + cell / 2, y + cell / 2); ctx.lineTo(x + cell - 2, y + 4); ctx.stroke()
    })
    let lx = 40
    KIND_NAMES.forEach((n, k) => { ctx.fillStyle = kindCol(p, k); ctx.fillRect(lx, H - 24, 12, 10); text(ctx, n[L], lx + 18, H - 15, p.muted, 12); ctx.font = '500 12px Poppins, system-ui, sans-serif'; lx += ctx.measureText(n[L]).width + 44 })
    return
  }
  if ((f.view === 'counts' || f.view === 'smooth') && f.top) {
    const plus = f.view === 'smooth'
    const max = Math.max(...f.top.spam.map((x) => x[1]), ...f.top.normal.map((x) => x[1])) + 1
    const rows = (a: Array<[number, number]>): Array<[string, number, string?]> => a.map(([w, c]) => [WORDS[w][L], plus ? c + 1 : c, plus ? `${c} + 1` : undefined])
    bars(ctx, 24, 40, W / 2 - 24, rows(f.top.spam), max, p.groups[0], tr ? "spam'de en sık kelimeler" : 'most frequent in spam', p)
    bars(ctx, W / 2 + 12, 40, W / 2 - 24, rows(f.top.normal), max, p.groups[3], tr ? 'normal postada en sık' : 'most frequent in normal mail', p)
    const note = plus ? (tr ? 'her sayıya 1 eklenir: hiç görülmemiş kelime bile sıfır olasılık almaz' : 'one is added to every count: even an unseen word does not get zero probability') : (tr ? 'eğitimin tamamı: her kelime iki ayrı sayaca yazılır' : 'all of training: every word goes into one of two counters')
    text(ctx, note, W / 2, H - 22, plus ? p.brand : p.muted, 12, 'center', 600)
    return
  }
  if (f.view === 'scores' && f.scores) {
    const max = Math.max(3, ...f.scores.map(([, s]) => Math.abs(s)))
    text(ctx, tr ? 'kelime puanı = log P(kelime | spam) − log P(kelime | normal)' : 'word score = log P(word | spam) − log P(word | normal)', W / 2, 22, p.muted, 12, 'center', 600)
    diverging(ctx, 40, 48, W - 80, f.scores.map(([w, s]) => [WORDS[w][L], s, true]), max, p, tr)
    return
  }
  if (f.view === 'mail' && f.mail) {
    const m = f.mail
    // e-posta kutusu
    ctx.fillStyle = p.soft; ctx.strokeStyle = p.line; ctx.lineWidth = 1
    ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(24, 14, W - 48, 58, 8); else ctx.rect(24, 14, W - 48, 58); ctx.fill(); ctx.stroke()
    text(ctx, tr ? 'yeni e-posta' : 'new e-mail', 36, 32, p.muted, 11, 'left', 700)
    let x = 36
    m.w.forEach((w, i) => {
      const s = WORDS[w][L]
      ctx.font = '600 15px Poppins, system-ui, sans-serif'
      const ww = ctx.measureText(s).width
      if (i < m.shown) { ctx.fillStyle = alpha((m.s[i] ?? 0) > 0 ? p.groups[0] : p.groups[3], 0.16); ctx.fillRect(x - 3, 40, ww + 6, 24) }
      text(ctx, s, x, 58, i < m.shown ? p.ink : p.muted, 15, 'left', 600)
      x += ww + 12
    })
    const max = Math.max(3, ...m.s.map((v) => Math.abs(v ?? 0)))
    diverging(ctx, 40, 96, W - 80, m.w.map((w, i) => [WORDS[w][L], m.s[i], i < m.shown]), max, p, tr)
    // toplam göstergesi ve eşik
    const gy = H - 50, gx0 = 80, gx1 = W - 80, lo = -14, hi = 14
    const X = (v: number) => gx0 + ((Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo)) * (gx1 - gx0)
    ctx.fillStyle = alpha(p.groups[3], 0.12); ctx.fillRect(gx0, gy - 8, X(m.t) - gx0, 16)
    ctx.fillStyle = alpha(p.groups[0], 0.12); ctx.fillRect(X(m.t), gy - 8, gx1 - X(m.t), 16)
    ctx.strokeStyle = p.ink; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(X(m.t), gy - 14); ctx.lineTo(X(m.t), gy + 14); ctx.stroke(); ctx.setLineDash([])
    text(ctx, `${tr ? 'eşik' : 'threshold'} ${num(m.t, 1)}`, X(m.t), gy + 28, p.muted, 11, 'center', 600)
    const spam = m.total > m.t
    ctx.fillStyle = spam ? p.groups[0] : p.groups[3]; ctx.beginPath(); ctx.arc(X(m.total), gy, 8, 0, Math.PI * 2); ctx.fill()
    text(ctx, `${tr ? 'toplam' : 'total'} ${m.total >= 0 ? '+' : ''}${num(m.total)}`, X(m.total), gy - 16, p.ink, 12, 'center', 700)
    text(ctx, 'normal', gx0, gy + 28, p.groups[3], 11, 'left', 700)
    text(ctx, 'SPAM', gx1, gy + 28, p.groups[0], 11, 'right', 700)
    return
  }
  if (f.view === 'test' && f.by) {
    text(ctx, tr ? '100 test e-postası: doğru sınıflanan oranı (türlere göre)' : '100 test e-mails: share classified correctly (by type)', W / 2, 30, p.muted, 12, 'center', 600)
    const x0 = 200, x1 = W - 90, bh = 54
    f.by.forEach(([ok, n], k) => {
      const y = 70 + k * (bh + 22)
      text(ctx, KIND_NAMES[k][L], x0 - 14, y + bh / 2 + 5, p.ink, 14, 'right', 600)
      ctx.fillStyle = alpha(p.line, 0.7); ctx.fillRect(x0, y, x1 - x0, bh)
      const r = n ? ok / n : 0
      ctx.fillStyle = alpha(kindCol(p, k), 0.85); ctx.fillRect(x0, y, (x1 - x0) * r, bh)
      text(ctx, `${ok} / ${n}`, x1 + 10, y + bh / 2 + 5, p.ink, 14, 'left', 700)
      const what = k <= 1 ? (tr ? 'yakalandı' : 'caught') : tr ? 'gelen kutusunda kaldı' : 'kept in inbox'
      text(ctx, what, x0 + 10, y + bh / 2 + 5, r > 0.25 ? p.bg : p.muted, 12, 'left', 600)
    })
    const a = Math.round((f.acc ?? 0) * 100)
    text(ctx, tr ? `doğruluk %${a}` : `accuracy ${a}%`, W / 2, H - 20, p.brand, 16, 'center', 700)
  }
}
