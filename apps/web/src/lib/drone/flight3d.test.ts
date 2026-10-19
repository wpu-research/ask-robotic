// 3B uçuş fiziği: askıda denge, karıştırıcı → gövde torku işaretleri, 3B irtifa/yönelim PID'inin 1B simlerle aynılığı,
// 3B ara nokta takibi, iniş temas hızı ve determinizm.
import { describe, expect, it } from 'vitest'
import {
  ATT_DEFAULTS, MISSION3D_DEFAULTS, QUAD_DEFAULTS, altitude, bodyTorques, bodyZ, hoverStep, mission3dInit, mission3dStep, m3pos,
  mixerRigStep, quadInit, quadStep, rotation, simulateAltitude3d, simulateAttitude3d, simulateMission3d, torqueToMix, type HoverParams,
} from './flight3d'
import { ALT_DEFAULTS, DEG, G, ROLL_DEFAULTS, mixQuadX, rng, simulateAltitude, simulateRoll, thrustToWeight } from './physics'

const X500: HoverParams = { massKg: 1.6, motors: 4, maxThrustG: 1000, thrustModel: 0.3 }

describe('3B gövde: eksen ve işaret kuralları', () => {
  it('dönüş matrisi ortonormal; üçüncü sütunu bodyZ', () => {
    const att: [number, number, number] = [0.3, -0.2, 1.1]
    const R = rotation(att), z = bodyZ(att)
    expect(R[2]).toBeCloseTo(z[0], 12); expect(R[5]).toBeCloseTo(z[1], 12); expect(R[8]).toBeCloseTo(z[2], 12)
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
      const d = R[i] * R[j] + R[3 + i] * R[3 + j] + R[6 + i] * R[6 + j]
      expect(d).toBeCloseTo(i === j ? 1 : 0, 12)
    }
  })
  it('karıştırıcı → torklar: roll+ → τx+, pitch+ → τy+, yaw+ → τz+; saf komut başka eksene sızmaz', () => {
    const p = QUAD_DEFAULTS
    const tq = (c: { roll?: number; pitch?: number; yaw?: number }) => bodyTorques(p, mixQuadX({ thrust: 0.5, roll: 0, pitch: 0, yaw: 0, ...c }).motors.map((u) => u * p.maxThrustN))
    const r = tq({ roll: 0.1 }), pi = tq({ pitch: 0.1 }), y = tq({ yaw: 0.1 }), z = tq({})
    expect(r[0]).toBeGreaterThan(0); expect(Math.abs(r[1]) + Math.abs(r[2])).toBeLessThan(1e-12)
    expect(pi[1]).toBeGreaterThan(0); expect(Math.abs(pi[0]) + Math.abs(pi[2])).toBeLessThan(1e-12)
    expect(y[2]).toBeGreaterThan(0); expect(Math.abs(y[0]) + Math.abs(y[1])).toBeLessThan(1e-12)
    expect(z.map(Math.abs).reduce((a, b) => a + b)).toBeLessThan(1e-12)
  })
  it('torqueToMix, bodyTorques\'un tersidir (doymasız bölgede)', () => {
    const p = QUAD_DEFAULTS, want: [number, number, number] = [0.12, -0.08, 0.02]
    const mix = mixQuadX(torqueToMix(p, p.massKg * G, want))
    const got = bodyTorques(p, mix.motors.map((u) => u * p.maxThrustN))
    for (let i = 0; i < 3; i++) expect(got[i]).toBeCloseTo(want[i], 10)
    expect(mix.motors.reduce((a, b) => a + b) * p.maxThrustN).toBeCloseTo(p.massKg * G, 9)
  })
  it('yaylı gimbalda: roll+ sağ taraf aşağı (φ>0), pitch+ burun yukarı (θ>0), yaw+ saat yönü (ψ artar)', () => {
    const run = (c: { roll?: number; pitch?: number; yaw?: number }) => {
      const s = quadInit(QUAD_DEFAULTS, { hoverThrust: true })
      for (let k = 0; k < 1500; k++) mixerRigStep(s, QUAD_DEFAULTS, { thrust: 0.5, roll: 0, pitch: 0, yaw: 0, ...c }, true, 0.002)
      return s.att
    }
    expect(run({ roll: 0.05 })[0]).toBeGreaterThan(5 * DEG)
    expect(run({ pitch: 0.05 })[1]).toBeGreaterThan(5 * DEG)
    expect(run({ yaw: 0.2 })[2]).toBeGreaterThan(0.2)
    expect(run({ roll: -0.05 })[0]).toBeLessThan(-5 * DEG)
  })
  it('yatış (roll+) serbest uçuşta sağa (doğuya), burun aşağı (pitch−) ileri (kuzeye) ivmelendirir', () => {
    const go = (att: [number, number, number]) => {
      const s = quadInit(QUAD_DEFAULTS, { pos: [0, 0, -5], att, hoverThrust: true })
      for (let k = 0; k < 100; k++) quadStep(s, QUAD_DEFAULTS, [0.5, 0.5, 0.5, 0.5], 0.002)
      return s.vel
    }
    expect(go([10 * DEG, 0, 0])[1]).toBeGreaterThan(0.1)
    expect(go([0, -10 * DEG, 0])[0]).toBeGreaterThan(0.1)
  })
})

describe('askıda kalma ve itki/ağırlık', () => {
  it('askıda kalma gazında dikey ivme sıfır: irtifa sabit kalır', () => {
    const hov = thrustToWeight({ massKg: X500.massKg, motors: 4, maxThrustG: X500.maxThrustG, thrustModel: X500.thrustModel }).hoverThrottle
    const s = quadInit(QUAD_DEFAULTS, { pos: [0, 0, -2] })
    const T = X500.massKg * G / 4
    s.thrust = [T, T, T, T]
    for (let k = 0; k < 2500; k++) hoverStep(s, X500, hov, 0.002, 10)
    expect(altitude(s)).toBeCloseTo(2, 6)
    expect(Math.abs(s.vel[2])).toBeLessThan(1e-9)
  })
  it('gaz askıda kalma gazının altında yerde kalır, üstünde kalkar ve ipte tutulur', () => {
    const hov = thrustToWeight({ massKg: X500.massKg, motors: 4, maxThrustG: X500.maxThrustG, thrustModel: X500.thrustModel }).hoverThrottle
    const lo = quadInit(QUAD_DEFAULTS), hi = quadInit(QUAD_DEFAULTS)
    for (let k = 0; k < 3000; k++) { hoverStep(lo, X500, hov - 0.03, 0.002); hoverStep(hi, X500, hov + 0.05, 0.002, 4) }
    expect(altitude(lo)).toBe(0)
    expect(altitude(hi)).toBeCloseTo(4, 9)
  })
  it('itki/ağırlık < 1 ise tam gazda bile kalkmaz', () => {
    const heavy: HoverParams = { massKg: 2, motors: 4, maxThrustG: 450, thrustModel: 0.3 }
    const s = quadInit(QUAD_DEFAULTS)
    for (let k = 0; k < 2000; k++) hoverStep(s, heavy, 1, 0.002)
    expect(altitude(s)).toBe(0)
  })
})

describe('3B irtifa PID = 1B irtifa PID', () => {
  it('aynı kazançlarla 3B gövdenin irtifası 1B simle aynı (ek yük ve I dahil)', () => {
    for (const a of [ALT_DEFAULTS, { ...ALT_DEFAULTS, kp: 8, ki: 2, kd: 5, payloadKg: 0.3 }, { ...ALT_DEFAULTS, kp: 20, kd: 1, step: 4 }]) {
      const one = simulateAltitude(a), three = simulateAltitude3d(a)
      let err = 0
      for (let k = 0; k < one.z.length; k++) err = Math.max(err, Math.abs(one.z[k] - three.h[k]))
      expect(err).toBeLessThan(1e-6)
      expect(three.metrics.overshootPct).toBeCloseTo(one.metrics.overshootPct, 3)
      expect(three.metrics.settlingTime).toBeCloseTo(one.metrics.settlingTime, 3)
      // gövde düz kalır
      expect(Math.max(...three.att.map((v) => Math.abs(v[0]) + Math.abs(v[1])))).toBeLessThan(1e-9)
    }
  })
  it('hedefe oturur; bozucu torkla yatınca bile irtifayı tutar', () => {
    const r = simulateAltitude3d({ ...ALT_DEFAULTS, kp: 8, ki: 2, kd: 5 }, { attDisturb: (t) => (t > 4 && t < 4.3 ? [0.05, 0, 0] : [0, 0, 0]) })
    expect(Math.abs(r.h[r.h.length - 1] - 2)).toBeLessThan(0.05)
    expect(Math.max(...r.att.map((v) => Math.abs(v[0])))).toBeGreaterThan(0.5 * DEG)
  })
})

describe('3B yönelim PID = 1B roll simi', () => {
  it('motorlar ve karıştırıcı üzerinden de açı eğrisi aynı (gürültü ve bozucu dahil)', () => {
    for (const rp of [ROLL_DEFAULTS, { ...ROLL_DEFAULTS, gyroNoiseDps: 3, rateD: 0.01, disturbance: 0.05 }]) {
      const one = simulateRoll(rp), three = simulateAttitude3d(rp)
      let err = 0
      for (let k = 0; k < one.angle.length; k++) err = Math.max(err, Math.abs(one.angle[k] - three.roll[k]))
      expect(err).toBeLessThan(1e-6)
    }
  })
  it('karıştırıcı çıkışı: sağa yatış için sol motorlar (M2, M3) sağdakilerden fazla döner', () => {
    const r = simulateAttitude3d(ROLL_DEFAULTS)
    const k = r.t.findIndex((t) => t > 0.25)
    const m = r.motors[k]
    expect(m[1] + m[2]).toBeGreaterThan(m[0] + m[3])
  })
  it('ATT_DEFAULTS yuvarlanma kazançları 1B simle aynı', () => {
    expect(ATT_DEFAULTS.angleP[0]).toBe(ROLL_DEFAULTS.angleP)
    expect(ATT_DEFAULTS.rateP[0]).toBe(ROLL_DEFAULTS.rateP)
  })
})

describe('3B ara nokta görevi ve hassas iniş', () => {
  it('bütün ara noktalara uğrar, pede iner; temas hızı yumuşak', () => {
    const run = simulateMission3d({ ...MISSION3D_DEFAULTS, gpsSigma: 0.5 })
    expect(run.state.phase).toBe('done')
    expect(run.reached).toBe(MISSION3D_DEFAULTS.waypoints.length - 1)
    expect(run.state.touchdownSpeed!).toBeGreaterThan(0)
    expect(run.state.touchdownSpeed!).toBeLessThan(0.8)
    expect(run.time).toBeLessThan(200)
  })
  it('her ara noktanın yakınından geçer (gerçek konum, GPS hatası kabul yarıçapına eklenir)', () => {
    const m = { ...MISSION3D_DEFAULTS, gpsSigma: 0 }
    const r = rng(m.seed), s = mission3dInit(m)
    const best = m.waypoints.map(() => Infinity)
    while (s.phase !== 'done' && s.q.t < 300) {
      mission3dStep(s, m, 0.004, r)
      const p = m3pos(s)
      m.waypoints.forEach((w, i) => { best[i] = Math.min(best[i], Math.hypot(p.x - w.x, p.y - w.y)) })
    }
    for (const b of best) expect(b).toBeLessThan(m.accept + 0.2)
  })
  it('kamera ile iniş GPS ile inişten çok daha isabetli', () => {
    const base = { ...MISSION3D_DEFAULTS, waypoints: [MISSION3D_DEFAULTS.waypoints[3]], gpsSigma: 2 }
    const errs = { gps: 0, vision: 0 }
    for (const seed of [1, 2, 3, 4, 5]) {
      errs.gps += simulateMission3d({ ...base, landing: 'gps', seed }).state.landingError!
      const v = simulateMission3d({ ...base, landing: 'vision', seed }).state
      expect(v.landingError!).toBeLessThan(0.3)
      expect(v.touchdownSpeed!).toBeLessThan(0.8)
      errs.vision += v.landingError!
    }
    expect(errs.vision).toBeLessThan(errs.gps / 3)
  })
  it('rüzgârla da görev biter', () => {
    const run = simulateMission3d({ ...MISSION3D_DEFAULTS, wind: { x: 5, y: 0 }, gust: 1.5 })
    expect(run.state.phase).toBe('done')
  })
})

describe('determinizm', () => {
  it('aynı tohum → aynı 3B görev, aynı yönelim eğrisi', () => {
    const a = simulateMission3d({ ...MISSION3D_DEFAULTS, seed: 21 }), b = simulateMission3d({ ...MISSION3D_DEFAULTS, seed: 21 })
    expect(a.state.q.pos).toEqual(b.state.q.pos)
    expect(a.state.landingError).toBe(b.state.landingError)
    expect(a.time).toBe(b.time)
    const c = simulateMission3d({ ...MISSION3D_DEFAULTS, seed: 22 })
    expect(c.state.q.pos).not.toEqual(a.state.q.pos)
    const r1 = simulateAttitude3d({ ...ROLL_DEFAULTS, gyroNoiseDps: 3 }), r2 = simulateAttitude3d({ ...ROLL_DEFAULTS, gyroNoiseDps: 3 })
    expect(r1.roll).toEqual(r2.roll)
  })
})
