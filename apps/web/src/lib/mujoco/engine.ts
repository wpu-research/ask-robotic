'use client'
// MuJoCo motor katmanı: WASM yükleme, model paketi açma, geom'lardan three.js ağı kurma
// ve her karede gövde duruşlarını aktarma. React'ten bağımsızdır; hem MuRoKo laboratuvarı
// hem de devre laboratuvarındaki robot görüntüsü aynı kodu kullanır.
//
// MuJoCo (Google DeepMind, Apache 2.0) resmi WebAssembly sürümü tarayıcıda çalışır;
// fizik burada, görüntü three.js'te. MuJoCo koordinatı Z-yukarı; sahne grubu -90°
// döndürülerek three.js'in Y-yukarısına oturur.
import * as THREE from 'three'
import { removeFromFs, unpack, writeToFs } from '@/lib/mujoco/pack'
import type { Channel } from '@/lib/mujoco/sensors'
import { buildElectronicsModel } from './electronics-models'
import { buildGearmotorModel, buildWheelModel } from './mechanical-models'

/* eslint-disable @typescript-eslint/no-explicit-any */
type Mj = any

let mjPromise: Promise<Mj> | null = null
/** WASM modülü sayfa başına bir kez yüklenir (8 MB; ilk açılışta indirilir, sonra önbellekten gelir). */
export function loadMujoco(): Promise<Mj> {
  mjPromise ??= (async () => {
    const url = '/mujoco/mujoco.js'
    const mod = await import(/* webpackIgnore: true */ /* turbopackIgnore: true */ url)
    return mod.default({ locateFile: (p: string) => `/mujoco/${p}` })
  })().catch((e) => { mjPromise = null; throw e })
  return mjPromise
}

const OBJ_ACTUATOR = 19
const OBJ_SENSOR = 20
const OBJ_KEY = 24

const packs = new Map<string, Promise<void>>()
/** Gerçek robot modeli paketi (gzip, tek dosya) bir kez indirilir ve sanal dosya sistemine açılır. */
export function ensurePack(mj: Mj, id: string): Promise<void> {
  // Başka robotun paketi sanal dosya sisteminde yer tutmasın: yüklü model derlenmiştir, dosyalar artık gerekmez.
  for (const other of [...packs.keys()]) {
    if (other !== id) { removeFromFs(mj.FS, `/models/${other}`); packs.delete(other) }
  }
  let p = packs.get(id)
  if (!p) {
    p = (async () => {
      const res = await fetch(`/mujoco/models/${id}.pack.gz`)
      if (!res.ok || !res.body) throw new Error(`Model paketi indirilemedi (${res.status})`)
      const buf = new Uint8Array(await new Response(res.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer())
      writeToFs(mj.FS, `/models/${id}`, unpack(buf))
    })().catch((e) => { packs.delete(id); throw e })
    packs.set(id, p)
  }
  return p
}

export interface Sim {
  mj: Mj; model: any; data: any
  meshes: THREE.Mesh[]
  ctrl: { name: string; lo: number; hi: number }[]
  channels: Channel[]
  timestep: number
  /** Başlangıç anahtar karesi: `muroko` adlıysa o, yoksa ilki (yoksa -1). */
  keyId: number
}

/** Arayüz koyu temada mı (Macademia teması `data-theme` ile seçilir). */
function isDark(): boolean {
  const t = document.documentElement.dataset.theme
  if (t === 'dark') return true
  if (t === 'light') return false
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

function floorTexture() {
  // Macademia zemini: sıcak krem kareler, açık kahve çizgi
  const dark = isDark()
  const c = document.createElement('canvas'); c.width = c.height = 128
  const g = c.getContext('2d')!
  g.fillStyle = dark ? '#2e2018' : '#f3e9db'; g.fillRect(0, 0, 128, 128)
  g.fillStyle = dark ? '#3a2a20' : '#eaddc9'; g.fillRect(0, 0, 64, 64); g.fillRect(64, 64, 64, 64)
  g.strokeStyle = dark ? 'rgba(224,170,118,.22)' : 'rgba(122,68,38,.18)'; g.lineWidth = 2; g.strokeRect(1, 1, 126, 126)
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(12, 12); t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}

/** Gökyüzü: üstte açık mavi, ufukta koyu lacivert (MuJoCo'nun varsayılan gökyüzü). */
export function skyTexture() {
  const c = document.createElement('canvas'); c.width = 2; c.height = 256
  const g = c.getContext('2d')!
  const gr = g.createLinearGradient(0, 0, 0, 256)
  gr.addColorStop(0, '#6f93c8'); gr.addColorStop(0.55, '#2c4a7c'); gr.addColorStop(1, '#14213a')
  g.fillStyle = gr; g.fillRect(0, 0, 2, 256)
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace
  return t
}

/**
 * Tema değişince gökyüzünü ve zemini yeniden üretir: kullanıcı açık/koyu arasında
 * geçtiğinde 3B sahne de Macademia'nın o temadaki renklerine döner.
 * Eski dokular serbest bırakılır.
 */
export function applyTheme(scene: THREE.Scene, group: THREE.Group): void {
  const old = scene.background
  scene.background = skyTexture()
  if (old && (old as THREE.Texture).isTexture) (old as THREE.Texture).dispose()
  for (const o of group.children) {
    const m = o as THREE.Mesh
    const mat = m.material as THREE.MeshStandardMaterial | undefined
    if (!mat?.map) continue // yalnız zemin dokuludur
    mat.map.dispose()
    mat.map = floorTexture()
    mat.needsUpdate = true
  }
}

/** Mesh geometrisi: modelin kendi köşe/yüz dizilerinden (geom çerçevesinde), mesh başına bir kez. */
function meshGeometry(model: any, id: number): THREE.BufferGeometry {
  const va = model.mesh_vertadr[id], vn = model.mesh_vertnum[id], fa = model.mesh_faceadr[id], fn = model.mesh_facenum[id]
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(Float32Array.from(model.mesh_vert.subarray(3 * va, 3 * (va + vn))), 3))
  g.setIndex(new THREE.BufferAttribute(Uint32Array.from(model.mesh_face.subarray(3 * fa, 3 * (fa + fn))), 1))
  g.computeVertexNormals()
  return g
}

export function buildMeshes(mj: Mj, model: any, group: THREE.Group): THREE.Mesh[] {
  const types = mj.mjtGeom, T = (k: string) => types[k].value
  const out: THREE.Mesh[] = []
  const meshCache = new Map<number, THREE.BufferGeometry>()
  for (let i = 0; i < model.ngeom; i++) {
    // Çarpışma geometrileri (grup 3 ve üstü) çizilmez: MuJoCo görüntüleyicisi de varsayılan olarak gizler
    if (model.geom_group[i] >= 3) { out.push(new THREE.Mesh()); continue }
    const type = model.geom_type[i]
    const s = [model.geom_size[3 * i], model.geom_size[3 * i + 1], model.geom_size[3 * i + 2]]
    let rgba = [0, 1, 2, 3].map((k) => model.geom_rgba[4 * i + k])
    // Malzemeli geom: geom rengi varsayılan gri (0,5 0,5 0,5 1) ise malzemenin rengi kullanılır
    const mi = model.geom_matid[i]
    if (mi >= 0 && Math.abs(rgba[0] - 0.5) < 1e-6 && Math.abs(rgba[1] - 0.5) < 1e-6 && Math.abs(rgba[2] - 0.5) < 1e-6 && rgba[3] === 1) rgba = [0, 1, 2, 3].map((k) => model.mat_rgba[4 * mi + k])
    let geo: THREE.BufferGeometry | null = null
    let scale: [number, number, number] | null = null
    if (type === T('mjGEOM_PLANE')) geo = new THREE.PlaneGeometry(24, 24)
    else if (type === T('mjGEOM_SPHERE')) geo = new THREE.SphereGeometry(s[0], 28, 16)
    else if (type === T('mjGEOM_CAPSULE')) geo = new THREE.CapsuleGeometry(s[0], 2 * s[1], 8, 20).rotateX(Math.PI / 2)
    else if (type === T('mjGEOM_CYLINDER')) geo = new THREE.CylinderGeometry(s[0], s[0], 2 * s[1], 28).rotateX(Math.PI / 2)
    else if (type === T('mjGEOM_BOX')) geo = new THREE.BoxGeometry(2 * s[0], 2 * s[1], 2 * s[2])
    else if (type === T('mjGEOM_ELLIPSOID')) { geo = new THREE.SphereGeometry(1, 28, 16); scale = [s[0], s[1], s[2]] }
    else if (type === T('mjGEOM_MESH')) {
      const id = model.geom_dataid[i]
      if (id >= 0) { let g = meshCache.get(id); if (!g) { g = meshGeometry(model, id); meshCache.set(id, g) } geo = g }
    }
    if (!geo) { out.push(new THREE.Mesh()); continue } // yükseklik alanı vb. çizilmez
    const isPlane = type === T('mjGEOM_PLANE')
    // Malzeme verilmişse parlaklık ve yansıma ondan okunur (metalik/saydam görünüm)
    let rough = 0.5
    let metal = type === T('mjGEOM_MESH') ? 0.15 : 0.05
    if (mi >= 0) {
      const shine = model.mat_shininess?.[mi]
      const refl = model.mat_reflectance?.[mi]
      if (typeof shine === 'number') rough = Math.max(0.05, 1 - shine)
      if (typeof refl === 'number') metal = Math.min(1, Math.max(metal, refl * 1.6))
    }
    const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(rgba[0], rgba[1], rgba[2]), roughness: rough, metalness: metal, transparent: rgba[3] < 1, opacity: rgba[3] })
    if (isPlane) { mat.map = floorTexture(); mat.color.set(0xffffff) }
    const mesh = new THREE.Mesh(geo, mat)
    const name = mj.mj_id2name(model, 5, i) || ''
    const boardType = name.endsWith('_uno_board') ? 'uno' : name.endsWith('_esp32_board') ? 'esp32' : null
    if (boardType) {
      mat.visible = false
      const board = buildElectronicsModel(boardType)
      board.position.z = -0.0032
      mesh.add(board)
    }
    if (/^(sol|sag)_teker_\d+_tire$/.test(name)) {
      mat.visible = false
      mesh.add(buildWheelModel(s[0], s[1]))
    }
    if (/^(mini|standard|strong)_motor_\d+$/i.test(name)) {
      mat.visible = false
      mesh.add(buildGearmotorModel(s as [number, number, number]))
    }
    if (scale) mesh.scale.set(...scale)
    mesh.castShadow = !isPlane; mesh.receiveShadow = true
    mesh.matrixAutoUpdate = true
    group.add(mesh); out.push(mesh)
  }
  return out
}

const rot = new THREE.Matrix4()
export function syncMeshes(sim: Sim) {
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

export { OBJ_ACTUATOR, OBJ_SENSOR, OBJ_KEY }
export type { Mj }
