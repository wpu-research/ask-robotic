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

export type BlockShape = 'kutu' | 'silindir' | 'kure'

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
  }
}

export function govdeVolume(g: Govde): number {
  return g.blocks.reduce((s, b) => s + blockVolume(b), 0)
}

/** Gövdenin kütlesi (g). Bloklar üst üste binerse hacim iki kez sayılır; tezgâh bunu uyarır. */
export function govdeMassG(g: Govde): number {
  return Math.round(govdeVolume(g) * DENSITY * 1000)
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
  return {
    ...b,
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
  if (g.blocks.length <= 1) return g
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

export interface GovdeIssue { level: 'hata' | 'uyari'; tr: string; en: string; blockId?: string }

/** Tezgâhın dürüst uyarıları: üst üste binme, havada duran blok, aşırı kütle. */
export function govdeIssues(g: Govde): GovdeIssue[] {
  const out: GovdeIssue[] = []
  const massG = govdeMassG(g)
  if (massG > 2000) {
    out.push({ level: 'uyari', tr: `Gövde çok ağır (${massG} g): motorlar zorlanır.`, en: `The body is very heavy (${massG} g): the motors will struggle.` })
  }
  // Blok çiftlerinde kaba kesişim denetimi (eksen hizalı kutu yaklaşımı)
  for (let i = 0; i < g.blocks.length; i++) {
    for (let j = i + 1; j < g.blocks.length; j++) {
      const a = g.blocks[i], b = g.blocks[j]
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
  if (g.blocks.length > 1) {
    const linked = new Set<string>([g.blocks[0].id])
    let grew = true
    while (grew) {
      grew = false
      for (const a of g.blocks) {
        if (!linked.has(a.id)) continue
        for (const b of g.blocks) {
          if (linked.has(b.id)) continue
          const touches = [0, 1, 2].every((k) => Math.abs(a.pos[k] - b.pos[k]) <= a.size[k] + b.size[k] + 1e-4)
          if (touches) { linked.add(b.id); grew = true }
        }
      }
    }
    for (const b of g.blocks) {
      if (!linked.has(b.id)) {
        out.push({ level: 'hata', blockId: b.id, tr: `${b.id} gövdeye değmiyor: havada ayrı duruyor.`, en: `${b.id} does not touch the body: it floats separately.` })
      }
    }
  }
  return out
}
