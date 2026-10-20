'use client'
// Robot Kolu dersi 3B sahnesi (three.js yalnız istemcide; sims.ts bu dosyayı dinamik import eder). Altyapı ML projeleri ve drone
// dersiyle aynı (createP3Stage: piksel oranı ≤ 1,5, gizliyken döngü durur, kaldırılınca her şey serbest bırakılır).
// Sahne durum hesaplamaz: sims.ts q (eklem açıları), tutucu açıklığı ve parça konumlarını verir; burada yalnız çizilir.
// Dünya çerçevesi Z yukarı (lib/robot-kolu ile aynı); kök grup üç.js'in Y-yukarı eksenine -90° X dönüşüyle oturur.
import * as THREE from 'three'
import { createP3Stage, webglOk, type P3Stage } from '@/components/ml/projeler/stage3d'
import { GRIPPER, PICK_A, PLACE_B, type Box } from '@/lib/robot-kolu/cell'
import { ARM, fk, type Joints, type V3 } from '@/lib/robot-kolu/kinematics'

export { webglOk }

const COLORS = { base: 0x334155, link: 0x0f766e, link2: 0x0d9488, wrist: 0xb7791f, grip: 0x1f2937, finger: 0xe2e8f0, table: 0xd9cdbd, item: 0xc43d36, wall: 0x64748b, zone: 0xef4444, a: 0x0f766e, b: 0xb7791f }

const mat = (color: number, o: THREE.MeshStandardMaterialParameters = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.1, ...o })
function box(w: number, d: number, h: number, m: THREE.Material, pos: V3 = [0, 0, 0]) {
  const o = new THREE.Mesh(new THREE.BoxGeometry(w, d, h), m)
  o.position.set(...pos)
  return o
}
/** Z ekseni boyunca uzanan silindir (z0'dan z1'e). */
function rod(r: number, z0: number, z1: number, m: THREE.Material) {
  const g = new THREE.CylinderGeometry(r, r, z1 - z0, 20)
  g.rotateX(Math.PI / 2)
  const o = new THREE.Mesh(g, m)
  o.position.z = (z0 + z1) / 2
  return o
}
/** Eklem silindiri: Y ekseni (eğilme) ya da Z ekseni (dönme) etrafında. */
function hub(r: number, len: number, axis: 'y' | 'z', m: THREE.Material) {
  const g = new THREE.CylinderGeometry(r, r, len, 24)
  if (axis === 'z') g.rotateX(Math.PI / 2) // silindirin ekseni Y'dir; Z ekseni için yatır
  return new THREE.Mesh(g, m)
}

function label(text: string, h = 0.12, color = '#ffffff', bg = 'rgba(15,23,42,0.86)') {
  const px = 44, pad = 14
  const c = document.createElement('canvas')
  const g0 = c.getContext('2d')!
  const font = `700 ${px}px Poppins, system-ui, sans-serif`
  g0.font = font
  c.width = Math.min(512, Math.ceil(g0.measureText(text).width) + pad * 2); c.height = px + pad
  const g = c.getContext('2d')!
  g.fillStyle = bg
  g.beginPath(); if (g.roundRect) g.roundRect(0, 0, c.width, c.height, c.height / 2); else g.rect(0, 0, c.width, c.height); g.fill()
  g.fillStyle = color; g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle'
  g.fillText(text, c.width / 2, c.height / 2 + 2, c.width - pad)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }))
  sp.scale.set((h * c.width) / c.height, h, 1)
  sp.renderOrder = 10
  return sp
}

export interface ArmView {
  stage: P3Stage
  setQ(q: Joints): void
  /** 0 kapalı, 1 açık. */
  setGrip(open: number): void
  setItems(items: ReadonlyArray<{ id: string; size: number; pos: V3 }>): void
  /** Tutulan parça TCP'yi izler (null: tutulan yok). */
  setHeld(id: string | null): void
  setObstacles(boxes: readonly Box[]): void
  setZones(boxes: readonly Box[]): void
  /** Anahtarlı çizgi (TCP izi vb.); null siler. */
  setTrace(key: string, pts: readonly V3[] | null, color?: number): void
  /** Hedef işareti (yaw derece); null gizler. */
  setTarget(p: V3 | null, yawDeg?: number): void
  setHuman(pos: [number, number] | null, state?: 'ok' | 'slow' | 'stop'): void
  /** Çalışma alanı halkası: z yükseklikte [min, max] yarıçap; null gizler. */
  setRing(z: number | null, min?: number, max?: number): void
  setLabels(on: boolean): void
  onFrame: ((dt: number) => void) | null
  dispose(): void
}

export function createArmView(host: HTMLElement): ArmView {
  const stage = createP3Stage(host, { background: 0xe8edf3 })
  const root = new THREE.Group()
  root.rotation.x = -Math.PI / 2 // dünya Z-yukarı → three Y-yukarı
  stage.scene.add(root)

  /* ---- masa, ızgara, A/B işaretleri ---- */
  const table = box(2, 2, 0.1, mat(COLORS.table, { roughness: 0.9 }), [0, 0, -0.05])
  root.add(table)
  const grid = new THREE.GridHelper(2, 20, 0xb8a994, 0xcdbfae)
  grid.rotation.x = Math.PI / 2; grid.position.z = 0.002
  root.add(grid)
  const marker = (p: V3, color: number, text: string) => {
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.07, 0.1, 40), new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.85 }))
    ring.position.set(p[0], p[1], 0.004)
    const sp = label(text, 0.1)
    sp.position.set(p[0], p[1], 0.14)
    root.add(ring, sp)
    return sp
  }
  const labels = [marker(PICK_A, COLORS.a, 'A'), marker(PLACE_B, COLORS.b, 'B')]

  /* ---- kol ---- */
  const mBase = mat(COLORS.base), mLink = mat(COLORS.link), mLink2 = mat(COLORS.link2), mWrist = mat(COLORS.wrist), mGrip = mat(COLORS.grip), mFinger = mat(COLORS.finger)
  const arm = new THREE.Group()
  root.add(arm)
  arm.add(rod(0.12, 0, 0.06, mBase))
  const g1 = new THREE.Group() // q1: Z
  arm.add(g1)
  g1.add(rod(0.07, 0.06, ARM.d1, mBase))
  const g2 = new THREE.Group() // q2: Y
  g2.position.z = ARM.d1
  g1.add(g2)
  const h2 = hub(0.075, 0.17, 'y', mLink); g2.add(h2)
  g2.add(rod(0.055, 0, ARM.a2, mLink))
  const g3 = new THREE.Group() // q3: Y
  g3.position.z = ARM.a2
  g2.add(g3)
  g3.add(hub(0.065, 0.15, 'y', mLink2))
  g3.add(rod(0.045, 0, ARM.a3, mLink2))
  const g4 = new THREE.Group() // q4: Z
  g4.position.z = ARM.a3
  g3.add(g4)
  g4.add(rod(0.04, -0.05, 0.05, mWrist))
  const g5 = new THREE.Group() // q5: Y
  g4.add(g5)
  g5.add(hub(0.045, 0.12, 'y', mWrist))
  const g6 = new THREE.Group() // q6: Z
  g5.add(g6)
  g6.add(rod(0.035, 0, ARM.d6, mGrip))
  // tutucu: gövde ve iki parmak (yerel X yönünde açılır); parmak uçları z = d6 + tool'da (TCP)
  const gripBody = box(0.1, 0.04, 0.03, mGrip, [0, 0, ARM.d6 + 0.015])
  g6.add(gripBody)
  const fingerLen = ARM.tool - 0.03
  const fL = box(0.012, 0.03, fingerLen, mFinger, [0, 0, ARM.d6 + 0.03 + fingerLen / 2])
  const fR = box(0.012, 0.03, fingerLen, mFinger, [0, 0, ARM.d6 + 0.03 + fingerLen / 2])
  g6.add(fL, fR)
  const tcpAxes = new THREE.AxesHelper(0.1)
  tcpAxes.position.z = ARM.d6 + ARM.tool
  g6.add(tcpAxes)
  const setGrip = (open: number) => {
    const half = (GRIPPER.maxOpening / 2) * Math.max(0, Math.min(1, open)) + 0.006
    fL.position.x = -half - 0.006; fR.position.x = half + 0.006
  }
  setGrip(1)

  /* ---- parçalar ---- */
  const itemMeshes = new Map<string, { mesh: THREE.Mesh; size: number }>()
  let held: string | null = null
  let lastQ: Joints | null = null
  const setItems: ArmView['setItems'] = (items) => {
    const ids = new Set(items.map((i) => i.id))
    for (const [id, e] of itemMeshes) if (!ids.has(id)) { e.mesh.removeFromParent(); e.mesh.geometry.dispose(); itemMeshes.delete(id) }
    for (const it of items) {
      let e = itemMeshes.get(it.id)
      if (!e || e.size !== it.size) {
        if (e) { e.mesh.removeFromParent(); e.mesh.geometry.dispose() }
        const m = new THREE.Mesh(new THREE.BoxGeometry(it.size, it.size, it.size), mat(COLORS.item, { roughness: 0.5 }))
        root.add(m)
        e = { mesh: m, size: it.size }; itemMeshes.set(it.id, e)
      }
      if (held !== it.id) e.mesh.position.set(...it.pos)
    }
    syncHeld()
  }
  function syncHeld() {
    if (held && lastQ) { const e = itemMeshes.get(held); if (e) { const p = fk(lastQ).p; e.mesh.position.set(p[0], p[1], p[2]) } }
  }

  const setQ = (q: Joints) => {
    lastQ = q
    g1.rotation.z = q[0]; g2.rotation.y = q[1]; g3.rotation.y = q[2]
    g4.rotation.z = q[3]; g5.rotation.y = q[4]; g6.rotation.z = q[5]
    syncHeld()
  }

  /* ---- engeller, bölgeler ---- */
  const staticBoxes = new THREE.Group(); root.add(staticBoxes)
  const zoneBoxes = new THREE.Group(); root.add(zoneBoxes)
  const fill = (grp: THREE.Group, boxes: readonly Box[], color: number, opacity: number) => {
    for (const c of [...grp.children]) { c.removeFromParent(); const m = c as THREE.Mesh; m.geometry?.dispose() }
    for (const b of boxes) {
      const w = b.max[0] - b.min[0], d = b.max[1] - b.min[1], h = b.max[2] - b.min[2]
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, d, h), new THREE.MeshStandardMaterial({ color, transparent: true, opacity, roughness: 0.8 }))
      m.position.set((b.min[0] + b.max[0]) / 2, (b.min[1] + b.max[1]) / 2, (b.min[2] + b.max[2]) / 2)
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry), new THREE.LineBasicMaterial({ color }))
      m.add(edges)
      grp.add(m)
    }
  }

  /* ---- izler ---- */
  const traces = new Map<string, THREE.Line>()
  const setTrace: ArmView['setTrace'] = (key, pts, color = 0x2c6cb0) => {
    const old = traces.get(key)
    if (old) { old.removeFromParent(); old.geometry.dispose(); (old.material as THREE.Material).dispose(); traces.delete(key) }
    if (!pts || pts.length < 2) return
    const g = new THREE.BufferGeometry().setFromPoints(pts.map((p) => new THREE.Vector3(p[0], p[1], p[2])))
    const l = new THREE.Line(g, new THREE.LineBasicMaterial({ color }))
    root.add(l); traces.set(key, l)
  }

  /* ---- hedef işareti ---- */
  const target = new THREE.Group()
  target.add(new THREE.AxesHelper(0.12))
  const tcone = new THREE.Mesh(new THREE.SphereGeometry(0.02, 12, 12), new THREE.MeshBasicMaterial({ color: 0xf5b301 }))
  target.add(tcone)
  target.visible = false
  root.add(target)
  const setTarget: ArmView['setTarget'] = (p, yaw = 0) => {
    target.visible = !!p
    if (p) { target.position.set(...p); target.rotation.set(0, 0, (yaw * Math.PI) / 180) }
  }

  /* ---- insan ---- */
  const human = new THREE.Group()
  const hMat = new THREE.MeshStandardMaterial({ color: 0x2f8a57, roughness: 0.7 })
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 1.5, 20), hMat)
  body.rotation.x = Math.PI / 2; body.position.z = 0.75
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 20, 16), hMat)
  head.position.z = 1.63
  human.add(body, head)
  human.visible = false
  root.add(human)
  const HCOL = { ok: 0x2f8a57, slow: 0xe0a100, stop: 0xdc2626 }
  const setHuman: ArmView['setHuman'] = (pos, state = 'ok') => {
    human.visible = !!pos
    if (pos) { human.position.set(pos[0], pos[1], 0); hMat.color.setHex(HCOL[state]) }
  }

  /* ---- erişim halkası ---- */
  let ring: THREE.Mesh | null = null
  const setRing: ArmView['setRing'] = (z, min = 0, max = 0.9) => {
    if (ring) { ring.removeFromParent(); ring.geometry.dispose(); (ring.material as THREE.Material).dispose(); ring = null }
    if (z === null) return
    ring = new THREE.Mesh(new THREE.RingGeometry(Math.max(0.001, min), Math.max(0.002, max), 96), new THREE.MeshBasicMaterial({ color: 0x0f766e, transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false }))
    ring.position.z = Math.max(0.006, z)
    root.add(ring)
  }

  stage.view([1.5, 1.25, 1.7], [0.3, 0.3, 0])
  setQ([0, 0, 0, 0, 0, 0])

  const view: ArmView = {
    stage, setQ, setGrip, setItems,
    setHeld(id) { held = id; syncHeld() },
    setObstacles(b) { fill(staticBoxes, b, COLORS.wall, 0.55) },
    setZones(b) { fill(zoneBoxes, b, COLORS.zone, 0.18) },
    setTrace, setTarget, setHuman, setRing,
    setLabels(on) { for (const l of labels) l.visible = on },
    get onFrame() { return stage.onFrame },
    set onFrame(fn) { stage.onFrame = fn },
    dispose() { stage.dispose() },
  }
  return view
}
