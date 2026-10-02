// Kaplumbağa sahnesi: canvas çizimi (saf işlevler). Kendi çizdiğimiz özgün kaplumbağa.
import type { TurtleOp, TurtleStart } from '@/lib/games/kaplumbaga/engine'
import { SIZE, type Stroke } from '@/lib/games/kaplumbaga/geometry'

export interface Pose { x: number; y: number; heading: number; pen: boolean; colour: string; width: number }

/** `idx` adet işlem tamamlandı, sıradaki işlem `frac` (0..1) oranında oynuyor. */
export function poseAt(start: TurtleStart, ops: readonly TurtleOp[], idx: number, frac: number, base: { colour: string; width: number }): Pose {
  const p: Pose = { x: start.x, y: start.y, heading: start.heading, pen: true, colour: base.colour, width: base.width }
  const apply = (o: TurtleOp, f: number) => {
    if (o.k === 'move') { p.x = o.x1 + (o.x2 - o.x1) * f; p.y = o.y1 + (o.y2 - o.y1) * f; p.pen = o.pen; p.colour = o.colour; p.width = o.width }
    else if (o.k === 'turn') p.heading = o.from + (o.to - o.from) * f
    else { p.pen = o.pen; p.colour = o.colour; p.width = o.width }
  }
  for (let i = 0; i < idx && i < ops.length; i++) apply(ops[i], 1)
  if (idx < ops.length) apply(ops[idx], frac)
  return p
}

function stroke(ctx: CanvasRenderingContext2D, s: Stroke, alpha = 1) {
  ctx.globalAlpha = alpha
  ctx.strokeStyle = s.colour
  ctx.lineWidth = s.width
  ctx.beginPath(); ctx.moveTo(s.x1, s.y1); ctx.lineTo(s.x2, s.y2); ctx.stroke()
  ctx.globalAlpha = 1
}

function drawTurtle(ctx: CanvasRenderingContext2D, p: Pose) {
  ctx.save()
  ctx.translate(p.x, p.y)
  ctx.rotate((p.heading * Math.PI) / 180) // +y aşağı: 0° = yukarı bakış
  ctx.globalAlpha = p.pen ? 1 : 0.55
  // bacaklar
  ctx.fillStyle = '#7fc97f'
  for (const [lx, ly] of [[-11, -8], [11, -8], [-11, 9], [11, 9]]) { ctx.beginPath(); ctx.ellipse(lx, ly, 5, 3.5, lx < 0 ? -0.5 : 0.5, 0, Math.PI * 2); ctx.fill() }
  // kuyruk
  ctx.beginPath(); ctx.moveTo(-3, 14); ctx.lineTo(0, 22); ctx.lineTo(3, 14); ctx.closePath(); ctx.fill()
  // baş
  ctx.beginPath(); ctx.arc(0, -16, 6.5, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#1b3b1b'
  ctx.beginPath(); ctx.arc(-2.5, -18, 1.1, 0, Math.PI * 2); ctx.arc(2.5, -18, 1.1, 0, Math.PI * 2); ctx.fill()
  // kabuk
  ctx.fillStyle = '#2e9e5b'; ctx.strokeStyle = '#1d6b3c'; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.ellipse(0, 0, 13, 15, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
  ctx.strokeStyle = '#1d6b3c'; ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(-5, -6); ctx.lineTo(5, -6); ctx.lineTo(7, 3); ctx.lineTo(0, 9); ctx.lineTo(-7, 3); ctx.closePath()
  ctx.moveTo(-5, -6); ctx.lineTo(-11, -9); ctx.moveTo(5, -6); ctx.lineTo(11, -9); ctx.moveTo(7, 3); ctx.lineTo(12, 7); ctx.moveTo(-7, 3); ctx.lineTo(-12, 7); ctx.moveTo(0, 9); ctx.lineTo(0, 15)
  ctx.stroke()
  // kalem ucu: kuyruktaki renkli nokta (kalem aşağıdaysa dolu)
  ctx.globalAlpha = 1
  ctx.fillStyle = p.pen ? p.colour : 'transparent'
  ctx.strokeStyle = p.colour; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
  ctx.restore()
}

export interface DrawInput {
  start: TurtleStart
  target: readonly Stroke[]
  ops: readonly TurtleOp[]
  idx: number
  frac: number
  base: { colour: string; width: number }
  showTarget: boolean
}

export function render(ctx: CanvasRenderingContext2D, inp: DrawInput) {
  ctx.clearRect(0, 0, SIZE, SIZE)
  ctx.fillStyle = '#fffdf5'; ctx.fillRect(0, 0, SIZE, SIZE)
  // ince ızgara
  ctx.strokeStyle = 'rgba(120,140,170,0.14)'; ctx.lineWidth = 1
  ctx.beginPath()
  for (let v = 40; v < SIZE; v += 40) { ctx.moveTo(v, 0); ctx.lineTo(v, SIZE); ctx.moveTo(0, v); ctx.lineTo(SIZE, v) }
  ctx.stroke()
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'
  // hedef şablon (soluk, gerçek renkleriyle)
  if (inp.showTarget) {
    ctx.setLineDash([2, 7])
    for (const s of inp.target) stroke(ctx, { ...s, width: Math.max(3, Math.min(s.width, 6)), colour: '#7c8aa5' }, 0.9)
    ctx.setLineDash([])
  }
  // çizim
  const n = Math.min(inp.idx, inp.ops.length)
  for (let i = 0; i < n; i++) { const o = inp.ops[i]; if (o.k === 'move' && o.pen) stroke(ctx, o) }
  const cur = inp.ops[inp.idx]
  if (cur && cur.k === 'move' && cur.pen && inp.frac > 0) {
    stroke(ctx, { x1: cur.x1, y1: cur.y1, x2: cur.x1 + (cur.x2 - cur.x1) * inp.frac, y2: cur.y1 + (cur.y2 - cur.y1) * inp.frac, colour: cur.colour, width: cur.width })
  }
  drawTurtle(ctx, poseAt(inp.start, inp.ops, inp.idx, inp.frac, inp.base))
}
