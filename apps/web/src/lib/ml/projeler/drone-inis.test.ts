// Drone iniş projesi: fizik doğru, aynı tohum aynı sonuç, Q-öğrenme yumuşak iniş oranını belirgin artırır, görevdeki iddialar tutar.
import { describe, expect, it } from 'vitest'
import { rng } from '../core'
import { defaults } from './core'
import { DRONE_INIS, MAX_EPISODES, N_STATES, THROTTLE, greedyRate, makeLearner, newBody, softRate, tick } from './drone-inis'

/** Oynatıcı gibi: 1× hızda kare kare, bitene kadar. Dönüş: bölüm sayısı ve hedefe ulaşıldı mı. */
function train(o: Record<string, number> = {}) {
  const r = DRONE_INIS.create({ ...defaults(DRONE_INIS), ...o })
  let frames = 0
  while (!r.done() && frames < 20000) { r.step(DRONE_INIS.perFrame * 8); frames++ }
  return { ep: r.view.episodes, goal: /^hedef/.test(r.status()[0]), run: r }
}

describe('drone-inis', () => {
  it('fizik: gaz kapalıyken serbest düşüş sert biter; %100 gazla rüzgârsız havada asılı kalır', () => {
    const r = rng(1)
    const b = newBody(r, 0)
    let o = null
    while (!o) o = tick(b, 0, 0, r)
    expect(o).toBe('hard')
    expect(Math.abs(b.v)).toBeGreaterThan(8)
    const c = newBody(rng(2), 0), h0 = c.h, v0 = c.v
    for (let i = 0; i < 20; i++) tick(c, THROTTLE.indexOf(1), 0, r)
    expect(c.v).toBeCloseTo(v0, 10)
    expect(c.h).toBeCloseTo(h0 + v0 * 20 * 0.05, 6)
  })
  it('aynı tohum aynı tablo, farklı tohum farklı', () => {
    const p = { seed: 7, wind: 0.8, alpha: 0.2, gamma: 0.98, eps: 0.3 }
    const a = makeLearner(p), b = makeLearner(p), c = makeLearner({ ...p, seed: 8 })
    a.ticks(20000); b.ticks(20000); c.ticks(20000)
    expect(Array.from(a.Q)).toEqual(Array.from(b.Q))
    expect(Array.from(a.Q)).not.toEqual(Array.from(c.Q))
    expect(a.Q.length).toBe(N_STATES * THROTTLE.length)
  })
  it('öğrenme: ilk 100 bölümde neredeyse hiç yumuşak iniş yok, eğitim sonunda son 100 bölümün ≥ %90’ı yumuşak; açgözlü uçuş da başarılı', () => {
    const { ep, goal } = train()
    expect(goal).toBe(true)
    const L = makeLearner({ seed: 7, wind: 0.8, alpha: 0.2, gamma: 0.98, eps: 0.3 })
    while (L.log.length < ep) L.ticks(500)
    expect(softRate(L.log, 100, 100)).toBeLessThan(0.05)
    expect(softRate(L.log, 100, ep)).toBeGreaterThanOrEqual(0.9)
    expect(greedyRate(L.Q, 0.8)).toBeGreaterThanOrEqual(0.85)
    expect(greedyRate(new Float64Array(L.Q.length), 0.8)).toBe(0)
  })
  it('görev 1: rüzgârsız ≈ 660, varsayılan ≈ 920, rüzgâr 2’de ≈ 1.420 bölüm; tohum 13 + rüzgâr 2 hedefe ulaşamaz', () => {
    const w0 = train({ wind: 0 }), w8 = train(), w2 = train({ wind: 2 }), s13 = train({ wind: 2, seed: 13 })
    expect(w0.ep).toBeGreaterThan(620); expect(w0.ep).toBeLessThan(700)
    expect(w8.ep).toBeGreaterThan(880); expect(w8.ep).toBeLessThan(960)
    expect(w2.ep).toBeGreaterThan(1380); expect(w2.ep).toBeLessThan(1460)
    expect(w2.ep).toBeGreaterThan(2 * w0.ep)
    expect(s13.goal).toBe(false)
    expect(s13.ep).toBeGreaterThanOrEqual(MAX_EPISODES)
  })
  it('görev 2 ve 3: ε = 0 yine öğrenir ama ≈ 1.550 bölümde; α = 0,05 ≈ 1.800 bölüm', () => {
    const e0 = train({ eps: 0 }), a05 = train({ alpha: 0.05 })
    expect(e0.goal).toBe(true); expect(e0.ep).toBeGreaterThan(1500); expect(e0.ep).toBeLessThan(1600)
    expect(a05.goal).toBe(true); expect(a05.ep).toBeGreaterThan(1750); expect(a05.ep).toBeLessThan(1850)
  })
  it('kare başına iş küçük: 8× hızda bir adım birkaç milisaniyeyi geçmez; gösteri drone’u hareket eder', () => {
    const r = DRONE_INIS.create(defaults(DRONE_INIS))
    for (let i = 0; i < 30; i++) r.step(DRONE_INIS.perFrame * 8) // ısınma
    const h0 = r.view.h
    const t = performance.now()
    for (let i = 0; i < 50; i++) r.step(DRONE_INIS.perFrame * 8)
    expect((performance.now() - t) / 50).toBeLessThan(6)
    expect(r.view.h).not.toBe(h0)
    expect(r.metrics().length).toBeGreaterThanOrEqual(6)
    expect(r.curves!()[0].values.length).toBeGreaterThan(0)
  })
  it('iki dilli metinler dolu, kod satırları ve parametreler tamam', () => {
    const d = DRONE_INIS
    for (const b of [d.title, d.sub, d.story, d.goal, d.model, ...d.steps, ...d.task]) { expect(b.tr.length).toBeGreaterThan(5); expect(b.en.length).toBeGreaterThan(5) }
    expect(d.code.length).toBeGreaterThanOrEqual(15)
    for (const [c, tr, en] of d.code) { expect(c.length).toBeGreaterThan(0); expect(!tr === !en).toBe(true) }
    expect(d.params.map((p) => p.key)).toEqual(expect.arrayContaining(['seed', 'wind', 'eps', 'alpha', 'gamma']))
  })
})
