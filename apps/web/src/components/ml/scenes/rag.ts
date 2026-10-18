// Ders: RAG sahnesi. Solda 12 kılavuz parçası kart olarak (vektör şeridi, sonra soruya benzerlik çubuğu, seçilen k parça
// çerçeveli); altta soru vektörünün terimleri ve IDF ağırlıkları; sağda soru, erişimsiz uydurma cevap, bağlam ve kaynaklı cevap.
import { alpha, clear, text, FONT, type Draw, type Pal } from '../draw'
import { CHUNKS, DOCVEC, IDF, QUESTIONS, TERM_TR, VOCAB, type RagFrame } from '@/lib/ml/rag'
import { fmt } from '@/lib/ml/core'

function wrap(ctx: CanvasRenderingContext2D, s: string, w: number, size: number, weight = 500): string[] {
  ctx.font = `${weight} ${size}px ${FONT}`
  const out: string[] = []
  let line = ''
  for (const word of s.split(' ')) {
    const t = line ? `${line} ${word}` : word
    if (ctx.measureText(t).width > w && line) { out.push(line); line = word } else line = t
  }
  if (line) out.push(line)
  return out
}
function box(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fill: string, stroke: string, lw = 1.2) {
  ctx.fillStyle = fill; ctx.strokeStyle = stroke; ctx.lineWidth = lw
  ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, 7); else ctx.rect(x, y, w, h); ctx.fill(); ctx.stroke()
}
function para(ctx: CanvasRenderingContext2D, s: string, x: number, y: number, w: number, col: string, size: number, maxLines: number, weight = 500): number {
  const L = wrap(ctx, s, w, size, weight).slice(0, maxLines)
  L.forEach((l, i) => text(ctx, l, x, y + i * (size + 4), col, size, 'left', weight))
  return L.length * (size + 4)
}

export const draw: Draw = (ctx, W, H, f0, p, lang) => {
  const f = f0 as RagFrame
  clear(ctx, W, H, p)
  const n = (x: number) => fmt(x, 2, lang)
  // ---- kartlar
  const cw = 148, ch = 74, g = 6, x0 = 14, y0 = 12
  const maxIdf = Math.max(...IDF)
  const rankOf = new Map((f.top ?? []).map((i, r) => [i, r]))
  const inCtx = new Set((f.top ?? []).slice(0, f.ctxN))
  const gold = f.qn >= 0 ? QUESTIONS[f.qn].gold : -1
  CHUNKS.forEach((c, i) => {
    const x = x0 + (i % 3) * (cw + g), y = y0 + Math.floor(i / 3) * (ch + g)
    const r = rankOf.get(i)
    const sel = r !== undefined
    box(ctx, x, y, cw, ch, inCtx.has(i) ? alpha(p.groups[3], 0.1) : p.bg, sel ? p.brand : p.line, sel ? 2.4 : 1.2)
    text(ctx, `${i + 1}`, x + 8, y + 15, p.muted, 11, 'left', 700)
    para(ctx, c.text[lang], x + 27, y + 15, cw - 33, p.ink, 9.5, 4, 500)
    if (sel) {
      ctx.fillStyle = p.brand; ctx.beginPath(); ctx.arc(x + cw - 4, y + 4, 10, 0, Math.PI * 2); ctx.fill()
      text(ctx, `${r! + 1}`, x + cw - 4, y + 8, p.bg, 11, 'center', 700)
    }
    const s = f.sim[i]
    const by = y + ch - 15
    if (s !== null) {
      ctx.fillStyle = p.soft; ctx.fillRect(x + 8, by, cw - 52, 9)
      ctx.fillStyle = i === gold ? p.groups[3] : p.groups[1]; ctx.fillRect(x + 8, by, (cw - 52) * Math.max(0, s), 9)
      text(ctx, n(s), x + cw - 8, by + 9, p.ink, 10, 'right', 700)
    } else if (i < f.vec) {
      // vektör şeridi: her sözlük terimi bir çizgi, yükseklik = TF × IDF
      const d = DOCVEC[i], sw = (cw - 16) / VOCAB.length
      d.forEach((v, j) => { if (!v) return; ctx.fillStyle = p.brand; const h = 10 * (v / maxIdf); ctx.fillRect(x + 8 + j * sw, by + 9 - h, Math.max(1.5, sw - 0.5), h) })
      ctx.fillStyle = p.line; ctx.fillRect(x + 8, by + 9, cw - 16, 1)
    }
  })
  // ---- soru vektörü (alt)
  const qy = y0 + 4 * (ch + g) + 8
  if (f.qn >= 0) {
    const Q = QUESTIONS[f.qn]
    text(ctx, lang === 'tr' ? 'soru vektörü (TF × IDF)' : 'question vector (TF × IDF)', x0, qy + 10, p.muted, 11, 'left', 600)
    let x = x0
    ctx.font = `600 12px ${FONT}`
    for (const t of Q.terms.split(' ')) {
      const lab = `${lang === 'tr' ? TERM_TR[t] : t} · ${n(IDF[VOCAB.indexOf(t)])}`
      const w = ctx.measureText(lab).width + 16
      box(ctx, x, qy + 18, w, 24, alpha(p.brand, 0.08), p.brand)
      text(ctx, lab, x + 8, qy + 34, p.ink, 12, 'left', 600)
      x += w + 8
    }
    text(ctx, lang === 'tr' ? 'yeşil çubuk: doğru parça · numaralı daire: seçilen k' : 'green bar: the right chunk · numbered circle: chosen k', x0, qy + 62, p.muted, 10, 'left', 500)
  } else if (f.vec > 0) {
    text(ctx, lang === 'tr' ? `kartın altı: ${VOCAB.length} terimlik vektör (çubuk boyu = TF × IDF)` : `bottom of a card: the ${VOCAB.length}-term vector (bar height = TF × IDF)`, x0, qy + 10, p.muted, 11, 'left', 600)
  }
  // ---- sağ panel
  const rx = 484, rw = W - 14 - rx
  let y = 12
  if (f.qn < 0) {
    box(ctx, rx, y, rw, 110, p.soft, p.line)
    para(ctx, lang === 'tr' ? 'Önce kılavuzun her parçası bir sayı vektörüne çevrilir. Soru gelince aynısı soru için yapılır ve en benzer parçalar aranır.' : 'First every chunk of the manual becomes a vector of numbers. When a question comes, the same is done for it and the most similar chunks are searched.', rx + 10, y + 20, rw - 20, p.ink, 11, 6)
    return
  }
  const Q = QUESTIONS[f.qn]
  text(ctx, lang === 'tr' ? `soru ${f.qn + 1}` : `question ${f.qn + 1}`, rx, y + 10, p.muted, 11, 'left', 700)
  const qL = wrap(ctx, Q.text[lang], rw - 20, 12, 600).length
  box(ctx, rx, y + 16, rw, qL * 16 + 14, alpha(p.brand, 0.08), p.brand)
  para(ctx, Q.text[lang], rx + 10, y + 34, rw - 20, p.ink, 12, 3, 600)
  y += 16 + qL * 16 + 32
  if (f.guess) {
    text(ctx, lang === 'tr' ? 'erişimsiz model (uydurma)' : 'model without retrieval (made up)', rx, y, p.groups[0], 11, 'left', 700)
    const gL = wrap(ctx, Q.guess[lang], rw - 20, 11).length
    box(ctx, rx, y + 6, rw, gL * 15 + 12, alpha(p.groups[0], 0.07), p.groups[0])
    para(ctx, Q.guess[lang], rx + 10, y + 22, rw - 20, p.ink, 11, 3)
    y += 6 + gL * 15 + 30
  }
  if (f.top) {
    text(ctx, lang === 'tr' ? `bağlam (k = ${f.k})` : `context (k = ${f.k})`, rx, y, p.muted, 11, 'left', 700)
    f.top.forEach((i, r) => {
      const x = rx + r * 42
      const on = r < f.ctxN
      box(ctx, x, y + 6, 36, 22, on ? alpha(p.groups[3], 0.15) : p.bg, on ? (i === Q.gold ? p.groups[3] : p.brand) : p.line, on ? 1.8 : 1)
      text(ctx, `${i + 1}`, x + 18, y + 22, on ? p.ink : p.muted, 12, 'center', 700)
    })
    y += 50
  }
  if (f.answer && f.top) {
    const src = f.top[0]
    const ok = f.top.includes(Q.gold)
    const col = ok ? p.groups[3] : p.groups[0]
    text(ctx, lang === 'tr' ? 'RAG cevabı (şablon)' : 'RAG answer (template)', rx, y, col, 11, 'left', 700)
    const s = `${lang === 'tr' ? 'Kılavuza göre:' : 'According to the manual:'} ${CHUNKS[src].text[lang]} [${src + 1}]`
    const aL = Math.min(5, wrap(ctx, s, rw - 20, 11).length)
    box(ctx, rx, y + 6, rw, aL * 15 + 12, alpha(col, 0.08), col, 1.6)
    para(ctx, s, rx + 10, y + 22, rw - 20, p.ink, 11, 5)
    y += 6 + aL * 15 + 30
  }
  if (f.ranks && y < H - 60) {
    text(ctx, lang === 'tr' ? 'doğru parçanın sırası' : 'rank of the right chunk', rx, y, p.muted, 11, 'left', 700)
    f.ranks.forEach((rk, j) => {
      const x = rx + j * 31
      const ok = rk <= f.k
      box(ctx, x, y + 6, 27, 34, ok ? alpha(p.groups[3], 0.12) : alpha(p.groups[0], 0.12), ok ? p.groups[3] : p.groups[0])
      text(ctx, `S${j + 1}`, x + 13.5, y + 19, p.muted, 9, 'center', 600)
      text(ctx, `${rk}`, x + 13.5, y + 35, p.ink, 12, 'center', 700)
    })
  }
}

export type { Pal }
