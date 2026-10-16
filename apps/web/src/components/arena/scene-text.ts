'use client'
// Hazır arena sahnelerinin (lib/arena/scenes.ts, arm-scenes.ts) Türkçe başlık/açıklama/bölge adlarını seçili dile çevirir.
// Eşleşme Türkçe metinle yapılır: ders etkinlikleri sahneyi aynı kimlikle ama kendi metinleriyle kullanabildiği için
// kimliğe göre değil, metne göre çevrilir. Tanınmayan metin (ders içeriği) olduğu gibi döner.
import { useCallback } from 'react'
import type { MessageKey } from '@/i18n'
import { useT } from '@/i18n/client'
import { lab } from '@/i18n/tr/lab'

const KNOWN = new Map<string, MessageKey>(
  Object.entries(lab.arena.known).map(([k, v]) => [v, `lab.arena.known.${k}` as MessageKey]),
)

/** Türkçe sahne metni → seçili dildeki karşılığı (yoksa aynı metin). */
export function sceneText(t: (k: MessageKey) => string, s: string): string {
  const key = KNOWN.get(s)
  return key ? t(key) : s
}

export function useSceneText(): (s: string) => string {
  const t = useT()
  return useCallback((s: string) => sceneText(t, s), [t])
}
