// Oyun seviye ilerlemesi (tarayıcıda). Anahtar: 'ask:games:v1' → { [slug]: { done: number[], best?: Record<number, number> } }.
// `best[seviye]` = en az kullanılan blok sayısı. Saf işlevler + localStorage sarmalayıcıları (testte depo enjekte edilir).
import type { GameSlug } from './types'

export const GAMES_KEY = 'ask:games:v1'
export const PROGRAM_KEY = 'ask:games:programs:v1'
export const GAMES_EVENT = 'ask-games'
export const MAX_LEVEL = 10

export interface GameProgress { done: number[]; best?: Record<number, number> }
export type AllProgress = Partial<Record<string, GameProgress>>

export interface KV { getItem(k: string): string | null; setItem(k: string, v: string): void }

const validLevel = (n: unknown): n is number => Number.isInteger(n) && (n as number) >= 1 && (n as number) <= MAX_LEVEL

/** Bozuk girdiyi güvenle ayıklar: yanlış tipler atılır, tekrarlar silinir, seviyeler sıralanır. */
export function parseAll(raw: string | null | undefined): AllProgress {
  try {
    const v = JSON.parse(raw ?? '{}')
    if (!v || typeof v !== 'object' || Array.isArray(v)) return {}
    const out: AllProgress = {}
    for (const [slug, g] of Object.entries(v as Record<string, unknown>)) {
      if (!g || typeof g !== 'object') continue
      const done = (g as GameProgress).done
      if (!Array.isArray(done)) continue
      const p: GameProgress = { done: [...new Set(done.filter(validLevel))].sort((a, b) => a - b) }
      const best = (g as GameProgress).best
      if (best && typeof best === 'object') {
        const nb: Record<number, number> = {}
        for (const [k, n] of Object.entries(best)) if (validLevel(Number(k)) && Number.isInteger(n) && (n as number) >= 0) nb[Number(k)] = n as number
        if (Object.keys(nb).length) p.best = nb
      }
      out[slug] = p
    }
    return out
  } catch { return {} }
}

/** Seviyeyi tamamlandı işaretler; `blocks` verilirse en iyi (en küçük) değer korunur. Girdiyi değiştirmez. */
export function applyDone(all: AllProgress, slug: string, level: number, blocks?: number): AllProgress {
  if (!validLevel(level)) return all
  const cur = all[slug] ?? { done: [] }
  const done = [...new Set([...cur.done, level])].sort((a, b) => a - b)
  const next: GameProgress = { done }
  const best = { ...(cur.best ?? {}) }
  if (typeof blocks === 'number' && Number.isInteger(blocks) && blocks >= 0) best[level] = Math.min(best[level] ?? Infinity, blocks)
  if (Object.keys(best).length) next.best = best
  return { ...all, [slug]: next }
}

export function applyUndone(all: AllProgress, slug: string, level: number): AllProgress {
  const cur = all[slug]
  if (!cur) return all
  const best = { ...(cur.best ?? {}) }
  delete best[level]
  const next: GameProgress = { done: cur.done.filter((l) => l !== level) }
  if (Object.keys(best).length) next.best = best
  return { ...all, [slug]: next }
}

export const doneCount = (all: AllProgress, slug: string): number => all[slug]?.done.length ?? 0
export const isDone = (all: AllProgress, slug: string, level: number): boolean => !!all[slug]?.done.includes(level)
/** Sıradaki tamamlanmamış seviye (hepsi bitmişse 1). */
export function nextOpenLevel(all: AllProgress, slug: string, total = MAX_LEVEL): number {
  for (let l = 1; l <= total; l++) if (!isDone(all, slug, l)) return l
  return 1
}

// ---- Tarayıcı deposu ----
function store(): KV | null {
  try { return typeof localStorage === 'undefined' ? null : localStorage } catch { return null }
}
export function loadAll(kv: KV | null = store()): AllProgress {
  try { return parseAll(kv?.getItem(GAMES_KEY)) } catch { return {} }
}
function save(all: AllProgress, kv: KV | null = store()) {
  try { kv?.setItem(GAMES_KEY, JSON.stringify(all)) } catch { /* gizli pencere vb.: kaydedilemez, oyun yine çalışır */ }
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(GAMES_EVENT))
}
export function markLevelDone(slug: GameSlug | string, level: number, blocks?: number, kv: KV | null = store()): AllProgress {
  const next = applyDone(loadAll(kv), slug, level, blocks)
  save(next, kv)
  return next
}
export function resetGame(slug: GameSlug | string, kv: KV | null = store()): AllProgress {
  const all = { ...loadAll(kv) }
  delete all[slug]
  save(all, kv)
  return all
}

// ---- Seviye başına yarım kalan program (isteğe bağlı kalıcılık) ----
type Programs = Record<string, unknown>
const progKey = (slug: string, level: number) => `${slug}:${level}`
export function loadProgram(slug: string, level: number, kv: KV | null = store()): unknown | null {
  try {
    const v = JSON.parse(kv?.getItem(PROGRAM_KEY) ?? '{}') as Programs
    return v && typeof v === 'object' ? (v[progKey(slug, level)] ?? null) : null
  } catch { return null }
}
export function saveProgram(slug: string, level: number, program: unknown | null, kv: KV | null = store()): void {
  try {
    if (!kv) return
    let v: Programs = {}
    try { const p = JSON.parse(kv.getItem(PROGRAM_KEY) ?? '{}'); if (p && typeof p === 'object' && !Array.isArray(p)) v = p } catch { /* bozuk: sıfırla */ }
    if (program == null) delete v[progKey(slug, level)]
    else v[progKey(slug, level)] = program
    kv.setItem(PROGRAM_KEY, JSON.stringify(v))
  } catch { /* yoksay */ }
}
