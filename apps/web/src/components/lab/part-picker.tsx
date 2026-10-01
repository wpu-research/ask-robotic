'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { PartType } from '@/lib/lab/contract'
import { PART_DEFS } from '@/lib/lab/geometry'
import { PartIcon } from './part-art'

const SHORT_NAME: Partial<Record<PartType, string>> = { ldr: 'LDR', ntc: 'NTC', pot: 'Potansiyometre' }
const CATEGORIES: { title: string; types: PartType[] }[] = [
  { title: 'Temel', types: ['resistor'] },
  { title: 'Çıkış', types: ['led', 'rgbled', 'buzzer', 'servo'] },
  { title: 'Giriş ve sensör', types: ['button', 'pot', 'ldr', 'ntc'] },
]
const KEYWORDS: Partial<Record<PartType, string>> = {
  led: 'ışık diyot lamba', rgbled: 'renkli ışık led', buzzer: 'ses zil hoparlör', servo: 'motor kol açı', button: 'düğme anahtar tuş',
  pot: 'ayarlı direnç knob', ldr: 'ışık sensörü foto', ntc: 'sıcaklık sensörü termistör', resistor: 'ohm',
}
const norm = (s: string) => s.toLocaleLowerCase('tr-TR')

interface Props {
  types: PartType[]
  disabled: boolean
  /** Sürükle-bırak: ekran koordinatında bırakıldı. */
  onDrop: (type: PartType, clientX: number, clientY: number) => void
  /** Tıklama / klavye: tuvale otomatik yerleştir. */
  onAdd: (type: PartType) => void
}

export function PartPicker({ types, disabled, onDrop, onAdd }: Props) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [ghost, setGhost] = useState<{ type: PartType; x: number; y: number } | null>(null)
  const drag = useRef<{ type: PartType; sx: number; sy: number; active: boolean } | null>(null)
  const root = useRef<HTMLDivElement>(null)
  const cb = useRef({ onDrop, onAdd })
  cb.current = { onDrop, onAdd }

  useEffect(() => {
    const move = (e: PointerEvent) => {
      const d = drag.current
      if (!d) return
      if (!d.active && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) > 6) d.active = true
      if (d.active) { setGhost({ type: d.type, x: e.clientX, y: e.clientY }); e.preventDefault() }
    }
    const up = (e: PointerEvent) => {
      const d = drag.current
      if (!d) return
      drag.current = null
      setGhost(null)
      if (d.active) { cb.current.onDrop(d.type, e.clientX, e.clientY); setOpen(false) }
      else { cb.current.onAdd(d.type); setOpen(false) }
    }
    const cancel = () => { drag.current = null; setGhost(null) }
    window.addEventListener('pointermove', move, { passive: false })
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', cancel)
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', cancel) }
  }, [])

  useEffect(() => {
    if (!open) return
    const onDoc = (e: PointerEvent) => { if (!drag.current && root.current && !root.current.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('pointerdown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('pointerdown', onDoc); document.removeEventListener('keydown', onKey) }
  }, [open])

  const groups = useMemo(() => {
    const needle = norm(q.trim())
    const match = (t: PartType) => !needle || norm(`${PART_DEFS[t].name} ${KEYWORDS[t] ?? ''}`).includes(needle)
    const known = new Set(CATEGORIES.flatMap((c) => c.types))
    const cats = [...CATEGORIES, { title: 'Diğer', types: types.filter((t) => !known.has(t)) }]
    return cats.map((c) => ({ title: c.title, types: c.types.filter((t) => types.includes(t) && match(t)) })).filter((c) => c.types.length)
  }, [q, types])

  return (
    <div className="lab-picker" ref={root}>
      <button type="button" className="lab-addbtn" data-testid="lab-add" aria-expanded={open} aria-haspopup="dialog" disabled={disabled} onClick={() => setOpen((o) => !o)} title="Parça ekle">
        <span aria-hidden="true">＋</span> Parça ekle
      </button>
      {open && (
        <div className={`lab-picker-panel${ghost ? ' dragging' : ''}`} role="dialog" aria-label="Parça seçici">
          <input
            type="search" className="lab-picker-search" value={q} onChange={(e) => setQ(e.target.value)} autoFocus
            placeholder="Parça ara…" aria-label="Parça ara"
          />
          <div className="lab-picker-list">
            {groups.length === 0 && <p className="lab-hint">Eşleşen parça yok.</p>}
            {groups.map((g) => (
              <div key={g.title} className="lab-picker-group">
                <h4>{g.title}</h4>
                <div className="lab-picker-items">
                  {g.types.map((t) => (
                    <button
                      key={t} type="button" className="lab-pitem" data-palette={t}
                      aria-label={`${PART_DEFS[t].name} ekle`} title={`${PART_DEFS[t].name}: sürükleyip bırak ya da tıkla`}
                      onPointerDown={(e) => { if (e.pointerType === 'mouse' && e.button !== 0) return; drag.current = { type: t, sx: e.clientX, sy: e.clientY, active: false } }}
                      onClick={(e) => { if (e.detail === 0) { onAdd(t); setOpen(false) } }}
                    >
                      <PartIcon type={t} size={36} />
                      <span>{SHORT_NAME[t] ?? PART_DEFS[t].name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {ghost && <div className="lab-ghost" style={{ left: ghost.x, top: ghost.y }} aria-hidden="true"><PartIcon type={ghost.type} /></div>}
    </div>
  )
}
