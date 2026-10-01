import { describe, expect, it } from 'vitest'
import {
  addPageTo, addSpriteTo, editScripts, freeSpot, hasUserContent, locateBlock, removePageAt, removeSpriteFrom, setBackground,
} from './project-edit'
import type { Project } from './types'

const blk = (id: string, type: 'flag' | 'forward' | 'repeat', children?: ReturnType<typeof Object>[]) => ({ id, type, ...(children ? { children } : {}) }) as never
const base = (): Project => ({
  pages: [{ id: 'p1', background: 'sky', sprites: [{ id: 's1', character: 'cat', x: 240, y: 198, scripts: [{ id: 'sc1', blocks: [blk('b1', 'flag'), blk('b2', 'repeat', [blk('b3', 'forward')])] }] }] }],
})

describe('proje düzenleme yardımcıları', () => {
  it('karakter ekler, mevcut karakterden uzak bir nokta seçer ve kimliğini döndürür', () => {
    const { project, spriteId } = addSpriteTo(base(), 0, 'dog')
    const added = project.pages[0].sprites.find((s) => s.id === spriteId)!
    expect(project.pages[0].sprites).toHaveLength(2)
    expect(Math.hypot(added.x - 240, added.y - 198)).toBeGreaterThan(60)
    expect(added.scripts).toEqual([])
  })
  it('girdiyi değiştirmez', () => {
    const p = base(); const snap = JSON.stringify(p)
    addSpriteTo(p, 0, 'dog'); addPageTo(p); setBackground(p, 0, 'night'); removeSpriteFrom(p, 0, 's1')
    expect(JSON.stringify(p)).toBe(snap)
  })
  it('karakteri siler', () => {
    expect(removeSpriteFrom(base(), 0, 's1').pages[0].sprites).toHaveLength(0)
  })
  it('sayfa ekler/siler; son sayfa silinemez', () => {
    const two = addPageTo(base(), 'night')
    expect(two.pages).toHaveLength(2)
    expect(two.pages[1].background).toBe('night')
    expect(removePageAt(two, 0).pages).toHaveLength(1)
    expect(removePageAt(base(), 0).pages).toHaveLength(1)
  })
  it('arka planı değiştirir', () => {
    expect(setBackground(base(), 0, 'space').pages[0].background).toBe('space')
  })
  it('boş kalan betiği atar', () => {
    const p = editScripts(base(), 0, 's1', (sc) => [...sc, { id: 'bos', blocks: [] }])
    expect(p.pages[0].sprites[0].scripts.map((s) => s.id)).toEqual(['sc1'])
  })
  it('bloğu iç içe yerinde bulur', () => {
    const scripts = base().pages[0].sprites[0].scripts
    expect(locateBlock(scripts, 'b3')).toMatchObject({ scriptId: 'sc1', parentId: 'b2', index: 0 })
    expect(locateBlock(scripts, 'b1')).toMatchObject({ parentId: null, index: 0 })
    expect(locateBlock(scripts, 'yok')).toBeNull()
  })
  it('freeSpot dolu noktaları atlar', () => {
    const s = (x: number, y: number) => ({ id: `${x}${y}`, character: 'cat', x, y, scripts: [] })
    const first = freeSpot([])
    const second = freeSpot([s(first.x, first.y)])
    expect(Math.hypot(first.x - second.x, first.y - second.y)).toBeGreaterThan(60)
  })
  it('kullanıcı içeriğini algılar', () => {
    expect(hasUserContent(base())).toBe(true)
    expect(hasUserContent({ pages: [{ id: 'p', background: 'sky', sprites: [] }] })).toBe(false)
  })
})
