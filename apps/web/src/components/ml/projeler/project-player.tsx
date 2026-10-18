'use client'
// ML projesi oynatıcısı: solda 3B sahne (three.js yalnız istemcide, dinamik import), altında durum, düğmeler ve parametreler;
// sağda canlı ölçümler, öğrenme eğrileri ve (varsa) tablo. Model tarayıcıda, kare başına küçük parçalar hâlinde eğitilir.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocale } from '@/i18n/client'
import type { Lang } from '@/lib/ml/core'
import type { Curve, ProjectRun } from '@/lib/ml/projeler/core'
import { defaults } from '@/lib/ml/projeler/core'
import { projectBySlug } from '@/lib/ml/projeler'
import { SCENE_LOADERS } from './scenes'
import { EgitimPaneli } from '../egitim-paneli'

const SPEEDS = [1, 2, 4, 8]

function Spark({ c, lang }: { c: Curve; lang: Lang }) {
  const W = 220, H = 56
  const v = c.values.filter(Number.isFinite)
  const lo = Math.min(...v, 0), hi = Math.max(...v, 1e-9)
  const pts = c.values.map((q, i) => `${(4 + (i / Math.max(1, c.values.length - 1)) * (W - 8)).toFixed(1)},${(H - 4 - ((q - lo) / (hi - lo || 1)) * (H - 10)).toFixed(1)}`).join(' ')
  return (
    <figure className="mp-curve">
      <figcaption>{c.label[lang]}</figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={c.label[lang]} preserveAspectRatio="none">
        <line x1="0" x2={W} y1={H - 4} y2={H - 4} className="mp-axis" />
        {c.values.length > 1 && <polyline points={pts} className={c.tone ? 'mp-line2' : 'mp-line'} />}
      </svg>
    </figure>
  )
}

export function ProjectPlayer({ slug }: { slug: string }) {
  const def = projectBySlug(slug)!
  const lang = useLocale() as Lang
  const L = lang === 'tr' ? 0 : 1
  const t = (tr: string, en: string) => (lang === 'tr' ? tr : en)
  const [params, setParams] = useState<Record<string, number>>(() => defaults(def))
  const run = useMemo<ProjectRun>(() => def.create(params), [def, params])
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [, setTick] = useState(0)
  const [gl, setGl] = useState<'wait' | 'ok' | 'none'>('wait')
  const host = useRef<HTMLDivElement>(null)
  const live = useRef({ run, playing, speed })
  live.current = { run, playing, speed }

  // ilk açılış: hareket azaltma tercihi yoksa eğitim kendiliğinden başlar
  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (!reduce) setPlaying(true)
  }, [])

  const advance = useCallback(() => {
    const { run: r, playing: p, speed: s } = live.current
    if (p && !r.done()) r.step(def.perFrame * s)
    if (p && r.done()) setPlaying(false)
  }, [def])

  // 3B sahne: three.js ve sahne modülü yalnız istemcide yüklenir; kaldırılınca her şey serbest bırakılır
  useEffect(() => {
    let disposed = false
    let cleanup: (() => void) | null = null
    let last = 0
    ;(async () => {
      const [{ createP3Stage, webglOk }, mod] = await Promise.all([import('./stage3d'), SCENE_LOADERS[slug]()])
      if (disposed || !host.current) return
      if (!webglOk()) {
        setGl('none')
        // WebGL yoksa da eğitim sürer; ölçümler güncellenir
        let raf = 0
        const loop = () => { advance(); const n = performance.now(); if (n - last > 200) { last = n; setTick((x) => x + 1) } raf = requestAnimationFrame(loop) }
        raf = requestAnimationFrame(loop)
        cleanup = () => cancelAnimationFrame(raf)
        return
      }
      const stage = createP3Stage(host.current, { shadows: true })
      const sc = mod.mount(stage, lang)
      stage.onFrame = (dt) => {
        advance()
        sc.frame(live.current.run, dt)
        const n = performance.now()
        if (n - last > 200) { last = n; setTick((x) => x + 1) }
      }
      setGl('ok')
      cleanup = () => { sc.dispose?.(); stage.dispose() }
    })()
    return () => { disposed = true; cleanup?.() }
  }, [slug, lang, advance])

  const reset = () => { setParams((p) => ({ ...p })) }
  const done = run.done()
  const metrics = run.metrics()
  const curves = run.curves?.() ?? []
  const table = run.table?.() ?? null
  const status = run.status()
  const rapor = run.report?.() ?? null

  return (
    <>
    <section className="mp-player" aria-label={def.title[lang]} data-testid="mp-player">
      <div className="mp-stage">
        <div className="mp-3d" ref={host} data-testid="mp-3d" data-gl={gl}>
          {gl === 'none' && <p className="mp-nogl">{t('3B görünüm için WebGL gerekli; eğitim ve ölçümler yine de çalışır.', '3D view needs WebGL; training and metrics still run.')}</p>}
          {gl === 'wait' && <p className="mp-nogl">{t('3B sahne yükleniyor…', 'Loading the 3D scene…')}</p>}
        </div>
        <div className="mp-status" aria-live="polite"><b data-testid="mp-status">{status[L]}</b>{done && <span>{t('hedefe ulaşıldı', 'goal reached')}</span>}</div>
        <div className="mp-ctl">
          <button type="button" className="btn btn-primary btn-small" data-testid="mp-play" onClick={() => { if (done) reset(); setPlaying((x) => (done ? true : !x)) }}>
            {playing ? t('Duraklat', 'Pause') : done ? t('Baştan eğit', 'Train again') : t('Eğit', 'Train')}
          </button>
          <button type="button" className="btn btn-outline btn-small" onClick={() => { setPlaying(false); reset() }}>{t('Sıfırla', 'Reset')}</button>
          <div className="ml-speed" role="group" aria-label={t('Hız', 'Speed')}>
            {SPEEDS.map((s) => <button key={s} type="button" aria-pressed={speed === s} onClick={() => setSpeed(s)}>{s}×</button>)}
          </div>
          <span className="mp-hint">{t('Sürükle: döndür · iki parmak / tekerlek: yakınlaş', 'Drag: orbit · pinch / wheel: zoom')}</span>
        </div>
        {def.params.length > 0 && (
          <div className="ml-params">
            {def.params.map((p) => (
              <label key={p.key} className="ml-param">
                <span>{p.label[lang]} <b>{params[p.key]}</b></span>
                <input type="range" min={p.min} max={p.max} step={p.step} value={params[p.key]} onChange={(e) => setParams((o) => ({ ...o, [p.key]: Number(e.target.value) }))} />
              </label>
            ))}
          </div>
        )}
      </div>
      <aside className="mp-side" aria-label={t('Canlı ölçümler', 'Live metrics')}>
        <h2 className="mp-side-h">{t('Canlı ölçümler', 'Live metrics')}</h2>
        <dl className="mp-metrics" data-testid="mp-metrics">
          {metrics.map((m) => <div key={m.label.en} className={m.tone ? `mp-m mp-${m.tone}` : 'mp-m'}><dt>{m.label[lang]}</dt><dd>{m.value[L]}</dd></div>)}
        </dl>
        {curves.map((c) => <Spark key={c.label.en} c={c} lang={lang} />)}
        {table && (
          <div className="mp-table">
            <p>{table.title[lang]}</p>
            <table>
              <thead><tr><th />{table.cols.map((c) => <th key={c[1]} scope="col">{c[L]}</th>)}</tr></thead>
              <tbody>
                {table.rows.map((r, i) => (
                  <tr key={r.label[1]}><th scope="row">{r.label[L]}</th>{r.cells.map((v, j) => <td key={j} className={table.diag && i === j ? 'mp-diag' : v ? 'mp-off' : undefined}>{v}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </aside>
    </section>
    {rapor && <EgitimPaneli rapor={rapor} lang={lang} slug={def.slug} />}
    </>
  )
}
