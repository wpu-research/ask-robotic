// Dersin birden çok yolu (ör. Modül 5, 112-113: A araç / B robot kol / C takip). Kayıt anahtarı "robotik:8:3" (temel, A) ve
// "robotik:8:3:kol" gibi dördüncü bölümlü anahtarlardır. Arayüz, temel etkinliğin sahne kimliğinden yolları bulur;
// böylece ders oynatıcı değişmeden yol sekmeleri görünür.
import { ARENA_ACTIVITIES } from './activities'
import type { ArenaActivity } from './types'

export interface ArenaVariantEntry { key: string; activity: ArenaActivity }

/** "robotik:8:3" için [temel, ...yollar] (temel ilk). Yolu olmayan etkinlikte boş dizi. */
export function variantsOfKey(baseKey: string): ArenaVariantEntry[] {
  const base = ARENA_ACTIVITIES[baseKey]
  if (!base) return []
  const rest = Object.entries(ARENA_ACTIVITIES).filter(([k]) => k.startsWith(`${baseKey}:`)).map(([key, activity]) => ({ key, activity }))
  return rest.length ? [{ key: baseKey, activity: base }, ...rest] : []
}

let bySceneId: Map<string, ArenaVariantEntry[]> | null = null

/** Temel etkinliğin (ya da yollarından birinin) sahne kimliğine göre tüm yollar; yoksa null. */
export function variantsForScene(sceneId: string): ArenaVariantEntry[] | null {
  if (!bySceneId) {
    bySceneId = new Map()
    for (const key of Object.keys(ARENA_ACTIVITIES)) {
      if (key.split(':').length !== 3) continue
      const list = variantsOfKey(key)
      if (list.length) for (const v of list) bySceneId.set(v.activity.scene.id, list)
    }
  }
  return bySceneId.get(sceneId) ?? null
}
