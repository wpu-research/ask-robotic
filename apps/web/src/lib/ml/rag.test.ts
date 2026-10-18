// RAG: TF-IDF + kosinüs ile her örnek soru için doğru kılavuz parçası ilk k içinde (sahne aynı fonksiyonları kullanır).
import { describe, expect, it } from 'vitest'
import { CHUNKS, IDF, QUESTIONS, RAG, VOCAB, sims, topK } from './rag'

describe('RAG', () => {
  it('kareler ve kod satırları tutarlı', () => {
    for (let q = 1; q <= QUESTIONS.length; q++) for (const k of [1, 3, 5]) {
      const F = RAG.run({ q, k })
      expect(F.length).toBeGreaterThanOrEqual(60)
      for (const f of F) expect(f.line).toBeLessThan(RAG.code.length)
    }
  })
  it('12 parça; nadir terimin IDF’i sık terimden büyük', () => {
    expect(CHUNKS).toHaveLength(12)
    expect(IDF[VOCAB.indexOf('e12')]).toBeGreaterThan(IDF[VOCAB.indexOf('battery')])
  })
  it('k = 3: her örnek soru için doğru parça ilk 3 içinde; ilk 6 soruda birinci', () => {
    const ranks = QUESTIONS.map((q) => topK(sims(q.terms), CHUNKS.length).indexOf(q.gold) + 1)
    console.log('ranks', ranks.join(' '))
    for (const q of QUESTIONS) expect(topK(sims(q.terms), 3)).toContain(q.gold)
    expect(ranks.slice(0, 6)).toEqual([1, 1, 1, 1, 1, 1])
    const last = RAG.run({ q: 1, k: 3 }).at(-1)!
    expect(last.ranks).toEqual(ranks)
  })
  it('soru 1: Python ile aynı benzerlikler (parça 1, 2, 3 → 0,65, 0,46, 0,44)', () => {
    const s = sims(QUESTIONS[0].terms)
    expect(topK(s, 3)).toEqual([0, 1, 2])
    expect(s[0]).toBeCloseTo(0.65, 2); expect(s[1]).toBeCloseTo(0.46, 2); expect(s[2]).toBeCloseTo(0.44, 2)
  })
  it('kelime uyuşmazlığı (soru 7): k = 1 doğru parçayı kaçırır, k = 2 yakalar', () => {
    const q = QUESTIONS[6]
    expect(topK(sims(q.terms), 1)).not.toContain(q.gold)
    expect(topK(sims(q.terms), 2)).toContain(q.gold)
  })
})
