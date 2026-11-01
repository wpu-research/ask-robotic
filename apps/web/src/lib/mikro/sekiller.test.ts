// Hacimler varsayılmıyor: üretilen çokyüzlünün hacmi bilinen formüllerle karşılaştırılıyor.
import { describe, expect, it } from 'vitest'
import { meshVertexAttr, polyVolume, unitPoly, unitVolume, type MeshShape } from './sekiller'

const ALL: MeshShape[] = ['koni', 'ucgen-prizma', 'alti-prizma', 'kare-piramit', 'besgen-piramit', 'dortyuzlu', 'sekizyuzlu', 'onikiyuzlu']

describe('birim şekiller', () => {
  it.each(ALL)('%s: köşeleri birim kutuya sığar', (s) => {
    for (const v of unitPoly(s).verts) for (const c of v) expect(Math.abs(c)).toBeLessThanOrEqual(1 + 1e-9)
  })

  it.each(ALL)('%s: hacmi pozitif ve kutudan küçük', (s) => {
    const v = unitVolume(s)
    expect(v).toBeGreaterThan(0)
    expect(v).toBeLessThan(8) // [-1,1]³ kutusunun hacmi
  })

  it.each(ALL)('%s: en az 4 köşe, kapalı yüzey listesi', (s) => {
    const p = unitPoly(s)
    expect(p.verts.length).toBeGreaterThanOrEqual(4)
    expect(p.faces.length).toBeGreaterThanOrEqual(4)
    for (const f of p.faces) for (const i of f) expect(p.verts[i]).toBeDefined()
  })
})

describe('hacimler bilinen formüllerle uyuşur', () => {
  it('koni ≈ (1/3)πr²h, r=1 h=2 → 2π/3', () => {
    // 24 dilimli yaklaşım gerçek koniden biraz küçüktür
    expect(unitVolume('koni')).toBeCloseTo((2 * Math.PI) / 3, 1)
    expect(unitVolume('koni')).toBeLessThan((2 * Math.PI) / 3)
  })

  it('üçgen prizma = birim çembere çizili üçgenin alanı × 2', () => {
    expect(unitVolume('ucgen-prizma')).toBeCloseTo(((3 * Math.sqrt(3)) / 4) * 2, 9)
  })

  it('altıgen prizma = altıgen alanı × 2', () => {
    expect(unitVolume('alti-prizma')).toBeCloseTo(((3 * Math.sqrt(3)) / 2) * 2, 9)
  })

  it('kare piramit = (1/3) × taban(2×2) × yükseklik(2) = 8/3', () => {
    expect(unitVolume('kare-piramit')).toBeCloseTo(8 / 3, 9)
  })

  it('beşgen piramit = (1/3) × beşgen alanı × 2', () => {
    const alan = (5 / 2) * Math.sin((2 * Math.PI) / 5)
    expect(unitVolume('besgen-piramit')).toBeCloseTo((alan * 2) / 3, 9)
  })

  it('dörtyüzlü (küpe çizili) = küpün üçte biri = 8/3', () => {
    expect(unitVolume('dortyuzlu')).toBeCloseTo(8 / 3, 9)
  })

  it('sekizyüzlü (±1 köşeli) = 4/3', () => {
    expect(unitVolume('sekizyuzlu')).toBeCloseTo(4 / 3, 9)
  })

  it('onikiyüzlü: kenarı a=2/φ² olan düzgün dodekahedron', () => {
    const phi = (1 + Math.sqrt(5)) / 2
    const a = 2 / (phi * phi) // köşeler 1/φ ile ölçeklendi
    expect(unitVolume('onikiyuzlu')).toBeCloseTo(((15 + 7 * Math.sqrt(5)) / 4) * a ** 3, 6)
  })
})

describe('ölçekleme', () => {
  it('köşe dizisi yarı boyutlarla çarpılır', () => {
    const attr = meshVertexAttr('sekizyuzlu', [0.1, 0.2, 0.3])
    const nums = attr.split(' ').map(Number)
    expect(Math.max(...nums.filter((_, i) => i % 3 === 0))).toBeCloseTo(0.1, 9)
    expect(Math.max(...nums.filter((_, i) => i % 3 === 1))).toBeCloseTo(0.2, 9)
    expect(Math.max(...nums.filter((_, i) => i % 3 === 2))).toBeCloseTo(0.3, 9)
  })

  it('köşe sayısı üçün katı kadar sayı üretir', () => {
    const n = meshVertexAttr('dortyuzlu', [1, 1, 1]).split(' ').length
    expect(n).toBe(unitPoly('dortyuzlu').verts.length * 3)
  })

  it('hacim ölçekle doğru orantılı', () => {
    const p = unitPoly('sekizyuzlu')
    const scaled = { verts: p.verts.map(([x, y, z]) => [x * 2, y * 3, z * 4] as [number, number, number]), faces: p.faces }
    expect(polyVolume(scaled)).toBeCloseTo(unitVolume('sekizyuzlu') * 24, 9)
  })
})
