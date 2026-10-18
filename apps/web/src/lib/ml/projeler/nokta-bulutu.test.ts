// Nokta bulutu projesi: tarama tekrarlanabilir, DBSCAN ve k-ortalamalar dikilen nesneleri bulur, PCA doğru, "Kendin dene" iddiaları tutar.
import { describe, expect, it } from 'vitest'
import { LESSONS } from '../lessons'
import { NOKTA_BULUTU, N_OBJ, aboveFloor, dbscan3, eig3, evaluate, features, lidarCloud, pca3, runToEnd } from './nokta-bulutu'
import { defaults } from './core'

describe('nokta-bulutu', () => {
  it('aynı tohum aynı bulut; zemin, beş nesne ve aykırılar var', () => {
    const a = lidarCloud(7), b = lidarCloud(7)
    expect(Array.from(a.pos.slice(0, 60))).toEqual(Array.from(b.pos.slice(0, 60)))
    expect(Array.from(lidarCloud(8).pos.slice(0, 6))).not.toEqual(Array.from(a.pos.slice(0, 6)))
    const t = Array.from(a.truth)
    expect(t.filter((x) => x === -2).length).toBe(864)
    expect(t.filter((x) => x === -1).length).toBe(25)
    for (let j = 0; j < N_OBJ; j++) expect(t.filter((x) => x === j).length).toBeGreaterThan(30)
    // zemin eşiği zeminin neredeyse tamamını atar
    const idx = aboveFloor(a)
    expect(idx.filter((i) => a.truth[i] === -2).length).toBeLessThan(5)
  })

  it('DBSCAN varsayılan eps ile beş tohumda da beş nesneyi bulur ve aykırıları gürültü sayar', () => {
    for (const seed of [1, 2, 3, 7, 13]) {
      const { ev } = runToEnd({ ...defaults(NOKTA_BULUTU), seed })
      expect(ev.recovered, `tohum ${seed}`).toBe(N_OBJ)
      expect(ev.K).toBe(N_OBJ)
      expect(ev.noise).toBeGreaterThanOrEqual(15)
      expect(ev.purity).toBeGreaterThan(0.98)
    }
  })

  it('k-ortalamalar k = 5 (10 başlangıçtan en sıkısı) beş nesneyi bulur; aykırılar da kümelere girer', () => {
    for (const seed of [1, 2, 3, 7, 13]) {
      const { ev } = runToEnd({ ...defaults(NOKTA_BULUTU), seed, algo: 0, k: 5 })
      expect(ev.recovered, `tohum ${seed}`).toBe(N_OBJ)
      expect(ev.noise).toBe(0)
      expect(ev.purity).toBeLessThan(0.99)
    }
  })

  it('toplu DBSCAN ile parça parça çalışan koşu aynı sonucu verir', () => {
    const c = lidarCloud(7), idx = aboveFloor(c)
    const { X, D } = features(c.pos, idx, null)
    const e1 = evaluate(idx.map((i) => c.truth[i]), dbscan3(X, D, 0.35))
    const { ev } = runToEnd(defaults(NOKTA_BULUTU))
    expect(e1.recovered).toBe(ev.recovered)
    expect(e1.K).toBe(ev.K)
    expect(e1.noise).toBe(ev.noise)
  })

  it('PCA: özdeğerler sıralı, paylar toplamı 1, düz bir düzlemde en küçük özdeğer ≈ 0', () => {
    const c = lidarCloud(7), p = pca3(c.pos, aboveFloor(c))
    expect(p.vals[0]).toBeGreaterThanOrEqual(p.vals[1])
    expect(p.vals[1]).toBeGreaterThanOrEqual(p.vals[2])
    expect(p.explained.reduce((s, x) => s + x, 0)).toBeCloseTo(1, 9)
    for (const v of p.vecs) expect(Math.hypot(...v)).toBeCloseTo(1, 6)
    // zemin halkaları (z ≈ 0): üçüncü bileşen neredeyse yok ve dikey
    const floor = Array.from({ length: c.n }, (_, i) => i).filter((i) => c.truth[i] === -2)
    const f = pca3(c.pos, floor)
    expect(f.explained[2]).toBeLessThan(0.001)
    expect(Math.abs(f.vecs[2][2])).toBeGreaterThan(0.99)
    // bilinen matris
    const e = eig3([[4, 1, 0], [1, 3, 0], [0, 0, 1]])
    expect(e.vals[0]).toBeCloseTo((7 + Math.sqrt(5)) / 2, 9)
    expect(e.vals[2]).toBeCloseTo(1, 9)
  })

  it('"Kendin dene" iddiaları', () => {
    const base = defaults(NOKTA_BULUTU)
    const small = runToEnd({ ...base, eps: 0.15 }).ev
    expect(small.recovered).toBe(0)
    expect(small.K).toBeGreaterThan(20)
    expect(small.noise).toBeGreaterThan(160)
    const big = runToEnd({ ...base, eps: 1 }).ev
    expect(big.recovered).toBe(N_OBJ)
    expect(big.noise).toBeLessThan(runToEnd(base).ev.noise)
    const k3 = runToEnd({ ...base, algo: 0, k: 3 }).ev
    expect(k3.recovered).toBeLessThanOrEqual(2)
    const pc = runToEnd({ ...base, pca: 1 })
    expect(pc.ev.recovered).toBe(N_OBJ)
    const ex = pc.run.view.pca!.explained
    expect(ex[0] + ex[1]).toBeGreaterThan(0.98)
  })

  it('koşu: aşamalar sırayla, step parçaları küçük, ölçümler ve tablo dolu', () => {
    const run = NOKTA_BULUTU.create(defaults(NOKTA_BULUTU))
    expect(run.view.phase).toBe('scan')
    let frames = 0, worst = 0
    while (!run.done() && frames < 5000) { const t = performance.now(); run.step(NOKTA_BULUTU.perFrame * 8); worst = Math.max(worst, performance.now() - t); frames++ }
    expect(run.done()).toBe(true)
    expect(frames).toBeGreaterThan(20)
    expect(worst).toBeLessThan(200)
    expect(run.status()[1]).toMatch(/^done: 5 \/ 5 objects found/)
    expect(run.metrics().length).toBeGreaterThanOrEqual(5)
    const tb = run.table!()!
    expect(tb.rows).toHaveLength(N_OBJ + 1)
    for (let j = 0; j < N_OBJ; j++) expect(tb.rows[j].cells[j]).toBeGreaterThan(0)
    expect(run.curves!()[0].values.length).toBeGreaterThan(5)
  })

  it('metinler iki dilde dolu, dersler gerçek, kod satırı yorumları eşli', () => {
    const d = NOKTA_BULUTU
    for (const b of [d.title, d.sub, d.story, d.goal, d.model, ...d.steps, ...d.task, ...d.params.map((p) => p.label)]) { expect(b.tr.trim()).not.toBe(''); expect(b.en.trim()).not.toBe('') }
    for (const s of d.lessons) expect(LESSONS.some((l) => l.slug === s), s).toBe(true)
    expect(d.code.length).toBeGreaterThanOrEqual(15)
    for (const [, tr, en] of d.code) expect(!!tr).toBe(!!en)
  })
})
