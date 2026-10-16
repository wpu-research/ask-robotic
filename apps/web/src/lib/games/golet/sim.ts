// Gölet benzetimi (saf TypeScript, DOM yok): havuz, ördekler, top atışları. Hem blok kipi hem JavaScript kipi aynı dünyayı kullanır.
// Yön: 0° = sağ (doğu), 90° = yukarı (kuzey), 180° = sol, 270° = aşağı. Havuz 100 x 100 birimdir.

export const ARENA = 100
export const DUCK_R = 3
/** %100 hızda tik başına gidilen birim. */
export const MAX_SPEED = 1
/** Tik başına hız değişimi (yüzde puanı): ördekler birden hızlanıp durmaz. */
export const ACCEL = 10
export const SHOT_SPEED = 4
export const MAX_RANGE = 70
/** İki atış arası bekleme (tik). */
export const RELOAD = 16
export const BLAST_R = 6
/** Patlamanın tam merkezinde verdiği hasar; kenara doğru doğrusal azalır. */
export const BLAST_DMG = 25
export const BLAST_LIFE = 8

export type AiKind = 'sitter' | 'wanderer' | 'hunter' | 'sniper' | 'master'

/** Bir ördeğin kullanabildiği komutlar (oyuncu ve rakipler aynı komutları kullanır). */
export interface DuckApi {
  /** Yönünü ve hızını (0–100) ayarla; hız ayarlanana kadar sürer. */
  swim(direction: number, speed?: number): void
  /** Top at: yön ve menzil (0–70). Top hazır değilse boşa gider. */
  cannon(direction: number, range: number): void
  /** O yöne bak (±çözünürlük/2 derece): en yakın rakibin uzaklığı, yoksa Infinity. */
  scan(direction: number, resolution?: number): number
  health(): number
  getX(): number
  getY(): number
  speed(): number
}

/** Yapay zekâ komutlarına ek yardımcılar (oyuncu kodunda yoktur). */
export interface AiApi extends DuckApi { rand(): number; tick(): number }
export type AiController = (api: AiApi, mem: Record<string, any>) => void
/** Oyuncu denetleyicisi (JavaScript kipi): her tikte bir kez çağrılır. */
export type PlayerController = (api: DuckApi, mem: Record<string, unknown>) => void

export interface Duck {
  id: number
  name: string
  kind: 'player' | AiKind
  color: string
  x: number
  y: number
  hp: number
  alive: boolean
  dir: number
  speed: number
  targetSpeed: number
  reload: number
  kills: number
  damage: number
  diedAt: number | null
  fire: { dir: number; range: number } | null
  mem: Record<string, any>
  controller?: AiController | PlayerController
}

export interface Shot { x: number; y: number; dir: number; range: number; traveled: number; owner: number }
export interface Blast { x: number; y: number; age: number }

export interface DuckFrame {
  id: number; name: string; kind: Duck['kind']; color: string
  x: number; y: number; hp: number; alive: boolean; dir: number; speed: number; reload: number
  kills: number; damage: number; diedAt: number | null
}
export type EndReason = 'win' | 'lose' | 'timeout' | 'error' | null
export interface PondFrame {
  tick: number
  maxTicks: number
  ducks: DuckFrame[]
  /** `tx,ty`: topun patlayacağı nokta. */
  shots: { x: number; y: number; dir: number; tx: number; ty: number }[]
  blasts: Blast[]
  over: boolean
  reason: EndReason
  /** Kayıt kimliği: tekrar izleme için (bkz. recording.ts). */
  recId: number
  /** Oyuncunun kodundaki hata (JavaScript kipi). */
  error?: string
}

export interface World {
  tick: number
  maxTicks: number
  ducks: Duck[]
  shots: Shot[]
  blasts: Blast[]
  rng: () => number
  over: boolean
  reason: EndReason
  error?: string
  frames: PondFrame[] | null
  recId: number
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

const rad = (d: number) => (d * Math.PI) / 180
export const deg = (r: number) => (r * 180) / Math.PI
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const fin = (v: unknown, def = 0): number => (typeof v === 'number' && Number.isFinite(v) ? v : def)
export const norm360 = (d: number) => ((d % 360) + 360) % 360
/** İki yön arasındaki en küçük fark (0..180). */
export const angleDiff = (a: number, b: number) => { const d = Math.abs(norm360(a) - norm360(b)); return d > 180 ? 360 - d : d }

export const DUCK_COLORS: Record<Duck['kind'], string> = {
  player: '#ffc93c', sitter: '#9fb4c8', wanderer: '#5cc08a', hunter: '#ef5f5f', sniper: '#a07be0', master: '#2f3a4f',
}
export const KIND_NAMES: Record<AiKind, string> = { sitter: 'Dümdüz', wanderer: 'Gezgin', hunter: 'Avcı', sniper: 'Nişancı', master: 'Usta' }
/** Rakip türlerinin İngilizce adları (yalnız görünüm). */
export const KIND_NAMES_EN: Record<AiKind, string> = { sitter: 'Sitter', wanderer: 'Wanderer', hunter: 'Hunter', sniper: 'Sniper', master: 'Master' }
/** Ördeğin görünen adı: İngilizcede "Sen" → "You", "Gezgin 2" → "Wanderer 2". Kayıtlı ad değişmez. */
export function duckDisplayName(d: { name: string; kind: 'player' | AiKind }, en: boolean): string {
  if (!en) return d.name
  if (d.kind === 'player') return 'You'
  const tr = KIND_NAMES[d.kind]
  return d.name.startsWith(tr) ? KIND_NAMES_EN[d.kind] + d.name.slice(tr.length) : d.name
}

export interface FoeSpec {
  kind: AiKind
  /** Sabit konum; yoksa `region` içinde tohumla seçilir. */
  x?: number
  y?: number
  region?: [number, number, number, number]
  /** Oyuncudan en az bu kadar uzakta (varsayılan 18) doğsun. */
  minDist?: number
}
export interface PondData {
  player: { x: number; y: number; dir?: number }
  foes: FoeSpec[]
  maxTicks: number
}

let recCounter = 0

export interface CreateOpts { seed?: number; record?: boolean; controllers: Record<AiKind, AiController> }

export function createWorld(data: PondData, opts: CreateOpts): World {
  const rng = mulberry32((opts.seed ?? 1) * 7919 + 13)
  const ducks: Duck[] = []
  const mk = (id: number, name: string, kind: Duck['kind'], x: number, y: number, dir: number, controller?: Duck['controller']): Duck => ({
    id, name, kind, color: DUCK_COLORS[kind], x, y, hp: 100, alive: true, dir, speed: 0, targetSpeed: 0, reload: 0, kills: 0, damage: 0, diedAt: null, fire: null, mem: {}, controller,
  })
  ducks.push(mk(0, 'Sen', 'player', data.player.x, data.player.y, data.player.dir ?? 0))
  const count: Partial<Record<AiKind, number>> = {}
  for (const f of data.foes) count[f.kind] = (count[f.kind] ?? 0) + 1
  const seen: Partial<Record<AiKind, number>> = {}
  data.foes.forEach((f, i) => {
    let x: number = f.x ?? 0, y: number = f.y ?? 0
    if (f.x === undefined || f.y === undefined) {
      const [x0, y0, x1, y1] = f.region ?? [10, 10, 90, 90]
      for (let k = 0; k < 40; k++) {
        x = x0 + rng() * (x1 - x0); y = y0 + rng() * (y1 - y0)
        if (Math.hypot(x - data.player.x, y - data.player.y) >= (f.minDist ?? 18)) break
      }
    }
    seen[f.kind] = (seen[f.kind] ?? 0) + 1
    const name = (count[f.kind] ?? 0) > 1 ? `${KIND_NAMES[f.kind]} ${seen[f.kind]}` : KIND_NAMES[f.kind]
    ducks.push(mk(i + 1, name, f.kind, x, y, norm360(rng() * 360), opts.controllers[f.kind]))
  })
  const w: World = { tick: 0, maxTicks: data.maxTicks, ducks, shots: [], blasts: [], rng, over: false, reason: null, frames: opts.record ? [] : null, recId: ++recCounter }
  if (w.frames) w.frames.push(snapshot(w))
  return w
}

export function snapshot(w: World): PondFrame {
  return {
    tick: w.tick,
    maxTicks: w.maxTicks,
    ducks: w.ducks.map((d) => ({ id: d.id, name: d.name, kind: d.kind, color: d.color, x: d.x, y: d.y, hp: Math.max(0, d.hp), alive: d.alive, dir: d.dir, speed: d.speed, reload: d.reload, kills: d.kills, damage: Math.round(d.damage), diedAt: d.diedAt })),
    shots: w.shots.map((s) => ({ x: s.x, y: s.y, dir: s.dir, tx: s.x + Math.cos(rad(s.dir)) * (s.range - s.traveled), ty: s.y + Math.sin(rad(s.dir)) * (s.range - s.traveled) })),
    blasts: w.blasts.map((b) => ({ ...b })),
    over: w.over,
    reason: w.reason,
    recId: w.recId,
    ...(w.error ? { error: w.error } : {}),
  }
}

/** Bir ördeğin komut arayüzü (komutlar yalnız niyeti kaydeder; fizik `advance` içinde işler). */
export function apiFor(w: World, d: Duck): DuckApi {
  return {
    swim(direction, spd = 50) {
      d.dir = norm360(fin(direction, d.dir))
      d.targetSpeed = clamp(fin(spd, 50), 0, 100)
    },
    cannon(direction, range) {
      d.fire = { dir: norm360(fin(direction)), range: clamp(fin(range), 0, MAX_RANGE) }
    },
    scan(direction, resolution = 5) {
      const res = clamp(fin(resolution, 5), 1, 40)
      const dir = fin(direction)
      let best = Infinity
      for (const o of w.ducks) {
        if (o === d || !o.alive) continue
        const dx = o.x - d.x, dy = o.y - d.y
        const dist = Math.hypot(dx, dy)
        if (dist < 0.001) { best = 0; continue }
        if (angleDiff(deg(Math.atan2(dy, dx)), dir) <= res / 2 && dist < best) best = dist
      }
      return best
    },
    health: () => Math.round(Math.max(0, d.hp)),
    getX: () => Math.round(d.x * 100) / 100,
    getY: () => Math.round(d.y * 100) / 100,
    speed: () => Math.round(d.speed),
  }
}

function explode(w: World, x: number, y: number, owner: Duck) {
  w.blasts.push({ x, y, age: 0 })
  for (const t of w.ducks) {
    if (!t.alive || t === owner) continue
    const dist = Math.hypot(t.x - x, t.y - y)
    if (dist >= BLAST_R) continue
    const dmg = BLAST_DMG * (1 - dist / BLAST_R)
    t.hp -= dmg
    owner.damage += dmg
    if (t.hp <= 0) { t.hp = 0; t.alive = false; t.diedAt = w.tick; t.speed = 0; t.targetSpeed = 0; owner.kills++ }
  }
}

/** Dünyayı bir tik ilerletir: denetleyiciler → atışlar → hareket → patlamalar → bitiş denetimi. */
export function advance(w: World): void {
  if (w.over) return
  const ai = (d: Duck): AiApi => ({ ...apiFor(w, d), rand: w.rng, tick: () => w.tick })
  for (const d of w.ducks) {
    if (!d.alive || !d.controller) continue
    try {
      if (d.kind === 'player') (d.controller as PlayerController)(apiFor(w, d), d.mem)
      else (d.controller as AiController)(ai(d), d.mem)
    } catch (e) {
      if (d.kind === 'player') {
        w.error = e instanceof Error ? e.message : String(e)
        w.over = true
        w.reason = 'error'
        if (w.frames) w.frames.push(snapshot(w))
        return
      }
    }
  }
  for (const d of w.ducks) {
    if (!d.alive) continue
    if (d.reload > 0) d.reload--
    if (d.fire && d.reload <= 0) {
      w.shots.push({ x: d.x, y: d.y, dir: d.fire.dir, range: d.fire.range, traveled: 0, owner: d.id })
      d.reload = RELOAD
    }
    d.fire = null
  }
  for (const d of w.ducks) {
    if (!d.alive) continue
    d.speed += clamp(d.targetSpeed - d.speed, -ACCEL, ACCEL)
    d.x = clamp(d.x + Math.cos(rad(d.dir)) * (d.speed / 100) * MAX_SPEED, DUCK_R, ARENA - DUCK_R)
    d.y = clamp(d.y + Math.sin(rad(d.dir)) * (d.speed / 100) * MAX_SPEED, DUCK_R, ARENA - DUCK_R)
  }
  const live: Shot[] = []
  for (const s of w.shots) {
    const step = Math.min(SHOT_SPEED, s.range - s.traveled)
    s.x += Math.cos(rad(s.dir)) * step
    s.y += Math.sin(rad(s.dir)) * step
    s.traveled += step
    if (s.traveled >= s.range - 1e-9) explode(w, s.x, s.y, w.ducks[s.owner])
    else live.push(s)
  }
  w.shots = live
  w.blasts = w.blasts.filter((b) => ++b.age <= BLAST_LIFE)
  w.tick++
  const alive = w.ducks.filter((d) => d.alive)
  const player = w.ducks[0]
  if (!player.alive) { w.over = true; w.reason = 'lose' }
  else if (alive.length <= 1) { w.over = true; w.reason = 'win' }
  else if (w.tick >= w.maxTicks) { w.over = true; w.reason = 'timeout' }
  if (w.frames) w.frames.push(snapshot(w))
}

/** Program bittikten sonra: havadaki toplar yerine inene kadar (en çok `max` tik) dünyayı ilerletir. Oyuncu durur. */
export function settle(w: World, max = 30): void {
  const p = w.ducks[0]
  p.targetSpeed = 0
  for (let i = 0; i < max && !w.over && w.shots.length > 0; i++) advance(w)
}

/** Sıralama: sağ kalanlar önce (can çoktan aza), sonra daha geç ölen daha üstte. */
export function ranking(frame: Pick<PondFrame, 'ducks'>): DuckFrame[] {
  return [...frame.ducks].sort((a, b) => {
    if (a.alive !== b.alive) return a.alive ? -1 : 1
    if (a.alive) return b.hp - a.hp || b.kills - a.kills
    return (b.diedAt ?? 0) - (a.diedAt ?? 0)
  })
}
