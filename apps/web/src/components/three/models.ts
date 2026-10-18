'use client'
// 3B robot modelleri. Ölçüler metre (kol hariç: cm). Her model güncellenecek parçalarını adıyla döndürür.
// Ön yön +X; tekerlekler Z ekseninde (sol = -Z yönü değil: düzlemde sol +y, dünyada -Z).
import * as THREE from 'three'
import { mesh, std } from './core'

const LED_ON = new THREE.Color(0xff3b30)
const LED_OFF = new THREE.Color(0x2a1416)

export interface Card { group: THREE.Group; setLeds(frame: ArrayLike<number> | null): void }

/** Mikro Kart: 5x5 LED'li yeşil-mavi kart (robotun beyni). `w` kart genişliği. */
export function makeCard(w: number): Card {
  const group = new THREE.Group()
  const t = w * 0.06
  group.add(mesh(new THREE.BoxGeometry(w, t, w * 0.82), std(0x0f9488, { roughness: 0.4 }), [0, t / 2, 0]))
  const pitch = (w * 0.62) / 5
  const geo = new THREE.BoxGeometry(pitch * 0.62, t * 0.6, pitch * 0.62)
  const leds: THREE.MeshStandardMaterial[] = []
  for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
    const mat = std(0x111111, { emissive: LED_OFF.clone(), emissiveIntensity: 1, roughness: 0.3 })
    leds.push(mat)
    // Satır 0 kartın önünde (+X), sütun 0 solda (-Z)
    group.add(mesh(geo, mat, [(2 - r) * pitch, t + t * 0.3, (c - 2) * pitch]))
  }
  for (const s of [-1, 1]) group.add(mesh(new THREE.CylinderGeometry(w * 0.07, w * 0.07, t * 0.5, 16), std(0xf8fafc), [-w * 0.05, t * 1.1, s * w * 0.33]))
  return {
    group,
    setLeds(frame) {
      for (let i = 0; i < 25; i++) {
        const b = frame ? frame[i] / 255 : 0
        leds[i].emissive.copy(LED_OFF).lerp(LED_ON, b)
        leds[i].emissiveIntensity = 0.4 + b * 1.6
      }
    },
  }
}

function wheel(r: number, w: number, color = 0x1f2937): THREE.Group {
  const g = new THREE.Group()
  const tire = mesh(new THREE.CylinderGeometry(r, r, w, 28), std(color, { roughness: 0.9 }))
  tire.rotation.x = Math.PI / 2
  const hub = mesh(new THREE.CylinderGeometry(r * 0.45, r * 0.45, w * 1.05, 6), std(0xe5e7eb))
  hub.rotation.x = Math.PI / 2
  // tekerleğin döndüğü belli olsun diye bir jant kolu
  const spoke = mesh(new THREE.BoxGeometry(r * 1.5, r * 0.18, w * 1.1), std(0x94a3b8))
  g.add(tire, hub, spoke)
  return g
}

export interface MobileModel {
  group: THREE.Group
  wheelL: THREE.Group
  wheelR: THREE.Group
  card?: Card
  /** Işık rengini ayarlar (durum ışığı ya da farlar). */
  setLights?(css: string | null): void
  bumper?: THREE.Mesh
  servoHead?: THREE.Group
  lineDots?: THREE.Mesh[]
  bumpers?: [THREE.Mesh, THREE.Mesh]
  /** Kıskaçlı gövde: parmakları açar/kapatır. */
  setGrip?(closed: boolean): void
}

/** Blok Robotu: sarı yapı parçası gövde, üstte Mikro Kart, önde mesafe sensörü ve tampon, altta renk sensörü. */
export function makeBlokRobot(wheelBase: number, wheelDiameter: number): MobileModel {
  const group = new THREE.Group()
  const r = wheelDiameter / 2
  const bodyH = 0.05
  const body = mesh(new THREE.BoxGeometry(0.13, bodyH, wheelBase - 0.03), std(0xfacc15), [0, r + 0.004, 0])
  group.add(body)
  // yapı parçası çıkıntıları
  const studGeo = new THREE.CylinderGeometry(0.0045, 0.0045, 0.004, 12)
  const studMat = std(0xfde047)
  for (const sx of [-0.05, 0.05]) for (const sz of [-0.03, 0, 0.03]) group.add(mesh(studGeo, studMat, [sx, r + 0.004 + bodyH / 2 + 0.002, sz]))
  const card = makeCard(0.07)
  card.group.position.set(0, r + 0.004 + bodyH / 2 + 0.003, 0)
  group.add(card.group)
  const statusMat = std(0x475569, { emissive: new THREE.Color(0x000000), emissiveIntensity: 1.5 })
  group.add(mesh(new THREE.SphereGeometry(0.006, 16, 12), statusMat, [-0.045, r + bodyH + 0.012, 0]))
  // mesafe sensörü: iki "göz"
  const eye = new THREE.CylinderGeometry(0.008, 0.008, 0.012, 20)
  for (const s of [-1, 1]) { const m = mesh(eye, std(0x111827), [0.072, r + 0.02, s * 0.013]); m.rotation.z = Math.PI / 2; group.add(m) }
  group.add(mesh(new THREE.BoxGeometry(0.01, 0.022, 0.05), std(0xf8fafc), [0.066, r + 0.02, 0]))
  const bumper = mesh(new THREE.BoxGeometry(0.008, 0.016, 0.07), std(0x94a3b8), [0.079, r - 0.006, 0])
  group.add(bumper)
  // renk sensörü (altta, önde)
  group.add(mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.01, 16), std(0x111827), [0.04, 0.012, 0]))
  // sarhoş teker (arka)
  group.add(mesh(new THREE.SphereGeometry(0.009, 16, 12), std(0x9ca3af, { metalness: 0.6 }), [-0.05, 0.009, 0]))
  const wheelL = wheel(r, 0.018), wheelR = wheel(r, 0.018)
  wheelL.position.set(0, r, -wheelBase / 2)
  wheelR.position.set(0, r, wheelBase / 2)
  group.add(wheelL, wheelR)
  return {
    group, wheelL, wheelR, card, bumper,
    setLights(css) { statusMat.color.set(css ?? '#475569'); statusMat.emissive.set(css ?? '#000000') },
  }
}

/** Kıskaçlı Robot: Blok Robotu gövdesi, tampon yerine önde iki parmaklı kıskaç. */
export function makeKiskacRobot(wheelBase: number, wheelDiameter: number): MobileModel {
  const m = makeBlokRobot(wheelBase, wheelDiameter)
  const r = wheelDiameter / 2
  m.bumper?.removeFromParent()
  m.group.children.forEach((c) => { if ((c as THREE.Mesh).isMesh && c !== m.bumper) { const mat = (c as THREE.Mesh).material as THREE.MeshStandardMaterial; if (mat?.color?.getHex() === 0xfacc15) mat.color.set(0xfb923c) } })
  const jawMat = std(0x475569, { metalness: 0.4 })
  m.group.add(mesh(new THREE.BoxGeometry(0.012, 0.02, 0.07), jawMat, [0.078, r + 0.005, 0]))
  const fingers = [-1, 1].map((s) => mesh(new THREE.BoxGeometry(0.05, 0.022, 0.006), jawMat, [0.105, r - 0.005, s * 0.03]))
  m.group.add(...fingers)
  return {
    ...m, bumper: undefined,
    setGrip(closed) { fingers.forEach((f, i) => { f.position.z = (i ? 1 : -1) * (closed ? 0.024 : 0.034) }) },
  }
}

/** Mini Gezgin: yuvarlak kubbeli gövde, önde ultrasonik sensör ve iki renkli far, üstte Mikro Kart. */
export function makeGezginRobot(wheelBase: number, wheelDiameter: number): MobileModel {
  const group = new THREE.Group()
  const r = wheelDiameter / 2
  const base = mesh(new THREE.CylinderGeometry(0.052, 0.055, 0.03, 40), std(0x22d3ee), [0, r + 0.008, 0])
  const dome = mesh(new THREE.SphereGeometry(0.05, 40, 16, 0, Math.PI * 2, 0, Math.PI / 2), std(0xecfeff, { roughness: 0.35 }), [0, r + 0.023, 0])
  dome.scale.y = 0.55
  group.add(base, dome)
  const card = makeCard(0.042)
  card.group.position.set(-0.004, r + 0.048, 0)
  group.add(card.group)
  const usGeo = new THREE.CylinderGeometry(0.0075, 0.0075, 0.01, 20)
  for (const s of [-1, 1]) { const m = mesh(usGeo, std(0xcbd5e1, { metalness: 0.7, roughness: 0.25 }), [0.054, r + 0.012, s * 0.013]); m.rotation.z = Math.PI / 2; group.add(m) }
  const eyeMats = [0, 1].map(() => std(0x475569, { emissive: new THREE.Color(0x000000), emissiveIntensity: 2 }))
  eyeMats.forEach((mat, i) => group.add(mesh(new THREE.SphereGeometry(0.0055, 16, 12), mat, [0.048, r + 0.028, (i ? 1 : -1) * 0.022])))
  group.add(mesh(new THREE.SphereGeometry(0.008, 16, 12), std(0x9ca3af, { metalness: 0.6 }), [-0.04, 0.008, 0]))
  const wheelL = wheel(r, 0.012, 0x334155), wheelR = wheel(r, 0.012, 0x334155)
  wheelL.position.set(0.005, r, -wheelBase / 2)
  wheelR.position.set(0.005, r, wheelBase / 2)
  group.add(wheelL, wheelR)
  return {
    group, wheelL, wheelR, card,
    setLights(css) { for (const m of eyeMats) { m.color.set(css ?? '#475569'); m.emissive.set(css ?? '#000000') } },
  }
}

/** Robotik modülü arenası: iki katlı akrilik şasi, Arduino, servo üstünde HC-SR04, önde çizgi sensörü dizisi. */
export function makeArenaRover(o: { wheelBase: number; wheelRadius: number; ultrasonic: boolean; lineSensors: ReadonlyArray<{ x: number; y: number }>; bumpers: boolean }): MobileModel {
  const group = new THREE.Group()
  const r = o.wheelRadius
  const plate = new THREE.CylinderGeometry(0.075, 0.075, 0.004, 48)
  const acrylic = std(0xbfdbfe, { transparent: true, opacity: 0.85, roughness: 0.15 })
  group.add(mesh(plate, acrylic, [0, r * 0.7, 0]), mesh(plate, acrylic, [0, r * 0.7 + 0.035, 0]))
  for (const [sx, sz] of [[0.04, 0.04], [0.04, -0.04], [-0.04, 0.04], [-0.04, -0.04]]) group.add(mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.035, 8), std(0xd4af37, { metalness: 0.8 }), [sx, r * 0.7 + 0.0175, sz]))
  group.add(mesh(new THREE.BoxGeometry(0.068, 0.003, 0.053), std(0x1d4ed8), [-0.01, r * 0.7 + 0.039, 0]))
  group.add(mesh(new THREE.BoxGeometry(0.05, 0.018, 0.035), std(0x111827), [-0.02, r * 0.7 + 0.012, 0]))
  let servoHead: THREE.Group | undefined
  if (o.ultrasonic) {
    servoHead = new THREE.Group()
    servoHead.position.set(0.055, r * 0.7 + 0.045, 0)
    servoHead.add(mesh(new THREE.BoxGeometry(0.012, 0.02, 0.045), std(0x1d4ed8), [0, 0.01, 0]))
    for (const s of [-1, 1]) { const m = mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.012, 20), std(0xcbd5e1, { metalness: 0.7, roughness: 0.25 }), [0.01, 0.01, s * 0.013]); m.rotation.z = Math.PI / 2; servoHead.add(m) }
    group.add(mesh(new THREE.BoxGeometry(0.023, 0.012, 0.012), std(0x1e3a8a), [0.055, r * 0.7 + 0.04, 0]), servoHead)
  }
  const lineDots = o.lineSensors.map((s) => mesh(new THREE.BoxGeometry(0.006, 0.004, 0.006), std(0x64748b, { emissive: new THREE.Color(0x000000), emissiveIntensity: 2 }), [s.x, 0.006, -s.y]))
  if (lineDots.length) group.add(mesh(new THREE.BoxGeometry(0.012, 0.003, 0.07), std(0x064e3b), [lineDots[0].position.x, 0.009, 0]), ...lineDots)
  let bumpers: [THREE.Mesh, THREE.Mesh] | undefined
  if (o.bumpers) {
    bumpers = [-1, 1].map((s) => mesh(new THREE.BoxGeometry(0.006, 0.014, 0.035), std(0x94a3b8), [0.08, r * 0.7, s * 0.025])) as [THREE.Mesh, THREE.Mesh]
    group.add(...bumpers)
  }
  group.add(mesh(new THREE.SphereGeometry(0.01, 16, 12), std(0x9ca3af, { metalness: 0.6 }), [-0.055, 0.01, 0]))
  const wheelL = wheel(r, 0.025, 0xf59e0b), wheelR = wheel(r, 0.025, 0xf59e0b)
  wheelL.position.set(0, r, -o.wheelBase / 2)
  wheelR.position.set(0, r, o.wheelBase / 2)
  group.add(wheelL, wheelR)
  return { group, wheelL, wheelR, servoHead, lineDots, bumpers }
}

/** Mobil modeli düzlem durumuna göre yerleştirir; tekerlek açıları derece. */
export function poseMobile(m: MobileModel, x: number, y: number, theta: number, wheelDegL: number, wheelDegR: number) {
  m.group.position.set(x, 0, -y)
  m.group.rotation.y = theta
  // ileri giden tekerlek +Z ekseni etrafında eksi yönde döner
  m.wheelL.rotation.z = (-wheelDegL * Math.PI) / 180
  m.wheelR.rotation.z = (-wheelDegR * Math.PI) / 180
}

// ---------------- robot kol (birim: cm) ----------------
export interface ArmModel { group: THREE.Group; shoulder: THREE.Group; elbow: THREE.Group; fingers: [THREE.Mesh, THREE.Mesh]; tip: THREE.Object3D }

export function makeArm(l1: number, l2: number): ArmModel {
  const group = new THREE.Group()
  group.add(mesh(new THREE.CylinderGeometry(4, 5, 2, 32), std(0x334155), [0, -1, 0]))
  group.add(mesh(new THREE.BoxGeometry(3, 2.4, 3.2), std(0x1d4ed8), [0, 0.2, 0]))
  const shoulder = new THREE.Group()
  group.add(shoulder)
  const upper = mesh(new THREE.BoxGeometry(l1, 1.6, 2), std(0xf97316), [l1 / 2, 0, 0])
  shoulder.add(upper, mesh(new THREE.CylinderGeometry(1.3, 1.3, 2.6, 24), std(0x0f172a), [0, 0, 0]).rotateX(Math.PI / 2))
  const elbow = new THREE.Group()
  elbow.position.set(l1, 0, 0)
  shoulder.add(elbow)
  elbow.add(mesh(new THREE.BoxGeometry(l2, 1.2, 1.6), std(0xfb923c), [l2 / 2, 0, 0]), mesh(new THREE.CylinderGeometry(1.05, 1.05, 2.2, 24), std(0x0f172a)).rotateX(Math.PI / 2))
  const tip = new THREE.Object3D()
  tip.position.set(l2, 0, 0)
  elbow.add(tip)
  tip.add(mesh(new THREE.BoxGeometry(0.8, 1.6, 2), std(0x475569)))
  const fingerGeo = new THREE.BoxGeometry(0.5, 2.2, 0.8)
  const fingers = [-1, 1].map((s) => { const f = mesh(fingerGeo, std(0x94a3b8, { metalness: 0.5 }), [0.6, -1.4, s * 0.8]); return f }) as [THREE.Mesh, THREE.Mesh]
  tip.add(...fingers)
  return { group, shoulder, elbow, fingers, tip }
}

/** q1 omuz (°, +x'ten yukarı), q2 dirsek (ön kolun mutlak açısı q1 - q2). */
export function poseArm(a: ArmModel, q1: number, q2: number, open: boolean) {
  a.shoulder.rotation.z = (q1 * Math.PI) / 180
  a.elbow.rotation.z = (-q2 * Math.PI) / 180
  // tutucu her zaman aşağı baksın: ucun mutlak açısını sıfırla
  a.tip.rotation.z = -((q1 - q2) * Math.PI) / 180
  const gap = open ? 1.2 : 0.45
  a.fingers[0].position.z = -gap
  a.fingers[1].position.z = gap
}

// ---------------- dengeleyen robot (metre) ----------------
export interface BalancerModel { group: THREE.Group; body: THREE.Group; wheels: THREE.Group[] }

export function makeBalancer(): BalancerModel {
  const group = new THREE.Group()
  const R = 0.042
  const body = new THREE.Group()
  body.position.y = R
  group.add(body)
  body.add(mesh(new THREE.BoxGeometry(0.05, 0.24, 0.1), std(0x6366f1), [0, 0.12, 0]))
  body.add(mesh(new THREE.BoxGeometry(0.052, 0.004, 0.102), std(0xe0e7ff), [0, 0.08, 0]), mesh(new THREE.BoxGeometry(0.052, 0.004, 0.102), std(0xe0e7ff), [0, 0.16, 0]))
  body.add(mesh(new THREE.BoxGeometry(0.03, 0.03, 0.06), std(0x1d4ed8), [0.012, 0.2, 0]))
  body.add(mesh(new THREE.BoxGeometry(0.012, 0.012, 0.018), std(0x0f172a), [0.028, 0.12, 0]))
  const wheels = [-1, 1].map((s) => { const w = wheel(R, 0.02); w.position.set(0, R, s * 0.065); group.add(w); return w })
  return { group, body, wheels }
}

/** Eğim (°, + = ileri), x (m). */
export function poseBalancer(b: BalancerModel, x: number, thetaDeg: number) {
  b.group.position.x = x
  b.body.rotation.z = (-thetaDeg * Math.PI) / 180
  for (const w of b.wheels) w.rotation.z = -x / 0.042
}
