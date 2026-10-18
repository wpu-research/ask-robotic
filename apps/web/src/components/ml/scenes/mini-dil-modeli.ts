// Mini dil modeli sahnesi: üstte seçili kelimeden sonra gelecek 29 kelimenin olasılık çubukları, altta günlük (okunan çift
// vurgulu) ya da modelin kelime kelime yazdığı metin. İngilizce arayüzde her kelimenin altında karşılığı yazar.
import { FONT, alpha, clear, text, type Draw, type Pal } from '../draw'
import { GLOSS, VOCAB, WORDS, type LmFrame } from '@/lib/ml/mini-dil-modeli'

/** Kelimeleri satırlara dizer; hi: vurgulanacak kelime sıraları, last: son kelimeyi renklendir. */
function words(ctx: CanvasRenderingContext2D, ws: string[], x0: number, y0: number, w: number, p: Pal, opts: { size: number; gloss: boolean; hi?: Set<number>; last?: boolean; maxRows: number }) {
  const { size, gloss } = opts
  const rowH = gloss ? size + 20 : size + 9
  let x = x0, y = y0, row = 0
  // çok uzunsa baştan kırp (son satırlar görünsün)
  const lay: Array<{ i: number; x: number; row: number; ww: number }> = []
  ws.forEach((s, i) => {
    ctx.font = `600 ${size}px ${FONT}`
    const a = ctx.measureText(s).width
    ctx.font = `500 10px ${FONT}`
    const b = gloss ? ctx.measureText(GLOSS[s] ?? s).width : 0
    const ww = Math.max(a, b) + (s === '.' ? 5 : gloss ? 9 : 6)
    if (x + ww > x0 + w) { x = x0; row++ }
    lay.push({ i, x, row, ww })
    x += ww
  })
  const skip = Math.max(0, row + 1 - opts.maxRows)
  for (const q of lay) {
    if (q.row < skip) continue
    const s = ws[q.i]
    y = y0 + (q.row - skip) * rowH
    const hi = opts.hi?.has(q.i) || (opts.last && q.i === ws.length - 1)
    if (hi) { ctx.fillStyle = alpha(p.brand, 0.14); ctx.fillRect(q.x - 3, y - size - 2, q.ww - 3, gloss ? size + 18 : size + 7) }
    text(ctx, s, q.x, y, hi ? p.brand : p.ink, size, 'left', hi ? 700 : 500)
    if (gloss && s !== '.') text(ctx, GLOSS[s] ?? '', q.x, y + 14, p.muted, 10, 'left', 400)
  }
}

export const draw: Draw = (ctx, W, H, f0, p, lang) => {
  const f = f0 as LmFrame
  const tr = lang === 'tr'
  clear(ctx, W, H, p)
  const pct = (x: number) => { const v = x > 0 && x < 0.095 ? (x * 100).toFixed(1) : String(Math.round(x * 100)); return tr ? `%${v.replace('.', ',')}` : `${v}%` }

  // başlık
  const head = tr ? `"${f.word}" kelimesinden sonra ne gelir?` : `What comes after "${f.word}"?`
  text(ctx, head, 24, 24, p.ink, 14, 'left', 700)
  if (!tr && GLOSS[f.word] && f.word !== '.') text(ctx, `("${GLOSS[f.word]}")`, 24 + ctx.measureText(head).width + 8, 24, p.muted, 12, 'left', 500)
  const badge = f.tour ? (tr ? `tur ${f.tour}` : `round ${f.tour}`) : (tr ? 'eğitim yok' : 'untrained')
  text(ctx, badge, W - 20, 24, p.muted, 12, 'right', 600)

  // çubuklar
  const x0 = 50, x1 = W - 16, yb = 196, yt = 50
  const n = f.probs.length, step = (x1 - x0) / n, bw = Math.min(16, step - 6)
  const mx = Math.max(...f.probs)
  const ymax = mx > 0.5 ? 1 : mx > 0.2 ? 0.5 : mx > 0.1 ? 0.2 : 0.1
  const Y = (q: number) => yb - (q / ymax) * (yb - yt)
  ctx.strokeStyle = p.line; ctx.lineWidth = 1
  for (const g of [0, 0.5, 1]) {
    const y = Y(g * ymax) + 0.5
    ctx.beginPath(); ctx.moveTo(x0 - 4, y); ctx.lineTo(x1, y); ctx.stroke()
    const gl = Math.round(g * ymax * 100)
    text(ctx, tr ? `%${gl}` : `${gl}%`, x0 - 8, y + 4, p.muted, 10, 'right', 400)
  }
  const truth = f.pair ? VOCAB.indexOf(f.pair[1]) : -1
  const best = f.probs.reduce((bi, v, i) => (v > f.probs[bi] ? i : bi), 0)
  f.probs.forEach((q, i) => {
    const x = x0 + i * step + (step - bw) / 2
    const col = i === f.pick ? p.brand : i === truth ? p.groups[3] : alpha(p.groups[1], 0.7)
    ctx.fillStyle = col
    const y = Y(Math.min(q, ymax))
    ctx.fillRect(x, y, bw, Math.max(1, yb - y))
    if (i === f.pick || i === truth || (i === best && mx > 1.5 / n)) text(ctx, pct(q), x + bw / 2, y - 5, i === f.pick ? p.brand : p.ink, 10, 'center', 700)
    // eğik etiket
    ctx.save(); ctx.translate(x + bw / 2 + 3, yb + 8); ctx.rotate(-Math.PI / 3.2)
    text(ctx, VOCAB[i], 0, 0, i === f.pick || i === truth ? p.ink : p.muted, 10.5, 'right', i === f.pick || i === truth ? 700 : 500)
    ctx.restore()
  })
  if (mx - Math.min(...f.probs) < 1e-9) text(ctx, tr ? `hepsi eşit: ${pct(1 / n)}` : `all equal: ${pct(1 / n)}`, (x0 + x1) / 2, yt + 10, p.muted, 12, 'center', 600)

  // alt panel
  const py = 292, px = 24, pw = W - 48
  ctx.fillStyle = p.soft; ctx.beginPath()
  if (ctx.roundRect) ctx.roundRect(px - 10, py - 12, pw + 20, H - py, 8); else ctx.rect(px - 10, py - 12, pw + 20, H - py); ctx.fill()
  if (f.text) {
    text(ctx, f.mode ? (tr ? 'model yazıyor (hep en olası kelime)' : 'the model writes (always the top word)') : (tr ? 'model yazıyor (ağırlıklı zar)' : 'the model writes (weighted die)'), px, py + 6, p.muted, 11, 'left', 600)
    words(ctx, f.text, px, py + 34, pw, p, { size: 15, gloss: !tr, last: f.pick !== undefined, maxRows: tr ? 5 : 3 })
  } else if (f.story) {
    text(ctx, tr ? 'görev günlüğü' : 'task log (Turkish)', px, py + 6, p.muted, 11, 'left', 600)
    const hi = f.at !== undefined ? new Set([f.at, f.at + 1]) : undefined
    words(ctx, WORDS, px, py + 28, pw, p, { size: 12, gloss: false, hi, maxRows: 7 })
  } else {
    text(ctx, tr ? 'günlüğü çift çift okuyor: her kelime ve ardından gelen' : 'reading the log pair by pair: each word and the one after it', px, py + 6, p.muted, 11, 'left', 600)
    words(ctx, WORDS.slice(0, 40), px, py + 30, pw, p, { size: 12, gloss: false, maxRows: 3 })
  }
}
