'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CodePane, type CodePaneApi } from '@/components/lab/code-pane'
import { SerialMonitor } from '@/components/lab/serial-monitor'
import { GoalTracker, idleSnapshot } from '@/lib/arena/goals'
import { createArenaRuntime, type ArenaRuntime } from '@/lib/arena/runtime'
import { variantsForScene, type ArenaVariantEntry } from '@/lib/arena/variants'
import type { ArenaGoal, ArenaGoalResult, ArenaScene, ArenaSnapshot } from '@/lib/arena/types'
import { compileCode, type CompileError } from '@/lib/lab/compile-client'
import { logEvent } from '@/lib/events'
import { ArenaCanvas } from './arena-canvas'
import dynamic from 'next/dynamic'
import { useView3D, ViewBar } from '../three/view-bar'

const Arena3D = dynamic(() => import('./arena-3d').then((m) => m.Arena3D), { ssr: false, loading: () => <div className="arena-3d" /> })
import { ArenaGoals, SensorPanel } from './arena-panels'

export interface ArenaEditorProps {
  scene: ArenaScene
  /** Verilirse sahne seçici görünür (serbest mod). */
  scenes?: ArenaScene[]
  /** Serbest mod: sahne kimliği → başlangıç kodu. */
  starters?: Record<string, string>
  initialCode: string
  goals?: ArenaGoal[]
  /** Verilirse kod (ve serbest modda sahne) tarayıcıda bu anahtarla saklanır. */
  storageKey?: string
  /** Seri monitörün altında tek tıkla gönderilen komutlar. */
  quickSend?: Array<{ label: string; text: string }>
  onGoalsComplete?: () => void
  compact?: boolean
}

type CompileView =
  | { status: 'idle' }
  | { status: 'compiling' }
  | { status: 'ok'; flashBytes?: number; ramBytes?: number }
  | { status: 'errors'; errors: CompileError[] }
  | { status: 'failed'; message: string; unavailable?: boolean }

const FLASH_MAX = 32256, RAM_MAX = 2048
const pct = (n: number, max: number) => `%${((n / max) * 100).toFixed(1).replace('.', ',')}`
const SPEEDS = [1, 2, 4] as const
const fmtTime = (s: number) => {
  const t = Math.max(0, Math.floor(s * 1000)), m = Math.floor(t / 60000), sec = Math.floor((t % 60000) / 1000)
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${String(t % 1000).padStart(3, '0')}`
}

function ArenaEditorBase({ scene: sceneProp, scenes, starters, initialCode, goals, storageKey, quickSend, onGoalsComplete, compact }: ArenaEditorProps) {
  const free = !!scenes?.length
  const [sceneId, setSceneId] = useState(sceneProp.id)
  const scene = useMemo(() => (free ? scenes!.find((s) => s.id === sceneId) ?? sceneProp : sceneProp), [free, scenes, sceneId, sceneProp])
  const [codes, setCodes] = useState<Record<string, string>>(() => ({ ...(starters ?? {}), [sceneProp.id]: starters?.[sceneProp.id] ?? initialCode }))
  const code = codes[scene.id] ?? starters?.[scene.id] ?? initialCode
  const setCode = useCallback((v: string) => setCodes((c) => ({ ...c, [scene.id]: v })), [scene.id])

  const tracker = useMemo(() => new GoalTracker(goals ?? []), [goals])
  const [running, setRunning] = useState(false)
  const [paused, setPaused] = useState(false)
  const view = useView3D()
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1)
  const [compile, setCompile] = useState<CompileView>({ status: 'idle' })
  const [notice, setNotice] = useState('')
  const [, setFrame] = useState(0)
  const [serialBase, setSerialBase] = useState(0)
  const [serialOpen, setSerialOpen] = useState(false)
  const [goalStatus, setGoalStatus] = useState<ArenaGoalResult[]>(() => (goals?.length ? new GoalTracker(goals).evaluate({ snap: idleSnapshot(sceneProp), started: false, code: initialCode, scene: sceneProp }) : []))
  const [loaded, setLoaded] = useState(!storageKey)
  const [stale, setStale] = useState(false)

  const rtRef = useRef<ArenaRuntime | null>(null)
  const idle = useMemo(() => idleSnapshot(scene), [scene])
  const snapRef = useRef<ArenaSnapshot>(idle)
  const codeApi = useRef<CodePaneApi>(null)
  const runId = useRef(0)
  const codeRef = useRef(code); codeRef.current = code
  const sceneRef = useRef(scene); sceneRef.current = scene
  const pausedRef = useRef(false); pausedRef.current = paused
  const speedRef = useRef<number>(1); speedRef.current = speed
  const staleRef = useRef(false); staleRef.current = stale
  const measured = useRef(1)
  const wasAllDone = useRef(false)
  const completeCb = useRef(onGoalsComplete); completeCb.current = onGoalsComplete
  const noticeTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const serialSeen = useRef(false)

  const say = useCallback((m: string) => {
    setNotice(m); clearTimeout(noticeTimer.current)
    noticeTimer.current = setTimeout(() => setNotice(''), 4200)
  }, [])

  // ---- kalıcılık ----
  useEffect(() => {
    if (!storageKey) return
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const saved = JSON.parse(raw) as { codes?: unknown; code?: unknown; sceneId?: unknown }
        if (saved.codes && typeof saved.codes === 'object') {
          const clean: Record<string, string> = {}
          for (const [k, v] of Object.entries(saved.codes as Record<string, unknown>)) if (typeof v === 'string') clean[k] = v
          setCodes((c) => ({ ...c, ...clean }))
        } else if (typeof saved.code === 'string') setCodes((c) => ({ ...c, [sceneProp.id]: saved.code as string }))
        if (free && typeof saved.sceneId === 'string' && scenes!.some((s) => s.id === saved.sceneId)) setSceneId(saved.sceneId)
      }
    } catch { /* bozuk kayıt: başlangıçla devam */ }
    setLoaded(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey])
  useEffect(() => {
    if (!storageKey || !loaded) return
    const t = setTimeout(() => { try { localStorage.setItem(storageKey, JSON.stringify({ v: 2, codes, sceneId: free ? sceneId : undefined })) } catch { /* kota/gizli pencere */ } }, 300)
    return () => clearTimeout(t)
  }, [codes, sceneId, storageKey, loaded, free])

  // ---- hedefler ----
  const evalGoals = useCallback(() => {
    if (!goals?.length) return
    const started = rtRef.current !== null && !staleRef.current
    const res = tracker.evaluate({ snap: snapRef.current, started, code: codeRef.current, scene: sceneRef.current })
    setGoalStatus((prev) => (prev.length === res.length && prev.every((p, i) => p.done === res[i].done) ? prev : res))
  }, [goals, tracker])
  useEffect(() => { // kod değişince: eski çalışmanın sonucu artık geçerli değil
    if (rtRef.current) { setStale(true); staleRef.current = true }
    tracker.reset()
    evalGoals()
  }, [code, tracker, evalGoals])
  useEffect(() => { evalGoals() }, [evalGoals, scene, running, stale])
  useEffect(() => {
    const all = goalStatus.length > 0 && goalStatus.every((g) => g.done)
    if (all && !wasAllDone.current) completeCb.current?.()
    wasAllDone.current = all
  }, [goalStatus])

  // ---- çalışma döngüsü ----
  const stopRun = useCallback(() => {
    runId.current++
    setRunning(false); setPaused(false)
    setCompile((c) => (c.status === 'compiling' ? { status: 'idle' } : c))
    evalGoals()
  }, [evalGoals])

  useEffect(() => {
    if (!running) return
    let last = performance.now(), raf = 0, n = 0
    const loop = (t: number) => {
      const rt = rtRef.current
      if (!rt) return
      const raw = Math.max(1, Math.min(100, t - last)); last = t
      try {
        if (!pausedRef.current) {
          const want = raw * speedRef.current
          const t0 = performance.now()
          let done = 0
          while (done < want && performance.now() - t0 < 14) { const d = Math.min(10, want - done); rt.advance(d); done += d }
          measured.current = measured.current * 0.9 + Math.min(1, done / want) * 0.1
          snapRef.current = rt.snapshot()
        }
      } catch (e) {
        console.error(e)
        say('Benzetim hata verdi ve durduruldu.')
        stopRun()
        return
      }
      if (++n % 6 === 0) evalGoals()
      const limit = sceneRef.current.timeLimitS
      if (limit && snapRef.current.timeS >= limit) { say('Süre doldu. ↺ ile baştan başlayabilir, ▶ ile yeniden çalıştırabilirsin.'); stopRun(); setFrame((f) => f + 1); return }
      setFrame((f) => f + 1)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running])

  useEffect(() => () => { clearTimeout(noticeTimer.current) }, [])

  const run = async () => {
    runId.current++
    const id = runId.current
    setRunning(false)
    setCompile({ status: 'compiling' })
    const out = await compileCode(codeRef.current)
    if (id !== runId.current) return
    logEvent('compile', { p: { ok: out.ok, kind: 'arena' } })
    if (!out.ok) {
      setCompile(out.errors.length ? { status: 'errors', errors: out.errors } : { status: 'failed', message: out.message ?? 'Derleme başarısız oldu.', unavailable: out.unavailable })
      return
    }
    try {
      const rt = createArenaRuntime(out.hex, sceneRef.current)
      rtRef.current = rt
      snapRef.current = rt.snapshot()
      tracker.reset(); setStale(false); staleRef.current = false
      setSerialBase(0); setPaused(false); measured.current = 1
      setCompile({ status: 'ok', flashBytes: out.flashBytes, ramBytes: out.ramBytes })
      setRunning(true)
      logEvent('run', { p: { kind: 'arena' } })
    } catch (e) {
      console.error(e)
      setCompile({ status: 'failed', message: 'Benzetim başlatılamadı. Hex dosyası geçersiz olabilir.' })
    }
  }

  const resetAll = useCallback(() => {
    runId.current++
    rtRef.current = null
    snapRef.current = idleSnapshot(sceneRef.current)
    tracker.reset()
    setRunning(false); setPaused(false); setStale(false); staleRef.current = false
    setSerialBase(0); setCompile({ status: 'idle' })
    setFrame((f) => f + 1)
    evalGoals()
  }, [tracker, evalGoals])
  // sahne değişince baştan
  const firstScene = useRef(true)
  useEffect(() => { if (firstScene.current) { firstScene.current = false; return } resetAll() }, [scene, resetAll])

  // ---- görünüm verileri ----
  const rt = rtRef.current
  const snap = rt ? snapRef.current : idle
  const errorLines = useMemo(() => (compile.status === 'errors' ? compile.errors.map((e) => e.line) : []), [compile])
  const serialText = rt ? rt.sim.serial.slice(serialBase) : ''
  useEffect(() => { if (serialText && !serialSeen.current) { serialSeen.current = true; setSerialOpen(true) } }, [serialText])
  const statusText = compile.status === 'compiling' ? 'Derleniyor…' : running ? (paused ? 'Duraklatıldı' : 'Çalışıyor') : rt ? 'Durdu' : 'Hazır'
  const trail = rt?.rover?.state.trail
  const place = (p: { x?: number; y?: number; theta?: number }) => {
    const r = rtRef.current
    if (!r) { say('Robotu kaydırmak için önce ▶ ile programı başlat.'); return }
    r.place(p)
    snapRef.current = r.snapshot()
    setFrame((f) => f + 1)
  }
  const nudge = (fwd: number, left: number, turnDeg: number) => {
    const sn = snapRef.current
    if (sn.kind !== 'rover') return
    const c = Math.cos(sn.theta), si = Math.sin(sn.theta)
    place({ x: sn.x + c * fwd - si * left, y: sn.y + si * fwd + c * left, theta: sn.theta + (turnDeg * Math.PI) / 180 })
  }

  return (
    <div className="jr-host lab-host arena-host">
      <div className={`lab arena${compact ? ' compact' : ''}`} data-running={running ? 'true' : 'false'} data-testid="arena-editor">
        <div className="lab-left">
          <section className="lab-codecard" aria-label="Kod düzenleyici">
            <div className="lab-tabs" role="tablist" aria-label="Dosyalar">
              <span className="lab-tab" role="tab" aria-selected="true">robot.ino</span>
              <div className="lab-tabs-slot" data-slot="code-mode" />
            </div>
            <CodePane value={code} onChange={setCode} errorLines={errorLines} apiRef={codeApi} height={compact ? 300 : 460} />
          </section>
          <div className="lab-compile" data-testid="arena-compile" data-status={compile.status} aria-live="polite">
            {compile.status === 'idle' && <p className="muted">Kodu yaz, sonra ▶ ile derle ve robotu çalıştır.</p>}
            {compile.status === 'compiling' && <p>Derleniyor…</p>}
            {compile.status === 'ok' && (
              <p className="lab-ok">
                Derleme başarılı.
                {compile.flashBytes !== undefined && <> Program: {compile.flashBytes} bayt ({pct(compile.flashBytes, FLASH_MAX)}).</>}
                {compile.ramBytes !== undefined && <> RAM: {compile.ramBytes} bayt ({pct(compile.ramBytes, RAM_MAX)}).</>}
              </p>
            )}
            {compile.status === 'failed' && <p className="lab-err" role="alert" data-unavailable={compile.unavailable ? 'true' : undefined}>{compile.message}</p>}
            {compile.status === 'errors' && (
              <div role="alert">
                <p className="lab-err">{compile.errors.length} derleme hatası:</p>
                <ul className="lab-errors">
                  {compile.errors.map((e, i) => (
                    <li key={i}><button type="button" data-error-goto={e.line} onClick={() => codeApi.current?.goToLine(e.line)}><b>Satır {e.line}</b>: {e.message}</button></li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <ArenaGoals status={goalStatus} />
        </div>

        <div className="lab-sim">
          <div className="lab-simbar">
            {free && (
              <label className="arena-scenepick">
                <span className="sr-only">Arena sahnesi</span>
                <select value={scene.id} onChange={(e) => setSceneId(e.target.value)} data-testid="arena-scene-select" aria-label="Arena sahnesi">
                  {scenes!.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
                </select>
              </label>
            )}
            <div className="lab-ctl" role="group" aria-label="Benzetim denetimi">
              <button type="button" className="lab-round go" data-testid="arena-run" onClick={run} disabled={compile.status === 'compiling'} aria-label={running ? 'Yeniden derle ve başlat' : 'Derle ve başlat'} title={running ? 'Yeniden derle ve başlat' : 'Derle ve başlat'}>▶</button>
              <button type="button" className="lab-round" data-testid="arena-pause" onClick={() => setPaused((p) => !p)} disabled={!running} aria-pressed={paused} aria-label={paused ? 'Sürdür' : 'Duraklat'} title={paused ? 'Sürdür' : 'Duraklat'}>{paused ? '▶' : '⏸'}</button>
              <button type="button" className="lab-round stop" data-testid="arena-stop" onClick={stopRun} disabled={!running && compile.status !== 'compiling'} aria-label="Dur" title="Dur">■</button>
              <button type="button" className="lab-round" data-testid="arena-reset" onClick={resetAll} aria-label="Sıfırla (robotu başa al)" title="Sıfırla (robotu başa al)">↺</button>
            </div>
            <div className="arena-speed" role="group" aria-label="Benzetim hızı">
              {SPEEDS.map((s) => (
                <button key={s} type="button" className="arena-speedbtn" data-testid={`arena-speed-${s}`} aria-pressed={speed === s} onClick={() => setSpeed(s)}>{s}x</button>
              ))}
            </div>
            <div className={`lab-meter${running && !paused ? ' on' : ''}`} role="status" aria-label="Benzetim durumu">
              <span className="lab-state" data-testid="arena-status">{statusText}</span>
              <span className="lab-timer" data-testid="arena-timer">{fmtTime(snap.timeS)}</span>
              <span className="lab-speed" data-testid="arena-measured" title="Gerçekleşen benzetim hızı">{running ? `×${(speed * measured.current).toFixed(1).replace('.', ',')}` : '×0'}</span>
            </div>
          </div>
          <div className="arena-stage">
            <ViewBar v={view} cams={scene.kind === 'rover'} />
            {view.is3d
              ? <Arena3D scene={scene} snap={snap} trail={trail} servoDeg={rt?.servoDeg()} onDrag={rt ? (x, y) => place({ x, y }) : undefined} mode={scene.kind === 'rover' ? view.mode : 'genel'} />
              : <ArenaCanvas scene={scene} snap={snap} trail={trail} servoDeg={rt?.servoDeg()} onDrag={rt ? (x, y) => place({ x, y }) : undefined} />}
            {notice && <div className="lab-toast" role="status">{notice}</div>}
            {stale && rt && <p className="lab-lockhint" data-testid="arena-stale">Kodu değiştirdin; sonuçlar eski çalıştırmaya ait. ▶ ile yeniden çalıştır.</p>}
          </div>
          {scene.description && <p className="arena-desc muted">{scene.description}</p>}
          {scene.kind === 'balancer' && (
            <div className="arena-quick" role="group" aria-label="Dışarıdan itme" data-testid="arena-push">
              <span className="muted">İtme (eğim hızına ekler):</span>
              {([[200, 'İleri it +200 °/s'], [-200, 'Geri it −200 °/s'], [500, 'Sert it +500 °/s']] as const).map(([dps, label]) => (
                <button key={dps} type="button" className="jr-btn small" disabled={!running} data-push={dps} onClick={() => rtRef.current?.push(dps)}>{label}</button>
              ))}
            </div>
          )}
          <SensorPanel scene={scene} snap={snap} onButton={(pin, down) => rtRef.current?.press(pin, down)} onNudge={nudge} />
        </div>

        <div className="lab-bottom">
          {quickSend?.length ? (
            <div className="arena-quick" role="group" aria-label="Hızlı komutlar" data-testid="arena-quick">
              <span className="muted">Hızlı komut:</span>
              {quickSend.map((q) => (
                <button key={q.label} type="button" className="jr-btn small" disabled={!running} onClick={() => rtRef.current?.sendSerial(q.text)}>{q.label}</button>
              ))}
            </div>
          ) : null}
          <SerialMonitor
            text={serialText} canSend={running && snap.timeS > 0.15} open={serialOpen} onToggle={() => setSerialOpen((o) => !o)} onSend={(s) => rtRef.current?.sendSerial(s)}
            onClear={() => { if (rtRef.current) setSerialBase(rtRef.current.sim.serial.length) }}
          />
        </div>
      </div>
    </div>
  )
}

/** Dersin birden çok yolu varsa (A/B/C) yol sekmelerini gösterir; her yolun kodu ve hedefleri ayrı saklanır. */
function VariantHost({ variants, ...props }: ArenaEditorProps & { variants: ArenaVariantEntry[] }) {
  const base = variants[0]
  const vKey = props.storageKey ? `${props.storageKey}:yol` : undefined
  const [vid, setVid] = useState<string>(base.activity.variant?.id ?? 'a')
  useEffect(() => { // son seçilen yol hatırlanır
    if (!vKey) return
    try { const raw = localStorage.getItem(vKey); if (raw && variants.some((v) => v.activity.variant?.id === raw)) setVid(raw) } catch { /* yok say */ }
  }, [vKey, variants])
  const pick = (id: string) => { setVid(id); if (vKey) { try { localStorage.setItem(vKey, id) } catch { /* kota */ } } }
  const cur = variants.find((v) => v.activity.variant?.id === vid) ?? base
  const isBase = cur === base
  const a = cur.activity
  const code = useMemo(() => (isBase ? props.initialCode : a.starter()), [isBase, a, props.initialCode])
  return (
    <div className="arena-variants" data-testid="arena-variants">
      <div className="arena-quick" role="tablist" aria-label="Yol seç">
        <span className="muted">Yol:</span>
        {variants.map((v) => {
          const id = v.activity.variant?.id ?? v.key
          return <button key={v.key} type="button" role="tab" className="jr-btn small" aria-selected={cur === v} aria-pressed={cur === v} data-variant={id} onClick={() => pick(id)}>{v.activity.variant?.label ?? id}</button>
        })}
      </div>
      {!isBase && a.intro && <p className="lesson-app-intro" data-testid="arena-variant-intro">{a.intro}</p>}
      <ArenaEditorBase
        key={cur.key}
        scene={isBase ? props.scene : a.scene}
        initialCode={code}
        goals={isBase ? props.goals : a.goals}
        quickSend={isBase ? props.quickSend : a.quickSend}
        storageKey={isBase || !props.storageKey ? props.storageKey : `${props.storageKey}:${a.variant?.id ?? cur.key}`}
        onGoalsComplete={props.onGoalsComplete}
        compact={props.compact}
      />
    </div>
  )
}

export function ArenaEditor(props: ArenaEditorProps) {
  const variants = props.scenes?.length ? null : variantsForScene(props.scene.id)
  if (!variants) return <ArenaEditorBase {...props} />
  return <VariantHost {...props} variants={variants} />
}
