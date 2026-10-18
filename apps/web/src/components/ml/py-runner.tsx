'use client'
// Dersin Python kodunu tarayıcıda çalıştırır (Pyodide + NumPy, public/pyodide/worker.js). Worker yalnız ilk "Çalıştır"
// tıklamasında oluşturulur; sayfa açılışında hiçbir şey indirilmez. Dersin veri setleri her çalıştırmadan önce sanal dosya
// sistemine yazılır; kullanıcı kendi CSV'sini de yükleyebilir. 60 saniyeyi geçen çalıştırma worker sonlandırılarak durdurulur.
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocale } from '@/i18n/client'
import type { Bi, CodeLine, Lang } from '@/lib/ml/core'
import { ML_TEXT } from '@/lib/ml/text'

const TIMEOUT_MS = 60_000
const WORKER_URL = '/pyodide/worker.js'

type Line = { text: string; stream: 'stdout' | 'stderr' | 'info' }
type State = 'idle' | 'loading-runtime' | 'loading-numpy' | 'running' | 'done' | 'error' | 'stopped' | 'timeout'

/** Kodu, ders kod panelindeki gibi biçimler: yorumlar aynı sütundan başlar. */
export function codeText(code: CodeLine[], lang: Lang): string {
  const col = Math.min(44, Math.max(...code.map(([c]) => c.length))) + 2
  return code.map(([c, tr, en]) => {
    const k = lang === 'tr' ? tr : en
    return k ? `${c}${' '.repeat(Math.max(2, col - c.length))}# ${k}` : c
  }).join('\n') + '\n'
}

export function PyRunner({ code, file, datasets }: { code: CodeLine[]; file: string; datasets: Array<{ file: string; title: Bi }> }) {
  const lang = useLocale() as Lang
  const T = ML_TEXT[lang]
  const initial = useMemo(() => codeText(code, lang), [code, lang])
  const [src, setSrc] = useState(initial)
  const [out, setOut] = useState<Line[]>([])
  const [state, setState] = useState<State>('idle')
  const [secs, setSecs] = useState(0)
  const [upload, setUpload] = useState<{ name: string; bytes: ArrayBuffer } | null>(null)
  const worker = useRef<Worker | null>(null)
  const warm = useRef(false)
  const runId = useRef(0)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const started = useRef(0)

  useEffect(() => { setSrc(initial) }, [initial])
  useEffect(() => () => { worker.current?.terminate(); if (timer.current) clearTimeout(timer.current) }, [])

  const clearTimer = () => { if (timer.current) { clearTimeout(timer.current); timer.current = null } }
  const kill = () => { worker.current?.terminate(); worker.current = null; warm.current = false; clearTimer() }
  const armTimeout = () => {
    clearTimer()
    started.current = performance.now()
    timer.current = setTimeout(() => { kill(); setState('timeout'); setOut((o) => [...o, { text: T.runTimeout, stream: 'info' }]) }, TIMEOUT_MS)
  }

  const getWorker = (): Worker => {
    if (worker.current) return worker.current
    const w = new Worker(WORKER_URL)
    w.onmessage = (ev: MessageEvent) => {
      const m = ev.data as { type: string; id?: number; stage?: string; text?: string; stream?: 'stdout' | 'stderr'; ok?: boolean; error?: string; ms?: number }
      if (m.type === 'progress') {
        if (m.stage === 'ready') { warm.current = true; setState('running'); armTimeout() } else setState(m.stage as State)
        return
      }
      if (m.id !== runId.current) return
      if (m.type === 'out') {
        const text = (m.text ?? '').replace(/\n$/, '')
        setOut((o) => [...o, { text, stream: m.stream ?? 'stdout' }])
      } else if (m.type === 'done') {
        clearTimer()
        setSecs((m.ms ?? 0) / 1000)
        if (m.ok) setState('done')
        else { setState('error'); if (m.error) setOut((o) => [...o, { text: m.error!, stream: 'stderr' }]) }
      }
    }
    w.onerror = (e) => { clearTimer(); setState('error'); setOut((o) => [...o, { text: e.message || 'worker error', stream: 'stderr' }]); kill() }
    worker.current = w
    return w
  }

  const run = () => {
    const w = getWorker()
    const id = ++runId.current
    setOut([]); setSecs(0)
    const files: Array<{ name: string; url?: string; bytes?: ArrayBuffer }> = datasets.map((d) => ({ name: d.file, url: `/veri/ml/${d.file}` }))
    if (upload) files.push({ name: upload.name, bytes: upload.bytes.slice(0) })
    if (warm.current) { setState('running'); armTimeout() } else setState('loading-runtime')
    w.postMessage({ type: 'run', id, code: src, files })
  }
  const stop = () => { kill(); setState('stopped'); setOut((o) => [...o, { text: T.runStopped, stream: 'info' }]) }
  const onFile = async (f: File | undefined) => {
    if (!f) return
    const name = f.name.replace(/[^\w.\-]/g, '_')
    setUpload({ name, bytes: await f.arrayBuffer() })
  }

  const busy = state === 'loading-runtime' || state === 'loading-numpy' || state === 'running'
  const sec = lang === 'tr' ? secs.toFixed(1).replace('.', ',') : secs.toFixed(1)
  const statusText = state === 'loading-runtime' ? T.loadingPy : state === 'loading-numpy' ? T.loadingNumpy : state === 'running' ? T.running
    : state === 'done' ? T.runDone.replace('{s}', sec) : state === 'error' ? T.runError.replace('{s}', sec) : ''

  return (
    <details className="py-run" data-testid="py-runner">
      <summary className="py-run-sum"><b>{T.runTitle}</b><span>Python · NumPy · Pyodide</span></summary>
      <p className="py-run-lead">{T.runLead}</p>
      <div className="py-run-box">
        <div className="ml-code-head"><span className="ml-dots" aria-hidden="true"><i /><i /><i /></span><b>{file}</b><small>python</small></div>
        <textarea
          className="py-run-code" value={src} onChange={(e) => setSrc(e.target.value)} spellCheck={false} aria-label={T.codeLabel}
          rows={Math.min(24, Math.max(8, src.split('\n').length))} wrap="off" autoCapitalize="off" autoCorrect="off" data-testid="py-code"
        />
      </div>
      <div className="py-run-ctl">
        <button type="button" className="btn btn-primary btn-small" onClick={run} disabled={busy} data-testid="py-run">{T.run}</button>
        <button type="button" className="btn btn-outline btn-small" onClick={stop} disabled={!busy}>{T.stop}</button>
        <button type="button" className="btn btn-outline btn-small" onClick={() => setSrc(initial)} disabled={src === initial}>{T.resetCode}</button>
        <label className="py-run-file">
          <span>{T.upload}</span>
          <input type="file" accept=".csv,text/csv" onChange={(e) => onFile(e.target.files?.[0])} />
        </label>
        <span className="py-run-status" aria-live="polite" data-testid="py-status">{statusText}</span>
      </div>
      {upload && <p className="py-run-hint">{T.uploaded.replaceAll('{f}', upload.name).replace('{d}', datasets[0]?.file ?? 'veri.csv')}</p>}
      <div className="py-run-out-wrap">
        <p className="py-run-out-h">{T.output}</p>
        <pre className="py-run-out" data-testid="py-out" aria-live="polite">
          {out.length ? out.map((l, i) => <span key={i} className={`py-run-${l.stream}`}>{l.text}{'\n'}</span>) : <span className="py-run-info">{T.outputEmpty}</span>}
        </pre>
      </div>
    </details>
  )
}
