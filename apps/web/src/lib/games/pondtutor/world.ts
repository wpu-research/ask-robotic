// Gölet Eğitmeni fiziği: saf TypeScript (DOM yok). Koordinatlar 0..100, y yukarı, açı derece (0 = doğu, 90 = kuzey).
// Zaman "adım" (tick) ile ilerler: yalnız eylem blokları (yüz, dur, top at, bekle) zaman geçirir; tara ve değer blokları geçirmez.

export const SIZE = 100
/** Ördek yarıçapı. */
export const DUCK_R = 3
/** %100 hız = adım başına 2 birim. */
export const SPEED_UNIT = 0.02
/** Hız her adımda en çok bu kadar (%) değişir: ördek hemen hızlanıp duramaz (eylemsizlik). */
export const ACCEL = 25
export const BALL_SPEED = 10
export const BLAST = 10
export const MAX_RANGE = 70
export const RELOAD = 8
export const SCAN_HALF = 5
/** Tarama rakibi bulamazsa döndürülen "çok uzak" değeri. */
export const NONE = 9999
export const COLLISION_DMG = 0.1

export interface Pt { x: number; y: number }
export interface Rock extends Pt { r: number }
export interface Duck { x: number; y: number; heading: number; speed: number; want: number; health: number; maxHealth: number; reload: number }
export interface Ball { id: number; x: number; y: number; tx: number; ty: number; owner: 'p' | 'e' }
export interface Boom extends Pt { owner: 'p' | 'e' }

export interface EnemyDef {
  x: number; y: number; health: number
  /** İki nokta arasında gidip gelir. */
  move?: { to: Pt; speed: number }
  /** Oyuncunun konumuna `period` adımda bir ateş eder; `err` derece sapma. */
  shoot?: { period: number; err: number; first: number }
}

export interface PondLevelData {
  start: Pt & { heading?: number }
  health: number
  goal: 'reach' | 'kill'
  target?: Pt & { r: number }
  enemy?: EnemyDef
  rocks?: Rock[]
  /** Süre sınırı (adım). */
  maxTicks: number
}

export interface World {
  tick: number
  maxTicks: number
  goal: 'reach' | 'kill'
  player: Duck
  enemy: Duck | null
  rocks: Rock[]
  target: (Pt & { r: number }) | null
  balls: Ball[]
  /** Bu adımda patlayanlar. */
  booms: Boom[]
  /** Bu adımda alınan hasar (görsel parlama için). */
  hurt: { p: number; e: number }
  bumped: boolean
  scan: { angle: number; dist: number; found: boolean; tick: number } | null
  aim: { angle: number; range: number; tick: number } | null
  status: 'playing' | 'won' | 'lost' | 'timeout'
  message: string
  shots: number
  // iç durum
  _enemyDef: EnemyDef | null
  _enemyLeg: number
  _seed: number
  _ballSeq: number
}

const rad = (d: number) => (d * Math.PI) / 180
const deg = (r: number) => (r * 180) / Math.PI
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
export const normDeg = (a: number) => ((((a + 180) % 360) + 360) % 360) - 180
const hash01 = (n: number, seed: number) => { const s = Math.sin(n * 12.9898 + seed * 78.233) * 43758.5453; return s - Math.floor(s) }

export function createWorld(d: PondLevelData, seed = 1): World {
  const duck = (x: number, y: number, health: number, heading = 0): Duck => ({ x, y, heading, speed: 0, want: 0, health, maxHealth: health, reload: 0 })
  return {
    tick: 0, maxTicks: d.maxTicks, goal: d.goal,
    player: duck(d.start.x, d.start.y, d.health, d.start.heading ?? 0),
    enemy: d.enemy ? duck(d.enemy.x, d.enemy.y, d.enemy.health, 180) : null,
    rocks: (d.rocks ?? []).map((r) => ({ ...r })),
    target: d.target ? { ...d.target } : null,
    balls: [], booms: [], hurt: { p: 0, e: 0 }, bumped: false, scan: null, aim: null,
    status: 'playing', message: '', shots: 0,
    _enemyDef: d.enemy ?? null, _enemyLeg: 0, _seed: seed, _ballSeq: 0,
  }
}

function fire(w: World, from: Duck, owner: 'p' | 'e', angle: number, range: number): boolean {
  if (from.reload > 0 || from.health <= 0) return false
  const r = clamp(Number.isFinite(range) ? range : 0, 0, MAX_RANGE)
  const a = rad(Number.isFinite(angle) ? angle : 0)
  w.balls.push({ id: ++w._ballSeq, x: from.x, y: from.y, tx: from.x + Math.cos(a) * r, ty: from.y + Math.sin(a) * r, owner })
  from.reload = RELOAD
  if (owner === 'p') { w.aim = { angle, range: r, tick: w.tick }; w.shots++ }
  return true
}

export const playerFire = (w: World, angle: number, range: number) => fire(w, w.player, 'p', angle, range)

export function playerSwim(w: World, angle: number, speed: number) {
  w.player.heading = Number.isFinite(angle) ? angle : 0
  w.player.want = clamp(Number.isFinite(speed) ? speed : 0, 0, 100)
}

/** Rakibin yönü `angle` ±SCAN_HALF içindeyse uzaklığı, yoksa NONE. */
export function playerScan(w: World, angle: number): number {
  const e = w.enemy
  let dist = NONE
  if (e && e.health > 0) {
    const dx = e.x - w.player.x, dy = e.y - w.player.y
    const dir = deg(Math.atan2(dy, dx))
    if (Math.abs(normDeg(dir - angle)) <= SCAN_HALF) dist = Math.round(Math.hypot(dx, dy) * 10) / 10
  }
  w.scan = { angle, dist, found: dist !== NONE, tick: w.tick }
  return dist
}

function moveDuck(w: World, dk: Duck, isPlayer: boolean) {
  if (dk.health <= 0) { dk.speed = 0; return }
  dk.speed += clamp(dk.want - dk.speed, -ACCEL, ACCEL)
  const v = dk.speed * SPEED_UNIT
  dk.x += Math.cos(rad(dk.heading)) * v
  dk.y += Math.sin(rad(dk.heading)) * v
  let hit = false
  if (dk.x < DUCK_R) { dk.x = DUCK_R; hit = true }
  if (dk.x > SIZE - DUCK_R) { dk.x = SIZE - DUCK_R; hit = true }
  if (dk.y < DUCK_R) { dk.y = DUCK_R; hit = true }
  if (dk.y > SIZE - DUCK_R) { dk.y = SIZE - DUCK_R; hit = true }
  for (const rk of w.rocks) {
    const dx = dk.x - rk.x, dy = dk.y - rk.y, dist = Math.hypot(dx, dy), min = rk.r + DUCK_R
    if (dist < min) {
      const k = dist < 1e-6 ? 1 : min / dist
      dk.x = rk.x + (dist < 1e-6 ? min : dx * k)
      dk.y = rk.y + (dist < 1e-6 ? 0 : dy * k)
      hit = true
    }
  }
  if (hit && dk.speed > 0) {
    const dmg = dk.speed * COLLISION_DMG
    dk.health = Math.max(0, dk.health - dmg)
    if (isPlayer) { w.hurt.p += dmg; w.bumped = true } else w.hurt.e += dmg
    dk.speed = 0
  }
}

function enemyAI(w: World) {
  const e = w.enemy, def = w._enemyDef
  if (!e || !def || e.health <= 0) return
  if (def.move) {
    const a = { x: def.x, y: def.y }, b = def.move.to
    const goal = w._enemyLeg === 0 ? b : a
    const dx = goal.x - e.x, dy = goal.y - e.y
    if (Math.hypot(dx, dy) < 1.5) { w._enemyLeg = 1 - w._enemyLeg } else { e.heading = deg(Math.atan2(dy, dx)); e.want = def.move.speed }
  }
  if (def.shoot && w.player.health > 0 && w.tick >= def.shoot.first && (w.tick - def.shoot.first) % def.shoot.period === 0) {
    const dx = w.player.x - e.x, dy = w.player.y - e.y
    const err = (hash01(w.tick, w._seed) * 2 - 1) * def.shoot.err
    fire(w, e, 'e', deg(Math.atan2(dy, dx)) + err, Math.hypot(dx, dy))
  }
}

function explode(w: World, x: number, y: number, owner: 'p' | 'e') {
  w.booms.push({ x, y, owner })
  const hurtDuck = (dk: Duck | null, who: 'p' | 'e') => {
    if (!dk || dk.health <= 0) return
    const d = Math.hypot(dk.x - x, dk.y - y)
    if (d >= BLAST) return
    const dmg = 10 * (1 - d / BLAST)
    dk.health = Math.max(0, dk.health - dmg)
    w.hurt[who] += dmg
  }
  hurtDuck(w.player, 'p'); hurtDuck(w.enemy, 'e')
}

/** Dünyayı bir adım ilerletir ve durumu günceller. */
export function tick(w: World) {
  if (w.status !== 'playing') return
  w.tick++
  w.booms = []; w.hurt = { p: 0, e: 0 }; w.bumped = false
  moveDuck(w, w.player, true)
  if (w.enemy) { enemyAI(w); moveDuck(w, w.enemy, false) }
  const alive: Ball[] = []
  for (const b of w.balls) {
    const dx = b.tx - b.x, dy = b.ty - b.y, dist = Math.hypot(dx, dy)
    if (dist <= BALL_SPEED) explode(w, b.tx, b.ty, b.owner)
    else { b.x += (dx / dist) * BALL_SPEED; b.y += (dy / dist) * BALL_SPEED; alive.push(b) }
  }
  w.balls = alive
  if (w.player.reload > 0) w.player.reload--
  if (w.enemy && w.enemy.reload > 0) w.enemy.reload--

  if (w.player.health <= 0) { w.status = 'lost'; w.message = 'Ördeğin battı! Daha dikkatli dene.' }
  else if (w.goal === 'reach' && w.target && Math.hypot(w.player.x - w.target.x, w.player.y - w.target.y) <= w.target.r) { w.status = 'won'; w.message = 'Hedefe ulaştın!' }
  else if (w.goal === 'kill' && w.enemy && w.enemy.health <= 0) { w.status = 'won'; w.message = 'Rakibi etkisiz hale getirdin!' }
  else if (w.tick >= w.maxTicks) { w.status = 'timeout'; w.message = 'Süre doldu! Daha hızlı olmalısın.' }
}

/** Dünya iletilerinin (`World.message`) İngilizcesi. */
export const WORLD_MESSAGE_EN: Record<string, string> = {
  'Ördeğin battı! Daha dikkatli dene.': 'Your duck sank! Try to be more careful.',
  'Hedefe ulaştın!': 'You reached the goal!',
  'Rakibi etkisiz hale getirdin!': 'You knocked out the rival!',
  'Süre doldu! Daha hızlı olmalısın.': "Time's up! You need to be faster.",
}
