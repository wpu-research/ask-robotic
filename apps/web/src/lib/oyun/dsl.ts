// Blok programı kurucu (DSL). Örnek oyunlar, etkinlik çözümleri ve testler Blockly olmadan blok programı yazabilsin diye vardır.
// Çıktı, Blockly'nin `serialization.workspaces.save` biçimiyle aynıdır: editörde olduğu gibi yüklenir ve yorumlayıcıda çalışır.
//
//   program([
//     b('oyun_baslangic', {}, [
//       set('oyuncu', b('sprite_yeni', { IMG: 'oyuncu-kedi', K: 'oyuncu' })),
//       b('den_hareket', { S: v('oyuncu'), M: 'four', N: 60 }),
//     ]),
//   ])
//
// Giriş değerleri: blok (BlockNode) · sayı (math_number) · metin (alan türüne göre text/oyun_resim/oyun_harita) · true/false (logic_boolean).
// Bir 'spr' girişine verilen metin değişken adıdır (variables_get). Alan değerleri (açılır liste, renk, sayı alanı) olduğu gibi yazılır.
import { BLOCK_BY_TYPE } from './blocks'
import { PALETTE } from './palette'
import type { BlockNode, BlockState } from './types'

export type Prop = BlockNode | number | string | boolean
export type Body = BlockNode | BlockNode[] | undefined

const FIELD_TYPES = new Set(['dd', 'kind', 'col', 'fnum', 'ftxt'])

export const num = (n: number): BlockNode => ({ type: 'math_number', fields: { NUM: n } })
export const str = (s: string): BlockNode => ({ type: 'text', fields: { TEXT: s } })
export const bool = (x: boolean): BlockNode => ({ type: 'logic_boolean', fields: { BOOL: x ? 'TRUE' : 'FALSE' } })
export const v = (name: string): BlockNode => ({ type: 'variables_get', fields: { VAR: { id: name } } })

/** Blok dizisini `next` ile zincirler. */
export function chain(blocks: BlockNode[]): BlockNode | undefined {
  const list = blocks.filter(Boolean)
  for (let i = list.length - 2; i >= 0; i--) list[i] = { ...list[i], next: { block: list[i + 1] } }
  return list[0]
}
const toBody = (x: Body): BlockNode | undefined => (Array.isArray(x) ? chain(x) : x)

function wrap(type: string, name: string, p: Prop): BlockNode {
  if (typeof p === 'object') return p
  const a = BLOCK_BY_TYPE[type]?.args[name]
  if (typeof p === 'boolean') return bool(p)
  if (typeof p === 'number') return num(p)
  switch (a?.t) {
    case 'img': return { type: 'oyun_resim', fields: { IMG: p } }
    case 'map': return { type: 'oyun_harita', fields: { MAP: p } }
    case 'spr': return v(p)
    default: return str(p)
  }
}

/** Genel blok kurucu. `props` içinde alan (açılır liste/renk/sayı alanı) ve giriş değerleri birlikte verilir; `body` DO girişidir. */
export function b(type: string, props: Record<string, Prop> = {}, body?: Body): BlockNode {
  const def = BLOCK_BY_TYPE[type]
  const node: BlockNode = { type }
  for (const [k, val] of Object.entries(props)) {
    const a = def?.args[k]
    if (a && FIELD_TYPES.has(a.t)) {
      node.fields ??= {}
      node.fields[k] = a.t === 'col' && typeof val === 'number' ? PALETTE[((val % 16) + 16) % 16].hex : typeof val === 'boolean' ? String(val) : val
    } else if (!def || !a) {
      // standart Blockly blokları: bilinen alan adları
      if (STD_FIELDS.has(k)) { node.fields ??= {}; node.fields[k] = val as never } else { node.inputs ??= {}; node.inputs[k] = { block: wrap(type, k, val) } }
    } else {
      node.inputs ??= {}
      node.inputs[k] = { block: wrap(type, k, val) }
    }
  }
  const bd = toBody(body)
  if (bd) { node.inputs ??= {}; node.inputs.DO = { block: bd } }
  return node
}
const STD_FIELDS = new Set(['OP', 'MODE', 'FLOW', 'PROPERTY', 'BOOL', 'NUM', 'TEXT'])

// —— standart bloklar ——
export const set = (name: string, value: Prop): BlockNode => ({ type: 'variables_set', fields: { VAR: { id: name } }, inputs: { VALUE: { block: wrap('', 'VALUE', value) } } })
export const change = (name: string, delta: Prop = 1): BlockNode => ({ type: 'math_change', fields: { VAR: { id: name } }, inputs: { DELTA: { block: wrap('', 'DELTA', delta) } } })
const wrapAny = (x: Prop): BlockNode => wrap('', 'x', x)
export const arith = (op: 'ADD' | 'MINUS' | 'MULTIPLY' | 'DIVIDE' | 'POWER', a: Prop, c: Prop): BlockNode => ({ type: 'math_arithmetic', fields: { OP: op }, inputs: { A: { block: wrapAny(a) }, B: { block: wrapAny(c) } } })
export const add = (a: Prop, c: Prop) => arith('ADD', a, c)
export const sub = (a: Prop, c: Prop) => arith('MINUS', a, c)
export const mul = (a: Prop, c: Prop) => arith('MULTIPLY', a, c)
export const div = (a: Prop, c: Prop) => arith('DIVIDE', a, c)
export const cmp = (op: 'EQ' | 'NEQ' | 'LT' | 'LTE' | 'GT' | 'GTE', a: Prop, c: Prop): BlockNode => ({ type: 'logic_compare', fields: { OP: op }, inputs: { A: { block: wrapAny(a) }, B: { block: wrapAny(c) } } })
export const and = (a: Prop, c: Prop): BlockNode => ({ type: 'logic_operation', fields: { OP: 'AND' }, inputs: { A: { block: wrapAny(a) }, B: { block: wrapAny(c) } } })
export const or = (a: Prop, c: Prop): BlockNode => ({ type: 'logic_operation', fields: { OP: 'OR' }, inputs: { A: { block: wrapAny(a) }, B: { block: wrapAny(c) } } })
export const not = (a: Prop): BlockNode => ({ type: 'logic_negate', inputs: { BOOL: { block: wrapAny(a) } } })
export const rnd = (a: Prop, c: Prop): BlockNode => ({ type: 'math_random_int', inputs: { FROM: { block: wrapAny(a) }, TO: { block: wrapAny(c) } } })
export const mod = (a: Prop, c: Prop): BlockNode => ({ type: 'math_modulo', inputs: { DIVIDEND: { block: wrapAny(a) }, DIVISOR: { block: wrapAny(c) } } })
export const abs = (a: Prop): BlockNode => ({ type: 'math_single', fields: { OP: 'ABS' }, inputs: { NUM: { block: wrapAny(a) } } })
export const join = (...parts: Prop[]): BlockNode => ({ type: 'text_join', extraState: { itemCount: parts.length }, inputs: Object.fromEntries(parts.map((p, i) => [`ADD${i}`, { block: wrapAny(p) }])) })

/** Eğer … (değilse …). `elseifs`: ek [koşul, gövde] çiftleri. */
export function ifThen(cond: Prop, then: Body, otherwise?: Body, elseifs: [Prop, Body][] = []): BlockNode {
  const node: BlockNode = { type: 'controls_if', extraState: { hasElse: !!otherwise, elseIfCount: elseifs.length }, inputs: { IF0: { block: wrapAny(cond) } } }
  const t = toBody(then)
  if (t) node.inputs!.DO0 = { block: t }
  elseifs.forEach(([c, body], i) => {
    node.inputs![`IF${i + 1}`] = { block: wrapAny(c) }
    const bd = toBody(body)
    if (bd) node.inputs![`DO${i + 1}`] = { block: bd }
  })
  const e = toBody(otherwise)
  if (e) node.inputs!.ELSE = { block: e }
  return node
}
export const repeat = (times: Prop, body: Body): BlockNode => ({ type: 'controls_repeat_ext', inputs: { TIMES: { block: wrapAny(times) }, ...(toBody(body) ? { DO: { block: toBody(body)! } } : {}) } })
export const whileDo = (cond: Prop, body: Body, until = false): BlockNode => ({ type: 'controls_whileUntil', fields: { MODE: until ? 'UNTIL' : 'WHILE' }, inputs: { BOOL: { block: wrapAny(cond) }, ...(toBody(body) ? { DO: { block: toBody(body)! } } : {}) } })
export const forRange = (name: string, from: Prop, to: Prop, by: Prop, body: Body): BlockNode => ({
  type: 'controls_for', fields: { VAR: { id: name } },
  inputs: { FROM: { block: wrapAny(from) }, TO: { block: wrapAny(to) }, BY: { block: wrapAny(by) }, ...(toBody(body) ? { DO: { block: toBody(body)! } } : {}) },
})
export const brk = (): BlockNode => ({ type: 'controls_flow_statements', fields: { FLOW: 'BREAK' } })
export const cont = (): BlockNode => ({ type: 'controls_flow_statements', fields: { FLOW: 'CONTINUE' } })

/** Fonksiyon tanımı. `ret` verilirse değer döndürür. Parametre değişken kimliği adıyla aynıdır. */
export function defProc(name: string, params: string[], body: Body, ret?: Prop): BlockNode {
  const node: BlockNode = { type: ret === undefined ? 'procedures_defnoreturn' : 'procedures_defreturn', fields: { NAME: name }, extraState: { params: params.map((p) => ({ name: p, id: p })) }, inputs: {} }
  const bd = toBody(body)
  if (bd) node.inputs!.STACK = { block: bd }
  if (ret !== undefined) node.inputs!.RETURN = { block: wrapAny(ret) }
  return node
}
export function callProc(name: string, args: Prop[] = [], returns = false): BlockNode {
  return { type: returns ? 'procedures_callreturn' : 'procedures_callnoreturn', extraState: { name, params: args.map((_, i) => `p${i}`) }, inputs: Object.fromEntries(args.map((a, i) => [`ARG${i}`, { block: wrapAny(a) }])) }
}

// —— program ——
let uid = 0
function collectVars(n: BlockNode | undefined, into: Set<string>): void {
  for (let b: BlockNode | undefined = n; b; b = b.next?.block) {
    const vf = b.fields?.VAR as { id?: string } | undefined
    if (vf?.id) into.add(vf.id)
    const params = (b.extraState as { params?: { id: string }[] } | undefined)?.params
    if (b.type.startsWith('procedures_def') && params) params.forEach((p) => into.add(p.id))
    for (const i of Object.values(b.inputs ?? {})) { collectVars(i.block, into); collectVars(i.shadow, into) }
  }
}
function assignIds(n: BlockNode | undefined): BlockNode | undefined {
  if (!n) return n
  const out: BlockNode = { ...n, id: `b${++uid}` }
  if (n.inputs) out.inputs = Object.fromEntries(Object.entries(n.inputs).map(([k, i]) => [k, { block: assignIds(i.block), shadow: assignIds(i.shadow) }]))
  if (n.inputs) for (const k of Object.keys(out.inputs!)) { const i = out.inputs![k]; if (!i.block) delete i.block; if (!i.shadow) delete i.shadow }
  if (n.next?.block) out.next = { block: assignIds(n.next.block) }
  return out
}
function height(n: BlockNode | undefined): number {
  let h = 0
  for (let b: BlockNode | undefined = n; b; b = b.next?.block) {
    h += 1
    for (const i of Object.values(b.inputs ?? {})) if (i.block && !['math_number', 'text', 'oyun_resim', 'variables_get'].includes(i.block.type)) h += height(i.block)
  }
  return h
}

/** Üst düzey blokları (olaylar, fonksiyonlar) bir blok durumuna dönüştürür; blok kimlikleri ve değişken listesi otomatik. */
export function program(tops: BlockNode[]): BlockState {
  const vars = new Set<string>()
  let y = 20
  const blocks = tops.map((t) => {
    collectVars(t, vars)
    const node = assignIds(t)!
    node.x = 20
    node.y = y
    y += height(t) * 36 + 50
    return node
  })
  return { blocks: { languageVersion: 0, blocks }, variables: [...vars].map((name) => ({ name, id: name })) }
}

export const emptyProgram = (): BlockState => ({ blocks: { languageVersion: 0, blocks: [] }, variables: [] })
