'use client'
// Ünite simülasyonlarının ortak React parçaları: denetimler (kaydırıcı, seçim, onay kutusu, düğme), okuma kutusu ve SVG
// grafikler (çizgi, çubuk, gösterge). Görünüm ESOF 323 simülasyonlarıyla aynı (.rb-sim içindeki .ctrl/.sl/.readout sınıfları);
// renkler .rb-sim üzerindeki --sim-*/--ink/--mute… değişkenlerinden gelir, açık ve koyu temada kendiliğinden doğru.
import { useId, type ReactNode } from 'react'

export type Lang = 'tr' | 'en'
export const nf = (lang: Lang, d = 1) => (v: number) => Number.isFinite(v) ? v.toLocaleString(lang === 'en' ? 'en-GB' : 'tr-TR', { minimumFractionDigits: d, maximumFractionDigits: d }) : '–'

/** Simülasyon gövdesi: solda sahne, sağda denetimler (dar ekranda alt alta). */
export function Body({ stage, side }: { stage: ReactNode; side: ReactNode }) {
  return (
    <div className="rb-sim-body">
      <div className="rb-sim-stage ks-stage">{stage}</div>
      <div className="rb-sim-side"><div className="ctrl">{side}</div></div>
    </div>
  )
}

export function Slider({ label, min, max, step, value, onChange, fmt = String }: { label: string; min: number; max: number; step: number; value: number; onChange: (v: number) => void; fmt?: (v: number) => string }) {
  return (
    <label className="sl">
      <span className="sl-h"><span>{label}</span><output>{fmt(value)}</output></span>
      <input type="range" min={min} max={max} step={step} value={value} aria-label={label} onChange={(e) => onChange(+e.target.value)} />
    </label>
  )
}

export function Select<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: Array<[T, string]>; onChange: (v: T) => void }) {
  return (
    <label className="sl">
      <span className="sl-h">{label}</span>
      <select value={value} aria-label={label} onChange={(e) => onChange(e.target.value as T)}>
        {options.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
      </select>
    </label>
  )
}

export function Check({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return <label className="ck"><input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />{label}</label>
}

export function Btn({ children, onClick, ghost, disabled, testid }: { children: ReactNode; onClick: () => void; ghost?: boolean; disabled?: boolean; testid?: string }) {
  return <button type="button" className={`sbtn${ghost ? ' ghost' : ''}`} onClick={onClick} disabled={disabled} data-testid={testid}>{children}</button>
}

export function Readout({ children, log, testid }: { children: ReactNode; log?: boolean; testid?: string }) {
  return <div className={`readout${log ? ' log' : ''}`} aria-live="polite" data-testid={testid}>{children}</div>
}

export function TextIn({ label, value, onChange, mono = true }: { label: string; value: string; onChange: (v: string) => void; mono?: boolean }) {
  return (
    <label className="sl">
      <span className="sl-h">{label}</span>
      <input className={`ks-in${mono ? ' mono' : ''}`} value={value} aria-label={label} spellCheck={false} autoCapitalize="off" autoCorrect="off" onChange={(e) => onChange(e.target.value)} />
    </label>
  )
}

export interface Series { y: ReadonlyArray<number>; x?: ReadonlyArray<number>; color: string; label?: string; width?: number; dash?: string; dots?: boolean }
const COLORS = ['var(--sim-a)', 'var(--gold)', 'var(--sky)', 'var(--red)', 'var(--green)', 'var(--mute)']
export const color = (i: number) => COLORS[i % COLORS.length]

function niceRange(lo: number, hi: number): [number, number] {
  if (!Number.isFinite(lo) || !Number.isFinite(hi)) return [0, 1]
  if (hi - lo < 1e-9) { lo -= 1; hi += 1 }
  const pad = (hi - lo) * 0.08
  return [lo - pad, hi + pad]
}
const short = (v: number) => Math.abs(v) >= 1000 ? `${+(v / 1000).toFixed(1)}k` : String(+v.toFixed(Math.abs(v) < 10 ? 2 : 1))

/** Eksenli SVG çizgi grafiği. NaN değerler çizgide boşluk bırakır. Yatay eşik çizgileri ve dikey bölgeler (bands) eklenebilir. */
export function LineChart({ series, w = 640, h = 260, yRange, xLabel, yLabel, hlines = [], bands = [], marks = [], title }: {
  series: Series[]; w?: number; h?: number; yRange?: [number, number]; xLabel?: string; yLabel?: string
  hlines?: Array<{ y: number; color: string; label?: string }>; bands?: Array<{ x0: number; x1: number; color: string }>
  marks?: Array<{ x: number; y: number; color: string }>; title: string
}) {
  const id = useId()
  const L = 46, R = 10, T = 22, B = 30
  const allX = series.flatMap((s) => s.x ? [...s.x] : s.y.map((_, i) => i))
  const allY = series.flatMap((s) => s.y.filter(Number.isFinite))
  const [x0, x1] = allX.length ? [Math.min(...allX), Math.max(...allX, Math.min(...allX) + 1)] : [0, 1]
  const [y0, y1] = yRange ?? niceRange(Math.min(...allY, ...hlines.map((l) => l.y)), Math.max(...allY, ...hlines.map((l) => l.y)))
  const X = (v: number) => L + (v - x0) / (x1 - x0 || 1) * (w - L - R)
  const Y = (v: number) => T + (1 - (v - y0) / (y1 - y0 || 1)) * (h - T - B)
  const path = (s: Series) => {
    let d = '', pen = false
    s.y.forEach((v, i) => {
      if (!Number.isFinite(v)) { pen = false; return }
      const xv = s.x ? s.x[i] : i
      d += `${pen ? 'L' : 'M'}${X(xv).toFixed(1)} ${Y(Math.max(y0, Math.min(y1, v))).toFixed(1)}`
      pen = true
    })
    return d
  }
  const legend = series.filter((s) => s.label)
  return (
    <figure className="ks-fig">
    <svg viewBox={`0 0 ${w} ${h}`} className="ks-chart" role="img" aria-labelledby={id}>
      <title id={id}>{title}</title>
      <rect x={L} y={T} width={w - L - R} height={h - T - B} fill="var(--sim-bg)" stroke="var(--line)" />
      <clipPath id={`${id}c`}><rect x={L} y={T} width={w - L - R} height={h - T - B} /></clipPath>
      {bands.map((b, i) => <rect key={i} x={X(b.x0)} y={T} width={Math.max(1, X(b.x1) - X(b.x0))} height={h - T - B} fill={b.color} opacity={0.16} clipPath={`url(#${id}c)`} />)}
      {[0, 1, 2, 3, 4].map((i) => {
        const v = y0 + (y1 - y0) * i / 4, yy = Y(v)
        return <g key={i}><line x1={L} x2={w - R} y1={yy} y2={yy} stroke="var(--sim-grid)" /><text x={L - 5} y={yy + 4} textAnchor="end" className="ks-ax">{short(v)}</text></g>
      })}
      {[0, 1, 2, 3, 4, 5].map((i) => { const v = x0 + (x1 - x0) * i / 5; return <text key={i} x={X(v)} y={h - B + 14} textAnchor="middle" className="ks-ax">{short(v)}</text> })}
      <g clipPath={`url(#${id}c)`}>
        {hlines.map((l, i) => <line key={i} x1={L} x2={w - R} y1={Y(l.y)} y2={Y(l.y)} stroke={l.color} strokeDasharray="5 4" />)}
        {series.map((s, i) => <path key={i} d={path(s)} fill="none" stroke={s.color} strokeWidth={s.width ?? 1.8} strokeDasharray={s.dash} strokeLinejoin="round" />)}
        {series.filter((s) => s.dots).flatMap((s, k) => s.y.map((v, i) => Number.isFinite(v) ? <circle key={`${k}-${i}`} cx={X(s.x ? s.x[i] : i)} cy={Y(v)} r={2.4} fill={s.color} /> : null))}
        {marks.map((m, i) => <circle key={i} cx={X(m.x)} cy={Y(m.y)} r={4.5} fill="none" stroke={m.color} strokeWidth={2} />)}
      </g>
      {hlines.filter((l) => l.label).map((l, i) => <text key={i} x={w - R - 4} y={Y(l.y) - 4} textAnchor="end" className="ks-ax" fill={l.color}>{l.label}</text>)}
      {xLabel && <text x={w - R} y={h - 2} textAnchor="end" className="ks-ax">{xLabel}</text>}
      {yLabel && <text x={L} y={13} className="ks-ax">{yLabel}</text>}
    </svg>
    {legend.length > 0 && <ul className="ks-legend" aria-hidden="true">{legend.map((s, i) => <li key={i}><i style={{ background: s.color, height: 4, verticalAlign: 3 }} />{s.label}</li>)}</ul>}
    </figure>
  )
}

/** Çubuk grafiği (histogram ya da kategori). */
export function Bars({ values, labels, w = 640, h = 220, colors, title, yLabel }: { values: number[]; labels: string[]; w?: number; h?: number; colors?: string[]; title: string; yLabel?: string }) {
  const id = useId()
  const L = 40, R = 8, T = 20, B = 34
  const max = Math.max(1e-9, ...values)
  const bw = (w - L - R) / Math.max(1, values.length)
  const every = Math.ceil(values.length / 12)
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="ks-chart" role="img" aria-labelledby={id}>
      <title id={id}>{title}</title>
      <rect x={L} y={T} width={w - L - R} height={h - T - B} fill="var(--sim-bg)" stroke="var(--line)" />
      {values.map((v, i) => {
        const bh = (v / max) * (h - T - B)
        return <g key={i}>
          <rect x={L + i * bw + 1} y={h - B - bh} width={Math.max(1, bw - 2)} height={bh} fill={colors?.[i] ?? 'var(--sim-a)'} opacity={0.85} />
          {i % every === 0 && <text x={L + i * bw + bw / 2} y={h - B + 14} textAnchor="middle" className="ks-ax">{labels[i]}</text>}
        </g>
      })}
      <text x={L - 5} y={T + 4} textAnchor="end" className="ks-ax">{short(max)}</text>
      <text x={L - 5} y={h - B} textAnchor="end" className="ks-ax">0</text>
      {yLabel && <text x={L} y={13} className="ks-ax">{yLabel}</text>}
    </svg>
  )
}

/** Yarım daire gösterge: değer, aralık ve uyarı eşiği. */
export function Gauge({ value, min, max, warn, label, unit, lang, d = 1 }: { value: number; min: number; max: number; warn?: number; label: string; unit: string; lang: Lang; d?: number }) {
  const id = useId()
  const f = Math.max(0, Math.min(1, (value - min) / (max - min || 1)))
  const arc = (a0: number, a1: number) => {
    const p = (a: number) => [60 + 46 * Math.cos(Math.PI * (1 - a)), 62 - 46 * Math.sin(Math.PI * (1 - a))]
    const [ax, ay] = p(a0), [bx, by] = p(a1)
    return `M${ax.toFixed(1)} ${ay.toFixed(1)} A46 46 0 0 1 ${bx.toFixed(1)} ${by.toFixed(1)}`
  }
  const hot = warn !== undefined && value >= warn
  return (
    <svg viewBox="0 0 120 86" className="ks-gauge" role="img" aria-labelledby={id}>
      <title id={id}>{`${label}: ${nf(lang, d)(value)} ${unit}`}</title>
      <path d={arc(0, 1)} fill="none" stroke="var(--sim-grid)" strokeWidth={10} />
      {warn !== undefined && <path d={arc((warn - min) / (max - min), 1)} fill="none" stroke="var(--red)" strokeOpacity={0.3} strokeWidth={10} />}
      <path d={arc(0, Math.max(0.001, f))} fill="none" stroke={hot ? 'var(--red)' : 'var(--sim-a)'} strokeWidth={10} />
      <text x={60} y={58} textAnchor="middle" className="ks-gv">{nf(lang, d)(value)}</text>
      <text x={60} y={72} textAnchor="middle" className="ks-ax">{unit}</text>
      <text x={60} y={84} textAnchor="middle" className="ks-ax ks-gl">{label}</text>
    </svg>
  )
}

/** Simülasyon kutusu: başlık + açıklama + gövde (ESOF 323 .rb-sim görünümü). */
export function SimFrame({ id, title, desc, testid, children }: { id: string; title: string; desc: string; testid: string; children: ReactNode }) {
  return (
    <section className="rb-sim" id={`sim-${id}`} data-testid={testid}>
      <div className="rb-sim-head"><h3>{title}</h3><p>{desc}</p></div>
      {children}
    </section>
  )
}

/** Mesaj akışı listesi: [zaman, metin, sınıf]. */
export function Flow({ rows, empty }: { rows: Array<{ t: string; text: ReactNode; cls?: string }>; empty: string }) {
  return (
    <ol className="ks-flow" aria-live="polite">
      {rows.length === 0 ? <li><span className="t">–</span><span className="dim">{empty}</span></li>
        : rows.map((r, i) => <li key={i}><span className="t">{r.t}</span><span className={r.cls}>{r.text}</span></li>)}
    </ol>
  )
}
