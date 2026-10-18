// Mini dil modeli: hep aynı kelimeyle devam eden kelimede olasılık > %90; en olası mod döngüye girer; zar yeni cümleler yazar.
import { describe, expect, it } from 'vitest'
import { MINI_DIL_MODELI, N, SENTENCES, VOCAB, WORDS, ix, novelty, softmax, trainLm, write } from './mini-dil-modeli'

const def = Object.fromEntries(MINI_DIL_MODELI.params.map((p) => [p.key, p.value]))

describe('mini dil modeli', () => {
  it('kareler ve kod satırları tutarlı', () => {
    for (const mode of [0, 1]) {
      const F = MINI_DIL_MODELI.run({ ...def, mode })
      expect(F.length).toBeGreaterThan(3)
      for (const f of F) expect(f.line).toBeLessThan(MINI_DIL_MODELI.code.length)
    }
    for (const [c] of MINI_DIL_MODELI.code) expect(c.length).toBeLessThanOrEqual(60)
    expect(MINI_DIL_MODELI.code.length).toBeLessThanOrEqual(24)
  })
  it('korpus: 16 cümle, 105 kelime, 29 farklı; başta her kelime eşit (%3,4)', () => {
    expect(SENTENCES).toHaveLength(16)
    expect(WORDS).toHaveLength(105)
    expect(N).toBe(29)
    expect(MINI_DIL_MODELI.run(def)[3].probs[0]).toBeCloseTo(1 / 29, 12)
  })
  it('500 turdan sonra: günlükte hep aynı kelimeyle devam eden her kelimede o kelime > %90', () => {
    const { P } = trainLm(500)
    const next = new Map<string, Set<string>>()
    for (let k = 0; k + 1 < WORDS.length; k++) { const s = next.get(WORDS[k]) ?? new Set(); s.add(WORDS[k + 1]); next.set(WORDS[k], s) }
    const det = [...next].filter(([, s]) => s.size === 1)
    expect(det.length).toBeGreaterThanOrEqual(5)
    for (const [w, s] of det) expect(softmax(P[ix(w)])[ix([...s][0])], w).toBeGreaterThan(0.9)
    const q = softmax(P[ix('şarj')])[ix('istasyonuna')]
    console.log('şarj → istasyonuna', q.toFixed(4))
    expect(q).toBeGreaterThan(0.99)
    // birden çok devamı olan "robot" sonrasında hiçbir kelime %90'a ulaşmaz
    expect(Math.max(...softmax(P[ix('robot')]))).toBeLessThan(0.5)
  })
  it('hep en olası kelime: aynı cümle döngüsü', () => {
    const { P } = trainLm(500)
    const w = write(P, 30, 1, 1).map((o) => VOCAB[o.pick])
    const per = w.indexOf('.') + 1
    expect(per).toBeGreaterThan(1)
    for (let i = per; i < w.length; i++) expect(w[i]).toBe(w[i - per])
    expect(novelty(P, 1, 1).novel).toBe(0)
  })
  it('zarla yazılan cümlelerin bir kısmı (ama hepsi değil) günlükte yok', () => {
    const { P } = trainLm(500)
    const nv = novelty(P, def.seed, 0)
    console.log('yeni cümle oranı', nv.novel, '/', nv.n)
    expect(nv.n).toBeGreaterThanOrEqual(400)
    expect(nv.frac).toBeGreaterThan(0.3)
    expect(nv.frac).toBeLessThan(1)
    expect(MINI_DIL_MODELI.run(def).at(-1)!.cap[1]).toContain(`${(nv.frac * 100).toFixed(1)}%`)
  })
})
