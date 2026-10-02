// Blockly JSON programını dolaşma yardımcıları ve proje kurucu (builder).
import type { MikroProject, PBlock, WorkspaceState } from './types'

export const topBlocks = (ws: WorkspaceState): PBlock[] => ws.blocks?.blocks ?? []

/** Bir blok zincirini (next ile bağlı) düz diziye çevirir. */
export function chainOf(b: PBlock | undefined): PBlock[] {
  const out: PBlock[] = []
  for (let c = b; c; c = c.next?.block) out.push(c)
  return out
}

/** Bir bloğun tüm alt bloklarını (kendisi, girişler, sonraki) dolaşır. */
export function walk(b: PBlock | undefined, fn: (b: PBlock) => void): void {
  for (let c = b; c; c = c.next?.block) {
    fn(c)
    if (c.inputs) for (const inp of Object.values(c.inputs)) { walk(inp.block, fn); if (inp.shadow) walk(inp.shadow, fn) }
  }
}

export function walkWorkspace(ws: WorkspaceState, fn: (b: PBlock) => void): void {
  for (const t of topBlocks(ws)) walk(t, fn)
}

/** Programda geçen blok türleri ve sayıları (kapalı bloklar sayılmaz, gölge değer blokları sayılır). */
export function blockCounts(ws: WorkspaceState): Record<string, number> {
  const c: Record<string, number> = {}
  walkWorkspace(ws, (b) => { if (!b.disabled) c[b.type] = (c[b.type] ?? 0) + 1 })
  return c
}
export const usedTypes = (ws: WorkspaceState): Set<string> => new Set(Object.keys(blockCounts(ws)))

/** Sayıma katılan blok sayısı: gölge sabitler (math_number/text) hariç. */
export function countBlocks(ws: WorkspaceState): number {
  let n = 0
  const skip = new Set(['math_number', 'text'])
  walkWorkspace(ws, (b) => { if (!skip.has(b.type)) n++ })
  return n
}

/** Değişken kimliği -> ad. */
export function variableNames(ws: WorkspaceState): Map<string, string> {
  const m = new Map<string, string>()
  for (const v of ws.variables ?? []) m.set(v.id, v.name)
  return m
}

export function fieldVarName(b: PBlock, ws: Map<string, string>, field = 'VAR'): string {
  const f = b.fields?.[field]
  if (typeof f === 'string') return ws.get(f) ?? f
  if (f && typeof f === 'object') {
    const o = f as { id?: string; name?: string }
    return (o.id && ws.get(o.id)) || o.name || '?'
  }
  return '?'
}

// ============ Proje kurucu (etkinlikler, örnekler ve testler için) ============
export type In = PBlock | number | string | boolean

export function toBlock(v: In): PBlock {
  if (typeof v === 'number') return { type: 'math_number', fields: { NUM: v } }
  if (typeof v === 'string') return { type: 'text', fields: { TEXT: v } }
  if (typeof v === 'boolean') return { type: 'logic_boolean', fields: { BOOL: v ? 'TRUE' : 'FALSE' } }
  return v
}

/** Blok kurar: `b('mk_plot', { X: 1, Y: 2 })`; `f` alan değerleri, `s` deyim girişleri (DO), `x` ek (extraState). */
export function b(type: string, o: { f?: Record<string, unknown>; i?: Record<string, In>; s?: Record<string, PBlock[]>; x?: unknown } = {}): PBlock {
  const blk: PBlock = { type }
  if (o.f) blk.fields = o.f
  if (o.x !== undefined) blk.extraState = o.x
  const inputs: NonNullable<PBlock['inputs']> = {}
  for (const [k, v] of Object.entries(o.i ?? {})) inputs[k] = { block: toBlock(v) }
  for (const [k, list] of Object.entries(o.s ?? {})) { const c = link(list); if (c) inputs[k] = { block: c } }
  if (Object.keys(inputs).length) blk.inputs = inputs
  return blk
}

/** Blokları `next` ile zincirler; ilk bloğu döndürür. */
export function link(list: PBlock[]): PBlock | undefined {
  for (let i = list.length - 2; i >= 0; i--) list[i].next = { block: list[i + 1] }
  return list[0]
}

const vid = (name: string) => `v_${name}`
export const getVar = (name: string): PBlock => ({ type: 'variables_get', fields: { VAR: { id: vid(name) } } })
export const setVar = (name: string, value: In): PBlock => ({ type: 'variables_set', fields: { VAR: { id: vid(name) } }, inputs: { VALUE: { block: toBlock(value) } } })
export const changeVar = (name: string, delta: In): PBlock => ({ type: 'math_change', fields: { VAR: { id: vid(name) } }, inputs: { DELTA: { block: toBlock(delta) } } })

export const hatBlock = (type: string, body: PBlock[], f?: Record<string, unknown>): PBlock => b(type, { f, s: { DO: body } })
export const onStart = (...body: PBlock[]) => hatBlock('mk_on_start', body)
export const forever = (...body: PBlock[]) => hatBlock('mk_forever', body)
export const onButton = (btn: 'A' | 'B' | 'AB', body: PBlock[], ev: 'press' | 'release' | 'long' = 'press') => hatBlock('mk_on_button', body, { BTN: btn, EV: ev })

export const ifThen = (cond: In, then: PBlock[], otherwise?: PBlock[]): PBlock =>
  b('controls_if', { i: { IF0: cond }, s: { DO0: then, ...(otherwise ? { ELSE: otherwise } : {}) }, x: otherwise ? { hasElse: true } : undefined })
export const repeat = (n: In, body: PBlock[]) => b('controls_repeat_ext', { i: { TIMES: n }, s: { DO: body } })
export const whileLoop = (cond: In, body: PBlock[]) => b('controls_whileUntil', { f: { MODE: 'WHILE' }, i: { BOOL: cond }, s: { DO: body } })
export const forRange = (name: string, from: In, to: In, by: In, body: PBlock[]) =>
  b('controls_for', { f: { VAR: { id: vid(name) } }, i: { FROM: from, TO: to, BY: by }, s: { DO: body } })
export const forEach = (name: string, list: In, body: PBlock[]) => b('controls_forEach', { f: { VAR: { id: vid(name) } }, i: { LIST: list }, s: { DO: body } })
export const cmp = (op: 'EQ' | 'NEQ' | 'LT' | 'LTE' | 'GT' | 'GTE', a: In, c: In) => b('logic_compare', { f: { OP: op }, i: { A: a, B: c } })
export const arith = (op: 'ADD' | 'MINUS' | 'MULTIPLY' | 'DIVIDE' | 'POWER', a: In, c: In) => b('math_arithmetic', { f: { OP: op }, i: { A: a, B: c } })
export const logicOp = (op: 'AND' | 'OR', a: In, c: In) => b('logic_operation', { f: { OP: op }, i: { A: a, B: c } })
export const listOf = (...items: In[]): PBlock => {
  const inputs: Record<string, In> = {}
  items.forEach((it, i) => { inputs[`ADD${i}`] = it })
  return b('lists_create_with', { x: { itemCount: items.length }, i: inputs })
}
export const randomInt = (a: In, c: In) => b('math_random_int', { i: { FROM: a, TO: c } })

/** İşlev tanımı: `funcDef('ciz', ['n'], [...gövde])`; değer döndürenler için `ret` verilir. */
export function funcDef(name: string, params: string[], body: PBlock[], ret?: In): PBlock {
  const extraState = { params: params.map((p) => ({ name: p, id: vid(p) })) }
  return b(ret === undefined ? 'procedures_defnoreturn' : 'procedures_defreturn', {
    f: { NAME: name },
    x: extraState,
    s: { STACK: body },
    i: ret === undefined ? {} : { RETURN: ret },
  })
}
export const callFunc = (name: string, args: In[] = [], returns = false): PBlock =>
  b(returns ? 'procedures_callreturn' : 'procedures_callnoreturn', { x: { name }, i: Object.fromEntries(args.map((a, i) => [`ARG${i}`, a])) })

/** Üst düzey blokları (yığınları) proje yapar; kullanılan değişkenleri kendisi bulur. Her yığına yerleşim konumu verir. */
export function project(name: string, stacks: PBlock[]): MikroProject {
  const names = new Set<string>()
  const scan = (blk: PBlock) => {
    const f = blk.fields?.VAR as { id?: string } | undefined
    if (f?.id?.startsWith('v_')) names.add(f.id.slice(2))
    for (const p of ((blk.extraState as { params?: { name: string }[] } | undefined)?.params ?? [])) names.add(p.name)
  }
  stacks.forEach((s, i) => { s.x = 24; s.y = 24 + i * 200; walk(s, scan) })
  return {
    version: 1,
    name,
    workspace: {
      blocks: { languageVersion: 0, blocks: stacks },
      variables: [...names].map((n) => ({ name: n, id: vid(n) })),
    },
  }
}

/** Derin kopya (starter() her çağrıda taze nesne döndürsün diye). */
export const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T
