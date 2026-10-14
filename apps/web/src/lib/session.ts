'use client'
// İstemci oturum durumu: /api/me'den tek istekle okunur, tüm bileşenler paylaşır. Eşitleme: components/auth/session-sync.tsx
import { useEffect, useSyncExternalStore } from 'react'
import type { MeResponse, MeUser } from './me'

export type SessionStatus = 'loading' | 'guest' | 'user'
export interface SessionState { status: SessionStatus; user: MeUser | null }

/** Öğrenme durumunun tarayıcı anahtarları (biçim: gamification.ts, progress-store.ts, profile.ts). */
export const LOCAL = {
  game: { key: 'ask:game:v1', event: 'ask-game' },
  progress: { key: 'ask:progress:v1', event: 'ask-progress' },
  profile: { key: 'ask:profile:v1', event: 'ask-profile' },
} as const
/** Yereldeki durumun hangi hesaba ait olduğu (paylaşılan okul bilgisayarında başkasının ilerlemesi karışmasın). */
export const OWNER_KEY = 'ask:owner:v1'

const LOADING: SessionState = { status: 'loading', user: null }
let state: SessionState = LOADING
let inflight: Promise<MeResponse | null> | null = null
const listeners = new Set<() => void>()

function set(next: SessionState) {
  state = next
  for (const l of listeners) l()
}

/** /api/me (tek istek, paylaşılır). `force` yeniden okur. Hata: misafir sayılır, null döner. */
export function loadMe(force = false): Promise<MeResponse | null> {
  if (inflight && !force) return inflight
  inflight = fetch('/api/me', { cache: 'no-store', credentials: 'same-origin' })
    .then((r) => (r.ok ? (r.json() as Promise<MeResponse>) : null))
    .catch(() => null)
    .then((me) => {
      set(me?.user ? { status: 'user', user: me.user } : { status: 'guest', user: null })
      return me
    })
  return inflight
}

const subscribe = (cb: () => void) => { listeners.add(cb); return () => { listeners.delete(cb) } }

/** Oturum: ilk çizimde ve sunucuda 'loading'. */
export function useSession(): SessionState {
  const s = useSyncExternalStore(subscribe, () => state, () => LOADING)
  useEffect(() => { void loadMe() }, [])
  return s
}

/** Çıkış: oturumu kapatır, bu tarayıcıdaki öğrenme durumunu siler (sunucuda saklı) ve ana sayfaya döner. */
export async function signOut(to = '/') {
  await fetch('/api/auth/logout', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' }).catch(() => null)
  try {
    for (const k of [LOCAL.game.key, LOCAL.progress.key, LOCAL.profile.key, OWNER_KEY]) localStorage.removeItem(k)
  } catch { /* yoksay */ }
  set({ status: 'guest', user: null })
  window.location.href = to
}
