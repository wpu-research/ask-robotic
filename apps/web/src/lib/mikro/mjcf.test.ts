// Üretilen MJCF'i varsaymıyoruz: gerçek MuJoCo WASM'ı ile derleyip modelin içine bakıyoruz.
// Derlenmeyen bir model sessizce geçmesin diye her tasarım fiilen yükleniyor.
import { beforeAll, describe, expect, it } from 'vitest'
import { designToMjcf } from './mjcf'
import { CHASSIS, placePart, type RobotDesign } from './tasarim'

/* eslint-disable @typescript-eslint/no-explicit-any */
let mj: any
const MJ_DIR = new URL('../../../public/mujoco/', import.meta.url).pathname

beforeAll(async () => {
  const mod = await import(/* @vite-ignore */ `${MJ_DIR}mujoco.js`)
  mj = await mod.default({ locateFile: (p: string) => `${MJ_DIR}${p}` })
}, 120_000)

/** XML'i derler ve modelden ad listeleri çıkarır. */
function compile(xml: string) {
  const path = `/t${Math.random().toString(36).slice(2)}.xml`
  mj.FS.writeFile(path, xml)
  const model = mj.MjModel.mj_loadXML(path)
  const data = new mj.MjData(model)
  const names = (objType: number, n: number) =>
    Array.from({ length: n }, (_, i) => mj.mj_id2name(model, objType, i) || '')
  const out = {
    nu: model.nu,
    nsensor: model.nsensor,
    actuators: names(19, model.nu),
    sensors: names(20, model.nsensor),
    ngeom: model.ngeom,
    bodyMass: () => { let t = 0; for (let i = 0; i < model.nbody; i++) t += model.body_mass[i]; return t },
    ctrlrange: Array.from({ length: model.nu }, (_, i) => [model.actuator_ctrlrange[2 * i], model.actuator_ctrlrange[2 * i + 1]] as const),
    step: (n: number) => { for (let i = 0; i < n; i++) mj.mj_step(model, data) },
    z: () => data.qpos[2],
    x: () => data.qpos[0],
    setCtrl: (i: number, v: number) => { data.ctrl[i] = v },
    reset: () => { mj.mj_resetData(model, data); mj.mj_forward(model, data) },
    dispose: () => { data.delete(); model.delete() },
  }
  out.reset()
  return out
}

/** İki tekerli, mesafe sensörlü, pilli küçük bir robot. */
function rover(): RobotDesign {
  let d: RobotDesign = { v: 1, name: 'Gezgin', chassis: 'orta', parts: [] }
  const ch = CHASSIS.orta
  d = placePart(d, 'teker-buyuk', 2, 0)
  d = placePart(d, 'teker-buyuk', 2, ch.rows - 1)
  d = placePart(d, 'motor-std', 1, 1)
  d = placePart(d, 'motor-std', 1, ch.rows - 2)
  d = placePart(d, 'sarhos', ch.cols - 1, Math.floor(ch.rows / 2))
  d = placePart(d, 'ultrasonik', ch.cols - 1, 1)
  d = placePart(d, 'pil-4aa', 0, Math.floor(ch.rows / 2))
  return d
}

describe('tasarım → MJCF', () => {
  it('üretilen model MuJoCo tarafından derlenir', () => {
    const { xml } = designToMjcf(rover())
    const m = compile(xml)
    try {
      expect(m.nu).toBeGreaterThan(0)
      expect(m.nsensor).toBeGreaterThan(0)
    } finally { m.dispose() }
  }, 60_000)

  it('bildirilen motor ve sensör adları modelde gerçekten vardır', () => {
    const res = designToMjcf(rover())
    const m = compile(res.xml)
    try {
      for (const a of res.actuators) expect(m.actuators).toContain(a)
      for (const s of res.sensors) expect(m.sensors).toContain(s)
      expect(m.actuators.length).toBe(res.actuators.length)
      expect(m.sensors.length).toBe(res.sensors.length)
    } finally { m.dispose() }
  }, 60_000)

  it('her teker için bir motor üretilir', () => {
    const res = designToMjcf(rover())
    expect(res.actuators).toHaveLength(2)
  })

  it('motorun hız sınırı tasarımdaki devirden gelir', () => {
    // Standart motor 840 °/s → 14,66 rad/s
    const res = designToMjcf(rover())
    const m = compile(res.xml)
    try {
      const [lo, hi] = m.ctrlrange[0]
      expect(hi).toBeCloseTo((840 * Math.PI) / 180, 2)
      expect(lo).toBeCloseTo(-hi, 6)
    } finally { m.dispose() }
  }, 60_000)

  it('robot zemine düşmeden durur: yerçekimi altında batmaz', () => {
    const { xml } = designToMjcf(rover())
    const m = compile(xml)
    try {
      const z0 = m.z()
      m.step(500) // 1 sn
      expect(m.z()).toBeGreaterThan(z0 - 0.02)
      expect(m.z()).toBeLessThan(z0 + 0.02)
    } finally { m.dispose() }
  }, 60_000)

  it('iki motor da ileri sürülünce robot ilerler', () => {
    const { xml } = designToMjcf(rover())
    const m = compile(xml)
    try {
      m.step(200) // otursun
      const x0 = m.x()
      m.setCtrl(0, 10); m.setCtrl(1, 10)
      m.step(1000) // 2 sn
      expect(Math.abs(m.x() - x0)).toBeGreaterThan(0.02)
    } finally { m.dispose() }
  }, 60_000)

  it('tekersiz tasarım da derlenir ve dürüstçe not düşer', () => {
    const d: RobotDesign = { v: 1, name: 'Durgun', chassis: 'kucuk', parts: [] }
    const res = designToMjcf(d)
    expect(res.actuators).toHaveLength(0)
    expect(res.notes.some((n) => /teker yok/i.test(n.tr))).toBe(true)
    const m = compile(res.xml)
    try { expect(m.nu).toBe(0) } finally { m.dispose() }
  }, 60_000)

  it('her şasi boyu derlenir', () => {
    for (const chassis of ['kucuk', 'orta', 'buyuk'] as const) {
      const d: RobotDesign = { ...rover(), chassis }
      const m = compile(designToMjcf(d).xml)
      try { expect(m.nu).toBeGreaterThanOrEqual(0) } finally { m.dispose() }
    }
  }, 120_000)

  it('Türkçe harfli ve tırnaklı robot adı geçerli XML üretir', () => {
    const d: RobotDesign = { ...rover(), name: 'Çılgın "Şahin" & <Kaplan>' }
    const m = compile(designToMjcf(d).xml)
    try { expect(m.nu).toBe(2) } finally { m.dispose() }
  }, 60_000)

  it('serbest çizilmiş gövde (blok birleşimi) derlenir ve her blok ayrı geom olur', () => {
    // L biçimli içbükey gövde: MuJoCo'da tek dışbükey parçayla anlatılamaz,
    // aynı gövdeye konan iki dışbükey kutuyla anlatılır.
    const d: RobotDesign = {
      ...rover(),
      govde: { v: 1, blocks: [
        { id: 'b1', shape: 'kutu', pos: [0, 0, 0], size: [0.07, 0.05, 0.002], yaw: 0, color: '#db3c8c' },
        { id: 'b2', shape: 'kutu', pos: [0.07, 0.03, 0.01], size: [0.02, 0.02, 0.01], yaw: 0, color: '#2563eb' },
      ] },
    }
    const res = designToMjcf(d)
    expect(res.xml).toContain('govde_0')
    expect(res.xml).toContain('govde_1')
    const m = compile(res.xml)
    try { expect(m.nu).toBe(2) } finally { m.dispose() }
  }, 60_000)

  it('çizilen gövdeyle robot hâlâ yürür', () => {
    const d: RobotDesign = {
      ...rover(),
      govde: { v: 1, blocks: [
        { id: 'b1', shape: 'kutu', pos: [0, 0, 0], size: [0.07, 0.05, 0.002], yaw: 0, color: '#db3c8c' },
        { id: 'b2', shape: 'silindir', pos: [0.05, 0, 0.012], size: [0.02, 0.02, 0.01], yaw: 0, color: '#2563eb' },
      ] },
    }
    const m = compile(designToMjcf(d).xml)
    try {
      m.step(200)
      const x0 = m.x()
      m.setCtrl(0, 10); m.setCtrl(1, 10)
      m.step(1000)
      expect(Math.abs(m.x() - x0)).toBeGreaterThan(0.02)
    } finally { m.dispose() }
  }, 60_000)

  it('silindir ve küre bloklar da derlenir', () => {
    for (const shape of ['silindir', 'kure'] as const) {
      const d: RobotDesign = {
        ...rover(),
        govde: { v: 1, blocks: [{ id: 'b1', shape, pos: [0, 0, 0], size: [0.05, 0.05, 0.01], yaw: 30, color: '#db3c8c' }] },
      }
      const m = compile(designToMjcf(d).xml)
      try { expect(m.nu).toBe(2) } finally { m.dispose() }
    }
  }, 60_000)

  it('bozuk gövde kaydı yok sayılır, tek levhaya düşülür', () => {
    const d = { ...rover(), govde: { v: 1, blocks: [] } } as RobotDesign
    const res = designToMjcf(d)
    expect(res.xml).toContain('name="govde"')
    const m = compile(res.xml)
    try { expect(m.nu).toBe(2) } finally { m.dispose() }
  }, 60_000)

  it('delik fizikte gerçekten var: geom sayısı artar, kütle düşer', () => {
    const plate = { id: 'b1', shape: 'kutu' as const, pos: [0, 0, 0] as [number, number, number], size: [0.07, 0.05, 0.004] as [number, number, number], yaw: 0, color: '#db3c8c' }
    const hole = { id: 'c1', shape: 'kutu' as const, pos: [0, 0, 0] as [number, number, number], size: [0.02, 0.02, 0.02] as [number, number, number], yaw: 0, color: '#000000', cut: true }

    const dolu = compile(designToMjcf({ ...rover(), govde: { v: 1, blocks: [plate] } }).xml)
    const delikli = compile(designToMjcf({ ...rover(), govde: { v: 1, blocks: [plate, hole] } }).xml)
    try {
      // Delik, levhayı dört dilime böler: daha çok geom
      expect(delikli.ngeom).toBeGreaterThan(dolu.ngeom)
      // Ve gövde gerçekten hafifler
      expect(delikli.bodyMass()).toBeLessThan(dolu.bodyMass())
    } finally { dolu.dispose(); delikli.dispose() }
  }, 60_000)

  it('delinmiş gövdeyle robot hâlâ yürür', () => {
    const d: RobotDesign = {
      ...rover(),
      govde: { v: 1, blocks: [
        { id: 'b1', shape: 'kutu', pos: [0, 0, 0], size: [0.07, 0.05, 0.004], yaw: 0, color: '#db3c8c' },
        { id: 'c1', shape: 'kutu', pos: [0, 0, 0], size: [0.02, 0.02, 0.02], yaw: 0, color: '#000', cut: true },
      ] },
    }
    const m = compile(designToMjcf(d).xml)
    try {
      m.step(200)
      const x0 = m.x()
      m.setCtrl(0, 10); m.setCtrl(1, 10)
      m.step(1000)
      expect(Math.abs(m.x() - x0)).toBeGreaterThan(0.02)
    } finally { m.dispose() }
  }, 60_000)

  it('tamamen delinmiş gövde dürüstçe bildirilir ve model yine derlenir', () => {
    const res = designToMjcf({
      ...rover(),
      govde: { v: 1, blocks: [
        { id: 'b1', shape: 'kutu', pos: [0, 0, 0], size: [0.02, 0.02, 0.01], yaw: 0, color: '#db3c8c' },
        { id: 'c1', shape: 'kutu', pos: [0, 0, 0], size: [0.1, 0.1, 0.1], yaw: 0, color: '#000', cut: true },
      ] },
    })
    expect(res.notes.some((n) => /tamamı delinmiş/i.test(n.tr))).toBe(true)
    const m = compile(res.xml)
    try { expect(m.nu).toBe(2) } finally { m.dispose() }
  }, 60_000)

  it('bütün gövde şekilleri MuJoCo tarafından derlenir', () => {
    const SHAPES = ['kutu', 'silindir', 'kure', 'kapsul', 'elipsoid',
      'koni', 'ucgen-prizma', 'alti-prizma', 'kare-piramit', 'besgen-piramit',
      'dortyuzlu', 'sekizyuzlu', 'onikiyuzlu'] as const
    for (const shape of SHAPES) {
      const d = {
        ...rover(),
        govde: { v: 1, blocks: [
          { id: 'b1', shape: 'kutu', pos: [0, 0, 0], size: [0.07, 0.05, 0.003], yaw: 0, color: '#db3c8c' },
          { id: 'b2', shape, pos: [0.05, 0, 0.015], size: [0.015, 0.015, 0.012], yaw: 20, color: '#2563eb' },
        ] },
      } as RobotDesign
      const m = compile(designToMjcf(d).xml)
      try { expect(m.nu, shape).toBe(2) } finally { m.dispose() }
    }
  }, 120_000)

  it('çokyüzlü şekil örgü varlığı olarak yazılır', () => {
    const d = {
      ...rover(),
      govde: { v: 1, blocks: [{ id: 'b1', shape: 'onikiyuzlu', pos: [0, 0, 0], size: [0.05, 0.05, 0.01], yaw: 0, color: '#db3c8c' }] },
    } as RobotDesign
    const xml = designToMjcf(d).xml
    expect(xml).toContain('<asset>')
    expect(xml).toContain('<mesh name="m_govde_0"')
    expect(xml).toContain('type="mesh"')
  })

  it('yerleşik ilkeller için örgü varlığı yazılmaz', () => {
    const d = {
      ...rover(),
      govde: { v: 1, blocks: [{ id: 'b1', shape: 'kapsul', pos: [0, 0, 0], size: [0.03, 0.03, 0.02], yaw: 0, color: '#db3c8c' }] },
    } as RobotDesign
    expect(designToMjcf(d).xml).not.toContain('<asset>')
  })

  it('zemine bakan sensör için yaklaşık karşılandığı not edilir', () => {
    let d = rover()
    const before = d.parts.length
    d = placePart(d, 'cizgi', 4, 1) // kart hücrelerinin (2-3, 1-2) dışında boş bir yer
    expect(d.parts.length).toBe(before + 1) // yerleşmediyse test boşa geçmesin
    const res = designToMjcf(d)
    expect(res.notes.some((n) => /zemin rengi okunamaz/i.test(n.tr))).toBe(true)
  })
})
