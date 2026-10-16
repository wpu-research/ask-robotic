'use client'
// 3B sahne altyapısı (three.js). Benzetim düzlemi (x, y) metre: dünyada X = x, Z = -y, Y yukarı.
// Fizik değişmez; burası yalnız görüntüdür. Sahne her karede çağıranın `frame` işleviyle güncellenir.
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export type CamMode = 'genel' | 'takip' | 'ustten'

export function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch { return false }
}

export const toWorld = (x: number, y: number, h = 0) => new THREE.Vector3(x, h, -y)

export interface Stage {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  controls: OrbitControls
  renderer: THREE.WebGLRenderer
  sun: THREE.DirectionalLight
  /** Her karede çağrılır (render'dan hemen önce). */
  onFrame: ((dt: number) => void) | null
  /** Tuval boyutu değişince (ör. tam ekran) çağrılır. */
  onResize: (() => void) | null
  dispose(): void
}

export function createStage(host: HTMLElement): Stage {
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.outputColorSpace = THREE.SRGBColorSpace
  const el = renderer.domElement
  el.style.display = 'block'
  el.style.width = '100%'
  el.style.height = '100%'
  el.style.touchAction = 'none'
  host.appendChild(el)

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0xdde5ef)
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a96a8, 1.15))
  const sun = new THREE.DirectionalLight(0xffffff, 1.7)
  sun.position.set(2.5, 5, 2)
  sun.castShadow = true
  sun.shadow.mapSize.set(2048, 2048)
  sun.shadow.bias = -0.0004
  scene.add(sun, sun.target)

  const camera = new THREE.PerspectiveCamera(45, 1, 0.005, 200)
  const controls = new OrbitControls(camera, el)
  controls.enableDamping = true
  controls.dampingFactor = 0.12
  controls.maxPolarAngle = Math.PI / 2 - 0.04

  const stage: Stage = { scene, camera, controls, renderer, sun, onFrame: null, onResize: null, dispose }

  const resize = () => {
    const w = Math.max(1, host.clientWidth), h = Math.max(1, host.clientHeight)
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    stage.onResize?.()
  }
  const ro = new ResizeObserver(resize)
  ro.observe(host)
  resize()

  let raf = 0
  let last = performance.now()
  const loop = (t: number) => {
    const dt = Math.min(0.1, (t - last) / 1000)
    last = t
    stage.onFrame?.(dt)
    controls.update()
    renderer.render(scene, camera)
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)

  function dispose() {
    cancelAnimationFrame(raf)
    ro.disconnect()
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

/** Gölge kamerasını sahne boyutuna oturtur. */
export function fitShadow(stage: Stage, cx: number, cz: number, size: number) {
  const s = stage.sun
  s.position.set(cx + size * 0.8, size * 2.2, cz + size * 0.6)
  s.target.position.set(cx, 0, cz)
  const c = s.shadow.camera
  c.left = -size; c.right = size; c.top = size; c.bottom = -size
  c.near = 0.1; c.far = size * 6
  c.updateProjectionMatrix()
}

/** Kamera kipini uygular. `follow` yalnız 'takip' için: robot konumu ve yönü (düzlem). */
export function applyCamera(stage: Stage, mode: CamMode, area: { w: number; h: number }, follow?: { x: number; y: number; theta: number }, dt = 0) {
  const { camera, controls } = stage
  const cx = area.w / 2, cz = -area.h / 2, size = Math.max(area.w, area.h)
  if (mode === 'takip' && follow) {
    controls.enabled = false
    const back = Math.max(0.35, size * 0.22)
    const want = new THREE.Vector3(follow.x - Math.cos(follow.theta) * back, back * 0.75, -(follow.y - Math.sin(follow.theta) * back))
    const k = dt ? 1 - Math.exp(-dt * 5) : 1
    camera.position.lerp(want, k)
    const look = new THREE.Vector3(follow.x + Math.cos(follow.theta) * back * 0.6, 0.02, -(follow.y + Math.sin(follow.theta) * back * 0.6))
    controls.target.lerp(look, k)
    camera.lookAt(controls.target)
    return
  }
  controls.enabled = true
  if (dt) return // genel/üstten: yalnız kip değişince konumlanır, sonra kullanıcı döndürür
  if (mode === 'ustten') {
    const hgt = (size / 2) / Math.tan((camera.fov * Math.PI) / 360) * 1.15
    camera.position.set(cx, hgt, cz + 0.001)
  } else {
    // Arenayı genişlik ve derinlikte tam sığdır: ekran ne kadar büyükse robot o kadar büyük görünür.
    const vf = (camera.fov * Math.PI) / 180
    const hf = 2 * Math.atan(Math.tan(vf / 2) * camera.aspect)
    const elev = (40 * Math.PI) / 180
    const dist = Math.max((area.w / 2) / Math.tan(hf / 2), (area.h * Math.sin(elev) * 0.62) / Math.tan(vf / 2)) * 1.04
    camera.position.set(cx, Math.sin(elev) * dist, cz + Math.cos(elev) * dist)
  }
  controls.target.set(cx, 0, cz)
  camera.lookAt(controls.target)
}

// ---------------- zemin ----------------
export interface FloorZone { id: string; label?: string; x: number; y: number; r: number; color: string; visited: boolean }
export interface FloorSpec {
  w: number
  h: number
  lines: ReadonlyArray<ReadonlyArray<readonly [number, number]>>
  lineWidth: number
  patches?: ReadonlyArray<{ x1: number; y1: number; x2: number; y2: number; css: string }>
  zones: FloorZone[]
}

/** Zemin: düzlem + çizilmiş doku (ızgara, renk alanları, çizgiler, bölgeler). `paint` bölgeler değişince yeniden çağrılır. */
export function makeFloor(spec: FloorSpec): { mesh: THREE.Mesh; paint(s: FloorSpec): void } {
  const ppm = Math.min(700, 2048 / Math.max(spec.w, spec.h))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(spec.w * ppm)
  canvas.height = Math.round(spec.h * ppm)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(spec.w, spec.h), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 }))
  mesh.rotation.x = -Math.PI / 2
  mesh.position.set(spec.w / 2, 0, -spec.h / 2)
  mesh.receiveShadow = true
  const paint = (s: FloorSpec) => {
    const g = canvas.getContext('2d')!
    const X = (x: number) => x * ppm, Y = (y: number) => (s.h - y) * ppm
    g.fillStyle = '#f8fafc'; g.fillRect(0, 0, canvas.width, canvas.height)
    for (let v = 0.25; v < Math.max(s.w, s.h); v += 0.25) {
      g.strokeStyle = Math.abs(v % 1) < 1e-6 ? '#cbd5e1' : '#e5eaf1'
      g.lineWidth = Math.max(1, ppm * 0.003)
      if (v < s.w) { g.beginPath(); g.moveTo(X(v), 0); g.lineTo(X(v), canvas.height); g.stroke() }
      if (v < s.h) { g.beginPath(); g.moveTo(0, Y(v)); g.lineTo(canvas.width, Y(v)); g.stroke() }
    }
    for (const p of s.patches ?? []) {
      g.fillStyle = p.css
      g.fillRect(X(Math.min(p.x1, p.x2)), Y(Math.max(p.y1, p.y2)), Math.abs(p.x2 - p.x1) * ppm, Math.abs(p.y2 - p.y1) * ppm)
    }
    g.strokeStyle = '#111827'; g.lineCap = 'round'; g.lineJoin = 'round'; g.lineWidth = s.lineWidth * ppm
    for (const l of s.lines) {
      g.beginPath()
      l.forEach(([x, y], i) => (i ? g.lineTo(X(x), Y(y)) : g.moveTo(X(x), Y(y))))
      g.stroke()
    }
    for (const z of s.zones) {
      g.beginPath(); g.arc(X(z.x), Y(z.y), z.r * ppm, 0, Math.PI * 2)
      g.globalAlpha = z.visited ? 0.38 : 0.16; g.fillStyle = z.color; g.fill()
      g.globalAlpha = 1; g.setLineDash([ppm * 0.02, ppm * 0.015]); g.lineWidth = ppm * 0.005; g.strokeStyle = z.color; g.stroke(); g.setLineDash([])
      if (z.label) {
        g.fillStyle = '#0f172a'; g.font = `700 ${Math.round(ppm * 0.045)}px system-ui, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'
        g.fillText(z.label, X(z.x), Y(z.y))
      }
    }
    tex.needsUpdate = true
  }
  paint(spec)
  return { mesh, paint }
}

// ---------------- duvarlar ----------------
const WALL_H = 0.07
const WALL_T = 0.02
export const wallMaterial = () => new THREE.MeshStandardMaterial({ color: 0xa8b4c6, roughness: 0.7 })

export function placeWall(m: THREE.Mesh, [x1, y1, x2, y2]: readonly [number, number, number, number]) {
  const len = Math.hypot(x2 - x1, y2 - y1)
  m.scale.set(len + WALL_T, 1, 1)
  m.position.set((x1 + x2) / 2, WALL_H / 2, -(y1 + y2) / 2)
  m.rotation.y = Math.atan2(y2 - y1, x2 - x1)
}

export function makeWall(seg: readonly [number, number, number, number], mat: THREE.Material): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.BoxGeometry(1, WALL_H, WALL_T), mat)
  m.castShadow = true; m.receiveShadow = true
  placeWall(m, seg)
  return m
}

// ---------------- iz ----------------
export function makeTrail(max = 4000, color = 0x0d9488): { line: THREE.Line; set(points: ReadonlyArray<readonly number[]>, tail?: readonly [number, number]): void } {
  const pos = new Float32Array((max + 1) * 3)
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geo.setDrawRange(0, 0)
  const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.75 }))
  line.frustumCulled = false
  return {
    line,
    set(points, tail) {
      const n = Math.min(points.length, max)
      const start = points.length - n
      for (let i = 0; i < n; i++) { pos[i * 3] = points[start + i][0]; pos[i * 3 + 1] = 0.003; pos[i * 3 + 2] = -points[start + i][1] }
      let c = n
      if (tail) { pos[c * 3] = tail[0]; pos[c * 3 + 1] = 0.003; pos[c * 3 + 2] = -tail[1]; c++ }
      geo.setDrawRange(0, c)
      geo.attributes.position.needsUpdate = true
    },
  }
}

export const std = (color: number | string, o: THREE.MeshStandardMaterialParameters = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.05, ...o })

export function mesh(geo: THREE.BufferGeometry, mat: THREE.Material, pos?: [number, number, number]): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat)
  m.castShadow = true
  m.receiveShadow = true
  if (pos) m.position.set(...pos)
  return m
}
