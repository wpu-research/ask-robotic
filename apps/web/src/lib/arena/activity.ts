import type { ArenaActivity } from './types'
import { ARENA_ACTIVITIES } from './activities'

/** Modül 5'in slug'ı (content-src/modul-5/module.json). */
export const ARENA_MODULE_SLUG = 'robotik'

/** Anahtar: "robotik:<hafta>:<ders>" (hafta ve ders, hafta içindeki 1 tabanlı konum). */
export const isArenaKey = (key: string | null | undefined): key is string => !!key && key.startsWith(`${ARENA_MODULE_SLUG}:`)
export const getArenaActivity = (key: string | null | undefined): ArenaActivity | null => (isArenaKey(key) ? ARENA_ACTIVITIES[key] ?? null : null)
export const allArenaActivities = () => Object.entries(ARENA_ACTIVITIES)
