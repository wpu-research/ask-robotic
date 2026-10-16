import { describe, expect, it } from 'vitest'
import { BLOCKS, BLOCK_JSON, blockJsonFor, toolboxJson } from './blocks'
import { ASSET_NAME_EN, BLOCK_EN, OPTION_EN, oyunErrorText } from './i18n-en'
import { GALLERY } from './assets'
import { SAMPLES } from './samples'

const holes = (s: string) => [...s.matchAll(/\{([A-Z0-9_]+)\}/g)].map((m) => m[1]).sort()

describe('Oyun Atölyesi İngilizce görünüm', () => {
  it('her bloğun İngilizcesi var ve aynı girişleri kullanır', () => {
    for (const b of BLOCKS) {
      const en = BLOCK_EN[b.type]
      expect(en, b.type).toBeTruthy()
      expect(holes(en.msg), b.type).toEqual(holes(b.msg))
    }
  })
  it('İngilizce JSON tür ve alan değerlerini değiştirmez', () => {
    const en = blockJsonFor('en')
    expect(blockJsonFor('tr')).toBe(BLOCK_JSON)
    en.forEach((j, i) => {
      const tr = BLOCK_JSON[i]
      expect(j.type).toBe(tr.type)
      expect(j.args0.map((a) => a.name)).toEqual(expect.arrayContaining(tr.args0.map((a) => a.name)))
      for (const a of j.args0) if (a.type === 'field_dropdown' && Array.isArray(a.options)) {
        const trOpts = tr.args0.find((x) => x.name === a.name)!.options as unknown[][]
        expect((a.options as unknown[][]).map((o) => o[1])).toEqual(trOpts.map((o) => o[1]))
      }
    })
  })
  it('açılır liste etiketlerinin hepsi çevrilmiş', () => {
    const same = new Set(['Bonus', 'Sprite'])
    blockJsonFor('en').forEach((j, i) => {
      for (const a of j.args0) if (a.type === 'field_dropdown' && Array.isArray(a.options)) {
        const trOpts = BLOCK_JSON[i].args0.find((x) => x.name === a.name)!.options as unknown[][]
        ;(a.options as unknown[][]).forEach(([label], k) => {
          if (typeof label === 'string' && /[a-z]/i.test(label) && label.length > 1 && !/^[A-G]\d$/.test(label) && !same.has(label)) expect(label, `${j.type}.${a.name}`).not.toBe(trOpts[k][0])
        })
      }
    })
    expect(OPTION_EN.hepsi).toBe('any')
  })
  it('araç kutusu kategorileri dile göre', () => {
    const names = (l: 'tr' | 'en') => toolboxJson(undefined, l).contents.map((c) => c.name)
    expect(names('tr')).toContain('Hareket')
    expect(names('en')).toContain('Motion')
  })
  it('galeri ve örneklerin İngilizcesi var', () => {
    for (const a of GALLERY) expect(ASSET_NAME_EN[a.id], a.id).toBeTruthy()
    for (const s of SAMPLES) expect(s.en?.name, s.id).toBeTruthy()
  })
  it('hata iletileri çevrilir, Türkçede aynı kalır', () => {
    const m = "'kedi' adlı resim bulunamadı. Resim sekmesinden ekleyebilirsin."
    expect(oyunErrorText(m, 'tr')).toBe(m)
    expect(oyunErrorText(m, 'en')).toBe("Picture 'kedi' was not found. You can add it in the Pictures tab.")
  })
})
