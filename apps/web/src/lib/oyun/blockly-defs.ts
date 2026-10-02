// Blockly'ye özel blok tanımlarını yükler (tarayıcıda ve başsız Node testlerinde). Blockly modülü dışarıdan verilir.
import type * as BlocklyNS from 'blockly'
import { BLOCK_JSON, CATEGORIES } from './blocks'
import { PALETTE } from './palette'
import { applyTurkishMessages } from './messages'
import { parse } from './pixels'

type B = typeof BlocklyNS

export interface ImageRef { id: string; name?: string; rows: string[] }
export interface OptionProviders {
  /** Resim açılır listesindeki resimler. */
  images: () => ImageRef[]
  /** Harita açılır listesindeki harita adları. */
  maps: () => string[]
}
let providers: OptionProviders = { images: () => [], maps: () => [] }
export const setOptionProviders = (p: OptionProviders): void => { providers = p }

const thumbCache = new Map<string, string>()
/** Resmin küçük önizlemesi (data URL). DOM yoksa null. */
export function thumbnail(rows: string[]): string | null {
  if (typeof document === 'undefined') return null
  const key = rows.join('|')
  const hit = thumbCache.get(key)
  if (hit) return hit
  try {
    const pix = parse(rows)
    const c = document.createElement('canvas')
    c.width = pix.w; c.height = pix.h
    const ctx = c.getContext('2d')
    if (!ctx) return null
    for (let y = 0; y < pix.h; y++) for (let x = 0; x < pix.w; x++) {
      const v = pix.d[y * pix.w + x]
      if (v < 0) continue
      ctx.fillStyle = PALETTE[v].hex
      ctx.fillRect(x, y, 1, 1)
    }
    const url = c.toDataURL('image/png')
    if (thumbCache.size > 300) thumbCache.clear()
    thumbCache.set(key, url)
    return url
  } catch { return null }
}

function imageOptions(): [string | { src: string; width: number; height: number; alt: string }, string][] {
  const list = providers.images()
  if (!list.length) return [['(resim yok)', '']]
  return list.map((im) => {
    const src = thumbnail(im.rows)
    const label = im.name || im.id
    if (!src) return [label, im.id] as [string, string]
    const pix = parse(im.rows)
    const scale = pix.w >= 24 ? 1 : pix.w >= 16 ? 2 : 3
    return [{ src, width: Math.min(64, pix.w * scale), height: Math.min(64, pix.h * scale), alt: label }, im.id]
  })
}
function mapOptions(): [string, string][] {
  const l = providers.maps()
  return l.length ? l.map((n) => [n, n] as [string, string]) : [['(harita yok)', '']]
}

let defined = false
export function defineOyunBlocks(Blockly: B): void {
  if (defined) return
  defined = true
  applyTurkishMessages(Blockly.Msg as unknown as Record<string, string>)
  Blockly.defineBlocksWithJsonArray(BLOCK_JSON as unknown as object[])
  Blockly.Blocks['oyun_resim'] = {
    init(this: BlocklyNS.Block) {
      this.appendDummyInput().appendField(new Blockly.FieldDropdown(imageOptions as unknown as BlocklyNS.MenuGenerator), 'IMG')
      this.setOutput(true, 'Image')
      this.setStyle('oyun_sprite')
      this.setTooltip('Bir resim seç.')
    },
  }
  Blockly.Blocks['oyun_harita'] = {
    init(this: BlocklyNS.Block) {
      this.appendDummyInput().appendField(new Blockly.FieldDropdown(mapOptions as unknown as BlocklyNS.MenuGenerator), 'MAP')
      this.setOutput(true, 'Map')
      this.setStyle('oyun_sahne')
      this.setTooltip('Bir harita seç.')
    },
  }
}

export const shade = (hex: string, amount: number): string => {
  const n = parseInt(hex.slice(1), 16)
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round(amount < 0 ? v * (1 + amount) : v + (255 - v) * amount)))
  return `#${((1 << 24) | (ch((n >> 16) & 255) << 16) | (ch((n >> 8) & 255) << 8) | ch(n & 255)).toString(16).slice(1)}`
}

const STD_STYLE: Record<string, string> = {
  logic_blocks: 'mantik', loop_blocks: 'dongu', math_blocks: 'matematik', text_blocks: 'metin', variable_blocks: 'degisken', variable_dynamic_blocks: 'degisken', procedure_blocks: 'fonksiyon',
}

export function makeTheme(Blockly: B): BlocklyNS.Theme {
  const colour = (key: string) => CATEGORIES.find((c) => c.key === key)!.colour
  const style = (hex: string) => ({ colourPrimary: hex, colourSecondary: shade(hex, 0.25), colourTertiary: shade(hex, -0.25) })
  const blockStyles: Record<string, ReturnType<typeof style>> = {}
  for (const c of CATEGORIES) blockStyles[`oyun_${c.key}`] = style(c.colour)
  for (const [name, key] of Object.entries(STD_STYLE)) blockStyles[name] = style(colour(key))
  const categoryStyles = Object.fromEntries(CATEGORIES.map((c) => [`oyun_cat_${c.key}`, { colour: c.colour }]))
  return Blockly.Theme.defineTheme('oyun_atolye', {
    name: 'oyun_atolye',
    base: Blockly.Themes.Classic,
    blockStyles,
    categoryStyles,
    componentStyles: {
      workspaceBackgroundColour: '#f3f6fc',
      toolboxBackgroundColour: '#ffffff',
      toolboxForegroundColour: '#2b3350',
      flyoutBackgroundColour: '#e6edf7',
      flyoutOpacity: 1,
      scrollbarColour: '#8b97ad',
      scrollbarOpacity: 0.5,
      insertionMarkerColour: '#000000',
      insertionMarkerOpacity: 0.25,
      selectedGlowColour: '#ffd23f',
      selectedGlowOpacity: 0.9,
    },
    fontStyle: { family: 'system-ui, "Segoe UI", Roboto, sans-serif', weight: '700', size: 15 },
    startHats: true,
  })
}
