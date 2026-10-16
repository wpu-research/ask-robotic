'use client'
import { useEffect, useSyncExternalStore } from 'react'

// Kendi Mac'i olan tam ekran görünümler (ders oynatıcısı) genel Mac düğmesini gizler: iki Mac üst üste binmesin.
let claims = 0
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())
const subscribe = (cb: () => void) => { listeners.add(cb); return () => { listeners.delete(cb) } }

/** Bileşen ekrandayken genel Mac gizli. */
export function useClaimRobi() {
  useEffect(() => { claims++; emit(); return () => { claims--; emit() } }, [])
}
export const useRobiClaimed = () => useSyncExternalStore(subscribe, () => claims > 0, () => false)
