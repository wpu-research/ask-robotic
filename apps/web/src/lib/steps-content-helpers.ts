import { getActivity } from './jr/activity'
import { getArenaActivity } from './arena/activity'
import { getLabActivity } from './lab/activity'
import { getMikroActivity } from './mikro/activities'
import { getOyunActivity } from './oyun/activities/ders-registry'
import { getSahneActivity } from './sahne/activities'
import { getAiActivity } from './ai/activities'

/** Ders anahtarına bağlı bir simülatör etkinliği var mı (v2 `activity` adımı için). */
export function catalogHasActivity(key: string): boolean {
  return !!(getLabActivity(key) || getArenaActivity(key) || getMikroActivity(key) || getOyunActivity(key) || getSahneActivity(key) || getAiActivity(key) || getActivity(key))
}
