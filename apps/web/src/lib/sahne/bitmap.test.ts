import { describe, expect, it } from 'vitest'
import { floodFill, parseColor } from './bitmap'

const grid = (w: number, h: number): Uint8ClampedArray => new Uint8ClampedArray(w * h * 4)
const set = (d: Uint8ClampedArray, w: number, x: number, y: number, c: [number, number, number, number]) => d.set(c, (y * w + x) * 4)

describe('boya kovası', () => {
  it('boş alanı doldurur, çizgiyi aşmaz', () => {
    const w = 10, h = 10, d = grid(w, h)
    for (let y = 0; y < h; y++) set(d, w, 5, y, [0, 0, 0, 255]) // dikey siyah çizgi
    const n = floodFill(d, w, h, 1, 1, [255, 0, 0, 255])
    expect(n).toBe(50)
    expect(Array.from(d.slice((1 * w + 2) * 4, (1 * w + 2) * 4 + 4))).toEqual([255, 0, 0, 255])
    expect(Array.from(d.slice((1 * w + 8) * 4, (1 * w + 8) * 4 + 4))).toEqual([0, 0, 0, 0]) // öbür taraf boş
  })
  it('aynı renge doldurmak değişiklik yapmaz', () => {
    const w = 4, h = 4, d = grid(w, h)
    expect(floodFill(d, w, h, 0, 0, [255, 0, 0, 255])).toBe(16)
    expect(floodFill(d, w, h, 0, 0, [255, 0, 0, 255])).toBe(0)
  })
  it('sınır dışı tıklama 0 döndürür; renk ayrıştırma', () => {
    expect(floodFill(grid(2, 2), 2, 2, 5, 5, [1, 2, 3, 255])).toBe(0)
    expect(parseColor('#fb8c00')).toEqual([251, 140, 0, 255])
    expect(parseColor('#fff')).toEqual([255, 255, 255, 255])
    expect(parseColor('rgba(255,255,255,0.5)')[3]).toBe(128)
  })
})
