'use client'
// Robotunu Tasarla: tasarımdan 3B robot modeli. Arenada (MobileModel olarak) ve tasarım tezgâhında aynı model kullanılır.
// Düzlem (ileri x, sola y) → dünya (X = x, Z = -y), Y yukarı. `origin: 'drive'` modeli dönüş merkezine, 'chassis' şasi merkezine oturtur.
import * as THREE from 'three'
import { mesh, std } from './core'
import { makeCard, type MobileModel } from './models'
import { CHASSIS, PARTS, PITCH, cardCells, cellXY, deriveDesign, type RobotDesign } from '@/lib/mikro/tasarim'

export interface DesignModel extends MobileModel {
  /** Sensör görüş konileri (tezgâhta görünür, arenada gizli). */
  cones: THREE.Object3D[]
  /** Parça kimliği → nesne (seçili parçayı vurgulamak için). */
  byId: Map<string, THREE.Object3D>
  /** Şasi üst yüzeyinin yüksekliği (m). */
  plateTop: number
}

function wheelMesh(r: number, w: number, color: string, omni = false): THREE.Group {
  const g = new THREE.Group()
  const tire = mesh(new THREE.CylinderGeometry(r, r, w, 28), std(color, { roughness: 0.9 }))
  tire.rotation.x = Math.PI / 2
  const hub = mesh(new THREE.CylinderGeometry(r * 0.45, r * 0.45, w * 1.05, 6), std(0xe5e7eb))
  hub.rotation.x = Math.PI / 2
  const spoke = mesh(new THREE.BoxGeometry(r * 1.5, r * 0.18, w * 1.1), std(0x94a3b8))
  g.add(tire, hub, spoke)
  if (omni) for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    const roller = mesh(new THREE.CylinderGeometry(r * 0.12, r * 0.12, w * 0.9, 8), std(0xc4b5fd))
    roller.position.set(Math.cos(a) * r, Math.sin(a) * r, 0)
    roller.rotation.z = a
    g.add(roller)
  }
  return g
}

function trackMesh(len: number, r: number, w: number): THREE.Group {
  const g = new THREE.Group()
  const mat = std(0x0f172a, { roughness: 0.95 })
  g.add(mesh(new THREE.BoxGeometry(len, r * 2, w), mat))
  for (const s of [-1, 1]) {
    const end = mesh(new THREE.CylinderGeometry(r, r, w, 20), mat, [s * len / 2, 0, 0])
    end.rotation.x = Math.PI / 2
    g.add(end)
  }
  // dişli: dönüş belli olsun
  const spoke = mesh(new THREE.BoxGeometry(r * 1.4, r * 0.2, w * 1.1), std(0x64748b))
  g.add(spoke)
  return g
}

/** FOV konisi: tepe sensörde, `dir` yönünde `len` boyunda, yarım açısı `fovDeg/2`. */
function cone(len: number, fovDeg: number, color: number): THREE.Mesh {
  const rad = Math.tan(((Math.max(4, fovDeg) / 2) * Math.PI) / 180) * len
  const geo = new THREE.ConeGeometry(rad, len, 24, 1, true)
  geo.translate(0, -len / 2, 0) // tepe orijinde
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.18, side: THREE.DoubleSide, depthWrite: false }))
  m.renderOrder = 2
  return m
}

export function makeDesignModel(d: RobotDesign, o: { origin?: 'drive' | 'chassis'; cones?: boolean } = {}): DesignModel {
  const ch = CHASSIS[d.chassis]
  const dd = deriveDesign(d)
  const group = new THREE.Group()
  const root = new THREE.Group()
  group.add(root)
  root.position.x = o.origin === 'chassis' ? 0 : -dd.originX
  const wr = (dd.wheel?.wheel?.d ?? 0.043) / 2
  const plateY = wr + 0.004
  const plateT = 0.006
  const plateTop = plateY + plateT / 2
  const L = ch.cols * PITCH, W = ch.rows * PITCH
  root.add(mesh(new THREE.BoxGeometry(L, plateT, W), std(0xfacc15), [0, plateY, 0]))
  // ızgara çıkıntıları (yapı parçası görünümü)
  const studGeo = new THREE.CylinderGeometry(0.0035, 0.0035, 0.003, 10)
  const studMat = std(0xfde047)
  for (let c = 0; c < ch.cols; c++) for (let r = 0; r < ch.rows; r++) {
    if (cardCells(ch).some(([a, b]) => a === c && b === r) || d.parts.some((p) => p.c === c && p.r === r)) continue
    const [x, y] = cellXY(ch, c, r)
    root.add(mesh(studGeo, studMat, [x, plateTop + 0.0015, -y]))
  }
  const cc = cardCells(ch).map(([c, r]) => cellXY(ch, c, r))
  const card = makeCard(PITCH * 2 * 0.95)
  card.group.position.set(cc.reduce((s, q) => s + q[0], 0) / 4, plateTop, -cc.reduce((s, q) => s + q[1], 0) / 4)
  root.add(card.group)
  const statusMat = std(0x475569, { emissive: new THREE.Color(0x000000), emissiveIntensity: 1.5 })
  root.add(mesh(new THREE.SphereGeometry(0.005, 16, 12), statusMat, [card.group.position.x - PITCH * 1.1, plateTop + 0.006, card.group.position.z]))

  const byId = new Map<string, THREE.Object3D>()
  const cones: THREE.Object3D[] = []
  let wheelL: THREE.Group | null = null, wheelR: THREE.Group | null = null
  let bumper: THREE.Mesh | undefined
  let fingers: THREE.Mesh[] = []
  for (const p of d.parts) {
    const s = PARTS[p.type]
    const [x, y] = cellXY(ch, p.c, p.r)
    const g = new THREE.Group()
    g.position.set(x, plateTop, -y)
    g.rotation.y = ((p.rot ?? 0) * Math.PI) / 2
    const add = (m: THREE.Object3D) => { g.add(m); return m }
    if (s.wheel) {
      const side = p.r === 0 ? 1 : -1 // sol: dünyada -Z
      const wz = -(y + Math.sign(y) * (PITCH / 2 + s.wheel.w / 2))
      const wg = s.wheel.contact ? trackMesh(s.wheel.contact, s.wheel.d / 2, s.wheel.w) : wheelMesh(s.wheel.d / 2, s.wheel.w, s.color, p.type === 'omni')
      wg.position.set(x, s.wheel.d / 2, wz)
      root.add(wg)
      byId.set(p.id, wg)
      if (side === 1 && !wheelL) wheelL = wg
      if (side === -1 && !wheelR) wheelR = wg
      continue
    }
    switch (s.group) {
      case 'motor': {
        add(mesh(new THREE.BoxGeometry(PITCH * 0.9, s.h * 1.6, PITCH * 0.8), std(s.color), [0, s.h * 0.8, 0]))
        const shaft = add(mesh(new THREE.CylinderGeometry(0.002, 0.002, PITCH * 0.6, 8), std(0xe5e7eb), [0, s.h, (p.r === 0 || p.r === 1 ? -1 : 1) * PITCH * 0.5]))
        shaft.rotation.x = Math.PI / 2
        break
      }
      case 'pil':
        add(mesh(new THREE.BoxGeometry(PITCH * 0.95, s.h * 2, PITCH * 0.95), std(s.color), [0, s.h, 0]))
        add(mesh(new THREE.BoxGeometry(PITCH * 0.3, 0.002, PITCH * 0.3), std(0xe5e7eb), [PITCH * 0.25, s.h * 2 + 0.001, 0]))
        break
      case 'eyleyici': {
        const jaw = std(0x475569, { metalness: 0.4 })
        add(mesh(new THREE.BoxGeometry(0.01, 0.018, PITCH * 2), jaw, [PITCH * 0.5, 0.004, 0]))
        fingers = [-1, 1].map((k) => add(mesh(new THREE.BoxGeometry(0.045, 0.02, 0.005), jaw, [PITCH * 0.5 + 0.024, -0.004, k * 0.03])) as THREE.Mesh)
        break
      }
      case 'teker': // sarhoş teker
        add(mesh(new THREE.SphereGeometry(0.008, 16, 12), std(s.color, { metalness: 0.6 }), [0, -(plateTop - 0.008), 0]))
        add(mesh(new THREE.CylinderGeometry(0.006, 0.008, plateTop - 0.016, 12), std(0x64748b), [0, -(plateTop - 0.016) / 2, 0]))
        break
      case 'sensor': {
        const k = s.sensor!
        if (k.kind === 'distance') {
          if (p.type === 'ultrasonik') {
            add(mesh(new THREE.BoxGeometry(0.008, 0.016, PITCH * 0.95), std(0x1d4ed8), [0, 0.01, 0]))
            for (const q of [-1, 1]) { const m = add(mesh(new THREE.CylinderGeometry(0.0065, 0.0065, 0.01, 18), std(0xcbd5e1, { metalness: 0.7, roughness: 0.25 }), [0.008, 0.012, q * 0.005])); m.rotation.z = Math.PI / 2 }
          } else {
            add(mesh(new THREE.BoxGeometry(0.01, 0.012, PITCH * 0.8), std(0x111827), [0, 0.008, 0]))
            for (const q of [-1, 1]) { const m = add(mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.004, 12), std(0x7f1d1d, { emissive: new THREE.Color(0x450a0a) }), [0.006, 0.009, q * 0.004])); m.rotation.z = Math.PI / 2 }
          }
          if (o.cones) {
            const len = Math.min(k.rangeCm, 60) / 100
            const c = cone(len, k.fovDeg, p.type === 'ultrasonik' ? 0x2563eb : 0xef4444)
            c.rotation.z = Math.PI / 2 // -Y → +X
            c.position.set(0.008, 0.01, 0)
            add(c)
            cones.push(c)
          }
        } else if (k.down) {
          // zemine bakan sensör: şasinin altında; üstte renkli işaret
          add(mesh(new THREE.BoxGeometry(PITCH * 0.7, 0.003, PITCH * (p.type === 'cizgi' ? 0.95 : 0.7)), std(s.color), [0, 0.0015, 0]))
          add(mesh(new THREE.BoxGeometry(PITCH * 0.6, 0.006, PITCH * (p.type === 'cizgi' ? 0.9 : 0.6)), std(0x111827), [0, -(plateTop - plateY) - plateT - 0.003, 0]))
          if (o.cones) {
            const h = plateY - plateT / 2
            const spots = p.type === 'cizgi' ? [-0.0075, 0.0075] : [0]
            for (const z of spots) {
              const c = cone(h, k.fovDeg, p.type === 'cizgi' ? 0x16a34a : p.type === 'isik' ? 0xf59e0b : 0x0ea5e9)
              c.position.set(0, -plateT, z)
              add(c)
              cones.push(c)
            }
          }
        } else if (k.kind === 'force') {
          bumper = add(mesh(new THREE.BoxGeometry(0.008, 0.014, PITCH * 2.4), std(0x94a3b8), [PITCH * 0.5 + 0.004, -0.008, 0])) as THREE.Mesh
          add(mesh(new THREE.BoxGeometry(PITCH * 0.6, 0.008, PITCH * 0.5), std(0x334155), [0, 0.004, 0]))
        } else {
          // jiroskop
          add(mesh(new THREE.BoxGeometry(PITCH * 0.6, 0.006, PITCH * 0.6), std(s.color), [0, 0.003, 0]))
          const ring = add(mesh(new THREE.TorusGeometry(0.005, 0.0012, 8, 20), std(0xfecdd3), [0, 0.008, 0]))
          ring.rotation.x = Math.PI / 2
        }
        break
      }
    }
    root.add(g)
    byId.set(p.id, g)
  }
  const dummyL = wheelL ?? new THREE.Group(), dummyR = wheelR ?? new THREE.Group()
  return {
    group, wheelL: dummyL, wheelR: dummyR, card, bumper, cones, byId, plateTop,
    setLights(css) { statusMat.color.set(css ?? '#475569'); statusMat.emissive.set(css ?? '#000000') },
    setGrip: fingers.length ? (closed) => { fingers.forEach((f, i) => { f.position.z = (i ? 1 : -1) * (closed ? 0.024 : 0.032) }) } : undefined,
  }
}

/** Parça yerleştirme önizlemesi için hücre vurgusu. */
export function cellHighlight(): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.BoxGeometry(PITCH * 0.96, 0.003, PITCH * 0.96), new THREE.MeshBasicMaterial({ color: 0x22c55e, transparent: true, opacity: 0.55, depthWrite: false }))
  m.renderOrder = 3
  return m
}

