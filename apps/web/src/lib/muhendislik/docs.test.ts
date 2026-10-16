// Parça açıklamaları: 128 parçanın hepsinde TR/EN "nedir / nasıl çalışır / ne zaman" ve https datasheet bağlantıları.
import { describe, expect, it } from 'vitest'
import { ENG_PARTS } from './catalog'
import { docOf } from './docs'

describe('parça belgeleri', () => {
  it('her parçada iki dilde açıklama var', () => {
    for (const p of ENG_PARTS) {
      const d = docOf(p.slug)
      expect(d, p.slug).toBeTruthy()
      for (const l of ['tr', 'en'] as const) for (const k of ['what', 'how', 'choose'] as const) {
        expect(d![l][k].length, `${p.slug} ${l}.${k}`).toBeGreaterThan(30)
        expect(d![l][k], `${p.slug} ${l}.${k}`).not.toContain('—')
      }
    }
  })
  it('bağlantılar https ve türü geçerli; parçaların çoğunda en az bir belge', () => {
    let withLink = 0
    for (const p of ENG_PARTS) {
      const d = docOf(p.slug)!
      if (d.datasheets.length) withLink++
      for (const l of d.datasheets) { expect(l.url, p.slug).toMatch(/^https:\/\//); expect(['datasheet', 'reference', 'product']).toContain(l.kind) }
    }
    expect(withLink).toBeGreaterThan(115)
  })
})
