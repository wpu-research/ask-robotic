import { describe, expect, it } from 'vitest'
import { Box3, Mesh, Vector3 } from 'three'
import { buildGearmotorModel, buildWheelModel } from './mechanical-models'

describe('mekanik parça görselleri', () => {
  it('lastik sırtı, jant ve metal aksı gerçek teker ölçeğinde üretir', () => {
    const wheel = buildWheelModel(0.028, 0.006)
    expect(wheel.children.length).toBeGreaterThan(50)
    const dimensions = new Box3().setFromObject(wheel).getSize(new Vector3())
    expect(dimensions.x).toBeCloseTo(0.056, 3)
    expect(dimensions.y).toBeCloseTo(0.056, 3)
    expect(dimensions.z).toBeLessThan(0.017)
    expect(wheel.children.every((child) => child instanceof Mesh && child.castShadow)).toBe(true)
  })

  it('redüktör, motor gövdesi, şaft ve vidalar üretir', () => {
    const motor = buildGearmotorModel([0.0084, 0.0084, 0.007])
    expect(motor.children).toHaveLength(8)
    const dimensions = new Box3().setFromObject(motor).getSize(new Vector3())
    expect(dimensions.x).toBeLessThan(0.02)
    expect(dimensions.y).toBeGreaterThan(0.02)
    expect(dimensions.z).toBeLessThan(0.02)
  })
})
