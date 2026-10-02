// Sahne motoru: dünya durumu (sprite'lar, klonlar, değişkenler, kalem, ses olayları) ve ilkel işlemler. Saf TypeScript, DOM yok.
// Blok yorumlayıcı (interp.ts) bu işlemleri çağırır; zamanlama (kare) oradadır. Zaman SANALDIR: bir kare 1/30 sn.
import { costumeQuad, fenceDelta, normDir, pointInQuad, quadBox, quadsOverlap, rad, touchesEdge, type Quad } from './geometry'
import { noteSteps, soundDuration, soundSteps, type ToneStep } from './sounds'
import { FRAME_MS, MAX_CLONES, MAX_LIST_ITEMS, STAGE_H, STAGE_W, type Costume, type ProcDef, type RotationStyle, type SahneProject, type SoundRef, type SpriteDef } from './types'

export type Value = number | string | boolean

// ───────── Değer dönüşümleri (Scratch benzeri gevşek tipler) ─────────
export function toNum(v: Value | undefined | null): number {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0
  if (typeof v === 'boolean') return v ? 1 : 0
  if (typeof v === 'string') {
    const s = v.trim()
    if (s === '') return 0
    const n = Number(/^-?\d+,\d+$/.test(s) ? s.replace(',', '.') : s)
    return Number.isFinite(n) ? n : 0
  }
  return 0
}
export function isNumeric(v: Value | undefined | null): boolean {
  if (typeof v === 'number') return Number.isFinite(v)
  if (typeof v === 'string') { const s = v.trim(); return s !== '' && Number.isFinite(Number(/^-?\d+,\d+$/.test(s) ? s.replace(',', '.') : s)) }
  return false
}
export function toStr(v: Value | undefined | null): string {
  if (v === undefined || v === null) return ''
  if (typeof v === 'number') return Number.isInteger(v) ? String(v) : String(parseFloat(v.toPrecision(12)))
  return String(v)
}
export function toBool(v: Value | undefined | null): boolean {
  if (typeof v === 'string') { const l = v.toLowerCase(); return !(v === '' || v === '0' || l === 'false') }
  return !!v
}
/** Her iki değer sayıysa sayısal, değilse büyük/küçük harfe duyarsız metin karşılaştırması. */
export function compareValues(a: Value, b: Value): number {
  if (isNumeric(a) && isNumeric(b)) return toNum(a) - toNum(b)
  const x = toStr(a).toLowerCase(), y = toStr(b).toLowerCase()
  return x < y ? -1 : x > y ? 1 : 0
}

export class ProgramError extends Error {
  blockId: string | null
  constructor(message: string, blockId: string | null = null) { super(message); this.name = 'ProgramError'; this.blockId = blockId }
}

export interface Bubble { text: string; think: boolean; seq: number }
export interface Effects { color: number; ghost: number; brightness: number }

export interface RtTarget {
  uid: number
  /** Sprite/sahne tanım kimliği (klonlar aynı kimliği paylaşır). */
  defId: string
  name: string
  isStage: boolean
  isClone: boolean
  x: number
  y: number
  dir: number
  size: number
  visible: boolean
  rotationStyle: RotationStyle
  costumes: Costume[]
  costume: number
  sounds: SoundRef[]
  procs: ProcDef[]
  effects: Effects
  bubble: Bubble | null
  penDown: boolean
  penColor: string
  penSize: number
  /** 0-100. */
  volume: number
  /** Perde efekti (10 birim = 1 yarım ton). */
  pitch: number
  deleted: boolean
}

export type PenOp =
  | { k: 'line'; x0: number; y0: number; x1: number; y1: number; c: string; w: number }
  | { k: 'dot'; x: number; y: number; c: string; w: number }
  | { k: 'clear' }
  | { k: 'stamp'; costume: Costume; x: number; y: number; dir: number; size: number; rotationStyle: RotationStyle; effects: Effects }

export interface EngineEvent { t: number; kind: string; target: string; detail?: string }
export interface SayRecord { defId: string; uid: number; text: string; think: boolean; start: number; end: number | null }
export interface SoundPlay { target: RtTarget; ref: SoundRef; volume: number; steps: ToneStep[]; durationMs: number }

export interface EngineHooks {
  backdrop?: (name: string) => void
  cloneCreated?: (t: RtTarget) => void
  cloneDeleted?: (t: RtTarget) => void
}

const newEffects = (): Effects => ({ color: 0, ghost: 0, brightness: 0 })
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export class SahneEngine {
  readonly project: SahneProject
  time = 0
  frame = 0
  readonly stage: RtTarget
  /** Sprite'lar ve klonlar, arkadan öne. */
  targets: RtTarget[] = []
  readonly vars = new Map<string, Value>()
  readonly lists = new Map<string, Value[]>()
  readonly varVisible = new Map<string, boolean>()
  readonly keys = new Set<string>()
  mouse = { x: 0, y: 0, down: false }
  answer = ''
  asking: { uid: number; text: string; target: RtTarget } | null = null
  timerStart = 0
  readonly pen: PenOp[] = []
  readonly events: EngineEvent[] = []
  readonly counts: Record<string, number> = {}
  readonly sayLog: SayRecord[] = []
  error: { message: string; blockId: string | null } | null = null
  hooks: EngineHooks = {}
  onSound?: (p: SoundPlay) => void
  onStopSounds?: () => void
  /** Bir kare içinde görsel bir değişiklik oldu mu (döngüler buna göre kareyi bırakır). */
  redraw = false
  private uid = 0
  private bubbleSeq = 0
  readonly rand: () => number

  constructor(project: SahneProject, opts: { seed?: number } = {}) {
    this.project = project
    this.rand = mulberry32(opts.seed ?? 1)
    const st = project.stage
    this.stage = {
      uid: ++this.uid, defId: 'stage', name: 'Sahne', isStage: true, isClone: false, x: 0, y: 0, dir: 90, size: 100, visible: true, rotationStyle: 'none',
      costumes: st.backdrops, costume: clampIndex(st.backdrop, st.backdrops.length), sounds: st.sounds, procs: st.procs, effects: newEffects(), bubble: null,
      penDown: false, penColor: '#1e88e5', penSize: 2, volume: 100, pitch: 0, deleted: false,
    }
    for (const sd of project.sprites) this.targets.push(this.makeSprite(sd))
    for (const v of project.variables) {
      if (v.type === 'List') this.lists.set(v.id, v.items.map((x) => x))
      else this.vars.set(v.id, v.value)
      this.varVisible.set(v.id, v.visible)
    }
  }

  private makeSprite(sd: SpriteDef): RtTarget {
    return {
      uid: ++this.uid, defId: sd.id, name: sd.name, isStage: false, isClone: false, x: sd.x, y: sd.y, dir: normDir(sd.dir), size: sd.size, visible: sd.visible,
      rotationStyle: sd.rotationStyle, costumes: sd.costumes, costume: clampIndex(sd.costume, sd.costumes.length), sounds: sd.sounds, procs: sd.procs,
      effects: newEffects(), bubble: null, penDown: false, penColor: '#1e88e5', penSize: 2, volume: 100, pitch: 0, deleted: false,
    }
  }

  // ───────── kayıt ─────────
  emit(kind: string, t: RtTarget | null, detail?: string): void {
    this.counts[kind] = (this.counts[kind] ?? 0) + 1
    if (this.events.length < 6000) this.events.push({ t: this.time, kind, target: t?.defId ?? '', detail })
  }
  fail(message: string, blockId: string | null = null): void { if (!this.error) this.error = { message, blockId } }

  // ───────── sorgular ─────────
  /** Klon olmayan sprite (tanım kimliğine göre). */
  original(defId: string): RtTarget | undefined { return this.targets.find((t) => t.defId === defId && !t.isClone) }
  /** Bir tanımın tüm canlı örnekleri (özgün + klonlar). */
  instances(defId: string): RtTarget[] { return defId === 'stage' ? [this.stage] : this.targets.filter((t) => t.defId === defId) }
  spriteByName(name: string): RtTarget | undefined { return this.targets.find((t) => !t.isClone && t.name === name) }
  /** Kimlik ya da ad ile sprite bulur (testlerde kolaylık). */
  find(idOrName: string): RtTarget | undefined { return this.original(idOrName) ?? this.spriteByName(idOrName) }
  get cloneCount(): number { return this.targets.filter((t) => t.isClone).length }
  costumeOf(t: RtTarget): Costume | undefined { return t.costumes[t.costume] }
  quad(t: RtTarget): Quad | null {
    const c = this.costumeOf(t)
    return c ? costumeQuad(c, t) : null
  }
  get backdropName(): string { return this.stage.costumes[this.stage.costume]?.name ?? '' }

  // ───────── hareket ─────────
  setXY(t: RtTarget, x: number, y: number): void {
    if (t.isStage) return
    const ox = t.x, oy = t.y
    t.x = Number.isFinite(x) ? x : 0
    t.y = Number.isFinite(y) ? y : 0
    const q = this.quad(t)
    if (q) { const f = fenceDelta(q); t.x += f.dx; t.y += f.dy }
    t.x = Math.round(t.x * 1e6) / 1e6
    t.y = Math.round(t.y * 1e6) / 1e6
    if (t.penDown && (t.x !== ox || t.y !== oy)) this.pen.push({ k: 'line', x0: ox, y0: oy, x1: t.x, y1: t.y, c: t.penColor, w: t.penSize })
    if (t.x !== ox || t.y !== oy) this.redraw = true
  }
  moveSteps(t: RtTarget, n: number): void {
    const r = rad(90 - t.dir)
    this.setXY(t, t.x + n * Math.cos(r), t.y + n * Math.sin(r))
  }
  setDir(t: RtTarget, d: number): void { if (!t.isStage) { t.dir = normDir(d); this.redraw = true } }
  pointTowards(t: RtTarget, x: number, y: number): void {
    const dx = x - t.x, dy = y - t.y
    if (dx === 0 && dy === 0) return
    this.setDir(t, 90 - (Math.atan2(dy, dx) * 180) / Math.PI)
  }
  /** Scratch'teki gibi kenara değince seker. */
  bounceOnEdge(t: RtTarget): void {
    const q = this.quad(t)
    if (!q) return
    const b = quadBox(q)
    const dL = Math.max(0, STAGE_W / 2 + b.l), dT = Math.max(0, STAGE_H / 2 - b.t), dR = Math.max(0, STAGE_W / 2 - b.r), dB = Math.max(0, STAGE_H / 2 + b.b)
    let edge = '', min = Infinity
    if (dL < min) { min = dL; edge = 'left' }
    if (dT < min) { min = dT; edge = 'top' }
    if (dR < min) { min = dR; edge = 'right' }
    if (dB < min) { min = dB; edge = 'bottom' }
    if (min > 0) return
    const r = rad(90 - t.dir)
    let dx = Math.cos(r), dy = -Math.sin(r)
    if (edge === 'left') dx = Math.max(0.2, Math.abs(dx))
    else if (edge === 'top') dy = Math.max(0.2, Math.abs(dy))
    else if (edge === 'right') dx = Math.min(-0.2, -Math.abs(dx))
    else dy = Math.min(-0.2, -Math.abs(dy))
    this.setDir(t, (Math.atan2(dy, dx) * 180) / Math.PI + 90)
    this.setXY(t, t.x, t.y)
  }

  // ───────── değme ─────────
  touching(t: RtTarget, what: string): boolean {
    if (t.isStage || !t.visible) return false
    const q = this.quad(t)
    if (!q) return false
    if (what === '_mouse_') return pointInQuad(q, this.mouse.x, this.mouse.y)
    if (what === '_edge_') return touchesEdge(q)
    for (const o of this.targets) {
      if (o.defId !== what || o === t || !o.visible || o.deleted) continue
      const oq = this.quad(o)
      if (oq && quadsOverlap(q, oq)) return true
    }
    return false
  }
  /** Sahnede (x, y) noktasındaki en üstteki görünür sprite. */
  spriteAt(x: number, y: number): RtTarget | null {
    for (let i = this.targets.length - 1; i >= 0; i--) {
      const t = this.targets[i]
      if (!t.visible || t.deleted) continue
      const q = this.quad(t)
      if (q && pointInQuad(q, x, y)) return t
    }
    return null
  }
  distanceTo(t: RtTarget, what: string): number {
    let px = 0, py = 0
    if (what === '_mouse_') { px = this.mouse.x; py = this.mouse.y } else {
      const o = this.original(what)
      if (!o) return 10000
      px = o.x; py = o.y
    }
    return Math.hypot(px - t.x, py - t.y)
  }

  // ───────── görünüm ─────────
  say(t: RtTarget, text: string, think = false): void {
    this.closeSay(t)
    if (text === '') { t.bubble = null; this.redraw = true; return }
    t.bubble = { text, think, seq: ++this.bubbleSeq }
    this.sayLog.push({ defId: t.defId, uid: t.uid, text, think, start: this.time, end: null })
    this.emit('say', t, text)
    this.redraw = true
  }
  closeSay(t: RtTarget): void {
    for (let i = this.sayLog.length - 1; i >= 0; i--) {
      const r = this.sayLog[i]
      if (r.uid === t.uid && r.end === null) { r.end = this.time; break }
    }
  }
  /** `say … saniye` bitince: konuşma hâlâ bizimse kapat. */
  endSay(t: RtTarget, seq: number): void {
    if (t.bubble && t.bubble.seq === seq) { t.bubble = null; this.closeSay(t); this.redraw = true }
  }
  setCostume(t: RtTarget, idx: number): void {
    if (!t.costumes.length) return
    const i = clampIndex(Math.round(idx), t.costumes.length)
    const before = t.costume
    t.costume = i
    if (t.isStage) { this.emit('backdrop', t, t.costumes[i].name); this.hooks.backdrop?.(t.costumes[i].name) } else if (before !== i) this.emit('costume', t, t.costumes[i].name)
    this.redraw = true
  }
  nextCostume(t: RtTarget): void { this.setCostume(t, t.costume + 1) }
  setCostumeByName(t: RtTarget, name: string): boolean {
    let i = t.costumes.findIndex((c) => c.name === name)
    if (i < 0 && isNumeric(name)) i = Math.round(toNum(name)) - 1
    if (i < 0) return false
    this.setCostume(t, i)
    return true
  }
  setSize(t: RtTarget, pct: number): void {
    if (t.isStage) return
    t.size = clamp(pct, 5, 800)
    this.emit('size', t, String(Math.round(t.size)))
    this.redraw = true
  }
  setEffect(t: RtTarget, name: string, v: number): void {
    const e = t.effects
    if (name === 'color') e.color = ((v % 200) + 200) % 200
    else if (name === 'ghost') e.ghost = clamp(v, 0, 100)
    else if (name === 'brightness') e.brightness = clamp(v, -100, 100)
    this.emit('effect', t, name)
    this.redraw = true
  }
  getEffect(t: RtTarget, name: string): number { return name === 'color' ? t.effects.color : name === 'ghost' ? t.effects.ghost : t.effects.brightness }
  setVisible(t: RtTarget, v: boolean): void { if (!t.isStage) { t.visible = v; this.emit(v ? 'show' : 'hide', t); this.redraw = true } }
  goLayer(t: RtTarget, where: 'front' | 'back'): void {
    const i = this.targets.indexOf(t)
    if (i < 0) return
    this.targets.splice(i, 1)
    if (where === 'front') this.targets.push(t); else this.targets.unshift(t)
    this.redraw = true
  }
  goLayerBy(t: RtTarget, n: number, dir: 'forward' | 'backward'): void {
    const i = this.targets.indexOf(t)
    if (i < 0) return
    const j = clamp(i + (dir === 'forward' ? n : -n), 0, this.targets.length - 1)
    this.targets.splice(i, 1)
    this.targets.splice(j, 0, t)
    this.redraw = true
  }

  // ───────── ses ─────────
  playSound(t: RtTarget, name: string): number {
    let ref = t.sounds.find((s) => s.name === name)
    if (!ref && isNumeric(name)) ref = t.sounds[Math.round(toNum(name)) - 1]
    if (!ref) return 0
    const pitch = 2 ** (t.pitch / 120)
    const steps = soundSteps(ref, pitch)
    const ms = soundDuration(ref, pitch)
    this.emit('sound', t, ref.name)
    this.onSound?.({ target: t, ref, volume: t.volume / 100, steps, durationMs: ms })
    return ms
  }
  playNote(t: RtTarget, midi: number, beats: number): number {
    const steps = noteSteps(midi, beats)
    const ms = Math.max(60, Math.min(4000, beats * 1000))
    this.emit('sound', t, `nota:${midi}`)
    this.onSound?.({ target: t, ref: { name: `nota ${midi}`, gid: '' }, volume: t.volume / 100, steps, durationMs: ms })
    return ms
  }
  stopSounds(): void { this.onStopSounds?.() }

  // ───────── kalem ─────────
  penStamp(t: RtTarget): void {
    const c = this.costumeOf(t)
    if (!c || t.isStage) return
    this.pen.push({ k: 'stamp', costume: c, x: t.x, y: t.y, dir: t.dir, size: t.size, rotationStyle: t.rotationStyle, effects: { ...t.effects } })
    this.emit('pen', t, 'stamp')
    this.redraw = true
  }
  setPenDown(t: RtTarget, down: boolean): void {
    t.penDown = down
    if (down) { this.pen.push({ k: 'dot', x: t.x, y: t.y, c: t.penColor, w: t.penSize }); this.emit('pen', t, 'down'); this.redraw = true }
  }
  penClear(): void { this.pen.push({ k: 'clear' }); this.emit('pen', null, 'clear'); this.redraw = true }

  // ───────── klon ─────────
  createClone(src: RtTarget): RtTarget | null {
    if (src.isStage || src.deleted) return null
    if (this.cloneCount >= MAX_CLONES) return null
    const c: RtTarget = { ...src, uid: ++this.uid, isClone: true, effects: { ...src.effects }, bubble: null, deleted: false }
    const i = this.targets.indexOf(src)
    this.targets.splice(i < 0 ? this.targets.length : i, 0, c)
    this.emit('clone', c)
    this.hooks.cloneCreated?.(c)
    this.redraw = true
    return c
  }
  deleteClone(t: RtTarget): void {
    if (!t.isClone || t.deleted) return
    t.deleted = true
    this.closeSay(t)
    const i = this.targets.indexOf(t)
    if (i >= 0) this.targets.splice(i, 1)
    this.emit('cloneDelete', t)
    this.hooks.cloneDeleted?.(t)
    this.redraw = true
  }
  deleteAllClones(): void { for (const t of [...this.targets]) if (t.isClone) this.deleteClone(t) }

  // ───────── değişkenler ve listeler ─────────
  getVar(id: string): Value { return this.vars.get(id) ?? 0 }
  setVar(id: string, v: Value): void { this.vars.set(id, v) }
  list(id: string): Value[] {
    let l = this.lists.get(id)
    if (!l) { l = []; this.lists.set(id, l) }
    return l
  }
  listAdd(id: string, v: Value): void { const l = this.list(id); if (l.length < MAX_LIST_ITEMS) l.push(v) }
  varName(id: string): string { return this.project.variables.find((v) => v.id === id)?.name ?? id }
  /** Ada göre değişken/liste kimliği (testler için). */
  idOf(name: string): string | undefined { return this.project.variables.find((v) => v.name === name)?.id }
  varByName(name: string): Value | undefined { const id = this.idOf(name); return id === undefined ? undefined : this.vars.get(id) }
  listByName(name: string): Value[] | undefined { const id = this.idOf(name); return id === undefined ? undefined : this.lists.get(id) }

  // ───────── zaman / soru ─────────
  advance(): void { this.frame++; this.time = this.frame * FRAME_MS }
  get timer(): number { return (this.time - this.timerStart) / 1000 }
  resetTimer(): void { this.timerStart = this.time }
  submitAnswer(text: string): void {
    if (!this.asking) return
    this.answer = text
    this.asking = null
  }
}

export function clampIndex(i: number, n: number): number {
  if (n <= 0) return 0
  const x = Number.isFinite(i) ? Math.round(i) : 0
  return ((x % n) + n) % n
}
