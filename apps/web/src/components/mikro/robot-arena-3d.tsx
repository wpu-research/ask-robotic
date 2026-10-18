'use client'
// Robot Atölyesi 3B görünüm: robot durumu her karede DriveBase'ten (ve kart LED'leri Device'tan) okunur.
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import type { Device } from '@/lib/mikro/device'
import { FLOOR_COLORS, type DriveBase, type LightColor } from '@/lib/mikro/robot'
import { applyCamera, createStage, fitShadow, makeFloor, makeTrail, makeWall, mesh, std, wallMaterial, type CamMode, type FloorSpec } from '../three/core'
import { makeBlokRobot, makeGezginRobot, makeKiskacRobot, poseMobile, type MobileModel } from '../three/models'
import { makeDesignModel } from '../three/design-model'
import { ZONE_EN } from '@/lib/mikro/en'
import { useLocale } from '@/i18n/client'

const LIGHT_CSS: Record<LightColor, string | null> = { kapali: null, kirmizi: '#ef4444', yesil: '#22c55e', mavi: '#3b82f6', sari: '#facc15', beyaz: '#ffffff' }
const ZONE_CSS = { goal: '#16a34a', checkpoint: '#d97706', start: '#6366f1' } as const

const floorSpec = (r: DriveBase, en = false): FloorSpec => ({
  w: r.scene.width, h: r.scene.height, lines: r.scene.lines, lineWidth: r.scene.lineWidth ?? 0.02,
  patches: r.scene.patches.map((p) => ({ ...p, css: FLOOR_COLORS[p.color].css })),
  zones: r.scene.zones.map((z) => ({ ...z, label: en && z.label ? ZONE_EN[z.label] ?? z.label : z.label, color: ZONE_CSS[z.kind], visited: r.visited.has(z.id) })),
})

export function RobotArena3D({ robot, device, mode }: { robot: DriveBase; device: Device; mode: CamMode }) {
  const host = useRef<HTMLDivElement>(null)
  const en = useLocale() === 'en'
  const live = useRef({ robot, device, mode, en })
  live.current = { robot, device, mode, en }
  const sceneId = robot.scene.id
  // tasarlanan robotta model tasarımdan kurulur: tasarım değişince sahne yeniden kurulsun
  const profileId = robot.profile.design ? `ozel:${JSON.stringify(robot.profile.design.parts)}:${robot.profile.design.chassis}` : robot.profile.id

  useEffect(() => {
    const stage = createStage(host.current!)
    const r0 = live.current.robot
    const { width: w, height: h } = r0.scene
    fitShadow(stage, w / 2, -h / 2, Math.max(w, h))
    const floor = makeFloor(floorSpec(r0, live.current.en))
    stage.scene.add(floor.mesh)
    const wm = wallMaterial()
    for (const seg of r0.scene.walls) stage.scene.add(makeWall(seg, wm))
    const trail = makeTrail()
    stage.scene.add(trail.line)
    const p = r0.profile
    const model: MobileModel = p.design ? makeDesignModel(p.design) : p.id === 'kiskac' ? makeKiskacRobot(p.wheelBase, p.wheelDiameter) : p.id === 'blok' ? makeBlokRobot(p.wheelBase, p.wheelDiameter) : makeGezginRobot(p.wheelBase, p.wheelDiameter)
    stage.scene.add(model.group)
    // taşınabilir küpler
    const cubes = r0.objects.map((o) => {
      const c = mesh(new THREE.BoxGeometry(o.half * 2, o.half * 2, o.half * 2), std(FLOOR_COLORS[o.color].css))
      stage.scene.add(c)
      return c
    })
    const rayMat = new THREE.LineBasicMaterial({ color: 0xef4444 })
    const rayGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(1, 0, 0)])
    const ray = new THREE.Line(rayGeo, rayMat)
    const dm = p.mounts?.distance
    if (dm) { ray.position.set(dm.x, p.wheelDiameter / 2 + 0.018, -dm.y); ray.rotation.y = dm.rot ?? 0 } else ray.position.set(p.radius * 0.8, p.wheelDiameter / 2 + 0.015, 0)
    model.group.add(ray)

    let visitedN = -1, trailN = -1, lastMode: CamMode | null = null
    stage.onResize = () => { lastMode = null }
    stage.onFrame = (dt) => {
      const { robot: r, device: d, mode } = live.current
      poseMobile(model, r.x, r.y, r.theta, r.wheelDegL, r.wheelDegR)
      model.card?.setLeds(d.frame())
      model.setLights?.(LIGHT_CSS[r.lights])
      model.setGrip?.(r.gripClosed)
      r.objects.forEach((o, i) => {
        cubes[i]?.position.set(o.x, o.half + (r.held === o.id ? 0.006 : 0), -o.y)
        if (r.held === o.id) cubes[i]?.rotation.set(0, r.theta, 0)
      })
      if (model.bumper) (model.bumper.material as THREE.MeshStandardMaterial).color.set(r.has('force') && r.pressed ? 0xf97316 : 0x94a3b8)
      if (r.has('distance')) { ray.visible = true; ray.scale.x = Math.max(0.001, r.distanceCm / 100) } else ray.visible = false
      if (r.visited.size !== visitedN) { visitedN = r.visited.size; floor.paint(floorSpec(r, live.current.en)) }
      if (r.trail.length !== trailN || r.moving) { trailN = r.trail.length; trail.set(r.trail, [r.x, r.y]) }
      if (mode !== lastMode) { applyCamera(stage, mode, { w, h }, r); lastMode = mode }
      else if (mode === 'takip') applyCamera(stage, mode, { w, h }, r, dt)
    }
    return () => stage.dispose()
  }, [sceneId, profileId, en])

  return <div ref={host} className="rb-3d" data-testid="robot-arena-3d" />
}
