'use client'
// Robot kol projesinin 3B sahnesi. Benzetim düzlemi (x, y yatay, z yukarı) → dünya: X = x, Y = z, Z = −y. Eklemler iç içe
// gruplardır: taban Y ekseninde döner, omuz ve dirsek kendi Z eksenlerinde. Kol sırayla sekiz hedefe uzanır (her biri ~1,6 s);
// gösterilen açılar ağın o hedef için verdiği açılara yumuşakça yaklaşır. Uçtan hedefe çizgi hataya göre kırmızıdan yeşile döner.
import * as THREE from 'three'
import type { ProjectRun } from '@/lib/ml/projeler/core'
import { ARM, GOAL_CM, fk, type Angles, type KolView, type Vec3 } from '@/lib/ml/projeler/robot-kol'
import { mesh, std } from '../../../three/core'
import type { MountScene } from '../stage3d'

const HOLD = 1.6
const toW = (p: Vec3, out: THREE.Vector3) => out.set(p[0], p[2], -p[1])

export const mount: MountScene = (s) => {
  const root = new THREE.Group()
  s.scene.add(root)

  // masa
  const table = mesh(new THREE.BoxGeometry(2.4, 0.06, 2.4), std(0xd6dbe3, { roughness: 0.8 }), [0, -0.03, 0])
  table.castShadow = false
  root.add(table)
  const grid = new THREE.GridHelper(2.4, 12, 0x9aa5b5, 0xbfc7d2)
  grid.position.y = 0.001
  root.add(grid)

  // kol: taban → omuz → dirsek → kıskaç
  const metal = std(0x334155, { metalness: 0.4, roughness: 0.4 })
  const orange = std(0xf97316, { roughness: 0.45 })
  const jointMat = std(0x0f172a, { metalness: 0.3, roughness: 0.35 })
  const baseYaw = new THREE.Group()
  root.add(baseYaw)
  baseYaw.add(mesh(new THREE.CylinderGeometry(0.13, 0.16, 0.06, 32), metal, [0, 0.03, 0]))
  baseYaw.add(mesh(new THREE.CylinderGeometry(0.06, 0.07, ARM.h0 - 0.06, 24), metal, [0, 0.06 + (ARM.h0 - 0.06) / 2, 0]))
  const shoulder = new THREE.Group()
  shoulder.position.y = ARM.h0
  baseYaw.add(shoulder)
  const sj = mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.12, 24), jointMat)
  sj.rotation.x = Math.PI / 2
  shoulder.add(sj)
  shoulder.add(mesh(new THREE.BoxGeometry(ARM.L1, 0.07, 0.07), orange, [ARM.L1 / 2, 0, 0]))
  const elbowG = new THREE.Group()
  elbowG.position.x = ARM.L1
  shoulder.add(elbowG)
  elbowG.add(mesh(new THREE.SphereGeometry(0.055, 24, 16), jointMat))
  elbowG.add(mesh(new THREE.BoxGeometry(ARM.L2, 0.055, 0.055), orange, [ARM.L2 / 2, 0, 0]))
  const wrist = new THREE.Group()
  wrist.position.x = ARM.L2
  elbowG.add(wrist)
  wrist.add(mesh(new THREE.SphereGeometry(0.04, 20, 14), jointMat))
  const fingerGeo = new THREE.BoxGeometry(0.07, 0.015, 0.015)
  for (const sgn of [-1, 1]) wrist.add(mesh(fingerGeo, metal, [0.045, sgn * 0.025, 0]))

  // hedef: parlayan küre
  const targetMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x16a34a, emissiveIntensity: 0.9, roughness: 0.3 })
  const target = new THREE.Mesh(new THREE.SphereGeometry(0.035, 24, 16), targetMat)
  root.add(target)
  const halo = new THREE.Mesh(new THREE.SphereGeometry(0.06, 24, 16), new THREE.MeshBasicMaterial({ color: 0x22c55e, transparent: true, opacity: 0.18, depthWrite: false }))
  target.add(halo)

  // uçtan hedefe hata çizgisi
  const lineGeo = new THREE.BufferGeometry()
  const linePos = new Float32Array(6)
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3))
  const lineMat = new THREE.LineBasicMaterial({ color: 0xef4444 })
  root.add(new THREE.Line(lineGeo, lineMat))

  // saklı test hedefleri: soluk noktalar
  const ptsGeo = new THREE.BufferGeometry()
  const ptsPos = new Float32Array(200 * 3)
  ptsGeo.setAttribute('position', new THREE.BufferAttribute(ptsPos, 3))
  root.add(new THREE.Points(ptsGeo, new THREE.PointsMaterial({ color: 0x64748b, size: 0.018, transparent: true, opacity: 0.45, depthWrite: false })))

  const RED = new THREE.Color(0xef4444), GREEN = new THREE.Color(0x22c55e), tmpC = new THREE.Color()
  const tipW = new THREE.Vector3(), tgtW = new THREE.Vector3()
  const shown: Angles = [0, 1, -1.2]
  let lastRun: unknown = null, clock = 0, lastAspect = 0

  const fit = () => {
    const a = s.camera.aspect
    const k = a < 1 ? 1.75 : a < 1.45 ? 1.3 : 1
    s.view([1.45 * k, 1.15 * k, 1.75 * k], [0.05, 0.38, 0])
  }

  return {
    frame(r, dt) {
      const run = r as ProjectRun<KolView>
      const v = run.view
      if (Math.abs(s.camera.aspect - lastAspect) > 0.05) { lastAspect = s.camera.aspect; fit() }
      if (run !== lastRun) {
        lastRun = run
        clock = 0
        v.test.forEach((p, i) => { toW(p, tgtW); ptsPos[i * 3] = tgtW.x; ptsPos[i * 3 + 1] = tgtW.y; ptsPos[i * 3 + 2] = tgtW.z })
        ptsGeo.attributes.position.needsUpdate = true
        ptsGeo.computeBoundingSphere()
      }
      clock += dt
      const f = Math.floor(clock / HOLD) % v.demo.length
      v.focus = f
      const want = v.demoAngles[f]
      const k = 1 - Math.exp(-dt * 5)
      for (let i = 0; i < 3; i++) shown[i] += (want[i] - shown[i]) * k
      baseYaw.rotation.y = shown[0]
      shoulder.rotation.z = shown[1]
      elbowG.rotation.z = shown[2]
      toW(v.demo[f], tgtW)
      target.position.copy(tgtW)
      toW(fk(shown), tipW)
      linePos[0] = tipW.x; linePos[1] = tipW.y; linePos[2] = tipW.z
      linePos[3] = tgtW.x; linePos[4] = tgtW.y; linePos[5] = tgtW.z
      lineGeo.attributes.position.needsUpdate = true
      lineGeo.computeBoundingSphere()
      const err = v.demoErr[f] ?? 99
      const t = Math.max(0, Math.min(1, (err - GOAL_CM) / 10))
      tmpC.copy(GREEN).lerp(RED, t)
      lineMat.color.copy(tmpC)
      halo.scale.setScalar(1 + 0.15 * Math.sin(clock * 4))
    },
  }
}
