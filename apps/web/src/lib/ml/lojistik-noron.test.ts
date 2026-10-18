// Tek nöron dersi: sigmoid güveni 0–1 arasında, öğrenilen karar çizgisi gerçek eşiğe yakın, doğruluk yüksek.
import { describe, expect, it } from 'vitest'
import { LOJISTIK_NORON, TRUE_THR, accuracy, confidence, missionData, threshold, trainLogistic } from './lojistik-noron'

describe('lojistik-noron', () => {
  it('kare sayısı > 3, her satır kodun içinde', () => {
    const f = LOJISTIK_NORON.run({ lr: 0.5 })
    expect(f.length).toBeGreaterThan(3)
    for (const x of f) expect(x.line).toBeLessThan(LOJISTIK_NORON.code.length)
  })
  it('40 deneme, iki sınıf da var', () => {
    const { V, done } = missionData()
    expect(V).toHaveLength(40)
    expect(done.filter((d) => d === 1).length).toBeGreaterThan(8)
    expect(done.filter((d) => d === 0).length).toBeGreaterThan(8)
  })
  it('karar çizgisi gerçek eşiğe ±0,3 V yakın, doğruluk ≥ %85, kayıp düşer', () => {
    const { V, done } = missionData()
    const g = trainLogistic(V, done, 0.5)
    const thr = threshold(g.w, g.b, g.mu, g.sigma)
    const acc = accuracy(V, done, g.w, g.b, g.mu, g.sigma)
    console.log('eşik', thr.toFixed(3), 'doğruluk', acc, 'kayıp', g.hist.at(-1)!.loss.toFixed(3))
    expect(Math.abs(thr - TRUE_THR)).toBeLessThan(0.3)
    expect(acc).toBeGreaterThanOrEqual(0.85)
    expect(g.hist.at(-1)!.loss).toBeLessThan(g.hist[0].loss * 0.6)
    // eşikte güven tam %50
    expect(confidence(thr, g.w, g.b, g.mu, g.sigma)).toBeCloseTo(0.5, 6)
    // sahnenin son yazısı aynı sayıyı söyler
    expect(LOJISTIK_NORON.run({ lr: 0.5 }).at(-1)!.cap[1]).toContain(`threshold ${thr.toFixed(2)} V`)
  })
  it('sigmoid çıktısı her gerilimde 0 ile 1 arasında, gerilimle artar', () => {
    const { V, done } = missionData()
    const g = trainLogistic(V, done, 0.5)
    let prev = -1
    for (let v = 5; v <= 10; v += 0.05) {
      const c = confidence(v, g.w, g.b, g.mu, g.sigma)
      expect(c).toBeGreaterThanOrEqual(0); expect(c).toBeLessThanOrEqual(1)
      expect(c).toBeGreaterThanOrEqual(prev); prev = c
    }
  })
  it('küçük öğrenme oranı 300 dönemde daha az öğrenir', () => {
    const { V, done } = missionData()
    expect(trainLogistic(V, done, 0.05).hist.at(-1)!.loss).toBeGreaterThan(trainLogistic(V, done, 0.5).hist.at(-1)!.loss)
  })
})
