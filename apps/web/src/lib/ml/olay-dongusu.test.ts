// Olay döngüsü: simülasyonun çıktı sırası beklenen sırayla aynı; uzun hesap zamanlayıcıyı geciktirir.
import { describe, expect, it } from 'vitest'
import { EXPECTED, OLAY_DONGUSU, simulate } from './olay-dongusu'

describe('olay döngüsü', () => {
  it('kareler: sayı > 3, her satır kodda var', () => {
    for (const scen of [0, 1, 2]) {
      const F = OLAY_DONGUSU.run({ scen })
      expect(F.length).toBeGreaterThan(3)
      for (const f of F) expect(f.line).toBeLessThan(OLAY_DONGUSU.code.length)
    }
  })
  it('her senaryoda çıktı sırası beklenen sıra', () => {
    for (const scen of [0, 1, 2]) expect(simulate(scen).out.map((o) => o.s.tr)).toEqual(EXPECTED[scen])
  })
  it('söz (mikro) 0 ms zamanlayıcıdan (makro) önce; mikro görevin eklediği mikro görev bir sonraki makrodan önce', () => {
    const o = simulate(1).out.map((x) => x.s.tr)
    expect(o.indexOf('P2')).toBeLessThan(o.indexOf('T1'))
    expect(o.indexOf('T1 sözü')).toBeLessThan(o.indexOf('T2'))
  })
  it('60 ms hesap: 10 ms zamanlayıcı en az 50 ms gecikir; boştaki döngü zamanında çalıştırır', () => {
    const k = simulate(2).out.find((x) => x.s.tr === 'kontrol')!
    expect(k.plan).toBe(10)
    expect(k.t - k.plan!).toBeGreaterThanOrEqual(50)
    const l = simulate(1).out.find((x) => x.s.tr === 'lidar verisi')!
    expect(l.t - l.plan!).toBeLessThanOrEqual(1)
    const last = OLAY_DONGUSU.run({ scen: 2 }).at(-1)!
    expect(last.cap[0]).toBe('çıktı sırası: ' + EXPECTED[2].join(' → '))
    expect(last.stat![0]).toContain(`çalıştığı ${k.t} ms`)
  })
})
