// Ders: yapay zekâ ajanı sahnesi. Solda hedef ve adım kartları zaman çizelgesi (düşün → çağrı → gözlem, hatada yeniden deneme);
// sağda depo haritası ve robot, ortak arayüzle tanımlı araç listesi (MCP fikri) ve durum (batarya, tutucu, adım sayısı).
import { alpha, clear, dot, text, FONT, type Draw, type Pal } from '../draw'
import { MAX_STEPS, PLACES, TASKS, TOOLS, type AgentFrame, type Step } from '@/lib/ml/yapay-zeka-ajani'
import type { Lang } from '@/lib/ml/core'

function box(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fill: string, stroke: string, lw = 1.2, r = 7) {
  ctx.fillStyle = fill; ctx.strokeStyle = stroke; ctx.lineWidth = lw
  ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h); ctx.fill(); ctx.stroke()
}
/** Genişliğe sığmayan metni "…" ile kısaltır. */
function fit(ctx: CanvasRenderingContext2D, s: string, w: number, size: number, weight = 500): string {
  ctx.font = `${weight} ${size}px ${FONT}`
  if (ctx.measureText(s).width <= w) return s
  let t = s
  while (t.length > 1 && ctx.measureText(t + '…').width > w) t = t.slice(0, -1)
  return t + '…'
}

export const draw: Draw = (ctx, W, H, f0, p, lang) => {
  const f = f0 as AgentFrame
  clear(ctx, W, H, p)
  const lw = 456
  // ---- hedef
  box(ctx, 14, 12, lw, 46, alpha(p.brand, 0.08), p.brand, 1.4)
  text(ctx, lang === 'tr' ? `görev ${f.task + 1} · hedef` : `task ${f.task + 1} · goal`, 24, 29, p.brand, 11, 'left', 700)
  text(ctx, fit(ctx, TASKS[f.task].goal[lang], lw - 20, 11.5, 600), 24, 47, p.ink, 11.5, 'left', 600)
  // ---- zaman çizelgesi ya da özet
  if (f.phase === 'summary' && f.summary) summary(ctx, f, p, lang, lw)
  else timeline(ctx, f, p, lang, lw)
  // ---- harita
  const mx = 484, my = 12, mw = W - 14 - mx, s = mw / 10.6, mh = s * 6.4
  box(ctx, mx, my, mw, mh, p.soft, p.line, 1, 6)
  const X = (x: number) => mx + s * (x + 0.3), Y = (y: number) => my + mh - s * (y + 0.6)
  Object.values(PLACES).forEach((pl) => {
    ctx.fillStyle = alpha(p.groups[1], 0.18); ctx.fillRect(X(pl.xy[0]) - 8, Y(pl.xy[1]) - 8, 16, 16)
    text(ctx, pl.label[lang], X(pl.xy[0]), Y(pl.xy[1]) + 20, p.muted, 9, 'center', 600)
  })
  if (f.trail.length === 2) {
    ctx.strokeStyle = p.brand; ctx.lineWidth = 2; ctx.setLineDash([4, 3])
    ctx.beginPath(); ctx.moveTo(X(f.trail[0][0]), Y(f.trail[0][1])); ctx.lineTo(X(f.trail[1][0]), Y(f.trail[1][1])); ctx.stroke(); ctx.setLineDash([])
  }
  dot(ctx, X(f.pos[0]), Y(f.pos[1]), 7, p.brand)
  if (f.held) { ctx.fillStyle = p.groups[2]; ctx.fillRect(X(f.pos[0]) - 4, Y(f.pos[1]) - 15, 8, 8) }
  // ---- araç listesi (MCP)
  const ty = my + mh + 22
  text(ctx, lang === 'tr' ? 'araçlar (ortak arayüz, MCP)' : 'tools (common interface, MCP)', mx, ty, p.muted, 11, 'left', 700)
  const cur = f.steps[f.upto - 1]
  const failed = f.phase === 'obs' && cur && !cur.ok
  TOOLS.forEach((t, i) => {
    const y = ty + 8 + i * 25
    const on = f.tool === t.name && f.phase !== 'think'
    box(ctx, mx, y, mw, 21, on ? (failed ? alpha(p.groups[0], 0.14) : alpha(p.brand, 0.14)) : p.bg, on ? (failed ? p.groups[0] : p.brand) : p.line, on ? 1.6 : 1, 5)
    text(ctx, t.name, mx + 7, y + 15, p.ink, 10, 'left', 700)
    text(ctx, fit(ctx, t.desc[lang], mw - 98, 9), mx + mw - 6, y + 14, p.muted, 9, 'right', 500)
  })
  // ---- durum
  const sy = ty + 8 + 6 * 25 + 14
  text(ctx, lang === 'tr' ? 'batarya' : 'battery', mx, sy + 10, p.muted, 10, 'left', 600)
  ctx.fillStyle = p.soft; ctx.fillRect(mx + 58, sy, mw - 100, 12)
  ctx.fillStyle = f.battery < 20 ? p.groups[0] : p.groups[3]; ctx.fillRect(mx + 58, sy, (mw - 100) * Math.max(0, f.battery) / 100, 12)
  text(ctx, `%${f.battery}`.replace(/^%(\d+)$/, lang === 'tr' ? '%$1' : '$1%'), mx + mw, sy + 10, p.ink, 10, 'right', 700)
  text(ctx, lang === 'tr' ? `tutucu: ${f.held ? 'kutu' : 'boş'}` : `gripper: ${f.held ? 'box' : 'empty'}`, mx, sy + 30, p.muted, 10, 'left', 600)
  const k = cur ? cur.n : 0
  text(ctx, lang === 'tr' ? 'adım' : 'step', mx, sy + 50, p.muted, 10, 'left', 600)
  for (let i = 0; i < MAX_STEPS; i++) {
    const x = mx + 40 + i * ((mw - 40) / MAX_STEPS)
    dot(ctx, x + 5, sy + 46, 5, i < k ? p.brand : p.line)
  }
}

function card(ctx: CanvasRenderingContext2D, s: Step, x: number, y: number, w: number, h: number, show: 'think' | 'call' | 'all', p: Pal, lang: Lang, last: boolean) {
  const err = show === 'all' && !s.ok
  box(ctx, x, y, w, h, last ? p.bg : p.soft, err ? p.groups[0] : last ? p.brand : p.line, last ? 1.6 : 1)
  dot(ctx, x + 16, y + 16, 10, err ? p.groups[0] : s.tool ? p.brand : p.groups[3])
  text(ctx, `${s.n}`, x + 16, y + 20, p.bg, 11, 'center', 700)
  const tx = x + 34, tw = w - 42
  const first = s.attempt > 1 ? (lang === 'tr' ? `yeniden dene (deneme ${s.attempt} / 3)` : `retry (try ${s.attempt} / 3)`) : `${lang === 'tr' ? 'düşün' : 'think'}: ${s.thought[lang]}`
  text(ctx, fit(ctx, first, tw, 10.5, 500), tx, y + 15, s.attempt > 1 ? p.groups[0] : p.muted, 10.5, 'left', 500)
  if (!s.tool) { text(ctx, lang === 'tr' ? '✓ hedef sağlandı, döngü biter' : '✓ goal met, loop ends', tx, y + 31, p.groups[3], 11, 'left', 700); return }
  if (show === 'think') return
  text(ctx, fit(ctx, `→ ${s.tool} ${s.args}`, tw, 11, 700), tx, y + 31, p.brand, 11, 'left', 700)
  if (show === 'call') { text(ctx, '…', tx, y + 46, p.muted, 11, 'left', 600); return }
  text(ctx, fit(ctx, `← ${s.obs}`, tw, 10.5, 600), tx, y + 46, err ? p.groups[0] : p.groups[3], 10.5, 'left', 600)
}

function timeline(ctx: CanvasRenderingContext2D, f: AgentFrame, p: Pal, lang: Lang, lw: number) {
  const y0 = 68, ch = 52, g = 6
  const maxCards = Math.floor((452 - y0) / (ch + g))
  if (f.upto === 0) {
    const L = lang === 'tr'
      ? ['Döngü: düşün → araç seç → çağır → gözle → tekrar.', 'Ajan bir dil modeli değil: belleğe bakan birkaç "eğer" kuralı.', 'Araç hata dönerse aynı çağrı en fazla 3 kez denenir.', `En fazla ${MAX_STEPS} adım.`]
      : ['Loop: think → pick a tool → call → observe → repeat.', 'The agent is not a language model: a few "if" rules over its memory.', 'If a tool returns an error the same call is tried up to 3 times.', `At most ${MAX_STEPS} steps.`]
    L.forEach((s, i) => text(ctx, s, 24, y0 + 24 + i * 22, i === 1 ? p.brand : p.ink, 12, 'left', i === 1 ? 700 : 500))
    return
  }
  const vis = f.steps.slice(0, f.upto)
  const from = Math.max(0, vis.length - maxCards)
  vis.slice(from).forEach((s, j) => {
    const i = from + j
    const last = i === vis.length - 1
    const show = !last ? 'all' : f.phase === 'think' ? 'think' : f.phase === 'call' || f.phase === 'move' ? 'call' : 'all'
    card(ctx, s, 14, y0 + j * (ch + g), lw, ch, show, p, lang, last)
  })
}

function summary(ctx: CanvasRenderingContext2D, f: AgentFrame, p: Pal, lang: Lang, lw: number) {
  const y0 = 84
  text(ctx, lang === 'tr' ? 'aynı ajan, dört görev' : 'same agent, four tasks', 14, y0, p.ink, 13, 'left', 700)
  const hd = lang === 'tr' ? ['görev', 'araç çağrısı', 'yeniden deneme', 'sonuç'] : ['task', 'tool calls', 'retries', 'result']
  const cx = [14, 236, 340, 410]
  hd.forEach((h, i) => text(ctx, h, cx[i] + (i === 1 ? 40 : i ? 30 : 0), y0 + 26, p.muted, 10, i ? 'center' : 'left', 700))
  f.summary!.forEach((q, t) => {
    const y = y0 + 36 + t * 48
    box(ctx, 14, y, lw, 40, t === f.task ? alpha(p.brand, 0.08) : p.bg, t === f.task ? p.brand : p.line)
    text(ctx, fit(ctx, `${t + 1}. ${TASKS[t].goal[lang]}`, 206, 11, 600), 24, y + 25, p.ink, 11, 'left', 600)
    const mw = 60
    ctx.fillStyle = p.soft; ctx.fillRect(cx[1], y + 14, mw, 12)
    ctx.fillStyle = p.brand; ctx.fillRect(cx[1], y + 14, (mw * q.calls) / MAX_STEPS, 12)
    text(ctx, `${q.calls}`, cx[1] + mw + 4, y + 25, p.ink, 11, 'left', 700)
    text(ctx, `${q.retries}`, cx[2] + 30, y + 25, q.retries ? p.groups[0] : p.muted, 12, 'center', 700)
    text(ctx, q.done ? '✓' : '✗', cx[3] + 30, y + 26, q.done ? p.groups[3] : p.groups[0], 15, 'center', 700)
  })
  text(ctx, lang === 'tr' ? `sınır: ${MAX_STEPS} adım, çağrı başına 3 deneme` : `limit: ${MAX_STEPS} steps, 3 tries per call`, 14, y0 + 36 + 4 * 48 + 16, p.muted, 11, 'left', 600)
}
