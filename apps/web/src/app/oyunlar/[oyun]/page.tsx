import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { GamePlayer } from '@/components/games/game-player'
import { GAME_SLUGS, isGameSlug, LEVEL_COUNT, metaOf } from '@/lib/games/meta'

export function generateStaticParams() {
  return GAME_SLUGS.map((oyun) => ({ oyun }))
}

export async function generateMetadata({ params }: { params: Promise<{ oyun: string }> }): Promise<Metadata> {
  const { oyun } = await params
  return { title: metaOf(oyun)?.title ?? 'Oyun' }
}

export default async function OyunSayfasi({ params, searchParams }: { params: Promise<{ oyun: string }>; searchParams: Promise<{ seviye?: string | string[] }> }) {
  const { oyun } = await params
  if (!isGameSlug(oyun)) notFound()
  const sp = await searchParams
  const raw = Array.isArray(sp.seviye) ? sp.seviye[0] : sp.seviye
  const n = Number.parseInt(raw ?? '1', 10)
  const initialLevel = Number.isFinite(n) ? Math.min(Math.max(n, 1), LEVEL_COUNT) : 1
  return (
    <div className="page page-tool gm-page">
      <GamePlayer slug={oyun} title={metaOf(oyun)!.title} initialLevel={initialLevel} />
    </div>
  )
}
