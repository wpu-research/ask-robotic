import { describe, expect, it } from 'vitest'
import { contentBox, costumeQuad, fenceDelta, flipShape, hitShape, normDir, pointInQuad, quadBox, quadsOverlap, topShapeAt, touchesEdge, translateShape } from './geometry'
import { newProject, spriteFromGallery } from './project'
import type { Costume, Shape } from './types'

const box = (w = 40, h = 20): Costume => ({ id: 'c', name: 'c', w: 100, h: 100, shapes: [{ t: 'rect', x: 50 - w / 2, y: 50 - h / 2, w, h, f: '#000', s: null, sw: 0 }] })
const pose = (x = 0, y = 0, dir = 90, size = 100) => ({ x, y, dir, size, rotationStyle: 'all' as const })

describe('geometri', () => {
  it('yönü (-180, 180] aralığına getirir', () => {
    expect(normDir(270)).toBe(-90); expect(normDir(-190)).toBe(170); expect(normDir(180)).toBe(180); expect(normDir(-180)).toBe(180); expect(normDir(NaN)).toBe(90)
  })
  it('kostüm sınırı içeriğe göre; boş kostüm küçük kutu', () => {
    expect(contentBox(box(40, 20))).toEqual({ x0: 30, y0: 40, x1: 70, y1: 60 })
    expect(contentBox({ id: 'e', name: 'e', w: 96, h: 96, shapes: [] }).x1 - 46).toBeLessThan(5)
  })
  it('dörtgen: boyut ve dönme', () => {
    const q = quadBox(costumeQuad(box(40, 20), pose(10, 5)))
    expect(q.l).toBeCloseTo(-10); expect(q.r).toBeCloseTo(30); expect(q.b).toBeCloseTo(-5); expect(q.t).toBeCloseTo(15)
    const big = quadBox(costumeQuad(box(40, 20), pose(0, 0, 90, 200)))
    expect(big.r - big.l).toBeCloseTo(80)
    const rot = quadBox(costumeQuad(box(40, 20), pose(0, 0, 180))) // 90 derece döndü: genişlik <-> yükseklik
    expect(rot.r - rot.l).toBeCloseTo(20); expect(rot.t - rot.b).toBeCloseTo(40)
  })
  it('çarpışma (SAT) ve nokta', () => {
    const a = costumeQuad(box(), pose(0, 0)), b = costumeQuad(box(), pose(30, 0)), c = costumeQuad(box(), pose(60, 0))
    expect(quadsOverlap(a, b)).toBe(true)
    expect(quadsOverlap(a, c)).toBe(false)
    expect(pointInQuad(a, 5, 5)).toBe(true)
    expect(pointInQuad(a, 50, 5)).toBe(false)
    // 45 derece dönmüş ince çubuk köşegen komşuyu değmez
    const bar = costumeQuad(box(80, 4), pose(0, 0, 45))
    expect(quadsOverlap(bar, costumeQuad(box(10, 10), pose(40, -40)))).toBe(false)
    expect(quadsOverlap(bar, costumeQuad(box(10, 10), pose(20, 20)))).toBe(true)
  })
  it('kenara değme ve çit', () => {
    expect(touchesEdge(costumeQuad(box(), pose(230, 0)))).toBe(true)
    expect(touchesEdge(costumeQuad(box(), pose(0, 0)))).toBe(false)
    const out = costumeQuad(box(), pose(900, 0))
    expect(fenceDelta(out).dx).toBeLessThan(-600)
    expect(fenceDelta(costumeQuad(box(), pose(0, 0)))).toEqual({ dx: 0, dy: 0 })
  })
  it('şekil vuruş testi, taşıma ve çevirme', () => {
    const rect: Shape = { t: 'rect', x: 10, y: 10, w: 20, h: 20, f: '#f00', s: null, sw: 0 }
    const ring: Shape = { t: 'ellipse', cx: 60, cy: 60, rx: 20, ry: 20, f: null, s: '#000', sw: 4 }
    const line: Shape = { t: 'path', pts: [0, 0, 50, 0], c: '#000', w: 4 }
    expect(hitShape(rect, 20, 20)).toBe(true); expect(hitShape(rect, 50, 20)).toBe(false)
    expect(hitShape(ring, 60, 60)).toBe(false) // içi boş
    expect(hitShape(ring, 80, 60)).toBe(true)
    expect(hitShape(line, 25, 2)).toBe(true); expect(hitShape(line, 25, 20)).toBe(false)
    expect(topShapeAt([rect, ring], 20, 20)).toBe(0); expect(topShapeAt([rect, ring], 200, 200)).toBe(-1)
    expect(translateShape(rect, 5, 6)).toMatchObject({ x: 15, y: 16 })
    expect(flipShape(rect, 100, 100, 'h')).toMatchObject({ x: 70, y: 10 })
    expect(flipShape(line, 100, 100, 'v')).toMatchObject({ pts: [0, 100, 50, 100] })
  })
  it('galeri karakteri gerçek bir sınır kutusu verir', () => {
    const s = spriteFromGallery('kedi')
    const b = contentBox(s.costumes[0])
    expect(b.x1 - b.x0).toBeGreaterThan(40); expect(b.y1 - b.y0).toBeGreaterThan(50)
    void newProject
  })
})
