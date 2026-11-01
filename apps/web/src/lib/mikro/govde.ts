// Serbest gövde çizimi: şasi artık tek dikdörtgen levha değil, blokların birleşimi.
//
// Neden blok birleşimi? MuJoCo'da çarpışma geometrisi dışbükey olmak zorundadır.
// İçbükey bir gövde (delikli, kesik, L biçimli) MuJoCo'da tek parçayla değil,
// AYNI GÖVDEYE konan birden çok dışbükey parçayla modellenir — standart yol budur.
// Böylece çizilen şekil fizikte birebir karşılığını bulur; yaklaşık dışbükey
// ayrıştırma yapılmaz, bir şey uydurulmaz.
//
// Eksenler tasarımla aynı: ileri +x, sola +y, yukarı +z; birim metre.
import { CHASSIS, PITCH, type ChassisId } from './tasarim'
import { unitVolume, type MeshShape } from './sekiller'

/** Yerleşik MuJoCo ilkelleri + örgü olarak verilen dışbükey çokyüzlüler. */
export type PrimitiveShape = 'kutu' | 'silindir' | 'kure' | 'kapsul' | 'elipsoid'
export type BlockShape = PrimitiveShape | MeshShape | 'ozel'

/** Yüzey görünümü: mat plastik, parlak metal, yarı saydam. */
export type BlockMaterial = 'standart' | 'metalik' | 'saydam'
export const MATERIALS: BlockMaterial[] = ['standart', 'metalik', 'saydam']

/** MJCF malzeme değerleri; `alpha` rgba'nın son bileşenidir. */
export const MATERIAL_SPEC: Record<BlockMaterial, { specular: number; shininess: number; reflectance: number; alpha: number }> = {
  standart: { specular: 0.2, shininess: 0.2, reflectance: 0, alpha: 1 },
  metalik: { specular: 0.9, shininess: 0.85, reflectance: 0.5, alpha: 1 },
  saydam: { specular: 0.4, shininess: 0.5, reflectance: 0, alpha: 0.45 },
}

/** Yarıçapı tek sayıyla belirlenen şekiller (en ve boy ayrı ayrı verilmez). */
export const ROUND_SHAPES: BlockShape[] = ['kure', 'silindir', 'kapsul', 'koni']

export interface Block {
  id: string
  shape: BlockShape
  /** Blok merkezi (m), şasi merkezine göre. */
  pos: [number, number, number]
  /** Yarı boyutlar (m). kutu: x,y,z; silindir: yarıçap, yarıçap, yarı yükseklik; küre: yarıçap. */
  size: [number, number, number]
  /** z ekseni etrafında dönüş (derece). */
  yaw: number
  color: string
  /** true ise bu blok katı değil kesicidir: katı bloklardan hacmini çıkarır (delik açar). */
  cut?: boolean
  /** Yüzey görünümü. Fiziği değiştirmez; yalnız görüntüdür. */
  material?: BlockMaterial
  /** shape === 'ozel': içe aktarılan modelin dışbükey örtü köşeleri, [-1,1] kutusunda (x,y,z sırayla). */
  mesh?: number[]
  /** shape === 'ozel': birim kutudaki örtü hacmi; ölçekli hacim bununla sx·sy·sz çarpımıdır. */
  meshVol?: number
  /** İçe aktarılan dosyanın adı (arayüzde gösterilir). */
  meshName?: string
}

export interface Govde {
  v: 1
  blocks: Block[]
}

/** Malzeme yoğunluğu (kg/m³): PLA baskı, %20 dolgu kabul edildi. */
export const DENSITY = 420

/** Blokların en küçük ve en büyük yarı boyutu (m): tezgâhta anlamlı kalsın. */
export const MIN_HALF = 0.005
export const MAX_HALF = 0.25

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v)
const finite = (v: number, d = 0) => (Number.isFinite(v) ? v : d)

export function uniqueBlockId(taken: Iterable<string>): string {
  const used = new Set(taken)
  for (let i = 1; ; i++) if (!used.has(`b${i}`)) return `b${i}`
}

/** Bir bloğun hacmi (m³). */
export function blockVolume(b: Block): number {
  const [x, y, z] = b.size.map((s) => Math.max(0, s)) as [number, number, number]
  switch (b.shape) {
    case 'kutu': return 8 * x * y * z
    case 'silindir': return Math.PI * x * x * 2 * z
    case 'kure': return (4 / 3) * Math.PI * x * x * x
    // Kapsül: silindir gövde + iki yarım küre uç (MuJoCo'da size = yarıçap, yarı gövde boyu)
    case 'kapsul': return Math.PI * x * x * 2 * z + (4 / 3) * Math.PI * x * x * x
    case 'elipsoid': return (4 / 3) * Math.PI * x * y * z
    // İçe aktarılan model: örtü hacmi içe aktarma anında hesaplanıp saklanır
    case 'ozel': return (b.meshVol ?? 1) * x * y * z
    default: return unitVolume(b.shape) * x * y * z
  }
}

export function govdeVolume(g: Govde): number {
  return g.blocks.reduce((s, b) => s + blockVolume(b), 0)
}

/**
 * Gövdenin kütlesi (g): delikler düşülmüş gerçek hacimden. Katı bloklar üst üste
 * binerse binen hacim iki kez sayılır; tezgâh bunu uyarır.
 */
export function govdeMassG(g: Govde): number {
  return Math.round(solidVolume(g) * DENSITY * 1000)
}

/** Şasi boyundan tek bloklu başlangıç gövdesi: eski davranışın aynısı. */
export function defaultGovde(chassis: ChassisId): Govde {
  const ch = CHASSIS[chassis]
  return {
    v: 1,
    blocks: [{
      id: 'b1', shape: 'kutu',
      pos: [0, 0, 0],
      size: [(ch.cols * PITCH) / 2, (ch.rows * PITCH) / 2, 0.002],
      yaw: 0, color: '#db3c8c',
    }],
  }
}

/** Bloğu sınırlara oturtur: sonsuz/NaN değerler ve saçma boyutlar modele sızmasın. */
export function normalizeBlock(b: Block): Block {
  const mesh = Array.isArray(b.mesh) && b.mesh.length >= 12 && b.mesh.length % 3 === 0 && b.mesh.every(Number.isFinite)
    ? b.mesh
    : undefined
  return {
    ...b,
    ...(b.shape === 'ozel' && !mesh ? { shape: 'kutu' as BlockShape } : {}), // bozuk örgü kutuya düşer
    mesh,
    pos: b.pos.map((v) => clamp(finite(v), -0.5, 0.5)) as [number, number, number],
    size: b.size.map((v) => clamp(finite(v, MIN_HALF), MIN_HALF, MAX_HALF)) as [number, number, number],
    yaw: ((finite(b.yaw) % 360) + 360) % 360,
  }
}

export function normalizeGovde(g: unknown): Govde | null {
  if (!g || typeof g !== 'object') return null
  const o = g as Govde
  if (o.v !== 1 || !Array.isArray(o.blocks)) return null
  const blocks = o.blocks
    .filter((b) => b && typeof b.id === 'string' && Array.isArray(b.pos) && Array.isArray(b.size))
    .map(normalizeBlock)
  return blocks.length ? { v: 1, blocks } : null
}

export function addBlock(g: Govde, shape: BlockShape): Govde {
  const id = uniqueBlockId(g.blocks.map((b) => b.id))
  // Yeni blok var olanların önüne konur ki üst üste binip kaybolmasın
  const frontX = g.blocks.reduce((m, b) => Math.max(m, b.pos[0] + b.size[0]), 0)
  return {
    ...g,
    blocks: [...g.blocks, normalizeBlock({
      id, shape,
      pos: [frontX + 0.02, 0, 0],
      size: shape === 'kure' ? [0.015, 0.015, 0.015] : [0.02, 0.02, 0.008],
      yaw: 0, color: '#db3c8c',
    })],
  }
}

export function updateBlock(g: Govde, id: string, patch: Partial<Block>): Govde {
  return { ...g, blocks: g.blocks.map((b) => (b.id === id ? normalizeBlock({ ...b, ...patch }) : b)) }
}

/** Son blok silinmez: gövdesiz robot olmaz. */
export function removeBlock(g: Govde, id: string): Govde {
  const target = g.blocks.find((b) => b.id === id)
  if (target && !target.cut && g.blocks.filter((b) => !b.cut).length <= 1) return g
  return { ...g, blocks: g.blocks.filter((b) => b.id !== id) }
}

export function duplicateBlock(g: Govde, id: string): Govde {
  const src = g.blocks.find((b) => b.id === id)
  if (!src) return g
  const nid = uniqueBlockId(g.blocks.map((b) => b.id))
  return { ...g, blocks: [...g.blocks, normalizeBlock({ ...src, id: nid, pos: [src.pos[0], src.pos[1] - 2 * src.size[1], src.pos[2]] })] }
}

/** Gövdenin kapladığı kutu (m): [minX, minY, minZ, maxX, maxY, maxZ]. */
export function govdeBounds(g: Govde): [number, number, number, number, number, number] {
  let x0 = Infinity, y0 = Infinity, z0 = Infinity, x1 = -Infinity, y1 = -Infinity, z1 = -Infinity
  for (const b of g.blocks) {
    // Dönüş sonrası kaba sınır: en uzun yarı boyut her iki yöne de sayılır
    const rMax = Math.max(b.size[0], b.size[1])
    const sx = b.yaw % 180 === 0 ? b.size[0] : rMax
    const sy = b.yaw % 180 === 0 ? b.size[1] : rMax
    x0 = Math.min(x0, b.pos[0] - sx); x1 = Math.max(x1, b.pos[0] + sx)
    y0 = Math.min(y0, b.pos[1] - sy); y1 = Math.max(y1, b.pos[1] + sy)
    z0 = Math.min(z0, b.pos[2] - b.size[2]); z1 = Math.max(z1, b.pos[2] + b.size[2])
  }
  return [x0, y0, z0, x1, y1, z1]
}

// ---- Çıkarma (delik açma) -------------------------------------------------
//
// Kutudan kutu çıkarmanın sonucu TAM OLARAK en çok 6 kutuyla ifade edilir: x'te
// solda ve sağda kalan dilimler, ortada y'de önde ve arkada kalanlar, ortada
// z'de altta ve üstte kalanlar. Dilimler örtüşmez, toplamları kalanın tamamıdır.
// Hepsi dışbükey olduğu için MuJoCo'ya olduğu gibi girer: delik gerçekten vardır,
// fizik de deliği görür. Yaklaşık dışbükey ayrıştırma yapılmaz.

/** Eksen hizalı kutu: [x0, y0, z0, x1, y1, z1] (m). */
export type Aabb = [number, number, number, number, number, number]

/** En küçük anlamlı kalınlık (m): bundan ince dilimler atılır. */
const EPS = 1e-4

/** Bloğun eksen hizalı kutusu; yalnız 90°'nin katlarında geçerlidir. */
export function blockAabb(b: Block): Aabb {
  const swap = Math.round(b.yaw / 90) % 2 !== 0
  const sx = swap ? b.size[1] : b.size[0]
  const sy = swap ? b.size[0] : b.size[1]
  return [b.pos[0] - sx, b.pos[1] - sy, b.pos[2] - b.size[2], b.pos[0] + sx, b.pos[1] + sy, b.pos[2] + b.size[2]]
}

export function aabbVolume(a: Aabb): number {
  return Math.max(0, a[3] - a[0]) * Math.max(0, a[4] - a[1]) * Math.max(0, a[5] - a[2])
}

/** Blok eksen hizalı mı (çıkarma için şart)? */
export function isAxisAligned(b: Block): boolean {
  return Math.abs(b.yaw % 90) < 1e-6
}

/**
 * s \ c: kalan hacmi örtüşmeyen kutulara böler (en çok 6). Kesişim yoksa [s],
 * c tamamen kaplıyorsa [] döner. Sonuç kesindir, yaklaşık değildir.
 */
export function subtractBox(s: Aabb, c: Aabb): Aabb[] {
  // Kesiciyi katı kutuyla kırp: dışarıda kalan kısmı bir şey kesmez
  const k: Aabb = [
    Math.max(s[0], c[0]), Math.max(s[1], c[1]), Math.max(s[2], c[2]),
    Math.min(s[3], c[3]), Math.min(s[4], c[4]), Math.min(s[5], c[5]),
  ]
  if (k[3] - k[0] <= EPS || k[4] - k[1] <= EPS || k[5] - k[2] <= EPS) return [s] // değmiyor
  const out: Aabb[] = []
  const push = (a: Aabb) => { if (a[3] - a[0] > EPS && a[4] - a[1] > EPS && a[5] - a[2] > EPS) out.push(a) }
  push([s[0], s[1], s[2], k[0], s[4], s[5]])          // x'te solda kalan
  push([k[3], s[1], s[2], s[3], s[4], s[5]])          // x'te sağda kalan
  push([k[0], s[1], s[2], k[3], k[1], s[5]])          // ortada, y'de önde kalan
  push([k[0], k[4], s[2], k[3], s[4], s[5]])          // ortada, y'de arkada kalan
  push([k[0], k[1], s[2], k[3], k[4], k[2]])          // ortada, z'de altta kalan
  push([k[0], k[1], k[5], k[3], k[4], s[5]])          // ortada, z'de üstte kalan
  return out
}

/** Çıkarma sonrası gövde: fizikte ve görüntüde kullanılan gerçek katı parçalar. */
export interface SolidPiece {
  /** Kaynak bloğun kimliği (renk ve seçim için). */
  from: string
  shape: BlockShape
  pos: [number, number, number]
  size: [number, number, number]
  yaw: number
  color: string
  material?: BlockMaterial
}

const aabbToPiece = (a: Aabb, src: Block): SolidPiece => ({
  from: src.id, shape: 'kutu', color: src.color, material: src.material, yaw: 0,
  pos: [(a[0] + a[3]) / 2, (a[1] + a[4]) / 2, (a[2] + a[5]) / 2],
  size: [(a[3] - a[0]) / 2, (a[4] - a[1]) / 2, (a[5] - a[2]) / 2],
})

/**
 * Katı blokları kesicilerle işler ve fizikte kullanılacak parçaları üretir.
 * Kesilemeyen durumlar (silindir/küre katı, eğik blok) dokunulmadan geçer ve
 * `notes` ile dürüstçe bildirilir — sessizce yok sayılmaz.
 */
export function resolveSolids(g: Govde): { pieces: SolidPiece[]; notes: GovdeIssue[] } {
  const cutters = g.blocks.filter((b) => b.cut)
  const solids = g.blocks.filter((b) => !b.cut)
  const notes: GovdeIssue[] = []
  const pieces: SolidPiece[] = []

  const badCutters = cutters.filter((c) => c.shape !== 'kutu' || !isAxisAligned(c))
  for (const c of badCutters) {
    notes.push({
      level: 'uyari', blockId: c.id,
      tr: `${c.id} kesici olarak kullanılamıyor: yalnız eksen hizalı (açı 0/90/180/270) kutu delik açabilir. Bu blok yok sayıldı.`,
      en: `${c.id} cannot cut: only an axis-aligned box (yaw 0/90/180/270) can make a hole. This block was ignored.`,
    })
  }
  const useful = cutters.filter((c) => c.shape === 'kutu' && isAxisAligned(c))

  for (const s of solids) {
    if (!useful.length) { pieces.push({ ...s, from: s.id }); continue }
    if (s.shape !== 'kutu' || !isAxisAligned(s)) {
      pieces.push({ ...s, from: s.id })
      if (useful.some((c) => aabbVolume(intersect(blockAabb(s), blockAabb(c))) > 0)) {
        notes.push({
          level: 'uyari', blockId: s.id,
          tr: `${s.id} delinmedi: yalnız eksen hizalı kutudan delik açılabilir (silindir, küre ve eğik bloklar kesilmez).`,
          en: `${s.id} was not cut: only an axis-aligned box can be hollowed (cylinders, spheres and rotated blocks are left whole).`,
        })
      }
      continue
    }
    // Her kesici sırayla uygulanır; kalan parçalar bir sonrakine girer
    let parts: Aabb[] = [blockAabb(s)]
    for (const c of useful) {
      const ca = blockAabb(c)
      parts = parts.flatMap((p) => subtractBox(p, ca))
    }
    for (const p of parts) pieces.push(aabbToPiece(p, s))
  }
  return { pieces, notes }
}

function intersect(a: Aabb, b: Aabb): Aabb {
  return [Math.max(a[0], b[0]), Math.max(a[1], b[1]), Math.max(a[2], b[2]), Math.min(a[3], b[3]), Math.min(a[4], b[4]), Math.min(a[5], b[5])]
}

/** Çıkarma sonrası gerçek hacim (m³): delikler düşülmüş hâli. */
export function solidVolume(g: Govde): number {
  const { pieces } = resolveSolids(g)
  return pieces.reduce((s, p) => s + blockVolume({ ...p, id: p.from } as Block), 0)
}

export interface GovdeIssue { level: 'hata' | 'uyari'; tr: string; en: string; blockId?: string }

/** Tezgâhın dürüst uyarıları: üst üste binme, havada duran blok, aşırı kütle. */
export function govdeIssues(g: Govde): GovdeIssue[] {
  const out: GovdeIssue[] = [...resolveSolids(g).notes]
  const massG = govdeMassG(g)
  if (massG > 2000) {
    out.push({ level: 'uyari', tr: `Gövde çok ağır (${massG} g): motorlar zorlanır.`, en: `The body is very heavy (${massG} g): the motors will struggle.` })
  }
  // Blok çiftlerinde kaba kesişim denetimi (eksen hizalı kutu yaklaşımı)
  const solidBlocks = g.blocks.filter((b) => !b.cut)
  for (let i = 0; i < solidBlocks.length; i++) {
    for (let j = i + 1; j < solidBlocks.length; j++) {
      const a = solidBlocks[i], b = solidBlocks[j]
      const overlaps = [0, 1, 2].every((k) => Math.abs(a.pos[k] - b.pos[k]) < a.size[k] + b.size[k] - 1e-6)
      if (overlaps) {
        out.push({
          level: 'uyari', blockId: b.id,
          tr: `${a.id} ve ${b.id} üst üste biniyor: binen hacim kütleye iki kez sayılır.`,
          en: `${a.id} and ${b.id} overlap: the shared volume is counted twice in the mass.`,
        })
      }
    }
  }
  // Birbirine değmeyen blok: gövde tek parça değilse robot ikiye ayrılmış gibi görünür
  if (solidBlocks.length > 1) {
    const linked = new Set<string>([solidBlocks[0].id])
    let grew = true
    while (grew) {
      grew = false
      for (const a of solidBlocks) {
        if (!linked.has(a.id)) continue
        for (const b of solidBlocks) {
          if (linked.has(b.id)) continue
          const touches = [0, 1, 2].every((k) => Math.abs(a.pos[k] - b.pos[k]) <= a.size[k] + b.size[k] + 1e-4)
          if (touches) { linked.add(b.id); grew = true }
        }
      }
    }
    for (const b of solidBlocks) {
      if (!linked.has(b.id)) {
        out.push({ level: 'hata', blockId: b.id, tr: `${b.id} gövdeye değmiyor: havada ayrı duruyor.`, en: `${b.id} does not touch the body: it floats separately.` })
      }
    }
  }
  return out
}

// ---- Aynalama ve dizi (pattern) -------------------------------------------

export type MirrorAxis = 'x' | 'y'

/**
 * Bloğu seçilen eksende aynalar ve kopyasını ekler. Robot gövdeleri çoğunlukla
 * simetriktir: sol tarafı çizip aynalamak en sık yapılan iş.
 */
export function mirrorBlock(g: Govde, id: string, axis: MirrorAxis): Govde {
  const src = g.blocks.find((b) => b.id === id)
  if (!src) return g
  const i = axis === 'x' ? 0 : 1
  const pos: [number, number, number] = [...src.pos]
  pos[i] = -pos[i]
  // Eksen üstündeki blok aynalanınca kendi üstüne biner: anlamsız kopya açılmaz
  if (Math.abs(src.pos[i]) < 1e-6) return g
  const nid = uniqueBlockId(g.blocks.map((b) => b.id))
  const yaw = axis === 'y' ? (360 - src.yaw) % 360 : (180 - src.yaw + 360) % 360
  return { ...g, blocks: [...g.blocks, normalizeBlock({ ...src, id: nid, pos, yaw })] }
}

/**
 * Bloğu verilen aralıkla `count` kez çoğaltır (kendisi dahil sayılır).
 * Delik sırası, havalandırma deliği, tekrarlı destek için.
 */
export function patternBlock(g: Govde, id: string, axis: 'x' | 'y' | 'z', count: number, stepM: number): Govde {
  const src = g.blocks.find((b) => b.id === id)
  if (!src) return g
  const n = Math.max(2, Math.min(24, Math.floor(count)))
  const step = Number.isFinite(stepM) ? stepM : 0
  if (Math.abs(step) < 1e-6) return g
  const i = axis === 'x' ? 0 : axis === 'y' ? 1 : 2
  const taken = g.blocks.map((b) => b.id)
  const added: Block[] = []
  for (let k = 1; k < n; k++) {
    const pos: [number, number, number] = [...src.pos]
    pos[i] = src.pos[i] + k * step
    const nid = uniqueBlockId([...taken, ...added.map((b) => b.id)])
    added.push(normalizeBlock({ ...src, id: nid, pos }))
  }
  return { ...g, blocks: [...g.blocks, ...added] }
}

// ---- Yüzey işlemleri: yapıştır, uzat, böl -----------------------------------

export type Axis = 'x' | 'y' | 'z'
const AXIS_I: Record<Axis, 0 | 1 | 2> = { x: 0, y: 1, z: 2 }

/**
 * Bloğu, seçilen eksende en yakın komşusunun yüzeyine yapıştırır (yüzeye tutturma).
 * Komşu yoksa ya da zaten değiyorsa bir şey değişmez.
 */
export function snapToSurface(g: Govde, id: string, axis: Axis): Govde {
  const b = g.blocks.find((x) => x.id === id)
  if (!b) return g
  const i = AXIS_I[axis]
  const others = g.blocks.filter((x) => x.id !== id && !x.cut)
  if (!others.length) return g

  // Diğer eksenlerde örtüşen komşular aday: yan yana durabilecek olanlar
  const cand = others.filter((o) => [0, 1, 2].every((k) => k === i || Math.abs(o.pos[k] - b.pos[k]) < o.size[k] + b.size[k]))
  if (!cand.length) return g

  let best: number | null = null
  for (const o of cand) {
    for (const side of [-1, 1] as const) {
      // Bloğun merkezi, komşunun o yüzüne tam değecek konum
      const target = o.pos[i] + side * (o.size[i] + b.size[i])
      if (best === null || Math.abs(target - b.pos[i]) < Math.abs(best - b.pos[i])) best = target
    }
  }
  if (best === null || Math.abs(best - b.pos[i]) < 1e-9) return g
  const pos: [number, number, number] = [...b.pos]
  pos[i] = best
  return updateBlock(g, id, { pos })
}

/**
 * Bloğu tek yönde uzatır (karşı yüz yerinde kalır) — extrude'un karşılığı.
 * `deltaM` pozitifse eksenin artı yönüne, negatifse eksi yönüne büyütür.
 */
export function extrudeBlock(g: Govde, id: string, axis: Axis, deltaM: number): Govde {
  const b = g.blocks.find((x) => x.id === id)
  if (!b || !Number.isFinite(deltaM) || Math.abs(deltaM) < 1e-9) return g
  const i = AXIS_I[axis]
  const size: [number, number, number] = [...b.size]
  const pos: [number, number, number] = [...b.pos]
  const half = deltaM / 2
  size[i] = b.size[i] + Math.abs(half)
  // Karşı yüz sabit kalsın diye merkez yarısı kadar kayar
  pos[i] = b.pos[i] + (deltaM > 0 ? Math.abs(half) : -Math.abs(half))
  return updateBlock(g, id, { pos, size })
}

/**
 * Kutuyu verilen eksende ikiye böler (slice). Bölme yeri blok merkezine göre
 * `offsetM`; kutunun dışındaysa bölme yapılmaz. Yalnız kutular bölünür —
 * yuvarlak ve örgü şekillerin düzlemle kesiti dışbükey kutularla anlatılamaz.
 */
export function sliceBlock(g: Govde, id: string, axis: Axis, offsetM = 0): Govde {
  const b = g.blocks.find((x) => x.id === id)
  if (!b || b.shape !== 'kutu') return g
  const i = AXIS_I[axis]
  const s = b.size[i]
  if (Math.abs(offsetM) >= s - MIN_HALF) return g // kenara çok yakın: anlamlı parça çıkmaz

  const loHalf = (s + offsetM) / 2
  const hiHalf = (s - offsetM) / 2
  const mk = (center: number, half: number, id2: string): Block => {
    const pos: [number, number, number] = [...b.pos]
    const size: [number, number, number] = [...b.size]
    pos[i] = center
    size[i] = half
    return normalizeBlock({ ...b, id: id2, pos, size })
  }
  const nid = uniqueBlockId(g.blocks.map((x) => x.id))
  const lo = mk(b.pos[i] - s + loHalf, loHalf, b.id)
  const hi = mk(b.pos[i] + s - hiHalf, hiHalf, nid)
  return { ...g, blocks: [...g.blocks.map((x) => (x.id === id ? lo : x)), hi] }
}
