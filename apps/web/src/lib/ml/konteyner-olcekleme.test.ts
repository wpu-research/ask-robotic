// Ders: konteyner ve otomatik ölçekleme. Ölçekleyici tepe yükte kopya ekler ve gecikme 200 ms altında kalır; sabit 2 kopyada aşar.
import { describe, expect, it } from 'vitest'
import { KONTEYNER_OLCEKLEME, konSim } from './konteyner-olcekleme'

describe('konteyner-olcekleme', () => {
  it('kareler: sayı > 3, satırlar kod içinde', () => {
    const F = KONTEYNER_OLCEKLEME.run({ target: 60, peak: 400 })
    expect(F.length).toBeGreaterThan(60)
    for (const f of F) expect(f.line).toBeLessThan(KONTEYNER_OLCEKLEME.code.length)
  })
  it('hedef %60, tepe 400: kopya sayısı artar, gecikme sınır altında; sabit 2 kopya sınırı aşar', () => {
    const S = konSim(0.6, 400)
    const kPeak = S.load.indexOf(Math.max(...S.load))
    console.log('kopya', S.peakN, 'en kötü', S.maxLatAuto.toFixed(0), 'sabit', S.maxLatFix.toFixed(0), '800:', konSim(0.6, 800).peakN, konSim(0.6, 800).maxLatAuto.toFixed(0), '%80:', konSim(0.8, 400).maxLatAuto.toFixed(0))
    expect(S.nAuto[0]).toBe(2)
    expect(S.nAuto[kPeak]).toBeGreaterThanOrEqual(12)
    expect(S.maxLatAuto).toBeLessThan(S.slo)
    expect(S.maxLatFix).toBeGreaterThan(S.slo)
  })
  it('yük bitince kopyalar geri iner; hedef %80 sınırı aşar', () => {
    const S = konSim(0.6, 400)
    expect(S.nAuto.at(-1)!).toBeLessThanOrEqual(3)
    expect(konSim(0.8, 400).maxLatAuto).toBeGreaterThan(200)
  })
})
