import { describe, expect, it } from 'vitest'
import { boundsOf, formatOf, hullSample, parseAsciiStl, parseBinaryStl, parseObj, parseStl, prepareVerts } from './ice-aktar'

/** Tek üçgenli ikili STL üretir. */
function binStl(tris: number[][]): ArrayBuffer {
  const buf = new ArrayBuffer(84 + tris.length * 50)
  const dv = new DataView(buf)
  dv.setUint32(80, tris.length, true)
  let o = 84
  for (const t of tris) {
    o += 12
    for (const c of t) { dv.setFloat32(o, c, true); o += 4 }
    o += 2
  }
  return buf
}

describe('biçim tanıma', () => {
  it.each([['a.stl', 'stl'], ['a.STL', 'stl'], ['b.glb', 'glb'], ['b.gltf', 'glb'], ['c.obj', 'obj']])('%s → %s', (n, f) => {
    expect(formatOf(n)).toBe(f)
  })
  it('tanınmayan uzantı null', () => {
    expect(formatOf('resim.png')).toBeNull()
    expect(formatOf('uzantisiz')).toBeNull()
  })
})

describe('STL okuma', () => {
  const tri = [0, 0, 0, 1, 0, 0, 0, 1, 0]

  it('ikili STL çözülür', () => {
    expect(parseBinaryStl(binStl([tri]))).toEqual(tri)
  })

  it('iki üçgenli ikili STL', () => {
    expect(parseBinaryStl(binStl([tri, tri]))).toHaveLength(18)
  })

  it('çok kısa dosya reddedilir', () => {
    expect(parseBinaryStl(new ArrayBuffer(10))).toBeNull()
  })

  it('üçgen sayısı dosya boyuyla uyuşmazsa reddedilir', () => {
    const b = binStl([tri])
    new DataView(b).setUint32(80, 99, true)
    expect(parseBinaryStl(b)).toBeNull()
  })

  it('metin STL çözülür', () => {
    const txt = `solid s
facet normal 0 0 1
 outer loop
  vertex 0 0 0
  vertex 1 0 0
  vertex 0 1 0
 endloop
endfacet
endsolid`
    expect(parseAsciiStl(txt)).toEqual(tri)
  })

  it('parseStl ikili ve metni birlikte ele alır', () => {
    expect(parseStl(binStl([tri]))).toEqual(tri)
    const txt = new TextEncoder().encode('solid\nvertex 1 2 3\nendsolid').buffer
    expect(parseStl(txt as ArrayBuffer)).toEqual([1, 2, 3])
  })

  it('köşesiz metin null', () => {
    expect(parseAsciiStl('solid bos endsolid')).toBeNull()
  })
})

describe('OBJ okuma', () => {
  it('v satırları alınır, diğerleri atlanır', () => {
    expect(parseObj('# yorum\nv 1 2 3\nvn 0 0 1\nf 1 2 3\nv 4 5 6')).toEqual([1, 2, 3, 4, 5, 6])
  })
  it('köşesiz OBJ null', () => {
    expect(parseObj('f 1 2 3')).toBeNull()
  })
})

describe('hullSample', () => {
  it('sınırın altındaysa dokunulmaz', () => {
    const p: [number, number, number][] = [[0, 0, 0], [1, 1, 1]]
    expect(hullSample(p, 10)).toBe(p)
  })

  it('seyreltme köşe sayısını sınırın altına indirir', () => {
    const p: [number, number, number][] = Array.from({ length: 2000 }, (_, i) => [Math.sin(i), Math.cos(i), Math.sin(i * 2)])
    expect(hullSample(p, 64).length).toBeLessThanOrEqual(64)
  })

  it('küpün sekiz köşesi korunur: uç noktalar atılmaz', () => {
    const corners: [number, number, number][] = []
    for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) corners.push([x, y, z])
    // içeride çok sayıda nokta, dışarıda köşeler
    const inner: [number, number, number][] = Array.from({ length: 500 }, (_, i) => [Math.sin(i) * 0.3, Math.cos(i) * 0.3, Math.sin(i * 3) * 0.3])
    const out = hullSample([...inner, ...corners], 64)
    for (const c of corners) expect(out.some((p) => p.every((v, k) => Math.abs(v - c[k]) < 1e-9))).toBe(true)
  })
})

describe('prepareVerts', () => {
  it('merkezler ve [-1,1] kutusuna ölçekler', () => {
    const raw = [10, 10, 10, 12, 11, 10.5]
    const { verts } = prepareVerts(raw)
    const { min, max } = boundsOf(verts)
    expect(Math.max(...max.map(Math.abs), ...min.map(Math.abs))).toBeLessThanOrEqual(1 + 1e-9)
    expect(max[0]).toBeCloseTo(1, 9) // en uzun kenar tam kutuya oturur
  })

  it('modelin gerçek boyutunu bildirir', () => {
    expect(prepareVerts([0, 0, 0, 0.2, 0.1, 0.05]).sizeM).toEqual([0.2, 0.1, 0.05])
  })

  it('tekrarlı köşeler bir kez sayılır', () => {
    expect(prepareVerts([1, 1, 1, 1, 1, 1, 2, 2, 2]).rawCount).toBe(2)
  })

  it('NaN ve sonsuz köşeler atılır', () => {
    expect(prepareVerts([NaN, 0, 0, 1, 1, 1, Infinity, 0, 0]).rawCount).toBe(1)
  })

  it('tek noktalı model bölme hatası vermez', () => {
    expect(() => prepareVerts([5, 5, 5])).not.toThrow()
  })
})
