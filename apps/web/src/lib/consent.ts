// Onay (PİLOT, taslak): kayıt yalnız kullanıcı açıkça izin verirse yapılır.
// 'local': olaylar yalnız bu tarayıcıda; 'sync': ayrıca anonim olarak sunucuya gönderilir; 'denied': hiçbir şey kaydedilmez.
import { useMemo, useSyncExternalStore } from 'react'

export type ConsentMode = 'local' | 'sync' | 'denied'
export interface Consent { v: 1; mode: ConsentMode; t: number; /** "16 yaşından büyüğüm ya da ebeveyn/vasi onayım var" işareti. */ ack: boolean }

export const CONSENT_KEY = 'ask:consent:v1'
const EVENT = 'ask-consent'

export function parseConsent(s: string | null): Consent | null {
  if (!s) return null
  try {
    const v = JSON.parse(s)
    if (v && v.v === 1 && (v.mode === 'local' || v.mode === 'sync' || v.mode === 'denied') && typeof v.t === 'number') return { v: 1, mode: v.mode, t: v.t, ack: v.ack === true }
  } catch { /* bozuk kayıt: onay yok sayılır */ }
  return null
}

/** Yerel kayıt için onay gerekir ve 16 yaş/veli işareti şarttır. */
export const canRecord = (c: Consent | null): boolean => !!c && c.ack && (c.mode === 'local' || c.mode === 'sync')
export const canSync = (c: Consent | null): boolean => !!c && c.ack && c.mode === 'sync'

const raw = () => { try { return localStorage.getItem(CONSENT_KEY) } catch { return null } }
export const getConsent = (): Consent | null => (typeof window === 'undefined' ? null : parseConsent(raw()))

export function setConsent(mode: ConsentMode, ack: boolean): void {
  try { localStorage.setItem(CONSENT_KEY, JSON.stringify({ v: 1, mode, t: Date.now(), ack: mode === 'denied' ? false : ack } satisfies Consent)) } catch { /* yoksay */ }
  window.dispatchEvent(new Event(EVENT))
}

const subscribe = (cb: () => void) => {
  window.addEventListener(EVENT, cb)
  window.addEventListener('storage', cb)
  return () => { window.removeEventListener(EVENT, cb); window.removeEventListener('storage', cb) }
}

/** `undefined`: henüz okunmadı (sunucu/ilk çizim); `null`: karar verilmemiş. */
export function useConsent(): Consent | null | undefined {
  const s = useSyncExternalStore(subscribe, () => raw() ?? '', () => '__ssr__')
  return useMemo(() => (s === '__ssr__' ? undefined : parseConsent(s || null)), [s])
}
