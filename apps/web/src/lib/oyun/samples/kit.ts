// Örnek oyunlar için ortak kısayollar.
import { b, program, type Prop } from '../dsl'
import { newMap, withGalleryImages } from '../project'
import type { BlockNode, OyunMap, OyunProject, OyunTile } from '../types'
import { TILE_KEYS } from '../types'

export const bu = (): BlockNode => b('oyun_bu_sprite')
export const diger = (): BlockNode => b('oyun_diger_sprite')
export const oku = (s: Prop, p: string): BlockNode => b('sprite_oku', { S: s, P: p })
export const olayKaro = (a: 'col' | 'row'): BlockNode => b('harita_olay_karo', { A: a })

export interface OyunSample {
  id: string
  name: string
  summary: string
  /** 1 kolay · 2 orta · 3 zor (okuyacak blok sayısı ve mantığa göre) */
  level: 1 | 2 | 3
  /** Oyuncuya kısa kullanım notu. */
  controls: string
  /** İngilizce ad, özet ve kullanım notu (site dili İngilizceyken). */
  en?: { name: string; summary: string; controls: string }
  project: () => OyunProject
}

export function makeProject(name: string, tops: BlockNode[], extra: Partial<OyunProject> = {}): OyunProject {
  return withGalleryImages({ version: 1, name, blocks: program(tops), images: {}, tileset: [], maps: [], bg: 8, ...extra })
}

/** Harita çizimi için yardımcı: `legend` karakterden karo takımı sırasına eşler. */
export function mapFromRows(name: string, rows: string[], legend: Record<string, number>): OyunMap {
  const m = newMap(name, rows[0].length, rows.length)
  return { ...m, cells: rows.map((r) => [...r].map((ch) => (ch in legend ? TILE_KEYS[legend[ch]] : '.')).join('')) }
}

export const tiles = (...defs: [string, boolean][]): OyunTile[] => defs.map(([image, wall]) => ({ image, wall }))
