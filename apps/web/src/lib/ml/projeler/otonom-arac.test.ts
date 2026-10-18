// Otonom araç projesi: pist ızgarası ve sensörler doğru, aynı tohum aynı sonuç, varsayılan tohumla 6 nesilde tam tur,
// "Kendin dene" görevlerindeki sayılar tutar.
import { describe, expect, it } from 'vitest'
import { defaults } from './core'
import { OTONOM_ARAC, castRay, createRun, roadIndex, runUntil, track } from './otonom-arac'

const base = { pop: 30, sigma: 0.3, hidden: 6, seed: 1, laps: 2 }

describe('otonom-arac', () => {
  it('pist: 57 m tur, orta çizgi yolda, yolun dışı −1; dik ışınlar yarı genişlik kadar', () => {
    const T = track()
    expect(T.length).toBeGreaterThan(55)
    expect(T.length).toBeLessThan(59)
    for (let k = 0; k < T.n; k += 7) expect(roadIndex(T, T.center[2 * k], T.center[2 * k + 1])).toBeGreaterThanOrEqual(0)
    expect(roadIndex(T, 0, 0)).toBe(-1)
    const h = Math.atan2(T.center[3] - T.center[1], T.center[2] - T.center[0])
    expect(castRay(T, T.center[0], T.center[1], h + Math.PI / 2)).toBeCloseTo(T.halfW, 1)
    expect(castRay(T, T.center[0], T.center[1], h - Math.PI / 2)).toBeCloseTo(T.halfW, 1)
    // yol boyunca ileri bakan ışın yan ışınlardan uzun
    expect(castRay(T, T.center[0], T.center[1], h)).toBeGreaterThan(3 * T.halfW)
  })
  it('aynı tohum aynı koşu, farklı tohum farklı', () => {
    const a = createRun(base), b = createRun(base), c = createRun({ ...base, seed: 2 })
    a.step(300); b.step(300); c.step(300)
    expect(a.view.cars.map((x) => x.x)).toEqual(b.view.cars.map((x) => x.x))
    expect(a.view.cars.map((x) => x.x)).not.toEqual(c.view.cars.map((x) => x.x))
  })
  it('varsayılan tohum: ilk tam tur 6. nesilde, iki tur 6. nesilde; ilk 20 tohum 10 nesil içinde bitirir', () => {
    const r = runUntil(base, 40)
    expect(r.firstLap).toBe(6)
    expect(r.done).toBe(true)
    expect(r.gens).toBe(6)
    for (let seed = 1; seed <= 20; seed++) expect(runUntil({ ...base, seed }, 10).done, `tohum ${seed}`).toBe(true)
  })
  it('görev: mutasyon 0 iken evrim durur, rekor ilk nesildeki gibi kalır', () => {
    const r = runUntil({ ...base, sigma: 0 }, 15)
    expect(r.firstLap).toBe(0)
    expect(new Set(r.hist.map((x) => x.toFixed(6))).size).toBe(1)
  })
  it('görev: popülasyon 10 → ilk tur 16. nesil; 6 araçla 80 nesilde yok', () => {
    expect(runUntil({ ...base, pop: 10 }, 20).firstLap).toBe(16)
    expect(runUntil({ ...base, pop: 6 }, 80).firstLap).toBe(0)
  })
  it('görev: gizli nöron 2 → 16. nesil, 12 → 4. nesil', () => {
    expect(runUntil({ ...base, hidden: 2 }, 20).firstLap).toBe(16)
    expect(runUntil({ ...base, hidden: 12 }, 20).firstLap).toBe(4)
  })
  it('oynatıcı arayüzü: iki dilde durum ve ölçümler dolu, eğriler nesille uzar, bitince done', () => {
    const run = OTONOM_ARAC.create(defaults(OTONOM_ARAC))
    const check = () => {
      for (const s of run.status()) expect(s.length).toBeGreaterThan(0)
      for (const m of run.metrics()) { expect(m.label.tr && m.label.en).toBeTruthy(); expect(m.value[0] && m.value[1]).toBeTruthy() }
    }
    check()
    let guard = 0
    while (!run.done() && guard++ < 20000) run.step(OTONOM_ARAC.perFrame * 8)
    expect(run.done()).toBe(true)
    check()
    expect(run.curves!()[0].values.length).toBeGreaterThanOrEqual(5)
    expect(run.view.gen).toBe(6)
  })
  it('kare bütçesi: 8× hızda bir step 6 ms’nin altında', () => {
    const R = createRun({ pop: 40, sigma: 0.3, hidden: 12, seed: 1, laps: 2 })
    R.step(100)
    const t = performance.now()
    for (let i = 0; i < 20; i++) R.step(OTONOM_ARAC.perFrame * 8)
    expect((performance.now() - t) / 20).toBeLessThan(6)
  })
})
