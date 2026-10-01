// ASK Jr — saf, değişmez (immutable) blok ağacı ve proje işlemleri. Hiçbir girdi nesnesi değiştirilmez;
// değişmeyen dallar yeniden kullanılır (yapısal paylaşım). Geçersiz işlemlerde girdi referansı aynen döner.

import { BLOCK_BY_TYPE } from './blocks'
import { STAGE_H, STAGE_W } from './types'
import type { Block, BlockType, Page, Project, Script, Sprite } from './types'

// ---- Kimlik üretimi ----

export type IdGenerator = (prefix: string) => string

let counter = 0
const defaultGenerator: IdGenerator = (prefix) => `${prefix}_${(counter++).toString(36)}${Math.random().toString(36).slice(2, 6)}`
let generator: IdGenerator = defaultGenerator

/** Testlerde öngörülebilir kimlik için üreticiyi değiştirir. null verilirse varsayılana döner. */
export function setIdGenerator(fn: IdGenerator | null): void {
  generator = fn ?? defaultGenerator
}

export function newId(prefix = 'b'): string {
  return generator(prefix)
}

// ---- Blok oluşturma ve arama ----

export function createBlock(type: BlockType, overrides: Partial<Block> = {}): Block {
  const def = BLOCK_BY_TYPE[type]
  const block: Block = { id: newId('b'), type }
  if (def.param?.kind === 'number') block.value = def.param.default
  if (def.param?.kind === 'text') block.text = def.param.default
  if (def.container) block.children = []
  return { ...block, ...overrides }
}

export function findBlock(blocks: Block[], id: string): Block | undefined {
  for (const b of blocks) {
    if (b.id === id) return b
    if (b.children) {
      const r = findBlock(b.children, id)
      if (r) return r
    }
  }
  return undefined
}

export interface BlockLocation {
  /** Üst düzeyse null. */
  parentId: string | null
  index: number
}

/** Bloğun bulunduğu yer (ebeveyn kimliği + liste içi sıra). */
export function locateBlock(blocks: Block[], id: string, parentId: string | null = null): BlockLocation | undefined {
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i]
    if (b.id === id) return { parentId, index: i }
    if (b.children) {
      const r = locateBlock(b.children, id, b.id)
      if (r) return r
    }
  }
  return undefined
}

/** `ancestorId` bloğunun altında (torun dahil, kendisi hariç) `id` var mı. */
export function isDescendant(blocks: Block[], ancestorId: string, id: string): boolean {
  const a = findBlock(blocks, ancestorId)
  return !!a?.children && findBlock(a.children, id) !== undefined
}

// ---- Ağaç düzenleme ----

export function removeBlock(blocks: Block[], id: string): Block[] {
  let changed = false
  const out: Block[] = []
  for (const b of blocks) {
    if (b.id === id) {
      changed = true
      continue
    }
    if (b.children) {
      const kids = removeBlock(b.children, id)
      if (kids !== b.children) {
        changed = true
        out.push({ ...b, children: kids })
        continue
      }
    }
    out.push(b)
  }
  return changed ? out : blocks
}

/** Ham ekleme: kuralları denetlemez (bkz. canInsert). index [0, uzunluk] aralığına kıstırılır; ebeveyn yoksa değişmez. */
export function insertBlock(blocks: Block[], parentId: string | null, index: number, block: Block): Block[] {
  if (parentId === null) {
    const i = clampIndex(index, blocks.length)
    return [...blocks.slice(0, i), block, ...blocks.slice(i)]
  }
  let done = false
  const walk = (list: Block[]): Block[] => {
    let changed = false
    const out = list.map((b) => {
      if (done) return b
      if (b.id === parentId) {
        if (!b.children) return b
        done = true
        changed = true
        const kids = b.children
        const i = clampIndex(index, kids.length)
        return { ...b, children: [...kids.slice(0, i), block, ...kids.slice(i)] }
      }
      if (b.children) {
        const kids = walk(b.children)
        if (kids !== b.children) {
          changed = true
          return { ...b, children: kids }
        }
      }
      return b
    })
    return changed ? out : list
  }
  return walk(blocks)
}

function clampIndex(index: number, len: number): number {
  if (!Number.isFinite(index)) return len
  return Math.max(0, Math.min(len, Math.trunc(index)))
}

function listOf(blocks: Block[], parentId: string | null): Block[] | undefined {
  if (parentId === null) return blocks
  return findBlock(blocks, parentId)?.children
}

/**
 * Ekleme kuralları. `index`, ekleme öncesi listedeki boşluk konumudur (0..uzunluk).
 * - Başlatma bloğu: yalnız üst düzey, index 0, listede başka başlatma yokken.
 * - Başlatma bloğunun önüne (üst düzey index 0) başka blok girmez.
 * - Terminal bloktan sonraya ekleme yok; terminal blok yalnız listenin sonuna eklenir.
 * - Container olmayan bloğun içine ekleme yok.
 */
export function canInsert(blocks: Block[], parentId: string | null, index: number, type: BlockType): boolean {
  const def = BLOCK_BY_TYPE[type]
  if (!def) return false
  if (parentId !== null) {
    const parent = findBlock(blocks, parentId)
    if (!parent || !BLOCK_BY_TYPE[parent.type].container) return false
  }
  const list = listOf(blocks, parentId) ?? []
  if (!Number.isInteger(index) || index < 0 || index > list.length) return false

  if (def.trigger) {
    if (parentId !== null || index !== 0) return false
    return !list.some((b) => BLOCK_BY_TYPE[b.type].trigger)
  }
  // Başlatma bloğunun önüne blok girmez.
  if (parentId === null && index === 0 && list.length > 0 && BLOCK_BY_TYPE[list[0].type].trigger) return false
  // Terminal bloktan sonraya ekleme yok.
  if (list.slice(0, index).some((b) => BLOCK_BY_TYPE[b.type].terminal)) return false
  // Terminal blok arkasında blok bırakacak şekilde araya girmez.
  if (def.terminal && index < list.length) return false
  return true
}

/** moveBlock başarılı olur mu (hedef kendi torunu değil + ekleme kuralları). */
export function canMove(blocks: Block[], id: string, parentId: string | null, index: number): boolean {
  const block = findBlock(blocks, id)
  if (!block) return false
  if (parentId === id || isDescendant(blocks, id, parentId ?? '')) return false
  const from = locateBlock(blocks, id)
  if (!from) return false
  let target = index
  if (from.parentId === parentId && from.index < index) target = index - 1
  const rest = removeBlock(blocks, id)
  return canInsert(rest, parentId, target, block.type)
}

/**
 * Bloğu (alt ağacıyla) taşır. `index` taşıma öncesi listedeki boşluk konumudur; aynı listede
 * aşağı kaydırmada otomatik düzeltilir. Reddedilirse (kendi torununa taşıma, kural ihlali) `blocks` aynen döner.
 */
export function moveBlock(blocks: Block[], id: string, parentId: string | null, index: number): Block[] {
  if (!canMove(blocks, id, parentId, index)) return blocks
  const block = findBlock(blocks, id) as Block
  const from = locateBlock(blocks, id) as BlockLocation
  let target = index
  if (from.parentId === parentId && from.index < index) target = index - 1
  return insertBlock(removeBlock(blocks, id), parentId, target, block)
}

export function updateBlock(blocks: Block[], id: string, patch: Partial<Omit<Block, 'id'>>): Block[] {
  let changed = false
  const out = blocks.map((b) => {
    if (b.id === id) {
      changed = true
      return { ...b, ...patch }
    }
    if (b.children) {
      const kids = updateBlock(b.children, id, patch)
      if (kids !== b.children) {
        changed = true
        return { ...b, children: kids }
      }
    }
    return b
  })
  return changed ? out : blocks
}

export function isTrigger(type: BlockType): boolean {
  return !!BLOCK_BY_TYPE[type]?.trigger
}

/** Betik çalışabilir mi: ilk blok başlatma bloğu. */
export function scriptIsRunnable(script: Script): boolean {
  const first = script.blocks[0]
  return !!first && isTrigger(first.type)
}

// ---- Proje düzeyi ----

export function addScript(sprite: Sprite, trigger: 'flag' | 'tap'): Sprite {
  const script: Script = { id: newId('s'), blocks: [createBlock(trigger)] }
  return { ...sprite, scripts: [...sprite.scripts, script] }
}

export function removeScript(sprite: Sprite, scriptId: string): Sprite {
  if (!sprite.scripts.some((s) => s.id === scriptId)) return sprite
  return { ...sprite, scripts: sprite.scripts.filter((s) => s.id !== scriptId) }
}

/** Betiğin blok listesini değiştirir (arayüzün ağaç işlemlerinden sonra yazması için). */
export function setScriptBlocks(sprite: Sprite, scriptId: string, blocks: Block[]): Sprite {
  if (!sprite.scripts.some((s) => s.id === scriptId)) return sprite
  return { ...sprite, scripts: sprite.scripts.map((s) => (s.id === scriptId ? { ...s, blocks } : s)) }
}

export function updateSprite(page: Page, spriteId: string, patch: Partial<Omit<Sprite, 'id'>>): Page {
  if (!page.sprites.some((s) => s.id === spriteId)) return page
  return { ...page, sprites: page.sprites.map((s) => (s.id === spriteId ? { ...s, ...patch } : s)) }
}

// Sahneyi 3x3'e bölen hücre merkezleri, tercih sırasıyla (ilk sprite sol-ortada: sağa yürümeye yer kalır).
const CELL_ORDER: [number, number][] = [
  [1, 0], [1, 1], [1, 2], [0, 0], [2, 0], [0, 2], [2, 2], [0, 1], [2, 1],
]

/** Sahnede boş bir 3x3 hücresinin merkezi; hepsi doluysa mevcut spritelara en uzak merkez. */
export function pickSpawnPoint(sprites: { x: number; y: number }[]): { x: number; y: number } {
  const cw = STAGE_W / 3
  const ch = STAGE_H / 3
  const cellOf = (s: { x: number; y: number }) => ({
    r: Math.max(0, Math.min(2, Math.floor(s.y / ch))),
    c: Math.max(0, Math.min(2, Math.floor(s.x / cw))),
  })
  const occupied = new Set(sprites.map((s) => { const { r, c } = cellOf(s); return `${r},${c}` }))
  const center = (r: number, c: number) => ({ x: Math.round(cw * (c + 0.5)), y: Math.round(ch * (r + 0.5)) })
  for (const [r, c] of CELL_ORDER) if (!occupied.has(`${r},${c}`)) return center(r, c)
  let best = center(1, 0)
  let bestD = -1
  for (const [r, c] of CELL_ORDER) {
    const p = center(r, c)
    const d = Math.min(...sprites.map((s) => Math.hypot(s.x - p.x, s.y - p.y)))
    if (d > bestD) { bestD = d; best = p }
  }
  return best
}

/** Sayfaya yeni sprite ekler (betiksiz). Yeni sprite her zaman `sprites` dizisinin sonundadır. */
export function addSprite(page: Page, character: string): Page {
  const { x, y } = pickSpawnPoint(page.sprites)
  const sprite: Sprite = { id: newId('sp'), character, x, y, scripts: [] }
  return { ...page, sprites: [...page.sprites, sprite] }
}

export function removeSprite(page: Page, spriteId: string): Page {
  if (!page.sprites.some((s) => s.id === spriteId)) return page
  return { ...page, sprites: page.sprites.filter((s) => s.id !== spriteId) }
}

export function addPage(project: Project, background = 'grass'): Project {
  const page: Page = { id: newId('p'), background, sprites: [] }
  return { ...project, pages: [...project.pages, page] }
}

/** Sayfayı kimliğe ya da 0 tabanlı sıraya göre siler. Son kalan sayfa silinmez (proje en az 1 sayfa tutar). */
export function removePage(project: Project, pageIdOrIndex: string | number): Project {
  if (project.pages.length <= 1) return project
  const idx = typeof pageIdOrIndex === 'number' ? pageIdOrIndex : project.pages.findIndex((p) => p.id === pageIdOrIndex)
  if (!Number.isInteger(idx) || idx < 0 || idx >= project.pages.length) return project
  return { ...project, pages: project.pages.filter((_, i) => i !== idx) }
}

export function updatePage(project: Project, pageId: string, patch: Partial<Omit<Page, 'id'>>): Project {
  if (!project.pages.some((p) => p.id === pageId)) return project
  return { ...project, pages: project.pages.map((p) => (p.id === pageId ? { ...p, ...patch } : p)) }
}

export function emptyProject(background = 'grass'): Project {
  return { pages: [{ id: newId('p'), background, sprites: [] }] }
}

export function findSprite(project: Project, spriteId: string): { pageIndex: number; sprite: Sprite } | undefined {
  for (let pageIndex = 0; pageIndex < project.pages.length; pageIndex++) {
    const sprite = project.pages[pageIndex].sprites.find((s) => s.id === spriteId)
    if (sprite) return { pageIndex, sprite }
  }
  return undefined
}

/** Projedeki bir sprite'ı fonksiyonla günceller (hangi sayfada olduğunu bilmeden). */
export function mapSprite(project: Project, spriteId: string, fn: (s: Sprite) => Sprite): Project {
  let changed = false
  const pages = project.pages.map((p) => {
    if (!p.sprites.some((s) => s.id === spriteId)) return p
    changed = true
    return { ...p, sprites: p.sprites.map((s) => (s.id === spriteId ? fn(s) : s)) }
  })
  return changed ? { ...project, pages } : project
}
