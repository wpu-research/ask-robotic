// İngilizce parça metinleri (hyvex-parcalar.en.json) ve seviye/kit çevirileri: eşlik ve Türkçe harf kalmaması.
import { describe, expect, it } from 'vitest'
import { ENG_PARTS, LEVELS, groupName, offlineText, partText } from './catalog'
import { KITS, kitText } from './kits'

const TR = /[ğşıİçöüĞŞÇÖÜ]/
describe('mühendislik yolu İngilizcesi', () => {
  it('her parçanın İngilizce metni var, madde sayıları aynı, Türkçe harf yok', () => {
    for (const p of ENG_PARTS) {
      const e = partText(p, 'en'), t = partText(p, 'tr')
      expect(e, p.slug).not.toBe(t)
      expect([e.specs.length, e.uses.length, e.warnings.length], p.slug).toEqual([p.specs.length, p.uses.length, p.warnings.length])
      expect(JSON.stringify(e), p.slug).not.toMatch(TR)
      if (p.offline) expect(offlineText(p.offline, 'en')).not.toMatch(TR)
      expect(groupName(p.group, 'en')).not.toMatch(TR)
    }
  })
  it('seviyeler ve kitler İngilizce', () => {
    for (const l of LEVELS) expect(JSON.stringify(l.en), `seviye ${l.n}`).not.toMatch(TR)
    for (const [k, kit] of Object.entries(KITS)) expect(JSON.stringify(kitText(kit, 'en')), k).not.toMatch(/[ğşıİçĞŞÇ]/)
  })
})
