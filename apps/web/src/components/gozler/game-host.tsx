'use client'
import { BalloonPop, FaceMirror, RockPaperScissors } from './games'
import { CopyRobot, FingerMath, HeadPong, MagicBrush, MouthCatch, NoseCatcher, TrueFalse } from './games-more'
import type { Game } from '@/lib/robotun-gozleri'

export const GAME_COMPONENTS: Record<Game['slug'], (p: { lang: 'tr' | 'en' }) => React.ReactNode> = {
  'yuz-aynasi': FaceMirror, 'tas-kagit-makas': RockPaperScissors, 'balon-patlat': BalloonPop,
  'burun-avcisi': NoseCatcher, 'agzinla-yakala': MouthCatch, 'kafa-pinpon': HeadPong,
  'parmak-hesabi': FingerMath, 'sihirli-firca': MagicBrush, 'dogru-mu-yanlis-mi': TrueFalse, 'robotu-taklit-et': CopyRobot,
}

export function GameHost({ slug, lang }: { slug: Game['slug']; lang: 'tr' | 'en' }) {
  const G = GAME_COMPONENTS[slug]
  return <G lang={lang} />
}
