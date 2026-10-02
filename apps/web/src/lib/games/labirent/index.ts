// Labirent: yolcuyu bloklarla (dizi, döngü, koşul) labirentin çıkışına ulaştır. 10 seviye.
import type { GameDef } from '../types'
import { labirentBlocks } from './blocks'
import { createMazeRun, type MazeState } from './engine'
import { labirentLevels } from './levels'

export const labirentGame: GameDef<MazeState> = {
  slug: 'labirent',
  title: 'Labirent',
  tagline: 'Küçük yolcuyu bloklarla yönlendirip labirentin çıkışına ulaştır.',
  levels: labirentLevels,
  blocks: labirentBlocks,
  engine: { createRun: (level) => createMazeRun(level) },
  scene: () => import('@/components/games/labirent/scene'),
  stepDelay: 380,
  speed: { min: 0.5, max: 6, default: 1 },
  stageAspect: '1 / 1',
  maxSteps: 20000,
}
