// Proje modeli: oluşturma, doğrulama, içe/dışa aktarma ve tarayıcı kaydı.
import { GALLERY_BY_ID } from './assets'
import { isValidRows } from './pixels'
import { b, emptyProgram, program, set } from './dsl'
import { MAX_IMAGES, MAX_MAP_COLS, MAX_MAP_ROWS, MAX_TILESET, TILE_KEYS, type BlockNode, type BlockState, type OyunMap, type OyunProject } from './types'

export const PROJECT_STORAGE_KEY = 'ask:oyun:project:v1'
export const MAX_PROJECT_BYTES = 2_000_000

export function emptyProject(name = 'Yeni oyunum'): OyunProject {
  return { version: 1, name, blocks: emptyProgram(), images: {}, tileset: [], maps: [], bg: 8 }
}

/** Blok düğümlerini (iç içe) dolaşır. */
export function walkBlocks(state: BlockState | undefined, fn: (b: BlockNode) => void): void {
  const visit = (b: BlockNode | undefined): void => {
    for (let n = b; n; n = n.next?.block ?? n.next?.shadow) {
      fn(n)
      for (const i of Object.values(n.inputs ?? {})) { visit(i.block); visit(i.shadow) }
    }
  }
  for (const t of state?.blocks?.blocks ?? []) visit(t)
}

/** Programın adıyla andığı resim kimlikleri. */
export function imagesUsedByBlocks(state: BlockState | undefined): string[] {
  const out = new Set<string>()
  walkBlocks(state, (b) => { if (b.type === 'oyun_resim' && typeof b.fields?.IMG === 'string' && b.fields.IMG) out.add(b.fields.IMG) })
  return [...out]
}

/** Resim kimliği olarak kullanılabilir küçük harf/rakam/tire biçimi. */
export function slugify(name: string, fallback = 'resim'): string {
  const t = name.toLocaleLowerCase('tr-TR').replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  return t || fallback
}
export function uniqueImageId(images: Record<string, unknown>, base: string): string {
  const b = slugify(base)
  if (!(b in images)) return b
  for (let i = 2; i < 1000; i++) if (!(`${b}-${i}` in images)) return `${b}-${i}`
  return `${b}-${Date.now()}`
}

// ---------- karo takımı ve harita ----------
export const tileKey = (index: number): string => TILE_KEYS[index] ?? '.'

/** Resmin karo takımındaki sırasını verir; yoksa ekler (takım doluysa -1). */
export function ensureTile(p: OyunProject, image: string, wall = false): number {
  let i = p.tileset.findIndex((t) => t.image === image)
  if (i < 0) {
    if (p.tileset.length >= MAX_TILESET) return -1
    p.tileset.push({ image, wall })
    i = p.tileset.length - 1
  }
  return i
}

export function newMap(name: string, cols: number, rows: number): OyunMap {
  const c = Math.max(1, Math.min(MAX_MAP_COLS, Math.round(cols))), r = Math.max(1, Math.min(MAX_MAP_ROWS, Math.round(rows)))
  return { name, cols: c, rows: r, cells: Array.from({ length: r }, () => '.'.repeat(c)) }
}
export function setCell(m: OyunMap, col: number, row: number, ch: string): OyunMap {
  if (col < 0 || row < 0 || col >= m.cols || row >= m.rows) return m
  const cells = m.cells.slice()
  cells[row] = cells[row].slice(0, col) + ch + cells[row].slice(col + 1)
  return { ...m, cells }
}
export function resizeMap(m: OyunMap, cols: number, rows: number): OyunMap {
  const out = newMap(m.name, cols, rows)
  const cells = out.cells.map((line, r) => {
    const src = m.cells[r] ?? ''
    return (src + '.'.repeat(out.cols)).slice(0, out.cols) || line
  })
  return { ...out, cells }
}
/** Karo takımından bir giriş silinirken hücre karakterlerini yeniden numaralar. */
export function removeTileEntry(p: OyunProject, index: number): OyunProject {
  const key = tileKey(index)
  const maps = p.maps.map((m) => ({
    ...m,
    cells: m.cells.map((row) => [...row].map((ch) => {
      if (ch === key) return '.'
      const k = TILE_KEYS.indexOf(ch)
      return k > index ? tileKey(k - 1) : ch
    }).join('')),
  }))
  return { ...p, tileset: p.tileset.filter((_, i) => i !== index), maps }
}

// ---------- doğrulama ----------
const isObj = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x)

function validBlock(b: unknown, depth = 0): boolean {
  if (!isObj(b) || typeof b.type !== 'string' || depth > 400) return false
  if (b.fields !== undefined && !isObj(b.fields)) return false
  if (b.inputs !== undefined) {
    if (!isObj(b.inputs)) return false
    for (const i of Object.values(b.inputs)) {
      if (!isObj(i)) return false
      if (i.block !== undefined && !validBlock(i.block, depth + 1)) return false
      if (i.shadow !== undefined && !validBlock(i.shadow, depth + 1)) return false
    }
  }
  if (b.next !== undefined) {
    if (!isObj(b.next)) return false
    if (b.next.block !== undefined && !validBlock(b.next.block, depth + 1)) return false
  }
  return true
}

/** Dışarıdan gelen (içe aktarılan/saklanan) veriyi doğrular; geçersizse null. Fazlalık alanlar atılır. */
export function validateProject(x: unknown): OyunProject | null {
  if (!isObj(x) || x.version !== 1) return null
  const name = typeof x.name === 'string' ? x.name.slice(0, 60) : 'Oyunum'
  const bs = x.blocks
  if (!isObj(bs)) return null
  const top = isObj(bs.blocks) ? (bs.blocks as Record<string, unknown>).blocks : []
  if (top !== undefined && (!Array.isArray(top) || !top.every((b) => validBlock(b)))) return null
  const vars = Array.isArray(bs.variables) ? bs.variables.filter((v): v is { name: string; id: string } => isObj(v) && typeof v.name === 'string' && typeof v.id === 'string') : []
  const images: OyunProject['images'] = {}
  if (!isObj(x.images)) return null
  const entries = Object.entries(x.images)
  if (entries.length > MAX_IMAGES) return null
  for (const [id, im] of entries) {
    if (!/^[a-z0-9][a-z0-9-]{0,40}$/.test(id) || !isObj(im) || !isValidRows(im.rows, 32)) return null
    images[id] = { name: typeof im.name === 'string' ? im.name.slice(0, 40) : id, rows: [...(im.rows as string[])] }
  }
  const tileset = Array.isArray(x.tileset) ? x.tileset : []
  if (tileset.length > MAX_TILESET || !tileset.every((t) => isObj(t) && typeof t.image === 'string' && typeof t.wall === 'boolean')) return null
  const maps: OyunMap[] = []
  const rawMaps = Array.isArray(x.maps) ? x.maps : []
  if (rawMaps.length > 12) return null
  for (const m of rawMaps) {
    if (!isObj(m) || typeof m.name !== 'string' || !Number.isInteger(m.cols) || !Number.isInteger(m.rows) || !Array.isArray(m.cells)) return null
    const cols = m.cols as number, rows = m.rows as number
    if (cols < 1 || rows < 1 || cols > MAX_MAP_COLS || rows > MAX_MAP_ROWS || m.cells.length !== rows) return null
    if (!m.cells.every((r) => typeof r === 'string' && r.length === cols && /^[.0-9a-z]+$/.test(r))) return null
    maps.push({ name: m.name.slice(0, 30), cols, rows, cells: [...(m.cells as string[])] })
  }
  const bg = typeof x.bg === 'number' && Number.isInteger(x.bg) && x.bg >= 0 && x.bg < 16 ? x.bg : 8
  return {
    version: 1, name, bg, images,
    tileset: (tileset as { image: string; wall: boolean }[]).map((t) => ({ image: t.image, wall: t.wall })),
    maps,
    blocks: { blocks: { languageVersion: 0, blocks: (top as BlockNode[] | undefined) ?? [] }, variables: vars },
  }
}

export function serializeProject(p: OyunProject): string { return JSON.stringify(p) }
export function exportProject(p: OyunProject): string { return JSON.stringify(p, null, 2) }

export function parseProject(text: string): OyunProject | null {
  if (text.length > MAX_PROJECT_BYTES) return null
  try { return validateProject(JSON.parse(text)) } catch { return null }
}

/** Projede adı geçen ama `images` içinde olmayan galeri resimlerini projeye kopyalar (blok programı yazan DSL için kolaylık). */
export function withGalleryImages(p: OyunProject): OyunProject {
  const images = { ...p.images }
  const need = new Set(imagesUsedByBlocks(p.blocks))
  for (const t of p.tileset) need.add(t.image)
  for (const id of need) if (!images[id] && GALLERY_BY_ID[id]) images[id] = { name: GALLERY_BY_ID[id].name, rows: [...GALLERY_BY_ID[id].rows] }
  return { ...p, images }
}

// ---------- tarayıcı kaydı ----------
export function loadProject(key = PROJECT_STORAGE_KEY): OyunProject | null {
  try {
    const raw = typeof localStorage === 'undefined' ? null : localStorage.getItem(key)
    return raw ? parseProject(raw) : null
  } catch { return null }
}
export function saveProject(p: OyunProject, key = PROJECT_STORAGE_KEY): boolean {
  try {
    if (typeof localStorage === 'undefined') return false
    localStorage.setItem(key, serializeProject(p))
    return true
  } catch { return false }
}

/** Serbest atölyenin ilk açılışta gösterdiği küçük başlangıç projesi: tuşlarla gezen bir kedi. */
export function starterProject(): OyunProject {
  const p = emptyProject('Benim oyunum')
  p.bg = 10
  p.blocks = program([
    b('oyun_baslangic', {}, [
      b('sahne_renk', { C: 10 }),
      set('kedi', b('sprite_yeni', { IMG: 'oyuncu-kedi', K: 'oyuncu' })),
      b('sprite_konum', { S: 'kedi', X: 80, Y: 60 }),
      b('den_hareket', { S: 'kedi', M: 'four', N: 60 }),
      b('sprite_bayrak', { S: 'kedi', F: 'stay', ON: 'true' }),
    ]),
  ])
  return withGalleryImages(p)
}

/** Bir haritanın adı değişince bloklardaki ("haritayı yükle") başvuruları da günceller. */
export function renameMapRefs(p: OyunProject, from: string, to: string): OyunProject {
  if (from === to) return p
  const blocks = JSON.parse(JSON.stringify(p.blocks)) as BlockState
  walkBlocks(blocks, (b) => { if (b.type === 'oyun_harita' && b.fields?.MAP === from) b.fields.MAP = to })
  return { ...p, blocks }
}

/** Blokların adıyla andığı harita adları. */
export function mapsUsedByBlocks(state: BlockState | undefined): string[] {
  const out = new Set<string>()
  walkBlocks(state, (b) => { if (b.type === 'oyun_harita' && typeof b.fields?.MAP === 'string' && b.fields.MAP) out.add(b.fields.MAP) })
  return [...out]
}

/** Oyunun davranışını belirleyen içeriğin imzası: blok konumları/kimlikleri ve adlar yok sayılır (düzenleme sırasında değişenleri ayırt etmek için). */
export function gameSignature(p: OyunProject): string {
  return JSON.stringify([p.blocks.blocks?.blocks ?? [], p.images, p.tileset, p.maps, p.bg], function (this: Record<string, unknown>, k: string, v: unknown) {
    // yalnız blok düğümlerinde (type alanı olan nesneler) konum ve kimlik atılır
    return typeof this === 'object' && this !== null && typeof this.type === 'string' && (k === 'x' || k === 'y' || k === 'id') ? undefined : v
  })
}
