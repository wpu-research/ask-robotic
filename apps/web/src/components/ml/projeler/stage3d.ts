'use client'
// ML projeleri için 3B sahne: three.js yalnız istemcide (oynatıcı bu dosyayı dinamik import eder). Piksel oranı en fazla 1,5;
// sekme gizliyken ya da tuval ekranda değilken döngü tamamen durur; kaldırılınca bütün geometri, malzeme ve bağlam serbest bırakılır.
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export interface P3Stage {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  controls: OrbitControls
  renderer: THREE.WebGLRenderer
  /** Her karede (render'dan hemen önce) çağrılır; dt saniye, en fazla 0,1. */
  onFrame: ((dt: number) => void) | null
  /** Kamerayı konumlar ve hedefe baktırır. */
  view(pos: [number, number, number], target: [number, number, number]): void
  /** Tuval görünür ve sekme açık mı (döngü çalışıyor mu). */
  active(): boolean
  dispose(): void
}

export const MAX_DPR = 1.5

export function webglOk(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch { return false }
}

export function createP3Stage(host: HTMLElement, opts: { background?: number; shadows?: boolean } = {}): P3Stage {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'low-power' })
  renderer.setPixelRatio(Math.min(MAX_DPR, window.devicePixelRatio || 1))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  if (opts.shadows) { renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap }
  const el = renderer.domElement
  el.style.display = 'block'
  el.style.width = '100%'
  el.style.height = '100%'
  el.style.touchAction = 'none'
  host.appendChild(el)

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(opts.background ?? 0xe8edf3)
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a96a8, 1.2))
  const sun = new THREE.DirectionalLight(0xffffff, 1.6)
  sun.position.set(4, 8, 3)
  if (opts.shadows) {
    sun.castShadow = true
    sun.shadow.mapSize.set(1024, 1024)
    const c = sun.shadow.camera
    c.left = -8; c.right = 8; c.top = 8; c.bottom = -8; c.near = 0.5; c.far = 30
  }
  scene.add(sun)

  const camera = new THREE.PerspectiveCamera(45, 1, 0.05, 200)
  const controls = new OrbitControls(camera, el)
  controls.enableDamping = true
  controls.dampingFactor = 0.12
  controls.maxPolarAngle = Math.PI / 2 - 0.03

  let raf = 0, last = 0, onScreen = true, running = false
  const stage: P3Stage = {
    scene, camera, controls, renderer, onFrame: null,
    view(pos, target) { camera.position.set(...pos); controls.target.set(...target); camera.lookAt(controls.target); controls.update() },
    active: () => running,
    dispose,
  }

  const resize = () => {
    const w = Math.max(1, host.clientWidth), h = Math.max(1, host.clientHeight)
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    if (!running) renderer.render(scene, camera)
  }
  const ro = new ResizeObserver(resize)
  ro.observe(host)

  const loop = (t: number) => {
    const dt = last ? Math.min(0.1, (t - last) / 1000) : 1 / 60
    last = t
    stage.onFrame?.(dt)
    controls.update()
    renderer.render(scene, camera)
    raf = requestAnimationFrame(loop)
  }
  const sync = () => {
    const want = onScreen && document.visibilityState === 'visible'
    if (want && !running) { running = true; last = 0; raf = requestAnimationFrame(loop) }
    else if (!want && running) { running = false; cancelAnimationFrame(raf) }
  }
  const io = new IntersectionObserver((es) => { onScreen = es.some((e) => e.isIntersecting); sync() }, { threshold: 0.01 })
  io.observe(host)
  document.addEventListener('visibilitychange', sync)
  resize()
  sync()

  function dispose() {
    running = false
    cancelAnimationFrame(raf)
    io.disconnect()
    ro.disconnect()
    document.removeEventListener('visibilitychange', sync)
    controls.dispose()
    scene.traverse((o) => {
      const m = o as THREE.Mesh
      m.geometry?.dispose()
      const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : []
      for (const mat of mats) { (mat as THREE.MeshStandardMaterial).map?.dispose(); mat.dispose() }
    })
    renderer.dispose()
    renderer.forceContextLoss()
    el.remove()
  }
  return stage
}

/** Sahne modülü sözleşmesi: sahneyi kurar, her karede güncel koşuyu (run) okuyup çizer. Koşu sıfırlanınca yeni nesne gelir. */
export type MountScene = (s: P3Stage, lang: 'tr' | 'en') => { frame(run: unknown, dt: number): void; dispose?(): void }
