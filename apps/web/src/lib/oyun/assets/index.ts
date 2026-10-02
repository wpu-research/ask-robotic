// Hazır resim galerisi: hepsi bu projeye özel, elle çizilmiş (telifsiz) ASCII piksel resimlerdir.
import { isValidRows } from '../pixels'
import { ENEMIES } from './enemies'
import { FOODS } from './food'
import { OBJECTS } from './objects'
import { PLAYERS } from './players'
import { TILES } from './tiles'
import type { Asset, AssetCategory } from './types'

export { CATEGORY_LABEL } from './types'
export type { Asset, AssetCategory } from './types'

export const GALLERY: readonly Asset[] = [...PLAYERS, ...ENEMIES, ...FOODS, ...OBJECTS, ...TILES]
export const GALLERY_BY_ID: Readonly<Record<string, Asset>> = Object.fromEntries(GALLERY.map((a) => [a.id, a]))
export const GALLERY_CATEGORIES: readonly AssetCategory[] = ['oyuncu', 'dusman', 'yiyecek', 'nesne', 'karo']

export const galleryOf = (c: AssetCategory): Asset[] => GALLERY.filter((a) => a.category === c)

/** Galeriden bir resmin projeye eklenecek kopyası. */
export function galleryImage(id: string): { name: string; rows: string[] } {
  const a = GALLERY_BY_ID[id]
  if (!a) throw new Error(`Galeride '${id}' resmi yok`)
  return { name: a.name, rows: [...a.rows] }
}

/** Yalnız verilen kimlikleri içeren proje resim tablosu (örnek oyunlar ve etkinlikler için). */
export function pickImages(ids: readonly string[]): Record<string, { name: string; rows: string[] }> {
  return Object.fromEntries(ids.map((id) => [id, galleryImage(id)]))
}

export const assetsValid = (): string[] => GALLERY.filter((a) => !isValidRows(a.rows, 32)).map((a) => a.id)
