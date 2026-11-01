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

// ---- Çıkarma (delik açma) ----

import { aabbVolume, blockAabb, resolveSolids, solidVolume, subtractBox, type Aabb } from './govde'

const box = (x0: number, y0: number, z0: number, x1: number, y1: number, z1: number): Aabb => [x0, y0, z0, x1, y1, z1]
/** Kutuların toplam hacmi. */
const sumV = (as: Aabb[]) => as.reduce((s, a) => s + aabbVolume(a), 0)
/** İki kutu gerçekten kesişiyor mu (sıfır hacimli değme kesişim sayılmaz)? */
const overlaps = (a: Aabb, b: Aabb) =>
  aabbVolume([Math.max(a[0], b[0]), Math.max(a[1], b[1]), Math.max(a[2], b[2]),
    Math.min(a[3], b[3]), Math.min(a[4], b[4]), Math.min(a[5], b[5])]) > 1e-12

describe('subtractBox: kutudan kutu çıkarma', () => {
  const S = box(0, 0, 0, 10, 10, 10)

  it('ortadan delik: hacim korunur (kalan + delik = bütün)', () => {
    const C = box(4, 4, 4, 6, 6, 6)
    const parts = subtractBox(S, C)
    expect(sumV(parts)).toBeCloseTo(aabbVolume(S) - aabbVolume(C), 9)
  })

  it('kalan parçalar birbiriyle örtüşmez', () => {
    const parts = subtractBox(S, box(3, 2, 1, 7, 8, 9))
    for (let i = 0; i < parts.length; i++)
      for (let j = i + 1; j < parts.length; j++)
        expect(overlaps(parts[i], parts[j])).toBe(false)
  })

  it('kalan hiçbir parça delik bölgesine girmez', () => {
    const C = box(4, 4, 4, 6, 6, 6)
    for (const p of subtractBox(S, C)) expect(overlaps(p, C)).toBe(false)
  })

  it('ortadan delik en çok 6 parça verir', () => {
    expect(subtractBox(S, box(4, 4, 4, 6, 6, 6)).length).toBeLessThanOrEqual(6)
  })

  it('köşeden ısırık daha az parça verir', () => {
    const parts = subtractBox(S, box(-5, -5, -5, 4, 4, 4))
    expect(sumV(parts)).toBeCloseTo(1000 - 64, 9)
    expect(parts.length).toBeLessThanOrEqual(3)
  })

  it('bir ucu baştan sona kesen yarık: tam ikiye böler', () => {
    const parts = subtractBox(S, box(4, -1, -1, 6, 11, 11))
    expect(parts).toHaveLength(2)
    expect(sumV(parts)).toBeCloseTo(1000 - 200, 9)
  })

  it('değmeyen kesici hiçbir şeyi değiştirmez', () => {
    expect(subtractBox(S, box(20, 20, 20, 30, 30, 30))).toEqual([S])
  })

  it('yalnız yüzeye değen kesici kesmez', () => {
    expect(subtractBox(S, box(10, 0, 0, 12, 10, 10))).toEqual([S])
  })

  it('tamamen kaplayan kesici geriye bir şey bırakmaz', () => {
    expect(subtractBox(S, box(-1, -1, -1, 11, 11, 11))).toEqual([])
  })

  it('kesicinin dışarı taşan kısmı bir şey kesmez', () => {
    const parts = subtractBox(S, box(8, -5, -5, 20, 15, 15))
    expect(sumV(parts)).toBeCloseTo(800, 9)
  })
})

describe('resolveSolids', () => {
  const solid = (p: Partial<Block> = {}): Block => B({ id: 's', size: [0.05, 0.05, 0.01], ...p })
  const cutter = (p: Partial<Block> = {}): Block => B({ id: 'c', cut: true, size: [0.01, 0.01, 0.02], ...p })

  it('kesici yoksa bloklar olduğu gibi geçer', () => {
    const { pieces } = resolveSolids({ v: 1, blocks: [solid()] })
    expect(pieces).toHaveLength(1)
  })

  it('kesici katıyı deler ve parçalara böler', () => {
    const { pieces } = resolveSolids({ v: 1, blocks: [solid(), cutter()] })
    expect(pieces.length).toBeGreaterThan(1)
    expect(pieces.every((p) => p.shape === 'kutu')).toBe(true)
  })

  it('delik hacmi gerçekten düşülür', () => {
    const g: Govde = { v: 1, blocks: [solid(), cutter()] }
    const dolu = blockVolume(solid())
    const delik = 8 * 0.01 * 0.01 * 0.01 // kesici katının kalınlığıyla kırpılır
    expect(solidVolume(g)).toBeCloseTo(dolu - delik, 9)
  })

  it('delik kütleyi azaltır', () => {
    const dolu = govdeMassG({ v: 1, blocks: [solid()] })
    const delikli = govdeMassG({ v: 1, blocks: [solid(), cutter()] })
    expect(delikli).toBeLessThan(dolu)
  })

  it('kesici tek başına katı sayılmaz', () => {
    expect(resolveSolids({ v: 1, blocks: [cutter()] }).pieces).toHaveLength(0)
  })

  it('silindir katı delinmez ve dürüstçe bildirilir', () => {
    const { pieces, notes } = resolveSolids({ v: 1, blocks: [solid({ shape: 'silindir' }), cutter()] })
    expect(pieces).toHaveLength(1)
    expect(notes.some((n) => /delinmedi/.test(n.tr))).toBe(true)
  })

  it('eğik kesici kullanılamaz ve dürüstçe bildirilir', () => {
    const { pieces, notes } = resolveSolids({ v: 1, blocks: [solid(), cutter({ yaw: 30 })] })
    expect(pieces).toHaveLength(1)
    expect(notes.some((n) => /kesici olarak kullanılamıyor/.test(n.tr))).toBe(true)
  })

  it('90° dönmüş kesici eksen hizalıdır, çalışır', () => {
    const { notes } = resolveSolids({ v: 1, blocks: [solid(), cutter({ yaw: 90 })] })
    expect(notes).toHaveLength(0)
  })

  it('iki kesici sırayla uygulanır', () => {
    const g: Govde = { v: 1, blocks: [solid(), cutter({ id: 'c1', pos: [-0.02, 0, 0] }), cutter({ id: 'c2', pos: [0.02, 0, 0] })] }
    expect(solidVolume(g)).toBeLessThan(solidVolume({ v: 1, blocks: [solid(), cutter({ id: 'c1', pos: [-0.02, 0, 0] })] }))
  })

  it('kesici blok silinebilir (son katı kuralı onu bağlamaz)', () => {
    const g: Govde = { v: 1, blocks: [solid(), cutter()] }
    expect(removeBlock(g, 'c').blocks).toHaveLength(1)
  })
})
