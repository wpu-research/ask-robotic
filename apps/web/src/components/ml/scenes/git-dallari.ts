// Ders sahnesi: Git dalları. Üstte commit grafiği (düğümler, dal etiketleri, HEAD), altta dosya içeriği,
// özet hesabı, üç yönlü birleştirme tablosu ya da çakışma işaretli dosya.
import { alpha, clear, dot, tag, text, type Draw } from '../draw'
import type { GitCommit, GitFrame } from '@/lib/ml/git-dallari'

export const draw: Draw = (ctx, W, H, f0, p, lang) => {
  const f = f0 as GitFrame
  const tr = lang === 'tr'
  clear(ctx, W, H, p)
  const LANE = [64, 150]
  const X = (c: GitCommit) => 70 + c.col * 118
  const Y = (c: GitCommit) => LANE[c.lane]
  const who = (w: number) => (w === 0 ? p.groups[1] : w === 1 ? p.groups[3] : p.muted)
  const vis = f.commits.slice(0, f.shown)
  const byId = new Map(vis.map((c) => [c.id, c]))

  // şerit adları
  text(ctx, 'main', 14, LANE[0] + 4, p.groups[1], 11, 'left', 700)
  text(ctx, 'engel', 14, LANE[1] + 4, p.groups[3], 11, 'left', 700)
  ctx.strokeStyle = p.line; ctx.lineWidth = 1
  for (const y of LANE) { ctx.setLineDash([2, 4]); ctx.beginPath(); ctx.moveTo(52, y); ctx.lineTo(560, y); ctx.stroke(); ctx.setLineDash([]) }

  // kenarlar (ebeveyn → çocuk)
  for (const c of vis) for (const pid of c.parents) {
    const q = byId.get(pid); if (!q) continue
    ctx.strokeStyle = who(c.who === -1 ? q.who : c.who); ctx.lineWidth = 2.4
    ctx.beginPath(); ctx.moveTo(X(q), Y(q))
    if (Y(q) === Y(c)) ctx.lineTo(X(c), Y(c))
    else ctx.bezierCurveTo(X(q) + 60, Y(q), X(c) - 60, Y(c), X(c), Y(c))
    ctx.stroke()
  }
  const inA = new Set(f.ancA ?? []), inB = new Set(f.ancB ?? []), inC = new Set(f.common ?? [])
  for (const c of vis) {
    const x = X(c), y = Y(c)
    if (inC.has(c.id)) { ctx.fillStyle = alpha(p.groups[2], 0.3); ctx.beginPath(); ctx.arc(x, y, 18, 0, Math.PI * 2); ctx.fill() }
    if (inA.has(c.id)) { ctx.strokeStyle = p.groups[1]; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 14, Math.PI, 2 * Math.PI); ctx.stroke() }
    if (inB.has(c.id)) { ctx.strokeStyle = p.groups[3]; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 14, 0, Math.PI); ctx.stroke() }
    dot(ctx, x, y, 9, p.bg)
    ctx.strokeStyle = who(c.who); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2); ctx.stroke()
    if (c.parents.length > 1) dot(ctx, x, y, 4, who(c.who))
    if (f.base === c.id) { ctx.strokeStyle = p.brand; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 15, 0, Math.PI * 2); ctx.stroke() }
    text(ctx, c.id, x, c.lane ? y + 26 : y + 27, p.ink, 10.5, 'center', 600)
    text(ctx, c.msg[tr ? 0 : 1], x, y - 16, p.muted, 10, 'center', 500)
  }
  if (f.base) { const b = byId.get(f.base); if (b) tag(ctx, tr ? 'ortak ata' : 'common ancestor', X(b) - 40, LANE[0] + 34, p, p.brand) }

  // dal etiketleri ve HEAD
  const labels: Array<[string, string | null, string]> = [['main', f.refs.main, p.groups[1]], ['engel', f.refs.engel, p.groups[3]]]
  const used = new Map<string, number>()
  for (const [name, id, col] of labels) {
    if (!id) continue
    const c = byId.get(id); if (!c) continue
    const k = used.get(id) ?? 0; used.set(id, k + 1)
    tag(ctx, f.head === name ? `HEAD → ${name}` : name, X(c) + 14 + (k ? 26 : 0), Y(c) - 11 + k * 25, p, col)
  }
  // açıklama (sağ alt)
  const lx = 596
  dot(ctx, lx, 122, 5, p.groups[1]); text(ctx, tr ? 'Can (main)' : 'Can (main)', lx + 10, 126, p.ink, 11)
  dot(ctx, lx, 142, 5, p.groups[3]); text(ctx, tr ? 'Ayşe (engel)' : 'Ayşe (engel)', lx + 10, 146, p.ink, 11)
  dot(ctx, lx, 162, 5, p.muted); text(ctx, tr ? 'ortak geçmiş' : 'shared history', lx + 10, 166, p.ink, 11)
  if (f.ancA || f.ancB) {
    ctx.strokeStyle = p.groups[1]; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(lx, 182, 6, Math.PI, 2 * Math.PI); ctx.stroke()
    ctx.strokeStyle = p.groups[3]; ctx.beginPath(); ctx.arc(lx, 182, 6, 0, Math.PI); ctx.stroke()
    text(ctx, tr ? 'ata işaretleri' : 'ancestor marks', lx + 10, 186, p.ink, 11)
  }

  // alt panel
  const top = 214
  ctx.fillStyle = p.soft; ctx.strokeStyle = p.line; ctx.lineWidth = 1
  ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(10, top, W - 20, H - top - 10, 8); else ctx.rect(10, top, W - 20, H - top - 10); ctx.fill(); ctx.stroke()

  if (f.merge) {
    const m = f.merge
    const cols = [{ x: 24, t: '#' }, { x: 44, t: tr ? 'ortak ata' : 'ancestor' }, { x: 196, t: 'Can (main)' }, { x: 340, t: 'Ayşe (engel)' }, { x: 530, t: tr ? 'sonuç' : 'result' }]
    const colc = [p.muted, p.brand, p.groups[1], p.groups[3], p.ink]
    cols.forEach((c, i) => text(ctx, c.t, c.x, top + 22, colc[i], 11, 'left', 700))
    m.O.forEach((o, i) => {
      const y = top + 46 + i * 25
      if (i === m.row) { ctx.fillStyle = alpha(p.brand, 0.12); ctx.fillRect(16, y - 16, W - 32, 23) }
      const a = m.A[i], b = m.B[i]
      text(ctx, String(i), 24, y, p.muted, 11)
      text(ctx, o, 44, y, p.ink, 11)
      text(ctx, a === o ? '=' : a, 196, y, a === o ? p.muted : p.groups[1], 11, 'left', a === o ? 400 : 600)
      text(ctx, b === o ? '=' : b, 340, y, b === o ? p.muted : p.groups[3], 11, 'left', b === o ? 400 : 600)
      if (i < m.row || (i === m.row && m.decided)) {
        const r = m.R[i]
        if (r === null) { tag(ctx, tr ? 'ÇAKIŞMA' : 'CONFLICT', 526, y - 15, p, p.groups[0]) }
        else text(ctx, r, 530, y, a !== o || b !== o ? p.ink : p.muted, 11, 'left', a !== o || b !== o ? 600 : 400)
      }
    })
  } else if (f.conflict) {
    text(ctx, tr ? 'robot.py (birleştirme yarım kaldı)' : 'robot.py (merge halted)', 24, top + 22, p.groups[0], 12, 'left', 700)
    const rows = new Set<number>()
    f.conflict.rows.forEach((r) => { for (let k = 0; k < 5; k++) rows.add(r + k) })
    f.conflict.text.forEach((s, i) => {
      const y = top + 44 + i * 17
      if (rows.has(i)) { ctx.fillStyle = alpha(p.groups[0], 0.1); ctx.fillRect(16, y - 13, 360, 17) }
      const col = s.startsWith('<<<') || s.startsWith('>>>') || s === '=======' ? p.groups[0] : p.ink
      text(ctx, s, 24, y, col, 11, 'left', col === p.ink ? 500 : 700)
    })
    text(ctx, tr ? 'Git iki değerden birini' : 'Git cannot pick one of', 420, top + 70, p.muted, 12)
    text(ctx, tr ? 'kendi seçemez:' : 'the two values itself:', 420, top + 88, p.muted, 12)
    text(ctx, 'ESIK = 0.40  (Can)', 420, top + 116, p.groups[1], 12, 'left', 600)
    text(ctx, 'ESIK = 0.25  (Ayşe)', 420, top + 136, p.groups[3], 12, 'left', 600)
    text(ctx, tr ? 'düzelt → git add → git commit' : 'fix → git add → git commit', 420, top + 166, p.ink, 12, 'left', 600)
  } else if (f.file) {
    if (f.fileTitle) text(ctx, f.fileTitle[tr ? 0 : 1], 24, top + 22, p.ink, 12, 'left', 700)
    const hl = new Set(f.hl ?? [])
    const x0 = 24, w0 = f.hash ? 300 : W - 48
    f.file.forEach((s, i) => {
      const y = top + 48 + i * 24
      if (hl.has(i)) { ctx.fillStyle = alpha(p.groups[2], 0.25); ctx.fillRect(x0 - 6, y - 16, w0, 22) }
      text(ctx, String(i), x0, y, p.muted, 11)
      text(ctx, s, x0 + 22, y, p.ink, 12, 'left', hl.has(i) ? 700 : 500)
    })
    if (f.hash) {
      const hx = 350, s = f.hash.s, n = [...s].length
      text(ctx, tr ? 'özet girdisi: str(ebeveyn) + str(içerik)' : 'digest input: str(parents) + str(content)', hx, top + 26, p.muted, 11, 'left', 600)
      const seg = [...s].slice(Math.max(0, f.hash.upto - 34), f.hash.upto).join('')
      text(ctx, '…' + seg, hx, top + 54, p.ink, 11, 'left', 500)
      const bw = 330
      ctx.fillStyle = p.line; ctx.fillRect(hx, top + 66, bw, 8)
      ctx.fillStyle = p.brand; ctx.fillRect(hx, top + 66, (bw * f.hash.upto) / n, 8)
      text(ctx, `${f.hash.upto} / ${n}`, hx + bw, top + 90, p.muted, 10, 'right')
      text(ctx, 'h = (h · 31 + ord(ch)) mod 2³²', hx, top + 118, p.muted, 12)
      text(ctx, `h = ${f.hash.h}`, hx, top + 146, p.ink, 14, 'left', 700)
      const hex = f.hash.h.toString(16).padStart(8, '0')
      text(ctx, `= 0x${hex}`, hx, top + 170, p.ink, 14, 'left', 600)
      if (f.hash.upto === n) text(ctx, (tr ? 'kimlik: ' : 'id: ') + hex.slice(0, 7), hx, top + 202, p.brand, 16, 'left', 700)
    }
  }
}
