'use client'
// MuJoCo (Google DeepMind, Apache 2.0) resmi WebAssembly sürümü tarayıcıda çalışır; fizik burada, görüntü three.js'te.
// MuJoCo koordinatı Z-yukarı; sahne grubu -90° döndürülerek three.js'in Y-yukarısına oturur.
import { useCallback, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { createStage, fitShadow, hasWebGL, type Stage } from '@/components/three/core'
import { useLocale } from '@/i18n/client'
import { MurokoBlocks } from './mujoco-blocks'
import { MurokoPython, type PyBridge } from './mujoco-py'
import { TraceGraph, GRAPH_COLORS } from './trace-graph'
import { Runner, type Op } from '@/lib/mujoco/program'
import { buildChannels, readAll, type Channel } from '@/lib/mujoco/sensors'
import { GoalTracker } from '@/lib/mujoco/goals'
import { Trace } from '@/lib/mujoco/trace'
import { MJ_SCENES, MJ_REPO, MJ_WASM_REPO, type MjScene } from '@/lib/mujoco/scenes'

/* eslint-disable @typescript-eslint/no-explicit-any */
type Mj = any

let mjPromise: Promise<Mj> | null = null
/** WASM modülü sayfa başına bir kez yüklenir (8 MB; ilk açılışta indirilir, sonra önbellekten gelir). */
function loadMujoco(): Promise<Mj> {
  mjPromise ??= (async () => {
    const url = '/mujoco/mujoco.js'
    const mod = await import(/* webpackIgnore: true */ /* turbopackIgnore: true */ url)
    return mod.default({ locateFile: (p: string) => `/mujoco/${p}` })
  })().catch((e) => { mjPromise = null; throw e })
  return mjPromise
}

const OBJ_ACTUATOR = 19
const OBJ_SENSOR = 20

interface Sim {
  mj: Mj; model: any; data: any
  meshes: THREE.Mesh[]
  ctrl: { name: string; lo: number; hi: number }[]
  channels: Channel[]
  timestep: number
}

function floorTexture() {
  // MuJoCo görüntüleyicisindeki mavi kareli zemin
  const c = document.createElement('canvas'); c.width = c.height = 128
  const g = c.getContext('2d')!
  g.fillStyle = '#24467a'; g.fillRect(0, 0, 128, 128)
  g.fillStyle = '#2f5a9a'; g.fillRect(0, 0, 64, 64); g.fillRect(64, 64, 64, 64)
  g.strokeStyle = 'rgba(190,215,255,.35)'; g.lineWidth = 2; g.strokeRect(1, 1, 126, 126)
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(12, 12); t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}

/** Gökyüzü: üstte açık mavi, ufukta koyu lacivert (MuJoCo'nun varsayılan gökyüzü). */
function skyTexture() {
  const c = document.createElement('canvas'); c.width = 2; c.height = 256
  const g = c.getContext('2d')!
  const gr = g.createLinearGradient(0, 0, 0, 256)
  gr.addColorStop(0, '#6f93c8'); gr.addColorStop(0.55, '#2c4a7c'); gr.addColorStop(1, '#14213a')
  g.fillStyle = gr; g.fillRect(0, 0, 2, 256)
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace
  return t
}

function buildMeshes(mj: Mj, model: any, group: THREE.Group): THREE.Mesh[] {
  const types = mj.mjtGeom, T = (k: string) => types[k].value
  const out: THREE.Mesh[] = []
  for (let i = 0; i < model.ngeom; i++) {
    const type = model.geom_type[i]
    const s = [model.geom_size[3 * i], model.geom_size[3 * i + 1], model.geom_size[3 * i + 2]]
    const rgba = [0, 1, 2, 3].map((k) => model.geom_rgba[4 * i + k])
    let geo: THREE.BufferGeometry | null = null
    let scale: [number, number, number] | null = null
    if (type === T('mjGEOM_PLANE')) geo = new THREE.PlaneGeometry(24, 24)
    else if (type === T('mjGEOM_SPHERE')) geo = new THREE.SphereGeometry(s[0], 28, 16)
    else if (type === T('mjGEOM_CAPSULE')) geo = new THREE.CapsuleGeometry(s[0], 2 * s[1], 8, 20).rotateX(Math.PI / 2)
    else if (type === T('mjGEOM_CYLINDER')) geo = new THREE.CylinderGeometry(s[0], s[0], 2 * s[1], 28).rotateX(Math.PI / 2)
    else if (type === T('mjGEOM_BOX')) geo = new THREE.BoxGeometry(2 * s[0], 2 * s[1], 2 * s[2])
    else if (type === T('mjGEOM_ELLIPSOID')) { geo = new THREE.SphereGeometry(1, 28, 16); scale = [s[0], s[1], s[2]] }
    if (!geo) { out.push(new THREE.Mesh()); continue } // mesh/hfield bu sayfada çizilmez
    const isPlane = type === T('mjGEOM_PLANE')
    const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(rgba[0], rgba[1], rgba[2]), roughness: 0.55, metalness: 0.05, transparent: rgba[3] < 1, opacity: rgba[3] })
    if (isPlane) { mat.map = floorTexture(); mat.color.set(0xffffff) }
    const mesh = new THREE.Mesh(geo, mat)
    if (scale) mesh.scale.set(...scale)
    mesh.castShadow = !isPlane; mesh.receiveShadow = true
    mesh.matrixAutoUpdate = true
    group.add(mesh); out.push(mesh)
  }
  return out
}

const rot = new THREE.Matrix4()
function syncMeshes(sim: Sim) {
  const { data, meshes } = sim
  const xp = data.geom_xpos, xm = data.geom_xmat
  for (let i = 0; i < meshes.length; i++) {
    const m = meshes[i]; if (!m.geometry.attributes.position) continue
    m.position.set(xp[3 * i], xp[3 * i + 1], xp[3 * i + 2])
    const r = 9 * i
    rot.set(xm[r], xm[r + 1], xm[r + 2], 0, xm[r + 3], xm[r + 4], xm[r + 5], 0, xm[r + 6], xm[r + 7], xm[r + 8], 0, 0, 0, 0, 1)
    m.quaternion.setFromRotationMatrix(rot)
  }
}

export function MujocoLab() {
  const en = useLocale() === 'en'
  const L = (tr: string, e: string) => (en ? e : tr)
  const host = useRef<HTMLDivElement>(null)
  const stageRef = useRef<Stage | null>(null)
  const groupRef = useRef<THREE.Group | null>(null)
  const simRef = useRef<Sim | null>(null)
  const runRef = useRef(true)
  const speedRef = useRef(1)
  const ctrlRef = useRef<number[]>([])
  const acc = useRef(0)
  const programs = useRef<Op[][]>([])
  const runners = useRef<Runner[]>([])
  const readings = useRef<Record<string, number>>({})
  const tracker = useRef<GoalTracker | null>(null)
  const trace = useRef(new Trace(10))
  const lastTrace = useRef(0)
  const pyBridge = useRef<PyBridge | null>(null)

  const [sceneId, setSceneId] = useState(MJ_SCENES[0].id)
  const scene: MjScene = MJ_SCENES.find((s) => s.id === sceneId) ?? MJ_SCENES[0]
  const sceneRef = useRef(scene); sceneRef.current = scene
  const [xml, setXml] = useState(scene.xml)
  const [applied, setApplied] = useState(scene.xml)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [err, setErr] = useState('')
  const [running, setRunning] = useState(true)
  const [speed, setSpeed] = useState(1)
  const [ctrlDefs, setCtrlDefs] = useState<Sim['ctrl']>([])
  const [ctrlVals, setCtrlVals] = useState<number[]>([])
  const [info, setInfo] = useState({ t: 0, ncon: 0 })
  const [progRunning, setProgRunning] = useState(false)
  const [progTab, setProgTab] = useState<'blocks' | 'python'>('blocks')
  const [blockPy, setBlockPy] = useState('')
  const [chNames, setChNames] = useState<string[]>([])
  const [sens, setSens] = useState<Record<string, number>>({})
  const [goalView, setGoalView] = useState<{ done: boolean; p: number }[]>([])
  const [graphSel, setGraphSel] = useState<string[]>([])
  const activeGoals = scene.goals.filter((g) => chNames.includes(g.ch))
  const [webgl] = useState(() => typeof document === 'undefined' || hasWebGL())

  const disposeSim = useCallback(() => {
    const sim = simRef.current
    if (!sim) return
    const g = groupRef.current
    if (g) {
      for (const m of [...g.children] as THREE.Mesh[]) {
        m.geometry?.dispose(); const mat = m.material as THREE.MeshStandardMaterial | undefined
        mat?.map?.dispose(); mat?.dispose(); g.remove(m)
      }
    }
    sim.data.delete(); sim.model.delete()
    simRef.current = null
  }, [])

  const resetState = useCallback(() => {
    const sim = simRef.current; if (!sim) return
    sim.mj.mj_resetData(sim.model, sim.data)
    if (sim.model.nkey > 0) sim.mj.mj_resetDataKeyframe(sim.model, sim.data, 0)
    sim.mj.mj_forward(sim.model, sim.data)
    acc.current = 0
    readings.current = readAll(sim.channels, sim.data.sensordata)
    tracker.current?.reset(); trace.current.clear(); lastTrace.current = 0
    syncMeshes(sim)
  }, [])

  // Sahneyi (three.js) bir kez kur
  useEffect(() => {
    if (!webgl || !host.current) return
    const stage = createStage(host.current)
    const group = new THREE.Group()
    group.rotation.x = -Math.PI / 2
    stage.scene.add(group)
    stage.scene.background = skyTexture()
    fitShadow(stage, 0, 0, 5)
    stage.onFrame = (dt) => {
      const sim = simRef.current; if (!sim) return
      if (runRef.current) {
        for (const r of runners.current) r.tick(sim.data.time)
        acc.current += dt * speedRef.current
        let n = 0
        const t0 = sim.data.time
        while (acc.current >= sim.timestep && n < 80) {
          for (let i = 0; i < sim.ctrl.length; i++) sim.data.ctrl[i] = ctrlRef.current[i] ?? 0
          sim.mj.mj_step(sim.model, sim.data)
          acc.current -= sim.timestep; n++
        }
        if (n === 80) acc.current = 0
        const adv = sim.data.time - t0
        if (adv > 0) {
          const rd = readAll(sim.channels, sim.data.sensordata)
          readings.current = rd
          tracker.current?.update(adv, rd)
          if (sim.data.time - lastTrace.current >= 0.02 || sim.data.time < lastTrace.current) {
            lastTrace.current = sim.data.time
            const row: Record<string, number> = { ...rd }
            sim.ctrl.forEach((c, i) => { row[`u:${c.name}`] = ctrlRef.current[i] ?? 0 })
            trace.current.push(sim.data.time, row)
          }
          pyBridge.current?.tick(sim.data.time, rd)
        }
      }
      syncMeshes(sim)
    }
    stageRef.current = stage; groupRef.current = group
    return () => { disposeSim(); stage.dispose(); stageRef.current = null; groupRef.current = null }
  }, [webgl, disposeSim])

  // XML değişince modeli derle
  useEffect(() => {
    if (!webgl) return
    let dead = false
    setStatus((s) => (s === 'ready' ? s : 'loading'))
    loadMujoco().then((mj) => {
      if (dead || !groupRef.current) return
      try {
        mj.FS.writeFile('/model.xml', applied)
        const model = mj.MjModel.mj_loadXML('/model.xml')
        const data = new mj.MjData(model)
        disposeSim()
        const ctrl = Array.from({ length: model.nu }, (_, i) => {
          let lo = model.actuator_ctrlrange[2 * i], hi = model.actuator_ctrlrange[2 * i + 1]
          if (!(hi > lo)) { lo = -1; hi = 1 }
          return { name: mj.mj_id2name(model, OBJ_ACTUATOR, i) || `u${i}`, lo, hi }
        })
        const sNames = Array.from({ length: model.nsensor }, (_, i) => mj.mj_id2name(model, OBJ_SENSOR, i) || '')
        const channels = buildChannels(sNames, model.sensor_adr, model.sensor_dim, model.sensor_type)
        const sim: Sim = { mj, model, data, meshes: buildMeshes(mj, model, groupRef.current), ctrl, channels, timestep: model.opt.timestep }
        simRef.current = sim
        ctrlRef.current = ctrl.map(() => 0)
        const names = channels.map((c) => c.name)
        setChNames(names); setGraphSel(names.slice(0, 2))
        tracker.current = new GoalTracker(sceneRef.current.goals.filter((g) => names.includes(g.ch)))
        runners.current = []; setProgRunning(false)
        setCtrlDefs(ctrl); setCtrlVals(ctrl.map(() => 0))
        resetState()
        setErr(''); setStatus('ready')
      } catch (e) {
        setErr(String((e as Error)?.message ?? e)); setStatus('error')
      }
    }).catch((e) => { if (!dead) { setErr(String((e as Error)?.message ?? e)); setStatus('error') } })
    return () => { dead = true }
  }, [applied, webgl, disposeSim, resetState])

  // Kamera, sahne değişince
  useEffect(() => {
    const st = stageRef.current; if (!st) return
    const [cx, cy, cz] = scene.cam, [lx, ly, lz] = scene.look
    st.camera.position.set(cx, cz, -cy); st.controls.target.set(lx, lz, -ly); st.controls.update()
  }, [scene])

  // Bilgi satırı (saniyede 4 kez)
  useEffect(() => {
    const id = setInterval(() => {
      const sim = simRef.current; if (!sim) return
      setInfo({ t: sim.data.time, ncon: sim.data.ncon })
      setSens({ ...readings.current })
      const tk = tracker.current
      if (tk) setGoalView(tk.state.map((st, i) => ({ done: st.done, p: tk.progress(i) })))
      if (runners.current.length) { setCtrlVals([...ctrlRef.current]); if (runners.current.every((r) => r.done)) { runners.current = []; setProgRunning(false) } }
    }, 250)
    return () => clearInterval(id)
  }, [])

  const pick = (id: string) => {
    const s = MJ_SCENES.find((x) => x.id === id)!
    setSceneId(id); setXml(s.xml); setApplied(s.xml)
  }
  const toggle = () => { runRef.current = !runRef.current; setRunning(runRef.current) }
  const shake = () => {
    const sim = simRef.current; if (!sim) return
    const v = sim.data.qvel
    for (let i = 0; i < v.length; i++) v[i] += (Math.random() - 0.5) * 3
  }
  /** Motor hedefini sınırlar içinde yazar (bloklar ve Python ortak kullanır). */
  const setMotor = (name: string, value: number) => {
    const sim = simRef.current; if (!sim) return
    const i = sim.ctrl.findIndex((c) => c.name === name)
    if (i >= 0) ctrlRef.current[i] = Math.min(sim.ctrl[i].hi, Math.max(sim.ctrl[i].lo, value))
  }
  const startPython = () => { resetState(); runners.current = []; setProgRunning(false); runRef.current = false; setRunning(false) }
  const resumeSim = () => { runRef.current = true; setRunning(true) }
  const startProgram = () => {
    const sim = simRef.current; if (!sim) return
    resetState()
    runners.current = programs.current.map((p) => new Runner(p, setMotor, (ch) => readings.current[ch] ?? 0))
    runRef.current = true; setRunning(true); setProgRunning(runners.current.length > 0)
  }
  const stopProgram = () => { runners.current = []; setProgRunning(false) }
  const setCtrl = (i: number, v: number) => {
    ctrlRef.current[i] = v
    setCtrlVals((a) => a.map((x, k) => (k === i ? v : x)))
  }

  return (
    <section className="mj" data-testid="mujoco-lab">
      {(['robot', 'fizik'] as const).map((k) => (
        <div key={k} className="mj-group">
          <span className="mj-group-label">{k === 'robot' ? L('Robotlar', 'Robots') : L('Fizik deneyleri', 'Physics experiments')}</span>
          <div className="mj-tabs" role="tablist" aria-label={k === 'robot' ? L('Robotlar', 'Robots') : L('Fizik deneyleri', 'Physics experiments')}>
            {MJ_SCENES.filter((s) => s.kind === k).map((s) => (
              <button key={s.id} role="tab" aria-selected={s.id === sceneId} className={`mj-tab${s.id === sceneId ? ' on' : ''}`} onClick={() => pick(s.id)} data-testid={`mujoco-scene-${s.id}`}>
                {en ? s.en.title : s.tr.title}
              </button>
            ))}
          </div>
        </div>
      ))}
      <p className="mj-desc">{en ? scene.en.desc : scene.tr.desc}</p>

      <div className="mj-body">
        <div className="mj-stage-wrap">
          {webgl
            ? <div ref={host} className="mj-stage" data-testid="mujoco-stage" />
            : <div className="mj-stage mj-msg">{L('Bu tarayıcıda WebGL yok; 3B görüntü açılamıyor.', 'WebGL is not available in this browser.')}</div>}
          {status === 'loading' && <div className="mj-overlay">{L('Fizik motoru yükleniyor (8 MB, ilk açılışta)…', 'Loading the physics engine (8 MB, first visit)…')}</div>}
          <div className="mj-bar">
            <button className="sbtn" onClick={toggle} data-testid="mujoco-toggle">{running ? L('Duraklat', 'Pause') : L('Başlat', 'Play')}</button>
            <button className="sbtn ghost" onClick={resetState}>{L('Sıfırla', 'Reset')}</button>
            <button className="sbtn ghost" onClick={shake}>{L('Karıştır', 'Shake')}</button>
            <label className="mj-speed">{L('Hız', 'Speed')}
              <select value={speed} onChange={(e) => { const v = Number(e.target.value); setSpeed(v); speedRef.current = v }}>
                <option value={0.1}>0,1×</option><option value={0.25}>0,25×</option><option value={0.5}>0,5×</option><option value={1}>1×</option><option value={2}>2×</option>
              </select>
            </label>
            <span className="mj-clock" data-testid="mujoco-clock">t = {info.t.toFixed(2)} s · {L('temas', 'contacts')}: {info.ncon}</span>
          </div>
        </div>

        <aside className="mj-side">
          <h3>{L('Kontrol', 'Control')}</h3>
          {ctrlDefs.length === 0
            ? <p className="muted">{L('Bu sahnede motor yok: yalnız fizik çalışır. Fareyle döndür, tekerlekle yakınlaş.', 'No actuators here: physics only. Drag to orbit, scroll to zoom.')}</p>
            : ctrlDefs.map((c, i) => (
              <label key={c.name} className="mj-sl">
                <span><b>{c.name}</b><output>{(ctrlVals[i] ?? 0).toFixed(2)}</output></span>
                <input type="range" min={c.lo} max={c.hi} step={(c.hi - c.lo) / 200} value={ctrlVals[i] ?? 0} onChange={(e) => setCtrl(i, Number(e.target.value))} />
              </label>
            ))}
          <p className="mj-hint">{en ? scene.en.hint : scene.tr.hint}</p>
        </aside>
      </div>

      <div className="mj-extra">
        <section className="mj-card" aria-label={L('Hedefler', 'Goals')} data-testid="mujoco-goals">
          <h3>{L('Hedefler', 'Goals')}</h3>
          {activeGoals.length === 0
            ? <p className="muted">{L('Bu sahne için hedef yok. Önce robot sahnelerinden birini seç.', 'No goals for this scene. Pick a robot scene first.')}</p>
            : <ul className="mj-goals">
              {activeGoals.map((g, i) => (
                <li key={g.id} className={goalView[i]?.done ? 'done' : ''} data-testid={`mujoco-goal-${g.id}`} data-done={goalView[i]?.done ? '1' : '0'}>
                  <span className="mj-goal-mark" aria-hidden="true">{goalView[i]?.done ? '✅' : '🎯'}</span>
                  <span className="mj-goal-txt">{en ? g.en : g.tr}
                    {g.hold > 0 && !goalView[i]?.done && <progress value={goalView[i]?.p ?? 0} max={1} aria-label={L('İlerleme', 'Progress')} />}
                  </span>
                </li>
              ))}
            </ul>}
          {activeGoals.length > 0 && goalView.length > 0 && goalView.every((g) => g.done) && <p className="mj-win" role="status" data-testid="mujoco-win">🎉 {L('Tüm hedefler tamam!', 'All goals complete!')}</p>}
        </section>
        <section className="mj-card" aria-label={L('Sensörler', 'Sensors')} data-testid="mujoco-sensors">
          <h3>{L('Sensörler', 'Sensors')}</h3>
          {chNames.length === 0
            ? <p className="muted">{L('Bu modelde <sensor> yok. XML\'e ekleyebilirsin.', 'This model has no <sensor>. You can add one in the XML.')}</p>
            : <table className="mj-sens"><tbody>
              {chNames.map((n) => <tr key={n}><th scope="row">{n}</th><td data-testid={`mujoco-sens-${n}`}>{(sens[n] ?? 0).toFixed(3)}</td></tr>)}
            </tbody></table>}
        </section>
      </div>

      <section className="mj-card mj-graph-card" aria-label={L('Grafik', 'Graph')}>
        <h3>{L('Grafik (son 10 sn)', 'Graph (last 10 s)')}</h3>
        <div className="mj-chips">
          {[...chNames, ...ctrlDefs.map((c) => `u:${c.name}`)].map((n) => {
            const k = graphSel.indexOf(n)
            return (
              <label key={n} className={`mj-chip${k >= 0 ? ' on' : ''}`} style={k >= 0 ? { borderColor: GRAPH_COLORS[k % GRAPH_COLORS.length] } : undefined}>
                <input type="checkbox" checked={k >= 0} onChange={() => setGraphSel((a) => (a.includes(n) ? a.filter((x) => x !== n) : [...a, n].slice(-8)))} />
                {k >= 0 && <i style={{ background: GRAPH_COLORS[k % GRAPH_COLORS.length] }} aria-hidden="true" />}{n.startsWith('u:') ? `${n.slice(2)} (${L('hedef', 'target')})` : n}
              </label>
            )
          })}
        </div>
        <TraceGraph trace={trace} names={graphSel} label={L('Seçili sensör ve motor değerlerinin zaman grafiği', 'Time graph of the selected sensor and motor values')} />
      </section>

      <section className="mj-prog" aria-label={L('Programla', 'Program it')}>
        <h3>{L('Robotu programla', 'Program the robot')}</h3>
        <div className="mj-tabs" role="tablist" aria-label={L('Programlama yolu', 'Way of programming')}>
          <button role="tab" aria-selected={progTab === 'blocks'} className={`mj-tab${progTab === 'blocks' ? ' on' : ''}`} onClick={() => setProgTab('blocks')} data-testid="mujoco-tab-blocks">{L('Bloklar', 'Blocks')}</button>
          <button role="tab" aria-selected={progTab === 'python'} className={`mj-tab${progTab === 'python' ? ' on' : ''}`} onClick={() => setProgTab('python')} data-testid="mujoco-tab-python">🐍 Python</button>
        </div>
        <div hidden={progTab !== 'blocks'}>
          <p className="muted">{L('Motor, sensör ve "eğer" bloklarını sırala, Çalıştır\'a bas. Altta aynı programın Python\'u görünür.', 'Stack motor, sensor and "if" blocks and press Run. The same program appears as Python below.')}</p>
          <MurokoBlocks actuators={ctrlDefs} sensors={chNames} en={en} onChange={(p) => { programs.current = p }} onPython={setBlockPy} />
          {ctrlDefs.length > 0 && (
            <div className="mj-bar">
              <button className="sbtn" onClick={startProgram} data-testid="mujoco-run">{L('Programı çalıştır', 'Run program')}</button>
              <button className="sbtn ghost" onClick={stopProgram} disabled={!progRunning}>{L('Programı durdur', 'Stop program')}</button>
            </div>
          )}
        </div>
        {progTab === 'python' && (
          <MurokoPython en={en} starter={en ? scene.python.en : scene.python.tr} fromBlocks={blockPy} motors={ctrlDefs.map((c) => c.name)} sensors={chNames}
            setMotor={setMotor} onStart={startPython} onReady={resumeSim} getState={() => ({ t: simRef.current?.data.time ?? 0, sensors: readings.current })} onStop={() => { runners.current = [] }} bridge={pyBridge} resetKey={scene.id} />
        )}
      </section>

      <details className="mj-xml" open>
        <summary>{L('Modeli düzenle (MJCF / XML)', 'Edit the model (MJCF / XML)')}</summary>
        <textarea className="mj-ta" value={xml} spellCheck={false} onChange={(e) => setXml(e.target.value)} aria-label="MJCF" data-testid="mujoco-xml" />
        <div className="mj-bar">
          <button className="sbtn" onClick={() => setApplied(xml)} data-testid="mujoco-apply">{L('Modeli derle ve çalıştır', 'Compile and run')}</button>
          <button className="sbtn ghost" onClick={() => { setXml(scene.xml); setApplied(scene.xml) }}>{L('Hazır sahneye dön', 'Restore preset')}</button>
        </div>
        {status === 'error' && <pre className="mj-err" role="alert" data-testid="mujoco-error">{err}</pre>}
      </details>

      <p className="mj-credit">
        {L('Fizik motoru: ', 'Physics engine: ')}<a href={MJ_REPO} target="_blank" rel="noreferrer">MuJoCo</a> · Google DeepMind · Apache 2.0 · <a href={MJ_WASM_REPO} target="_blank" rel="noreferrer">{L('resmi WASM bağlayıcıları', 'official WASM bindings')}</a>
      </p>
    </section>
  )
}
