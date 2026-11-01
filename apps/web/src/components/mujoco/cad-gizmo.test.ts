// Tutamaç sürüklemesi tarayıcı ister; sürükleme sonucunu bloğa çeviren matematik
// ise saftır ve burada sınanır.
import { describe, expect, it } from 'vitest'
import { proxyPatch } from './cad-gizmo'

const FREE = { snapM: 0, snapDeg: 0 }
const SNAP = { snapM: 0.005, snapDeg: 15 }

describe('proxyPatch', () => {
  it('konum olduğu gibi geçer', () => {
    expect(proxyPatch([0.1, -0.2, 0.3], 0, [1, 1, 1], 'kutu', FREE).pos).toEqual([0.1, -0.2, 0.3])
  })

  it('kilit kapalıyken açı yuvarlanmaz', () => {
    expect(proxyPatch([0, 0, 0], 37.4, [1, 1, 1], 'kutu', FREE).yaw).toBeCloseTo(37.4, 9)
  })

  it('kilit açıkken açı en yakın 15°ye oturur', () => {
    expect(proxyPatch([0, 0, 0], 37.4, [1, 1, 1], 'kutu', SNAP).yaw).toBe(30)
    expect(proxyPatch([0, 0, 0], 38, [1, 1, 1], 'kutu', SNAP).yaw).toBe(45)
  })

  it('negatif açı 0-360 aralığına döner', () => {
    expect(proxyPatch([0, 0, 0], -90, [1, 1, 1], 'kutu', FREE).yaw).toBe(270)
  })

  it('360 ve üstü sadeleşir', () => {
    expect(proxyPatch([0, 0, 0], 450, [1, 1, 1], 'kutu', FREE).yaw).toBe(90)
  })

  it('kutuda üç ölçü ayrı ayrı değişir', () => {
    expect(proxyPatch([0, 0, 0], 0, [0.01, 0.02, 0.03], 'kutu', FREE).size).toEqual([0.01, 0.02, 0.03])
  })

  it('yuvarlak şekilde yarıçap tektir: x ölçeği y\'ye de uygulanır', () => {
    for (const shape of ['kure', 'silindir', 'kapsul', 'koni'] as const) {
      expect(proxyPatch([0, 0, 0], 0, [0.01, 0.09, 0.03], shape, FREE).size, shape).toEqual([0.01, 0.01, 0.03])
    }
  })

  it('elipsoid yuvarlak sayılmaz: üç yarıçapı ayrıdır', () => {
    expect(proxyPatch([0, 0, 0], 0, [0.01, 0.02, 0.03], 'elipsoid', FREE).size).toEqual([0.01, 0.02, 0.03])
  })

  it('çokyüzlüler kutu gibi serbest ölçeklenir', () => {
    expect(proxyPatch([0, 0, 0], 0, [0.01, 0.02, 0.03], 'onikiyuzlu', FREE).size).toEqual([0.01, 0.02, 0.03])
  })
})
