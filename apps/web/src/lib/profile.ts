'use client'
import { useMemo, useSyncExternalStore } from 'react'
import type { Interest, Level } from './learning-paths'

// Onboarding cevapları (/basla). Giriş kapalıyken tarayıcıda; hesap açılınca kayıt formuna taşınır. Kişisel veri: yalnız yaş.
const KEY = 'ask:profile:v1'
const EVENT = 'ask-profile'

export type Who = 'kendim' | 'cocugum' | 'okulum'
export type DayTime = 'sabah' | 'ogle' | 'aksam' | 'farketmez'

export interface Profile {
  who: Who
  age: number
  interests: Interest[]
  level: Level
  goalMin: number
  time: DayTime
  /** Önerilen başlangıç kursu (modül slug'ı). */
  course: string
  createdAt: number
}

const raw = () => { try { return localStorage.getItem(KEY) } catch { return null } }
const subscribe = (cb: () => void) => {
  window.addEventListener(EVENT, cb)
  window.addEventListener('storage', cb)
  return () => { window.removeEventListener(EVENT, cb); window.removeEventListener('storage', cb) }
}

export function parseProfile(s: string | null): Profile | null {
  try {
    const v = JSON.parse(s ?? '')
    return v && Number.isInteger(v.age) && typeof v.course === 'string' ? v as Profile : null
  } catch { return null }
}

/** undefined: henüz okunmadı (sunucu/ilk çizim); null: profil yok. */
export function useProfile(): Profile | null | undefined {
  const s = useSyncExternalStore(subscribe, () => raw() ?? '', () => undefined)
  return useMemo(() => (s === undefined ? undefined : parseProfile(s)), [s])
}

export function saveProfile(p: Profile) {
  try { localStorage.setItem(KEY, JSON.stringify(p)) } catch { /* yoksay */ }
  window.dispatchEvent(new Event(EVENT))
}
