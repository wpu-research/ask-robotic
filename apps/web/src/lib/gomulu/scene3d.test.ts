// 3B sahnelerin saf mantığı: Pi keşif robotu (GPIO → tekerlek → poz, kamera konisi, izleme) ve STM32 kartı
// (yazmaç → pin/LED, PWM → motor, dalga biçimi).
import { describe, expect, it } from 'vitest'
import { FOV, WORLD, collides, commandToPins, followPins, newRobot3D, pinsToWheels, seeBall, step } from '@/lib/rpi/robot3d'
import { boardView, motorStep, waveform } from '@/lib/stm32/board3d'
import { resetRegs, setMode, writeBSRR } from '@/lib/stm32/core'

describe('3B keşif robotu', () => {
  it('pin seviyeleri tekerlek hızlarına; komut pinlere ve geri', () => {
    expect(pinsToWheels({ in1: true, in2: false, ena: 1, in3: true, in4: false, enb: 1 }).vl).toBeCloseTo(0.4)
    expect(pinsToWheels({ in1: true, in2: true, ena: 1, in3: false, in4: false, enb: 0 })).toEqual({ vl: 0, vr: 0 })
    const p = commandToPins(0, 0.5)
    expect(p.in1 && !p.in2 && p.in4 && !p.in3).toBe(true) // sağa yerinde dönüş: sol ileri, sağ geri
    const w = pinsToWheels(commandToPins(0.5, 0))
    expect(w.vl).toBeCloseTo(w.vr)
  })
  it('ileri sürüş pozu ilerletir, duvarda durur ve tampon basılır', () => {
    let s = { ...newRobot3D(), pose: { x: 0, y: -1.5, th: -Math.PI / 2 } }
    const fwd = commandToPins(1, 0)
    for (let i = 0; i < 200; i++) s = step(s, fwd, 0.02)
    expect(s.bumped).toBe(true)
    expect(s.pose.y).toBeGreaterThan(-WORLD.half)
    expect(collides(0.8, 0.6)).toBe(true)
    expect(collides(0, 0)).toBe(false)
  })
  it('kamera konisi ve engel arkasındaki top', () => {
    const ball = WORLD.ball
    const facing = { x: ball.x - 1, y: ball.y, th: 0 }
    expect(seeBall(facing).seen).toBe(true)
    expect(seeBall({ ...facing, th: Math.PI }).seen).toBe(false)
    expect(Math.abs(seeBall({ ...facing, th: FOV / 2 - 0.05 }).x)).toBeGreaterThan(0.8)
    const behindBox = { x: 0.8 - 0.8, y: 0.6, th: 0 }
    expect(seeBall(behindBox, { ...WORLD, ball: { x: 1.6, y: 0.6, r: 0.07 } }).seen).toBe(false)
  })
  it('izle kipi topa yaklaşır', () => {
    let s = newRobot3D()
    for (let i = 0; i < 2500; i++) s = step(s, followPins(s.pose), 0.02)
    const v = seeBall(s.pose)
    expect(v.seen).toBe(true)
    expect(v.dist).toBeLessThan(0.6)
  })
})

describe('3B STM32 kartı', () => {
  it('saat kapalıyken pinler yüzer; PA5 çıkış 1 iken LED yanar', () => {
    const r = writeBSRR(setMode(resetRegs(), 5, 'output'), 1 << 5)
    const base = { regs: r, psc: 0, arr: 4199, ccr: 2100, fTim: 84e6, pwmOn: true, dirFwd: true }
    expect(boardView({ ...base, clockOn: false }).led).toBe(false)
    const v = boardView({ ...base, clockOn: true })
    expect(v.led).toBe(true)
    expect(v.duty).toBeCloseTo(0.5)
    expect(v.freq).toBeCloseTo(20_000)
    expect(v.audible).toBe(false)
    expect(boardView({ ...base, clockOn: true, psc: 83, arr: 999 }).audible).toBe(true)
  })
  it('motor PWM gerilimine yaklaşır; dalga biçimi görev oranını taşır', () => {
    let m = { rpm: 0, angle: 0 }
    for (let i = 0; i < 300; i++) m = motorStep(m, 3, 0.01)
    expect(m.rpm).toBeCloseTo(90, 0)
    const w = waveform(99, 25, 2, 40)
    expect(w.filter((x) => x === 1).length / w.length).toBeCloseTo(0.25)
  })
})
