// Müzik oyunu: nota bloklarıyla melodi kopyala, tekrarla, işlev ve çok kanallı beste yap. WebAudio sahnede çalınır.
import type { GameDef } from '../types'
import { blocks } from './blocks'
import { createRun } from './engine'
import { levels } from './levels'
import type { MusicState } from './notes'

export const muzikGame: GameDef<MusicState> = {
  slug: 'muzik',
  title: 'Müzik',
  tagline: 'Notaları dizip tekrarlayarak kendi melodini besteler.',
  levels,
  blocks,
  engine: { createRun },
  scene: () => import('@/components/games/muzik/scene'),
  speed: { min: 0.5, max: 2, default: 1 },
  stageAspect: '6 / 5',
  maxSteps: 5000,
}
