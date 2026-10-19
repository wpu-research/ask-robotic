'use client'
// İnsansı robot 3B görünümü: gövde her karede `frame()`'den okunan ileri kinematik noktalarıyla çizilir (eklem hiyerarşisi yok,
// segmentler iki nokta arasına yerleştirilen silindirlerdir). Ağırlık merkezi, yer izdüşümü, destek çokgeni, ZMP ve
// sürüklenebilir ayak hedefi gösterilir. Düzlem (x ileri, y sola, z yukarı) → dünya (X = x, Y = z, Z = -y).
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { createStage, mesh, std } from '../three/core'
import { BODY, type BodyFK, type V3 } from '@/lib/insansi/kinematik'

export interface HumanoidFrame {
  body: BodyFK
  com: V3
  support: Array<[number, number]>
  stable: boolean
  zmp?: [number, number] | null
  /** IK kipinde sürüklenen taban hedefi (dünya). */
  target?: V3 | null
}

const W = (p: V3) => new THREE.Vector3(p[0], p[2], -p[1])

export function Insansi3D({ frame, onTargetDrag, label }: { frame: () => HumanoidFrame; onTargetDrag?: (x: number, z: number) => void; label: string }) {
  const host = useRef<HTMLDivElement>(null)
  const live = useRef({ frame, onTargetDrag })
  live.current = { frame, onTargetDrag }

  useEffect(() => {
    const stage = createStage(host.current!)
    stage.scene.background = new THREE.Color(0xe2e8f0)
    const ground = mesh(new THREE.PlaneGeometry(4, 4), std(0xf1f5f9, { roughness: 1 }))
    ground.rotation.x = -Math.PI / 2
    stage.scene.add(ground)
    const grid = new THREE.GridHelper(4, 80, 0xcbd5e1, 0xe2e8f0)
    grid.position.y = 0.0005
    stage.scene.add(grid)
    const sc = stage.sun.shadow.camera
    sc.left = -0.6; sc.right = 0.6; sc.top = 0.6; sc.bottom = -0.6; sc.near = 0.1; sc.far = 5
    sc.updateProjectionMatrix()
    stage.camera.position.set(0.72, 0.5, 0.9)
    stage.controls.target.set(0, 0.26, 0)
    stage.controls.minDistance = 0.3
    stage.controls.maxDistance = 3

    const up = new THREE.Vector3(0, 1, 0)
    const seg = (r: number, color: number) => {
      const m = mesh(new THREE.CylinderGeometry(r, r, 1, 16), std(color))
      stage.scene.add(m)
      return (a: V3, b: V3) => {
        const A = W(a), B = W(b)
        const d = B.clone().sub(A)
        const len = Math.max(1e-4, d.length())
        m.position.copy(A).addScaledVector(d, 0.5)
        m.scale.set(1, len, 1)
        m.quaternion.setFromUnitVectors(up, d.normalize())
      }
    }
    const joint = (r: number, color: number) => { const m = mesh(new THREE.SphereGeometry(r, 16, 12), std(color, { metalness: 0.3 })); stage.scene.add(m); return (p: V3) => m.position.copy(W(p)) }
    const LEG = 0x2563eb, ARM = 0x0ea5e9, J = 0x0f172a
    const legs = (['L', 'R'] as const).map(() => ({ thigh: seg(0.016, LEG), shank: seg(0.014, LEG), hip: joint(0.02, J), knee: joint(0.018, J), ankle: joint(0.015, J) }))
    const arms = (['L', 'R'] as const).map(() => ({ up: seg(0.012, ARM), fore: seg(0.011, ARM), sh: joint(0.016, J), el: joint(0.014, J), hand: joint(0.013, 0xf59e0b) }))
    const feet = [0, 1].map(() => { const m = mesh(new THREE.BoxGeometry(BODY.footBack + BODY.footFront, 0.012, BODY.footHalfW * 2), std(0x1e293b)); stage.scene.add(m); return m })
    const torso = mesh(new THREE.BoxGeometry(0.07, BODY.torso, BODY.shoulderHalf * 2 - 0.02), std(0xf97316))
    stage.scene.add(torso)
    const pelvisBox = mesh(new THREE.BoxGeometry(0.06, 0.03, BODY.hipHalf * 2 + 0.03), std(0xea580c))
    stage.scene.add(pelvisBox)
    const head = mesh(new THREE.BoxGeometry(0.07, 0.07, 0.07), std(0xf8fafc))
    const eye = mesh(new THREE.BoxGeometry(0.005, 0.014, 0.045), std(0x0f172a, { emissive: new THREE.Color(0x0d9488), emissiveIntensity: 1 }), [0.036, 0.008, 0])
    head.add(eye)
    stage.scene.add(head)
    // ağırlık merkezi ve izdüşümü
    const comBall = new THREE.Mesh(new THREE.SphereGeometry(0.014, 20, 14), new THREE.MeshBasicMaterial({ color: 0x16a34a, depthTest: false }))
    comBall.renderOrder = 5
    stage.scene.add(comBall)
    const dropGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()])
    const dropMat = new THREE.LineDashedMaterial({ color: 0x16a34a, dashSize: 0.01, gapSize: 0.008 })
    const drop = new THREE.Line(dropGeo, dropMat)
    stage.scene.add(drop)
    const comDot = mesh(new THREE.RingGeometry(0.008, 0.014, 24).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x16a34a }))
    stage.scene.add(comDot)
    const polyGeo = new THREE.BufferGeometry()
    polyGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(3 * 40), 3))
    const polyMat = new THREE.LineBasicMaterial({ color: 0x16a34a })
    const poly = new THREE.LineLoop(polyGeo, polyMat)
    stage.scene.add(poly)
    const zmp = mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.003, 4), new THREE.MeshBasicMaterial({ color: 0xdc2626 }))
    stage.scene.add(zmp)
    const target = new THREE.Mesh(new THREE.SphereGeometry(0.022, 20, 14), new THREE.MeshBasicMaterial({ color: 0xdb2777, transparent: true, opacity: 0.8, depthTest: false }))
    target.renderOrder = 6
    stage.scene.add(target)

    stage.onFrame = () => {
      const f = live.current.frame()
      const b = f.body
      ;(['L', 'R'] as const).forEach((s, i) => {
        const l = b.legs[s], g = legs[i]
        g.thigh(l.hip, l.knee); g.shank(l.knee, l.ankle); g.hip(l.hip); g.knee(l.knee); g.ankle(l.ankle)
        const ft = feet[i]
        const cx = (BODY.footFront - BODY.footBack) / 2
        const c: V3 = [l.sole[0] + cx * Math.cos(l.pitch), l.sole[1], l.sole[2] + cx * Math.sin(l.pitch) + 0.006]
        ft.position.copy(W(c))
        ft.rotation.set(l.roll, 0, l.pitch, 'XYZ')
        const a = b.arms[s], h = arms[i]
        h.up(a.shoulder, a.elbow); h.fore(a.elbow, a.hand); h.sh(a.shoulder); h.el(a.elbow); h.hand(a.hand)
      })
      torso.position.copy(W([b.pelvis[0], b.pelvis[1], b.pelvis[2] + BODY.torso / 2]))
      pelvisBox.position.copy(W(b.pelvis))
      head.position.copy(W(b.head))
      const col = f.stable ? 0x16a34a : 0xdc2626
      ;(comBall.material as THREE.MeshBasicMaterial).color.set(col)
      ;(comDot.material as THREE.MeshBasicMaterial).color.set(col)
      dropMat.color.set(col); polyMat.color.set(col)
      comBall.position.copy(W(f.com))
      comDot.position.copy(W([f.com[0], f.com[1], 0.002]))
      dropGeo.setFromPoints([W(f.com), W([f.com[0], f.com[1], 0.001])])
      drop.computeLineDistances()
      const pos = polyGeo.attributes.position as THREE.BufferAttribute
      f.support.slice(0, 40).forEach(([x, y], i) => pos.setXYZ(i, x, 0.0015, -y))
      polyGeo.setDrawRange(0, Math.min(40, f.support.length))
      pos.needsUpdate = true
      zmp.visible = !!f.zmp
      if (f.zmp) zmp.position.copy(W([f.zmp[0], f.zmp[1], 0.002]))
      target.visible = !!f.target
      if (f.target) target.position.copy(W(f.target))
      // kamera robotu yatayda izler (yürüyüşte)
      const dx = b.pelvis[0] - stage.controls.target.x
      if (Math.abs(dx) > 1e-4) { stage.controls.target.x += dx; stage.camera.position.x += dx }
    }

    // ayak hedefini sürükleme: hedefin bulunduğu yan düzlemde (dünya Z sabit)
    const el = stage.renderer.domElement
    const ray = new THREE.Raycaster()
    const ndc = new THREE.Vector2()
    let dragging = false
    const setRay = (ev: PointerEvent) => {
      const r = el.getBoundingClientRect()
      ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1)
      ray.setFromCamera(ndc, stage.camera)
    }
    const onDown = (ev: PointerEvent) => {
      if (!target.visible || !live.current.onTargetDrag) return
      setRay(ev)
      if (ray.intersectObject(target).length) { dragging = true; stage.controls.enabled = false; el.setPointerCapture(ev.pointerId) }
    }
    const onMove = (ev: PointerEvent) => {
      if (!dragging) return
      setRay(ev)
      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -target.position.z)
      const hit = new THREE.Vector3()
      if (ray.ray.intersectPlane(plane, hit)) live.current.onTargetDrag?.(hit.x, hit.y)
    }
    const onUp = (ev: PointerEvent) => { if (dragging) { dragging = false; stage.controls.enabled = true; el.releasePointerCapture?.(ev.pointerId) } }
    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    return () => {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      stage.dispose()
    }
  }, [])

  return <div ref={host} className="hm-3d" role="img" aria-label={label} data-testid="insansi-3d" />
}
