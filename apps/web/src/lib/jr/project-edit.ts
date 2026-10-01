// Proje düzeyinde (sayfa/karakter/betik) değişmez düzenleme yardımcıları. Blok ağacı işlemleri ops.ts'tedir.
import { BLOCK_BY_TYPE } from './blocks'
import type { Block, Page, Project, Script, Sprite } from './types'
import { STAGE_H, STAGE_W } from './types'

let counter = 0
/** Arayüz nesneleri için benzersiz kimlik. */
export const uid = (prefix: string) => `${prefix}${(++counter).toString(36)}${Math.random().toString(36).slice(2, 6)}`

const SPOTS: [number, number][] = [
  [STAGE_W * 0.5, STAGE_H * 0.55], [STAGE_W * 0.25, STAGE_H * 0.55], [STAGE_W * 0.75, STAGE_H * 0.55],
  [STAGE_W * 0.5, STAGE_H * 0.25], [STAGE_W * 0.25, STAGE_H * 0.25], [STAGE_W * 0.75, STAGE_H * 0.25],
  [STAGE_W * 0.5, STAGE_H * 0.85], [STAGE_W * 0.25, STAGE_H * 0.85], [STAGE_W * 0.75, STAGE_H * 0.85],
]

/** Sahnede en az bir karakterin yakınında olmayan ilk makul nokta. */
export function freeSpot(sprites: Sprite[]): { x: number; y: number } {
  const far = (x: number, y: number) => sprites.every((s) => Math.hypot(s.x - x, s.y - y) > 60)
  const [x, y] = SPOTS.find(([sx, sy]) => far(sx, sy)) ?? SPOTS[sprites.length % SPOTS.length]
  return { x, y }
}

export function mapPage(project: Project, pageIndex: number, fn: (p: Page) => Page): Project {
  return { ...project, pages: project.pages.map((p, i) => (i === pageIndex ? fn(p) : p)) }
}

export function mapSprite(project: Project, pageIndex: number, spriteId: string, fn: (s: Sprite) => Sprite): Project {
  return mapPage(project, pageIndex, (p) => ({ ...p, sprites: p.sprites.map((s) => (s.id === spriteId ? fn(s) : s)) }))
}

/** Betik listesini dönüştürür; blok sayısı 0 olan betikleri atar. */
export function editScripts(project: Project, pageIndex: number, spriteId: string, fn: (scripts: Script[]) => Script[]): Project {
  return mapSprite(project, pageIndex, spriteId, (s) => ({ ...s, scripts: fn(s.scripts).filter((sc) => sc.blocks.length > 0) }))
}

export function addSpriteTo(project: Project, pageIndex: number, character: string): { project: Project; spriteId: string } {
  const id = uid('sp')
  const next = mapPage(project, pageIndex, (p) => ({
    ...p,
    sprites: [...p.sprites, { id, character, ...freeSpot(p.sprites), scripts: [] }],
  }))
  return { project: next, spriteId: id }
}

export function removeSpriteFrom(project: Project, pageIndex: number, spriteId: string): Project {
  return mapPage(project, pageIndex, (p) => ({ ...p, sprites: p.sprites.filter((s) => s.id !== spriteId) }))
}

export function addPageTo(project: Project, background = 'sky'): Project {
  return { ...project, pages: [...project.pages, { id: uid('pg'), background, sprites: [] }] }
}

/** Son sayfa silinemez. */
export function removePageAt(project: Project, pageIndex: number): Project {
  if (project.pages.length <= 1) return project
  return { ...project, pages: project.pages.filter((_, i) => i !== pageIndex) }
}

export function setBackground(project: Project, pageIndex: number, background: string): Project {
  return mapPage(project, pageIndex, (p) => ({ ...p, background }))
}

export interface Located { scriptId: string; parentId: string | null; index: number; block: Block }

/** Bir bloğun hangi betikte, hangi üst bloğun içinde, kaçıncı sırada olduğunu bulur. */
export function locateBlock(scripts: Script[], blockId: string): Located | null {
  const walk = (list: Block[], scriptId: string, parentId: string | null): Located | null => {
    for (let i = 0; i < list.length; i++) {
      if (list[i].id === blockId) return { scriptId, parentId, index: i, block: list[i] }
      if (list[i].children) {
        const hit = walk(list[i].children!, scriptId, list[i].id)
        if (hit) return hit
      }
    }
    return null
  }
  for (const sc of scripts) {
    const hit = walk(sc.blocks, sc.id, null)
    if (hit) return hit
  }
  return null
}

/** Bloğun ve altındaki tüm blokların toplam sayısı (kendisi dahil). */
export function countTree(b: Block): number {
  return 1 + (b.children ?? []).reduce((n, c) => n + countTree(c), 0)
}

export const isTrigger = (type: Block['type']) => !!BLOCK_BY_TYPE[type]?.trigger

/** Sprite'a değerli bir kullanıcı içeriği var mı (sıfırlama onayı için). */
export function hasUserContent(project: Project): boolean {
  return project.pages.length > 1 || project.pages.some((p) => p.sprites.some((s) => s.scripts.length > 0))
}
