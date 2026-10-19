// Drone iniş projesinin 3B sahnesi: zemin, H işaretli iniş pisti, dört kollu drone (pervaneler gaza göre döner), yükseklik
// direği ve gölge, rüzgâr çorabı ve rüzgârla akan çizgiler. Temas anında pistin halkası yumuşakta yeşil, sertte kırmızı yanar.
// Her şey bir kez kurulur; karede yalnız konum, dönüş, renk ve tampon değerleri değişir (yeni geometri yok).
import * as THREE from 'three'
import type { ProjectRun } from '@/lib/ml/projeler/core'
import { THROTTLE, type View } from '@/lib/ml/projeler/drone-inis'
import type { MountScene } from '../stage3d'
import { makeQuadModel } from './drone-model'

const std = (color: number, o: THREE.MeshStandardMaterialParameters = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, ...o })
function mesh(g: THREE.BufferGeometry, m: THREE.Material, pos: [number, number, number] = [0, 0, 0], shadow = true) {
  const o = new THREE.Mesh(g, m)
  o.position.set(...pos)
  o.castShadow = shadow
  o.receiveShadow = true
  return o
}

const N_STREAK = 48
const BOX = { x: 7, y: 11, z: 5 }

export const mount: MountScene = (s) => {
  const root = new THREE.Group()
  s.scene.add(root)
  s.scene.background = new THREE.Color(0xdfe9f3)
  s.scene.fog = new THREE.Fog(0xdfe9f3, 24, 60)

  // zemin ve pist
  const ground = mesh(new THREE.PlaneGeometry(60, 60), std(0xbfcdb4, { roughness: 1 }), [0, 0, 0], false)
  ground.rotation.x = -Math.PI / 2
  root.add(ground)
  root.add(mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.06, 48), std(0x3b4250, { roughness: 0.9 }), [0, 0.03, 0], false))
  const ringMat = std(0xfacc15, { emissive: new THREE.Color(0x000000), roughness: 0.5 })
  const ring = mesh(new THREE.TorusGeometry(1.32, 0.06, 8, 64), ringMat, [0, 0.07, 0], false)
  ring.rotation.x = Math.PI / 2
  root.add(ring)
  const white = std(0xf8fafc, { roughness: 0.5 })
  for (const x of [-0.38, 0.38]) root.add(mesh(new THREE.BoxGeometry(0.14, 0.02, 0.95), white, [x, 0.07, 0], false))
  root.add(mesh(new THREE.BoxGeometry(0.76, 0.02, 0.14), white, [0, 0.07, 0], false))

  // yükseklik direği: her 2 metrede bir çentik, drone hizasında kayan işaret
  const poleX = -3.2
  root.add(mesh(new THREE.CylinderGeometry(0.04, 0.04, 12, 8), std(0x64748b), [poleX, 6, 0]))
  const tickGeo = new THREE.BoxGeometry(0.3, 0.03, 0.03), tickMat = std(0x334155)
  for (let h = 0; h <= 12; h += 2) root.add(mesh(tickGeo, tickMat, [poleX + 0.15, h, 0], false))
  const markMat = std(0x2563eb, { emissive: new THREE.Color(0x1d4ed8), emissiveIntensity: 0.4 })
  const marker = mesh(new THREE.ConeGeometry(0.12, 0.3, 12), markMat, [poleX + 0.3, 0, 0], false)
  marker.rotation.z = Math.PI / 2
  root.add(marker)

  // gölge
  const shadowMat = new THREE.MeshBasicMaterial({ color: 0x0f172a, transparent: true, opacity: 0.3, depthWrite: false })
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.7, 32), shadowMat)
  shadow.rotation.x = -Math.PI / 2
  shadow.position.y = 0.075
  root.add(shadow)

  // drone: gövde, çapraz kollar, dört pervane, ön ışıklar (ortak model)
  const { group: drone, rotors, ledMat } = makeQuadModel()
  drone.scale.setScalar(1.3)
  root.add(drone)

  // rüzgâr çorabı: direk ucunda, rüzgâr yönüne dönen ve şiddetle dikleşen koni
  const sockX = 3.2
  root.add(mesh(new THREE.CylinderGeometry(0.04, 0.04, 3, 8), std(0x64748b), [sockX, 1.5, -1]))
  const sockPivot = new THREE.Group()
  sockPivot.position.set(sockX, 3, -1)
  const sock = mesh(new THREE.ConeGeometry(0.22, 1.1, 16, 1, true), std(0xef4444, { side: THREE.DoubleSide, roughness: 0.8 }), [0, -0.55, 0])
  sock.rotation.x = Math.PI // geniş ağız direkte, sivri uç rüzgârın gittiği yönde
  const sockArm = new THREE.Group()
  sockArm.add(sock)
  sockPivot.add(sockArm)
  root.add(sockPivot)

  // rüzgâr çizgileri: kısa doğru parçaları, rüzgârla akar
  const pos = new Float32Array(N_STREAK * 6)
  const seeds = Array.from({ length: N_STREAK }, (_, i) => [((i * 0.618) % 1) * 2 - 1, ((i * 0.377) % 1), ((i * 0.853) % 1) * 2 - 1])
  const streakGeo = new THREE.BufferGeometry()
  streakGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  const streakMat = new THREE.LineBasicMaterial({ color: 0x475569, transparent: true, opacity: 0.45 })
  const streaks = new THREE.LineSegments(streakGeo, streakMat)
  root.add(streaks)
  const sp = seeds.map(([x, y, z]) => new THREE.Vector3(x * BOX.x, 0.3 + y * BOX.y, z * BOX.z))

  let lastRun: unknown = null, lastAspect = 0, spin = 0, gx = 0, gz = 0
  const frameCamera = () => {
    const a = s.camera.aspect
    if (a >= 1.3) s.view([9, 6.5, 15.5], [0, 5, 0])
    else s.view([10.5, 7.5, 20], [0, 5.3, 0])
    lastAspect = a
  }
  frameCamera()

  return {
    frame(run0, dt) {
      const run = run0 as ProjectRun<View>
      const v = run.view
      if (run !== lastRun) { lastRun = run; gx = 0; gz = 0 }
      if (Math.abs(s.camera.aspect - lastAspect) > 0.15) frameCamera()
      // drone konumu ve eğimi (yana sürüklenmeye göre hafif yatış)
      drone.position.set(v.x, v.h + 0.02, 0)
      drone.rotation.z = THREE.MathUtils.lerp(drone.rotation.z, -Math.max(-0.35, Math.min(0.35, v.gx * 0.12)), Math.min(1, dt * 5))
      const thr = v.landed ? 0 : THROTTLE[v.throttle]
      spin += dt * (v.landed ? 2 : 14 + thr * 40)
      rotors.forEach((r, i) => { r.rotation.y = (i % 2 ? -spin : spin) })
      marker.position.y = Math.min(12, v.h + 0.15)
      const k = Math.max(0.25, 1 - v.h / 14)
      shadow.position.x = v.x
      shadow.scale.setScalar(k)
      shadowMat.opacity = 0.35 * k
      // temas flaşı
      if (v.landed && v.flash > 0) {
        const c = v.landed === 'soft' ? 0x22c55e : 0xef4444
        ringMat.color.setHex(c); ringMat.emissive.setHex(c); ringMat.emissiveIntensity = 0.3 + v.flash
        ledMat.color.setHex(c); ledMat.emissive.setHex(c)
      } else {
        ringMat.color.setHex(0xfacc15); ringMat.emissive.setHex(0x000000)
        ledMat.color.setHex(0x22c55e); ledMat.emissive.setHex(0x22c55e)
      }
      // rüzgâr: yumuşatılmış hamle; çorap yönü ve dikliği, çizgilerin akışı
      const a = Math.min(1, dt * 3)
      gx += (v.gx - gx) * a; gz += (v.gz - gz) * a
      const str = Math.min(1, Math.hypot(gx, gz) / 2.5)
      sockPivot.rotation.y = gx >= 0 ? 0 : Math.PI
      sockArm.rotation.z = (Math.PI / 2) * (0.15 + 0.85 * str)
      const vx = gx * 1.8 + (gx >= 0 ? 0.3 : -0.3), vy = gz * 0.6
      const len = 0.15 + 0.5 * str
      for (let i = 0; i < N_STREAK; i++) {
        const p = sp[i]
        p.x += vx * dt; p.y += vy * dt
        if (p.x > BOX.x) p.x -= 2 * BOX.x; if (p.x < -BOX.x) p.x += 2 * BOX.x
        if (p.y > BOX.y) p.y -= BOX.y - 0.3; if (p.y < 0.3) p.y += BOX.y - 0.3
        const n = Math.hypot(vx, vy) || 1, o = i * 6
        pos[o] = p.x; pos[o + 1] = p.y; pos[o + 2] = p.z
        pos[o + 3] = p.x - (vx / n) * len; pos[o + 4] = p.y - (vy / n) * len; pos[o + 5] = p.z
      }
      streakGeo.attributes.position.needsUpdate = true
      streakMat.opacity = 0.15 + 0.45 * str
    },
    // geometri ve malzemeler sahnede kalır; stage.dispose() hepsini dolaşıp serbest bırakır
    dispose() { s.scene.fog = null },
  }
}
