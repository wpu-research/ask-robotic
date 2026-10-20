// Hareket: yamuk profil, PTP eşzamanlılığı ve sınırlar, LIN'in doğruluğu ve başarısızlık hâlleri, PTP'nin eğri izi.
import { describe, expect, it } from 'vitest'
import { PICK_A, PLACE_B } from './cell'
import { HOME, LIMITS, fk, ik, inLimits, poseDown, toRad, type Joints } from './kinematics'
import { JOINT_AMAX, JOINT_VMAX, LIN_VMAX, lineDeviation, planLin, planPath, planPtp, sampleLin, sampledAt, tcpTrace, trapezoid } from './motion'

describe('yamuk hız profili', () => {
  it('uzun mesafede yamuk: süre = d/v + v/a; kısa mesafede üçgen', () => {
    const p = trapezoid(2, 1, 4)
    expect(p.T).toBeCloseTo(2 / 1 + 1 / 4, 12)
    const q = trapezoid(0.1, 1, 4)
    expect(q.T).toBeCloseTo(2 * Math.sqrt(0.1 / 4), 12)
  })
  it('s(0)=0, s(T)=1, monoton artan, ivme sınırını aşmaz', () => {
    const p = trapezoid(1.3, 0.8, 3)
    expect(p.s(0)).toBe(0)
    expect(p.s(p.T)).toBe(1)
    let prev = 0
    for (let i = 1; i <= 200; i++) { const s = p.s((i / 200) * p.T); expect(s).toBeGreaterThanOrEqual(prev - 1e-12); prev = s }
    // sonlu fark ivmesi, a·d üstünde değil
    const h = 1e-3
    for (let t = h; t < p.T - h; t += 0.01) {
      const acc = (p.s(t + h) - 2 * p.s(t) + p.s(t - h)) / (h * h) * 1.3
      expect(Math.abs(acc)).toBeLessThan(3 + 0.05)
    }
  })
  it('sıfır mesafe: süre 0', () => { expect(trapezoid(0, 1, 1).T).toBe(0) })
})

describe('PTP (eklem uzayı)', () => {
  const a = HOME, b = toRad([-40, 55, 70, 30, 60, -20])
  it('bütün eklemler aynı anda varır; ara noktalar iki uç arasında, sınırlar içinde', () => {
    const m = planPtp(a, b)
    const end = m.at(m.duration)
    end.forEach((v, i) => expect(v).toBeCloseTo(b[i], 9))
    for (let i = 0; i <= 50; i++) {
      const q = m.at((i / 50) * m.duration)
      expect(inLimits(q)).toBe(true)
      q.forEach((v, j) => { const lo = Math.min(a[j], b[j]) - 1e-9, hi = Math.max(a[j], b[j]) + 1e-9; expect(v).toBeGreaterThanOrEqual(lo); expect(v).toBeLessThanOrEqual(hi) })
    }
  })
  it('hız yüzdesi süreyi uzatır; hiçbir eklem hız sınırını aşmaz', () => {
    const fast = planPtp(a, b, 100), slow = planPtp(a, b, 25)
    expect(slow.duration).toBeGreaterThan(fast.duration * 1.9)
    const h = 1e-3
    for (let t = 0; t < fast.duration - h; t += 0.02) {
      const q0 = fast.at(t), q1 = fast.at(t + h)
      q1.forEach((v, i) => expect(Math.abs(v - q0[i]) / h).toBeLessThanOrEqual(JOINT_VMAX[i] + 1e-6))
    }
    expect(JOINT_AMAX).toBeGreaterThan(0)
  })
  it('TCP iz eğridir: iki nokta arasında doğrudan sapma 1 cm üstü', () => {
    const qa = ik(poseDown(PICK_A[0], PICK_A[1], 0.25), HOME)[0], qb = ik(poseDown(PLACE_B[0], PLACE_B[1], 0.25), HOME)[0]
    const dev = lineDeviation(tcpTrace(planPtp(qa, qb)))
    expect(dev.maxDev).toBeGreaterThan(0.01)
  })
})

describe('LIN (kartezyen doğru)', () => {
  const A = poseDown(0.5, -0.2, 0.25), B = poseDown(0.5, 0.2, 0.25, 40)
  const qa = ik(A, HOME)[0]
  it('TCP düz çizgide ve hız sınırı içinde; yönelim uca varır', () => {
    const r = sampleLin(A, B, qa)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const trace = r.qs.map((q) => fk(q).p)
    expect(lineDeviation(trace).maxDev).toBeLessThan(1e-9)
    const m = planLin(A, B)
    expect(m.duration).toBeGreaterThanOrEqual(0.4 / LIN_VMAX - 1e-9)
    const last = fk(r.qs[r.qs.length - 1])
    last.p.forEach((v, i) => expect(v).toBeCloseTo(B.p[i], 9))
    last.R.forEach((v, i) => expect(v).toBeCloseTo(B.R[i], 9))
  })
  it('PTP iziyle aynı iki noktada: LIN daha kısa TCP yolu', () => {
    const r = sampleLin(A, B, qa)
    if (!r.ok) throw new Error('LIN başarısız')
    const lin = lineDeviation(r.qs.map((q) => fk(q).p)).length
    const ptp = lineDeviation(tcpTrace(planPtp(qa, ik(B, qa)[0]))).length
    expect(lin).toBeLessThanOrEqual(ptp + 1e-9)
  })
  it('erişim dışına çıkan doğru başarısız olur (unreachable) ve hangi saniyede olduğunu söyler', () => {
    const r = sampleLin(poseDown(0.6, 0, 0.25), poseDown(1.3, 0, 0.25), ik(poseDown(0.6, 0, 0.25), HOME)[0])
    expect(r.ok).toBe(false)
    if (!r.ok) { expect(r.fail.kind).toBe('unreachable'); expect(r.fail.t).toBeGreaterThan(0) }
  })
  it('doğru, bilek merkezini taban ekseninden geçirirse yapılandırma değiştirmek gerekir (flip)', () => {
    const A2 = poseDown(0.25, 0, 0.5), B2 = poseDown(-0.25, 0, 0.5)
    const r = sampleLin(A2, B2, ik(A2, HOME)[0])
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.fail.kind).toBe('flip')
    // aynı iki nokta eklem uzayında (PTP) sorunsuz gidilir
    expect(planPtp(ik(A2, HOME)[0], ik(B2, HOME)[0]).duration).toBeGreaterThan(0)
  })
})

describe('çok noktalı yol ve örnek okuma', () => {
  it('planPath uç noktalara varır ve düzgün ilerler; sampledAt ara değer verir', () => {
    const p: Joints[] = [HOME, toRad([20, 40, 60, 0, 80, 0]), toRad([-30, 20, 80, 10, 70, 10])]
    const m = planPath(p)
    m.at(0).forEach((v, i) => expect(v).toBeCloseTo(p[0][i], 9))
    m.at(m.duration).forEach((v, i) => expect(v).toBeCloseTo(p[2][i], 9))
    expect(sampledAt([p[0], p[1]], 2, 1)[0]).toBeCloseTo((p[0][0] + p[1][0]) / 2, 12)
    expect(LIMITS.length).toBe(6)
  })
})
