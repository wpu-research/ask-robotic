'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { loadGame } from '@/lib/games/registry'
import type { GameDef } from '@/lib/games/types'
import { GameShell } from './game-shell'

type State = { kind: 'loading' } | { kind: 'soon' } | { kind: 'error'; message: string } | { kind: 'ready'; game: GameDef }

/** Oyunu tembel yükler (kod bölünür); yoksa "Yakında", hatalıysa hata gösterir. */
export function GamePlayer({ slug, title, initialLevel }: { slug: string; title: string; initialLevel: number }) {
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
      {s.kind === 'loading' && <p className="muted">Oyun yükleniyor…</p>}
      {s.kind === 'soon' && <p className="muted">Bu oyun çok yakında burada olacak.</p>}
      {s.kind === 'error' && <p role="alert">Oyun yüklenemedi: {s.message}</p>}
      <Link href="/oyunlar" className="btn btn-ghost">Tüm oyunlar</Link>
    </div>
  )
}
