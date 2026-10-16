import type { Metadata } from 'next'
import { GameCredit } from '@/components/games/credit'
import { GameList } from '@/components/games/game-list'
import { getT } from '@/i18n/server'
import { GAME_META } from '@/lib/games/meta'
import { isGameAvailable } from '@/lib/games/registry'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  return { title: t('studios.games.page.title') }
}
export const dynamic = 'force-dynamic'

export default async function Oyunlar() {
  const t = await getT()
  const entries = await Promise.all(GAME_META.map(async (g) => [g.slug, await isGameAvailable(g.slug)] as const))
  return (
    <div className="page">
      <header className="page-title">
        <p className="eyebrow">{t('shell.groups.kids')}</p>
        <h1>{t('studios.games.page.title')}</h1>
        <p className="muted">{t('studios.games.page.intro')}</p>
      </header>
      <GameList available={Object.fromEntries(entries)} />
      <GameCredit />
    </div>
  )
}
