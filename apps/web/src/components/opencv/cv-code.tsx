'use client'
// OpenCV dersi kod bloğu: kopyalanabilir kod; `run` olan bloklarda düzenlenebilir ve tarayıcıda gerçek Python + OpenCV ile
// çalışır (Pyodide 0.26 + opencv-python 4.9, public/pyodide/cv-worker.js). Girdi: seçilen örnek görüntü ya da yüklenen
// fotoğraf 'girdi.png' olarak yazılır; kod 'cikti.png' yazarsa altta gösterilir. Worker yalnız ilk tıklamada oluşturulur.
import { useEffect, useRef, useState } from 'react'
import { CodeBlock } from '@/components/robotik/code-block'
import type { KursCode } from '@/lib/kurs/types'
import { sample, SAMPLE_IDS, SAMPLE_TEXT, type SampleId } from '@/lib/opencv/samples'
import { toRgba, tx, type L } from './cv-ui'

const TIMEOUT_MS = 90_000
type State = 'idle' | 'loading-runtime' | 'loading-cv' | 'running' | 'done' | 'error' | 'timeout'

let shared: Worker | null = null
function getWorker() { shared ??= new Worker('/pyodide/cv-worker.js'); return shared }

async function pngBytes(id: SampleId | 'own', own: ImageData | null): Promise<ArrayBuffer> {
  const im = id === 'own' && own ? own : (() => { const s = sample(id as SampleId); return new ImageData(new Uint8ClampedArray(s.data), s.w, s.h) })()
  const c = document.createElement('canvas'); c.width = im.width; c.height = im.height
  c.getContext('2d')!.putImageData(im, 0, 0)
  const blob = await new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('png'))), 'image/png'))
  return blob.arrayBuffer()
}

export function CvCode({ block, lang, sampleId = 'shapes' }: { block: KursCode; lang: L; sampleId?: SampleId }) {
  const [open, setOpen] = useState(false)
  if (!block.run) return <CodeBlock title={block.title} src={block.src} lang={lang} />
  return (
    <div className="cv-code">
      <CodeBlock title={block.title} src={block.src} lang={lang} />
      {open ? <Runner block={block} lang={lang} sampleId={sampleId} /> : (
        <button type="button" className="btn btn-ghost cv-run-open" onClick={() => setOpen(true)} data-testid="cv-run-open">
          {tx(lang, '▶ Tarayıcıda çalıştır (Python + OpenCV)', '▶ Run in the browser (Python + OpenCV)')}
        </button>
      )}
    </div>
  )
}

function Runner({ block, lang, sampleId }: { block: KursCode; lang: L; sampleId: SampleId }) {
  const [src, setSrc] = useState(block.src)
  const [img, setImg] = useState<SampleId | 'own'>(sampleId)
  const [own, setOwn] = useState<ImageData | null>(null)
  const [out, setOut] = useState('')
  const [state, setState] = useState<State>('idle')
  const [result, setResult] = useState<string | null>(null)
  const runId = useRef(0)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); if (result) URL.revokeObjectURL(result) }, [result])

  const run = async () => {
    const id = ++runId.current
    setOut(''); setState('loading-runtime')
    if (result) { URL.revokeObjectURL(result); setResult(null) }
    const w = getWorker()
    w.onmessage = (ev: MessageEvent) => {
      const m = ev.data as { type: string; id?: number; stage?: string; text?: string; ok?: boolean; error?: string; ms?: number; image?: ArrayBuffer }
      if (m.type === 'progress') { setState(m.stage === 'ready' ? 'running' : (m.stage as State)); return }
      if (m.id !== id) return
      if (m.type === 'out') setOut((o) => o + (m.text ?? ''))
      if (m.type === 'done') {
        if (timer.current) clearTimeout(timer.current)
        setState(m.ok ? 'done' : 'error')
        if (!m.ok) setOut((o) => o + (m.error ?? ''))
        if (m.image) setResult(URL.createObjectURL(new Blob([m.image], { type: 'image/png' })))
        if (m.ok) setOut((o) => o + `\n[${Math.round(m.ms ?? 0)} ms]`)
      }
    }
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => { shared?.terminate(); shared = null; setState('timeout') }, TIMEOUT_MS)
    const bytes = await pngBytes(img, own)
    w.postMessage({ type: 'run', id, code: src, files: [{ name: 'girdi.png', bytes }] }, [bytes])
  }
  const onFile = (f: File | undefined) => {
    if (!f) return
    const url = URL.createObjectURL(f), im = new Image()
    im.onload = () => { const r = toRgba(im, im.naturalWidth, im.naturalHeight); setOwn(new ImageData(new Uint8ClampedArray(r.data), r.w, r.h)); setImg('own'); URL.revokeObjectURL(url) }
    im.src = url
  }
  const busy = state === 'loading-runtime' || state === 'loading-cv' || state === 'running'
  const stateText: Record<State, string> = {
    idle: '', 'loading-runtime': tx(lang, 'Python yükleniyor (ilk seferde ~10 MB)…', 'Loading Python (~10 MB the first time)…'),
    'loading-cv': tx(lang, 'NumPy ve OpenCV yükleniyor (ilk seferde ~25 MB)…', 'Loading NumPy and OpenCV (~25 MB the first time)…'),
    running: tx(lang, 'Çalışıyor…', 'Running…'), done: tx(lang, 'Bitti.', 'Done.'), error: tx(lang, 'Hata.', 'Error.'),
    timeout: tx(lang, 'Süre doldu, durduruldu.', 'Timed out, stopped.'),
  }
  return (
    <div className="cv-runner" data-testid="cv-runner">
      <div className="cv-runner-bar">
        <label>{tx(lang, 'girdi.png', 'girdi.png')}{' '}
          <select value={img} onChange={(e) => setImg(e.target.value as SampleId | 'own')}>
            {SAMPLE_IDS.map((s) => <option key={s} value={s}>{SAMPLE_TEXT[s][lang]}</option>)}
            {own && <option value="own">{tx(lang, 'Yüklediğin fotoğraf', 'Your photo')}</option>}
          </select>
        </label>
        <label className="btn btn-ghost cv-up">{tx(lang, 'Fotoğraf yükle', 'Upload photo')}<input type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} /></label>
        <button type="button" className="btn btn-primary" onClick={run} disabled={busy}>{tx(lang, 'Çalıştır', 'Run')}</button>
        <button type="button" className="btn btn-ghost" onClick={() => setSrc(block.src)} disabled={busy}>{tx(lang, 'Kodu sıfırla', 'Reset code')}</button>
        <span className="muted rb-small" aria-live="polite">{stateText[state]}</span>
      </div>
      <textarea className="cv-editor" value={src} onChange={(e) => setSrc(e.target.value)} spellCheck={false} rows={Math.min(28, src.split('\n').length + 1)} aria-label={tx(lang, 'Python kodu', 'Python code')} />
      {out && <pre className="cv-out">{out}</pre>}
      {result && <figure className="cv-img"><img src={result} alt={tx(lang, 'cikti.png', 'cikti.png')} /><figcaption>cikti.png</figcaption></figure>}
    </div>
  )
}
