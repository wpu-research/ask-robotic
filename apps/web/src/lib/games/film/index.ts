// Film (Movie): zamanla değişen resimler. Kullanıcının "her karede" programı 100 kare çalışır, hedef animasyonla karşılaştırılır.
import { buildToolbox } from '../toolbox'
import type { GameDef } from '../types'
import { filmBlocks } from './blocks'
import { MOVIE_MAX_STEPS, createRun } from './engine'
import { filmLevels } from './levels'
import type { MovieSnap } from './model'

const n = (v: number) => ({ shadow: { type: 'math_number', fields: { NUM: v } } })
/** Araç kutusunda blokların hazır gelen sayı gölgeleri. */
const PRESETS: Record<string, { inputs?: Record<string, unknown>; extraState?: unknown }> = {
  film_daire: { inputs: { X: n(50), Y: n(50), R: n(10) } },
  film_dikdortgen: { inputs: { X: n(30), Y: n(30), W: n(40), H: n(20) } },
  film_cizgi: { inputs: { X1: n(20), Y1: n(20), X2: n(80), Y2: n(80) } },
  film_renk_ton: { inputs: { HUE: n(120) } },
  film_renk_rgb: { inputs: { R: n(255), G: n(128), B: n(0) } },
  film_kalinlik: { inputs: { W: n(4) } },
  film_sin: { inputs: { A: n(0) } },
  film_cos: { inputs: { A: n(0) } },
  controls_if: { extraState: { hasElse: true } },
}

export const filmGame: GameDef<MovieSnap> = {
  slug: 'film',
  title: 'Film',
  tagline: 'Matematikle hareketli resimler çizip kendi kısa filmini yap.',
  levels: filmLevels,
  blocks: filmBlocks,
  engine: { createRun },
  scene: () => import('@/components/games/film/scene'),
  speed: { min: 0.5, max: 4, default: 1 },
  stageAspect: '4 / 3',
  maxSteps: MOVIE_MAX_STEPS,
  toolboxFor: (level) => {
    const tb = buildToolbox(filmGame, level) as { contents: { contents?: Record<string, unknown>[] }[] }
    for (const cat of tb.contents) {
      cat.contents = cat.contents?.map((e) => {
        const p = PRESETS[String(e.type)]
        return p ? { ...e, ...(p.inputs ? { inputs: p.inputs } : {}), ...(p.extraState ? { extraState: p.extraState } : {}) } : e
      })
    }
    return tb
  },
}
