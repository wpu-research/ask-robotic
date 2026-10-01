// ASK Jr — Script[] <-> Blockly seri biçimi (Blockly.serialization.workspaces JSON). SAF: DOM ve Blockly gerekmez.

import { blockName, typeOfName } from './blockly-blocks'
import { BLOCK_BY_TYPE } from './blocks'
import type { Block, Script } from './types'

export interface BlocklyJsonBlock {
  type: string
  id?: string
  x?: number
  y?: number
  data?: string
  fields?: Record<string, unknown>
  inputs?: Record<string, { block?: BlocklyJsonBlock; shadow?: BlocklyJsonBlock }>
  next?: { block?: BlocklyJsonBlock; shadow?: BlocklyJsonBlock }
}
export interface BlocklyState {
  blocks: { languageVersion: number; blocks: BlocklyJsonBlock[] }
  [k: string]: unknown
}

// ---- yerleşim (tahmini yükseklikler, çalışma alanı birimi) ----
const BLOCK_H = 52
const C_FOOT_H = 28
const GAP = 24
const START_X = 24
const START_Y = 24

export function estimateHeight(blocks: Block[]): number {
  let h = 0
  for (const b of blocks) {
    h += BLOCK_H
    if (BLOCK_BY_TYPE[b.type]?.container) h += estimateHeight(b.children ?? []) + C_FOOT_H
  }
  return h
}

// ---- Script[] -> state ----
function toJsonChain(blocks: Block[]): BlocklyJsonBlock | undefined {
  let head: BlocklyJsonBlock | undefined
  let tail: BlocklyJsonBlock | undefined
  for (const b of blocks) {
    const def = BLOCK_BY_TYPE[b.type]
    if (!def) continue // bilinmeyen tür atılır
    const j: BlocklyJsonBlock = { type: blockName(b.type), id: b.id }
    if (def.param?.kind === 'number' && typeof b.value === 'number') j.fields = { VALUE: b.value }
    if (def.param?.kind === 'text' && typeof b.text === 'string') j.fields = { TEXT: b.text }
    if (def.container) {
      const inner = toJsonChain(b.children ?? [])
      if (inner) j.inputs = { DO: { block: inner } }
    }
    if (!head) head = j
    else tail!.next = { block: j }
    tail = j
  }
  return head
}

export function scriptsToState(scripts: Script[]): BlocklyState {
  const out: BlocklyJsonBlock[] = []
  let cursorY = START_Y
  for (const sc of scripts) {
    const head = toJsonChain(sc.blocks)
    if (!head) continue
    const hasPos = Number.isFinite(sc.x) && Number.isFinite(sc.y)
    head.x = hasPos ? sc.x : START_X
    head.y = hasPos ? sc.y : cursorY
    head.data = sc.id
    if (!hasPos) cursorY += estimateHeight(sc.blocks) + GAP
    out.push(head)
  }
  return { blocks: { languageVersion: 0, blocks: out } }
}

// ---- state -> Script[] ----
function fromJsonChain(first: BlocklyJsonBlock | undefined): Block[] {
  const out: Block[] = []
  let cur = first
  let guard = 0
  while (cur && guard++ < 10000) {
    const type = typeOfName(cur.type)
    if (type) {
      const def = BLOCK_BY_TYPE[type]
      const b: Block = { id: cur.id ?? `${type}-${out.length}`, type }
      if (def.param?.kind === 'number') {
        const v = cur.fields?.VALUE
        const num = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : NaN
        if (Number.isFinite(num)) b.value = num
      }
      if (def.param?.kind === 'text') {
        const t = cur.fields?.TEXT
        if (typeof t === 'string') b.text = t
      }
      if (def.container) b.children = fromJsonChain(cur.inputs?.DO?.block)
      out.push(b)
    }
    cur = cur.next?.block
  }
  return out
}

/** Tek bir Blockly bloğunun (ve `next` zincirinin) Block[] karşılığı. */
export const blockChainFromJson = (first: BlocklyJsonBlock | undefined): Block[] => fromJsonChain(first)

export function stateToScripts(state: unknown): Script[] {
  const tops = (state as BlocklyState | undefined)?.blocks?.blocks
  if (!Array.isArray(tops)) return []
  const scripts: Script[] = []
  const used = new Set<string>()
  for (const top of tops) {
    const blocks = fromJsonChain(top)
    if (blocks.length === 0) continue
    // Kopyalanan/yapıştırılan yığınlar aynı `data` kimliğini taşıyabilir: çakışmayı önle.
    let id = typeof top.data === 'string' && top.data ? top.data : `sc:${blocks[0].id}`
    if (used.has(id)) id = `sc:${blocks[0].id}`
    used.add(id)
    const sc: Script = { id, blocks }
    if (Number.isFinite(top.x) && Number.isFinite(top.y)) { sc.x = top.x; sc.y = top.y }
    scripts.push(sc)
  }
  return scripts
}
