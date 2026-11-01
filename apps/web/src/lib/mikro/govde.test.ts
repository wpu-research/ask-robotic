import { describe, expect, it } from 'vitest'
import {
  addBlock, blockVolume, defaultGovde, duplicateBlock, govdeBounds, govdeIssues,
  govdeMassG, normalizeBlock, normalizeGovde, removeBlock, updateBlock, uniqueBlockId, type Block, type Govde,
} from './govde'

const B = (p: Partial<Block> = {}): Block => ({ id: 'b1', shape: 'kutu', pos: [0, 0, 0], size: [0.02, 0.02, 0.01], yaw: 0, color: '#db3c8c', ...p })

describe('hacim ve kütle', () => {
  it('kutunun hacmi yarı boyutlardan gelir', () => {
    expect(blockVolume(B({ size: [0.05, 0.04, 0.03] }))).toBeCloseTo(8 * 0.05 * 0.04 * 0.03, 10)
  })
  it('silindirin hacmi πr²h', () => {
    expect(blockVolume(B({ shape: 'silindir', size: [0.02, 0.02, 0.05] }))).toBeCloseTo(Math.PI * 4e-4 * 0.1, 10)
  })
  it('kürenin hacmi 4/3πr³', () => {
    expect(blockVolume(B({ shape: 'kure', size: [0.03, 0, 0] }))).toBeCloseTo((4 / 3) * Math.PI * 2.7e-5, 10)
  })
  it('kütle hacim ve yoğunluktan; gram döner', () => {
    const g: Govde = { v: 1, blocks: [B({ size: [0.05, 0.05, 0.005] })] }
    expect(govdeMassG(g)).toBe(Math.round(8 * 0.05 * 0.05 * 0.005 * 420 * 1000))
  })
})

describe('işlemler', () => {
  it('varsayılan gövde tek bloktur ve şasi boyunu alır', () => {
    const g = defaultGovde('orta')
    expect(g.blocks).toHaveLength(1)
    expect(g.blocks[0].size[0]).toBeCloseTo((7 * 0.02) / 2, 10)
  })
  it('yeni blok var olanların önüne konur, üst üste binmez', () => {
    const g = addBlock(defaultGovde('orta'), 'kutu')
    const [a, b] = g.blocks
    expect(b.pos[0]).toBeGreaterThan(a.pos[0] + a.size[0])
  })
  it('kimlikler çakışmaz', () => {
    expect(uniqueBlockId(['b1', 'b2'])).toBe('b3')
  })
  it('blok güncellenir ve sınırlara oturur', () => {
    const g = updateBlock(defaultGovde('orta'), 'b1', { size: [99, 0.02, 0.01] })
    expect(g.blocks[0].size[0]).toBe(0.25)
  })
  it('son blok silinmez: gövdesiz robot olmaz', () => {
    const g = defaultGovde('kucuk')
    expect(removeBlock(g, 'b1').blocks).toHaveLength(1)
  })
  it('iki bloktan biri silinir', () => {
    const g = addBlock(defaultGovde('kucuk'), 'kutu')
    expect(removeBlock(g, 'b1').blocks).toHaveLength(1)
  })
  it('kopyalanan blok yana kayar', () => {
    const g = duplicateBlock(defaultGovde('kucuk'), 'b1')
    expect(g.blocks).toHaveLength(2)
    expect(g.blocks[1].pos[1]).toBeLessThan(g.blocks[0].pos[1])
  })
  it('olmayan blok kopyalanmaz', () => {
    const g = defaultGovde('kucuk')
    expect(duplicateBlock(g, 'yok')).toEqual(g)
  })
})

describe('normalize', () => {
  it('NaN ve sonsuz değerler modele sızmaz', () => {
    const b = normalizeBlock(B({ pos: [NaN, Infinity, 0], size: [NaN, -5, 1e9], yaw: NaN }))
    expect(b.pos.every(Number.isFinite)).toBe(true)
    expect(b.size.every((s) => s >= 0.005 && s <= 0.25)).toBe(true)
    expect(b.yaw).toBe(0)
  })
  it('negatif açı 0-360 aralığına döner', () => {
    expect(normalizeBlock(B({ yaw: -90 })).yaw).toBe(270)
  })
  it('bozuk gövde reddedilir', () => {
    expect(normalizeGovde(null)).toBeNull()
    expect(normalizeGovde({ v: 2, blocks: [] })).toBeNull()
    expect(normalizeGovde({ v: 1, blocks: [] })).toBeNull()
    expect(normalizeGovde({ v: 1, blocks: [{ bozuk: true }] })).toBeNull()
  })
  it('geçerli gövde korunur', () => {
    expect(normalizeGovde({ v: 1, blocks: [B()] })?.blocks).toHaveLength(1)
  })
})

describe('sınırlar ve uyarılar', () => {
  it('kaplanan kutu hesaplanır', () => {
    const g: Govde = { v: 1, blocks: [B({ pos: [0, 0, 0], size: [0.05, 0.03, 0.01] })] }
    const [x0, , , x1] = govdeBounds(g)
    expect(x0).toBeCloseTo(-0.05, 10)
    expect(x1).toBeCloseTo(0.05, 10)
  })
  it('üst üste binen bloklar uyarı verir', () => {
    const g: Govde = { v: 1, blocks: [B({ id: 'b1' }), B({ id: 'b2', pos: [0.005, 0, 0] })] }
    expect(govdeIssues(g).some((i) => /üst üste/.test(i.tr))).toBe(true)
  })
  it('değmeyen blok hata verir', () => {
    const g: Govde = { v: 1, blocks: [B({ id: 'b1' }), B({ id: 'b2', pos: [0.3, 0, 0] })] }
    const iss = govdeIssues(g)
    expect(iss.some((i) => i.level === 'hata' && /değmiyor/.test(i.tr))).toBe(true)
  })
  it('yan yana değen bloklar hata vermez', () => {
    const g: Govde = { v: 1, blocks: [B({ id: 'b1' }), B({ id: 'b2', pos: [0.04, 0, 0] })] }
    expect(govdeIssues(g).filter((i) => i.level === 'hata')).toHaveLength(0)
  })
  it('çok ağır gövde uyarı verir', () => {
    const g: Govde = { v: 1, blocks: [B({ size: [0.25, 0.25, 0.25] })] }
    expect(govdeIssues(g).some((i) => /çok ağır/.test(i.tr))).toBe(true)
  })
  it('tek bloklu gövde uyarısız', () => {
    expect(govdeIssues(defaultGovde('orta'))).toHaveLength(0)
  })
})
