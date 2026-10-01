// Arena çalışma zamanı: derlenmiş hex + sahne → avr8js Sim + robot fiziği + istatistik toplayıcı.
// Hem arayüz (ArenaEditor) hem testler aynı sınıfı kullanır; DOM ya da Node API'si yok.
import { Arena, STD_ENCODERS, STD_MOTORS, STD_ULTRASONIC, Sim, type LineSensor, type Rover, type RoverConfig, type Wall } from '@ask/sim'
import { DEG, nearestWall, rayDistance, wrapPi } from './geometry'
import { LINE_ROW } from './scenes'
import type { ArenaScene, ArenaSnapshot, ArmScene, ArmSnapshot, BalancerScene, BalancerSnapshot, Pose, RoverScene, RoverSnapshot } from './types'


export interface ArenaRuntime {
  readonly scene: ArenaScene
  readonly sim: Sim
  /** Robot sahnesinde dolu; kol sahnesinde null. */
  readonly rover: Rover | null
  /** Benzetimi ms kadar ilerletir (içeride en çok 5 ms'lik dilimlerle; istatistikler her dilimde güncellenir). */
  advance(ms: number): void
  snapshot(): ArenaSnapshot
  /** Seri girişe metin kuyruğa alır; baytlar benzetim zamanında aralıklı gönderilir. */
  sendSerial(text: string): void
  /** Sahnedeki bir düğmeye bas / bırak. */
  press(pin: number, down: boolean): void
  /** Robotu konuma ışınlar (yalnız robot sahnesi). */
  place(pose: Partial<Pose>): void
  /** Ultrasonik tarama servosunun açısı (°, 90 = ileri). */
  servoDeg(): number
  dispose(): void
}

const SLICE_MS = 5
const BYTE_GAP_MS = 2
const BOOT_MS = 150

const std5 = (): LineSensor[] => LINE_ROW.map((s) => ({ pin: s.pin, kind: 'analog' as const, x: s.x, y: s.y }))

/** Pin darbelerinden servo komutu (°). */
function servoReader(sim: Sim, pin: number, onChange?: (deg: number) => void): () => number {
  let rise: number | null = null, width = 1472
  sim.onPin(pin, (high) => {
    if (high) rise = sim.nowMs()
    else if (rise !== null) {
      width = (sim.nowMs() - rise) * 1000; rise = null
      onChange?.(Math.max(0, Math.min(180, ((width - 544) / (2400 - 544)) * 180)))
    }
  })
  return () => Math.max(0, Math.min(180, ((width - 544) / (2400 - 544)) * 180))
}

class ByteQueue {
  private q: string[] = []
  private last = -Infinity
  push(t: string) { for (const c of t) this.q.push(c) }
  get pending() { return this.q.length > 0 }
  pump(sim: Sim) {
    if (!this.q.length) return
    const now = sim.nowMs()
    if (now < BOOT_MS) return // açılış (setup) bitmeden gelen baytlar USART kapalıyken kaybolurdu
    if (now - this.last >= BYTE_GAP_MS) { sim.sendSerial(this.q.shift()!); this.last = now }
  }
}

export function roverConfigFor(scene: RoverScene, arena: Arena): RoverConfig {
  const s = scene.sensors
  return {
    arena, pose: scene.pose, motors: STD_MOTORS,
    encoders: s.encoders ? STD_ENCODERS : undefined,
    ultrasonic: s.ultrasonic ? STD_ULTRASONIC : undefined,
    lineSensors: s.line ? std5() : undefined,
    bumpers: s.bumpers ? { left: 2, right: 3 } : undefined,
    imu: s.imu,
    ...scene.extra,
  }
}

export function buildArena(scene: RoverScene): Arena {
  const a = new Arena()
  a.walls = scene.walls.map((w) => [...w] as [number, number, number, number])
  a.lines = scene.lines.map((l) => l.map((p) => [...p] as [number, number]))
  if (scene.lineWidth) a.lineWidth = scene.lineWidth
  return a
}

export function createArenaRuntime(hex: string, scene: ArenaScene): ArenaRuntime {
  if (scene.kind === 'arm') return createArmRuntime(hex, scene)
  if (scene.kind === 'balancer') return createBalancerRuntime(hex, scene)
  return createRoverRuntime(hex, scene)
}

// ================================================================ gezgin robot
function createRoverRuntime(hex: string, scene: RoverScene): ArenaRuntime {
  const sim = new Sim(hex)
  const arena = buildArena(scene)
  const moverIdx = (scene.movers ?? []).map((m) => { arena.walls.push([...m.wall] as Wall); return arena.walls.length - 1 })
  const rover = sim.rover(roverConfigFor(scene, arena))
  const bytes = new ByteQueue()
  const servo = scene.sensors.ultrasonic ? servoReader(sim, STD_ULTRASONIC.servo) : () => 90
  const P = rover.params
  const s = rover.state
  const lostHold = scene.lostHoldMs ?? 250

  // izleyici durumu
  let collisions = 0, wasCollided = false
  let lineSeen = false, offMs = 0, lineExits = 0, totalOff = 0, longestOff = 0, lostCounted = false
  let minClear = Infinity, frontTrue = 400, minFrontTrue = 400
  const visited = new Set<string>()
  const cells = new Set<number>()
  let inZone = new Set<string>()
  let finishedAt: number | null = null
  const armed = new Set<string>() // robotun dışına çıktığı bitiş bölgeleri
  const odo = { x: scene.pose.x, y: scene.pose.y, theta: scene.pose.theta, distanceM: 0 }
  let lastTL = 0, lastTR = 0
  const perTick = (2 * Math.PI * P.wheelRadius) / P.slots
  let v = 0, om = 0, turned = 0, headChange = 0
  let lastT = sim.nowMs()
  let serialLen = 0, serialT = 0

  const moveWalls = (timeS: number) => {
    (scene.movers ?? []).forEach((m, i) => {
      const k = m.keys
      let dx = k.at(-1)?.dx ?? 0, dy = k.at(-1)?.dy ?? 0
      if (k.length && timeS <= k[0].t) { dx = k[0].dx; dy = k[0].dy }
      else for (let j = 1; j < k.length; j++) {
        if (timeS <= k[j].t) { const f = (timeS - k[j - 1].t) / Math.max(1e-9, k[j].t - k[j - 1].t); dx = k[j - 1].dx + (k[j].dx - k[j - 1].dx) * f; dy = k[j - 1].dy + (k[j].dy - k[j - 1].dy) * f; break }
      }
      const w = arena.walls[moverIdx[i]]
      w[0] = m.wall[0] + dx; w[2] = m.wall[2] + dx; w[1] = m.wall[1] + dy; w[3] = m.wall[3] + dy
    })
  }
  const observe = (dtMs: number) => {
    const timeS = sim.nowMs() / 1000
    if (moverIdx.length) moveWalls(timeS)
    if (sim.serial.length !== serialLen) { serialLen = sim.serial.length; serialT = timeS }
    cells.add(Math.floor(s.x / 0.25) * 1000 + Math.floor(s.y / 0.25))
    if (s.collided && !wasCollided) collisions++
    wasCollided = s.collided
    minClear = Math.min(minClear, nearestWall(s.x, s.y, arena.walls) - P.radius)
    if (scene.sensors.ultrasonic) {
      const ang = s.theta + ((servo() - 90) * Math.PI) / 180
      const d = rayDistance(s.x + Math.cos(s.theta) * 0.06, s.y + Math.sin(s.theta) * 0.06, ang, arena.walls) * 100
      frontTrue = Number.isFinite(d) ? Math.min(d, 400) : 400
      if (frontTrue < minFrontTrue) minFrontTrue = frontTrue
    }
    v = (P.wheelRadius * (s.wL + s.wR)) / 2
    om = (P.wheelRadius * (s.wR - s.wL)) / P.wheelBase
    turned += Math.abs(om) * (dtMs / 1000) * DEG; headChange += om * (dtMs / 1000) * DEG
    // çizgi
    const sens = P.lineSensors ?? []
    if (sens.length) {
      const on = sens.some((x) => x.on)
      if (on) { lineSeen = true; offMs = 0; lostCounted = false }
      else if (lineSeen) {
        offMs += dtMs; totalOff += dtMs; longestOff = Math.max(longestOff, offMs)
        if (!lostCounted && offMs >= lostHold) { lineExits++; lostCounted = true }
      }
    }
    // odometri (enkoder tıkları)
    if (P.encoders) {
      const dL = (s.ticksL - lastTL) * perTick, dR = (s.ticksR - lastTR) * perTick
      lastTL = s.ticksL; lastTR = s.ticksR
      if (dL || dR) {
        const ds = (dL + dR) / 2, dth = (dR - dL) / P.wheelBase
        odo.x += ds * Math.cos(odo.theta + dth / 2); odo.y += ds * Math.sin(odo.theta + dth / 2)
        odo.theta += dth; odo.distanceM += Math.abs(ds)
      }
    }
    // bölgeler
    const now = new Set<string>()
    for (const z of scene.zones) {
      const inside = Math.hypot(s.x - z.x, s.y - z.y) < z.r
      if (inside) { now.add(z.id); visited.add(z.id) }
      else if (z.kind === 'goal') armed.add(z.id)
    }
    inZone = now
    if (finishedAt === null) {
      const goals = scene.zones.filter((z) => z.kind === 'goal')
      const cps = scene.zones.filter((z) => z.kind === 'checkpoint')
      if (goals.some((g) => now.has(g.id) && armed.has(g.id)) && cps.every((c) => visited.has(c.id))) finishedAt = timeS
    }
  }
  // başlangıç görüntüsü
  observe(0)

  const advance = (ms: number) => {
    let left = ms
    while (left > 1e-9) {
      const d = Math.min(bytes.pending ? BYTE_GAP_MS : SLICE_MS, left)
      bytes.pump(sim)
      sim.run(d)
      left -= d
      const t = sim.nowMs()
      observe(t - lastT); lastT = t
    }
  }

  const snapshot = (): RoverSnapshot => ({
    kind: 'rover', timeS: sim.nowMs() / 1000, x: s.x, y: s.y, theta: s.theta, thetaDeg: wrapPi(s.theta) * DEG,
    v, omega: om, distanceM: s.distanceM, coverCells: cells.size, turnedDeg: turned, headingChangeDeg: headChange, ticksL: s.ticksL, ticksR: s.ticksR, wL: s.wL, wR: s.wR, frontCm: s.frontCm, frontTrueCm: frontTrue, minFrontTrueCm: minFrontTrue,
    collided: s.collided, collisions,
    line: (P.lineSensors ?? []).map((x) => ({ pin: Number(x.pin), on: !!x.on, adc: x.on ? 860 : 164, x: x.x ?? 0.07, y: x.y ?? 0 })),
    onLine: (P.lineSensors ?? []).some((x) => x.on), lineExits, offLineMs: offMs, totalOffLineMs: totalOff, longestOffLineMs: longestOff,
    bumperL: P.bumpers?.left !== undefined && !sim.read(P.bumpers.left), bumperR: P.bumpers?.right !== undefined && !sim.read(P.bumpers.right),
    minClearanceM: minClear, visited: new Set(visited), inZone: new Set(inZone), finishedAtS: finishedAt,
    serial: sim.serial, serialAgeS: sim.nowMs() / 1000 - serialT, odo: { ...odo },
    movers: (scene.movers ?? []).map((m, i) => ({ id: m.id, wall: [...arena.walls[moverIdx[i]]] as Wall })),
  })

  return {
    scene, sim, rover, advance, snapshot,
    sendSerial: (t) => bytes.push(t),
    place: (pose) => { if (pose.x !== undefined) s.x = pose.x; if (pose.y !== undefined) s.y = pose.y; if (pose.theta !== undefined) s.theta = pose.theta },
    press: (pin, down) => { if (scene.buttons?.some((b) => b.pin === pin)) sim.drive(pin, !down) },
    servoDeg: servo,
    dispose: () => { /* tarayıcıda tutulan kaynak yok */ },
  }
}

// ================================================================ robot kol
export function armTip(scene: ArmScene, q1: number, q2: number): { x: number; y: number } {
  const a1 = (q1 * Math.PI) / 180, a2 = ((q1 - q2) * Math.PI) / 180
  return { x: scene.l1 * Math.cos(a1) + scene.l2 * Math.cos(a2), y: scene.l1 * Math.sin(a1) + scene.l2 * Math.sin(a2) }
}

function createArmRuntime(hex: string, scene: ArmScene): ArenaRuntime {
  const sim = new Sim(hex)
  const bytes = new ByteQueue()
  const rate = scene.servoDegPerSec ?? 600
  const cmd = { q1: 90, q2: 0, grip: 90 }
  const cur = { q1: 90, q2: 0, grip: 90 }
  const last = { q1: NaN, q2: NaN, grip: NaN }
  let maxJump = 0
  const track = (k: 'q1' | 'q2' | 'grip') => (deg: number) => {
    if (!Number.isNaN(last[k])) maxJump = Math.max(maxJump, Math.abs(deg - last[k]))
    last[k] = deg; cmd[k] = deg
  }
  servoReader(sim, 9, track('q1')); servoReader(sim, 10, track('q2')); servoReader(sim, 11, track('grip'))
  const objects = scene.objects.map((o) => ({ id: o.id, x: o.x, y: o.y }))
  const placed: Record<string, string> = {}
  let held: string | null = null
  let inZone = new Set<string>()
  let lastT = sim.nowMs()
  let serialLen = 0, serialT = 0

  const gripClosed = () => cur.grip < scene.gripClosedBelowDeg
  const observe = (dtMs: number) => {
    if (sim.serial.length !== serialLen) { serialLen = sim.serial.length; serialT = sim.nowMs() / 1000 }
    const step = (rate * dtMs) / 1000
    for (const k of ['q1', 'q2', 'grip'] as const) cur[k] += Math.max(-step, Math.min(step, cmd[k] - cur[k]))
    const tip = armTip(scene, cur.q1, cur.q2)
    if (held === null && gripClosed()) {
      const o = objects.find((x) => !placed[x.id] && Math.hypot(x.x - tip.x, x.y - tip.y) < 1.2)
      if (o) held = o.id
    } else if (held !== null && !gripClosed()) {
      const o = objects.find((x) => x.id === held)!
      const z = scene.zones.find((zz) => Math.hypot(zz.x - o.x, zz.y - o.y) <= zz.r)
      if (z) placed[o.id] = z.id
      held = null
    }
    if (held !== null) { const o = objects.find((x) => x.id === held)!; o.x = tip.x; o.y = tip.y }
    inZone = new Set(scene.zones.filter((z) => Math.hypot(z.x - tip.x, z.y - tip.y) <= z.r).map((z) => z.id))
  }
  observe(0)
  const advance = (ms: number) => {
    let left = ms
    while (left > 1e-9) {
      const d = Math.min(bytes.pending ? BYTE_GAP_MS : SLICE_MS, left)
      bytes.pump(sim); sim.run(d); left -= d
      const t = sim.nowMs(); observe(t - lastT); lastT = t
    }
  }
  const snapshot = (): ArmSnapshot => {
    const tip = armTip(scene, cur.q1, cur.q2)
    return {
      kind: 'arm', timeS: sim.nowMs() / 1000, q1: cur.q1, q2: cur.q2, grip: cur.grip, cmd: { ...cmd },
      tipX: tip.x, tipY: tip.y, gripClosed: gripClosed(), held, objects: objects.map((o) => ({ ...o })), placed: { ...placed },
      maxJumpDeg: maxJump, serial: sim.serial, serialAgeS: sim.nowMs() / 1000 - serialT, inZone: new Set(inZone),
    }
  }
  return { scene, sim, rover: null, advance, snapshot, sendSerial: (t) => bytes.push(t), press: () => {}, place: () => {}, servoDeg: () => 90, dispose: () => {} }
}

// ================================================================ dengelenen robot
function createBalancerRuntime(hex: string, scene: BalancerScene): ArenaRuntime {
  const sim = new Sim(hex)
  const opt: Partial<Pick<BalancerScene, 'A' | 'B' | 'C' | 'deadband' | 'fallDeg' | 'gyroBiasDps'>> = {}
  for (const k of ['A', 'B', 'C', 'deadband', 'fallDeg', 'gyroBiasDps'] as const) if (scene[k] !== undefined) opt[k] = scene[k] // undefined, varsayılanı ezmesin
  const bal = sim.balancer({ motors: STD_MOTORS, theta0Deg: scene.theta0Deg, ...opt })
  const bytes = new ByteQueue()
  let lastT = sim.nowMs(), fellAt: number | null = null
  let serialLen = 0, serialT = 0
  const observe = () => {
    const t = sim.nowMs() / 1000
    if (sim.serial.length !== serialLen) { serialLen = sim.serial.length; serialT = t }
    if (bal.state.fell && fellAt === null) fellAt = t
  }
  const advance = (ms: number) => {
    let left = ms
    while (left > 1e-9) {
      const d = Math.min(bytes.pending ? BYTE_GAP_MS : SLICE_MS, left)
      bytes.pump(sim); sim.run(d); left -= d
      lastT = sim.nowMs(); observe()
    }
  }
  const snapshot = (): BalancerSnapshot => ({
    kind: 'balancer', timeS: lastT / 1000, thetaDeg: bal.thetaDeg, rateDps: (bal.state.omega * 180) / Math.PI, x: bal.state.x, v: bal.state.v,
    fell: bal.state.fell, fellAtS: fellAt, uprightS: fellAt ?? sim.nowMs() / 1000, maxAbsDeg: bal.state.maxAbsDeg,
    serial: sim.serial, serialAgeS: sim.nowMs() / 1000 - serialT,
  })
  return { scene, sim, rover: null, advance, snapshot, sendSerial: (t) => bytes.push(t), press: () => {}, place: () => {}, servoDeg: () => 90, dispose: () => {} }
}
