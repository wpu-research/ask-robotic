'use client'
import { useMemo, useSyncExternalStore } from 'react'
import { GAMES_EVENT, GAMES_KEY, parseAll, type AllProgress } from '@/lib/games/progress'

const raw = () => {
  try { return localStorage.getItem(GAMES_KEY) ?? '{}' } catch { return '{}' }
}
const subscribe = (cb: () => void) => {
  window.addEventListener(GAMES_EVENT, cb)
  window.addEventListener('storage', cb)
  return () => { window.removeEventListener(GAMES_EVENT, cb); window.removeEventListener('storage', cb) }
}

/** Oyun ilerlemesi. Sunucuda ve ilk çizimde boş (hidrasyon uyumu için). */
export function useGameProgress(): AllProgress {
  const s = useSyncExternalStore(subscribe, raw, () => '{}')
  return useMemo(() => parseAll(s), [s])
}
