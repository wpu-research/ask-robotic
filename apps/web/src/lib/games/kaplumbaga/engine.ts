// Kaplumbağa oyun motoru: saf durum + işleyiciler (DOM yok). Sahne `ops` listesini animasyonla oynatır.
import { HaltProgram, type BlockCtx, type RunApi } from '../interpreter'
import type { GameRun, LevelDef } from '../types'
import { DEFAULT_COLOUR, DEFAULT_WIDTH, MATCH_THRESHOLD, hueToHex, similarity, type Stroke } from './geometry'

export interface TurtleStart { x: number; y: number; heading: number }
export interface TurtleLevelData {
  start: TurtleStart
  /** Hedef çizim (şablon). */
  target: Stroke[]
  /** Renkler de eşleşmeli mi? */
  colours?: boolean
  /** Kalınlık da denetlensin mi (mürekkep oranı)? */
  width?: boolean
}

export type TurtleOp =
  | { k: 'move'; x1: number; y1: number; x2: number; y2: number; pen: boolean; colour: string; width: number; ms: number }
  | { k: 'turn'; from: number; to: number; ms: number }
  | { k: 'style'; pen: boolean; colour: string; width: number; ms: number }

export interface TurtleState {
  start: TurtleStart
  x: number
  y: number
  /** Derece, açılmış (mod alınmaz): 0 yukarı, saat yönünde artar. */
  heading: number
  pen: boolean
  colour: string
  width: number
  ops: TurtleOp[]
}

export const MAX_OPS = 4000
const MAX_MOVE = 1500

export const moveMs = (d: number) => Math.min(600, Math.max(50, Math.abs(d) * 1.6))
export const turnMs = (a: number) => Math.min(400, Math.max(40, Math.abs(a) * 1.2))
export const STYLE_MS = 30

export const strokesOf = (ops: readonly TurtleOp[]): Stroke[] =>
  ops.flatMap((o) => (o.k === 'move' && o.pen ? [{ x1: o.x1, y1: o.y1, x2: o.x2, y2: o.y2, colour: o.colour, width: o.width }] : []))

export function createTurtleRun(level: LevelDef): GameRun<TurtleState> {
  const data = level.data as TurtleLevelData
  const st: TurtleState = { start: data.start, x: data.start.x, y: data.start.y, heading: data.start.heading, pen: true, colour: DEFAULT_COLOUR, width: DEFAULT_WIDTH, ops: [] }
  let pending = 0

  const push = (op: TurtleOp) => {
    if (st.ops.length >= MAX_OPS) throw new HaltProgram('Çok fazla hareket yaptın! Kaplumbağa yoruldu.')
    st.ops.push(op)
    pending += op.ms
  }
  const move = (dist: number) => {
    const d = Math.max(-MAX_MOVE, Math.min(MAX_MOVE, dist))
    if (!d) return
    const r = (st.heading * Math.PI) / 180
    const x2 = st.x + d * Math.sin(r), y2 = st.y - d * Math.cos(r)
    push({ k: 'move', x1: st.x, y1: st.y, x2, y2, pen: st.pen, colour: st.colour, width: st.width, ms: moveMs(d) })
    st.x = x2; st.y = y2
  }
  const turn = (a: number) => {
    if (!a) return
    push({ k: 'turn', from: st.heading, to: st.heading + a, ms: turnMs(a) })
    st.heading += a
  }
  const style = () => push({ k: 'style', pen: st.pen, colour: st.colour, width: st.width, ms: STYLE_MS })
  const colourOf = (c: BlockCtx): string => {
    const v = c.value('COLOUR')
    return typeof v === 'string' && v ? v : DEFAULT_COLOUR
  }

  const blocks: RunApi['blocks'] = {
    kaplumbaga_ileri: (c) => move(c.num('DIST')),
    kaplumbaga_geri: (c) => move(-c.num('DIST')),
    kaplumbaga_saga: (c) => turn(c.num('ANGLE')),
    kaplumbaga_sola: (c) => turn(-c.num('ANGLE')),
    kaplumbaga_kalem_kaldir: () => { st.pen = false; style() },
    kaplumbaga_kalem_indir: () => { st.pen = true; style() },
    kaplumbaga_kalinlik: (c) => { st.width = Math.min(40, Math.max(1, c.num('WIDTH', DEFAULT_WIDTH))); style() },
    kaplumbaga_renk: (c) => { st.colour = colourOf(c); style() },
    kaplumbaga_renk_sec: (c) => String(c.field('COLOUR') ?? DEFAULT_COLOUR),
    kaplumbaga_renk_ton: (c) => hueToHex(c.num('HUE')),
  }

  return {
    api: { blocks },
    snapshot: () => ({ ...st, start: { ...st.start }, ops: st.ops.slice() }),
    stepDelay: () => { const d = pending; pending = 0; return d },
    evaluate(result) {
      if (result.reason === 'halted') return { ok: false, message: result.message || 'Program durdu.' }
      if (result.reason !== 'finished') return { ok: false, message: result.message || 'Program tamamlanamadı.' }
      const drawn = strokesOf(st.ops)
      if (!drawn.length) return { ok: false, message: 'Henüz hiçbir şey çizmedin. Kalem aşağıdayken ileri git!' }
      const s = similarity(data.target, drawn, !!data.colours)
      const pct = (v: number) => Math.round(v * 100)
      if (s.recall < MATCH_THRESHOLD) return { ok: false, message: `Hedef çizimin %${pct(s.recall)}'ini çizdin. Gri şablonun eksik kalan kısımlarına bak.` }
      if (s.precision < MATCH_THRESHOLD) return { ok: false, message: `Şablonda olmayan çizgiler var (%${pct(s.precision)} örtüştü). Yönleri ve uzunlukları kontrol et.` }
      if (data.width && (s.inkRatio < 0.7 || s.inkRatio > 1.6)) return { ok: false, message: 'Şekil doğru ama çizgilerin kalınlığı şablona benzemiyor.' }
      return { ok: true, message: 'Çizim şablonla örtüştü!' }
    },
  }
}
