import type { Metadata } from 'next'
import { GameCredit } from '@/components/games/credit'
import { GameList } from '@/components/games/game-list'
import { GAME_META } from '@/lib/games/meta'
import { isGameAvailable } from '@/lib/games/registry'

export const metadata: Metadata = { title: 'Oyunlar' }
export const dynamic = 'force-dynamic'

export default async function Oyunlar() {
  const entries = await Promise.all(GAME_META.map(async (g) => [g.slug, await isGameAvailable(g.slug)] as const))
  return (
    <div className="page">
      <header className="page-title">
        <h1>Oyunlar</h1>
        <p className="muted">Bloklarla programlamayı oyun oynayarak öğren. Her oyunda 10 seviye var; hepsi açık, istediğinden başlayabilirsin. İlerlemen bu tarayıcıda saklanır.</p>
      </header>
      <GameList available={Object.fromEntries(entries)} />
      <GameCredit />
    </div>
  )
}
