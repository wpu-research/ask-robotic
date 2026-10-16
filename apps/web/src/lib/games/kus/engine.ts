// Kuş oyunu motoru (saf, DOM yok). Dünya 400x400, orijin sol altta, y yukarı; açı 0° = doğu, saat yönünün tersine artar
// (matematikteki gibi: 90° = kuzey/yukarı). Her "uç" bloğu kuşu 100 birimlik bir kanat çırpışı (en çok) uçurur;
// yolda solucana (alır), yuvaya (solucanla varırsa kazanır), duvara ya da dünyanın kenarına (çarpar) rastlayınca orada biter.
import { HaltProgram, type RunApi, type RunResult } from '../interpreter'
import type { GameRun, LevelDef, RunOutcome } from '../types'

export const WORLD = 400
export const LEG = 100
export const WORM_R = 12
export const NEST_R = 16
export const WALL_PAD = 6

export interface Rect { x: number; y: number; w: number; h: number }
export interface Box { x: [number, number]; y: [number, number] }
export type Pt = [number, number]

export interface BirdLevelData {
  start: Pt
  worm: Pt
  nest: Pt
  walls?: Rect[]
  /** Verilirse solucan/yuva konumu tohuma göre bu kutudan seçilir (tohum 1 çerçevede sabittir). */
  random?: { worm?: Box; nest?: Box; start?: Box }
}

export type BirdStatus = 'flying' | 'won' | 'wall' | 'edge' | 'empty-nest'

export interface BirdState {
  x: number
  y: number
  /** Son uçuş yönü (derece, 0..360). */
  heading: number
  hasWorm: boolean
  worm: Pt
  nest: Pt
  walls: Rect[]
  /** Kuşun izlediği noktalar. */
  trail: Pt[]
  status: BirdStatus
  flaps: number
}

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

const r4 = (v: number) => Math.round(v * 1e4) / 1e4
const norm360 = (a: number) => ((a % 360) + 360) % 360
const dist = (a: Pt, b: Pt) => Math.hypot(a[0] - b[0], a[1] - b[1])
const pick = (rng: () => number, r: [number, number]) => Math.round(r[0] + rng() * (r[1] - r[0]))
function segDist(p: Pt, a: Pt, c: Pt): number {
  const vx = c[0] - a[0], vy = c[1] - a[1]
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vy) / (vx * vx + vy * vy || 1)))
  return Math.hypot(p[0] - (a[0] + vx * t), p[1] - (a[1] + vy * t))
}
const inWall = (x: number, y: number, w: Rect) => x >= w.x - WALL_PAD && x <= w.x + w.w + WALL_PAD && y >= w.y - WALL_PAD && y <= w.y + w.h + WALL_PAD

/** Seviye verisinden başlangıç konumlarını (rastgele ise tohumla) çözer. */
export function resolveLayout(d: BirdLevelData, seed: number): { start: Pt; worm: Pt; nest: Pt } {
  if (!d.random) return { start: d.start, worm: d.worm, nest: d.nest }
  const rng = mulberry32(seed * 7919 + 13)
  for (let i = 0; i < 400; i++) {
    const start: Pt = d.random.start ? [pick(rng, d.random.start.x), pick(rng, d.random.start.y)] : d.start
    const worm: Pt = d.random.worm ? [pick(rng, d.random.worm.x), pick(rng, d.random.worm.y)] : d.worm
    const nest: Pt = d.random.nest ? [pick(rng, d.random.nest.x), pick(rng, d.random.nest.y)] : d.nest
    if (dist(start, worm) >= 140 && dist(worm, nest) >= 140 && dist(start, nest) >= 100 && segDist(nest, start, worm) >= 40) return { start, worm, nest }
  }
  return { start: d.start, worm: d.worm, nest: d.nest }
}

export function initialState(d: BirdLevelData, seed = 1): BirdState {
  const l = resolveLayout(d, seed)
  return { x: l.start[0], y: l.start[1], heading: 0, hasWorm: false, worm: l.worm, nest: l.nest, walls: d.walls ?? [], trail: [[l.start[0], l.start[1]]], status: 'flying', flaps: 0 }
}

/** Kuşu `angle` yönünde bir kanat çırpışı uçurur. Bitişte (kazanma/çarpma) HaltProgram fırlatır. */
export function fly(st: BirdState, angle: number): void {
  const a = (angle * Math.PI) / 180
  const dx = Math.cos(a), dy = Math.sin(a)
  const sx = st.x, sy = st.y
  st.heading = norm360(angle)
  st.flaps++
  const finish = () => { st.trail.push([st.x, st.y]) }
  for (let i = 1; i <= LEG; i++) {
    const x = r4(sx + dx * i), y = r4(sy + dy * i)
    if (x < 0 || x > WORLD || y < 0 || y > WORLD) {
      st.x = Math.min(WORLD, Math.max(0, x)); st.y = Math.min(WORLD, Math.max(0, y))
      st.status = 'edge'; finish()
      throw new HaltProgram('Kuş dünyanın kenarından dışarı uçtu!', 'The bird flew off the edge of the world!')
    }
    if (st.walls.some((w) => inWall(x, y, w))) {
      st.x = x; st.y = y; st.status = 'wall'; finish()
      throw new HaltProgram('Kuş duvara çarptı!', 'The bird hit a wall!')
    }
    const p: Pt = [x, y]
    if (!st.hasWorm && dist(p, st.worm) <= WORM_R) {
      st.x = st.worm[0]; st.y = st.worm[1]; st.hasWorm = true; finish()
      return
    }
    if (dist(p, st.nest) <= NEST_R) {
      st.x = st.nest[0]; st.y = st.nest[1]
      if (st.hasWorm) { st.status = 'won'; finish(); throw new HaltProgram('Kuş solucanı yuvaya götürdü!', 'The bird took the worm to the nest!') }
      st.status = 'empty-nest'; finish()
      throw new HaltProgram('Kuş yuvaya solucansız vardı. Önce solucanı almalı!', 'The bird reached the nest without the worm. It must get the worm first!')
    }
  }
  st.x = r4(sx + dx * LEG); st.y = r4(sy + dy * LEG)
  finish()
}

/** (x, y) hedefine derece cinsinden yön: atan2, 0..360 aralığında, 2 basamağa yuvarlı. */
export const atan2Deg = (dy: number, dx: number): number => Math.round(norm360((Math.atan2(dy, dx) * 180) / Math.PI) * 100) / 100

export function evaluateState(st: BirdState, result: RunResult): RunOutcome {
  if (st.status === 'won') return { ok: true, message: 'Harika! Kuş solucanı yuvaya götürdü.', messageEn: 'Great! The bird took the worm to the nest.' }
  if (st.status === 'wall') return { ok: false, message: 'Kuş duvara çarptı! Başka bir yoldan gitmeyi dene.', messageEn: 'The bird hit a wall! Try going another way.' }
  if (st.status === 'edge') return { ok: false, message: 'Kuş dünyanın kenarından dışarı uçtu! Açıyı kontrol et.', messageEn: 'The bird flew off the edge of the world! Check the angle.' }
  if (st.status === 'empty-nest') return { ok: false, message: 'Yuvaya solucansız vardın. Önce solucanı al!', messageEn: 'You reached the nest without the worm. Get the worm first!' }
  if (result.reason === 'limit') return { ok: false, message: 'Kuş durmadan uçtu ama yuvaya varamadı. Yönleri gözden geçir.', messageEn: 'The bird kept flying but never reached the nest. Check your directions.' }
  return st.hasWorm
    ? { ok: false, message: 'Solucanı aldın, şimdi yuvaya götürmelisin!', messageEn: 'You have the worm, now take it to the nest!' }
    : { ok: false, message: 'Kuş solucana ulaşamadı. Açıları ve uçuş sayısını dene.', messageEn: 'The bird did not reach the worm. Try other angles and number of flights.' }
}

export function createBirdRun(level: LevelDef, seed = 1): GameRun<BirdState> {
  const st = initialState(level.data as BirdLevelData, seed)
  const target = (who: unknown): Pt => (who === 'WORM' ? st.worm : who === 'NEST' ? st.nest : [st.x, st.y])
  const api: RunApi = {
    hats: ['bird_basla'],
    blocks: {
      bird_heading: (c) => fly(st, Number(c.field('ANGLE')) || 0),
      bird_heading_value: (c) => fly(st, c.num('ANGLE')),
      bird_has_worm: () => st.hasWorm,
      bird_coord: (c) => target(c.field('WHO'))[c.field('AXIS') === 'Y' ? 1 : 0],
      bird_angle_to: (c) => { const t = target(c.field('TARGET')); return atan2Deg(t[1] - st.y, t[0] - st.x) },
      bird_atan2: (c) => atan2Deg(c.num('DY'), c.num('DX')),
    },
  }
  return { api, snapshot: () => structuredClone(st), evaluate: (r) => evaluateState(st, r) }
}
