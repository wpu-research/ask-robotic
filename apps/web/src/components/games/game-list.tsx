'use client'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { Icon } from '@/components/shell/icons'
import { useLocale, useT } from '@/i18n/client'
import { GAME_META, LEVEL_COUNT } from '@/lib/games/meta'
import { doneCount, nextOpenLevel } from '@/lib/games/progress'
import { useGameProgress } from './use-progress'
import './games.css'

// Her oyun için özgün, basit SVG simgesi (başka bir üründen alınmadı).
const GLYPH: Record<string, ReactNode> = {
  bulmaca: <><rect x="6" y="14" width="22" height="22" rx="4" /><rect x="24" y="14" width="22" height="22" rx="4" /><circle cx="26" cy="25" r="4" /><rect x="15" y="30" width="22" height="18" rx="4" /></>,
  labirent: <><path d="M8 8h32v32H8zM8 18h14M30 8v14M16 26h24M16 26v14M30 32v8" /><circle cx="14" cy="13" r="2.5" /></>,
  kus: <><path d="M10 30c6-12 18-14 28-6-8 0-10 4-16 10-4 4-8 2-12-4z" /><circle cx="32" cy="24" r="1.5" /><path d="M38 24l6-2-4 6" /></>,
  kaplumbaga: <><path d="M8 32c0-10 8-16 16-16s16 6 16 16z" /><path d="M16 32l4-10M24 32V19M32 32l-4-10M40 28l5-2M10 32l-4 3" /></>,
  film: <><rect x="6" y="10" width="36" height="28" rx="4" /><path d="M6 18h36M6 30h36M14 10v28M34 10v28" /></>,
  muzik: <><path d="M18 34V12l18-4v22" /><circle cx="13" cy="35" r="5" /><circle cx="31" cy="31" r="5" /></>,
  'golet-egitmeni': <><path d="M8 34c8 6 24 6 32 0" /><circle cx="22" cy="22" r="8" /><path d="M29 20l8 2-8 3M19 21h.01" /><path d="M10 14l6 4M10 18l5-1" /></>,
  golet: <><path d="M6 36c8 6 28 6 36 0" /><circle cx="17" cy="23" r="6" /><path d="M23 22l6 1-6 3M33 18a5 5 0 1 1 0 .01M15 22h.01" /><path d="M38 28l4 2" /></>,
}

export function GameList({ available }: { available: Record<string, boolean> }) {
  const progress = useGameProgress()
  const t = useT()
  const en = useLocale() === 'en'
  return (
    <ul className="gm-cards">
      {GAME_META.map((g) => {
        const ok = available[g.slug]
        const n = doneCount(progress, g.slug)
        const body = (
          <>
            <span className="gm-card-art" aria-hidden="true">
              <svg viewBox="0 0 48 48" width="56" height="56" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">{GLYPH[g.slug]}</svg>
            </span>
            <span className="gm-card-text">
              <b className="gm-card-title">{en ? g.titleEn : g.title}{!ok && <span className="badge-soon">{t('studios.games.list.soon')}</span>}</b>
              <span className="gm-card-tag">{en ? g.taglineEn : g.tagline}</span>
            </span>
            <span className="gm-card-foot">
              <span className="gm-card-prog" aria-label={t('studios.games.list.progress', { n, total: LEVEL_COUNT })}>
                <span className="gm-bar"><span style={{ width: `${(n / LEVEL_COUNT) * 100}%` }} /></span>
                <span className="gm-card-count">{n}/{LEVEL_COUNT}</span>
              </span>
              {ok && <span className="gm-card-go">{n === 0 ? t('studios.games.list.start') : n >= LEVEL_COUNT ? t('studios.games.list.replay') : t('studios.games.list.continue')} <Icon name="arrowRight" size={16} /></span>}
            </span>
          </>
        )
        return (
          <li key={g.slug}>
            {ok ? (
              <Link className="gm-card" href={`/oyunlar/${g.slug}?seviye=${nextOpenLevel(progress, g.slug)}`}>{body}</Link>
            ) : (
              <div className="gm-card" aria-disabled="true">{body}</div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
