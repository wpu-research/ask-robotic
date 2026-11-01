'use client'
// Devre laboratuvarının 3B robot görüntüsü: kurduğun devre, gerçek bir robotu sürer.
//
// MuRoKo'daki laboratuvarın tersi yönü: orada robot merkezde, devre yan panelde;
// burada devre merkezde, robot yan panelde. Fizik ve köprü aynı kodu kullanır
// (lib/mujoco/engine.ts ve lib/mujoco/wiring.ts).
//
// Devreyi bu bileşen İLERLETMEZ: laboratuvarın kendi çalışma döngüsü ilerletir.
// Burada yalnız okunur ve köprü üzerinden robota aktarılır.
import { useCallback, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { createStage, fitShadow, hasWebGL, type Stage } from '@/components/three/core'
import { WiringPanel } from '@/components/mujoco/wiring-panel'
import type { Circuit, LabApi } from '@/lib/lab/contract'
import { buildMeshes, ensurePack, loadMujoco, OBJ_ACTUATOR, OBJ_KEY, OBJ_SENSOR, skyTexture, syncMeshes, type Sim } from '@/lib/mujoco/engine'
import { buildChannels, readAll } from '@/lib/mujoco/sensors'
import { localizeScene } from '@/lib/mujoco/names-en'
import { MJ_SCENES, type MjScene } from '@/lib/mujoco/scenes'
import { EMPTY_PLAN, pumpWiring, type CtrlRange, type WiringPlan } from '@/lib/mujoco/wiring'

interface Props {
  circuit: Circuit
  /** Laboratuvarın çalışan devresi; durmuşsa null. Bu bileşen onu ilerletmez, yalnız okur. */
  getLab: () => LabApi | null
  en: boolean
}

export function LabRobot({ circuit, getLab, en }: Props) {
  const L = (tr: string, e: string) => (en ? e : tr)
  const host = useRef<HTMLDivElement>(null)
  const stageRef = useRef<Stage | null>(null)
  const groupRef = useRef<THREE.Group | null>(null)
  const simRef = useRef<Sim | null>(null)
  const ctrlRef = useRef<number[]>([])
  const acc = useRef(0)
  const nextPump = useRef(0)
  const planRef = useRef<WiringPlan>(EMPTY_PLAN)

  const SCENES = en ? MJ_SCENES.map(localizeScene) : MJ_SCENES
  const [sceneId, setSceneId] = useState(SCENES[0].id)
  const scene: MjScene = SCENES.find((s) => s.id === sceneId) ?? SCENES[0]
  const sceneRef = useRef(scene); sceneRef.current = scene
  const [plan, setPlan] = useState<WiringPlan>(EMPTY_PLAN)
  planRef.current = plan
  const [ranges, setRanges] = useState<CtrlRange[]>([])
  const [channels, setChannels] = useState<string[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [err, setErr] = useState('')
  const [webgl] = useState(() => typeof document === 'undefined' || hasWebGL())

  const disposeSim = useCallback(() => {
    const sim = simRef.current
    if (!sim) return
    const g = groupRef.current
    if (g) {
      for (const m of [...g.children] as THREE.Mesh[]) {
        m.geometry?.dispose()
        const mat = m.material as THREE.MeshStandardMaterial | undefined
        mat?.map?.dispose(); mat?.dispose(); g.remove(m)
      }
    }
    sim.data.delete(); sim.model.delete()
    simRef.current = null
  }, [])

  const resetRobot = useCallback(() => {
    const sim = simRef.current; if (!sim) return
    sim.mj.mj_resetData(sim.model, sim.data)
    if (sim.keyId >= 0) sim.mj.mj_resetDataKeyframe(sim.model, sim.data, sim.keyId)
    sim.mj.mj_forward(sim.model, sim.data)
    ctrlRef.current = sim.ctrl.map((_, i) => sim.data.ctrl[i])
    acc.current = 0; nextPump.current = 0
    syncMeshes(sim)
  }, [])

  // Sahneyi bir kez kur ve fizik döngüsünü başlat
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
      acc.current += dt
      let n = 0
      while (acc.current >= sim.timestep && n < 80) {
        // Köprü her 10 ms benzetimde bir: devredeki sürücüler → motor hedefi,
        // robotun sensörleri → devredeki sensörler.
        const lab = getLab()
        if (lab && sim.data.time >= nextPump.current) {
          const rd = readAll(sim.channels, sim.data.sensordata)
          pumpWiring({ lab, plan: planRef.current, ranges: sim.ctrl, ctrl: ctrlRef.current, readings: rd })
          nextPump.current = sim.data.time + 0.01
        }
        for (let i = 0; i < sim.ctrl.length; i++) sim.data.ctrl[i] = ctrlRef.current[i] ?? 0
        sim.mj.mj_step(sim.model, sim.data)
        acc.current -= sim.timestep; n++
      }
      if (n === 80) acc.current = 0
      syncMeshes(sim)
    }
    stageRef.current = stage; groupRef.current = group
    return () => { disposeSim(); stage.dispose(); stageRef.current = null; groupRef.current = null }
  }, [webgl, disposeSim, getLab])

  // Robot değişince modeli derle
  useEffect(() => {
    if (!webgl) return
    let dead = false
    setStatus('loading')
    loadMujoco().then(async (mj) => {
      if (dead || !groupRef.current) return
      try {
        const s = sceneRef.current
        if (s.pack) { await ensurePack(mj, s.pack); if (dead || !groupRef.current) return }
        const path = s.pack ? `/models/${s.pack}/muroko_scene.xml` : '/model.xml'
        mj.FS.writeFile(path, s.xml)
        const model = mj.MjModel.mj_loadXML(path)
        const data = new mj.MjData(model)
        disposeSim()
        const ctrl = Array.from({ length: model.nu }, (_, i) => {
          let lo = model.actuator_ctrlrange[2 * i], hi = model.actuator_ctrlrange[2 * i + 1]
          if (!(hi > lo)) { lo = -1; hi = 1 }
          return { name: mj.mj_id2name(model, OBJ_ACTUATOR, i) || `u${i}`, lo, hi }
        })
        const sNames = Array.from({ length: model.nsensor }, (_, i) => mj.mj_id2name(model, OBJ_SENSOR, i) || '')
        const chans = buildChannels(sNames, model.sensor_adr, model.sensor_dim, model.sensor_type)
        const kId = mj.mj_name2id(model, OBJ_KEY, 'muroko')
        simRef.current = {
          mj, model, data, meshes: buildMeshes(mj, model, groupRef.current), ctrl, channels: chans,
          timestep: model.opt.timestep, keyId: kId >= 0 ? kId : model.nkey > 0 ? 0 : -1,
        }
        setRanges(ctrl); setChannels(chans.map((c) => c.name))
        setPlan(EMPTY_PLAN) // başka robotun bağlantıları geçerli değil
        resetRobot()
        setErr(''); setStatus('ready')
      } catch (e) {
        setErr(String((e as Error)?.message ?? e)); setStatus('error')
      }
    }).catch((e) => { if (!dead) { setErr(String((e as Error)?.message ?? e)); setStatus('error') } })
    return () => { dead = true }
  }, [sceneId, webgl, disposeSim, resetRobot])

  // Kamera
  useEffect(() => {
    const st = stageRef.current; if (!st) return
    const [cx, cy, cz] = scene.cam, [lx, ly, lz] = scene.look
    st.camera.position.set(cx, cz, -cy); st.controls.target.set(lx, lz, -ly); st.controls.update()
  }, [scene])

  return (
    <section className="lab-robot" data-testid="lab-robot">
      <div className="lab-robot-bar">
        <label>{L('Robot', 'Robot')}
          <select value={sceneId} onChange={(e) => setSceneId(e.target.value)} data-testid="lab-robot-pick">
            {SCENES.map((s) => <option key={s.id} value={s.id}>{en ? s.en.title : s.tr.title}</option>)}
          </select>
        </label>
        <button className="sbtn ghost" onClick={resetRobot}>↺ {L('Başa al', 'Reset')}</button>
      </div>

      <div className="lab-robot-stage-wrap">
        {webgl
          ? <div ref={host} className="lab-robot-stage" data-testid="lab-robot-stage" />
          : <div className="lab-robot-stage mj-msg">{L('Bu tarayıcıda WebGL yok.', 'WebGL is not available in this browser.')}</div>}
        {status === 'loading' && <div className="lab-robot-overlay">{L('Robot yükleniyor…', 'Loading the robot…')}</div>}
      </div>
      {status === 'error' && <pre className="mj-err" role="alert">{err}</pre>}

      <WiringPanel circuit={circuit} plan={plan} onPlan={setPlan} ranges={ranges} channels={channels} en={en} />

      <p className="muted">{L(
        'Devreni çalıştır: kurduğun kablolar bu robotu sürer. Bağlantı kurmazsan robot kımıldamaz.',
        'Run your circuit: the wiring you built drives this robot. Without a link the robot stays still.')}</p>
    </section>
  )
}
