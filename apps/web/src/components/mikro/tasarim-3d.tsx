'use client'
// Robotunu Tasarla tezgâhı (3B): şasi ızgarası, parçalar, sensör görüş konileri, ağırlık merkezi ve destek çokgeni.
// Fareyle şasinin üstüne gelince hücre vurgulanır; tıklayınca `onCell` çağrılır (yerleştirme kuralları üst bileşende).
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { createStage, mesh, std } from '../three/core'
import { cellHighlight, makeDesignModel, type DesignModel } from '../three/design-model'
import { CHASSIS, PITCH, deriveDesign, type RobotDesign } from '@/lib/mikro/tasarim'

export interface Tasarim3DProps {
  design: RobotDesign
  selectedId: string | null
  showCones: boolean
  /** Hücreye tıklandı (c, r). */
  onCell(c: number, r: number): void
  /** Vurgulanan hücre yerleştirilebilir mi (yeşil/kırmızı önizleme). */
  canDrop(c: number, r: number): boolean
  label: string
}

export function Tasarim3D({ design, selectedId, showCones, onCell, canDrop, label }: Tasarim3DProps) {
  const host = useRef<HTMLDivElement>(null)
  const live = useRef({ design, selectedId, showCones, onCell, canDrop })
  live.current = { design, selectedId, showCones, onCell, canDrop }
  const rebuild = useRef<(() => void) | null>(null)

  useEffect(() => {
    const stage = createStage(host.current!)
    stage.scene.background = new THREE.Color(0xe2e8f0)
    const ground = mesh(new THREE.CircleGeometry(0.6, 48), std(0xf1f5f9, { roughness: 1 }))
    ground.rotation.x = -Math.PI / 2
    ground.castShadow = false
    stage.scene.add(ground)
    const grid = new THREE.GridHelper(1, 50, 0xcbd5e1, 0xe2e8f0)
    grid.position.y = 0.0005
    stage.scene.add(grid)
    stage.sun.position.set(0.4, 1.2, 0.5)
    stage.sun.target.position.set(0, 0, 0)
    const sc = stage.sun.shadow.camera
    sc.left = -0.3; sc.right = 0.3; sc.top = 0.3; sc.bottom = -0.3; sc.near = 0.1; sc.far = 3
    sc.updateProjectionMatrix()
    stage.camera.position.set(-0.22, 0.24, 0.3)
    stage.controls.target.set(0, 0.03, 0)
    stage.controls.minDistance = 0.12
    stage.controls.maxDistance = 1.2

    let model: DesignModel | null = null
    const extras = new THREE.Group()
    stage.scene.add(extras)
    const pick = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ visible: false }))
    pick.rotation.x = -Math.PI / 2
    stage.scene.add(pick)
    const hl = cellHighlight()
    hl.visible = false
    stage.scene.add(hl)
    const selBox = new THREE.Mesh(new THREE.BoxGeometry(PITCH * 1.05, 0.03, PITCH * 1.05), new THREE.MeshBasicMaterial({ color: 0x2563eb, wireframe: true }))
    selBox.visible = false
    stage.scene.add(selBox)

    const disposeTree = (o: THREE.Object3D) => o.traverse((x) => {
      const m = x as THREE.Mesh
      m.geometry?.dispose()
      const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : []
      for (const mat of mats) mat.dispose()
    })

    const build = () => {
      const { design: d, showCones: cones } = live.current
      if (model) { stage.scene.remove(model.group); disposeTree(model.group) }
      for (const c of [...extras.children]) { extras.remove(c); disposeTree(c) }
      model = makeDesignModel(d, { origin: 'chassis', cones: true })
      for (const c of model.cones) c.visible = cones
      stage.scene.add(model.group)
      const ch = CHASSIS[d.chassis]
      pick.scale.set(ch.cols * PITCH, ch.rows * PITCH, 1)
      pick.position.set(0, model.plateTop, 0)
      // ağırlık merkezi ve destek çokgeni (şasi merkezine göre)
      const dd = deriveDesign(d)
      const ox = dd.originX
      const comX = dd.com.x + ox, comY = dd.com.y
      const stable = dd.stabilityMargin > 0 && dd.support.length >= 3
      const col = stable ? 0x16a34a : 0xdc2626
      const ball = mesh(new THREE.SphereGeometry(0.006, 20, 14), new THREE.MeshBasicMaterial({ color: col, depthTest: false }), [comX, dd.com.z, -comY])
      ball.renderOrder = 5
      extras.add(ball)
      const drop = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(comX, dd.com.z, -comY), new THREE.Vector3(comX, 0.001, -comY)]), new THREE.LineDashedMaterial({ color: col, dashSize: 0.004, gapSize: 0.003 }))
      drop.computeLineDistances()
      extras.add(drop)
      extras.add(mesh(new THREE.RingGeometry(0.004, 0.007, 20).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: col }), [comX, 0.0015, -comY]))
      if (dd.support.length >= 2) {
        const pts = [...dd.support, dd.support[0]].map(([x, y]) => new THREE.Vector3(x + ox, 0.0012, -y))
        extras.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: col })))
        if (dd.support.length >= 3) {
          const shape = new THREE.Shape(dd.support.map(([x, y]) => new THREE.Vector2(x + ox, y)))
          const fill = new THREE.Mesh(new THREE.ShapeGeometry(shape).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.12, depthWrite: false }))
          fill.position.y = 0.001
          extras.add(fill)
        }
      }
    }
    rebuild.current = build
    build()

    const ray = new THREE.Raycaster()
    const ndc = new THREE.Vector2()
    const cellAt = (ev: PointerEvent): [number, number] | null => {
      const r = stage.renderer.domElement.getBoundingClientRect()
      ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1)
      ray.setFromCamera(ndc, stage.camera)
      const hit = ray.intersectObject(pick)[0]
      if (!hit) return null
      const ch = CHASSIS[live.current.design.chassis]
      const c = Math.floor(hit.point.x / PITCH + ch.cols / 2)
      const rr = Math.floor(hit.point.z / PITCH + ch.rows / 2)
      return c >= 0 && c < ch.cols && rr >= 0 && rr < ch.rows ? [c, rr] : null
    }
    const place = (c: number, r: number) => {
      const ch = CHASSIS[live.current.design.chassis]
      hl.position.set((c - (ch.cols - 1) / 2) * PITCH, (model?.plateTop ?? 0.03) + 0.002, (r - (ch.rows - 1) / 2) * PITCH)
    }
    const el = stage.renderer.domElement
    let down: { x: number; y: number } | null = null
    const onMove = (ev: PointerEvent) => {
      const cell = cellAt(ev)
      hl.visible = !!cell
      if (cell) { place(...cell); (hl.material as THREE.MeshBasicMaterial).color.set(live.current.canDrop(...cell) ? 0x22c55e : 0xef4444) }
    }
    const onDown = (ev: PointerEvent) => { down = { x: ev.clientX, y: ev.clientY } }
    const onUp = (ev: PointerEvent) => {
      // sürükleme (kamera döndürme) tıklama sayılmaz
      if (!down || Math.hypot(ev.clientX - down.x, ev.clientY - down.y) > 6) { down = null; return }
      down = null
      const cell = cellAt(ev)
      if (cell) live.current.onCell(...cell)
    }
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointerleave', () => { hl.visible = false })

    stage.onFrame = () => {
      const { selectedId } = live.current
      const o = selectedId ? model?.byId.get(selectedId) : null
      selBox.visible = !!o
      if (o) { const p = new THREE.Vector3(); o.getWorldPosition(p); selBox.position.set(p.x, p.y + 0.012, p.z) }
    }
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointerup', onUp)
      rebuild.current = null
      stage.dispose()
    }
  }, [])

  useEffect(() => { rebuild.current?.() }, [design, showCones])

  return <div ref={host} className="rt-3d" role="img" aria-label={label} data-testid="tasarim-3d" />
}
