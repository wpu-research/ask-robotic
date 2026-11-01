'use client'
// Dosyadan gövde bloğu: STL, OBJ ve GLB/GLTF okunur, dışbükey örtüsü çıkarılır.
//
// Ayrıştırma saf katmanda (lib/mikro/ice-aktar.ts); burada yalnız tarayıcıya
// bağlı kısım var: GLB yükleyici ve dışbükey örtü hesabı (three ConvexHull).
import { ConvexHull } from 'three/examples/jsm/math/ConvexHull.js'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { formatOf, parseObj, parseStl, prepareVerts } from '@/lib/mikro/ice-aktar'
import { polyVolume } from '@/lib/mikro/sekiller'
import { MAX_HALF, MIN_HALF, type Block } from '@/lib/mikro/govde'

export interface ImportOutcome {
  ok: true
  block: Omit<Block, 'id'>
  /** Kullanıcıya söylenecek dürüst notlar (örtü alındı, köşe seyreltildi…). */
  notes: { tr: string; en: string }[]
}
export type ImportFail = { ok: false; tr: string; en: string }

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v)

/** GLB/GLTF içindeki bütün ağların köşelerini (dünya dönüşümüyle) toplar. */
async function readGlb(buf: ArrayBuffer): Promise<number[]> {
  const loader = new GLTFLoader()
  const gltf = await loader.parseAsync(buf, '')
  const out: number[] = []
  const v = new THREE.Vector3()
  gltf.scene.updateMatrixWorld(true)
  gltf.scene.traverse((o) => {
    const m = o as THREE.Mesh
    const pos = m.isMesh ? (m.geometry.getAttribute('position') as THREE.BufferAttribute | undefined) : undefined
    if (!pos) return
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld)
      out.push(v.x, v.y, v.z)
    }
  })
  return out
}

/** Nokta kümesinin dışbükey örtüsü: köşeler ve yüzeyler (hacim için). */
export function convexOf(points: [number, number, number][]): { verts: [number, number, number][]; faces: number[][] } {
  const hull = new ConvexHull().setFromPoints(points.map(([x, y, z]) => new THREE.Vector3(x, y, z)))
  const index = new Map<string, number>()
  const verts: [number, number, number][] = []
  const key = (p: THREE.Vector3) => `${p.x.toFixed(6)},${p.y.toFixed(6)},${p.z.toFixed(6)}`
  const idOf = (p: THREE.Vector3) => {
    const k = key(p)
    let i = index.get(k)
    if (i === undefined) { i = verts.length; index.set(k, i); verts.push([p.x, p.y, p.z]) }
    return i
  }
  const faces: number[][] = []
  for (const f of hull.faces) {
    const tri: number[] = []
    let e = f.edge
    do { tri.push(idOf(e.head().point)); e = e.next } while (e !== f.edge)
    if (tri.length >= 3) faces.push(tri)
  }
  return { verts, faces }
}

/**
 * Dosyayı gövde bloğuna çevirir. Başarısızsa neden olduğunu söyler; hiçbir
 * durumda fırlatmaz.
 *
 * Modelin gerçek ölçüsü korunur: dosyadaki birimler metre kabul edilir (STL ve
 * OBJ'de birim yoktur; 3B baskıda yaygın olduğu için milimetre de denenir ve
 * makul olan seçilir).
 */
export async function importModel(file: File): Promise<ImportOutcome | ImportFail> {
  const fmt = formatOf(file.name)
  if (!fmt) return { ok: false, tr: 'Bu dosya türü okunamıyor. STL, OBJ, GLB ya da GLTF olmalı.', en: 'Unsupported file type. Use STL, OBJ, GLB or GLTF.' }
  if (file.size > 32 * 1024 * 1024) return { ok: false, tr: 'Dosya çok büyük (en çok 32 MB).', en: 'File is too large (32 MB max).' }

  let raw: number[] | null = null
  try {
    const buf = await file.arrayBuffer()
    if (fmt === 'stl') raw = parseStl(buf)
    else if (fmt === 'obj') raw = parseObj(new TextDecoder().decode(buf))
    else raw = await readGlb(buf)
  } catch {
    return { ok: false, tr: 'Dosya okunamadı; bozuk olabilir.', en: 'Could not read the file; it may be corrupt.' }
  }
  if (!raw || raw.length < 12) return { ok: false, tr: 'Dosyada üç boyutlu şekil bulunamadı.', en: 'No 3D shape found in the file.' }

  const { verts, sizeM, rawCount } = prepareVerts(raw)
  if (verts.length < 4) return { ok: false, tr: 'Şekil çok basit: en az dört köşe gerekir.', en: 'The shape is too simple: at least four corners are needed.' }

  const hull = convexOf(verts)
  const notes: ImportOutcome['notes'] = []

  // Birim: STL/OBJ'de birim yoktur. 1 birim = 1 m kabul edilirse robot parçası
  // için saçma büyüklükler çıkar; en uzun kenar 1 m'yi geçiyorsa milimetre varsayılır.
  let span = Math.max(...sizeM)
  let unit = 1
  if (fmt !== 'glb' && span > 1) {
    unit = 0.001
    notes.push({ tr: `Dosyada birim yok; ölçü milimetre varsayıldı (en uzun kenar ${Math.round(span)} mm).`, en: `The file has no unit; millimetres assumed (longest edge ${Math.round(span)} mm).` })
  }
  span *= unit

  const half = sizeM.map((s) => clamp((s * unit) / 2, MIN_HALF, MAX_HALF)) as [number, number, number]
  if (span / 2 > MAX_HALF) {
    notes.push({ tr: 'Model tezgâha sığmayacak kadar büyüktü, küçültüldü. Ölçüyü elle düzeltebilirsin.', en: 'The model was too large for the bench and was scaled down. You can fix the size by hand.' })
  }
  if (rawCount > verts.length) {
    notes.push({ tr: `${rawCount} köşe ${verts.length} köşeye indirildi (dış hat korunarak).`, en: `${rawCount} corners reduced to ${verts.length}, keeping the outline.` })
  }
  notes.push({
    tr: 'MuJoCo içbükey şekilleri çarpıştıramaz: modelin DIŞBÜKEY ÖRTÜSÜ alındı. Oyuklar ve delikler kaybolur.',
    en: 'MuJoCo cannot collide concave shapes: the model’s CONVEX HULL was taken. Cavities and holes are lost.',
  })

  return {
    ok: true,
    notes,
    block: {
      shape: 'ozel',
      pos: [0, 0, 0],
      size: half,
      yaw: 0,
      color: '#7c8aa5',
      mesh: hull.verts.flat(),
      meshVol: polyVolume(hull),
      meshName: file.name.slice(0, 40),
    },
  }
}
