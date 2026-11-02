import { beforeAll, describe, expect, it } from 'vitest'
import { addAssembly, updateAssembly } from './assembly'
import { designToMjcf } from './mjcf'
import type { RobotDesign } from './tasarim'

/* eslint-disable @typescript-eslint/no-explicit-any */
let mj: any
const MJ_DIR = new URL('../../../public/mujoco/', import.meta.url).pathname
beforeAll(async () => {
  const module = await import(/* @vite-ignore */ `${MJ_DIR}mujoco.js`)
  mj = await module.default({ locateFile: (path: string) => `${MJ_DIR}${path}` })
}, 120_000)

function design(): RobotDesign {
  let nodes = addAssembly([], 'uno')
  nodes = addAssembly(nodes, 'servo')
  nodes = addAssembly(nodes, 'platform', 'asm_2')
  nodes = addAssembly(nodes, 'hcsr04', 'asm_3')
  return { v: 1, name: 'Sensör platformu', chassis: 'orta', parts: [], assembly: nodes }
}

function open(robot: RobotDesign) {
  const result = designToMjcf(robot)
  mj.FS.writeFile('/assembly.xml', result.xml)
  const model = mj.MjModel.mj_loadXML('/assembly.xml')
  const data = new mj.MjData(model)
  mj.mj_resetDataKeyframe(model, data, 0)
  mj.mj_forward(model, data)
  return { model, data, result, dispose: () => { data.delete(); model.delete() } }
}

describe('montaj → gerçek MuJoCo fiziği', () => {
  it('kart, servo, platform ve sensör derlenir; eklemler ve kanallar oluşur', () => {
    const sim = open(design())
    try {
      expect(sim.model.nu).toBe(1)
      expect(sim.model.nq).toBe(8)
      expect(sim.result.actuators).toContain('asm_2_servo')
      expect(sim.result.sensors).toContain('asm_4_distance')
      expect(sim.result.xml).not.toContain('name="kart"')
      expect(sim.model.body_mass[mj.mj_name2id(sim.model, 1, 'asm_2_mount')]).toBeGreaterThan(0)
      expect(sim.model.body_mass[mj.mj_name2id(sim.model, 1, 'asm_3')]).toBeGreaterThan(0.01)
    } finally { sim.dispose() }
  })

  it('servo komutu eklemi ve üzerine bağlı sensörü gerçekten döndürür', () => {
    const sim = open(design())
    try {
      const body = mj.mj_name2id(sim.model, 1, 'asm_4')
      const before = Array.from(sim.data.xquat.slice(body * 4, body * 4 + 4))
      sim.data.ctrl[0] = 0.7
      for (let index = 0; index < 800; index++) mj.mj_step(sim.model, sim.data)
      expect(sim.data.qpos[7]).toBeCloseTo(0.7, 1)
      expect(Array.from(sim.data.xquat.slice(body * 4, body * 4 + 4))).not.toEqual(before)
      expect(Array.from(sim.data.qpos).every(Number.isFinite)).toBe(true)
    } finally { sim.dispose() }
  })

  it('üç eklem ekseni ve iç içe servolar kararlı derlenir', () => {
    for (const axis of ['x', 'y', 'z'] as const) {
      const robot = design()
      robot.assembly = addAssembly(updateAssembly(robot.assembly!, 'asm_2', { axis }), 'servo', 'asm_3')
      const sim = open(robot)
      try {
        expect(sim.model.nu).toBe(2)
        expect(sim.model.nq).toBe(9)
        for (let index = 0; index < 400; index++) mj.mj_step(sim.model, sim.data)
        expect(Array.from(sim.data.qpos).every(Number.isFinite)).toBe(true)
      } finally { sim.dispose() }
    }
  })
})
