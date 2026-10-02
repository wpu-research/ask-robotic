import { describe, expect, it } from 'vitest'
import { DOCS_ROBOT } from './corpus'
import { cosine, rank, sharedTerms, vectorize, idfTable } from './embedding'

describe('metin vektörleri', () => {
  it('kosinüs: aynı vektör 1, ortak terimsiz 0', () => {
    expect(cosine(new Map([['a', 1], ['b', 2]]), new Map([['a', 2], ['b', 4]]))).toBeCloseTo(1, 10)
    expect(cosine(new Map([['a', 1]]), new Map([['b', 1]]))).toBe(0)
    expect(cosine(new Map(), new Map([['b', 1]]))).toBe(0)
  })
  it('elle hesap: [1,1] ile [1,0] arası kosinüs = 1/√2', () => {
    expect(cosine(new Map([['x', 1], ['y', 1]]), new Map([['x', 1]]))).toBeCloseTo(Math.SQRT1_2, 10)
  })
  it('sorgu doğru belgeyi bulur', () => {
    expect(rank('ses dalgası', DOCS_ROBOT, 'tfidf')[0]!.item.id).toBe('d2')
    expect(rank('robot sensör verisi', DOCS_ROBOT, 'tfidf')[0]!.item.id).toBe('d6')
    expect(rank('potansiyometre direnci', DOCS_ROBOT, 'sayim')[0]!.item.id).toBe('d5')
  })
  it('eş anlamlı ama ortak kelimesiz sorgu hiçbir şey bulamaz (yöntemin sınırı)', () => {
    expect(rank('uzaklığı nasıl bulur', DOCS_ROBOT, 'tfidf')[0]!.score).toBe(0)
  })
  it('TF-IDF nadir terime daha çok ağırlık verir', () => {
    const idf = idfTable(DOCS_ROBOT)
    expect(idf.table.get('servo')!).toBeGreaterThan(idf.table.get('sensö') ?? 0)
    expect(vectorize('servo', 'tfidf', idf).get('servo')).toBeCloseTo(idf.table.get('servo')!, 10)
  })
  it('ortak terimler listelenir', () => { expect(sharedTerms('ses dalgası nedir', DOCS_ROBOT[1]!.text)).toEqual(['ses', 'dalga']) })
})
