'use client'
// Proje sahnesi: 3B nokta bulutu kümeleme. Robot çerçevesi (x ileri, y sol, z yukarı) dünyaya X = x, Y = z, Z = −y olarak geçer.
// Noktalar tek bir THREE.Points; konum ve renk dizileri yerinde güncellenir (karede yeni geometri yok). Işın taramayı izler,
// zemin söner, PCA açıksa bulut ilk iki bileşenin düzlemine yassılır, kümeler renklenir; k-ortalamalar merkezleri küre olarak görünür.
import * as THREE from 'three'
import type { ProjectRun } from '@/lib/ml/projeler/core'
import { SENSOR_Z, type View } from '@/lib/ml/projeler/nokta-bulutu'
import type { MountScene } from '../stage3d'

const PALETTE = [0x4cc9f0, 0xf72585, 0xffd166, 0x06d6a0, 0xb388ff, 0xff8c42, 0x9ef01a, 0xf4a261].map((c) => new THREE.Color(c))
const NOISE = new THREE.Color(0xef4444)
const IDLE = new THREE.Color(0x8a94a6)
const FLOOR_DIM = new THREE.Color(0x2a3242)
const MAX_K = 8

export const mount: MountScene = (s, lang) => {
  void lang
  const reduce = typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  s.scene.background = new THREE.Color(0x0f1420)
  const fit = () => {
    // 16:10'da yakın, dar ekranda (≈ 4:3 ve dikey) geri çekil
    const far = s.camera.aspect < 1.2 ? 1.45 : s.camera.aspect < 1.5 ? 1.15 : 1
    s.view([-1.2 * far, 7.5 * far, 9.5 * far], [0.6, 0.4, 0])
  }
  fit()
  s.controls.autoRotate = !reduce
  s.controls.autoRotateSpeed = 0.5
  s.controls.minDistance = 3
  s.controls.maxDistance = 30

  const extras: Array<{ dispose(): void }> = []
  const own = <T extends { dispose(): void }>(x: T) => { extras.push(x); return x }

  const grid = new THREE.GridHelper(16, 32, 0x334155, 0x1e2636)
  grid.position.y = -0.01
  s.scene.add(grid)
  extras.push(grid.geometry, grid.material as THREE.Material)

  // robot ve döner LiDAR
  const robot = new THREE.Group()
  const body = new THREE.Mesh(own(new THREE.CylinderGeometry(0.28, 0.32, 0.3, 32)), own(new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.5 })))
  body.position.y = 0.15
  const lidar = new THREE.Mesh(own(new THREE.CylinderGeometry(0.1, 0.1, 0.12, 24)), own(new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.3 })))
  lidar.position.y = SENSOR_Z
  const mast = new THREE.Mesh(own(new THREE.CylinderGeometry(0.03, 0.03, SENSOR_Z - 0.3, 8)), own(new THREE.MeshStandardMaterial({ color: 0x64748b })))
  mast.position.y = 0.3 + (SENSOR_Z - 0.3) / 2
  robot.add(body, mast, lidar)
  s.scene.add(robot)
  const beamGeo = own(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(7, 0, 0)]))
  const beamMat = own(new THREE.LineBasicMaterial({ color: 0xff4d6d, transparent: true, opacity: 0.9 }))
  const beam = new THREE.Line(beamGeo, beamMat)
  beam.position.y = SENSOR_Z
  s.scene.add(beam)

  // noktalar
  const ptsMat = own(new THREE.PointsMaterial({ size: 0.075, vertexColors: true, sizeAttenuation: true }))
  let geo: THREE.BufferGeometry | null = null
  let points: THREE.Points | null = null
  let base: Float32Array = new Float32Array(0) // yüksekliğe göre taban renk

  // k-ortalamalar merkezleri ve küme kutuları
  const cenGeo = own(new THREE.SphereGeometry(0.13, 16, 12))
  const cens = Array.from({ length: MAX_K }, (_, j) => {
    const m = new THREE.Mesh(cenGeo, own(new THREE.MeshStandardMaterial({ color: PALETTE[j], emissive: PALETTE[j], emissiveIntensity: 0.5 })))
    m.visible = false
    s.scene.add(m)
    return m
  })
  const boxes = Array.from({ length: MAX_K }, (_, j) => {
    const h = new THREE.Box3Helper(new THREE.Box3(), PALETTE[j])
    h.visible = false
    s.scene.add(h)
    extras.push(h.geometry, h.material as THREE.Material)
    return h
  })
  // PCA eksenleri
  const arrows = [0xffd166, 0x4cc9f0].map((c) => { const a = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 1, c, 0.3, 0.16); a.visible = false; s.scene.add(a); return a })

  const tmp = new THREE.Color()
  let lastRun: unknown = null, colorKey = '', posKey = -1, boxVersion = -1, spin = 0
  const toWorld = (x: number, y: number, z: number, out: Float32Array, o: number) => { out[o] = x; out[o + 1] = z; out[o + 2] = -y }

  const rebuild = (v: View) => {
    if (points) { s.scene.remove(points); geo?.dispose() }
    const n = v.cloud.n
    geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3).setUsage(THREE.DynamicDrawUsage))
    geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(n * 3), 3).setUsage(THREE.DynamicDrawUsage))
    points = new THREE.Points(geo, ptsMat)
    points.frustumCulled = false
    s.scene.add(points)
    base = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      const z = v.cloud.pos[i * 3 + 2]
      tmp.setHSL(0.62 - Math.min(1, Math.max(0, z / 2)) * 0.55, 0.85, 0.6)
      base[i * 3] = tmp.r; base[i * 3 + 1] = tmp.g; base[i * 3 + 2] = tmp.b
    }
    colorKey = ''; posKey = -1; boxVersion = -1
    for (const b of boxes) b.visible = false
    // PCA eksenleri: ortalamadan iki temel yön, boy √özdeğer ile orantılı
    const p = v.pca
    arrows.forEach((a, k) => {
      if (!p) { a.visible = false; return }
      const d = new THREE.Vector3(p.vecs[k][0], p.vecs[k][2], -p.vecs[k][1]).normalize()
      a.position.set(p.mu[0], p.mu[2] + 0.05, -p.mu[1])
      a.setDirection(d)
      a.setLength(2 * Math.sqrt(p.vals[k]) + 0.4, 0.3, 0.16)
    })
  }

  return {
    frame(run0, dt) {
      const run = run0 as ProjectRun<View>
      const v = run.view
      if (run !== lastRun) { lastRun = run; rebuild(v) }
      if (!geo) return
      const n = v.cloud.n
      geo.setDrawRange(0, v.revealed)

      // konum: ham → PCA düzlemi
      if (posKey !== v.flat) {
        posKey = v.flat
        const P = geo.getAttribute('position') as THREE.BufferAttribute
        const arr = P.array as Float32Array, a = v.cloud.pos, b = v.flatPos, t = v.flat
        for (let i = 0; i < n; i++) {
          const o = i * 3
          toWorld(a[o] + (b[o] - a[o]) * t, a[o + 1] + (b[o + 1] - a[o + 1]) * t, a[o + 2] + (b[o + 2] - a[o + 2]) * t, arr, o)
        }
        P.needsUpdate = true
      }

      // renk: taramada yüksekliğe göre; zemin söner; kümelemede küme rengi, gürültü kırmızı
      const clustering = v.phase === 'cluster' || v.phase === 'done'
      const key = `${v.version}|${v.floorFade}|${v.phase}`
      if (key !== colorKey) {
        colorKey = key
        const C = geo.getAttribute('color') as THREE.BufferAttribute
        const arr = C.array as Float32Array
        for (let i = 0; i < n; i++) {
          const o = i * 3, floor = v.cloud.pos[o + 2] <= 0.08, lb = v.label[i]
          if (floor) {
            const f = v.floorFade
            arr[o] = base[o] + (FLOOR_DIM.r - base[o]) * f; arr[o + 1] = base[o + 1] + (FLOOR_DIM.g - base[o + 1]) * f; arr[o + 2] = base[o + 2] + (FLOOR_DIM.b - base[o + 2]) * f
            continue
          }
          const c = !clustering ? null : lb >= 0 ? PALETTE[lb % PALETTE.length] : v.phase === 'done' ? NOISE : IDLE
          if (c) { arr[o] = c.r; arr[o + 1] = c.g; arr[o + 2] = c.b } else { arr[o] = base[o]; arr[o + 1] = base[o + 1]; arr[o + 2] = base[o + 2] }
        }
        C.needsUpdate = true
      }

      // merkezler
      const cen = v.centroids
      cens.forEach((m, j) => {
        const on = !!cen && j * 3 < cen.length
        m.visible = on
        if (on) m.position.set(cen![j * 3], cen![j * 3 + 2], -cen![j * 3 + 1])
      })

      // küme kutuları: yalnız sonda, bir kez
      if (v.phase === 'done' && boxVersion !== v.version) {
        boxVersion = v.version
        const P = geo.getAttribute('position') as THREE.BufferAttribute
        const arr = P.array as Float32Array
        boxes.forEach((b) => { b.box.makeEmpty() })
        const pt = new THREE.Vector3()
        for (let i = 0; i < n; i++) { const lb = v.label[i]; if (lb >= 0 && lb < MAX_K) boxes[lb].box.expandByPoint(pt.set(arr[i * 3], arr[i * 3 + 1], arr[i * 3 + 2])) }
        boxes.forEach((b) => { b.visible = !b.box.isEmpty(); if (b.visible) b.box.expandByScalar(0.06) })
      } else if (v.phase !== 'done' && boxes[0].visible) for (const b of boxes) b.visible = false

      // PCA okları: düzleşme başlayınca görünür
      for (const a of arrows) a.visible = !!v.pca && (v.phase === 'pca' || clustering)

      // ışın: taramada noktaları izler, sonra yavaşça döner (hareket azaltma tercihinde durur)
      if (v.phase === 'scan') spin = v.beam
      else if (!reduce) spin += dt * 1.2
      beam.rotation.y = spin
      beamMat.opacity = v.phase === 'scan' ? 0.9 : 0.35
      lidar.rotation.y = spin
      if (v.revealed === 0) fit()
    },
    dispose() {
      if (points) s.scene.remove(points)
      geo?.dispose()
      for (const a of arrows) a.dispose()
      for (const x of extras) x.dispose()
      s.controls.autoRotate = false
    },
  }
}
