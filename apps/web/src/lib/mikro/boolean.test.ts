import { describe, expect, it } from 'vitest'
import { booleanBlocks, canBoolean } from './boolean'
import { blockVolume, type Block, type Govde } from './govde'

const box = (id: string, offset = 0): Block => ({ id, shape: 'kutu', pos: [offset, 0, 0], size: [0.02, 0.02, 0.02], yaw: 0, color: '#c2410c' })
const body = (): Govde => ({ v: 1, blocks: [box('a'), box('b', 0.02)] })

describe('Boolean kutu geometrisi', () => {
  it.each([['union', 0.000096], ['subtract', 0.000032], ['intersect', 0.000032]] as const)('%s gerçek hacmi korur', (operation, volume) => {
    const result = booleanBlocks(body(), 'a', 'b', operation)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.body.blocks.reduce((sum, block) => sum + blockVolume(block), 0)).toBeCloseTo(volume, 9)
    expect(new Set(result.body.blocks.map((block) => block.id)).size).toBe(result.body.blocks.length)
    expect(result.selected).toBe(result.body.blocks[0].id)
  })

  it('eğik, kesici ve kutu olmayan şekilleri reddeder', () => {
    for (const patch of [{ yaw: 45 }, { cut: true }, { shape: 'kure' as const }]) expect(canBoolean({ ...box('a'), ...patch }, box('b'))).toBe(false)
    expect(canBoolean(box('a'), box('a'))).toBe(false)
    expect(canBoolean({ ...box('a'), yaw: 90 }, box('b'))).toBe(true)
  })

  it('son katıyı silmez, temsil edilemeyen ince dilimi büyütmez', () => {
    expect(booleanBlocks({ v: 1, blocks: [box('a'), box('b')] }, 'a', 'b', 'subtract')).toEqual({ ok: false, reason: 'empty' })
    expect(booleanBlocks({ v: 1, blocks: [box('a'), box('b', 0.001)] }, 'a', 'b', 'subtract')).toEqual({ ok: false, reason: 'precision' })
  })
})
