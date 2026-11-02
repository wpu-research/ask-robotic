import { afterEach, describe, expect, it, vi } from 'vitest'
import { Box3, Mesh, MeshStandardMaterial, Vector3 } from 'three'
import { buildElectronicsModel } from './electronics-models'

afterEach(() => vi.unstubAllGlobals())

describe('elektronik kart modelleri', () => {
  it.each([['uno', 32, 0.08], ['esp32', 30, 0.06]] as const)('%s PCB, pin yuvaları ve ayrıntılı bileşenleri üretir', (type, sockets, maxWidth) => {
    const context = { fillRect: vi.fn(), beginPath: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(), stroke: vi.fn(), fillText: vi.fn() }
    vi.stubGlobal('document', { createElement: () => ({ width: 0, height: 0, getContext: () => context }) })
    const board = buildElectronicsModel(type)
    expect(board.name).toBe(`electronics-${type}`)
    expect(board.children.length).toBeGreaterThan(140)
    const gold = board.children.filter((child) => child instanceof Mesh && (child.material as MeshStandardMaterial).color.getHexString() === 'c6a453')
    expect(gold.filter((child) => (child as Mesh).geometry.type === 'CylinderGeometry')).toHaveLength(sockets)
    expect(context.fillText).toHaveBeenCalledWith(type === 'uno' ? 'UNO' : 'ESP32', 570, 320)
    if (type === 'esp32') expect(context.fillText).toHaveBeenCalledWith('ESP-WROOM-32', 512, 210)
    const dimensions = new Box3().setFromObject(board).getSize(new Vector3())
    expect(dimensions.x).toBeLessThan(maxWidth)
    expect(dimensions.z).toBeGreaterThan(0.009)
  })
})
