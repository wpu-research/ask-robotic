import { describe, expect, it, vi } from 'vitest'
import { autoPlan, channelToProp, motorToCtrl, pumpWiring, servoToCtrl, type CtrlRange, type LabView, type WiringPlan } from './wiring'

const R = (name: string, lo: number, hi: number): CtrlRange => ({ name, lo, hi })

describe('servoToCtrl', () => {
  const r = R('hip', -1, 1)
  it('0° alt sınıra, 180° üst sınıra, 90° ortaya oturur', () => {
    expect(servoToCtrl(0, r)).toBe(-1)
    expect(servoToCtrl(180, r)).toBe(1)
    expect(servoToCtrl(90, r)).toBeCloseTo(0, 10)
  })
  it('aralık dışı açı kırpılır (mekanik sınır)', () => {
    expect(servoToCtrl(-30, r)).toBe(-1)
    expect(servoToCtrl(999, r)).toBe(1)
  })
  it('invert yönü ters çevirir', () => {
    expect(servoToCtrl(0, r, { invert: true })).toBe(1)
    expect(servoToCtrl(180, r, { invert: true })).toBe(-1)
  })
  it('dar açı aralığı tam kontrol aralığına yayılır', () => {
    expect(servoToCtrl(60, r, { degMin: 60, degMax: 120 })).toBe(-1)
    expect(servoToCtrl(120, r, { degMin: 60, degMax: 120 })).toBe(1)
    expect(servoToCtrl(90, r, { degMin: 60, degMax: 120 })).toBeCloseTo(0, 10)
  })
  it('sıfır genişlikli açı aralığı bölme hatası vermez', () => {
    expect(servoToCtrl(90, r, { degMin: 90, degMax: 90 })).toBe(-1)
  })
  it('NaN açı alt sınıra düşer, fizik motoruna sızmaz', () => {
    expect(servoToCtrl(NaN, r)).toBe(-1)
    expect(Number.isFinite(servoToCtrl(Infinity, r))).toBe(true)
  })
})

describe('motorToCtrl', () => {
  it('simetrik aralıkta hız doğrudan karşılığını bulur', () => {
    const r = R('wheel', -1, 1)
    expect(motorToCtrl(1, r)).toBe(1)
    expect(motorToCtrl(-1, r)).toBe(-1)
    expect(motorToCtrl(0, r)).toBeCloseTo(0, 10)
    expect(motorToCtrl(0.5, r)).toBeCloseTo(0.5, 10)
  })
  it('asimetrik aralıkta doğrusal oturur', () => {
    const r = R('wheel', 0, 10)
    expect(motorToCtrl(-1, r)).toBe(0)
    expect(motorToCtrl(0, r)).toBe(5)
    expect(motorToCtrl(1, r)).toBe(10)
  })
  it('hız sınır dışına taşarsa kırpılır', () => {
    const r = R('wheel', -2, 2)
    expect(motorToCtrl(5, r)).toBe(2)
    expect(motorToCtrl(-5, r)).toBe(-2)
  })
  it('invert yönü ters çevirir', () => {
    const r = R('wheel', -1, 1)
    expect(motorToCtrl(1, r, { invert: true })).toBe(-1)
  })
  it('NaN hız motoru durdurur, sürüklemez', () => {
    expect(motorToCtrl(NaN, R('wheel', -1, 1))).toBeCloseTo(0, 10)
  })
})

describe('channelToProp', () => {
  const link = { partId: 'hc', prop: 'distanceCm', channel: 'range', scale: 100, min: 2, max: 400 }
  it('metreyi santimetreye çevirir', () => {
    expect(channelToProp(1.5, link)).toBe(150)
  })
  it('özellik sınırlarına kırpar', () => {
    expect(channelToProp(0.001, link)).toBe(2)
    expect(channelToProp(99, link)).toBe(400)
  })
  it('offset uygulanır', () => {
    expect(channelToProp(1, { ...link, offset: 10 })).toBe(110)
  })
  it('scale verilmezse değer olduğu gibi geçer', () => {
    expect(channelToProp(0.5, { partId: 'm', prop: 'ax', channel: 'accel_x' })).toBe(0.5)
  })
})

describe('pumpWiring', () => {
  const ranges = [R('left', -1, 1), R('right', -1, 1), R('head', -1, 1)]
  const labWith = (parts: LabView['state']['parts']): { lab: LabView; set: ReturnType<typeof vi.fn> } => {
    const set = vi.fn()
    return { lab: { state: { parts }, setProp: set }, set }
  }

  it('servo ve DC motoru ilgili kontrol girdilerine yazar', () => {
    const { lab } = labWith({ s1: { servo: { angleDeg: 180 } }, m1: { dcmotor: { speed: -1 } } })
    const plan: WiringPlan = {
      motors: [{ actuator: 'head', partId: 's1', kind: 'servo' }, { actuator: 'left', partId: 'm1', kind: 'dcmotor' }],
      sensors: [],
    }
    const ctrl = [0, 0, 0]
    expect(pumpWiring({ lab, plan, ranges, ctrl, readings: {} })).toBe(2)
    expect(ctrl[2]).toBe(1)   // head ← servo 180°
    expect(ctrl[0]).toBe(-1)  // left ← motor tam geri
    expect(ctrl[1]).toBe(0)   // right bağlı değil: dokunulmadı
  })

  it('bağlanmamış motora dokunmaz; elle sürüş ve blok programı bozulmaz', () => {
    const { lab } = labWith({ s1: { servo: { angleDeg: 90 } } })
    const ctrl = [0.4, 0.7, -0.2]
    pumpWiring({ lab, plan: { motors: [], sensors: [] }, ranges, ctrl, readings: {} })
    expect(ctrl).toEqual([0.4, 0.7, -0.2])
  })

  it('devrede olmayan parça ya da modelde olmayan motor sessizce atlanır', () => {
    const { lab } = labWith({})
    const plan: WiringPlan = {
      motors: [
        { actuator: 'head', partId: 'yok', kind: 'servo' },
        { actuator: 'olmayan-motor', partId: 's1', kind: 'servo' },
      ],
      sensors: [],
    }
    const ctrl = [0, 0, 0]
    expect(pumpWiring({ lab, plan, ranges, ctrl, readings: {} })).toBe(0)
    expect(ctrl).toEqual([0, 0, 0])
  })

  it('parça yanlış türdeyse (servo beklenirken DC motor) sürülmez', () => {
    const { lab } = labWith({ m1: { dcmotor: { speed: 1 } } })
    const plan: WiringPlan = { motors: [{ actuator: 'head', partId: 'm1', kind: 'servo' }], sensors: [] }
    const ctrl = [0, 0, 0]
    expect(pumpWiring({ lab, plan, ranges, ctrl, readings: {} })).toBe(0)
    expect(ctrl[2]).toBe(0)
  })

  it('sensör okumasını devreye yazar', () => {
    const { lab, set } = labWith({})
    const plan: WiringPlan = {
      motors: [],
      sensors: [{ partId: 'hc', prop: 'distanceCm', channel: 'range', scale: 100, min: 2, max: 400 }],
    }
    pumpWiring({ lab, plan, ranges, ctrl: [0, 0, 0], readings: { range: 0.8 } })
    expect(set).toHaveBeenCalledWith('hc', 'distanceCm', 80)
  })

  it('okuması olmayan kanal için setProp çağrılmaz (eski değer korunur)', () => {
    const { lab, set } = labWith({})
    const plan: WiringPlan = { motors: [], sensors: [{ partId: 'hc', prop: 'distanceCm', channel: 'yok' }] }
    pumpWiring({ lab, plan, ranges, ctrl: [0, 0, 0], readings: { range: 1 } })
    expect(set).not.toHaveBeenCalled()
  })
})

describe('autoPlan', () => {
  const ranges = [R('left', -1, 1), R('right', -1, 1)]

  it('servoları ve DC motorları sırayla motorlara bağlar', () => {
    const plan = autoPlan({ parts: [{ id: 'm1', type: 'dcmotor' }, { id: 'm2', type: 'dcmotor' }] }, ranges, [])
    expect(plan.motors).toEqual([
      { actuator: 'left', partId: 'm1', kind: 'dcmotor' },
      { actuator: 'right', partId: 'm2', kind: 'dcmotor' },
    ])
  })

  it('servolar DC motorlardan önce gelir', () => {
    const plan = autoPlan({ parts: [{ id: 'm1', type: 'dcmotor' }, { id: 's1', type: 'servo' }] }, ranges, [])
    expect(plan.motors[0]).toMatchObject({ partId: 's1', kind: 'servo' })
    expect(plan.motors[1]).toMatchObject({ partId: 'm1', kind: 'dcmotor' })
  })

  it('motordan çok sürücü varsa fazlası bağlanmaz', () => {
    const parts = [{ id: 'a', type: 'servo' }, { id: 'b', type: 'servo' }, { id: 'c', type: 'servo' }]
    expect(autoPlan({ parts }, ranges, []).motors).toHaveLength(2)
  })

  it('sürücü olmayan parçalar (LED, direnç) motora bağlanmaz', () => {
    const parts = [{ id: 'l', type: 'led' }, { id: 'r', type: 'resistor' }]
    expect(autoPlan({ parts }, ranges, []).motors).toEqual([])
  })

  it('ultrasonik sensörü mesafe kanalına metre→cm çarpanıyla bağlar', () => {
    const plan = autoPlan({ parts: [{ id: 'hc', type: 'hcsr04' }] }, ranges, ['touch', 'range_front'])
    expect(plan.sensors).toEqual([
      { partId: 'hc', prop: 'distanceCm', channel: 'range_front', scale: 100, min: 2, max: 400 },
    ])
  })

  it('uygun kanal yoksa sensör bağlanmaz', () => {
    expect(autoPlan({ parts: [{ id: 'hc', type: 'hcsr04' }] }, ranges, ['touch']).sensors).toEqual([])
  })

  it('MPU6050 üç ivme eksenini ayrı ayrı bağlar ve g birimine çevirir', () => {
    const plan = autoPlan({ parts: [{ id: 'imu', type: 'mpu6050' }] }, ranges, ['accel_x', 'accel_y', 'accel_z'])
    expect(plan.sensors.map((s) => s.prop)).toEqual(['ax', 'ay', 'az'])
    // 9,81 m/s² = 1 g
    expect(channelToProp(9.81, plan.sensors[0])).toBeCloseTo(1, 6)
  })

  it('boş devre boş plan verir', () => {
    expect(autoPlan({ parts: [] }, ranges, ['range'])).toEqual({ motors: [], sensors: [] })
  })
})
