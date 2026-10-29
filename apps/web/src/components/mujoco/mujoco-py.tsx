'use client'
// MuRoKo Python sekmesi: kod gerçek Python'dur (Pyodide, public/pyodide/muroko-worker.js). `motor()`, `sensor()`, `await bekle()`.
// Worker'a ~30 Hz sensör durumu gönderilir; bekleme benzetim saatine bağlıdır, duvar saatine değil.
import { useCallback, useEffect, useRef, useState } from 'react'

const WORKER_URL = '/pyodide/muroko-worker.js'

export interface PyBridge {
  /** Her karede çağrılır: benzetim zamanı ve sensör değerleri. */
  tick: (t: number, sensors: Record<string, number>) => void
}

interface Props {
  en: boolean
  starter: string
  /** Blok panelinin ürettiği Python (boş olabilir). */
  fromBlocks: string
  motors: string[]
  sensors: string[]
  setMotor: (name: string, value: number) => void
  /** Çalıştırmadan önce benzetimi sıfırlar ve duraklatır (Python yüklenirken robot devrilmesin). */
  onStart: () => void
  /** Python hazır: benzetim sürer. Hata ve durdurmada da çağrılır, benzetim hiç takılı kalmaz. */
  onReady: () => void
  /** Başlangıç sensör durumu (kodla birlikte gönderilir). */
  getState: () => { t: number; sensors: Record<string, number> }
  onStop: () => void
  bridge: { current: PyBridge | null }
  /** Sahne değişince kod başlangıca döner. */
  resetKey: string
}

export function MurokoPython({ en, starter, fromBlocks, motors, sensors, setMotor, onStart, onReady, getState, onStop, bridge, resetKey }: Props) {
  const L = (tr: string, e: string) => (en ? e : tr)
  const worker = useRef<Worker | null>(null)
  const [code, setCode] = useState(starter)
  const [stage, setStage] = useState<'idle' | 'loading' | 'running'>('idle')
  const [out, setOut] = useState('')
  const [err, setErr] = useState('')
  const lastSent = useRef(0)
  const cb = useRef({ setMotor, onReady }); cb.current = { setMotor, onReady }

  useEffect(() => { setCode(starter); setOut(''); setErr('') }, [resetKey, starter])

  const kill = useCallback(() => {
    worker.current?.terminate(); worker.current = null
    bridge.current = null
    setStage('idle')
  }, [bridge])
  useEffect(() => () => { worker.current?.terminate(); bridge.current = null }, [bridge])
  // Sahne değişince çalışan program durur
  useEffect(() => { kill() }, [resetKey, kill])

  const run = () => {
    kill(); setOut(''); setErr('')
    onStart()
    setStage('loading')
    const w = new Worker(WORKER_URL)
    worker.current = w
    w.onmessage = (e: MessageEvent) => {
      const m = e.data
      if (m.type === 'status') { setStage(m.stage === 'ready' ? 'running' : 'loading'); if (m.stage === 'ready') cb.current.onReady() }
      else if (m.type === 'motor') cb.current.setMotor(m.name, m.value)
      else if (m.type === 'out') {
        if (m.stream === 'stderr') setErr((x) => (x + m.text + '\n').slice(-2000))
        else setOut((x) => (x + m.text + '\n').slice(-4000))
      } else if (m.type === 'done') {
        if (!m.ok) setErr(String(m.error ?? ''))
        // Kod bitti; motor değerleri kalır, worker kapanır
        cb.current.onReady()
        w.terminate(); if (worker.current === w) { worker.current = null; bridge.current = null; setStage('idle') }
      }
    }
    w.onerror = (e) => { setErr(e.message || L('Python çalıştırıcı yüklenemedi.', 'The Python runner could not load.')); kill(); cb.current.onReady() }
    bridge.current = {
      tick: (t, s) => {
        // ~30 Hz: her karede mesaj yığılmasın
        if (t - lastSent.current < 0.03 && t >= lastSent.current) return
        lastSent.current = t
        w.postMessage({ type: 'state', t, sensors: s })
      },
    }
    lastSent.current = -1
    w.postMessage({ type: 'run', code, motors, sensors, state: getState() })
  }
  const stop = () => { kill(); onStop(); onReady() }

  return (
    <div className="mj-py-tab" data-testid="mujoco-pytab">
      <p className="muted">{L(
        'Gerçek Python: motor("ad", değer), sensor("ad") ve await bekle(saniye) kullan. bekle\'nin önüne await yazmayı unutma.',
        'Real Python: use motor("name", value), sensor("name") and await wait(seconds). Do not forget await before wait.')}</p>
      <textarea className="mj-ta mj-code" value={code} spellCheck={false} onChange={(e) => setCode(e.target.value)} aria-label="Python" data-testid="mujoco-pycode" />
      <div className="mj-bar">
        <button className="sbtn" onClick={run} disabled={stage === 'loading'} data-testid="mujoco-pyrun">
          {stage === 'loading' ? L('Python yükleniyor…', 'Loading Python…') : L('Python\'u çalıştır', 'Run Python')}
        </button>
        <button className="sbtn ghost" onClick={stop} disabled={stage === 'idle'}>{L('Durdur', 'Stop')}</button>
        <button className="sbtn ghost" onClick={() => setCode(starter)}>{L('Şablonu yükle', 'Load template')}</button>
        <button className="sbtn ghost" onClick={() => fromBlocks && setCode(fromBlocks)} disabled={!fromBlocks} data-testid="mujoco-pyfromblocks">{L('Bloklardan al', 'Take from blocks')}</button>
      </div>
      {(out || err) && (
        <pre className={`mj-out${err ? ' bad' : ''}`} data-testid="mujoco-pyout" role={err ? 'alert' : undefined}>{out}{err}</pre>
      )}
      <p className="mj-hint">{L('İlk çalıştırmada Python yaklaşık 10 MB indirilir (bir kez). Sonsuz döngüyü Durdur ile kesebilirsin.', 'The first run downloads about 10 MB of Python (once). Stop interrupts an endless loop.')}</p>
    </div>
  )
}
