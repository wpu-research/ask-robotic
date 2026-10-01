'use client'
import { PROPS, type PartInstance, type PropDef, type PropValue } from '@/lib/lab/contract'
import { PART_DEFS } from '@/lib/lab/geometry'
import type { Selection } from './canvas'

interface Props {
  selection: Selection
  part: PartInstance | null
  wireInfo: string | null
  running: boolean
  locked: boolean
  latched: boolean
  onLatch: (v: boolean) => void
  onProp: (key: string, value: PropValue) => void
  onRotate: () => void
  onDelete: () => void
}

function Field({ def, value, disabled, onChange, partId }: { def: PropDef; value: PropValue; disabled: boolean; onChange: (v: PropValue) => void; partId: string }) {
  const id = `lab-prop-${partId}-${def.key}`
  if (def.kind === 'bool') {
    return (
      <label className="lab-field lab-switch" htmlFor={id}>
        <input id={id} type="checkbox" checked={value === true} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
        <span>{def.label}</span>
      </label>
    )
  }
  if (def.kind === 'select') {
    return (
      <div className="lab-field">
        <label htmlFor={id}>{def.label}</label>
        <select id={id} className="jr-select" value={String(value)} disabled={disabled} onChange={(e) => onChange(e.target.value)}>
          {def.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    )
  }
  const n = typeof value === 'number' ? value : Number(def.default)
  const log = def.max !== undefined && def.min !== undefined && def.max / Math.max(1, def.min) >= 1000
  // Çok geniş aralıklı değerler (direnç) için kaydırıcı logaritmiktir.
  const toSlider = (v: number) => (log ? Math.log10(Math.max(def.min!, v)) : v)
  const fromSlider = (s: number) => (log ? Math.round(10 ** s) : s)
  return (
    <div className="lab-field">
      <label htmlFor={id}>{def.label}</label>
      <div className="lab-num">
        <input
          id={id} type="range" disabled={disabled}
          min={log ? Math.log10(def.min!) : def.min} max={log ? Math.log10(def.max!) : def.max} step={log ? 0.01 : def.step}
          value={toSlider(n)} onChange={(e) => onChange(fromSlider(Number(e.target.value)))}
          aria-valuetext={`${n}${def.unit ? ' ' + def.unit : ''}`}
        />
        <input
          type="number" className="lab-numbox" aria-label={`${def.label} değeri`} disabled={disabled}
          min={def.min} max={def.max} step={def.step} value={n}
          onChange={(e) => {
            const v = Number(e.target.value)
            if (Number.isFinite(v)) onChange(Math.min(def.max ?? v, Math.max(def.min ?? v, v)))
          }}
        />
        {def.unit && <small>{def.unit}</small>}
      </div>
    </div>
  )
}

export function PropsPanel({ selection, part, wireInfo, running, locked, latched, onLatch, onProp, onRotate, onDelete }: Props) {
  if (!selection) {
    return <section className="lab-props" aria-label="Özellikler"><p className="jr-empty">Bir parçaya ya da kabloya tıkla; özellikleri burada görünür.</p></section>
  }
  if (selection.kind === 'wire') {
    return (
      <section className="lab-props" aria-label="Özellikler">
        <div className="lab-props-head"><b>Kablo</b><small>{wireInfo}</small></div>
        <div className="jr-controls"><button type="button" className="jr-btn small" disabled={running} onClick={onDelete}>Kabloyu sil</button></div>
        {running && <p className="lab-hint">Benzetim çalışırken kablo silinemez. Önce Dur.</p>}
      </section>
    )
  }
  if (!part) return null
  const defs = PROPS[part.type]
  return (
    <section className="lab-props" aria-label="Özellikler" data-props-for={part.id}>
      <div className="lab-props-head"><b>{PART_DEFS[part.type].name}</b><small>{part.id}{locked ? ' · kilitli' : ''}</small></div>
      {defs.length === 0 && <p className="lab-hint">Bu parçanın ayarlanabilir özelliği yok.</p>}
      {defs.map((d) => (
        <Field
          key={d.key} def={d} partId={part.id} value={part.props[d.key] ?? d.default}
          disabled={running && !d.live} onChange={(v) => onProp(d.key, v)}
        />
      ))}
      {part.type === 'button' && (
        <label className="lab-field lab-switch">
          <input type="checkbox" checked={latched} onChange={(e) => onLatch(e.target.checked)} />
          <span>Tıklayınca kilitle (basılı tutmak yerine aç/kapa)</span>
        </label>
      )}
      {running && defs.some((d) => !d.live) && <p className="lab-hint">Çalışırken yalnız canlı özellikler değişir.</p>}
      <div className="jr-controls">
        <button type="button" className="jr-btn small" disabled={running || locked} onClick={onRotate} aria-label="Parçayı döndür (R)">Döndür (R)</button>
        <button type="button" className="jr-btn small" disabled={running || locked} onClick={onDelete} aria-label="Parçayı sil (Delete)">Sil</button>
      </div>
    </section>
  )
}
