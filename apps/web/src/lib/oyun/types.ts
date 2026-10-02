// Oyun Atölyesi — ortak türler. Bu dosya saf veridir; Blockly ya da DOM içermez.

export const SCREEN_W = 160
export const SCREEN_H = 120
export const TILE = 16

/** Blockly'nin `serialization.workspaces.save` çıktısındaki blok düğümü. */
export interface BlockNode {
  type: string
  id?: string
  x?: number
  y?: number
  fields?: Record<string, unknown>
  inputs?: Record<string, { block?: BlockNode; shadow?: BlockNode }>
  next?: { block?: BlockNode; shadow?: BlockNode }
  extraState?: unknown
  enabled?: boolean
  disabled?: boolean
}
export interface BlockState {
  blocks?: { languageVersion?: number; blocks?: BlockNode[] }
  variables?: { name: string; id: string; type?: string }[]
}

/** Piksel resim: her satır bir dize; '0'-'9','a'-'f' palet rengi, '.' saydam. */
export interface OyunImage { name?: string; rows: string[] }

/** Karo takımındaki bir giriş. Harita hücreleri, girişin sırasına karşılık gelen anahtar karakterle yazılır (bkz. TILE_KEYS). */
export interface OyunTile { image: string; wall: boolean }

export interface OyunMap {
  name: string
  cols: number
  rows: number
  /** `rows` adet dize, her biri `cols` karakter. '.' boş; diğer karakter karo takımı sırasını gösterir. */
  cells: string[]
}

export interface OyunProject {
  version: 1
  name: string
  blocks: BlockState
  /** Projenin kullandığı resimler (kimlik → resim). Resim kimlikleri küçük harf/rakam/tire içerir. */
  images: Record<string, OyunImage>
  tileset: OyunTile[]
  maps: OyunMap[]
  /** Başlangıç arka plan rengi (palet sırası). */
  bg: number
}

/** Karo takımı sırasına karşılık gelen hücre karakterleri. */
export const TILE_KEYS = '123456789abcdefghijklmnopqrstuvwxyz'
export const MAX_TILESET = TILE_KEYS.length
export const MAX_MAP_COLS = 60
export const MAX_MAP_ROWS = 40
export const MAX_IMAGES = 120

export type Button = 'up' | 'down' | 'left' | 'right' | 'a' | 'b'
export const BUTTONS: readonly Button[] = ['up', 'down', 'left', 'right', 'a', 'b']

export const KINDS = [
  { id: 'oyuncu', label: 'Oyuncu' },
  { id: 'dusman', label: 'Düşman' },
  { id: 'yiyecek', label: 'Yiyecek' },
  { id: 'mermi', label: 'Mermi' },
  { id: 'nesne', label: 'Nesne' },
  { id: 'bonus', label: 'Bonus' },
  { id: 'engel', label: 'Engel' },
  { id: 'hedef', label: 'Hedef' },
] as const
export type KindId = (typeof KINDS)[number]['id']
export const KIND_IDS: readonly string[] = KINDS.map((k) => k.id)
