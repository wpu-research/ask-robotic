import { describe, expect, it } from 'vitest'
import { RAG_GUIDE } from './corpus'
import { chunkWords, contextHas, runRag } from './rag'

describe('RAG', () => {
  it('parçalama: boyut ve örtüşme', () => {
    const t = Array.from({ length: 20 }, (_, i) => `k${i}`).join(' ')
    const c = chunkWords(t, 10, 5)
    expect(c.map((x) => x.startWord)).toEqual([0, 5, 10])
    expect(c[0]!.text.split(' ')).toHaveLength(10)
    expect(c[2]!.endWord).toBe(20)
    expect(chunkWords(t, 10, 0)).toHaveLength(2)
  })
  it('küçük parçalar daha çok parça verir', () => {
    expect(chunkWords(RAG_GUIDE, 15, 0).length).toBeGreaterThan(chunkWords(RAG_GUIDE, 60, 0).length)
  })
  it('getirme: soru doğru parçayı üst sıraya koyar', () => {
    const r = runRag(RAG_GUIDE, 'Proje teslimi ne zaman?', { size: 20, overlap: 5, topK: 1 })
    expect(contextHas(r, 'son cuma')).toBe(true)
    expect(r.retrieved).toHaveLength(1)
    expect(r.prompt).toContain('Soru: Proje teslimi ne zaman?')
  })
  it('şablon çıktı etiketlidir ve model olduğunu iddia etmez', () => {
    const r = runRag(RAG_GUIDE, 'Mentörler ne kadar sürede yanıt verir?', { size: 30, overlap: 5, topK: 2 })
    expect(r.template.label).toMatch(/gerçek bir model olurdu/)
    expect(r.template.sentence).toContain('iki gün')
  })
  it('alakasız soruda parça getirilmez', () => {
    const r = runRag(RAG_GUIDE, 'zzzz qqqq', { size: 30, overlap: 5, topK: 2 })
    expect(r.retrieved).toHaveLength(0)
    expect(r.template.sentence).toBeNull()
  })
})
