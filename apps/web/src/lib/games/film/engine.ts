// Film oyunu motoru: kullanıcı programının "her karede" bloğu 100 kez çalışır; her kare bir Frame olarak kaydedilir.
// Hedef animasyon, seviyenin çözüm programı aynı motorda çalıştırılarak elde edilir (tek doğruluk kaynağı).
import { HaltProgram, runProgramSync, type RunApi, type RunResult } from '../interpreter'
import type { GameRun, LevelDef, RunOutcome } from '../types'
import {
  BAD_FRAME_LIMIT, BG_DEFAULT, COLORS, FRAME_COUNT, INK_DEFAULT, LINE_WIDTH, MAX_SHAPES, badFrames, clampNum, hslHex, rasterize, rgbHex,
  type Frame, type MovieSnap,
} from './model'

interface Rec {
  frames: Frame[]
  cur: Frame | null
  t: number
  color: string
  width: number
}

const OUTSIDE = 'Çizim bloklarını "her karede" bloğunun içine koy.'

export function makeApi(rec: Rec): RunApi {
  const inFrame = () => { if (!rec.cur) throw new HaltProgram(OUTSIDE); return rec.cur }
  const add = (s: Frame['shapes'][number]) => {
    const f = inFrame()
    if (f.shapes.length >= MAX_SHAPES) throw new HaltProgram('Bir karede çok fazla şekil çizdin!')
    f.shapes.push(s)
  }
  const n = (v: number) => clampNum(v)
  return {
    blocks: {
      film_kare: function* (c) {
        if (rec.cur) throw new HaltProgram('"her karede" bloğu başka bir bloğun içinde olamaz.')
        for (let t = 0; t < FRAME_COUNT; t++) {
          rec.t = t
          rec.color = INK_DEFAULT
          rec.width = LINE_WIDTH
          rec.cur = { bg: BG_DEFAULT, shapes: [] }
          try { yield* c.statements('DO') } catch (e) { rec.cur = null; throw e }
          rec.frames.push(rec.cur)
          rec.cur = null
        }
      },
      film_zaman: () => rec.t,
      film_sin: (c) => Math.sin((c.num('A') * Math.PI) / 180),
      film_cos: (c) => Math.cos((c.num('A') * Math.PI) / 180),
      film_renk: (c) => { inFrame(); rec.color = COLORS[String(c.field('RENK'))] ?? INK_DEFAULT },
      film_renk_ton: (c) => { inFrame(); rec.color = hslHex(c.num('HUE'), 85, 50) },
      film_renk_rgb: (c) => { inFrame(); rec.color = rgbHex(c.num('R'), c.num('G'), c.num('B')) },
      film_zemin: (c) => { inFrame().bg = COLORS[String(c.field('RENK'))] ?? BG_DEFAULT },
      film_kalinlik: (c) => { inFrame(); rec.width = Math.max(1, Math.min(20, c.num('W', 2))) },
      film_daire: (c) => add({ k: 'c', x: n(c.num('X')), y: n(c.num('Y')), r: Math.max(0, n(c.num('R'))), fill: rec.color }),
      film_dikdortgen: (c) => add({ k: 'r', x: n(c.num('X')), y: n(c.num('Y')), w: n(c.num('W')), h: n(c.num('H')), fill: rec.color }),
      film_cizgi: (c) => add({ k: 'l', x1: n(c.num('X1')), y1: n(c.num('Y1')), x2: n(c.num('X2')), y2: n(c.num('Y2')), w: rec.width, stroke: rec.color }),
    },
  }
}

const newRec = (): Rec => ({ frames: [], cur: null, t: 0, color: INK_DEFAULT, width: LINE_WIDTH })

interface Target { frames: Frame[]; rasters: Uint8Array[] }
const targets = new WeakMap<LevelDef, Target>()

/** Seviyenin hedef animasyonu: çözüm programının çıktısı. */
export function targetFor(level: LevelDef, maxSteps: number): Target {
  let t = targets.get(level)
  if (!t) {
    const rec = newRec()
    const res = runProgramSync(level.solution, makeApi(rec), { maxSteps })
    if (res.reason !== 'finished' || rec.frames.length !== FRAME_COUNT) throw new Error(`Film seviye ${level.id}: çözüm hedefi üretemedi (${res.reason} ${res.message ?? ''})`)
    t = { frames: rec.frames, rasters: rec.frames.map(rasterize) }
    targets.set(level, t)
  }
  return t
}

export const MOVIE_MAX_STEPS = 60000

export function createRun(level: LevelDef): GameRun<MovieSnap> {
  const target = targetFor(level, MOVIE_MAX_STEPS)
  const rec = newRec()
  return {
    api: makeApi(rec),
    snapshot: () => ({
      frames: rec.frames.slice(),
      cur: rec.cur ? { bg: rec.cur.bg, shapes: rec.cur.shapes.slice() } : null,
      t: rec.t,
      target: target.frames,
    }),
    // Kareler art arda hesaplanır; oynatma sahnede yapılır, bu yüzden adım başına bekleme yok.
    stepDelay: () => 0,
    evaluate(result: RunResult): RunOutcome {
      if (result.reason === 'halted' && result.message) return { ok: false, message: result.message }
      if (rec.frames.length === 0) return { ok: false, message: OUTSIDE }
      if (rec.frames.length < FRAME_COUNT) return { ok: false, message: 'Film yarıda kaldı. Bütün 100 kare çizilmeli.' }
      const bad = badFrames(rec.frames, target.frames, target.rasters)
      if (bad.length > BAD_FRAME_LIMIT) {
        return { ok: false, message: `Filmin ${bad.length} karesi hedefe benzemiyor (ilk fark: kare ${bad[0]}). Çubuğu o kareye getirip hedefle karşılaştır.` }
      }
      return { ok: true }
    },
  }
}
