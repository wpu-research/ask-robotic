import { describe, expect, it } from 'vitest'
import { applyDone, applyUndone, doneCount, loadAll, loadProgram, markLevelDone, nextOpenLevel, parseAll, saveProgram, type KV } from './progress'

const mem = (): KV & { data: Map<string, string> } => {
  const data = new Map<string, string>()
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => { data.set(k, v) } }
}

describe('oyun ilerlemesi', () => {
  it('bozuk girdide boş döner, geçersiz seviyeleri ve tekrarları atar', () => {
    for (const bad of [null, '', 'x', '[]', '5', '{"a":1}']) expect(parseAll(bad), String(bad)).toEqual({})
    expect(parseAll('{"labirent":{"done":[3,1,1,0,11,"2",2.5],"best":{"1":4,"x":2,"3":-1,"2":"a"}}}')).toEqual({ labirent: { done: [1, 3], best: { 1: 4 } } })
  })
  it('applyDone ekler, sıralar, en iyi blok sayısını korur ve girdiyi değiştirmez', () => {
    const a0 = {}
    const a1 = applyDone(a0, 'kus', 3, 6)
    const a2 = applyDone(a1, 'kus', 1, 2)
    const a3 = applyDone(a2, 'kus', 3, 9)
    const a4 = applyDone(a3, 'kus', 3, 5)
    expect(a0).toEqual({})
    expect(a3.kus).toEqual({ done: [1, 3], best: { 1: 2, 3: 6 } })
    expect(a4.kus?.best?.[3]).toBe(5)
    expect(applyDone(a4, 'kus', 99)).toBe(a4)
    expect(doneCount(a4, 'kus')).toBe(2)
    expect(doneCount(a4, 'yok')).toBe(0)
  })
  it('applyUndone seviyeyi geri alır', () => {
    const a = applyDone(applyDone({}, 'film', 1, 3), 'film', 2)
    expect(applyUndone(a, 'film', 1).film).toEqual({ done: [2] })
  })
  it('nextOpenLevel ilk tamamlanmamışı verir, hepsi bittiyse 1', () => {
    let a = {}
    expect(nextOpenLevel(a, 'golet')).toBe(1)
    a = applyDone(applyDone(a, 'golet', 1), 'golet', 2)
    expect(nextOpenLevel(a, 'golet')).toBe(3)
    for (let l = 3; l <= 10; l++) a = applyDone(a, 'golet', l)
    expect(nextOpenLevel(a, 'golet')).toBe(1)
  })
  it('depo: markLevelDone kaydeder ve loadAll okur; anahtar ask:games:v1', () => {
    const kv = mem()
    markLevelDone('muzik', 4, 7, kv)
    markLevelDone('muzik', 2, 3, kv)
    expect(JSON.parse(kv.data.get('ask:games:v1')!)).toEqual({ muzik: { done: [2, 4], best: { 2: 3, 4: 7 } } })
    expect(loadAll(kv).muzik?.done).toEqual([2, 4])
    expect(loadAll(null)).toEqual({})
  })
  it('depo hata verse bile çökmez', () => {
    const bad: KV = { getItem: () => { throw new Error('x') }, setItem: () => { throw new Error('y') } }
    expect(loadAll(bad)).toEqual({})
    expect(() => markLevelDone('kus', 1, 1, bad)).not.toThrow()
    expect(loadProgram('kus', 1, bad)).toBeNull()
    expect(() => saveProgram('kus', 1, {}, bad)).not.toThrow()
  })
  it('yarım kalan program kaydı', () => {
    const kv = mem()
    expect(loadProgram('kus', 2, kv)).toBeNull()
    saveProgram('kus', 2, { blocks: { blocks: [] } }, kv)
    expect(loadProgram('kus', 2, kv)).toEqual({ blocks: { blocks: [] } })
    saveProgram('kus', 2, null, kv)
    expect(loadProgram('kus', 2, kv)).toBeNull()
  })
})
