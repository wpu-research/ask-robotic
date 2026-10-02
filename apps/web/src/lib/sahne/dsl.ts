// Blok programı kurucu (DSL). Etkinlik başlangıçları/çözümleri, örnekler ve testler Blockly olmadan blok programı yazabilsin diye vardır.
// Çıktı, Blockly'nin `serialization.workspaces.save` biçimiyle aynıdır: editörde olduğu gibi yüklenir, yorumlayıcıda çalışır.
//
//   program([
//     b('sh_when_flag', {}, [
//       setv('skor', 0),
//       b('sh_forever', {}, [b('sh_move', { N: 10 }), b('sh_bounce')]),
//     ]),
//   ])
//
// Giriş değerleri: blok (BlockNode) · sayı (math_number) · metin (text). Alan değerleri (açılır liste) olduğu gibi yazılır.
// Değişken/liste alanlarına değişken ADI verilir (kimlik `vid(ad)` ile üretilir).
import { ARG_BLOCK, BLOCK_BY_TYPE, PROC_CALL_PREFIX, PROC_DEF_PREFIX, VAR_GET } from './blocks'
import type { BlockNode, BlockState } from './types'

export type Prop = BlockNode | number | string | boolean
export type Body = BlockNode | BlockNode[] | undefined

/** Değişken adından Blockly değişken kimliği. */
export const vid = (name: string): string => `v:${name}`
export const nameOfVid = (id: string): string => (id.startsWith('v:') ? id.slice(2) : id)

export const num = (n: number): BlockNode => ({ type: 'math_number', fields: { NUM: n } })
export const str = (s: string): BlockNode => ({ type: 'text', fields: { TEXT: s } })
export const v = (name: string): BlockNode => ({ type: VAR_GET, fields: { VAR: { id: vid(name) } } })
export const arg = (name: string): BlockNode => ({ type: ARG_BLOCK, fields: { NAME: name } })

export function chain(blocks: BlockNode[]): BlockNode | undefined {
  const list = blocks.filter(Boolean).map((x) => ({ ...x }))
  for (let i = list.length - 2; i >= 0; i--) list[i] = { ...list[i], next: { block: list[i + 1] } }
  return list[0]
}
const toBody = (x: Body): BlockNode | undefined => (Array.isArray(x) ? chain(x) : x)

function wrap(p: Prop): BlockNode {
  if (typeof p === 'object') return p
  if (typeof p === 'number') return num(p)
  if (typeof p === 'boolean') return num(p ? 1 : 0)
  return str(p)
}

/** Genel blok kurucu. `props`: alan ve giriş değerleri; `body`: hat için sonraki bloklar, C bloğu için `DO` gövdesi. */
export function b(type: string, props: Record<string, Prop> = {}, body?: Body): BlockNode {
  const def = BLOCK_BY_TYPE[type]
  const node: BlockNode = { type }
  for (const [k, val] of Object.entries(props)) {
    const a = def?.args[k]
    if (a && (a.t === 'dd' || a.t === 'dyn')) { node.fields ??= {}; node.fields[k] = typeof val === 'object' ? '' : String(val) }
    else if (a && (a.t === 'var' || a.t === 'list')) { node.fields ??= {}; node.fields[k] = { id: vid(String(val)) } }
    else if (!def && (k === 'NAME')) { node.fields ??= {}; node.fields[k] = String(val) }
    else { node.inputs ??= {}; node.inputs[k] = { block: wrap(val) } }
  }
  const bd = toBody(body)
  if (bd) {
    if (def?.shape === 'hat') node.next = { block: bd }
    else { node.inputs ??= {}; node.inputs.DO = { block: bd } }
  }
  return node
}

// ── kısaltmalar ──
export const setv = (name: string, value: Prop): BlockNode => b('sh_var_set', { V: name, N: value })
export const chg = (name: string, delta: Prop = 1): BlockNode => b('sh_var_change', { V: name, N: delta })
export const flag = (body: Body): BlockNode => b('sh_when_flag', {}, body)
export const key = (k: string, body: Body): BlockNode => b('sh_when_key', { K: k }, body)
export const when = (type: string, props: Record<string, Prop>, body: Body): BlockNode => b(type, props, body)
export const wait = (s: number): BlockNode => b('sh_wait', { S: s })
export const forever = (body: Body): BlockNode => b('sh_forever', {}, body)
export const repeat = (n: Prop, body: Body): BlockNode => b('sh_repeat', { N: n }, body)
export const ifThen = (cond: Prop, then: Body): BlockNode => b('sh_if', { C: cond }, then)
export function ifElse(cond: Prop, then: Body, otherwise: Body): BlockNode {
  const n = b('sh_if_else', { C: cond }, then)
  const e = toBody(otherwise)
  if (e) { n.inputs ??= {}; n.inputs.ELSE = { block: e } }
  return n
}
export const say = (m: Prop): BlockNode => b('sh_say', { M: m })
export const sayFor = (m: Prop, s: number): BlockNode => b('sh_say_for', { M: m, S: s })
export const broadcast = (m: string): BlockNode => b('sh_broadcast', { M: m })
export const touching = (target: string): BlockNode => b('sh_touching', { T: target })
export const keyDown = (k: string): BlockNode => b('sh_key_pressed', { K: k })
export const op2 = (type: 'sh_add' | 'sh_sub' | 'sh_mul' | 'sh_div' | 'sh_gt' | 'sh_lt' | 'sh_eq' | 'sh_and' | 'sh_or' | 'sh_join' | 'sh_random' | 'sh_mod', a: Prop, c: Prop): BlockNode => b(type, { A: a, B: c })
export const gt = (a: Prop, c: Prop) => op2('sh_gt', a, c)
export const lt = (a: Prop, c: Prop) => op2('sh_lt', a, c)
export const eq = (a: Prop, c: Prop) => op2('sh_eq', a, c)
export const and = (a: Prop, c: Prop) => op2('sh_and', a, c)
export const or = (a: Prop, c: Prop) => op2('sh_or', a, c)
export const not = (a: Prop): BlockNode => b('sh_not', { A: a })
export const add = (a: Prop, c: Prop) => op2('sh_add', a, c)
export const sub = (a: Prop, c: Prop) => op2('sh_sub', a, c)
export const mul = (a: Prop, c: Prop) => op2('sh_mul', a, c)
export const rnd = (a: Prop, c: Prop) => op2('sh_random', a, c)
export const join = (a: Prop, c: Prop) => op2('sh_join', a, c)

/** "Bir blok yap" tanımı ve çağrısı. `id`: ProcDef kimliği. */
export function defProc(id: string, body: Body): BlockNode {
  const n: BlockNode = { type: PROC_DEF_PREFIX + id }
  const bd = toBody(body)
  if (bd) n.next = { block: bd }
  return n
}
export function callProc(id: string, args: Prop[] = []): BlockNode {
  const n: BlockNode = { type: PROC_CALL_PREFIX + id }
  if (args.length) n.inputs = Object.fromEntries(args.map((a, i) => [`P${i}`, { block: wrap(a) }]))
  return n
}

// ── program ──
let uid = 0
function collectVars(n: BlockNode | undefined, into: Map<string, string>): void {
  for (let x: BlockNode | undefined = n; x; x = x.next?.block) {
    for (const f of Object.values(x.fields ?? {})) {
      const id = (f as { id?: string } | undefined)?.id
      if (typeof f === 'object' && f && typeof id === 'string') {
        const isList = (BLOCK_BY_TYPE[x.type]?.args && Object.values(BLOCK_BY_TYPE[x.type].args).some((a) => a.t === 'list'))
        into.set(id, isList ? 'List' : '')
      }
    }
    for (const i of Object.values(x.inputs ?? {})) { collectVars(i.block, into); collectVars(i.shadow, into) }
  }
}
function assignIds(n: BlockNode | undefined): BlockNode | undefined {
  if (!n) return n
  const out: BlockNode = { ...n, id: `b${++uid}` }
  if (n.inputs) {
    out.inputs = {}
    for (const [k, i] of Object.entries(n.inputs)) {
      const e: { block?: BlockNode; shadow?: BlockNode } = {}
      // sayı/metin değerleri gölge olarak yazılır (editörde beyaz hap olarak görünür)
      if (i.block && (i.block.type === 'math_number' || i.block.type === 'text')) e.shadow = { ...i.block, id: `b${++uid}` }
      else if (i.block) e.block = assignIds(i.block)
      if (i.shadow) e.shadow = assignIds(i.shadow)
      out.inputs[k] = e
    }
  }
  if (n.next?.block) out.next = { block: assignIds(n.next.block) }
  return out
}
function height(n: BlockNode | undefined): number {
  let h = 0
  for (let x: BlockNode | undefined = n; x; x = x.next?.block) {
    h += 1
    for (const i of Object.values(x.inputs ?? {})) if (i.block && !['math_number', 'text'].includes(i.block.type)) h += height(i.block)
  }
  return h
}

/** Üst düzey blokları bir blok durumuna dönüştürür (blok kimlikleri, değişken listesi ve yerleşim otomatik). */
export function program(tops: BlockNode[]): BlockState {
  const vars = new Map<string, string>()
  let y = 20
  const blocks = tops.map((t) => {
    collectVars(t, vars)
    const node = assignIds(t)!
    node.x = 20
    node.y = y
    y += height(t) * 40 + 60
    return node
  })
  return { blocks: { languageVersion: 0, blocks }, variables: [...vars].map(([id, type]) => ({ id, name: nameOfVid(id), ...(type ? { type } : {}) })) }
}
export const emptyProgram = (): BlockState => ({ blocks: { languageVersion: 0, blocks: [] }, variables: [] })
