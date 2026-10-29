// Sahneler gerçek MuJoCo (WASM) ile derlenir; hedeflerin sensör kanalları var, başlangıç kodlarının mantığı hedefe ulaşır.
// WASM yüklemesi birkaç saniye sürer (testler tek model üzerinde yeniden kurulur: bellek sızıntısı olmasın).
import { beforeAll, describe, expect, it } from 'vitest'
import { MJ_SCENES } from './scenes'
import { buildChannels, readAll, type Channel } from './sensors'
import { GoalTracker } from './goals'

/* eslint-disable @typescript-eslint/no-explicit-any */
let mj: any
beforeAll(async () => {
  const url = new URL('../../../public/mujoco/mujoco.js', import.meta.url).href
  mj = await (await import(/* @vite-ignore */ url)).default()
}, 60_000)

function open(id: string) {
  const sc = MJ_SCENES.find((s) => s.id === id)!
  mj.FS.writeFile('/m.xml', sc.xml)
  const m = mj.MjModel.mj_loadXML('/m.xml')
  const d = new mj.MjData(m)
  if (m.nkey > 0) mj.mj_resetDataKeyframe(m, d, 0)
  mj.mj_forward(m, d)
  const names = Array.from({ length: m.nsensor }, (_: unknown, i: number) => mj.mj_id2name(m, 20, i))
  const chs: Channel[] = buildChannels(names, m.sensor_adr, m.sensor_dim, m.sensor_type)
  const act: Record<string, number> = {}
  for (let i = 0; i < m.nu; i++) act[mj.mj_id2name(m, 19, i)] = i
  const sensors = () => readAll(chs, d.sensordata)
  const motor = (n: string, v: number) => { d.ctrl[act[n]] = v }
  const step = (n: number) => { for (let i = 0; i < n; i++) mj.mj_step(m, d) }
  return { sc, m, d, chs, sensors, motor, step, done: () => { d.delete(); m.delete() } }
}

describe('MuRoKo sahneleri', () => {
  it.each(MJ_SCENES.map((s) => s.id))('%s: derlenir, 2 sn kararlı, hedef kanalları var', (id) => {
    const r = open(id)
    r.step(1000)
    expect(Array.from(r.d.qpos as ArrayLike<number>).every(Number.isFinite)).toBe(true)
    const names = r.chs.map((c) => c.name)
    for (const g of r.sc.goals) expect(names, `${id} hedefi ${g.id}`).toContain(g.ch)
    expect(r.sc.goals.length).toBeGreaterThan(0)
    r.done()
  })

  it('hiçbir hedef başlangıçta zaten tamam değildir', () => {
    for (const sc of MJ_SCENES) {
      const r = open(sc.id)
      const t = new GoalTracker(sc.goals)
      t.update(0.001, r.sensors())
      sc.goals.forEach((g, i) => { if (g.hold === 0) expect(t.state[i].done, `${sc.id}/${g.id} baştan tamam`).toBe(false) })
      r.done()
    }
  })

  it('arabalı sarkaç: şablondaki PD denetleyici sarkacı 15 sn dik tutar', () => {
    const r = open('arabali-sarkac')
    const t = new GoalTracker(r.sc.goals)
    for (let i = 0; i < 3000; i++) {
      const s = r.sensors()
      r.motor('itme', 3 * s.aci + 0.6 * s.aci_hizi + 0.5 * s.konum_hizi)
      r.step(5)
      t.update(0.01, s)
    }
    expect(t.allDone).toBe(true)
    r.done()
  }, 60_000)

  it('tekerlekli robot: duvara yaklaşınca durma mantığı iki hedefi de tamamlar', () => {
    const r = open('tekerlekli')
    const t = new GoalTracker(r.sc.goals)
    for (let i = 0; i < 2500; i++) {
      const s = r.sensors()
      const v = s.mesafe > 0.3 ? 8 : 0
      r.motor('sol_motor', v); r.motor('sag_motor', v)
      r.step(5)
      t.update(0.01, s)
    }
    expect(t.allDone).toBe(true)
    r.done()
  }, 60_000)

  it('dört bacaklı robot: ayakta kalır, şablondaki eğilme hedefe girer', () => {
    const r = open('dort-bacak')
    const t = new GoalTracker(r.sc.goals)
    r.step(2500)
    for (let i = 0; i < 700; i++) { r.step(5); t.update(0.01, r.sensors()) }
    expect(t.state[0].done).toBe(true)
    for (const a of ['on_sol', 'on_sag', 'arka_sol', 'arka_sag']) { r.motor(`${a}_kalca`, 0.7); r.motor(`${a}_diz`, -1.3) }
    for (let i = 0; i < 1000; i++) { r.step(5); t.update(0.01, r.sensors()) }
    expect(t.allDone).toBe(true)
    r.done()
  }, 60_000)

  it('pençeli kol: şablon küpü yana iter', () => {
    const r = open('kol-pence')
    const t = new GoalTracker(r.sc.goals)
    r.motor('omuz_motoru', 1.3); r.motor('dirsek_motoru', 0.4); r.motor('parmak_sol_motoru', 0.05); r.motor('parmak_sag_motoru', 0.05)
    for (let i = 0; i < 600; i++) { r.step(5); t.update(0.01, r.sensors()) }
    r.motor('taban_motoru', 0.5)
    for (let i = 0; i < 400; i++) { r.step(5); t.update(0.01, r.sensors()) }
    expect(t.allDone).toBe(true)
    r.done()
  }, 60_000)
})
