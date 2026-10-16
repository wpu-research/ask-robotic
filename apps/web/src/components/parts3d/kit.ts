// 3B parça yapı taşları (birim: mm). PCB, pin başlığı, yonga (üstü yazılı), konnektörler, pasifler, soğutucu…
// Modeller prosedüreldir: gerçek parçanın oranlarına, renklerine ve bileşenlerine göre kurulur (CAD değildir).
import * as THREE from 'three'

export type V3 = [number, number, number]

const matCache = new Map<string, THREE.Material>()
export function mat(color: string | number, o: { metal?: number; rough?: number; clear?: boolean; opacity?: number; emissive?: string } = {}): THREE.Material {
  const key = `${color}|${o.metal ?? 0}|${o.rough ?? 0.6}|${o.clear ? 1 : 0}|${o.opacity ?? 1}|${o.emissive ?? ''}`
  let m = matCache.get(key)
  if (!m) {
    m = o.clear
      ? new THREE.MeshPhysicalMaterial({ color, metalness: o.metal ?? 0, roughness: o.rough ?? 0.4, clearcoat: 0.8, clearcoatRoughness: 0.25, transparent: (o.opacity ?? 1) < 1, opacity: o.opacity ?? 1 })
      : new THREE.MeshStandardMaterial({ color, metalness: o.metal ?? 0, roughness: o.rough ?? 0.6, transparent: (o.opacity ?? 1) < 1, opacity: o.opacity ?? 1, emissive: o.emissive ?? '#000000', emissiveIntensity: o.emissive ? 0.6 : 0 })
    matCache.set(key, m)
  }
  return m
}
export const M = {
  gold: () => mat('#d4a73a', { metal: 1, rough: 0.28 }),
  tin: () => mat('#c9ced6', { metal: 1, rough: 0.32 }),
  steel: () => mat('#9aa3ad', { metal: 0.9, rough: 0.35 }),
  alu: () => mat('#c7ccd2', { metal: 0.85, rough: 0.42 }),
  black: () => mat('#16181d', { rough: 0.55 }),
  plastic: (c: string) => mat(c, { rough: 0.5, clear: true }),
  rubber: () => mat('#222', { rough: 0.9 }),
  copper: () => mat('#c46f3a', { metal: 1, rough: 0.35 }),
}

export function box(g: THREE.Object3D, w: number, h: number, d: number, m: THREE.Material, p: V3, r?: V3): THREE.Mesh {
  const me = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m)
  me.position.set(...p); if (r) me.rotation.set(...r)
  me.castShadow = me.receiveShadow = true
  g.add(me); return me
}
export function cyl(g: THREE.Object3D, rt: number, h: number, m: THREE.Material, p: V3, r?: V3, rb = rt, seg = 28): THREE.Mesh {
  const me = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m)
  me.position.set(...p); if (r) me.rotation.set(...r)
  me.castShadow = me.receiveShadow = true
  g.add(me); return me
}

/** Üstüne yazı/desen basılmış malzeme (yonga markası, ipek baskı). */
export function textMat(lines: string[], o: { bg?: string; fg?: string; w?: number; h?: number; size?: number; font?: string } = {}): THREE.Material {
  const W = o.w ?? 256, H = o.h ?? 128
  if (typeof document === 'undefined') return mat(o.bg ?? '#111')
  const c = document.createElement('canvas'); c.width = W; c.height = H
  const x = c.getContext('2d')!
  x.fillStyle = o.bg ?? '#141518'; x.fillRect(0, 0, W, H)
  x.fillStyle = o.fg ?? '#c9ccd2'; x.textAlign = 'center'; x.textBaseline = 'middle'
  const fs = o.size ?? Math.round(H / (lines.length + 1.2))
  x.font = `700 ${fs}px ${o.font ?? 'Arial, sans-serif'}`
  lines.forEach((l, i) => x.fillText(l, W / 2, (H / (lines.length + 1)) * (i + 1)))
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4
  return new THREE.MeshStandardMaterial({ map: t, roughness: 0.55 })
}

/** Deterministik rastgele (slug'tan): SMD dağılımı her açılışta aynı. */
export function rng(seed: string): () => number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619) }
  return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 10000) / 10000 }
}

/** PCB: üst yüzey y = 1,6. Köşe delikleri altın halkalı. */
export function pcb(g: THREE.Object3D, w: number, d: number, color: string, o: { holes?: boolean; x?: number; z?: number; t?: number } = {}): void {
  const t = o.t ?? 1.6, x = o.x ?? 0, z = o.z ?? 0
  box(g, w, t, d, mat(color, { rough: 0.45, clear: true }), [x, t / 2, z])
  if (o.holes !== false && w > 12 && d > 12) {
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      cyl(g, 1.7, 0.1, M.gold(), [x + sx * (w / 2 - 3), t + 0.05, z + sz * (d / 2 - 3)])
      cyl(g, 1.1, 0.12, mat('#0b0b0b'), [x + sx * (w / 2 - 3), t + 0.07, z + sz * (d / 2 - 3)])
    }
  }
}

/** Erkek pin başlığı: n pin, x ekseni boyunca, 2,54 mm aralık; `up`: pinler yukarı (true) ya da aşağı. */
export function header(g: THREE.Object3D, n: number, p: V3, o: { rows?: number; up?: boolean; female?: boolean; axis?: 'x' | 'z' } = {}): void {
  const rows = o.rows ?? 1, pitch = 2.54, L = n * pitch, axis = o.axis ?? 'x'
  const [x0, y0, z0] = p
  const along = (i: number) => (i - (n - 1) / 2) * pitch
  const across = (r: number) => (r - (rows - 1) / 2) * pitch
  const bw = axis === 'x' ? L : rows * pitch, bd = axis === 'x' ? rows * pitch : L
  if (o.female) {
    box(g, bw, 8.5, bd, M.black(), [x0, y0 + 4.25, z0])
    for (let i = 0; i < n; i++) for (let r = 0; r < rows; r++) {
      const px = axis === 'x' ? along(i) : across(r), pz = axis === 'x' ? across(r) : along(i)
      box(g, 1, 0.2, 1, mat('#050505'), [x0 + px, y0 + 8.55, z0 + pz])
    }
    return
  }
  box(g, bw, 2.5, bd, M.black(), [x0, y0 + 1.25, z0])
  const dir = o.up === false ? -1 : 1
  for (let i = 0; i < n; i++) for (let r = 0; r < rows; r++) {
    const px = axis === 'x' ? along(i) : across(r), pz = axis === 'x' ? across(r) : along(i)
    box(g, 0.64, 9, 0.64, M.gold(), [x0 + px, y0 + (dir > 0 ? 3.5 : -2.5), z0 + pz])
  }
}

/** Yonga: siyah gövde + üst yazı + yan bacaklar (SOIC/QFP/QFN). */
export function chip(g: THREE.Object3D, w: number, d: number, p: V3, label: string[], o: { h?: number; legs?: 'soic' | 'qfp' | 'none'; bg?: string } = {}): void {
  const h = o.h ?? 1.2
  const top = textMat(label, { bg: o.bg ?? '#17181c', fg: '#aeb3bb', w: 256, h: Math.round(256 * d / w) || 128 })
  const mats = [M.black(), M.black(), top, M.black(), M.black(), M.black()]
  const me = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mats)
  me.position.set(p[0], p[1] + h / 2, p[2]); me.castShadow = true; g.add(me)
  const legs = o.legs ?? 'soic'
  if (legs === 'none') return
  const n = Math.max(2, Math.floor(w / 1.27))
  for (let i = 0; i < n; i++) {
    const x = p[0] + (i - (n - 1) / 2) * (w / n)
    for (const s of [-1, 1]) box(g, 0.4, 0.3, 1.2, M.tin(), [x, p[1] + 0.15, p[2] + s * (d / 2 + 0.5)])
  }
  if (legs === 'qfp') {
    const m = Math.max(2, Math.floor(d / 1.27))
    for (let i = 0; i < m; i++) {
      const z = p[2] + (i - (m - 1) / 2) * (d / m)
      for (const s of [-1, 1]) box(g, 1.2, 0.3, 0.4, M.tin(), [p[0] + s * (w / 2 + 0.5), p[1] + 0.15, z])
    }
  }
}

/** Rastgele küçük SMD direnç/kondansatörler (bir alana). */
export function smd(g: THREE.Object3D, r: () => number, area: [number, number, number, number], n: number, y = 1.6): void {
  const [x0, z0, x1, z1] = area
  for (let i = 0; i < n; i++) {
    const cap = r() > 0.5
    const x = x0 + r() * (x1 - x0), z = z0 + r() * (z1 - z0), rot = r() > 0.5 ? Math.PI / 2 : 0
    box(g, 1.6, 0.5, 0.8, mat(cap ? '#b98a5a' : '#1b1b1b', { rough: 0.5 }), [x, y + 0.25, z], [0, rot, 0])
    for (const s of [-1, 1]) box(g, 0.3, 0.52, 0.82, M.tin(), [x + (rot ? 0 : s * 0.75), y + 0.26, z + (rot ? s * 0.75 : 0)], [0, rot, 0])
  }
}

export function smdLed(g: THREE.Object3D, p: V3, color: string): void {
  box(g, 1.6, 0.6, 0.8, mat('#f4f4f2', { rough: 0.3 }), [p[0], p[1] + 0.3, p[2]])
  box(g, 1, 0.1, 0.5, mat(color, { emissive: color }), [p[0], p[1] + 0.62, p[2]])
}

/** USB konnektörü: 'b' (Uno), 'micro', 'c'. */
export function usb(g: THREE.Object3D, kind: 'b' | 'micro' | 'c', p: V3, rotY = 0): void {
  const s = { b: [12, 11, 16], micro: [7.5, 2.8, 5.5], c: [9, 3.3, 7.5] }[kind]
  const grp = new THREE.Group(); grp.position.set(...p); grp.rotation.y = rotY; g.add(grp)
  box(grp, s[0], s[1], s[2], M.steel(), [0, s[1] / 2, 0])
  box(grp, s[0] * 0.7, s[1] * 0.45, 0.4, mat('#0a0a0a'), [0, s[1] / 2, -s[2] / 2 - 0.05])
}

export function barrelJack(g: THREE.Object3D, p: V3): void {
  box(g, 9, 11, 14, M.black(), [p[0], p[1] + 5.5, p[2]])
  cyl(g, 3.2, 1, mat('#050505'), [p[0], p[1] + 6, p[2] - 7], [Math.PI / 2, 0, 0])
}

/** Vidalı klemens: n yuva. */
export function terminal(g: THREE.Object3D, n: number, p: V3, color = '#1e7bd6', rotY = 0): void {
  const grp = new THREE.Group(); grp.position.set(...p); grp.rotation.y = rotY; g.add(grp)
  const pitch = 5
  box(grp, n * pitch, 10, 8, M.plastic(color), [0, 5, 0])
  for (let i = 0; i < n; i++) {
    const x = (i - (n - 1) / 2) * pitch
    cyl(grp, 1.6, 0.6, M.steel(), [x, 10.2, 1], undefined, 1.6, 16)
    box(grp, 2.4, 0.3, 0.5, mat('#3a3f45'), [x, 10.55, 1])
    box(grp, 3.4, 3.4, 0.3, mat('#0a0a0a'), [x, 5, -4.05])
  }
}

/** Kanatçıklı soğutucu. */
export function heatsink(g: THREE.Object3D, w: number, h: number, d: number, p: V3, color = '#1a1d22', fins = 9): void {
  const base = mat(color, { metal: 0.6, rough: 0.45 })
  box(g, w, 2, d, base, [p[0], p[1] + 1, p[2]])
  for (let i = 0; i < fins; i++) box(g, (w / fins) * 0.45, h, d, base, [p[0] - w / 2 + (w / fins) * (i + 0.5), p[1] + 2 + h / 2, p[2]])
}

export function elco(g: THREE.Object3D, r: number, h: number, p: V3, color = '#1f2f6b'): void {
  cyl(g, r, h, mat(color, { rough: 0.35, clear: true }), [p[0], p[1] + h / 2, p[2]])
  cyl(g, r * 0.98, 0.2, M.alu(), [p[0], p[1] + h + 0.1, p[2]])
  box(g, r * 0.5, h * 0.98, 0.2, mat('#d8dde6'), [p[0], p[1] + h / 2, p[2] + r * 0.97])
}

export function trimmer(g: THREE.Object3D, p: V3): void {
  box(g, 9.5, 5, 9.5, M.plastic('#1d4ed8'), [p[0], p[1] + 2.5, p[2]])
  cyl(g, 3, 1, mat('#f2f2f2'), [p[0], p[1] + 5.4, p[2]])
  box(g, 4, 0.4, 0.8, mat('#555'), [p[0], p[1] + 6, p[2]])
}

/** Bobin (güç indüktörü, SMD kare ya da toroid). */
export function coil(g: THREE.Object3D, s: number, p: V3, toroid = false): void {
  if (toroid) {
    const me = new THREE.Mesh(new THREE.TorusGeometry(s / 2, s / 5, 16, 32), M.copper())
    me.position.set(p[0], p[1] + s / 5, p[2]); me.rotation.x = Math.PI / 2; me.castShadow = true; g.add(me)
    return
  }
  box(g, s, s * 0.55, s, mat('#2a2a2a', { rough: 0.7 }), [p[0], p[1] + s * 0.275, p[2]])
  cyl(g, s * 0.32, s * 0.56, M.copper(), [p[0], p[1] + s * 0.28, p[2]])
}

/** Kablo (bükülebilir boru). */
export function wire(g: THREE.Object3D, pts: V3[], color: string, r = 0.6): void {
  const curve = new THREE.CatmullRomCurve3(pts.map((q) => new THREE.Vector3(...q)))
  const me = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, r, 8, false), mat(color, { rough: 0.5 }))
  me.castShadow = true; g.add(me)
}

/** Ekran yüzeyi (yazılı, hafif parlak). */
export function screen(g: THREE.Object3D, w: number, d: number, p: V3, lines: string[], bg: string, fg: string, mono = true): void {
  const m = textMat(lines, { bg, fg, w: 512, h: Math.max(64, Math.round(512 * d / w)), font: mono ? 'ui-monospace, monospace' : 'Arial, sans-serif' })
  ;(m as THREE.MeshStandardMaterial).roughness = 0.2
  ;(m as THREE.MeshStandardMaterial).emissive = new THREE.Color(fg)
  ;(m as THREE.MeshStandardMaterial).emissiveIntensity = 0.12
  const me = new THREE.Mesh(new THREE.PlaneGeometry(w, d), m)
  me.rotation.x = -Math.PI / 2; me.position.set(...p); g.add(me)
}
