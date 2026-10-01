import type { BlockType, Category } from './types'

export type Param =
  | { kind: 'number'; min: number; max: number; step: number; default: number; unit: string }
  | { kind: 'text'; default: string; maxLength: number }

export interface BlockDef {
  type: BlockType
  category: Category
  label: string
  icon: string
  param?: Param
  /** Betiğin ilk bloğu olabilen başlatma bloğu. */
  trigger?: boolean
  /** İç blok alabilen (C biçimli) blok. */
  container?: boolean
  /** Arkasına blok eklenemeyen blok (sonsuz tekrar, dur, sayfaya git). */
  terminal?: boolean
}

export const CATEGORIES: { key: Category; label: string; color: string }[] = [
  { key: 'start', label: 'Başlat', color: '#f5b400' },
  { key: 'motion', label: 'Hareket', color: '#2f80ed' },
  { key: 'looks', label: 'Görünüm', color: '#9b51e0' },
  { key: 'sound', label: 'Ses', color: '#27ae60' },
  { key: 'control', label: 'Kontrol', color: '#f2994a' },
  { key: 'end', label: 'Bitiş', color: '#eb5757' },
]

const n = (min: number, max: number, step: number, def: number, unit: string): Param => ({ kind: 'number', min, max, step, default: def, unit })

export const BLOCKS: BlockDef[] = [
  { type: 'flag', category: 'start', label: 'Yeşil bayrak', icon: '🏁', trigger: true },
  { type: 'tap', category: 'start', label: 'Dokununca', icon: '👆', trigger: true },
  { type: 'forward', category: 'motion', label: 'İleri', icon: '➡️', param: n(1, 10, 1, 3, 'adım') },
  { type: 'back', category: 'motion', label: 'Geri', icon: '⬅️', param: n(1, 10, 1, 3, 'adım') },
  { type: 'turnRight', category: 'motion', label: 'Sağa dön', icon: '↩️', param: n(15, 360, 15, 90, '°') },
  { type: 'turnLeft', category: 'motion', label: 'Sola dön', icon: '↪️', param: n(15, 360, 15, 90, '°') },
  { type: 'hop', category: 'motion', label: 'Zıpla', icon: '⤴️', param: n(1, 5, 1, 1, 'kez') },
  { type: 'goHome', category: 'motion', label: 'Eve dön', icon: '🏠' },
  { type: 'say', category: 'looks', label: 'Söyle', icon: '💬', param: { kind: 'text', default: 'Merhaba!', maxLength: 24 } },
  { type: 'grow', category: 'looks', label: 'Büyü', icon: '🔼' },
  { type: 'shrink', category: 'looks', label: 'Küçül', icon: '🔽' },
  { type: 'resetSize', category: 'looks', label: 'Boyutu sıfırla', icon: '↔️' },
  { type: 'hide', category: 'looks', label: 'Gizle', icon: '🙈' },
  { type: 'show', category: 'looks', label: 'Göster', icon: '👁️' },
  { type: 'pop', category: 'sound', label: 'Ses çal', icon: '🔊', param: n(1, 3, 1, 1, 'no') },
  { type: 'wait', category: 'control', label: 'Bekle', icon: '⏱️', param: n(0.5, 10, 0.5, 1, 'sn') },
  { type: 'repeat', category: 'control', label: 'Tekrarla', icon: '🔁', param: n(1, 20, 1, 3, 'kez'), container: true },
  { type: 'forever', category: 'end', label: 'Sonsuza kadar', icon: '♾️', container: true, terminal: true },
  { type: 'goPage', category: 'end', label: 'Sayfaya git', icon: '📄', param: n(1, 8, 1, 2, 'sayfa'), terminal: true },
  { type: 'stop', category: 'end', label: 'Dur', icon: '⏹️', terminal: true },
]

export const BLOCK_BY_TYPE = Object.fromEntries(BLOCKS.map((b) => [b.type, b])) as Record<BlockType, BlockDef>
export const CATEGORY_BY_KEY = Object.fromEntries(CATEGORIES.map((c) => [c.key, c])) as Record<Category, (typeof CATEGORIES)[number]>
export const ALL_BLOCK_TYPES = BLOCKS.map((b) => b.type)

/** Sahne karakterleri. Emoji kullanılır: ek dosya gerekmez. */
export const CHARACTERS: Record<string, { label: string; glyph: string }> = {
  cat: { label: 'Kedi', glyph: '🐱' },
  dog: { label: 'Köpek', glyph: '🐶' },
  rabbit: { label: 'Tavşan', glyph: '🐰' },
  bird: { label: 'Kuş', glyph: '🐦' },
  fish: { label: 'Balık', glyph: '🐟' },
  robot: { label: 'Robot', glyph: '🤖' },
  car: { label: 'Araba', glyph: '🚗' },
  rocket: { label: 'Roket', glyph: '🚀' },
  ball: { label: 'Top', glyph: '⚽' },
  star: { label: 'Yıldız', glyph: '⭐' },
  flower: { label: 'Çiçek', glyph: '🌸' },
  house: { label: 'Ev', glyph: '🏠' },
}

/** Sayfa arka planları (CSS background). */
export const BACKGROUNDS: Record<string, { label: string; css: string }> = {
  grass: { label: 'Çimen', css: 'linear-gradient(#bfe6ff 0 58%, #8fd16b 58% 100%)' },
  sky: { label: 'Gökyüzü', css: 'linear-gradient(#7ec8ff, #d8f0ff)' },
  night: { label: 'Gece', css: 'linear-gradient(#0f1b4d, #2b3a8c)' },
  space: { label: 'Uzay', css: 'radial-gradient(circle at 30% 30%, #2a1b5d, #060814 70%)' },
  room: { label: 'Oda', css: 'linear-gradient(#f4e3c3 0 70%, #c49a6c 70% 100%)' },
  sea: { label: 'Deniz', css: 'linear-gradient(#9be3ff 0 30%, #2a9df4 30% 100%)' },
  plain: { label: 'Düz', css: '#f8fafc' },
}
