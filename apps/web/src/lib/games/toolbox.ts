// Seviyeye göre filtrelenmiş Blockly araç kutusu (JSON) ve blok sayma yardımcıları. Saf veri; Blockly'ye bağımlı değil.
import { BUILTIN_BLOCKS, CATEGORY_COLOURS, DYNAMIC_PROCEDURE_TYPES, DYNAMIC_VARIABLE_TYPES } from './builtin-blocks'
import { countBlocks, type ProgramState } from './program'
import type { GameBlockDef, GameDef, LevelDef } from './types'

export interface ToolboxCategoryInfo { name: string; colour: string; types: string[]; custom?: 'VARIABLE' | 'PROCEDURE' }

const FALLBACK_COLOURS = ['#4c97ff', '#ff8c1a', '#59c059', '#ff6680', '#9966ff', '#ffab19', '#0fbd8c']

export function defOf(game: Pick<GameDef, 'blocks'>, type: string): GameBlockDef | undefined {
  return game.blocks.find((x) => x.type === type)
}

/** Seviyedeki blok türlerini kategorilere ayırır (ilk görünüş sırasıyla). */
export function toolboxCategories(game: Pick<GameDef, 'blocks'>, level: LevelDef): ToolboxCategoryInfo[] {
  const out: ToolboxCategoryInfo[] = []
  const find = (name: string, colour: string) => {
    let c = out.find((x) => x.name === name)
    if (!c) { c = { name, colour, types: [] }; out.push(c) }
    return c
  }
  let fi = 0
  for (const t of level.toolbox) {
    const custom = defOf(game, t)
    if (custom) {
      if (custom.hat) continue
      find(custom.category, custom.colour ?? (typeof custom.json.colour === 'string' ? custom.json.colour : FALLBACK_COLOURS[fi++ % FALLBACK_COLOURS.length])).types.push(t)
      continue
    }
    const bi = BUILTIN_BLOCKS[t]
    if (!bi) throw new Error(`Bilinmeyen blok türü araç kutusunda: ${t}`)
    if (DYNAMIC_VARIABLE_TYPES.has(t)) { find('Değişkenler', CATEGORY_COLOURS['Değişkenler']).custom = 'VARIABLE'; continue }
    if (DYNAMIC_PROCEDURE_TYPES.has(t)) { find('İşlevler', CATEGORY_COLOURS['İşlevler']).custom = 'PROCEDURE'; continue }
    find(bi.category, CATEGORY_COLOURS[bi.category] ?? FALLBACK_COLOURS[0]).types.push(t)
  }
  return out
}

function blockEntry(t: string) {
  const preset = BUILTIN_BLOCKS[t]?.preset
  return { kind: 'block', type: t, ...(preset?.inputs ? { inputs: preset.inputs } : {}), ...(preset?.fields ? { fields: preset.fields } : {}) }
}

/** Blockly `categoryToolbox` JSON'u. */
export function buildToolbox(game: Pick<GameDef, 'blocks'>, level: LevelDef) {
  const cats = toolboxCategories(game, level)
  return {
    kind: 'categoryToolbox',
    contents: cats.map((c, i) => ({
      kind: 'category',
      name: c.name,
      colour: c.colour,
      cssConfig: { icon: `gm-ic-${i}` },
      ...(c.custom ? { custom: c.custom } : { contents: c.types.map(blockEntry) }),
    })),
  }
}

/** Sayıma katılmayan türler: başlık ve `free` blokları. */
export function freeTypes(game: Pick<GameDef, 'blocks'>): Set<string> {
  return new Set(game.blocks.filter((d) => d.hat || d.free).map((d) => d.type))
}

export function blockCount(game: Pick<GameDef, 'blocks'>, program: ProgramState): number {
  return countBlocks(program, freeTypes(game))
}

/** Seviyede kullanılabilir tür kümesi (araç kutusu + başlık/ücretsiz bloklar + işlev tanımları). */
export function allowedTypes(game: Pick<GameDef, 'blocks'>, level: LevelDef): Set<string> {
  const s = new Set<string>(level.toolbox)
  for (const d of game.blocks) if (d.hat || d.free) s.add(d.type)
  if (level.toolbox.some((t) => DYNAMIC_PROCEDURE_TYPES.has(t))) for (const t of DYNAMIC_PROCEDURE_TYPES) s.add(t)
  // sabit değer blokları araç kutusunda olmasa da girişlerde gölge olarak bulunur
  s.add('math_number'); s.add('text'); s.add('logic_boolean')
  return s
}
