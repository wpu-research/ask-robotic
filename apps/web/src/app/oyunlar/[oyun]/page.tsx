import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { GamePlayer } from '@/components/games/game-player'
import { getLocale, getT } from '@/i18n/server'
import { GAME_SLUGS, isGameSlug, LEVEL_COUNT, metaOf } from '@/lib/games/meta'

export function generateStaticParams() {
  return GAME_SLUGS.map((oyun) => ({ oyun }))
}

export async function generateMetadata({ params }: { params: Promise<{ oyun: string }> }): Promise<Metadata> {
  const { oyun } = await params
  const [t, locale] = await Promise.all([getT(), getLocale()])
  const m = metaOf(oyun)
  return { title: (m && (locale === 'en' ? m.titleEn : m.title)) ?? t('studios.games.gameFallback') }
}

export default async function OyunSayfasi({ params, searchParams }: { params: Promise<{ oyun: string }>; searchParams: Promise<{ seviye?: string | string[] }> }) {
  const { oyun } = await params
  if (!isGameSlug(oyun)) notFound()
  const sp = await searchParams
  const raw = Array.isArray(sp.seviye) ? sp.seviye[0] : sp.seviye
  const n = Number.parseInt(raw ?? '1', 10)
  const locale = await getLocale()
  const m = metaOf(oyun)!
  const initialLevel = Number.isFinite(n) ? Math.min(Math.max(n, 1), LEVEL_COUNT) : 1
  return (
    <div className="page page-tool gm-page">
      <GamePlayer slug={oyun} title={locale === 'en' ? m.titleEn : m.title} initialLevel={initialLevel} />
    </div>
  )
}
