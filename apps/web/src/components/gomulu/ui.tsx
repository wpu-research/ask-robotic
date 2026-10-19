'use client'
// Gömülü kurs simülasyonlarının ortak denetimleri: ESOF 323 .rb-sim görünümünü (robotik.css) kullanır. SVG çizimleri
// renkleri .rb-sim üzerindeki --sim-*, --ink, --mute, --line, --gold, --red, --green, --sky değişkenlerinden alır.
import { useEffect, useState, type ReactNode } from 'react'

export type Lang = 'tr' | 'en'
export const tx = (lang: Lang) => (tr: string, en: string) => (lang === 'en' ? en : tr)
export const nf = (lang: Lang, d = 1) => (v: number) => Number.isFinite(v) ? v.toLocaleString(lang === 'en' ? 'en-GB' : 'tr-TR', { minimumFractionDigits: d, maximumFractionDigits: d }) : '∞'

/** Dar ekran (telefon) mı? SVG çizimleri dar ekranda dikey düzene geçip yazıyı büyütür; sunucuda ve ilk çizimde `false`. */
export function useNarrow(maxPx = 520): boolean {
  const [narrow, setNarrow] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia?.(`(max-width: ${maxPx}px)`)
    if (!mq) return
    const on = () => setNarrow(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [maxPx])
  return narrow
}

export function Body({ stage, side }: { stage: ReactNode; side: ReactNode }) {
  return (
    <div className="rb-sim-body">
      <div className="rb-sim-stage gm-stage">{stage}</div>
      <div className="rb-sim-side ctrl">{side}</div>
    </div>
  )
}

export function Slider({ label, value, min, max, step = 1, onChange, fmt }: { label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void; fmt?: (v: number) => string }) {
  return (
    <label className="sl">
      <span className="sl-h"><span>{label}</span><output>{fmt ? fmt(value) : value}</output></span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  )
}

export function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return <label className="ck"><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />{label}</label>
}

export function Select<T extends string | number>({ label, value, options, onChange }: { label: string; value: T; options: Array<[T, string]>; onChange: (v: T) => void }) {
  return (
    <label className="sl">
      <span className="sl-h"><span>{label}</span></span>
      <select value={String(value)} onChange={(e) => { const o = options.find(([v]) => String(v) === e.target.value); if (o) onChange(o[0]) }}>
        {options.map(([v, l]) => <option key={String(v)} value={String(v)}>{l}</option>)}
      </select>
    </label>
  )
}

export function Tabs<T extends string>({ value, tabs, onChange, label }: { value: T; tabs: Array<[T, string]>; onChange: (v: T) => void; label: string }) {
  return (
    <div className="gm-tabs" role="tablist" aria-label={label}>
      {tabs.map(([v, l]) => (
        <button key={v} type="button" role="tab" aria-selected={value === v} className={value === v ? 'on' : undefined} onClick={() => onChange(v)}>{l}</button>
      ))}
    </div>
  )
}

export function Btn({ children, onClick, ghost, pressed, testId }: { children: ReactNode; onClick: () => void; ghost?: boolean; pressed?: boolean; testId?: string }) {
  return <button type="button" className={`sbtn${ghost ? ' ghost' : ''}`} aria-pressed={pressed} onClick={onClick} data-testid={testId}>{children}</button>
}

export function Readout({ children, log, live }: { children: ReactNode; log?: boolean; live?: boolean }) {
  return <div className={`readout${log ? ' log' : ''}`} aria-live={live ? 'polite' : undefined}>{children}</div>
}

/** Durum rozeti: ok / warn / error. */
export function Badge({ kind, children }: { kind: 'ok' | 'warn' | 'error'; children: ReactNode }) {
  return <span className={`gm-badge gm-${kind}`}>{children}</span>
}

/** Basit dijital dalga: 0/1 dizisini basamaklı çizgi olarak çizer (x: örnek, y: seviye). */
export function wavePath(levels: number[], x0: number, w: number, yHi: number, yLo: number): string {
  if (!levels.length) return ''
  const dx = w / levels.length
  let d = `M${x0},${levels[0] ? yHi : yLo}`
  levels.forEach((v, i) => {
    const y = v ? yHi : yLo
    d += ` L${x0 + i * dx},${y} L${x0 + (i + 1) * dx},${y}`
  })
  return d
}
