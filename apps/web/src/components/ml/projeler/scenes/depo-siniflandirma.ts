// Proje sahnesi: depoda nesne sınıflandırma. Konveyör bandı (bant dokusu tik sayısıyla kayar), tarayıcı kapısı (taramada yanıp
// söner: doğruysa yeşil, yanlışsa kırmızı), dört kutu ve iticiler. Nesneler gerçek biçimleriyle (küp, koni, silindir, küre) bant
// üstünde ilerler, kendi kutularının hizasında yana itilip düşer; yanlış kutuya gidenin üstünde kırmızı işaret yanar.
// Ağ (mesh) havuzu sabittir: karede yeni geometri ya da malzeme oluşturulmaz.
import * as THREE from 'three'
import type { ProjectRun } from '@/lib/ml/projeler/core'
import { BELT, BINS, type DepoView } from '@/lib/ml/projeler/depo-siniflandirma'
import type { MountScene } from '../stage3d'

const BIN_COL = [0xf59e0b, 0x3b82f6, 0x22c55e, 0x8b5e3c]
const TOP = 0.62 // bant üst yüzeyinin yüksekliği (m)
const BIN_Z = -1.3 // kutuların bant eksenine uzaklığı
const POOL = 32
const SIZE_K = 0.014 // boy (cm) → sahne ölçeği (m)

function std(color: number, o: THREE.MeshStandardMaterialParameters = {}) { return new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.05, ...o }) }
function box(w: number, h: number, d: number, mat: THREE.Material, x: number, y: number, z: number, shadow = true) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)
  m.position.set(x, y, z)
  m.castShadow = shadow; m.receiveShadow = true
  return m
}

/** Bant dokusu: koyu zemin üstünde açık enine şeritler (DOM gerektirmez). */
function beltTexture() {
  const W = 64, H = 8, data = new Uint8Array(W * H * 4)
  for (let x = 0; x < W; x++) for (let y = 0; y < H; y++) {
    const on = x % 16 < 3, v = on ? 120 : 52, i = (y * W + x) * 4
    data[i] = v; data[i + 1] = v; data[i + 2] = v + 6; data[i + 3] = 255
  }
  const t = new THREE.DataTexture(data, W, H)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.magFilter = THREE.LinearFilter
  t.colorSpace = THREE.SRGBColorSpace
  t.needsUpdate = true
  return t
}

/** Kutu etiketi: tuvalden doku, sprite olarak kutunun üstünde. */
function label(text: string, color: number) {
  const c = document.createElement('canvas')
  c.width = 256; c.height = 64
  const g = c.getContext('2d')!
  g.fillStyle = '#' + color.toString(16).padStart(6, '0')
  g.beginPath(); if (g.roundRect) g.roundRect(4, 6, 248, 52, 14); else g.rect(4, 6, 248, 52); g.fill()
  g.fillStyle = '#ffffff'; g.font = '600 30px Poppins, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'
  g.fillText(text, 128, 33)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false }))
  sp.scale.set(1.0, 0.25, 1)
  sp.renderOrder = 10
  return sp
}

export const mount: MountScene = (s, lang) => {
  const { scene, camera } = s
  const L = lang === 'tr' ? 0 : 1
  const root = new THREE.Group()
  scene.add(root)

  // zemin
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(16, 10), std(0xcfd6df, { roughness: 0.95 }))
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  root.add(floor)

  // bant: gövde, kayan dokulu üst yüzey, ayaklar
  const x0 = BELT.spawn - 0.6, x1 = BELT.end + 0.4, len = x1 - x0, cx = (x0 + x1) / 2
  const frameMat = std(0x475569, { metalness: 0.4, roughness: 0.5 })
  root.add(box(len, 0.12, 1.0, frameMat, cx, TOP - 0.07, 0))
  const tex = beltTexture()
  tex.repeat.set(len / 0.8, 1)
  const beltTop = new THREE.Mesh(new THREE.PlaneGeometry(len, 0.86), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 }))
  beltTop.rotation.x = -Math.PI / 2
  beltTop.position.set(cx, TOP + 0.002, 0)
  beltTop.receiveShadow = true
  root.add(beltTop)
  for (let x = x0 + 0.3; x < x1; x += 1.6) for (const z of [-0.4, 0.4]) root.add(box(0.08, TOP - 0.12, 0.08, frameMat, x, (TOP - 0.12) / 2, z))

  // tarayıcı kapısı
  const gateMat = std(0x1f2937, { metalness: 0.3 })
  const gx = BELT.scan
  root.add(box(0.1, 1.2, 0.1, gateMat, gx, TOP + 0.6, -0.55), box(0.1, 1.2, 0.1, gateMat, gx, TOP + 0.6, 0.55), box(0.2, 0.14, 1.3, gateMat, gx, TOP + 1.2, 0))
  const lightMat = new THREE.MeshStandardMaterial({ color: 0x111827, emissive: new THREE.Color(0x22d3ee), emissiveIntensity: 0.3 })
  root.add(box(0.12, 0.04, 1.1, lightMat, gx, TOP + 1.12, 0, false))
  const camBox = box(0.16, 0.1, 0.16, std(0x0f172a), gx, TOP + 1.07, 0)
  root.add(camBox)

  // kutular, etiketler, iticiler, doluluk göstergeleri
  const pistons: THREE.Mesh[] = [], fillOk: THREE.Mesh[] = [], fillBad: THREE.Mesh[] = [], pushNow = [0, 0, 0, 0]
  const badMat = std(0xdc2626, { roughness: 0.5 })
  BELT.binX.forEach((bx, c) => {
    const m = std(BIN_COL[c], { roughness: 0.6 })
    const W = 1.0, D = 0.9, H = 0.55, t = 0.04
    root.add(box(W, t, D, m, bx, t / 2, BIN_Z), box(W, H, t, m, bx, H / 2, BIN_Z - D / 2), box(W, H, t, m, bx, H / 2, BIN_Z + D / 2), box(t, H, D, m, bx - W / 2, H / 2, BIN_Z), box(t, H, D, m, bx + W / 2, H / 2, BIN_Z))
    // bant ile kutu arasında kaydırak
    const chute = box(0.8, 0.03, 0.55, std(0x94a3b8, { metalness: 0.5, roughness: 0.4 }), bx, TOP - 0.18, -0.72)
    chute.rotation.x = -0.45
    root.add(chute)
    const lb = label(BINS[c][L], BIN_COL[c])
    lb.position.set(bx, 1.05, BIN_Z - 0.2)
    root.add(lb)
    const fo = box(0.84, 1, 0.74, std(BIN_COL[c], { roughness: 0.9, transparent: true, opacity: 0.55 }), bx, 0, BIN_Z, false)
    fo.visible = false
    const fb = box(0.84, 1, 0.74, badMat, bx, 0, BIN_Z, false)
    fb.visible = false
    root.add(fo, fb)
    fillOk.push(fo); fillBad.push(fb)
    // itici: bandın yakın kenarında bir silindir gövde ve kafa
    root.add(box(0.24, 0.2, 0.34, frameMat, bx, TOP + 0.12, 0.72))
    const head = box(0.5, 0.18, 0.06, std(0xe2e8f0, { metalness: 0.6, roughness: 0.3 }), bx, TOP + 0.12, 0.5)
    root.add(head)
    pistons.push(head)
  })

  // nesne havuzu: her girişte dört biçim (aynı malzeme), biri görünür; üstte yanlış işareti
  const GEOS: THREE.BufferGeometry[] = [new THREE.BoxGeometry(1, 1, 1), new THREE.ConeGeometry(0.5, 1, 24), new THREE.CylinderGeometry(0.4, 0.4, 1, 24), new THREE.SphereGeometry(0.5, 24, 16)]
  const markGeo = new THREE.OctahedronGeometry(0.07)
  const markMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: new THREE.Color(0xef4444), emissiveIntensity: 0.8 })
  const pool = Array.from({ length: POOL }, () => {
    const g = new THREE.Group()
    const mat = std(0xffffff, { roughness: 0.55 })
    const meshes = GEOS.map((geo) => { const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.visible = false; g.add(m); return m })
    const mark = new THREE.Mesh(markGeo, markMat)
    mark.visible = false
    root.add(mark)
    g.visible = false
    root.add(g)
    return { g, mat, meshes, mark, id: -1 }
  })

  // kamera: bandın tamamı görünsün (en-boy oranına göre uzaklık); kullanıcı döndürdükten sonra dokunulmaz
  let fitAspect = 0, userMoved = false
  s.controls.addEventListener('start', () => { userMoved = true })
  const fit = () => {
    const vf = (camera.fov * Math.PI) / 180, hf = 2 * Math.atan(Math.tan(vf / 2) * camera.aspect)
    const dist = Math.max(5.6 / Math.tan(hf / 2), 2.4 / Math.tan(vf / 2)) * 1.02
    const e = (36 * Math.PI) / 180
    s.view([0.1, Math.sin(e) * dist + 0.3, Math.cos(e) * dist - 0.4], [0.1, 0.35, -0.4])
    fitAspect = camera.aspect
  }
  fit()

  let lastRun: unknown = null, lastTick = 0, t = 0
  const col = new THREE.Color()
  return {
    frame(run0, dt) {
      const run = run0 as ProjectRun<DepoView>
      const v = run.view
      t += dt
      if (!userMoved && Math.abs(camera.aspect - fitAspect) > 0.01) fit()
      if (run !== lastRun) { lastRun = run; lastTick = v.tick; for (const e of pool) { e.g.visible = false; e.mark.visible = false; e.id = -1 } }
      // bant dokusu tik başına bant hızı kadar kayar (duraklatınca durur)
      const dTick = v.tick - lastTick
      lastTick = v.tick
      tex.offset.x -= (dTick * BELT.speed) / 0.8

      // nesneler
      const used = new Set<number>()
      let lastScan: { pred?: number; c: number; id: number } | null = null
      for (const o of v.objs) {
        const e = pool[o.id % POOL]
        used.add(o.id % POOL)
        if (e.id !== o.id) {
          e.id = o.id
          e.meshes.forEach((m, k) => { m.visible = k === o.shape })
          e.mat.color.copy(col.setHSL(o.hue, 0.62, 0.5))
          const sc = o.size * SIZE_K
          e.g.scale.set(sc, sc, sc)
          e.g.rotation.set(0, (o.id * 0.9) % Math.PI, 0)
        }
        const h = o.size * SIZE_K
        let y = TOP + h / 2, z = 0
        if (o.push !== undefined) {
          z = -o.push * Math.abs(BIN_Z)
          if (o.push > 0.4) y = TOP + h / 2 - ((o.push - 0.4) / 0.6) * (TOP - 0.1)
        }
        e.g.position.set(o.x, Math.max(h / 2 + 0.04, y), z)
        e.g.visible = true
        const bad = o.pred !== undefined && o.pred !== o.c
        e.mark.visible = bad
        if (bad) e.mark.position.set(o.x, e.g.position.y + h / 2 + 0.16 + Math.sin(t * 6) * 0.03, z)
        if (o.pred !== undefined && (!lastScan || o.id > lastScan.id)) lastScan = o
      }
      pool.forEach((e, i) => { if (!used.has(i) && e.g.visible) { e.g.visible = false; e.mark.visible = false; e.id = -1 } })

      // tarayıcı ışığı: taramadan sonra kısa bir parlama
      const k = v.tick - v.scanTick
      const flash = k >= 0 && k < 14 ? 1 - k / 14 : 0
      lightMat.emissive.setHex(lastScan && lastScan.pred !== lastScan.c && flash > 0 ? 0xef4444 : flash > 0 ? 0x22c55e : 0x22d3ee)
      lightMat.emissiveIntensity = 0.3 + 2.2 * flash

      // iticiler: kendi kutusuna itilen nesneyle birlikte uzanır, sonra yavaşça geri çekilir
      pushNow.fill(0)
      for (const o of v.objs) if (o.push !== undefined && o.pred !== undefined) pushNow[o.pred] = Math.max(pushNow[o.pred], Math.min(1, o.push * 2.2))
      pistons.forEach((p, c) => {
        const want = 0.5 - pushNow[c] * 0.85
        p.position.z = pushNow[c] > 0 ? Math.min(p.position.z, want) : Math.min(0.5, p.position.z + dt * 1.5)
      })

      // kutu doluluğu: doğrular kutu renginde, yanlışlar üstte kırmızı
      BELT.binX.forEach((_, c) => {
        const ho = v.binOk[c] * 0.008, hb = v.binBad[c] * 0.008
        fillOk[c].visible = ho > 0; fillBad[c].visible = hb > 0
        fillOk[c].scale.y = Math.max(1e-3, ho); fillOk[c].position.y = 0.04 + ho / 2
        fillBad[c].scale.y = Math.max(1e-3, hb); fillBad[c].position.y = 0.04 + ho + hb / 2
      })
    },
    dispose() {
      // sahneden çıkar ve bu sahnenin bütün geometri, malzeme ve dokularını serbest bırak
      scene.remove(root)
      root.traverse((o) => {
        const m = o as THREE.Mesh
        m.geometry?.dispose()
        const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : []
        for (const mat of mats) { (mat as THREE.MeshStandardMaterial).map?.dispose(); mat.dispose() }
      })
      tex.dispose()
    },
  }
}
