// ASK Jr — Blockly blok tanımları. Bu dosya SAF veridir (Blockly'yi içe aktarmaz): sunucuda ve Node testlerinde güvenle yüklenir.
// Her BLOCKS girdisi için bir `jr_<tür>` tanımı üretilir; şekiller Scratch gibidir (zelos çizici):
//   başlık  -> önceki bağlantı yok, sonraki var (üstü kubbeli)
//   yığın   -> önceki + sonraki
//   kapak   -> önceki var, sonraki YOK (terminal)
//   C       -> 'DO' deyim girişi (container)

import { BLOCKS, CATEGORIES, type BlockDef } from './blocks'
import type { BlockType, Category } from './types'

export const BLOCK_PREFIX = 'jr_'
export const blockName = (type: BlockType): string => `${BLOCK_PREFIX}${type}`
export const typeOfName = (name: string): BlockType | null => {
  if (!name.startsWith(BLOCK_PREFIX)) return null
  const t = name.slice(BLOCK_PREFIX.length)
  return BLOCKS.some((b) => b.type === t) ? (t as BlockType) : null
}
export const styleName = (c: Category): string => `jr_${c}`

/** Sayının ÖNÜNE yazılan birimler ("Ses çal no 1"); diğerleri sayıdan sonra gelir ("İleri 3 adım"). */
const PREFIX_UNITS = new Set(['no', 'sayfa'])

export type BlockShape = 'hat' | 'stack' | 'cap' | 'c' | 'c-cap'
export function shapeOf(def: BlockDef): BlockShape {
  if (def.trigger) return 'hat'
  if (def.container) return def.terminal ? 'c-cap' : 'c'
  return def.terminal ? 'cap' : 'stack'
}

export interface BlockJson {
  type: string
  style: string
  message0: string
  args0: Record<string, unknown>[]
  message1?: string
  args1?: Record<string, unknown>[]
  previousStatement?: null
  nextStatement?: null
  extensions?: string[]
  tooltip: string
  inputsInline: boolean
}

export function blockJson(def: BlockDef): BlockJson {
  const args0: Record<string, unknown>[] = [{ type: 'field_label', name: 'ICON', text: def.icon }]
  let message0 = `%1 ${def.label}`
  const p = def.param
  if (p?.kind === 'number') {
    const num = { type: 'field_number', name: 'VALUE', value: p.default, min: p.min, max: p.max, precision: p.step }
    if (PREFIX_UNITS.has(p.unit)) {
      message0 += ` ${p.unit} %2`
      args0.push(num)
    } else {
      message0 += ' %2'
      args0.push(num)
      args0.push({ type: 'field_label', name: 'UNIT', text: p.unit })
      message0 += ' %3'
    }
  } else if (p?.kind === 'text') {
    message0 += ' %2'
    args0.push({ type: 'field_input', name: 'TEXT', text: p.default, spellcheck: false })
  }
  const json: BlockJson = {
    type: blockName(def.type),
    style: styleName(def.category),
    message0,
    args0,
    tooltip: def.label,
    inputsInline: true,
  }
  if (!def.trigger) json.previousStatement = null
  if (!def.terminal) json.nextStatement = null
  if (def.container) {
    json.message1 = '%1'
    json.args1 = [{ type: 'input_statement', name: 'DO' }]
  }
  if (def.param?.kind === 'text') json.extensions = ['jr_text_limit']
  return json
}

export const BLOCK_JSON: BlockJson[] = BLOCKS.map(blockJson)

/** Metin alanının en çok kaç karakter alabileceği (uzantı için). */
export const TEXT_LIMIT: number = (() => {
  const say = BLOCKS.find((b) => b.param?.kind === 'text')
  return say?.param?.kind === 'text' ? say.param.maxLength : 24
})()

/** Çalışma alanı teması için kategori başına blok stili (açık/koyu tonlar kategori renginden türetilir). */
export function shade(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16)
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round(amount < 0 ? v * (1 + amount) : v + (255 - v) * amount)))
  const r = ch((n >> 16) & 255), g = ch((n >> 8) & 255), b = ch(n & 255)
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`
}

export function blockStyles(): Record<string, { colourPrimary: string; colourSecondary: string; colourTertiary: string; hat: string }> {
  const out: Record<string, { colourPrimary: string; colourSecondary: string; colourTertiary: string; hat: string }> = {}
  for (const c of CATEGORIES) {
    out[styleName(c.key)] = {
      colourPrimary: c.color,
      colourSecondary: shade(c.color, 0.25),
      colourTertiary: shade(c.color, -0.25),
      hat: c.key === 'start' ? 'cap' : '',
    }
  }
  return out
}

export const CATEGORY_ICON: Record<Category, string> = { start: '🏁', motion: '🏃', looks: '👀', sound: '🔊', control: '🔁', end: '🛑' }

export interface ToolboxCategory { key: Category; name: string; colour: string; types: BlockType[] }

/** Yalnız izinli blok içeren kategoriler (boş kategori yok). */
export function toolboxCategories(allowed: BlockType[]): ToolboxCategory[] {
  const ok = new Set<BlockType>(allowed)
  return CATEGORIES
    .map((c) => ({ key: c.key, name: c.label, colour: c.color, types: BLOCKS.filter((b) => b.category === c.key && ok.has(b.type)).map((b) => b.type) }))
    .filter((c) => c.types.length > 0)
}

/** Varsayılan alan değerleriyle araç kutusu girdisi (flyout bloğu). */
export function flyoutBlockEntry(type: BlockType): { kind: 'block'; type: string; fields?: Record<string, unknown> } {
  return { kind: 'block', type: blockName(type) }
}

/** Blockly'nin beklediği araç kutusu JSON'u. */
export function toolboxJson(allowed: BlockType[]) {
  return {
    kind: 'categoryToolbox',
    contents: toolboxCategories(allowed).map((c) => ({
      kind: 'category',
      name: c.name,
      categorystyle: `jr_cat_${c.key}`,
      cssConfig: { icon: `jrb-ic-${c.key}` },
      cssconfig: { icon: `jrb-ic-${c.key}` },
      contents: c.types.map(flyoutBlockEntry),
    })),
  }
}
