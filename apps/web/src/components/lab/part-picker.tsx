'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { PartType } from '@/lib/lab/contract'
import { pickerGroups } from '@/lib/lab/parts'
import { partName, partShortName } from '@/lib/lab/text'
import { useLocale, useT } from '@/i18n/client'
import { PartIcon } from './part-art'

interface Props {
  types: PartType[]
  disabled: boolean
  /** Sürükle-bırak: ekran koordinatında bırakıldı. */
  onDrop: (type: PartType, clientX: number, clientY: number) => void
  /** Tıklama / klavye: tuvale otomatik yerleştir. */
  onAdd: (type: PartType) => void
}

export function PartPicker({ types, disabled, onDrop, onAdd }: Props) {
  const t = useT()
  const locale = useLocale()
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

  const groups = useMemo(() => pickerGroups(types, q, locale === 'tr' ? undefined : (ty) => `${partName(t, ty)} ${partShortName(t, ty)}`), [q, types, locale, t])

  return (
    <div className="lab-picker" ref={root}>
      <button type="button" className="lab-addbtn" data-testid="lab-add" aria-expanded={open} aria-haspopup="dialog" disabled={disabled} onClick={() => setOpen((o) => !o)} title={t('lab.picker.add')}>
        <span aria-hidden="true">＋</span> {t('lab.picker.add')}
      </button>
      {open && (
        <div className={`lab-picker-panel${ghost ? ' dragging' : ''}`} role="dialog" aria-label={t('lab.picker.dialog')}>
          <input
            type="search" className="lab-picker-search" value={q} onChange={(e) => setQ(e.target.value)} autoFocus
            placeholder={t('lab.picker.search')} aria-label={t('lab.picker.searchAria')}
          />
          <div className="lab-picker-list">
            {groups.length === 0 && <p className="lab-hint">{t('lab.picker.none')}</p>}
            {groups.map((g) => (
              <div key={g.key} className="lab-picker-group">
                <h4>{t(`lab.picker.cat.${g.key}`)}</h4>
                <div className="lab-picker-items">
                  {g.types.map((pt) => (
                    <button
                      key={pt} type="button" className="lab-pitem" data-palette={pt}
                      aria-label={t('lab.picker.addItem', { name: partName(t, pt) })} title={t('lab.picker.itemTitle', { name: partName(t, pt) })}
                      onPointerDown={(e) => { if (e.pointerType === 'mouse' && e.button !== 0) return; drag.current = { type: pt, sx: e.clientX, sy: e.clientY, active: false } }}
                      onClick={(e) => { if (e.detail === 0) { onAdd(pt); setOpen(false) } }}
                    >
                      <PartIcon type={pt} size={36} />
                      <span>{partShortName(t, pt)}</span>
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
