'use client'
// Robotik arenası 3B görünüm: gezgin (üstten benzetim, 3B çizim), robot kol (yandan düzlem), dengeleyen robot.
// Anlık durum `snap` her karede ref'ten okunur; sahne yalnız sahne kimliği değişince yeniden kurulur.
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import type { ArenaScene, ArenaSnapshot, ArmScene, ArmSnapshot, BalancerSnapshot, RoverScene, RoverSnapshot } from '@/lib/arena/types'
import { applyCamera, createStage, fitShadow, makeFloor, makeTrail, makeWall, mesh, placeWall, std, wallMaterial, type CamMode, type FloorSpec, type Stage } from '../three/core'
import { makeArenaRover, makeArm, makeBalancer, poseArm, poseBalancer, poseMobile } from '../three/models'

interface Props {
  scene: ArenaScene
  snap: ArenaSnapshot
  trail?: ReadonlyArray<readonly [number, number, number]>
  servoDeg?: number
  onDrag?: (x: number, y: number) => void
  mode: CamMode
}

const ZONE_CSS: Record<string, string> = { goal: '#16a34a', checkpoint: '#d97706', target: '#0891b2', start: '#6366f1' }

export function Arena3D(p: Props) {
  const host = useRef<HTMLDivElement>(null)
  const live = useRef(p)
  live.current = p
  const key = `${p.scene.kind}:${p.scene.id}`

  useEffect(() => {
    const stage = createStage(host.current!)
    const s = live.current.scene
    const stop = s.kind === 'rover' ? buildRover(stage, live) : s.kind === 'arm' ? buildArm(stage, s) : buildBalancer(stage)
    stage.onFrame = (dt) => stop.frame(live.current, dt)
    return () => { stop.dispose?.(); stage.dispose() }
  }, [key])

  const snap = p.snap
  return (
    <div className="arena-3d" ref={host} data-testid="arena-3d" data-scene={p.scene.id}>
      {snap.kind === 'balancer' && <div className="arena-hud" aria-live="polite">{snap.fell ? 'DÜŞTÜ' : 'AYAKTA'} · eğim {snap.thetaDeg.toFixed(1)}°</div>}
    </div>
  )
}

interface Built { frame(p: Props, dt: number): void; dispose?(): void }

// ---------------- gezgin ----------------
function buildRover(stage: Stage, live: { current: Props }): Built {
  const scene = live.current.scene as RoverScene
  const snap0 = live.current.snap as RoverSnapshot
  const { width: w, height: h } = scene
  fitShadow(stage, w / 2, -h / 2, Math.max(w, h))
  const spec = (snap: RoverSnapshot): FloorSpec => ({
    w, h, lines: scene.lines, lineWidth: scene.lineWidth ?? 0.02,
    zones: scene.zones.map((z) => ({ ...z, color: ZONE_CSS[z.kind] ?? '#6366f1', visited: snap.visited.has(z.id) })),
  })
  const floor = makeFloor(spec(snap0))
  stage.scene.add(floor.mesh)
  const wm = wallMaterial()
  for (const seg of scene.walls) stage.scene.add(makeWall(seg, wm))
  const moverMat = std(0xf59e0b)
  const movers = new Map(snap0.movers.map((m) => { const mm = makeWall(m.wall, moverMat); stage.scene.add(mm); return [m.id, mm] as const }))
  const trail = makeTrail(4000, 0x6366f1)
  stage.scene.add(trail.line)
  const ex = scene.extra ?? {}
  const model = makeArenaRover({
    wheelBase: ex.wheelBase ?? 0.12, wheelRadius: ex.wheelRadius ?? 0.033, ultrasonic: !!scene.sensors.ultrasonic,
    lineSensors: snap0.line.map((l) => ({ x: l.x, y: l.y })), bumpers: !!scene.sensors.bumpers,
  })
  stage.scene.add(model.group)
  const ray = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(1, 0, 0)]), new THREE.LineBasicMaterial({ color: 0xef4444 }))
  ray.position.set(0.018, 0.01, 0)
  model.servoHead?.add(ray)

  // Sürükleme (yalnız `movable` sahneler): robota bas, zeminde gezdir.
  const el = stage.renderer.domElement
  const rc = new THREE.Raycaster()
  const ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
  let dragging = false
  const ndc = (e: PointerEvent) => { const r = el.getBoundingClientRect(); return new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1) }
  const down = (e: PointerEvent) => {
    if (!scene.movable || !live.current.onDrag) return
    rc.setFromCamera(ndc(e), stage.camera)
    if (rc.intersectObject(model.group, true).length) { dragging = true; stage.controls.enabled = false; el.setPointerCapture(e.pointerId); el.style.cursor = 'grabbing' }
  }
  const move = (e: PointerEvent) => {
    if (!dragging) return
    rc.setFromCamera(ndc(e), stage.camera)
    const hit = new THREE.Vector3()
    if (rc.ray.intersectPlane(ground, hit)) live.current.onDrag?.(Math.max(0.1, Math.min(w - 0.1, hit.x)), Math.max(0.1, Math.min(h - 0.1, -hit.z)))
  }
  const up = () => { if (dragging) { dragging = false; stage.controls.enabled = true; el.style.cursor = '' } }
  el.addEventListener('pointerdown', down)
  el.addEventListener('pointermove', move)
  el.addEventListener('pointerup', up)
  el.addEventListener('pointerleave', up)

  let angL = 0, angR = 0, lastT = snap0.timeS, visitedN = -1, lastMode: CamMode | null = null
  return {
    frame(p, dt) {
      const snap = p.snap as RoverSnapshot
      const sdt = Math.max(0, snap.timeS - lastT)
      lastT = snap.timeS
      if (sdt < 1) { angL += snap.wL * sdt; angR += snap.wR * sdt }
      poseMobile(model, snap.x, snap.y, snap.theta, (angL * 180) / Math.PI, (angR * 180) / Math.PI)
      if (model.servoHead) model.servoHead.rotation.y = (((p.servoDeg ?? 90) - 90) * Math.PI) / 180
      // Gürültüsüz gerçek mesafe; ilk ölçümden önce (t = 0) çizilmez
      ray.visible = !!model.servoHead && snap.timeS > 0 && Number.isFinite(snap.frontTrueCm)
      ray.scale.x = Math.max(0.001, Math.min(snap.frontTrueCm, 300) / 100)
      snap.line.forEach((l, i) => { const m = model.lineDots?.[i]; if (m) { const mat = m.material as THREE.MeshStandardMaterial; mat.color.set(l.on ? 0xf97316 : 0x64748b); mat.emissive.set(l.on ? 0xf97316 : 0x000000) } })
      if (model.bumpers) [snap.bumperL, snap.bumperR].forEach((on, i) => (model.bumpers![i].material as THREE.MeshStandardMaterial).color.set(on ? 0xf97316 : 0x94a3b8))
      for (const m of snap.movers) { const mm = movers.get(m.id); if (mm) placeWall(mm, m.wall) }
      if (snap.visited.size !== visitedN) { visitedN = snap.visited.size; floor.paint(spec(snap)) }
      trail.set(p.trail ?? [], [snap.x, snap.y])
      const follow = { x: snap.x, y: snap.y, theta: snap.theta }
      if (p.mode !== lastMode) { applyCamera(stage, p.mode, { w, h }, follow); lastMode = p.mode }
      else if (p.mode === 'takip') applyCamera(stage, p.mode, { w, h }, follow, dt)
    },
    dispose() { el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointerleave', up) },
  }
}

// ---------------- robot kol (cm) ----------------
function buildArm(stage: Stage, scene: ArmScene): Built {
  const v = scene.view
  const cx = (v.xMin + v.xMax) / 2, cy = (v.yMin + v.yMax) / 2, span = Math.max(v.xMax - v.xMin, v.yMax - v.yMin)
  stage.camera.near = 0.5; stage.camera.far = 5000; stage.camera.updateProjectionMatrix()
  stage.controls.maxPolarAngle = Math.PI - 0.05
  stage.sun.position.set(cx + span, span * 2, span)
  stage.sun.target.position.set(cx, 0, 0)
  const sc = stage.sun.shadow.camera
  sc.left = -span; sc.right = span; sc.top = span; sc.bottom = -span; sc.near = 1; sc.far = span * 6; sc.updateProjectionMatrix()
  const table = mesh(new THREE.BoxGeometry(v.xMax - v.xMin + 20, 2, 40), std(0xe7d3b0, { roughness: 0.9 }), [cx, -1, 0])
  stage.scene.add(table)
  for (const z of scene.zones) {
    const ring = mesh(new THREE.CylinderGeometry(z.r, z.r, 0.3, 40), std(0x16a34a, { transparent: true, opacity: 0.35 }), [z.x, z.y - 0.15, 0])
    stage.scene.add(ring)
  }
  const arm = makeArm(scene.l1, scene.l2)
  stage.scene.add(arm.group)
  const cubeMat = std(0x0ea5e9), heldMat = std(0xf43f5e)
  const cubes = new Map<string, THREE.Mesh>()
  for (const o of scene.objects) { const c = mesh(new THREE.BoxGeometry(2, 2, 2), cubeMat); stage.scene.add(c); cubes.set(o.id, c) }
  stage.camera.position.set(cx + span * 0.35, cy + span * 0.35, span * 1.25)
  stage.controls.target.set(cx, cy, 0)
  return {
    frame(p) {
      const snap = p.snap as ArmSnapshot
      poseArm(arm, snap.q1, snap.q2, !snap.gripClosed)
      for (const o of snap.objects) { const c = cubes.get(o.id); if (c) { c.position.set(o.x, o.y, 0); c.material = snap.held === o.id ? heldMat : cubeMat } }
    },
  }
}

// ---------------- dengeleyen robot ----------------
function buildBalancer(stage: Stage): Built {
  fitShadow(stage, 0, 0, 1.2)
  const canvas = document.createElement('canvas')
  canvas.width = 256; canvas.height = 64
  const g = canvas.getContext('2d')!
  g.fillStyle = '#e2e8f0'; g.fillRect(0, 0, 256, 64)
  g.fillStyle = '#94a3b8'; g.fillRect(0, 0, 12, 64)
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = THREE.RepeatWrapping
  tex.repeat.set(80, 1)
  tex.colorSpace = THREE.SRGBColorSpace
  const floor = mesh(new THREE.PlaneGeometry(20, 0.6), std(0xffffff, { map: tex, roughness: 0.95 }))
  floor.rotation.x = -Math.PI / 2
  stage.scene.add(floor)
  const bot = makeBalancer()
  stage.scene.add(bot.group)
  stage.camera.position.set(0.15, 0.35, 0.75)
  stage.controls.target.set(0, 0.14, 0)
  const bodyMat = (bot.body.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial
  let lastX = 0
  return {
    frame(p) {
      const snap = p.snap as BalancerSnapshot
      const x = Math.max(-9.5, Math.min(9.5, snap.x))
      poseBalancer(bot, x, Math.max(-90, Math.min(90, snap.thetaDeg)))
      bodyMat.color.set(snap.fell ? 0xef4444 : 0x6366f1)
      const dx = x - lastX
      lastX = x
      stage.camera.position.x += dx
      stage.controls.target.x += dx
    },
  }
}
