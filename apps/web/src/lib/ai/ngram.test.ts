import { describe, expect, it } from 'vitest'
import { defaultModel, distribution, entropyBits, generate, nextCounts, softmax, trainNgram } from './ngram'

describe('n-gram + softmax', () => {
  const m = trainNgram('a b c .\na b d .\na b c .')
  it('sayımlar derlemden gelir', () => {
    expect(nextCounts(m, ['a', 'b'], 2).counts.get('c')).toBe(2)
    expect(nextCounts(m, ['a', 'b'], 2).counts.get('d')).toBe(1)
    expect(nextCounts(m, ['b'], 1).counts.get('c')).toBe(2)
  })
  it('bilinmeyen bağlamda geri çekilir; nokta sonrası cümle başı', () => {
    expect(nextCounts(m, ['zzz'], 2).usedOrder).toBe(0)
    expect(nextCounts(m, ['a', 'b', 'c', '.'], 2).counts.get('a')).toBe(3)
  })
  it('T=1 iken olasılık göreli sıklıktır', () => {
    const d = distribution(new Map([['x', 3], ['y', 1]]), 1)
    expect(d[0]!.p).toBeCloseTo(0.75, 10)
    expect(d[1]!.p).toBeCloseTo(0.25, 10)
  })
  it('softmax toplamı 1; düşük T keskinleştirir, yüksek T düzleştirir', () => {
    const l = Math.log
    const cold = softmax([l(3), l(1)], 0.3), warm = softmax([l(3), l(1)], 1), hot = softmax([l(3), l(1)], 3)
    for (const p of [cold, warm, hot]) expect(p[0]! + p[1]!).toBeCloseTo(1, 10)
    expect(cold[0]!).toBeGreaterThan(warm[0]!)
    expect(hot[0]!).toBeLessThan(warm[0]!)
    expect(softmax([l(3), l(1)], 0)).toEqual([1, 0])
  })
  it('entropi sıcaklıkla artar', () => {
    const c = defaultModel().bi.get('robot')!
    expect(entropyBits(distribution(c, 2))).toBeGreaterThan(entropyBits(distribution(c, 1)))
    expect(entropyBits(distribution(c, 1))).toBeGreaterThan(entropyBits(distribution(c, 0.2)))
  })
  it('üretim aynı tohumla aynı, farklı tohumla (çoğunlukla) farklı', () => {
    const a = generate(defaultModel(), 'robot', 12, 1, 2, 5).words, b = generate(defaultModel(), 'robot', 12, 1, 2, 5).words
    expect(a).toEqual(b)
    const outs = new Set([1, 2, 3, 4, 5, 6].map((s) => generate(defaultModel(), 'robot', 12, 1, 2, s).words.join(' ')))
    expect(outs.size).toBeGreaterThan(3)
  })
  it('T=0 her zaman aynı (en olası) yolu izler', () => {
    const outs = new Set([1, 2, 3].map((s) => generate(defaultModel(), 'robot', 6, 0, 2, s).words.join(' ')))
    expect(outs.size).toBe(1)
  })
})
