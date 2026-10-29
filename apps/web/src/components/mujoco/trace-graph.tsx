'use client'
// Sensör/motor zaman grafiği: canvas, son 10 sn. Veri Trace'tedir (React durumu değil); kutu ~15 Hz kendini yeniden çizer.
import { useEffect, useRef } from 'react'
import type { Trace } from '@/lib/mujoco/trace'

export const GRAPH_COLORS = ['#2f80ed', '#eb5757', '#27ae60', '#f2994a', '#9b51e0', '#00a8b5', '#c0392b', '#7f8c8d']

export function TraceGraph({ trace, names, label }: { trace: { current: Trace }; names: string[]; label: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const sel = useRef(names); sel.current = names

  useEffect(() => {
    const cv = ref.current; if (!cv) return
    const ctx = cv.getContext('2d'); if (!ctx) return
    const css = getComputedStyle(cv)
    const muted = css.getPropertyValue('--muted').trim() || '#6b5848'
    const grid = css.getPropertyValue('--border').trim() || '#e4d6c5'
    const draw = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      const w = cv.clientWidth, h = cv.clientHeight
      if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr) }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      const tr = trace.current, ts = tr.times
      const padL = 44, padB = 18, padT = 6, padR = 8
      const pw = w - padL - padR, ph = h - padT - padB
      const [lo, hi] = tr.range(sel.current)
      const t1 = ts.length ? ts[ts.length - 1] : 0, t0 = t1 - tr.window
      const X = (t: number) => padL + ((t - t0) / tr.window) * pw
      const Y = (v: number) => padT + (1 - (v - lo) / (hi - lo)) * ph
      ctx.font = '11px system-ui, sans-serif'; ctx.fillStyle = muted; ctx.strokeStyle = grid; ctx.lineWidth = 1
      for (let i = 0; i <= 4; i++) {
        const v = lo + ((hi - lo) * i) / 4, y = Y(v)
        ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - padR, y); ctx.stroke()
        ctx.textAlign = 'right'; ctx.fillText(v.toFixed(Math.abs(hi - lo) < 2 ? 2 : 1), padL - 4, y + 3)
      }
      ctx.textAlign = 'center'
      for (let s = Math.ceil(t0); s <= t1; s += 2) ctx.fillText(`${s}s`, X(s), h - 4)
      sel.current.forEach((n, k) => {
        const ys = tr.series(n); if (ys.length < 2) return
        ctx.strokeStyle = GRAPH_COLORS[k % GRAPH_COLORS.length]; ctx.lineWidth = 2; ctx.beginPath()
        let started = false
        for (let i = 0; i < ys.length; i++) {
          if (!Number.isFinite(ys[i])) continue
          const x = X(ts[i]), y = Y(ys[i])
          if (!started) { ctx.moveTo(x, y); started = true } else ctx.lineTo(x, y)
        }
        ctx.stroke()
      })
    }
    const id = setInterval(draw, 66)
    draw()
    return () => clearInterval(id)
  }, [trace])

  return <canvas ref={ref} className="mj-graph" role="img" aria-label={label} data-testid="mujoco-graph" />
}
