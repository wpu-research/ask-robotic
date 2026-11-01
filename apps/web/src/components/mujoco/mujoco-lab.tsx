'use client'
// MuJoCo (Google DeepMind, Apache 2.0) resmi WebAssembly sürümü tarayıcıda çalışır; fizik burada, görüntü three.js'te.
// MuJoCo koordinatı Z-yukarı; sahne grubu -90° döndürülerek three.js'in Y-yukarısına oturur.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import { localizeScene } from '@/lib/mujoco/names-en'
import { DESIGN_SCENE_ID, designScene, emptyDesign, loadDesign, saveDesign } from '@/lib/mujoco/design-scene'
import { MurokoCad } from './mujoco-cad'
import { createCadGizmo, type CadGizmo, type GizmoMode } from './cad-gizmo'
import { defaultGovde, normalizeGovde, updateBlock } from '@/lib/mikro/govde'
import { canRedo, canUndo, initHistory, present, push, redo, replace, undo } from '@/lib/mikro/history'
import type { RobotDesign } from '@/lib/mikro/tasarim'
import { buildMeshes, ensurePack, loadMujoco, OBJ_ACTUATOR, OBJ_KEY, OBJ_SENSOR, skyTexture, syncMeshes, type Sim } from '@/lib/mujoco/engine'
import { MurokoElec, starterCircuit } from './mujoco-elec'
import { EMPTY_PLAN, pumpWiring, type WiringPlan } from '@/lib/mujoco/wiring'
import { compileCode, type CompileError } from '@/lib/lab/compile-client'
import { createRuntime } from '@/lib/lab/runtime'
import type { Circuit, LabApi, LabState } from '@/lib/lab/contract'

/** Devre çalıştırma durumu: derleniyor → çalışıyor, ya da hata. */
type ElecRun =
  | { status: 'idle' }
  | { status: 'compiling' }
  | { status: 'running' }
  | { status: 'errors'; errors: CompileError[] }
  | { status: 'failed'; message: string }


/** Açılışta ilk robot (model paketi birkaç MB, bir kez iner). */
/** İngilizce arayüzde model/sensör/motor adları da İngilizce (lib/mujoco/names-en.ts). */
const EN_SCENES = MJ_SCENES.map(localizeScene)


const GROUP_LABEL = {
  gercek: { tr: 'Gerçek robot modelleri (MuJoCo Menagerie)', en: 'Real robot models (MuJoCo Menagerie)' },
  robot: { tr: 'Senin tasarımın', en: 'Your design' },
  fizik: { tr: 'Fizik deneyleri', en: 'Physics experiments' },
}

/** Sağ raydaki bölümler; `null` = panel kapalı, sahne tüm tezgâhı görür. */
type Dock = 'cad' | 'robot' | 'elec' | 'code' | 'goals' | 'data' | 'model'

/** Robotu sürmenin yolları; 'arduino' devre üzerinden gider, diğerleri doğrudan motora yazar. */
type ProgTab = 'blocks' | 'python' | 'manual' | 'arduino'

/** Ortam: aynı robotu farklı yerçekiminde denemek (model.opt.gravity yazılabilir bir bellek görünümüdür). */
const ENVS = [
  { id: 'earth', g: 9.81, ico: '🌍', tr: 'Dünya', en: 'Earth' },
  { id: 'moon', g: 1.62, ico: '🌕', tr: 'Ay', en: 'Moon' },
  { id: 'mars', g: 3.72, ico: '🔴', tr: 'Mars', en: 'Mars' },
  { id: 'zero', g: 0, ico: '🛰️', tr: 'Sıfır-G', en: 'Zero-G' },
] as const
type EnvId = (typeof ENVS)[number]['id']

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
  const nextTick = useRef(0)
  const nextLabTick = useRef(0)
  const readings = useRef<Record<string, number>>({})
  const tracker = useRef<GoalTracker | null>(null)
  const trace = useRef(new Trace(10))
  const lastTrace = useRef(0)
  const pyBridge = useRef<PyBridge | null>(null)

  const [sceneId, setSceneId] = useState<string>(DESIGN_SCENE_ID)
  // Tasarım tezgâhında kurulmuş robot varsa listeye en başa eklenir (tarayıcıda saklanır).
  // Tasarım geçmişi: yanlış silinen bloğun dönüşü olsun
  const [hist, setHist] = useState(() => initHistory<RobotDesign>(emptyDesign()))
  const design = present(hist)
  // Tutamaç geri çağrısı sahne kurulumunda bir kez bağlanır; güncel tasarıma ref'le erişir
  const designRef = useRef(design); designRef.current = design
  // Kayıtlı tasarım varsa onunla başla: açılışta öğrencinin kendi robotu sahnede olsun
  useEffect(() => {
    const d = loadDesign(); if (!d) return
    setHist(initHistory(d))
    const s = designScene(d)
    if (s && sceneRef.current.id === DESIGN_SCENE_ID) { setXml(s.xml); setApplied(s.xml) }
  }, [])
  const designed = useMemo(() => designScene(design), [design])
  const SCENES = useMemo(
    () => (designed ? [designed, ...(en ? EN_SCENES : MJ_SCENES)] : en ? EN_SCENES : MJ_SCENES),
    [designed, en],
  )
  const scene: MjScene = SCENES.find((s) => s.id === sceneId) ?? SCENES[0]
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
  const [progTab, setProgTab] = useState<ProgTab>('blocks')
  const [dock, setDock] = useState<Dock | null>('cad')
  const [dataTab, setDataTab] = useState<'sens' | 'motors' | 'graph'>('sens')
  const [cadBlock, setCadBlock] = useState<string | null>(null)
  const [gizmoMode, setGizmoMode] = useState<GizmoMode>('translate')
  const [snapOn, setSnapOn] = useState(true)
  const gizmoRef = useRef<CadGizmo | null>(null)
  const [quickOpen, setQuickOpen] = useState(true)
  const [circuit, setCircuit] = useState<Circuit>(starterCircuit)
  const circuitRef = useRef(circuit); circuitRef.current = circuit
  const [plan, setPlan] = useState<WiringPlan>(EMPTY_PLAN)
  const planRef = useRef(plan); planRef.current = plan
  const labRef = useRef<LabApi | null>(null)
  const [labState, setLabState] = useState<LabState | null>(null)
  const [arduino, setArduino] = useState('')
  const arduinoRef = useRef(arduino); arduinoRef.current = arduino
  const [elecRun, setElecRun] = useState<ElecRun>({ status: 'idle' })
  const [env, setEnv] = useState<EnvId>('earth')
  const envRef = useRef<EnvId>('earth'); envRef.current = env
  const envDef = ENVS.find((e) => e.id === env)!
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

  /** Seçili ortamın yerçekimini modele yazar (MuJoCo Z-yukarı: ivme -z yönünde). */
  const applyGravity = useCallback(() => {
    const sim = simRef.current; if (!sim) return
    const g = sim.model.opt.gravity
    g[0] = 0; g[1] = 0; g[2] = -(ENVS.find((e) => e.id === envRef.current)?.g ?? 9.81)
  }, [])

  const resetState = useCallback(() => {
    const sim = simRef.current; if (!sim) return
    sim.mj.mj_resetData(sim.model, sim.data)
    if (sim.keyId >= 0) sim.mj.mj_resetDataKeyframe(sim.model, sim.data, sim.keyId)
    sim.mj.mj_forward(sim.model, sim.data)
    // Anahtar kare motor hedeflerini de verir (ör. ayakta duran robot): kaydırıcılar oradan başlar
    ctrlRef.current = sim.ctrl.map((_, i) => sim.data.ctrl[i])
    setCtrlVals([...ctrlRef.current])
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
        acc.current += dt * speedRef.current
        let n = 0
        const t0 = sim.data.time
        while (acc.current >= sim.timestep && n < 80) {
          // Blok programı her 10 ms'lik benzetim adımında bir kez çalışır (kare hızından bağımsız): kontrol döngüleri tutarlı olur
          if (runners.current.length && sim.data.time >= nextTick.current) {
            readings.current = readAll(sim.channels, sim.data.sensordata) // taze sensör: kare başına bir kez okumak kontrolü geciktirip bozar
            for (const r of runners.current) r.tick(sim.data.time)
            nextTick.current = sim.data.time + 0.01
          }
          // Arduino, benzetim saatiyle kilitli ilerler: 10 ms benzetim = 10 ms mikrodenetleyici.
          // Böylece hız kaydırıcısı karta da işler (ağır çekimde kart da ağır çeker) ve kablolama
          // her 10 ms'de bir iki yönü de taşır.
          const lab = labRef.current
          if (lab && sim.data.time >= nextLabTick.current) {
            readings.current = readAll(sim.channels, sim.data.sensordata)
            try {
              for (let k = 0; k < 2; k++) lab.advance(5) // ince dilim: pin kenarları kaçmasın
              pumpWiring({ lab, plan: planRef.current, ranges: sim.ctrl, ctrl: ctrlRef.current, readings: readings.current })
            } catch (e) {
              console.error(e)
              labRef.current = null; lab.dispose()
              setElecRun({ status: 'failed', message: String((e as Error)?.message ?? e) })
            }
            nextLabTick.current = sim.data.time + 0.01
          }
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
    gizmoRef.current = createCadGizmo(stage, group, (id, patch) => {
      const g = normalizeGovde(designRef.current.govde) ?? defaultGovde(designRef.current.chassis)
      changeDesignRef.current({ ...designRef.current, govde: updateBlock(g, id, patch) })
    })
    return () => {
      gizmoRef.current?.dispose(); gizmoRef.current = null
      disposeSim(); stage.dispose(); stageRef.current = null; groupRef.current = null
    }
  }, [webgl, disposeSim])

  // XML değişince modeli derle
  useEffect(() => {
    if (!webgl) return
    let dead = false
    setStatus((s) => (s === 'ready' ? s : 'loading'))
    loadMujoco().then(async (mj) => {
      if (dead || !groupRef.current) return
      try {
        const pack = sceneRef.current.pack
        if (pack) { setStatus('loading'); await ensurePack(mj, pack); if (dead || !groupRef.current) return }
        const path = pack ? `/models/${pack}/muroko_scene.xml` : '/model.xml'
        mj.FS.writeFile(path, applied)
        const model = mj.MjModel.mj_loadXML(path)
        const data = new mj.MjData(model)
        disposeSim()
        const ctrl = Array.from({ length: model.nu }, (_, i) => {
          let lo = model.actuator_ctrlrange[2 * i], hi = model.actuator_ctrlrange[2 * i + 1]
          if (!(hi > lo)) { lo = -1; hi = 1 }
          return { name: mj.mj_id2name(model, OBJ_ACTUATOR, i) || `u${i}`, lo, hi }
        })
        const sNames = Array.from({ length: model.nsensor }, (_, i) => mj.mj_id2name(model, OBJ_SENSOR, i) || '')
        const channels = buildChannels(sNames, model.sensor_adr, model.sensor_dim, model.sensor_type)
        const kId = mj.mj_name2id(model, OBJ_KEY, 'muroko')
        const keyId = kId >= 0 ? kId : model.nkey > 0 ? 0 : -1
        const sim: Sim = { mj, model, data, meshes: buildMeshes(mj, model, groupRef.current), ctrl, channels, timestep: model.opt.timestep, keyId }
        simRef.current = sim
        const names = channels.map((c) => c.name)
        setChNames(names); setGraphSel(names.slice(0, 2))
        tracker.current = new GoalTracker(sceneRef.current.goals.filter((g) => names.includes(g.ch)))
        runners.current = []; setProgRunning(false)
        setCtrlDefs(ctrl)
        applyGravity() // yeni model varsayılan yerçekimiyle gelir; seçili ortamı geri yaz
        resetState()
        setErr(''); setStatus('ready')
      } catch (e) {
        setErr(String((e as Error)?.message ?? e)); setStatus('error')
      }
    }).catch((e) => { if (!dead) { setErr(String((e as Error)?.message ?? e)); setStatus('error') } })
    return () => { dead = true }
  }, [applied, webgl, disposeSim, resetState, applyGravity])

  // Ortam değişince yerçekimi anında uygulanır: robot düşerken bile Ay'a geçilebilir
  useEffect(() => { applyGravity() }, [env, applyGravity])

  // Tutamaçlar: yalnız CAD rafı açıkken ve kendi robotuna bakarken görünür
  useEffect(() => {
    const g = gizmoRef.current; if (!g) return
    const active = dock === 'cad' && scene.id === DESIGN_SCENE_ID
    const body = normalizeGovde(design.govde) ?? defaultGovde(design.chassis)
    g.update(active ? body : { v: 1, blocks: [] }, active ? cadBlock : null)
    g.setMode(gizmoMode)
    g.setOptions({ snapM: snapOn ? 0.005 : 0, snapDeg: snapOn ? 15 : 0 })
  }, [dock, scene.id, design, cadBlock, gizmoMode, snapOn])

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
      // Motor çubukları blok, Python ve elle sürüşte aynı şekilde canlı kalsın diye her turda tazelenir
      setCtrlVals([...ctrlRef.current])
      if (labRef.current) setLabState({ ...labRef.current.state })
      if (runners.current.length && runners.current.every((r) => r.done)) { runners.current = []; setProgRunning(false) }
    }, 250)
    return () => clearInterval(id)
  }, [])

  // Sayfadan çıkarken AVR emülatörü arkada kalmasın
  useEffect(() => () => { labRef.current?.dispose(); labRef.current = null }, [])

  const pick = (id: string) => {
    const s = SCENES.find((x) => x.id === id)!
    setSceneId(id); setXml(s.xml); setApplied(s.xml)
  }

  /**
   * CAD'de bir parça eklenip çıkarıldığında robot aynı ekranda yeniden kurulur.
   * Tasarım ayrıca tarayıcıya yazılır: tasarım tezgâhı sayfasıyla aynı robot görülür.
   */
  /** Tasarımı uygular. `coalesce`: sayı kutusu gibi sürekli değişen alanlarda
   *  her tuşa basış ayrı bir geri-al adımı açmaz. */
  const changeDesign = (d: RobotDesign, coalesce = false) => {
    setHist((h) => (coalesce ? replace(h, d) : push(h, d)))
    saveDesign(d)
    if (sceneRef.current.id !== DESIGN_SCENE_ID) return // başka robota bakılıyorsa sahneyi değiştirme
    const s = designScene(d)
    if (s) { setXml(s.xml); setApplied(s.xml) }
  }
  /** Geçmişte gezdikten sonra sahneyi o tasarıma getirir. */
  const applyHist = (next: typeof hist) => {
    setHist(next)
    const d = present(next)
    saveDesign(d)
    if (sceneRef.current.id !== DESIGN_SCENE_ID) return
    const s = designScene(d)
    if (s) { setXml(s.xml); setApplied(s.xml) }
  }
  const changeDesignRef = useRef(changeDesign); changeDesignRef.current = changeDesign
  /** Görünüm: kamerayı sabit bir açıya oturtur (üst, ön, yan, serbest). */
  const setView = (v: 'ust' | 'on' | 'yan' | 'serbest') => {
    const st = stageRef.current; if (!st) return
    const [lx, ly, lz] = scene.look
    const d = Math.max(0.3, Math.hypot(...scene.cam))
    const p: Record<typeof v, [number, number, number]> = {
      ust: [lx, ly + 0.001, lz + d],
      on: [lx + d, ly, lz + d * 0.15],
      yan: [lx, ly - d, lz + d * 0.15],
      serbest: scene.cam,
    }
    const [cx, cy, cz] = p[v]
    st.camera.position.set(cx, cz, -cy)
    st.controls.target.set(lx, lz, -ly)
    st.controls.update()
  }

  const doUndo = () => applyHist(undo(hist))
  const doRedo = () => applyHist(redo(hist))

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
    nextTick.current = 0
    runRef.current = true; setRunning(true); setProgRunning(runners.current.length > 0)
  }
  const stopProgram = () => { runners.current = []; setProgRunning(false) }

  /** Devreyi durdurur; motor hedefleri olduğu yerde kalır (gerçek kartın gücü kesilmiş gibi). */
  const stopElec = useCallback(() => {
    labRef.current?.dispose()
    labRef.current = null
    setLabState(null)
    setElecRun({ status: 'idle' })
  }, [])

  /** Arduino kodunu gerçekten derler (avr-gcc), hex'i AVR emülatöründe başlatır ve köprüyü kurar. */
  const runElec = async () => {
    stopElec()
    setElecRun({ status: 'compiling' })
    const out = await compileCode(arduinoRef.current)
    if (!out.ok) {
      setElecRun(out.errors.length
        ? { status: 'errors', errors: out.errors }
        : { status: 'failed', message: out.message ?? L('Derleme başarısız.', 'Compilation failed.') })
      return
    }
    try {
      labRef.current = createRuntime(circuitRef.current, out.hex)
      nextLabTick.current = 0
      resetState()
      runRef.current = true; setRunning(true)
      setElecRun({ status: 'running' })
    } catch (e) {
      setElecRun({ status: 'failed', message: String((e as Error)?.message ?? e) })
    }
  }
  const setCtrl = (i: number, v: number) => {
    ctrlRef.current[i] = v
    setCtrlVals((a) => a.map((x, k) => (k === i ? v : x)))
  }

  const progTabs: { id: ProgTab; label: string; test: string }[] = [
    { id: 'blocks', label: `🧩 ${L('Bloklar', 'Blocks')}`, test: 'mujoco-tab-blocks' },
    { id: 'python', label: '🐍 Python', test: 'mujoco-tab-python' },
    { id: 'manual', label: `🎛️ ${L('Elle sür', 'By hand')}`, test: 'mujoco-tab-manual' },
    { id: 'arduino', label: `⚡ ${L('Arduino C++', 'Arduino C++')}`, test: 'mujoco-tab-arduino' },
  ]
  const pickCard = (s: MjScene) => (
    <button key={s.id} role="tab" aria-selected={s.id === sceneId} className={`mj-card-pick${s.id === sceneId ? ' on' : ''}`} onClick={() => pick(s.id)} data-testid={`mujoco-scene-${s.id}`}>
      <span className="mj-pick-ico" aria-hidden="true">{s.icon}</span>
      <span className="mj-pick-name">{en ? s.en.title : s.tr.title}</span>
    </button>
  )


  const railItems: { id: Dock; ico: string; label: string }[] = [
    { id: 'cad', ico: '📐', label: L('TASARIM', 'CAD') },
    { id: 'robot', ico: '🤖', label: L('ROBOT', 'ROBOT') },
    { id: 'elec', ico: '⚡', label: L('ELEK', 'ELEC') },
    { id: 'code', ico: '{ }', label: L('KOD', 'CODE') },
    { id: 'goals', ico: '🎯', label: L('HEDEF', 'GOALS') },
    { id: 'data', ico: '📈', label: L('VERİ', 'DATA') },
    { id: 'model', ico: '⚙️', label: L('MODEL', 'MODEL') },
  ]
  const dockTitle: Record<Dock, string> = {
    cad: L('Robotunu tasarla', 'Design your robot'),
    robot: L('Robot seç', 'Pick a robot'),
    elec: L('Elektronik ve kablolama', 'Electronics and wiring'),
    code: L('Robotu programla', 'Program the robot'),
    goals: L('Hedefler', 'Goals'),
    data: L('Sensör ve grafik', 'Sensors and graph'),
    model: L('Model (MJCF)', 'Model (MJCF)'),
  }

  return (
    <section className="mj" data-testid="mujoco-lab">
      <div className="mj-wb" data-dock={dock ?? 'none'}>
        {/* Sahne: tüm tezgâhı kaplar, paneller üstünde yüzer */}
        {webgl
          ? <div ref={host} className="mj-stage" data-testid="mujoco-stage" />
          : <div className="mj-stage mj-msg">{L('Bu tarayıcıda WebGL yok; 3B görüntü açılamıyor.', 'WebGL is not available in this browser.')}</div>}
        {status === 'loading' && <div className="mj-overlay">{scene.pack ? L('Robot modeli indiriliyor (birkaç MB, bir kez)…', 'Downloading the robot model (a few MB, once)…') : L('Fizik motoru yükleniyor (8 MB, ilk açılışta)…', 'Loading the physics engine (8 MB, first visit)…')}</div>}

        {/* Sahnenin üstünde fizik göstergesi */}
        <div className="mj-hud" aria-live="off" data-testid="mujoco-hud">
          <span><i aria-hidden="true">{envDef.ico}</i> {en ? envDef.en : envDef.tr}</span>
          <span><b>g</b> {envDef.g.toFixed(2).replace('.', en ? '.' : ',')} m/s²</span>
          <span><b>t</b> {info.t.toFixed(1).replace('.', en ? '.' : ',')} s</span>
          <span><b>{L('temas', 'contacts')}</b> {info.ncon}</span>
          {speed !== 1 && <span className="mj-hud-hi">{String(speed).replace('.', en ? '.' : ',')}×</span>}
          {!running && <span className="mj-hud-hi">⏸ {L('duraklatıldı', 'paused')}</span>}
        </div>

        {/* Sol üstte yüzen hızlı araçlar */}
        <div className={`mj-quick${quickOpen ? '' : ' mini'}`}>
          <div className="mj-quick-head">
            <span>🔧 {L('Hızlı araçlar', 'Quick Tools')}</span>
            <button className="mj-x" onClick={() => setQuickOpen((v) => !v)} aria-expanded={quickOpen} aria-label={quickOpen ? L('Küçült', 'Collapse') : L('Aç', 'Expand')}>{quickOpen ? '–' : '+'}</button>
          </div>
          {quickOpen && (
            <div className="mj-quick-body">
              <button className={`mj-qbtn${running ? ' on' : ''}`} onClick={toggle} data-testid="mujoco-toggle">
                <b aria-hidden="true">{running ? '⏸' : '▶'}</b>{running ? L('Duraklat', 'Pause') : L('Başlat', 'Play')}
              </button>
              <button className="mj-qbtn" onClick={resetState}><b aria-hidden="true">↺</b>{L('Başa al', 'Reset')}</button>
              <button className="mj-qbtn" onClick={shake}><b aria-hidden="true">🎲</b>{L('Karıştır', 'Shake')}</button>
              <label className="mj-qspeed">{L('Hız', 'Speed')}
                <select value={speed} onChange={(e) => { const v = Number(e.target.value); setSpeed(v); speedRef.current = v }}>
                  <option value={0.25}>0,25×</option><option value={0.5}>0,5×</option><option value={1}>1×</option><option value={2}>2×</option>
                </select>
              </label>
              <div className="mj-envs" role="group" aria-label={L('Ortam', 'Environment')}>
                <span className="mj-group-label">{L('Ortam', 'Environment')}</span>
                <div className="mj-env-grid">
                  {ENVS.map((e) => (
                    <button key={e.id} className={`mj-env${env === e.id ? ' on' : ''}`} aria-pressed={env === e.id}
                      onClick={() => setEnv(e.id)} data-testid={`mujoco-env-${e.id}`}>
                      <b aria-hidden="true">{e.ico}</b>{en ? e.en : e.tr}
                    </button>
                  ))}
                </div>
              </div>
              <p className="mj-qhint">💡 {en ? scene.en.hint : scene.tr.hint}</p>
            </div>
          )}
        </div>

        {/* Görünüm anahtarı (Constructa'daki görünüm küpünün karşılığı) */}
        <div className="mj-views" role="group" aria-label={L('Görünüm', 'View')}>
          {([['serbest', L('Serbest', 'Free')], ['ust', L('Üst', 'Top')], ['on', L('Ön', 'Front')], ['yan', L('Yan', 'Side')]] as const).map(([v, lbl]) => (
            <button key={v} onClick={() => setView(v)} data-testid={`mujoco-view-${v}`}>{lbl}</button>
          ))}
        </div>

        {/* Sağda dikey sekme rayı */}
        <nav className="mj-rail" aria-label={L('Çalışma bölümleri', 'Workbench sections')}>
          {railItems.map((r) => (
            <button key={r.id} className={`mj-rail-btn${dock === r.id ? ' on' : ''}`} aria-pressed={dock === r.id}
              onClick={() => setDock((d) => (d === r.id ? null : r.id))} data-testid={`mujoco-rail-${r.id}`}>
              <b aria-hidden="true">{r.ico}</b><span>{r.label}</span>
            </button>
          ))}
        </nav>

        {/* Rayın solunda açılan panel — Blockly çalışma alanı korunsun diye hep bağlı kalır, gizlenir */}
        <div className="mj-dock" hidden={dock === null} aria-label={dock ? dockTitle[dock] : undefined}>
          <div className="mj-dock-head">
            <strong>{dock ? dockTitle[dock] : ''}</strong>
            <button className="mj-x" onClick={() => setDock(null)} aria-label={L('Paneli kapat', 'Close panel')}>✕</button>
          </div>

          <div className="mj-dock-body" hidden={dock !== 'robot'}>
            {(['robot', 'gercek', 'fizik'] as const).filter((k) => SCENES.some((x) => x.kind === k)).map((k) => (
              <div key={k} className="mj-group">
                <span className="mj-group-label">{GROUP_LABEL[k][en ? 'en' : 'tr']}</span>
                <div className="mj-picks" role="tablist" aria-label={GROUP_LABEL[k][en ? 'en' : 'tr']}>{SCENES.filter((s) => s.kind === k).map(pickCard)}</div>
              </div>
            ))}
            <p className="mj-desc"><b>{en ? scene.en.title : scene.tr.title}</b> · {en ? scene.en.desc : scene.tr.desc}</p>
          </div>

          <div className="mj-dock-body" hidden={dock !== 'cad'}>
            <MurokoCad design={design} onDesign={changeDesign} en={en}
              onUndo={doUndo} onRedo={doRedo} canUndo={canUndo(hist)} canRedo={canRedo(hist)}
              block={cadBlock} onBlock={setCadBlock}
              gizmoMode={gizmoMode} onGizmoMode={setGizmoMode} snap={snapOn} onSnap={setSnapOn} />
          </div>

          <div className="mj-dock-body" hidden={dock !== 'elec'}>
            <MurokoElec circuit={circuit} onCircuit={setCircuit} plan={plan} onPlan={setPlan}
              ranges={ctrlDefs} channels={chNames} labState={labState} editLocked={elecRun.status === 'running'} en={en} />
          </div>

          <div className="mj-dock-body" hidden={dock !== 'code'}>
            <div className="mj-tabs" role="tablist" aria-label={L('Programlama yolu', 'Way of programming')}>
              {progTabs.map((t) => (
                <button key={t.id} role="tab" aria-selected={progTab === t.id} className={`mj-tab${progTab === t.id ? ' on' : ''}`} onClick={() => setProgTab(t.id)} data-testid={t.test}>{t.label}</button>
              ))}
            </div>

            <div hidden={progTab !== 'blocks'} className="mj-panel">
              {ctrlDefs.length > 0 && (
                <div className="mj-bar mj-runbar">
                  <button className="sbtn run" onClick={startProgram} data-testid="mujoco-run">▶ {L('Çalıştır', 'Run')}</button>
                  <button className="sbtn ghost" onClick={stopProgram} disabled={!progRunning}>■ {L('Dur', 'Stop')}</button>
                </div>
              )}
              <MurokoBlocks actuators={ctrlDefs} sensors={chNames} en={en} example={scene.blocks ?? null} onChange={(p) => { programs.current = p }} onPython={setBlockPy} />
            </div>

            {progTab === 'python' && (
              <div className="mj-panel">
                <MurokoPython en={en} starter={en ? scene.python.en : scene.python.tr} fromBlocks={blockPy} motors={ctrlDefs.map((c) => c.name)} sensors={chNames}
                  setMotor={setMotor} onStart={startPython} onReady={resumeSim} getState={() => ({ t: simRef.current?.data.time ?? 0, sensors: readings.current })} onStop={() => { runners.current = [] }} bridge={pyBridge} resetKey={scene.id} />
              </div>
            )}

            {progTab === 'arduino' && (
              <div className="mj-panel" data-testid="mujoco-arduino">
                {plan.motors.length === 0 && (
                  <p className="mj-note">{L(
                    'Henüz hiçbir motor devreye bağlı değil. ELEK → Bağlantı bölümünden bağla, yoksa kod çalışsa da robot kımıldamaz.',
                    'No motor is linked to the circuit yet. Link one under ELEC → Link, otherwise the code runs but the robot stays still.')}</p>
                )}
                <div className="mj-bar">
                  <button className="sbtn run" onClick={runElec} disabled={elecRun.status === 'compiling'} data-testid="mujoco-elec-run">
                    {elecRun.status === 'compiling' ? `⏳ ${L('Derleniyor…', 'Compiling…')}` : `▶ ${L('Derle ve yükle', 'Compile and upload')}`}
                  </button>
                  <button className="sbtn ghost" onClick={stopElec} disabled={elecRun.status !== 'running'}>■ {L('Gücü kes', 'Power off')}</button>
                  {elecRun.status === 'running' && <span className="mj-live">● {L('kart çalışıyor', 'board running')}</span>}
                </div>
                <textarea className="mj-ta" value={arduino} spellCheck={false} onChange={(e) => setArduino(e.target.value)}
                  aria-label="Arduino C++" data-testid="mujoco-arduino-code"
                  placeholder={'#include <Servo.h>\n\nServo s;\n\nvoid setup() {\n  s.attach(9);\n}\n\nvoid loop() {\n  s.write(0);\n  delay(500);\n  s.write(180);\n  delay(500);\n}'} />
                {elecRun.status === 'errors' && (
                  <ul className="mj-warns" data-testid="mujoco-arduino-errors">
                    {elecRun.errors.slice(0, 6).map((e, i) => <li key={i}>{L('satır', 'line')} {e.line}: {e.message}</li>)}
                  </ul>
                )}
                {elecRun.status === 'failed' && <p className="mj-warns" role="alert">{elecRun.message}</p>}
                {labState && labState.serial.length > 0 && (
                  <pre className="mj-out" data-testid="mujoco-serial">{labState.serial.slice(-1200)}</pre>
                )}
                <p className="muted">{L(
                  'Kod gerçekten avr-gcc ile derlenir ve çıkan hex komut komut çalıştırılır. Kart, benzetim saatiyle kilitli ilerler: ağır çekimde kart da ağır çeker.',
                  'The code really is compiled with avr-gcc and the resulting hex runs instruction by instruction. The board is locked to simulation time: in slow motion the board slows down too.')}</p>
              </div>
            )}

            {progTab === 'manual' && (
              <div className="mj-panel">
                {ctrlDefs.length === 0
                  ? <p className="muted">{L('Bu sahnede motor yok: yalnız fizik çalışır. Fareyle döndür, tekerlekle yakınlaş.', 'No actuators here: physics only. Drag to orbit, scroll to zoom.')}</p>
                  : <>
                    <p className="muted">{L('Kaydırıcıları oynat, robot hemen hareket eder.', 'Move the sliders and the robot moves right away.')}</p>
                    {ctrlDefs.map((c, i) => (
                      <label key={c.name} className="mj-sl">
                        <span><b>{c.name}</b><output>{(ctrlVals[i] ?? 0).toFixed(2)}</output></span>
                        <input type="range" min={c.lo} max={c.hi} step={(c.hi - c.lo) / 200} value={ctrlVals[i] ?? 0} onChange={(e) => setCtrl(i, Number(e.target.value))} />
                      </label>
                    ))}
                  </>}
              </div>
            )}
          </div>

          <div className="mj-dock-body" hidden={dock !== 'goals'} data-testid="mujoco-goals">
            {activeGoals.length === 0
              ? <p className="muted">{L('Bu sahne için hedef yok. Bir robot seç.', 'No goals for this scene. Pick a robot.')}</p>
              : <ul className="mj-goals">
                {activeGoals.map((g, i) => (
                  <li key={g.id} className={goalView[i]?.done ? 'done' : ''} data-testid={`mujoco-goal-${g.id}`} data-done={goalView[i]?.done ? '1' : '0'}>
                    <span className="mj-goal-mark" aria-hidden="true">{goalView[i]?.done ? '✅' : '⬜'}</span>
                    <span className="mj-goal-txt">{en ? g.en : g.tr}
                      {g.hold > 0 && !goalView[i]?.done && (goalView[i]?.p ?? 0) > 0 && <progress value={goalView[i]?.p ?? 0} max={1} aria-label={L('İlerleme', 'Progress')} />}
                    </span>
                  </li>
                ))}
              </ul>}
            {activeGoals.length > 0 && goalView.length > 0 && goalView.every((g) => g.done) && <p className="mj-win" role="status" data-testid="mujoco-win">🎉 {L('Tüm hedefler tamam!', 'All goals complete!')}</p>}
          </div>

          <div className="mj-dock-body" hidden={dock !== 'data'}>
            <div className="mj-tabs" role="tablist" aria-label={L('Veri görünümü', 'Data view')}>
              <button role="tab" aria-selected={dataTab === 'sens'} className={`mj-tab${dataTab === 'sens' ? ' on' : ''}`} onClick={() => setDataTab('sens')}>{L('Sensörler', 'Sensors')}</button>
              <button role="tab" aria-selected={dataTab === 'motors'} className={`mj-tab${dataTab === 'motors' ? ' on' : ''}`} onClick={() => setDataTab('motors')}>{L('Motorlar', 'Motors')}</button>
              <button role="tab" aria-selected={dataTab === 'graph'} className={`mj-tab${dataTab === 'graph' ? ' on' : ''}`} onClick={() => setDataTab('graph')}>{L('Grafik', 'Graph')}</button>
            </div>
            {dataTab === 'sens' && (
              <div className="mj-panel" data-testid="mujoco-sensors">
                {chNames.length === 0
                  ? <p className="muted">{L('Bu modelde <sensor> yok. Model panelinden ekleyebilirsin.', 'This model has no <sensor>. You can add one in the Model panel.')}</p>
                  : <table className="mj-sens"><tbody>
                    {chNames.map((n) => <tr key={n}><th scope="row">{n}</th><td data-testid={`mujoco-sens-${n}`}>{(sens[n] ?? 0).toFixed(3)}</td></tr>)}
                  </tbody></table>}
              </div>
            )}
            {dataTab === 'motors' && (
              <div className="mj-panel" data-testid="mujoco-motors">
                {ctrlDefs.length === 0
                  ? <p className="muted">{L('Bu sahnede motor yok: yalnız fizik çalışır.', 'No actuators here: physics only.')}</p>
                  : <>
                    <p className="muted">{L('Her motorun o anki hedefi — bloklar, Python ya da kaydırıcı hangisi sürerse.', 'Each motor’s current target — whether blocks, Python or a slider is driving it.')}</p>
                    <ul className="mj-motors">
                      {ctrlDefs.map((c, i) => {
                        const v = ctrlVals[i] ?? 0
                        const span = c.hi - c.lo
                        // Sıfırı olan aralıkta çubuk ortadan iki yana büyür (ör. -1..1); yoksa soldan dolar
                        const bipolar = c.lo < 0 && c.hi > 0
                        const zero = bipolar ? (-c.lo / span) * 100 : 0
                        const pos = span > 0 ? ((v - c.lo) / span) * 100 : 0
                        const left = Math.min(zero, pos), width = Math.abs(pos - zero)
                        return (
                          <li key={c.name}>
                            <span className="mj-motor-n" title={c.name}>{c.name}</span>
                            <span className="mj-motor-track">
                              {bipolar && <i className="mj-motor-zero" style={{ left: `${zero}%` }} aria-hidden="true" />}
                              <i className="mj-motor-fill" style={{ left: `${left}%`, width: `${Math.max(width, 0.8)}%` }} aria-hidden="true" />
                            </span>
                            <output data-testid={`mujoco-motor-${c.name}`}>{v.toFixed(2)}</output>
                          </li>
                        )
                      })}
                    </ul>
                  </>}
              </div>
            )}
            {dataTab === 'graph' && (
              <div className="mj-panel">
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
              </div>
            )}
          </div>

          <div className="mj-dock-body" hidden={dock !== 'model'}>
            <textarea className="mj-ta" value={xml} spellCheck={false} onChange={(e) => setXml(e.target.value)} aria-label="MJCF" data-testid="mujoco-xml" />
            <div className="mj-bar">
              <button className="sbtn" onClick={() => setApplied(xml)} data-testid="mujoco-apply">{L('Derle ve çalıştır', 'Compile and run')}</button>
              <button className="sbtn ghost" onClick={() => { setXml(scene.xml); setApplied(scene.xml) }}>{L('Hazır sahneye dön', 'Restore preset')}</button>
            </div>
            <p className="mj-credit">
              {scene.credit && <><span data-testid="mujoco-model-credit">{L('Model', 'Model')}: <a href={scene.credit.url} target="_blank" rel="noreferrer">{scene.credit.name}</a> · {scene.credit.license} · MuJoCo Menagerie · <a href={`/mujoco/models/${scene.pack}.LICENSE.txt`} target="_blank" rel="noreferrer">{L('lisans metni', 'license text')}</a></span><br /></>}
              {L('Fizik motoru: ', 'Physics engine: ')}<a href={MJ_REPO} target="_blank" rel="noreferrer">MuJoCo</a> · Google DeepMind · Apache 2.0 · <a href={MJ_WASM_REPO} target="_blank" rel="noreferrer">{L('resmi WASM bağlayıcıları', 'official WASM bindings')}</a>
            </p>
          </div>
        </div>

        {/* Alt durum çubuğu */}
        <div className="mj-status">
          <span><b>{en ? scene.en.title : scene.tr.title}</b></span>
          <span>{L('motor', 'motors')}: {ctrlDefs.length}</span>
          <span>{L('ortam', 'environment')}: {en ? envDef.en : envDef.tr}</span>
          <span>{L('temas', 'contacts')}: {info.ncon}</span>
          {progRunning && <span className="mj-live">● {L('program çalışıyor', 'program running')}</span>}
          {elecRun.status === 'running' && <span className="mj-live" data-testid="mujoco-board-live">⚡ {L('kart çalışıyor', 'board running')} · {plan.motors.length} {L('motor bağlı', 'motors linked')}</span>}
          <span className="mj-status-r" data-testid="mujoco-clock">{info.t.toFixed(1)} s · {running ? L('çalışıyor', 'running') : L('duraklatıldı', 'paused')}</span>
        </div>
      </div>

      {status === 'error' && <pre className="mj-err" role="alert" data-testid="mujoco-error">{err}</pre>}
    </section>
  )
}
