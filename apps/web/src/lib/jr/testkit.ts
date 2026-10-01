// Test yardımcıları (yalnız *.test.ts tarafından kullanılır).
import type { Block, BlockType, Page, Project, Script, Sprite } from './types'

let n = 0
export const blk = (type: BlockType, value?: number, children?: Block[], text?: string): Block => {
  const b: Block = { id: `t${n++}`, type }
  if (value !== undefined) b.value = value
  if (text !== undefined) b.text = text
  if (children) b.children = children
  return b
}
export const script = (id: string, ...blocks: Block[]): Script => ({ id, blocks })
export const sprite = (id: string, x: number, y: number, ...scripts: Script[]): Sprite => ({ id, character: 'cat', x, y, scripts })
export const page = (id: string, ...sprites: Sprite[]): Page => ({ id, background: 'grass', sprites })
export const proj = (...pages: Page[]): Project => ({ pages })
/** Tek sayfa, tek sprite (a, 100,100) ve tek bayrak betiği. */
export const flagProject = (...body: Block[]): Project =>
  proj(page('p1', sprite('a', 100, 100, script('s1', blk('flag'), ...body))))
