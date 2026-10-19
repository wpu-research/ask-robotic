// Boruta: gölge kopyalara karşı isabet sayımıyla gerçek 3 sensör kabul edilir, gürültü sensörlerinin çoğu reddedilir.
import { describe, expect, it } from 'vitest'
import { BORUTA, REAL, boruta, tails } from './boruta'

describe('Boruta', () => {
  it('kareler geçerli ve hızlı', () => {
    for (const rounds of [3, 20]) {
      const t0 = performance.now()
      const F = BORUTA.run({ rounds })
      expect(performance.now() - t0).toBeLessThan(rounds === 20 ? 1600 : 600)
      expect(F.length).toBeGreaterThan(3)
      for (const f of F) expect(f.line).toBeLessThan(BORUTA.code.length)
    }
  })
  it('20 turda gerçek 3 sensör (akım, titreşim, sıcaklık) kabul, gürültü sensörlerinin çoğu ret', () => {
    const { hits, status } = boruta(20)
    console.log('boruta isabet', hits.join(' '), 'karar', status.join(' '))
    for (const j of REAL) { expect(status[j]).toBe(1); expect(hits[j]).toBeGreaterThanOrEqual(17) }
    const noise = [0, 1, 2, 3, 4, 5, 6, 7].filter((j) => !REAL.includes(j))
    expect(noise.filter((j) => status[j] === -1).length).toBeGreaterThanOrEqual(4)
    expect(noise.every((j) => status[j] !== 1)).toBe(true)
    expect(BORUTA.run({ rounds: 20 }).at(-1)!.cap[0]).toBe('kabul: akım, titreşim, sıcaklık')
  })
  it('çok az turda (5) karar verilemez: binom testi 5/5 için bile p = 1/32 > 0,01', () => {
    expect(tails(5, 5).up).toBeCloseTo(1 / 32, 12)
    expect(boruta(5).status.every((s) => s === 0)).toBe(true)
  })
})
