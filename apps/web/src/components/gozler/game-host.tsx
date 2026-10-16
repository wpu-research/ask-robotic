'use client'
import { GAME_COMPONENTS } from './games'

export function GameHost({ slug, lang }: { slug: keyof typeof GAME_COMPONENTS; lang: 'tr' | 'en' }) {
  const G = GAME_COMPONENTS[slug]
  return <G lang={lang} />
}
