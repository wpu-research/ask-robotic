'use client'
import { useEffect, useRef, useState } from 'react'
import { BACKGROUNDS, CHARACTERS } from '@/lib/jr/blocks'
import type { Page, RuntimeSprite } from '@/lib/jr/types'
import { STAGE_H, STAGE_W } from '@/lib/jr/types'

interface Props {
  page: Page
  /** Çalışma zamanı durumu; yoksa karakterler başlangıç konumunda çizilir. */
  runtime: RuntimeSprite[] | null
  hops: Record<string, number>
  selectedId: string | null
  onTap: (spriteId: string) => void
  onSelect: (spriteId: string) => void
}

export function Stage({ page, runtime, hops, selectedId, onTap, onSelect }: Props) {
  const outer = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  useEffect(() => {
    const el = outer.current
    if (!el) return
    const ro = new ResizeObserver(() => setScale(el.clientWidth / STAGE_W))
    ro.observe(el)
    setScale(el.clientWidth / STAGE_W)
    return () => ro.disconnect()
  }, [])

  const sprites: RuntimeSprite[] =
    runtime ?? page.sprites.map((s) => ({ id: s.id, character: s.character, x: s.x, y: s.y, heading: 0, scale: 1, visible: true, say: null }))

  return (
    <div ref={outer} className="jr-stage" style={{ aspectRatio: `${STAGE_W} / ${STAGE_H}` }} data-testid="jr-stage">
      <div
        className="jr-stage-inner"
        style={{ width: STAGE_W, height: STAGE_H, transform: `scale(${scale})`, background: BACKGROUNDS[page.background]?.css ?? BACKGROUNDS.sky.css }}
      >
        {sprites.map((s) => {
          if (!s.visible) return null
          const glyph = CHARACTERS[s.character]?.glyph ?? '❓'
          return (
            <div key={s.id} className="jr-sprite-pos" style={{ left: s.x, top: s.y }}>
              {s.say && <div className="jr-bubble">{s.say}</div>}
              <button
                type="button"
                className={`jr-sprite${selectedId === s.id ? ' selected' : ''}`}
                data-sprite={s.id}
                data-x={Math.round(s.x)}
                data-y={Math.round(s.y)}
                data-heading={Math.round(s.heading)}
                data-scale={s.scale.toFixed(2)}
                aria-label={`${CHARACTERS[s.character]?.label ?? 'Karakter'} (dokununca başlayan betiği çalıştırır)`}
                onClick={() => { onSelect(s.id); onTap(s.id) }}
              >
                <span key={hops[s.id] ?? 0} className={hops[s.id] ? 'jr-hop' : undefined} style={{ display: 'block', transform: `rotate(${s.heading}deg) scale(${s.scale})` }}>
                  {glyph}
                </span>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
