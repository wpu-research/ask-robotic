'use client'
import { useMemo, useSyncExternalStore } from 'react'
import { dayKey, emptyGame, parseGame, reconcile, recordLesson, recordStep, type GameState } from './gamification-core'

// XP/seri tarayıcıda tutulur; oturum açıksa session-sync sunucuyla birleştirir (users.game) ve kazanımları xp_events'e yazar. Kurallar: gamification-core.ts
const KEY = 'ask:game:v1'
const EVENT = 'ask-game'

const raw = () => { try { return localStorage.getItem(KEY) } catch { return null } }
const subscribe = (cb: () => void) => {
  window.addEventListener(EVENT, cb)
  window.addEventListener('storage', cb)
  return () => { window.removeEventListener(EVENT, cb); window.removeEventListener('storage', cb) }
}

/** Kazanılan XP (0: kazanılmadı, ör. aynı ders aynı gün). */
function update(f: (s: GameState, today: string) => GameState): number {
  const today = dayKey(new Date())
  let gained = 0
  try {
    const prev = reconcile(parseGame(raw()), today)
    const next = f(prev, today)
    gained = next.xp - prev.xp
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch { /* gizli pencere: kaydedilemez */ }
  window.dispatchEvent(new Event(EVENT))
  return gained
}

/** Oturum açıkken sunucu XP defterine (xp_events) yazılsın diye: components/auth/session-sync.tsx dinler. */
export const XP_EVENT = 'ask-xp'
export interface XpGain { source: 'step' | 'lesson'; amount: number; lessonId?: number }
const announce = (g: XpGain) => { if (g.amount > 0) window.dispatchEvent(new CustomEvent<XpGain>(XP_EVENT, { detail: g })) }

/** Oyun durumu; sunucuda ve ilk çizimde boş (hidrasyon uyumu). Açılışta geçmiş boşlukları şarjla kapatır. */
export function useGame(): { state: GameState; today: string } {
  // Sunucu/ilk çizim: null; tarayıcıda kayıt yoksa '' (boş oyun, ama bugün bilinir).
  const s = useSyncExternalStore(subscribe, () => raw() ?? '', () => null)
  return useMemo(() => {
    if (s === null) return { state: emptyGame(), today: '' }
    const today = dayKey(new Date())
    return { state: reconcile(parseGame(s), today), today }
  }, [s])
}

export const gainStep = (firstTry: boolean) => announce({ source: 'step', amount: update((s, today) => recordStep(s, today, firstTry)) })
export const gainLesson = (lessonId: number) => announce({ source: 'lesson', amount: update((s, today) => recordLesson(s, today, lessonId)), lessonId })
