// Rastgele orman: 25 ağaçlı orman, tek ağaçtan test doğruluğunda daha iyi; ağaçlar gerçekten birbirinden farklı.
import { describe, expect, it } from 'vitest'
import { RASTGELE_ORMAN, buildForest, forestVote, treeP } from './rastgele-orman'
import { rng } from './core'

describe('rastgele orman', () => {
  it('kare sayısı ve kod satırları', () => {
    for (const trees of [1, 25]) {
      const f = RASTGELE_ORMAN.run({ trees })
      expect(f.length).toBeGreaterThan(3)
      for (const x of f) expect(x.line).toBeLessThan(RASTGELE_ORMAN.code.length)
    }
    for (const [c] of RASTGELE_ORMAN.code) expect(c.length).toBeLessThanOrEqual(60)
  })
  it('25 ağaçlı orman tek ağaçtan test doğruluğunda en az 4 puan iyi', () => {
    const { acc, trees, T } = buildForest(25)
    console.log('orman', acc.map((a) => a.toFixed(3)).join(' '))
    expect(acc[24]).toBeGreaterThan(acc[0] + 0.04)
    // ortalama tek ağaçtan da iyi (yalnız ilk ağaç şanssız diye değil)
    const single = trees.map((t) => T.filter((q) => (treeP(t, q.x, q.y) > 0.5 ? 1 : 0) === q.c).length / T.length)
    const avg = single.reduce((a, b) => a + b, 0) / single.length
    expect(acc[24]).toBeGreaterThan(avg + 0.03)
    // sahnedeki son kare aynı sayıyı gösterir
    expect(RASTGELE_ORMAN.run({ trees: 25 }).at(-1)!.cap[0]).toContain(`%${(acc[24] * 100).toFixed(1).replace('.', ',')}`)
  })
  it('oylama: forestVote ile hesaplanan doğruluk acc dizisiyle aynı', () => {
    const { acc, trees, T } = buildForest(5)
    const ok = T.filter((q) => (forestVote(trees, 5, q.x, q.y) > 0.5 ? 1 : 0) === q.c).length / T.length
    expect(ok).toBeCloseTo(acc[4], 10)
  })
  it('torbalar farklı: ağaçlar aynı noktada farklı oy verir', () => {
    const { trees } = buildForest(25)
    const r = rng(9)
    let disagree = 0
    for (let i = 0; i < 300; i++) {
      const x = 12 * r(), y = 20 + 70 * r()
      const v = forestVote(trees, 25, x, y)
      if (v > 0 && v < 1) disagree++
    }
    expect(disagree).toBeGreaterThan(60)
  })
})
