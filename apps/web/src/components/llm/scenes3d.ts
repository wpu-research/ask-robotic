'use client'
// LLM dersi 3B sahneleri (three.js yalnız istemcide; sims3d.ts bu dosyayı dinamik import eder). Altyapı ML projelerinin
// sahnesiyle aynı (createP3Stage: piksel oranı ≤ 1,5, gizliyken döngü durur, kaldırılınca her şey serbest bırakılır).
// Sahneler durum hesaplamaz: her karede get() ile lib/llm/space3d ve lib/llm/attn3d'nin saf sonucunu okuyup çizer.
import * as THREE from 'three'
import { createP3Stage, webglOk } from '@/components/ml/projeler/stage3d'
import { arcPoint, type AttnScene } from '@/lib/llm/attn3d'
import type { Link, V3 } from '@/lib/llm/space3d'

export { webglOk }

/** 2B görüntüleyiciyle aynı not renkleri. */
export const GROUP_COLORS = ['#0f766e', '#b7791f', '#2c6cb0', '#c43d36', '#7c3aed', '#2f8a57', '#db2777', '#6b5848']
const R = 2.2 // [−1, 1] küpü dünyada [−R, R]
const LINK_COLOR: Record<Link['kind'], number> = { aday: 0x94a3b8, ust: 0xf5b301, kullanilan: 0x22c55e, elenen: 0xef4444 }

/** Tuvalden yazı sprite'ı: koyu hap zemin üstünde beyaz yazı; yükseklik dünya biriminde. */
function textSprite(text: string, opts: { h?: number; bg?: string; fg?: string; bold?: boolean } = {}): THREE.Sprite {
  const px = 44, pad = 16
  const c = document.createElement('canvas')
  const g0 = c.getContext('2d')!
  const font = `${opts.bold ? 700 : 600} ${px}px Poppins, system-ui, sans-serif`
  g0.font = font
  const w = Math.ceil(g0.measureText(text).width) + pad * 2
  c.width = Math.min(1024, w); c.height = px + pad
  const g = c.getContext('2d')!
  g.fillStyle = opts.bg ?? 'rgba(15,23,42,0.86)'
  g.beginPath(); if (g.roundRect) g.roundRect(0, 0, c.width, c.height, c.height / 2); else g.rect(0, 0, c.width, c.height); g.fill()
  g.fillStyle = opts.fg ?? '#ffffff'; g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle'
  g.fillText(text, c.width / 2, c.height / 2 + 2, c.width - pad)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }))
  const h = opts.h ?? 0.2
  sp.scale.set(h * c.width / c.height, h, 1)
  sp.renderOrder = 10
  return sp
}
function dropSprite(sp: THREE.Sprite) {
  sp.removeFromParent()
  sp.material.map?.dispose()
  sp.material.dispose()
}
/** Anahtarı değişince yeniden kurulan sprite kümesi (etiketler her karede değil, yalnız değişince çizilir). */
function spriteSet(parent: THREE.Object3D) {
  let key = ''
  let list: THREE.Sprite[] = []
  return {
    sync(k: string, make: () => THREE.Sprite[]) {
      if (k === key) return list
      key = k
      for (const s of list) dropSprite(s)
      list = make()
      for (const s of list) parent.add(s)
      return list
    },
    get: () => list,
  }
}
const reduceMotion = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
const toWorld = (p: V3, flat: number): THREE.Vector3 => new THREE.Vector3(p[0] * R, p[1] * R, p[2] * R * (1 - flat))

/* ---------------- 3B gömme uzayı ---------------- */
export interface SpaceDraw {
  /** Noktalar değişince artar (özellik türü, parça boyu…). */
  version: number
  points: Array<{ pos: V3; group: number }>
  axes: [string, string, string]
  query: V3 | null
  queryLabel: string
  links: Array<Link & { label: string }>
  /** Bağların sorgudan hedefe doğru uzama oranı (0..1). */
  grow: number
  /** Etiketi gösterilecek noktalar (komşular). */
  labels: Array<{ index: number; text: string }>
  /** Vurgu (büyük küre) alacak noktalar. */
  hot: number[]
  flat: boolean
}

export interface SceneHandle { dispose(): void; setFlat?(flat: boolean): void }

export function mountSpaceScene(host: HTMLElement, get: () => SpaceDraw, onFrame?: (dt: number) => void): SceneHandle {
  const s = createP3Stage(host, { background: 0x0f1726 })
  const reduce = reduceMotion()
  s.controls.maxPolarAngle = Math.PI
  s.controls.minDistance = 2
  s.controls.maxDistance = 16
  s.controls.enablePan = false
  const front: [number, number, number] = [0, 0, 7.4]
  const persp: [number, number, number] = [4.6, 3.2, 5.4]
  const fit = (p: [number, number, number]) => { const k = s.camera.aspect < 0.9 ? 1.45 : s.camera.aspect < 1.3 ? 1.15 : 1; return p.map((v) => v * k) as [number, number, number] }
  s.view(fit(persp), [0, 0, 0])
  s.controls.autoRotate = false

  // eksenler: üç ince çizgi ve PC etiketleri
  const axisMat = new THREE.LineBasicMaterial({ color: 0x475569 })
  const axisPts = [[[-R, 0, 0], [R, 0, 0]], [[0, -R, 0], [0, R, 0]], [[0, 0, -R], [0, 0, R]]] as const
  const axisLines = axisPts.map((ab) => { const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(ab.map((v) => new THREE.Vector3(...v))), axisMat); s.scene.add(l); return l })
  const axisLabels = spriteSet(s.scene)
  const box = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(2 * R, 2 * R, 2 * R)), new THREE.LineBasicMaterial({ color: 0x1e293b }))
  s.scene.add(box)

  // noktalar: not başına bir malzeme, ortak küre geometrisi
  const sphere = new THREE.SphereGeometry(0.075, 18, 12)
  const mats = GROUP_COLORS.map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.45, emissive: c, emissiveIntensity: 0.25 }))
  const cloud = new THREE.Group()
  s.scene.add(cloud)
  let meshes: THREE.Mesh[] = []
  let version = -1

  // sorgu: parlak sekizyüzlü
  const qMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.14), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xf5b301, emissiveIntensity: 0.6 }))
  s.scene.add(qMesh)
  const qLabel = spriteSet(s.scene)

  // bağlar: en çok 10 çizgi, konumları yerinde güncellenir
  const linkObjs = Array.from({ length: 10 }, () => {
    const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()])
    const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 }))
    line.visible = false
    s.scene.add(line)
    return line
  })
  const scoreLabels = spriteSet(s.scene)
  const pointLabels = spriteSet(s.scene)

  let flat = 0, flatTarget = get().flat ? 1 : 0, spin = 0
  const applyFlat = (f: boolean) => {
    flatTarget = f ? 1 : 0
    s.controls.enableRotate = !f
    s.view(fit(f ? front : persp), [0, 0, 0])
  }
  if (flatTarget) applyFlat(true)

  s.onFrame = (dt) => {
    onFrame?.(dt)
    const d = get()
    const want = d.flat ? 1 : 0
    if (want !== flatTarget) applyFlat(d.flat)
    flat = reduce ? flatTarget : flat + (flatTarget - flat) * Math.min(1, dt * 5)
    if (Math.abs(flat - flatTarget) < 1e-3) flat = flatTarget
    if (d.version !== version) {
      version = d.version
      for (const m of meshes) m.removeFromParent()
      meshes = d.points.map((p) => { const m = new THREE.Mesh(sphere, mats[p.group % mats.length]); cloud.add(m); return m })
    }
    const hot = new Set(d.hot)
    d.points.forEach((p, i) => { const m = meshes[i]; if (!m) return; m.position.copy(toWorld(p.pos, flat)); m.scale.setScalar(hot.has(i) ? 1.9 : 1) })
    axisLines[2].scale.z = 1 - flat
    box.scale.z = Math.max(0.001, 1 - flat)
    axisLabels.sync(`${d.axes.join('|')}`, () => d.axes.map((t, i) => { const sp = textSprite(t, { h: 0.17, bg: 'rgba(30,41,59,0.9)', fg: '#cbd5e1' }); sp.userData.axis = i; return sp }))
    for (const sp of axisLabels.get()) { const i = sp.userData.axis as number; sp.position.set(i === 0 ? R + 0.25 : 0, i === 1 ? R + 0.2 : 0, i === 2 ? (R + 0.25) * (1 - flat) : 0); sp.visible = !(i === 2 && flat > 0.9) }

    // sorgu
    qMesh.visible = !!d.query
    const qw = d.query ? toWorld(d.query, flat) : new THREE.Vector3()
    if (d.query) { qMesh.position.copy(qw); spin += reduce ? 0 : dt; qMesh.rotation.set(spin * 0.7, spin, 0) }
    qLabel.sync(d.query ? d.queryLabel : '', () => (d.query ? [textSprite(d.queryLabel, { h: 0.2, bg: 'rgba(245,179,1,0.95)', fg: '#111827', bold: true })] : []))
    for (const sp of qLabel.get()) sp.position.set(qw.x, qw.y + 0.3, qw.z)

    // bağlar ve kosinüs etiketleri
    const g = Math.min(1, Math.max(0, d.grow))
    linkObjs.forEach((line, i) => {
      const l = d.links[i]
      if (!l || !d.query || !d.points[l.index]) { line.visible = false; return }
      const b = toWorld(d.points[l.index].pos, flat)
      const e = qw.clone().lerp(b, g)
      const pos = line.geometry.getAttribute('position') as THREE.BufferAttribute
      pos.setXYZ(0, qw.x, qw.y, qw.z); pos.setXYZ(1, e.x, e.y, e.z); pos.needsUpdate = true
      line.geometry.computeBoundingSphere()
      const m = line.material as THREE.LineBasicMaterial
      m.color.setHex(LINK_COLOR[l.kind]); m.opacity = l.kind === 'aday' ? 0.55 : l.kind === 'elenen' ? 0.5 : 1
      line.visible = true
    })
    const linkKey = d.query ? d.links.map((l) => `${l.index}:${l.label}:${l.kind}`).join(',') : ''
    scoreLabels.sync(linkKey, () => (d.query ? d.links.slice(0, 10).map((l) => textSprite(l.label, { h: 0.15, bg: l.kind === 'aday' ? 'rgba(71,85,105,0.85)' : l.kind === 'kullanilan' ? 'rgba(21,128,61,0.92)' : l.kind === 'elenen' ? 'rgba(153,27,27,0.9)' : 'rgba(146,104,0,0.92)' })) : []))
    scoreLabels.get().forEach((sp, i) => {
      const l = d.links[i]
      if (!l || !d.points[l.index]) { sp.visible = false; return }
      const b = toWorld(d.points[l.index].pos, flat)
      sp.position.copy(qw.clone().lerp(b, 0.55)); sp.position.y += 0.08
      sp.visible = g > 0.5
    })
    pointLabels.sync(d.labels.map((x) => `${x.index}:${x.text}`).join('|'), () => d.labels.map((x) => textSprite(x.text, { h: 0.15, bg: `${GROUP_COLORS[(d.points[x.index]?.group ?? 0) % GROUP_COLORS.length]}e6` })))
    pointLabels.get().forEach((sp, i) => {
      const x = d.labels[i]
      if (!x || !d.points[x.index]) { sp.visible = false; return }
      const b = toWorld(d.points[x.index].pos, flat)
      sp.position.set(b.x, b.y - 0.22, b.z); sp.visible = true
    })
  }

  return {
    setFlat: applyFlat,
    dispose() { s.onFrame = null; for (const st of [axisLabels, qLabel, scoreLabels, pointLabels]) st.sync('§', () => []); s.dispose() },
  }
}

/* ---------------- 3B dikkat yayları ---------------- */
export interface AttnDraw { scene: AttnScene; query: number; key: string }

export function mountAttnScene(host: HTMLElement, lang: 'tr' | 'en', get: () => AttnDraw, onPick: (i: number) => void): SceneHandle {
  const s = createP3Stage(host, { background: 0x0f1726 })
  const reduce = reduceMotion()
  s.controls.maxPolarAngle = Math.PI / 2 + 0.25
  s.controls.minDistance = 3
  s.controls.maxDistance = 18
  s.controls.enablePan = false
  const fit = () => { const k = s.camera.aspect < 0.9 ? 1.8 : s.camera.aspect < 1.3 ? 1.45 : 1; s.view([0.8 * k, 2.6 * k, 6.4 * k], [0, 0.7, 0]) }
  fit()

  const grid = new THREE.GridHelper(10, 20, 0x334155, 0x1e2636)
  grid.position.y = -0.2
  s.scene.add(grid)

  const tokGeo = new THREE.BoxGeometry(1.0, 0.32, 0.5)
  const tokMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 })
  const qMat = new THREE.MeshStandardMaterial({ color: 0xf5b301, roughness: 0.4, emissive: 0xf5b301, emissiveIntensity: 0.25 })
  const bestMat = new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.4, emissive: 0x0f766e, emissiveIntensity: 0.3 })
  const tokens = new THREE.Group()
  s.scene.add(tokens)
  const arcs = new THREE.Group()
  s.scene.add(arcs)
  const tokLabels = spriteSet(s.scene)
  const wLabels = spriteSet(s.scene)
  let boxes: THREE.Mesh[] = []
  let tubes: Array<{ mesh: THREE.Mesh; count: number }> = []
  let key = '', grow = 0

  const rebuild = (d: AttnDraw) => {
    key = d.key
    grow = reduce ? 1 : 0
    for (const b of boxes) b.removeFromParent()
    for (const t of tubes) { t.mesh.removeFromParent(); t.mesh.geometry.dispose(); (t.mesh.material as THREE.Material).dispose() }
    boxes = d.scene.tokens.map((tk, i) => {
      const m = new THREE.Mesh(tokGeo, i === d.query ? qMat : i === d.scene.best ? bestMat : tokMat)
      m.position.set(tk.x, 0, 0)
      m.userData.tok = i
      tokens.add(m)
      return m
    })
    tubes = d.scene.arcs.map((a) => {
      const pts = Array.from({ length: 33 }, (_, k) => new THREE.Vector3(...arcPoint(d.scene, a, k / 32)))
      const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, 0.016 + 0.07 * a.w, 8, false)
      const mat = new THREE.MeshStandardMaterial({ color: a.to === d.scene.best ? 0x2dd4bf : 0xf5b301, transparent: true, opacity: 0.45 + 0.55 * Math.min(1, a.w / Math.max(...d.scene.weights)), emissive: a.to === d.scene.best ? 0x0f766e : 0x7a5900, emissiveIntensity: 0.5 })
      const mesh = new THREE.Mesh(geo, mat)
      arcs.add(mesh)
      const count = geo.index ? geo.index.count : geo.getAttribute('position').count
      geo.setDrawRange(0, reduce ? count : 0)
      return { mesh, count }
    })
    tokLabels.sync(`${d.key}|t`, () => d.scene.tokens.map((tk, i) => { const sp = textSprite(tk.text, { h: 0.2, bg: i === d.query ? 'rgba(245,179,1,0.95)' : 'rgba(15,23,42,0.88)', fg: i === d.query ? '#111827' : '#ffffff', bold: i === d.query }); sp.position.set(tk.x, -0.02, 0.42); return sp }))
    wLabels.sync(`${d.key}|w`, () => d.scene.arcs.map((a) => {
      const pct = Math.round(a.w * 100)
      const sp = textSprite(lang === 'en' ? `${pct}%` : `%${pct}`, { h: 0.16, bg: a.to === d.scene.best ? 'rgba(15,118,110,0.95)' : 'rgba(71,85,105,0.9)' })
      const top = arcPoint(d.scene, a, 0.5)
      sp.position.set(top[0], top[1] + (a.from === a.to ? 0.12 : 0.14), 0)
      sp.visible = reduce
      return sp
    }))
  }

  s.onFrame = (dt) => {
    const d = get()
    if (d.key !== key) rebuild(d)
    if (grow < 1) {
      grow = Math.min(1, grow + dt / 1.1)
      for (const t of tubes) t.mesh.geometry.setDrawRange(0, Math.floor(t.count * grow / 3) * 3)
      if (grow >= 1) for (const sp of wLabels.get()) sp.visible = true
    }
  }

  // dokun/tıkla: bir tokenı sorgu yap (sürükleme döndürmedir; az hareketli dokunuş seçimdir)
  const ray = new THREE.Raycaster()
  let down: { x: number; y: number } | null = null
  const el = s.renderer.domElement
  const onDown = (e: PointerEvent) => { down = { x: e.clientX, y: e.clientY } }
  const onUp = (e: PointerEvent) => {
    if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) { down = null; return }
    down = null
    const r = el.getBoundingClientRect()
    ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), s.camera)
    const hit = ray.intersectObjects(boxes, false)[0]
    if (hit) onPick(hit.object.userData.tok as number)
  }
  el.addEventListener('pointerdown', onDown)
  el.addEventListener('pointerup', onUp)

  return {
    dispose() {
      s.onFrame = null
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointerup', onUp)
      for (const st of [tokLabels, wLabels]) st.sync('§', () => [])
      s.dispose()
    },
  }
}
