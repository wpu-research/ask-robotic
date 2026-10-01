import { describe, expect, it } from 'vitest'
import { filterPalette, normTr, STATIC_ITEMS, type PaletteItem } from './command-palette'

const items: PaletteItem[] = [
  ...STATIC_ITEMS,
  { id: 'm:1', group: 'Modül', title: 'Modül 3: Arduino Temelleri', href: '/moduller/arduino-temelleri' },
  { id: 'l:1', group: 'Ders', title: 'Işık sensörü (LDR) ile gece lambası', subtitle: 'Arduino Temelleri › 5. hafta', href: '/ders/1' },
  { id: 'l:2', group: 'Ders', title: 'Röle ile lamba', href: '/ders/2' },
  { id: 'p:1', group: 'Parça', title: 'Röle', href: '/laboratuvar', keywords: 'rele anahtar kontak' },
]

describe('komut paleti süzgeci', () => {
  it('normTr Türkçe harfleri sadeleştirir', () => {
    expect(normTr('Işık İÇİN Şğüö')).toBe('isik icin sguo')
  })
  it('boş sorguda sayfa, araç ve modül öğeleri gelir; ders/parça gelmez', () => {
    const r = filterPalette(items, '')
    expect(r.some((i) => i.group === 'Ders' || i.group === 'Parça')).toBe(false)
    expect(r[0].group).toBe('Sayfa')
  })
  it('aksan ve büyük/küçük harf duyarsız eşleşir', () => {
    expect(filterPalette(items, 'ISIK').map((i) => i.id)).toEqual(['l:1'])
    expect(filterPalette(items, 'rele').map((i) => i.id)).toContain('p:1')
  })
  it('tüm sözcükler eşleşmeli', () => {
    expect(filterPalette(items, 'arduino lamba').map((i) => i.id)).toEqual(['l:1'])
    expect(filterPalette(items, 'xyz')).toEqual([])
  })
  it('başlık başı eşleşmesi öne geçer, gruplar bitişik ve sıralı', () => {
    const r = filterPalette(items, 'role')
    expect(r.map((i) => i.group)).toEqual(['Ders', 'Parça'])
    const l = filterPalette(items, 'lamba')
    expect(l.map((i) => i.id)).toEqual(['l:1', 'l:2'])
  })
  it('limit uygulanır', () => {
    expect(filterPalette(items, 'a', 2).length).toBeLessThanOrEqual(2)
  })
})
