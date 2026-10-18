// Drone simülasyonlarının saf matematiği: elle hesaplanan değerler, fiziksel özellikler ve determinizm.
import { describe, expect, it } from 'vitest'
import {
  ALT_DEFAULTS, FUSION_DEFAULTS, G, MISSION_DEFAULTS, Pid, QUAD_X, ROLL_DEFAULTS, batteryMass, complementary, flightTime, hoverPower, idealPower,
  mixQuadX, relThrust, rng, simulateAltitude, simulateFusion, simulateMission, simulateRoll, stepMetrics, throttleFor, thrustToWeight,
} from './physics'

describe('itki/ağırlık ve askıda kalma gazı', () => {
  it('1,2 kg, 4 × 600 gf → İ/A 2; doğrusal modelde askıda %50', () => {
    const r = thrustToWeight({ massKg: 1.2, motors: 4, maxThrustG: 600, thrustModel: 0 })
    expect(r.ratio).toBeCloseTo(2, 10)
    expect(r.hoverThrottle).toBeCloseTo(0.5, 10)
    expect(r.hoverPerMotorG).toBeCloseTo(300, 10)
    expect(r.climbAccel).toBeCloseTo(G, 10)
  })
  it('karesel modelde askıda gaz √(1/İ/A); ara modelde ikisinin arası', () => {
    expect(throttleFor(0.5, 1)).toBeCloseTo(Math.SQRT1_2, 10)
    const mid = throttleFor(0.5, 0.3)
    expect(mid).toBeGreaterThan(0.5); expect(mid).toBeLessThan(Math.SQRT1_2)
    expect(relThrust(mid, 0.3)).toBeCloseTo(0.5, 10)   // ters fonksiyon
  })
  it('itki ağırlıktan azsa kalkamaz', () => {
    const r = thrustToWeight({ massKg: 2, motors: 4, maxThrustG: 400, thrustModel: 0.3 })
    expect(r.canHover).toBe(false)
    expect(r.hoverThrottle).toBe(1)
  })
})

describe('uçuş süresi (momentum teorisi)', () => {
  it('1 kg, 4 × 5": ideal güç motor başına ≈ 21,8 W, elektrik ≈ 168 W (FM 0,65, η 0,8)', () => {
    expect(idealPower(1 * G / 4, 5)).toBeCloseTo(21.8, 1)
    expect(hoverPower(1, 4, 5, 0.65, 0.8)).toBeCloseTo(167.7, 0)
  })
  it('büyük pervane aynı itkiyi daha az güçle verir: P ∝ 1/D', () => {
    expect(idealPower(5, 10) / idealPower(5, 5)).toBeCloseTo(0.5, 10)
  })
  it('kapasite ikiye katlanınca süre artar ama iki katına çıkmaz (batarya kütlesi)', () => {
    const base = { dryKg: 1.1, cells: 4, cRating: 30, propInch: 10, motors: 4, fm: 0.65, drive: 0.8, avionicsA: 0.6, usable: 0.8, whPerKg: 140, maxThrustG: 1000 }
    const a = flightTime({ ...base, mAh: 4000 }), b = flightTime({ ...base, mAh: 8000 })
    expect(b.minutes).toBeGreaterThan(a.minutes)
    expect(b.minutes / a.minutes).toBeLessThan(2)
    // aviyonik akımı olmadan süre ∝ C / m^1,5: oran tam olarak 2 · (m_a / m_b)^1,5
    const a0 = flightTime({ ...base, avionicsA: 0, mAh: 4000 }), b0 = flightTime({ ...base, avionicsA: 0, mAh: 8000 })
    expect(b0.minutes / a0.minutes).toBeCloseTo(2 * (a0.totalKg / b0.totalKg) ** 1.5, 10)
    expect(batteryMass(4, 4000, 140)).toBeCloseTo(4 * 3.7 * 4 / 140, 10)
  })
  it('askıda akım ve dakika birbirini tutar; C sınırı kontrolü', () => {
    const r = flightTime({ dryKg: 0.5, cells: 6, mAh: 1300, cRating: 100, propInch: 5, motors: 4, fm: 0.65, drive: 0.8, avionicsA: 0.6, usable: 0.8, whPerKg: 140, maxThrustG: 1300 })
    expect(r.minutes).toBeCloseTo(0.8 * 1.3 / r.hoverA * 60, 10)
    expect(r.batteryMaxA).toBeCloseTo(130, 10)
    expect(r.peakOk).toBe(r.peakA <= 130)
    expect(flightTime({ dryKg: 0.5, cells: 6, mAh: 1300, cRating: 10, propInch: 5, motors: 4, fm: 0.65, drive: 0.8, avionicsA: 0.6, usable: 0.8, whPerKg: 140, maxThrustG: 1300 }).peakOk).toBe(false)
  })
})

describe('PID ve basamak yanıtı', () => {
  it('stepMetrics: bilinen bir yanıtta aşım, yükselme, oturma', () => {
    // ikinci derece sistemin analitik yanıtı: ζ = 0,5, ωn = 4 → aşım e^(−πζ/√(1−ζ²)) ≈ %16,3
    const z = 0.5, wn = 4, wd = wn * Math.sqrt(1 - z * z)
    const t: number[] = [], y: number[] = []
    for (let k = 0; k <= 10000; k++) { const tk = k / 1000; t.push(tk); y.push(1 - Math.exp(-z * wn * tk) * (Math.cos(wd * tk) + z / Math.sqrt(1 - z * z) * Math.sin(wd * tk))) }
    const m = stepMetrics(t, y, 0, 0, 1)
    expect(m.overshootPct).toBeCloseTo(16.3, 0)
    expect(m.settlingTime).toBeGreaterThan(1.5); expect(m.settlingTime).toBeLessThan(2.2)   // ≈ 4 / (ζ ωn) = 2 s
    expect(m.riseTime).toBeGreaterThan(0.2); expect(m.riseTime).toBeLessThan(0.5)
    expect(Math.abs(m.steadyError)).toBeLessThan(1e-3)
  })
  it('Pid: çıkış sınırlanır ve doymuşken integral büyümez (anti-windup)', () => {
    const p = new Pid({ kp: 1, ki: 10, kd: 0 }, { outMin: -1, outMax: 1 })
    for (let k = 0; k < 1000; k++) expect(p.update(100, 0, 0.01)).toBe(1)
    expect(p.integral).toBe(0)
    // hata işaret değiştirince hemen doymadan çıkar
    expect(p.update(0, 0.5, 0.01)).toBeLessThan(0)
  })
  it('Pid: türev ölçümden alınır; hedef sıçrayınca türev tekmesi yok', () => {
    const p = new Pid({ kp: 0, ki: 0, kd: 5 }, { outMin: -1e9, outMax: 1e9 })
    p.update(0, 0, 0.01)
    expect(p.update(10, 0, 0.01)).toBe(0)
  })
})

describe('irtifa tutma simülasyonu', () => {
  it('varsayılan (Kp 6, Kd 3): aşım ≈ %9,5, kalıcı hata yok, 3 s içinde oturur', () => {
    const r = simulateAltitude(ALT_DEFAULTS)
    expect(r.metrics.overshootPct).toBeGreaterThan(8); expect(r.metrics.overshootPct).toBeLessThan(11)
    expect(Math.abs(r.metrics.steadyError)).toBeLessThan(0.01)
    expect(r.metrics.settlingTime).toBeLessThan(3)
  })
  it('bilinmeyen yük + yalnız P: kalıcı hata Δm g / Kp; I terimi kapatır', () => {
    const p = simulateAltitude({ ...ALT_DEFAULTS, payloadKg: 0.3 })
    expect(p.metrics.steadyError).toBeCloseTo(0.3 * G / 6, 1)
    const pi = simulateAltitude({ ...ALT_DEFAULTS, payloadKg: 0.3, kp: 8, ki: 2, kd: 5 })
    expect(Math.abs(pi.metrics.steadyError)).toBeLessThan(0.03)
    expect(pi.metrics.settlingTime).toBeLessThan(3)
  })
  it('Kd artınca aşım azalır', () => {
    const lo = simulateAltitude({ ...ALT_DEFAULTS, kd: 1 }), hi = simulateAltitude({ ...ALT_DEFAULTS, kd: 4 })
    expect(hi.metrics.overshootPct).toBeLessThan(lo.metrics.overshootPct)
  })
})

describe('yönelim (roll) simülasyonu', () => {
  it('varsayılan kaskad: 20° hedefe ±%5 içinde 1 s\'den önce oturur', () => {
    const r = simulateRoll(ROLL_DEFAULTS)
    expect(r.metrics.settlingTime).toBeLessThan(1)
    expect(r.metrics.overshootPct).toBeLessThan(15)
  })
  it('jiroskop gürültüsü D terimiyle tork gürültüsüne dönüşür; D süzgeci bunu azaltır', () => {
    const noisy = simulateRoll({ ...ROLL_DEFAULTS, rateD: 0.01, gyroNoiseDps: 3 })
    const quiet = simulateRoll({ ...ROLL_DEFAULTS, rateD: 0.01, gyroNoiseDps: 0 })
    const filtered = simulateRoll({ ...ROLL_DEFAULTS, rateD: 0.01, gyroNoiseDps: 3, dCutoffHz: 10 })
    expect(noisy.torqueNoise).toBeGreaterThan(20 * quiet.torqueNoise)
    expect(filtered.torqueNoise).toBeLessThan(noisy.torqueNoise / 2)
  })
  it('bozucu torkta I terimi kalıcı açı hatasını giderir', () => {
    const noI = simulateRoll({ ...ROLL_DEFAULTS, disturbance: 0.05, rateI: 0 })
    const withI = simulateRoll({ ...ROLL_DEFAULTS, disturbance: 0.05, rateI: 0.6 })
    expect(Math.abs(noI.metrics.steadyError)).toBeGreaterThan(2)
    expect(Math.abs(withI.metrics.steadyError)).toBeLessThan(0.3)
  })
  it('aynı tohum → aynı sonuç (deterministik)', () => {
    expect(simulateRoll(ROLL_DEFAULTS).angle).toEqual(simulateRoll(ROLL_DEFAULTS).angle)
    const a = rng(5), b = rng(5)
    expect([a.n(), a.n(), a.u()]).toEqual([b.n(), b.n(), b.u()])
  })
})

describe('quad X karıştırıcı', () => {
  const sum = (m: number[]) => m.reduce((a, b) => a + b, 0)
  it('askıda dört motor eşit; komut yokken toplam = 4 × gaz', () => {
    expect(mixQuadX({ thrust: 0.5, roll: 0, pitch: 0, yaw: 0 }).motors).toEqual([0.5, 0.5, 0.5, 0.5])
  })
  it('roll + sol motorları (M2, M3), pitch + öndekileri (M1, M3), yaw + CCW çifti (M1, M2) hızlandırır; toplam korunur', () => {
    const r = mixQuadX({ thrust: 0.5, roll: 0.2, pitch: 0, yaw: 0 }).motors
    expect(r[1]).toBeCloseTo(0.7); expect(r[2]).toBeCloseTo(0.7); expect(r[0]).toBeCloseTo(0.3); expect(r[3]).toBeCloseTo(0.3)
    const p = mixQuadX({ thrust: 0.5, roll: 0, pitch: 0.1, yaw: 0 }).motors
    expect(p[0]).toBeGreaterThan(0.5); expect(p[2]).toBeGreaterThan(0.5); expect(p[1]).toBeLessThan(0.5)
    const y = mixQuadX({ thrust: 0.5, roll: 0, pitch: 0, yaw: 0.1 }).motors
    expect(QUAD_X.filter((m, i) => y[i] > 0.5).map((m) => m.spin)).toEqual(['ccw', 'ccw'])
    for (const m of [r, p, y]) expect(sum(m)).toBeCloseTo(2, 10)
  })
  it('doyumda gaz aşağı kaydırılır, yuvarlanma farkı korunur', () => {
    const r = mixQuadX({ thrust: 0.95, roll: 0.2, pitch: 0, yaw: 0 })
    expect(Math.max(...r.motors)).toBeCloseTo(1, 10)
    expect(r.motors[1] - r.motors[0]).toBeCloseTo(0.4, 10)
    expect(r.thrustShift).toBeCloseTo(-0.15, 10)
  })
  it('pay kalmayınca önce sapma kısılır; çıkış hep 0..1', () => {
    const r = mixQuadX({ thrust: 0.5, roll: 0.5, pitch: 0, yaw: 0.3 })
    expect(r.yawScale).toBe(0)
    expect(r.motors).toEqual([0, 1, 1, 0])
    for (let k = 0; k < 200; k++) {
      const c = { thrust: (k * 37 % 100) / 100, roll: ((k * 53 % 120) - 60) / 100, pitch: ((k * 71 % 120) - 60) / 100, yaw: ((k * 29 % 120) - 60) / 100 }
      for (const v of mixQuadX(c).motors) { expect(v).toBeGreaterThanOrEqual(0); expect(v).toBeLessThanOrEqual(1) }
    }
  })
  it('airmode kapalıyken sıfır gazda yuvarlanma kırpılır, açıkken korunur', () => {
    expect(mixQuadX({ thrust: 0, roll: 0.2, pitch: 0, yaw: 0 }, false).motors).toEqual([0, 0.2, 0.2, 0])
    const on = mixQuadX({ thrust: 0, roll: 0.2, pitch: 0, yaw: 0 }, true).motors
    expect(on[1] - on[0]).toBeCloseTo(0.4, 10)
  })
})

describe('tamamlayıcı süzgeç', () => {
  it('tek adım: α = τ/(τ+dt) ağırlıklı ortalama', () => {
    const a = 0.5 / 0.504
    expect(complementary(0.1, 0.2, 0.3, 0.004, 0.5)).toBeCloseTo(a * (0.1 + 0.2 * 0.004) + (1 - a) * 0.3, 12)
  })
  it('sabit jiroskop sapması b: yalnız jiroskop b·t kayar, süzgeç b·τ\'da kalır', () => {
    const r = simulateFusion({ ...FUSION_DEFAULTS, profile: 'still', gyroNoiseDps: 0, accNoiseDeg: 0 })
    expect(r.gyro.at(-1)).toBeCloseTo(2 * 20, 6)
    expect(r.fused.at(-1)).toBeCloseTo(2 * 0.5, 3)
  })
  it('manevrada füzyon her iki sensörden de iyi', () => {
    const r = simulateFusion(FUSION_DEFAULTS)
    expect(r.rmse.fused).toBeLessThan(r.rmse.acc / 2)
    expect(r.rmse.fused).toBeLessThan(r.rmse.gyro / 10)
  })
})

describe('ara nokta görevi', () => {
  it('GPS hatasız, rüzgârsız: tüm ara noktalar, pede 10 cm içinde iniş', () => {
    const r = simulateMission({ ...MISSION_DEFAULTS, gpsSigma: 0 })
    expect(r.state.phase).toBe('done')
    expect(r.reached).toBe(MISSION_DEFAULTS.waypoints.length - 1)
    expect(r.state.landingError!).toBeLessThan(0.1)
  })
  it('kamerayla hassas iniş GPS\'le inişten belirgin biçimde iyi (5 tohum ortalaması)', () => {
    const mean = (landing: 'gps' | 'vision') => [1, 2, 3, 4, 5].reduce((a, seed) => a + simulateMission({ ...MISSION_DEFAULTS, landing, seed }).state.landingError!, 0) / 5
    const gps = mean('gps'), vision = mean('vision')
    expect(vision).toBeLessThan(0.15)
    expect(gps).toBeGreaterThan(5 * vision)
  })
  it('8 m/s rüzgârda da görev tamamlanır (hız döngüsü integrali)', () => {
    const r = simulateMission({ ...MISSION_DEFAULTS, wind: { x: 8, y: 0 } })
    expect(r.state.phase).toBe('done')
    expect(r.state.landingError!).toBeLessThan(0.15)
  })
})
