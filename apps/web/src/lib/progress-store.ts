'use client'
import { useMemo, useSyncExternalStore } from 'react'

// Giriş kapalıyken ilerleme tarayıcıda tutulur. Anahtar sürümlü; biçim değişirse v2 kullan.
const KEY = 'ask:progress:v1'
const EVENT = 'ask-progress'

const raw = () => {
  try { return localStorage.getItem(KEY) ?? '[]' } catch { return '[]' }
}
const subscribe = (cb: () => void) => {
  window.addEventListener(EVENT, cb)
  window.addEventListener('storage', cb)
  return () => { window.removeEventListener(EVENT, cb); window.removeEventListener('storage', cb) }
}

export function parseIds(s: string): Set<number> {
  try {
    const v = JSON.parse(s)
    return new Set(Array.isArray(v) ? v.filter((x): x is number => Number.isInteger(x)) : [])
  } catch { return new Set() }
}

/** Tamamlanan ders kimlikleri. Sunucuda ve ilk çizimde boş küme (hidrasyon uyumu için). */
export function useDoneIds(): Set<number> {
  const s = useSyncExternalStore(subscribe, raw, () => '[]')
  return useMemo(() => parseIds(s), [s])
}

export function markDone(id: number) {
  try {
    const ids = parseIds(raw())
    ids.add(id)
    localStorage.setItem(KEY, JSON.stringify([...ids]))
  } catch { /* gizli pencere vb.: ilerleme kaydedilemez, sayfa yine çalışır */ }
  window.dispatchEvent(new Event(EVENT))
}

export function unmarkDone(id: number) {
  try {
    const ids = parseIds(raw())
    ids.delete(id)
    localStorage.setItem(KEY, JSON.stringify([...ids]))
  } catch { /* yoksay */ }
  window.dispatchEvent(new Event(EVENT))
}
