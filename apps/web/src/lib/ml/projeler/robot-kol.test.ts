// Robot kol projesi: ileri kinematik doğru, aynı tohum aynı koşu, eğitimle ters kinematik hatası 2 cm'nin altına iner,
// "Kendin dene" iddiaları (az nöron, büyük öğrenme oranı, az örnek) tutar.
import { describe, expect, it } from 'vitest'
import { ARM, GOAL_CM, LIMITS, ROBOT_KOL, createKol, decodeOut, dist, encodeOut, fk } from './robot-kol'

let baseRun: ReturnType<typeof createKol> | null = null
/** Varsayılan parametrelerle eğitilmiş koşu (testler arasında paylaşılır). */
const base = () => { if (!baseRun) { baseRun = createKol({ seed: 1 }); baseRun.step(24000) } return baseRun }

describe('robot-kol', () => {
  it('ileri kinematik: bilinen açılar', () => {
    // omuz 90°, dirsek −90°: üst kol dik, ön kol yatay, taban 0 → uç (0,4; 0; 0,7)
    const p = fk([0, Math.PI / 2, -Math.PI / 2])
    expect(p[0]).toBeCloseTo(ARM.L2, 9); expect(p[1]).toBeCloseTo(0, 9); expect(p[2]).toBeCloseTo(ARM.h0 + ARM.L1, 9)
    // taban 90° aynı noktayı y eksenine döndürür
    const q = fk([Math.PI / 2, Math.PI / 2, -Math.PI / 2])
    expect(q[0]).toBeCloseTo(0, 9); expect(q[1]).toBeCloseTo(ARM.L2, 9)
  })
  it('açı kodlaması gidiş-dönüş aynı', () => {
    const q: [number, number, number] = [0.7, 0.9, -1.2]
    decodeOut(encodeOut(q)).forEach((v, i) => expect(v).toBeCloseTo(q[i], 9))
    for (const [lo, hi] of LIMITS) expect(hi).toBeGreaterThan(lo)
  })
  it('aynı tohum aynı koşu, farklı tohum farklı', () => {
    const a = createKol({ seed: 3 }), b = createKol({ seed: 3 }), c = createKol({ seed: 4 })
    a.step(300); b.step(300); c.step(300)
    expect(a.view.err).toBe(b.view.err)
    expect(a.view.err).not.toBe(c.view.err)
  })
  it('varsayılanlarla eğitim: başta hata büyük, hedef (< 2 cm) 24.000 adım içinde', () => {
    expect(createKol({ seed: 1 }).view.err).toBeGreaterThan(20)
    const k = base()
    expect(k.done()).toBe(true)
    expect(k.view.err).toBeLessThan(GOAL_CM)
    expect(k.steps()).toBeLessThan(12000)
    // sahnedeki hedefler de oturur
    k.view.demo.forEach((t, i) => expect(dist(fk(k.view.demoAngles[i]), t) * 100).toBeLessThan(8))
    expect(k.status()[1]).toMatch(/^goal after/)
  }, 120000)
  it('Kendin dene: 4 nöron 7 cm civarında takılır', () => {
    const h4 = createKol({ H: 4, seed: 1 }); h4.step(24000)
    expect(h4.view.err).toBeGreaterThan(5)
    expect(h4.steps()).toBe(24000)
  }, 120000)
  it('Kendin dene: lr 0,03 zıplar ve hedefe iki kattan fazla geç ulaşır', () => {
    const fast = createKol({ lr: 0.03, seed: 1 }); fast.step(24000)
    expect(fast.errHist[15]).toBeGreaterThan(fast.errHist[5]) // 3.000. adım 1.000.'den kötü
    expect(fast.steps()).toBeGreaterThan(2 * base().steps())
  }, 120000)
  it('Kendin dene: 50 örnek ezberler (eğitim kaybı düşük, saklı hata yüksek)', () => {
    const few = createKol({ n: 50, seed: 1 }); few.step(24000)
    expect(few.lossHist.at(-1)!).toBeLessThan(base().lossHist.at(-1)!)
    expect(few.view.err).toBeGreaterThan(5)
  }, 120000)
  it('metinler iki dilde dolu, ölçümler ve eğriler var', () => {
    const d = ROBOT_KOL
    for (const b of [d.title, d.sub, d.story, d.goal, d.model, ...d.steps, ...d.task]) { expect(b.tr.length).toBeGreaterThan(5); expect(b.en.length).toBeGreaterThan(5) }
    expect(d.task.length).toBeGreaterThanOrEqual(2)
    expect(d.code.length).toBeGreaterThanOrEqual(15)
    const k = d.create({ H: 32, lr: 0.01, n: 2000, seed: 1 })
    k.step(2)
    expect(k.metrics().length).toBeGreaterThan(2)
    for (const m of k.metrics()) { expect(m.value[0]).toBeTruthy(); expect(m.value[1]).toBeTruthy() }
    expect(k.curves!().length).toBe(2)
  })
})
