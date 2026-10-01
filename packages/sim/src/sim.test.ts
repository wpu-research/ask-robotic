import { describe, expect, it } from 'vitest'
import { Sim, pinInfo } from './index.js'
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

  it('seri çıktı ve seri giriş', () => {
    const sim = new Sim(SERIAL_HEX)
    sim.run(100)
    expect(sim.serial).toContain('merhaba')
    sim.sendSerial('x')
    sim.run(100)
    expect(sim.serial).toContain('got:x')
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
