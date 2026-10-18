// Çöp toplama: işaretle-süpür tam olarak ulaşılamayanları siler (döngü dahil); referans sayımı döngüyü silemez.
import { describe, expect, it } from 'vitest'
import { COP_TOPLAMA, CYCLE, N, makeHeap, mark, reachable, refCount } from './cop-toplama'

describe('çöp toplama', () => {
  it('kareler: sayı > 3, her satır kodda var', () => {
    for (const seed of [1, 4, 13, 30]) {
      const F = COP_TOPLAMA.run({ seed })
      expect(F.length).toBeGreaterThan(3)
      for (const f of F) expect(f.line).toBeLessThan(COP_TOPLAMA.code.length)
    }
  })
  it('işaretle-süpür: ulaşılabilir her nesne kalır, ulaşılamayanlar (döngü dahil) silinir', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const g = makeHeap(seed)
      const reach = reachable(g)
      const { marked, garbage } = mark(g)
      for (let o = 0; o < N; o++) expect(marked[o], `seed ${seed} nesne ${o}`).toBe(reach.has(o))
      for (const o of CYCLE) expect(garbage).toContain(o)
      expect(garbage.length + reach.size).toBe(N)
    }
  })
  it('referans sayımı döngüyü silemez, sildiği her şey zaten çöptür', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const g = makeHeap(seed)
      const { garbage } = mark(g)
      const R = refCount(g)
      for (const o of CYCLE) { expect(R.dead[o]).toBe(false); expect(R.rc[o]).toBeGreaterThanOrEqual(1) }
      for (let o = 0; o < N; o++) if (R.dead[o]) expect(garbage).toContain(o)
      expect(R.dead.filter(Boolean).length).toBeLessThan(garbage.length)
    }
  })
  it('sahnenin son karesi: sızıntı = döngünün belleği', () => {
    const g = makeHeap(4)
    const last = COP_TOPLAMA.run({ seed: 4 }).at(-1)!
    const leakKb = mark(g).garbage.filter((o) => !refCount(g).dead[o]).reduce((s, o) => s + g.kb[o], 0)
    expect(leakKb).toBeGreaterThanOrEqual(CYCLE.reduce((s, o) => s + g.kb[o], 0))
    expect(last.stat![0]).toContain(`sızıntı ${leakKb} KB`)
  })
})
