// Blockly'ye Sahne Atölyesi bloklarını yükler (tarayıcıda ve başsız Node testlerinde). Blockly modülü dışarıdan verilir.
// Dinamik açılır listeler (kostüm, ses, sprite, mesaj…) `setOptionProviders` ile projeye bağlanır.
import type * as BlocklyNS from 'blockly'
import { ARG_BLOCK, BLOCK_BY_TYPE, BLOCK_JSON, CATEGORIES, PROCS_CALLBACK, PROC_CALL_PREFIX, PROC_DEF_PREFIX, VARS_CALLBACK, VAR_GET, shadowOf, styleName, type DynKind } from './blocks'
import type { ProcDef, VarDef } from './types'

type B = typeof BlocklyNS

export interface SpriteRef { id: string; name: string }
export interface OptionProviders {
  costumes: () => string[]
  backdrops: () => string[]
  sounds: () => string[]
  /** Geçerli hedef dışındaki sprite'lar. */
  sprites: () => SpriteRef[]
  messages: () => string[]
  /** "Yeni mesaj…" seçilince çağrılır; ad sorulur ve `done(ad)` ile geri dönülür. */
  askMessage?: (done: (name: string) => void) => void
}
let providers: OptionProviders = { costumes: () => [], backdrops: () => [], sounds: () => [], sprites: () => [], messages: () => [] }
export const setOptionProviders = (p: Partial<OptionProviders>): void => { providers = { ...providers, ...p } }

export const NEW_MESSAGE = '__yeni__'

type Opts = [string, string][]
const names = (xs: string[], empty: string): Opts => (xs.length ? xs.map((x) => [x, x] as [string, string]) : [[empty, '']])
const spriteOpts = (): Opts => providers.sprites().map((s) => [s.name, s.id] as [string, string])

export function dynOptions(kind: DynKind): Opts {
  switch (kind) {
    case 'costume': return names(providers.costumes(), '(kostüm yok)')
    case 'backdrop': return names(providers.backdrops(), '(arka plan yok)')
    case 'sound': return names(providers.sounds(), '(ses yok)')
    case 'touch': return [['fare imleci', '_mouse_'], ['kenar', '_edge_'], ...spriteOpts()]
    case 'goto': return [['rastgele konum', '_random_'], ['fare imleci', '_mouse_'], ...spriteOpts()]
    case 'towards': return [['fare imleci', '_mouse_'], ...spriteOpts()]
    case 'clone': return [['kendimin', '_myself_'], ...spriteOpts()]
    case 'ofTarget': return [['sahne', '_stage_'], ...spriteOpts()]
    case 'message': {
      const m = providers.messages()
      return [...(m.length ? m.map((x) => [x, x] as [string, string]) : [['mesaj1', 'mesaj1'] as [string, string]]), ['Yeni mesaj…', NEW_MESSAGE]]
    }
  }
}

export const shade = (hex: string, amount: number): string => {
  const n = parseInt(hex.slice(1), 16)
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round(amount < 0 ? v * (1 + amount) : v + (255 - v) * amount)))
  return `#${((1 << 24) | (ch((n >> 16) & 255) << 16) | (ch((n >> 8) & 255) << 8) | ch(n & 255)).toString(16).slice(1)}`
}

/** Blockly'nin kendi blokları (sayı, metin, değişken) için hangi kategori renginde çizileceği. */
const STD_STYLE: Record<string, string> = { math_blocks: 'islemler', text_blocks: 'islemler', variable_blocks: 'degiskenler', variable_dynamic_blocks: 'degiskenler' }

export function makeTheme(Blockly: B): BlocklyNS.Theme {
  const colour = (key: string) => CATEGORIES.find((c) => c.key === key)!.colour
  const style = (hex: string) => ({ colourPrimary: hex, colourSecondary: shade(hex, 0.25), colourTertiary: shade(hex, -0.25) })
  const blockStyles: Record<string, ReturnType<typeof style>> = {}
  for (const c of CATEGORIES) blockStyles[styleName(c.key)] = style(c.colour)
  for (const [name, key] of Object.entries(STD_STYLE)) blockStyles[name] = style(colour(key))
  const categoryStyles = Object.fromEntries(CATEGORIES.map((c) => [`sh_cat_${c.key}`, { colour: c.colour }]))
  return Blockly.Theme.defineTheme('sahne_atolyesi', {
    name: 'sahne_atolyesi',
    base: Blockly.Themes.Classic,
    blockStyles,
    categoryStyles,
    componentStyles: {
      workspaceBackgroundColour: '#f3f6fc',
      toolboxBackgroundColour: '#ffffff',
      toolboxForegroundColour: '#575e75',
      flyoutBackgroundColour: '#e6edf7',
      flyoutOpacity: 1,
      scrollbarColour: '#8b97ad',
      scrollbarOpacity: 0.5,
      insertionMarkerColour: '#000000',
      insertionMarkerOpacity: 0.25,
      selectedGlowColour: '#ffd23f',
      selectedGlowOpacity: 0.9,
    },
    fontStyle: { family: 'system-ui, "Segoe UI", Roboto, "Noto Color Emoji", sans-serif', weight: '700', size: 15 },
    startHats: true,
  })
}

let defined = false
export function defineSahneBlocks(Blockly: B): void {
  if (defined) return
  defined = true

  class DynField extends Blockly.FieldDropdown {
    kind: DynKind
    constructor(kind: DynKind) {
      super((() => dynOptions(kind)) as unknown as BlocklyNS.MenuGenerator)
      this.kind = kind
      if (kind === 'message') {
        this.setValidator((v: string) => {
          if (v === NEW_MESSAGE) {
            providers.askMessage?.((name) => { this.setValue(name) })
            return null
          }
          return v
        })
      }
    }
    static override fromJson(o: BlocklyNS.FieldDropdownFromJsonConfig): DynField { return new DynField((o as unknown as { kind: DynKind }).kind) }
  }
  Blockly.fieldRegistry.register('field_sh_dyn', DynField as unknown as Parameters<typeof Blockly.fieldRegistry.register>[1])
  Blockly.defineBlocksWithJsonArray(BLOCK_JSON as unknown as object[])
  Blockly.defineBlocksWithJsonArray([{
    type: ARG_BLOCK, message0: '%1', args0: [{ type: 'field_label_serializable', name: 'NAME', text: 'girdi' }],
    output: null, style: styleName('bloklarim'), tooltip: 'Bu bloğun girdisi', inputsInline: true,
  }])
}

/** "Bir blok yap" ile eklenen blokların (tanım + çağrı) Blockly tanımları. Her çağrıda yeniden tanımlanır (ad değişmiş olabilir). */
export function defineProcBlocks(Blockly: B, procs: ProcDef[]): void {
  for (const p of procs) {
    Blockly.Blocks[PROC_DEF_PREFIX + p.id] = {
      init(this: BlocklyNS.Block) {
        const row = this.appendDummyInput().appendField('tanımla')
        row.appendField(new Blockly.FieldLabel(p.name), 'PNAME')
        for (const prm of p.params) row.appendField(new Blockly.FieldLabel(`(${prm})`))
        this.setNextStatement(true)
        this.setStyle(styleName('bloklarim'))
        this.setTooltip(`'${p.name}' bloğunun ne yaptığını altına yaz.`)
      },
    }
    Blockly.Blocks[PROC_CALL_PREFIX + p.id] = {
      init(this: BlocklyNS.Block) {
        this.appendDummyInput().appendField(p.name)
        p.params.forEach((prm, i) => this.appendValueInput(`P${i}`).appendField(prm))
        this.setInputsInline(true)
        this.setPreviousStatement(true)
        this.setNextStatement(true)
        this.setStyle(styleName('bloklarim'))
        this.setTooltip(`'${p.name}' bloğunu çalıştırır.`)
      },
    }
  }
}

export interface FlyoutHandlers {
  vars: () => VarDef[]
  procs: () => ProcDef[]
  /** Araç kutusunda izinli blok türleri (null = hepsi). */
  allowed: () => ReadonlySet<string> | null
  newVar: () => void
  newList: () => void
  newProc: () => void
}

type Entry = Record<string, unknown>
const varField = (v: VarDef) => ({ id: v.id, name: v.name, type: v.type })

/** "Değişkenler" ve "Bloklarım" kategorilerinin özel liste üreticilerini çalışma alanına bağlar. */
export function registerFlyouts(ws: BlocklyNS.WorkspaceSvg, h: FlyoutHandlers): void {
  ws.registerButtonCallback('SAHNE_NEWVAR', () => h.newVar())
  ws.registerButtonCallback('SAHNE_NEWLIST', () => h.newList())
  ws.registerButtonCallback('SAHNE_NEWPROC', () => h.newProc())

  const blockEntry = (type: string, field: string | null, v: VarDef | null): Entry => {
    const def = BLOCK_BY_TYPE[type]
    const e: Entry = { kind: 'block', type }
    const inputs: Record<string, unknown> = {}
    if (def) for (const [n, a] of Object.entries(def.args)) { const s = shadowOf(a); if (s) inputs[n] = { shadow: s } }
    if (Object.keys(inputs).length) e.inputs = inputs
    if (field && v) e.fields = { [field]: varField(v) }
    return e
  }

  ws.registerToolboxCategoryCallback(VARS_CALLBACK, () => {
    const ok = h.allowed()
    const allow = (t: string) => !ok || ok.has(t)
    const all = h.vars()
    const vars = all.filter((v) => v.type === '')
    const lists = all.filter((v) => v.type === 'List')
    const out: Entry[] = [{ kind: 'button', text: 'Değişken oluştur', callbackKey: 'SAHNE_NEWVAR' }]
    for (const v of vars) if (allow(VAR_GET)) out.push({ kind: 'block', type: VAR_GET, fields: { VAR: varField(v) } })
    if (vars.length) {
      out.push({ kind: 'sep', gap: 14 })
      for (const t of ['sh_var_set', 'sh_var_change', 'sh_var_show', 'sh_var_hide']) if (allow(t)) out.push(blockEntry(t, 'V', vars[0]))
    }
    if (allow('sh_list_add')) {
      out.push({ kind: 'sep', gap: 22 }, { kind: 'button', text: 'Liste oluştur', callbackKey: 'SAHNE_NEWLIST' })
      for (const v of lists) out.push(blockEntry('sh_list_ref', 'L', v))
      if (lists.length) {
        out.push({ kind: 'sep', gap: 14 })
        for (const t of ['sh_list_add', 'sh_list_del', 'sh_list_del_all', 'sh_list_insert', 'sh_list_replace', 'sh_list_item', 'sh_list_index', 'sh_list_len', 'sh_list_has', 'sh_list_show', 'sh_list_hide']) {
          if (allow(t)) out.push(blockEntry(t, 'L', lists[0]))
        }
      }
    }
    return out as unknown as BlocklyNS.utils.toolbox.FlyoutItemInfo[]
  })

  ws.registerToolboxCategoryCallback(PROCS_CALLBACK, () => {
    const procs = h.procs()
    const out: Entry[] = [{ kind: 'button', text: 'Bir blok yap', callbackKey: 'SAHNE_NEWPROC' }]
    for (const p of procs) {
      const inputs: Record<string, unknown> = {}
      p.params.forEach((_, i) => { inputs[`P${i}`] = { shadow: { type: 'math_number', fields: { NUM: 0 } } } })
      out.push({ kind: 'block', type: PROC_CALL_PREFIX + p.id, ...(p.params.length ? { inputs } : {}) })
    }
    const params = [...new Set(procs.flatMap((p) => p.params))]
    if (params.length) {
      out.push({ kind: 'sep', gap: 14 }, { kind: 'label', text: 'Girdiler' })
      for (const n of params) out.push({ kind: 'block', type: ARG_BLOCK, fields: { NAME: n } })
    }
    return out as unknown as BlocklyNS.utils.toolbox.FlyoutItemInfo[]
  })
}
