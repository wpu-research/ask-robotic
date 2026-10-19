// Drone dersi 3B sahnelerinin ortak parçaları: NED → three dönüşümü, yönelim kuaterniyonu, ok, yazı etiketi, zemin,
// rüzgâr çizgileri, ArUco işaretli ped ve kamera kipleri (takip / üstten / serbest). Yalnız istemcide yüklenir.
import * as THREE from 'three'
import type { V3 } from '@/lib/drone/flight3d'
import type { P3Stage } from '@/components/ml/projeler/stage3d'

export const std = (color: number, o: THREE.MeshStandardMaterialParameters = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, ...o })
export function mesh(g: THREE.BufferGeometry, m: THREE.Material, pos: [number, number, number] = [0, 0, 0], shadow = true) {
  const o = new THREE.Mesh(g, m)
  o.position.set(...pos)
  o.castShadow = shadow
  o.receiveShadow = true
  return o
}

/** NED (kuzey, doğu, aşağı) → three (x doğu, y yukarı, z güney). */
export const nedTo = (ned: readonly number[], out = new THREE.Vector3()) => out.set(ned[1], -ned[2], -ned[0])
/** Harita düzlemi (x doğu, y kuzey) ve irtifa → three. */
export const enTo = (x: number, y: number, h = 0, out = new THREE.Vector3()) => out.set(x, h, -y)

const _m = new THREE.Matrix4()
/**
 * Euler [φ, θ, ψ] (NED/FRD, ZYX) → model kuaterniyonu. Model: burun +x, sağ +z, yukarı +y. Q = C·R·Bᵀ;
 * C: NED → three, B: FRD → model.
 */
export function attQuat([φ, θ, ψ]: V3, out = new THREE.Quaternion()) {
  const cφ = Math.cos(φ), sφ = Math.sin(φ), cθ = Math.cos(θ), sθ = Math.sin(θ), cψ = Math.cos(ψ), sψ = Math.sin(ψ)
  const R = [
    [cψ * cθ, cψ * sθ * sφ - sψ * cφ, cψ * sθ * cφ + sψ * sφ],
    [sψ * cθ, sψ * sθ * sφ + cψ * cφ, sψ * sθ * cφ - cψ * sφ],
    [-sθ, cθ * sφ, cθ * cφ],
  ]
  // C·R: satırlar (doğu, yukarı, güney) = (R[1], −R[2], −R[0]); ·Bᵀ: sütunlar (ileri, −aşağı, sağ) = (c0, −c2, c1)
  const CR = [R[1], R[2].map((v) => -v), R[0].map((v) => -v)]
  const Q = CR.map((r) => [r[0], -r[2], r[1]])
  _m.set(Q[0][0], Q[0][1], Q[0][2], 0, Q[1][0], Q[1][1], Q[1][2], 0, Q[2][0], Q[2][1], Q[2][2], 0, 0, 0, 0, 1)
  return out.setFromRotationMatrix(_m)
}

/** Ok: yerel +y yönünde; set(uzunluk). Birim geometri ölçeklenir (karede yeni geometri yok). */
export function makeArrow(color: number, r = 0.03) {
  const g = new THREE.Group()
  const mat = std(color, { emissive: new THREE.Color(color), emissiveIntensity: 0.25 })
  const shaft = mesh(new THREE.CylinderGeometry(r, r, 1, 10), mat, [0, 0.5, 0], false)
  const head = mesh(new THREE.ConeGeometry(r * 2.6, r * 6, 14), mat, [0, 1, 0], false)
  g.add(shaft, head)
  const set = (len: number) => {
    const L = Math.max(0.001, len), h = Math.min(r * 6, L * 0.5)
    shaft.scale.y = Math.max(0.001, L - h); shaft.position.y = (L - h) / 2
    head.scale.setScalar(h / (r * 6)); head.position.y = L - h / 2
    g.visible = len > 0.01
  }
  set(1)
  return { group: g, set, mat }
}

/** Kamera karşısına dönen yazı etiketi (tuval dokusu). setText yalnız yazı değişince yeniden çizer. */
export function makeLabel(text: string, o: { color?: string; bg?: string; size?: number } = {}) {
  const cv = document.createElement('canvas')
  cv.width = 512; cv.height = 64
  const ctx = cv.getContext('2d')!
  const tex = new THREE.CanvasTexture(cv)
  tex.colorSpace = THREE.SRGBColorSpace
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }))
  sp.renderOrder = 10
  const s = o.size ?? 0.5
  sp.scale.set(s * 8, s, 1)
  let cur = ''
  const setText = (t: string) => {
    if (t === cur) return
    cur = t
    ctx.clearRect(0, 0, 512, 64)
    ctx.font = '700 36px Poppins, system-ui, sans-serif'
    const w = Math.min(504, ctx.measureText(t).width + 24)
    ctx.fillStyle = o.bg ?? 'rgba(15,23,42,.78)'
    ctx.beginPath(); ctx.roundRect((512 - w) / 2, 6, w, 52, 14); ctx.fill()
    ctx.fillStyle = o.color ?? '#f8fafc'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(t, 256, 33)
    tex.needsUpdate = true
  }
  setText(text)
  return { sprite: sp, setText }
}

/** Zemin: çim düzlemi + ızgara (her `cell` metrede bir çizgi). hills > 0 ise uçuş alanı dışında yumuşak tepeler. */
export function makeGround(size: number, cell: number, o: { hills?: number; color?: number } = {}) {
  const g = new THREE.Group()
  const seg = o.hills ? 60 : 1
  const geo = new THREE.PlaneGeometry(size, size, seg, seg)
  if (o.hills) {
    const p = geo.attributes.position
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), r = Math.hypot(x, y)
      const k = Math.max(0, (r - size * 0.3) / (size * 0.2))
      p.setZ(i, Math.min(1, k) * o.hills * (0.6 + 0.4 * Math.sin(x * 0.11) * Math.cos(y * 0.13)) * (1 + 0.5 * Math.sin((x + y) * 0.05)))
    }
    geo.computeVertexNormals()
  }
  const ground = mesh(geo, std(o.color ?? 0xbfcdb4, { roughness: 1 }), [0, 0, 0], false)
  ground.rotation.x = -Math.PI / 2
  g.add(ground)
  const span = o.hills ? size * 0.6 : size
  const grid = new THREE.GridHelper(span, Math.round(span / cell), 0x7c8a74, 0x9aa892)
  grid.position.y = 0.01
  ;(grid.material as THREE.Material).transparent = true
  ;(grid.material as THREE.Material).opacity = 0.55
  g.add(grid)
  return g
}

/** Rüzgâr çizgileri: kutu içinde akan kısa doğru parçaları. update(dt, rüzgâr three vektörü m/s). */
export function makeStreaks(n: number, box: { x: number; y: number; z: number; y0?: number }, color = 0x475569) {
  const pos = new Float32Array(n * 6)
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.45 })
  const lines = new THREE.LineSegments(geo, mat)
  const y0 = box.y0 ?? 0.3
  const pts = Array.from({ length: n }, (_, i) => new THREE.Vector3((((i * 0.618) % 1) * 2 - 1) * box.x, y0 + ((i * 0.377) % 1) * box.y, (((i * 0.853) % 1) * 2 - 1) * box.z))
  const update = (dt: number, w: THREE.Vector3) => {
    const sp = w.length(), len = 0.2 + Math.min(1.2, sp * 0.15)
    for (let i = 0; i < n; i++) {
      const p = pts[i]
      p.addScaledVector(w, dt)
      if (p.x > box.x) p.x -= 2 * box.x; if (p.x < -box.x) p.x += 2 * box.x
      if (p.z > box.z) p.z -= 2 * box.z; if (p.z < -box.z) p.z += 2 * box.z
      if (p.y > y0 + box.y) p.y -= box.y; if (p.y < y0) p.y += box.y
      const o = i * 6, k = sp > 1e-6 ? len / sp : 0
      pos[o] = p.x; pos[o + 1] = p.y; pos[o + 2] = p.z
      pos[o + 3] = p.x - w.x * k; pos[o + 4] = p.y - w.y * k; pos[o + 5] = p.z - w.z * k
    }
    geo.attributes.position.needsUpdate = true
    mat.opacity = Math.min(0.7, 0.08 + sp * 0.08)
    lines.visible = sp > 0.05
  }
  return { lines, update }
}

/** ArUco benzeri işaret: siyah çerçeve içinde 5×5 sabit desen (4×4 sözlüğün 0 numarasına benzer), tuval dokusu. */
export function arucoTexture() {
  const bits = ['10110', '01001', '11100', '00111', '10010']
  const cv = document.createElement('canvas')
  cv.width = cv.height = 256
  const c = cv.getContext('2d')!
  c.fillStyle = '#ffffff'; c.fillRect(0, 0, 256, 256)
  const cell = 256 / 9
  c.fillStyle = '#000000'; c.fillRect(cell, cell, cell * 7, cell * 7)
  c.fillStyle = '#ffffff'
  bits.forEach((row, i) => [...row].forEach((b, j) => { if (b === '1') c.fillRect(cell * (2 + j), cell * (2 + i), cell + 0.5, cell + 0.5) }))
  const tex = new THREE.CanvasTexture(cv)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.magFilter = THREE.NearestFilter
  return tex
}

/** İniş pedi: koyu disk + ArUco işaretli kare + sarı halka. Halka rengi dışarıdan değiştirilebilir. */
export function makePad(size = 1.6) {
  const g = new THREE.Group()
  g.add(mesh(new THREE.CylinderGeometry(size, size, 0.06, 48), std(0x3b4250, { roughness: 0.9 }), [0, 0.03, 0], false))
  const ringMat = std(0xfacc15, { emissive: new THREE.Color(0x000000), roughness: 0.5 })
  const ring = mesh(new THREE.TorusGeometry(size * 0.9, size * 0.04, 8, 64), ringMat, [0, 0.07, 0], false)
  ring.rotation.x = Math.PI / 2
  g.add(ring)
  const mk = mesh(new THREE.PlaneGeometry(size * 1.1, size * 1.1), new THREE.MeshStandardMaterial({ map: arucoTexture(), roughness: 0.8 }), [0, 0.065, 0], false)
  mk.rotation.x = -Math.PI / 2
  g.add(mk)
  return { group: g, ringMat }
}

export type CamMode = 'chase' | 'top' | 'free'

/**
 * Kamera kipleri. Serbest: OrbitControls ile döndür/yakınlaştır, hedef drone'u izler (kamera aynı kadar kayar).
 * Takip: drone'un arkasından, burun yönüne bakar. Üstten: kuşbakışı. Kullanıcı sürüklemeye başlarsa serbest kipe geçer.
 */
export class CamRig {
  mode: CamMode = 'free'
  private last = new THREE.Vector3()
  private has = false
  onUser: (() => void) | null = null
  constructor(public s: P3Stage, public dist: number, public height: number) {
    s.controls.addEventListener('start', () => { if (this.mode !== 'free') { this.mode = 'free'; this.onUser?.() } })
  }
  setMode(m: CamMode) { this.mode = m; this.has = false }
  /** Serbest kipin başlangıç görünümü (hedefe göre kaydırma). */
  home(off: [number, number, number], target: THREE.Vector3) {
    this.s.view([target.x + off[0], target.y + off[1], target.z + off[2]], [target.x, target.y, target.z])
    this.last.copy(target); this.has = true
  }
  update(target: THREE.Vector3, heading: number, dt: number) {
    const c = this.s.camera, ctl = this.s.controls
    if (this.mode === 'free') {
      if (this.has) { const d = target.clone().sub(this.last); c.position.add(d); ctl.target.add(d) }
      this.last.copy(target); this.has = true
      return
    }
    const want = new THREE.Vector3()
    if (this.mode === 'chase') want.set(target.x - Math.sin(heading) * this.dist, target.y + this.height, target.z + Math.cos(heading) * this.dist)
    else want.set(target.x + 0.001, target.y + this.dist * 2.2, target.z + 0.001)
    const a = this.has ? Math.min(1, dt * 4) : 1
    c.position.lerp(want, a)
    ctl.target.lerp(target, a)
    this.last.copy(target); this.has = true
  }
}
