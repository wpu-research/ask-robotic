// Makine Öğrenmesi dersleri: algoritmaların gerçekten öğrettikleri şeyi yaptığı (sayılar sahnede gösterilenle aynı).
import { describe, expect, it } from 'vitest'
import { KMEANS, lidarScan, lloyd, sizesOf } from './kmeans'
import { LESSONS } from './lessons'
import { rng, choice } from './core'
import { REGRESSION, gradientDescent, motorData } from './regression'
import { OVERFIT, adamFit, sharpData } from './overfit'
import { KNN } from './knn'
import { NAIVE_BAYES } from './naive-bayes'
import { TREE } from './tree'
import { PCA } from './pca'
import { PERCEPTRON } from './perceptron'
import { MLP } from './mlp'

describe('k-means', () => {
  it('600 nokta: 250 duvar, 200 kanepe, 150 masa', () => {
    const p = lidarScan()
    expect(p).toHaveLength(600)
    expect(sizesOf(p.map((q) => q.c), 3)).toEqual([250, 200, 150])
  })
  it('doğru gruplama en sıkı çözüm; on denemenin çoğu bulur, en az biri yerel minimumda takılır', () => {
    const f = KMEANS.run({ k: 3, seed: 17 })
    const last = f.at(-1)!
    expect(last.sizes!.slice().sort((a, b) => b - a)).toEqual([250, 200, 150])
    const ok = last.tries!.filter((t) => t.ok).length
    console.log('tries', last.tries!.map((t) => `${t.s.toFixed(0)}:${t.sizes.join('/')}`).join('  '))
    expect(ok).toBeGreaterThanOrEqual(6)
    expect(ok).toBeLessThan(10)
    // en iyi denemenin grupları gerçek nesnelerle birebir örtüşür
    const g = last.g!, pts = last.pts
    for (let j = 0; j < 3; j++) expect(new Set(pts.filter((_, i) => g[i] === j).map((q) => q.c)).size).toBe(1)
  })
  it('aynı tohum aynı izi verir', () => {
    expect(KMEANS.run({ k: 3, seed: 17 }).length).toBe(KMEANS.run({ k: 3, seed: 17 }).length)
    const a = lloyd(lidarScan(), choice(rng(1), 600, 3).map((i) => [lidarScan()[i].x, lidarScan()[i].y] as [number, number]))
    expect(a.rounds.length).toBeGreaterThan(1)
  })
})

describe('ders listesi', () => {
  it('benzersiz slug, sıralı numara, kod satırları dolu', () => {
    expect(new Set(LESSONS.map((l) => l.slug)).size).toBe(LESSONS.length)
    for (const l of LESSONS) {
      expect(l.code.length).toBeGreaterThan(5)
      expect(l.how.length).toBeGreaterThanOrEqual(3)
      const f = l.run(Object.fromEntries(l.params.map((p) => [p.key, p.value])))
      expect(f.length, l.slug).toBeGreaterThan(3)
      for (const x of f) expect(x.line, l.slug).toBeLessThan(l.code.length)
    }
  })
})

describe('regresyon', () => {
  it('öğrenme oranı 0,1: gerçek eğime (0,21) ve kesişime (−6) yakınsar', () => {
    const { pwm, speed } = motorData()
    const g = gradientDescent(pwm, speed, 0.1, 60)
    expect(g.w / g.sigma).toBeCloseTo(0.21, 1)
    expect(g.hist.at(-1)!.loss).toBeLessThan(g.hist[5].loss)
    expect(REGRESSION.run({ lr: 0.1 }).at(-1)!.cap[0]).toMatch(/^hız ≈ 0,2/)
  })
  it("öğrenme oranı 1'i geçince ıraksar", () => {
    expect(REGRESSION.run({ lr: 1.05 }).at(-1)!.cap[0]).toMatch(/ıraksadı/)
  })
})

describe('aşırı öğrenme', () => {
  it('eğitim hatası hep düşer; doğrulama hatası ortada en küçük, 12. derecede çok daha büyük', () => {
    const last = OVERFIT.run({ deg: 12 }).find((f) => f.best !== undefined)!
    for (let i = 1; i < last.train.length; i++) expect(last.train[i]).toBeLessThanOrEqual(last.train[i - 1] * 1.0001)
    expect(last.best!).toBeGreaterThanOrEqual(2)
    expect(last.best!).toBeLessThanOrEqual(9)
    expect(last.test[11]).toBeGreaterThan(last.test[last.best! - 1] * 1.5)
  })
  it('erken durdurma: Adam ile eğitimde doğrulama hatası dibe vurup tırmanır, en iyi geçiş erken', () => {
    const G = adamFit(sharpData())
    const tr = G.snaps.map((s) => s.train), te = G.snaps.map((s) => s.test)
    expect(tr.at(-1)!).toBeLessThan(tr[3])
    expect(G.best.step).toBeLessThan(3000)
    expect(te.at(-1)!).toBeGreaterThan(G.best.test * 2)
    const f = OVERFIT.run({ deg: 12 }).at(-1)!
    expect(f.gd?.best).toBeDefined()
    expect(f.cap[1]).toBe(`early stopping: pass ${G.best.step.toLocaleString('en-US')}`)
  })
})

describe('sınıflandırıcılar', () => {
  it('k-NN (k = 5) testte en az %85', () => expect(KNN.run({ k: 5 }).at(-1)!.acc!).toBeGreaterThanOrEqual(0.85))
  it('naive Bayes testte en az %85', () => expect(NAIVE_BAYES.run({}).at(-1)!.acc!).toBeGreaterThanOrEqual(0.85))
  it('karar ağacı: derinlik 3, derinlik 1’den iyi ve en az %80', () => {
    const a1 = TREE.run({ depth: 1 }).at(-1)!.acc!, a3 = TREE.run({ depth: 3 }).at(-1)!.acc!
    expect(a3).toBeGreaterThan(a1)
    expect(a3).toBeGreaterThanOrEqual(0.8)
  })
  it('karar ağacı, kredi verisi: derinlik 3 kuralı bulur (gelir ≈ 3.000 / 5.000, kaçan ≤ 1); derinlik 10 ezberler', () => {
    const f3 = TREE.run({ depth: 3, veri: 1 }).at(-1)!, f10 = TREE.run({ depth: 10, veri: 1 }).at(-1)!
    const r = f3.rules!.map((x) => x[0]).join('\n')
    expect(r).toMatch(/kaçan <= 1/)
    expect(r).toMatch(/gelir <= (29|30)\d\d/)
    expect(r).toMatch(/gelir <= (49|50)\d\d/)
    expect(f3.acc!).toBeGreaterThanOrEqual(0.8)
    expect(f10.trainAcc!).toBeGreaterThan(f3.trainAcc!)
    expect(f10.acc!).toBeLessThan(f3.acc!)
    expect(f10.rules).toBeUndefined()
  })
  it('k-means k = 2: iki grup birleşir', () => {
    expect(KMEANS.run({ k: 2, seed: 17 }).at(-1)!.stat![0]).toMatch(/200 · 400/)
  })
  it('regresyon: öğrenme oranı 0,01 yetmez, eğim 0,150', () => {
    expect(REGRESSION.run({ lr: 0.01 }).at(-1)!.cap[0]).toMatch(/^hız ≈ 0,150/)
  })
  it('perceptron 20 dönem içinde hatasız bir doğru bulur', () => {
    const last = PERCEPTRON.run({ seed: 1 }).at(-1)!
    expect(last.mistakes).toBe(0)
    expect(last.epoch).toBeLessThanOrEqual(20)
  })
  it('sinir ağı: 8 gizli nöronla %95 ve üstü, 1 nöronla belirgin düşük', () => {
    const a8 = MLP.run({ H: 8, lr: 0.5 }).at(-1)!.acc.at(-1)!
    const a1 = MLP.run({ H: 1, lr: 0.5 }).at(-1)!.acc.at(-1)!
    console.log('mlp', a8, a1)
    expect(a8).toBeGreaterThanOrEqual(0.95)
    expect(a1).toBeLessThan(a8 - 0.04)
  })
})

describe('PCA', () => {
  it('bilginin %90 fazlası tek sayıda; yön ~30°', () => {
    const last = PCA.run({}).at(-1)!
    expect(last.ratio!).toBeGreaterThan(0.9)
    const deg = ((last.angle! * 180) / Math.PI + 180) % 180
    expect(Math.abs(deg - 30)).toBeLessThan(6)
  })
})
