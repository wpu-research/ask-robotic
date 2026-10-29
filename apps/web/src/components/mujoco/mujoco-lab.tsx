'use client'
// MuJoCo (Google DeepMind, Apache 2.0) resmi WebAssembly sürümü tarayıcıda çalışır; fizik burada, görüntü three.js'te.
// MuJoCo koordinatı Z-yukarı; sahne grubu -90° döndürülerek three.js'in Y-yukarısına oturur.
import { useCallback, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { createStage, fitShadow, hasWebGL, type Stage } from '@/components/three/core'
import { useLocale } from '@/i18n/client'
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

interface Sim {
  mj: Mj; model: any; data: any
  meshes: THREE.Mesh[]
  ctrl: { name: string; lo: number; hi: number }[]
  timestep: number
}

function floorTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 64
  const g = c.getContext('2d')!
  g.fillStyle = '#e4e9f0'; g.fillRect(0, 0, 64, 64)
  g.fillStyle = '#d3dae4'; g.fillRect(0, 0, 32, 32); g.fillRect(32, 32, 32, 32)
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(12, 12); t.colorSpace = THREE.SRGBColorSpace
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

  const [sceneId, setSceneId] = useState(MJ_SCENES[0].id)
  const scene: MjScene = MJ_SCENES.find((s) => s.id === sceneId) ?? MJ_SCENES[0]
  const [xml, setXml] = useState(scene.xml)
  const [applied, setApplied] = useState(scene.xml)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [err, setErr] = useState('')
  const [running, setRunning] = useState(true)
  const [speed, setSpeed] = useState(1)
  const [ctrlDefs, setCtrlDefs] = useState<Sim['ctrl']>([])
  const [ctrlVals, setCtrlVals] = useState<number[]>([])
  const [info, setInfo] = useState({ t: 0, ncon: 0 })
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
    syncMeshes(sim)
  }, [])

  // Sahneyi (three.js) bir kez kur
  useEffect(() => {
    if (!webgl || !host.current) return
    const stage = createStage(host.current)
    const group = new THREE.Group()
    group.rotation.x = -Math.PI / 2
    stage.scene.add(group)
    fitShadow(stage, 0, 0, 5)
    stage.onFrame = (dt) => {
      const sim = simRef.current; if (!sim) return
      if (runRef.current) {
        acc.current += dt * speedRef.current
        let n = 0
        while (acc.current >= sim.timestep && n < 80) {
          for (let i = 0; i < sim.ctrl.length; i++) sim.data.ctrl[i] = ctrlRef.current[i] ?? 0
          sim.mj.mj_step(sim.model, sim.data)
          acc.current -= sim.timestep; n++
        }
        if (n === 80) acc.current = 0
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
        const sim: Sim = { mj, model, data, meshes: buildMeshes(mj, model, groupRef.current), ctrl, timestep: model.opt.timestep }
        simRef.current = sim
        ctrlRef.current = ctrl.map(() => 0)
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
  const setCtrl = (i: number, v: number) => {
    ctrlRef.current[i] = v
    setCtrlVals((a) => a.map((x, k) => (k === i ? v : x)))
  }

  return (
    <section className="mj" data-testid="mujoco-lab">
      <div className="mj-tabs" role="tablist" aria-label={L('Hazır sahneler', 'Preset scenes')}>
        {MJ_SCENES.map((s) => (
          <button key={s.id} role="tab" aria-selected={s.id === sceneId} className={`mj-tab${s.id === sceneId ? ' on' : ''}`} onClick={() => pick(s.id)}>
            {en ? s.en.title : s.tr.title}
          </button>
        ))}
      </div>
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
