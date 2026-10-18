// Aktivasyon dersi: XOR ağındaki gerçek sayılar, eğrilerin temel özellikleri, eğrisiz iki katmanın tek doğruya çökmesi.
import { describe, expect, it } from 'vitest'
import { AKTIVASYON, NET2, composite, gelu, neuron, relu, sigmoid, tanh, twoLayer } from './aktivasyon-fonksiyonlari'

describe('aktivasyon-fonksiyonlari', () => {
  it('kare sayısı > 3, her satır kodun içinde, üç bölüm de var', () => {
    const f = AKTIVASYON.run({ x1: 1, x2: 0 })
    expect(f.length).toBeGreaterThan(3)
    for (const x of f) expect(x.line).toBeLessThan(AKTIVASYON.code.length)
    expect(new Set(f.map((x) => x.phase))).toEqual(new Set(['curves', 'neuron', 'collapse']))
  })
  it('girdi 1 ve 0: z = −2,7, sigmoid ≈ 0,06, cevap ≈ 0,95', () => {
    const N = neuron(1, 0)
    expect(N.z).toBeCloseTo(-2.7, 10)
    expect(N.a).toBeCloseTo(0.063, 3)
    expect(N.a.toFixed(2)).toBe('0.06')
    expect(N.y.toFixed(2)).toBe('0.95')
    expect(AKTIVASYON.run({ x1: 1, x2: 0 }).find((x) => x.line === 10)!.cap[0]).toBe('z = −2,7 · a = 0,06 · y = 0,95')
  })
  it('ağ XOR öğrenmiş: yalnız biri 1 ise evet', () => {
    expect(neuron(0, 0).y).toBeLessThan(0.1)
    expect(neuron(1, 1).y).toBeLessThan(0.1)
    expect(neuron(1, 0).y).toBeGreaterThan(0.9)
    expect(neuron(0, 1).y).toBeGreaterThan(0.9)
  })
  it('eğri özellikleri: GELU(0) = 0, ReLU negatifte 0, sigmoid 0–1, tanh −1…1', () => {
    expect(gelu(0)).toBe(0)
    expect(relu(0)).toBe(0)
    for (let z = -6; z <= 6; z += 0.25) {
      if (z < 0) expect(relu(z)).toBe(0); else expect(relu(z)).toBe(z)
      expect(sigmoid(z)).toBeGreaterThan(0); expect(sigmoid(z)).toBeLessThan(1)
      expect(Math.abs(tanh(z))).toBeLessThan(1)
      expect(gelu(z)).toBeGreaterThanOrEqual(-0.2) // GELU negatifte yalnız hafifçe batar
    }
    expect(sigmoid(0)).toBe(0.5)
  })
  it('eğrisiz iki katman tek doğrudur: bileşik ağırlık −1,64, sapma 2,75', () => {
    const C = composite()
    expect(C.w).toBeCloseTo(-1.64, 10)
    expect(C.b).toBeCloseTo(2.75, 10)
    for (let x = -3; x <= 3; x += 0.5) expect(twoLayer(x)).toBeCloseTo(C.w * x + C.b, 10)
    // eğriyle (tanh) ikinci fark sıfır değil: çıktı bükülür
    const d2 = (f: (x: number) => number, x: number) => f(x + 1) - 2 * f(x) + f(x - 1)
    expect(Math.abs(d2((x) => twoLayer(x), 0))).toBeLessThan(1e-12)
    expect(Math.abs(d2((x) => twoLayer(x, Math.tanh), 0))).toBeGreaterThan(1)
    expect(NET2.W1).toHaveLength(3)
  })
})
