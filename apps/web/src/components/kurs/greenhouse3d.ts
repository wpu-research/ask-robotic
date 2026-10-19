'use client'
// İki dersin (IoT, Sensör-ML) ortak 3B serası: çerçeve ve cam, çatı penceresi, fan, ısıtıcı, sulama, alarm feneri, 5 × 3
// ekim yatağı ve sensör direği. Yalnız sahne modülleri (dinamik import) kullanır. Ölçüler metre: 6 m × 4 m, saçak 2 m.
import * as THREE from 'three'
import { mesh, std } from '@/components/three/core'

export const GH = { w: 6, d: 4, eave: 2, ridge: 3 }

/** Metni değişebilen etiket (tuvale çizilir, yalnız metin değişince yeniden çizilir). */
export function textSprite(width = 1.6, px = 512) {
  const c = document.createElement('canvas')
  c.width = px; c.height = px / 4
  const g = c.getContext('2d')!
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }))
  sprite.scale.set(width, width / 4, 1)
  sprite.renderOrder = 10
  let last = ''
  return {
    sprite,
    set(text: string, bg = '#1f2937') {
      const key = text + bg
      if (key === last) return
      last = key
      g.clearRect(0, 0, c.width, c.height)
      g.fillStyle = bg
      g.beginPath(); if (g.roundRect) g.roundRect(6, 10, c.width - 12, c.height - 20, 26); else g.rect(6, 10, c.width - 12, c.height - 20); g.fill()
      g.fillStyle = '#ffffff'; g.textAlign = 'center'; g.textBaseline = 'middle'
      const lines = text.split('\n')
      // yazı tipi en uzun satır tuvale sığacak kadar küçültülür
      let fs = lines.length > 1 ? 40 : 52
      g.font = `600 ${fs}px Poppins, system-ui, sans-serif`
      const widest = Math.max(...lines.map((l) => g.measureText(l).width))
      if (widest > c.width - 48) { fs = Math.floor((fs * (c.width - 48)) / widest); g.font = `600 ${fs}px Poppins, system-ui, sans-serif` }
      lines.forEach((l, i) => g.fillText(l, c.width / 2, c.height / 2 + (i - (lines.length - 1) / 2) * fs * 1.1))
      tex.needsUpdate = true
    },
  }
}

export interface Greenhouse {
  group: THREE.Group
  beds: THREE.Mesh[][]
  /** Sensör direğinin tepesi (etiket ve paket kaynağı için). */
  sensorTop: THREE.Vector3
  setBeds(t: (r: number, c: number) => number): void
  setWindow(open: number): void
  setFan(on: boolean, dt: number, spin: boolean): void
  setHeater(on: boolean): void
  setPump(on: boolean): void
  setAlarm(level: 0 | 1 | 2): void
  /** Gün ışığına göre gökyüzü rengi (gece koyu). */
  setSun(sun: number, scene: THREE.Scene): void
}

export function makeGreenhouse(): Greenhouse {
  const { w, d, eave, ridge } = GH
  const group = new THREE.Group()

  // zemin: çim ve beton taban
  const grass = mesh(new THREE.PlaneGeometry(16, 14), std(0x9cc18a, { roughness: 0.95 }))
  grass.rotation.x = -Math.PI / 2
  grass.position.y = -0.01
  grass.castShadow = false
  group.add(grass)
  group.add(mesh(new THREE.BoxGeometry(w + 0.2, 0.08, d + 0.2), std(0xc9ccd1, { roughness: 0.9 }), [0, 0.04, 0]))

  // çerçeve
  const frameMat = std(0xe5e7eb, { metalness: 0.5, roughness: 0.35 })
  const post = new THREE.BoxGeometry(0.06, eave, 0.06)
  for (const x of [-w / 2, -w / 6, w / 6, w / 2]) for (const z of [-d / 2, d / 2]) group.add(mesh(post, frameMat, [x, eave / 2, z]))
  const rafterLen = Math.hypot(d / 2, ridge - eave)
  const rafterAng = Math.atan2(ridge - eave, d / 2)
  for (const x of [-w / 2, -w / 6, w / 6, w / 2]) {
    for (const s of [-1, 1]) {
      const r = mesh(new THREE.BoxGeometry(0.05, 0.05, rafterLen), frameMat, [x, (eave + ridge) / 2, (s * d) / 4])
      r.rotation.x = s * rafterAng
      group.add(r)
    }
  }
  group.add(mesh(new THREE.BoxGeometry(w, 0.06, 0.06), frameMat, [0, ridge, 0]))
  for (const z of [-d / 2, d / 2]) group.add(mesh(new THREE.BoxGeometry(w, 0.05, 0.05), frameMat, [0, eave, z]))

  // cam (yarı saydam, gölge düşürmez)
  const glass = new THREE.MeshStandardMaterial({ color: 0xdbeafe, transparent: true, opacity: 0.16, roughness: 0.1, metalness: 0.1, depthWrite: false, side: THREE.DoubleSide })
  const pane = (geo: THREE.BufferGeometry, pos: [number, number, number], rx = 0, ry = 0) => {
    const m = new THREE.Mesh(geo, glass)
    m.position.set(...pos); m.rotation.set(rx, ry, 0)
    group.add(m)
    return m
  }
  pane(new THREE.PlaneGeometry(w, eave), [0, eave / 2, d / 2])
  pane(new THREE.PlaneGeometry(w, eave), [0, eave / 2, -d / 2])
  pane(new THREE.PlaneGeometry(d, eave), [w / 2, eave / 2, 0], 0, Math.PI / 2)
  pane(new THREE.PlaneGeometry(d, eave), [-w / 2, eave / 2, 0], 0, Math.PI / 2)
  const gable = new THREE.Shape([new THREE.Vector2(-d / 2, 0), new THREE.Vector2(d / 2, 0), new THREE.Vector2(0, ridge - eave)])
  for (const x of [-w / 2, w / 2]) pane(new THREE.ShapeGeometry(gable), [x, eave, 0], 0, Math.PI / 2)
  // kuzey çatısı sabit; güney çatısının bir bölümü menteşeli pencere
  const roofN = pane(new THREE.PlaneGeometry(w, rafterLen), [0, (eave + ridge) / 2, -d / 4])
  roofN.rotation.x = -Math.PI / 2 + rafterAng
  const roofS = pane(new THREE.PlaneGeometry(w * (2 / 3), rafterLen), [-w / 6, (eave + ridge) / 2, d / 4])
  roofS.rotation.x = -Math.PI / 2 - rafterAng
  const hinge = new THREE.Group()
  hinge.position.set(w / 3, ridge, 0)
  group.add(hinge)
  const flapMat = new THREE.MeshStandardMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.35, roughness: 0.1, side: THREE.DoubleSide, depthWrite: false })
  const flap = new THREE.Mesh(new THREE.PlaneGeometry(w / 3, rafterLen), flapMat)
  flap.rotation.x = -Math.PI / 2
  flap.position.set(0, 0, rafterLen / 2)
  const flapPivot = new THREE.Group()
  flapPivot.add(flap)
  flapPivot.add(mesh(new THREE.BoxGeometry(w / 3, 0.04, 0.04), frameMat, [0, 0, rafterLen]))
  flapPivot.rotation.x = rafterAng // kapalı: güney çatı eğimiyle aynı
  hinge.add(flapPivot)

  // ekim yatakları
  const soil = std(0x6b4f3a, { roughness: 1 })
  const beds: THREE.Mesh[][] = []
  const rows = 3, cols = 5, bw = 0.85, bd = 0.7
  for (let r = 0; r < rows; r++) {
    const row: THREE.Mesh[] = []
    for (let c = 0; c < cols; c++) {
      const x = -w / 2 + 0.75 + c * 1.12, z = d / 2 - 0.8 - r * 1.2
      group.add(mesh(new THREE.BoxGeometry(bw, 0.25, bd), soil, [x, 0.2, z]))
      const leaf = mesh(new THREE.SphereGeometry(0.3, 16, 10), std(0x22c55e, { roughness: 0.7 }), [x, 0.45, z])
      leaf.scale.set(1.2, 0.55, 1)
      group.add(leaf)
      row.push(leaf)
    }
    beds.push(row)
  }

  // sensör direği (DHT22 + BME280 kutusu)
  group.add(mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.0, 12), frameMat, [0, 0.55, 0.2]))
  group.add(mesh(new THREE.BoxGeometry(0.18, 0.12, 0.08), std(0xf8fafc), [0, 1.1, 0.2]))
  const sensorTop = new THREE.Vector3(0, 1.1, 0.2)

  // fan (doğu duvarı)
  const fanG = new THREE.Group()
  fanG.position.set(w / 2 - 0.05, 1.3, -0.8)
  fanG.rotation.y = Math.PI / 2
  group.add(fanG)
  const ring = mesh(new THREE.TorusGeometry(0.36, 0.035, 8, 32), std(0x475569))
  fanG.add(ring)
  const blades = new THREE.Group()
  fanG.add(blades)
  const bladeMat = std(0x94a3b8, { metalness: 0.3 })
  for (let k = 0; k < 4; k++) { const b = mesh(new THREE.BoxGeometry(0.06, 0.3, 0.02), bladeMat, [0, 0.16, 0]); const p = new THREE.Group(); p.rotation.z = (k * Math.PI) / 2; p.add(b); blades.add(p) }

  // ısıtıcı (kuzeybatı köşe)
  const heaterMat = std(0x7f1d1d, { emissive: 0x000000, roughness: 0.5 })
  group.add(mesh(new THREE.BoxGeometry(0.5, 0.6, 0.25), heaterMat, [-w / 2 + 0.45, 0.4, -d / 2 + 0.3]))

  // sulama: depo + boru (açıkken mavi parlar)
  group.add(mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.9, 20), std(0x60a5fa, { transparent: true, opacity: 0.85 }), [w / 2 + 0.6, 0.45, 1.3]))
  const pipeMat = std(0x334155, { emissive: 0x000000 })
  const pipe = mesh(new THREE.CylinderGeometry(0.03, 0.03, w - 0.6, 10), pipeMat, [0, 0.62, d / 2 - 0.8])
  pipe.rotation.z = Math.PI / 2
  group.add(pipe)

  // alarm feneri (çatı)
  const beaconMat = new THREE.MeshStandardMaterial({ color: 0x9ca3af, emissive: 0x000000, roughness: 0.3 })
  const beacon = mesh(new THREE.SphereGeometry(0.12, 18, 12), beaconMat, [-w / 2 + 0.3, ridge + 0.12, 0])
  group.add(beacon)

  let open = 0, fanAng = 0, t = 0
  const lerpC = new THREE.Color(), DAY = new THREE.Color(0xe6eef2)
  return {
    group, beds, sensorTop,
    setBeds(f) { for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) (beds[r][c].material as THREE.MeshStandardMaterial).color.setHex(f(r, c)) },
    setWindow(o) { open += (Math.max(0, Math.min(1, o)) - open) * 0.15; flapPivot.rotation.x = rafterAng - open * 0.55 },
    setFan(on, dt, spin) { if (on && spin) { fanAng += dt * 14; blades.rotation.z = fanAng }; (ring.material as THREE.MeshStandardMaterial).color.setHex(on ? 0x0ea5e9 : 0x475569) },
    setHeater(on) { heaterMat.emissive.setHex(on ? 0xef4444 : 0x000000); heaterMat.emissiveIntensity = on ? 1.1 : 0 },
    setPump(on) { pipeMat.emissive.setHex(on ? 0x2563eb : 0x000000); pipeMat.emissiveIntensity = on ? 1 : 0 },
    setAlarm(level) {
      t += 0.05
      const pulse = level === 2 ? 0.6 + 0.4 * Math.sin(t * 6) : 1
      beaconMat.emissive.setHex(level === 2 ? 0xef4444 : level === 1 ? 0xf59e0b : 0x000000)
      beaconMat.emissiveIntensity = level ? pulse : 0
    },
    setSun(sun, scene) { lerpC.setHex(0x64748b).lerp(DAY, Math.max(0, Math.min(1, sun * 1.6))); if (scene.background instanceof THREE.Color) scene.background.copy(lerpC) },
  }
}
