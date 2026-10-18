// Rakam tanıma: ağırlıklar sıfırdan başlar, 3 turda görmediği etiketlerin büyük çoğunluğunu okur.
import { describe, expect, it } from 'vitest'
import { N_TEST, PIX, RAKAM_TANIMA, SIDE, labels, train } from './rakam-tanima'

const def = Object.fromEntries(RAKAM_TANIMA.params.map((p) => [p.key, p.value]))

describe('rakam tanıma', () => {
  it('kareler ve kod satırları tutarlı, run() hızlı', () => {
    const t = performance.now()
    const F = RAKAM_TANIMA.run(def)
    expect(performance.now() - t).toBeLessThan(1500)
    expect(F.length).toBeGreaterThan(3)
    for (const f of F) expect(f.line).toBeLessThan(RAKAM_TANIMA.code.length)
    for (const [c] of RAKAM_TANIMA.code) expect(c.length).toBeLessThanOrEqual(60)
  })
  it('ağırlıklar başta sıfır: her rakam %10', () => {
    const F = RAKAM_TANIMA.run(def)
    const z = F.find((f) => f.W !== null)!
    expect(z.W!.every((v) => v === 0)).toBe(true)
    for (const q of z.probs) expect(q).toBeCloseTo(0.1, 10)
  })
  it('3 turda görmediği 500 etiketin en az %85\'i doğru, ve tur tur artar', () => {
    const { X, y } = labels(0.35)
    const { acc, W } = train(X, y, 3)
    console.log('test doğru:', acc.join(' / '))
    expect(acc[2] / N_TEST).toBeGreaterThanOrEqual(0.85)
    expect(acc[2]).toBeGreaterThanOrEqual(acc[0])
    // sahnede gösterilen sonuç aynı sayı
    const last = RAKAM_TANIMA.run(def).at(-1)!
    expect(last.cap[0]).toContain(`${acc[2]} doğru`)
    // en çok karışan çift: 4 ile 9 (yalnız üst ortadaki hücrede ayrışırlar)
    expect(last.pair!.slice(0, 2)).toEqual([4, 9])
    // sıfır nöronu: halka yeşil (+), orta kırmızı (−). Şablon hücresi (a, b) her kaymada (2a+1, 2b+4) pikselini kaplar.
    const w0 = (a: number, b: number) => W[((2 * a + 1) * SIDE + 2 * b + 4) * 10]
    const ring = [...'111101101101111'].map((c, i) => (c === '1' ? w0(Math.floor(i / 3), i % 3) : NaN)).filter((v) => !Number.isNaN(v))
    const ringMean = ring.reduce((s, v) => s + v, 0) / ring.length
    console.log('sıfır nöronu: halka ort.', ringMean.toFixed(3), 'orta', w0(2, 1).toFixed(3))
    expect(ringMean).toBeGreaterThan(0)
    expect(w0(2, 1)).toBeLessThan(0)
    expect(W.length).toBe(PIX * 10)
  })
  it('gürültü artınca doğruluk düşer', () => {
    const a = train(labels(0.35).X, labels(0.35).y, 3).acc[2]
    const d = labels(0.75)
    const b = train(d.X, d.y, 3).acc[2]
    expect(b).toBeLessThan(a - 30)
  })
})
