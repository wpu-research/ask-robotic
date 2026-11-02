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
import { MJ_WORKBENCH_SCENES, MJ_REPO, MJ_WASM_REPO, type MjScene } from '@/lib/mujoco/scenes'
import { localizeScene } from '@/lib/mujoco/names-en'
import { DESIGN_SCENE_ID, designScene, emptyDesign, loadDesign, saveDesign } from '@/lib/mujoco/design-scene'
import { MurokoCad } from './mujoco-cad'
import { createCadGizmo, type CadGizmo, type GizmoMode } from './cad-gizmo'
import { defaultGovde, normalizeGovde, updateBlock, snapToSurface, extrudeBlock, sliceBlock } from '@/lib/mikro/govde'
import { canRedo, canUndo, initHistory, present, push, redo, replace, undo } from '@/lib/mikro/history'
import type { RobotDesign } from '@/lib/mikro/tasarim'
import { buildMeshes, ensurePack, loadMujoco, OBJ_ACTUATOR, OBJ_KEY, OBJ_SENSOR, syncMeshes, type Sim } from '@/lib/mujoco/engine'
import { Icon, type IconName } from '@/components/shell/icons'
import { ToolButton, ViewCube, type WorkbenchView } from './workbench-controls'
import { MurokoElec, starterCircuit } from './mujoco-elec'
import { EMPTY_PLAN, pumpWiring, type WiringPlan } from '@/lib/mujoco/wiring'
import { compileCode, type CompileError } from '@/lib/lab/compile-client'
import { createRuntime } from '@/lib/lab/runtime'
import type { Circuit, LabApi, LabState } from '@/lib/lab/contract'
import { ASSEMBLY_PARTS, assemblyActuator, updateAssembly } from '@/lib/mikro/assembly'
import { assemblyConnectionIssues, assemblySketch, syncAssemblyCircuit } from '@/lib/mujoco/assembly-circuit'
import { exportWorkbenchFile, importWorkbenchFile, loadWorkbenchProject, saveWorkbenchProject } from '@/lib/mujoco/workbench-project'
import { WorkbenchCodeEditor, WorkbenchPortal } from './workbench-surface'
import { ProjectToolbar } from './project-toolbar'

/** Devre çalıştırma durumu: derleniyor → çalışıyor, ya da hata. */
type ElecRun =
  | { status: 'idle' }
  | { status: 'compiling' }
  | { status: 'running' }
  | { status: 'errors'; errors: CompileError[] }
  | { status: 'failed'; message: string }


/** İngilizce arayüzde model/sensör/motor adları da İngilizce (lib/mujoco/names-en.ts). */
const EN_SCENES = MJ_WORKBENCH_SCENES.map(localizeScene)


const GROUP_LABEL = {
  gercek: { tr: 'Gerçek robot modelleri (MuJoCo Menagerie)', en: 'Real robot models (MuJoCo Menagerie)' },
  robot: { tr: 'Senin tasarımın', en: 'Your design' },
  fizik: { tr: 'Fizik deneyleri', en: 'Physics experiments' },
}

/** Sağ raydaki bölümler; `null` = panel kapalı, sahne tüm tezgâhı görür. */
type Dock = 'cad' | 'robot' | 'elec' | 'code' | 'goals' | 'data' | 'model' | 'simulate' | 'settings'

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
  // Tam ekran: tezgâh kendi başına tarayıcıyı kaplar (Constructa'daki gibi); site başlığı/alt bilgi gizlenir.
  const wbRef = useRef<HTMLElement>(null)
  const [fullscreen, setFullscreen] = useState(false)
  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === wbRef.current)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])
  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
    else wbRef.current?.requestFullscreen?.().catch(() => {})
  }, [])
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
  // Kayıt geri bildirimi: her değişiklikte tarayıcıya zaten yazılır (saveDesign); bu yalnız
  // "Kaydediliyor… / Kaydedildi" rozetini kısaca gösterir, öğrenci kaydın gittiğini görsün.
  const [saveState, setSaveState] = useState<'saving' | 'saved'>('saved')
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const flashSaving = useCallback(() => {
    setSaveState('saving')
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => setSaveState('saved'), 500)
  }, [])
  useEffect(() => () => { if (saveTimer.current) clearTimeout(saveTimer.current) }, [])
  // Tutamaç geri çağrısı sahne kurulumunda bir kez bağlanır; güncel tasarıma ref'le erişir
  const designRef = useRef(design); designRef.current = design
  // Kayıtlı tasarım varsa onunla başla: açılışta öğrencinin kendi robotu sahnede olsun
  useEffect(() => {
    const d = loadDesign(); if (!d) return
    setHist(initHistory(d))
    const s = designScene(d)
    if (s && sceneRef.current.id === DESIGN_SCENE_ID) { setXml(s.xml); setApplied(s.xml) }
  }, [])
  const designed = useMemo(() => designScene(design) ?? designScene(emptyDesign())!, [design])
  const SCENES = useMemo(
    () => [designed, ...(en ? EN_SCENES : MJ_WORKBENCH_SCENES)],
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
  const [codeHost, setCodeHost] = useState<HTMLDivElement | null>(null)
  const [circuitHost, setCircuitHost] = useState<HTMLDivElement | null>(null)
  const [editorView, setEditorView] = useState<'full' | 'split'>('full')
  const [elecTab, setElecTab] = useState<'parts' | 'circuit' | 'link'>('parts')
  const [assemblyRequest, setAssemblyRequest] = useState(0)
  const [dock, setDock] = useState<Dock | null>('elec')
  const dockRef = useRef(dock); dockRef.current = dock
  const [dataTab, setDataTab] = useState<'sens' | 'motors' | 'graph'>('sens')
  const [cadBlock, setCadBlock] = useState<string | null>(null)
  const cadBlockRef = useRef(cadBlock); cadBlockRef.current = cadBlock
  const [secondBlock, setSecondBlock] = useState<string | null>(null)
  const [assemblySelected, setAssemblySelected] = useState<string | null>(null)
  const assemblySelectionRef = useRef(assemblySelected); assemblySelectionRef.current = assemblySelected
  const [gizmoMode, setGizmoMode] = useState<GizmoMode>('translate')
  const [snapOn, setSnapOn] = useState(true)
  const [angleSnapOn, setAngleSnapOn] = useState(true)
  const [gridOn, setGridOn] = useState(true)
  const [axesOn, setAxesOn] = useState(true)
  const [guidesOn, setGuidesOn] = useState(true)
  const [view, setCameraView] = useState<WorkbenchView>('serbest')
  const gridTextureRef = useRef<THREE.CanvasTexture | null>(null)
  const gridOnRef = useRef(true)
  const axesRef = useRef<THREE.AxesHelper | null>(null)
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
  const compileVersion = useRef(0)
  const [projectLoaded, setProjectLoaded] = useState(false)
  const [projectSaveFailed, setProjectSaveFailed] = useState(false)
  const [designSaveFailed, setDesignSaveFailed] = useState(false)
  useEffect(() => {
    const project = loadWorkbenchProject()
    if (project) { setCircuit(project.circuit); setPlan(project.plan); setArduino(project.arduino) }
    setProjectLoaded(true)
  }, [])
  useEffect(() => {
    if (!projectLoaded) return
    const next = syncAssemblyCircuit(design.assembly ?? [], circuitRef.current, planRef.current)
    setCircuit(next.circuit); setPlan(next.plan)
  }, [design.assembly, projectLoaded])
  useEffect(() => {
    if (!projectLoaded) return
    const timer = setTimeout(() => setProjectSaveFailed(!saveWorkbenchProject({ circuit, plan, arduino })), 200)
    return () => clearTimeout(timer)
  }, [projectLoaded, circuit, plan, arduino])
  useEffect(() => {
    if (assemblySelected && !design.assembly?.some((node) => node.id === assemblySelected)) setAssemblySelected(null)
  }, [design.assembly, assemblySelected])
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
      for (const m of sim.meshes) {
        m.traverse((object) => {
          const mesh = object as THREE.Mesh
          mesh.geometry?.dispose()
          const materials = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : []
          for (const material of materials) { (material as THREE.MeshStandardMaterial).map?.dispose(); material.dispose() }
        })
        g.remove(m)
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

  const paintWorkbench = useCallback(() => {
    const stage = stageRef.current
    if (!stage) return
    const styles = getComputedStyle(document.documentElement)
    const background = styles.getPropertyValue('--bg').trim() || '#fffdf9'
    stage.scene.background = new THREE.Color(background)
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 64
    const context = canvas.getContext('2d')!
    context.fillStyle = background
    context.fillRect(0, 0, 64, 64)
    context.strokeStyle = styles.getPropertyValue('--border-strong').trim() || '#dccbb7'
    context.lineWidth = 1
    context.strokeRect(0.5, 0.5, 63, 63)
    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(1200, 1200)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 8
    const previousTexture = gridTextureRef.current
    gridTextureRef.current = texture
    const sim = simRef.current
    sim?.meshes.forEach((mesh, index) => {
      if (sim.model.geom_type[index] !== sim.mj.mjtGeom.mjGEOM_PLANE.value) return
      const material = mesh.material as THREE.MeshStandardMaterial
      material.map?.dispose()
      material.map = gridOnRef.current ? texture : null
      material.color.set(gridOnRef.current ? '#ffffff' : background)
      material.needsUpdate = true
    })
    previousTexture?.dispose()
  }, [])

  // Sahneyi (three.js) bir kez kur
  useEffect(() => {
    if (!webgl || !host.current) return
    const stage = createStage(host.current)
    const group = new THREE.Group()
    group.rotation.x = -Math.PI / 2
    stage.scene.add(group)
    const axes = new THREE.AxesHelper(0.16)
    axes.position.y = 0.002
    stage.scene.add(axes)
    axesRef.current = axes
    fitShadow(stage, 0, 0, 5)
    stage.onFrame = (dt) => {
      const sim = simRef.current; if (!sim) return
      if (runRef.current && !gizmoRef.current?.dragging()) {
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
      if (sceneRef.current.id === DESIGN_SCENE_ID) {
        const node = designRef.current.assembly?.find((candidate) => candidate.id === assemblySelectionRef.current)
        const parent = node?.parent ? sim.mj.mj_name2id(sim.model, 1, `${node.parent}_mount`) : 1
        if (parent >= 0) gizmoRef.current?.setPose(sim.data.xpos.subarray(parent * 3, parent * 3 + 3), sim.data.xquat.subarray(parent * 4, parent * 4 + 4))
      }
    }
    // Tema değişince sahne de dönsün (üst çubuktaki açık/koyu düğmesi)
    const themeWatch = new MutationObserver(paintWorkbench)
    themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    stageRef.current = stage; groupRef.current = group
    paintWorkbench()
    const colorScheme = window.matchMedia('(prefers-color-scheme: dark)')
    colorScheme.addEventListener('change', paintWorkbench)
    gizmoRef.current = createCadGizmo(stage, group, (id, patch) => {
      const node = designRef.current.assembly?.find((candidate) => candidate.id === id)
      if (node) {
        const height = ASSEMBLY_PARTS[node.type].size[2]
        const pos = patch.pos ? [patch.pos[0], patch.pos[1], patch.pos[2] - height] as [number, number, number] : node.pos
        changeDesignRef.current({ ...designRef.current, assembly: updateAssembly(designRef.current.assembly!, id, { pos, yaw: patch.yaw }) })
        return
      }
      const g = normalizeGovde(designRef.current.govde) ?? defaultGovde(designRef.current.chassis)
      changeDesignRef.current({ ...designRef.current, govde: updateBlock(g, id, patch) })
    }, (id, additive) => {
      if (additive && id && !id.startsWith('asm_') && cadBlockRef.current && cadBlockRef.current !== id) { setSecondBlock(id); return }
      if (id?.startsWith('asm_')) { setAssemblySelected(id); setCadBlock(null) }
      else { setCadBlock(id); setAssemblySelected(null) }
    })
    const raycaster = new THREE.Raycaster()
    let pointerStart: { id: number; x: number; y: number } | null = null
    const down = (event: PointerEvent) => { pointerStart = event.button === 0 && event.isPrimary ? { id: event.pointerId, x: event.clientX, y: event.clientY } : null }
    const up = (event: PointerEvent) => {
      const start = pointerStart; pointerStart = null
      const sim = simRef.current
      if (!start || start.id !== event.pointerId || dockRef.current !== 'cad' || !sim || gizmoRef.current?.dragging() || Math.hypot(start.x - event.clientX, start.y - event.clientY) > 4) return
      const bounds = stage.renderer.domElement.getBoundingClientRect()
      raycaster.setFromCamera(new THREE.Vector2((event.clientX - bounds.left) / bounds.width * 2 - 1, 1 - (event.clientY - bounds.top) / bounds.height * 2), stage.camera)
      const hit = raycaster.intersectObjects(sim.meshes, true)[0]
      const id = hit?.object.userData.assemblyId as string | undefined
      if (id) { setAssemblySelected(id); setCadBlock(null); setGizmoMode((mode) => mode === 'scale' ? 'translate' : mode) }
    }
    const cancel = () => { pointerStart = null }
    stage.renderer.domElement.addEventListener('pointerdown', down)
    stage.renderer.domElement.addEventListener('pointerup', up)
    stage.renderer.domElement.addEventListener('pointercancel', cancel)
    return () => {
      stage.renderer.domElement.removeEventListener('pointerdown', down)
      stage.renderer.domElement.removeEventListener('pointerup', up)
      stage.renderer.domElement.removeEventListener('pointercancel', cancel)
      themeWatch.disconnect()
      colorScheme.removeEventListener('change', paintWorkbench)
      gizmoRef.current?.dispose(); gizmoRef.current = null
      disposeSim(); stage.dispose(); stageRef.current = null; groupRef.current = null
      gridTextureRef.current?.dispose(); gridTextureRef.current = null; axesRef.current = null
    }
  }, [webgl, disposeSim, paintWorkbench])

  useEffect(() => { gridOnRef.current = gridOn; paintWorkbench() }, [gridOn, paintWorkbench])
  useEffect(() => { if (axesRef.current) axesRef.current.visible = axesOn }, [axesOn])

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
        sim.meshes.forEach((mesh, index) => {
          const name = mj.mj_id2name(model, 5, index) || ''
          const id = /^(asm_\d+)_/.exec(name)?.[1]
          if (id) mesh.traverse((object) => { object.userData.assemblyId = id })
        })
        simRef.current = sim
        paintWorkbench()
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
  }, [applied, webgl, disposeSim, resetState, applyGravity, paintWorkbench])

  // Ortam değişince yerçekimi anında uygulanır: robot düşerken bile Ay'a geçilebilir
  useEffect(() => { applyGravity() }, [env, applyGravity])

  // Tutamaçlar: yalnız CAD rafı açıkken ve kendi robotuna bakarken görünür
  useEffect(() => {
    const g = gizmoRef.current; if (!g) return
    const active = dock === 'cad' && scene.id === DESIGN_SCENE_ID
    const body = normalizeGovde(design.govde) ?? defaultGovde(design.chassis)
    const node = design.assembly?.find((candidate) => candidate.id === assemblySelected)
    const size = node ? ASSEMBLY_PARTS[node.type].size : null
    const proxy = node && size ? { id: node.id, shape: 'kutu' as const, pos: [node.pos[0], node.pos[1], node.pos[2] + size[2]] as [number, number, number], size, yaw: node.yaw, color: '#c2410c' } : null
    g.update(active ? proxy ? { v: 1, blocks: [proxy] } : { ...body, blocks: body.blocks.filter((block) => !block.hidden) } : { v: 1, blocks: [] }, active ? proxy?.id ?? cadBlock : null)
    g.setMode(node && gizmoMode === 'scale' ? 'translate' : gizmoMode)
    g.setOptions({ snapM: snapOn ? 0.005 : 0, snapDeg: angleSnapOn ? 15 : 0 })
  }, [dock, scene.id, design, cadBlock, assemblySelected, gizmoMode, snapOn, angleSnapOn])

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
    setDesignSaveFailed(!saveDesign(d))
    flashSaving()
    if (sceneRef.current.id !== DESIGN_SCENE_ID) return // başka robota bakılıyorsa sahneyi değiştirme
    const s = designScene(d)
    if (s) { setXml(s.xml); setApplied(s.xml) }
  }
  /** Geçmişte gezdikten sonra sahneyi o tasarıma getirir. */
  const applyHist = (next: typeof hist) => {
    setHist(next)
    const d = present(next)
    setDesignSaveFailed(!saveDesign(d))
    flashSaving()
    if (sceneRef.current.id !== DESIGN_SCENE_ID) return
    const s = designScene(d)
    if (s) { setXml(s.xml); setApplied(s.xml) }
  }
  const changeDesignRef = useRef(changeDesign); changeDesignRef.current = changeDesign
  /** Görünüm: kamerayı sabit bir açıya oturtur (üst, ön, yan, serbest). */
  const setView = (v: 'ust' | 'on' | 'yan' | 'serbest') => {
    setCameraView(v)
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
    compileVersion.current++
    labRef.current?.dispose()
    labRef.current = null
    setLabState(null)
    setElecRun({ status: 'idle' })
  }, [])
  useEffect(() => { stopElec() }, [circuit, applied, stopElec])

  /** Arduino kodunu gerçekten derler (avr-gcc), hex'i AVR emülatöründe başlatır ve köprüyü kurar. */
  const runElec = async () => {
    stopElec()
    const version = compileVersion.current
    const currentCircuit = circuitRef.current
    setElecRun({ status: 'compiling' })
    const out = await compileCode(arduinoRef.current)
    if (version !== compileVersion.current) return
    if (!out.ok) {
      setElecRun(out.errors.length
        ? { status: 'errors', errors: out.errors }
        : { status: 'failed', message: out.message ?? L('Derleme başarısız.', 'Compilation failed.') })
      return
    }
    try {
      labRef.current = createRuntime(currentCircuit, out.hex)
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


  const railItems: { id: Dock; ico: IconName; label: string }[] = [
    { id: 'cad', ico: 'parcalar', label: 'CAD' },
    { id: 'elec', ico: 'laboratuvar', label: L('ELEK', 'ELEC') },
    { id: 'code', ico: 'code', label: L('KOD', 'CODE') },
    { id: 'simulate', ico: 'play', label: L('SİMÜLASYON', 'SIMULATE') },
    { id: 'settings', ico: 'sun', label: L('AYARLAR', 'SETTINGS') },
  ]
  const activeRail = dock === 'robot' || dock === 'goals' || dock === 'data' ? 'simulate' : dock === 'model' ? 'settings' : dock
  const body = normalizeGovde(design.govde) ?? defaultGovde(design.chassis)
  const selectedBlock = body.blocks.find((block) => block.id === cadBlock)
  const editMode = (mode: GizmoMode) => { if (assemblySelected && mode === 'scale') return; setGizmoMode(mode); setDock('cad') }
  const selectAssembly = (id: string | null) => { setAssemblySelected(id); setCadBlock(null); if (id && gizmoMode === 'scale') setGizmoMode('translate') }
  const openAssemblyExample = () => {
    const code = assemblySketch(design.assembly ?? [], circuit)
    if (arduino.trim() && arduino !== code && !window.confirm(L('Mevcut Arduino kodu örnek kodla değiştirilsin mi?', 'Replace your current Arduino code with the example?'))) return
    stopElec(); setArduino(code); setProgTab('arduino'); setDock('code')
  }
  const saveProject = () => {
    setDesignSaveFailed(!saveDesign(design))
    setProjectSaveFailed(!saveWorkbenchProject({ circuit, plan, arduino }))
    flashSaving()
  }
  const downloadProject = () => {
    const content = exportWorkbenchFile({ design, circuit, plan, arduino })
    const url = URL.createObjectURL(new Blob([content], { type: 'application/json' }))
    const anchor = document.createElement('a')
    anchor.href = url; anchor.download = `${design.name.replace(/[^a-zA-Z0-9_-]/g, '_') || 'robot'}.muroko.json`; anchor.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  const importProject = async (file: File) => {
    if (file.size > 4_000_000) { window.alert(L('Proje dosyası çok büyük (en fazla 4 MB).', 'Project file is too large (maximum 4 MB).')); return }
    const loaded = importWorkbenchFile(await file.text())
    if (!loaded) { window.alert(L('Geçerli bir MuRoKo proje dosyası seç.', 'Choose a valid MuRoKo project file.')); return }
    if (!window.confirm(L('Mevcut proje bu dosyayla değiştirilsin mi?', 'Replace the current project with this file?'))) return
    stopElec(); applyHist(initHistory(loaded.design)); setCircuit(loaded.circuit); setPlan(loaded.plan); setArduino(loaded.arduino); setCadBlock(null); setAssemblySelected(null); setSecondBlock(null)
  }
  const surfaceTool = (tool: 'surface' | 'extrude' | 'slice') => {
    if (!selectedBlock || scene.id !== DESIGN_SCENE_ID) return
    const operations = { surface: snapToSurface, extrude: extrudeBlock, slice: sliceBlock }
    const next = operations[tool](body, selectedBlock.id, 'x', tool === 'extrude' ? 0.01 : 0)
    changeDesign({ ...design, govde: next })
    setDock('cad')
  }
  const dockTitle: Record<Dock, string> = {
    cad: L('Robotunu tasarla', 'Design your robot'),
    robot: L('Robot seç', 'Pick a robot'),
    elec: L('Elektronik ve kablolama', 'Electronics and wiring'),
    code: L('Robotu programla', 'Program the robot'),
    goals: L('Hedefler', 'Goals'),
    data: L('Sensör ve grafik', 'Sensors and graph'),
    model: L('Model (MJCF)', 'Model (MJCF)'),
    simulate: L('Simülasyon', 'Simulation'),
    settings: L('Çalışma alanı ayarları', 'Workbench settings'),
  }

  return (
    <section className="mj" data-testid="mujoco-lab" ref={wbRef}>
      <ProjectToolbar name={design.name} onName={(name) => changeDesign({ ...design, name })} onSave={saveProject} onDownload={downloadProject} onImport={importProject} onUndo={doUndo} onRedo={doRedo} canUndo={canUndo(hist)} canRedo={canRedo(hist)} saveState={projectSaveFailed || designSaveFailed ? L('Kayıt başarısız', 'Save failed') : saveState === 'saving' ? L('Kaydediliyor…', 'Saving…') : L('Tarayıcıya kaydedildi', 'Saved in browser')} en={en} />
      <div className="mj-wb" data-dock={dock ?? 'none'} data-workspace={dock === 'code' ? 'code' : dock === 'elec' && elecTab === 'circuit' ? 'circuit' : 'scene'} data-editor-view={editorView} data-guides={guidesOn ? 'on' : 'off'} tabIndex={0}
        aria-label={L('Robot tasarım çalışma alanı', 'Robot design workbench')}
        onKeyDown={(event) => {
          if ((event.target as HTMLElement).closest('input, textarea, select, [contenteditable="true"]') || event.ctrlKey || event.metaKey || event.altKey) return
          const modes: Record<string, GizmoMode> = { w: 'translate', e: 'rotate', r: 'scale' }
          const key = event.key.toLowerCase()
          if (modes[key]) { event.preventDefault(); editMode(modes[key]) }
          if (key === 'f') { event.preventDefault(); setView('serbest') }
        }}>
        {/* Sahne: tüm tezgâhı kaplar, paneller üstünde yüzer */}
        {webgl
          ? <div ref={host} className="mj-stage" data-testid="mujoco-stage" />
          : <div className="mj-stage mj-msg">{L('Bu tarayıcıda WebGL yok; 3B görüntü açılamıyor.', 'WebGL is not available in this browser.')}</div>}
        {status === 'loading' && <div className="mj-overlay">{scene.pack ? L('Robot modeli indiriliyor (birkaç MB, bir kez)…', 'Downloading the robot model (a few MB, once)…') : L('Fizik motoru yükleniyor (8 MB, ilk açılışta)…', 'Loading the physics engine (8 MB, first visit)…')}</div>}

        <div className={`mj-main-workspace${editorView === 'split' ? ' split' : ''}`} hidden={dock !== 'code'} data-testid="mujoco-code-workspace">
          <div className="mj-workspace-head"><strong>{progTabs.find((tab) => tab.id === progTab)?.label}</strong><span>Uno · AVR</span><button className="mj-qbtn" onClick={() => setDock('cad')}>{L('3B tasarıma dön', 'Back to 3D')}</button></div>
          <div ref={setCodeHost} className="mj-workspace-content" />
        </div>
        <div className="mj-main-workspace" hidden={dock !== 'elec' || elecTab !== 'circuit'} data-testid="mujoco-circuit-workspace">
          <div className="mj-workspace-head"><strong>{L('Devre çalışma alanı', 'Circuit workbench')}</strong><span>{circuit.parts.length} {L('parça', 'parts')} · {circuit.wires.length} {L('kablo', 'wires')}</span><button className="mj-qbtn" onClick={() => setElecTab('parts')}>{L('Bitti · 3B', 'Done · 3D')}</button></div>
          <div ref={setCircuitHost} className="mj-workspace-content" />
        </div>

        {/* Sahnenin üstünde fizik göstergesi */}
        <div className="mj-hud" aria-live="off" data-testid="mujoco-hud">
          <span><i aria-hidden="true">{envDef.ico}</i> {en ? envDef.en : envDef.tr}</span>
          <span><b>g</b> {envDef.g.toFixed(2).replace('.', en ? '.' : ',')} m/s²</span>
          <span><b>t</b> {info.t.toFixed(1).replace('.', en ? '.' : ',')} s</span>
          <span><b>{L('temas', 'contacts')}</b> {info.ncon}</span>
          {speed !== 1 && <span className="mj-hud-hi">{String(speed).replace('.', en ? '.' : ',')}×</span>}
          {!running && <span className="mj-hud-hi">⏸ {L('duraklatıldı', 'paused')}</span>}
          <button className="mj-fs" onClick={toggleFullscreen} aria-pressed={fullscreen}
            title={fullscreen ? L('Tam ekrandan çık', 'Exit fullscreen') : L('Tam ekran', 'Fullscreen')}
            aria-label={fullscreen ? L('Tam ekrandan çık', 'Exit fullscreen') : L('Tam ekran', 'Fullscreen')}
            data-testid="mujoco-fullscreen">{fullscreen ? '⤡' : '⤢'}</button>
        </div>

        {/* Sol üstte yüzen hızlı araçlar */}
        <div className={`mj-quick${quickOpen ? '' : ' mini'}`}>
          <div className="mj-quick-head">
            <span><Icon name="atolye" size={15} />{L('Hızlı araçlar', 'Quick Tools')}</span>
            <button className="mj-x" onClick={() => setQuickOpen((v) => !v)} aria-expanded={quickOpen} aria-label={quickOpen ? L('Küçült', 'Collapse') : L('Aç', 'Expand')}>{quickOpen ? '–' : '+'}</button>
          </div>
          {quickOpen && (
            <div className="mj-quick-body">
              <div className="mj-tool-grid" role="group" aria-label={L('Dönüştürme araçları', 'Transform tools')}>
                <ToolButton icon="move" label={L('Taşı', 'Move')} shortcut="W" active={gizmoMode === 'translate'} onClick={() => editMode('translate')} data-testid="mujoco-tool-move" />
                <ToolButton icon="rotate" label={L('Döndür', 'Rotate')} shortcut="E" active={gizmoMode === 'rotate'} onClick={() => editMode('rotate')} data-testid="mujoco-tool-rotate" />
                <ToolButton icon="scale" label={L('Ölçek', 'Scale')} shortcut="R" disabled={!!assemblySelected} active={gizmoMode === 'scale'} onClick={() => editMode('scale')} data-testid="mujoco-tool-scale" />
                <ToolButton icon="surface" label={L('Yüzey', 'Surface')} disabled={!selectedBlock || scene.id !== DESIGN_SCENE_ID} onClick={() => surfaceTool('surface')} />
                <ToolButton icon="extrude" label={L('Uzat', 'Extrude')} disabled={!selectedBlock || scene.id !== DESIGN_SCENE_ID} onClick={() => surfaceTool('extrude')} />
                <ToolButton icon="slice" label={L('Böl', 'Slice')} disabled={!selectedBlock || selectedBlock.shape !== 'kutu' || scene.id !== DESIGN_SCENE_ID} onClick={() => surfaceTool('slice')} />
              </div>
              <div className="mj-tool-grid mj-tool-toggles" role="group" aria-label={L('Yerleştirme ve görünüm', 'Snapping and display')}>
                <ToolButton icon="snap" label="5 mm" active={snapOn} onClick={() => setSnapOn((value) => !value)} />
                <ToolButton icon="angle" label="15°" active={angleSnapOn} onClick={() => setAngleSnapOn((value) => !value)} />
                <ToolButton icon="guides" label={L('İpuçları', 'Guides')} active={guidesOn} onClick={() => setGuidesOn((value) => !value)} />
                <ToolButton icon="grid" label={L('Izgara', 'Grid')} active={gridOn} onClick={() => setGridOn((value) => !value)} data-testid="mujoco-grid" />
                <ToolButton icon="axes" label={L('Eksen', 'Axes')} active={axesOn} onClick={() => setAxesOn((value) => !value)} data-testid="mujoco-axes" />
              </div>
            </div>
          )}
        </div>

        <ViewCube view={view} onView={setView} en={en} />
        <p className="mj-stage-tip">{L('Seçmek için tıkla · Yakınlaşmak için kaydır · Döndürmek için sürükle', 'Click to select · Scroll to zoom · Drag to orbit')}</p>

        <nav className="mj-rail" aria-label={L('Çalışma bölümleri', 'Workbench sections')}>
          {railItems.map((item) => (
            <button key={item.id} className={`mj-rail-btn${activeRail === item.id ? ' on' : ''}`} aria-pressed={activeRail === item.id}
              onClick={() => setDock(dock === item.id ? null : item.id)} data-testid={`mujoco-rail-${item.id}`}>
              <Icon name={item.ico} size={21} /><span>{item.label}</span>
            </button>
          ))}
          <button className="mj-rail-btn mj-rail-fullscreen" onClick={toggleFullscreen} aria-pressed={fullscreen} aria-label={L('Tam ekran', 'Fullscreen')}>
            <span aria-hidden="true">⛶</span><span>{L('TAM EKRAN', 'FULLSCREEN')}</span>
          </button>
        </nav>

        <div className="mj-dock" hidden={dock === null} aria-label={dock ? dockTitle[dock] : undefined}>
          {projectSaveFailed && <p className="mj-warns" role="alert">{L('Devre ve kod tarayıcıya kaydedilemedi. Tarayıcı depolama iznini kontrol et.', 'Circuit and code could not be saved. Check browser storage permissions.')}</p>}
          <div className="mj-dock-head">
            <strong><span className="mj-dock-symbol"><Icon name={railItems.find((item) => item.id === activeRail)?.ico ?? 'parcalar'} size={18} /></span>{dock ? dockTitle[dock] : ''}</strong>
            <button className="mj-x" onClick={() => setDock(null)} aria-label={L('Paneli kapat', 'Close panel')}>✕</button>
          </div>

          <div className="mj-dock-body" hidden={dock !== 'simulate'}>
            <span className="mj-group-label">{L('FİZİK KONTROLLERİ', 'PHYSICS CONTROLS')}</span>
            <div className="mj-simulation-controls">
              <button className={`mj-qbtn${running ? ' on' : ''}`} onClick={toggle} data-testid="mujoco-toggle">
                <b aria-hidden="true">{running ? '⏸' : '▶'}</b>{running ? L('Duraklat', 'Pause') : L('Başlat', 'Play')}
              </button>
              <button className="mj-qbtn" onClick={resetState}><b aria-hidden="true">↺</b>{L('Başa al', 'Reset')}</button>
              <button className="mj-qbtn" onClick={shake}><b aria-hidden="true">🎲</b>{L('Karıştır', 'Shake')}</button>
            </div>
            <div className="mj-section-links">
              <button className="mj-qbtn" onClick={() => setDock('robot')}><Icon name="arena" />{L('Robot ve sahne seç', 'Choose robot and scene')}<Icon name="chevronRight" size={14} /></button>
              <button className="mj-qbtn" onClick={() => setDock('goals')}><Icon name="target" />{L('Görev ve hedefler', 'Missions and goals')}<Icon name="chevronRight" size={14} /></button>
              <button className="mj-qbtn" onClick={() => setDock('data')}><Icon name="ilerleme" />{L('Sensörler ve grafikler', 'Sensors and graphs')}<Icon name="chevronRight" size={14} /></button>
            </div>
            <p className="mj-qhint">{en ? scene.en.hint : scene.tr.hint}</p>
          </div>

          <div className="mj-dock-body" hidden={dock !== 'settings'}>
              <span className="mj-group-label">{L('BENZETİM AYARLARI', 'SIMULATION SETTINGS')}</span>
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
              <button className="mj-qbtn" onClick={() => setDock('model')}><Icon name="code" />{L('Model kaynağı (MJCF)', 'Model source (MJCF)')}</button>
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
              secondBlock={secondBlock} onSecondBlock={setSecondBlock}
              assemblyRequest={assemblyRequest}
              assemblySelected={assemblySelected} onAssemblySelect={selectAssembly} onAssemblyExample={openAssemblyExample}
              assemblyIssues={assemblyConnectionIssues(design.assembly ?? [], circuit)} assemblyAngle={(sens[`${assemblySelected}_angle`] ?? 0) * 180 / Math.PI}
              onAssemblyPreview={(id, degrees) => { stopElec(); runners.current = []; setProgRunning(false); setMotor(assemblyActuator(id), degrees * Math.PI / 180); resumeSim() }}
              onUndo={doUndo} onRedo={doRedo} canUndo={canUndo(hist)} canRedo={canRedo(hist)}
              block={cadBlock} onBlock={(id) => { setCadBlock(id); setAssemblySelected(null) }}
              gizmoMode={gizmoMode} onGizmoMode={setGizmoMode} snap={snapOn} onSnap={setSnapOn} saveState={saveState} />
          </div>

          <div className="mj-dock-body" hidden={dock !== 'elec'}>
            <MurokoElec circuit={circuit} onCircuit={setCircuit} plan={plan} onPlan={setPlan}
              tab={elecTab} onTab={setElecTab} workbenchHost={circuitHost} onPress={(id, down) => labRef.current?.setProp(id, 'pressed', down)}
              onMechanics={() => { setAssemblyRequest((value) => value + 1); setDock('cad') }}
              ranges={ctrlDefs} channels={chNames} labState={labState} editLocked={elecRun.status === 'running'} en={en} />
          </div>

          <div className="mj-dock-body" hidden={dock !== 'code'}>
            <div className="mj-tabs" role="tablist" aria-label={L('Programlama yolu', 'Way of programming')}>
              {progTabs.map((t) => (
                <button key={t.id} role="tab" aria-selected={progTab === t.id} className={`mj-tab${progTab === t.id ? ' on' : ''}`} onClick={() => setProgTab(t.id)} data-testid={t.test}>{t.label}</button>
              ))}
            </div>
            <p className="muted">{L('Kod ana çalışma alanında açılır. Tam düzenleyici kullan veya robotla yan yana çalış.', 'Code opens in the main workspace. Use the full editor or work beside your robot.')}</p>
            <div className="mj-bar"><button className={`mj-qbtn${editorView === 'full' ? ' on' : ''}`} onClick={() => setEditorView('full')} data-testid="mujoco-editor-full">{L('Tam düzenleyici', 'Full editor')}</button><button className={`mj-qbtn${editorView === 'split' ? ' on' : ''}`} onClick={() => setEditorView('split')} data-testid="mujoco-editor-split">{L('3B ile böl', 'Split with 3D')}</button></div>
            <WorkbenchPortal target={codeHost}>
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
                <WorkbenchCodeEditor value={arduino} onChange={setArduino} errorLines={elecRun.status === 'errors' ? elecRun.errors.map((error) => error.line) : []} />
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
            </WorkbenchPortal>
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
          <span>{L('Nesneler', 'Objects')}: {scene.id === DESIGN_SCENE_ID ? body.blocks.length + design.parts.length : simRef.current?.meshes.length ?? 0}</span>
          <span className="mj-selection-status">{selectedBlock ? `${L('Seçili', 'Selected')}: ${selectedBlock.id}` : L('Seçim yok', 'No selection')}</span>
          <span><b>{en ? scene.en.title : scene.tr.title}</b></span>
          <span>{L('motor', 'motors')}: {ctrlDefs.length}</span>
          <span>{L('ortam', 'environment')}: {en ? envDef.en : envDef.tr}</span>
          <span>{L('temas', 'contacts')}: {info.ncon}</span>
          {progRunning && <span className="mj-live">● {L('program çalışıyor', 'program running')}</span>}
          {elecRun.status === 'running' && <span className="mj-live" data-testid="mujoco-board-live">⚡ {L('kart çalışıyor', 'board running')} · {plan.motors.length} {L('motor bağlı', 'motors linked')}</span>}
          <span className="mj-status-r" data-testid="mujoco-clock">{info.t.toFixed(1)} s · {running ? L('çalışıyor', 'running') : L('duraklatıldı', 'paused')}</span>
          <span className="mj-shortcuts">W/E/R · {L('taşı / döndür / ölçek', 'move / rotate / scale')} · F · {L('görünümü sıfırla', 'reset view')}</span>
        </div>
      </div>

      {status === 'error' && <pre className="mj-err" role="alert" data-testid="mujoco-error">{err}</pre>}
    </section>
  )
}
