// Oyun Atölyesi — 2B oyun motoru (160x120). Saf TypeScript: tarayıcıda ve başsız Node'da aynı kodla çalışır.
// Zaman sabit adımlıdır: her tick() tam 1/60 saniyedir (hız = piksel/sn). Böylece oyun deterministiktir ve testler kareyle ilerler.
import { GALLERY_BY_ID } from './assets'
import { colorIndex } from './palette'
import { opaqueBounds, parse, type Pix } from './pixels'
import { BUTTONS, KIND_IDS, SCREEN_H, SCREEN_W, TILE, TILE_KEYS, type Button, type OyunMap, type OyunProject, type OyunTile } from './types'

export const FPS = 60
export const DT_MS = 1000 / FPS
const DT = 1 / FPS

export type OyunWorld = Pick<OyunProject, 'images' | 'tileset' | 'maps' | 'bg'>

export type SubType = 'start' | 'update' | 'every' | 'button' | 'overlap' | 'tile' | 'created' | 'destroyed' | 'lifeEnd' | 'timeEnd'
export interface Sub {
  id: number
  type: SubType
  /** overlap: ilk tür · tile/created/destroyed: sprite türü ('hepsi' = her tür) */
  kind?: string
  /** overlap: ikinci tür */
  kind2?: string
  /** tile: karo resmi kimliği */
  image?: string
  /** every: periyot (ms) */
  ms?: number
  button?: Button
  edge?: 'press' | 'release'
}
export interface EventCtx { sprite?: SpriteState; other?: SpriteState; col?: number; row?: number }
export type SubHandler = (sub: Sub, ctx: EventCtx) => void

export interface SpriteState {
  id: number
  kind: string
  image: string
  /** Merkez konumu (dünya pikseli). */
  x: number
  y: number
  vx: number
  vy: number
  ax: number
  ay: number
  /** Resim boyutu. */
  w: number
  h: number
  lifeMs: number | null
  z: number
  /** Dünyanın dışına çıkınca silinir. */
  autoDestroy: boolean
  /** Dünya sınırları içinde kalır. */
  stay: boolean
  /** Duvara/kenara çarpınca geri seker (hızı ters çevrilir). */
  bounce: boolean
  /** Duvar karolarından geçer. */
  ghost: boolean
  hidden: boolean
  flipX: boolean
  follow: { target: SpriteState; speed: number } | null
  control: { mode: 'four' | 'h' | 'v'; speed: number } | null
  props: Record<string, number | string | boolean>
  speech: { text: string; leftMs: number } | null
  touch: { up: boolean; down: boolean; left: boolean; right: boolean }
  destroyed: boolean
  /** Dünyanın içine en az bir kez girdi mi? (dışarıdan gelen sprite'lar "dünyadan çıkınca sil" ile hemen silinmez.) */
  seen: boolean
}

export interface Particle { x: number; y: number; vx: number; vy: number; life: number; max: number; color: number; size: number }

export type SoundEvent =
  | { kind: 'beep'; freq: number; ms: number }
  | { kind: 'note'; note: string; ms: number }
  | { kind: 'melody'; name: string }

export type GameState = 'running' | 'over'

export interface RtMap { name: string; cols: number; rows: number; cells: (string | null)[] }

export interface ImageInfo { w: number; h: number; bx: number; by: number; bw: number; bh: number; pix: Pix }

const PLACEHOLDER = ['2b2b2b2b', 'b2b2b2b2', '2b2b2b2b', 'b2b2b2b2', '2b2b2b2b', 'b2b2b2b2', '2b2b2b2b', 'b2b2b2b2']

export interface EngineOptions { seed?: number; onSound?: (e: SoundEvent) => void }

export interface GameStats {
  overlaps: number
  tileTouches: number
  created: number
  destroyed: number
  scoreChanges: number
  maxScore: number
  minLife: number
  buttonPresses: number
  maxSprites: number
  shakes: number
  bursts: number
  messages: number
}

export class OyunEngine {
  readonly world: OyunWorld
  readonly onSound?: (e: SoundEvent) => void
  sprites: SpriteState[] = []
  lastCreated: SpriteState | null = null
  state: GameState = 'running'
  result: 'win' | 'lose' | null = null
  overMessage = ''
  paused = false
  started = false
  /** Çalışma hatası (yorumlayıcı yazar): motor durur. */
  error: { message: string; blockId?: string | null } | null = null

  frame = 0
  timeMs = 0
  score = 0
  life = 3
  countdownMs: number | null = null
  hud = { score: false, life: false, time: false }
  bg = 0
  bgTile: string | null = null
  map: RtMap | null = null
  walls = new Set<string>()
  camera = { x: 0, y: 0 }
  cameraTarget: SpriteState | null = null

  shakeMs = 0
  shakeMag = 0
  particles: Particle[] = []
  toast: { text: string; leftMs: number } | null = null
  sounds: SoundEvent[] = []
  stats: GameStats = { overlaps: 0, tileTouches: 0, created: 0, destroyed: 0, scoreChanges: 0, maxScore: 0, minLife: 3, buttonPresses: 0, maxSprites: 0, shakes: 0, bursts: 0, messages: 0 }

  private subs: Sub[] = []
  private subAcc = new Map<number, number>()
  private handler: SubHandler | null = null
  private nextId = 1
  private down = new Set<Button>()
  private edges: { b: Button; e: 'press' | 'release' }[] = []
  private pairTouch = new Set<string>()
  private tileTouch = new Set<string>()
  private rng: () => number
  private infos = new Map<string, ImageInfo>()
  private lifeOver = false
  private depth = 0

  constructor(world: OyunWorld, opts: EngineOptions = {}) {
    this.world = world
    this.onSound = opts.onSound
    this.rng = mulberry32(opts.seed ?? 1)
    this.bg = colorIndex(world.bg, 0)
    for (const t of world.tileset) if (t.wall) this.walls.add(t.image)
  }

  // ---------- kayıt / başlatma ----------
  setSubs(subs: Sub[], handler: SubHandler): void {
    this.subs = subs
    this.handler = handler
    this.subAcc.clear()
  }
  hasSub(type: SubType): boolean { return this.subs.some((s) => s.type === type) }

  start(): void {
    if (this.started) return
    this.started = true
    this.fire('start', {})
  }

  private fire(type: SubType, ctx: EventCtx, match?: (s: Sub) => boolean): void {
    if (!this.handler || this.error) return
    if (this.depth > 12) { this.fail('Olaylar çok iç içe girdi (sonsuz tekrar olabilir).'); return }
    this.depth++
    try {
      for (const s of this.subs) {
        if (s.type !== type || (match && !match(s))) continue
        this.handler(s, ctx)
        if (this.error) return
      }
    } finally { this.depth-- }
  }

  fail(message: string, blockId?: string | null): void {
    if (!this.error) this.error = { message, blockId }
  }

  // ---------- rastgelelik ----------
  random(): number { return this.rng() }
  randomInt(a: number, b: number): number {
    const lo = Math.ceil(Math.min(a, b)), hi = Math.floor(Math.max(a, b))
    return lo + Math.floor(this.rng() * (hi - lo + 1))
  }

  // ---------- resimler ----------
  info(id: string): ImageInfo {
    let inf = this.infos.get(id)
    if (!inf) {
      const rows = this.world.images[id]?.rows ?? GALLERY_BY_ID[id]?.rows ?? PLACEHOLDER
      const pix = parse(rows)
      const b = opaqueBounds(pix)
      inf = { w: pix.w, h: pix.h, bx: b.x, by: b.y, bw: b.w, bh: b.h, pix }
      this.infos.set(id, inf)
    }
    return inf
  }
  imageExists(id: string): boolean { return !!(this.world.images[id] ?? GALLERY_BY_ID[id]) }

  // ---------- dünya ----------
  get isOver(): boolean { return this.state === 'over' }
  get worldW(): number { return this.map ? Math.max(SCREEN_W, this.map.cols * TILE) : SCREEN_W }
  get worldH(): number { return this.map ? Math.max(SCREEN_H, this.map.rows * TILE) : SCREEN_H }

  loadMap(name: string): boolean {
    const m = this.world.maps.find((x) => x.name === name)
    if (!m) return false
    this.map = buildRtMap(m, this.world.tileset)
    this.updateCamera()
    return true
  }
  tileAt(col: number, row: number): string | null {
    const m = this.map
    if (!m || col < 0 || row < 0 || col >= m.cols || row >= m.rows) return null
    return m.cells[row * m.cols + col]
  }
  setTile(col: number, row: number, image: string | null): void {
    const m = this.map
    if (!m || col < 0 || row < 0 || col >= m.cols || row >= m.rows) return
    m.cells[row * m.cols + col] = image
  }
  isWall(col: number, row: number): boolean {
    const t = this.tileAt(col, row)
    return t !== null && this.walls.has(t)
  }
  setWallImage(image: string, wall: boolean): void { if (wall) this.walls.add(image); else this.walls.delete(image) }
  countTiles(image: string): number { return this.map ? this.map.cells.filter((c) => c === image).length : 0 }

  /** Haritadaki tüm `image` karolarını boşaltıp yerlerine sprite koyar; oluşan sprite'ları döndürür. */
  tilesToSprites(image: string, kind: string): SpriteState[] {
    const m = this.map
    const out: SpriteState[] = []
    if (!m) return out
    for (let r = 0; r < m.rows; r++) for (let c = 0; c < m.cols; c++) {
      if (m.cells[r * m.cols + c] !== image) continue
      m.cells[r * m.cols + c] = null
      out.push(this.createSprite(image, kind, c * TILE + TILE / 2, r * TILE + TILE / 2))
    }
    return out
  }

  // ---------- sprite'lar ----------
  createSprite(image: string, kind: string, x = SCREEN_W / 2, y = SCREEN_H / 2): SpriteState {
    const inf = this.info(image)
    const s: SpriteState = {
      id: this.nextId++, kind: KIND_IDS.includes(kind) ? kind : 'nesne', image, x, y, vx: 0, vy: 0, ax: 0, ay: 0, w: inf.w, h: inf.h,
      lifeMs: null, z: 0, autoDestroy: false, stay: false, bounce: false, ghost: false, hidden: false, flipX: false,
      follow: null, control: null, props: {}, speech: null, touch: { up: false, down: false, left: false, right: false }, destroyed: false, seen: false,
    }
    this.sprites.push(s)
    this.lastCreated = s
    this.stats.created++
    if (this.sprites.length > this.stats.maxSprites) this.stats.maxSprites = this.sprites.length
    if (this.sprites.length > 500) this.fail('Çok fazla sprite var (en çok 500). Kullanılmayanları silmeyi unutma.')
    this.fire('created', { sprite: s }, (sub) => sub.kind === s.kind || sub.kind === 'hepsi')
    return s
  }
  setImage(s: SpriteState, image: string): void {
    const inf = this.info(image)
    s.image = image
    s.w = inf.w
    s.h = inf.h
  }
  destroy(s: SpriteState): void {
    if (s.destroyed) return
    s.destroyed = true
    this.sprites = this.sprites.filter((x) => x !== s)
    for (const o of this.sprites) if (o.follow?.target === s) o.follow = null
    if (this.cameraTarget === s) this.cameraTarget = null
    this.stats.destroyed++
    this.fire('destroyed', { sprite: s }, (sub) => sub.kind === s.kind || sub.kind === 'hepsi')
  }
  spritesOfKind(kind: string): SpriteState[] {
    return kind === 'hepsi' ? [...this.sprites] : this.sprites.filter((s) => s.kind === kind)
  }
  hitbox(s: SpriteState): { l: number; t: number; r: number; b: number } {
    const inf = this.info(s.image)
    const l = s.x - s.w / 2 + inf.bx
    const t = s.y - s.h / 2 + inf.by
    return { l, t, r: l + inf.bw, b: t + inf.bh }
  }
  overlapping(a: SpriteState, b: SpriteState): boolean {
    if (a === b || a.destroyed || b.destroyed) return false
    const p = this.hitbox(a), q = this.hitbox(b)
    return p.l < q.r && q.l < p.r && p.t < q.b && q.t < p.b
  }
  /** Sprite'ı haritada (col,row) karosunun ortasına koyar. */
  placeOnTile(s: SpriteState, col: number, row: number): void {
    s.x = col * TILE + TILE / 2
    s.y = row * TILE + TILE / 2
  }
  /** Sprite'ın hızını yön (derece, 0 = yukarı, 90 = sağ) ve hız ile ayarlar. */
  setHeading(s: SpriteState, deg: number, speed: number): void {
    const r = (deg * Math.PI) / 180
    s.vx = Math.sin(r) * speed
    s.vy = -Math.cos(r) * speed
  }
  heading(s: SpriteState): number {
    if (s.vx === 0 && s.vy === 0) return 0
    return (((Math.atan2(s.vx, -s.vy) * 180) / Math.PI) % 360 + 360) % 360
  }
  say(s: SpriteState, text: string, sec: number): void { s.speech = { text: String(text).slice(0, 60), leftMs: Math.max(0.2, sec) * 1000 } }

  // ---------- oyun durumu ----------
  setScore(n: number): void {
    this.score = Math.round(Number.isFinite(n) ? n : 0)
    this.hud.score = true
    this.stats.scoreChanges++
    if (this.score > this.stats.maxScore) this.stats.maxScore = this.score
  }
  setLife(n: number): void {
    this.life = Math.max(0, Math.min(99, Math.round(Number.isFinite(n) ? n : 0)))
    this.hud.life = true
    if (this.life < this.stats.minLife) this.stats.minLife = this.life
    if (this.life <= 0 && !this.lifeOver) {
      this.lifeOver = true
      if (this.hasSub('lifeEnd')) this.fire('lifeEnd', {})
      else this.gameOver(false, 'CAN BİTTİ')
    } else if (this.life > 0) this.lifeOver = false
  }
  startCountdown(sec: number): void {
    this.countdownMs = Math.max(0, sec) * 1000
    this.hud.time = true
  }
  gameOver(win: boolean, message?: string): void {
    if (this.state === 'over') return
    this.state = 'over'
    this.result = win ? 'win' : 'lose'
    this.overMessage = message ?? (win ? 'KAZANDIN!' : 'OYUN BİTTİ')
    this.pushSound({ kind: 'melody', name: win ? 'zafer' : 'kayip' })
  }
  showMessage(text: string, sec: number): void { this.stats.messages++; this.toast = { text: String(text).slice(0, 80), leftMs: Math.max(0.2, sec) * 1000 } }
  shake(ms: number, mag = 3): void { this.stats.shakes++; this.shakeMs = Math.max(this.shakeMs, Math.min(5000, ms)); this.shakeMag = mag }
  burst(x: number, y: number, color: number, count = 14): void {
    this.stats.bursts++
    for (let i = 0; i < count && this.particles.length < 400; i++) {
      const a = this.rng() * Math.PI * 2
      const sp = 20 + this.rng() * 60
      const life = 350 + this.rng() * 350
      this.particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life, max: life, color: colorIndex(color), size: this.rng() < 0.4 ? 2 : 1 })
    }
  }
  setPaused(p: boolean): void { this.paused = p }
  pushSound(e: SoundEvent): void {
    this.sounds.push(e)
    if (this.sounds.length > 200) this.sounds.shift()
    this.onSound?.(e)
  }

  // ---------- denetleyici ----------
  press(b: Button): void {
    if (!BUTTONS.includes(b) || this.down.has(b)) return
    this.down.add(b)
    this.edges.push({ b, e: 'press' })
    this.stats.buttonPresses++
  }
  release(b: Button): void {
    if (!this.down.has(b)) return
    this.down.delete(b)
    this.edges.push({ b, e: 'release' })
  }
  releaseAll(): void { for (const b of [...this.down]) this.release(b) }
  isDown(b: Button): boolean { return this.down.has(b) }
  /** Yatay (-1..1) ve dikey (-1..1, aşağı +) yön. */
  axis(): { x: number; y: number } {
    return { x: (this.down.has('right') ? 1 : 0) - (this.down.has('left') ? 1 : 0), y: (this.down.has('down') ? 1 : 0) - (this.down.has('up') ? 1 : 0) }
  }

  // ---------- ana döngü ----------
  /** Tam bir kare (1/60 sn) ilerletir. */
  tick(): void {
    if (this.paused || this.error) return
    if (!this.started) this.start()
    if (this.isOver) { this.effects(); return }
    this.frame++
    this.timeMs += DT_MS

    const edges = this.edges
    this.edges = []
    for (const ed of edges) this.fire('button', {}, (s) => s.button === ed.b && s.edge === ed.e)
    if (this.isOver) return
    this.fire('update', {})
    this.timers()
    this.physics()
    this.collisions()
    this.tileCollisions()
    this.lifetimes()
    this.countdown()
    this.updateCamera()
    this.effects()
  }

  private timers(): void {
    for (const s of this.subs) {
      if (s.type !== 'every' || !s.ms) continue
      let acc = (this.subAcc.get(s.id) ?? 0) + DT_MS
      let n = 0
      while (acc >= s.ms && n < 5) {
        acc -= s.ms
        n++
        this.fire('every', {}, (x) => x === s)
        if (this.error || this.isOver) return
      }
      this.subAcc.set(s.id, Math.min(acc, s.ms))
    }
  }

  private physics(): void {
    const ax = this.axis()
    for (const s of [...this.sprites]) {
      if (s.destroyed) continue
      if (s.follow) {
        const t = s.follow.target
        const dx = t.x - s.x, dy = t.y - s.y
        const d = Math.hypot(dx, dy)
        if (d < 1) { s.vx = 0; s.vy = 0 } else { s.vx = (dx / d) * s.follow.speed; s.vy = (dy / d) * s.follow.speed }
      }
      if (s.control) {
        if (s.control.mode === 'four') { s.vx = ax.x * s.control.speed; s.vy = ax.y * s.control.speed }
        else if (s.control.mode === 'h') s.vx = ax.x * s.control.speed
        else s.vy = ax.y * s.control.speed
      }
      s.vx += s.ax * DT
      s.vy += s.ay * DT
      this.moveAxis(s, 'x', s.vx * DT)
      this.moveAxis(s, 'y', s.vy * DT)
      this.clampWorld(s)
      this.probeTouch(s)
      if (s.autoDestroy) {
        const r = this.hitbox(s)
        const W = this.worldW, H = this.worldH
        const inside = r.r > 0 && r.l < W && r.b > 0 && r.t < H
        if (inside) s.seen = true
        else if (s.seen || r.r < -64 || r.l > W + 64 || r.b < -64 || r.t > H + 64) this.destroy(s)
      }
    }
  }

  private moveAxis(s: SpriteState, axis: 'x' | 'y', delta: number): void {
    if (delta === 0) return
    const steps = Math.max(1, Math.ceil(Math.abs(delta) / 4))
    const step = delta / steps
    for (let i = 0; i < steps; i++) {
      s[axis] += step
      if (s.ghost || !this.map) continue
      const r = this.hitbox(s)
      const c0 = Math.floor(r.l / TILE), c1 = Math.floor((r.r - 0.001) / TILE)
      const r0 = Math.floor(r.t / TILE), r1 = Math.floor((r.b - 0.001) / TILE)
      let hit = false
      for (let row = r0; row <= r1 && !hit; row++) for (let col = c0; col <= c1; col++) {
        if (!this.isWall(col, row)) continue
        if (axis === 'x') s.x += step > 0 ? col * TILE - r.r : (col + 1) * TILE - r.l
        else s.y += step > 0 ? row * TILE - r.b : (row + 1) * TILE - r.t
        hit = true
        break
      }
      if (hit) {
        const v = axis === 'x' ? 'vx' : 'vy'
        s[v] = s.bounce ? -s[v] : 0
        return
      }
    }
  }

  private clampWorld(s: SpriteState): void {
    if (!s.stay && !s.bounce) return
    const r = this.hitbox(s)
    const W = this.worldW, H = this.worldH
    if (r.l < 0) { s.x -= r.l; if (s.bounce && s.vx < 0) s.vx = -s.vx; else if (s.vx < 0) s.vx = 0 }
    else if (r.r > W) { s.x -= r.r - W; if (s.bounce && s.vx > 0) s.vx = -s.vx; else if (s.vx > 0) s.vx = 0 }
    if (r.t < 0) { s.y -= r.t; if (s.bounce && s.vy < 0) s.vy = -s.vy; else if (s.vy < 0) s.vy = 0 }
    else if (r.b > H) { s.y -= r.b - H; if (s.bounce && s.vy > 0) s.vy = -s.vy; else if (s.vy > 0) s.vy = 0 }
  }

  private wallIn(l: number, t: number, r: number, b: number): boolean {
    if (!this.map) return false
    const c0 = Math.floor(l / TILE), c1 = Math.floor((r - 0.001) / TILE)
    const r0 = Math.floor(t / TILE), r1 = Math.floor((b - 0.001) / TILE)
    for (let row = r0; row <= r1; row++) for (let col = c0; col <= c1; col++) if (this.isWall(col, row)) return true
    return false
  }

  /** Sprite'ın dört yanında duvar ya da (kalıyorsa) dünya kenarı olup olmadığını günceller. */
  private probeTouch(s: SpriteState): void {
    const r = this.hitbox(s)
    const e = 0.6
    const edgeOk = s.stay || s.bounce
    s.touch.down = (!s.ghost && this.wallIn(r.l + 0.5, r.b, r.r - 0.5, r.b + e)) || (edgeOk && r.b >= this.worldH - 0.01)
    s.touch.up = (!s.ghost && this.wallIn(r.l + 0.5, r.t - e, r.r - 0.5, r.t)) || (edgeOk && r.t <= 0.01)
    s.touch.left = (!s.ghost && this.wallIn(r.l - e, r.t + 0.5, r.l, r.b - 0.5)) || (edgeOk && r.l <= 0.01)
    s.touch.right = (!s.ghost && this.wallIn(r.r, r.t + 0.5, r.r + e, r.b - 0.5)) || (edgeOk && r.r >= this.worldW - 0.01)
  }

  private collisions(): void {
    const subs = this.subs.filter((s) => s.type === 'overlap')
    if (!subs.length) return
    const now = new Set<string>()
    const pending: { sub: Sub; a: SpriteState; b: SpriteState }[] = []
    for (const sub of subs) {
      const A = this.spritesOfKind(sub.kind ?? 'hepsi'), B = this.spritesOfKind(sub.kind2 ?? 'hepsi')
      for (const a of A) for (const b of B) {
        if (a === b || !this.overlapping(a, b)) continue
        if (sub.kind === sub.kind2 && a.id > b.id) continue
        const key = `${sub.id}:${a.id}:${b.id}`
        now.add(key)
        if (!this.pairTouch.has(key)) pending.push({ sub, a, b })
      }
    }
    this.pairTouch = now
    for (const p of pending) {
      if (p.a.destroyed || p.b.destroyed) continue
      this.stats.overlaps++
      this.fire('overlap', { sprite: p.a, other: p.b }, (s) => s === p.sub)
      if (this.error || this.isOver) return
    }
  }

  private tileCollisions(): void {
    const subs = this.subs.filter((s) => s.type === 'tile')
    if (!subs.length || !this.map) { this.tileTouch.clear(); return }
    const now = new Set<string>()
    const pending: { sub: Sub; s: SpriteState; col: number; row: number }[] = []
    for (const sub of subs) {
      for (const s of this.spritesOfKind(sub.kind ?? 'hepsi')) {
        const r = this.hitbox(s)
        const c0 = Math.floor((r.l - 1) / TILE), c1 = Math.floor((r.r + 0.999) / TILE)
        const r0 = Math.floor((r.t - 1) / TILE), r1 = Math.floor((r.b + 0.999) / TILE)
        for (let row = r0; row <= r1; row++) for (let col = c0; col <= c1; col++) {
          if (this.tileAt(col, row) !== sub.image) continue
          const key = `${sub.id}:${s.id}:${col}:${row}`
          now.add(key)
          if (!this.tileTouch.has(key)) pending.push({ sub, s, col, row })
        }
      }
    }
    this.tileTouch = now
    for (const p of pending) {
      if (p.s.destroyed || this.tileAt(p.col, p.row) !== p.sub.image) continue
      this.stats.tileTouches++
      this.fire('tile', { sprite: p.s, col: p.col, row: p.row }, (s) => s === p.sub)
      if (this.error || this.isOver) return
    }
  }

  private lifetimes(): void {
    for (const s of [...this.sprites]) {
      if (s.speech) { s.speech.leftMs -= DT_MS; if (s.speech.leftMs <= 0) s.speech = null }
      if (s.lifeMs !== null) { s.lifeMs -= DT_MS; if (s.lifeMs <= 0) this.destroy(s) }
    }
  }

  private countdown(): void {
    if (this.countdownMs === null) return
    this.countdownMs -= DT_MS
    if (this.countdownMs <= 0) {
      this.countdownMs = 0
      if (this.hasSub('timeEnd')) { this.fire('timeEnd', {}); this.countdownMs = null }
      else this.gameOver(false, 'SÜRE BİTTİ')
    }
  }

  private updateCamera(): void {
    const t = this.cameraTarget
    const maxX = Math.max(0, this.worldW - SCREEN_W), maxY = Math.max(0, this.worldH - SCREEN_H)
    if (t) {
      this.camera.x = Math.max(0, Math.min(maxX, t.x - SCREEN_W / 2))
      this.camera.y = Math.max(0, Math.min(maxY, t.y - SCREEN_H / 2))
    } else {
      this.camera.x = Math.max(0, Math.min(maxX, this.camera.x))
      this.camera.y = Math.max(0, Math.min(maxY, this.camera.y))
    }
  }

  private effects(): void {
    if (this.shakeMs > 0) this.shakeMs = Math.max(0, this.shakeMs - DT_MS)
    if (this.toast) { this.toast.leftMs -= DT_MS; if (this.toast.leftMs <= 0) this.toast = null }
    for (const p of this.particles) { p.x += p.vx * DT; p.y += p.vy * DT; p.life -= DT_MS }
    if (this.particles.length) this.particles = this.particles.filter((p) => p.life > 0)
  }

  /** Ekran sarsıntısı kayması (render için): her kare farklı, ama yalnız render çağrısında hesaplanır. */
  shakeOffset(): { x: number; y: number } {
    if (this.shakeMs <= 0) return { x: 0, y: 0 }
    const m = this.shakeMag
    return { x: Math.round(Math.sin(this.frame * 12.9898) * m), y: Math.round(Math.cos(this.frame * 78.233) * m) }
  }

  /** Test ve hedef denetimi için sade anlık görüntü. */
  snapshot() {
    return {
      state: this.state, result: this.result, score: this.score, life: this.life, countdownMs: this.countdownMs, frame: this.frame, error: this.error?.message ?? null,
      sprites: this.sprites.map((s) => ({ id: s.id, kind: s.kind, image: s.image, x: s.x, y: s.y, vx: s.vx, vy: s.vy, props: { ...s.props } })),
      map: this.map ? { name: this.map.name, cols: this.map.cols, rows: this.map.rows } : null,
    }
  }
}

export function buildRtMap(m: OyunMap, tileset: readonly OyunTile[]): RtMap {
  const cells: (string | null)[] = []
  for (let r = 0; r < m.rows; r++) for (let c = 0; c < m.cols; c++) {
    const ch = m.cells[r]?.[c] ?? '.'
    const i = TILE_KEYS.indexOf(ch)
    cells.push(i >= 0 && tileset[i] ? tileset[i].image : null)
  }
  return { name: m.name, cols: m.cols, rows: m.rows, cells }
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
