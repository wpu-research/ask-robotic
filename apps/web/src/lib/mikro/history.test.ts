import { describe, expect, it } from 'vitest'
import { canRedo, canUndo, initHistory, present, push, redo, replace, resetHistory, undo } from './history'

describe('geri al / yinele', () => {
  it('başlangıçta geri alınacak bir şey yok', () => {
    const h = initHistory('a')
    expect(present(h)).toBe('a')
    expect(canUndo(h)).toBe(false)
    expect(canRedo(h)).toBe(false)
  })

  it('adım eklenince geri alınabilir', () => {
    const h = push(initHistory('a'), 'b')
    expect(present(h)).toBe('b')
    expect(canUndo(h)).toBe(true)
    expect(present(undo(h))).toBe('a')
  })

  it('geri alınca yinelenebilir', () => {
    const h = undo(push(initHistory('a'), 'b'))
    expect(canRedo(h)).toBe(true)
    expect(present(redo(h))).toBe('b')
  })

  it('geri alıp yeni adım atınca yinele dalı atılır', () => {
    let h = push(push(initHistory('a'), 'b'), 'c')
    h = undo(h)            // b
    h = push(h, 'd')       // a, b, d
    expect(canRedo(h)).toBe(false)
    expect(present(h)).toBe('d')
    expect(present(undo(h))).toBe('b')
  })

  it('aynı durum iki kez eklenmez', () => {
    const h = initHistory('a')
    expect(push(h, 'a')).toBe(h)
  })

  it('replace yeni adım açmaz, son adımı değiştirir', () => {
    let h = push(initHistory('a'), 'b')
    h = replace(h, 'b2')
    expect(present(h)).toBe('b2')
    expect(present(undo(h))).toBe('a')
  })

  it('sınır aşılınca en eski adım düşer ama şimdiki durum korunur', () => {
    let h = initHistory(0, 3)
    for (let i = 1; i <= 5; i++) h = push(h, i)
    expect(present(h)).toBe(5)
    expect(h.stack).toHaveLength(3)
    expect(h.stack[0]).toBe(3)
  })

  it('en başta geri al, en sonda yinele bir şey bozmaz', () => {
    const h = initHistory('a')
    expect(undo(h)).toBe(h)
    expect(redo(h)).toBe(h)
  })

  it('sıfırlama geçmişi siler', () => {
    const h = resetHistory(push(initHistory('a'), 'b'), 'z')
    expect(present(h)).toBe('z')
    expect(canUndo(h)).toBe(false)
  })

  it('sınır en az 1 olur', () => {
    expect(initHistory('a', 0).limit).toBe(1)
  })
})
