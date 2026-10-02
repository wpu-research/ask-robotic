'use client'
import { useEffect, useRef } from 'react'
import { PALETTE_RGB } from '@/lib/oyun/palette'
import { parse } from '@/lib/oyun/pixels'

/** Bir piksel resmin keskin (yumuşatmasız) küçük önizlemesi. */
export function PixelThumb({ rows, scale = 2, className, title }: { rows: readonly string[]; scale?: number; className?: string; title?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const key = rows.join('|')
  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    const p = parse(rows)
    cv.width = p.w
    cv.height = p.h
    const ctx = cv.getContext('2d')
    if (!ctx) return
    const img = ctx.createImageData(p.w, p.h)
    for (let i = 0; i < p.d.length; i++) {
      const v = p.d[i]
      if (v < 0) { img.data[i * 4 + 3] = 0; continue }
      const [r, g, b] = PALETTE_RGB[v]
      img.data[i * 4] = r; img.data[i * 4 + 1] = g; img.data[i * 4 + 2] = b; img.data[i * 4 + 3] = 255
    }
    ctx.putImageData(img, 0, 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  const w = rows[0]?.length ?? 8, h = rows.length
  return <canvas ref={ref} className={className ?? 'oy-thumb'} style={{ width: w * scale, height: h * scale }} aria-hidden="true" title={title} />
}
