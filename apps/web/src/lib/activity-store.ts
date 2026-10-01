'use client'
import { useMemo, useSyncExternalStore } from 'react'
import type { ActivityLike } from './dashboard'

// Etkinlik günlüğü: son açılan ders, hedefleri biten dersler, tamamlanma zamanı. Yalnız bu tarayıcıda.
// Ders tamamlama kümesi `ask:progress:v1`de (progress-store) durur; burası ona dokunmaz.
const KEY = 'ask:activity:v1'
const EVENT = 'ask-activity'
const MAX = 300

export const emptyActivity = (): ActivityLike => ({ opened: {}, goals: {}, finished: {} })

const rec = (v: unknown): Record<string, number> => {
  const out: Record<string, number> = {}
  if (v && typeof v === 'object') for (const [k, t] of Object.entries(v as Record<string, unknown>)) if (typeof t === 'number' && Number.isFinite(t) && /^\d+$/.test(k)) out[k] = t
  return out
}

export function parseActivity(s: string): ActivityLike {
  try {
    const v = JSON.parse(s)
    return { opened: rec(v?.opened), goals: rec(v?.goals), finished: rec(v?.finished) }
  } catch { return emptyActivity() }
}

/** En yeni MAX kaydı tutar (depolama şişmesin). */
export function trim(m: Record<string, number>, max = MAX): Record<string, number> {
  const e = Object.entries(m)
  if (e.length <= max) return m
  return Object.fromEntries(e.sort((a, b) => b[1] - a[1]).slice(0, max))
}

const raw = () => { try { return localStorage.getItem(KEY) ?? '{}' } catch { return '{}' } }
const subscribe = (cb: () => void) => {
  window.addEventListener(EVENT, cb)
  window.addEventListener('storage', cb)
  return () => { window.removeEventListener(EVENT, cb); window.removeEventListener('storage', cb) }
}

export function useActivity(): ActivityLike {
  const s = useSyncExternalStore(subscribe, raw, () => '{}')
  return useMemo(() => parseActivity(s), [s])
}

function write(field: keyof ActivityLike, id: number) {
  try {
    const a = parseActivity(raw())
    a[field] = trim({ ...a[field], [String(id)]: Date.now() })
    localStorage.setItem(KEY, JSON.stringify(a))
  } catch { /* gizli pencere vb.: günlük tutulamaz, sayfa yine çalışır */ }
  window.dispatchEvent(new Event(EVENT))
}

export const recordOpen = (lessonId: number) => write('opened', lessonId)
export const recordGoals = (lessonId: number) => write('goals', lessonId)
export const recordFinished = (lessonId: number) => write('finished', lessonId)
