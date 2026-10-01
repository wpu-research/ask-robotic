import type { Block, Project, Script } from './types'
import { STAGE_H, STAGE_W } from './types'

let n = 0
const id = (p: string) => `${p}-${++n}`

/** Tek sayfa, sahnenin ortasında bir karakter, hiç betik yok. */
export function emptyProject(character = 'cat', background = 'grass'): Project {
  return {
    pages: [{ id: id('pg'), background, sprites: [{ id: id('sp'), character, x: STAGE_W / 2, y: STAGE_H * 0.55, scripts: [] }] }],
  }
}

export const block = (type: Block['type'], extra: Partial<Block> = {}): Block => ({ id: id('b'), type, ...extra })
export const script = (...blocks: Block[]): Script => ({ id: id('sc'), blocks })

/** Verilen betiklerle, tek karakterli tek sayfalık proje. */
export function singleSprite(opts: { character?: string; background?: string; x?: number; y?: number; scripts?: Script[] } = {}): Project {
  return {
    pages: [{
      id: id('pg'), background: opts.background ?? 'grass',
      sprites: [{ id: id('sp'), character: opts.character ?? 'cat', x: opts.x ?? STAGE_W * 0.25, y: opts.y ?? STAGE_H * 0.55, scripts: opts.scripts ?? [] }],
    }],
  }
}
