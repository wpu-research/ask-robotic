'use client'
// Eğitim paneli: bir dersin ya da projenin gerçek eğitim çalıştırmasından gelen geçmişi ve ölçümleri SVG grafiklerle gösterir
// (kayıp/doğruluk eğrileri, karışıklık matrisi, ROC/PR, artıklar, ağırlık histogramları, Q tablosu…). Renkler kapsayıcının CSS
// değişkenlerinden gelir (açık/koyu tema). Her grafiğin altında veri tablosu açılır; geçmiş CSV/JSON olarak indirilir ya da
// panoya kopyalanır. Çizim ucuzdur: yalnız değişen ilerleme / rapor için, animasyon karesine bir kez güncellenir.
import { memo, useEffect, useId, useMemo, useRef, useState } from 'react'
import type { Lang } from '@/lib/ml/core'
import type { CizgiGrafik, CubukGrafik, EgitimRaporu, Grafik, HistGrafik, IsiGrafik, SacilimGrafik, SonOlcu } from '@/lib/ml/egitim/rapor'
import { esikOlculeri, modelAdi, raporCSV, raporJSON } from '@/lib/ml/egitim/rapor'
import { rocCurve } from '@/lib/ml/egitim/metrics'

const W = 320, H = 196
const PAD = { l: 44, r: 10, t: 12, b: 34 }
const KIND: Record<EgitimRaporu['kind'], [string, string]> = {
  regresyon: ['regresyon', 'regression'], siniflandirma: ['sınıflandırma', 'classification'], 'sinir-agi': ['sinir ağı', 'neural network'],
  pekistirmeli: ['pekiştirmeli öğrenme', 'reinforcement learning'], kumeleme: ['kümeleme / boyut indirgeme', 'clustering / dimensionality reduction'],
  evrim: ['nöroevrim', 'neuroevolution'], 'dil-modeli': ['dil modeli', 'language model'],
}

/** Sayıyı kısa biçimler (Türkçede ondalık virgül). */
export function kisa(v: number, lang: Lang, digits?: number): string {
  if (Number.isNaN(v)) return '–'
  if (!Number.isFinite(v)) return v > 0 ? '∞' : '−∞'
  const a = Math.abs(v)
  const d = digits ?? (a >= 1000 ? 0 : a >= 100 ? 1 : a >= 10 ? 2 : a >= 1 ? 2 : a === 0 ? 0 : 3)
  let s = a >= 1e6 && digits === undefined ? v.toExponential(2) : v.toFixed(d)
  if (s.includes('.') && digits === undefined) s = s.replace(/0+$/, '').replace(/\.$/, '')
  s = s.replace('-', '−')
  return lang === 'tr' ? s.replace('.', ',') : s
}
const olcuMetni = (f: SonOlcu, lang: Lang) =>
  !Number.isFinite(f.value) ? kisa(f.value, lang) : f.fmt === 'pct' ? (lang === 'tr' ? `%${kisa(f.value * 100, lang, 1)}` : `${kisa(f.value * 100, lang, 1)}%`) : f.fmt === 'int' ? kisa(f.value, lang, 0) : kisa(f.value, lang, typeof f.fmt === 'number' ? f.fmt : undefined)

/** Okunaklı eksen işaretleri (1, 2, 5 × 10^k adımlarla). */
function ticks(lo: number, hi: number, n = 4): number[] {
  if (!Number.isFinite(lo) || !Number.isFinite(hi)) return []
  if (lo === hi) return [lo]
  const raw = (hi - lo) / n, p = 10 ** Math.floor(Math.log10(raw)), m = raw / p
  const step = (m < 1.5 ? 1 : m < 3 ? 2 : m < 7 ? 5 : 10) * p
  const out: number[] = []
  for (let v = Math.ceil(lo / step) * step; v <= hi + step * 1e-9; v += step) out.push(Math.abs(v) < step * 1e-9 ? 0 : v)
  return out
}
const tone = (t: number | undefined, i: number) => `var(--ml-c${(t ?? i) % 6})`
const finite = (a: readonly number[]) => a.filter(Number.isFinite)

/** rAF ile kısılmış değer: değer sık değişse de animasyon karesine bir kez günceller. */
function useRafValue<T>(v: T): T {
  const [s, setS] = useState(v)
  const raf = useRef(0)
  const latest = useRef(v)
  latest.current = v
  useEffect(() => {
    if (raf.current) return
    raf.current = requestAnimationFrame(() => { raf.current = 0; setS(latest.current) })
  }, [v])
  // React geliştirme modunda efektler iki kez kurulur: temizlikte bekleyen kare de sıfırlanmalı, yoksa değer bir daha güncellenmez
  useEffect(() => () => { cancelAnimationFrame(raf.current); raf.current = 0 }, [])
  return s
}

function Axes({ x0, x1, y0, y1, sx, sy, xl, yl, lang, logY }: { x0: number; x1: number; y0: number; y1: number; sx: (v: number) => number; sy: (v: number) => number; xl?: string; yl?: string; lang: Lang; logY?: boolean }) {
  const xt = x0 === x1 ? [] : ticks(x0, x1), yt = logY ? ticks(y0, y1).filter((v) => Number.isInteger(v)) : ticks(y0, y1)
  return (
    <g className="eg-axes">
      {yt.map((v) => <g key={`y${v}`}><line x1={PAD.l} x2={W - PAD.r} y1={sy(v)} y2={sy(v)} className="eg-grid" /><text x={PAD.l - 4} y={sy(v) + 3} textAnchor="end">{logY ? `1e${v}` : kisa(v, lang)}</text></g>)}
      {xt.map((v) => <text key={`x${v}`} x={sx(v)} y={H - PAD.b + 12} textAnchor="middle">{kisa(v, lang)}</text>)}
      <line x1={PAD.l} x2={W - PAD.r} y1={H - PAD.b} y2={H - PAD.b} className="eg-axis" />
      <line x1={PAD.l} x2={PAD.l} y1={PAD.t} y2={H - PAD.b} className="eg-axis" />
      {xl && <text x={(PAD.l + W - PAD.r) / 2} y={H - 4} textAnchor="middle" className="eg-al">{xl}</text>}
      {yl && <text x={10} y={(PAD.t + H - PAD.b) / 2} textAnchor="middle" className="eg-al" transform={`rotate(-90 10 ${(PAD.t + H - PAD.b) / 2})`}>{yl}</text>}
    </g>
  )
}

function LineChart({ g, lang, reveal, dot }: { g: CizgiGrafik; lang: Lang; reveal: number; dot?: [number, number] }) {
  const yv = (v: number) => (g.logY ? (v > 0 ? Math.log10(v) : NaN) : v)
  const allX = g.series.flatMap((s) => finite(s.x ?? g.x))
  const allY = g.series.flatMap((s) => finite(s.values.map(yv)))
  let x0 = Math.min(...allX), x1 = Math.max(...allX)
  if (!Number.isFinite(x0)) { x0 = 0; x1 = 1 }
  if (x0 === x1) x1 = x0 + 1
  let y0 = g.yMin ?? Math.min(...allY), y1 = g.yMax ?? Math.max(...allY)
  if (!Number.isFinite(y0) || !Number.isFinite(y1)) { y0 = 0; y1 = 1 }
  if (y0 === y1) { y0 -= 0.5; y1 += 0.5 }
  if (g.yMin === undefined && !g.logY) { const pad = (y1 - y0) * 0.06; y0 -= pad; y1 += pad; if (Math.min(...allY) >= 0 && y0 < 0) y0 = 0 }
  if (g.logY) { y0 = Math.floor(y0); y1 = Math.ceil(y1); if (y0 === y1) y1++ }
  const sx = (v: number) => PAD.l + ((v - x0) / (x1 - x0)) * (W - PAD.l - PAD.r)
  const sy = (v: number) => H - PAD.b - ((Math.min(y1, Math.max(y0, v)) - y0) / (y1 - y0)) * (H - PAD.t - PAD.b)
  return (
    <>
      <Axes x0={x0} x1={x1} y0={y0} y1={y1} sx={sx} sy={sy} xl={g.xLabel[lang]} yl={g.yLabel?.[lang]} lang={lang} logY={g.logY} />
      {g.diag && <line x1={sx(0)} y1={sy(0)} x2={sx(1)} y2={sy(1)} className="eg-ref" />}
      {g.series.map((s, i) => {
        const xs = s.x ?? g.x
        const n = g.live ? Math.max(1, Math.ceil(reveal * s.values.length)) : s.values.length
        let d = '', pen = false
        for (let k = 0; k < n; k++) {
          const y = yv(s.values[k])
          if (!Number.isFinite(y) || !Number.isFinite(xs[k])) { pen = false; continue }
          d += `${pen ? 'L' : 'M'}${sx(xs[k]).toFixed(1)},${sy(y).toFixed(1)}`
          pen = true
        }
        return <path key={s.key} d={d} className="eg-line" style={{ stroke: tone(s.tone, i) }} strokeDasharray={s.dash ? '4 3' : undefined} />
      })}
      {g.marker && (!g.live || g.marker.x <= g.x[Math.max(0, Math.ceil(reveal * g.x.length) - 1)]) && (
        <g className="eg-marker"><line x1={sx(g.marker.x)} x2={sx(g.marker.x)} y1={PAD.t} y2={H - PAD.b} /><text x={Math.min(W - PAD.r - 2, sx(g.marker.x) + 3)} y={PAD.t + 9} textAnchor={sx(g.marker.x) > W - 90 ? 'end' : 'start'}>{g.marker.label[lang]}</text></g>
      )}
      {dot && <circle cx={sx(dot[0])} cy={sy(dot[1])} r={4.5} className="eg-dot" />}
      {!allY.length && <text x={(PAD.l + W - PAD.r) / 2} y={(PAD.t + H - PAD.b) / 2} textAnchor="middle" className="eg-al">{lang === 'tr' ? 'eğitim ilerledikçe dolacak' : 'fills in as training runs'}</text>}
    </>
  )
}

function BarChart({ g, lang }: { g: CubukGrafik; lang: Lang }) {
  const all = g.series.flatMap((s) => finite(s.values))
  const y0 = g.yMin ?? Math.min(0, ...all), y1 = g.yMax ?? Math.max(1e-9, ...all) * 1.08
  const sy = (v: number) => H - PAD.b - ((Math.min(y1, Math.max(y0, v)) - y0) / (y1 - y0 || 1)) * (H - PAD.t - PAD.b)
  const gw = (W - PAD.l - PAD.r) / Math.max(1, g.labels.length), bw = Math.max(1, (gw * 0.8) / g.series.length)
  const every = Math.ceil(g.labels.length / 16)
  // çok ya da uzun etiket: eğik yazılır (üst üste binmesin)
  const tilt = g.labels.length > 10 || (g.labels.length > 4 && Math.max(...g.labels.map((l) => l.length)) * 5 > gw)
  return (
    <>
      <Axes x0={0} x1={0} y0={y0} y1={y1} sx={() => -99} sy={sy} yl={g.yLabel?.[lang]} lang={lang} />
      {g.labels.map((lab, i) => (
        <g key={i}>
          {g.series.map((s, j) => { const v = s.values[i]; if (!Number.isFinite(v)) return null; const x = PAD.l + i * gw + gw * 0.1 + j * bw; return <rect key={s.key} x={x} width={Math.max(0.5, bw - 1)} y={Math.min(sy(v), sy(0))} height={Math.abs(sy(0) - sy(v))} style={{ fill: tone(s.tone, j) }} /> })}
          {i % every === 0 && (tilt
            ? <text x={PAD.l + i * gw + gw / 2} y={H - PAD.b + 8} textAnchor="end" className="eg-tick" transform={`rotate(-40 ${PAD.l + i * gw + gw / 2} ${H - PAD.b + 8})`}>{lab.length > 8 ? `${lab.slice(0, 7)}…` : lab}</text>
            : <text x={PAD.l + i * gw + gw / 2} y={H - PAD.b + 12} textAnchor="middle" className="eg-tick">{lab.length > 9 ? `${lab.slice(0, 8)}…` : lab}</text>)}
        </g>
      ))}
    </>
  )
}

function ScatterChart({ g, lang }: { g: SacilimGrafik; lang: Lang }) {
  const step = Math.max(1, Math.ceil(g.points.length / 1500))
  const pts = g.points.filter((_, i) => i % step === 0)
  const xs = finite(pts.map((p) => p[0])), ys = finite(pts.map((p) => p[1]))
  let x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys)
  if (g.diag) { x0 = y0 = Math.min(x0, y0); x1 = y1 = Math.max(x1, y1) }
  if (g.zero) { const m = Math.max(Math.abs(y0), Math.abs(y1), 1e-9); y0 = -m; y1 = m }
  if (!Number.isFinite(x0)) { x0 = 0; x1 = 1; y0 = 0; y1 = 1 }
  const px = (x1 - x0 || 1) * 0.05, py = (y1 - y0 || 1) * 0.05
  x0 -= px; x1 += px; y0 -= py; y1 += py
  const sx = (v: number) => PAD.l + ((v - x0) / (x1 - x0)) * (W - PAD.l - PAD.r)
  const sy = (v: number) => H - PAD.b - ((v - y0) / (y1 - y0)) * (H - PAD.t - PAD.b)
  return (
    <>
      <Axes x0={x0} x1={x1} y0={y0} y1={y1} sx={sx} sy={sy} xl={g.xLabel[lang]} yl={g.yLabel[lang]} lang={lang} />
      {g.diag && <line x1={sx(x0)} y1={sy(x0)} x2={sx(x1)} y2={sy(x1)} className="eg-ref" />}
      {g.zero && <line x1={PAD.l} x2={W - PAD.r} y1={sy(0)} y2={sy(0)} className="eg-ref" />}
      {pts.map((p, i) => Number.isFinite(p[0]) && Number.isFinite(p[1]) && <circle key={i} cx={sx(p[0])} cy={sy(p[1])} r={2.4} className="eg-pt" style={{ fill: tone(p[2], 1) }} />)}
    </>
  )
}

function HeatChart({ g, lang }: { g: IsiGrafik; lang: Lang }) {
  const R = g.rows.length, C = g.cols.length
  const top = g.colLabel ? 26 : 14, left = Math.min(70, 12 + Math.max(...g.rows.map((r) => r.length)) * 5.5) + (g.rowLabel ? 12 : 0)
  const cw = (W - left - 6) / Math.max(1, C), ch = (H - top - 6) / Math.max(1, R)
  const flat = finite(g.values.flat()), lo = Math.min(...flat), hi = Math.max(...flat)
  const rowSum = g.values.map((r) => r.reduce((a, v) => a + (Number.isFinite(v) ? v : 0), 0) || 1)
  const font = Math.max(7, Math.min(12, ch * 0.42, cw * 0.32))
  return (
    <>
      {g.colLabel && <text x={left + (W - left) / 2} y={9} textAnchor="middle" className="eg-al">{g.colLabel[lang]}</text>}
      {g.rowLabel && <text x={8} y={top + (H - top) / 2} textAnchor="middle" className="eg-al" transform={`rotate(-90 8 ${top + (H - top) / 2})`}>{g.rowLabel[lang]}</text>}
      {C <= 14 && g.cols.map((c, j) => <text key={`c${j}`} x={left + j * cw + cw / 2} y={top - 3} textAnchor="middle" className="eg-tick">{c.length > 8 ? `${c.slice(0, 7)}…` : c}</text>)}
      {g.values.map((row, i) => (
        <g key={i}>
          {R <= 16 && <text x={left - 4} y={top + i * ch + ch / 2 + 3} textAnchor="end" className="eg-tick">{g.rows[i].length > 10 ? `${g.rows[i].slice(0, 9)}…` : g.rows[i]}</text>}
          {row.map((v, j) => {
            const t = g.confusion ? v / rowSum[i] : (v - lo) / (hi - lo || 1)
            const base = g.confusion ? (i === j ? 'var(--ml-c3)' : 'var(--ml-c0)') : 'var(--ml-c1)'
            const op = Number.isFinite(t) ? (g.confusion && v === 0 ? 0 : 0.12 + 0.78 * Math.max(0, Math.min(1, t))) : 0
            return (
              <g key={j}>
                <rect x={left + j * cw} y={top + i * ch} width={Math.max(0.5, cw - 1)} height={Math.max(0.5, ch - 1)} className="eg-cell" />
                <rect x={left + j * cw} y={top + i * ch} width={Math.max(0.5, cw - 1)} height={Math.max(0.5, ch - 1)} style={{ fill: base, opacity: op }} />
                {g.showValues && Number.isFinite(v) && cw > 16 && ch > 10 && <text x={left + j * cw + cw / 2} y={top + i * ch + ch / 2 + font / 3} textAnchor="middle" style={{ fontSize: font }} className={op > 0.6 ? 'eg-cv eg-cv-on' : 'eg-cv'}>{kisa(v, lang, g.digits ?? (Number.isInteger(v) ? 0 : 1))}</text>}
              </g>
            )
          })}
        </g>
      ))}
    </>
  )
}

function HistChart({ g, lang }: { g: HistGrafik; lang: Lang }) {
  const F = g.frames.length, bins = g.edges.length - 1
  const left = 62, top = 6, bottom = 30
  const rh = (H - top - bottom) / Math.max(1, F)
  const bw = (W - left - PAD.r) / bins
  const lo = g.edges[0], hi = g.edges[bins]
  const sx = (v: number) => left + ((v - lo) / (hi - lo)) * (W - left - PAD.r)
  return (
    <>
      {g.frames.map((f, i) => {
        const mx = Math.max(1, ...f.counts)
        const y = top + i * rh
        return (
          <g key={i}>
            <text x={left - 4} y={y + rh * 0.7} textAnchor="end" className="eg-tick">{f.label}</text>
            <line x1={left} x2={W - PAD.r} y1={y + rh - 1} y2={y + rh - 1} className="eg-grid" />
            {f.counts.map((c, j) => c > 0 && <rect key={j} x={left + j * bw} width={Math.max(0.5, bw - 0.6)} y={y + rh - 1 - (c / mx) * (rh - 3)} height={(c / mx) * (rh - 3)} style={{ fill: tone(undefined, i === F - 1 && F > 1 ? 2 : 1) }} opacity={F > 1 ? 0.45 + 0.5 * (i / (F - 1)) : 0.85} />)}
          </g>
        )
      })}
      {ticks(lo, hi, 4).map((v) => <text key={v} x={sx(v)} y={H - bottom + 12} textAnchor="middle">{kisa(v, lang)}</text>)}
      <text x={(left + W) / 2} y={H - 4} textAnchor="middle" className="eg-al">{g.xLabel[lang]}</text>
    </>
  )
}

/** Grafiğin veri tablosu (ekran okuyucu ve kopyalama için). */
function DataTable({ g, lang }: { g: Grafik; lang: Lang }) {
  const n = (v: number) => kisa(v, lang, Number.isInteger(v) ? 0 : 4)
  let head: string[] = [], rows: Array<Array<string | number>> = []
  if (g.kind === 'line') {
    const shared = g.series.every((s) => !s.x)
    if (shared) { head = [g.xLabel[lang], ...g.series.map((s) => s.label[lang])]; rows = g.x.map((x, i) => [x, ...g.series.map((s) => s.values[i])]) }
    else { head = [lang === 'tr' ? 'seri' : 'series', g.xLabel[lang], g.yLabel?.[lang] ?? 'y']; rows = g.series.flatMap((s) => (s.x ?? g.x).map((x, i) => [s.label[lang], x, s.values[i]])) }
  } else if (g.kind === 'bar') { head = ['', ...g.series.map((s) => s.label[lang])]; rows = g.labels.map((l, i) => [l, ...g.series.map((s) => s.values[i])]) }
  else if (g.kind === 'scatter') { head = [g.xLabel[lang], g.yLabel[lang]]; rows = g.points.map((p) => [p[0], p[1]]) }
  else if (g.kind === 'heat') { head = [g.rowLabel ? `${g.rowLabel[lang]} \\ ${g.colLabel?.[lang] ?? ''}` : '', ...g.cols]; rows = g.values.map((r, i) => [g.rows[i], ...r]) }
  else { head = [lang === 'tr' ? 'kutu başı' : 'bin start', ...g.frames.map((f) => f.label)]; rows = g.edges.slice(0, -1).map((e, j) => [e, ...g.frames.map((f) => f.counts[j])]) }
  return (
    <div className="eg-table">
      <table>
        <thead><tr>{head.map((h, i) => <th key={i} scope="col">{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => j === 0 ? <th key={j} scope="row">{typeof c === 'number' ? n(c) : c}</th> : <td key={j}>{typeof c === 'number' ? n(c) : c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  )
}

const Chart = memo(function Chart({ g, lang, reveal, dot }: { g: Grafik; lang: Lang; reveal: number; dot?: [number, number] }) {
  const [table, setTable] = useState(false)
  const id = useId()
  const t = (tr: string, en: string) => (lang === 'tr' ? tr : en)
  const legend = g.kind === 'line' || g.kind === 'bar' ? g.series : []
  const summary = g.kind === 'line'
    ? g.series.map((s) => { const v = finite(s.values); return `${s.label[lang]}: ${v.length ? kisa(v[v.length - 1], lang) : '–'}` }).join(', ')
    : g.kind === 'heat' ? `${g.rows.length}×${g.cols.length}` : g.kind === 'scatter' ? t(`${g.points.length} nokta`, `${g.points.length} points`) : g.kind === 'bar' ? t(`${g.labels.length} çubuk`, `${g.labels.length} bars`) : t(`${g.frames.length} dağılım`, `${g.frames.length} distributions`)
  return (
    <figure className="eg-chart" data-testid={`eg-chart-${g.id}`}>
      <figcaption id={id}>{g.title[lang]}</figcaption>
      {legend.length > 1 && <ul className="eg-legend">{legend.map((s, i) => <li key={s.key}><i style={{ background: tone(s.tone, i) }} className={s.dash ? 'eg-dash' : undefined} />{s.label[lang]}</li>)}</ul>}
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${g.title[lang]}. ${summary}`}>
        {g.kind === 'line' ? <LineChart g={g} lang={lang} reveal={reveal} dot={dot} /> : g.kind === 'bar' ? <BarChart g={g} lang={lang} /> : g.kind === 'scatter' ? <ScatterChart g={g} lang={lang} /> : g.kind === 'heat' ? <HeatChart g={g} lang={lang} /> : <HistChart g={g} lang={lang} />}
      </svg>
      {g.note && <p className="eg-note">{g.note[lang]}</p>}
      <button type="button" className="eg-tbtn" aria-expanded={table} onClick={() => setTable((x) => !x)}>{table ? t('Tabloyu gizle', 'Hide table') : t('Veri tablosu', 'Data table')}</button>
      {table && <DataTable g={g} lang={lang} />}
    </figure>
  )
})

/** Tarayıcıda dosya indirme (Blob + <a download>). */
export function indir(name: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const a = document.createElement('a')
  a.href = url; a.download = name; a.rel = 'noopener'
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function EgitimPaneli({ rapor, lang, slug, progress = 1 }: { rapor: EgitimRaporu; lang: Lang; slug: string; progress?: number }) {
  const r = useRafValue(rapor)
  const reveal = useRafValue(progress)
  const t = (tr: string, en: string) => (lang === 'tr' ? tr : en)
  const [thr, setThr] = useState(rapor.scores?.t ?? 0.5)
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { setThr(rapor.scores?.t ?? 0.5) }, [rapor.scores?.t, slug])
  const sc = r.scores
  const at = useMemo(() => (sc ? esikOlculeri(sc.y, sc.s, thr) : null), [sc, thr])
  const roc = useMemo(() => (sc ? rocCurve(sc.y, sc.s) : null), [sc])
  const lo = sc ? Math.min(...sc.s) : 0, hi = sc ? Math.max(...sc.s) : 1
  const done = reveal >= 1
  const copy = async () => {
    try { await navigator.clipboard.writeText(raporCSV(r)); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch { setCopied(false) }
  }
  const hyper = Object.entries(r.hyper)
  // Grafikler yalnız istemcide çizilir: sunucu (Node) ile tarayıcının Math.exp/tanh sonuçları son basamakta ayrışabilir ve
  // SVG koordinatları hidrasyonda uyuşmaz. Sunucu yalnız başlığı gönderir.
  if (!mounted) return (
    <section className="eg" aria-labelledby={`eg-h-${slug}`} data-testid="egitim-paneli">
      <header className="eg-head"><div><h2 id={`eg-h-${slug}`}>{t('Eğitim paneli', 'Training dashboard')}</h2><p className="eg-sub">{t('Eğitim çalıştırılıyor…', 'Running the training…')}</p></div></header>
    </section>
  )
  return (
    <section className="eg" aria-labelledby={`eg-h-${slug}`} data-testid="egitim-paneli">
      <header className="eg-head">
        <div>
          <h2 id={`eg-h-${slug}`}>{t('Eğitim paneli', 'Training dashboard')}</h2>
          <p className="eg-sub">{modelAdi(r, lang)} · {t(KIND[r.kind][0], KIND[r.kind][1])} · {t('tohum', 'seed')} {r.seed}{hyper.length > 0 && <> · {hyper.map(([k, v]) => `${k} = ${typeof v === 'number' ? kisa(v, lang) : v}`).join(' · ')}</>}</p>
        </div>
        <div className="eg-export" role="group" aria-label={t('Eğitim verisini indir', 'Download training data')}>
          <span>{t('Eğitim verisini indir', 'Download training data')}</span>
          <button type="button" className="btn btn-outline btn-small" data-testid="eg-csv" onClick={() => indir(`${slug}-egitim_gecmisi.csv`, raporCSV(r), 'text/csv;charset=utf-8')}>CSV</button>
          <button type="button" className="btn btn-outline btn-small" data-testid="eg-json" onClick={() => indir(`${slug}-egitim.json`, raporJSON(r), 'application/json')}>JSON</button>
          <button type="button" className="btn btn-outline btn-small" onClick={copy} aria-live="polite">{copied ? t('Kopyalandı ✓', 'Copied ✓') : t('Kopyala', 'Copy')}</button>
        </div>
      </header>
      <dl className="eg-final" data-testid="eg-final">
        {r.final.map((f) => <div key={f.key} className="eg-m"><dt>{f.label[lang]}</dt><dd>{olcuMetni(f, lang)}</dd></div>)}
      </dl>
      {!done && <p className="eg-live" aria-live="off">{t('Eğriler oynatıcıyla birlikte açılıyor; son ölçümler eğitimin sonundaki değerlerdir.', 'Curves unfold with the player; the final metrics are the values at the end of training.')}</p>}
      {sc && at && (
        <div className="eg-thr">
          <label>
            <span>{t('Karar eşiği', 'Decision threshold')} <b>{kisa(thr, lang, 2)}</b></span>
            <input type="range" min={lo} max={hi} step={(hi - lo) / 100 || 0.01} value={thr} onChange={(e) => setThr(Number(e.target.value))} data-testid="eg-thr" />
          </label>
          <dl>
            <div><dt>{t('doğruluk', 'accuracy')}</dt><dd>{kisa(at.acc, lang, 3)}</dd></div>
            <div><dt>{t('kesinlik', 'precision')}</dt><dd>{kisa(at.precision, lang, 3)}</dd></div>
            <div><dt>{t('duyarlılık', 'recall')}</dt><dd>{kisa(at.recall, lang, 3)}</dd></div>
            <div><dt>F1</dt><dd>{kisa(at.f1, lang, 3)}</dd></div>
            <div><dt>{t('DP / YP / YN / DN', 'TP / FP / FN / TN')}</dt><dd>{at.tp} / {at.fp} / {at.fn} / {at.tn}</dd></div>
          </dl>
        </div>
      )}
      <div className="eg-grid">
        {r.charts.map((g) => {
          let dot: [number, number] | undefined
          if (at && roc && g.kind === 'line' && g.id.endsWith('roc')) dot = [at.fpr, at.recall]
          if (at && g.kind === 'line' && g.id.endsWith('pr') && at.tp + at.fp > 0) dot = [at.recall, at.precision]
          return <Chart key={g.id} g={g} lang={lang} reveal={reveal} dot={dot} />
        })}
      </div>
    </section>
  )
}
