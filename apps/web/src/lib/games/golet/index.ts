// Gölet: rakip ördeklere karşı top atışı; blok ya da JavaScript ile programla. Bkz. ../README.md
import { buildToolbox } from '../toolbox'
import type { GameDef } from '../types'
import { goletBlocks } from './blocks'
import { createRun } from './engine'
import { levels } from './levels'
import type { PondFrame } from './sim'

const num = (n: number) => ({ shadow: { type: 'math_number', fields: { NUM: n } } })
const PRESETS: Record<string, { inputs: Record<string, unknown> }> = {
  golet_yuz: { inputs: { DIR: num(90), SPEED: num(50) } },
  golet_ates: { inputs: { DIR: num(0), RANGE: num(50) } },
  golet_tara: { inputs: { DIR: num(0) } },
}

export const goletGame: GameDef<PondFrame> = {
  slug: 'golet',
  title: 'Gölet',
  tagline: 'Ördeğini programla ve rakip ördeklerle yarış.',
  levels,
  blocks: goletBlocks,
  engine: { createRun },
  scene: () => import('@/components/games/golet/scene'),
  stepDelay: 30,
  speed: { min: 0.5, max: 12, default: 3 },
  stageAspect: '1 / 1',
  maxSteps: 700000,
  toolboxFor: (level) => {
    const tb = buildToolbox({ blocks: goletBlocks }, level) as { contents: { contents?: { kind: string; type: string }[] }[] }
    for (const cat of tb.contents) cat.contents = cat.contents?.map((e) => (PRESETS[e.type] ? { ...e, ...PRESETS[e.type] } : e))
    return tb
  },
}
