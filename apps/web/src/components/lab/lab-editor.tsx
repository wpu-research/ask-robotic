'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { compileCode, type CompileError } from '@/lib/lab/compile-client'
import { logEvent } from '@/lib/events'
import { PROPS, type Circuit, type LabApi, type PartType, type PropValue } from '@/lib/lab/contract'
import { PART_DEFS } from '@/lib/lab/geometry'
import { evaluateLabGoals, type LabGoal, type LabGoalResult } from '@/lib/lab/goals'
import { addPart, hasParts, isCircuit, normalizeCircuit, removePart, removeWire, rotatePart, setProp } from '@/lib/lab/ops'
import { DEFAULT_PARTS, STAGE_A_PARTS, STAGE_B_PARTS } from '@/lib/lab/parts'
import { warningMeta, warningMessage, warningTitle } from '@/lib/lab/warnings'
import { percent } from '@/lib/lab/text'
import type { MessageKey } from '@/i18n'
import { useLocale, useT } from '@/i18n/client'
import { StatsTracker } from '@/lib/lab/stats'
import { analyze, createRuntime } from '@/lib/lab/runtime'
import { isBuzzerMuted, setBuzzer, setBuzzerMuted, unlockAudio } from '@/lib/lab/sound'
import { LabCanvas, type CanvasApi, type Selection } from './canvas'
import { CodePane, type CodePaneApi } from './code-pane'
import { LabGoals } from './lab-goals'
import { PartPicker } from './part-picker'
import { PropsPanel } from './props-panel'
import { SerialMonitor } from './serial-monitor'

export { STAGE_A_PARTS, STAGE_B_PARTS, DEFAULT_PARTS }

export interface LabEditorProps {
  initial: Circuit
  initialCode: string
  allowedParts?: PartType[]
  /** Silinemez/taşınamaz parça kimlikleri. Varsayılan: Uno. */
  lockedPartIds?: string[]
  goals?: LabGoal[]
  /** Verilirse devre ve kod tarayıcıda bu anahtarla saklanır. */
  storageKey?: string
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

export function LabEditor({ initial, initialCode, allowedParts = DEFAULT_PARTS, lockedPartIds, goals, storageKey, onGoalsComplete, compact }: LabEditorProps) {
  const t = useT()
  const locale = useLocale()
  const tRef = useRef(t); tRef.current = t
  const pct = (n: number, max: number) => percent(t, locale, (n / max) * 100)
  const locked = useMemo(() => new Set(lockedPartIds ?? initial.parts.filter((p) => p.type === 'uno').map((p) => p.id)), [lockedPartIds, initial])
  const [circuit, setCircuit] = useState<Circuit>(initial)
  const [code, setCode] = useState(initialCode)
  const [selection, setSelection] = useState<Selection>(null)
  const [running, setRunning] = useState(false)
  const [, setFrame] = useState(0)
  const [compile, setCompile] = useState<CompileView>({ status: 'idle' })
  const [notice, setNotice] = useState('')
  const [muted, setMutedState] = useState(false)
  const [latched, setLatched] = useState<ReadonlySet<string>>(new Set())
  const [serialBase, setSerialBase] = useState(0)
  const [lastSerial, setLastSerial] = useState('')
  const [goalStatus, setGoalStatus] = useState<LabGoalResult[]>([])
  const [loaded, setLoaded] = useState(!storageKey)
  const [fitKey, setFitKey] = useState(0)
  const [paused, setPaused] = useState(false)
  const [serialOpen, setSerialOpen] = useState(false)

  const lab = useRef<LabApi | null>(null)
  const canvasApi = useRef<CanvasApi>(null)
  const codeApi = useRef<CodePaneApi>(null)
  const runId = useRef(0)
  const circuitRef = useRef(circuit); circuitRef.current = circuit
  const codeRef = useRef(code); codeRef.current = code
  const behaviorDone = useRef(new Set<string>())
  const wasAllDone = useRef(false)
  const noticeTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const completeCb = useRef(onGoalsComplete); completeCb.current = onGoalsComplete
  const pausedRef = useRef(false); pausedRef.current = paused
  const speedRef = useRef(1)
  const serialSeen = useRef(false)
  const tracker = useRef(new StatsTracker())

  const say = useCallback((m: string) => {
    setNotice(m)
    clearTimeout(noticeTimer.current)
    noticeTimer.current = setTimeout(() => setNotice(''), 3800)
  }, [])

  // ---- kalıcılık ----
  useEffect(() => {
    if (!storageKey) return
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const saved = JSON.parse(raw) as { circuit?: unknown; code?: unknown }
        if (isCircuit(saved.circuit) && hasParts(saved.circuit, [...locked]) && typeof saved.code === 'string') {
          setCircuit(normalizeCircuit(saved.circuit)); setCode(saved.code); setFitKey((k) => k + 1)
        }
      }
    } catch { /* bozuk kayıt: başlangıçla devam */ }
    setLoaded(true)
  }, [storageKey, locked])
  useEffect(() => {
    if (!storageKey || !loaded) return
    const t = setTimeout(() => { try { localStorage.setItem(storageKey, JSON.stringify({ v: 1, circuit, code })) } catch { /* kota/gizli pencere */ } }, 300)
    return () => clearTimeout(t)
  }, [circuit, code, storageKey, loaded])

  // ---- hedefler ----
  const analysis = useMemo(() => analyze(circuit), [circuit])
  const evalGoals = useCallback(() => {
    if (!goals?.length) return
    const a = analyze(circuitRef.current)
    const res = evaluateLabGoals(goals, { circuit: circuitRef.current, analysis: a, lab: lab.current?.state ?? null, code: codeRef.current, stats: tracker.current.get() })
    const out = res.map((r, i) => {
      if (goals[i].behavior) { if (r.done) behaviorDone.current.add(r.id); return { ...r, done: r.done || behaviorDone.current.has(r.id) } }
      return r
    })
    setGoalStatus((prev) => (prev.length === out.length && prev.every((p, i) => p.done === out[i].done) ? prev : out))
  }, [goals])
  // Devre/kod değişince davranış hedefleri sıfırlanır
  useEffect(() => { behaviorDone.current.clear() }, [circuit.wires, circuit.parts.length, code])
  useEffect(() => { evalGoals() }, [evalGoals, circuit, code, running])
  useEffect(() => {
    const all = goalStatus.length > 0 && goalStatus.every((g) => g.done)
    if (all && !wasAllDone.current) completeCb.current?.()
    wasAllDone.current = all
  }, [goalStatus])

  // ---- çalışma döngüsü ----
  useEffect(() => {
    if (!running) return
    let last = performance.now()
    let raf = 0
    let n = 0
    const loop = (t: number) => {
      const l = lab.current
      if (!l) return
      const raw = Math.max(1, t - last)
      const dt = Math.min(50, raw); last = t
      try {
        if (!pausedRef.current) {
          const n = Math.max(1, Math.ceil(dt / 5)) // pin kenarları kaçmasın diye ince dilimler
          for (let i = 0; i < n; i++) { l.advance(dt / n); tracker.current.observe(l.state) }
          speedRef.current = speedRef.current * 0.92 + Math.min(1, dt / raw) * 0.08
        }
      } catch (e) {
        console.error(e)
        say(tRef.current('lab.editor.simError'))
        stopRun()
        return
      }
      let buzz: { on: boolean; freqHz: number } | undefined
      for (const p of Object.values(l.state.parts)) if (p.buzzer?.on) { buzz = p.buzzer; break }
      setBuzzer(!!buzz && !pausedRef.current, buzz?.freqHz ?? 0)
      if (++n % 10 === 0) evalGoals()
      setFrame((f) => f + 1)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running])

  const stopRun = useCallback(() => {
    runId.current++
    const l = lab.current
    if (l) {
      const st = l.state
      setLastSerial(st.serial.slice(serialBaseRef.current))
      eepromRef.current = st.eeprom.some((b) => b !== 255) ? st.eeprom : null // güç kesilince EEPROM korunur
      l.dispose()
    }
    lab.current = null
    setBuzzer(false, 0)
    setRunning(false); setPaused(false); speedRef.current = 1
    setCircuit((c) => ({ ...c, parts: c.parts.map((p) => (p.type === 'button' && p.props.pressed ? { ...p, props: { ...p.props, pressed: false } } : p)) }))
    setCompile((c) => (c.status === 'compiling' ? { status: 'idle' } : c))
  }, [])
  const serialBaseRef = useRef(0); serialBaseRef.current = serialBase
  /** Önceki çalıştırmadan kalan EEPROM (gerçek kartta güç kesilince korunur); ↺ Sıfırla boşaltır. */
  const eepromRef = useRef<Uint8Array | null>(null)

  useEffect(() => () => { lab.current?.dispose(); lab.current = null; setBuzzer(false, 0); clearTimeout(noticeTimer.current) }, [])

  const run = async () => {
    unlockAudio()
    if (lab.current) stopRun()
    const id = ++runId.current
    setCompile({ status: 'compiling' })
    const out = await compileCode(codeRef.current)
    if (id !== runId.current) return // Dur'a basıldı ya da yeni çalıştırma başladı
    logEvent('compile', { p: { ok: out.ok, kind: 'lab' } })
    if (!out.ok) {
      setCompile(out.errors.length ? { status: 'errors', errors: out.errors } : { status: 'failed', message: out.reason ? t(`lab.compile.${out.reason}` as MessageKey) : out.message ?? t('lab.compile.failed'), unavailable: out.unavailable })
      return
    }
    try {
      const kept = eepromRef.current
      const l = createRuntime(circuitRef.current, out.hex, kept ? { eeprom: kept } : undefined)
      if (kept) say(t('lab.editor.eepromKept'))
      lab.current = l
      tracker.current.reset()
      setSerialBase(0); setLastSerial(''); setPaused(false); speedRef.current = 1
      setCompile({ status: 'ok', flashBytes: out.flashBytes, ramBytes: out.ramBytes })
      setRunning(true)
      logEvent('run', { p: { kind: 'lab' } })
    } catch (e) {
      console.error(e)
      setCompile({ status: 'failed', message: t('lab.editor.startFailed') })
    }
  }

  const resetRun = () => {
    eepromRef.current = null // Sıfırla: EEPROM da fabrika durumuna (255) döner
    setSerialBase(0); setLastSerial('')
    const l = lab.current
    tracker.current.reset()
    if (l) { l.reset(); for (const p of circuitRef.current.parts) if (p.type === 'button' && p.props.pressed) l.setProp(p.id, 'pressed', false); setFrame((f) => f + 1) }
    else setCompile({ status: 'idle' })
  }

  // ---- düzenleme ----
  const editable = !running
  const change = useCallback((c: Circuit) => { if (!lab.current) setCircuit(c) }, [])

  const placeAt = (type: PartType, x: number, y: number) => {
    if (!editable) { say(t('lab.editor.cantAdd')); return }
    const r = addPart(circuitRef.current, type, x, y)
    setCircuit(r.circuit); setSelection({ kind: 'part', id: r.part.id })
  }
  const dropFromPalette = (type: PartType, cx: number, cy: number) => {
    const w = canvasApi.current?.screenToWorld(cx, cy)
    if (!w) return
    const d = PART_DEFS[type]
    placeAt(type, w.x - d.w / 2, w.y - d.h / 2)
  }
  const addFromPalette = (type: PartType) => {
    // Boş bir yer bul: sağ-alt alana ızgara şeklinde yerleştir
    const n = circuitRef.current.parts.length
    placeAt(type, 340 + (n % 5) * 120, 40 + Math.floor(n / 5) * 110)
  }

  const selectedPart = selection?.kind === 'part' ? circuit.parts.find((p) => p.id === selection.id) ?? null : null
  const selectedWire = selection?.kind === 'wire' ? circuit.wires.find((w) => w.id === selection.id) ?? null : null
  useEffect(() => { // silinen seçim temizlenir
    if (selection?.kind === 'part' && !selectedPart) setSelection(null)
    if (selection?.kind === 'wire' && !selectedWire) setSelection(null)
  }, [selection, selectedPart, selectedWire])

  const changeProp = (partId: string, key: string, value: PropValue) => {
    const part = circuitRef.current.parts.find((p) => p.id === partId)
    if (!part) return
    const def = PROPS[part.type].find((d) => d.key === key)
    if (lab.current) {
      if (!def?.live) return
      lab.current.setProp(partId, key, value)
    }
    setCircuit((c) => setProp(c, partId, key, value))
  }
  const press = (id: string, down: boolean) => {
    const part = circuitRef.current.parts.find((p) => p.id === id)
    if (!part) return
    if (latched.has(id)) { if (down) changeProp(id, 'pressed', part.props.pressed !== true) }
    else changeProp(id, 'pressed', down)
  }
  const deleteSelection = () => {
    if (!editable || !selection) return
    if (selection.kind === 'wire') setCircuit(removeWire(circuit, selection.id))
    else if (!locked.has(selection.id)) setCircuit(removePart(circuit, selection.id))
    setSelection(null)
  }

  // ---- görünüm verileri ----
  const state = lab.current?.state ?? null
  const warnings = state ? state.warnings : analysis.warnings
  const warnParts = useMemo(() => new Set(warnings.flatMap((w) => (w.partId ? [w.partId] : []))), [warnings])
  const errorLines = useMemo(() => (compile.status === 'errors' ? compile.errors.map((e) => e.line) : []), [compile])
  const serialText = state ? state.serial.slice(serialBase) : lastSerial
  useEffect(() => { if (serialText && !serialSeen.current) { serialSeen.current = true; setSerialOpen(true) } }, [serialText])
  const wireInfo = selectedWire ? `${selectedWire.a.part}.${selectedWire.a.pin} ↔ ${selectedWire.b.part}.${selectedWire.b.pin}` : null

  const canvasH = compact ? 380 : 520
  const codeH = compact ? 300 : 420
  const fmtTime = (ms: number) => {
    const t = Math.max(0, Math.floor(ms)), m = Math.floor(t / 60000), sec = Math.floor((t % 60000) / 1000)
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${String(t % 1000).padStart(3, '0')}`
  }
  const statusText = compile.status === 'compiling' ? t('lab.editor.compiling') : running ? (paused ? t('lab.editor.status.paused') : t('lab.editor.status.running')) : t('lab.editor.status.stopped')

  return (
    <div className="jr-host lab-host">
      <div className={`lab${compact ? ' compact' : ''}`} data-running={running ? 'true' : 'false'}>
        {/* Sol: kod düzenleyici (Wokwi gibi) */}
        <div className="lab-left">
          <section className="lab-codecard" aria-label={t('lab.editor.codeEditor')}>
            <div className="lab-tabs" role="tablist" aria-label={t('lab.editor.files')}>
              <span className="lab-tab" role="tab" aria-selected="true">sketch.ino</span>
              {/* İleride: Tinkercad gibi "Bloklar | Metin" geçişi bu yuvaya eklenecek. */}
              <div className="lab-tabs-slot" data-slot="code-mode" />
            </div>
            <CodePane value={code} onChange={setCode} errorLines={errorLines} apiRef={codeApi} height={codeH} />
          </section>
          <div className="lab-compile" data-testid="lab-compile" data-status={compile.status} aria-live="polite">
            {compile.status === 'idle' && <p className="muted">{t('lab.editor.idleHint')}</p>}
            {compile.status === 'compiling' && <p>{t('lab.editor.compiling')}</p>}
            {compile.status === 'ok' && (
              <p className="lab-ok">
                {t('lab.editor.compileOk')}
                {compile.flashBytes !== undefined && <> {t('lab.editor.flash', { n: compile.flashBytes, pct: pct(compile.flashBytes, FLASH_MAX) })}</>}
                {compile.ramBytes !== undefined && <> {t('lab.editor.ram', { n: compile.ramBytes, pct: pct(compile.ramBytes, RAM_MAX) })}</>}
              </p>
            )}
            {compile.status === 'failed' && <p className="lab-err" role="alert" data-unavailable={compile.unavailable ? 'true' : undefined}>{compile.message}</p>}
            {compile.status === 'errors' && (
              <div role="alert">
                <p className="lab-err">{t('lab.editor.errorCount', { n: compile.errors.length })}</p>
                <ul className="lab-errors">
                  {compile.errors.map((e, i) => (
                    <li key={i}><button type="button" data-error-goto={e.line} onClick={() => codeApi.current?.goToLine(e.line)}><b>{t('lab.editor.line', { n: e.line })}</b>: {e.message}</button></li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <LabGoals status={goalStatus} />
        </div>

        {/* Sağ: benzetim tuvali */}
        <div className="lab-sim">
          <div className="lab-simbar">
            <PartPicker types={allowedParts} disabled={!editable} onDrop={dropFromPalette} onAdd={addFromPalette} />
            <div className="lab-ctl" role="group" aria-label={t('lab.editor.simControl')}>
              <button type="button" className="lab-round go" data-testid="lab-run" onClick={run} disabled={compile.status === 'compiling'} aria-label={running ? t('lab.editor.rerun') : t('lab.editor.run')} title={running ? t('lab.editor.rerun') : t('lab.editor.run')}>▶</button>
              <button type="button" className="lab-round" data-testid="lab-pause" onClick={() => setPaused((p) => !p)} disabled={!running} aria-pressed={paused} aria-label={paused ? t('lab.editor.resume') : t('lab.editor.pause')} title={paused ? t('lab.editor.resume') : t('lab.editor.pause')}>{paused ? '▶' : '⏸'}</button>
              <button type="button" className="lab-round stop" data-testid="lab-stop" onClick={stopRun} disabled={!running && compile.status !== 'compiling'} aria-label={t('lab.editor.stop')} title={t('lab.editor.stop')}>■</button>
              <button type="button" className="lab-round" data-testid="lab-reset" onClick={resetRun} aria-label={t('lab.editor.reset')} title={t('lab.editor.reset')}>↺</button>
              <button
                type="button" className="lab-round" aria-pressed={muted} aria-label={muted ? t('lab.editor.unmute') : t('lab.editor.mute')} title={muted ? t('lab.editor.unmute') : t('lab.editor.mute')}
                onClick={() => { const m = !isBuzzerMuted(); setBuzzerMuted(m); setMutedState(m) }}
              >{muted ? '🔇' : '🔊'}</button>
            </div>
            <div className={`lab-meter${running && !paused ? ' on' : ''}`} role="status" aria-label={t('lab.editor.simStatus')}>
              <span className="lab-state" data-testid="lab-status">{statusText}</span>
              <span className="lab-timer" data-testid="lab-timer">{fmtTime(state?.timeMs ?? 0)}</span>
              <span className="lab-speed" data-testid="lab-speed" title={t('lab.editor.simSpeed')}>{t('lab.editor.pct', { p: running ? Math.round(speedRef.current * 100) : 0 })}</span>
            </div>
          </div>
          <div className="lab-stage">
            <LabCanvas
              circuit={circuit} onChange={change} lockedIds={locked} editLocked={!editable} runtime={state}
              selection={selection} onSelect={setSelection} warnParts={warnParts} onPress={press} fitKey={fitKey}
              apiRef={canvasApi} height={canvasH} onNotice={say}
            />
            {notice && <div className="lab-toast" role="status">{notice}</div>}
            {!editable && <p className="lab-lockhint" data-testid="lab-locked">{t('lab.editor.lockHint')}</p>}
          </div>
          {warnings.length > 0 && (
            <ul className="lab-warnings" role="alert" aria-label={t('lab.editor.warnings')} data-testid="lab-warnings">
              {warnings.map((w, i) => (
                <li key={`${w.kind}-${w.partId ?? ''}-${i}`} data-warning={w.kind}>
                  <span aria-hidden="true" className="lab-warn-icon">{warningMeta(w.kind).icon}</span>
                  <b className="lab-warn-title">{warningTitle(t, w.kind)}</b>
                  {w.partId ? <button type="button" title={t('lab.editor.selectPart')} onClick={() => setSelection({ kind: 'part', id: w.partId! })}>{warningMessage(t, locale, w)}</button> : <span>{warningMessage(t, locale, w)}</span>}
                </li>
              ))}
            </ul>
          )}
          <PropsPanel
            selection={selection} part={selectedPart} runtime={selectedPart ? state?.parts[selectedPart.id] : undefined} wireInfo={wireInfo} running={running} locked={!!selectedPart && locked.has(selectedPart.id)}
            latched={!!selectedPart && latched.has(selectedPart.id)}
            onLatch={(v) => selectedPart && setLatched((s) => { const n = new Set(s); if (v) n.add(selectedPart.id); else n.delete(selectedPart.id); return n })}
            onProp={(k, v) => selectedPart && changeProp(selectedPart.id, k, v)}
            onRotate={() => selectedPart && editable && setCircuit(rotatePart(circuit, selectedPart.id))}
            onDelete={deleteSelection}
          />
        </div>

        <div className="lab-bottom">
          <SerialMonitor
            text={serialText} canSend={running && (state?.timeMs ?? 0) > 20} open={serialOpen} onToggle={() => setSerialOpen((o) => !o)} onSend={(s) => lab.current?.sendSerial(s)}
            onClear={() => { if (lab.current) setSerialBase(lab.current.state.serial.length); else setLastSerial('') }}
          />
        </div>
      </div>
    </div>
  )
}
