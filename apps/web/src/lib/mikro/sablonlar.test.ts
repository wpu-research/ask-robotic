// Her şablon gerçekten çalışan bir robot olmalı: MuJoCo'da derlenmeli,
// motoru bulunmalı ve sürülünce yürümeli. Bozuk şablon sessizce geçmesin.
import { beforeAll, describe, expect, it } from 'vitest'
import { designToMjcf } from './mjcf'
import { SABLONLAR } from './sablonlar'
import { normalizeGovde, govdeIssues } from './govde'

/* eslint-disable @typescript-eslint/no-explicit-any */
let mj: any
const MJ_DIR = new URL('../../../public/mujoco/', import.meta.url).pathname
beforeAll(async () => {
  const mod = await import(/* @vite-ignore */ `${MJ_DIR}mujoco.js`)
  mj = await mod.default({ locateFile: (p: string) => `${MJ_DIR}${p}` })
}, 120_000)

function compile(xml: string) {
  const path = `/s${Math.random().toString(36).slice(2)}.xml`
  mj.FS.writeFile(path, xml)
  const model = mj.MjModel.mj_loadXML(path)
  const data = new mj.MjData(model)
  mj.mj_resetData(model, data); mj.mj_forward(model, data)
  return {
    nu: model.nu,
    step: (n: number) => { for (let i = 0; i < n; i++) mj.mj_step(model, data) },
    x: () => data.qpos[0], z: () => data.qpos[2],
    drive: (v: number) => { for (let i = 0; i < model.nu; i++) data.ctrl[i] = v },
    dispose: () => { data.delete(); model.delete() },
  }
}

describe('hazır şablonlar', () => {
  it('kimlikler benzersiz', () => {
    expect(new Set(SABLONLAR.map((s) => s.id)).size).toBe(SABLONLAR.length)
  })

  for (const s of SABLONLAR) {
    describe(s.id, () => {
      it('iki dilde adı ve açıklaması var', () => {
        for (const k of ['tr', 'en', 'trDesc', 'enDesc'] as const) expect(s[k].trim().length).toBeGreaterThan(0)
      })

      it('gövdesi geçerli ve hatasız', () => {
        const d = s.build()
        const g = normalizeGovde(d.govde)
        expect(g).not.toBeNull()
        expect(govdeIssues(g!).filter((i) => i.level === 'hata')).toHaveLength(0)
      })

      it('MuJoCo tarafından derlenir ve motoru vardır', () => {
        const m = compile(designToMjcf(s.build()).xml)
        try { expect(m.nu).toBeGreaterThan(0) } finally { m.dispose() }
      }, 60_000)

      it('yerçekimi altında batmaz ve sürülünce yürür', () => {
        const m = compile(designToMjcf(s.build()).xml)
        try {
          const z0 = m.z()
          m.step(300)
          expect(m.z()).toBeGreaterThan(z0 - 0.03)
          const x0 = m.x()
          m.drive(10)
          m.step(1000)
          expect(Math.abs(m.x() - x0)).toBeGreaterThan(0.01)
        } finally { m.dispose() }
      }, 60_000)
    })
  }
})
