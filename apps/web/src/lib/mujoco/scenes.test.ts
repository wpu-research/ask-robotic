// Sahneler gerçek MuJoCo (WASM) ile derlenir; hedeflerin sensör kanalları var, başlangıç kodlarının mantığı hedefe ulaşır.
// WASM yüklemesi birkaç saniye sürer (testler tek model üzerinde yeniden kurulur: bellek sızıntısı olmasın).
import fs from 'node:fs'
import zlib from 'node:zlib'
import { beforeAll, describe, expect, it } from 'vitest'
import { MJ_SCENES } from './scenes'
import { buildChannels, readAll, type Channel } from './sensors'
import { GoalTracker } from './goals'
import { localizeScene, NAMES_EN } from './names-en'
import { unpack, writeToFs } from './pack'

/* eslint-disable @typescript-eslint/no-explicit-any */
let mj: any
beforeAll(async () => {
  const url = new URL('../../../public/mujoco/mujoco.js', import.meta.url).href
  mj = await (await import(/* @vite-ignore */ url)).default()
}, 60_000)

const packed = new Set<string>()
function open(id: string) {
  const sc = MJ_SCENES.find((s) => s.id === id)!
  let path = '/m.xml'
  if (sc.pack) {
    if (!packed.has(sc.pack)) {
      const raw = zlib.gunzipSync(fs.readFileSync(new URL(`../../../public/mujoco/models/${sc.pack}.pack.gz`, import.meta.url)))
      writeToFs(mj.FS, `/models/${sc.pack}`, unpack(new Uint8Array(raw)))
      packed.add(sc.pack)
    }
    path = `/models/${sc.pack}/muroko_scene.xml`
  }
  mj.FS.writeFile(path, sc.xml)
  const m = mj.MjModel.mj_loadXML(path)
  const d = new mj.MjData(m)
  // Uygulamayla aynı kural: `muroko` adlı anahtar kare varsa o, yoksa ilki
  const kId = mj.mj_name2id(m, 24, 'muroko')
  const key = kId >= 0 ? kId : m.nkey > 0 ? 0 : -1
  if (key >= 0) mj.mj_resetDataKeyframe(m, d, key)
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

  it('Franka Panda: şablon küpü tutup kaldırır', () => {
    const r = open('franka-panda')
    const t = new GoalTracker(r.sc.goals)
    const pose = (j2: number, j4: number, j6: number) => { r.motor('actuator2', j2); r.motor('actuator4', j4); r.motor('actuator6', j6) }
    const hold = (sec: number) => { for (let i = 0; i < Math.round(sec / 0.01); i++) { r.step(5); t.update(0.01, r.sensors()) } }
    r.motor('actuator8', 255); pose(0.06, -2.36, 2.4); hold(2.5)
    pose(0.46, -2.36, 2.8); hold(2.5)
    r.motor('actuator8', 0); hold(1.5)
    pose(-0.04, -2.36, 2.35); hold(3)
    expect(r.sensors()['kup.z']).toBeGreaterThan(0.15)
    expect(t.allDone).toBe(true)
    r.done()
  }, 60_000)

  it('Unitree Go1: şablon çömelir ve yükselir, ayakta kalır', () => {
    const r = open('unitree-go1')
    const t = new GoalTracker(r.sc.goals)
    const stance = (th: number, ca: number) => { for (const l of ['FR', 'FL', 'RR', 'RL']) { r.motor(`${l}_thigh`, th); r.motor(`${l}_calf`, ca) } }
    const hold = (sec: number) => { for (let i = 0; i < Math.round(sec / 0.01); i++) { r.step(5); t.update(0.01, r.sensors()) } }
    r.step(1500)
    expect(r.sensors()['govde.z']).toBeGreaterThan(0.22)
    for (const [th, ca, sec] of [[1.3, -2.4, 4], [1.1, -2.1, 2], [0.9, -1.8, 2], [0.75, -1.5, 2], [0.6, -1.2, 4]]) { stance(th, ca); hold(sec) }
    expect(t.state.map((x) => `${x.id}:${x.done}:${x.held.toFixed(1)}`), `z=${r.sensors()['govde.z']}`).toEqual(t.state.map((x) => `${x.id}:true:${x.held.toFixed(1)}`))
    r.done()
  }, 90_000)

  it('Shadow Hand: şablon yumruk yapar', () => {
    const r = open('shadow-el')
    const t = new GoalTracker(r.sc.goals)
    for (const f of ['FF', 'MF', 'RF', 'LF']) { r.motor(`rh_A_${f}J3`, 1.5); r.motor(`rh_A_${f}J0`, 3.0) }
    for (let i = 0; i < 300; i++) { r.step(5); t.update(0.01, r.sensors()) }
    expect(t.allDone).toBe(true)
    r.done()
  }, 60_000)
})

describe('İngilizce adlar (localizeScene)', () => {
  for (const base of MJ_SCENES) {
    const sc = localizeScene(base)
    it(`${sc.id}: İngilizce sahne derlenir; hedef kanalları, Python ve örnek blok adları modelde var`, () => {
      const open2 = (x: typeof sc) => {
        let path = '/m.xml'
        if (x.pack) { open(x.id); path = `/models/${x.pack}/muroko_scene.xml` }  // paketi yükler
        mj.FS.writeFile(path, x.xml)
        const m = mj.MjModel.mj_loadXML(path)
        const names: string[] = Array.from({ length: m.nsensor }, (_: unknown, i: number) => mj.mj_id2name(m, 20, i))
        const chs = buildChannels(names, m.sensor_adr, m.sensor_dim, m.sensor_type).map((c) => c.name)
        const acts: string[] = Array.from({ length: m.nu }, (_: unknown, i: number) => mj.mj_id2name(m, 19, i))
        m.delete()
        return { chs, acts }
      }
      const { chs, acts } = open2(sc)
      for (const g of sc.goals) expect(chs, `${sc.id} hedef ${g.id}`).toContain(g.ch)
      // Python şablonunda geçen motor/sensör adları (dize birleştirme ile kurulanlar hariç)
      for (const m of sc.python.en.matchAll(/(motor|sensor)\(\s*"([^"]+)"\s*[,)]/g)) expect(m[1] === 'motor' ? acts : chs, `${sc.id} python ${m[0]}`).toContain(m[2])
      const walk = (o: unknown): void => {
        if (Array.isArray(o)) o.forEach(walk)
        else if (o && typeof o === 'object') {
          const b = o as { type?: string; fields?: Record<string, unknown> }
          if (b.type === 'muroko_set' || b.type === 'muroko_calc') expect(acts, `${sc.id} blok motoru ${String(b.fields?.U)}`).toContain(String(b.fields?.U))
          if (b.type === 'muroko_if' || b.type === 'muroko_calc') expect(chs, `${sc.id} blok sensörü ${String(b.fields?.S)}`).toContain(String(b.fields?.S))
          Object.values(o).forEach(walk)
        }
      }
      walk(sc.blocks)
    })
  }
  it('adlar Türkçe harf içermez ve eşleme birebir', () => {
    const vals = Object.values(NAMES_EN)
    expect(new Set(vals).size).toBe(vals.length)
    for (const base of MJ_SCENES) expect(localizeScene(base).xml).not.toMatch(/\b(govde|kup|nesne|isaret|jiro)\b/)
  })
})
