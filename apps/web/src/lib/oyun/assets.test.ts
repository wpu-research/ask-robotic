import { describe, expect, it } from 'vitest'
import { GALLERY, GALLERY_BY_ID, GALLERY_CATEGORIES, assetsValid, galleryImage, galleryOf, pickImages } from './assets'
import { opaqueBounds, parse } from './pixels'

describe('hazır resim galerisi', () => {
  it('en az 40 resim, 5 kategori, kimlikler benzersiz ve geçerli', () => {
    expect(GALLERY.length).toBeGreaterThanOrEqual(40)
    expect(new Set(GALLERY.map((a) => a.id)).size).toBe(GALLERY.length)
    expect(assetsValid()).toEqual([])
    for (const c of GALLERY_CATEGORIES) expect(galleryOf(c).length, c).toBeGreaterThanOrEqual(5)
    for (const a of GALLERY) expect(a.id, a.id).toMatch(/^[a-z0-9][a-z0-9-]*$/)
  })

  it('boyutlar 8x8, 16x16 ya da geniş birkaç özel resim; hepsi boş değil', () => {
    for (const a of GALLERY) {
      const p = parse(a.rows)
      expect(p.w <= 32 && p.h <= 32, a.id).toBe(true)
      const bb = opaqueBounds(p)
      expect(bb.w * bb.h, a.id).toBeGreaterThan(8)
      if (a.category === 'karo') expect([p.w, p.h], a.id).toEqual([16, 16])
    }
  })

  it('oyuncu, düşman, yiyecek, nesne ve karo örnekleri var', () => {
    for (const id of ['oyuncu-kedi', 'dusman-hayalet', 'yiyecek-elma', 'nesne-altin', 'karo-cimen']) expect(GALLERY_BY_ID[id], id).toBeTruthy()
  })

  it('galleryImage kopya döndürür; bilinmeyen kimlik hata verir', () => {
    const a = galleryImage('oyuncu-kedi')
    a.rows[0] = 'xxxxxxxxxxxxxxxx'
    expect(galleryImage('oyuncu-kedi').rows[0]).not.toBe('xxxxxxxxxxxxxxxx')
    expect(() => galleryImage('yok')).toThrow()
    expect(Object.keys(pickImages(['oyuncu-kedi', 'karo-su']))).toEqual(['oyuncu-kedi', 'karo-su'])
  })
})
