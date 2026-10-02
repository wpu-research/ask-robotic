import { describe, expect, it } from 'vitest'
import { emptyProject, ensureTile, exportProject, imagesUsedByBlocks, newMap, parseProject, removeTileEntry, resizeMap, setCell, slugify, uniqueImageId, validateProject, withGalleryImages } from './project'
import { SAMPLES } from './samples'
import { b, program, set } from './dsl'

describe('proje', () => {
  it('dışa aktarılan JSON yeniden içe aktarılınca aynıdır (tüm örnekler)', () => {
    for (const s of SAMPLES) {
      const p = s.project()
      const back = parseProject(exportProject(p))
      expect(back, s.id).not.toBeNull()
      expect(back!.maps, s.id).toEqual(p.maps)
      expect(back!.images, s.id).toEqual(p.images)
      expect(back!.blocks.blocks?.blocks?.length, s.id).toBe(p.blocks.blocks?.blocks?.length)
    }
  })

  it('bozuk veri reddedilir', () => {
    expect(parseProject('{')).toBeNull()
    expect(parseProject('{"version":2}')).toBeNull()
    expect(validateProject(null)).toBeNull()
    const ok = emptyProject()
    expect(validateProject({ ...ok, images: { 'BÜYÜK': { rows: ['0'] } } })).toBeNull()
    expect(validateProject({ ...ok, images: { a: { rows: ['0z'] } } })).toBeNull()
    expect(validateProject({ ...ok, maps: [{ name: 'm', cols: 2, rows: 2, cells: ['..'] }] })).toBeNull()
    expect(validateProject({ ...ok, blocks: { blocks: { blocks: [{ notype: 1 }] } } })).toBeNull()
    expect(validateProject({ ...ok, tileset: [{ image: 'x' }] })).toBeNull()
    expect(parseProject('x'.repeat(3_000_000))).toBeNull()
  })

  it('geçerli ama fazlalıklı veri temizlenir', () => {
    const p = validateProject({ ...emptyProject(), junk: 1, name: 'x'.repeat(200) }) as unknown as Record<string, unknown>
    expect('junk' in p).toBe(false)
    expect((p.name as string).length).toBe(60)
  })

  it('resim kimlikleri: slug ve benzersizlik', () => {
    expect(slugify('Çılgın Kedi!')).toBe('cilgin-kedi')
    expect(slugify('???')).toBe('resim')
    expect(uniqueImageId({ kedi: 1, 'kedi-2': 1 }, 'Kedi')).toBe('kedi-3')
  })

  it('blokların kullandığı resimler bulunur ve galeriden tamamlanır', () => {
    const p = { ...emptyProject(), blocks: program([b('oyun_baslangic', {}, set('a', b('sprite_yeni', { IMG: 'oyuncu-kedi', K: 'oyuncu' })))]) }
    expect(imagesUsedByBlocks(p.blocks)).toEqual(['oyuncu-kedi'])
    expect(Object.keys(withGalleryImages(p).images)).toEqual(['oyuncu-kedi'])
  })

  it('karo takımı ve harita düzenleme', () => {
    const p = emptyProject()
    expect(ensureTile(p, 'karo-tas', true)).toBe(0)
    expect(ensureTile(p, 'nesne-altin')).toBe(1)
    expect(ensureTile(p, 'karo-tas')).toBe(0)
    let m = newMap('m', 5, 3)
    m = setCell(m, 1, 1, '1'); m = setCell(m, 2, 1, '2'); m = setCell(m, 99, 1, '2')
    expect(m.cells[1]).toBe('.12..')
    const small = resizeMap(m, 3, 2)
    expect([small.cols, small.rows, small.cells[1]]).toEqual([3, 2, '.12'])
    const big = resizeMap(m, 7, 4)
    expect(big.cells[1]).toBe('.12....')
    expect(big.cells[3]).toBe('.......')
    // takımdan silince hücreler yeniden numaralanır
    const q = removeTileEntry({ ...p, maps: [m] }, 0)
    expect(q.tileset.map((t) => t.image)).toEqual(['nesne-altin'])
    expect(q.maps[0].cells[1]).toBe('..1..')
  })
})
