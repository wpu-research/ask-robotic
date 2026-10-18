import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { batches, broadcast, convOut, matmul, parseShape, permutation, stepsPerEpoch, view } from './tensor'
import { backward, DEFAULT_LEAVES, forward, numericGrad, sgdStep } from './autograd'
import { optimize, summary, trainMlp, type Layer } from './nets'
import { gradientFlow, memorySpan } from './seq'
import { accuracy, conv2d, maxpool2, parseTestBin, quantizeWeights, runCnn, toMnist, type CnnWeights } from './cnn'
import { RESNET18_TOTAL_IMAGENET, transferPlan } from './deploy'

describe('tensör şekilleri', () => {
  it('yayınlama sağdan hizalanır', () => {
    expect(broadcast([8, 1, 6, 1], [7, 1, 5])).toEqual({ ok: true, shape: [8, 7, 6, 5] })
    expect(broadcast([3], [4, 3])).toEqual({ ok: true, shape: [4, 3] })
    const bad = broadcast([3, 4], [3])
    expect(bad.ok).toBe(false)
    if (!bad.ok) expect(bad.error).toContain('size of tensor a (4) must match the size of tensor b (3)')
  })
  it('matmul: iç boyut eşleşmeli; yığın boyutları yayınlanır; 1B özel', () => {
    expect(matmul([2, 3], [3, 4])).toEqual({ ok: true, shape: [2, 4] })
    expect(matmul([10, 2, 3], [3, 4])).toEqual({ ok: true, shape: [10, 2, 4] })
    expect(matmul([3], [3])).toEqual({ ok: true, shape: [] })
    expect(matmul([5, 3], [3])).toEqual({ ok: true, shape: [5] })
    const r = matmul([64, 784], [128, 10])
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toContain('(64x784 and 128x10)')
  })
  it('view: -1 çıkarımı, eleman sayısı, bitişiklik', () => {
    expect(view([4, 3, 28, 28], [4, -1])).toEqual({ ok: true, shape: [4, 2352], note: undefined })
    expect(view([6], [4, -1]).ok).toBe(false)
    expect(view([2, 3], [3, 2], false).ok).toBe(false)
    expect(view([2, 3], [3, 2], false, 'reshape').ok).toBe(true)
    expect(parseShape('(2, 3,4)')).toEqual([2, 3, 4])
    expect(parseShape('a')).toBeNull()
  })
  it('DataLoader: drop_last, karıştırma tekrarlanabilir ve her örnek bir kez', () => {
    expect(stepsPerEpoch(10, 4)).toBe(3); expect(stepsPerEpoch(10, 4, true)).toBe(2)
    const b = batches(10, 4, { shuffle: true, seed: 1, epoch: 0 })
    expect(b.map((x) => x.length)).toEqual([4, 4, 2])
    expect(b.flat().sort((x, y) => x - y)).toEqual([...Array(10).keys()])
    expect(batches(10, 4, { shuffle: true, seed: 1, epoch: 0 })).toEqual(b)
    expect(batches(10, 4, { shuffle: true, seed: 1, epoch: 1 })).not.toEqual(b)
    expect(permutation(5, 3).sort()).toEqual([0, 1, 2, 3, 4])
  })
  it('evrişim çıkış boyu formülü', () => {
    expect(convOut(28, 3, 1, 1)).toBe(28)
    expect(convOut(28, 2, 2)).toBe(14)
    expect(convOut(224, 7, 2, 3)).toBe(112)
    expect(convOut(5, 3, 1, 0, 2)).toBe(1)
  })
})

describe('autograd', () => {
  it('geri yayılım sayısal türevle aynı', () => {
    const v = forward(DEFAULT_LEAVES), { grads, steps } = backward(v)
    for (const k of ['w1', 'w2', 'b', 'x1', 'x2'] as const) expect(grads[k]).toBeCloseTo(numericGrad(DEFAULT_LEAVES, k), 6)
    expect(steps[0].node).toBe('L')
    expect(grads.L).toBe(1)
  })
  it('SGD adımları kaybı azaltır', () => {
    let p = DEFAULT_LEAVES
    const l0 = forward(p).L
    for (let i = 0; i < 20; i++) p = sgdStep(p, 0.1)
    expect(forward(p).L).toBeLessThan(l0 * 0.1)
  })
})

describe('katmanlar ve optimize ediciler', () => {
  it('bitirme CNN\'inin özeti: şekiller ve 9 098 parametre', () => {
    const L: Layer[] = [{ kind: 'Conv2d', in: 1, out: 8, k: 3, s: 1, p: 1 }, { kind: 'ReLU' }, { kind: 'MaxPool2d', k: 2, s: 2 }, { kind: 'Conv2d', in: 8, out: 16, k: 3, s: 1, p: 1 }, { kind: 'ReLU' }, { kind: 'MaxPool2d', k: 2, s: 2 }, { kind: 'Flatten' }, { kind: 'Linear', in: 784, out: 10 }]
    const s = summary([1, 28, 28], L)
    expect(s.ok).toBe(true)
    expect(s.rows[6].out).toEqual([784])
    expect(s.total).toBe(80 + 1168 + 7850)
    const bad = summary([1, 28, 28], [{ kind: 'Flatten' }, { kind: 'Linear', in: 100, out: 10 }])
    expect(bad.ok).toBe(false)
    expect(bad.rows[1].error).toContain('784 and 100')
  })
  it('dar vadide Adam ve momentum SGD\'den hızlı yaklaşır; büyük lr SGD\'yi ıraksatır', () => {
    const f = (k: 'sgd' | 'momentum' | 'adam', lr: number) => optimize(k, 'valley', lr, 100).at(-1)![2]
    expect(f('momentum', 0.05)).toBeLessThan(f('sgd', 0.05))
    expect(f('adam', 0.5)).toBeLessThan(f('sgd', 0.05))
    expect(Number.isNaN(optimize('sgd', 'valley', 1.1, 200).at(-1)![2]) || optimize('sgd', 'valley', 1.1, 200).at(-1)![2] > 1e3).toBe(true)
  })
  it('küçük ağ iki ay verisini gerçekten öğrenir ve tekrarlanabilir', () => {
    const o = { hidden: [16, 16], lr: 0.01, epochs: 40, batch: 32, seed: 1 }
    const r = trainMlp(o)
    expect(r.history.at(-1)!.valAcc).toBeGreaterThan(0.93)
    expect(r.history.at(-1)!.trainLoss).toBeLessThan(r.history[0].trainLoss)
    expect(trainMlp(o).history.at(-1)!.valLoss).toBe(r.history.at(-1)!.valLoss)
  })
  it('az ve gürültülü veride büyük ağ aşırı öğrenir; düzenlileştirme doğrulama kaybını düşürür', () => {
    const base = { hidden: [64, 64], lr: 0.01, epochs: 150, batch: 16, seed: 2, noise: 0.3, nTrain: 40, nVal: 300 }
    const over = trainMlp(base), reg = trainMlp({ ...base, dropout: 0.3, weightDecay: 0.01 })
    const gap = (r: typeof over) => r.history.at(-1)!.valLoss - r.history.at(-1)!.trainLoss
    expect(gap(over)).toBeGreaterThan(0.2)
    expect(reg.history.at(-1)!.valLoss).toBeLessThan(over.history.at(-1)!.valLoss)
    const es = trainMlp({ ...base, earlyStop: 15 })
    expect(es.stoppedAt).not.toBeNull()
  }, 60000)
})

describe('diziler', () => {
  it('RNN\'de gradyan söner, unutma kapısı ön yargısı yüksek LSTM\'de taşınır', () => {
    const r = gradientFlow({ T: 50, w: 0.9, forgetBias: 3 })
    expect(memorySpan(r.rnnGrad)).toBeLessThan(25)
    expect(memorySpan(r.lstmGrad)).toBe(50)
    expect(memorySpan(gradientFlow({ T: 50, w: 0.9, forgetBias: -1 }).lstmGrad)).toBeLessThan(10)
  })
})

describe('CNN (tarayıcı)', () => {
  it('conv2d ve maxpool elle hesapla uyumlu', () => {
    const x = { c: 1, h: 3, w: 3, data: Float32Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9]) }
    const y = conv2d(x, [0, 0, 0, 0, 1, 0, 0, 0, 0], [0.5], 1)
    expect(Array.from(y.data)).toEqual([1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5, 8.5, 9.5])
    expect(Array.from(maxpool2({ c: 1, h: 2, w: 2, data: Float32Array.from([1, 4, 3, 2]) }).data)).toEqual([4])
  })
  it('MNIST ön işleme: rakam 20 px kutuya sığar ve ortalanır', () => {
    const n = 100, src = new Uint8ClampedArray(n * n)
    for (let y = 10; y < 40; y++) for (let x = 60; x < 70; x++) src[y * n + x] = 255 // köşede dikey çubuk
    const m = toMnist(src, n)
    let sx = 0, sy = 0, s = 0, y0 = 28, y1 = 0
    for (let y = 0; y < 28; y++) for (let x = 0; x < 28; x++) { const v = m[y * 28 + x]; if (v) { sx += v * x; sy += v * y; s += v; y0 = Math.min(y0, y); y1 = Math.max(y1, y) } }
    expect(Math.abs(sx / s - 14)).toBeLessThan(1.5); expect(Math.abs(sy / s - 14)).toBeLessThan(1.5)
    expect(y1 - y0 + 1).toBe(20)
  })
  const wPath = join(process.cwd(), 'public/veri/pytorch/mnist-cnn.json'), tPath = join(process.cwd(), 'public/veri/pytorch/mnist-test-200.bin')
  it.skipIf(!existsSync(wPath))('eğitilmiş ağırlıklar: 200 test örneğinde ≥ %95; int8 nicemleme doğruluğu ≤ 2 puan düşürür, boyut ~4×', () => {
    const W = JSON.parse(readFileSync(wPath, 'utf8')) as CnnWeights
    const set = parseTestBin(readFileSync(tPath))
    const acc = accuracy(W, set)
    expect(acc).toBeGreaterThanOrEqual(0.95)
    const q = quantizeWeights(W)
    expect(accuracy(q.W, set)).toBeGreaterThanOrEqual(acc - 0.02)
    expect(q.bytesFp32 / q.bytesInt8).toBeGreaterThan(3.5)
    const tr = runCnn(W, set[0].px)
    expect(tr.c1.c).toBe(8); expect(tr.p2.data.length).toBe(784)
    expect(tr.probs.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 6)
  })
})

describe('aktarım öğrenmesi', () => {
  it('ResNet-18 toplamı 11 689 512; omurga dondurulunca yalnız baş eğitilir', () => {
    expect(RESNET18_TOTAL_IMAGENET).toBe(11689512)
    const all = { stem: true, layer1: true, layer2: true, layer3: true, layer4: true }
    expect(transferPlan(all, 5).trainable).toBe(512 * 5 + 5)
    expect(transferPlan({ ...all, layer4: false }, 5).trainable).toBe(8393728 + 2565)
  })
})
