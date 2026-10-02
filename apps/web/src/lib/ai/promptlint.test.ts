import { describe, expect, it } from 'vitest'
import { RULES, checkJson, lintPrompt, onTopic } from './promptlint'

describe('prompt denetleyici (kural tabanlı)', () => {
  it('ağırlıklar 100 eder', () => { expect(RULES.reduce((s, r) => s + r.weight, 0)).toBe(100) })
  it('boş ve çok kısa istem düşük puan alır', () => {
    expect(lintPrompt('').score).toBe(0)
    const k = lintPrompt('Özetle.')
    expect(k.tooShort).toBe(true)
    expect(k.score).toBeLessThanOrEqual(30)
  })
  it('eksiksiz istem 100 alır', () => {
    const p = 'Sen deneyimli bir robotik öğretmenisin. Aşağıdaki duyuruyu 13 yaşındaki öğrenciler için özetle. Örnek: Girdi: Salı buluşuyoruz. Çıktı: Salı buluşma var. Özeti en fazla 3 madde olarak yaz.'
    const r = lintPrompt(p)
    expect(r.score).toBe(100)
    expect(r.missing).toHaveLength(0)
  })
  it('her kural ayrı ayrı tetiklenir', () => {
    expect(lintPrompt('Bu yazıyı sınıflandır lütfen şimdi hemen').rules.gorev).toBe(true)
    expect(lintPrompt('Sen bir uzman asistansın ve yardım edersin sana').rules.rol).toBe(true)
    expect(lintPrompt('Sen deneyimli bir mentörsün ve bana yardım edersin her zaman').rules.rol).toBe(true)
    expect(lintPrompt('Çıktıyı JSON olarak ver ve başka bir şey yazma').rules.bicim).toBe(true)
    expect(lintPrompt('Girdi: a Çıktı: b ve sonra devam et lütfen').rules.ornek).toBe(true)
    expect(lintPrompt('kedi köpek ağaç bahçe yol araba ev kapı pencere').rules.gorev).toBe(false)
  })
  it('puan, parça ekledikçe artar', () => {
    const a = lintPrompt('Bu metni özetle lütfen şimdi hemen yap').score
    const b = lintPrompt('Bu metni özetle lütfen şimdi hemen yap. Özeti en fazla 3 madde olarak yaz.').score
    expect(b).toBeGreaterThan(a)
  })
  it('konu denetimi', () => {
    expect(onTopic('ozet', 'duyuruyu özetle')).toBe(true)
    expect(onTopic('ozet', 'bir şiir yaz')).toBe(false)
    expect(onTopic('serbest', 'her şey')).toBe(true)
  })
  it('JSON denetimi', () => {
    expect(checkJson('{"duygu":"olumlu","konu":"ders"}', ['duygu', 'konu']).ok).toBe(true)
    expect(checkJson('{"duygu":"olumlu"}', ['duygu', 'konu']).error).toMatch(/konu/)
    expect(checkJson('olumlu', ['a']).ok).toBe(false)
    expect(checkJson('[1]', []).ok).toBe(false)
  })
})
