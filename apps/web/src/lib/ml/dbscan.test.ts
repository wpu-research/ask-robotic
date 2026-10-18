// DBSCAN: doğru parametrelerle 3 nesneyi bulur, gürültünün çoğunu ayıklar; eps çok küçükken noktaların çoğu gürültü olur.
import { describe, expect, it } from 'vitest'
import { DBSCAN, NOISE_N, dbscan, warehouseScan } from './dbscan'
import { lloyd } from './kmeans'

/** Her gerçek nesnenin noktalarının en çok hangi kümeye düştüğü ve oranı. */
function purity(X: ReturnType<typeof warehouseScan>, label: number[]) {
  return [0, 1, 2].map((c) => {
    const ls = label.filter((_, i) => X[i].c === c)
    const cnt = new Map<number, number>()
    ls.forEach((l) => cnt.set(l, (cnt.get(l) ?? 0) + 1))
    const [best, n] = [...cnt.entries()].sort((a, b) => b[1] - a[1])[0]
    return { best, frac: n / ls.length }
  })
}

describe('DBSCAN', () => {
  it('kare sayısı ve kod satırları', () => {
    for (const p of [{ eps: 0.5, minPts: 5 }, { eps: 0.1, minPts: 5 }, { eps: 1.5, minPts: 2 }]) {
      const f = DBSCAN.run(p)
      expect(f.length).toBeGreaterThan(3)
      for (const x of f) expect(x.line).toBeLessThan(DBSCAN.code.length)
    }
    for (const [c] of DBSCAN.code) expect(c.length).toBeLessThanOrEqual(60)
  })
  it('eps = 0,5, minPts = 5: 3 küme, her nesne tek kümede, gerçek gürültünün çoğu gürültü', () => {
    const X = warehouseScan()
    const r = dbscan(X, 0.5, 5)
    expect(r.k).toBe(3)
    const pu = purity(X, r.label)
    expect(new Set(pu.map((q) => q.best)).size).toBe(3)
    for (const q of pu) { expect(q.best).toBeGreaterThanOrEqual(0); expect(q.frac).toBeGreaterThan(0.97) }
    const caught = r.label.slice(X.length - NOISE_N).filter((l) => l === -1).length
    console.log('dbscan', r.k, 'küme · gerçek gürültüden yakalanan', caught, '/', NOISE_N)
    expect(caught / NOISE_N).toBeGreaterThanOrEqual(0.7)
    expect(DBSCAN.run({ eps: 0.5, minPts: 5 }).at(-1)!.cap[0]).toMatch(/^3 küme/)
  })
  it('komşu parametrelerde de 3 küme (sonuç kırılgan değil)', () => {
    const X = warehouseScan()
    for (const [eps, mp] of [[0.45, 5], [0.55, 5], [0.5, 4], [0.5, 6]] as const) expect(dbscan(X, eps, mp).k, `${eps}/${mp}`).toBe(3)
  })
  it('eps çok küçük (0,1): noktaların çoğu gürültü', () => {
    const r = dbscan(warehouseScan(), 0.1, 5)
    const noise = r.label.filter((l) => l === -1).length / r.label.length
    console.log('dbscan eps 0,1 gürültü oranı', noise.toFixed(3))
    expect(noise).toBeGreaterThan(0.5)
  })
  it('eps = 0,8: iki hilal birleşir, yuvarlak raf ayrı kalır', () => {
    const X = warehouseScan()
    const r = dbscan(X, 0.8, 5)
    const pu = purity(X, r.label)
    expect(pu[0].best).toBe(pu[1].best)
    expect(pu[2].best).not.toBe(pu[0].best)
  })
  it('k-means (k = 3) aynı veride hilalleri ayıramaz', () => {
    const X = warehouseScan()
    const pts = X.filter((p) => p.c < 3)
    const km = lloyd(pts, [[2, 4], [7, 3], [12.5, 4]])
    const pu = purity(pts, km.g)
    expect(Math.min(...pu.map((q) => q.frac))).toBeLessThan(0.9)
  })
})
