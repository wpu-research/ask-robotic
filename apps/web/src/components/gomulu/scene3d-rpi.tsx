'use client'
// 3B kameralı keşif robotu: durum lib/rpi/robot3d.ts'ten (saf, testli). Bu dosya yalnız istemcide, dinamik import ile
// yüklenir; sahne çatısı ML projelerinin createP3Stage'i (DPR ≤ 1,5, görünmezken durur, kaldırılınca dispose, orbit/pinch).
import { useEffect, useRef, type MutableRefObject } from 'react'
import * as THREE from 'three'
import { createP3Stage, webglOk } from '@/components/ml/projeler/stage3d'
import { FOV, RANGE, ROBOT_R, TRACK, WORLD, followPins, seeBall, step, type MotorPins, type Robot3D } from '@/lib/rpi/robot3d'

export interface RpiLive { robot: Robot3D; pins: MotorPins; follow: boolean; wheelAngle: [number, number] }

const std = (color: number, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.7, ...extra })
const W2T = (x: number, y: number, h = 0) => new THREE.Vector3(x, h, -y)

export default function RpiRobot3D({ live, label }: { live: MutableRefObject<RpiLive>; label: string }) {
  const host = useRef<HTMLDivElement>(null)
  const fail = useRef<HTMLParagraphElement>(null)
  useEffect(() => {
    if (!webglOk()) { if (fail.current) fail.current.hidden = false; return }
    const st = createP3Stage(host.current!, { background: 0xe9e2d8, shadows: true })
    const { scene } = st
    st.view([1.7, 2.3, 2.5], [0, 0, 0])
    st.controls.minDistance = 1.2; st.controls.maxDistance = 9

    const H = WORLD.half
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(2 * H, 2 * H), std(0xd8cbb8))
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor)
    const grid = new THREE.GridHelper(2 * H, 8, 0xb9a88f, 0xc9baa4); grid.position.y = 0.002; scene.add(grid)
    const wallMat = std(0x8b6b52)
    for (const [x, y, w, d] of [[0, H, 2 * H, 0.04], [0, -H, 2 * H, 0.04], [H, 0, 0.04, 2 * H], [-H, 0, 0.04, 2 * H]]) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.12, d), wallMat); m.position.copy(W2T(x, y, 0.06)); m.castShadow = true; scene.add(m)
    }
    for (const b of WORLD.boxes) { const m = new THREE.Mesh(new THREE.BoxGeometry(b.w, 0.3, b.h), std(0xc79a5b)); m.position.copy(W2T(b.x, b.y, 0.15)); m.castShadow = true; m.receiveShadow = true; scene.add(m) }
    const ball = new THREE.Mesh(new THREE.SphereGeometry(WORLD.ball.r, 24, 16), std(0x22a447, { roughness: 0.4 }))
    ball.position.copy(W2T(WORLD.ball.x, WORLD.ball.y, WORLD.ball.r)); ball.castShadow = true; scene.add(ball)

    // Robot: şasi, Pi kartı, iki tekerlek, sarhoş teker, kamera ve görüş konisi
    const robot = new THREE.Group(); robot.scale.setScalar(1.5); scene.add(robot) // görsel büyütme; fizik ölçüsü değişmez
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.04, 0.16), std(0x2a1a12)); chassis.position.y = 0.06; chassis.castShadow = true; robot.add(chassis)
    const pi = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.012, 0.056), std(0x1f7a3d)); pi.position.set(-0.02, 0.087, 0); robot.add(pi)
    const header = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.008, 0.006), std(0x111111)); header.position.set(-0.02, 0.097, 0.024); robot.add(header)
    const wheels: THREE.Mesh[] = []
    for (const side of [1, -1]) {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.033, 0.033, 0.025, 20), std(0x333333)); w.rotation.x = Math.PI / 2
      const hub = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.026, 0.008), std(0xf2c14e)); w.add(hub)
      const g = new THREE.Group(); g.position.set(0.02, 0.033, -side * TRACK / 2); g.add(w); robot.add(g); wheels.push(w)
    }
    const caster = new THREE.Mesh(new THREE.SphereGeometry(0.015, 12, 8), std(0x999999)); caster.position.set(-0.08, 0.015, 0); robot.add(caster)
    const cam = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.025, 0.025), std(0x111111)); cam.position.set(0.1, 0.1, 0); robot.add(cam)
    const coneLen = Math.min(RANGE, 1.2)
    // Görüş konisi zemine yatırılmış bir dilim (robot grubu 1,5 kat büyütüldüğü için yarıçap bölünür)
    const coneGeo = new THREE.CircleGeometry(coneLen / 1.5, 32, -FOV / 2, FOV)
    coneGeo.rotateX(-Math.PI / 2)
    const coneMat = new THREE.MeshBasicMaterial({ color: 0x2c6cb0, transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false })
    const cone = new THREE.Mesh(coneGeo, coneMat); cone.position.set(0.11, 0.004, 0); robot.add(cone)
    const bumper = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.03, 0.17), std(0x94a3b8)); bumper.position.set(0.105, 0.05, 0); robot.add(bumper)

    const trailGeo = new THREE.BufferGeometry()
    const trail = new THREE.Line(trailGeo, new THREE.LineBasicMaterial({ color: 0xb7791f })); scene.add(trail)
    let trailN = -1

    st.onFrame = (dt) => {
      const L = live.current
      // Fizik birkaç alt adımda; izle kipinde pinler denetleyiciden gelir (GPIO komutları robotu sürer)
      for (let k = 0; k < 4; k++) {
        if (L.follow) L.pins = followPins(L.robot.pose)
        L.robot = step(L.robot, L.pins, dt / 4)
      }
      const p = L.robot.pose
      robot.position.copy(W2T(p.x, p.y)); robot.rotation.y = p.th
      L.wheelAngle = [L.wheelAngle[0] + (L.robot.vl * dt) / 0.033, L.wheelAngle[1] + (L.robot.vr * dt) / 0.033]
      wheels[0].rotation.y = -L.wheelAngle[0]; wheels[1].rotation.y = -L.wheelAngle[1]
      const v = seeBall(p)
      coneMat.color.set(v.seen ? 0x2f8a57 : 0x2c6cb0); coneMat.opacity = v.seen ? 0.26 : 0.14
      ;(bumper.material as THREE.MeshStandardMaterial).color.set(L.robot.bumped ? 0xc43d36 : 0x94a3b8)
      if (L.robot.trail.length !== trailN) { trailN = L.robot.trail.length; trailGeo.setFromPoints(L.robot.trail.map(([x, y]) => W2T(x, y, 0.004))) }
    }
    void ROBOT_R
    return () => st.dispose()
  }, [live])
  return (
    <div className="gm-3d-wrap">
      <div ref={host} className="gm-3d" role="img" aria-label={label} data-testid="rpi-robot3d-canvas" />
      <p ref={fail} hidden className="gm-hint">WebGL yok / WebGL unavailable</p>
    </div>
  )
}
