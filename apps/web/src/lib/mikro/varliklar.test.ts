import { afterEach, describe, expect, it, vi } from 'vitest'
import { ASSET_KEY, centerBlocks, deleteAsset, insertAsset, listAssets, saveAsset } from './varliklar'
import type { Block, Govde } from './govde'

/** Tarayıcı deposu taklidi. */
function mockStore(initial: string | null = null, broken = false) {
  let value = initial
  vi.stubGlobal('localStorage', {
    getItem: () => { if (broken) throw new Error('gizli pencere'); return value },
    setItem: (_k: string, v: string) => { if (broken) throw new Error('dolu'); value = v },
  })
}
afterEach(() => vi.unstubAllGlobals())

const B = (p: Partial<Block> = {}): Block => ({ id: 'b1', shape: 'kutu', pos: [0, 0, 0], size: [0.02, 0.02, 0.01], yaw: 0, color: '#fff', ...p })

describe('varlık kütüphanesi', () => {
  it('kayıt yokken boş liste', () => {
    mockStore(null)
    expect(listAssets()).toEqual([])
  })

  it('kaydedilir ve geri okunur', () => {
    mockStore(null)
    const list = saveAsset('Kule', [B()])
    expect(list).toHaveLength(1)
    expect(list[0].name).toBe('Kule')
    expect(listAssets()).toHaveLength(1)
  })

  it('aynı ad üzerine yazar, kütüphane şişmez', () => {
    mockStore(null)
    saveAsset('Kule', [B()])
    const list = saveAsset('kule', [B({ id: 'b2' })])
    expect(list).toHaveLength(1)
  })

  it('adsız kayda varsayılan ad verilir', () => {
    mockStore(null)
    expect(saveAsset('   ', [B()])[0].name).toBe('Parça')
  })

  it('bloksuz kayıt yapılmaz', () => {
    mockStore(null)
    expect(saveAsset('Boş', [])).toEqual([])
  })

  it('silinir', () => {
    mockStore(null)
    const id = saveAsset('Kule', [B()])[0].id
    expect(deleteAsset(id)).toEqual([])
  })

  it('bozuk kayıt çökmez', () => {
    mockStore('{bu json değil')
    expect(listAssets()).toEqual([])
  })

  it('dizi olmayan kayıt çökmez', () => {
    mockStore('{"a":1}')
    expect(listAssets()).toEqual([])
  })

  it('gizli pencerede depo fırlatsa da akış bozulmaz', () => {
    mockStore(null, true)
    expect(listAssets()).toEqual([])
    expect(() => saveAsset('Kule', [B()])).not.toThrow()
  })

  it('depo anahtarı sabittir', () => {
    expect(ASSET_KEY).toBe('ask:tasarim:varliklar:v1')
  })
})

describe('centerBlocks', () => {
  it('blokları başlangıca toplar', () => {
    const out = centerBlocks([B({ pos: [0.1, 0, 0] }), B({ id: 'b2', pos: [0.14, 0, 0] })])
    const mid = (out[0].pos[0] + out[1].pos[0]) / 2
    expect(mid).toBeCloseTo(0, 9)
  })
  it('boş girdi boş çıktı', () => {
    expect(centerBlocks([])).toEqual([])
  })
})

describe('insertAsset', () => {
  const g: Govde = { v: 1, blocks: [B({ id: 'b1' })] }
  const asset = { id: 'v1', name: 'Kule', blocks: [B({ id: 'x' }), B({ id: 'y', pos: [0.03, 0, 0] })], at: '' }

  it('blokları ekler ve kimlikler çakışmaz', () => {
    const out = insertAsset(g, asset)
    expect(out.blocks).toHaveLength(3)
    expect(new Set(out.blocks.map((b) => b.id)).size).toBe(3)
  })

  it('verilen noktaya oturur', () => {
    const out = insertAsset(g, { ...asset, blocks: [B({ id: 'x' })] }, [0.1, 0.05, 0])
    const added = out.blocks[out.blocks.length - 1]
    expect(added.pos[0]).toBeCloseTo(0.1, 9)
    expect(added.pos[1]).toBeCloseTo(0.05, 9)
  })

  it('nokta verilmezse gövdenin önüne konur', () => {
    const added = insertAsset(g, { ...asset, blocks: [B({ id: 'x' })] }).blocks[1]
    expect(added.pos[0]).toBeGreaterThan(g.blocks[0].pos[0] + g.blocks[0].size[0])
  })
})
