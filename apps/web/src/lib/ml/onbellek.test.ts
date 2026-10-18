// Önbellek: LRU sırası ve atma doğru; önbellek büyüdükçe isabet oranı azalmaz; sahnedeki sayılar aynı kaynaktan.
import { describe, expect, it } from 'vitest'
import { ONBELLEK, REQS, avgMs, lru, walk } from './onbellek'

describe('önbellek (LRU)', () => {
  it('kareler: sayı > 3, her satır kodda var', () => {
    for (const size of [1, 4, 12]) {
      const F = ONBELLEK.run({ size })
      expect(F.length).toBeGreaterThan(3)
      expect(F.length).toBeLessThanOrEqual(400)
      for (const f of F) expect(f.line).toBeLessThan(ONBELLEK.code.length)
    }
  })
  it('LRU sırası: isabet başa taşır, ıska en eskiyi atar', () => {
    // A=0, B=1, C=2, D=3
    const s = lru([0, 1, 2, 0, 3, 1], 3).steps
    expect(s[2].slots).toEqual([2, 1, 0])
    expect(s[3]).toMatchObject({ hit: true, slots: [0, 2, 1] })
    expect(s[4]).toMatchObject({ hit: false, evicted: 1, slots: [3, 0, 2] })
    expect(s[5]).toMatchObject({ hit: false, evicted: 2, slots: [1, 3, 0] })
    for (const st of lru(walk(), 4).steps) expect(st.slots.length).toBeLessThanOrEqual(4)
  })
  it('isabet oranı boyutla azalmaz (birkaç yürüyüşte)', () => {
    for (const seed of [1, 2, 3, 7, 11]) {
      const w = walk(seed)
      let prev = -1
      for (let k = 1; k <= 16; k++) {
        const r = lru(w, k).rate
        expect(r).toBeGreaterThanOrEqual(prev)
        prev = r
      }
    }
  })
  it('yerellik: 4 karoluk önbellek gecikmeyi 80 ms’den ~30 ms’ye indirir; ıska sayısı ≥ farklı karo sayısı', () => {
    const w = walk()
    const r1 = lru(w, 1).rate, r4 = lru(w, 4).rate, r12 = lru(w, 12).rate
    console.log('isabet', r1.toFixed(2), r4.toFixed(2), r12.toFixed(2), 'ms', avgMs(r1).toFixed(1), avgMs(r4).toFixed(1), avgMs(r12).toFixed(1))
    expect(avgMs(r1)).toBeGreaterThan(45)
    expect(avgMs(r4)).toBeLessThan(36)
    expect(REQS - lru(w, 12).hits).toBeGreaterThanOrEqual(new Set(w).size)
    const last = ONBELLEK.run({ size: 4 }).at(-1)!
    expect(last.hits).toBe(lru(w, 4).hits)
    expect(last.curve[3]).toBe(r4)
  })
})
