// Blok programı veri modeli: Blockly'nin serileştirme (JSON) biçimi. Saf veridir, Blockly'ye bağımlı DEĞİLDİR;
// Node testlerinde ve çalıştırıcıda aynen kullanılır.

export interface ProgramBlock {
  type: string
  id?: string
  x?: number
  y?: number
  fields?: Record<string, unknown>
  inputs?: Record<string, { block?: ProgramBlock; shadow?: ProgramBlock }>
  next?: { block?: ProgramBlock; shadow?: ProgramBlock }
  extraState?: unknown
  /** Blockly 12+: devre dışı blok `enabled: false`. */
  enabled?: boolean
  /** Eski biçim. */
  disabled?: boolean
  [k: string]: unknown
}

export interface ProgramVariable { name: string; id: string; type?: string }

export interface ProgramState {
  blocks: { languageVersion?: number; blocks: ProgramBlock[] }
  variables?: ProgramVariable[]
}

export const EMPTY_PROGRAM: ProgramState = { blocks: { languageVersion: 0, blocks: [] } }
export const emptyProgram = (): ProgramState => ({ blocks: { languageVersion: 0, blocks: [] } })

export type InputSpec = ProgramBlock | number | string | boolean

/** Kısa yazım: kısa değerler otomatik bloklara çevrilir (sayı → math_number, boolean → logic_boolean, metin → text). `b()` sayı ve metni gölge blok olarak bağlar. */
export function lit(v: InputSpec): ProgramBlock {
  if (typeof v === 'number') return { type: 'math_number', fields: { NUM: v } }
  if (typeof v === 'boolean') return { type: 'logic_boolean', fields: { BOOL: v ? 'TRUE' : 'FALSE' } }
  if (typeof v === 'string') return { type: 'text', fields: { TEXT: v } }
  return v
}

/**
 * Blok kurucu. `b('maze_move_forward')`, `b('controls_repeat_ext', {}, { TIMES: 4, DO: seq(...) })`.
 * `inputs` değeri: blok, kısa değer (sayı/boolean/metin) ya da `seq(...)` ile bağlanmış blok zinciri (deyim girişi).
 */
export function b(type: string, fields?: Record<string, unknown>, inputs?: Record<string, InputSpec | undefined>, extra?: Partial<ProgramBlock>): ProgramBlock {
  const blk: ProgramBlock = { type }
  if (fields && Object.keys(fields).length) blk.fields = fields
  if (inputs) {
    const ins: NonNullable<ProgramBlock['inputs']> = {}
    for (const [k, v] of Object.entries(inputs)) {
      if (v === undefined) continue
      // Sayı/metin kısa değerleri Blockly'deki gibi "gölge" (shadow) blok olur: blok sayısına katılmaz.
      ins[k] = typeof v === 'number' || typeof v === 'string' ? { shadow: lit(v) } : { block: lit(v) }
    }
    if (Object.keys(ins).length) blk.inputs = ins
  }
  return extra ? { ...blk, ...extra } : blk
}

/** Blokları sırayla bağlar (her biri bir öncekinin `next`'i olur) ve ilkini döndürür. */
export function seq(...blocks: ProgramBlock[]): ProgramBlock {
  if (!blocks.length) throw new Error('seq: en az bir blok gerekir')
  const copy = blocks.map((x) => ({ ...x }))
  for (let i = 0; i < copy.length - 1; i++) copy[i].next = { block: copy[i + 1] }
  return copy[0]
}

/** Değişken alanı: `{ VAR: varField('x') }`. */
export const varField = (name: string): { id: string } => ({ id: name })

/** Üst düzey blok yığınlarından programı kurar; kullanılan değişkenleri otomatik bildirir. */
export function program(...stacks: ProgramBlock[]): ProgramState {
  const tops = stacks.map((s, i) => ({ ...s, x: s.x ?? 20, y: s.y ?? 20 + i * 200 }))
  const names = new Set<string>()
  walkBlocks({ blocks: { blocks: tops } }, (blk) => {
    const v = blk.fields?.VAR
    if (v && typeof v === 'object' && 'id' in v) names.add(String((v as { id: unknown }).id))
  })
  const st: ProgramState = { blocks: { languageVersion: 0, blocks: tops } }
  if (names.size) st.variables = [...names].map((n) => ({ name: n, id: n }))
  return st
}

/** Bloğun girişlerindeki (shadow dahil) çocuk blokları ve `next` zincirini dolaşır. */
export function children(blk: ProgramBlock): ProgramBlock[] {
  const out: ProgramBlock[] = []
  for (const inp of Object.values(blk.inputs ?? {})) {
    const c = inp.block ?? inp.shadow
    if (c) out.push(c)
  }
  const n = blk.next?.block ?? blk.next?.shadow
  if (n) out.push(n)
  return out
}

/** Programdaki tüm blokları (üst düzey, iç içe, zincirdeki) dolaşır. */
export function walkBlocks(state: ProgramState, fn: (b: ProgramBlock, isShadow: boolean) => void): void {
  const visit = (blk: ProgramBlock, shadow: boolean) => {
    fn(blk, shadow)
    for (const inp of Object.values(blk.inputs ?? {})) {
      if (inp.block) visit(inp.block, false)
      if (inp.shadow && !inp.block) visit(inp.shadow, true)
    }
    if (blk.next?.block) visit(blk.next.block, false)
  }
  for (const t of state.blocks?.blocks ?? []) visit(t, false)
}

export function isDisabled(blk: ProgramBlock): boolean {
  return blk.enabled === false || blk.disabled === true
}

/** Sayılan blok sayısı: gölge (shadow) ve devre dışı bloklar ile `ignore` türleri sayılmaz. */
export function countBlocks(state: ProgramState, ignore: ReadonlySet<string> | readonly string[] = []): number {
  const skip = ignore instanceof Set ? ignore : new Set(ignore)
  let n = 0
  walkBlocks(state, (blk, shadow) => {
    if (shadow || isDisabled(blk) || skip.has(blk.type)) return
    n++
  })
  return n
}

export function blockTypes(state: ProgramState): Set<string> {
  const s = new Set<string>()
  walkBlocks(state, (blk) => s.add(blk.type))
  return s
}

/** Üst düzey yığınlar, yukarıdan aşağıya sonra soldan sağa. */
export function topStacks(state: ProgramState): ProgramBlock[] {
  return [...(state.blocks?.blocks ?? [])].sort((a, c) => (a.y ?? 0) - (c.y ?? 0) || (a.x ?? 0) - (c.x ?? 0))
}

/** Güvenli ayrıştırma: bozuk/uyumsuz girdide `null`. */
export function parseProgram(raw: unknown): ProgramState | null {
  try {
    const v = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (!v || typeof v !== 'object') return null
    const blocks = (v as ProgramState).blocks
    if (!blocks || !Array.isArray(blocks.blocks)) return null
    return v as ProgramState
  } catch { return null }
}
