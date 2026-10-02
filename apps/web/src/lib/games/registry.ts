// Oyun kaydı. HER OYUN İÇİN TEK SATIR hazır: oyun ajanları bu dosyaya dokunmaz, yalnız `lib/games/<slug>/index.ts`
// içindeki `export const <slug>Game: GameDef` değerini doldurur. Oyun dosyası boş/hatalıysa kart "Yakında" görünür.
import { isGameSlug } from './meta'
import type { GameDef, GameSlug } from './types'

type Loader = () => Promise<GameDef | null | undefined>

export const GAME_LOADERS: Record<GameSlug, Loader> = {
  bulmaca: () => import('./bulmaca').then((m) => m.bulmacaGame),
  labirent: () => import('./labirent').then((m) => m.labirentGame),
  kus: () => import('./kus').then((m) => m.kusGame),
  kaplumbaga: () => import('./kaplumbaga').then((m) => m.kaplumbagaGame),
  film: () => import('./film').then((m) => m.filmGame),
  muzik: () => import('./muzik').then((m) => m.muzikGame),
  'golet-egitmeni': () => import('./golet-egitmeni').then((m) => m.goletEgitmeniGame),
  golet: () => import('./golet').then((m) => m.goletGame),
}

/** Oyunu yükler; yoksa (yer tutucu) `null`. Yükleme hatası fırlatır. */
export async function loadGame(slug: string): Promise<GameDef | null> {
  if (!isGameSlug(slug)) return null
  return (await GAME_LOADERS[slug]()) ?? null
}

/** Hatalı/eksik oyunu "yok" sayan güvenli sürüm (liste sayfası için). */
export async function isGameAvailable(slug: string): Promise<boolean> {
  try { return (await loadGame(slug)) !== null } catch { return false }
}
