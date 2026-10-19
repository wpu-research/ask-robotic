import { describe, expect, it } from 'vitest'
import { STD_MOTORS, Sim, pinInfo } from './index.js'
import { ANALOG_HEX, BLINK_HEX, BUTTON_HEX, SERIAL_HEX } from './test-fixtures.js'

const lines = (s: string): string[] => s.trim().split(/\r?\n/)

describe('Sim (önceden derlenmiş hex)', () => {
  it('Blink: 1 Hz, %50 doluluk', () => {
    const sim = new Sim(BLINK_HEX)
    sim.run(3000)
    const w = sim.wave(13, 500, 3000)
    expect(w.hz).toBeGreaterThan(0.97)
    expect(w.hz).toBeLessThan(1.03)
    expect(Math.abs(w.duty - 0.5)).toBeLessThan(0.03)
  })

  it('analogRead: 2,5 V ≈ 512', () => {
    const sim = new Sim(ANALOG_HEX)
    sim.analog(0, 2.5)
    sim.run(350)
    expect(Math.abs(Number(lines(sim.serial).at(-1)) - 512)).toBeLessThanOrEqual(2)
    sim.analog('A0', 5)
    sim.serial = ''
    sim.run(350)
    expect(Number(lines(sim.serial).at(-1))).toBeGreaterThanOrEqual(1022)
  })

  it('Serial.begin() (TXEN) olmadan UDR yazımı seri çıktı üretmez', () => {
    const sim = new Sim(BLINK_HEX)
    sim.cpu.writeData(0xc6, 65) // UDR0, TXEN kapalı
    expect(sim.serial).toBe('')
    sim.cpu.writeData(0xc1, 1 << 3) // UCSR0B: TXEN0
    sim.cpu.writeData(0xc6, 66)
    expect(sim.serial).toBe('B')
  })

  it('seri çıktı ve seri giriş', () => {
    const sim = new Sim(SERIAL_HEX)
    sim.run(100)
    expect(sim.serial).toContain('merhaba')
    sim.sendSerial('x')
    sim.run(100)
    expect(sim.serial).toContain('got:x')
  })

  it('tek çağrıda gönderilen çok baytlı seri giriş eksiksiz ulaşır', () => {
    const sim = new Sim(SERIAL_HEX)
    sim.run(100)
    sim.sendSerial('abc')
    sim.run(300)
    expect(sim.serial).toContain('got:a')
    expect(sim.serial).toContain('got:b')
    expect(sim.serial).toContain('got:c')
  })

  it('INPUT_PULLUP buton', () => {
    const sim = new Sim(BUTTON_HEX)
    sim.run(20)
    expect(sim.read(13)).toBe(false)
    sim.drive(2, false) // basılı = LOW
    sim.run(20)
    expect(sim.read(13)).toBe(true)
    sim.drive(2, true)
    sim.run(20)
    expect(sim.read(13)).toBe(false)
    expect(sim.state(2)).toBe('InputPullUp')
  })

  it('pinInfo eşlemesi ve hata', () => {
    expect(pinInfo(13)).toEqual({ port: 'B', bit: 5 })
    expect(pinInfo(3)).toEqual({ port: 'D', bit: 3 })
    expect(pinInfo('A2')).toEqual({ port: 'C', bit: 2 })
    expect(() => pinInfo(99)).toThrow()
  })
})

describe('Dengelenen robot: sensör bozucuları ve itme', () => {
  const RAD = Math.PI / 180
  const make = (o: Parameters<Sim['balancer']>[0] extends infer T ? Partial<T> : never = {}) => {
    const sim = new Sim(BLINK_HEX) // motor pinleri sürülmez: robot kontrolsüz
    const bal = sim.balancer({ motors: STD_MOTORS, theta0Deg: 0, ...o })
    return { sim, bal }
  }

  it('bozucusuz: okunan değer gerçek açıyı izler (ax = sinθ, az = cosθ)', () => {
    const { sim, bal } = make({ theta0Deg: 3 })
    sim.run(2)
    expect(bal.mpu.ax).toBeCloseTo(Math.sin(bal.state.theta), 6)
    expect(bal.mpu.az).toBeCloseTo(Math.cos(bal.state.theta), 6)
  })

  it('ivmeölçer ofseti: okunan açı gerçekten ofset kadar kayar, gerçek durum etkilenmez', () => {
    const a = make({ accelOffsetDeg: 4 }), b = make()
    a.sim.run(5); b.sim.run(5)
    expect(a.bal.state.theta).toBeCloseTo(b.bal.state.theta, 9)
    const okunan = Math.atan2(a.bal.mpu.ax, a.bal.mpu.az) / RAD, gercek = a.bal.thetaDeg
    expect(okunan - gercek).toBeCloseTo(4, 3)
  })

  it('ivmeölçer gürültüsü sınırlıdır ve aynı tohumda aynıdır; farklı tohum farklıdır', () => {
    const seri = (seed: number): number[] => {
      const { sim, bal } = make({ accelNoiseG: 0.05, seed })
      const out: number[] = []
      for (let i = 0; i < 20; i++) { sim.run(1); out.push(bal.mpu.ax - Math.sin(bal.state.theta)) }
      return out
    }
    const s1 = seri(1), s2 = seri(1), s3 = seri(2)
    expect(s1).toEqual(s2)
    expect(s1).not.toEqual(s3)
    expect(Math.max(...s1.map(Math.abs))).toBeLessThanOrEqual(0.05 + 1e-9)
    expect(Math.max(...s1.map(Math.abs))).toBeGreaterThan(0.005)
  })

  it('jiroskop gürültüsü ve sapması: gy = gerçek hız + sapma + gürültü', () => {
    const { sim, bal } = make({ gyroBiasDps: 1, gyroNoiseDps: 0.5, seed: 3 })
    let ort = 0
    const n = 300
    for (let i = 0; i < n; i++) { sim.run(1); ort += bal.mpu.gy - (bal.state.omega * 180) / Math.PI }
    ort /= n
    expect(Math.abs(ort - 1)).toBeLessThan(0.15)
  })

  it('titreşim: ax sinüsle değişir', () => {
    const { sim, bal } = make({ vibrationG: 0.1, vibrationHz: 50 })
    let mx = -1, mn = 1
    for (let i = 0; i < 40; i++) { sim.run(1); const d = bal.mpu.ax - Math.sin(bal.state.theta); mx = Math.max(mx, d); mn = Math.min(mn, d) }
    expect(mx).toBeGreaterThan(0.08); expect(mn).toBeLessThan(-0.08)
  })

  it('push: eğim hızına tam dps ekler; düşmüş robota etki etmez', () => {
    const { sim, bal } = make()
    sim.run(1)
    const w0 = bal.state.omega
    bal.push(200)
    expect((bal.state.omega - w0) / RAD).toBeCloseTo(200, 6)
    bal.state.fell = true
    const w1 = bal.state.omega
    bal.push(500)
    expect(bal.state.omega).toBe(w1)
  })
})
