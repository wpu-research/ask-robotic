'use client'
import { useEffect, useRef } from 'react'
import type { SceneProps } from '@/lib/games/types'
import type { TurtleLevelData, TurtleState } from '@/lib/games/kaplumbaga/engine'
import { DEFAULT_COLOUR, DEFAULT_WIDTH, SIZE } from '@/lib/games/kaplumbaga/geometry'
import { render } from './draw'

const DPR = 2

/** Kaplumbağa sahnesi: ops listesini canvas üzerinde animasyonla oynatır (süreler hız çarpanına bölünür). */
export default function Scene({ level, frame, speed }: SceneProps<TurtleState>) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const anim = useRef({ idx: 0, t: 0, last: 0, raf: 0 })
  const live = useRef({ frame, speed, level })
  live.current = { frame, speed, level }

  const paint = () => {
    const c = canvas.current
    const ctx = c?.getContext('2d')
    if (!c || !ctx) return
    const { frame: f, level: l } = live.current
    const a = anim.current
    const op = f.ops[a.idx]
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
    render(ctx, {
      start: f.start, target: (l.data as TurtleLevelData).target, ops: f.ops, idx: a.idx,
      frac: op ? Math.min(1, a.t / Math.max(1, op.ms)) : 0,
      base: { colour: DEFAULT_COLOUR, width: DEFAULT_WIDTH }, showTarget: true,
    })
  }

  useEffect(() => {
    const a = anim.current
    cancelAnimationFrame(a.raf)
    if (frame.ops.length < a.idx || frame.ops.length === 0) { a.idx = 0; a.t = 0 }
    const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) { a.idx = frame.ops.length; a.t = 0 }
    a.last = 0
    const tick = (now: number) => {
      const { frame: f, speed: sp } = live.current
      const dt = a.last ? Math.min(100, now - a.last) : 0
      a.last = now
      a.t += dt * Math.max(0.1, sp)
      while (a.idx < f.ops.length && a.t >= f.ops[a.idx].ms) { a.t -= f.ops[a.idx].ms; a.idx++ }
      if (a.idx >= f.ops.length) a.t = 0
      paint()
      if (a.idx < f.ops.length) a.raf = requestAnimationFrame(tick)
    }
    paint()
    if (a.idx < frame.ops.length) a.raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(a.raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frame.ops, level])

  return (
    <canvas
      ref={canvas}
      width={SIZE * DPR}
      height={SIZE * DPR}
      role="img"
      aria-label="Kaplumbağanın çizim alanı. Gri noktalı çizgiler hedef şablondur."
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  )
}
