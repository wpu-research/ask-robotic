'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useT } from '@/i18n/client'
import { loadGame } from '@/lib/games/registry'
import type { GameDef } from '@/lib/games/types'
import { GameShell } from './game-shell'

type State = { kind: 'loading' } | { kind: 'soon' } | { kind: 'error'; message: string } | { kind: 'ready'; game: GameDef }

/** Oyunu tembel yükler (kod bölünür); yoksa "Yakında", hatalıysa hata gösterir. */
export function GamePlayer({ slug, title, initialLevel }: { slug: string; title: string; initialLevel: number }) {
  const t = useT()
  const [s, setS] = useState<State>({ kind: 'loading' })
  useEffect(() => {
    let alive = true
    loadGame(slug)
      .then((g) => { if (alive) setS(g ? { kind: 'ready', game: g } : { kind: 'soon' }) })
      .catch((e: unknown) => { if (alive) setS({ kind: 'error', message: e instanceof Error ? e.message : String(e) }) })
    return () => { alive = false }
  }, [slug])

  if (s.kind === 'ready') return <GameShell game={s.game} initialLevel={initialLevel} />
  return (
    <div className="gm-empty">
      <h1>{title}</h1>
      {s.kind === 'loading' && <p className="muted">{t('studios.games.player.loading')}</p>}
      {s.kind === 'soon' && <p className="muted">{t('studios.games.player.soon')}</p>}
      {s.kind === 'error' && <p role="alert">{t('studios.games.player.error', { msg: s.message })}</p>}
      <Link href="/oyunlar" className="btn btn-ghost">{t('studios.games.shell.allGames')}</Link>
    </div>
  )
}
