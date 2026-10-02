// Modül 7 (slug 'ai-muhendisligi') ders etkinlikleri: ders oynatıcının anahtarı `ai-muhendisligi:<hafta>:<haftadaki sıra 1-5>`.
// Etkinliği olmayan dersler yalnız metin + "kendini sına" sorusudur (1, 8, 13, 31, 37, 39, 40).
import type { AiActivity } from '../activity'
import { H1_H3 } from './h1-h3'
import { H4_H5 } from './h4-h5'
import { H6_H8 } from './h6-h8'

export const AI_MODULE_SLUG = 'ai-muhendisligi'
const BY_LESSON: Record<number, AiActivity> = { ...H1_H3, ...H4_H5, ...H6_H8 }
export const aiKey = (week: number, pos: number): string => `${AI_MODULE_SLUG}:${week}:${pos}`

/** Küresel ders numarası (1-40) → anahtar. */
export const lessonKey = (n: number): string => aiKey(Math.ceil(n / 5), ((n - 1) % 5) + 1)

export const AI_ACTIVITIES: Readonly<Record<string, AiActivity>> = Object.fromEntries(
  Object.entries(BY_LESSON).map(([n, a]) => [lessonKey(Number(n)), a]),
)
export const ALL_AI_ACTIVITIES: readonly AiActivity[] = Object.values(BY_LESSON)
export const getAiActivity = (key: string | null | undefined): AiActivity | null => (key ? AI_ACTIVITIES[key] ?? null : null)
