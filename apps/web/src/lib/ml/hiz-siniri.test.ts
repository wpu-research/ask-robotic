// Ders: DDoS ve hız sınırı. Saldırı altında jeton kovasıyla meşru başarı, sınırsız duruma göre belirgin yüksek.
import { describe, expect, it } from 'vitest'
import { HIZ_SINIRI, simulate } from './hiz-siniri'

describe('hiz-siniri', () => {
  it('kareler: sayı > 3, satırlar kod içinde, deterministik', () => {
    const F = HIZ_SINIRI.run({ siddet: 400, kova: 5 })
    expect(F.length).toBeGreaterThan(60)
    for (const f of F) expect(f.line).toBeLessThan(HIZ_SINIRI.code.length)
    expect(HIZ_SINIRI.run({ siddet: 400, kova: 5 }).at(-1)!.cap).toEqual(F.at(-1)!.cap)
  })
  it('saldırı altında: kova ile meşru başarı ≥ %95, sınırsız ≤ %35', () => {
    const S = simulate(400, 5)
    console.log('meşru başarı', S.okFree.toFixed(3), S.okLim.toFixed(3))
    expect(S.okLim).toBeGreaterThan(0.95)
    expect(S.okFree).toBeLessThan(0.35)
    expect(S.okLim - S.okFree).toBeGreaterThan(0.5)
  })
  it('daha şiddetli saldırıda fark büyür; saldırı yokken ikisi de ~%100', () => {
    const a = simulate(1000, 5)
    expect(a.okLim - a.okFree).toBeGreaterThan(0.75)
    const z = simulate(0, 5)
    expect(z.okFree).toBeGreaterThan(0.98)
    expect(z.okLim).toBeGreaterThan(0.95)
  })
  it('çok küçük kova meşru robotları da keser', () => {
    expect(simulate(400, 1).okLim).toBeLessThan(simulate(400, 5).okLim - 0.1)
  })
})
