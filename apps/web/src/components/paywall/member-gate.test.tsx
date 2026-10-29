import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { FreeBadge, GuestBar } from './member-gate'

const html = (n: React.ReactElement) => renderToString(n).replaceAll('&quot;', '"').replaceAll('<!-- -->', '')

describe('member-gate', () => {
  it('FreeBadge: metin verilince kampanya rozeti, boşken (kontenjan doldu) hiçbir şey', () => {
    expect(html(<FreeBadge text="İlk 1000 kayda 6 ay Premium ücretsiz — kalan: 12" />)).toContain('İlk 1000 kayda 6 ay Premium ücretsiz — kalan: 12')
    expect(html(<FreeBadge text={null} />)).toBe('')
  })
  it('GuestBar: misafir notu, rozet ve kayıt bağlantısı (dönüş adresi kodlanır)', () => {
    const h = html(<GuestBar next="/ders/7" promo="İlk 1000 kayda 6 ay Premium ücretsiz — kalan: 12" />)
    expect(h).toContain('Misafir olarak bakıyorsun.')
    expect(h).toContain('İlk 1000 kayda 6 ay Premium ücretsiz')
    expect(h).toContain('href="/kayit?next=%2Fders%2F7"')
  })
  it('GuestBar: dış adrese dönüş verilemez', () => {
    expect(html(<GuestBar next="//evil.com" />)).toContain('href="/kayit?next=%2F"')
  })
})
