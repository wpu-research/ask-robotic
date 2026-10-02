// Gölet rakipleri. Hepsi oyuncuyla AYNI komutları kullanır (swim, cannon, scan…); hile yoktur.
import { SHOT_SPEED, deg, norm360, type AiApi, type AiController, type AiKind } from './sim'

const toward = (x: number, y: number, tx: number, ty: number) => norm360(deg(Math.atan2(ty - y, tx - x)))

/** Dümdüz: olduğu yerde durur, ateş etmez. */
const sitter: AiController = () => { /* hiçbir şey yapmaz */ }

/** Gezgin: rastgele dolaşır, ateş etmez; duvara yaklaşınca havuzun ortasına döner. */
const wanderer: AiController = (api, mem) => {
  mem.t = (mem.t ?? 0) - 1
  const x = api.getX(), y = api.getY()
  if (x < 14 || x > 86 || y < 14 || y > 86) {
    api.swim(toward(x, y, 50, 50), 24)
    mem.t = 18
  } else if (mem.t <= 0) {
    api.swim(api.rand() * 360, 24)
    mem.t = 30 + Math.floor(api.rand() * 40)
  }
}

/** Avcı: etrafı süpürür (ilk bakışı havuzun ortasına), gördüğüne ateş eder ve ona yaklaşır. Hedefin gideceği yeri tahmin etmez. */
const hunter: AiController = (api, mem) => {
  if (mem.a === undefined) mem.a = toward(api.getX(), api.getY(), 50, 50)
  else mem.a = (mem.a + 8) % 360
  const d = api.scan(mem.a, 8)
  if (d < Infinity) {
    api.cannon(mem.a, d)
    mem.seen = api.tick()
    mem.bear = mem.a
    mem.a -= 8 // gördüğü yönde kal: izlemeye devam et
    if (d > 32) api.swim(mem.bear, 35)
    else api.swim(mem.bear, 0)
  } else if (api.tick() - (mem.seen ?? -999) > 30) api.swim(0, 0)
}

interface Lock { a: number; d: number; px: number; py: number }

/**
 * Nişancı ve Usta'nın ortak "gözü": önce kaba tarar, bulunca ±1° hassasiyetle konumunu bulur, hızını yumuşatarak tahmin eder.
 * Hedefin uçuş süresi sonrası bulunacağı yeri `px,py` olarak verir.
 */
function acquire(api: AiApi, mem: Record<string, any>, sweeps: number, lead = 1): Lock | null {
  const x = api.getX(), y = api.getY()
  const tick = api.tick()
  const fresh = mem.bear !== undefined && tick - (mem.seen ?? -999) < 10
  const probes: number[] = fresh ? [mem.bear - 8, mem.bear, mem.bear + 8] : Array.from({ length: sweeps }, (_, i) => (mem.a ?? 0) + i * 12)
  let coarse: { a: number; d: number } | null = null
  for (const a of probes) {
    const d = api.scan(a, 12)
    if (d < Infinity) { coarse = { a, d }; break }
  }
  if (!coarse) {
    mem.a = norm360((mem.a ?? api.rand() * 360) + sweeps * 12)
    if (tick - (mem.seen ?? -999) >= 10) mem.bear = undefined
    return null
  }
  let bearing = coarse.a
  for (let off = -5; off <= 5; off += 2) {
    const d = api.scan(coarse.a + off, 2)
    if (d < Infinity) { bearing = coarse.a + off; coarse.d = d; break }
  }
  const tx = x + Math.cos((bearing * Math.PI) / 180) * coarse.d
  const ty = y + Math.sin((bearing * Math.PI) / 180) * coarse.d
  const prev = mem.prev as { x: number; y: number; t: number } | undefined
  let vx = mem.vx ?? 0, vy = mem.vy ?? 0
  if (prev && tick - prev.t > 0 && tick - prev.t <= 3) {
    const dt = tick - prev.t
    vx = 0.6 * vx + 0.4 * ((tx - prev.x) / dt)
    vy = 0.6 * vy + 0.4 * ((ty - prev.y) / dt)
  } else { vx = 0; vy = 0 }
  if (Math.hypot(vx, vy) < 0.15) { vx = 0; vy = 0 }
  mem.vx = vx; mem.vy = vy
  mem.prev = { x: tx, y: ty, t: tick }
  mem.bear = bearing
  mem.seen = tick
  const flight = coarse.d / SHOT_SPEED
  return { a: bearing, d: coarse.d, px: tx + vx * flight * lead, py: ty + vy * flight * lead }
}

/** Nişancı: yerinden hızlı tarar; hedefin gittiği yöne doğru önceden nişan alır. Yaklaşanı kaçarak karşılar. */
const sniper: AiController = (api, mem) => {
  const x = api.getX(), y = api.getY()
  const t = acquire(api, mem, 3)
  if (!t) return
  api.cannon(toward(x, y, t.px, t.py), Math.hypot(t.px - x, t.py - y))
  if (t.d < 26) api.swim(norm360(t.a + 180), 55)
  else api.swim(0, 0)
}

/** Usta: Nişancı gibi nişan alır ama durmaz; rakibin etrafında ~40 birim uzaktan yan yan dönerek kendisi vurulmaktan kaçar. */
const master: AiController = (api, mem) => {
  const x = api.getX(), y = api.getY()
  const t = acquire(api, mem, 4, 0.5)
  if (!t) return
  api.cannon(toward(x, y, t.px, t.py), Math.hypot(t.px - x, t.py - y))
  if (api.tick() % 24 === 0) mem.flip = -(mem.flip ?? 1)
  const flip = mem.flip ?? 1
  const corr = Math.max(-50, Math.min(50, (t.d - 40) * 2)) // uzaksa rakibe doğru, yakınsa uzağa doğru kıvrıl
  if (x < 12 || x > 88 || y < 12 || y > 88) api.swim(toward(x, y, 50, 50), 60)
  else api.swim(norm360(t.a + flip * (90 - corr)), 50)
}

export const CONTROLLERS: Record<AiKind, AiController> = { sitter, wanderer, hunter, sniper, master }
