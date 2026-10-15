'use client'
// Mikro Kart editörü: blok / JavaScript / Python görünümleri + sanal kart(lar). Tam genişlik ve tam yükseklik kullanır.
// Kullanım: <MikroEditor storageKey="ask:mikro:project:v1" /> (serbest atölye) ya da etkinlikle: <MikroEditor activity={a} storageKey="..." onGoalsChange={...} />
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { MikroActivity } from '@/lib/mikro/activity'
import { makeSoundHook, setMuted as setAudioMuted, unlockAudio } from '@/lib/mikro/audio'
import { toJavaScript, toPython } from '@/lib/mikro/codegen'
import { EXAMPLES, type MikroExample } from '@/lib/mikro/examples'
import { evaluateGoals, type GoalStatus } from '@/lib/mikro/goals'
import { countBlocks } from '@/lib/mikro/program'
import { Simulation } from '@/lib/mikro/sim'
import { exportProject, fileNameFor, loadProject, parseProject, saveProject } from '@/lib/mikro/storage'
import { emptyProject, type MikroProject, type RunError, type WorkspaceState } from '@/lib/mikro/types'
import { Board } from './board'
import { BlocklyPane as BlocklyPaneRaw } from './blockly-pane'
import { CodeView } from './highlight'
import { SimPanel } from './sim-panel'
import { RobotArena } from './robot-arena'
import { ROBOT_PROFILES, type RobotProfileId, type RobotScene } from '@/lib/mikro/robot'
import { logEvent } from '@/lib/events'
import './mikro.css'

export interface MikroEditorProps {
  /** Ders etkinliği: başlangıç projesi, izinli bloklar ve hedefler buradan gelir. */
  activity?: MikroActivity
  /** Proje tarayıcıda bu anahtarla saklanır (serbest atölye: 'ask:mikro:project:v1'). */
  storageKey: string
  /** Hedef durumları değişince (çalışma sırasında ve bitince) çağrılır. */
  onGoalsChange?: (goals: GoalStatus[], allDone: boolean) => void
  /** Başlangıç projesi (etkinlik yoksa; verilmezse boş proje). */
  initialProject?: MikroProject
  /** Robot Atölyesi: kart bu gövdeye takılır, robot her çalıştırmada `scene()` sahnesinin başında başlar. */
  robot?: RobotSetup
}

export interface RobotSetup { profile: RobotProfileId; scene: () => RobotScene }

const BlocklyPane = memo(BlocklyPaneRaw)

type Tab = 'blocks' | 'js' | 'py'

const Icon = {
  play: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor" /></svg>,
  stop: <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6.5" y="6.5" width="11" height="11" rx="2" fill="currentColor" /></svg>,
  reset: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5a7 7 0 1 1-6.7 9" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /><path d="M4 4v5h5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>,
}

function makeSim(project: MikroProject, cards: 1 | 2, prev?: Simulation, robot?: RobotSetup): Simulation {
  const sim = new Simulation(project, { cards: robot ? 1 : cards, seed: (Date.now() & 0xffff) + 1, robot: robot && { profile: robot.profile, scene: robot.scene() } })
  sim.cards.forEach((c, i) => {
    c.device.soundHook = makeSoundHook()
    const p = prev?.cards[i]
    if (p) c.device.copyInputsFrom(p.device)
    else if (prev?.cards[0]) c.device.copyInputsFrom(prev.cards[0].device)
  })
  return sim
}

const fmtTime = (ms: number) => `${(ms / 1000).toFixed(1).replace('.', ',')} sn`

export function MikroEditor({ activity, storageKey, onGoalsChange, initialProject, robot }: MikroEditorProps) {
  const base = useMemo(() => initialProject ?? activity?.starter() ?? emptyProject(), [initialProject, activity])
  const [project, setProject] = useState<MikroProject>(base)
  const [resetKey, setResetKey] = useState('0')
  const [loaded, setLoaded] = useState(false)
  const [tab, setTab] = useState<Tab>('blocks')
  const [twoCards, setTwoCards] = useState(activity?.cards === 2)
  const [sim, setSim] = useState<Simulation>(() => makeSim(base, activity?.cards === 2 ? 2 : 1, undefined, robot))
  const [running, setRunning] = useState(false)
  const [tick, setTick] = useState(0)
  const [error, setError] = useState<RunError | null>(null)
  const [glow, setGlow] = useState('')
  const [muted, setMutedState] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [notice, setNotice] = useState('')
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [goalStatus, setGoalStatus] = useState<GoalStatus[]>([])
  const [ran, setRan] = useState(false)

  const stickyRef = useRef<Set<string>>(new Set())
  const fileRef = useRef<HTMLInputElement>(null)
  const noticeTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const goalsCb = useRef(onGoalsChange); goalsCb.current = onGoalsChange
  const lastGoalSig = useRef('')
  const projectRef = useRef(project); projectRef.current = project
  const simRef = useRef(sim); simRef.current = sim
  const ranRef = useRef(ran); ranRef.current = ran

  const say = useCallback((m: string) => {
    setNotice(m)
    clearTimeout(noticeTimer.current)
    noticeTimer.current = setTimeout(() => setNotice(''), 4000)
  }, [])
  const bump = useCallback(() => setTick((t) => t + 1), [])

  // ---- kalıcılık ----
  useEffect(() => {
    const saved = loadProject(storageKey)
    if (saved) {
      setProject(saved)
      setResetKey((k) => `${k}:l`)
    }
    setLoaded(true)
  }, [storageKey])
  useEffect(() => {
    if (!loaded) return
    const t = setTimeout(() => { saveProject(storageKey, project) }, 300)
    return () => clearTimeout(t)
  }, [project, storageKey, loaded])

  // ---- hedefler ----
  const evalGoals = useCallback(() => {
    if (!activity) return
    const { status, stickyDone } = evaluateGoals(activity.goals, { sim: ranRef.current ? simRef.current : null, ws: projectRef.current.workspace }, stickyRef.current)
    stickyRef.current = stickyDone
    setGoalStatus(status)
    const sig = status.map((s) => (s.done ? 1 : 0)).join('')
    if (sig !== lastGoalSig.current) {
      lastGoalSig.current = sig
      goalsCb.current?.(status, status.every((s) => s.done))
    }
  }, [activity])
  useEffect(() => { evalGoals() }, [evalGoals, project])

  // ---- çalıştırma döngüsü ----
  useEffect(() => {
    if (!running) return
    const s = sim
    let last = performance.now()
    let raf = 0
    let sinceGoals = 0
    const loop = (t: number) => {
      const dt = Math.min(50, t - last)
      last = t
      s.advance(dt, 10)
      const hats = s.cards[0].runtime.activeHatIds().join(',')
      setGlow((g) => (g === hats ? g : hats))
      bump()
      sinceGoals += dt
      if (sinceGoals > 250) { sinceGoals = 0; evalGoals() }
      if (s.error) { setError(s.error); setRunning(false); setGlow(''); s.stop(); evalGoals(); return }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [running, sim, bump, evalGoals])

  const start = () => {
    unlockAudio()
    const next = makeSim(projectRef.current, twoCards ? 2 : 1, simRef.current, robot)
    next.start()
    setSim(next); setError(null); setRan(true); setDirty(false); setRunning(true)
    logEvent('run', { p: { kind: robot ? 'robot' : 'mikro' } })
  }
  const stop = () => {
    sim.stop(); setRunning(false); setGlow('')
    ranRef.current = true
    setTimeout(evalGoals, 0)
    bump()
  }
  const reset = () => {
    sim.stop()
    setRunning(false); setGlow(''); setError(null); setRan(false); setDirty(false)
    setSim(makeSim(projectRef.current, twoCards ? 2 : 1, sim, robot))
    setTimeout(evalGoals, 0)
  }
  const toggleTwo = () => {
    const next = !twoCards
    setTwoCards(next)
    const wasRunning = running
    const ns = makeSim(projectRef.current, next ? 2 : 1, sim, robot)
    sim.stop()
    setSim(ns); setError(null)
    if (wasRunning) { ns.start(); setRunning(true) } else { setRunning(false); setRan(false) }
  }

  // ---- düzenleme ----
  const onWorkspace = useCallback((ws: WorkspaceState) => {
    setProject((p) => ({ ...p, workspace: ws }))
    stickyRef.current = new Set()
    setDirty(true)
    setError(null)
  }, [])

  const loadNew = (p: MikroProject, cards: 1 | 2 = 1) => {
    sim.stop()
    stickyRef.current = new Set()
    setProject(p); setResetKey((k) => `${k}:n`); setRunning(false); setRan(false); setError(null); setGlow(''); setDirty(false)
    setTwoCards(cards === 2)
    setSim(makeSim(p, cards, sim, robot))
  }
  const hasWork = countBlocks(project.workspace) > 0
  const confirmReplace = () => !hasWork || window.confirm('Şu anki projenin üzerine yazılacak. Devam edelim mi?')

  const openExample = (ex: MikroExample) => {
    if (!confirmReplace()) return
    loadNew(ex.build(), ex.cards ?? 1)
    setGalleryOpen(false); setTab('blocks')
    say(`"${ex.title}" örneği açıldı. ${ex.tryIt}`)
  }
  const newProject = () => {
    if (activity) {
      if (!window.confirm('Etkinliğin başlangıç haline dönmek istiyor musun? Yaptıkların silinir.')) return
      loadNew(activity.starter(), activity.cards === 2 ? 2 : 1)
      return
    }
    if (hasWork && !window.confirm('Yeni, boş bir proje açılsın mı? Şu anki projeyi dışa aktarmadıysan kaybolur.')) return
    loadNew(emptyProject(), 1)
  }
  const doExport = () => {
    const blob = new Blob([exportProject(project)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = fileNameFor(project)
    document.body.appendChild(a); a.click(); a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    say('Proje dosyası indirildi.')
  }
  const doImport = async (file: File | undefined) => {
    if (!file) return
    const text = await file.text()
    const r = parseProject(text)
    if (!r.ok) { say(`İçe aktarılamadı: ${r.error}`); return }
    if (!confirmReplace()) return
    loadNew(r.project, 1)
    say(`"${r.project.name}" projesi açıldı.`)
  }
  const toggleMute = () => {
    const next = !muted
    setAudioMuted(next)
    if (next) sim.cards.forEach((c) => c.device.stopSound())
    setMutedState(next)
  }
  const glowIds = useMemo(() => (glow ? glow.split(',') : []), [glow])

  // ---- görünümler ----
  const js = useMemo(() => (tab === 'js' ? toJavaScript(project.workspace) : ''), [tab, project.workspace])
  const py = useMemo(() => (tab === 'py' ? toPython(project.workspace) : ''), [tab, project.workspace])
  const copyCode = async () => {
    try { await navigator.clipboard.writeText(tab === 'js' ? js : py); say('Kod kopyalandı.') } catch { say('Kopyalanamadı.') }
  }

  const doneCount = goalStatus.filter((g) => g.done).length
  const allDone = goalStatus.length > 0 && doneCount === goalStatus.length
  const allowed = activity?.allowedBlocks ?? null

  return (
    <div className="mk-box"><div className="mk-ed" data-testid="mikro-editor" data-running={running}>
      {/* üst çubuk */}
      <div className="mk-bar" role="toolbar" aria-label="Mikro Kart araçları">
        <div className="mk-run">
          <button className="mk-round go" onClick={start} aria-label="Çalıştır" title="Çalıştır" data-testid="mikro-run">{Icon.play}</button>
          <button className="mk-round halt" onClick={stop} disabled={!running} aria-label="Durdur" title="Durdur" data-testid="mikro-stop">{Icon.stop}</button>
          <button className="mk-round rst" onClick={reset} aria-label="Sıfırla" title="Sıfırla (kartı temizle)" data-testid="mikro-reset">{Icon.reset}</button>
        </div>
        <input className="mk-name" value={project.name} maxLength={60} onChange={(e) => setProject((p) => ({ ...p, name: e.target.value }))} aria-label="Proje adı" data-testid="mikro-name" />
        <span className="mk-state" data-testid="mikro-state">
          {error ? <b className="err">Hata</b> : running ? <b className="ok">Çalışıyor</b> : ran ? 'Durdu' : 'Hazır'} · {fmtTime(sim.now)}
        </span>
        {dirty && running && <span className="mk-chipnote">Değişiklikler için ▶ düğmesine bas</span>}
        <span className="mk-spacer" />
        {!activity && !robot && <button className="mk-btn" onClick={() => setGalleryOpen(true)} data-testid="mikro-gallery-open">Örnekler</button>}
        <button className="mk-btn" onClick={newProject} data-testid="mikro-new">{activity ? 'Başa dön' : 'Yeni'}</button>
        <button className="mk-btn" onClick={doExport} data-testid="mikro-export">Dışa aktar</button>
        <button className="mk-btn" onClick={() => fileRef.current?.click()} data-testid="mikro-import">İçe aktar</button>
        <input ref={fileRef} type="file" accept=".json,application/json" hidden onChange={(e) => { void doImport(e.target.files?.[0]); e.target.value = '' }} data-testid="mikro-import-file" />
      </div>

      {notice && <div className="mk-notice" role="status" data-testid="mikro-notice">{notice}</div>}
      {error && (
        <div className="mk-error" role="alert" data-testid="mikro-error">
          <b>Program durdu{sim.cards.length > 1 ? ` (kart ${error.card + 1})` : ''}:</b> {error.message}
        </div>
      )}

      <div className="mk-main">
        {/* sol: bloklar / kod */}
        <section className="mk-left" aria-label="Program">
          {activity && (
            <div className={`mk-goals${allDone ? ' all' : ''}`} data-testid="mikro-goals">
              {activity.intro && <p className="mk-intro">{activity.intro}</p>}
              <div className="mk-goals-head"><b>Hedefler</b><span>{doneCount} / {goalStatus.length}</span></div>
              <ul>
                {goalStatus.map((g) => (
                  <li key={g.id} className={g.done ? 'done' : ''} data-goal={g.id} data-done={g.done}>
                    <span className="mk-goal-mark" aria-hidden="true">{g.done ? '✓' : ''}</span>
                    <span>{g.text}{!g.done && g.hint && <small>{g.hint}</small>}</span>
                  </li>
                ))}
              </ul>
              {allDone && <p className="mk-goals-ok">Tüm hedefler tamam. Harika iş!</p>}
            </div>
          )}
          <div className="mk-tabs" role="tablist" aria-label="Görünüm">
            {([['blocks', 'Bloklar'], ['js', 'JavaScript'], ['py', 'Python']] as [Tab, string][]).map(([k, label]) => (
              <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)} data-testid={`mikro-tab-${k}`}>{label}</button>
            ))}
            {tab !== 'blocks' && <button className="mk-btn small" onClick={copyCode} data-testid="mikro-copy">Kopyala</button>}
          </div>
          <div className="mk-work">
            {/* Blockly sekme değişince yok edilmesin: gizlenir */}
            <div className="mk-pane" hidden={tab !== 'blocks'}>
              <BlocklyPane workspace={project.workspace} onChange={onWorkspace} allowedBlocks={allowed} robot={robot ? ROBOT_PROFILES[robot.profile] : null} resetKey={resetKey} activeHatIds={glowIds} errorBlockId={error?.blockId ?? null} />
            </div>
            {tab === 'js' && <div className="mk-pane code"><CodeView code={js} lang="js" /></div>}
            {tab === 'py' && <div className="mk-pane code"><CodeView code={py} lang="py" /></div>}
          </div>
        </section>

        {/* sağ: sanal kart(lar) */}
        <aside className="mk-right" aria-label={sim.robot ? 'Sanal robot' : 'Sanal kart'}>
          {sim.robot && <RobotArena robot={sim.robot} tick={tick} />}
          <div className={`mk-boards${sim.cards.length > 1 ? ' two' : ''}`}>
            {sim.cards.map((c, i) => (
              <Board key={i} device={c.device} tick={tick} title={sim.robot ? 'ROBOTUN KARTI' : sim.cards.length > 1 ? `KART ${i + 1}` : 'MİKRO KART'} compact={sim.cards.length > 1 || !!sim.robot}
                onButton={(b, down) => { if (down) c.device.press(b); else c.device.release(b); bump() }}
                onLogo={(down) => { c.device.setLogo(down); bump() }}
                onPin={(p, down) => { c.device.setPinTouch(p, down); bump() }} />
            ))}
          </div>
          <SimPanel sim={sim} tick={tick} bump={bump} twoCards={twoCards} onToggleTwo={toggleTwo} muted={muted} onMute={toggleMute} noRadio={!!robot} />
        </aside>
      </div>

      {galleryOpen && (
        <div className="mk-dialog-overlay" onClick={(e) => { if (e.target === e.currentTarget) setGalleryOpen(false) }} data-testid="mikro-gallery">
          <div className="mk-dialog wide" role="dialog" aria-modal="true" aria-label="Örnek projeler">
            <div className="mk-gal-head"><h2>Örnek projeler</h2><button className="mk-btn" onClick={() => setGalleryOpen(false)}>Kapat</button></div>
            <ul className="mk-gal">
              {EXAMPLES.map((ex) => (
                <li key={ex.id}>
                  <button className="mk-gal-card" onClick={() => openExample(ex)} data-testid={`mikro-example-${ex.id}`}>
                    <b>{ex.title}</b>
                    <span>{ex.description}</span>
                    {ex.cards === 2 && <em>2 kart</em>}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div></div>
  )
}
