// Projelerin ortak ağı: geri yayılım sayısal türevle aynı, XOR ve sinüs öğrenilir, nöroevrim kopyası aslını bozmaz.
import { describe, expect, it } from 'vitest'
import { rng } from '../core'
import { adamState, nnClone, nnCreate, nnForward, nnMutate, nnParamCount, nnTrainBatch } from './nn'

describe('projeler/nn', () => {
  it('parametre sayısı ve ileri hesap boyu', () => {
    expect(nnParamCount([2, 3, 1])).toBe(2 * 3 + 3 + 3 + 1)
    const n = nnCreate([5, 6, 2], rng(1), 'tanh')
    const y = nnForward(n, [0.1, 0.2, 0.3, 0.4, 0.5])
    expect(y).toHaveLength(2)
    for (const v of y) expect(Math.abs(v)).toBeLessThan(1)
  })
  it('geri yayılım gradyanı sayısal türevle aynı (lr çok küçükken ağırlık değişimi ∝ gradyan)', () => {
    const n = nnCreate([2, 4, 2], rng(3))
    const X = [[0.3, -0.7], [1, 0.2]], Y = [[0.5, -1], [0.1, 0.4]]
    const lossOf = (m: typeof n) => X.reduce((s, x, b) => { const o = nnForward(m, x); return s + o.reduce((q, v, k) => q + (v - Y[b][k]) ** 2, 0) }, 0) / 4
    const i = 5, e = 1e-6
    const a = nnClone(n), c = nnClone(n); a.w[i] += e; c.w[i] -= e
    const num = (lossOf(a) - lossOf(c)) / (2 * e)
    // Adam'ın ilk adımı işaret(gradyan) × lr kadardır: işaret aynı olmalı
    const m = nnClone(n); nnTrainBatch(m, adamState(m), X, Y, 1e-4)
    expect(Math.sign(n.w[i] - m.w[i])).toBe(Math.sign(num))
  })
  it('XOR ve sinüs öğrenilir', () => {
    const n = nnCreate([2, 6, 1], rng(7)), o = adamState(n)
    const X = [[0, 0], [0, 1], [1, 0], [1, 1]], Y = [[0], [1], [1], [0]]
    for (let t = 0; t < 1500; t++) nnTrainBatch(n, o, X, Y, 0.03)
    X.forEach((x, i) => expect(Math.abs(nnForward(n, x)[0] - Y[i][0])).toBeLessThan(0.15))
    const s = nnCreate([1, 12, 1], rng(9)), so = adamState(s)
    const xs = Array.from({ length: 40 }, (_, i) => [-3 + (6 * i) / 39]), ys = xs.map(([x]) => [Math.sin(x)])
    let loss = 1
    for (let t = 0; t < 3000; t++) loss = nnTrainBatch(s, so, xs, ys, 0.01)
    expect(loss).toBeLessThan(0.01)
  })
  it('nöroevrim: bozulmuş kopya farklı, asıl aynı', () => {
    const n = nnCreate([3, 4, 2], rng(2)), before = Array.from(n.w)
    const c = nnMutate(n, rng(5), 0.1)
    expect(Array.from(n.w)).toEqual(before)
    expect(Array.from(c.w)).not.toEqual(before)
  })
})
