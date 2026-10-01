import { afterEach, describe, expect, it } from 'vitest'
import {
  addPage, addScript, addSprite, canInsert, canMove, createBlock, emptyProject, findBlock, insertBlock, mapSprite,
  moveBlock, newId, removeBlock, removePage, removeScript, removeSprite, scriptIsRunnable, setIdGenerator, updateBlock,
  updateSprite,
} from './ops'
import { blk, page, proj, script, sprite } from './testkit'
import { STAGE_H, STAGE_W } from './types'

afterEach(() => setIdGenerator(null))

const deepFreeze = <T,>(o: T): T => {
  if (o && typeof o === 'object') {
    Object.freeze(o)
    for (const v of Object.values(o)) deepFreeze(v)
  }
  return o
}

describe('kimlik ve createBlock', () => {
  it('newId benzersizdir; setIdGenerator ile öngörülebilir olur', () => {
    expect(new Set(Array.from({ length: 200 }, () => newId())).size).toBe(200)
    let i = 0
    setIdGenerator((p) => `${p}-${++i}`)
    expect(newId('x')).toBe('x-1')
    expect(createBlock('forward').id).toBe('b-2')
    setIdGenerator(null)
    expect(newId()).not.toBe('b-3')
  })

  it('createBlock varsayılanları BLOCK_BY_TYPE\'dan gelir', () => {
    expect(createBlock('forward')).toMatchObject({ type: 'forward', value: 3 })
    expect(createBlock('turnRight').value).toBe(90)
    expect(createBlock('say').text).toBe('Merhaba!')
    expect(createBlock('wait').value).toBe(1)
    expect(createBlock('goHome').value).toBeUndefined()
    expect(createBlock('flag').children).toBeUndefined()
  })

  it('container bloklar children: [] ile gelir; overrides uygulanır', () => {
    expect(createBlock('repeat').children).toEqual([])
    expect(createBlock('repeat').value).toBe(3)
    expect(createBlock('forever').children).toEqual([])
    expect(createBlock('forward', { value: 7, id: 'x' })).toMatchObject({ id: 'x', value: 7 })
  })
})

describe('bul / sil / ekle / güncelle', () => {
  const tree = () => [
    blk('flag'),
    blk('repeat', 2, [blk('forward', 1), blk('repeat', 3, [blk('hop', 1)])]),
    blk('say'),
  ]

  it('findBlock iç içe bulur', () => {
    const t = tree()
    const deep = t[1].children![1].children![0]
    expect(findBlock(t, deep.id)).toBe(deep)
    expect(findBlock(t, 'yok')).toBeUndefined()
  })

  it('removeBlock içerideki çocuklardan da siler, girdiyi değiştirmez', () => {
    const t = deepFreeze(tree())
    const deep = t[1].children![1].children![0]
    const r = removeBlock(t, deep.id)
    expect(findBlock(r, deep.id)).toBeUndefined()
    expect(r[1].children![1].children).toEqual([])
    expect(findBlock(t, deep.id)).toBe(deep)
    expect(removeBlock(t, 'yok')).toBe(t)
    // container silinince alt ağacı da gider
    const r2 = removeBlock(t, t[1].id)
    expect(r2).toHaveLength(2)
    expect(findBlock(r2, deep.id)).toBeUndefined()
  })

  it('insertBlock üst düzeye ve container içine ekler, immutability korunur', () => {
    const t = deepFreeze(tree())
    const nb = blk('grow')
    const a = insertBlock(t, null, 2, nb)
    expect(a.map((b) => b.id)).toEqual([t[0].id, t[1].id, nb.id, t[2].id])
    const b = insertBlock(t, t[1].id, 1, nb)
    expect(b[1].children!.map((c) => c.id)).toEqual([t[1].children![0].id, nb.id, t[1].children![1].id])
    expect(t[1].children).toHaveLength(2)
    const deepId = t[1].children![1].id
    const c = insertBlock(t, deepId, 0, nb)
    expect(findBlock(c, deepId)!.children![0]).toBe(nb)
    expect(insertBlock(t, null, 99, nb).at(-1)).toBe(nb)
    expect(insertBlock(t, 'yok', 0, nb)).toBe(t)
  })

  it('updateBlock yama uygular, id aynı kalır, girdiyi değiştirmez', () => {
    const t = deepFreeze(tree())
    const deep = t[1].children![1].children![0]
    const r = updateBlock(t, deep.id, { value: 4 })
    expect(findBlock(r, deep.id)!.value).toBe(4)
    expect(deep.value).toBe(1)
    expect(updateBlock(t, 'yok', { value: 1 })).toBe(t)
  })
})

describe('canInsert kuralları', () => {
  it('başlatma bloğu yalnız üst düzeyde ve index 0\'da', () => {
    const t = [blk('forward', 1)]
    expect(canInsert(t, null, 0, 'flag')).toBe(true)
    expect(canInsert(t, null, 1, 'flag')).toBe(false)
    expect(canInsert([], null, 0, 'tap')).toBe(true)
    const withRepeat = [blk('repeat', 2, [])]
    expect(canInsert(withRepeat, withRepeat[0].id, 0, 'flag')).toBe(false)
  })

  it('üst düzeyde zaten başlatma varsa ikincisi eklenemez', () => {
    const t = [blk('flag'), blk('forward', 1)]
    expect(canInsert(t, null, 0, 'tap')).toBe(false)
    expect(canInsert(t, null, 0, 'flag')).toBe(false)
  })

  it('başlatma bloğunun önüne (index 0) başka blok girmez; sonrasına girer', () => {
    const t = [blk('flag')]
    expect(canInsert(t, null, 0, 'forward')).toBe(false)
    expect(canInsert(t, null, 1, 'forward')).toBe(true)
    expect(canInsert([], null, 0, 'forward')).toBe(true)
  })

  it('terminal bloktan sonraya ekleme yok', () => {
    const t = [blk('flag'), blk('forward', 1), blk('stop')]
    expect(canInsert(t, null, 3, 'forward')).toBe(false)
    expect(canInsert(t, null, 2, 'forward')).toBe(true)
    const g = [blk('flag'), blk('goPage', 2)]
    expect(canInsert(g, null, 2, 'hop')).toBe(false)
  })

  it('terminal blok arkasında blok bırakacak yere eklenemez, sona eklenir', () => {
    const t = [blk('flag'), blk('forward', 1)]
    expect(canInsert(t, null, 1, 'stop')).toBe(false)
    expect(canInsert(t, null, 2, 'stop')).toBe(true)
    expect(canInsert(t, null, 2, 'forever')).toBe(true)
  })

  it('container olmayan bloğun içine ekleme yok; container içine var', () => {
    const f = blk('forward', 1)
    const r = blk('repeat', 2, [])
    const t = [blk('flag'), f, r]
    expect(canInsert(t, f.id, 0, 'hop')).toBe(false)
    expect(canInsert(t, r.id, 0, 'hop')).toBe(true)
    expect(canInsert(t, 'yok', 0, 'hop')).toBe(false)
  })

  it('forever içine eklenebilir, forever sonrasına eklenemez; terminal repeat içinde son olur', () => {
    const fv = blk('forever', undefined, [])
    const t = [blk('flag'), fv]
    expect(canInsert(t, fv.id, 0, 'forward')).toBe(true)
    expect(canInsert(t, null, 2, 'forward')).toBe(false)
    const r = blk('repeat', 2, [blk('forward', 1)])
    expect(canInsert([r], r.id, 1, 'stop')).toBe(true)
    expect(canInsert([r], r.id, 0, 'stop')).toBe(false)
  })

  it('geçersiz index reddedilir', () => {
    expect(canInsert([], null, -1, 'forward')).toBe(false)
    expect(canInsert([], null, 1, 'forward')).toBe(false)
    expect(canInsert([], null, 0.5, 'forward')).toBe(false)
  })
})

describe('moveBlock', () => {
  it('aynı listede aşağı kaydırınca index düzeltilir', () => {
    const [a, b, c, d] = [blk('forward', 1), blk('back', 1), blk('hop', 1), blk('grow')]
    const t = deepFreeze([blk('flag'), a, b, c, d])
    // a'yı c'den sonraya (boşluk 4) taşı
    expect(moveBlock(t, a.id, null, 4).map((x) => x.id)).toEqual([t[0].id, b.id, c.id, a.id, d.id])
    // d'yi başa yakın taşı (boşluk 1)
    expect(moveBlock(t, d.id, null, 1).map((x) => x.id)).toEqual([t[0].id, d.id, a.id, b.id, c.id])
    // a'yı kendi boşluğuna taşımak değişmez
    expect(moveBlock(t, a.id, null, 1).map((x) => x.id)).toEqual(t.map((x) => x.id))
    expect(moveBlock(t, a.id, null, 2).map((x) => x.id)).toEqual(t.map((x) => x.id))
  })

  it('container içine ve dışına taşır', () => {
    const f = blk('forward', 1)
    const r = blk('repeat', 2, [])
    const t = deepFreeze([blk('flag'), f, r])
    const into = moveBlock(t, f.id, r.id, 0)
    expect(into.map((x) => x.id)).toEqual([t[0].id, r.id])
    expect(findBlock(into, r.id)!.children![0].id).toBe(f.id)
    const out = moveBlock(into, f.id, null, 2)
    expect(out.map((x) => x.id)).toEqual([t[0].id, r.id, f.id])
    expect(findBlock(out, r.id)!.children).toEqual([])
  })

  it('kendi torununa (ya da kendi içine) taşıma reddedilir', () => {
    const inner = blk('repeat', 2, [])
    const outer = blk('repeat', 2, [inner])
    const t = deepFreeze([blk('flag'), outer])
    expect(moveBlock(t, outer.id, inner.id, 0)).toBe(t)
    expect(moveBlock(t, outer.id, outer.id, 0)).toBe(t)
    expect(canMove(t, outer.id, inner.id, 0)).toBe(false)
  })

  it('başlatma bloğu index 0 dışına, terminal sonrasına taşınamaz', () => {
    const f = blk('forward', 1)
    const stop = blk('stop')
    const t = deepFreeze([blk('flag'), f, stop])
    expect(moveBlock(t, t[0].id, null, 2)).toBe(t)
    expect(moveBlock(t, f.id, null, 3)).toBe(t)
    expect(moveBlock(t, f.id, null, 0)).toBe(t) // başlatmanın önüne
    expect(moveBlock(t, 'yok', null, 0)).toBe(t)
  })
})

describe('betik ve proje işlemleri', () => {
  it('scriptIsRunnable ilk bloğa bakar', () => {
    expect(scriptIsRunnable(script('s', blk('flag'), blk('forward', 1)))).toBe(true)
    expect(scriptIsRunnable(script('s', blk('tap')))).toBe(true)
    expect(scriptIsRunnable(script('s', blk('forward', 1), blk('flag')))).toBe(false)
    expect(scriptIsRunnable(script('s'))).toBe(false)
  })

  it('addScript / removeScript immutable', () => {
    const sp = deepFreeze(sprite('a', 1, 1))
    const s2 = addScript(sp, 'tap')
    expect(sp.scripts).toHaveLength(0)
    expect(s2.scripts).toHaveLength(1)
    expect(s2.scripts[0].blocks.map((b) => b.type)).toEqual(['tap'])
    const s3 = removeScript(s2, s2.scripts[0].id)
    expect(s3.scripts).toHaveLength(0)
    expect(removeScript(s2, 'yok')).toBe(s2)
  })

  it('addSprite boş 3x3 hücreye yerleştirir, sahne içinde ve çakışmasız', () => {
    let pg = deepFreeze(page('p'))
    const seen = new Set<string>()
    for (let i = 0; i < 9; i++) {
      pg = addSprite(pg, 'cat')
      const s = pg.sprites.at(-1)!
      expect(s.x).toBeGreaterThan(0)
      expect(s.x).toBeLessThan(STAGE_W)
      expect(s.y).toBeGreaterThan(0)
      expect(s.y).toBeLessThan(STAGE_H)
      seen.add(`${Math.floor(s.x / (STAGE_W / 3))},${Math.floor(s.y / (STAGE_H / 3))}`)
    }
    expect(seen.size).toBe(9)
    expect(addSprite(pg, 'dog').sprites).toHaveLength(10) // dolu sahnede de eklenir
    expect(new Set(pg.sprites.map((s) => s.id)).size).toBe(9)
  })

  it('updateSprite / removeSprite / mapSprite', () => {
    const pg = deepFreeze(page('p', sprite('a', 1, 1), sprite('b', 2, 2)))
    expect(updateSprite(pg, 'a', { x: 50 }).sprites[0].x).toBe(50)
    expect(pg.sprites[0].x).toBe(1)
    expect(updateSprite(pg, 'yok', { x: 5 })).toBe(pg)
    expect(removeSprite(pg, 'a').sprites.map((s) => s.id)).toEqual(['b'])
    expect(removeSprite(pg, 'yok')).toBe(pg)
    const pr = deepFreeze(proj(pg))
    expect(mapSprite(pr, 'b', (s) => ({ ...s, y: 77 })).pages[0].sprites[1].y).toBe(77)
    expect(mapSprite(pr, 'yok', (s) => s)).toBe(pr)
  })

  it('addPage / removePage (son sayfa silinmez)', () => {
    const pr = deepFreeze(emptyProject())
    const p2 = addPage(pr, 'sky')
    expect(pr.pages).toHaveLength(1)
    expect(p2.pages).toHaveLength(2)
    expect(p2.pages[1].background).toBe('sky')
    expect(addPage(pr).pages[1].background).toBe('grass')
    expect(removePage(p2, 0).pages.map((p) => p.id)).toEqual([p2.pages[1].id])
    expect(removePage(p2, p2.pages[1].id).pages).toHaveLength(1)
    expect(removePage(pr, 0)).toBe(pr)
    expect(removePage(p2, 'yok')).toBe(p2)
    expect(removePage(p2, 5)).toBe(p2)
  })
})
