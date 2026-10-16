// Bulmaca: hayvan kartını bloklarla eşleştir. Zafer: blokların kurduğu hayvan karttakiyle birebir aynı.
import { buildToolbox } from '../toolbox'
import type { GameDef } from '../types'
import { bulmacaBlocks } from './blocks'
import { createPuzzleRun, type PuzzleState } from './engine'
import { levels } from './levels'

/** Boş soketli sayı girişleri için araç kutusuna gölge sayı ekler; "eğer-değilse" bloğunu da hazır sunar. */
const SHADOW_NUM: Record<string, number> = { bulmaca_bacak_n: 2, bulmaca_goz_n: 2 }

export const bulmacaGame: GameDef<PuzzleState> = {
  slug: 'bulmaca',
  title: 'Bulmaca',
  tagline: 'Hayvan resimlerini doğru bloklarla eşleştirerek blokların nasıl birleştiğini öğren.',
  en: { title: 'Puzzle', tagline: 'Match animal pictures with the right blocks and learn how blocks fit together.' },
  levels,
  blocks: bulmacaBlocks,
  engine: { createRun: (level) => createPuzzleRun(level) },
  scene: () => import('@/components/games/bulmaca/scene'),
  stepDelay: 420,
  speed: { min: 0.5, max: 4, default: 1.5 },
  stageAspect: '5 / 4',
  maxSteps: 5000,
  toolboxFor: (level) => {
    const tb = buildToolbox({ blocks: bulmacaBlocks }, level) as { contents: { contents?: Record<string, unknown>[] }[] }
    for (const cat of tb.contents) {
      if (!cat.contents) continue
      cat.contents = cat.contents.flatMap((e) => {
        const t = String(e.type)
        if (t in SHADOW_NUM) return [{ ...e, inputs: { N: { shadow: { type: 'math_number', fields: { NUM: SHADOW_NUM[t] } } } } }]
        if (t === 'controls_if') return [e, { ...e, extraState: { hasElse: true } }]
        return [e]
      })
    }
    return tb
  },
}
