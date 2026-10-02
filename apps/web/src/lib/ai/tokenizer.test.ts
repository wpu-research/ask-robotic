import { describe, expect, it } from 'vitest'
import { encode, fitWindow, getBpe, pretokenize, tokenStats, trainBpe } from './tokenizer'

describe('BPE', () => {
  it('ön-parçalama: kelimeler ▁ alır, noktalama tek başınadır', () => {
    expect(pretokenize('Robot, durur.')).toEqual(['▁Robot', ',', '▁durur', '.'])
  })
  it('0 birleştirmede her karakter ayrı token olur', () => {
    expect(encode('robot', getBpe('tr'), 0)).toEqual(['▁', 'r', 'o', 'b', 'o', 't'])
  })
  it('eğitim en sık çifti birleştirir: "aaab aaab" için ilk birleşme a+a', () => {
    const b = trainBpe('aaab aaab aaab', 1)
    expect(b.merges[0]).toEqual(['a', 'a'])
  })
  it('birleştirme sayısı arttıkça token sayısı azalır (azalmayan olmaz)', () => {
    const t = 'robot duvarı görür ve sağa döner'
    let prev = Infinity
    for (const m of [0, 10, 30, 60, 120]) { const c = encode(t, getBpe('tr'), m).length; expect(c).toBeLessThanOrEqual(prev); prev = c }
    expect(prev).toBeLessThan(encode(t, getBpe('tr'), 0).length / 3)
  })
  it('kodlama kayıpsızdır: parçalar birleşince metin geri gelir', () => {
    const t = 'Robot engeli görür ve durur.'
    const back = encode(t, getBpe('tr'), 80).join('').replaceAll('▁', ' ').trim()
    expect(back.replace(/\s/g, '')).toBe(t.replace(/\s/g, ''))
  })
  it('Türkçe derlem Türkçe metni İngilizce derlemden daha az token ile kodlar', () => {
    const t = 'robot duvarı görür ve sağa döner'
    expect(encode(t, getBpe('tr'), 60).length).toBeLessThan(encode(t, getBpe('en'), 60).length)
  })
  it('bağlam penceresi en eski token\'ları dışarıda bırakır', () => {
    expect(fitWindow(['a', 'b', 'c', 'd'], 3)).toEqual({ kept: ['b', 'c', 'd'], dropped: ['a'] })
    expect(fitWindow(['a', 'b'], 0)).toEqual({ kept: ['a', 'b'], dropped: [] })
  })
  it('istatistik', () => {
    const s = tokenStats('ab cd', 'tr', 0)
    expect(s.chars).toBe(4)
    expect(s.bytes).toBe(5)
  })
})
