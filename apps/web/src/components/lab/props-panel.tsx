'use client'
import { PINS, PROPS, type PartInstance, type PartRuntime, type PartType, type PropDef, type PropValue } from '@/lib/lab/contract'
import { formatMeasurement } from '@/lib/lab/measure'
import { partName, propLabel, propOptionLabel } from '@/lib/lab/text'
import { useLocale, useT } from '@/i18n/client'
import { guideForPartType } from '@/lib/parca-rehberi'
import { logEvent } from '@/lib/events'
import type { Selection } from './canvas'
import { PhoneTerminal } from './phone-terminal'

interface Props {
  selection: Selection
  part: PartInstance | null
  /** Seçili parçanın çalışma zamanı durumu (yalnız çalışırken). */
  runtime?: PartRuntime | null
  wireInfo: string | null
  running: boolean
  locked: boolean
  latched: boolean
  onLatch: (v: boolean) => void
  onProp: (key: string, value: PropValue) => void
  onRotate: () => void
  onDelete: () => void
  /** HC-05 seçiliyken telefondan Bluetooth ile metin gönderir. */
  onPhoneSend?: (text: string) => void
}

function Field({ def, type, value, disabled, onChange, partId }: { def: PropDef; type: PartType; value: PropValue; disabled: boolean; onChange: (v: PropValue) => void; partId: string }) {
  const t = useT()
  const id = `lab-prop-${partId}-${def.key}`
  const label = propLabel(t, type, def)
  if (def.kind === 'bool') {
    return (
      <label className="lab-field lab-switch" htmlFor={id}>
        <input id={id} type="checkbox" checked={value === true} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
        <span>{label}</span>
      </label>
    )
  }
  if (def.kind === 'select') {
    return (
      <div className="lab-field">
        <label htmlFor={id}>{label}</label>
        <select id={id} className="jr-select" value={String(value)} disabled={disabled} onChange={(e) => onChange(e.target.value)}>
          {def.options?.map((o) => <option key={o.value} value={o.value}>{propOptionLabel(t, type, def.key, o)}</option>)}
        </select>
      </div>
    )
  }
  const n = typeof value === 'number' ? value : Number(def.default)
  const log = def.max !== undefined && def.min !== undefined && def.min > 0 && def.max / def.min >= 1000
  // Çok geniş aralıklı değerler (direnç) için kaydırıcı logaritmiktir.
  const toSlider = (v: number) => (log ? Math.log10(Math.max(def.min!, v)) : v)
  const fromSlider = (s: number) => (log ? Math.round(10 ** s) : s)
  return (
    <div className="lab-field">
      <label htmlFor={id}>{label}</label>
      <div className="lab-num">
        <input
          id={id} type="range" disabled={disabled}
          min={log ? Math.log10(def.min!) : def.min} max={log ? Math.log10(def.max!) : def.max} step={log ? 0.01 : def.step}
          value={toSlider(n)} onChange={(e) => onChange(fromSlider(Number(e.target.value)))}
          aria-valuetext={`${n}${def.unit ? ' ' + def.unit : ''}`}
        />
        <input
          type="number" className="lab-numbox" aria-label={t('lab.props.valueOf', { label })} disabled={disabled}
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

/** Sanal ölçüm kutusu (multimetre karşılığı): uçlar arası gerilim ve parçadan geçen akım. */
export function MeasureBox({ part, runtime, running }: { part: PartInstance; runtime?: PartRuntime | null; running: boolean }) {
  const t = useT()
  const locale = useLocale()
  const [p1, p2] = PINS[part.type]
  if (part.type === 'uno') {
    return (
      <div className="lab-measure" data-testid="lab-measure" data-state={running ? 'hint' : 'idle'}>
        <b>{t('lab.measure.title')}</b>
        <p className="lab-measure-note">{running ? t('lab.measure.unoHint') : t('lab.measure.idle')}</p>
      </div>
    )
  }
  const text = running ? formatMeasurement(runtime?.meas, locale) : null
  return (
    <div className="lab-measure" data-testid="lab-measure" data-state={!running ? 'idle' : text ? 'value' : 'none'}>
      <b>{t('lab.measure.title')}</b>
      {!running && <p className="lab-measure-note">{t('lab.measure.idle')}</p>}
      {running && (
        <>
          <p className={`lab-measure-val${text ? '' : ' none'}`} data-testid="lab-measure-value" aria-live="polite">{text ?? t('lab.measure.none')}</p>
          <p className="lab-measure-note" title={t('lab.measure.ends', { a: p1, b: p2 })}>{t('lab.measure.hint')} <span>({p1} → {p2})</span></p>
        </>
      )}
    </div>
  )
}

export function PropsPanel({ selection, part, runtime, wireInfo, running, locked, latched, onLatch, onProp, onRotate, onDelete, onPhoneSend }: Props) {
  const t = useT()
  if (!selection) {
    return <section className="lab-props" aria-label={t('lab.props.title')}><p className="jr-empty">{t('lab.props.empty')}</p></section>
  }
  if (selection.kind === 'wire') {
    return (
      <section className="lab-props" aria-label={t('lab.props.title')}>
        <div className="lab-props-head"><b>{t('lab.props.wire')}</b><small>{wireInfo}</small></div>
        <div className="jr-controls"><button type="button" className="jr-btn small" disabled={running} onClick={onDelete}>{t('lab.props.deleteWire')}</button></div>
        {running && <p className="lab-hint">{t('lab.props.wireRunning')}</p>}
      </section>
    )
  }
  if (!part) return null
  const defs = PROPS[part.type]
  return (
    <section className="lab-props" aria-label={t('lab.props.title')} data-props-for={part.id}>
      <div className="lab-props-head"><b>{partName(t, part.type)}</b><small>{part.id}{locked ? ` · ${t('lab.props.locked')}` : ''}</small></div>
      {(() => {
        const guide = guideForPartType(part.type)
        return guide ? (
          <a className="lab-partinfo" href={`/parcalar/${guide.slug}`} target="_blank" rel="noopener" data-testid="lab-partinfo" onClick={() => logEvent('hint', { p: { src: 'part-info', part: part.type } })}>
            {t('lab.props.partInfo')} <span aria-hidden="true">↗</span><span className="sr-only"> {t('lab.props.partInfoSr', { title: guide.title })}</span>
          </a>
        ) : null
      })()}
      <MeasureBox part={part} runtime={runtime} running={running} />
      {defs.length === 0 && <p className="lab-hint">{t('lab.props.noProps')}</p>}
      {defs.map((d) => (
        <Field
          key={d.key} def={d} type={part.type} partId={part.id} value={part.props[d.key] ?? d.default}
          disabled={running && !d.live} onChange={(v) => onProp(d.key, v)}
        />
      ))}
      {part.type === 'button' && (
        <label className="lab-field lab-switch">
          <input type="checkbox" checked={latched} onChange={(e) => onLatch(e.target.checked)} />
          <span>{t('lab.props.latch')}</span>
        </label>
      )}
      {part.type === 'hc05' && <PhoneTerminal rt={running ? runtime?.hc05 : undefined} running={running} onSend={(s) => onPhoneSend?.(s)} />}
      {running && defs.some((d) => !d.live) && <p className="lab-hint">{t('lab.props.liveOnly')}</p>}
      <div className="jr-controls">
        <button type="button" className="jr-btn small" disabled={running || locked} onClick={onRotate} aria-label={t('lab.props.rotateAria')}>{t('lab.props.rotate')}</button>
        <button type="button" className="jr-btn small" disabled={running || locked} onClick={onDelete} aria-label={t('lab.props.deleteAria')}>{t('lab.props.delete')}</button>
      </div>
    </section>
  )
}
