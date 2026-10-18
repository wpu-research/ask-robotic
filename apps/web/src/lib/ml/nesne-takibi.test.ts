// Nesne takibi: doğru eşikte kimlikler korunur, hız ±%10 içinde, hızlı AGV'ler ihlal olarak işaretlenir.
import { describe, expect, it } from 'vitest'
import { LIMIT, NESNE_TAKIBI, VEHICLES, detections, track, trueSpeed } from './nesne-takibi'

describe('nesne takibi', () => {
  it('kareler ve kod satırları tutarlı', () => {
    const f = NESNE_TAKIBI.run({ gate: 20, noise: 2 })
    expect(f.length).toBeGreaterThan(3)
    for (const x of f) expect(x.line).toBeLessThan(NESNE_TAKIBI.code.length)
  })
  it('varsayılan eşikte kimlik değişimi yok ya da çok az; hız ±%10; hızlılar ihlal', () => {
    const R = track(detections(2), 20)
    console.log('switches', R.switches, 'tracks', R.nTracks, R.summary.map((q) => `${q.truth.toFixed(2)}→${q.est.toFixed(3)}`).join(' '))
    expect(R.switches).toBeLessThanOrEqual(1)
    expect(R.nTracks).toBeLessThanOrEqual(VEHICLES.length + 1)
    R.summary.forEach((q, g) => {
      expect(Math.abs(q.est - trueSpeed(g)) / trueSpeed(g)).toBeLessThan(0.1)
      expect(q.viol).toBe(trueSpeed(g) > LIMIT)
    })
    expect(R.summary.filter((q) => q.viol).length).toBe(2)
  })
  it('küçük eşik ve yüksek gürültü kimlikleri parçalar', () => {
    const bad = track(detections(6), 20)
    const fixed = track(detections(6), 45)
    const tiny = track(detections(2), 5)
    console.log('noise6 gate20', bad.switches, bad.nTracks, 'gate45', fixed.switches, fixed.nTracks, 'gate5', tiny.switches, tiny.nTracks)
    expect(bad.switches).toBeGreaterThan(3)
    expect(fixed.switches).toBeLessThan(bad.switches)
    expect(tiny.nTracks).toBeGreaterThan(VEHICLES.length + 3)
  })
  it('sahne karesi sonucu gösterir', () => {
    const last = NESNE_TAKIBI.run({ gate: 20, noise: 2 }).at(-1)!
    expect(last.summary).toHaveLength(5)
    expect(last.cap[0]).toMatch(/2 ihlal/)
  })
})
