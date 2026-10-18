// Düşme tespiti: varsayılan kural düşmede alarm verir, eğilme ve oturmada vermez; parametreler gevşeyince yanlış alarm çıkar.
import { describe, expect, it } from 'vitest'
import { DUSME_TESPITI, FPS, detect, maxCount, skeleton } from './dusme-tespiti'

describe('düşme tespiti', () => {
  it('kareler ve kod satırları tutarlı', () => {
    const f = DUSME_TESPITI.run({ ang: 60, win: 2 })
    expect(f.length).toBeGreaterThan(3)
    for (const x of f) expect(x.line).toBeLessThan(DUSME_TESPITI.code.length)
  })
  it('varsayılan: yalnız düşme alarm verir (18–21 s), eğilme ve oturma vermez', () => {
    const D = detect(skeleton(), 60, 20)
    console.log('alarms', D.alarms.map((a) => a / FPS), 'bend max', maxCount(D.cnt, 5, 8), 'sit max', maxCount(D.cnt, 10.5, 15))
    expect(D.alarms).toHaveLength(1)
    expect(D.alarms[0] / FPS).toBeGreaterThan(18)
    expect(D.alarms[0] / FPS).toBeLessThan(21)
    expect(maxCount(D.cnt, 5, 8)).toBeLessThan(20)
    expect(maxCount(D.cnt, 10.5, 15)).toBe(0)
    // eğilmede açı gerçekten eşiği geçer: kuralı kurtaran zaman penceresi
    expect(Math.max(...D.ang.slice(55, 66))).toBeGreaterThan(60)
    expect(DUSME_TESPITI.run({ ang: 60, win: 2 }).at(-1)!.cap[0]).toMatch(/^yalnız düşme/)
  })
  it('kısa pencere eğilmede, düşük açı eşiği oturmada yanlış alarm verir', () => {
    const short = detect(skeleton(), 60, 10)
    expect(short.alarms.some((a) => a >= 50 && a < 80)).toBe(true)
    const flat = detect(skeleton(), 20, 20)
    expect(flat.alarms.some((a) => a >= 105 && a < 150)).toBe(true)
  })
})
