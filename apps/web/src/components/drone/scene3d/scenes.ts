// Drone dersi 3B uçuş sahneleri. Her sahne lib/drone/flight3d.ts'teki deterministik fiziği oynatır; parametreleri 2B
// simülasyonun denetimlerinden (SimLink) okur, değişince koşuyu yeniden kurar. Geometri bir kez kurulur; karede yalnız konum,
// dönüş, ölçek ve renk değişir. Kaldırınca stage.dispose() bütün geometri, malzeme ve dokuları serbest bırakır.
import * as THREE from 'three'
import type { P3Stage } from '@/components/ml/projeler/stage3d'
import { makeQuadModel, QUAD_X_ROTOR, type QuadModel } from '@/components/ml/projeler/scenes/drone-model'
import {
  MISSION3D_DEFAULTS, QUAD_DEFAULTS, altitude, hoverQuad, hoverStep, m3pos, mission3dInit, mission3dStep, mixerRigStep, quadInit,
  simulateAltitude3d, simulateAttitude3d, type Alt3dResult, type Att3dResult, type HoverParams, type Mission3dParams, type Mission3dState, type QuadState,
} from '@/lib/drone/flight3d'
import {
  ALT_DEFAULTS, DEG, FUSION_DEFAULTS, G, MISSION_DEFAULTS, QUAD_X, ROLL_DEFAULTS, rng, simulateFusion, thrustToWeight,
  type FusionParams, type FusionResult, type MixCmd, type RollParams, type Vec,
} from '@/lib/drone/physics'
import type { SimLink } from '../link'
import { CamRig, attQuat, enTo, makeArrow, makeGround, makeLabel, makePad, makeStreaks, mesh, nedTo, std } from './kit'

type Lang = 'tr' | 'en'
type Bi = { tr: string; en: string }
export interface SceneCtl { key: string; label: Bi; options: Array<[string, Bi]>; value: string }
export interface DroneScene {
  cam: CamRig
  /** Önerilen oynatma hızı (görev sahneleri gerçek zamandan hızlı oynar). */ speed?: number
  controls?: SceneCtl[]
  set?(key: string, v: string): void
  /** dt: oynatma hızıyla çarpılmış süre, s. playing false iken yalnız görünüm güncellenir. */
  frame(dt: number, playing: boolean, realDt: number): void
  restart(): void
  hud(): string
  dispose?(): void
}
export interface SceneArgs { s: P3Stage; link: SimLink; lang: Lang; cfg: Record<string, string> }
export type SceneMount = (a: SceneArgs) => DroneScene

const nf = (lang: Lang, d = 1) => (v: number) => Number.isFinite(v) ? v.toLocaleString(lang === 'en' ? 'en-GB' : 'tr-TR', { minimumFractionDigits: d, maximumFractionDigits: d }) : '∞'
const T = (lang: Lang) => (tr: string, en: string) => (lang === 'en' ? en : tr)
const num = (v: unknown, d: number) => (typeof v === 'number' && Number.isFinite(v) ? v : d)

/** Gökyüzü, sis ve zemin. */
function env(s: P3Stage, size: number, cell: number, hills = 0) {
  s.scene.background = new THREE.Color(0xdfe9f3)
  s.scene.fog = new THREE.Fog(0xdfe9f3, size * 0.45, size * 1.1)
  const g = makeGround(size, cell, { hills })
  s.scene.add(g)
  return g
}

/** Yumuşak gölge lekesi: yükseldikçe küçülür ve soluklaşır. */
function blob(s: P3Stage, r: number) {
  const mat = new THREE.MeshBasicMaterial({ color: 0x0f172a, transparent: true, opacity: 0.3, depthWrite: false })
  const m = new THREE.Mesh(new THREE.CircleGeometry(r, 32), mat)
  m.rotation.x = -Math.PI / 2
  s.scene.add(m)
  return (x: number, z: number, h: number, ground = 0.02) => {
    const k = Math.max(0.25, 1 - h / 14)
    m.position.set(x, ground, z); m.scale.setScalar(k); mat.opacity = 0.32 * k
  }
}

/** Pervaneleri döndürür: hız (rad/s) itkinin kareköküyle orantılı; CCW pervane yukarıdan bakınca saat yönünün tersine (+y). */
function spinner(model: QuadModel, quad: boolean) {
  const ang = model.rotors.map(() => 0)
  return (rel: number[], dt: number) => {
    model.rotors.forEach((r, ri) => {
      const mi = quad ? QUAD_X_ROTOR.indexOf(ri as 0 | 1 | 2 | 3) : ri
      const u = rel[Math.min(mi, rel.length - 1)] ?? 0
      const dir = quad ? (QUAD_X[mi].spin === 'ccw' ? 1 : -1) : (ri % 2 ? -1 : 1)
      ang[ri] += dir * dt * (u > 0.005 ? 12 + 60 * Math.sqrt(u) : 0)
      r.rotation.y = ang[ri]
    })
  }
}

const tri = (x: number) => { const f = x - Math.floor(x); return f < 0.5 ? 2 * f : 2 - 2 * f }

// ---------------------------------------------------------------- 1–2. ünite: askıda kalma ve itki/ağırlık

const hoverScene: SceneMount = ({ s, link, lang }) => {
  const t = T(lang), f1 = nf(lang, 1), f2 = nf(lang, 2)
  env(s, 40, 1)
  const pad = makePad(0.9); s.scene.add(pad.group)
  const TETHER = 4
  // ip sınırı: yarı saydam halka ve bağlama ipi
  const lim = mesh(new THREE.TorusGeometry(0.7, 0.02, 6, 48), std(0x0ea5e9, { transparent: true, opacity: 0.5 }), [0, TETHER, 0], false)
  lim.rotation.x = Math.PI / 2; s.scene.add(lim)
  const limLabel = makeLabel(t('ip sınırı 4 m', 'tether limit 4 m'), { size: 0.28 }); limLabel.sprite.position.set(1.4, TETHER, 0); s.scene.add(limLabel.sprite)
  const ropeGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(0, 1, 0)])
  const rope = new THREE.Line(ropeGeo, new THREE.LineBasicMaterial({ color: 0x334155 }))
  s.scene.add(rope)
  const shadow = blob(s, 0.5)

  const holder = new THREE.Group(); s.scene.add(holder)
  const arrows = new THREE.Group(); s.scene.add(arrows)
  const weight = makeArrow(0xdc2626, 0.035); weight.group.rotation.x = Math.PI; arrows.add(weight.group)
  let model: QuadModel, spin: ReturnType<typeof spinner>, motorArrows: Array<ReturnType<typeof makeArrow>> = []
  let n = 0
  const SC = 0.5
  const build = (motors: number) => {
    if (model) {
      holder.remove(model.group)
      model.group.traverse((o) => { const m = o as THREE.Mesh; m.geometry?.dispose() })
      for (const a of motorArrows) arrows.remove(a.group)
    }
    n = motors
    model = makeQuadModel({ motors })
    model.group.scale.setScalar(SC)
    holder.add(model.group)
    spin = spinner(model, motors === 4)
    motorArrows = model.motorPos.map((p) => { const a = makeArrow(0x2563eb, 0.02); a.group.position.set(p.x * SC, 0.2, p.z * SC); arrows.add(a.group); return a })
  }

  let hp: HoverParams = { massKg: 1.6, motors: 4, maxThrustG: 1000, thrustModel: 0.3 }
  let q: QuadState, tt = 0, rev = -1, thr = 0
  let mode = 'auto', manual = 0.5
  const read = () => {
    const d = link.data
    hp = { massKg: num(d.massKg, 1.6), motors: num(d.motors, 4), maxThrustG: num(d.maxThrustG, 1000), thrustModel: num(d.thrustModel, 0.3) }
    if (hp.motors !== n) build(hp.motors)
  }
  const restart = () => { q = quadInit(hoverQuad(hp)); tt = 0 }
  read(); restart()
  const cam = new CamRig(s, 4, 1.4)
  cam.home([1.9, 0.9, 2.9], new THREE.Vector3(0, 0.9, 0))
  const tw = () => thrustToWeight({ massKg: hp.massKg, motors: hp.motors, maxThrustG: hp.maxThrustG, thrustModel: hp.thrustModel })
  const pos = new THREE.Vector3()

  return {
    cam,
    controls: [{ key: 'thr', label: { tr: 'Gaz', en: 'Throttle' }, value: 'auto', options: [['auto', { tr: 'Otomatik rampa', en: 'Automatic ramp' }], ...[0, 20, 30, 40, 50, 60, 70, 80, 100].map((v) => [String(v / 100), { tr: `%${v}`, en: `${v}%` }] as [string, Bi])] }],
    set(_k, v) { if (v === 'auto') mode = 'auto'; else { mode = 'manual'; manual = +v } },
    restart,
    frame(dt, playing, realDt) {
      if (link.rev !== rev) { rev = link.rev; read(); restart() }
      const r = tw()
      if (playing) {
        const peak = r.canHover ? Math.min(1, r.hoverThrottle + 0.12) : 1
        const steps = Math.min(200, Math.round(dt / 0.002))
        for (let i = 0; i < steps; i++) {
          tt += 0.002
          thr = mode === 'auto' ? peak * tri(tt / 16) : manual
          hoverStep(q, hp, thr, 0.002, TETHER)
        }
      }
      const h = altitude(q)
      nedTo(q.pos, pos)
      holder.position.copy(pos)
      arrows.position.copy(pos)
      const per = q.thrust.reduce((a, b) => a + b, 0) / hp.motors
      const W = hp.massKg * G, k = 1.6 / W
      motorArrows.forEach((a) => a.set(per * k))
      weight.set(W * k); weight.group.position.set(0, 0.05, 0)
      spin(Array(hp.motors).fill(q.cmd[0]), realDt)
      ropeGeo.attributes.position.setXYZ(1, pos.x, pos.y + 0.02, pos.z); ropeGeo.attributes.position.needsUpdate = true
      rope.visible = h > 0.05
      shadow(pos.x, pos.z, h)
      cam.update(new THREE.Vector3(0, Math.max(0.9, h * 0.7 + 0.6), 0), 0, realDt)
    },
    hud() {
      const r = tw(), sum = q.thrust.reduce((a, b) => a + b, 0), W = hp.massKg * G, h = altitude(q)
      const st = !r.canHover ? t('kalkamaz: azami itki ağırlıktan az', 'cannot lift: max thrust below weight')
        : h < 0.01 ? t('yerde', 'on the ground') : h >= TETHER - 1e-6 ? t('ipte gergin', 'tether taut') : Math.abs(q.vel[2]) < 0.05 ? t('askıda', 'hovering') : q.vel[2] < 0 ? t('yükseliyor', 'climbing') : t('alçalıyor', 'descending')
      return `${t('Gaz', 'Throttle')} ${Math.round(thr * 100)}% · ${t('askıda kalma gazı', 'hover throttle')} ${r.canHover ? Math.round(r.hoverThrottle * 100) + '%' : '–'}\n`
        + `${t('Toplam itki', 'Total thrust')} ${f1(sum)} N · ${t('ağırlık', 'weight')} ${f1(W)} N (${t('anlık', 'now')} T/W ${f2(sum / W)})\n`
        + `${t('İrtifa', 'Altitude')} ${f2(h)} m · ${st}\n${t('Mavi ok: motor itkisi · kırmızı: ağırlık', 'Blue arrows: motor thrust · red: weight')}`
    },
  }
}

// ---------------------------------------------------------------- 1. ünite: karıştırıcı, yaylı gimbal test düzeneği

const mixerScene: SceneMount = ({ s, link, lang }) => {
  const t = T(lang), f2 = nf(lang, 2), f3 = nf(lang, 3), f0 = nf(lang, 0)
  env(s, 30, 1)
  const H = 1.5
  s.scene.add(mesh(new THREE.CylinderGeometry(0.5, 0.6, 0.12, 32), std(0x64748b), [0, 0.06, 0]))
  s.scene.add(mesh(new THREE.CylinderGeometry(0.04, 0.05, H, 12), std(0x94a3b8, { metalness: 0.4 }), [0, H / 2, 0]))
  s.scene.add(mesh(new THREE.SphereGeometry(0.08, 16, 12), std(0x334155, { metalness: 0.5 }), [0, H, 0]))
  const model = makeQuadModel()
  const SC = 0.8
  model.group.scale.setScalar(SC)
  const holder = new THREE.Group(); holder.position.set(0, H, 0); holder.add(model.group); s.scene.add(holder)
  model.group.position.y = -0.14 * SC
  const spin = spinner(model, true)
  // motor başına itki çubuğu (kol üstünde) ve etiket
  const barGeo = new THREE.BoxGeometry(0.09, 1, 0.09)
  const bars = QUAD_X.map((_, i) => {
    const p = model.motorPos[QUAD_X_ROTOR[i]]
    const mat = std(0x0f766e, { emissive: new THREE.Color(0x0f766e), emissiveIntensity: 0.2 })
    const b = mesh(barGeo, mat, [p.x * 0.72, 0.2, p.z * 0.72], false)
    model.group.add(b)
    const lab = makeLabel('M', { size: 0.17 })
    lab.sprite.position.set(p.x * 1.55, 0.55, p.z * 1.55)
    model.group.add(lab.sprite)
    return { b, mat, lab }
  })
  const nose = makeLabel(t('burun', 'nose'), { size: 0.15, bg: 'rgba(249,115,22,.85)' }); nose.sprite.position.set(0.95, 0.15, 0); model.group.add(nose.sprite)

  let c: MixCmd = { thrust: 0.5, roll: 0, pitch: 0, yaw: 0 }, airmode = true
  let q = quadInit(QUAD_DEFAULTS, { hoverThrust: true }), last = mixerRigStep(q, QUAD_DEFAULTS, c, airmode, 0)
  let rev = -1
  const restart = () => { q = quadInit(QUAD_DEFAULTS, { hoverThrust: true }); last = mixerRigStep(q, QUAD_DEFAULTS, c, airmode, 0) }
  const cam = new CamRig(s, 3, 1.2)
  cam.home([2.2, 1.3, 2.6], new THREE.Vector3(0, H, 0))
  return {
    cam, restart,
    frame(dt, playing, realDt) {
      if (link.rev !== rev) { rev = link.rev; const d = link.data; c = { thrust: num(d.thrust, 0.5), roll: num(d.roll, 0), pitch: num(d.pitch, 0), yaw: num(d.yaw, 0) }; airmode = d.airmode !== false }
      if (playing) { const n = Math.min(200, Math.round(dt / 0.002)); for (let i = 0; i < n; i++) last = mixerRigStep(q, QUAD_DEFAULTS, c, airmode, 0.002) }
      holder.quaternion.copy(attQuat(q.att))
      spin(q.cmd, realDt)
      bars.forEach((x, i) => {
        const u = last.mix.motors[i], sat = u >= 0.999 || u <= 0.001
        x.b.scale.y = Math.max(0.01, u * 1.1); x.b.position.y = 0.2 + u * 0.55
        x.mat.color.setHex(sat ? 0xdc2626 : 0x0f766e); x.mat.emissive.setHex(sat ? 0xdc2626 : 0x0f766e)
        x.lab.setText(`${QUAD_X[i].id} ${Math.round(u * 100)}%`)
      })
      cam.update(new THREE.Vector3(0, H, 0), 0, realDt)
    },
    hud() {
      const [tx, ty, tz] = last.torque
      return `M1..M4: ${last.mix.motors.map((u) => Math.round(u * 100) + '%').join(' · ')}\n`
        + `${t('Gövde torku', 'Body torque')} τx ${f3(tx)} · τy ${f3(ty)} · τz ${f3(tz)} N·m\n`
        + `${t('Yatış', 'Roll')} ${f0(q.att[0] / DEG)}° · ${t('yunuslama', 'pitch')} ${f0(q.att[1] / DEG)}° · ${t('sapma hızı', 'yaw rate')} ${f0(q.rate[2] / DEG)}°/s\n`
        + `${t('Yaylı test düzeneği: tork açıya, sapma torku dönüşe çevrilir', 'Spring test rig: torque becomes angle, yaw torque becomes rotation')}${last.mix.yawScale < 0.999 ? `\n${t('sapma kısıldı', 'yaw reduced')} → ${f2(last.mix.yawScale)}` : ''}`
    },
  }
}

// ---------------------------------------------------------------- 5. ünite: irtifa PID

const altScene: SceneMount = ({ s, link, lang }) => {
  const t = T(lang), f1 = nf(lang, 1), f2 = nf(lang, 2)
  env(s, 40, 1)
  const pad = makePad(0.9); s.scene.add(pad.group)
  const poleX = 1.6
  s.scene.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 8, 8), std(0x64748b), [poleX, 4, 0]))
  const ticks: Array<ReturnType<typeof makeLabel>> = []
  for (let h = 0; h <= 8; h++) {
    s.scene.add(mesh(new THREE.BoxGeometry(0.22, 0.02, 0.02), std(0x334155), [poleX + 0.11, h, 0], false))
    const l = makeLabel(`${h} m`, { size: 0.2, bg: 'rgba(255,255,255,.7)', color: '#0f172a' }); l.sprite.position.set(poleX + 0.5, h, 0); s.scene.add(l.sprite); ticks.push(l)
  }
  // hedef: yarı saydam disk + halka, ±%2 bandı
  const spMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.18, side: THREE.DoubleSide, depthWrite: false })
  const spDisc = new THREE.Mesh(new THREE.CircleGeometry(1.1, 48), spMat); spDisc.rotation.x = -Math.PI / 2; s.scene.add(spDisc)
  const spRing = mesh(new THREE.TorusGeometry(1.1, 0.025, 6, 64), std(0xf59e0b, { emissive: new THREE.Color(0xf59e0b), emissiveIntensity: 0.4 }), [0, 0, 0], false); spRing.rotation.x = Math.PI / 2; s.scene.add(spRing)
  const band = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 1, 48, 1, true), new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.12, side: THREE.DoubleSide, depthWrite: false })); s.scene.add(band)
  const spLabel = makeLabel('', { size: 0.26, bg: 'rgba(245,158,11,.9)', color: '#1f1300' }); s.scene.add(spLabel.sprite)
  const model = makeQuadModel(); const SC = 0.5; model.group.scale.setScalar(SC)
  const holder = new THREE.Group(); holder.add(model.group); s.scene.add(holder)
  const spin = spinner(model, true)
  const thrust = makeArrow(0x2563eb, 0.03); holder.add(thrust.group); thrust.group.position.y = 0.2
  const weight = makeArrow(0xdc2626, 0.03); weight.group.rotation.x = Math.PI; holder.add(weight.group)
  const shadow = blob(s, 0.5)
  // geçmiş: son 6 s'nin irtifası drone'un arkasında akan bir şerit (2B grafiğin 3B izi)
  const NH = 300
  const histPos = new Float32Array(NH * 3)
  const histGeo = new THREE.BufferGeometry(); histGeo.setAttribute('position', new THREE.BufferAttribute(histPos, 3))
  const hist = new THREE.Line(histGeo, new THREE.LineBasicMaterial({ color: 0x0f766e })); s.scene.add(hist)

  let res: Alt3dResult, prm = ALT_DEFAULTS, tt = 0, rev = -1
  const read = () => {
    const d = link.data
    prm = { ...ALT_DEFAULTS, kp: num(d.kp, ALT_DEFAULTS.kp), ki: num(d.ki, ALT_DEFAULTS.ki), kd: num(d.kd, ALT_DEFAULTS.kd), payloadKg: num(d.payloadKg, 0), step: num(d.step, ALT_DEFAULTS.step) }
    res = simulateAltitude3d(prm, { record: 10 })
    tt = 0
  }
  read()
  const cam = new CamRig(s, 4.5, 1.5)
  cam.home([0.6, 0.6, 6.2], new THREE.Vector3(-0.8, 1.4, 0))
  const idx = () => Math.min(res.t.length - 1, Math.floor(tt / 0.02))
  return {
    cam, restart: () => { tt = 0 },
    frame(dt, playing, realDt) {
      if (link.rev !== rev) { rev = link.rev; read() }
      if (playing) tt = (tt + dt) % (prm.duration + 1.5)
      const k = idx(), h = res.h[k]
      holder.position.set(0, h, 0)
      const Tsum = res.thrust[k], W = prm.massKg * G
      thrust.set(Tsum / W * 0.9); weight.set((prm.massKg + prm.payloadKg) * G / W * 0.9)
      spin(res.motors[k], realDt)
      spDisc.position.y = prm.step; spRing.position.y = prm.step
      band.scale.y = Math.max(0.01, prm.step * 0.04); band.position.y = prm.step
      spLabel.setText(`${t('hedef', 'setpoint')} ${f1(prm.step)} m`); spLabel.sprite.position.set(-1.5, prm.step + 0.4, 0)
      for (let i = 0; i < NH; i++) {
        const tk = res.t[k] - (NH - 1 - i) * 0.02, j = Math.max(0, Math.round(tk / 0.02))
        histPos[i * 3] = -(NH - 1 - i) * 0.02 * 0.6 - 0.5; histPos[i * 3 + 1] = tk < 0 ? 0 : res.h[Math.min(j, res.h.length - 1)]; histPos[i * 3 + 2] = 0
      }
      histGeo.attributes.position.needsUpdate = true
      shadow(0, 0, h, 0.075)
      cam.update(new THREE.Vector3(-0.8, Math.max(1.4, h * 0.7), 0), 0, realDt)
    },
    hud() {
      const k = idx(), m = res.metrics
      return `t = ${f2(res.t[k])} s · ${t('irtifa', 'altitude')} ${f2(res.h[k])} m · ${t('hedef', 'setpoint')} ${f1(res.sp[k])} m\n`
        + `${t('Aşım', 'Overshoot')} ${f1(m.overshootPct)}% · ${t('oturma (±%2)', 'settling (±2%)')} ${Number.isFinite(m.settlingTime) ? f2(m.settlingTime) + ' s' : t('oturmadı', 'not settled')}\n`
        + `${t('Toplam itki / askıda itki', 'Thrust / hover thrust')} ${f2(res.thrust[k] / (prm.massKg * G))}\n${t('Yeşil şerit: son 6 s irtifa (2B grafikle aynı eğri)', 'Green ribbon: last 6 s of altitude (same curve as the 2D plot)')}`
    },
  }
}

// ---------------------------------------------------------------- 6. ünite: yönelim PID, gürültü ve rüzgâr hamlesi (tek eksenli düzenek)

const rollScene: SceneMount = ({ s, link, lang }) => {
  const t = T(lang), f1 = nf(lang, 1), f2 = nf(lang, 2), f3 = nf(lang, 3)
  env(s, 30, 1)
  const H = 1.4
  // gimbal: iki direk ve burun-kuyruk ekseni boyunca mil (yalnız yuvarlanma serbest)
  for (const z of [-1.1, 1.1]) s.scene.add(mesh(new THREE.BoxGeometry(0.08, H, 0.08), std(0x94a3b8, { metalness: 0.3 }), [0, H / 2, z]))
  s.scene.add(mesh(new THREE.BoxGeometry(0.5, 0.08, 2.6), std(0x64748b), [0, 0.04, 0]))
  const axle = mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.2, 10), std(0x334155, { metalness: 0.5 }), [0, H, 0]); axle.rotation.x = Math.PI / 2; s.scene.add(axle)
  const model = makeQuadModel(); const SC = 0.8; model.group.scale.setScalar(SC); model.group.position.y = -0.14 * SC
  const holder = new THREE.Group(); holder.position.set(0, H, 0); holder.add(model.group); s.scene.add(holder)
  const ghost = makeQuadModel({ ghost: 0xf59e0b, opacity: 0.22 }); ghost.group.scale.setScalar(SC); ghost.group.position.y = -0.14 * SC
  const gHolder = new THREE.Group(); gHolder.position.set(0, H, 0); gHolder.add(ghost.group); s.scene.add(gHolder)
  const spin = spinner(model, true)
  const arrows = QUAD_X.map((_, i) => { const p = model.motorPos[QUAD_X_ROTOR[i]]; const a = makeArrow(0x2563eb, 0.025); a.group.position.set(p.x, 0.3, p.z); model.group.add(a.group); return a })
  // rüzgâr hamlesi: soldan (batıdan) gelen çizgiler ve ok
  const streaks = makeStreaks(70, { x: 4, y: 2.4, z: 2, y0: 0.3 }, 0x0369a1); s.scene.add(streaks.lines)
  const gust = makeArrow(0x0369a1, 0.05); gust.group.rotation.z = -Math.PI / 2; gust.group.position.set(-2.6, H - 0.35, 0); s.scene.add(gust.group)
  const gustLabel = makeLabel(t('rüzgâr hamlesi', 'wind gust'), { size: 0.24, bg: 'rgba(3,105,161,.85)' }); gustLabel.sprite.position.set(-2, H + 0.1, 0); s.scene.add(gustLabel.sprite)

  let res: Att3dResult, prm: RollParams = ROLL_DEFAULTS, tt = 0, rev = -1
  const read = () => {
    const d = link.data
    prm = { ...ROLL_DEFAULTS, ...Object.fromEntries(Object.entries(d).filter(([, v]) => typeof v === 'number')) } as RollParams
    res = simulateAttitude3d(prm, { record: 5 })
    tt = 0
  }
  read()
  const cam = new CamRig(s, 3.6, 0.8)
  cam.home([0, 0.5, 4.2], new THREE.Vector3(0, H, 0))   // arkadan görünüş: kuzeye bakar
  const idx = () => Math.min(res.t.length - 1, Math.floor(tt / 0.005))
  const wind = new THREE.Vector3()
  return {
    cam, restart: () => { tt = 0 },
    frame(dt, playing, realDt) {
      if (link.rev !== rev) { rev = link.rev; read() }
      if (playing) tt = (tt + dt * 0.5) % (prm.duration + 0.5)   // yarı hızda (2B canlandırma ile aynı)
      const k = idx()
      holder.quaternion.copy(attQuat([res.roll[k] * DEG, 0, 0]))
      gHolder.quaternion.copy(attQuat([res.sp[k] * DEG, 0, 0]))
      spin(res.motors[k], realDt)
      arrows.forEach((a, i) => a.set(res.motors[k][i] * 1.2))
      const on = res.t[k] >= 1.5 && prm.disturbance > 0
      const str = on ? prm.disturbance / 0.1 : 0
      wind.set(str * 9, 0, 0)
      streaks.update(realDt * 0.5, wind)
      gust.set(on ? 0.4 + str * 1.2 : 0); gustLabel.sprite.visible = on
      cam.update(new THREE.Vector3(0, H, 0), Math.PI, realDt)
    },
    hud() {
      const k = idx(), m = res.metrics
      return `t = ${f2(res.t[k])} s · ${t('yatış', 'roll')} ${f1(res.roll[k])}° · ${t('hedef', 'setpoint')} ${f1(res.sp[k])}° (${t('sarı hayalet', 'yellow ghost')})\n`
        + `${t('Tork komutu', 'Torque command')} ${f3(res.torque[k])} N·m · M1..M4 ${res.motors[k].map((u) => Math.round(u * 100) + '%').join(' ')}\n`
        + `${t('Aşım', 'Overshoot')} ${f1(m.overshootPct)}% · ${t('oturma (±%5)', 'settling (±5%)')} ${Number.isFinite(m.settlingTime) ? Math.round(m.settlingTime * 1000) + ' ms' : t('oturmadı', 'not settled')}\n`
        + `${t('Tek eksenli test düzeneği; bozucu tork t ≥ 1,5 s\'de rüzgâr hamlesi', 'Single-axis test rig; the disturbance torque at t ≥ 1.5 s is a wind gust')}`
    },
  }
}

// ---------------------------------------------------------------- 4. ünite: tamamlayıcı süzgeç, gerçek ve kestirilen yönelim

const fusionScene: SceneMount = ({ s, link, lang }) => {
  const t = T(lang), f1 = nf(lang, 1), f2 = nf(lang, 2)
  env(s, 30, 1)
  const H = 1.6
  s.scene.add(mesh(new THREE.CylinderGeometry(0.4, 0.5, 0.1, 32), std(0x64748b), [0, 0.05, 0]))
  s.scene.add(mesh(new THREE.CylinderGeometry(0.03, 0.04, H - 0.2, 10), std(0x94a3b8), [0, (H - 0.2) / 2, 0]))
  // ufuk çizgisi (0°)
  s.scene.add(mesh(new THREE.BoxGeometry(2.6, 0.012, 0.012), std(0x94a3b8), [0, H, 0.75], false))
  const SC = 0.8
  const mk = (o: Parameters<typeof makeQuadModel>[0]) => {
    const m = makeQuadModel(o); m.group.scale.setScalar(SC); m.group.position.y = -0.14 * SC
    const h = new THREE.Group(); h.position.set(0, H, 0); h.add(m.group); s.scene.add(h)
    return { m, h }
  }
  const truth = mk({}), fused = mk({ ghost: 0xdc2626, opacity: 0.38 }), gyro = mk({ ghost: 0x2563eb, opacity: 0.3 }), acc = mk({ ghost: 0x64748b, opacity: 0.25 })
  const spin = spinner(truth.m, true)
  const labs = ([[truth, t('gerçek', 'true'), 'rgba(15,23,42,.8)'], [fused, t('tamamlayıcı', 'complementary'), 'rgba(220,38,38,.85)'], [gyro, t('jiroskop', 'gyro'), 'rgba(37,99,235,.85)'], [acc, t('ivmeölçer', 'accel.'), 'rgba(100,116,139,.85)']] as const).map(([d, txt, bg], i) => {
    const l = makeLabel(txt, { size: 0.2, bg }); l.sprite.position.set(-1.25 + i * 0.83, H + 0.75, 0); s.scene.add(l.sprite)
    return { d, l }
  })
  let res: FusionResult, prm: FusionParams = FUSION_DEFAULTS, tt = 0, rev = -1, showG = true, showA = true
  const read = () => {
    const d = link.data
    prm = { ...FUSION_DEFAULTS, tau: num(d.tau, FUSION_DEFAULTS.tau), gyroBiasDps: num(d.gyroBiasDps, FUSION_DEFAULTS.gyroBiasDps), gyroNoiseDps: num(d.gyroNoiseDps, FUSION_DEFAULTS.gyroNoiseDps), accNoiseDeg: num(d.accNoiseDeg, FUSION_DEFAULTS.accNoiseDeg), profile: d.profile === 'still' ? 'still' : 'manoeuvre' }
    showG = d.showGyro !== false; showA = d.showAcc !== false
    const key = JSON.stringify(prm)
    if (key !== lastKey) { res = simulateFusion(prm); lastKey = key }
  }
  let lastKey = ''
  read()
  const cam = new CamRig(s, 3.4, 0.6)
  cam.home([0, 0.4, 3.6], new THREE.Vector3(0, H, 0))
  const idx = () => Math.min(res.t.length - 1, Math.floor(tt / prm.dt))
  return {
    cam, restart: () => { tt = 0 },
    frame(dt, playing, realDt) {
      if (link.rev !== rev) { rev = link.rev; read() }
      if (playing) tt = (tt + dt) % prm.duration
      const k = idx()
      truth.h.quaternion.copy(attQuat([res.truth[k] * DEG, 0, 0]))
      fused.h.quaternion.copy(attQuat([res.fused[k] * DEG, 0, 0]))
      gyro.h.quaternion.copy(attQuat([res.gyro[k] * DEG, 0, 0]))
      acc.h.quaternion.copy(attQuat([res.acc[k] * DEG, 0, 0]))
      gyro.h.visible = showG; acc.h.visible = showA
      labs[2].l.sprite.visible = showG; labs[3].l.sprite.visible = showA
      spin([0.5, 0.5, 0.5, 0.5], realDt)
      cam.update(new THREE.Vector3(0, H, 0), Math.PI, realDt)
    },
    hud() {
      const k = idx()
      return `t = ${f1(res.t[k])} s · ${t('gerçek', 'true')} ${f1(res.truth[k])}° · ${t('tamamlayıcı', 'complementary')} ${f1(res.fused[k])}°\n`
        + `${t('Yalnız jiroskop', 'Gyro only')} ${f1(res.gyro[k])}° · ${t('yalnız ivmeölçer', 'accelerometer only')} ${f1(res.acc[k])}°\n`
        + `RMSE: ${t('jiroskop', 'gyro')} ${f2(res.rmse.gyro)}° · ${t('ivmeölçer', 'accel.')} ${f2(res.rmse.acc)}° · ${t('tamamlayıcı', 'complementary')} ${f2(res.rmse.fused)}°\n`
        + `${t('Katı drone gerçek yönelim; hayaletler kestirimler (arkadan görünüş)', 'Solid drone is the true attitude; ghosts are estimates (rear view)')}`
    },
  }
}

// ---------------------------------------------------------------- 7., 9., 10. ünite: 3B ara nokta görevi ve hassas iniş

interface Flyer { model: QuadModel; holder: THREE.Group; spin: ReturnType<typeof spinner>; trail: THREE.Line; trailPos: Float32Array; bubble: THREE.Mesh; link: THREE.Line; cone: THREE.Mesh; touch: THREE.Mesh; label: ReturnType<typeof makeLabel>; shadow: ReturnType<typeof blob> }
const TRAIL_MAX = 3000
const SC_M = 2.2

const missionScene: SceneMount = ({ s, link, lang, cfg }) => {
  const t = T(lang), f1 = nf(lang, 1), f2 = nf(lang, 2)
  env(s, 220, 10, 9)
  // ağaçlar: uçuş alanının dışında, sabit desenle
  const trunk = std(0x7c5a3a), leaf = std(0x4d7c4a, { roughness: 0.9 })
  const tg = new THREE.CylinderGeometry(0.25, 0.3, 2, 6), lg = new THREE.ConeGeometry(1.6, 4, 8)
  for (let i = 0; i < 26; i++) {
    const a = i * 2.399, r = 70 + (i * 37 % 23)
    const x = Math.cos(a) * r, z = Math.sin(a) * r
    s.scene.add(mesh(tg, trunk, [x, 1, z], false)); s.scene.add(mesh(lg, leaf, [x, 4, z], false))
  }
  const home = mesh(new THREE.BoxGeometry(1.4, 0.06, 1.4), std(0x16a34a), [0, 0.03, 0], false); s.scene.add(home)
  const homeL = makeLabel(t('EV', 'HOME'), { size: 0.9, bg: 'rgba(22,163,74,.9)' }); homeL.sprite.position.set(0, 1.4, 0); s.scene.add(homeL.sprite)
  const pad = makePad(2.2); s.scene.add(pad.group)
  const padL = makeLabel(t('PED (ArUco)', 'PAD (ArUco)'), { size: 0.9 }); s.scene.add(padL.sprite)
  // rüzgâr çorabı ve çizgileri
  const sockPole = mesh(new THREE.CylinderGeometry(0.08, 0.08, 5, 8), std(0x64748b), [4, 2.5, 3]); s.scene.add(sockPole)
  const sockPivot = new THREE.Group(); sockPivot.position.set(4, 5, 3); s.scene.add(sockPivot)
  const sock = mesh(new THREE.ConeGeometry(0.45, 2, 16, 1, true), std(0xef4444, { side: THREE.DoubleSide }), [1, 0, 0]); sock.rotation.z = Math.PI / 2; sockPivot.add(sock)
  const streaks = makeStreaks(120, { x: 70, y: 18, z: 70, y0: 1 }); s.scene.add(streaks.lines)
  // ara noktalar: direk + halka + numara; planlanan rota kesikli çizgi
  const wpGroup = new THREE.Group(); s.scene.add(wpGroup)
  const routeGeo = new THREE.BufferGeometry()
  const route = new THREE.Line(routeGeo, new THREE.LineDashedMaterial({ color: 0x475569, dashSize: 1.2, gapSize: 0.8 })); s.scene.add(route)
  let wpRings: THREE.MeshStandardMaterial[] = []

  const mkFlyer = (ghost?: number, name?: string): Flyer => {
    const model = makeQuadModel(ghost !== undefined ? { ghost, opacity: 0.6 } : {}); model.group.scale.setScalar(SC_M)
    const holder = new THREE.Group(); holder.add(model.group); s.scene.add(holder)
    const trailPos = new Float32Array(TRAIL_MAX * 3)
    const tgeo = new THREE.BufferGeometry(); tgeo.setAttribute('position', new THREE.BufferAttribute(trailPos, 3)); tgeo.setDrawRange(0, 0)
    const trail = new THREE.Line(tgeo, new THREE.LineBasicMaterial({ color: ghost ?? 0x0f766e })); s.scene.add(trail)
    const bubble = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), new THREE.MeshBasicMaterial({ color: 0xdc2626, transparent: true, opacity: 0.16, depthWrite: false })); s.scene.add(bubble)
    const lgeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()])
    const lk = new THREE.Line(lgeo, new THREE.LineBasicMaterial({ color: 0xdc2626 })); s.scene.add(lk)
    const cone = new THREE.Mesh(new THREE.ConeGeometry(1.8, 4, 24, 1, true), new THREE.MeshBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.18, side: THREE.DoubleSide, depthWrite: false })); s.scene.add(cone)
    const touch = mesh(new THREE.TorusGeometry(0.45, 0.08, 6, 24), std(ghost ?? 0x0f766e, { emissive: new THREE.Color(ghost ?? 0x0f766e), emissiveIntensity: 0.6 }), [0, 0.12, 0], false); touch.rotation.x = Math.PI / 2; s.scene.add(touch)
    const label = makeLabel(name ?? '', { size: 0.8, bg: ghost !== undefined ? 'rgba(220,38,38,.85)' : 'rgba(15,118,110,.9)' }); s.scene.add(label.sprite); label.sprite.visible = !!name
    return { model, holder, spin: spinner(model, true), trail, trailPos, bubble, link: lk, cone, touch, label, shadow: blob(s, 0.9) }
  }
  const main = mkFlyer(undefined, undefined)
  const gpsF = mkFlyer(0xdc2626, t('yalnız GPS', 'GPS only'))

  let mode = cfg.landing === 'vision' ? 'compare' : 'route'
  let base: Mission3dParams = MISSION3D_DEFAULTS
  let runs: Array<{ m: Mission3dParams; st: Mission3dState; r: ReturnType<typeof rng>; f: Flyer }> = []
  let rev = -1, acc = 0

  const layout = (wps: Vec[], start: Vec) => {
    wpGroup.children.slice().forEach((c) => { wpGroup.remove(c); c.traverse((o) => { const m = o as THREE.Mesh; m.geometry?.dispose(); (m.material as THREE.Material | undefined)?.dispose?.() }) })
    wpRings = []
    const alt = base.alt
    wps.forEach((w, i) => {
      if (i === wps.length - 1) return
      const p = enTo(w.x, w.y)
      wpGroup.add(mesh(new THREE.CylinderGeometry(0.08, 0.08, alt, 6), std(0x94a3b8), [p.x, alt / 2, p.z], false))
      const mat = std(0xf59e0b, { emissive: new THREE.Color(0xf59e0b), emissiveIntensity: 0.3 })
      const ring = mesh(new THREE.TorusGeometry(Math.max(1, base.accept) * 1.4, 0.12, 8, 32), mat, [p.x, alt, p.z], false)
      ring.rotation.x = Math.PI / 2
      wpGroup.add(ring); wpRings.push(mat)
      const l = makeLabel(`WP${i + 1}`, { size: 0.8 }); l.sprite.position.set(p.x, alt + 2.2, p.z); wpGroup.add(l.sprite)
    })
    const padV = wps[wps.length - 1] ?? { x: 0, y: 0 }
    pad.group.position.copy(enTo(padV.x, padV.y))
    padL.sprite.position.copy(enTo(padV.x, padV.y, 5.2))
    const pts = [enTo(start.x, start.y, 0.2), enTo(start.x, start.y, alt), ...wps.map((w, i) => enTo(w.x, w.y, i === wps.length - 1 ? alt : alt)), enTo(padV.x, padV.y, 0.2)]
    routeGeo.setFromPoints(pts); route.computeLineDistances()
  }

  const restart = () => {
    const d = link.data
    const wps = Array.isArray(d.waypoints) && (d.waypoints as Vec[]).length ? (d.waypoints as Vec[]).map((w) => ({ ...w })) : MISSION_DEFAULTS.waypoints.map((w) => ({ ...w }))
    const wind = (d.wind as Vec | undefined) ?? { x: 0, y: 0 }
    base = { ...MISSION3D_DEFAULTS, waypoints: wps, gpsSigma: num(d.gpsSigma, MISSION_DEFAULTS.gpsSigma), wind: { ...wind }, cruise: num(d.cruise, MISSION_DEFAULTS.cruise), posP: num(d.posP, MISSION_DEFAULTS.posP), seed: num(d.seed, MISSION_DEFAULTS.seed), landing: d.landing === 'gps' ? 'gps' : 'vision' }
    acc = 0
    if (mode === 'compare') {
      const padV = wps[wps.length - 1]
      const m0 = { ...base, waypoints: [padV] }
      runs = [{ m: { ...m0, landing: 'vision' } as Mission3dParams, f: main }, { m: { ...m0, landing: 'gps' } as Mission3dParams, f: gpsF }].map((x) => ({ ...x, st: mission3dInit(x.m), r: rng(x.m.seed) }))
      main.label.setText(t('kamera (ArUco)', 'camera (ArUco)')); main.label.sprite.visible = true
      layout([padV], base.start)
    } else {
      runs = [{ m: base, f: main, st: mission3dInit(base), r: rng(base.seed) }]
      main.label.sprite.visible = false
      layout(wps, base.start)
    }
    for (const f of [main, gpsF]) { f.trail.geometry.setDrawRange(0, 0); f.touch.visible = false }
    const on = mode === 'compare'
    for (const o of [gpsF.holder, gpsF.trail, gpsF.bubble, gpsF.link, gpsF.cone, gpsF.label.sprite]) o.visible = on
  }

  const cam = new CamRig(s, 16, 7)
  const tgt = new THREE.Vector3(), tmp = new THREE.Vector3(), windV = new THREE.Vector3()
  let homed = false
  return {
    cam, speed: 4,
    controls: [{ key: 'mode', label: { tr: 'Senaryo', en: 'Scenario' }, value: mode, options: [['route', { tr: 'Ara nokta görevi', en: 'Waypoint mission' }], ['compare', { tr: 'İniş: GPS ve kamera', en: 'Landing: GPS vs camera' }]] }],
    set(_k, v) { mode = v; restart(); homed = false },
    restart,
    frame(dt, playing, realDt) {
      if (link.rev !== rev) { rev = link.rev; restart(); homed = false }
      if (playing) {
        acc += dt
        let n = 0
        while (acc >= 0.004 && n < 600) { acc -= 0.004; n++; for (const x of runs) mission3dStep(x.st, x.m, 0.004, x.r) }
        if (n >= 600) acc = 0
      }
      for (const x of runs) {
        const { st, f, m } = x
        const q = st.q
        nedTo(q.pos, f.holder.position)
        f.holder.quaternion.copy(attQuat(q.att))
        f.spin(q.cmd, realDt)
        const h = altitude(q)
        f.shadow(f.holder.position.x, f.holder.position.z, h / 3)
        // iz
        const n = Math.min(TRAIL_MAX, st.trail.length)
        for (let i = 0; i < n; i++) { const p = st.trail[st.trail.length - n + i]; f.trailPos[i * 3] = p.x; f.trailPos[i * 3 + 1] = 0.15; f.trailPos[i * 3 + 2] = -p.y }
        f.trailPos[(n - 1) * 3 + 1] = 0.15
        f.trail.geometry.setDrawRange(0, n); f.trail.geometry.attributes.position.needsUpdate = true
        // GPS hata balonu: kestirim noktasında, yarıçap σ; gerçek konuma çizgi. Kamera devredeyken mavi koni.
        enTo(st.est.x, st.est.y, h, tmp)
        f.bubble.position.copy(tmp)
        f.bubble.scale.setScalar(Math.max(0.35, st.usingVision ? 0.15 : m.gpsSigma))
        ;(f.bubble.material as THREE.MeshBasicMaterial).color.setHex(st.usingVision ? 0x0ea5e9 : 0xdc2626)
        f.bubble.visible = st.phase !== 'done'
        const lp = f.link.geometry.attributes.position as THREE.BufferAttribute
        lp.setXYZ(0, f.holder.position.x, f.holder.position.y, f.holder.position.z); lp.setXYZ(1, tmp.x, tmp.y, tmp.z); lp.needsUpdate = true
        f.link.visible = f.bubble.visible
        f.cone.visible = st.usingVision && h > 0.3
        f.cone.position.set(f.holder.position.x, h / 2, f.holder.position.z); f.cone.scale.set(Math.max(0.2, h / 4), h / 4, Math.max(0.2, h / 4))
        f.label.sprite.position.set(f.holder.position.x, f.holder.position.y + (f === gpsF ? 2.2 : 3.4), f.holder.position.z)
        if (st.phase === 'done') { const p = m3pos(st); f.touch.visible = true; f.touch.position.set(p.x, 0.12, -p.y) }
      }
      if (wpRings.length && mode === 'route') { const wp = runs[0].st.wp; wpRings.forEach((mt, i) => { const c = i < wp ? 0x16a34a : 0xf59e0b; mt.color.setHex(c); mt.emissive.setHex(c) }) }
      // rüzgâr
      const g = runs[0].st.gust
      windV.set(base.wind.x + g.x, 0, -(base.wind.y + g.y))
      streaks.update(realDt * (playing ? 1 : 0), windV)
      const ws = Math.hypot(windV.x, windV.z)
      sockPivot.rotation.y = Math.atan2(-windV.z, windV.x)
      sockPivot.rotation.z = -(Math.PI / 2) * (1 - Math.min(1, ws / 8)) * 0.85
      // kamera
      const lead = runs[0].st
      tgt.copy(main.holder.position)
      if (!homed) { cam.home(mode === 'compare' ? [7, 6, 12] : [16, 13, 26], tgt); homed = true }
      cam.update(tgt, lead.q.att[2], realDt)
    },
    hud() {
      const ph = (st: Mission3dState) => ({ takeoff: t('KALKIŞ', 'TAKEOFF'), route: `${t('ROTA', 'ROUTE')} → WP${st.wp + 1}`, land: st.usingVision ? t('İNİŞ (kamera)', 'LANDING (camera)') : t('İNİŞ (GPS)', 'LANDING (GPS)'), done: t('İNDİ', 'LANDED') }[st.phase])
      const line = (st: Mission3dState) => st.phase === 'done'
        ? `${ph(st)} · ${t('pede uzaklık', 'distance to pad')} ${Math.round((st.landingError ?? 0) * 100)} cm · ${t('temas hızı', 'touchdown speed')} ${f2(st.touchdownSpeed ?? 0)} m/s`
        : `${ph(st)} · ${t('irtifa', 'alt.')} ${f1(altitude(st.q))} m · ${t('hız', 'speed')} ${f1(Math.hypot(st.q.vel[0], st.q.vel[1]))} m/s · ${t('kestirim hatası', 'estimate error')} ${f2(Math.hypot(st.est.x - m3pos(st).x, st.est.y - m3pos(st).y))} m`
      const st0 = runs[0].st
      const head = `t = ${f1(st0.q.t)} s · ${t('rüzgâr', 'wind')} ${f1(Math.hypot(base.wind.x, base.wind.y))} m/s + ${t('hamle', 'gusts')} · GPS σ ${f1(base.gpsSigma)} m`
      if (mode === 'compare') return `${head}\n${t('Kamera', 'Camera')}: ${line(runs[0].st)}\nGPS: ${line(runs[1].st)}\n${t('Kırmızı balon: GPS kestirimi (yarıçap σ) · mavi koni: ArUco kamerası', 'Red bubble: GPS estimate (radius σ) · blue cone: ArUco camera')}`
      return `${head}\n${line(st0)}\n${t('Kırmızı balon: GPS kestirimi (yarıçap σ) · yeşil çizgi: gerçek iz', 'Red bubble: GPS estimate (radius σ) · green line: true trail')}`
    },
    dispose() { s.scene.fog = null },
  }
}

export const DRONE_SCENES: Partial<Record<string, SceneMount>> = { twr: hoverScene, mixer: mixerScene, alt: altScene, roll: rollScene, fusion: fusionScene, mission: missionScene }
