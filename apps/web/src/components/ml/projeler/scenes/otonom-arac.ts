// Otonom araç sahnesi: çim zemin, dalgalı asfalt pist (kırmızı-beyaz bordürler, kesikli orta çizgi, damalı başlangıç), nüfusun
// araçları tek bir InstancedMesh (yoldakiler mavi ve yarı saydam, elenenler gri), en iyi araç turuncu ve opak; ondan çıkan beş
// sensör ışını ve izi. Mantık düzlemi (x, z) doğrudan dünyadaki x ve z'dir; yön h için araç y ekseni etrafında −h döner.
import * as THREE from 'three'
import type { ProjectRun } from '@/lib/ml/projeler/core'
import { RAYS, type Track, type View } from '@/lib/ml/projeler/otonom-arac'
import type { MountScene } from '../stage3d'

const MAX_CARS = 40
const TRAIL = 600
const ALIVE = new THREE.Color(0x3b82f6), DEAD = new THREE.Color(0x9ca3af)

/** Orta çizgiden ±genişlikte şerit (y yüksekliğinde); renk verilirse köşe renkleri. */
function ribbon(T: Track, inner: number, outer: number, y: number, color?: (k: number) => THREE.Color, every = 1): THREE.BufferGeometry {
  const pos: number[] = [], col: number[] = [], index: number[] = []
  const n = T.n, c = T.center
  const P = (k: number) => [c[2 * (k % n)], c[2 * (k % n) + 1]]
  for (let k = 0; k <= n; k++) {
    const [ax, az] = P(k + n - 1), [bx, bz] = P(k + 1), [x, z] = P(k)
    const tx = bx - ax, tz = bz - az, L = Math.hypot(tx, tz) || 1
    const nx = -tz / L, nz = tx / L
    pos.push(x + nx * inner, y, z + nz * inner, x + nx * outer, y, z + nz * outer)
    if (color) { const q = color(k); col.push(q.r, q.g, q.b, q.r, q.g, q.b) }
    if (k < n && k % every === 0) { const i = 2 * k; index.push(i, i + 2, i + 1, i + 1, i + 2, i + 3) }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  if (color) g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3))
  g.setIndex(index)
  g.computeVertexNormals()
  return g
}

function carModel(): THREE.Group {
  const g = new THREE.Group()
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.16, 0.3), new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.45 }))
  body.position.y = 0.13; body.castShadow = true
  const cab = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.12, 0.24), new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 }))
  cab.position.set(-0.04, 0.27, 0); cab.castShadow = true
  g.add(body, cab)
  const wg = new THREE.CylinderGeometry(0.07, 0.07, 0.06, 12), wm = new THREE.MeshStandardMaterial({ color: 0x111827 })
  for (const [x, z] of [[0.18, 0.16], [0.18, -0.16], [-0.18, 0.16], [-0.18, -0.16]]) {
    const w = new THREE.Mesh(wg, wm); w.rotation.x = Math.PI / 2; w.position.set(x, 0.07, z); g.add(w)
  }
  // ön: sensör kutusu
  const s = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.12), new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x166534 }))
  s.position.set(0.29, 0.2, 0); g.add(s)
  return g
}

export const mount: MountScene = (s) => {
  s.scene.background = new THREE.Color(0xcfe3f1)
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 44), new THREE.MeshStandardMaterial({ color: 0x7fb36a, roughness: 1 }))
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true
  s.scene.add(ground)

  const trackGroup = new THREE.Group()
  s.scene.add(trackGroup)
  let built: Track | null = null
  const buildTrack = (T: Track) => {
    built = T
    const w = T.halfW
    const road = new THREE.Mesh(ribbon(T, -w, w, 0.01), new THREE.MeshStandardMaterial({ color: 0x3f4652, roughness: 0.9, side: THREE.DoubleSide }))
    road.receiveShadow = true
    const red = new THREE.Color(0xdc2626), white = new THREE.Color(0xf8fafc)
    const kc = (k: number) => (Math.floor(k / 3) % 2 ? red : white)
    const km = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.7, side: THREE.DoubleSide })
    const k1 = new THREE.Mesh(ribbon(T, w, w + 0.12, 0.02, kc), km), k2 = new THREE.Mesh(ribbon(T, -w - 0.12, -w, 0.02, kc), km)
    const dash = new THREE.Mesh(ribbon(T, -0.03, 0.03, 0.015, undefined, 1), new THREE.MeshBasicMaterial({ color: 0xe5e7eb, side: THREE.DoubleSide }))
    // kesikli çizgi: dört parçadan ikisini çiz
    const di = dash.geometry.getIndex()!.array as ArrayLike<number>, keep: number[] = []
    for (let i = 0; i < di.length; i += 6) if ((i / 6) % 4 < 2) for (let j = 0; j < 6; j++) keep.push(di[i + j])
    dash.geometry.setIndex(keep)
    // damalı başlangıç çizgisi
    const c = T.center, h = Math.atan2(c[3] - c[1], c[2] - c[0])
    const cv = document.createElement('canvas'); cv.width = 8; cv.height = 64
    const cx = cv.getContext('2d')!
    for (let j = 0; j < 8; j++) for (let i = 0; i < 2; i++) { cx.fillStyle = (i + j) % 2 ? '#111' : '#fff'; cx.fillRect(i * 4, j * 8, 4, 8) }
    const tex = new THREE.CanvasTexture(cv); tex.magFilter = THREE.NearestFilter
    const start = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 2 * w), new THREE.MeshBasicMaterial({ map: tex }))
    start.rotation.order = 'YXZ'; start.rotation.set(-Math.PI / 2, -h, 0)
    start.position.set(c[0], 0.025, c[1])
    trackGroup.add(road, k1, k2, dash, start)
  }

  // nüfus: tek InstancedMesh
  const popMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.55, roughness: 0.5 })
  const pop = new THREE.InstancedMesh(new THREE.BoxGeometry(0.5, 0.2, 0.26), popMat, MAX_CARS)
  pop.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
  for (let i = 0; i < MAX_CARS; i++) pop.setColorAt(i, ALIVE)
  pop.count = 0
  s.scene.add(pop)
  const best = carModel()
  s.scene.add(best)

  // sensör ışınları
  const rayPos = new Float32Array(RAYS.length * 6), rayCol = new Float32Array(RAYS.length * 6)
  const rayGeo = new THREE.BufferGeometry()
  rayGeo.setAttribute('position', new THREE.BufferAttribute(rayPos, 3))
  rayGeo.setAttribute('color', new THREE.BufferAttribute(rayCol, 3))
  const rays = new THREE.LineSegments(rayGeo, new THREE.LineBasicMaterial({ vertexColors: true }))
  rays.frustumCulled = false
  s.scene.add(rays)
  const dots = new THREE.InstancedMesh(new THREE.SphereGeometry(0.05, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }), RAYS.length)
  dots.frustumCulled = false
  s.scene.add(dots)

  // en iyi aracın izi
  const trailPos = new Float32Array(TRAIL * 3)
  const trailGeo = new THREE.BufferGeometry()
  trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPos, 3))
  trailGeo.setDrawRange(0, 0)
  const trail = new THREE.Line(trailGeo, new THREE.LineBasicMaterial({ color: 0xfb923c }))
  trail.frustumCulled = false
  s.scene.add(trail)
  let trailN = 0, trailGen = -1, trailCar = -1

  // kamera: pistin tamamı hem 16:10 hem 4:3'te görünsün (yatay görüş açısına göre uzaklık)
  const frameCamera = () => {
    const vf = (s.camera.fov * Math.PI) / 180, hf = 2 * Math.atan(Math.tan(vf / 2) * s.camera.aspect)
    const elev = (52 * Math.PI) / 180
    const d = Math.max(12.2 / Math.tan(hf / 2), (7.5 * Math.sin(elev)) / Math.tan(vf / 2)) * 1.45
    s.view([0, Math.sin(elev) * d, -1 + Math.cos(elev) * d], [0, 0, -1])
  }
  frameCamera()
  let framedAspect = s.camera.aspect

  const ZERO = new THREE.Vector3(0, 0, 0)
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), pv = new THREE.Vector3(), one = new THREE.Vector3(1, 1, 1)
  const near = new THREE.Color(0xef4444), far = new THREE.Color(0x22c55e), tmp = new THREE.Color()
  let lastRun: unknown = null

  return {
    frame(r) {
      const run = r as ProjectRun<View>, v = run.view
      if (v.track !== built) buildTrack(v.track)
      // kullanıcı döndürmediyse en-boy oranı değişince yeniden çerçevele
      if (Math.abs(s.camera.aspect - framedAspect) > 0.15) { frameCamera(); framedAspect = s.camera.aspect }
      if (run !== lastRun) { lastRun = run; trailN = 0; trailGen = -1 }
      const cars = v.cars
      pop.count = Math.min(MAX_CARS, cars.length)
      for (let i = 0; i < pop.count; i++) {
        const c = cars[i]
        q.setFromAxisAngle(up, -c.h)
        // en iyi aracın kopyası görünmesin
        m4.compose(pv.set(c.x, 0.11, c.z), q, i === v.best ? ZERO : one)
        pop.setMatrixAt(i, m4)
        pop.setColorAt(i, c.alive ? ALIVE : DEAD)
      }
      pop.instanceMatrix.needsUpdate = true
      if (pop.instanceColor) pop.instanceColor.needsUpdate = true

      const b = cars[v.best]
      best.position.set(b.x, 0, b.z)
      best.rotation.y = -b.h
      // ışınlar
      for (let i = 0; i < RAYS.length; i++) {
        const a = b.h + RAYS[i], d = b.rays[i]
        const sx = b.x + Math.cos(b.h) * 0.29, sz = b.z + Math.sin(b.h) * 0.29
        const ex = b.x + Math.cos(a) * d, ez = b.z + Math.sin(a) * d
        rayPos.set([sx, 0.2, sz, ex, 0.06, ez], i * 6)
        tmp.copy(near).lerp(far, Math.min(1, d / 3))
        rayCol.set([tmp.r, tmp.g, tmp.b, tmp.r, tmp.g, tmp.b], i * 6)
        m4.makeTranslation(ex, 0.06, ez); dots.setMatrixAt(i, m4)
      }
      rayGeo.attributes.position.needsUpdate = true
      rayGeo.attributes.color.needsUpdate = true
      dots.instanceMatrix.needsUpdate = true
      rays.visible = dots.visible = b.alive
      // iz: nesil ya da en iyi araç değişince sıfırlanır
      if (v.gen !== trailGen || v.best !== trailCar) { trailGen = v.gen; trailCar = v.best; trailN = 0 }
      if (b.alive) {
        const last = trailN ? [trailPos[(trailN - 1) * 3], trailPos[(trailN - 1) * 3 + 2]] : null
        if (!last || Math.hypot(last[0] - b.x, last[1] - b.z) > 0.08) {
          if (trailN >= TRAIL) { trailPos.copyWithin(0, 3); trailN = TRAIL - 1 }
          trailPos.set([b.x, 0.03, b.z], trailN * 3); trailN++
          trailGeo.setDrawRange(0, trailN)
          trailGeo.attributes.position.needsUpdate = true
        }
      }
    },
  }
}
