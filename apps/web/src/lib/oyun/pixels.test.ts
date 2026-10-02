import { describe, expect, it } from 'vitest'
import { blank, floodFill, flipH, flipV, get, isValidRows, line, mirrorRows, opaqueBounds, parse, rotateCW, set, shift, toRows } from './pixels'
import { PALETTE, colorIndex } from './palette'
import { drawText, textWidth, upper, wrapText } from './font'

describe('piksel işlemleri', () => {
  it('ayrıştır ↔ satırlar gidiş-dönüş', () => {
    const rows = ['0123', 'abcd', '....', 'f..0']
    expect(toRows(parse(rows))).toEqual(rows)
    expect(isValidRows(rows)).toBe(true)
    expect(isValidRows(['01', '012'])).toBe(false)
    expect(isValidRows(['0z'])).toBe(false)
    expect(isValidRows([])).toBe(false)
  })

  it('boya kovası bitişik alanı doldurur, çapraz sızmaz', () => {
    const p = parse(['..0.', '..0.', '000.', '....'])
    floodFill(p, 0, 0, 5)
    expect(toRows(p)).toEqual(['55 0.'.replace(' ', ''), '550.', '000.', '....'].map((r, i) => (i === 0 ? '550.' : r)))
    floodFill(p, 3, 3, 2)
    expect(get(p, 3, 0)).toBe(2)
    expect(get(p, 0, 3)).toBe(2)
  })

  it('aynala, döndür, kaydır', () => {
    const p = parse(['01.', '...', '...'])
    expect(toRows(flipH(p))[0]).toBe('.10')
    expect(toRows(flipV(p))[2]).toBe('01.')
    expect(toRows(rotateCW(p))[0]).toBe('..0')
    expect(toRows(rotateCW(p))[1]).toBe('..1')
    expect(toRows(shift(p, 1, 0))[0]).toBe('.01')
    const q = rotateCW(rotateCW(rotateCW(rotateCW(p))))
    expect(toRows(q)).toEqual(toRows(p))
  })

  it('çizgi, sınır kutusu ve aynalı yarı', () => {
    expect(line(0, 0, 3, 3)).toEqual([[0, 0], [1, 1], [2, 2], [3, 3]])
    expect(line(0, 0, 0, 0)).toEqual([[0, 0]])
    const p = blank(4, 4); set(p, 1, 1, 3); set(p, 2, 2, 3)
    expect(opaqueBounds(p)).toEqual({ x: 1, y: 1, w: 2, h: 2 })
    expect(mirrorRows(['01', '..'])).toEqual(['0110', '....'])
  })

  it('palet: 16 renk, en yakın renk eşleme', () => {
    expect(PALETTE).toHaveLength(16)
    expect(new Set(PALETTE.map((c) => c.hex)).size).toBe(16)
    expect(colorIndex('#d6335a')).toBe(2)
    expect(colorIndex('#d6335b')).toBe(2)
    expect(colorIndex(18)).toBe(2)
    expect(colorIndex('zzz', 7)).toBe(7)
  })
})

describe('yazı tipi', () => {
  it('Türkçe harfleri büyütür ve çizer', () => {
    expect(upper('ığüşöçi')).toBe('IĞÜŞÖÇİ')
    const pts = new Set<string>()
    drawText('Ç', 0, 0, (x, y) => pts.add(`${x},${y}`))
    expect(pts.has('1,5')).toBe(true) // çengel aşağıda
    const o = new Set<string>()
    drawText('Ö', 0, 0, (x, y) => o.add(`${x},${y}`))
    expect(o.has('0,-1') && o.has('2,-1')).toBe(true) // noktalar yukarıda
    expect(textWidth('ABC')).toBe(11)
  })

  it('sözcük sınırından satır böler', () => {
    expect(wrapText('merhaba dünya nasılsın', 10)).toEqual(['merhaba', 'dünya', 'nasılsın'])
    expect(wrapText('', 10)).toEqual([''])
  })
})
