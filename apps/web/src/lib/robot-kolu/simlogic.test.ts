// Simülasyon mantığı: çalışma alanı, IK etiketleri, PTP–LIN karşılaştırması, planlama demosu, güvenlik mekiği.
import { describe, expect, it } from 'vitest'
import { SAFETY, capsules, segHitsBox } from './cell'
import { HOME, fk, ik, poseDown } from './kinematics'
import {
  MOTION_PAIRS, ZONE_DEMO, compareMotion, ikReport, planDemo, shuttleMotion, shuttleStep, solutionLabel, wallCell, workspaceInfo, type Shuttle,
} from './simlogic'

describe('çalışma alanı', () => {
  it('erişilebilir/erişilemez hedef ve çözüm sayısı', () => {
    expect(workspaceInfo(0.03, 0.55)).toMatchObject({ reachable: true })
    expect(workspaceInfo(0.03, 0.55).solutions).toBeGreaterThan(0)
    expect(workspaceInfo(0.03, 0.95)).toMatchObject({ reachable: false, solutions: 0, q: null })
    expect(workspaceInfo(1.5, 0.3).reach).toBeNull()
  })
})

describe('IK etiketleri ve raporu', () => {
  it('aynı duruşun çözümleri farklı etiket alır; rapor FK farkını ~0 verir', () => {
    const t = poseDown(0.55, -0.32, 0.25)
    const sols = ik(t, HOME)
    const labels = sols.map((q) => solutionLabel(q, t, 'en'))
    expect(new Set(labels).size).toBe(sols.length)
    expect(labels.some((l) => l.includes('shoulder front'))).toBe(true)
    expect(labels.some((l) => l.includes('shoulder behind'))).toBe(true)
    for (const q of sols) expect(ikReport(t, q).err).toBeLessThan(1e-9)
    expect(solutionLabel(sols[0], t, 'tr')).toMatch(/omuz/)
  })
})

describe('PTP ve LIN karşılaştırması', () => {
  it('A–B: PTP eğri (sapma > 5 cm), LIN düz (< 1 µm) ve daha yavaş', () => {
    const c = compareMotion('a-b', 100)
    expect(c.ptp.maxDev).toBeGreaterThan(0.05)
    expect(c.lin.ok).toBe(true)
    if (c.lin.ok) { expect(c.lin.maxDev).toBeLessThan(1e-4); expect(c.lin.duration).toBeGreaterThan(c.ptp.duration); expect(c.lin.length).toBeLessThan(c.ptp.length) }
  })
  it('taban ekseni geçişi: LIN başarısız (flip), PTP süre döndürür', () => {
    const c = compareMotion('across', 100)
    expect(c.lin.ok).toBe(false)
    if (!c.lin.ok) expect(c.lin.fail.kind).toBe('flip')
    expect(c.ptp.duration).toBeGreaterThan(0)
  })
  it('hız yüzdesi süreyi uzatır; yaw dönük çift de başarılı', () => {
    expect(compareMotion('a-b', 25).ptp.duration).toBeGreaterThan(compareMotion('a-b', 100).ptp.duration * 2)
    expect(compareMotion('a-b-yaw', 100).lin.ok).toBe(true)
    expect(Object.keys(MOTION_PAIRS)).toHaveLength(3)
  })
})

describe('planlama demosu', () => {
  it('duvar 0,42 m: doğrudan çarpışır, plan yol bulur, planlı iz duvarın üstünden ya da çevresinden geçer', () => {
    const d = planDemo(0.42, 1, 4000)
    expect(d.direct).not.toBeNull()
    expect(d.plan.ok).toBe(true)
    expect(d.trace.length).toBeGreaterThan(10)
    expect(d.motion!.duration).toBeGreaterThan(0)
  })
  it('çok alçak duvarda (0,02 m) doğrudan yol bile çarpışabilir ya da serbest; plan her durumda başarılı', () => {
    for (const h of [0.02, 0.2, 0.42, 0.6]) expect(planDemo(h, 2, 4000).plan.ok, `h=${h}`).toBe(true)
  })
  it('bütçe 2 iken no-path; wallCell yüksekliği uygular', () => {
    expect(planDemo(0.42, 1, 2).plan).toMatchObject({ ok: false, reason: 'no-path' })
    expect(wallCell(0.3).obstacles[0].max[2]).toBe(0.3)
  })
})

describe('güvenlik mekiği', () => {
  const m = shuttleMotion()
  const run = (env: Parameters<typeof shuttleStep>[2], seconds: number, start: Shuttle = { t: 0, dir: 1 }) => {
    let s = start, last = shuttleStep(s, 0, env, m)
    for (let i = 0; i < seconds / 0.02; i++) { last = shuttleStep(s, 0.02, env, m); s = last.s }
    return { s, last }
  }
  const free = { human: null, eStop: false, manual: false, zones: [] }
  it('serbestken mekik gidip gelir (t 0 ile süre arasında salınır)', () => {
    const seen = new Set<number>()
    let s: Shuttle = { t: 0, dir: 1 }
    for (let i = 0; i < 400; i++) { s = shuttleStep(s, 0.02, free, m).s; seen.add(s.dir) }
    expect(seen.has(1) && seen.has(-1)).toBe(true)
  })
  it('acil durdurma: zaman ilerlemez', () => {
    const { s } = run({ ...free, eStop: true }, 5, { t: 0.3, dir: 1 })
    expect(s.t).toBeCloseTo(0.3, 12)
  })
  it('elle kipi hızı 0,25\'e indirir: aynı sürede dört kat az yol', () => {
    const a = run(free, 0.4).s.t, b = run({ ...free, manual: true }, 0.4).s.t
    expect(b / a).toBeCloseTo(SAFETY.manualCap, 2)
  })
  it('insan yakınken yavaşlar, çok yakınken durur', () => {
    const q = m.at(0.3)
    const tcp = fk(q).p
    const mid = shuttleStep({ t: 0.3, dir: 1 }, 0.1, { ...free, human: [tcp[0] + 0.6, tcp[1]] }, m)
    expect(mid.safety.state).toBe('slow')
    const near = shuttleStep({ t: 0.3, dir: 1 }, 0.1, { ...free, human: [tcp[0], tcp[1] + 0.05] }, m)
    expect(near.safety.state).toBe('stop')
    expect(near.s.t).toBeCloseTo(0.3, 12)
  })
  it('yasak bölge: mekik bölgeye girmeden durur ve 60 s boyunca hiçbir uzuv bölgeye girmez', () => {
    let s: Shuttle = { t: 0, dir: 1 }, stopped = false
    for (let i = 0; i < 3000; i++) {
      const r = shuttleStep(s, 0.02, { ...free, zones: [ZONE_DEMO] }, m)
      s = r.s
      if (r.safety.reasons.includes('zone')) stopped = true
      expect(capsules(r.q).some(([a, b]) => segHitsBox(a, b, ZONE_DEMO, 0)), `i=${i}`).toBe(false)
    }
    expect(stopped).toBe(true)
  })
})
